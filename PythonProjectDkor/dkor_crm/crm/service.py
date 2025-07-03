# service.py

from decimal import Decimal, InvalidOperation
from typing import Dict, Any
from .models import Material, PriceList


class CalculationService:
    def __init__(self, validated_data: Dict[str, Any], price_list: PriceList, dollar_rate: Decimal):
        self.data = validated_data
        self.breakdown = {}
        self.total_cost = Decimal("0")
        self.price_list = price_list
        # Сохраняем курс доллара, полученный из View
        self.dollar_rate = dollar_rate

    def _calculate_material_cost_per_sqm(self, material: Material) -> Decimal:
        """
        Вычисляет стоимость квадратного метра в рублях по новой формуле,
        используя курс доллара, базовый множитель и коэффициенты из прайс-листа.
        """
        if not self.dollar_rate or self.dollar_rate <= 0:
            # Защита от некорректного курса, хотя он должен быть валидирован во View
            # В этом случае, возможно, лучше вызвать исключение или использовать дефолтный курс.
            # Пока оставим так, как было, но в продакшене лучше быть более строгим.
            return material.cost_per_sqm

        base_cost = material.cost  # Стоимость материала в $
        base_multiplier = self.price_list.base_multiplier
        coefficient = self.price_list.coefficient_0_300  # Коэффициент по умолчанию

        # Выбираем правильный коэффициент в зависимости от цены материала
        if 300 < base_cost <= 340:
            coefficient = self.price_list.coefficient_300_340
        elif 340 < base_cost <= 380:
            coefficient = self.price_list.coefficient_340_380
        elif 380 < base_cost <= 500:
            coefficient = self.price_list.coefficient_380_500
        elif 500 < base_cost <= 550:
            coefficient = self.price_list.coefficient_500_550
        elif base_cost > 550:
            coefficient = self.price_list.coefficient_550_plus

        # Убедимся, что coefficient является Decimal, если вдруг его значение было установлено из БД как что-то другое
        try:
            coefficient = Decimal(coefficient)
        except InvalidOperation:
            # Обработка ошибки, если coefficient не может быть преобразован в Decimal
            # Например, можно логировать ошибку и использовать значение по умолчанию
            print(f"Warning: Invalid coefficient value '{coefficient}'. Using default Decimal('1.0').")
            coefficient = Decimal('1.0')

        # Основная формула
        cost_per_sqm = self.dollar_rate * base_multiplier * coefficient
        return cost_per_sqm.quantize(Decimal("0.01"))

    def _add_to_cost(self, key: str, name: str, quantity: Decimal, unit_price: Decimal):
        if quantity is not None and unit_price is not None and quantity > 0:  # Добавлено is not None
            # Убеждаемся, что unit_price и quantity являются Decimal
            try:
                unit_price = Decimal(unit_price)
            except InvalidOperation:
                print(f"Warning: Invalid unitPrice value for {key}: '{unit_price}'. Skipping item.")
                return

            try:
                quantity = Decimal(quantity)
            except InvalidOperation:
                print(f"Warning: Invalid quantity value for {key}: '{quantity}'. Skipping item.")
                return

            total = quantity * unit_price
            self.breakdown[key] = {
                "name": name,
                "quantity": f"{quantity:.2f}",
                "unitPrice": f"{unit_price:.2f}",
                "totalPrice": f"{total:.2f}",
            }
            self.total_cost += total

    def calculate(self) -> Dict[str, Any]:
        material: Material = self.data.get("material")
        product_area = self.data.get("product_area", Decimal("0"))

        # --- ИСПОЛЬЗУЕМ НОВУЮ ЛОГИКУ РАСЧЕТА СТОИМОСТИ МАТЕРИАЛА ---
        if material and product_area > 0:
            calculated_cost_per_sqm = self._calculate_material_cost_per_sqm(material)
            self._add_to_cost("material", f"Материал: {material.material_name}", product_area, calculated_cost_per_sqm)
        # ---------------------------------------------------------

        if self.data.get("measurement_required"):
            self._add_to_cost("measurement", "Замер", Decimal("1"), self.price_list.measurement)

        self._add_to_cost("surface_bonding", "Склейка поверхностей", self.data.get("surface_bonding", Decimal("0")),
                          self.price_list.surface_bonding_per_m)

        # Добавьте логику для кромки, водоотбойника и подгиба, если их нет
        # Пример для кромки:
        edge_type = self.data.get("edgeType")
        edge_length = self.data.get("edgeLength", Decimal("0"))
        if edge_type and edge_length > 0:
            # Получаем цену кромки из JSONField
            edge_price = self.price_list.edge_type_per_m.get(edge_type)
            if edge_price is not None:
                self._add_to_cost("edge_type", f"Кромка ({edge_type})", edge_length, Decimal(edge_price))

        # Пример для водоотбойника:
        drainage_type = self.data.get("drainageType")
        drainage_length = self.data.get("drainageLength", Decimal("0"))
        if drainage_type and drainage_length > 0:
            # Получаем цену водоотбойника из JSONField
            drainage_price = self.price_list.drainage_type_per_m.get(drainage_type)
            if drainage_price is not None:
                self._add_to_cost("drainage_type", f"Водоотбойник ({drainage_type})", drainage_length,
                                  Decimal(drainage_price))

        # Пример для подгиба:
        front_bend = self.data.get("frontBend", Decimal("0"))
        if front_bend > 0:
            self._add_to_cost("front_bend", "Подгиб", front_bend, self.price_list.front_bend_per_m)

        # Добавьте условия для каждого из этих элементов:
        self._add_to_cost("ventilation_holes", "Вентиляционные отверстия",
                          self.data.get("ventilation_holes", Decimal("0")),
                          self.price_list.ventilation_hole_per_unit)
        self._add_to_cost("cooktop_cutouts", "Выпилы под варочную панель",
                          self.data.get("cooktop_cutouts", Decimal("0")),
                          self.price_list.cooktop_cutout_per_unit)
        self._add_to_cost("overlay_sink_cutouts", "Выпилы под накладную мойку",
                          self.data.get("overlay_sink_cutouts", Decimal("0")),
                          self.price_list.overlay_sink_cutout_per_unit)
        self._add_to_cost("undermount_sink_installations", "Вклейка мойки подстольного монтажа",
                          self.data.get("undermount_sink_installations", Decimal("0")),
                          self.price_list.undermount_sink_installation_per_unit)
        self._add_to_cost("on_site_joining", "Стыковка на объекте", self.data.get("on_site_joining", Decimal("0")),
                          self.price_list.on_site_joining_per_unit)

        # Сложность
        complexity_additions = self.data.get("complexity_additions", {})
        if complexity_additions.get("radius10to300", 0) > 0:
            self._add_to_cost("complexity_radius_10_300", "Сложность: радиус 10-300мм",
                              Decimal(complexity_additions["radius10to300"]),
                              self.price_list.radius_10_to_300_per_unit)
        if complexity_additions.get("radius300to1000", 0) > 0:
            self._add_to_cost("complexity_radius_300_1000", "Сложность: радиус 300-1000мм",
                              Decimal(complexity_additions["radius300to1000"]),
                              self.price_list.radius_300_to_1000_per_unit)
        if complexity_additions.get("verticalRadius", 0) > 0:
            self._add_to_cost("complexity_vertical_radius", "Сложность: вертикальный радиус",
                              Decimal(complexity_additions["verticalRadius"]),
                              self.price_list.vertical_radius_per_unit)
        if complexity_additions.get("twoPlaneProduct", 0) > 0:
            self._add_to_cost("complexity_two_plane_product", "Сложность: изделие в 2х плоскостях",
                              Decimal(complexity_additions["twoPlaneProduct"]),
                              self.price_list.two_plane_product_per_unit)

        # --- НОВАЯ ЛОГИКА ДЛЯ ДОСТАВКИ ---
        delivery_type = self.data.get("delivery_type")  # Получаем тип доставки из входных данных
        print(
            f"DEBUG: Value of delivery_type: {delivery_type}, Type: {type(delivery_type)}")  # <--- ЭТУ СТРОКУ НУЖНО ДОБАВИТЬ/ПРОВЕРИТЬ ВЫВОД
        if delivery_type:  # Проверяем, что delivery_type не является None или пустой строкой
            # Получаем стоимость доставки из JSONField price_list.delivery_type
            delivery_cost = self.price_list.delivery_type.get(delivery_type)
            if delivery_cost is not None:  # Убеждаемся, что стоимость найдена
                self._add_to_cost("delivery", f"Доставка ({delivery_type})", Decimal("1"), Decimal(delivery_cost))
        # ----------------------------------

        return {
            "total_cost": self.total_cost,
            "breakdown": self.breakdown,
        }
# your_app/services.py

from decimal import Decimal
from typing import Dict, Any
from .models import Material


class PriceList:
    """
    A centralized place for all unit prices.
    In a real-world app, this could be another Django model
    to allow editing prices in the admin panel without code changes.
    """
    MEASUREMENT: Decimal = Decimal("5000.00")
    SURFACE_BONDING_PER_M: Decimal = Decimal("3000.00")

    EDGE_TYPE_PER_M: Dict[str, Decimal] = {
        'radius': Decimal("2000.00"),
        'figured': Decimal("3500.00"),
    }
    DRAINAGE_TYPE_PER_M: Dict[str, Decimal] = {
        'overlay': Decimal("1500.00"),
        'integrated': Decimal("4000.00"),
    }
    FRONT_BEND_PER_M: Decimal = Decimal("2500.00")
    VENTILATION_HOLE_PER_UNIT: Decimal = Decimal("500.00")
    COOKTOP_CUTOUT_PER_UNIT: Decimal = Decimal("3000.00")
    OVERLAY_SINK_CUTOUT_PER_UNIT: Decimal = Decimal("2500.00")
    UNDERMOUNT_SINK_INSTALLATION_PER_UNIT: Decimal = Decimal("6000.00")
    ON_SITE_JOINING_PER_UNIT: Decimal = Decimal("4000.00")

    DELIVERY_TYPE: Dict[str, Decimal] = {
        'city': Decimal("3000.00"),
        'outside_city': Decimal("5000.00"),
    }

    # Complexity
    RADIUS_10_300_PER_UNIT: Decimal = Decimal("1000.00")
    RADIUS_300_1000_PER_UNIT: Decimal = Decimal("2000.00")
    VERTICAL_RADIUS_PER_UNIT: Decimal = Decimal("3000.00")
    TWO_PLANE_PRODUCT_PER_UNIT: Decimal = Decimal("8000.00")


class CalculationService:
    def __init__(self, validated_data: Dict[str, Any]):
        self.data = validated_data
        self.breakdown = {}
        self.total_cost = Decimal("0")

    def _add_to_cost(self, key: str, name: str, quantity: Decimal, unit_price: Decimal):
        """Helper to build the breakdown dictionary and sum the total cost."""
        if quantity and unit_price and quantity > 0:
            total = Decimal(quantity) * Decimal(unit_price)
            self.breakdown[key] = {
                "name": name,
                "quantity": f"{quantity:.2f}",
                "unitPrice": f"{unit_price:.2f}",
                "totalPrice": f"{total:.2f}",
            }
            self.total_cost += total

    def calculate(self) -> Dict[str, Any]:
        """Performs the full cost calculation and returns the results."""

        # 1. Material (Stone) Cost
        # Используем 'cost_per_sqm' для расчета стоимости материала.
        material: Material = self.data["material"]
        product_area = self.data["product_area"]
        self._add_to_cost("material", f"Материал: {material.material_name}", product_area, material.cost_per_sqm)

        # 2. Measurement
        if self.data.get("measurement_required"):
            self._add_to_cost("measurement", "Замер", Decimal("1"), PriceList.MEASUREMENT)

        # 3. Work by linear meters (м.п.)
        self._add_to_cost("surface_bonding", "Склейка поверхностей", self.data.get("surface_bonding", 0),
                          PriceList.SURFACE_BONDING_PER_M)
        self._add_to_cost("edge", "Кромка", self.data.get("edge_length", 0),
                          PriceList.EDGE_TYPE_PER_M[self.data.get("edge_type", "radius")])
        self._add_to_cost("drainage", "Водоотбойник", self.data.get("drainage_length", 0),
                          PriceList.DRAINAGE_TYPE_PER_M[self.data.get("drainage_type", "overlay")])
        self._add_to_cost("front_bend", "Подгиб", self.data.get("front_bend", 0), PriceList.FRONT_BEND_PER_M)

        # 4. Work by units (шт.)
        self._add_to_cost("ventilation_holes", "Вентиляционные отверстия", self.data.get("ventilation_holes", 0),
                          PriceList.VENTILATION_HOLE_PER_UNIT)
        self._add_to_cost("cooktop_cutouts", "Выпил под варочную панель", self.data.get("cooktop_cutouts", 0),
                          PriceList.COOKTOP_CUTOUT_PER_UNIT)
        self._add_to_cost("overlay_sink_cutouts", "Выпил под накладную мойку", self.data.get("overlay_sink_cutouts", 0),
                          PriceList.OVERLAY_SINK_CUTOUT_PER_UNIT)
        self._add_to_cost("undermount_sink", "Вклейка мойки подстольного монтажа",
                          self.data.get("undermount_sink_installations", 0),
                          PriceList.UNDERMOUNT_SINK_INSTALLATION_PER_UNIT)
        self._add_to_cost("on_site_joining", "Стыковка на объекте", self.data.get("on_site_joining", 0),
                          PriceList.ON_SITE_JOINING_PER_UNIT)

        # 5. Complexity
        self._add_to_cost("radius_10_300", "Сложность: радиус 10-300мм", self.data.get("radius_10_to_300", 0),
                          PriceList.RADIUS_10_300_PER_UNIT)
        self._add_to_cost("radius_300_1000", "Сложность: радиус 300-1000мм", self.data.get("radius_300_to_1000", 0),
                          PriceList.RADIUS_300_1000_PER_UNIT)
        self._add_to_cost("vertical_radius", "Сложность: вертикальный радиус", self.data.get("vertical_radius", 0),
                          PriceList.VERTICAL_RADIUS_PER_UNIT)
        self._add_to_cost("two_plane_product", "Сложность: изделие в 2х плоскостях",
                          self.data.get("two_plane_product", 0), PriceList.TWO_PLANE_PRODUCT_PER_UNIT)

        # 6. Delivery
        delivery_price = PriceList.DELIVERY_TYPE.get(self.data.get("delivery_type", "city"), Decimal("0"))
        if delivery_price > 0:
            self._add_to_cost("delivery", "Доставка", Decimal("1"), delivery_price)

        return {
            "total_cost": self.total_cost,
            "breakdown": self.breakdown,
        }
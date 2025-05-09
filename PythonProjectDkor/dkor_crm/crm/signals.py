# crm_app/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, Material, Client, MaterialPurchase, HistoryItem, Employee, UserProfile # Добавьте UserProfile, если нужен для получения Employee
from django.contrib.contenttypes.models import ContentType


# Вспомогательная функция для получения сотрудника, если это возможно
# Это упрощенный пример. В реальном приложении вам нужно будет получить Employee
# из текущего request.user или другой связанной логики.
def get_employee_from_instance(instance):
    """
    Пытается получить объект Employee из экземпляра, вызвавшего сигнал,
    если информация о сотруднике была передана.
    """
    # Мы будем передавать employee_instance через атрибут _current_employee
    # из ViewSet-а.
    if hasattr(instance, '_current_employee'):
        return instance._current_employee
    # Если нет, можно попробовать получить системного пользователя или None,
    # если поле employee в HistoryItem допускает null=True.
    # Либо же пропустить создание HistoryItem, если employee обязателен.
    return None


# --- Сигналы для модели Order (Заказ) ---
@receiver(post_save, sender=Order)
def order_post_save(sender, instance, created, **kwargs):
    employee = get_employee_from_instance(instance)
    action_type = "добавлен" if created else "изменен"
    print(f"DEBUG (Order Signal): Order ID: {instance.pk}, Order Number at signal: '{instance.order_number}'")
    action_description = (
        f"Заказ №{instance.order_number} для клиента {instance.client.full_name} "
        f"был {action_type}. Общая сумма: {instance.total_amount}, Статус: {instance.status}."
    )
    print(f"SIGNAL: {action_description}")

    try:
        HistoryItem.objects.create(
            action_description=action_description,
            action_timestamp=instance.updated_at if not created else instance.created_at, # Используем время обновления/создания
            employee=employee, # Здесь мы передаем объект Employee
            object_id=instance.pk,
            content_type=ContentType.objects.get_for_model(instance)
        )
    except Exception as e:
        print(f"Ошибка при создании HistoryItem для заказа: {e}")
        # print(f"Для отладки: Employee is {employee}, type: {type(employee)}")


# --- Сигналы для модели Material (Материал) ---
@receiver(post_save, sender=Material)
def material_post_save(sender, instance, created, **kwargs):
    employee = get_employee_from_instance(instance)
    action_type = "добавлен" if created else "изменен"
    action_description = (
        f"Материал '{instance.material_name}' (Цвет: {instance.color_code}) был {action_type}. "
        # УДАЛЕНО: `Количество на складе: {instance.quantity_in_stock}.` так как этого поля нет в модели Material
        f"Стоимость: {instance.cost}."
    )
    print(f"SIGNAL: {action_description}")

    try:
        HistoryItem.objects.create(
            action_description=action_description,
            action_timestamp=instance.updated_at if not created else instance.created_at,
            employee=employee,
            object_id=instance.pk,
            content_type=ContentType.objects.get_for_model(instance)
        )
    except Exception as e:
        print(f"Ошибка при создании HistoryItem для материала: {e}")


# --- Сигналы для модели MaterialPurchase (Закуп материала) ---
@receiver(post_save, sender=MaterialPurchase)
def material_purchase_post_save(sender, instance, created, **kwargs):
    employee = get_employee_from_instance(instance)
    action_type = "добавлен" if created else "изменен"
    order_info = f" для заказа №{instance.order.order_number}" if instance.order else ""
    material_info = f"{instance.material.material_name} (ID: {instance.material.id})" if instance.material else "Неизвестный материал"

    action_description = (
        f"Закуп {material_info} ({instance.quantity} ед.) был {action_type} "
        f"на сумму {instance.total_cost}{order_info}. Статус: {instance.status}."
    )
    print(f"SIGNAL: {action_description}")

    try:
        HistoryItem.objects.create(
            action_description=action_description,
            action_timestamp=instance.updated_at if not created else instance.created_at,
            employee=employee,
            object_id=instance.pk,
            content_type=ContentType.objects.get_for_model(instance)
        )
    except Exception as e:
        print(f"Ошибка при создании HistoryItem для закупа: {e}")


# --- Сигналы для модели Client (Клиент) ---
@receiver(post_save, sender=Client)
def client_post_save(sender, instance, created, **kwargs):
    employee = get_employee_from_instance(instance)
    action_type = "добавлен" if created else "изменен"
    action_description = (
        f"Клиент '{instance.full_name}' был {action_type}. "
        f"Телефон: {instance.contact_phone}, Email: {instance.email}."
    )
    print(f"SIGNAL: {action_description}")

    try:
        HistoryItem.objects.create(
            action_description=action_description,
            action_timestamp=instance.updated_at if not created else instance.created_at,
            employee=employee,
            object_id=instance.pk,
            content_type=ContentType.objects.get_for_model(instance)
        )
    except Exception as e:
        print(f"Ошибка при создании HistoryItem для клиента: {e}")
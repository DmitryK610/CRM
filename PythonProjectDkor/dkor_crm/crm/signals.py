from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, Material, Client, MaterialPurchase, HistoryItem, UserProfile
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.signals import user_logged_in
from django.contrib.auth import get_user_model

User = get_user_model()


# --- Вспомогательная функция для получения пользователя ---
def get_user_from_instance(instance):
    """
    Получает текущего пользователя из объекта, если он был передан.
    """
    if hasattr(instance, '_current_user'):
        return instance._current_user
    elif hasattr(instance, 'user') and isinstance(instance.user, User):
        return instance.user
    return None


# --- Сигналы для модели Order ---
@receiver(post_save, sender=Order)
def order_post_save(sender, instance, created, **kwargs):
    user = get_user_from_instance(instance)
    action_type = "добавлен" if created else "изменен"

    action_description = (
        f"Заказ №{instance.order_number} для клиента {instance.client.full_name} "
        f"был {action_type}. Общая сумма: {instance.total_amount}, Статус: {instance.status}."
    )

    try:
        HistoryItem.objects.create(
            action_description=action_description,
            user=user,
            object_id=instance.pk,
            content_type=ContentType.objects.get_for_model(instance),
        )
        print(f"[HISTORY] Запись о заказе №{instance.order_number} успешно создана.")
    except Exception as e:
        print(f"[ERROR] Не удалось создать запись в истории для заказа: {e}")


# --- Сигналы для модели Material ---
@receiver(post_save, sender=Material)
def material_post_save(sender, instance, created, **kwargs):
    user = get_user_from_instance(instance)
    action_type = "добавлен" if created else "изменен"

    action_description = (
        f"Материал '{instance.material_name}' (Цвет: {instance.color_code}) был {action_type}. "
        f"Стоимость: {instance.cost}."
    )

    try:
        HistoryItem.objects.create(
            action_description=action_description,
            user=user,
            object_id=instance.pk,
            content_type=ContentType.objects.get_for_model(instance),
        )
        print(f"[HISTORY] Запись о материале '{instance.material_name}' успешно создана.")
    except Exception as e:
        print(f"[ERROR] Не удалось создать запись в истории для материала: {e}")


# --- Сигналы для модели Client ---
@receiver(post_save, sender=Client)
def client_post_save(sender, instance, created, **kwargs):
    user = get_user_from_instance(instance)
    action_type = "добавлен" if created else "изменен"

    action_description = (
        f"Клиент '{instance.full_name}' был {action_type}. "
        f"Телефон: {instance.contact_phone}, Email: {instance.email}."
    )

    try:
        HistoryItem.objects.create(
            action_description=action_description,
            user=user,
            object_id=instance.pk,
            content_type=ContentType.objects.get_for_model(instance),
        )
        print(f"[HISTORY] Запись о клиенте '{instance.full_name}' успешно создана.")
    except Exception as e:
        print(f"[ERROR] Не удалось создать запись в истории для клиента: {e}")


# --- Сигналы для модели MaterialPurchase ---
@receiver(post_save, sender=MaterialPurchase)
def material_purchase_post_save(sender, instance, created, **kwargs):
    user = get_user_from_instance(instance)
    action_type = "добавлен" if created else "изменен"

    order_info = f" для заказа №{instance.order.order_number}" if instance.order else ""
    material_info = f"{instance.material.material_name} (ID: {instance.material.id})" if instance.material else "Неизвестный материал"

    action_description = (
        f"Закуп {material_info} ({instance.quantity} ед.) был {action_type} "
        f"на сумму {instance.total_cost}{order_info}. Статус: {instance.status}."
    )

    try:
        HistoryItem.objects.create(
            action_description=action_description,
            user=user,
            object_id=instance.pk,
            content_type=ContentType.objects.get_for_model(instance),
        )
        print(f"[HISTORY] Запись о закупке '{material_info}' успешно создана.")
    except Exception as e:
        print(f"[ERROR] Не удалось создать запись в истории для закупки: {e}")


# --- Сигнал для авторизации пользователя ---
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """
    Создаёт запись в HistoryItem при входе пользователя.
    """
    action_description = f"Пользователь '{user.username}' успешно авторизовался."

    try:
        HistoryItem.objects.create(
            action_description=action_description,
            user=user,
            object_id=user.pk,
            content_type=ContentType.objects.get_for_model(user),
        )
        print(f"[LOGIN] Запись о входе пользователя '{user.username}' создана.")
    except Exception as e:
        print(f"[ERROR] Не удалось создать запись в истории при входе: {e}")
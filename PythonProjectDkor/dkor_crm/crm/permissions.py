from rest_framework import permissions


class PriceListPermission(permissions.BasePermission):
    """Разграничение доступа к прайс-листу.

    Требования:
    - list (GET) / получение прайс-листа: право view_pricelist
    - update / partial_update / reset: право change_pricelist
    Иные действия запрещены.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        action = getattr(view, 'action', None)

        # Просмотр
        if action == 'list':
            return user.has_perm('crm.view_pricelist') or user.has_perm('crm.change_pricelist')

        # Изменение / сброс
        if action in {"update", "partial_update", "reset"}:
            return user.has_perm('crm.change_pricelist')

        return False

    def has_object_permission(self, request, view, obj):
        # Логика та же (singleton) — используем общую проверку
        return self.has_permission(request, view)

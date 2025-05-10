# views.py вашего приложения

# --- Импорты ---
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.db.models.functions import Lower
from django.contrib.auth import get_user_model
User = get_user_model()

# Импорты для авторизации и HistoryItem
from rest_framework.authtoken.views import ObtainAuthToken # Импортируем базовый класс
from rest_framework.authtoken.models import Token # Для работы с токенами
from rest_framework.response import Response # Для формирования ответа
from rest_framework import status # Для кодов статуса HTTP
from django.contrib.contenttypes.models import ContentType # Для GenericForeignKey

from .models import (
    Supplier, Material, Client, Employee, Calculation,
    Order, OrderItem, Payment, HistoryItem, UserProfile, # Убедитесь, что HistoryItem и UserProfile импортированы
    Attachment, MaterialPurchase # Убедитесь, что эти модели импортированы
)

from .serializers import (
    SupplierSerializer, MaterialSerializer, ClientSerializer, EmployeeSerializer,
    CalculationSerializer, OrderSerializer, OrderItemSerializer, PaymentSerializer,
    HistoryItemSerializer, UserProfileSerializer,
    AttachmentSerializer, MaterialPurchaseSerializer # Убедитесь, что все сериализаторы импортированы
)

# --- Пагинация ---
class OrderPagination(PageNumberPagination):
    page_size = 10

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# --- Вспомогательные функции ---
def get_current_user(request):
    """
    Пытается получить текущего авторизованного пользователя.
    """
    if request.user.is_authenticated:
        return request.user
    return None

# --- Пользовательское представление для авторизации API ---
class CustomObtainAuthToken(ObtainAuthToken):
    """
    Представление для получения токена авторизации с добавлением записи в HistoryItem.
    """
    def post(self, request, *args, **kwargs):
        print("DEBUG: Метод CustomObtainAuthToken.post() вызван.") # Отладочный print

        # Этот шаг обрабатывает валидацию учетных данных и аутентификацию
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            print("DEBUG: Сериализатор валиден.") # Отладочный print

        except Exception as e:
            print(f"DEBUG: Ошибка валидации сериализатора: {e}") # Отладочный print
            # Возвращаем стандартный ответ DRF при ошибке валидации
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


        user = serializer.validated_data['user'] # Получаем объект пользователя
        print(f"DEBUG: Пользователь из валидатора: {user.username}") # Отладочный print

        # --- Логика создания HistoryItem при успешной авторизации ---
        # Эта логика будет выполняться ТОЛЬКО при успешной аутентификации (после is_valid)
        action_description = f"Пользователь '{user.username}' успешно авторизовался через API."
        print(f"[LOGIN VIEW] Авторизация пользователя {user.username} успешна. Создаем запись истории.") # Отладочный print из представления

        try:
            # Получаем ContentType для модели User
            user_content_type = ContentType.objects.get_for_model(User) # Используем класс User напрямую

            # Создаем запись HistoryItem, привязывая ее к объекту User
            history_item = HistoryItem.objects.create(
                action_description=action_description,
                user=user, # <-- Здесь мы привязываем к полю user
                object_id=user.pk, # Привязываем к ID пользователя
                content_type=user_content_type, # Привязываем к типу контента User
            )
            print(f"[LOGIN VIEW] HistoryItem запись об авторизации для пользователя {user.username} (ID: {history_item.id}) создана успешно.")
        except Exception as e:
            print(f"[LOGIN VIEW] Ошибка при создании HistoryItem об авторизации для пользователя {user.username}: {e}")
        # --- Конец логики создания HistoryItem ---


        # Оригинальная логика ObtainAuthToken для создания/получения токена
        # Создаем или получаем токен для пользователя
        token, created = Token.objects.get_or_create(user=user)

        # Возвращаем стандартный ответ ObtainAuthToken с токеном
        return Response({'token': token.key})


# --- ViewSets ---

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['company_name', 'contact_person', 'email', 'phone']
    ordering_fields = ['company_name', 'created_at']
    pagination_class = StandardPagination

    def perform_create(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user  # Передаем пользователя для сигнала
        return instance

    def perform_update(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.select_related('supplier').all()
    serializer_class = MaterialSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['material_name', 'color_code', 'note', 'supplier__company_name']
    ordering_fields = ['material_name', 'cost', 'created_at']
    pagination_class = StandardPagination

    def perform_create(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance

    def perform_update(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['full_name', 'contact_phone', 'email', 'address', 'note']
    ordering_fields = ['full_name', 'created_at', 'updated_at']
    pagination_class = StandardPagination

    def perform_create(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance

    def perform_update(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['full_name', 'phone', 'position']
    ordering_fields = ['full_name', 'hired_date', 'created_at']
    pagination_class = StandardPagination


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('client', 'calculation', 'material').all()
    serializer_class = OrderSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'order_number', 'status', 'client__full_name',
        'client__contact_phone', 'material__material_name',
        'material__color_code', 'note'
    ]
    ordering_fields = [
        'order_date', 'created_at', 'total_amount', 'status',
        'client__full_name', 'material__material_name'
    ]
    pagination_class = OrderPagination

    def perform_create(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user  # Теперь используем _current_user
        return instance

    def perform_update(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance


class CalculationViewSet(viewsets.ModelViewSet):
    queryset = Calculation.objects.all()
    serializer_class = CalculationSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'title', 'description', 'result_text']
    ordering_fields = ['created_at', 'updated_at', 'value', 'title']
    pagination_class = StandardPagination


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('order').all()
    serializer_class = PaymentSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'transaction_id', 'notes', 'payment_method', 'status',
        'order__order_number', 'order__client__full_name'
    ]
    ordering_fields = [
        'payment_date', 'created_at', 'amount', 'payment_method',
        'status', 'order__order_number'
    ]
    pagination_class = StandardPagination

    def perform_create(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance

    def perform_update(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance


class HistoryItemViewSet(viewsets.ModelViewSet):
    queryset = HistoryItem.objects.select_related('user').all()
    serializer_class = HistoryItemSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['action_description', 'user__username']
    ordering_fields = ['action_timestamp', 'user__username']
    pagination_class = StandardPagination


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['full_name', 'email']
    ordering_fields = ['full_name']
    pagination_class = StandardPagination


class MaterialPurchaseViewSet(viewsets.ModelViewSet):
    queryset = MaterialPurchase.objects.select_related('material', 'order').all()
    serializer_class = MaterialPurchaseSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'material__material_name', 'material__color_code',
        'order__order_number', 'notes', 'status', 'payment_method',
        'material__supplier__company_name'
    ]
    ordering_fields = [
        'purchase_order_date', 'created_at', 'total_cost', 'quantity',
        'status', 'received_date', 'material__material_name',
        'order__order_number'
    ]
    pagination_class = StandardPagination

    def perform_create(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance

    def perform_update(self, serializer):
        user = get_current_user(self.request)
        instance = serializer.save()
        instance._current_user = user
        return instance

    def get_queryset(self):
        queryset = super().get_queryset()
        order_id = self.request.query_params.get('order_id', None)
        material_id = self.request.query_params.get('material_id', None)

        if order_id is not None:
            try:
                order_id = int(order_id)
                queryset = queryset.filter(order_id=order_id)
            except ValueError:
                queryset = queryset.none()

        elif material_id is not None:
            try:
                material_id = int(material_id)
                queryset = queryset.filter(material_id=material_id)
            except ValueError:
                queryset = queryset.none()

        return queryset


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.select_related('order').all()
    serializer_class = AttachmentSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'file_name', 'description', 'mime_type',
        'order__order_number', 'order__client__full_name'
    ]
    ordering_fields = ['uploaded_at', 'file_name', 'file_size', 'order__order_number']
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        order_id = self.request.query_params.get('order_id', None)

        if order_id is not None:
            try:
                order_id = int(order_id)
                queryset = queryset.filter(order_id=order_id)
            except ValueError:
                queryset = queryset.none()

        return queryset
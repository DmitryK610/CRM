from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from .service import CalculationService
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()
from django.utils import timezone
# Импорты для авторизации и HistoryItem
from rest_framework.authtoken.views import ObtainAuthToken  # Импортируем базовый класс
from rest_framework.authtoken.models import Token  # Для работы с токенами
from rest_framework.response import Response  # Для формирования ответа
from rest_framework import status  # Для кодов статуса HTTP
from django.contrib.contenttypes.models import ContentType  # Для GenericForeignKey
from rest_framework.decorators import action
from rest_framework.viewsets import ViewSet
from decimal import Decimal, InvalidOperation
from .models import (
    Supplier, Material, Client, Employee, Calculation,
    Order, OrderItem, Payment, HistoryItem, UserProfile,  # Убедитесь, что HistoryItem и UserProfile импортированы
    Attachment, MaterialPurchase, PriceList,  # Убедитесь, что эти модели импортированы
)

from .serializers import (
    SupplierSerializer, MaterialSerializer, ClientSerializer, EmployeeSerializer,
    CalculationSerializer, OrderSerializer, OrderItemSerializer, PaymentSerializer,
    HistoryItemSerializer, UserProfileSerializer,
    AttachmentSerializer, MaterialPurchaseSerializer,
    PriceListSerializer  # Убедитесь, что все сериализаторы импортированы
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


class PriceListViewSet(ViewSet):
    """
    API endpoint for managing the singleton PriceList.
    - GET /api/pricelist/: Retrieves the current price list.
    - PUT /api/pricelist/: Updates the price list.
    - POST /api/pricelist/reset/: Resets the price list to default values.
    """
    permission_classes = []  # Add permissions like IsAdminUser in a real app

    def list(self, request):
        """Handles GET requests to fetch the price list."""
        price_list = PriceList.load()
        serializer = PriceListSerializer(price_list)
        return Response(serializer.data)

    def update(self, request):
        """Handles PUT requests to update the price list."""
        price_list = PriceList.load()
        # The frontend sends camelCase, which is converted to snake_case by the middleware
        serializer = PriceListSerializer(price_list, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def reset(self, request):
        """Handles POST requests to reset prices to their defaults."""
        # Delete the existing instance
        PriceList.objects.all().delete()
        # Create a new one with model defaults
        new_price_list = PriceList.load()
        serializer = PriceListSerializer(new_price_list)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CustomObtainAuthToken(ObtainAuthToken):
    """
    Представление для получения токена авторизации с добавлением записи в HistoryItem
    и возвратом данных UserProfile.
    """

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Если валидация не пройдена, будет выброшено исключение

        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        user_profile_data = None
        try:
            user_profile = user.profile
            user_profile_data = UserProfileSerializer(user_profile).data
        except UserProfile.DoesNotExist:
            # Fallback: Если профиль не найден (хотя должен быть после миграций и скрипта)
            user_profile_data = {
                'id': user.id,
                'ФИО': user.username,
                'email': user.email
            }
        except Exception:
            # Общий обработчик ошибок при получении профиля,
            # возвращаем базовые данные пользователя.
            user_profile_data = {
                'id': user.id,
                'ФИО': user.username,
                'email': user.email
            }

        # Логика создания HistoryItem об авторизации
        action_description = f"Пользователь '{user.username}' успешно авторизовался через API."
        try:
            user_content_type = ContentType.objects.get_for_model(User)
            HistoryItem.objects.create(
                action_description=action_description,
                user=user,
                object_id=user.pk,
                content_type=user_content_type,
                action_timestamp=timezone.now()
            )
        except Exception:
            # Если запись истории не удалась, просто логируем ошибку (или игнорируем),
            # но не прерываем процесс авторизации.
            pass  # Можно добавить logging.error() здесь, если нужен детальный лог ошибки

        response_data = {
            'token': token.key,
            'user': user_profile_data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


# --- ViewSets ---

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['company_name', 'contact_person', 'email', 'phone']
    ordering_fields = ['company_name', 'created_at']
    pagination_class = StandardPagination
    permission_classes = []  # Временно убираем авторизацию для диагностики

    @action(detail=False, methods=['get'], permission_classes=[])
    def health(self, request):
        """Простая проверка работоспособности endpoint"""
        count = Supplier.objects.count()
        return Response({
            'status': 'ok',
            'suppliers_count': count,
            'message': 'Suppliers endpoint is working'
        })

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
    """
    API endpoint for performing calculations and retrieving calculation history.
    - POST /: Validates input, performs calculation via CalculationService, and saves the record.
    - GET /: Retrieves the list of past calculations (history).
    - PUT /: Updates a calculation and records the change in history.
    """
    queryset = Calculation.objects.select_related('material', 'client', 'created_by').all()
    serializer_class = CalculationSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['id', 'material__material_name', 'client__full_name']
    ordering_fields = ['created_at', 'updated_at', 'total_cost']
    pagination_class = StandardPagination

    def perform_update(self, serializer):
        """Saves the updated instance."""
        serializer.save()

    def create(self, request, *args, **kwargs):
        preview_only = request.data.get('preview_only', False)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # --- ПОЛУЧЕНИЕ И ВАЛИДАЦИЯ КУРСА ДОЛЛАРА ИЗ ЗАПРОСА ---
        try:
            # Фронтенд должен присылать это поле в теле запроса
            dollar_rate = Decimal(request.data.get('dollarRate'))
            if dollar_rate <= 0:
                raise ValueError("Курс должен быть положительным числом.")
        except (TypeError, ValueError, InvalidOperation) as e:
            return Response(
                {"error": f"Некорректный или отсутствующий курс доллара: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # -------------------------------------------------------------

        price_list_data = request.data.get('priceList')
        price_list = PriceList(**price_list_data) if price_list_data else PriceList.load()

        # 1. Используем сервис, передавая в него `dollar_rate`
        service = CalculationService(serializer.validated_data, price_list, dollar_rate)
        results = service.calculate()

        # ... (остальная часть метода create остается без изменений) ...
        if preview_only:
            return Response({
                'totalCost': results['total_cost'],
                'breakdown': results['breakdown']
            }, status=status.HTTP_200_OK)
        else:
            user = get_current_user(request)
            instance = serializer.save(created_by=user, **results)
            # ... (создание HistoryItem и возврат ответа) ...
            return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Overrides the default update action to explicitly create a history item
        for the change.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Save the updated instance
        self.perform_update(serializer)

        # Refresh instance from DB to get the latest data for history logging
        instance.refresh_from_db()

        # Create a history item for the update action.
        user = get_current_user(request)
        HistoryItem.objects.create(
            action_description=f"Обновлен расчет №{instance.id} на сумму {instance.total_cost} руб.",
            user=user,
            content_object=instance
        )

        if getattr(instance, '_prefetched_objects_cache', None):
            # If the instance has been prefetched, that cache is now invalid.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = get_current_user(request)

        # Создание записи в истории перед удалением
        HistoryItem.objects.create(
            action_description=f"Удалён расчёт №{instance.id} на сумму {instance.total_cost} руб.",
            user=user,
            content_object=instance
        )

        # Удаление объекта
        self.perform_destroy(instance)

        return Response({"detail": "Расчёт успешно удалён."}, status=status.HTTP_204_NO_CONTENT)


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
    """
    ViewSet для управления вложениями (файлами).
    Поддерживает загрузку файлов как для заказов, так и для расчетов.
    """
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer

    # Убираем аутентификацию для упрощения работы
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Фильтруем вложения по заказам или расчетам.
        """
        queryset = super().get_queryset()

        # Фильтр по заказу
        order_id = self.request.query_params.get('order')
        if order_id:
            queryset = queryset.filter(order_id=order_id)

        # Фильтр по расчету
        calculation_id = self.request.query_params.get('calculation')
        if calculation_id:
            queryset = queryset.filter(calculation_id=calculation_id)

        return queryset.order_by('-uploaded_at')

    def perform_create(self, serializer):
        """
        Сохраняем вложение с дополнительной логикой.
        """
        # Можно добавить логику для добавления пользователя, если нужно
        # serializer.save(uploaded_by=self.request.user)
        serializer.save()

    def create(self, request, *args, **kwargs):
        """
        Переопределяем создание для лучшей обработки ошибок.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response(
                {
                    'error': 'Ошибка при загрузке файла',
                    'details': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        """
        Переопределяем удаление для лучшей обработки ошибок.
        """
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': f'Ошибка при удалении файла: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
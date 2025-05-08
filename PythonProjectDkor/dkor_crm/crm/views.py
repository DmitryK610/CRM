# views.py вашего приложения
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter # Добавлен OrderingFilter для сортировки
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.db.models.functions import Lower


from .models import (
    Supplier, Material, Client, Employee, Calculation,
    Order, OrderItem, Payment, HistoryItem, UserProfile,
    Attachment,
    MaterialPurchase
)

from .serializers import (
    SupplierSerializer, MaterialSerializer, ClientSerializer, EmployeeSerializer,
    CalculationSerializer, OrderSerializer, OrderItemSerializer, PaymentSerializer,
    HistoryItemSerializer, UserProfileSerializer,
    AttachmentSerializer,
    MaterialPurchaseSerializer
)

class OrderPagination(PageNumberPagination):
    page_size = 10


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100



class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['company_name', 'contact_person', 'email', 'phone']
    ordering_fields = ['company_name', 'created_at']

    pagination_class = StandardPagination


class MaterialViewSet(viewsets.ModelViewSet):

    queryset = Material.objects.select_related('supplier').all()
    serializer_class = MaterialSerializer
    filter_backends = [SearchFilter, OrderingFilter] # Добавлен OrderingFilter
    search_fields = ['material_name', 'color_code', 'note', 'supplier__company_name']
    ordering_fields = ['material_name', 'cost', 'created_at']
    # permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['full_name', 'contact_phone', 'email', 'address', 'note']
    ordering_fields = ['full_name', 'created_at', 'updated_at']
    # permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination #


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['full_name', 'phone', 'position']
    ordering_fields = ['full_name', 'hired_date', 'created_at']
    # permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination


class OrderViewSet(viewsets.ModelViewSet):

    queryset = Order.objects.select_related('client', 'calculation', 'material', 'employee').all()
    serializer_class = OrderSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'order_number', 'status', 'client__full_name',
        'client__contact_phone', 'material__material_name',
        'material__color_code', 'employee__full_name', 'note'
    ]
    ordering_fields = [
        'order_date', 'created_at', 'total_amount', 'status',
        'client__full_name', 'material__material_name'
    ]
    pagination_class = OrderPagination
    # permission_classes = [permissions.IsAuthenticated]


class CalculationViewSet(viewsets.ModelViewSet):
    queryset = Calculation.objects.all()
    serializer_class = CalculationSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'title', 'description', 'result_text']
    ordering_fields = ['created_at', 'updated_at', 'value', 'title']
    # permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer



class PaymentViewSet(viewsets.ModelViewSet):

    queryset = Payment.objects.select_related('order', 'created_by').all()
    serializer_class = PaymentSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'transaction_id', 'notes', 'payment_method', 'status',
        'order__order_number', 'order__client__full_name',
        'created_by__full_name'
    ]
    ordering_fields = [
        'payment_date', 'created_at', 'amount', 'payment_method',
        'status', 'order__order_number'
    ]

    pagination_class = StandardPagination


class HistoryItemViewSet(viewsets.ModelViewSet):

    queryset = HistoryItem.objects.select_related('employee').all()
    serializer_class = HistoryItemSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['action_description', 'employee__full_name']
    ordering_fields = ['action_timestamp', 'employee__full_name']
    # permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination


class UserProfileViewSet(viewsets.ModelViewSet):

    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['full_name', 'email']
    ordering_fields = ['full_name']
    # permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination



class MaterialPurchaseViewSet(viewsets.ModelViewSet): # ИСПРАВЛЕНО: Имя класса

    serializer_class = MaterialPurchaseSerializer

    queryset = MaterialPurchase.objects.select_related('material', 'order').all()

    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'material__material_name', 'material__color_code',
        'order__order_number', 'notes', 'status', 'payment_method',
        'material__supplier__company_name'
    ] #
    ordering_fields = [
        'purchase_order_date', 'created_at', 'total_cost', 'quantity',
        'status', 'received_date', 'material__material_name',
        'order__order_number'
    ]

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

    pagination_class = StandardPagination



class AttachmentViewSet(viewsets.ModelViewSet):

    queryset = Attachment.objects.select_related('order').all()
    serializer_class = AttachmentSerializer


    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'file_name', 'description', 'mime_type',
        'order__order_number', 'order__client__full_name'
    ]
    ordering_fields = ['uploaded_at', 'file_name', 'file_size', 'order__order_number']


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

    pagination_class = StandardPagination
from django.urls import path, include
from rest_framework import routers
from .views import (
    SupplierViewSet,
    MaterialViewSet,
    ClientViewSet,
    EmployeeViewSet,
    CalculationViewSet,
    OrderViewSet,
    PaymentViewSet,
    HistoryItemViewSet,
    UserProfileViewSet,
    AttachmentViewSet,
    MaterialPurchaseViewSet,
    PriceListViewSet,
)

router = routers.SimpleRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'calculations', CalculationViewSet, basename='calculation')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'history-items', HistoryItemViewSet, basename='historyitem')
router.register(r'user-profiles', UserProfileViewSet, basename='userprofile')
router.register(r'attachments', AttachmentViewSet, basename='attachment')
router.register(r'material-purchases', MaterialPurchaseViewSet, basename='material-purchase')
router.register(r'price-list', PriceListViewSet, basename='price-list')

# Убедись, что urlpatterns экспортируется!
app_name = 'crm'
urlpatterns = [
    path('', include(router.urls)),
]
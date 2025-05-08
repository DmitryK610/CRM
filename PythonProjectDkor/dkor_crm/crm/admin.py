from django.contrib import admin
# my_app/admin.py
from django.contrib import admin
from .models import (
    Supplier, Material, Client, Employee, Calculation,
    Order, OrderItem, Payment, HistoryItem, UserProfile, MaterialPurchase
)
admin.site.register(Supplier)
admin.site.register(Material)
admin.site.register(Client)
admin.site.register(Employee)
admin.site.register(Calculation)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(HistoryItem)
admin.site.register(UserProfile)
admin.site.register(MaterialPurchase)

def site():
    return None
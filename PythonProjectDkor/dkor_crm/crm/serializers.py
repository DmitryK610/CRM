from rest_framework import serializers

from .models import (
    Supplier, Material, Client, Employee, Calculation,
    Order, OrderItem, Payment, HistoryItem, UserProfile, Attachment,
    MaterialPurchase
)

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'company_name', 'contact_person', 'email', 'supplier_address', 'phone', 'created_at', 'note']
        read_only_fields = ('id', 'created_at')


class SimpleSupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'company_name']



class SimpleMaterialSerializer(serializers.ModelSerializer):

    supplier_details = SimpleSupplierSerializer(source='supplier', read_only=True)

    class Meta:
        model = Material
        fields = ['id', 'material_name', 'color_code', 'supplier_details'] # Включаем необходимые поля + поставщика


class MaterialSerializer(serializers.ModelSerializer):

    supplier_details = SupplierSerializer(source='supplier', read_only=True)
    purchases = serializers.PrimaryKeyRelatedField(many=True, read_only=True)


    class Meta:
        model = Material
        fields = [
            'id', 'material_name', 'color_code', 'supplier',
            'cost', 'note', 'created_at', 'image_url',
            'supplier_details', 'purchases',
        ]
        read_only_fields = ('id', 'created_at', 'supplier_details', 'purchases')


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'full_name', 'contact_phone', 'email', 'address', 'note', 'created_at', 'updated_at']
        read_only_fields = ('id', 'created_at', 'updated_at')


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class CalculationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calculation
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        # Скорректируйте read_only_fields, если первичный ключ изменится



class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_name',
            'quantity',
            'unit_price',
            'total_price',
        ]
        read_only_fields = ('id',)


class SimpleOrderSerializer(serializers.ModelSerializer):
     class Meta:
        model = Order
        fields = ['id', 'order_number']
        read_only_fields = fields



class MaterialPurchaseSerializer(serializers.ModelSerializer):

    material_details = SimpleMaterialSerializer(source='material', read_only=True)
    order_details = SimpleOrderSerializer(source='order', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = MaterialPurchase
        fields = [
            'id',

            'material_details',
            'order_details',
            'material',
            'order',
            'quantity',
            'total_cost',
            'payment_method',
            'payment_method_display',
            'purchase_order_date',
            'status',
            'status_display',
            'received_date',
            'notes',
            'created_at',
            'updated_at',
        ]


        read_only_fields = (
            'id',
            'material_details',
            'order_details',
            'payment_method_display',
            'status_display',
            'created_at',
            'updated_at',
        )

class OrderSerializer(serializers.ModelSerializer):
    client_info = serializers.SerializerMethodField()
    material_info = serializers.SerializerMethodField()
    employee_info = serializers.SerializerMethodField()
    material_purchases = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    order_items = OrderItemSerializer(many=True, required=False)
    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), required=True)
    material = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all(), required=True)
    employee = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), allow_null=True, required=False)
    calculation = serializers.PrimaryKeyRelatedField(queryset=Calculation.objects.all(), allow_null=True, required=False)

    note = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'order_date', 'client', 'client_info', 'calculation',
            'total_amount', 'material', 'material_info', 'material_quantity', 'status',
            'advance_payment_amount', 'advance_payment_date', 'installation_date',
            'employee', 'employee_info', 'needs_installation', 'needs_delivery',
            'created_at', 'updated_at', 'order_items', 'advance_payment_type', 'note',
            'material_purchases',
        ]
        read_only_fields = (
            'id', 'order_number', 'created_at', 'updated_at',
            'client_info', 'material_info', 'employee_info', 'material_purchases',
        )

    def get_client_info(self, obj):
        if obj.client:
            return {
                'id': obj.client.id,
                'full_name': getattr(obj.client, 'full_name', None),
                'contact_phone': getattr(obj.client, 'contact_phone', None),
            }
        return None

    def get_material_info(self, obj):
        if obj.material:
            return {
                'id': obj.material.id,
                'material_name': getattr(obj.material, 'material_name', None),
                'color_code': getattr(obj.material, 'color_code', None),
            }
        return None

    def get_employee_info(self, obj):
        if obj.employee:
            return {
                'id': obj.employee.id,
                'full_name': getattr(obj.employee, 'full_name', None),
                'position': getattr(obj.employee, 'position', None),
            }
        return None

    def validate_total_amount(self, value):
        if value is not None and value <= 0:
            pass
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('order_items', [])
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('order_items', None)
        instance = super().update(instance, validated_data)
        if items_data is not None:
            instance.order_items.all().delete()
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)

        return instance


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class HistoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoryItem
        fields = '__all__'
        read_only_fields = ('id', 'action_timestamp')



class AttachmentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True)

    class Meta:
        model = Attachment
        fields = [
            'id', 'order', 'file', 'description', 'uploaded_at',
            'file_name', 'file_size', 'mime_type',
        ]
        read_only_fields = ['uploaded_at', 'file_name', 'file_size', 'mime_type']

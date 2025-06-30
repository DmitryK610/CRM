from rest_framework import serializers
from django.utils.timezone import now
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
        fields = ['id', 'material_name', 'color_code', 'supplier_details']


class MaterialSerializer(serializers.ModelSerializer):
    supplier_details = SimpleSupplierSerializer(source='supplier', read_only=True)
    purchases = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Material
        fields = [
            'id', 'material_name', 'color_code', 'supplier',
            'cost', 'cost_per_sqm', 'note', 'created_at', 'image_url',  # Добавлено cost_per_sqm
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
    stoneName = serializers.SlugRelatedField(
        slug_field='color_code',
        queryset=Material.objects.all(),
        source='material'
    )
    productArea = serializers.DecimalField(max_digits=10, decimal_places=2, source='product_area')
    measurementRequired = serializers.BooleanField(source='measurement_required', default=False)
    surfaceBonding = serializers.DecimalField(max_digits=10, decimal_places=2, source='surface_bonding', default=0)
    edgeType = serializers.ChoiceField(choices=Calculation.EdgeType.choices, source='edge_type',
                                       default=Calculation.EdgeType.RADIUS)
    edgeLength = serializers.DecimalField(max_digits=10, decimal_places=2, source='edge_length', default=0)
    drainageType = serializers.ChoiceField(choices=Calculation.DrainageType.choices, source='drainage_type',
                                           default=Calculation.DrainageType.OVERLAY)
    drainageLength = serializers.DecimalField(max_digits=10, decimal_places=2, source='drainage_length', default=0)
    frontBend = serializers.DecimalField(max_digits=10, decimal_places=2, source='front_bend', default=0)
    ventilationHoles = serializers.IntegerField(source='ventilation_holes', default=0)
    cooktopCutouts = serializers.IntegerField(source='cooktop_cutouts', default=0)
    overlaySinkCutouts = serializers.IntegerField(source='overlay_sink_cutouts', default=0)
    undermountSinkInstallations = serializers.IntegerField(source='undermount_sink_installations', default=0)
    onSiteJoining = serializers.IntegerField(source='on_site_joining', default=0)
    deliveryType = serializers.ChoiceField(choices=Calculation.DeliveryType.choices, source='delivery_type',
                                           default=Calculation.DeliveryType.CITY)
    complexityAdditions = serializers.JSONField(write_only=True)
    calculationId = serializers.IntegerField(source='id', read_only=True)
    totalCost = serializers.DecimalField(max_digits=12, decimal_places=2, source='total_cost', read_only=True)
    breakdown = serializers.JSONField(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True, format="%Y-%m-%dT%H:%M:%SZ")
    client_info = ClientSerializer(source='client', read_only=True)

    class Meta:
        model = Calculation
        fields = [
            'calculationId', 'client', 'client_info', 'stoneName', 'productArea', 'measurementRequired',
            'surfaceBonding', 'edgeType', 'edgeLength', 'drainageType', 'drainageLength',
            'frontBend', 'ventilationHoles', 'cooktopCutouts', 'overlaySinkCutouts',
            'undermountSinkInstallations', 'onSiteJoining', 'deliveryType',
            'complexityAdditions', 'totalCost', 'breakdown', 'createdAt',
        ]
        extra_kwargs = {
            'client': {'required': False, 'allow_null': True}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['complexityAdditions'] = {
            'radius10to300': instance.radius_10_to_300,
            'radius300to1000': instance.radius_300_to_1000,
            'verticalRadius': instance.vertical_radius,
            'twoPlaneProduct': instance.two_plane_product
        }
        return data

    def validate(self, data):
        complexity_data = data.pop('complexityAdditions', {})
        data['radius_10_to_300'] = complexity_data.get('radius10to300', 0)
        data['radius_300_to_1000'] = complexity_data.get('radius300to1000', 0)
        data['vertical_radius'] = complexity_data.get('verticalRadius', 0)
        data['two_plane_product'] = complexity_data.get('twoPlaneProduct', 0)

        if not data.get('material'):
            raise serializers.ValidationError({"stoneName": "Это поле обязательно."})
        if not data.get('product_area') or data.get('product_area') <= 0:
            raise serializers.ValidationError({"productArea": "Площадь изделия должна быть больше нуля."})

        return data

class UserProfileSerializer(serializers.ModelSerializer):
    # Явно переопределяем поле 'full_name' как 'ФИО' для JSON-вывода
    # SerializerMethodField - это один из способов, но проще использовать source
    ФИО = serializers.CharField(source='full_name') # <-- Добавляем это поле

    class Meta:
        model = UserProfile
        # Указываем, какие поля сериализовать.
        # Теперь включаем наше новое поле 'ФИО' и исключаем 'full_name'
        fields = ['id', 'ФИО', 'email'] # <-- Здесь указываем 'ФИО'
        # Если вы хотите, чтобы email был обязательным в API, уберите email?: string на фронте
        # и сделайте его required=True здесь, если нужно.


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
    material_purchases = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    order_items = OrderItemSerializer(many=True, required=False)
    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), required=True)
    material = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all(), required=True)
    calculation = serializers.PrimaryKeyRelatedField(queryset=Calculation.objects.all(), allow_null=True, required=False)
    note = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'order_date', 'client', 'client_info', 'calculation',
            'total_amount', 'material', 'material_info', 'material_quantity', 'status',
            'advance_payment_amount', 'advance_payment_date', 'installation_date',
            'needs_installation', 'needs_delivery', 'created_at', 'updated_at',
            'order_items', 'advance_payment_type', 'note', 'material_purchases',
        ]
        read_only_fields = (
            'id', 'order_number', 'created_at', 'updated_at',
            'client_info', 'material_info', 'material_purchases',
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
    user = serializers.StringRelatedField()  # Или PrimaryKeyRelatedField, зависит от потребностей

    class Meta:
        model = HistoryItem
        fields = ['id', 'action_description', 'user', 'action_timestamp', 'content_type', 'object_id']
        read_only_fields = ['id', 'action_timestamp', 'user', 'content_type', 'object_id']


class AttachmentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True)

    class Meta:
        model = Attachment
        fields = [
            'id', 'order', 'file', 'description', 'uploaded_at',
            'file_name', 'file_size', 'mime_type',
        ]
        read_only_fields = ['uploaded_at', 'file_name', 'file_size', 'mime_type']
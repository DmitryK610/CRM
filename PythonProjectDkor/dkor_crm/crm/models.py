from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import FileField
import os
import mimetypes
from django.core.files.uploadedfile import UploadedFile
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class OrderStatus(models.TextChoices):
    NEW = 'Новый', _('Новый')
    CALCULATION_CONFIRMED = 'Расчет подтвержден', _('Расчет подтвержден')
    AWAITING_ADVANCE = 'Ожидает аванса', _('Ожидает аванса')
    IN_PRODUCTION = 'В производстве', _('В производстве')
    READY_FOR_INSTALLATION = 'Готов к установке', _('Готов к установке')
    AWAITING_INSTALLATION = 'Ожидает установки', _('Ожидает установки')
    INSTALLATION = 'Установка', _('Установка')
    COMPLETED = 'Выполнен', _('Выполнен')
    CANCELLED = 'Отменен', _('Отменен')


class PaymentMethod(models.TextChoices):
    CASH = 'cash', _('Наличные')
    CARD = 'card', _('Банковская карта')
    BANK_TRANSFER = 'bank_transfer', _('Банковский перевод')
    ONLINE = 'online', _('Онлайн-платеж')
    CREDIT = 'credit', _('Кредит')
    INSTALLMENT = 'installment', _('Рассрочка')


class PaymentStatus(models.TextChoices):
    PENDING = 'pending', _('Ожидает подтверждения')
    COMPLETED = 'completed', _('Успешно завершен')
    FAILED = 'failed', _('Неудачный платеж')
    REFUNDED = 'refunded', _('Возврат средств')
    PARTIALLY_REFUNDED = 'partially_refunded', _('Частичный возврат')


class AdvancePaymentTypeChoices(models.TextChoices):
    CASH = 'cash', _('Наличные')
    CASHLESS = 'cashless', _('Безналичные')


class PurchaseStatus(models.TextChoices):
    NOT_RECEIVED = 'not-received', _('Не получен')
    RECEIVED = 'received', _('Получен')
    CANCELLED = 'cancelled', _('Отменен')


class SupplierPaymentMethod(models.TextChoices):
    CASH = 'cash', _('Наличные')
    CASHLESS = 'cashless', _('Безналичные')


class Supplier(models.Model):
    company_name = models.CharField(_("Company Name"), max_length=255, db_column='названиеКомпании')
    contact_person = models.CharField(_("Contact Person"), max_length=255, db_column='контактноеЛицо')
    email = models.EmailField(_("Email"), db_column='электроннаяПочта')
    supplier_address = models.TextField(_("Supplier Address"), db_column='адресПоставщика')
    phone = models.CharField(_("Phone"), max_length=50, db_column='телефон')
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    note = models.TextField(_("Note"), blank=True, null=True, db_column='примечание')

    def __str__(self):
        return self.company_name

    class Meta:
        verbose_name = _("Поставщик")
        verbose_name_plural = _("Поставщики")


class Material(models.Model):
    material_name = models.CharField(_("Material Name"), max_length=255, db_column='названиеМатериала')
    color_code = models.CharField(_("Color Code"), max_length=100, db_column='артикулЦвета')
    supplier = models.ForeignKey(Supplier, verbose_name=_("Supplier"), on_delete=models.PROTECT, related_name='materials')
    cost = models.DecimalField(_("Cost per Unit"), max_digits=10, decimal_places=2, db_column='стоимостьЗаЕдиницу')
    note = models.TextField(_("Description"), blank=True, null=True, db_column='описание')
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    image_url = models.URLField(_("Image URL"), max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.material_name} ({self.color_code})"

    class Meta:
        verbose_name = _("Камень")
        verbose_name_plural = _("Камни")


class Client(models.Model):
    full_name = models.CharField(_("Full Name"), max_length=255, db_column='ФИО')
    contact_phone = models.CharField(_("Contact Phone"), max_length=50, db_column='Контактный телефон')
    email = models.EmailField(_("Email"), db_column='электронная почта')
    address = models.TextField(_("Address"), db_column='адрес')
    note = models.TextField(_("Note"), blank=True, null=True, db_column='примечание')
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True, blank=True, null=True)

    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = _("Клиент")
        verbose_name_plural = _("Клиенты")


class Employee(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employee_profile',
        verbose_name=_("Django User")
    )
    full_name = models.CharField(_("Full Name"), max_length=255, db_column='ФИО')
    phone = models.CharField(_("Phone"), max_length=50)
    position = models.CharField(_("Position"), max_length=100)
    hired_date = models.DateField(_("Hired Date"), db_column='hiredDate')
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True, db_column='createdAt')

    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = _("Сотрудник")
        verbose_name_plural = _("Сотрудники")


class Calculation(models.Model):
    name = models.CharField(_("Name"), max_length=255, blank=True, null=True)
    title = models.CharField(_("Title"), max_length=255, blank=True, null=True)
    description = models.TextField(_("Description"), blank=True, null=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True, blank=True, null=True)
    value = models.DecimalField(_("Result Value"), max_digits=15, decimal_places=5, blank=True, null=True)
    unit = models.CharField(_("Unit"), max_length=50, blank=True, null=True)
    result_text = models.TextField(_("Result Text/Message"), blank=True, null=True)
    error_message = models.TextField(_("Error Message"), blank=True, null=True)

    def __str__(self):
        return self.title or self.name or f"Calculation {self.id}"

    class Meta:
        verbose_name = _("Расчет")
        verbose_name_plural = _("Расчеты")


class Order(models.Model):
    client = models.ForeignKey(Client, verbose_name=_("Client"), on_delete=models.PROTECT, db_column='id_клиент', related_name='orders')
    calculation = models.ForeignKey(Calculation, verbose_name=_("Calculation"), on_delete=models.SET_NULL, blank=True, null=True, db_column='id_расчета', related_name='orders')
    total_amount = models.DecimalField(_("Total Amount"), max_digits=12, decimal_places=2, db_column='сумма_заказа')
    material = models.ForeignKey(Material, verbose_name=_("Material"), on_delete=models.PROTECT, db_column='id_материал', related_name='orders')
    material_quantity = models.DecimalField(_("Material Quantity"), max_digits=10, decimal_places=3, default=0.0, db_column='количество_материала')
    status = models.CharField(_("Status"), max_length=50, choices=OrderStatus.choices, default=OrderStatus.NEW, db_column='статус_заказа')
    advance_payment_amount = models.DecimalField(_("Advance Payment Amount"), max_digits=12, decimal_places=2, blank=True, null=True, db_column='сумма_аванса')
    advance_payment_date = models.DateTimeField(_("Advance Payment Date"), blank=True, null=True, db_column='дата_внесения_аванса')
    installation_date = models.DateTimeField(_("Installation Date"), blank=True, null=True, db_column='дата_установки')
    employee = models.ForeignKey(Employee, verbose_name=_("Responsible Employee"), on_delete=models.SET_NULL, blank=True, null=True, db_column='id_сотрудника', related_name='managed_orders')
    needs_installation = models.BooleanField(_("Needs Installation"), default=False, db_column='установка')
    needs_delivery = models.BooleanField(_("Needs Delivery"), default=False, db_column='доставка')
    order_number = models.CharField(_("Order Number"), max_length=50, unique=True, blank=True, null=True, db_column='orderNumber')
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)
    order_date = models.DateField(_("Order Date"), db_column='дата_заказа')
    note = models.TextField(_("Note"), blank=True, null=True, db_column='примечание')
    advance_payment_type = models.CharField(_("Advance Payment Type"), max_length=50, choices=AdvancePaymentTypeChoices.choices, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Генерация уникального номера с префиксом "P-"
            last_order = Order.objects.all().order_by('id').only('id').last()
            next_id = last_order.id + 1 if last_order else 1
            self.order_number = str(next_id)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{_('Order')} №{self.order_number or self.id} {_('from')} {self.order_date}"

    class Meta:
        verbose_name = _("Заказ")
        verbose_name_plural = _("Заказы")
        ordering = ['-order_date', '-created_at']


class OrderItem(models.Model):
    order = models.ForeignKey(Order, verbose_name=_("Order"), on_delete=models.CASCADE, related_name='order_items')
    product_name = models.CharField(_("Product Name"), max_length=255)
    quantity = models.DecimalField(_("Quantity"), max_digits=10, decimal_places=3)
    unit_price = models.DecimalField(_("Unit Price"), max_digits=10, decimal_places=2)
    total_price = models.DecimalField(_("Total Price"), max_digits=12, decimal_places=2)  # Будет вычисляться

    def __str__(self):
        return f"{self.product_name} (x{self.quantity}) {_('for order')} {self.order.id}"

    class Meta:
        verbose_name = _("Позиция в заказе")
        verbose_name_plural = _("Позиции в заказе")


class Payment(models.Model):
    order = models.ForeignKey(Order, verbose_name=_("Order"), on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(_("Amount"), max_digits=12, decimal_places=2)
    payment_date = models.DateField(_("Payment Date"))
    payment_method = models.CharField(_("Payment Method"), max_length=20, choices=PaymentMethod.choices)
    status = models.CharField(_("Status"), max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    transaction_id = models.CharField(_("Transaction ID"), max_length=255, blank=True, null=True)
    notes = models.TextField(_("Notes"), blank=True, null=True)
    created_by = models.ForeignKey(Employee, verbose_name=_("Created By"), on_delete=models.SET_NULL, blank=True, null=True, related_name='created_payments')
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    def __str__(self):
        return f"{_('Payment')} {self.id} {_('amount')} {self.amount} {_('for order')} {self.order.id}"

    class Meta:
        verbose_name = _("Платеж")
        verbose_name_plural = _("Платежи")
        ordering = ['-payment_date', '-created_at']


class MaterialPurchase(models.Model):
    material = models.ForeignKey(
        Material,
        verbose_name=_("Материал"),
        on_delete=models.PROTECT,
        related_name='purchases'
    )
    order = models.ForeignKey(
        Order,
        verbose_name=_("Связанный клиентский заказ"),
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='material_purchases'
    )
    quantity = models.DecimalField(
        _("Закупленное количество"),
        max_digits=10,
        decimal_places=3
    )
    total_cost = models.DecimalField(
        _("Общая стоимость закупки"),
        max_digits=12,
        decimal_places=2
    )
    payment_method = models.CharField(
        _("Способ оплаты поставщику"),
        max_length=20,
        choices=SupplierPaymentMethod.choices,
        default=SupplierPaymentMethod.CASHLESS
    )
    purchase_order_date = models.DateField(
        _("Дата заказа у поставщика")
    )
    status = models.CharField(
        _("Статус получения"),
        max_length=20,
        choices=PurchaseStatus.choices,
        default=PurchaseStatus.NOT_RECEIVED
    )
    received_date = models.DateField(
        _("Дата получения от поставщика"),
        blank=True,
        null=True
    )
    notes = models.TextField(
        _("Примечание к закупке"),
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(_("Дата создания записи"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Дата обновления записи"), auto_now=True)

    def __str__(self):
        material_name = self.material.material_name if self.material else _("Материал не указан")
        return f"{_('Закупка')} {material_name} ({self.quantity}) {_('от')} {self.purchase_order_date}"

    class Meta:
        verbose_name = _("Закупка материала")
        verbose_name_plural = _("Закупки материалов")
        ordering = ['-purchase_order_date', '-created_at']


class HistoryItem(models.Model):
    action_description = models.TextField(_("Action Description"), db_column='описаниеДействия')
    employee = models.ForeignKey(Employee, verbose_name=_("Employee"), on_delete=models.SET_NULL, blank=True, null=True, db_column='idСотрудник', related_name='history_actions')
    action_timestamp = models.DateTimeField(_("Action Timestamp"), auto_now_add=True, db_column='датаИВремяИзменения')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')  # Это "виртуальное" поле для удобства

    def __str__(self):
        employee_name = self.employee.full_name if self.employee else _('System')
        return f"{self.action_timestamp}: {employee_name} - {self.action_description[:50]}..."

    class Meta:
        verbose_name = _("Запись истории")
        verbose_name_plural = _("Записи истории")
        ordering = ['-action_timestamp']


class UserProfile(models.Model):
    full_name = models.CharField(_("Full Name"), max_length=255, db_column='ФИО')
    email = models.EmailField(_("Email"), unique=True, blank=True, null=True)

    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = _("Пользовательский профиль")
        verbose_name_plural = _("Пользовательские профили")


class Attachment(models.Model):
    order = models.ForeignKey(Order, verbose_name=_("Order"), on_delete=models.CASCADE, related_name='attachments')
    file = FileField(verbose_name=_("File"), upload_to='uploads/attachments/')
    description = models.TextField(verbose_name=_("Description"), blank=True, null=True)
    file_name = models.CharField(verbose_name=_("File Name"), max_length=255, blank=True, null=True)
    file_size = models.PositiveBigIntegerField(verbose_name=_("File Size"), null=True, blank=True)
    mime_type = models.CharField(verbose_name=_("MIME Type"), max_length=100, blank=True, null=True)
    uploaded_at = models.DateTimeField(verbose_name=_("Uploaded At"), auto_now_add=True)

    def __str__(self):
        return self.file_name or f"Attachment {self.id}"

    class Meta:
        verbose_name = _("Вложение")
        verbose_name_plural = _("Вложения")
        ordering = ['-uploaded_at']

    def save(self, *args, **kwargs):
        if self.file and hasattr(self.file, 'file') and isinstance(self.file.file, UploadedFile):
            self.file_name = self.file.name
            self.file_size = self.file.size
            self.mime_type = self.file.file.content_type or mimetypes.guess_type(self.file.name)[0]
        elif self.file and hasattr(self.file, 'path') and os.path.exists(self.file.path):
            if not self.file_name:
                self.file_name = os.path.basename(self.file.name)
            if self.file_size is None:
                try:
                    self.file_size = os.path.getsize(self.file.path)
                except (OSError, ValueError):
                    self.file_size = None
            if not self.mime_type:
                self.mime_type = mimetypes.guess_type(self.file.name)[0]
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.file:
            storage, path = self.file.storage, self.file.path
            if storage.exists(path):
                storage.delete(path)
        super().delete(*args, **kwargs)



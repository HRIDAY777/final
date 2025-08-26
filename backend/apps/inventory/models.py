from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid


class Category(models.Model):
    """Category model for organizing inventory items"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name=_('Category Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        verbose_name=_('Parent Category')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Supplier model for managing vendors"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name=_('Supplier Name'))
    contact_person = models.CharField(max_length=100, blank=True, verbose_name=_('Contact Person'))
    email = models.EmailField(blank=True, verbose_name=_('Email'))
    phone = models.CharField(max_length=20, blank=True, verbose_name=_('Phone'))
    address = models.TextField(blank=True, verbose_name=_('Address'))
    website = models.URLField(blank=True, verbose_name=_('Website'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Supplier')
        verbose_name_plural = _('Suppliers')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Asset(models.Model):
    """Asset model for tracking inventory items"""
    
    CONDITION_CHOICES = [
        ('excellent', _('Excellent')),
        ('good', _('Good')),
        ('fair', _('Fair')),
        ('poor', _('Poor')),
        ('damaged', _('Damaged')),
    ]
    
    STATUS_CHOICES = [
        ('available', _('Available')),
        ('in_use', _('In Use')),
        ('maintenance', _('Under Maintenance')),
        ('retired', _('Retired')),
        ('lost', _('Lost')),
        ('stolen', _('Stolen')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name=_('Asset Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name=_('Category'))
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Supplier'))
    
    # Asset Details
    serial_number = models.CharField(max_length=100, blank=True, verbose_name=_('Serial Number'))
    model = models.CharField(max_length=100, blank=True, verbose_name=_('Model'))
    brand = models.CharField(max_length=100, blank=True, verbose_name=_('Brand'))
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good', verbose_name=_('Condition'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', verbose_name=_('Status'))
    
    # Location
    location = models.CharField(max_length=200, blank=True, verbose_name=_('Location'))
    room_number = models.CharField(max_length=50, blank=True, verbose_name=_('Room Number'))
    department = models.CharField(max_length=100, blank=True, verbose_name=_('Department'))
    
    # Financial Information
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Purchase Price'))
    current_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Current Value'))
    purchase_date = models.DateField(null=True, blank=True, verbose_name=_('Purchase Date'))
    warranty_expiry = models.DateField(null=True, blank=True, verbose_name=_('Warranty Expiry'))
    
    # Maintenance
    last_maintenance = models.DateField(null=True, blank=True, verbose_name=_('Last Maintenance'))
    next_maintenance = models.DateField(null=True, blank=True, verbose_name=_('Next Maintenance'))
    maintenance_notes = models.TextField(blank=True, verbose_name=_('Maintenance Notes'))
    
    # Assignment
    assigned_to = models.CharField(max_length=100, blank=True, verbose_name=_('Assigned To'))
    assigned_date = models.DateField(null=True, blank=True, verbose_name=_('Assigned Date'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Asset')
        verbose_name_plural = _('Assets')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['status']),
            models.Index(fields=['condition']),
            models.Index(fields=['serial_number']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.serial_number}" if self.serial_number else self.name


class StockItem(models.Model):
    """Stock item model for consumable inventory"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name=_('Item Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name=_('Category'))
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Supplier'))
    
    # Stock Details
    sku = models.CharField(max_length=100, unique=True, verbose_name=_('SKU'))
    unit = models.CharField(max_length=50, verbose_name=_('Unit'))
    current_stock = models.PositiveIntegerField(default=0, verbose_name=_('Current Stock'))
    minimum_stock = models.PositiveIntegerField(default=0, verbose_name=_('Minimum Stock'))
    maximum_stock = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Maximum Stock'))
    
    # Financial Information
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Unit Price'))
    total_value = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name=_('Total Value'))
    
    # Location
    location = models.CharField(max_length=200, blank=True, verbose_name=_('Location'))
    shelf_number = models.CharField(max_length=50, blank=True, verbose_name=_('Shelf Number'))
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Stock Item')
        verbose_name_plural = _('Stock Items')
        ordering = ['name']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['sku']),
            models.Index(fields=['current_stock']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.sku})"
    
    def save(self, *args, **kwargs):
        # Calculate total value
        self.total_value = self.current_stock * self.unit_price
        super().save(*args, **kwargs)


class Transaction(models.Model):
    """Transaction model for tracking inventory movements"""
    
    TRANSACTION_TYPES = [
        ('purchase', _('Purchase')),
        ('sale', _('Sale')),
        ('transfer', _('Transfer')),
        ('adjustment', _('Adjustment')),
        ('return', _('Return')),
        ('damage', _('Damage')),
        ('maintenance', _('Maintenance')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, verbose_name=_('Transaction Type'))
    reference_number = models.CharField(max_length=100, unique=True, verbose_name=_('Reference Number'))
    
    # Item Details
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Asset'))
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Stock Item'))
    quantity = models.PositiveIntegerField(default=1, verbose_name=_('Quantity'))
    
    # Transaction Details
    from_location = models.CharField(max_length=200, blank=True, verbose_name=_('From Location'))
    to_location = models.CharField(max_length=200, blank=True, verbose_name=_('To Location'))
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Unit Price'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name=_('Total Amount'))
    
    # Notes
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    
    # Timestamps
    transaction_date = models.DateTimeField(auto_now_add=True, verbose_name=_('Transaction Date'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    
    class Meta:
        verbose_name = _('Transaction')
        verbose_name_plural = _('Transactions')
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['transaction_type']),
            models.Index(fields=['transaction_date']),
            models.Index(fields=['asset']),
            models.Index(fields=['stock_item']),
        ]
    
    def __str__(self):
        item_name = self.asset.name if self.asset else self.stock_item.name
        return f"{self.transaction_type.title()} - {item_name} ({self.reference_number})"
    
    def save(self, *args, **kwargs):
        # Calculate total amount
        if self.unit_price:
            self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class MaintenanceRecord(models.Model):
    """Maintenance record model for asset maintenance tracking"""
    
    MAINTENANCE_TYPES = [
        ('preventive', _('Preventive')),
        ('corrective', _('Corrective')),
        ('emergency', _('Emergency')),
        ('inspection', _('Inspection')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, verbose_name=_('Asset'))
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPES, verbose_name=_('Maintenance Type'))
    
    # Maintenance Details
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    description = models.TextField(verbose_name=_('Description'))
    performed_by = models.CharField(max_length=100, verbose_name=_('Performed By'))
    
    # Dates
    scheduled_date = models.DateField(verbose_name=_('Scheduled Date'))
    completed_date = models.DateField(null=True, blank=True, verbose_name=_('Completed Date'))
    
    # Cost
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Cost'))
    
    # Status
    is_completed = models.BooleanField(default=False, verbose_name=_('Is Completed'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Maintenance Record')
        verbose_name_plural = _('Maintenance Records')
        ordering = ['-scheduled_date']
    
    def __str__(self):
        return f"{self.asset.name} - {self.title}"

from django.contrib import admin
from .models import (
    Category, Supplier, Asset, StockItem, Transaction, MaintenanceRecord
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'item_count', 'created_at')
    list_filter = ('is_active', 'parent', 'created_at')
    search_fields = ('name', 'description')
    list_editable = ('is_active',)
    ordering = ('name',)
    
    def item_count(self, obj):
        """Get count of items in this category"""
        return Asset.objects.filter(category=obj).count() + \
               StockItem.objects.filter(category=obj).count()
    item_count.short_description = 'Items'


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'contact_person', 'email', 'phone', 'is_active', 'created_at'
    )
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'contact_person', 'email', 'phone')
    list_editable = ('is_active',)
    ordering = ('name',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'contact_person', 'is_active')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'address', 'website')
        }),
    )


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'serial_number', 'status', 'condition',
        'location', 'purchase_price', 'assigned_to'
    )
    list_filter = (
        'category', 'supplier', 'condition', 'status', 'department',
        'purchase_date', 'created_at'
    )
    search_fields = (
        'name', 'description', 'serial_number', 'model', 'brand',
        'location', 'assigned_to'
    )
    list_editable = ('status', 'condition')
    ordering = ('-created_at',)
    date_hierarchy = 'purchase_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'supplier')
        }),
        ('Asset Details', {
            'fields': (
                'serial_number', 'model', 'brand', 'condition', 'status'
            )
        }),
        ('Location', {
            'fields': ('location', 'room_number', 'department')
        }),
        ('Financial Information', {
            'fields': (
                'purchase_price', 'current_value', 'purchase_date',
                'warranty_expiry'
            )
        }),
        ('Maintenance', {
            'fields': (
                'last_maintenance', 'next_maintenance', 'maintenance_notes'
            )
        }),
        ('Assignment', {
            'fields': ('assigned_to', 'assigned_date')
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(StockItem)
class StockItemAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'sku', 'current_stock', 'unit_price',
        'total_value', 'stock_status', 'is_active'
    )
    list_filter = (
        'category', 'supplier', 'is_active', 'created_at'
    )
    search_fields = (
        'name', 'description', 'sku', 'location', 'shelf_number'
    )
    list_editable = ('is_active',)
    ordering = ('name',)
    
    def stock_status(self, obj):
        """Get stock status based on current stock levels"""
        if obj.current_stock <= 0:
            return 'Out of Stock'
        elif obj.current_stock <= obj.minimum_stock:
            return 'Low Stock'
        elif obj.maximum_stock and obj.current_stock >= obj.maximum_stock:
            return 'Overstocked'
        else:
            return 'In Stock'
    stock_status.short_description = 'Stock Status'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'supplier')
        }),
        ('Stock Details', {
            'fields': (
                'sku', 'unit', 'current_stock', 'minimum_stock',
                'maximum_stock'
            )
        }),
        ('Financial Information', {
            'fields': ('unit_price', 'total_value')
        }),
        ('Location', {
            'fields': ('location', 'shelf_number')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = ('total_value', 'created_at', 'updated_at')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'reference_number', 'transaction_type', 'item_name', 'quantity',
        'total_amount', 'transaction_date'
    )
    list_filter = (
        'transaction_type', 'transaction_date', 'created_at'
    )
    search_fields = (
        'reference_number', 'notes', 'from_location', 'to_location'
    )
    ordering = ('-transaction_date',)
    date_hierarchy = 'transaction_date'
    
    def item_name(self, obj):
        """Get the name of the item (asset or stock item)"""
        if obj.asset:
            return obj.asset.name
        elif obj.stock_item:
            return obj.stock_item.name
        return None
    item_name.short_description = 'Item'
    
    fieldsets = (
        ('Transaction Details', {
            'fields': (
                'transaction_type', 'reference_number', 'asset',
                'stock_item', 'quantity'
            )
        }),
        ('Location', {
            'fields': ('from_location', 'to_location')
        }),
        ('Financial Information', {
            'fields': ('unit_price', 'total_amount')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )
    
    readonly_fields = ('total_amount', 'transaction_date', 'created_at')


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'asset', 'maintenance_type', 'performed_by',
        'scheduled_date', 'is_completed', 'cost'
    )
    list_filter = (
        'maintenance_type', 'is_completed', 'scheduled_date', 'created_at'
    )
    search_fields = (
        'title', 'description', 'performed_by', 'asset__name'
    )
    list_editable = ('is_completed',)
    ordering = ('-scheduled_date',)
    date_hierarchy = 'scheduled_date'
    
    fieldsets = (
        ('Maintenance Details', {
            'fields': (
                'asset', 'maintenance_type', 'title', 'description'
            )
        }),
        ('Schedule', {
            'fields': ('scheduled_date', 'completed_date', 'is_completed')
        }),
        ('Performer', {
            'fields': ('performed_by',)
        }),
        ('Cost', {
            'fields': ('cost',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')

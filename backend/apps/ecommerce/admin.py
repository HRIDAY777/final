from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Product, Order, OrderItem, Cart, CartItem


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'sku', 'category', 'price_display', 'stock', 'stock_status',
        'is_active', 'created_at'
    ]
    search_fields = ['name', 'sku', 'category', 'description']
    list_filter = ['category', 'is_active', 'created_at']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'sku', 'category', 'description')
        }),
        (_('Pricing & Inventory'), {
            'fields': ('price', 'stock', 'is_active')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def price_display(self, obj):
        """Display price with currency formatting"""
        return f"${obj.price:.2f}"
    price_display.short_description = _('Price')

    def stock_status(self, obj):
        """Display stock status with color coding"""
        if obj.stock <= 0:
            return format_html('<span style="color: red;">Out of Stock</span>')
        elif obj.stock <= 10:
            return format_html('<span style="color: orange;">Low Stock</span>')
        else:
            return format_html('<span style="color: green;">In Stock</span>')
    stock_status.short_description = _('Stock Status')

    actions = ['activate_products', 'deactivate_products', 'restock_products']

    def activate_products(self, request, queryset):
        """Activate selected products"""
        updated = queryset.update(is_active=True)
        message = (
            f'{updated} product{"s" if updated > 1 else ""} '
            'activated successfully.'
        )
        self.message_user(request, message)
    activate_products.short_description = "Activate selected products"

    def deactivate_products(self, request, queryset):
        """Deactivate selected products"""
        updated = queryset.update(is_active=False)
        message = (
            f'{updated} product{"s" if updated > 1 else ""} '
            'deactivated successfully.'
        )
        self.message_user(request, message)
    deactivate_products.short_description = "Deactivate selected products"

    def restock_products(self, request, queryset):
        """Restock selected products"""
        updated = queryset.update(stock=100)  # Set to 100 as example
        message = (
            f'{updated} product{"s" if updated > 1 else ""} '
            'restocked successfully.'
        )
        self.message_user(request, message)
    restock_products.short_description = "Restock selected products"


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['line_total']
    fields = ['product', 'quantity', 'price', 'line_total']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'customer_email', 'status_display',
        'total_amount_display', 'item_count', 'created_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'customer_email', 'customer_name']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    list_per_page = 25
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('Order Information'), {
            'fields': (
                'order_number', 'customer_name', 'customer_email',
                'customer_phone'
            )
        }),
        (_('Order Details'), {
            'fields': (
                'status', 'total_amount', 'shipping_address', 'billing_address'
            )
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_display(self, obj):
        """Display status with color coding"""
        colors = {
            'pending': 'orange',
            'processing': 'blue',
            'shipped': 'purple',
            'delivered': 'green',
            'cancelled': 'red'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = _('Status')

    def total_amount_display(self, obj):
        """Display total amount with currency formatting"""
        return f"${obj.total_amount:.2f}"
    total_amount_display.short_description = _('Total Amount')

    def item_count(self, obj):
        """Display number of items in order"""
        return obj.orderitem_set.count()
    item_count.short_description = _('Items')

    actions = [
        'mark_as_processing', 'mark_as_shipped', 'mark_as_delivered',
        'cancel_orders'
    ]

    def mark_as_processing(self, request, queryset):
        """Mark selected orders as processing"""
        updated = queryset.filter(status='pending').update(status='processing')
        message = (
            f'{updated} order{"s" if updated > 1 else ""} '
            'marked as processing.'
        )
        self.message_user(request, message)
    mark_as_processing.short_description = "Mark as processing"

    def mark_as_shipped(self, request, queryset):
        """Mark selected orders as shipped"""
        updated = queryset.filter(status='processing').update(status='shipped')
        message = (
            f'{updated} order{"s" if updated > 1 else ""} '
            'marked as shipped.'
        )
        self.message_user(request, message)
    mark_as_shipped.short_description = "Mark as shipped"

    def mark_as_delivered(self, request, queryset):
        """Mark selected orders as delivered"""
        updated = queryset.filter(status='shipped').update(status='delivered')
        message = (
            f'{updated} order{"s" if updated > 1 else ""} '
            'marked as delivered.'
        )
        self.message_user(request, message)
    mark_as_delivered.short_description = "Mark as delivered"

    def cancel_orders(self, request, queryset):
        """Cancel selected orders"""
        updated = queryset.filter(
            status__in=['pending', 'processing']
        ).update(status='cancelled')
        message = (
            f'{updated} order{"s" if updated > 1 else ""} '
            'cancelled successfully.'
        )
        self.message_user(request, message)
    cancel_orders.short_description = "Cancel selected orders"


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['line_total']
    fields = ['product', 'quantity', 'price', 'line_total']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'item_count', 'total_amount_display', 'created_at',
        'updated_at'
    ]
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [CartItemInline]
    list_per_page = 25
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('Cart Information'), {
            'fields': ('user',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def item_count(self, obj):
        """Display number of items in cart"""
        return obj.cartitem_set.count()
    item_count.short_description = _('Items')

    def total_amount_display(self, obj):
        """Display total amount with currency formatting"""
        total = sum(
            item.total_price for item in obj.cartitem_set.all()
        )
        return f"${total:.2f}"
    total_amount_display.short_description = _('Total Amount')

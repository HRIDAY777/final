from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Sum, Q
from django.utils import timezone
from .models import (
    Category, Author, Book, Borrowing, Reservation, Fine, LibrarySettings
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'book_count', 'color_display', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']

    def book_count(self, obj):
        return obj.books.count()
    book_count.short_description = 'Books'

    def color_display(self, obj):
        return format_html(
            '<div style="background-color: {}; width: 20px; height: 20px; border-radius: 3px;"></div>',
            obj.color
        )
    color_display.short_description = 'Color'


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['name', 'book_count', 'email', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'biography', 'email']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']

    def book_count(self, obj):
        return obj.books.count()
    book_count.short_description = 'Books'


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author', 'category', 'status_display', 'copies_display',
        'is_available', 'created_at'
    ]
    list_filter = [
        'status', 'category', 'author', 'language', 'is_active', 'created_at'
    ]
    search_fields = ['title', 'isbn', 'author__name', 'publisher']
    ordering = ['title']
    readonly_fields = ['created_at', 'updated_at', 'borrowed_count']
    filter_horizontal = []
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'isbn', 'author', 'category', 'description')
        }),
        ('Publication Details', {
            'fields': ('publisher', 'publication_date', 'edition', 'pages', 'language')
        }),
        ('Inventory', {
            'fields': ('total_copies', 'available_copies', 'location', 'status', 'price')
        }),
        ('Media', {
            'fields': ('cover_image',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_display(self, obj):
        colors = {
            'available': 'green',
            'borrowed': 'orange',
            'reserved': 'blue',
            'maintenance': 'red',
            'lost': 'black'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'

    def copies_display(self, obj):
        return f"{obj.available_copies}/{obj.total_copies}"
    copies_display.short_description = 'Copies'

    def is_available(self, obj):
        if obj.is_available:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    is_available.short_description = 'Available'


@admin.register(Borrowing)
class BorrowingAdmin(admin.ModelAdmin):
    list_display = [
        'book', 'borrower', 'borrowed_date', 'due_date', 'status_display',
        'is_overdue', 'returned_date'
    ]
    list_filter = [
        'status', 'borrowed_date', 'due_date', 'returned_date', 'book__category'
    ]
    search_fields = [
        'book__title', 'borrower__first_name', 'borrower__last_name',
        'borrower__email'
    ]
    ordering = ['-borrowed_date']
    readonly_fields = ['borrowed_date', 'created_at', 'updated_at', 'days_overdue']
    date_hierarchy = 'borrowed_date'

    fieldsets = (
        ('Book Information', {
            'fields': ('book', 'borrower')
        }),
        ('Dates', {
            'fields': ('borrowed_date', 'due_date', 'returned_date')
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'days_overdue'),
            'classes': ('collapse',)
        }),
    )

    def status_display(self, obj):
        colors = {
            'borrowed': 'blue',
            'returned': 'green',
            'overdue': 'red',
            'lost': 'black'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'

    def is_overdue(self, obj):
        if obj.is_overdue:
            return format_html(
                '<span style="color: red; font-weight: bold;">{} days overdue</span>',
                obj.days_overdue
            )
        return format_html('<span style="color: green;">On time</span>')
    is_overdue.short_description = 'Overdue Status'

    actions = ['mark_as_returned', 'mark_as_lost']

    def mark_as_returned(self, request, queryset):
        for borrowing in queryset:
            if borrowing.status in ['borrowed', 'overdue']:
                borrowing.return_book()
        self.message_user(request, f"Marked {queryset.count()} borrowings as returned")
    mark_as_returned.short_description = "Mark selected borrowings as returned"

    def mark_as_lost(self, request, queryset):
        queryset.update(status='lost')
        self.message_user(request, f"Marked {queryset.count()} borrowings as lost")
    mark_as_lost.short_description = "Mark selected borrowings as lost"


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        'book', 'user', 'reserved_date', 'expiry_date', 'status_display',
        'is_expired'
    ]
    list_filter = ['status', 'reserved_date', 'expiry_date', 'book__category']
    search_fields = [
        'book__title', 'user__first_name', 'user__last_name', 'user__email'
    ]
    ordering = ['-reserved_date']
    readonly_fields = ['reserved_date', 'created_at', 'updated_at']
    date_hierarchy = 'reserved_date'

    def status_display(self, obj):
        colors = {
            'pending': 'orange',
            'fulfilled': 'green',
            'cancelled': 'red',
            'expired': 'gray'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'

    def is_expired(self, obj):
        if obj.is_expired:
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Active</span>')
    is_expired.short_description = 'Expiry Status'

    actions = ['fulfill_reservations', 'cancel_reservations']

    def fulfill_reservations(self, request, queryset):
        queryset.filter(status='pending').update(status='fulfilled')
        self.message_user(request, f"Fulfilled {queryset.count()} reservations")
    fulfill_reservations.short_description = "Fulfill selected reservations"

    def cancel_reservations(self, request, queryset):
        queryset.filter(status='pending').update(status='cancelled')
        self.message_user(request, f"Cancelled {queryset.count()} reservations")
    cancel_reservations.short_description = "Cancel selected reservations"


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = [
        'borrowing', 'amount', 'status_display', 'paid_date', 'waived_by'
    ]
    list_filter = ['status', 'created_at', 'paid_date']
    search_fields = [
        'borrowing__book__title', 'borrowing__borrower__first_name',
        'borrowing__borrower__last_name'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

    def status_display(self, obj):
        colors = {
            'pending': 'orange',
            'paid': 'green',
            'waived': 'blue'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.status, 'black'),
            obj.get_status_display()
        )
    status_display.short_description = 'Status'

    actions = ['mark_as_paid', 'waive_fines']

    def mark_as_paid(self, request, queryset):
        for fine in queryset.filter(status='pending'):
            fine.pay_fine()
        self.message_user(request, f"Marked {queryset.count()} fines as paid")
    mark_as_paid.short_description = "Mark selected fines as paid"

    def waive_fines(self, request, queryset):
        for fine in queryset.filter(status='pending'):
            fine.waive_fine(request.user, "Waived by admin")
        self.message_user(request, f"Waived {queryset.count()} fines")
    waive_fines.short_description = "Waive selected fines"


@admin.register(LibrarySettings)
class LibrarySettingsAdmin(admin.ModelAdmin):
    list_display = [
        'max_books_per_user', 'max_borrow_days', 'max_reservation_days',
        'daily_fine_rate', 'max_fine_amount', 'allow_reservations', 'allow_fines'
    ]
    readonly_fields = ['created_at', 'updated_at']

    def has_add_permission(self, request):
        # Only allow one settings instance
        return not LibrarySettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of settings
        return False

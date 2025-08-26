from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Building, RoomType, Room, RoomAllocation, HostelFee, StudentFee,
    MaintenanceRequest, HostelRule, VisitorLog
)


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ['name', 'total_floors', 'total_rooms', 'occupied_rooms', 'available_rooms', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'address']
    ordering = ['name']
    readonly_fields = ['total_rooms', 'occupied_rooms', 'available_rooms', 'created_at', 'updated_at']


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'capacity', 'base_fee', 'created_at']
    list_filter = ['capacity', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_number', 'building', 'floor', 'room_type', 'status', 'current_capacity', 'available_beds', 'occupancy_rate', 'is_occupied']
    list_filter = ['status', 'is_occupied', 'building', 'room_type', 'floor']
    search_fields = ['room_number', 'building__name', 'description']
    ordering = ['building', 'floor', 'room_number']
    readonly_fields = ['available_beds', 'occupancy_rate', 'created_at', 'updated_at']
    
    def occupancy_rate(self, obj):
        return f"{obj.occupancy_rate:.1f}%"
    occupancy_rate.short_description = 'Occupancy Rate'


@admin.register(RoomAllocation)
class RoomAllocationAdmin(admin.ModelAdmin):
    list_display = ['student', 'room', 'bed_number', 'check_in_date', 'check_out_date', 'status', 'is_active', 'allocated_by']
    list_filter = ['status', 'check_in_date', 'check_out_date', 'room__building']
    search_fields = ['student__full_name', 'room__room_number', 'room__building__name']
    ordering = ['-created_at']
    readonly_fields = ['is_active', 'created_at', 'updated_at']


@admin.register(HostelFee)
class HostelFeeAdmin(admin.ModelAdmin):
    list_display = ['name', 'fee_type', 'amount', 'room_type', 'is_active', 'created_at']
    list_filter = ['fee_type', 'is_active', 'room_type', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at']


@admin.register(StudentFee)
class StudentFeeAdmin(admin.ModelAdmin):
    list_display = ['student', 'fee', 'amount_due', 'amount_paid', 'balance', 'due_date', 'payment_status', 'is_overdue']
    list_filter = ['payment_status', 'due_date', 'fee__fee_type']
    search_fields = ['student__full_name', 'fee__name']
    ordering = ['-due_date']
    readonly_fields = ['balance', 'is_overdue', 'created_at', 'updated_at']
    
    def balance(self, obj):
        return obj.balance
    balance.short_description = 'Balance'
    
    def is_overdue(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red;">Yes</span>')
        return format_html('<span style="color: green;">No</span>')
    is_overdue.short_description = 'Overdue'


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ['title', 'room', 'priority', 'status', 'reported_by', 'assigned_to', 'reported_date']
    list_filter = ['priority', 'status', 'reported_date', 'room__building']
    search_fields = ['title', 'description', 'room__room_number']
    ordering = ['-reported_date']
    readonly_fields = ['reported_date', 'assigned_date', 'completed_date']


@admin.register(HostelRule)
class HostelRuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_active', 'created_by', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'category']
    ordering = ['category', 'title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(VisitorLog)
class VisitorLogAdmin(admin.ModelAdmin):
    list_display = ['visitor_name', 'student', 'purpose', 'entry_time', 'exit_time', 'duration', 'is_inside', 'approved_by']
    list_filter = ['entry_time', 'exit_time']
    search_fields = ['visitor_name', 'student__full_name', 'purpose']
    ordering = ['-entry_time']
    readonly_fields = ['duration', 'is_inside']
    
    def duration(self, obj):
        if obj.duration:
            hours = obj.duration.total_seconds() / 3600
            return f"{hours:.1f} hours"
        return "N/A"
    duration.short_description = 'Duration'
    
    def is_inside(self, obj):
        if obj.is_inside:
            return format_html('<span style="color: orange;">Inside</span>')
        return format_html('<span style="color: green;">Left</span>')
    is_inside.short_description = 'Status'

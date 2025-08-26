from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Vehicle, Driver, Route, Trip, StudentTransport, TripPassenger,
    MaintenanceRecord, FuelRecord, TransportSettings
)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = [
        'vehicle_number', 'registration_number', 'vehicle_type', 'make', 'model',
        'capacity', 'status', 'is_active', 'insurance_status', 'service_status'
    ]
    list_filter = ['vehicle_type', 'fuel_type', 'status', 'is_active', 'year']
    search_fields = ['vehicle_number', 'registration_number', 'make', 'model']
    ordering = ['vehicle_number']
    readonly_fields = ['created_at', 'updated_at']
    
    def insurance_status(self, obj):
        if obj.is_insurance_expired:
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Valid</span>')
    insurance_status.short_description = 'Insurance'
    
    def service_status(self, obj):
        if obj.is_service_due:
            return format_html('<span style="color: red;">Due</span>')
        return format_html('<span style="color: green;">OK</span>')
    service_status.short_description = 'Service'


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = [
        'driver_id', 'full_name', 'gender', 'age', 'phone', 'license_number',
        'license_status', 'status', 'is_active'
    ]
    list_filter = ['gender', 'status', 'is_active', 'license_type']
    search_fields = ['driver_id', 'full_name', 'phone', 'email', 'license_number']
    ordering = ['full_name']
    readonly_fields = ['created_at', 'updated_at']
    
    def license_status(self, obj):
        if obj.is_license_expired:
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Valid</span>')
    license_status.short_description = 'License'


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = [
        'route_number', 'name', 'start_location', 'end_location',
        'distance_km', 'estimated_duration_minutes', 'fare_amount', 'is_active'
    ]
    list_filter = ['is_active']
    search_fields = ['route_number', 'name', 'start_location', 'end_location']
    ordering = ['route_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = [
        'trip_id', 'vehicle', 'driver', 'route', 'trip_type', 'status',
        'scheduled_departure', 'scheduled_arrival', 'total_passengers'
    ]
    list_filter = ['trip_type', 'status', 'scheduled_departure']
    search_fields = ['trip_id', 'start_location', 'end_location']
    ordering = ['-scheduled_departure']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'vehicle', 'driver', 'route'
        )


@admin.register(StudentTransport)
class StudentTransportAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'route', 'pickup_location', 'drop_location',
        'pickup_time', 'drop_time', 'fare_amount', 'is_active'
    ]
    list_filter = ['is_active', 'start_date']
    search_fields = ['student__full_name', 'route__name', 'pickup_location']
    ordering = ['student__full_name']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'route')


@admin.register(TripPassenger)
class TripPassengerAdmin(admin.ModelAdmin):
    list_display = [
        'trip', 'student', 'pickup_location', 'drop_location',
        'status', 'fare_paid', 'pickup_time', 'drop_time'
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['trip__trip_id', 'student__full_name']
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('trip', 'student')


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = [
        'vehicle', 'maintenance_type', 'service_date', 'next_service_date',
        'mileage_at_service', 'cost', 'service_provider'
    ]
    list_filter = ['maintenance_type', 'service_date']
    search_fields = ['vehicle__vehicle_number', 'description', 'service_provider']
    ordering = ['-service_date']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('vehicle', 'performed_by')


@admin.register(FuelRecord)
class FuelRecordAdmin(admin.ModelAdmin):
    list_display = [
        'vehicle', 'fuel_date', 'fuel_type', 'quantity_liters',
        'cost_per_liter', 'total_cost', 'mileage_at_fuel', 'fuel_station'
    ]
    list_filter = ['fuel_type', 'fuel_date']
    search_fields = ['vehicle__vehicle_number', 'fuel_station']
    ordering = ['-fuel_date']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('vehicle')


@admin.register(TransportSettings)
class TransportSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'school', 'default_fare_amount', 'max_trip_delay_minutes',
        'auto_assign_routes', 'require_driver_approval'
    ]
    list_filter = ['auto_assign_routes', 'require_driver_approval', 'notify_parents_on_delay']
    search_fields = ['school__name']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('school')

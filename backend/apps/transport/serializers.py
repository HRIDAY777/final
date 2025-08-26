from rest_framework import serializers
from .models import (
    Vehicle, Driver, Route, Trip, StudentTransport, TripPassenger,
    MaintenanceRecord, FuelRecord, TransportSettings
)
from apps.students.serializers import StudentSerializer


class VehicleSerializer(serializers.ModelSerializer):
    is_insurance_expired = serializers.ReadOnlyField()
    is_permit_expired = serializers.ReadOnlyField()
    is_fitness_expired = serializers.ReadOnlyField()
    is_puc_expired = serializers.ReadOnlyField()
    is_service_due = serializers.ReadOnlyField()
    
    class Meta:
        model = Vehicle
        fields = '__all__'


class DriverSerializer(serializers.ModelSerializer):
    is_license_expired = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Driver
        fields = '__all__'


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'


class TripSerializer(serializers.ModelSerializer):
    is_delayed = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    driver_name = serializers.CharField(source='driver.full_name', read_only=True)
    route_name = serializers.CharField(source='route.name', read_only=True)
    
    class Meta:
        model = Trip
        fields = '__all__'


class StudentTransportSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    route_name = serializers.CharField(source='route.name', read_only=True)
    
    class Meta:
        model = StudentTransport
        fields = '__all__'


class TripPassengerSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    trip_id = serializers.CharField(source='trip.trip_id', read_only=True)
    
    class Meta:
        model = TripPassenger
        fields = '__all__'


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'


class FuelRecordSerializer(serializers.ModelSerializer):
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    
    class Meta:
        model = FuelRecord
        fields = '__all__'


class TransportSettingsSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    
    class Meta:
        model = TransportSettings
        fields = '__all__'


# Detailed serializers for complex views
class VehicleDetailSerializer(serializers.ModelSerializer):
    trips = TripSerializer(many=True, read_only=True)
    maintenance_records = MaintenanceRecordSerializer(many=True, read_only=True)
    fuel_records = FuelRecordSerializer(many=True, read_only=True)
    is_insurance_expired = serializers.ReadOnlyField()
    is_permit_expired = serializers.ReadOnlyField()
    is_fitness_expired = serializers.ReadOnlyField()
    is_puc_expired = serializers.ReadOnlyField()
    is_service_due = serializers.ReadOnlyField()
    
    class Meta:
        model = Vehicle
        fields = '__all__'


class DriverDetailSerializer(serializers.ModelSerializer):
    trips = TripSerializer(many=True, read_only=True)
    is_license_expired = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Driver
        fields = '__all__'


class RouteDetailSerializer(serializers.ModelSerializer):
    trips = TripSerializer(many=True, read_only=True)
    student_assignments = StudentTransportSerializer(many=True, read_only=True)
    
    class Meta:
        model = Route
        fields = '__all__'


class TripDetailSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(read_only=True)
    driver = DriverSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    passengers = TripPassengerSerializer(many=True, read_only=True)
    is_delayed = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = Trip
        fields = '__all__'


class TransportDashboardSerializer(serializers.Serializer):
    total_vehicles = serializers.IntegerField()
    active_vehicles = serializers.IntegerField()
    total_drivers = serializers.IntegerField()
    active_drivers = serializers.IntegerField()
    total_routes = serializers.IntegerField()
    active_routes = serializers.IntegerField()
    total_trips_today = serializers.IntegerField()
    completed_trips_today = serializers.IntegerField()
    delayed_trips_today = serializers.IntegerField()
    vehicles_needing_service = serializers.IntegerField()
    drivers_with_expired_license = serializers.IntegerField()
    recent_trips = TripSerializer(many=True)
    upcoming_trips = TripSerializer(many=True)


class TripStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Trip.STATUS_CHOICES)
    actual_departure = serializers.DateTimeField(required=False)
    actual_arrival = serializers.DateTimeField(required=False)
    distance_covered = serializers.DecimalField(max_digits=6, decimal_places=2, required=False)
    fuel_consumed = serializers.DecimalField(max_digits=6, decimal_places=2, required=False)
    total_fare_collected = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    expenses = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    notes = serializers.CharField(required=False)


class PassengerStatusUpdateSerializer(serializers.Serializer):
    passenger_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=TripPassenger._meta.get_field('status').choices)
    pickup_time = serializers.DateTimeField(required=False)
    drop_time = serializers.DateTimeField(required=False)
    fare_paid = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    notes = serializers.CharField(required=False)


class BulkTripCreateSerializer(serializers.Serializer):
    route_id = serializers.IntegerField()
    vehicle_id = serializers.IntegerField()
    driver_id = serializers.IntegerField()
    trip_type = serializers.ChoiceField(choices=Trip.TRIP_TYPES)
    scheduled_departure = serializers.DateTimeField()
    scheduled_arrival = serializers.DateTimeField()
    start_location = serializers.CharField()
    end_location = serializers.CharField()
    max_capacity = serializers.IntegerField()
    notes = serializers.CharField(required=False)


class TransportReportSerializer(serializers.Serializer):
    report_type = serializers.ChoiceField(choices=[
        ('vehicle_utilization', 'Vehicle Utilization'),
        ('driver_performance', 'Driver Performance'),
        ('route_analysis', 'Route Analysis'),
        ('fuel_consumption', 'Fuel Consumption'),
        ('maintenance_costs', 'Maintenance Costs'),
        ('revenue_analysis', 'Revenue Analysis'),
    ])
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    vehicle_id = serializers.IntegerField(required=False)
    driver_id = serializers.IntegerField(required=False)
    route_id = serializers.IntegerField(required=False)
    format = serializers.ChoiceField(choices=['pdf', 'excel', 'csv'], default='pdf')

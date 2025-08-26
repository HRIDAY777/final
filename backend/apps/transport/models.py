from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.students.models import Student
from apps.tenants.models import Tenant

User = get_user_model()


class Vehicle(models.Model):
    """Transport vehicles (buses, vans, etc.)"""
    VEHICLE_TYPES = [
        ('bus', 'Bus'),
        ('van', 'Van'),
        ('car', 'Car'),
        ('minibus', 'Mini Bus'),
        ('truck', 'Truck'),
        ('other', 'Other'),
    ]
    
    FUEL_TYPES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
        ('cng', 'CNG'),
        ('lpg', 'LPG'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('maintenance', 'Under Maintenance'),
        ('inactive', 'Inactive'),
        ('retired', 'Retired'),
    ]
    
    vehicle_number = models.CharField(max_length=20, unique=True)
    registration_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPES, default='bus')
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    capacity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPES, default='diesel')
    fuel_efficiency = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # km/l
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    purchase_date = models.DateField()
    insurance_expiry = models.DateField()
    permit_expiry = models.DateField()
    fitness_expiry = models.DateField()
    puc_expiry = models.DateField()
    current_mileage = models.PositiveIntegerField(default=0)
    last_service_date = models.DateField(null=True, blank=True)
    next_service_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    features = models.JSONField(default=dict, blank=True)  # GPS, AC, etc.
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['vehicle_number']
    
    def __str__(self):
        return f"{self.vehicle_number} - {self.make} {self.model}"
    
    @property
    def is_insurance_expired(self):
        return self.insurance_expiry < timezone.now().date()
    
    @property
    def is_permit_expired(self):
        return self.permit_expiry < timezone.now().date()
    
    @property
    def is_fitness_expired(self):
        return self.fitness_expiry < timezone.now().date()
    
    @property
    def is_puc_expired(self):
        return self.puc_expiry < timezone.now().date()
    
    @property
    def is_service_due(self):
        if self.next_service_date:
            return self.next_service_date <= timezone.now().date()
        return False


class Driver(models.Model):
    """Transport drivers"""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('retired', 'Retired'),
    ]
    
    driver_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=200)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='India')
    
    # License Information
    license_number = models.CharField(max_length=20, unique=True)
    license_type = models.CharField(max_length=50)
    license_issued_date = models.DateField()
    license_expiry_date = models.DateField()
    
    # Employment Information
    joining_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    experience_years = models.PositiveIntegerField(default=0)
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(max_length=20)
    emergency_contact_relation = models.CharField(max_length=50)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['full_name']
    
    def __str__(self):
        return f"{self.driver_id} - {self.full_name}"
    
    @property
    def is_license_expired(self):
        return self.license_expiry_date < timezone.now().date()
    
    @property
    def age(self):
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))


class Route(models.Model):
    """Transport routes"""
    route_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_location = models.CharField(max_length=200)
    end_location = models.CharField(max_length=200)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    estimated_duration_minutes = models.PositiveIntegerField()
    stops = models.JSONField(default=list)  # List of stop locations
    fare_amount = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['route_number']
    
    def __str__(self):
        return f"{self.route_number} - {self.name}"


class Trip(models.Model):
    """Individual transport trips"""
    TRIP_TYPES = [
        ('pickup', 'Pickup'),
        ('drop', 'Drop'),
        ('round_trip', 'Round Trip'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('delayed', 'Delayed'),
    ]
    
    trip_id = models.CharField(max_length=20, unique=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='trips')
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='trips')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='trips')
    trip_type = models.CharField(max_length=20, choices=TRIP_TYPES, default='round_trip')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Schedule
    scheduled_departure = models.DateTimeField()
    scheduled_arrival = models.DateTimeField()
    actual_departure = models.DateTimeField(null=True, blank=True)
    actual_arrival = models.DateTimeField(null=True, blank=True)
    
    # Trip Details
    start_location = models.CharField(max_length=200)
    end_location = models.CharField(max_length=200)
    distance_covered = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    fuel_consumed = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    
    # Passengers
    total_passengers = models.PositiveIntegerField(default=0)
    max_capacity = models.PositiveIntegerField()
    
    # Financial
    total_fare_collected = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-scheduled_departure']
    
    def __str__(self):
        return f"{self.trip_id} - {self.route.name} ({self.scheduled_departure.strftime('%Y-%m-%d %H:%M')})"
    
    @property
    def is_delayed(self):
        if self.actual_departure and self.scheduled_departure:
            return self.actual_departure > self.scheduled_departure
        return False
    
    @property
    def duration_minutes(self):
        if self.actual_departure and self.actual_arrival:
            return (self.actual_arrival - self.actual_departure).total_seconds() / 60
        return None


class StudentTransport(models.Model):
    """Student transport assignments"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='transport_assignments')
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='student_assignments')
    pickup_location = models.CharField(max_length=200)
    drop_location = models.CharField(max_length=200)
    pickup_time = models.TimeField()
    drop_time = models.TimeField()
    fare_amount = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'route']
        ordering = ['student__user__first_name', 'student__user__last_name']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.route.name}"


class TripPassenger(models.Model):
    """Passengers on trips"""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='passengers')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='trip_passengers')
    pickup_location = models.CharField(max_length=200)
    drop_location = models.CharField(max_length=200)
    fare_paid = models.DecimalField(max_digits=8, decimal_places=2)
    pickup_time = models.DateTimeField(null=True, blank=True)
    drop_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('picked_up', 'Picked Up'),
        ('dropped', 'Dropped'),
        ('absent', 'Absent'),
    ], default='scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['trip', 'student']
        ordering = ['trip', 'student__user__first_name', 'student__user__last_name']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.trip.trip_id}"


class MaintenanceRecord(models.Model):
    """Vehicle maintenance records"""
    MAINTENANCE_TYPES = [
        ('routine', 'Routine Service'),
        ('repair', 'Repair'),
        ('emergency', 'Emergency'),
        ('inspection', 'Inspection'),
    ]
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenance_records')
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPES)
    description = models.TextField()
    service_date = models.DateField()
    next_service_date = models.DateField(null=True, blank=True)
    mileage_at_service = models.PositiveIntegerField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    service_provider = models.CharField(max_length=200)
    parts_replaced = models.JSONField(default=list, blank=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-service_date']
    
    def __str__(self):
        return f"{self.vehicle.vehicle_number} - {self.maintenance_type} ({self.service_date})"


class FuelRecord(models.Model):
    """Vehicle fuel records"""
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='fuel_records')
    fuel_date = models.DateField()
    fuel_type = models.CharField(max_length=20, choices=Vehicle.FUEL_TYPES)
    quantity_liters = models.DecimalField(max_digits=8, decimal_places=2)
    cost_per_liter = models.DecimalField(max_digits=6, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    mileage_at_fuel = models.PositiveIntegerField()
    fuel_station = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fuel_date']
    
    def __str__(self):
        return f"{self.vehicle.vehicle_number} - {self.fuel_type} ({self.fuel_date})"


class TransportSettings(models.Model):
    """Global transport settings"""
    school = models.OneToOneField(Tenant, on_delete=models.CASCADE)
    default_fare_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_trip_delay_minutes = models.PositiveIntegerField(default=15)
    auto_assign_routes = models.BooleanField(default=False)
    require_driver_approval = models.BooleanField(default=True)
    notify_parents_on_delay = models.BooleanField(default=True)
    maintenance_reminder_days = models.PositiveIntegerField(default=7)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Transport Settings - {self.school.name}"

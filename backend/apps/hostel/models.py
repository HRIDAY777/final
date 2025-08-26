from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.students.models import Student
from apps.tenants.models import Tenant

User = get_user_model()

class Building(models.Model):
    """Hostel building model"""
    name = models.CharField(max_length=100)
    address = models.TextField()
    total_floors = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='hostel_buildings')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def total_rooms(self):
        return self.rooms.count()

    @property
    def occupied_rooms(self):
        return self.rooms.filter(is_occupied=True).count()

    @property
    def available_rooms(self):
        return self.rooms.filter(is_occupied=False).count()

class RoomType(models.Model):
    """Room type model (Single, Double, Triple, etc.)"""
    name = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    base_fee = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='hostel_room_types')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.capacity} beds)"

class Room(models.Model):
    """Individual room model"""
    ROOM_STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Under Maintenance'),
        ('reserved', 'Reserved'),
    ]

    room_number = models.CharField(max_length=20)
    floor = models.PositiveIntegerField()
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='rooms')
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name='rooms')
    status = models.CharField(max_length=20, choices=ROOM_STATUS_CHOICES, default='available')
    is_occupied = models.BooleanField(default=False)
    current_capacity = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)
    amenities = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='hostel_rooms')

    class Meta:
        ordering = ['building', 'floor', 'room_number']
        unique_together = ['building', 'room_number', 'tenant']

    def __str__(self):
        return f"{self.building.name} - Room {self.room_number}"

    @property
    def available_beds(self):
        return self.room_type.capacity - self.current_capacity

    @property
    def occupancy_rate(self):
        if self.room_type.capacity == 0:
            return 0
        return (self.current_capacity / self.room_type.capacity) * 100

class RoomAllocation(models.Model):
    """Student room allocation model"""
    ALLOCATION_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='room_allocations')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='allocations')
    bed_number = models.PositiveIntegerField()
    check_in_date = models.DateField()
    check_out_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ALLOCATION_STATUS_CHOICES, default='active')
    allocated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='allocations_made')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='hostel_allocations')

    class Meta:
        ordering = ['-created_at']
        unique_together = ['room', 'bed_number', 'tenant']

    def __str__(self):
        return f"{self.student.full_name} - {self.room} (Bed {self.bed_number})"

    @property
    def is_active(self):
        return self.status == 'active' and (not self.check_out_date or self.check_out_date > timezone.now().date())

class HostelFee(models.Model):
    """Hostel fee structure model"""
    FEE_TYPE_CHOICES = [
        ('monthly', 'Monthly'),
        ('semester', 'Semester'),
        ('annual', 'Annual'),
        ('one_time', 'One Time'),
    ]

    name = models.CharField(max_length=100)
    fee_type = models.CharField(max_length=20, choices=FEE_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name='fees')
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='hostel_fees')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.room_type.name}"

class StudentFee(models.Model):
    """Individual student fee record"""
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('partial', 'Partially Paid'),
        ('overdue', 'Overdue'),
        ('waived', 'Waived'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='hostel_fees')
    fee = models.ForeignKey(HostelFee, on_delete=models.CASCADE, related_name='student_fees')
    allocation = models.ForeignKey(RoomAllocation, on_delete=models.CASCADE, related_name='fees')
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField()
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='student_hostel_fees')

    class Meta:
        ordering = ['-due_date']

    def __str__(self):
        return f"{self.student.full_name} - {self.fee.name}"

    @property
    def balance(self):
        return self.amount_due - self.amount_paid

    @property
    def is_overdue(self):
        return self.due_date < timezone.now().date() and self.payment_status != 'paid'

class MaintenanceRequest(models.Model):
    """Maintenance request model"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='maintenance_requests')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenance_reports')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_maintenance')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    reported_date = models.DateTimeField(auto_now_add=True)
    assigned_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='hostel_maintenance_requests')

    class Meta:
        ordering = ['-reported_date']

    def __str__(self):
        return f"{self.title} - {self.room}"

class HostelRule(models.Model):
    """Hostel rules and regulations"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='hostel_rules')

    class Meta:
        ordering = ['category', 'title']

    def __str__(self):
        return self.title

class VisitorLog(models.Model):
    """Visitor entry/exit log"""
    visitor_name = models.CharField(max_length=100)
    visitor_phone = models.CharField(max_length=20)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='visitors')
    purpose = models.TextField()
    entry_time = models.DateTimeField()
    exit_time = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='visitor_approvals')
    notes = models.TextField(blank=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='hostel_visitors')

    class Meta:
        ordering = ['-entry_time']

    def __str__(self):
        return f"{self.visitor_name} visiting {self.student.full_name}"

    @property
    def duration(self):
        if self.exit_time:
            return self.exit_time - self.entry_time
        return None

    @property
    def is_inside(self):
        return self.exit_time is None

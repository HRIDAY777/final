from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid

User = get_user_model()


class Department(models.Model):
    """Department model for organizational structure"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name=_('Department Name'))
    code = models.CharField(max_length=10, unique=True, verbose_name=_('Department Code'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    head = models.ForeignKey(
        'Employee', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='headed_departments',
        verbose_name=_('Department Head')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Department')
        verbose_name_plural = _('Departments')
        ordering = ['name']

    def __str__(self):
        return self.name


class Position(models.Model):
    """Position/Job Title model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100, verbose_name=_('Position Title'))
    code = models.CharField(max_length=20, unique=True, verbose_name=_('Position Code'))
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE, 
        related_name='positions',
        verbose_name=_('Department')
    )
    description = models.TextField(blank=True, verbose_name=_('Description'))
    base_salary = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name=_('Base Salary')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Position')
        verbose_name_plural = _('Positions')
        ordering = ['title']

    def __str__(self):
        return f"{self.title} - {self.department.name}"


class Employee(models.Model):
    """Employee model for staff management"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True, verbose_name=_('Employee ID'))
    employee_number = models.CharField(max_length=20, unique=True, verbose_name=_('Employee Number'))
    
    # Personal Information
    first_name = models.CharField(max_length=50, verbose_name=_('First Name'))
    last_name = models.CharField(max_length=50, verbose_name=_('Last Name'))
    middle_name = models.CharField(max_length=50, blank=True, verbose_name=_('Middle Name'))
    date_of_birth = models.DateField(verbose_name=_('Date of Birth'))
    gender = models.CharField(
        max_length=1, 
        choices=[('M', _('Male')), ('F', _('Female')), ('O', _('Other'))], 
        verbose_name=_('Gender')
    )
    blood_group = models.CharField(max_length=5, blank=True, verbose_name=_('Blood Group'))
    email = models.EmailField(unique=True, verbose_name=_('Email'))
    phone = models.CharField(max_length=15, verbose_name=_('Phone'))
    
    # Address Information
    address = models.TextField(verbose_name=_('Address'))
    city = models.CharField(max_length=50, verbose_name=_('City'))
    state = models.CharField(max_length=50, verbose_name=_('State'))
    postal_code = models.CharField(max_length=10, verbose_name=_('Postal Code'))
    country = models.CharField(max_length=50, default='Bangladesh', verbose_name=_('Country'))
    
    # Employment Details
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE, 
        related_name='employees',
        verbose_name=_('Department')
    )
    position = models.ForeignKey(
        Position, 
        on_delete=models.CASCADE, 
        related_name='employees',
        verbose_name=_('Position')
    )
    joining_date = models.DateField(verbose_name=_('Joining Date'))
    employment_type = models.CharField(
        max_length=20,
        choices=[
            ('full_time', _('Full Time')),
            ('part_time', _('Part Time')),
            ('contract', _('Contract')),
            ('temporary', _('Temporary')),
            ('intern', _('Intern')),
        ],
        default='full_time',
        verbose_name=_('Employment Type')
    )
    contract_end_date = models.DateField(null=True, blank=True, verbose_name=_('Contract End Date'))
    
    # Salary Information
    basic_salary = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name=_('Basic Salary')
    )
    house_rent_allowance = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        verbose_name=_('House Rent Allowance')
    )
    medical_allowance = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        verbose_name=_('Medical Allowance')
    )
    transport_allowance = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        verbose_name=_('Transport Allowance')
    )
    other_allowances = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        verbose_name=_('Other Allowances')
    )
    
    # Status and Settings
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', _('Active')),
            ('inactive', _('Inactive')),
            ('suspended', _('Suspended')),
            ('resigned', _('Resigned')),
            ('retired', _('Retired')),
            ('terminated', _('Terminated')),
        ],
        default='active',
        verbose_name=_('Status')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=100, blank=True, verbose_name=_('Emergency Contact Name'))
    emergency_contact_phone = models.CharField(max_length=15, blank=True, verbose_name=_('Emergency Contact Phone'))
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, verbose_name=_('Relationship'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Employee')
        verbose_name_plural = _('Employees')
        ordering = ['first_name', 'last_name']
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['employee_number']),
            models.Index(fields=['status']),
            models.Index(fields=['department']),
            models.Index(fields=['employment_type']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.employee_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def total_salary(self):
        return (
            self.basic_salary + 
            self.house_rent_allowance + 
            self.medical_allowance + 
            self.transport_allowance + 
            self.other_allowances
        )

    @property
    def years_of_service(self):
        if self.joining_date:
            return (timezone.now().date() - self.joining_date).days // 365
        return 0


class Payroll(models.Model):
    """Payroll model for salary processing"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='payrolls',
        verbose_name=_('Employee')
    )
    month = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)], 
        verbose_name=_('Month')
    )
    year = models.PositiveIntegerField(verbose_name=_('Year'))
    
    # Earnings
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Basic Salary'))
    house_rent_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('House Rent Allowance'))
    medical_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Medical Allowance'))
    transport_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Transport Allowance'))
    other_allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Other Allowances'))
    overtime_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Overtime Pay'))
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Bonus'))
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Gross Salary'))
    
    # Deductions
    provident_fund = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Provident Fund'))
    tax_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Tax Deduction'))
    insurance = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Insurance'))
    loan_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Loan Deduction'))
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Other Deductions'))
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Total Deductions'))
    
    # Net salary
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Net Salary'))
    
    # Payment status
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('paid', _('Paid')),
            ('partial', _('Partial')),
            ('cancelled', _('Cancelled')),
        ],
        default='pending',
        verbose_name=_('Payment Status')
    )
    payment_date = models.DateField(null=True, blank=True, verbose_name=_('Payment Date'))
    payment_method = models.CharField(max_length=50, blank=True, verbose_name=_('Payment Method'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Payroll')
        verbose_name_plural = _('Payrolls')
        unique_together = ['employee', 'month', 'year']
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.employee.full_name} - {self.month}/{self.year}"

    def save(self, *args, **kwargs):
        # Calculate gross salary
        self.gross_salary = (
            self.basic_salary + 
            self.house_rent_allowance + 
            self.medical_allowance + 
            self.transport_allowance + 
            self.other_allowances +
            self.overtime_pay +
            self.bonus
        )
        
        # Calculate total deductions
        self.total_deductions = (
            self.provident_fund + 
            self.tax_deduction + 
            self.insurance +
            self.loan_deduction +
            self.other_deductions
        )
        
        # Calculate net salary
        self.net_salary = self.gross_salary - self.total_deductions
        
        super().save(*args, **kwargs)


class Leave(models.Model):
    """Leave model for employee leave management"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='leaves',
        verbose_name=_('Employee')
    )
    leave_type = models.CharField(
        max_length=20,
        choices=[
            ('casual', _('Casual Leave')),
            ('sick', _('Sick Leave')),
            ('annual', _('Annual Leave')),
            ('maternity', _('Maternity Leave')),
            ('paternity', _('Paternity Leave')),
            ('study', _('Study Leave')),
            ('bereavement', _('Bereavement Leave')),
            ('other', _('Other')),
        ],
        verbose_name=_('Leave Type')
    )
    start_date = models.DateField(verbose_name=_('Start Date'))
    end_date = models.DateField(verbose_name=_('End Date'))
    total_days = models.PositiveIntegerField(verbose_name=_('Total Days'))
    reason = models.TextField(verbose_name=_('Reason'))
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('approved', _('Approved')),
            ('rejected', _('Rejected')),
            ('cancelled', _('Cancelled')),
        ],
        default='pending',
        verbose_name=_('Status')
    )
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='approved_leaves',
        verbose_name=_('Approved By')
    )
    approved_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Approved Date'))
    rejection_reason = models.TextField(blank=True, verbose_name=_('Rejection Reason'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Leave')
        verbose_name_plural = _('Leaves')
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type} ({self.start_date} to {self.end_date})"

    @property
    def is_approved(self):
        return self.status == 'approved'

    @property
    def is_pending(self):
        return self.status == 'pending'


class EmployeeAttendance(models.Model):
    """Employee attendance model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='attendance_records',
        verbose_name=_('Employee')
    )
    date = models.DateField(verbose_name=_('Date'))
    status = models.CharField(
        max_length=20,
        choices=[
            ('present', _('Present')),
            ('absent', _('Absent')),
            ('late', _('Late')),
            ('half_day', _('Half Day')),
            ('leave', _('On Leave')),
            ('holiday', _('Holiday')),
        ],
        default='present',
        verbose_name=_('Status')
    )
    check_in_time = models.TimeField(null=True, blank=True, verbose_name=_('Check In Time'))
    check_out_time = models.TimeField(null=True, blank=True, verbose_name=_('Check Out Time'))
    working_hours = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name=_('Working Hours')
    )
    overtime_hours = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        default=0, 
        verbose_name=_('Overtime Hours')
    )
    remarks = models.TextField(blank=True, verbose_name=_('Remarks'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Employee Attendance')
        verbose_name_plural = _('Employee Attendance')
        unique_together = ['employee', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.status})"


class Performance(models.Model):
    """Employee performance evaluation model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='performance_records',
        verbose_name=_('Employee')
    )
    evaluation_period = models.CharField(max_length=20, verbose_name=_('Evaluation Period'))
    evaluation_date = models.DateField(verbose_name=_('Evaluation Date'))
    
    # Performance metrics (1-5 scale)
    job_knowledge = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('Job Knowledge')
    )
    quality_of_work = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('Quality of Work')
    )
    quantity_of_work = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('Quantity of Work')
    )
    teamwork = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('Teamwork')
    )
    communication = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('Communication')
    )
    initiative = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('Initiative')
    )
    attendance = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name=_('Attendance')
    )
    
    # Overall rating
    overall_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        verbose_name=_('Overall Rating')
    )
    
    # Comments
    strengths = models.TextField(blank=True, verbose_name=_('Strengths'))
    areas_for_improvement = models.TextField(blank=True, verbose_name=_('Areas for Improvement'))
    goals = models.TextField(blank=True, verbose_name=_('Goals'))
    comments = models.TextField(blank=True, verbose_name=_('Comments'))
    
    # Evaluator
    evaluated_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='conducted_evaluations',
        verbose_name=_('Evaluated By')
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Performance')
        verbose_name_plural = _('Performance Evaluations')
        ordering = ['-evaluation_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.evaluation_period} ({self.overall_rating})"

    def save(self, *args, **kwargs):
        # Calculate overall rating
        ratings = [
            self.job_knowledge,
            self.quality_of_work,
            self.quantity_of_work,
            self.teamwork,
            self.communication,
            self.initiative,
            self.attendance
        ]
        self.overall_rating = sum(ratings) / len(ratings)
        super().save(*args, **kwargs)


class Document(models.Model):
    """Employee document model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='documents',
        verbose_name=_('Employee')
    )
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('id_proof', _('ID Proof')),
            ('address_proof', _('Address Proof')),
            ('educational_certificate', _('Educational Certificate')),
            ('experience_certificate', _('Experience Certificate')),
            ('contract', _('Employment Contract')),
            ('salary_slip', _('Salary Slip')),
            ('other', _('Other')),
        ],
        verbose_name=_('Document Type')
    )
    title = models.CharField(max_length=200, verbose_name=_('Document Title'))
    file = models.FileField(upload_to='employee_documents/', verbose_name=_('File'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    is_verified = models.BooleanField(default=False, verbose_name=_('Is Verified'))
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='verified_documents',
        verbose_name=_('Verified By')
    )
    verified_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Verified Date'))
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Document')
        verbose_name_plural = _('Documents')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"

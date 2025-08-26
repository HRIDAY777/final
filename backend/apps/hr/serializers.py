from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Department, Position, Employee, Payroll, Leave, 
    EmployeeAttendance, Performance, Document
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """User serializer for employee creation"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']


class DepartmentSerializer(serializers.ModelSerializer):
    """Department serializer"""
    employee_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_count(self, obj):
        return obj.employees.count()


class PositionSerializer(serializers.ModelSerializer):
    """Position serializer"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    employee_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Position
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_count(self, obj):
        return obj.employees.count()


class EmployeeListSerializer(serializers.ModelSerializer):
    """Employee list serializer for listing employees"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_title = serializers.CharField(source='position.title', read_only=True)
    full_name = serializers.CharField(source='full_name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'employee_number', 'full_name', 'email', 'phone',
            'department_name', 'position_title', 'employment_type', 'status',
            'joining_date', 'is_active', 'created_at'
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    """Employee detail serializer"""
    department = DepartmentSerializer(read_only=True)
    position = PositionSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    payrolls = 'PayrollSerializer(many=True, read_only=True)'
    leaves = 'LeaveSerializer(many=True, read_only=True)'
    attendance_records = 'EmployeeAttendanceSerializer(many=True, read_only=True)'
    performance_records = 'PerformanceSerializer(many=True, read_only=True)'
    documents = 'DocumentSerializer(many=True, read_only=True)'
    
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Employee create serializer with user creation"""
    user = UserSerializer()
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = Employee
        fields = [
            'user', 'password', 'employee_id', 'employee_number', 'first_name',
            'last_name', 'middle_name', 'date_of_birth', 'gender', 'blood_group',
            'email', 'phone', 'address', 'city', 'state', 'postal_code', 'country',
            'department', 'position', 'joining_date', 'employment_type',
            'contract_end_date', 'basic_salary', 'house_rent_allowance',
            'medical_allowance', 'transport_allowance', 'other_allowances',
            'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relationship', 'status', 'is_active'
        ]
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(
            username=user_data.get('username'),
            email=user_data.get('email'),
            password=password,
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', ''),
            is_active=user_data.get('is_active', True)
        )
        
        # Create employee
        employee = Employee.objects.create(user=user, **validated_data)
        return employee
    
    def validate_employee_id(self, value):
        """Validate unique employee ID"""
        if Employee.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("Employee ID already exists.")
        return value
    
    def validate_employee_number(self, value):
        """Validate unique employee number"""
        if Employee.objects.filter(employee_number=value).exists():
            raise serializers.ValidationError("Employee number already exists.")
        return value


class PayrollSerializer(serializers.ModelSerializer):
    """Payroll serializer"""
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    
    class Meta:
        model = Payroll
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class PayrollCreateSerializer(serializers.ModelSerializer):
    """Payroll create serializer"""
    class Meta:
        model = Payroll
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Validate payroll data"""
        employee = data.get('employee')
        month = data.get('month')
        year = data.get('year')
        
        # Check if payroll already exists for this employee and month/year
        if Payroll.objects.filter(employee=employee, month=month, year=year).exists():
            raise serializers.ValidationError(
                f"Payroll already exists for {employee.full_name} for {month}/{year}"
            )
        
        return data


class LeaveSerializer(serializers.ModelSerializer):
    """Leave serializer"""
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class LeaveCreateSerializer(serializers.ModelSerializer):
    """Leave create serializer"""
    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Validate leave data"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("Start date cannot be after end date.")
        
        return data


class EmployeeAttendanceSerializer(serializers.ModelSerializer):
    """Employee attendance serializer"""
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    
    class Meta:
        model = EmployeeAttendance
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class EmployeeAttendanceCreateSerializer(serializers.ModelSerializer):
    """Employee attendance create serializer"""
    class Meta:
        model = EmployeeAttendance
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Validate attendance data"""
        employee = data.get('employee')
        date = data.get('date')
        
        # Check if attendance already exists for this employee and date
        if EmployeeAttendance.objects.filter(employee=employee, date=date).exists():
            raise serializers.ValidationError(
                f"Attendance record already exists for {employee.full_name} on {date}"
            )
        
        return data


class PerformanceSerializer(serializers.ModelSerializer):
    """Performance serializer"""
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    evaluated_by_name = serializers.CharField(source='evaluated_by.get_full_name', read_only=True)
    
    class Meta:
        model = Performance
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class PerformanceCreateSerializer(serializers.ModelSerializer):
    """Performance create serializer"""
    class Meta:
        model = Performance
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    """Document serializer"""
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class DocumentCreateSerializer(serializers.ModelSerializer):
    """Document create serializer"""
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


# Dashboard and Analytics Serializers
class HRDashboardSerializer(serializers.Serializer):
    """HR Dashboard data serializer"""
    total_employees = serializers.IntegerField()
    active_employees = serializers.IntegerField()
    departments_count = serializers.IntegerField()
    positions_count = serializers.IntegerField()
    pending_leaves = serializers.IntegerField()
    this_month_payroll = serializers.DecimalField(max_digits=10, decimal_places=2)
    attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    recent_activities = serializers.ListField()


class PayrollSummarySerializer(serializers.Serializer):
    """Payroll summary serializer"""
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    total_employees = serializers.IntegerField()
    total_gross_salary = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_net_salary = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_deductions = serializers.DecimalField(max_digits=12, decimal_places=2)
    paid_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()


class LeaveSummarySerializer(serializers.Serializer):
    """Leave summary serializer"""
    leave_type = serializers.CharField()
    count = serializers.IntegerField()
    total_days = serializers.IntegerField()


class AttendanceSummarySerializer(serializers.Serializer):
    """Attendance summary serializer"""
    date = serializers.DateField()
    present_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()
    late_count = serializers.IntegerField()
    leave_count = serializers.IntegerField()
    attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)

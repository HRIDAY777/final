from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import (
    Department, Position, Employee, Payroll, Leave, 
    EmployeeAttendance, Performance, Document
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'employee_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25

    def employee_count(self, obj):
        return obj.employees.count()
    employee_count.short_description = _('Employee Count')


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'code', 'department', 'base_salary', 'employee_count', 'is_active']
    list_filter = ['department', 'is_active', 'created_at']
    search_fields = ['title', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25

    def employee_count(self, obj):
        return obj.employees.count()
    employee_count.short_description = _('Employee Count')


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = [
        'employee_id', 'full_name', 'department', 'position', 'employment_type',
        'status', 'joining_date', 'is_active'
    ]
    list_filter = [
        'status', 'gender', 'employment_type', 'department', 'is_active',
        'joining_date', 'created_at'
    ]
    search_fields = [
        'employee_id', 'employee_number', 'first_name', 'last_name',
        'middle_name', 'email', 'phone'
    ]
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['user', 'department', 'position']

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('user', 'employee_id', 'employee_number', 'first_name', 'last_name', 'middle_name')
        }),
        (_('Personal Information'), {
            'fields': ('date_of_birth', 'gender', 'blood_group', 'email', 'phone')
        }),
        (_('Address'), {
            'fields': ('address', 'city', 'state', 'postal_code', 'country')
        }),
        (_('Employment Details'), {
            'fields': ('department', 'position', 'joining_date', 'employment_type', 'contract_end_date')
        }),
        (_('Salary Information'), {
            'fields': ('basic_salary', 'house_rent_allowance', 'medical_allowance', 'transport_allowance', 'other_allowances')
        }),
        (_('Emergency Contact'), {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
        (_('Status'), {
            'fields': ('status', 'is_active')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = _('Full Name')
    full_name.admin_order_field = 'first_name'


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'month', 'year', 'gross_salary', 'net_salary',
        'payment_status', 'payment_date'
    ]
    list_filter = ['payment_status', 'month', 'year', 'created_at']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['employee']

    fieldsets = (
        (_('Employee Information'), {
            'fields': ('employee', 'month', 'year')
        }),
        (_('Earnings'), {
            'fields': ('basic_salary', 'house_rent_allowance', 'medical_allowance', 'transport_allowance', 'other_allowances', 'overtime_pay', 'bonus', 'gross_salary')
        }),
        (_('Deductions'), {
            'fields': ('provident_fund', 'tax_deduction', 'insurance', 'loan_deduction', 'other_deductions', 'total_deductions')
        }),
        (_('Net Salary'), {
            'fields': ('net_salary',)
        }),
        (_('Payment Information'), {
            'fields': ('payment_status', 'payment_date', 'payment_method')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'leave_type', 'start_date', 'end_date', 'total_days',
        'status', 'approved_by'
    ]
    list_filter = ['leave_type', 'status', 'start_date', 'created_at']
    search_fields = ['employee__first_name', 'employee__last_name', 'reason']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['employee', 'approved_by']

    fieldsets = (
        (_('Employee Information'), {
            'fields': ('employee',)
        }),
        (_('Leave Details'), {
            'fields': ('leave_type', 'start_date', 'end_date', 'total_days', 'reason')
        }),
        (_('Approval'), {
            'fields': ('status', 'approved_by', 'approved_date', 'rejection_reason')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EmployeeAttendance)
class EmployeeAttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'date', 'status', 'check_in_time', 'check_out_time',
        'working_hours'
    ]
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['employee__first_name', 'employee__last_name']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['employee']

    fieldsets = (
        (_('Employee Information'), {
            'fields': ('employee', 'date')
        }),
        (_('Attendance Details'), {
            'fields': ('status', 'check_in_time', 'check_out_time', 'working_hours', 'overtime_hours')
        }),
        (_('Additional Information'), {
            'fields': ('remarks',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'evaluation_period', 'evaluation_date', 'overall_rating',
        'evaluated_by'
    ]
    list_filter = ['evaluation_period', 'evaluation_date', 'created_at']
    search_fields = ['employee__first_name', 'employee__last_name']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['employee', 'evaluated_by']

    fieldsets = (
        (_('Employee Information'), {
            'fields': ('employee', 'evaluation_period', 'evaluation_date')
        }),
        (_('Performance Metrics'), {
            'fields': ('job_knowledge', 'quality_of_work', 'quantity_of_work', 'teamwork', 'communication', 'initiative', 'attendance', 'overall_rating')
        }),
        (_('Comments'), {
            'fields': ('strengths', 'areas_for_improvement', 'goals', 'comments')
        }),
        (_('Evaluator'), {
            'fields': ('evaluated_by',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'document_type', 'title', 'is_verified', 'verified_by'
    ]
    list_filter = ['document_type', 'is_verified', 'created_at']
    search_fields = ['employee__first_name', 'employee__last_name', 'title']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    list_select_related = ['employee', 'verified_by']

    fieldsets = (
        (_('Employee Information'), {
            'fields': ('employee',)
        }),
        (_('Document Details'), {
            'fields': ('document_type', 'title', 'file', 'description')
        }),
        (_('Verification'), {
            'fields': ('is_verified', 'verified_by', 'verified_date')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

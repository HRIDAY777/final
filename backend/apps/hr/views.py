from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    Department, Position, Employee, Payroll, Leave, 
    EmployeeAttendance, Performance, Document
)
from .serializers import (
    DepartmentSerializer, PositionSerializer, EmployeeListSerializer,
    EmployeeDetailSerializer, EmployeeCreateSerializer, PayrollSerializer,
    PayrollCreateSerializer, LeaveSerializer, LeaveCreateSerializer,
    EmployeeAttendanceSerializer, EmployeeAttendanceCreateSerializer,
    PerformanceSerializer, PerformanceCreateSerializer, DocumentSerializer,
    DocumentCreateSerializer, HRDashboardSerializer, PayrollSummarySerializer,
    LeaveSummarySerializer, AttendanceSummarySerializer
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """Department management ViewSet"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return DepartmentSerializer
        return DepartmentSerializer


class PositionViewSet(viewsets.ModelViewSet):
    """Position management ViewSet"""
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'is_active']
    search_fields = ['title', 'code', 'description']
    ordering_fields = ['title', 'base_salary', 'created_at']
    ordering = ['title']

    def get_serializer_class(self):
        if self.action == 'list':
            return PositionSerializer
        return PositionSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    """Employee management ViewSet"""
    queryset = Employee.objects.all()
    serializer_class = EmployeeListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'position', 'employment_type', 'status', 'is_active']
    search_fields = ['employee_id', 'employee_number', 'first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['first_name', 'last_name', 'joining_date', 'created_at']
    ordering = ['first_name', 'last_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action == 'create':
            return EmployeeCreateSerializer
        elif self.action == 'retrieve':
            return EmployeeDetailSerializer
        return EmployeeListSerializer

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate an employee"""
        employee = self.get_object()
        employee.is_active = True
        employee.status = 'active'
        employee.save()
        return Response({'status': 'activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an employee"""
        employee = self.get_object()
        employee.is_active = False
        employee.status = 'inactive'
        employee.save()
        return Response({'status': 'deactivated'})

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get employee dashboard statistics"""
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(is_active=True).count()
        departments_count = Department.objects.filter(is_active=True).count()
        positions_count = Position.objects.filter(is_active=True).count()
        
        # Recent hires (last 30 days)
        recent_hires = Employee.objects.filter(
            joining_date__gte=timezone.now().date() - timedelta(days=30)
        ).count()
        
        # Department distribution
        dept_distribution = Department.objects.annotate(
            employee_count=Count('employees')
        ).values('name', 'employee_count')
        
        return Response({
            'total_employees': total_employees,
            'active_employees': active_employees,
            'departments_count': departments_count,
            'positions_count': positions_count,
            'recent_hires': recent_hires,
            'department_distribution': dept_distribution
        })


class PayrollViewSet(viewsets.ModelViewSet):
    """Payroll management ViewSet"""
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'payment_status', 'month', 'year']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    ordering_fields = ['month', 'year', 'payment_date', 'created_at']
    ordering = ['-year', '-month']

    def get_serializer_class(self):
        if self.action == 'create':
            return PayrollCreateSerializer
        return PayrollSerializer

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark payroll as paid"""
        payroll = self.get_object()
        payroll.payment_status = 'paid'
        payroll.payment_date = timezone.now().date()
        payroll.payment_method = request.data.get('payment_method', '')
        payroll.save()
        return Response({'status': 'paid'})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get payroll summary"""
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)
        
        payrolls = Payroll.objects.filter(month=month, year=year)
        
        summary = {
            'month': int(month),
            'year': int(year),
            'total_employees': payrolls.count(),
            'total_gross_salary': payrolls.aggregate(Sum('gross_salary'))['gross_salary__sum'] or 0,
            'total_net_salary': payrolls.aggregate(Sum('net_salary'))['net_salary__sum'] or 0,
            'total_deductions': payrolls.aggregate(Sum('total_deductions'))['total_deductions__sum'] or 0,
            'paid_count': payrolls.filter(payment_status='paid').count(),
            'pending_count': payrolls.filter(payment_status='pending').count(),
        }
        
        serializer = PayrollSummarySerializer(summary)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_generate(self, request):
        """Bulk generate payroll for all employees"""
        month = request.data.get('month', timezone.now().month)
        year = request.data.get('year', timezone.now().year)
        
        employees = Employee.objects.filter(is_active=True)
        created_count = 0
        
        for employee in employees:
            # Check if payroll already exists
            if not Payroll.objects.filter(employee=employee, month=month, year=year).exists():
                Payroll.objects.create(
                    employee=employee,
                    month=month,
                    year=year,
                    basic_salary=employee.basic_salary,
                    house_rent_allowance=employee.house_rent_allowance,
                    medical_allowance=employee.medical_allowance,
                    transport_allowance=employee.transport_allowance,
                    other_allowances=employee.other_allowances,
                    gross_salary=employee.total_salary,
                    net_salary=employee.total_salary,
                    payment_status='pending'
                )
                created_count += 1
        
        return Response({
            'message': f'Generated payroll for {created_count} employees',
            'created_count': created_count
        })


class LeaveViewSet(viewsets.ModelViewSet):
    """Leave management ViewSet"""
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'leave_type', 'status']
    search_fields = ['employee__first_name', 'employee__last_name', 'reason']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

    def get_serializer_class(self):
        if self.action == 'create':
            return LeaveCreateSerializer
        return LeaveSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve leave request"""
        leave = self.get_object()
        leave.status = 'approved'
        leave.approved_by = request.user
        leave.approved_date = timezone.now()
        leave.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject leave request"""
        leave = self.get_object()
        leave.status = 'rejected'
        leave.rejection_reason = request.data.get('reason', '')
        leave.save()
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get leave summary"""
        leaves = Leave.objects.filter(status='approved')
        
        summary = leaves.values('leave_type').annotate(
            count=Count('id'),
            total_days=Sum('total_days')
        )
        
        serializer = LeaveSummarySerializer(summary, many=True)
        return Response(serializer.data)


class EmployeeAttendanceViewSet(viewsets.ModelViewSet):
    """Employee attendance management ViewSet"""
    queryset = EmployeeAttendance.objects.all()
    serializer_class = EmployeeAttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'status', 'date']
    search_fields = ['employee__first_name', 'employee__last_name']
    ordering_fields = ['date', 'check_in_time', 'created_at']
    ordering = ['-date']

    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeAttendanceCreateSerializer
        return EmployeeAttendanceSerializer

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get attendance summary"""
        date = request.query_params.get('date', timezone.now().date())
        
        attendance = EmployeeAttendance.objects.filter(date=date)
        
        summary = {
            'date': date,
            'present_count': attendance.filter(status='present').count(),
            'absent_count': attendance.filter(status='absent').count(),
            'late_count': attendance.filter(status='late').count(),
            'leave_count': attendance.filter(status='leave').count(),
            'total_employees': attendance.count(),
        }
        
        if summary['total_employees'] > 0:
            summary['attendance_rate'] = (
                (summary['present_count'] + summary['late_count']) / 
                summary['total_employees'] * 100
            )
        else:
            summary['attendance_rate'] = 0
        
        serializer = AttendanceSummarySerializer(summary)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Bulk mark attendance"""
        date = request.data.get('date', timezone.now().date())
        attendance_data = request.data.get('attendance', [])
        
        created_count = 0
        updated_count = 0
        
        for record in attendance_data:
            employee_id = record.get('employee_id')
            status = record.get('status', 'present')
            check_in_time = record.get('check_in_time')
            check_out_time = record.get('check_out_time')
            remarks = record.get('remarks', '')
            
            try:
                employee = Employee.objects.get(id=employee_id)
                attendance, created = EmployeeAttendance.objects.get_or_create(
                    employee=employee,
                    date=date,
                    defaults={
                        'status': status,
                        'check_in_time': check_in_time,
                        'check_out_time': check_out_time,
                        'remarks': remarks
                    }
                )
                
                if created:
                    created_count += 1
                else:
                    attendance.status = status
                    attendance.check_in_time = check_in_time
                    attendance.check_out_time = check_out_time
                    attendance.remarks = remarks
                    attendance.save()
                    updated_count += 1
                    
            except Employee.DoesNotExist:
                continue
        
        return Response({
            'message': f'Marked attendance for {created_count + updated_count} employees',
            'created_count': created_count,
            'updated_count': updated_count
        })


class PerformanceViewSet(viewsets.ModelViewSet):
    """Performance evaluation ViewSet"""
    queryset = Performance.objects.all()
    serializer_class = PerformanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'evaluation_period']
    search_fields = ['employee__first_name', 'employee__last_name']
    ordering_fields = ['evaluation_date', 'overall_rating', 'created_at']
    ordering = ['-evaluation_date']

    def get_serializer_class(self):
        if self.action == 'create':
            return PerformanceCreateSerializer
        return PerformanceSerializer

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get performance summary"""
        performances = Performance.objects.all()
        
        summary = {
            'total_evaluations': performances.count(),
            'average_rating': performances.aggregate(Avg('overall_rating'))['overall_rating__avg'] or 0,
            'top_performers': performances.filter(overall_rating__gte=4.5).count(),
            'needs_improvement': performances.filter(overall_rating__lt=3.0).count(),
        }
        
        return Response(summary)


class DocumentViewSet(viewsets.ModelViewSet):
    """Document management ViewSet"""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'document_type', 'is_verified']
    search_fields = ['title', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['created_at', 'verified_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentCreateSerializer
        return DocumentSerializer

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify document"""
        document = self.get_object()
        document.is_verified = True
        document.verified_by = request.user
        document.verified_date = timezone.now()
        document.save()
        return Response({'status': 'verified'})


class HRDashboardViewSet(viewsets.ViewSet):
    """HR Dashboard ViewSet"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get HR dashboard statistics"""
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(is_active=True).count()
        departments_count = Department.objects.filter(is_active=True).count()
        positions_count = Position.objects.filter(is_active=True).count()
        pending_leaves = Leave.objects.filter(status='pending').count()
        
        # This month's payroll
        current_month = timezone.now().month
        current_year = timezone.now().year
        this_month_payroll = Payroll.objects.filter(
            month=current_month, 
            year=current_year
        ).aggregate(Sum('net_salary'))['net_salary__sum'] or 0
        
        # Attendance rate for today
        today = timezone.now().date()
        today_attendance = EmployeeAttendance.objects.filter(date=today)
        total_today = today_attendance.count()
        present_today = today_attendance.filter(status='present').count()
        attendance_rate = (present_today / total_today * 100) if total_today > 0 else 0
        
        # Recent activities
        recent_activities = []
        
        # Recent hires
        recent_hires = Employee.objects.filter(
            joining_date__gte=timezone.now().date() - timedelta(days=30)
        )[:5]
        for hire in recent_hires:
            recent_activities.append({
                'type': 'new_employee',
                'message': f'{hire.full_name} joined as {hire.position.title}',
                'date': hire.joining_date
            })
        
        # Recent leave requests
        recent_leaves = Leave.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        )[:5]
        for leave in recent_leaves:
            recent_activities.append({
                'type': 'leave_request',
                'message': f'{leave.employee.full_name} requested {leave.leave_type} leave',
                'date': leave.created_at.date()
            })
        
        # Recent payroll payments
        recent_payrolls = Payroll.objects.filter(
            payment_status='paid',
            payment_date__gte=timezone.now().date() - timedelta(days=30)
        )[:5]
        for payroll in recent_payrolls:
            recent_activities.append({
                'type': 'payroll_paid',
                'message': f'Payroll paid to {payroll.employee.full_name}',
                'date': payroll.payment_date
            })
        
        # Sort activities by date
        recent_activities.sort(key=lambda x: x['date'], reverse=True)
        
        dashboard_data = {
            'total_employees': total_employees,
            'active_employees': active_employees,
            'departments_count': departments_count,
            'positions_count': positions_count,
            'pending_leaves': pending_leaves,
            'this_month_payroll': this_month_payroll,
            'attendance_rate': round(attendance_rate, 2),
            'recent_activities': recent_activities[:10]
        }
        
        serializer = HRDashboardSerializer(dashboard_data)
        return Response(serializer.data)

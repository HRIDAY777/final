from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta

from .models import (
    Building, RoomType, Room, RoomAllocation, HostelFee, StudentFee,
    MaintenanceRequest, HostelRule, VisitorLog
)
from .serializers import (
    BuildingSerializer, BuildingDetailSerializer, RoomTypeSerializer,
    RoomSerializer, RoomDetailSerializer, RoomAllocationSerializer,
    RoomAllocationDetailSerializer, HostelFeeSerializer, StudentFeeSerializer,
    StudentFeeDetailSerializer, MaintenanceRequestSerializer,
    MaintenanceRequestDetailSerializer, HostelRuleSerializer,
    VisitorLogSerializer, VisitorLogDetailSerializer,
    HostelDashboardSerializer, RoomStatusUpdateSerializer,
    AllocationStatusUpdateSerializer, FeePaymentSerializer,
    BulkRoomAllocationSerializer, HostelReportSerializer
)


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Building.objects.filter(tenant=self.request.user.tenant)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BuildingDetailSerializer
        return BuildingSerializer

    @action(detail=True, methods=['get'])
    def rooms(self, request, pk=None):
        building = self.get_object()
        rooms = building.rooms.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def occupancy_stats(self, request, pk=None):
        building = self.get_object()
        stats = {
            'total_rooms': building.total_rooms,
            'occupied_rooms': building.occupied_rooms,
            'available_rooms': building.available_rooms,
            'occupancy_rate': (building.occupied_rooms / building.total_rooms * 100) if building.total_rooms > 0 else 0
        }
        return Response(stats)


class RoomTypeViewSet(viewsets.ModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RoomType.objects.filter(tenant=self.request.user.tenant)


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Room.objects.filter(tenant=self.request.user.tenant).select_related('building', 'room_type')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RoomDetailSerializer
        return RoomSerializer

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        room = self.get_object()
        serializer = RoomStatusUpdateSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def allocations(self, request, pk=None):
        room = self.get_object()
        allocations = room.allocations.filter(status='active')
        serializer = RoomAllocationSerializer(allocations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def maintenance_requests(self, request, pk=None):
        room = self.get_object()
        requests = room.maintenance_requests.all()
        serializer = MaintenanceRequestSerializer(requests, many=True)
        return Response(serializer.data)


class RoomAllocationViewSet(viewsets.ModelViewSet):
    queryset = RoomAllocation.objects.all()
    serializer_class = RoomAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RoomAllocation.objects.filter(tenant=self.request.user.tenant).select_related('student', 'room', 'allocated_by')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RoomAllocationDetailSerializer
        return RoomAllocationSerializer

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        allocation = self.get_object()
        serializer = AllocationStatusUpdateSerializer(allocation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def bulk_allocate(self, request):
        serializer = BulkRoomAllocationSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            room = Room.objects.get(id=data['room_id'])
            allocations = []
            
            for student_id in data['student_ids']:
                allocation = RoomAllocation.objects.create(
                    student_id=student_id,
                    room=room,
                    bed_number=room.current_capacity + 1,
                    check_in_date=data['check_in_date'],
                    allocated_by=request.user,
                    notes=data.get('notes', ''),
                    tenant=request.user.tenant
                )
                allocations.append(allocation)
                room.current_capacity += 1
                room.is_occupied = room.current_capacity >= room.room_type.capacity
                room.save()
            
            return Response(RoomAllocationSerializer(allocations, many=True).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HostelFeeViewSet(viewsets.ModelViewSet):
    queryset = HostelFee.objects.all()
    serializer_class = HostelFeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HostelFee.objects.filter(tenant=self.request.user.tenant).select_related('room_type')


class StudentFeeViewSet(viewsets.ModelViewSet):
    queryset = StudentFee.objects.all()
    serializer_class = StudentFeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudentFee.objects.filter(tenant=self.request.user.tenant).select_related('student', 'fee', 'allocation')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StudentFeeDetailSerializer
        return StudentFeeSerializer

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        student_fee = self.get_object()
        serializer = FeePaymentSerializer(data=request.data)
        if serializer.is_valid():
            payment_amount = serializer.validated_data['payment_amount']
            student_fee.amount_paid += payment_amount
            
            if student_fee.amount_paid >= student_fee.amount_due:
                student_fee.payment_status = 'paid'
            elif student_fee.amount_paid > 0:
                student_fee.payment_status = 'partial'
            
            student_fee.notes = serializer.validated_data.get('notes', '')
            student_fee.save()
            
            return Response(StudentFeeSerializer(student_fee).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MaintenanceRequest.objects.filter(tenant=self.request.user.tenant).select_related('room', 'reported_by', 'assigned_to')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MaintenanceRequestDetailSerializer
        return MaintenanceRequestSerializer

    @action(detail=True, methods=['patch'])
    def assign(self, request, pk=None):
        maintenance_request = self.get_object()
        assigned_to_id = request.data.get('assigned_to')
        if assigned_to_id:
            maintenance_request.assigned_to_id = assigned_to_id
            maintenance_request.status = 'assigned'
            maintenance_request.assigned_date = timezone.now()
            maintenance_request.save()
            return Response(MaintenanceRequestSerializer(maintenance_request).data)
        return Response({'error': 'assigned_to is required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        maintenance_request = self.get_object()
        actual_cost = request.data.get('actual_cost')
        maintenance_request.status = 'completed'
        maintenance_request.completed_date = timezone.now()
        if actual_cost:
            maintenance_request.actual_cost = actual_cost
        maintenance_request.save()
        return Response(MaintenanceRequestSerializer(maintenance_request).data)


class HostelRuleViewSet(viewsets.ModelViewSet):
    queryset = HostelRule.objects.all()
    serializer_class = HostelRuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HostelRule.objects.filter(tenant=self.request.user.tenant)


class VisitorLogViewSet(viewsets.ModelViewSet):
    queryset = VisitorLog.objects.all()
    serializer_class = VisitorLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VisitorLog.objects.filter(tenant=self.request.user.tenant).select_related('student', 'approved_by')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VisitorLogDetailSerializer
        return VisitorLogSerializer

    @action(detail=True, methods=['patch'])
    def record_exit(self, request, pk=None):
        visitor_log = self.get_object()
        if visitor_log.exit_time is None:
            visitor_log.exit_time = timezone.now()
            visitor_log.save()
            return Response(VisitorLogSerializer(visitor_log).data)
        return Response({'error': 'Exit already recorded'}, status=status.HTTP_400_BAD_REQUEST)


class HostelDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        tenant = request.user.tenant
        today = timezone.now().date()
        
        stats = {
            'total_buildings': Building.objects.filter(tenant=tenant).count(),
            'total_rooms': Room.objects.filter(tenant=tenant).count(),
            'occupied_rooms': Room.objects.filter(tenant=tenant, is_occupied=True).count(),
            'available_rooms': Room.objects.filter(tenant=tenant, is_occupied=False).count(),
            'total_students': RoomAllocation.objects.filter(tenant=tenant, status='active').count(),
            'pending_maintenance': MaintenanceRequest.objects.filter(tenant=tenant, status='pending').count(),
            'overdue_fees': StudentFee.objects.filter(tenant=tenant, due_date__lt=today, payment_status__in=['pending', 'partial']).count(),
            'today_visitors': VisitorLog.objects.filter(tenant=tenant, entry_time__date=today).count(),
        }
        
        serializer = HostelDashboardSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def reports(self, request):
        tenant = request.user.tenant
        today = timezone.now().date()
        
        # Occupancy report
        occupancy_report = {
            'total_rooms': Room.objects.filter(tenant=tenant).count(),
            'occupied_rooms': Room.objects.filter(tenant=tenant, is_occupied=True).count(),
            'available_rooms': Room.objects.filter(tenant=tenant, is_occupied=False).count(),
            'maintenance_rooms': Room.objects.filter(tenant=tenant, status='maintenance').count(),
        }
        
        # Fee collection report
        fee_collection_report = {
            'total_due': StudentFee.objects.filter(tenant=tenant, payment_status__in=['pending', 'partial']).aggregate(total=Sum('amount_due'))['total'] or 0,
            'total_collected': StudentFee.objects.filter(tenant=tenant, payment_status='paid').aggregate(total=Sum('amount_paid'))['total'] or 0,
            'overdue_count': StudentFee.objects.filter(tenant=tenant, due_date__lt=today, payment_status__in=['pending', 'partial']).count(),
        }
        
        # Maintenance report
        maintenance_report = {
            'pending': MaintenanceRequest.objects.filter(tenant=tenant, status='pending').count(),
            'in_progress': MaintenanceRequest.objects.filter(tenant=tenant, status='in_progress').count(),
            'completed_today': MaintenanceRequest.objects.filter(tenant=tenant, status='completed', completed_date__date=today).count(),
        }
        
        # Visitor report
        visitor_report = {
            'today_visitors': VisitorLog.objects.filter(tenant=tenant, entry_time__date=today).count(),
            'currently_inside': VisitorLog.objects.filter(tenant=tenant, exit_time__isnull=True).count(),
            'weekly_visitors': VisitorLog.objects.filter(tenant=tenant, entry_time__gte=today - timedelta(days=7)).count(),
        }
        
        report_data = {
            'occupancy_report': occupancy_report,
            'fee_collection_report': fee_collection_report,
            'maintenance_report': maintenance_report,
            'visitor_report': visitor_report,
        }
        
        serializer = HostelReportSerializer(report_data)
        return Response(serializer.data)

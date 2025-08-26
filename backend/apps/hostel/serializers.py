from rest_framework import serializers
from .models import (
    Building, RoomType, Room, RoomAllocation, HostelFee, StudentFee,
    MaintenanceRequest, HostelRule, VisitorLog
)
from apps.students.serializers import StudentSerializer


class BuildingSerializer(serializers.ModelSerializer):
    total_rooms = serializers.ReadOnlyField()
    occupied_rooms = serializers.ReadOnlyField()
    available_rooms = serializers.ReadOnlyField()

    class Meta:
        model = Building
        fields = '__all__'


class BuildingDetailSerializer(BuildingSerializer):
    rooms = serializers.SerializerMethodField()

    def get_rooms(self, obj):
        from .serializers import RoomSerializer
        return RoomSerializer(obj.rooms.all(), many=True).data


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.name', read_only=True)
    room_type_name = serializers.CharField(source='room_type.name', read_only=True)
    available_beds = serializers.ReadOnlyField()
    occupancy_rate = serializers.ReadOnlyField()

    class Meta:
        model = Room
        fields = '__all__'


class RoomDetailSerializer(RoomSerializer):
    allocations = serializers.SerializerMethodField()
    maintenance_requests = serializers.SerializerMethodField()

    def get_allocations(self, obj):
        from .serializers import RoomAllocationSerializer
        return RoomAllocationSerializer(
            obj.allocations.filter(status='active'), many=True
        ).data

    def get_maintenance_requests(self, obj):
        from .serializers import MaintenanceRequestSerializer
        return MaintenanceRequestSerializer(
            obj.maintenance_requests.filter(status__in=['pending', 'assigned', 'in_progress']), 
            many=True
        ).data


class RoomAllocationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    building_name = serializers.CharField(source='room.building.name', read_only=True)
    allocated_by_name = serializers.CharField(source='allocated_by.get_full_name', read_only=True)
    is_active = serializers.ReadOnlyField()

    class Meta:
        model = RoomAllocation
        fields = '__all__'


class RoomAllocationDetailSerializer(RoomAllocationSerializer):
    student = StudentSerializer(read_only=True)
    room = RoomDetailSerializer(read_only=True)


class HostelFeeSerializer(serializers.ModelSerializer):
    room_type_name = serializers.CharField(source='room_type.name', read_only=True)

    class Meta:
        model = HostelFee
        fields = '__all__'


class StudentFeeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    fee_name = serializers.CharField(source='fee.name', read_only=True)
    balance = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = StudentFee
        fields = '__all__'


class StudentFeeDetailSerializer(StudentFeeSerializer):
    student = StudentSerializer(read_only=True)
    fee = HostelFeeSerializer(read_only=True)
    allocation = RoomAllocationSerializer(read_only=True)


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    building_name = serializers.CharField(source='room.building.name', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = '__all__'


class MaintenanceRequestDetailSerializer(MaintenanceRequestSerializer):
    room = RoomSerializer(read_only=True)


class HostelRuleSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = HostelRule
        fields = '__all__'


class VisitorLogSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    duration = serializers.ReadOnlyField()
    is_inside = serializers.ReadOnlyField()

    class Meta:
        model = VisitorLog
        fields = '__all__'


class VisitorLogDetailSerializer(VisitorLogSerializer):
    student = StudentSerializer(read_only=True)


# Dashboard and specialized serializers
class HostelDashboardSerializer(serializers.Serializer):
    total_buildings = serializers.IntegerField()
    total_rooms = serializers.IntegerField()
    occupied_rooms = serializers.IntegerField()
    available_rooms = serializers.IntegerField()
    total_students = serializers.IntegerField()
    pending_maintenance = serializers.IntegerField()
    overdue_fees = serializers.IntegerField()
    today_visitors = serializers.IntegerField()


class RoomStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['status', 'is_occupied', 'current_capacity']


class AllocationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomAllocation
        fields = ['status', 'check_out_date']


class FeePaymentSerializer(serializers.ModelSerializer):
    payment_amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = StudentFee
        fields = ['payment_amount', 'notes']


class BulkRoomAllocationSerializer(serializers.Serializer):
    student_ids = serializers.ListField(child=serializers.IntegerField())
    room_id = serializers.IntegerField()
    check_in_date = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True)


class HostelReportSerializer(serializers.Serializer):
    occupancy_report = serializers.DictField()
    fee_collection_report = serializers.DictField()
    maintenance_report = serializers.DictField()
    visitor_report = serializers.DictField()

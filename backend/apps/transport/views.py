from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, F, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta, date

from .models import (
    Vehicle, Driver, Route, Trip, StudentTransport, TripPassenger,
    MaintenanceRecord, FuelRecord, TransportSettings
)
from .serializers import (
    VehicleSerializer, DriverSerializer, RouteSerializer, TripSerializer,
    StudentTransportSerializer, TripPassengerSerializer, MaintenanceRecordSerializer,
    FuelRecordSerializer, TransportSettingsSerializer, VehicleDetailSerializer,
    DriverDetailSerializer, RouteDetailSerializer, TripDetailSerializer,
    TransportDashboardSerializer, TripStatusUpdateSerializer,
    PassengerStatusUpdateSerializer, BulkTripCreateSerializer,
    TransportReportSerializer
)


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle_type', 'fuel_type', 'status', 'is_active']
    search_fields = ['vehicle_number', 'registration_number', 'make', 'model']
    ordering_fields = ['vehicle_number', 'year', 'capacity', 'current_mileage']
    ordering = ['vehicle_number']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VehicleDetailSerializer
        return VehicleSerializer

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available vehicles for trips"""
        date = request.query_params.get('date')
        if not date:
            return Response(
                {'error': 'date parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get vehicles that are not assigned to trips on the specified date
        assigned_vehicles = Trip.objects.filter(
            scheduled_departure__date=date
        ).values_list('vehicle_id', flat=True)
        
        available_vehicles = self.queryset.filter(
            status='active',
            is_active=True
        ).exclude(id__in=assigned_vehicles)
        
        serializer = self.get_serializer(available_vehicles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def needing_service(self, request):
        """Get vehicles needing service"""
        vehicles = self.queryset.filter(
            is_active=True
        ).filter(
            Q(next_service_date__lte=timezone.now().date()) |
            Q(next_service_date__isnull=True)
        )
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_documents(self, request):
        """Get vehicles with expiring documents"""
        days = int(request.query_params.get('days', 30))
        future_date = timezone.now().date() + timedelta(days=days)
        
        vehicles = self.queryset.filter(
            is_active=True
        ).filter(
            Q(insurance_expiry__lte=future_date) |
            Q(permit_expiry__lte=future_date) |
            Q(fitness_expiry__lte=future_date) |
            Q(puc_expiry__lte=future_date)
        )
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update vehicle status"""
        vehicle = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Vehicle.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        vehicle.status = new_status
        vehicle.save()
        
        serializer = self.get_serializer(vehicle)
        return Response(serializer.data)


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'status', 'is_active']
    search_fields = ['driver_id', 'full_name', 'phone', 'email', 'license_number']
    ordering_fields = ['full_name', 'joining_date', 'experience_years']
    ordering = ['full_name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DriverDetailSerializer
        return DriverSerializer

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available drivers for trips"""
        date = request.query_params.get('date')
        if not date:
            return Response(
                {'error': 'date parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get drivers that are not assigned to trips on the specified date
        assigned_drivers = Trip.objects.filter(
            scheduled_departure__date=date
        ).values_list('driver_id', flat=True)
        
        available_drivers = self.queryset.filter(
            status='active',
            is_active=True
        ).exclude(id__in=assigned_drivers)
        
        serializer = self.get_serializer(available_drivers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_licenses(self, request):
        """Get drivers with expiring licenses"""
        days = int(request.query_params.get('days', 30))
        future_date = timezone.now().date() + timedelta(days=days)
        
        drivers = self.queryset.filter(
            is_active=True,
            license_expiry_date__lte=future_date
        )
        serializer = self.get_serializer(drivers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update driver status"""
        driver = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Driver.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        driver.status = new_status
        driver.save()
        
        serializer = self.get_serializer(driver)
        return Response(serializer.data)


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['route_number', 'name', 'start_location', 'end_location']
    ordering_fields = ['route_number', 'name', 'distance_km']
    ordering = ['route_number']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RouteDetailSerializer
        return RouteSerializer

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get students assigned to a route"""
        route = self.get_object()
        assignments = route.student_assignments.filter(is_active=True)
        serializer = StudentTransportSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def trips(self, request, pk=None):
        """Get trips for a route"""
        route = self.get_object()
        trips = route.trips.all()
        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle', 'driver', 'route', 'trip_type', 'status']
    search_fields = ['trip_id', 'start_location', 'end_location']
    ordering_fields = ['scheduled_departure', 'scheduled_arrival', 'created_at']
    ordering = ['-scheduled_departure']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TripDetailSerializer
        return TripSerializer

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's trips"""
        today = timezone.now().date()
        trips = self.queryset.filter(scheduled_departure__date=today)
        serializer = self.get_serializer(trips, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming trips"""
        days = int(request.query_params.get('days', 7))
        future_date = timezone.now().date() + timedelta(days=days)
        
        trips = self.queryset.filter(
            scheduled_departure__date__gte=timezone.now().date(),
            scheduled_departure__date__lte=future_date
        )
        serializer = self.get_serializer(trips, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def delayed(self, request):
        """Get delayed trips"""
        trips = self.queryset.filter(
            status='delayed'
        ).filter(
            scheduled_departure__date=timezone.now().date()
        )
        serializer = self.get_serializer(trips, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update trip status"""
        trip = self.get_object()
        serializer = TripStatusUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        for field, value in data.items():
            setattr(trip, field, value)
        
        trip.save()
        
        response_serializer = self.get_serializer(trip)
        return Response(response_serializer.data)

    @action(detail=True, methods=['post'])
    def add_passenger(self, request, pk=None):
        """Add passenger to trip"""
        trip = self.get_object()
        student_id = request.data.get('student_id')
        pickup_location = request.data.get('pickup_location')
        drop_location = request.data.get('drop_location')
        fare_paid = request.data.get('fare_paid', 0)
        
        if not all([student_id, pickup_location, drop_location]):
            return Response(
                {'error': 'student_id, pickup_location, and drop_location are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        passenger = TripPassenger.objects.create(
            trip=trip,
            student_id=student_id,
            pickup_location=pickup_location,
            drop_location=drop_location,
            fare_paid=fare_paid
        )
        
        serializer = TripPassengerSerializer(passenger)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_passenger_status(self, request, pk=None):
        """Update passenger status"""
        trip = self.get_object()
        serializer = PassengerStatusUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        passenger_id = data.pop('passenger_id')
        
        try:
            passenger = trip.passengers.get(id=passenger_id)
        except TripPassenger.DoesNotExist:
            return Response(
                {'error': 'Passenger not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        for field, value in data.items():
            setattr(passenger, field, value)
        
        passenger.save()
        
        response_serializer = TripPassengerSerializer(passenger)
        return Response(response_serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple trips at once"""
        serializer = BulkTripCreateSerializer(data=request.data, many=True)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        trips = []
        for trip_data in serializer.validated_data:
            trip = Trip.objects.create(**trip_data)
            trips.append(trip)
        
        response_serializer = self.get_serializer(trips, many=True)
        return Response(response_serializer.data)


class StudentTransportViewSet(viewsets.ModelViewSet):
    queryset = StudentTransport.objects.all()
    serializer_class = StudentTransportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['route', 'is_active']
    search_fields = ['student__full_name', 'pickup_location', 'drop_location']
    ordering_fields = ['student__full_name', 'start_date']
    ordering = ['student__full_name']

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get transport assignments by student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignments = self.queryset.filter(student_id=student_id, is_active=True)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_route(self, request):
        """Get transport assignments by route"""
        route_id = request.query_params.get('route_id')
        if not route_id:
            return Response(
                {'error': 'route_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignments = self.queryset.filter(route_id=route_id, is_active=True)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)


class TripPassengerViewSet(viewsets.ModelViewSet):
    queryset = TripPassenger.objects.all()
    serializer_class = TripPassengerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip', 'student', 'status']
    search_fields = ['student__full_name', 'pickup_location', 'drop_location']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.all()
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle', 'maintenance_type']
    search_fields = ['description', 'service_provider']
    ordering_fields = ['service_date', 'cost']
    ordering = ['-service_date']

    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """Get maintenance records by vehicle"""
        vehicle_id = request.query_params.get('vehicle_id')
        if not vehicle_id:
            return Response(
                {'error': 'vehicle_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        records = self.queryset.filter(vehicle_id=vehicle_id)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)


class FuelRecordViewSet(viewsets.ModelViewSet):
    queryset = FuelRecord.objects.all()
    serializer_class = FuelRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle', 'fuel_type']
    search_fields = ['fuel_station']
    ordering_fields = ['fuel_date', 'total_cost']
    ordering = ['-fuel_date']

    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """Get fuel records by vehicle"""
        vehicle_id = request.query_params.get('vehicle_id')
        if not vehicle_id:
            return Response(
                {'error': 'vehicle_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        records = self.queryset.filter(vehicle_id=vehicle_id)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)


class TransportSettingsViewSet(viewsets.ModelViewSet):
    queryset = TransportSettings.objects.all()
    serializer_class = TransportSettingsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['school']
    search_fields = ['school__name']
    ordering_fields = ['school__name']
    ordering = ['school__name']


# Custom views for dashboard and analytics
class TransportDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get transport dashboard statistics"""
        today = timezone.now().date()
        
        total_vehicles = Vehicle.objects.count()
        active_vehicles = Vehicle.objects.filter(status='active', is_active=True).count()
        total_drivers = Driver.objects.count()
        active_drivers = Driver.objects.filter(status='active', is_active=True).count()
        total_routes = Route.objects.count()
        active_routes = Route.objects.filter(is_active=True).count()
        
        total_trips_today = Trip.objects.filter(scheduled_departure__date=today).count()
        completed_trips_today = Trip.objects.filter(
            scheduled_departure__date=today,
            status='completed'
        ).count()
        delayed_trips_today = Trip.objects.filter(
            scheduled_departure__date=today,
            status='delayed'
        ).count()
        
        vehicles_needing_service = Vehicle.objects.filter(
            is_active=True
        ).filter(
            Q(next_service_date__lte=today) |
            Q(next_service_date__isnull=True)
        ).count()
        
        drivers_with_expired_license = Driver.objects.filter(
            is_active=True,
            license_expiry_date__lt=today
        ).count()
        
        recent_trips = Trip.objects.all()[:10]
        upcoming_trips = Trip.objects.filter(
            scheduled_departure__date__gte=today
        ).order_by('scheduled_departure')[:10]
        
        data = {
            'total_vehicles': total_vehicles,
            'active_vehicles': active_vehicles,
            'total_drivers': total_drivers,
            'active_drivers': active_drivers,
            'total_routes': total_routes,
            'active_routes': active_routes,
            'total_trips_today': total_trips_today,
            'completed_trips_today': completed_trips_today,
            'delayed_trips_today': delayed_trips_today,
            'vehicles_needing_service': vehicles_needing_service,
            'drivers_with_expired_license': drivers_with_expired_license,
            'recent_trips': TripSerializer(recent_trips, many=True).data,
            'upcoming_trips': TripSerializer(upcoming_trips, many=True).data,
        }
        
        serializer = TransportDashboardSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def generate_report(self, request):
        """Generate transport reports"""
        serializer = TransportReportSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Implement report generation logic here
        # This would generate PDF, Excel, or CSV reports based on the parameters
        
        return Response({
            'message': 'Report generated successfully',
            'download_url': '/api/transport/reports/download/'
        })

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Count, Q, F
from datetime import timedelta

from .models import (
    Category, Supplier, Asset, StockItem, Transaction, MaintenanceRecord
)
from .serializers import (
    CategorySerializer, CategoryDetailSerializer,
    SupplierSerializer, SupplierDetailSerializer,
    AssetSerializer, AssetDetailSerializer,
    StockItemSerializer, StockItemDetailSerializer,
    TransactionSerializer, TransactionDetailSerializer,
    MaintenanceRecordSerializer, MaintenanceRecordDetailSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing categories"""
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['is_active', 'parent']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return CategoryDetailSerializer
        return CategorySerializer
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get category tree structure"""
        root_categories = Category.objects.filter(parent=None, is_active=True)
        serializer = self.get_serializer(root_categories, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get category statistics"""
        total_categories = Category.objects.count()
        active_categories = Category.objects.filter(is_active=True).count()
        categories_with_items = Category.objects.annotate(
            item_count=Count('asset') + Count('stockitem')
        ).filter(item_count__gt=0).count()
        
        return Response({
            'total_categories': total_categories,
            'active_categories': active_categories,
            'categories_with_items': categories_with_items
        })


class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet for managing suppliers"""
    
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = ['is_active']
    search_fields = ['name', 'contact_person', 'email', 'phone']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return SupplierDetailSerializer
        return SupplierSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active suppliers only"""
        active_suppliers = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_suppliers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get supplier statistics"""
        total_suppliers = Supplier.objects.count()
        active_suppliers = Supplier.objects.filter(is_active=True).count()
        suppliers_with_items = Supplier.objects.filter(
            Q(asset__isnull=False) | Q(stockitem__isnull=False)
        ).distinct().count()
        
        return Response({
            'total_suppliers': total_suppliers,
            'active_suppliers': active_suppliers,
            'suppliers_with_items': suppliers_with_items
        })


class AssetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing assets"""
    
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = [
        'category', 'supplier', 'condition', 'status', 'department'
    ]
    search_fields = [
        'name', 'description', 'serial_number', 'model', 'brand',
        'location', 'assigned_to'
    ]
    ordering_fields = [
        'name', 'purchase_date', 'purchase_price', 'created_at'
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return AssetDetailSerializer
        return AssetSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range if provided
        purchase_date_from = self.request.query_params.get('purchase_date_from')
        purchase_date_to = self.request.query_params.get('purchase_date_to')
        
        if purchase_date_from:
            queryset = queryset.filter(purchase_date__gte=purchase_date_from)
        if purchase_date_to:
            queryset = queryset.filter(purchase_date__lte=purchase_date_to)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available assets only"""
        available_assets = self.get_queryset().filter(status='available')
        serializer = self.get_serializer(available_assets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def maintenance_due(self, request):
        """Get assets due for maintenance"""
        today = timezone.now().date()
        maintenance_due = self.get_queryset().filter(
            next_maintenance__lte=today,
            status__in=['available', 'in_use']
        )
        serializer = self.get_serializer(maintenance_due, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def warranty_expiring(self, request):
        """Get assets with warranty expiring soon"""
        today = timezone.now().date()
        thirty_days_from_now = today + timedelta(days=30)
        warranty_expiring = self.get_queryset().filter(
            warranty_expiry__gte=today,
            warranty_expiry__lte=thirty_days_from_now
        )
        serializer = self.get_serializer(warranty_expiring, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get asset statistics"""
        total_assets = Asset.objects.count()
        total_value = Asset.objects.aggregate(
            total=Sum('current_value')
        )['total'] or 0
        
        # Assets by status
        status_counts = {}
        for status, _ in Asset.STATUS_CHOICES:
            count = Asset.objects.filter(status=status).count()
            status_counts[status] = count
        
        # Assets by condition
        condition_counts = {}
        for condition, _ in Asset.CONDITION_CHOICES:
            count = Asset.objects.filter(condition=condition).count()
            condition_counts[condition] = count
        
        # Assets by category
        category_counts = {}
        categories = Category.objects.all()
        for category in categories:
            count = Asset.objects.filter(category=category).count()
            if count > 0:
                category_counts[category.name] = count
        
        return Response({
            'total_assets': total_assets,
            'total_value': total_value,
            'status_counts': status_counts,
            'condition_counts': condition_counts,
            'category_counts': category_counts
        })


class StockItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing stock items"""
    
    queryset = StockItem.objects.all()
    serializer_class = StockItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = [
        'category', 'supplier', 'is_active'
    ]
    search_fields = [
        'name', 'description', 'sku', 'location', 'shelf_number'
    ]
    ordering_fields = [
        'name', 'current_stock', 'unit_price', 'total_value', 'created_at'
    ]
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return StockItemDetailSerializer
        return StockItemSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by stock status if provided
        stock_status = self.request.query_params.get('stock_status')
        if stock_status:
            if stock_status == 'out_of_stock':
                queryset = queryset.filter(current_stock=0)
            elif stock_status == 'low_stock':
                queryset = queryset.filter(
                    current_stock__lte=F('minimum_stock'),
                    current_stock__gt=0
                )
            elif stock_status == 'overstocked':
                queryset = queryset.filter(
                    current_stock__gte=F('maximum_stock')
                )
            elif stock_status == 'in_stock':
                queryset = queryset.filter(
                    current_stock__gt=F('minimum_stock')
                )
                if queryset.filter(maximum_stock__isnull=False).exists():
                    queryset = queryset.filter(
                        current_stock__lt=F('maximum_stock')
                    )
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get items with low stock"""
        low_stock_items = self.get_queryset().filter(
            current_stock__lte=F('minimum_stock')
        )
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Get items out of stock"""
        out_of_stock_items = self.get_queryset().filter(current_stock=0)
        serializer = self.get_serializer(out_of_stock_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get stock item statistics"""
        total_items = StockItem.objects.count()
        active_items = StockItem.objects.filter(is_active=True).count()
        total_value = StockItem.objects.aggregate(
            total=Sum('total_value')
        )['total'] or 0
        
        # Stock status counts
        out_of_stock = StockItem.objects.filter(current_stock=0).count()
        low_stock = StockItem.objects.filter(
            current_stock__lte=F('minimum_stock'),
            current_stock__gt=0
        ).count()
        in_stock = StockItem.objects.filter(
            current_stock__gt=F('minimum_stock')
        ).count()
        
        # Items by category
        category_counts = {}
        categories = Category.objects.all()
        for category in categories:
            count = StockItem.objects.filter(category=category).count()
            if count > 0:
                category_counts[category.name] = count
        
        return Response({
            'total_items': total_items,
            'active_items': active_items,
            'total_value': total_value,
            'out_of_stock': out_of_stock,
            'low_stock': low_stock,
            'in_stock': in_stock,
            'category_counts': category_counts
        })


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing transactions"""
    
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = [
        'transaction_type', 'asset', 'stock_item'
    ]
    search_fields = [
        'reference_number', 'notes', 'from_location', 'to_location'
    ]
    ordering_fields = [
        'transaction_date', 'total_amount', 'created_at'
    ]
    ordering = ['-transaction_date']
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return TransactionDetailSerializer
        return TransactionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range if provided
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(transaction_date__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(transaction_date__date__lte=date_to)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent transactions"""
        recent_transactions = self.get_queryset()[:20]
        serializer = self.get_serializer(recent_transactions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get transaction statistics"""
        total_transactions = Transaction.objects.count()
        total_amount = Transaction.objects.aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        # Transactions by type
        type_counts = {}
        for trans_type, _ in Transaction.TRANSACTION_TYPES:
            count = Transaction.objects.filter(
                transaction_type=trans_type
            ).count()
            type_counts[trans_type] = count
        
        # Recent activity
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        recent_week = Transaction.objects.filter(
            transaction_date__date__gte=week_ago
        ).count()
        recent_month = Transaction.objects.filter(
            transaction_date__date__gte=month_ago
        ).count()
        
        return Response({
            'total_transactions': total_transactions,
            'total_amount': total_amount,
            'type_counts': type_counts,
            'recent_week': recent_week,
            'recent_month': recent_month
        })


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for managing maintenance records"""
    
    queryset = MaintenanceRecord.objects.all()
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_fields = [
        'asset', 'maintenance_type', 'is_completed'
    ]
    search_fields = [
        'title', 'description', 'performed_by'
    ]
    ordering_fields = [
        'scheduled_date', 'completed_date', 'cost', 'created_at'
    ]
    ordering = ['-scheduled_date']
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return MaintenanceRecordDetailSerializer
        return MaintenanceRecordSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range if provided
        scheduled_from = self.request.query_params.get('scheduled_from')
        scheduled_to = self.request.query_params.get('scheduled_to')
        
        if scheduled_from:
            queryset = queryset.filter(scheduled_date__gte=scheduled_from)
        if scheduled_to:
            queryset = queryset.filter(scheduled_date__lte=scheduled_to)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending maintenance records"""
        pending_maintenance = self.get_queryset().filter(
            is_completed=False
        )
        serializer = self.get_serializer(pending_maintenance, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue maintenance records"""
        today = timezone.now().date()
        overdue_maintenance = self.get_queryset().filter(
            scheduled_date__lt=today,
            is_completed=False
        )
        serializer = self.get_serializer(overdue_maintenance, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get maintenance statistics"""
        total_maintenance = MaintenanceRecord.objects.count()
        completed_maintenance = MaintenanceRecord.objects.filter(
            is_completed=True
        ).count()
        pending_maintenance = MaintenanceRecord.objects.filter(
            is_completed=False
        ).count()
        
        total_cost = MaintenanceRecord.objects.filter(
            is_completed=True
        ).aggregate(total=Sum('cost'))['total'] or 0
        
        # Maintenance by type
        type_counts = {}
        for maint_type, _ in MaintenanceRecord.MAINTENANCE_TYPES:
            count = MaintenanceRecord.objects.filter(
                maintenance_type=maint_type
            ).count()
            type_counts[maint_type] = count
        
        return Response({
            'total_maintenance': total_maintenance,
            'completed_maintenance': completed_maintenance,
            'pending_maintenance': pending_maintenance,
            'total_cost': total_cost,
            'type_counts': type_counts
        })

from rest_framework import serializers
from .models import (
    Category, Supplier, Asset, StockItem, Transaction, MaintenanceRecord
)


class CategorySerializer(serializers.ModelSerializer):
    """Basic category serializer for list views"""
    
    parent_name = serializers.CharField(
        source='parent.name', read_only=True
    )
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'parent', 'parent_name',
            'is_active', 'item_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_item_count(self, obj):
        """Get count of items in this category"""
        return Asset.objects.filter(category=obj).count() + \
               StockItem.objects.filter(category=obj).count()


class CategoryDetailSerializer(serializers.ModelSerializer):
    """Detailed category serializer for create/update/retrieve views"""
    
    parent_name = serializers.CharField(
        source='parent.name', read_only=True
    )
    children = CategorySerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'parent', 'parent_name',
            'children', 'is_active', 'item_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_item_count(self, obj):
        """Get count of items in this category"""
        return Asset.objects.filter(category=obj).count() + \
               StockItem.objects.filter(category=obj).count()


class SupplierSerializer(serializers.ModelSerializer):
    """Basic supplier serializer for list views"""
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'email', 'phone',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SupplierDetailSerializer(serializers.ModelSerializer):
    """Detailed supplier serializer for create/update/retrieve views"""
    
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'email', 'phone',
            'address', 'website', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssetSerializer(serializers.ModelSerializer):
    """Basic asset serializer for list views"""
    
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )
    supplier_name = serializers.CharField(
        source='supplier.name', read_only=True
    )
    condition_display = serializers.CharField(
        source='get_condition_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    
    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'supplier', 'supplier_name', 'serial_number', 'model', 'brand',
            'condition', 'condition_display', 'status', 'status_display',
            'location', 'room_number', 'department', 'purchase_price',
            'current_value', 'purchase_date', 'warranty_expiry',
            'assigned_to', 'assigned_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AssetDetailSerializer(serializers.ModelSerializer):
    """Detailed asset serializer for create/update/retrieve views"""
    
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )
    supplier_name = serializers.CharField(
        source='supplier.name', read_only=True
    )
    condition_display = serializers.CharField(
        source='get_condition_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    
    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'supplier', 'supplier_name', 'serial_number', 'model', 'brand',
            'condition', 'condition_display', 'status', 'status_display',
            'location', 'room_number', 'department', 'purchase_price',
            'current_value', 'purchase_date', 'warranty_expiry',
            'last_maintenance', 'next_maintenance', 'maintenance_notes',
            'assigned_to', 'assigned_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate asset data"""
        # Check if warranty expiry is after purchase date
        if (data.get('warranty_expiry') and data.get('purchase_date')):
            if data['warranty_expiry'] <= data['purchase_date']:
                raise serializers.ValidationError(
                    "Warranty expiry must be after purchase date."
                )
        
        # Check if next maintenance is after last maintenance
        if (data.get('next_maintenance') and data.get('last_maintenance')):
            if data['next_maintenance'] <= data['last_maintenance']:
                raise serializers.ValidationError(
                    "Next maintenance must be after last maintenance."
                )
        
        return data


class StockItemSerializer(serializers.ModelSerializer):
    """Basic stock item serializer for list views"""
    
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )
    supplier_name = serializers.CharField(
        source='supplier.name', read_only=True
    )
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = StockItem
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'supplier', 'supplier_name', 'sku', 'unit', 'current_stock',
            'minimum_stock', 'maximum_stock', 'unit_price', 'total_value',
            'location', 'shelf_number', 'is_active', 'stock_status',
            'created_at'
        ]
        read_only_fields = ['id', 'total_value', 'created_at']
    
    def get_stock_status(self, obj):
        """Get stock status based on current stock levels"""
        if obj.current_stock <= 0:
            return 'out_of_stock'
        elif obj.current_stock <= obj.minimum_stock:
            return 'low_stock'
        elif obj.maximum_stock and obj.current_stock >= obj.maximum_stock:
            return 'overstocked'
        else:
            return 'in_stock'


class StockItemDetailSerializer(serializers.ModelSerializer):
    """Detailed stock item serializer for create/update/retrieve views"""
    
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )
    supplier_name = serializers.CharField(
        source='supplier.name', read_only=True
    )
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = StockItem
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'supplier', 'supplier_name', 'sku', 'unit', 'current_stock',
            'minimum_stock', 'maximum_stock', 'unit_price', 'total_value',
            'location', 'shelf_number', 'is_active', 'stock_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_value', 'created_at', 'updated_at']
    
    def get_stock_status(self, obj):
        """Get stock status based on current stock levels"""
        if obj.current_stock <= 0:
            return 'out_of_stock'
        elif obj.current_stock <= obj.minimum_stock:
            return 'low_stock'
        elif obj.maximum_stock and obj.current_stock >= obj.maximum_stock:
            return 'overstocked'
        else:
            return 'in_stock'
    
    def validate(self, data):
        """Validate stock item data"""
        # Check if minimum stock is less than maximum stock
        if (data.get('minimum_stock') and data.get('maximum_stock')):
            if data['minimum_stock'] >= data['maximum_stock']:
                raise serializers.ValidationError(
                    "Minimum stock must be less than maximum stock."
                )
        
        return data


class TransactionSerializer(serializers.ModelSerializer):
    """Basic transaction serializer for list views"""
    
    asset_name = serializers.CharField(
        source='asset.name', read_only=True
    )
    stock_item_name = serializers.CharField(
        source='stock_item.name', read_only=True
    )
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display', read_only=True
    )
    item_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'transaction_type_display',
            'reference_number', 'asset', 'asset_name', 'stock_item',
            'stock_item_name', 'item_name', 'quantity', 'from_location',
            'to_location', 'unit_price', 'total_amount', 'notes',
            'transaction_date', 'created_at'
        ]
        read_only_fields = ['id', 'total_amount', 'transaction_date', 'created_at']
    
    def get_item_name(self, obj):
        """Get the name of the item (asset or stock item)"""
        if obj.asset:
            return obj.asset.name
        elif obj.stock_item:
            return obj.stock_item.name
        return None


class TransactionDetailSerializer(serializers.ModelSerializer):
    """Detailed transaction serializer for create/update/retrieve views"""
    
    asset_name = serializers.CharField(
        source='asset.name', read_only=True
    )
    stock_item_name = serializers.CharField(
        source='stock_item.name', read_only=True
    )
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display', read_only=True
    )
    item_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'transaction_type_display',
            'reference_number', 'asset', 'asset_name', 'stock_item',
            'stock_item_name', 'item_name', 'quantity', 'from_location',
            'to_location', 'unit_price', 'total_amount', 'notes',
            'transaction_date', 'created_at'
        ]
        read_only_fields = ['id', 'total_amount', 'transaction_date', 'created_at']
    
    def get_item_name(self, obj):
        """Get the name of the item (asset or stock item)"""
        if obj.asset:
            return obj.asset.name
        elif obj.stock_item:
            return obj.stock_item.name
        return None
    
    def validate(self, data):
        """Validate transaction data"""
        # Check that either asset or stock_item is provided
        if not data.get('asset') and not data.get('stock_item'):
            raise serializers.ValidationError(
                "Either asset or stock item must be specified."
            )
        
        # Check that both asset and stock_item are not provided
        if data.get('asset') and data.get('stock_item'):
            raise serializers.ValidationError(
                "Cannot specify both asset and stock item."
            )
        
        return data


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    """Basic maintenance record serializer for list views"""
    
    asset_name = serializers.CharField(
        source='asset.name', read_only=True
    )
    maintenance_type_display = serializers.CharField(
        source='get_maintenance_type_display', read_only=True
    )
    
    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'asset', 'asset_name', 'maintenance_type',
            'maintenance_type_display', 'title', 'performed_by',
            'scheduled_date', 'completed_date', 'cost', 'is_completed',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MaintenanceRecordDetailSerializer(serializers.ModelSerializer):
    """Detailed maintenance record serializer for create/update/retrieve views"""
    
    asset_name = serializers.CharField(
        source='asset.name', read_only=True
    )
    maintenance_type_display = serializers.CharField(
        source='get_maintenance_type_display', read_only=True
    )
    
    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'asset', 'asset_name', 'maintenance_type',
            'maintenance_type_display', 'title', 'description',
            'performed_by', 'scheduled_date', 'completed_date', 'cost',
            'is_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate maintenance record data"""
        # Check if completed date is after scheduled date
        if (data.get('completed_date') and data.get('scheduled_date')):
            if data['completed_date'] < data['scheduled_date']:
                raise serializers.ValidationError(
                    "Completed date cannot be before scheduled date."
                )
        
        return data

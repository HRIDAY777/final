import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  TagIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';

interface StockItem {
  id: string;
  name: string;
  description: string;
  category: string;
  category_name: string;
  supplier: string;
  supplier_name: string;
  sku: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_price: number;
  total_value: number;
  location: string;
  shelf_number: string;
  is_active: boolean;
  stock_status: string;
  created_at: string;
}

const Stock: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters] = useState({
    category: '',
    stock_status: '',
    is_active: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockStockItems: StockItem[] = [
      {
        id: '1',
        name: 'Printer Paper A4',
        description: 'High-quality A4 printer paper, 80gsm',
        category: 'office-supplies',
        category_name: 'Office Supplies',
        supplier: 'office-supplies',
        supplier_name: 'Office Supplies Co.',
        sku: 'PP-A4-001',
        unit: 'Ream',
        current_stock: 5,
        minimum_stock: 10,
        maximum_stock: 50,
        unit_price: 8.50,
        total_value: 42.50,
        location: 'Storage Room A',
        shelf_number: 'A-01-01',
        is_active: true,
        stock_status: 'low_stock',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Whiteboard Markers',
        description: 'Non-toxic whiteboard markers, assorted colors',
        category: 'office-supplies',
        category_name: 'Office Supplies',
        supplier: 'office-supplies',
        supplier_name: 'Office Supplies Co.',
        sku: 'WM-COL-002',
        unit: 'Pack',
        current_stock: 25,
        minimum_stock: 5,
        maximum_stock: 30,
        unit_price: 12.00,
        total_value: 300.00,
        location: 'Storage Room A',
        shelf_number: 'A-01-02',
        is_active: true,
        stock_status: 'in_stock',
        created_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '3',
        name: 'Laboratory Beakers',
        description: 'Glass beakers for science experiments, 100ml',
        category: 'lab-equipment',
        category_name: 'Lab Equipment',
        supplier: 'science-supplies',
        supplier_name: 'Science Supplies Inc.',
        sku: 'LB-100-003',
        unit: 'Piece',
        current_stock: 0,
        minimum_stock: 20,
        maximum_stock: 100,
        unit_price: 15.00,
        total_value: 0.00,
        location: 'Science Storage',
        shelf_number: 'S-02-01',
        is_active: true,
        stock_status: 'out_of_stock',
        created_at: '2024-02-10T09:15:00Z'
      },
      {
        id: '4',
        name: 'Basketballs',
        description: 'Official size basketballs for sports activities',
        category: 'sports-equipment',
        category_name: 'Sports Equipment',
        supplier: 'sports-supplies',
        supplier_name: 'Sports Equipment Co.',
        sku: 'BB-OFF-004',
        unit: 'Piece',
        current_stock: 35,
        minimum_stock: 10,
        maximum_stock: 30,
        unit_price: 25.00,
        total_value: 875.00,
        location: 'Sports Equipment Room',
        shelf_number: 'SE-01-01',
        is_active: true,
        stock_status: 'overstocked',
        created_at: '2024-02-15T11:45:00Z'
      },
      {
        id: '5',
        name: 'Textbooks - Mathematics',
        description: 'Grade 10 Mathematics textbooks',
        category: 'books',
        category_name: 'Books',
        supplier: 'book-publisher',
        supplier_name: 'Educational Books Ltd.',
        sku: 'TB-MATH-005',
        unit: 'Copy',
        current_stock: 15,
        minimum_stock: 20,
        maximum_stock: 50,
        unit_price: 45.00,
        total_value: 675.00,
        location: 'Library Storage',
        shelf_number: 'L-01-01',
        is_active: true,
        stock_status: 'low_stock',
        created_at: '2024-03-01T16:20:00Z'
      }
    ];

    setTimeout(() => {
      setStockItems(mockStockItems);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
  }, []);

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">In Stock</span>;
      case 'low_stock':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Low Stock</span>;
      case 'out_of_stock':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Out of Stock</span>;
      case 'overstocked':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Overstocked</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const getStockLevelIndicator = (item: StockItem) => {
    const percentage = item.maximum_stock ? (item.current_stock / item.maximum_stock) * 100 : 0;
    const isLow = item.current_stock <= item.minimum_stock;
    const isOverstocked = item.maximum_stock && item.current_stock >= item.maximum_stock;
    
    let color = 'bg-green-500';
    if (isLow) color = 'bg-red-500';
    else if (isOverstocked) color = 'bg-orange-500';
    else if (percentage < 50) color = 'bg-yellow-500';

    return (
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-600">{item.current_stock}/{item.maximum_stock || '∞'}</span>
      </div>
    );
  };

  const handleDelete = (item: StockItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setStockItems(stockItems.filter(i => i.id !== selectedItem.id));
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.description.toLowerCase().includes(search.toLowerCase()) ||
                         item.sku.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesStatus = !filters.stock_status || item.stock_status === filters.stock_status;
    const matchesActive = filters.is_active === '' || 
                         (filters.is_active === 'true' ? item.is_active : !item.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesActive;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Manage inventory and track stock levels</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/inventory/stock/create">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Stock Item
            </Button>
          </Link>
          <Link to="/inventory/stock/restock">
            <Button variant="outline">
              <ArrowUpIcon className="w-4 h-4 mr-2" />
              Restock
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Stock Items List */}
      <Card>
        <CardHeader title={`Stock Items (${filteredStockItems.length})`} />
        <div className="p-6">
          {filteredStockItems.length === 0 ? (
            <div className="text-center py-12">
              <BuildingStorefrontIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stock items found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Link to="/inventory/stock/create">
                <Button>Add Your First Stock Item</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStockItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <BuildingStorefrontIcon className="w-8 h-8 text-green-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          {getStockStatusBadge(item.stock_status)}
                          {!item.is_active && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inactive</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <TagIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">SKU: {item.sku}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {item.location} - Shelf {item.shelf_number}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              ${item.unit_price.toFixed(2)} per {item.unit}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              Total Value: ${item.total_value.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Stock Level Indicator */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Stock Level</span>
                            <span className="text-xs text-gray-500">
                              Min: {item.minimum_stock} | Max: {item.maximum_stock || '∞'}
                            </span>
                          </div>
                          <div className="mt-2">
                            {getStockLevelIndicator(item)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/inventory/stock/${item.id}`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/inventory/stock/${item.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          pageSize={10}
          total={totalPages * 10}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Stock Item</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{selectedItem.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;

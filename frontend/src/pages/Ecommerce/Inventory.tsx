import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  lastRestocked: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  location: string;
  expiryDate?: string;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockedItems: number;
  averageStockLevel: number;
  reorderAlerts: number;
  expiringItems: number;
}

interface StockMovement {
  id: string;
  itemName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  user: string;
  reference: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    overstockedItems: 0,
    averageStockLevel: 0,
    reorderAlerts: 0,
    expiringItems: 0
  });
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Advanced Mathematics Textbook',
        sku: 'MATH-101',
        category: 'Books',
        currentStock: 23,
        minStockLevel: 10,
        maxStockLevel: 100,
        reorderPoint: 15,
        unitCost: 25.50,
        totalValue: 586.50,
        lastRestocked: '2024-01-10',
        supplier: 'Educational Publishers Ltd',
        status: 'in_stock',
        location: 'Warehouse A - Shelf 1',
        expiryDate: '2026-12-31'
      },
      {
        id: '2',
        name: 'Premium Stationery Set',
        sku: 'STN-001',
        category: 'Stationery',
        currentStock: 8,
        minStockLevel: 15,
        maxStockLevel: 50,
        reorderPoint: 20,
        unitCost: 12.75,
        totalValue: 102.00,
        lastRestocked: '2024-01-05',
        supplier: 'Office Supplies Co',
        status: 'low_stock',
        location: 'Warehouse B - Shelf 3'
      },
      {
        id: '3',
        name: 'Scientific Calculator',
        sku: 'CALC-001',
        category: 'Accessories',
        currentStock: 0,
        minStockLevel: 5,
        maxStockLevel: 25,
        reorderPoint: 8,
        unitCost: 45.00,
        totalValue: 0,
        lastRestocked: '2023-12-20',
        supplier: 'Tech Gadgets Inc',
        status: 'out_of_stock',
        location: 'Warehouse A - Shelf 2'
      },
      {
        id: '4',
        name: 'English Literature Collection',
        sku: 'ENG-101',
        category: 'Books',
        currentStock: 45,
        minStockLevel: 10,
        maxStockLevel: 30,
        reorderPoint: 15,
        unitCost: 18.25,
        totalValue: 821.25,
        lastRestocked: '2024-01-12',
        supplier: 'Literary Publishers',
        status: 'overstocked',
        location: 'Warehouse A - Shelf 1'
      },
      {
        id: '5',
        name: 'Art Supplies Kit',
        sku: 'ART-001',
        category: 'Stationery',
        currentStock: 12,
        minStockLevel: 8,
        maxStockLevel: 40,
        reorderPoint: 12,
        unitCost: 22.50,
        totalValue: 270.00,
        lastRestocked: '2024-01-08',
        supplier: 'Creative Supplies Ltd',
        status: 'in_stock',
        location: 'Warehouse B - Shelf 4'
      }
    ];

    const mockStats: InventoryStats = {
      totalItems: 245,
      totalValue: 125000,
      lowStockItems: 18,
      outOfStockItems: 5,
      overstockedItems: 12,
      averageStockLevel: 67,
      reorderAlerts: 23,
      expiringItems: 8
    };

    const mockStockMovements: StockMovement[] = [
      {
        id: '1',
        itemName: 'Advanced Mathematics Textbook',
        type: 'in',
        quantity: 50,
        reason: 'Restock from supplier',
        date: '2024-01-15T10:30:00Z',
        user: 'John Smith',
        reference: 'PO-2024-001'
      },
      {
        id: '2',
        itemName: 'Premium Stationery Set',
        type: 'out',
        quantity: 15,
        reason: 'Customer order',
        date: '2024-01-15T09:15:00Z',
        user: 'System',
        reference: 'ORD-2024-002'
      },
      {
        id: '3',
        itemName: 'Scientific Calculator',
        type: 'adjustment',
        quantity: -2,
        reason: 'Damaged items',
        date: '2024-01-15T08:45:00Z',
        user: 'Sarah Johnson',
        reference: 'ADJ-2024-001'
      },
      {
        id: '4',
        itemName: 'English Literature Collection',
        type: 'in',
        quantity: 30,
        reason: 'Restock from supplier',
        date: '2024-01-14T16:20:00Z',
        user: 'John Smith',
        reference: 'PO-2024-002'
      },
      {
        id: '5',
        itemName: 'Art Supplies Kit',
        type: 'out',
        quantity: 8,
        reason: 'Customer order',
        date: '2024-01-14T14:30:00Z',
        user: 'System',
        reference: 'ORD-2024-003'
      }
    ];

    setTimeout(() => {
      setInventory(mockInventory);
      setStats(mockStats);
      setStockMovements(mockStockMovements);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
      overstocked: 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock',
      overstocked: 'Overstocked'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getStockLevelIndicator = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current === 0) return { color: 'bg-red-500', width: '0%' };
    if (current <= min) return { color: 'bg-yellow-500', width: `${(current / max) * 100}%` };
    if (current > max) return { color: 'bg-blue-500', width: '100%' };
    return { color: 'bg-green-500', width: `${percentage}%` };
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'out':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <XCircleIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleRestock = (item: InventoryItem) => {
    setSelectedItem(item);
    // TODO: Implement restock modal
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track stock levels, manage inventory, and handle reordering
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                <p className="text-sm text-gray-500 mt-1">Total Value: {formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TagIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
                <p className="text-sm text-yellow-600 mt-1">Needs reordering</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStockItems}</p>
                <p className="text-sm text-red-600 mt-1">Urgent restock needed</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overstocked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overstockedItems}</p>
                <p className="text-sm text-blue-600 mt-1">Above max level</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader title="Search & Filters" />
        <div className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items by name, SKU, or supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="overstocked">Overstocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Books">Books</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader title={`Inventory Items (${filteredInventory.length})`} />
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Levels
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value & Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const stockIndicator = getStockLevelIndicator(item.currentStock, item.minStockLevel, item.maxStockLevel);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          <div className="text-sm text-gray-500">{item.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.currentStock} units</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${stockIndicator.color}`}
                              style={{ width: stockIndicator.width }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Min: {item.minStockLevel} | Max: {item.maxStockLevel}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(item.totalValue)}</div>
                          <div className="text-sm text-gray-500">Unit: {formatCurrency(item.unitCost)}</div>
                          <div className="text-xs text-gray-500">
                            Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">{item.supplier}</div>
                          <div className="text-sm text-gray-500">{item.location}</div>
                          {item.expiryDate && (
                            <div className="text-xs text-gray-500">
                              Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsDetailsModalOpen(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestock(item)}
                            className="flex items-center gap-1"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Restock
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="flex items-center gap-1 text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <TagIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding a new inventory item.'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && (
                <div className="mt-6">
                  <Button className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Recent Stock Movements */}
      <Card>
        <CardHeader title="Recent Stock Movements" />
        <div className="p-6">
          <div className="space-y-4">
            {stockMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getMovementIcon(movement.type)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{movement.itemName}</h4>
                    <p className="text-sm text-gray-600">{movement.reason}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(movement.date).toLocaleDateString()} • {movement.user}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    movement.type === 'in' ? 'text-green-600' : 
                    movement.type === 'out' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {movement.type === 'in' ? '+' : ''}{movement.quantity}
                  </p>
                  <p className="text-xs text-gray-500">{movement.reference}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Item Details Modal */}
      {isDetailsModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedItem.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">SKU:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedItem.sku}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Category:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedItem.category}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedItem.status)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Stock Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Current Stock:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedItem.currentStock}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Min Level:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedItem.minStockLevel}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Max Level:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedItem.maxStockLevel}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Reorder Point:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedItem.reorderPoint}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Financial Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Unit Cost:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{formatCurrency(selectedItem.unitCost)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Value:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{formatCurrency(selectedItem.totalValue)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Supplier & Location</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Supplier:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedItem.supplier}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Location:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedItem.location}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Restocked:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {new Date(selectedItem.lastRestocked).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleRestock(selectedItem)}
                >
                  Restock Item
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    // TODO: Navigate to stock movements
                  }}
                >
                  View Movements
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

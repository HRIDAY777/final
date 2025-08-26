import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  CubeIcon,
  PlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface InventoryStats {
  totalAssets: number;
  totalStockItems: number;
  totalValue: number;
  lowStockItems: number;
  maintenanceDue: number;
  warrantyExpiring: number;
  recentTransactions: number;
  pendingMaintenance: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const InventoryPage: React.FC = () => {
  const [stats, setStats] = useState<InventoryStats>({
    totalAssets: 0,
    totalStockItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    maintenanceDue: 0,
    warrantyExpiring: 0,
    recentTransactions: 0,
    pendingMaintenance: 0,
    byCategory: {},
    byStatus: {}
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats: InventoryStats = {
      totalAssets: 1247,
      totalStockItems: 856,
      totalValue: 2450000,
      lowStockItems: 23,
      maintenanceDue: 8,
      warrantyExpiring: 12,
      recentTransactions: 45,
      pendingMaintenance: 15,
      byCategory: {
        'Electronics': 234,
        'Furniture': 189,
        'Office Supplies': 156,
        'Lab Equipment': 98,
        'Sports Equipment': 67,
        'Books': 123
      },
      byStatus: {
        'Available': 892,
        'In Use': 234,
        'Under Maintenance': 89,
        'Retired': 32
      }
    };

    const mockRecentActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'Asset Added',
        description: 'New laptop added to Electronics category',
        timestamp: '2 hours ago',
        status: 'success'
      },
      {
        id: '2',
        type: 'Low Stock Alert',
        description: 'Printer paper running low (5 units remaining)',
        timestamp: '4 hours ago',
        status: 'warning'
      },
      {
        id: '3',
        type: 'Maintenance Due',
        description: 'Projector maintenance scheduled for tomorrow',
        timestamp: '6 hours ago',
        status: 'info'
      },
      {
        id: '4',
        type: 'Transaction',
        description: 'Asset transferred from Room 101 to Room 203',
        timestamp: '1 day ago',
        status: 'success'
      },
      {
        id: '5',
        type: 'Warranty Expiring',
        description: 'Computer warranty expires in 30 days',
        timestamp: '2 days ago',
        status: 'warning'
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setRecentActivity(mockRecentActivity);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      case 'info':
        return <ClockIcon className="w-4 h-4 text-blue-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track assets, stock items, and maintenance</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/inventory/assets/create">
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </Link>
          <Link to="/inventory/stock/create">
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Stock Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CubeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssets.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BuildingStorefrontIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStockItems.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${(stats.totalValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems + stats.maintenanceDue}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/inventory/assets">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <CubeIcon className="w-6 h-6 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Manage Assets</h3>
                    <p className="text-sm text-gray-600">View and edit assets</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/inventory/stock">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <BuildingStorefrontIcon className="w-6 h-6 text-green-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Stock Items</h3>
                    <p className="text-sm text-gray-600">Manage inventory</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/inventory/transactions">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Transactions</h3>
                    <p className="text-sm text-gray-600">View history</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/inventory/maintenance">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <WrenchScrewdriverIcon className="w-6 h-6 text-orange-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Maintenance</h3>
                    <p className="text-sm text-gray-600">Schedule & track</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Card>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Alerts & Notifications" />
          <div className="p-6">
            <div className="space-y-4">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                      {stats.lowStockItems} items running low on stock
                    </p>
                    <Link to="/inventory/stock?filter=low_stock" className="text-xs text-yellow-600 hover:underline">
                      View details →
                    </Link>
                  </div>
                </div>
              )}

              {stats.maintenanceDue > 0 && (
                <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      {stats.maintenanceDue} assets due for maintenance
                    </p>
                    <Link to="/inventory/maintenance?filter=pending" className="text-xs text-blue-600 hover:underline">
                      View details →
                    </Link>
                  </div>
                </div>
              )}

              {stats.warrantyExpiring > 0 && (
                <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-800">
                      {stats.warrantyExpiring} warranties expiring soon
                    </p>
                    <Link to="/inventory/assets?filter=warranty_expiring" className="text-xs text-orange-600 hover:underline">
                      View details →
                    </Link>
                  </div>
                </div>
              )}

              {stats.lowStockItems === 0 && stats.maintenanceDue === 0 && stats.warrantyExpiring === 0 && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      All systems operational
                    </p>
                    <p className="text-xs text-green-600">No alerts at this time</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" />
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/inventory/transactions">
                <Button variant="outline" size="sm">View All Activity</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Overview */}
      <Card>
        <CardHeader title="Assets by Category" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="text-center p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900">{category}</h3>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">assets</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InventoryPage;

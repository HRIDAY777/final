import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  expired_tenants: number;
  total_revenue: number;
  monthly_revenue: number;
  total_subscriptions: number;
  active_subscriptions: number;
  recent_tenants: Array<any>;
  expiring_subscriptions: Array<any>;
  usage_stats: any;
}

const Tenants: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // For now, we'll create mock data since the backend might not have all endpoints
      const mockStats: DashboardStats = {
        total_tenants: 25,
        active_tenants: 20,
        trial_tenants: 3,
        expired_tenants: 2,
        total_revenue: 125000,
        monthly_revenue: 8500,
        total_subscriptions: 28,
        active_subscriptions: 23,
        recent_tenants: [
          {
            id: 1,
            name: 'ABC School',
            tenant_type: 'school',
            subscription_status: 'active',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'XYZ College',
            tenant_type: 'college',
            subscription_status: 'trial',
            created_at: '2024-01-14T14:20:00Z'
          }
        ],
        expiring_subscriptions: [
          {
            id: 1,
            tenant_name: 'ABC School',
            plan_name: 'Premium',
            end_date: '2024-02-15T00:00:00Z'
          }
        ],
        usage_stats: {
          storage_usage: 75,
          module_usage: 85
        }
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string; subtitle?: string }> = ({ 
    title, value, icon, color, subtitle 
  }) => (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <PageHeader title="Tenants" subtitle="Multi-tenant management dashboard" />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title="Tenants" 
          subtitle="Multi-tenant organization and subscription management"
          right={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/tenants/list'}>
                View All Tenants
              </Button>
              <Button onClick={() => window.location.href = '/tenants/create'}>
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                Add Tenant
              </Button>
            </div>
          }
        />
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenants"
          value={stats?.total_tenants || 0}
          icon={<BuildingOfficeIcon className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Tenants"
          value={stats?.active_tenants || 0}
          icon={<CheckCircleIcon className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Trial Tenants"
          value={stats?.trial_tenants || 0}
          icon={<ClockIcon className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats?.monthly_revenue?.toLocaleString() || 0}`}
          icon={<CreditCardIcon className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/tenants/create'}
            >
              <BuildingOfficeIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Add Tenant</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/tenants/subscriptions'}
            >
              <CreditCardIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Manage Subscriptions</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/tenants/modules'}
            >
              <CogIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Module Management</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/tenants/analytics'}
            >
              <ChartBarIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Active Subscriptions</span>
              </div>
              <span className="text-lg font-semibold text-green-600">
                {stats?.active_subscriptions || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Trial Tenants</span>
              </div>
              <span className="text-lg font-semibold text-yellow-600">
                {stats?.trial_tenants || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Expired Tenants</span>
              </div>
              <span className="text-lg font-semibold text-red-600">
                {stats?.expired_tenants || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Total Revenue</span>
              </div>
              <span className="text-lg font-semibold text-blue-600">
                ${stats?.total_revenue?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Tenants */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tenants</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/tenants/list'}
          >
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {stats?.recent_tenants?.slice(0, 5).map((tenant: any) => (
            <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{tenant.name}</p>
                <p className="text-sm text-gray-600">
                  {tenant.tenant_type} • {new Date(tenant.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-md ${
                  tenant.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
                  tenant.subscription_status === 'trial' ? 'bg-yellow-100 text-yellow-700' :
                  tenant.subscription_status === 'expired' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {tenant.subscription_status}
                </span>
              </div>
            </div>
          ))}
          {(!stats?.recent_tenants || stats.recent_tenants.length === 0) && (
            <p className="text-gray-500 text-center py-4">No recent tenants</p>
          )}
        </div>
      </Card>

      {/* Expiring Subscriptions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Expiring Subscriptions</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/tenants/subscriptions'}
          >
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {stats?.expiring_subscriptions?.slice(0, 5).map((subscription: any) => (
            <div key={subscription.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{subscription.tenant_name}</p>
                <p className="text-sm text-gray-600">
                  {subscription.plan_name} • Expires {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-700">
                  Expiring Soon
                </span>
              </div>
            </div>
          ))}
          {(!stats?.expiring_subscriptions || stats.expiring_subscriptions.length === 0) && (
            <p className="text-gray-500 text-center py-4">No expiring subscriptions</p>
          )}
        </div>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-indigo-500">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_subscriptions || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Storage Usage</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.usage_stats?.storage_usage || 0}%</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-500">
              <CogIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Module Usage</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.usage_stats?.module_usage || 0}%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Tenants;

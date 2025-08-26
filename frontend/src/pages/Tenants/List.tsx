import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { getPaginatedData, apiService } from '../../services/api';
import { 
  BuildingOfficeIcon, 
  FunnelIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface TenantListItem {
  id: string;
  name: string;
  slug: string;
  domain: string;
  subdomain: string;
  tenant_type: string;
  subscription_status: string;
  is_active: boolean;
  max_students: number;
  max_teachers: number;
  current_storage_gb: number;
  max_storage_gb: number;
  created_at: string;
  subscription_plan?: {
    name: string;
  };
}

interface Paginated<T> { count: number; results: T[]; }

const TenantTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, string> = {
    school: 'bg-blue-100 text-blue-700',
    college: 'bg-green-100 text-green-700',
    university: 'bg-purple-100 text-purple-700',
    training_center: 'bg-orange-100 text-orange-700',
    corporate: 'bg-red-100 text-red-700',
  };
  const klass = map[type] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{type}</span>;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-yellow-100 text-yellow-700',
    suspended: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
    expired: 'bg-red-100 text-red-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{status}</span>;
};

const TenantsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [tenantType, setTenantType] = useState<string>('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [items, setItems] = useState<TenantListItem[]>([]);
  const [selected, setSelected] = useState<TenantListItem | null>(null);
  const [tenant, setTenant] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(() => ({ search, tenantType, subscriptionStatus, isActive }), [search, tenantType, subscriptionStatus, isActive]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.tenantType) params.tenant_type = filters.tenantType;
      if (filters.subscriptionStatus) params.subscription_status = filters.subscriptionStatus;
      if (filters.isActive) params.is_active = filters.isActive;
      
      const data = await getPaginatedData<TenantListItem>('/tenants/', page, pageSize, params) as unknown as Paginated<TenantListItem>;
      setItems(data.results || []);
      setTotal(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      // Mock data for demonstration
      const mockData: Paginated<TenantListItem> = {
        count: 25,
        results: [
          {
            id: '1',
            name: 'ABC School',
            slug: 'abc-school',
            domain: 'abc-school.example.com',
            subdomain: 'abc',
            tenant_type: 'school',
            subscription_status: 'active',
            is_active: true,
            max_students: 500,
            max_teachers: 50,
            current_storage_gb: 2.5,
            max_storage_gb: 10,
            created_at: '2024-01-15T10:30:00Z',
            subscription_plan: { name: 'Premium' }
          },
          {
            id: '2',
            name: 'XYZ College',
            slug: 'xyz-college',
            domain: 'xyz-college.example.com',
            subdomain: 'xyz',
            tenant_type: 'college',
            subscription_status: 'trial',
            is_active: true,
            max_students: 1000,
            max_teachers: 100,
            current_storage_gb: 1.8,
            max_storage_gb: 20,
            created_at: '2024-01-14T14:20:00Z',
            subscription_plan: { name: 'Standard' }
          }
        ]
      };
      setItems(mockData.results);
      setTotal(mockData.count);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters.search, filters.tenantType, filters.subscriptionStatus, filters.isActive]);

  const openTenant = async (row: TenantListItem) => {
    setSelected(row);
    try {
      const data = await apiService.get(`/tenants/${row.id}/`);
      setTenant(data);
    } catch (e) {
      setTenant(null);
    }
  };

  const toggleActive = async (row: TenantListItem) => {
    const action = row.is_active ? 'deactivate' : 'activate';
    await apiService.post(`/tenants/${row.id}/${action}/`);
    fetchTenants();
  };

  const remove = async (row: TenantListItem) => {
    if (!confirm('Delete this tenant? This cannot be undone.')) return;
    await apiService.delete(`/tenants/${row.id}/`);
    fetchTenants();
  };

  const exportTenants = async () => {
    try {
      const response = await apiService.get('/tenants/export/', { 
        params: { format: 'csv' },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tenants.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title="Tenants" 
          subtitle="Manage all multi-tenant organizations"
          right={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" onClick={exportTenants}>
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => window.location.href = '/tenants/create'}>
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                Add Tenant
              </Button>
            </div>
          }
        />
        
        <FilterBar
          searchPlaceholder="Search by name, domain, subdomain..."
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
        />

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Type</label>
                <select 
                  value={tenantType} 
                  onChange={(e) => { setTenantType(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">All Types</option>
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="university">University</option>
                  <option value="training_center">Training Center</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Status</label>
                <select 
                  value={subscriptionStatus} 
                  onChange={(e) => { setSubscriptionStatus(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={isActive} 
                  onChange={(e) => { setIsActive(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => { setTenantType(''); setSubscriptionStatus(''); setIsActive(''); setPage(1); }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600 border-b">
              <tr>
                <th className="py-3 pr-4 font-medium">Tenant</th>
                <th className="py-3 pr-4 font-medium">Type</th>
                <th className="py-3 pr-4 font-medium">Subscription</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Storage</th>
                <th className="py-3 pr-4 font-medium">Limits</th>
                <th className="py-3 pr-4 font-medium">Created</th>
                <th className="py-3 pr-0 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-8 text-center text-gray-500" colSpan={8}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-8 text-center text-gray-500" colSpan={8}>No tenants found.</td></tr>
              ) : (
                items.map(row => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 pr-4">
                      <div>
                        <p className="font-medium text-gray-900">{row.name}</p>
                        <p className="text-xs text-gray-500">{row.domain}</p>
                        <p className="text-xs text-gray-500">Subdomain: {row.subdomain}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <TenantTypeBadge type={row.tenant_type} />
                    </td>
                    <td className="py-4 pr-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {row.subscription_plan?.name || 'No Plan'}
                        </p>
                        <StatusBadge status={row.subscription_status} />
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-2 py-0.5 text-xs rounded-md ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-xs">
                        <p>{row.current_storage_gb} GB / {row.max_storage_gb} GB</p>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full" 
                            style={{ width: `${(row.current_storage_gb / row.max_storage_gb) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-xs">
                        <p>Students: {row.max_students}</p>
                        <p>Teachers: {row.max_teachers}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="py-4 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openTenant(row)}
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/tenants/${row.id}/edit`}
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/tenants/${row.id}/modules`}
                          title="Modules"
                        >
                          <CogIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/tenants/${row.id}/subscriptions`}
                          title="Subscriptions"
                        >
                          <CreditCardIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleActive(row)}
                          title={row.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {row.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => remove(row)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Card>

      {/* Tenant Detail Modal */}
      {selected && (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selected.name}</h3>
              <p className="text-sm text-gray-600">
                {selected.tenant_type} • {selected.domain}
              </p>
            </div>
            <Button variant="outline" onClick={() => { setSelected(null); setTenant(null); }}>
              Close
            </Button>
          </div>
          {tenant ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tenant Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{tenant.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2"><TenantTypeBadge type={tenant.tenant_type} /></span>
                  </div>
                  <div>
                    <span className="text-gray-500">Domain:</span>
                    <span className="ml-2 font-medium">{tenant.domain}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Subdomain:</span>
                    <span className="ml-2 font-medium">{tenant.subdomain}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Subscription Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Plan:</span>
                    <span className="ml-2 font-medium">{tenant.subscription_plan?.name || 'No Plan'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2"><StatusBadge status={tenant.subscription_status} /></span>
                  </div>
                  <div>
                    <span className="text-gray-500">Active:</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-md ${tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {tenant.is_active ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Usage & Limits</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Storage:</span>
                    <span className="ml-2 font-medium">{tenant.current_storage_gb} GB / {tenant.max_storage_gb} GB</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Students:</span>
                    <span className="ml-2 font-medium">{tenant.max_students}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Teachers:</span>
                    <span className="ml-2 font-medium">{tenant.max_teachers}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-600">Loading tenant details...</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default TenantsList;

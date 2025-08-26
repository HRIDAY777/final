import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  registrationDate: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'suspended';
  customerType: 'student' | 'teacher' | 'parent' | 'general';
  loyaltyPoints: number;
  averageOrderValue: number;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageOrderValue: number;
  topSpenders: number;
  customerRetentionRate: number;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomersThisMonth: 0,
    averageOrderValue: 0,
    topSpenders: 0,
    customerRetentionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        fullName: 'Ahmed Khan',
        email: 'ahmed.khan@email.com',
        phone: '+880 1712-345678',
        address: '123 Main Street',
        city: 'Dhaka',
        country: 'Bangladesh',
        registrationDate: '2024-01-01',
        lastOrderDate: '2024-01-15',
        totalOrders: 15,
        totalSpent: 12500,
        status: 'active',
        customerType: 'student',
        loyaltyPoints: 1250,
        averageOrderValue: 833
      },
      {
        id: '2',
        fullName: 'Fatima Rahman',
        email: 'fatima.rahman@email.com',
        phone: '+880 1812-345678',
        address: '456 Oak Avenue',
        city: 'Chittagong',
        country: 'Bangladesh',
        registrationDate: '2023-12-15',
        lastOrderDate: '2024-01-12',
        totalOrders: 8,
        totalSpent: 6800,
        status: 'active',
        customerType: 'teacher',
        loyaltyPoints: 680,
        averageOrderValue: 850
      },
      {
        id: '3',
        fullName: 'Mohammed Ali',
        email: 'mohammed.ali@email.com',
        phone: '+880 1912-345678',
        address: '789 Pine Road',
        city: 'Sylhet',
        country: 'Bangladesh',
        registrationDate: '2023-11-20',
        lastOrderDate: '2024-01-10',
        totalOrders: 22,
        totalSpent: 18500,
        status: 'active',
        customerType: 'parent',
        loyaltyPoints: 1850,
        averageOrderValue: 841
      },
      {
        id: '4',
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+880 1612-345678',
        address: '321 Elm Street',
        city: 'Dhaka',
        country: 'Bangladesh',
        registrationDate: '2024-01-05',
        lastOrderDate: '2024-01-08',
        totalOrders: 3,
        totalSpent: 2100,
        status: 'active',
        customerType: 'student',
        loyaltyPoints: 210,
        averageOrderValue: 700
      },
      {
        id: '5',
        fullName: 'David Brown',
        email: 'david.brown@email.com',
        phone: '+880 1512-345678',
        address: '654 Maple Drive',
        city: 'Rajshahi',
        country: 'Bangladesh',
        registrationDate: '2023-10-10',
        lastOrderDate: '2023-12-20',
        totalOrders: 12,
        totalSpent: 9500,
        status: 'inactive',
        customerType: 'general',
        loyaltyPoints: 950,
        averageOrderValue: 792
      }
    ];

    const mockStats: CustomerStats = {
      totalCustomers: 892,
      activeCustomers: 756,
      newCustomersThisMonth: 45,
      averageOrderValue: 148.5,
      topSpenders: 23,
      customerRetentionRate: 84.7
    };

    setTimeout(() => {
      setCustomers(mockCustomers);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      teacher: 'bg-purple-100 text-purple-800',
      parent: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const getLoyaltyLevel = (points: number) => {
    if (points >= 1000) return { level: 'Gold', color: 'text-yellow-600' };
    if (points >= 500) return { level: 'Silver', color: 'text-gray-600' };
    return { level: 'Bronze', color: 'text-orange-600' };
  };

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesType = typeFilter === 'all' || customer.customerType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(customer => customer.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setCustomers(customers.map(customer => 
      customer.id === id 
        ? { ...customer, status: customer.status === 'active' ? 'inactive' : 'active' }
        : customer
    ));
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer accounts, profiles, and loyalty programs
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.activeCustomers} active</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newCustomersThisMonth}</p>
                <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
                <p className="text-sm text-gray-500 mt-1">Per customer</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats.customerRetentionRate)}</p>
                <p className="text-sm text-gray-500 mt-1">Customer loyalty</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <StarIcon className="h-6 w-6 text-orange-600" />
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
                    placeholder="Search customers by name, email, or phone..."
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader title={`Customers (${filteredCustomers.length})`} />
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders & Spending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyalty
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
                {filteredCustomers.map((customer) => {
                  const loyaltyLevel = getLoyaltyLevel(customer.loyaltyPoints);
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
                          <div className="text-sm text-gray-500">{getTypeBadge(customer.customerType)}</div>
                          <div className="text-xs text-gray-400">
                            Joined {new Date(customer.registrationDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                        <div className="text-xs text-gray-400">{customer.city}, {customer.country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{customer.totalOrders} orders</div>
                        <div className="text-sm text-gray-900">{formatCurrency(customer.totalSpent)}</div>
                        <div className="text-xs text-gray-500">
                          Avg: {formatCurrency(customer.averageOrderValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{customer.loyaltyPoints} points</div>
                        <div className={`text-sm font-medium ${loyaltyLevel.color}`}>
                          {loyaltyLevel.level} Member
                        </div>
                        <div className="text-xs text-gray-500">
                          Last order: {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(customer);
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
                            onClick={() => handleToggleStatus(customer.id)}
                            className={`flex items-center gap-1 ${
                              customer.status === 'active' ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {customer.status === 'active' ? (
                              <XCircleIcon className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                            {customer.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
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
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <UserGroupIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding a new customer.'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                <div className="mt-6">
                  <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add Customer
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Customer Details Modal */}
      {isDetailsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
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
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedCustomer.fullName}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Type:</span>
                      <span className="ml-2">{getTypeBadge(selectedCustomer.customerType)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedCustomer.status)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{selectedCustomer.address}, {selectedCustomer.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Statistics */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Order Statistics</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Total Orders:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedCustomer.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Spent:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{formatCurrency(selectedCustomer.totalSpent)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Average Order:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{formatCurrency(selectedCustomer.averageOrderValue)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Loyalty Program</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Loyalty Points:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedCustomer.loyaltyPoints}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Level:</span>
                      <span className={`text-sm font-medium ml-2 ${getLoyaltyLevel(selectedCustomer.loyaltyPoints).color}`}>
                        {getLoyaltyLevel(selectedCustomer.loyaltyPoints).level}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Order:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {selectedCustomer.lastOrderDate ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleToggleStatus(selectedCustomer.id)}
                >
                  {selectedCustomer.status === 'active' ? 'Deactivate' : 'Activate'} Customer
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    // TODO: Navigate to customer orders
                  }}
                >
                  View Orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

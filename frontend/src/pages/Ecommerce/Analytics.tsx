import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  StarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface SalesData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  stock: number;
  rating: number;
  growth: number;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  retentionRate: number;
}

interface TopCategory {
  name: string;
  sales: number;
  revenue: number;
  growth: number;
  products: number;
}

interface ConversionMetrics {
  cartAbandonmentRate: number;
  checkoutConversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  repeatPurchaseRate: number;
}

const Analytics: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics>({
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    averageOrderValue: 0,
    customerLifetimeValue: 0,
    retentionRate: 0
  });
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics>({
    cartAbandonmentRate: 0,
    checkoutConversionRate: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    repeatPurchaseRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('12');

  // Mock data for demonstration
  useEffect(() => {
    const mockSalesData: SalesData[] = [
      { month: 'Jan', revenue: 185000, orders: 1247, customers: 892, averageOrderValue: 148.5 },
      { month: 'Feb', revenue: 172000, orders: 1156, customers: 823, averageOrderValue: 148.8 },
      { month: 'Mar', revenue: 198000, orders: 1324, customers: 945, averageOrderValue: 149.5 },
      { month: 'Apr', revenue: 165000, orders: 1102, customers: 789, averageOrderValue: 149.7 },
      { month: 'May', revenue: 210000, orders: 1401, customers: 1002, averageOrderValue: 149.9 },
      { month: 'Jun', revenue: 195000, orders: 1302, customers: 931, averageOrderValue: 149.8 },
      { month: 'Jul', revenue: 220000, orders: 1467, customers: 1048, averageOrderValue: 150.0 },
      { month: 'Aug', revenue: 205000, orders: 1367, customers: 976, averageOrderValue: 149.9 },
      { month: 'Sep', revenue: 235000, orders: 1567, customers: 1120, averageOrderValue: 150.0 },
      { month: 'Oct', revenue: 218000, orders: 1453, customers: 1038, averageOrderValue: 150.1 },
      { month: 'Nov', revenue: 242000, orders: 1613, customers: 1152, averageOrderValue: 150.0 },
      { month: 'Dec', revenue: 225000, orders: 1500, customers: 1071, averageOrderValue: 150.0 }
    ];

    const mockProductPerformance: ProductPerformance[] = [
      {
        id: '1',
        name: 'Advanced Mathematics Textbook',
        category: 'Books',
        sales: 156,
        revenue: 70200,
        stock: 23,
        rating: 4.8,
        growth: 15.2
      },
      {
        id: '2',
        name: 'Premium Stationery Set',
        category: 'Stationery',
        sales: 89,
        revenue: 22250,
        stock: 45,
        rating: 4.6,
        growth: 8.7
      },
      {
        id: '3',
        name: 'Scientific Calculator',
        category: 'Accessories',
        sales: 67,
        revenue: 80400,
        stock: 12,
        rating: 4.9,
        growth: 12.3
      },
      {
        id: '4',
        name: 'English Literature Collection',
        category: 'Books',
        sales: 134,
        revenue: 50920,
        stock: 8,
        rating: 4.7,
        growth: 18.5
      },
      {
        id: '5',
        name: 'Art Supplies Kit',
        category: 'Stationery',
        sales: 78,
        revenue: 19500,
        stock: 32,
        rating: 4.5,
        growth: 6.8
      }
    ];

    const mockCustomerAnalytics: CustomerAnalytics = {
      totalCustomers: 892,
      newCustomers: 45,
      returningCustomers: 756,
      averageOrderValue: 148.5,
      customerLifetimeValue: 1250,
      retentionRate: 84.7
    };

    const mockTopCategories: TopCategory[] = [
      {
        name: 'Books',
        sales: 125000,
        revenue: 185000,
        growth: 15.2,
        products: 89
      },
      {
        name: 'Stationery',
        sales: 45000,
        revenue: 68000,
        growth: 8.7,
        products: 67
      },
      {
        name: 'Accessories',
        sales: 15000,
        revenue: 22000,
        growth: 12.3,
        products: 45
      },
      {
        name: 'Print & Bind',
        sales: 5000,
        revenue: 8000,
        growth: 5.8,
        products: 23
      }
    ];

    const mockConversionMetrics: ConversionMetrics = {
      cartAbandonmentRate: 23.5,
      checkoutConversionRate: 76.5,
      averageSessionDuration: 4.2,
      bounceRate: 32.1,
      repeatPurchaseRate: 68.4
    };

    setTimeout(() => {
      setSalesData(mockSalesData);
      setProductPerformance(mockProductPerformance);
      setCustomerAnalytics(mockCustomerAnalytics);
      setTopCategories(mockTopCategories);
      setConversionMetrics(mockConversionMetrics);
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

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (growth < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400" />;
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        <StarIcon className="h-3 w-3 text-yellow-400" />
        <span className="text-xs text-gray-600 ml-1">{rating}</span>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">E-commerce Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive sales analytics and business intelligence
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
            <option value="24">Last 24 months</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(salesData.reduce((sum, data) => sum + data.revenue, 0))}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(12.5)}
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesData.reduce((sum, data) => sum + data.orders, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Avg: {formatCurrency(salesData.reduce((sum, data) => sum + data.averageOrderValue, 0) / salesData.length)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customerAnalytics.totalCustomers}</p>
                <p className="text-sm text-gray-500 mt-1">{customerAnalytics.newCustomers} new this month</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(conversionMetrics.checkoutConversionRate)}</p>
                <p className="text-sm text-gray-500 mt-1">Checkout success</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader title="Sales Trend" />
        <div className="p-6">
          <div className="space-y-4">
            {salesData.slice(-6).map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(data.revenue)}</p>
                  <p className="text-xs text-gray-500">{data.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Product Performance and Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Performance */}
        <Card>
          <CardHeader title="Top Performing Products" />
          <div className="p-6">
            <div className="space-y-4">
              {productPerformance.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                      <div className="flex items-center gap-2">
                        {getGrowthIcon(product.growth)}
                        <span className="text-xs text-green-600">+{product.growth}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <div className="flex items-center gap-4 mt-1">
                      {getRatingStars(product.rating)}
                      <span className="text-xs text-gray-500">{product.sales} sold</span>
                      <span className="text-xs text-gray-500">{product.stock} in stock</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader title="Top Categories" />
          <div className="p-6">
            <div className="space-y-4">
              {topCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <div className="flex items-center gap-2">
                      {getGrowthIcon(category.growth)}
                      <span className="text-xs text-green-600">+{category.growth}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(category.revenue / Math.max(...topCategories.map(c => c.revenue))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(category.revenue)}</span>
                    <span>{category.products} products</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Analytics and Conversion Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Analytics */}
        <Card>
          <CardHeader title="Customer Analytics" />
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{customerAnalytics.totalCustomers}</p>
                  <p className="text-sm text-gray-600">Total Customers</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{customerAnalytics.newCustomers}</p>
                  <p className="text-sm text-gray-600">New This Month</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Order Value</span>
                  <span className="text-sm font-medium">{formatCurrency(customerAnalytics.averageOrderValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                  <span className="text-sm font-medium">{formatCurrency(customerAnalytics.customerLifetimeValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Retention Rate</span>
                  <span className="text-sm font-medium">{formatPercentage(customerAnalytics.retentionRate)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Conversion Metrics */}
        <Card>
          <CardHeader title="Conversion Metrics" />
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">Checkout Conversion</span>
                </div>
                <span className="text-sm font-medium">{formatPercentage(conversionMetrics.checkoutConversionRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-gray-700">Cart Abandonment</span>
                </div>
                <span className="text-sm font-medium">{formatPercentage(conversionMetrics.cartAbandonmentRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-700">Session Duration</span>
                </div>
                <span className="text-sm font-medium">{conversionMetrics.averageSessionDuration} min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-700">Bounce Rate</span>
                </div>
                <span className="text-sm font-medium">{formatPercentage(conversionMetrics.bounceRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-700">Repeat Purchase</span>
                </div>
                <span className="text-sm font-medium">{formatPercentage(conversionMetrics.repeatPurchaseRate)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <EyeIcon className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <ArrowDownTrayIcon className="h-6 w-6" />
              <span className="text-sm">Export Data</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <CogIcon className="h-6 w-6" />
              <span className="text-sm">Settings</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <ChartBarIcon className="h-6 w-6" />
              <span className="text-sm">Advanced Analytics</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;

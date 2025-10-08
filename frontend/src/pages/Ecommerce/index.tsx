import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  PlusIcon,
  ArrowRightIcon,
  StarIcon,
  TagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface EcommerceStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  monthlyGrowth: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

interface PopularProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  sales: number;
  stock: number;
  rating: number;
  image?: string;
}

interface TopCategory {
  name: string;
  sales: number;
  products: number;
  growth: number;
}

const EcommercePage: React.FC = () => {
  const [stats, setStats] = useState<EcommerceStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    monthlyGrowth: 0,
    lowStockProducts: 0
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockStats: EcommerceStats = {
      totalProducts: 245,
      totalOrders: 1247,
      totalRevenue: 185000,
      totalCustomers: 892,
      averageOrderValue: 148.5,
      conversionRate: 3.2,
      monthlyGrowth: 12.5,
      lowStockProducts: 18
    };

    const mockRecentOrders: RecentOrder[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        customerName: 'Ahmed Khan',
        amount: 1250,
        status: 'delivered',
        date: '2024-01-15T10:30:00Z',
        items: 3
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        customerName: 'Fatima Rahman',
        amount: 850,
        status: 'shipped',
        date: '2024-01-15T09:15:00Z',
        items: 2
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        customerName: 'Mohammed Ali',
        amount: 2100,
        status: 'paid',
        date: '2024-01-15T08:45:00Z',
        items: 5
      },
      {
        id: '4',
        orderNumber: 'ORD-2024-004',
        customerName: 'Sarah Johnson',
        amount: 650,
        status: 'pending',
        date: '2024-01-15T08:20:00Z',
        items: 1
      },
      {
        id: '5',
        orderNumber: 'ORD-2024-005',
        customerName: 'David Brown',
        amount: 1800,
        status: 'cancelled',
        date: '2024-01-15T07:55:00Z',
        items: 4
      }
    ];

    const mockPopularProducts: PopularProduct[] = [
      {
        id: '1',
        name: 'Advanced Mathematics Textbook',
        category: 'Books',
        price: 450,
        sales: 156,
        stock: 23,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200'
      },
      {
        id: '2',
        name: 'Premium Stationery Set',
        category: 'Stationery',
        price: 250,
        sales: 89,
        stock: 45,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1519681392559-0f7f1f2f12c4?w=200'
      },
      {
        id: '3',
        name: 'Scientific Calculator',
        category: 'Accessories',
        price: 1200,
        sales: 67,
        stock: 12,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200'
      },
      {
        id: '4',
        name: 'English Literature Collection',
        category: 'Books',
        price: 380,
        sales: 134,
        stock: 8,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?w=200'
      }
    ];

    const mockTopCategories: TopCategory[] = [
      {
        name: 'Books',
        sales: 125000,
        products: 89,
        growth: 15.2
      },
      {
        name: 'Stationery',
        sales: 45000,
        products: 67,
        growth: 8.7
      },
      {
        name: 'Accessories',
        sales: 15000,
        products: 45,
        growth: 12.3
      },
      {
        name: 'Print & Bind',
        sales: 5000,
        products: 23,
        growth: 5.8
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
      setPopularProducts(mockPopularProducts);
      setTopCategories(mockTopCategories);
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
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (growth < 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 transform rotate-180" />;
    }
    return <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400" />;
  };

  const ecommerceModules = [
    {
      title: 'Product Catalog',
      description: 'Manage products, categories, and inventory',
      icon: ShoppingBagIcon,
      path: '/ecommerce/products',
      metric: `${stats.totalProducts} Products`,
      color: 'bg-blue-500'
    },
    {
      title: 'Order Management',
      description: 'Process orders, track shipments, and manage status',
      icon: ShoppingCartIcon,
      path: '/ecommerce/orders',
      metric: `${stats.totalOrders} Orders`,
      color: 'bg-green-500'
    },
    {
      title: 'Shopping Cart',
      description: 'View and manage customer shopping carts',
      icon: ShoppingCartIcon,
      path: '/ecommerce/cart',
      metric: 'Cart Management',
      color: 'bg-purple-500'
    },
    {
      title: 'Customer Management',
      description: 'Manage customer accounts and profiles',
      icon: UserGroupIcon,
      path: '/ecommerce/customers',
      metric: `${stats.totalCustomers} Customers`,
      color: 'bg-orange-500'
    },
    {
      title: 'Analytics & Reports',
      description: 'Sales analytics, performance metrics, and insights',
      icon: ChartBarIcon,
      path: '/ecommerce/analytics',
      metric: 'Business Intelligence',
      color: 'bg-indigo-500'
    },
    {
      title: 'Inventory Management',
      description: 'Track stock levels, low stock alerts, and reordering',
      icon: TagIcon,
      path: '/ecommerce/inventory',
      metric: `${stats.lowStockProducts} Low Stock`,
      color: 'bg-red-500'
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">E-commerce Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete online store management system for educational products
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <EyeIcon className="h-4 w-4" />
            View Store
          </Button>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Product
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(stats.monthlyGrowth)}
                  <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-gray-500 mt-1">Avg: {formatCurrency(stats.averageOrderValue)}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-red-500 mt-1">{stats.lowStockProducts} low stock</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                <p className="text-sm text-gray-500 mt-1">{formatPercentage(stats.conversionRate)} conversion</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* E-commerce Modules */}
      <Card>
        <CardHeader title="E-commerce Modules" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecommerceModules.map((module) => (
              <Link
                key={module.title}
                to={module.path}
                className="group block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${module.color}`}>
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-600">{module.metric}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{module.description}</p>
                    <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                      <span>Access Module</span>
                      <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Orders and Popular Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader 
            title="Recent Orders" 
            right={
              <Link to="/ecommerce/orders" className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </Link>
            }
          />
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{order.orderNumber}</h4>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.customerName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.date).toLocaleDateString()} • {order.items} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Popular Products */}
        <Card>
          <CardHeader 
            title="Popular Products" 
            right={
              <Link to="/ecommerce/products" className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </Link>
            }
          />
          <div className="p-6">
            <div className="space-y-4">
              {popularProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBagIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <StarIcon className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{product.sales} sold</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-gray-500">{product.stock} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader title="Top Categories" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topCategories.map((category) => (
              <div key={category.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(category.growth)}
                    <span className="text-xs text-green-600">+{category.growth}%</span>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(category.sales)}</p>
                <p className="text-xs text-gray-500">{category.products} products</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <PlusIcon className="h-6 w-6" />
              <span className="text-sm">Add Product</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <ShoppingCartIcon className="h-6 w-6" />
              <span className="text-sm">Process Orders</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <TruckIcon className="h-6 w-6" />
              <span className="text-sm">Track Shipments</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <ChartBarIcon className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EcommercePage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  BanknotesIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  PlusIcon,
  EyeIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

interface FinanceStats {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  collectionRate: number;
  outstandingAmount: number;
  monthlyGrowth: number;
  activePlans: number;
}

interface RecentActivity {
  id: string;
  type: 'invoice_created' | 'payment_received' | 'invoice_overdue' | 'plan_updated';
  title: string;
  description: string;
  amount?: number;
  date: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const FinancePage: React.FC = () => {
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    collectionRate: 0,
    outstandingAmount: 0,
    monthlyGrowth: 0,
    activePlans: 0
  });

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'payment_received',
      title: 'Payment Received',
      description: 'Ahmed Khan paid invoice INV-2024-001',
      amount: 850,
      date: '2024-01-15T10:30:00Z',
      status: 'success'
    },
    {
      id: '2',
      type: 'invoice_created',
      title: 'Invoice Created',
      description: 'New invoice generated for Fatima Rahman',
      amount: 1200,
      date: '2024-01-15T09:15:00Z',
      status: 'info'
    },
    {
      id: '3',
      type: 'invoice_overdue',
      title: 'Invoice Overdue',
      description: 'Invoice INV-2024-045 is 15 days overdue',
      amount: 950,
      date: '2024-01-15T08:45:00Z',
      status: 'warning'
    },
    {
      id: '4',
      type: 'plan_updated',
      title: 'Plan Updated',
      description: 'Premium plan activated for Class 10A',
      date: '2024-01-15T08:20:00Z',
      status: 'success'
    }
  ]);

  // Mock data for demonstration
  useEffect(() => {
    const mockStats: FinanceStats = {
      totalRevenue: 2450000,
      totalInvoices: 1247,
      paidInvoices: 1153,
      overdueInvoices: 94,
      collectionRate: 92.5,
      outstandingAmount: 185000,
      monthlyGrowth: 8.5,
      activePlans: 45
    };

    setTimeout(() => {
      setStats(mockStats);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'invoice_created':
        return <DocumentTextIcon className="h-5 w-5 text-blue-600" />;
      case 'invoice_overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'plan_updated':
        return <CreditCardIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const financeModules = [
    {
      title: 'Financial Dashboard',
      description: 'Comprehensive financial overview and analytics',
      icon: ChartBarIcon,
      path: '/finance/dashboard',
      metric: 'Real-time Data',
      color: 'bg-blue-500'
    },
    {
      title: 'Billing & Invoices',
      description: 'Manage invoices, payments, and billing cycles',
      icon: DocumentTextIcon,
      path: '/finance/billing',
      metric: `${stats.totalInvoices} Invoices`,
      color: 'bg-green-500'
    },
    {
      title: 'Fee Management',
      description: 'Configure and manage student fees and charges',
      icon: BanknotesIcon,
      path: '/finance/fees',
      metric: 'Fee Structure',
      color: 'bg-purple-500'
    },
    {
      title: 'Payment Processing',
      description: 'Process payments and manage payment methods',
      icon: ReceiptRefundIcon,
      path: '/finance/payments',
      metric: 'Payment Gateway',
      color: 'bg-orange-500'
    },
    {
      title: 'Subscription Plans',
      description: 'Manage subscription plans and pricing tiers',
      icon: CreditCardIcon,
      path: '/finance/plans',
      metric: `${stats.activePlans} Active Plans`,
      color: 'bg-indigo-500'
    },
    {
      title: 'Financial Reports',
      description: 'Generate comprehensive financial reports and analytics',
      icon: DocumentChartBarIcon,
      path: '/finance/reports',
      metric: 'Advanced Analytics',
      color: 'bg-red-500'
    },
    {
      title: 'Settings & Configuration',
      description: 'Configure payment gateways and system preferences',
      icon: CogIcon,
      path: '/finance/settings',
      metric: 'System Settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Finance Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete financial management system for educational institutions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <EyeIcon className="h-4 w-4" />
            View Dashboard
          </Button>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                                 <div className="flex items-center gap-1 mt-1">
                   <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                   <span className="text-sm text-green-600">+{stats.monthlyGrowth}%</span>
                 </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BanknotesIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats.collectionRate)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.paidInvoices} of {stats.totalInvoices} invoices</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.outstandingAmount)}</p>
                <p className="text-sm text-red-500 mt-1">{stats.overdueInvoices} overdue invoices</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activePlans}</p>
                <p className="text-sm text-gray-500 mt-1">Subscription plans</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CreditCardIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Finance Modules */}
      <Card>
        <CardHeader title="Finance Modules" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financeModules.map((module) => (
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

      {/* Recent Activities */}
      <Card>
        <CardHeader title="Recent Activities" />
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {activity.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  {activity.amount && (
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatCurrency(activity.amount)}
                    </p>
                  )}
                </div>
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
              <span className="text-sm">Create Invoice</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <ReceiptRefundIcon className="h-6 w-6" />
              <span className="text-sm">Process Payment</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <DocumentChartBarIcon className="h-6 w-6" />
              <span className="text-sm">Generate Report</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <CogIcon className="h-6 w-6" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinancePage;

import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PlusIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  grossProfit: number;
  profitMargin: number;
  collectionRate: number;
  averageInvoiceValue: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalStudents: number;
  averageFeePerStudent: number;
  monthlyGrowth: number;
  outstandingAmount: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  invoices: number;
  payments: number;
}

interface FeeAnalysis {
  feeType: string;
  totalAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  collectionRate: number;
  studentCount: number;
}

interface PaymentMethodData {
  method: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

interface RecentTransaction {
  id: string;
  studentName: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  invoiceNumber: string;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    grossProfit: 0,
    profitMargin: 0,
    collectionRate: 0,
    averageInvoiceValue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    totalStudents: 0,
    averageFeePerStudent: 0,
    monthlyGrowth: 0,
    outstandingAmount: 0
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [feeAnalysis, setFeeAnalysis] = useState<FeeAnalysis[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockMetrics: FinancialMetrics = {
      totalRevenue: 2450000,
      totalExpenses: 1850000,
      netIncome: 600000,
      grossProfit: 700000,
      profitMargin: 24.5,
      collectionRate: 92.5,
      averageInvoiceValue: 850,
      totalInvoices: 1247,
      paidInvoices: 1153,
      overdueInvoices: 94,
      totalStudents: 1247,
      averageFeePerStudent: 850,
      monthlyGrowth: 8.5,
      outstandingAmount: 185000
    };

    const mockRevenueData: RevenueData[] = [
      { month: 'Jan', revenue: 185000, expenses: 145000, netIncome: 40000, invoices: 156, payments: 142 },
      { month: 'Feb', revenue: 172000, expenses: 138000, netIncome: 34000, invoices: 148, payments: 135 },
      { month: 'Mar', revenue: 198000, expenses: 152000, netIncome: 46000, invoices: 167, payments: 158 },
      { month: 'Apr', revenue: 165000, expenses: 142000, netIncome: 23000, invoices: 139, payments: 125 },
      { month: 'May', revenue: 210000, expenses: 158000, netIncome: 52000, invoices: 178, payments: 172 },
      { month: 'Jun', revenue: 195000, expenses: 155000, netIncome: 40000, invoices: 165, payments: 158 },
      { month: 'Jul', revenue: 220000, expenses: 162000, netIncome: 58000, invoices: 185, payments: 178 },
      { month: 'Aug', revenue: 205000, expenses: 159000, netIncome: 46000, invoices: 173, payments: 165 },
      { month: 'Sep', revenue: 235000, expenses: 168000, netIncome: 67000, invoices: 198, payments: 192 },
      { month: 'Oct', revenue: 218000, expenses: 164000, netIncome: 54000, invoices: 184, payments: 176 },
      { month: 'Nov', revenue: 242000, expenses: 172000, netIncome: 70000, invoices: 204, payments: 198 },
      { month: 'Dec', revenue: 225000, expenses: 169000, netIncome: 56000, invoices: 190, payments: 183 }
    ];

    const mockFeeAnalysis: FeeAnalysis[] = [
      {
        feeType: 'Tuition Fee',
        totalAmount: 1800000,
        collectedAmount: 1680000,
        pendingAmount: 120000,
        collectionRate: 93.3,
        studentCount: 1247
      },
      {
        feeType: 'Library Fee',
        totalAmount: 125000,
        collectedAmount: 118000,
        pendingAmount: 7000,
        collectionRate: 94.4,
        studentCount: 1247
      },
      {
        feeType: 'Transport Fee',
        totalAmount: 320000,
        collectedAmount: 295000,
        pendingAmount: 25000,
        collectionRate: 92.2,
        studentCount: 856
      },
      {
        feeType: 'Meal Fee',
        totalAmount: 205000,
        collectedAmount: 189000,
        pendingAmount: 16000,
        collectionRate: 92.2,
        studentCount: 1023
      }
    ];

    const mockPaymentMethods: PaymentMethodData[] = [
      {
        method: 'Credit Card',
        totalAmount: 980000,
        transactionCount: 1153,
        percentage: 40.0
      },
      {
        method: 'Bank Transfer',
        totalAmount: 735000,
        transactionCount: 865,
        percentage: 30.0
      },
      {
        method: 'Cash',
        totalAmount: 490000,
        transactionCount: 578,
        percentage: 20.0
      },
      {
        method: 'Online Payment',
        totalAmount: 245000,
        transactionCount: 289,
        percentage: 10.0
      }
    ];

    const mockRecentTransactions: RecentTransaction[] = [
      {
        id: '1',
        studentName: 'Ahmed Khan',
        amount: 850,
        method: 'Credit Card',
        status: 'completed',
        date: '2024-01-15T10:30:00Z',
        invoiceNumber: 'INV-2024-001'
      },
      {
        id: '2',
        studentName: 'Fatima Rahman',
        amount: 1200,
        method: 'Bank Transfer',
        status: 'completed',
        date: '2024-01-15T09:15:00Z',
        invoiceNumber: 'INV-2024-002'
      },
      {
        id: '3',
        studentName: 'Mohammed Ali',
        amount: 650,
        method: 'Cash',
        status: 'completed',
        date: '2024-01-15T08:45:00Z',
        invoiceNumber: 'INV-2024-003'
      },
      {
        id: '4',
        studentName: 'Aisha Patel',
        amount: 950,
        method: 'Online Payment',
        status: 'pending',
        date: '2024-01-15T08:20:00Z',
        invoiceNumber: 'INV-2024-004'
      },
      {
        id: '5',
        studentName: 'Zara Ahmed',
        amount: 1100,
        method: 'Credit Card',
        status: 'failed',
        date: '2024-01-15T07:55:00Z',
        invoiceNumber: 'INV-2024-005'
      }
    ];

    setTimeout(() => {
      setMetrics(mockMetrics);
      setRevenueData(mockRevenueData);
      setFeeAnalysis(mockFeeAnalysis);
      setPaymentMethods(mockPaymentMethods);
      setRecentTransactions(mockRecentTransactions);
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
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
    } else if (growth < 0) {
      return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
    }
    return <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Finance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive financial overview and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            New Invoice
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.monthlyGrowth)}
                  <span className="text-sm text-green-600">+{metrics.monthlyGrowth}%</span>
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
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.netIncome)}</p>
                <p className="text-sm text-gray-500 mt-1">Profit Margin: {formatPercentage(metrics.profitMargin)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.collectionRate)}</p>
                <p className="text-sm text-gray-500 mt-1">{metrics.paidInvoices} of {metrics.totalInvoices} invoices</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.outstandingAmount)}</p>
                <p className="text-sm text-red-500 mt-1">{metrics.overdueInvoices} overdue invoices</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader title="Revenue Trend (Last 12 Months)" />
          <div className="p-6">
            <div className="space-y-4">
              {revenueData.slice(-6).map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(data.revenue)}</p>
                    <p className="text-xs text-gray-500">{data.invoices} invoices</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Fee Collection Analysis */}
        <Card>
          <CardHeader title="Fee Collection Analysis" />
          <div className="p-6">
            <div className="space-y-4">
              {feeAnalysis.map((fee, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{fee.feeType}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatPercentage(fee.collectionRate)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${fee.collectionRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(fee.collectedAmount)} collected</span>
                    <span>{formatCurrency(fee.pendingAmount)} pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Methods and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader title="Payment Methods" />
          <div className="p-6">
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{method.method}</p>
                      <p className="text-xs text-gray-500">{method.transactionCount} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(method.totalAmount)}</p>
                    <p className="text-xs text-gray-500">{method.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader title="Recent Transactions" />
          <div className="p-6">
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{transaction.studentName}</p>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.invoiceNumber} • {transaction.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
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
              <PlusIcon className="h-6 w-6" />
              <span className="text-sm">New Invoice</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <DocumentTextIcon className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <ReceiptRefundIcon className="h-6 w-6" />
              <span className="text-sm">Process Payments</span>
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

export default Dashboard;

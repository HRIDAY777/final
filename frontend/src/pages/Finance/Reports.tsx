import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  ReceiptRefundIcon
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

const Reports: React.FC = () => {
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
    averageFeePerStudent: 0
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [feeAnalysis, setFeeAnalysis] = useState<FeeAnalysis[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('12');
  const [selectedReport, setSelectedReport] = useState('overview');

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
      averageFeePerStudent: 850
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

    setTimeout(() => {
      setMetrics(mockMetrics);
      setRevenueData(mockRevenueData);
      setFeeAnalysis(mockFeeAnalysis);
      setPaymentMethods(mockPaymentMethods);
      setLoading(false);
    }, 1000);
  }, []);

  const reportTypes = [
    {
      id: 'overview',
      title: 'Financial Overview',
      description: 'Key financial metrics and performance indicators',
      icon: ChartBarIcon
    },
    {
      id: 'revenue',
      title: 'Revenue Analysis',
      description: 'Detailed revenue breakdown and trends',
      icon: ArrowTrendingUpIcon
    },
    {
      id: 'fees',
      title: 'Fee Collection',
      description: 'Fee-wise collection analysis and performance',
      icon: BanknotesIcon
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      description: 'Payment method analysis and preferences',
      icon: ReceiptRefundIcon
    }
  ];

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

  const handleExportReport = (type: string) => {
    console.log(`Exporting ${type} report`);
    // TODO: Implement export functionality
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financial Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive financial analytics and reporting
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
            <option value="24">Last 2 years</option>
          </select>
          <Button onClick={() => handleExportReport(selectedReport)} className="flex items-center gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => (
          <div
            key={report.id} 
            className={`cursor-pointer transition-all ${
              selectedReport === report.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <Card>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedReport === report.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <report.icon className={`h-5 w-5 ${
                    selectedReport === report.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${
                    selectedReport === report.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {report.title}
                  </h3>
                  <p className="text-xs text-gray-600">{report.description}</p>
                </div>
              </div>
            </div>
          </Card>
            </div>
        ))}
      </div>

      {/* Financial Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BanknotesIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Income</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.netIncome)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Collection Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.collectionRate)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overdue Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.overdueInvoices}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Financial Performance" />
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gross Profit</span>
                    <span className="font-semibold text-green-600">{formatCurrency(metrics.grossProfit)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className="font-semibold text-blue-600">{formatPercentage(metrics.profitMargin)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Invoice Value</span>
                    <span className="font-semibold">{formatCurrency(metrics.averageInvoiceValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Fee per Student</span>
                    <span className="font-semibold">{formatCurrency(metrics.averageFeePerStudent)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Invoice Statistics" />
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Invoices</span>
                    <span className="font-semibold">{metrics.totalInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Paid Invoices</span>
                    <span className="font-semibold text-green-600">{metrics.paidInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overdue Invoices</span>
                    <span className="font-semibold text-red-600">{metrics.overdueInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Students</span>
                    <span className="font-semibold">{metrics.totalStudents}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Revenue Analysis Report */}
      {selectedReport === 'revenue' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Monthly Revenue Analysis" />
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Income</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoices</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueData.map((data) => (
                      <tr key={data.month} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {data.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                          {formatCurrency(data.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {formatCurrency(data.expenses)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                          {formatCurrency(data.netIncome)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.invoices}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.payments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Fee Collection Report */}
      {selectedReport === 'fees' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Fee Collection Analysis" />
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collection Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeAnalysis.map((fee) => (
                      <tr key={fee.feeType} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fee.feeType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(fee.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                          {formatCurrency(fee.collectedAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {formatCurrency(fee.pendingAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            fee.collectionRate >= 90 ? 'bg-green-100 text-green-800' :
                            fee.collectionRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {formatPercentage(fee.collectionRate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fee.studentCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Methods Report */}
      {selectedReport === 'payments' && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Payment Method Analysis" />
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentMethods.map((method) => (
                      <tr key={method.method} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {method.method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {formatCurrency(method.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {method.transactionCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {formatPercentage(method.percentage)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(method.totalAmount / method.transactionCount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;



import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, CalendarIcon, ClockIcon, CheckCircleIcon,
  XCircleIcon, ExclamationTriangleIcon, ChartBarIcon,
  UserIcon, BuildingOfficeIcon, CreditCardIcon
} from '@heroicons/react/24/outline';
import DataTable from '../../components/CRUD/DataTable';
import FormBuilder from '../../components/Forms/FormBuilder';
import { apiService } from '../../services/api';

interface Finance {
  id: number;
  transaction_type: 'income' | 'expense' | 'refund' | 'fee';
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method: string;
  reference_number: string;
  student_name: string;
  student_id: string;
  created_by: string;
  notes: string;
  created_at: string;
}

const Finance: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Sample data for demo
  const sampleFinances: Finance[] = [
    {
      id: 1,
      transaction_type: 'income',
      category: 'Tuition Fee',
      amount: 2500.00,
      currency: 'USD',
      description: 'Semester tuition fee payment',
      date: '2024-02-15',
      due_date: '2024-02-15',
      status: 'paid',
      payment_method: 'Credit Card',
      reference_number: 'TXN-2024-001',
      student_name: 'John Doe',
      student_id: 'STU-001',
      created_by: 'Admin User',
      notes: 'Payment received on time',
      created_at: '2024-02-15T10:00:00Z'
    },
    {
      id: 2,
      transaction_type: 'expense',
      category: 'Equipment',
      amount: 1500.00,
      currency: 'USD',
      description: 'Purchase of laboratory equipment',
      date: '2024-02-10',
      due_date: '2024-02-10',
      status: 'paid',
      payment_method: 'Bank Transfer',
      reference_number: 'EXP-2024-001',
      student_name: 'N/A',
      student_id: 'N/A',
      created_by: 'Finance Manager',
      notes: 'Equipment delivered and installed',
      created_at: '2024-02-10T14:30:00Z'
    },
    {
      id: 3,
      transaction_type: 'income',
      category: 'Library Fine',
      amount: 25.00,
      currency: 'USD',
      description: 'Late book return fine',
      date: '2024-02-12',
      due_date: '2024-02-20',
      status: 'pending',
      payment_method: 'Cash',
      reference_number: 'FINE-2024-001',
      student_name: 'Sarah Smith',
      student_id: 'STU-002',
      created_by: 'Librarian',
      notes: 'Fine pending payment',
      created_at: '2024-02-12T09:15:00Z'
    }
  ];

  useEffect(() => {
    loadFinances();
  }, []);

  const loadFinances = async () => {
    try {
      setLoading(true);
      // In real app, this would be: const data = await apiService.get('/finance/');
      const data = sampleFinances;
      setFinances(data);
    } catch (error) {
      console.error('Error loading finances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingFinance(null);
    setShowForm(true);
  };

  const handleEdit = (finance: Finance) => {
    setEditingFinance(finance);
    setShowForm(true);
  };

  const handleDelete = async (finance: Finance) => {
    if (window.confirm(`Are you sure you want to delete this ${finance.transaction_type} transaction?`)) {
      try {
        // In real app, this would be: await apiService.delete(`/finance/${finance.id}/`);
        setFinances(prev => prev.filter(f => f.id !== finance.id));
      } catch (error) {
        console.error('Error deleting finance record:', error);
      }
    }
  };

  const handleView = (finance: Finance) => {
    // Navigate to finance detail page or show modal
    alert(`Viewing details for ${finance.transaction_type} transaction`);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      
      if (editingFinance) {
        // Update existing finance record
        // In real app: await apiService.put(`/finance/${editingFinance.id}/`, formData);
        setFinances(prev => prev.map(f => f.id === editingFinance.id ? { ...f, ...formData } : f));
      } else {
        // Create new finance record
        const newFinance = { ...formData, id: Date.now(), created_at: new Date().toISOString() };
        // In real app: const data = await apiService.post('/finance/', formData);
        setFinances(prev => [...prev, newFinance]);
      }
      
      setShowForm(false);
      setEditingFinance(null);
    } catch (error) {
      console.error('Error saving finance record:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: 'transaction',
      label: 'Transaction',
      sortable: true,
      render: (value: any, row: Finance) => (
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
            row.transaction_type === 'income' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <CurrencyDollarIcon className={`w-4 h-4 ${
              row.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.category}</div>
            <div className="text-sm text-gray-500">{row.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: any, row: Finance) => (
        <div className={`font-medium ${
          row.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
        }`}>
          {row.transaction_type === 'income' ? '+' : '-'}{row.currency} {row.amount.toFixed(2)}
        </div>
      )
    },
    {
      key: 'student',
      label: 'Student',
      render: (value: any, row: Finance) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium">{row.student_name}</span>
          </div>
          <div className="text-sm text-gray-500">{row.student_id}</div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value: any, row: Finance) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <CalendarIcon className="w-3 h-3 text-gray-400 mr-1" />
            {new Date(row.date).toLocaleDateString()}
          </div>
          {row.due_date !== row.date && (
            <div className="text-xs text-gray-500">
              Due: {new Date(row.due_date).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'payment_method',
      label: 'Payment Method',
      render: (value: any, row: Finance) => (
        <div className="flex items-center">
          <CreditCardIcon className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm">{row.payment_method}</span>
        </div>
      )
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (value: any, row: Finance) => (
        <span className="text-sm font-mono text-gray-600">{row.reference_number}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any, row: Finance) => {
        const statusConfig = {
          pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
          paid: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
          overdue: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
          cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon }
        };
        
        const config = statusConfig[row.status];
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        );
      }
    }
  ];

  const formFields = [
    { 
      name: 'transaction_type', 
      label: 'Transaction Type', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'income', label: 'Income' },
        { value: 'expense', label: 'Expense' },
        { value: 'refund', label: 'Refund' },
        { value: 'fee', label: 'Fee' }
      ]
    },
    { name: 'category', label: 'Category', type: 'text' as const, required: true },
    { name: 'amount', label: 'Amount', type: 'number' as const, required: true },
    { 
      name: 'currency', 
      label: 'Currency', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'JPY', label: 'JPY (¥)' }
      ]
    },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: true },
    { name: 'date', label: 'Transaction Date', type: 'date' as const, required: true },
    { name: 'due_date', label: 'Due Date', type: 'date' as const },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    { 
      name: 'payment_method', 
      label: 'Payment Method', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'Cash', label: 'Cash' },
        { value: 'Credit Card', label: 'Credit Card' },
        { value: 'Debit Card', label: 'Debit Card' },
        { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'Check', label: 'Check' },
        { value: 'Online Payment', label: 'Online Payment' }
      ]
    },
    { name: 'reference_number', label: 'Reference Number', type: 'text' as const, required: true },
    { name: 'student_name', label: 'Student Name', type: 'text' as const },
    { name: 'student_id', label: 'Student ID', type: 'text' as const },
    { name: 'created_by', label: 'Created By', type: 'text' as const, required: true },
    { name: 'notes', label: 'Notes', type: 'textarea' as const }
  ];

  // Calculate statistics
  const totalTransactions = finances.length;
  const totalIncome = finances
    .filter(f => f.transaction_type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = finances
    .filter(f => f.transaction_type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const pendingTransactions = finances.filter(f => f.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Management</h1>
          <p className="text-gray-600">Manage all financial transactions, income, and expenses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {!showForm && (
          <DataTable
            data={finances}
            columns={columns}
            title="Financial Transactions"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            loading={loading}
          />
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <FormBuilder
                fields={formFields}
                initialData={editingFinance || {}}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                title={editingFinance ? 'Edit Transaction' : 'Add New Transaction'}
                submitText={editingFinance ? 'Update Transaction' : 'Add Transaction'}
                loading={formLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;

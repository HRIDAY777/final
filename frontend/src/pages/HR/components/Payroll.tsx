import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Table, Badge, PageHeader } from '../../../components/UI';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: string;
  year: string;
  status: 'pending' | 'paid' | 'cancelled';
  paymentDate?: string;
}

const Payroll: React.FC = () => {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Mock data
  useEffect(() => {
    const mockPayrolls: PayrollRecord[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        position: 'Teacher',
        basicSalary: 50000,
        allowances: 5000,
        deductions: 2000,
        netSalary: 53000,
        month: 'January',
        year: '2024',
        status: 'paid',
        paymentDate: '2024-01-31'
      },
      {
        id: '2',
        employeeId: 'EMP002',
        employeeName: 'Jane Smith',
        position: 'Administrator',
        basicSalary: 45000,
        allowances: 4000,
        deductions: 1800,
        netSalary: 47200,
        month: 'January',
        year: '2024',
        status: 'paid',
        paymentDate: '2024-01-31'
      },
      {
        id: '3',
        employeeId: 'EMP003',
        employeeName: 'Mike Johnson',
        position: 'Teacher',
        basicSalary: 48000,
        allowances: 4500,
        deductions: 1900,
        netSalary: 50600,
        month: 'January',
        year: '2024',
        status: 'pending'
      }
    ];

    setTimeout(() => {
      setPayrolls(mockPayrolls);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'position', label: 'Position' },
    { key: 'basicSalary', label: 'Basic Salary', render: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'allowances', label: 'Allowances', render: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'deductions', label: 'Deductions', render: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'netSalary', label: 'Net Salary', render: (value: number) => `₹${value.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (value: string) => getStatusBadge(value) },
    { key: 'actions', label: 'Actions', render: () => (
      <div className="flex space-x-2">
        <Button size="sm" variant="outline">
          <EyeIcon className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline">
          <PencilIcon className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline">
          <DocumentArrowDownIcon className="w-4 h-4" />
        </Button>
      </div>
    )}
  ];

  const totalPayroll = payrolls.reduce((sum, payroll) => sum + payroll.netSalary, 0);
  const paidPayrolls = payrolls.filter(p => p.status === 'paid').length;
  const pendingPayrolls = payrolls.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payroll Management" 
        subtitle="Manage employee salaries, allowances, and deductions"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalPayroll.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">{paidPayrolls}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingPayrolls}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Salary</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{payrolls.length > 0 ? (totalPayroll / payrolls.length).toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payroll Records</h3>
            <div className="flex space-x-3">
              <Select 
                value={currentMonth.toString()}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              >
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </Select>
              <Select 
                value={currentYear.toString()}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </Select>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Generate Payroll
              </Button>
            </div>
          </div>

          <Table 
            data={payrolls}
            columns={columns}
            loading={loading}
            emptyMessage="No payroll records found"
          />
        </div>
      </Card>
    </div>
  );
};

export default Payroll;

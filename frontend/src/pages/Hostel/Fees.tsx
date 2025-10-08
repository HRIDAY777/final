import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';

import {
  CreditCardIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface StudentFee {
  id: number;
  student_name: string;
  student_id: string;
  fee_name: string;
  room_number: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  payment_status: string;
  notes: string;
  created_at: string;
}

interface FeeStructure {
  id: number;
  name: string;
  fee_type: string;
  amount: number;
  room_type: string;
  description: string;
}

const Fees: React.FC = () => {
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    payment_amount: 0,
    notes: ''
  });

  const [feeStructureForm, setFeeStructureForm] = useState({
    name: '',
    fee_type: '',
    amount: 0,
    room_type: '',
    description: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    payment_status: '',
    room_type: '',
    search: '',
  });

  // Stats
  const [stats, setStats] = useState({
    total_due: 0,
    total_collected: 0,
    overdue_count: 0,
    pending_count: 0
  });

  const fetchStudentFees = useCallback(async () => {
    try {
      // Mock data for demonstration
      const mockFees: StudentFee[] = [
        {
          id: 1,
          student_name: 'John Doe',
          student_id: 'STU001',
          fee_name: 'Monthly Hostel Fee',
          room_number: 'A-101',
          amount_due: 500,
          amount_paid: 500,
          balance: 0,
          due_date: '2024-01-31',
          payment_status: 'paid',
          notes: 'Paid on time',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          student_name: 'Jane Smith',
          student_id: 'STU002',
          fee_name: 'Monthly Hostel Fee',
          room_number: 'A-101',
          amount_due: 500,
          amount_paid: 300,
          balance: 200,
          due_date: '2024-01-31',
          payment_status: 'partial',
          notes: 'Partial payment received',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 3,
          student_name: 'Mike Johnson',
          student_id: 'STU003',
          fee_name: 'Monthly Hostel Fee',
          room_number: 'B-205',
          amount_due: 500,
          amount_paid: 0,
          balance: 500,
          due_date: '2024-01-15',
          payment_status: 'overdue',
          notes: 'Payment overdue',
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      // Apply filters
      let filteredFees = mockFees.filter(fee => {
        if (filters.payment_status && fee.payment_status !== filters.payment_status) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            fee.student_name.toLowerCase().includes(searchLower) ||
            fee.student_id.toLowerCase().includes(searchLower) ||
            fee.fee_name.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedFees = filteredFees.slice(startIndex, endIndex);

      setStudentFees(paginatedFees);
      setTotalCount(filteredFees.length);
    } catch (error) {
      console.error('Error fetching student fees:', error);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchStudentFees();
    fetchFeeStructures();
    fetchStats();
  }, [fetchStudentFees]);

  const fetchFeeStructures = async () => {
    try {
      // Mock data for fee structures
      const mockFeeStructures: FeeStructure[] = [
        {
          id: 1,
          name: 'Monthly Hostel Fee',
          fee_type: 'monthly',
          amount: 500,
          room_type: 'All Rooms',
          description: 'Monthly accommodation fee for all room types'
        },
        {
          id: 2,
          name: 'Security Deposit',
          fee_type: 'one_time',
          amount: 1000,
          room_type: 'All Rooms',
          description: 'One-time security deposit refundable at check-out'
        },
        {
          id: 3,
          name: 'Premium Room Fee',
          fee_type: 'monthly',
          amount: 200,
          room_type: 'Premium Rooms',
          description: 'Additional fee for premium room amenities'
        }
      ];
      setFeeStructures(mockFeeStructures);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats
      setStats({
        total_due: 2500,
        total_collected: 1800,
        overdue_count: 5,
        pending_count: 12
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleRecordPayment = async () => {
    try {
      // Mock API call
      console.log('Recording payment:', paymentForm);
      setShowPaymentModal(false);
      setPaymentForm({ payment_amount: 0, notes: '' });
      fetchStudentFees();
      fetchStats();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const handleCreateFeeStructure = async () => {
    try {
      // Mock API call
      console.log('Creating fee structure:', feeStructureForm);
      setShowFeeStructureModal(false);
      setFeeStructureForm({
        name: '',
        fee_type: '',
        amount: 0,
        room_type: '',
        description: ''
      });
      fetchFeeStructures();
    } catch (error) {
      console.error('Error creating fee structure:', error);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'waived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  const feeTypeOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Semester', value: 'semester' },
    { label: 'Annual', value: 'annual' },
    { label: 'One Time', value: 'one_time' },
  ];

  return (
    <div className="space-y-6">
             <PageHeader
         title="Hostel Fees"
         subtitle="Manage hostel fees, payments, and fee structures"
         actions={
          <div className="flex space-x-3">
                         <Button variant="default" size="sm" onClick={() => setShowFeeStructureModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
            <Button variant="secondary" size="sm">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Due</p>
              <p className="text-2xl font-bold text-gray-900">${stats.total_due}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900">${stats.total_collected}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue_count}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_count}</p>
            </div>
          </div>
        </Card>
      </div>

             <FilterBar
         searchPlaceholder="Search by student name, ID, or fee..."
         searchValue={filters.search}
         onSearchChange={(value) => handleFilterChange({ ...filters, search: value })}
       />

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
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
              {studentFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{fee.student_name}</div>
                      <div className="text-sm text-gray-500">{fee.student_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{fee.fee_name}</div>
                      <div className="text-sm text-gray-500">Room {fee.room_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">${fee.amount_due}</div>
                      <div className="text-sm text-gray-500">
                        Paid: ${fee.amount_paid} | Balance: ${fee.balance}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(fee.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(fee.payment_status)}`}>
                      {fee.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFee(fee);
                          setShowDetailModal(true);
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {fee.balance > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFee(fee);
                            setPaymentForm({ payment_amount: fee.balance, notes: '' });
                            setShowPaymentModal(true);
                          }}
                        >
                          <CreditCardIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

                 <div className="px-6 py-4 border-t border-gray-200">
           <Pagination
             page={currentPage}
             pageSize={10}
             total={totalCount}
             onPageChange={(page) => setCurrentPage(page)}
           />
         </div>
      </Card>

      {/* Fee Structures Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Fee Structures</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeStructures.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fee.fee_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${fee.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fee.room_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {fee.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
        size="md"
      >
        <div className="space-y-4">
          {selectedFee && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Student:</span> {selectedFee.student_name}
                </div>
                <div>
                  <span className="font-medium">Fee:</span> {selectedFee.fee_name}
                </div>
                <div>
                  <span className="font-medium">Amount Due:</span> ${selectedFee.amount_due}
                </div>
                <div>
                  <span className="font-medium">Balance:</span> ${selectedFee.balance}
                </div>
              </div>
            </div>
          )}

                     <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
             <Input
               type="number"
               value={paymentForm.payment_amount}
               onChange={(e) => setPaymentForm({ ...paymentForm, payment_amount: parseFloat(e.target.value) })}
               min={0}
               max={selectedFee?.balance || 0}
               step={0.01}
               required
             />
           </div>

          <Textarea
            label="Payment Notes"
            value={paymentForm.notes}
            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
                     <Button variant="default" onClick={handleRecordPayment}>
             Record Payment
           </Button>
        </div>
      </Modal>

      {/* Fee Structure Modal */}
      <Modal
        isOpen={showFeeStructureModal}
        onClose={() => setShowFeeStructureModal(false)}
        title="Add Fee Structure"
        size="lg"
      >
        <div className="space-y-4">
                     <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Fee Name</label>
             <Input
               value={feeStructureForm.name}
               onChange={(e) => setFeeStructureForm({ ...feeStructureForm, name: e.target.value })}
               required
             />
           </div>

                       <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
              <Select
                value={feeStructureForm.fee_type}
                onValueChange={(value) => setFeeStructureForm({ ...feeStructureForm, fee_type: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  {feeTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
             <Input
               type="number"
               value={feeStructureForm.amount}
               onChange={(e) => setFeeStructureForm({ ...feeStructureForm, amount: parseFloat(e.target.value) })}
               min={0}
               step={0.01}
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
             <Input
               value={feeStructureForm.room_type}
               onChange={(e) => setFeeStructureForm({ ...feeStructureForm, room_type: e.target.value })}
               placeholder="e.g., All Rooms, Single Room, Double Room"
               required
             />
           </div>

          <Textarea
            label="Description"
            value={feeStructureForm.description}
            onChange={(e) => setFeeStructureForm({ ...feeStructureForm, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowFeeStructureModal(false)}>
            Cancel
          </Button>
                     <Button variant="default" onClick={handleCreateFeeStructure}>
             Create Fee Structure
           </Button>
        </div>
      </Modal>

      {/* Fee Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Fee Details"
        size="lg"
      >
        {selectedFee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFee.student_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFee.student_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fee Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFee.fee_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFee.room_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount Due</label>
                <p className="mt-1 text-sm text-gray-900">${selectedFee.amount_due}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
                <p className="mt-1 text-sm text-gray-900">${selectedFee.amount_paid}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Balance</label>
                <p className="mt-1 text-sm text-gray-900">${selectedFee.balance}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedFee.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(selectedFee.payment_status)}`}>
                  {selectedFee.payment_status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedFee.created_at).toLocaleString()}</p>
              </div>
            </div>
            {selectedFee.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFee.notes}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Fees;

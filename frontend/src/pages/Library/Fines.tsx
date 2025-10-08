import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface Fine {
  id: number;
  borrowing: {
    id: number;
    book: {
      title: string;
      isbn: string;
    };
    borrower: {
      full_name: string;
      email: string;
      student_id: string;
    };
    borrowed_date: string;
    due_date: string;
    returned_date?: string;
  };
  amount: number;
  reason: string;
  status: 'pending' | 'paid' | 'waived';
  created_date: string;
  paid_date?: string;
  days_overdue: number;
  fine_per_day: number;
}

interface FineFilters {
  status: string;
  borrower: string;
  book: string;
  dateRange: string;
  amountRange: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon },
    paid: { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
    waived: { color: 'bg-gray-100 text-gray-700', icon: CheckCircleIcon },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Fines: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FineFilters>({
    status: '',
    borrower: '',
    book: '',
    dateRange: '',
    amountRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    // Mock data for demonstration
    const mockFines: Fine[] = [
      {
        id: 1,
        borrowing: {
          id: 1,
          book: {
            title: 'The Great Gatsby',
            isbn: '978-0743273565'
          },
          borrower: {
            full_name: 'John Smith',
            email: 'john.smith@example.com',
            student_id: 'STU001'
          },
          borrowed_date: '2024-11-15T00:00:00Z',
          due_date: '2024-12-01T00:00:00Z',
          returned_date: '2024-12-10T00:00:00Z'
        },
        amount: 4.50,
        reason: 'Late return',
        status: 'pending',
        created_date: '2024-12-02T00:00:00Z',
        days_overdue: 9,
        fine_per_day: 0.50
      },
      {
        id: 2,
        borrowing: {
          id: 2,
          book: {
            title: 'To Kill a Mockingbird',
            isbn: '978-0446310789'
          },
          borrower: {
            full_name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            student_id: 'STU002'
          },
          borrowed_date: '2024-11-20T00:00:00Z',
          due_date: '2024-12-05T00:00:00Z',
          returned_date: '2024-12-12T00:00:00Z'
        },
        amount: 3.50,
        reason: 'Late return',
        status: 'paid',
        created_date: '2024-12-06T00:00:00Z',
        paid_date: '2024-12-12T00:00:00Z',
        days_overdue: 7,
        fine_per_day: 0.50
      },
      {
        id: 3,
        borrowing: {
          id: 3,
          book: {
            title: '1984',
            isbn: '978-0451524935'
          },
          borrower: {
            full_name: 'Mike Wilson',
            email: 'mike.wilson@example.com',
            student_id: 'STU003'
          },
          borrowed_date: '2024-11-25T00:00:00Z',
          due_date: '2024-12-10T00:00:00Z'
        },
        amount: 2.50,
        reason: 'Overdue',
        status: 'pending',
        created_date: '2024-12-11T00:00:00Z',
        days_overdue: 5,
        fine_per_day: 0.50
      }
    ];

    setTimeout(() => {
      setFines(mockFines);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewDetails = (fine: Fine) => {
    setSelectedFine(fine);
    setShowDetailsModal(true);
  };

  const handlePayment = (fine: Fine) => {
    setSelectedFine(fine);
    setPaymentAmount(fine.amount.toString());
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedFine || !paymentAmount) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update fine status
      setFines(prev => prev.map(fine => 
        fine.id === selectedFine.id 
          ? { ...fine, status: 'paid', paid_date: new Date().toISOString() }
          : fine
      ));
      
      setShowPaymentModal(false);
      setSelectedFine(null);
      setPaymentAmount('');
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const waiveFine = async (fineId: number) => {
    if (!confirm('Are you sure you want to waive this fine?')) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFines(prev => prev.map(fine => 
        fine.id === fineId 
          ? { ...fine, status: 'waived' }
          : fine
      ));
    } catch (error) {
      console.error('Error waiving fine:', error);
    }
  };

  const deleteFine = async (fineId: number) => {
    if (!confirm('Are you sure you want to delete this fine record?')) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFines(prev => prev.filter(fine => fine.id !== fineId));
    } catch (error) {
      console.error('Error deleting fine:', error);
    }
  };

  const filteredFines = fines.filter(fine => {
    if (filters.status && fine.status !== filters.status) return false;
    if (filters.borrower && !fine.borrowing.borrower.full_name.toLowerCase().includes(filters.borrower.toLowerCase())) return false;
    if (filters.book && !fine.borrowing.book.title.toLowerCase().includes(filters.book.toLowerCase())) return false;
    if (search && !fine.borrowing.book.title.toLowerCase().includes(search.toLowerCase()) && 
        !fine.borrowing.borrower.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPendingFines = fines.filter(fine => fine.status === 'pending').reduce((sum, fine) => sum + fine.amount, 0);
  const totalPaidFines = fines.filter(fine => fine.status === 'paid').reduce((sum, fine) => sum + fine.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fines Management</h1>
          <p className="text-gray-600">Track and manage library fines and payments</p>
        </div>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Fine
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Fines</p>
                <p className="text-2xl font-semibold text-gray-900">${totalPendingFines.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Fines</p>
                <p className="text-2xl font-semibold text-gray-900">${totalPaidFines.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Fines</p>
                <p className="text-2xl font-semibold text-gray-900">${(totalPendingFines + totalPaidFines).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <FilterBar
              searchPlaceholder="Search fines by book title, borrower name, or ID..."
              searchValue={search}
              onSearchChange={setSearch}
            />
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="waived">Waived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Borrower</label>
                <input
                  type="text"
                  value={filters.borrower}
                  onChange={(e) => setFilters({ ...filters, borrower: e.target.value })}
                  placeholder="Filter by borrower"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                <input
                  type="text"
                  value={filters.book}
                  onChange={(e) => setFilters({ ...filters, book: e.target.value })}
                  placeholder="Filter by book title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
                <select
                  value={filters.amountRange}
                  onChange={(e) => setFilters({ ...filters, amountRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Amounts</option>
                  <option value="0-5">$0 - $5</option>
                  <option value="5-10">$5 - $10</option>
                  <option value="10+">$10+</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Fines Table */}
      <Card>
        <CardHeader title="Fine Records" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600 bg-gray-50">
              <tr>
                <th className="py-3 px-6 font-medium">Book</th>
                <th className="py-3 px-6 font-medium">Borrower</th>
                <th className="py-3 px-6 font-medium">Due Date</th>
                <th className="py-3 px-6 font-medium">Days Overdue</th>
                <th className="py-3 px-6 font-medium">Amount</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="py-8 text-center text-gray-500" colSpan={7}>
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      Loading fines...
                    </div>
                  </td>
                </tr>
              ) : filteredFines.length === 0 ? (
                <tr>
                  <td className="py-8 text-center text-gray-500" colSpan={7}>
                    <div className="flex flex-col items-center">
                      <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mb-2" />
                      No fines found.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{fine.borrowing.book.title}</div>
                        <div className="text-gray-500 text-xs">ISBN: {fine.borrowing.book.isbn}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{fine.borrowing.borrower.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{new Date(fine.borrowing.due_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${fine.days_overdue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {fine.days_overdue} days
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">${fine.amount.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={fine.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(fine)}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        {fine.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handlePayment(fine)}
                            >
                              <CurrencyDollarIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => waiveFine(fine.id)}
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteFine(fine.id)}
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

        {/* Pagination */}
        {filteredFines.length > 10 && (
          <div className="p-6 border-t">
            <Pagination 
              page={page} 
              pageSize={10} 
              total={filteredFines.length} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </Card>

      {/* Fine Details Modal */}
      {showDetailsModal && selectedFine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Fine Details</h3>
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Book Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Title:</span> {selectedFine.borrowing.book.title}</div>
                    <div><span className="font-medium">ISBN:</span> {selectedFine.borrowing.book.isbn}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Borrower Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedFine.borrowing.borrower.full_name}</div>
                    <div><span className="font-medium">Email:</span> {selectedFine.borrowing.borrower.email}</div>
                    <div><span className="font-medium">Student ID:</span> {selectedFine.borrowing.borrower.student_id}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Fine Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Amount:</span><br />
                    <span className="text-lg font-semibold text-gray-900">${selectedFine.amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span><br />
                    <StatusBadge status={selectedFine.status} />
                  </div>
                  <div>
                    <span className="font-medium">Days Overdue:</span><br />
                    <span className="text-gray-900">{selectedFine.days_overdue} days</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Borrowed:</span> {new Date(selectedFine.borrowing.borrowed_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Due:</span> {new Date(selectedFine.borrowing.due_date).toLocaleDateString()}
                  </div>
                  {selectedFine.borrowing.returned_date && (
                    <div>
                      <span className="font-medium">Returned:</span> {new Date(selectedFine.borrowing.returned_date).toLocaleDateString()}
                    </div>
                  )}
                  {selectedFine.paid_date && (
                    <div>
                      <span className="font-medium">Paid:</span> {new Date(selectedFine.paid_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
                {selectedFine.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => waiveFine(selectedFine.id)}
                    >
                      Waive Fine
                    </Button>
                    <Button
                      onClick={() => handlePayment(selectedFine)}
                    >
                      Process Payment
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedFine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Process Payment</h3>
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fine Amount</label>
                <div className="text-2xl font-semibold text-gray-900">${selectedFine.amount.toFixed(2)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter payment amount"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={processPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  Process Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fines;



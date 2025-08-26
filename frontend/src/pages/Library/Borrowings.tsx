import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useLibraryStore } from '../../stores/libraryStore';

interface BorrowingFilters {
  status: string;
  borrower: string;
  book: string;
  dateRange: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    borrowed: { color: 'bg-blue-100 text-blue-700', icon: BookOpenIcon },
    returned: { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
    overdue: { color: 'bg-red-100 text-red-700', icon: ExclamationTriangleIcon },
    lost: { color: 'bg-gray-100 text-gray-700', icon: ExclamationTriangleIcon },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.borrowed;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Borrowings: React.FC = () => {
  const { borrowings, borrowingsLoading, borrowingsError, fetchBorrowings, returnBook, deleteBorrowing } = useLibraryStore();
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BorrowingFilters>({
    status: '',
    borrower: '',
    book: '',
    dateRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => { 
    fetchBorrowings({ page, search }); 
  }, [page, search]);

  const onReturn = async (id: number) => {
    try {
      await returnBook(id);
      fetchBorrowings({ page, search });
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this borrowing record? This action cannot be undone.')) return;
    
    try {
      await deleteBorrowing(id);
      fetchBorrowings({ page, search });
    } catch (error) {
      console.error('Error deleting borrowing:', error);
    }
  };

  const handleViewDetails = (borrowing: any) => {
    setSelectedBorrowing(borrowing);
    setShowDetailsModal(true);
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateFine = (dueDate: string) => {
    const daysOverdue = getDaysOverdue(dueDate);
    if (daysOverdue >= 0) return 0;
    return Math.abs(daysOverdue) * 0.50; // $0.50 per day
  };

  const filteredBorrowings = borrowings?.results?.filter(borrowing => {
    if (filters.status && borrowing.status !== filters.status) return false;
    if (filters.borrower && !borrowing.borrower?.full_name?.toLowerCase().includes(filters.borrower.toLowerCase())) return false;
    if (filters.book && !borrowing.book?.title?.toLowerCase().includes(filters.book.toLowerCase())) return false;
    return true;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Borrowings</h1>
          <p className="text-gray-600">Track issued and returned books</p>
        </div>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Borrowing
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <FilterBar
              searchPlaceholder="Search borrowings by book title, borrower name, or ID..."
              searchValue={search}
              onSearchChange={(value) => { setSearch(value); setPage(1); }}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="returned">Returned</option>
                  <option value="overdue">Overdue</option>
                  <option value="lost">Lost</option>
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
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Error Display */}
      {borrowingsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            {borrowingsError}
          </div>
        </div>
      )}

      {/* Borrowings Table */}
      <Card>
        <CardHeader title="Borrowing Records" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600 bg-gray-50">
              <tr>
                <th className="py-3 px-6 font-medium">Book</th>
                <th className="py-3 px-6 font-medium">Borrower</th>
                <th className="py-3 px-6 font-medium">Borrowed Date</th>
                <th className="py-3 px-6 font-medium">Due Date</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Fine</th>
                <th className="py-3 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {borrowingsLoading ? (
                <tr>
                  <td className="py-8 text-center text-gray-500" colSpan={7}>
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      Loading borrowings...
                    </div>
                  </td>
                </tr>
              ) : !filteredBorrowings || filteredBorrowings.length === 0 ? (
                <tr>
                  <td className="py-8 text-center text-gray-500" colSpan={7}>
                    <div className="flex flex-col items-center">
                      <BookOpenIcon className="w-12 h-12 text-gray-400 mb-2" />
                      No borrowings found.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBorrowings.map((borrowing) => {
                  const daysOverdue = getDaysOverdue(borrowing.due_date);
                  const fineAmount = calculateFine(borrowing.due_date);
                  
                  return (
                    <tr key={borrowing.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">{borrowing.book?.title}</div>
                          <div className="text-gray-500 text-xs">ISBN: {borrowing.book?.isbn}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{borrowing.borrower?.full_name || borrowing.borrower?.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {new Date(borrowing.borrowed_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className={`${daysOverdue < 0 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {new Date(borrowing.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        {daysOverdue < 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            {Math.abs(daysOverdue)} days overdue
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={borrowing.status} />
                      </td>
                      <td className="py-4 px-6">
                        {fineAmount > 0 ? (
                          <span className="text-red-600 font-medium">${fineAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(borrowing)}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          {borrowing.status !== 'returned' && (
                            <Button
                              size="sm"
                              onClick={() => onReturn(borrowing.id)}
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(borrowing.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {borrowings && borrowings.count > 10 && (
          <div className="p-6 border-t">
            <Pagination 
              page={page} 
              pageSize={10} 
              total={borrowings.count} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </Card>

      {/* Borrowing Details Modal */}
      {showDetailsModal && selectedBorrowing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Borrowing Details</h3>
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
                    <div><span className="font-medium">Title:</span> {selectedBorrowing.book?.title}</div>
                    <div><span className="font-medium">Author:</span> {selectedBorrowing.book?.author?.name}</div>
                    <div><span className="font-medium">ISBN:</span> {selectedBorrowing.book?.isbn}</div>
                    <div><span className="font-medium">Category:</span> {selectedBorrowing.book?.category?.name}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Borrower Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedBorrowing.borrower?.full_name}</div>
                    <div><span className="font-medium">Email:</span> {selectedBorrowing.borrower?.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedBorrowing.borrower?.phone || 'N/A'}</div>
                    <div><span className="font-medium">Student ID:</span> {selectedBorrowing.borrower?.student_id || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Borrowing Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Borrowed Date:</span><br />
                    {new Date(selectedBorrowing.borrowed_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Due Date:</span><br />
                    {new Date(selectedBorrowing.due_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span><br />
                    <StatusBadge status={selectedBorrowing.status} />
                  </div>
                </div>
              </div>

              {selectedBorrowing.status === 'returned' && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Return Information</h4>
                  <div className="text-sm">
                    <div><span className="font-medium">Returned Date:</span> {selectedBorrowing.returned_date ? new Date(selectedBorrowing.returned_date).toLocaleDateString() : 'N/A'}</div>
                    <div><span className="font-medium">Fine Paid:</span> ${selectedBorrowing.fine_paid || 0}</div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
                {selectedBorrowing.status !== 'returned' && (
                  <Button
                    onClick={() => {
                      onReturn(selectedBorrowing.id);
                      setShowDetailsModal(false);
                    }}
                  >
                    Mark as Returned
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Borrowings;



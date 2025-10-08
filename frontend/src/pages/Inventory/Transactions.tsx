import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  reference_number: string;
  transaction_type: string;
  transaction_type_display: string;
  asset: string;
  asset_name: string;
  stock_item: string;
  stock_item_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  from_location: string;
  to_location: string;
  notes: string;
  transaction_date: string;
  created_by: string;
  created_at: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters] = useState({
    transaction_type: '',
    date_from: '',
    date_to: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        reference_number: 'TXN-2024-001',
        transaction_type: 'purchase',
        transaction_type_display: 'Purchase',
        asset: '',
        asset_name: '',
        stock_item: '1',
        stock_item_name: 'Printer Paper A4',
        quantity: 20,
        unit_price: 8.50,
        total_amount: 170.00,
        from_location: 'Office Supplies Co.',
        to_location: 'Storage Room A',
        notes: 'Monthly paper supply restock',
        transaction_date: '2024-01-15T10:00:00Z',
        created_by: 'John Smith',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        reference_number: 'TXN-2024-002',
        transaction_type: 'transfer',
        transaction_type_display: 'Transfer',
        asset: '1',
        asset_name: 'Dell Latitude Laptop',
        stock_item: '',
        stock_item_name: '',
        quantity: 1,
        unit_price: 0,
        total_amount: 0,
        from_location: 'IT Department',
        to_location: 'Room 101',
        notes: 'Asset assigned to new employee',
        transaction_date: '2024-01-20T14:30:00Z',
        created_by: 'Sarah Johnson',
        created_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '3',
        reference_number: 'TXN-2024-003',
        transaction_type: 'issue',
        transaction_type_display: 'Issue',
        asset: '',
        asset_name: '',
        stock_item: '2',
        stock_item_name: 'Whiteboard Markers',
        quantity: 5,
        unit_price: 12.00,
        total_amount: 60.00,
        from_location: 'Storage Room A',
        to_location: 'Classroom 201',
        notes: 'Markers issued for classroom use',
        transaction_date: '2024-01-25T09:15:00Z',
        created_by: 'Mike Wilson',
        created_at: '2024-01-25T09:15:00Z'
      },
      {
        id: '4',
        reference_number: 'TXN-2024-004',
        transaction_type: 'return',
        transaction_type_display: 'Return',
        asset: '2',
        asset_name: 'Epson Projector',
        stock_item: '',
        stock_item_name: '',
        quantity: 1,
        unit_price: 0,
        total_amount: 0,
        from_location: 'Room 203',
        to_location: 'AV Department',
        notes: 'Projector returned after event',
        transaction_date: '2024-02-01T16:45:00Z',
        created_by: 'Lisa Brown',
        created_at: '2024-02-01T16:45:00Z'
      },
      {
        id: '5',
        reference_number: 'TXN-2024-005',
        transaction_type: 'disposal',
        transaction_type_display: 'Disposal',
        asset: '3',
        asset_name: 'Office Desk',
        stock_item: '',
        stock_item_name: '',
        quantity: 1,
        unit_price: 0,
        total_amount: 0,
        from_location: 'Administration Building',
        to_location: 'Disposal',
        notes: 'Damaged desk disposed of',
        transaction_date: '2024-02-10T11:20:00Z',
        created_by: 'David Lee',
        created_at: '2024-02-10T11:20:00Z'
      }
    ];

    setTimeout(() => {
      setTransactions(mockTransactions);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
  }, []);

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'purchase':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Purchase</span>;
      case 'sale':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Sale</span>;
      case 'transfer':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Transfer</span>;
      case 'issue':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Issue</span>;
      case 'return':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Return</span>;
      case 'disposal':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Disposal</span>;
      case 'adjustment':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Adjustment</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{type}</span>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ArrowDownIcon className="w-5 h-5 text-green-600" />;
      case 'sale':
        return <ArrowUpIcon className="w-5 h-5 text-blue-600" />;
      case 'transfer':
        return <ArrowRightIcon className="w-5 h-5 text-purple-600" />;
      case 'issue':
        return <ArrowUpIcon className="w-5 h-5 text-orange-600" />;
      case 'return':
        return <ArrowDownIcon className="w-5 h-5 text-yellow-600" />;
      case 'disposal':
        return <TrashIcon className="w-5 h-5 text-red-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedTransaction) {
      setTransactions(transactions.filter(t => t.id !== selectedTransaction.id));
      setShowDeleteModal(false);
      setSelectedTransaction(null);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.reference_number.toLowerCase().includes(search.toLowerCase()) ||
                         transaction.notes.toLowerCase().includes(search.toLowerCase()) ||
                         (transaction.asset_name && transaction.asset_name.toLowerCase().includes(search.toLowerCase())) ||
                         (transaction.stock_item_name && transaction.stock_item_name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = !filters.transaction_type || transaction.transaction_type === filters.transaction_type;
    
    let matchesDate = true;
    if (filters.date_from) {
      const transactionDate = new Date(transaction.transaction_date);
      const fromDate = new Date(filters.date_from);
      matchesDate = matchesDate && transactionDate >= fromDate;
    }
    if (filters.date_to) {
      const transactionDate = new Date(transaction.transaction_date);
      const toDate = new Date(filters.date_to);
      matchesDate = matchesDate && transactionDate <= toDate;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600">Track all inventory movements and transactions</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/inventory/transactions/create">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
          </Link>
          <Link to="/inventory/transactions/export">
            <Button variant="outline">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Transactions List */}
      <Card>
        <CardHeader title={`Transactions (${filteredTransactions.length})`} />
        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Link to="/inventory/transactions/create">
                <Button>Create Your First Transaction</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {transaction.reference_number}
                          </h3>
                          {getTransactionTypeBadge(transaction.transaction_type)}
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-gray-600">
                            {transaction.asset_name || transaction.stock_item_name}
                            {transaction.quantity > 1 && ` (${transaction.quantity} units)`}
                          </p>
                          {transaction.notes && (
                            <p className="text-sm text-gray-500 mt-1">{transaction.notes}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {transaction.from_location} → {transaction.to_location}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              ${transaction.total_amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {new Date(transaction.transaction_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{transaction.created_by}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/inventory/transactions/${transaction.id}`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/inventory/transactions/${transaction.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(transaction)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          pageSize={10}
          total={totalPages * 10}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Transaction</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete transaction &quot;{selectedTransaction.reference_number}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

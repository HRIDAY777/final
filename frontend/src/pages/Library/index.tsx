import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';

interface LibraryStats {
  total_books: number;
  total_authors: number;
  total_categories: number;
  active_borrowings: number;
  overdue_books: number;
  total_fines: number;
  pending_reservations: number;
  books_added_this_month: number;
  books_borrowed_this_month: number;
  popular_categories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: 'borrow' | 'return' | 'reserve' | 'fine';
    book_title: string;
    user_name: string;
    timestamp: string;
    status: string;
  }>;
  overdue_alerts: Array<{
    id: string;
    book_title: string;
    borrower_name: string;
    days_overdue: number;
    fine_amount: number;
  }>;
}

const LibraryDashboard: React.FC = () => {
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats: LibraryStats = {
      total_books: 1247,
      total_authors: 89,
      total_categories: 24,
      active_borrowings: 156,
      overdue_books: 23,
      total_fines: 1240,
      pending_reservations: 18,
      books_added_this_month: 45,
      books_borrowed_this_month: 234,
      popular_categories: [
        { name: 'Fiction', count: 456, percentage: 36.6 },
        { name: 'Science & Technology', count: 234, percentage: 18.8 },
        { name: 'History', count: 189, percentage: 15.2 },
        { name: 'Literature', count: 156, percentage: 12.5 },
        { name: 'Philosophy', count: 98, percentage: 7.9 },
      ],
      recent_activity: [
        {
          id: '1',
          type: 'borrow',
          book_title: 'The Great Gatsby',
          user_name: 'John Smith',
          timestamp: '2024-12-15T14:30:00Z',
          status: 'Borrowed'
        },
        {
          id: '2',
          type: 'return',
          book_title: 'To Kill a Mockingbird',
          user_name: 'Sarah Johnson',
          timestamp: '2024-12-15T13:45:00Z',
          status: 'Returned'
        },
        {
          id: '3',
          type: 'reserve',
          book_title: '1984',
          user_name: 'Mike Wilson',
          timestamp: '2024-12-15T12:20:00Z',
          status: 'Reserved'
        },
        {
          id: '4',
          type: 'fine',
          book_title: 'Pride and Prejudice',
          user_name: 'Emily Davis',
          timestamp: '2024-12-15T11:15:00Z',
          status: 'Fine Applied'
        },
        {
          id: '5',
          type: 'borrow',
          book_title: 'The Hobbit',
          user_name: 'David Brown',
          timestamp: '2024-12-15T10:30:00Z',
          status: 'Borrowed'
        }
      ],
      overdue_alerts: [
        {
          id: '1',
          book_title: 'The Catcher in the Rye',
          borrower_name: 'Alex Thompson',
          days_overdue: 5,
          fine_amount: 2.50
        },
        {
          id: '2',
          book_title: 'Lord of the Flies',
          borrower_name: 'Maria Garcia',
          days_overdue: 3,
          fine_amount: 1.50
        },
        {
          id: '3',
          book_title: 'Animal Farm',
          borrower_name: 'James Wilson',
          days_overdue: 7,
          fine_amount: 3.50
        }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'borrow':
        return <BookOpenIcon className="w-4 h-4 text-blue-600" />;
      case 'return':
        return <ClockIcon className="w-4 h-4 text-green-600" />;
      case 'reserve':
        return <CalendarIcon className="w-4 h-4 text-purple-600" />;
      case 'fine':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'Borrowed':
        return 'text-blue-600';
      case 'Returned':
        return 'text-green-600';
      case 'Reserved':
        return 'text-purple-600';
      case 'Fine Applied':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Library data not found</h3>
          <p className="text-gray-600">Unable to load library statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library Dashboard</h1>
          <p className="text-gray-600">Manage your library collection and track borrowing activity</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/library/books" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Book
          </Link>
          <Link to="/library/borrowings" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-transparent hover:bg-gray-50 h-10 px-4 py-2">
            <BookOpenIcon className="w-4 h-4 mr-2" />
            Manage Borrowings
          </Link>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_books.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+{stats.books_added_this_month} this month</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Borrowings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active_borrowings}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+{stats.books_borrowed_this_month} this month</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Books</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.overdue_books}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600">${stats.total_fines.toFixed(2)} in fines</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reservations</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending_reservations}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600">Awaiting pickup</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader title="Recent Activity" />
          <div className="p-6">
            <div className="space-y-4">
              {stats.recent_activity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.book_title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.user_name} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs font-medium ${getActivityStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link to="/library/borrowings" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-transparent hover:bg-gray-50 h-10 px-4 py-2 w-full">
                View All Activity
              </Link>
            </div>
          </div>
        </Card>

        {/* Overdue Alerts */}
        <Card>
          <CardHeader title="Overdue Alerts" />
          <div className="p-6">
            {stats.overdue_alerts.length > 0 ? (
              <div className="space-y-4">
                {stats.overdue_alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.book_title}</p>
                      <p className="text-sm text-gray-600">{alert.borrower_name}</p>
                      <p className="text-xs text-red-600">{alert.days_overdue} days overdue</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">${alert.fine_amount.toFixed(2)}</p>
                      <Button size="sm" variant="outline" className="mt-1">
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600">No overdue books!</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Link to="/library/fines" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-transparent hover:bg-gray-50 h-10 px-4 py-2 w-full">
                Manage Fines
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Popular Categories */}
      <Card>
        <CardHeader title="Popular Categories" />
        <div className="p-6">
          <div className="space-y-4">
            {stats.popular_categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-500">{category.count} books</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t">
            <Link to="/library/categories" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-transparent hover:bg-gray-50 h-10 px-4 py-2 w-full">
              View All Categories
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/library/books" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-20 flex-col">
              <BookOpenIcon className="w-6 h-6 mb-2" />
              <span>Manage Books</span>
            </Link>
            <Link to="/library/borrowings" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-transparent hover:bg-gray-50 h-20 flex-col">
              <UserGroupIcon className="w-6 h-6 mb-2" />
              <span>Borrowings</span>
            </Link>
            <Link to="/library/reservations" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-transparent hover:bg-gray-50 h-20 flex-col">
              <CalendarIcon className="w-6 h-6 mb-2" />
              <span>Reservations</span>
            </Link>
            <Link to="/library/fines" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-transparent hover:bg-gray-50 h-20 flex-col">
              <ExclamationTriangleIcon className="w-6 h-6 mb-2" />
              <span>Fines</span>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LibraryDashboard;

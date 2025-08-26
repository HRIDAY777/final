import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { Skeleton } from '../../components/UI/Skeleton';
import { 
  BellIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface GuardianNotification {
  id: string;
  guardian: {
    id: string;
    name: string;
    guardian_id: string;
  };
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  email_sent: boolean;
  sms_sent: boolean;
  push_sent: boolean;
  read: boolean;
  read_at: string | null;
  related_student: {
    id: string;
    name: string;
    student_id: string;
  } | null;
  related_event: {
    id: string;
    title: string;
  } | null;
  created_at: string;
}

const GuardianNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<GuardianNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    guardian_id: '',
    title: '',
    message: '',
    notification_type: 'general',
    priority: 'medium',
    related_student_id: '',
    related_event_id: '',
    send_email: true,
    send_sms: false,
    send_push: true
  });

  // Mock data
  useEffect(() => {
    const mockNotifications: GuardianNotification[] = [
      {
        id: '1',
        guardian: {
          id: '1',
          name: 'আব্দুল রহমান',
          guardian_id: 'G001'
        },
        title: 'Fee Payment Reminder',
        message: 'Dear guardian, please note that the monthly fee payment is due on 15th of this month. Please ensure timely payment to avoid any late fees.',
        notification_type: 'fee',
        priority: 'high',
        email_sent: true,
        sms_sent: true,
        push_sent: true,
        read: false,
        read_at: null,
        related_student: {
          id: '1',
          name: 'আহমেদ রহমান',
          student_id: 'S001'
        },
        related_event: null,
        created_at: '2024-01-25T10:00:00Z'
      },
      {
        id: '2',
        guardian: {
          id: '1',
          name: 'আব্দুল রহমান',
          guardian_id: 'G001'
        },
        title: 'Academic Performance Update',
        message: 'Your child has shown excellent progress in Mathematics this month. Please review the detailed report in the parent portal.',
        notification_type: 'academic',
        priority: 'medium',
        email_sent: true,
        sms_sent: false,
        push_sent: true,
        read: true,
        read_at: '2024-01-24T15:30:00Z',
        related_student: {
          id: '1',
          name: 'আহমেদ রহমান',
          student_id: 'S001'
        },
        related_event: null,
        created_at: '2024-01-24T14:00:00Z'
      },
      {
        id: '3',
        guardian: {
          id: '2',
          name: 'ফাতেমা বেগম',
          guardian_id: 'G002'
        },
        title: 'School Event Invitation',
        message: 'You are cordially invited to attend the Annual Sports Day on 15th February 2024. Please confirm your attendance.',
        notification_type: 'event',
        priority: 'medium',
        email_sent: true,
        sms_sent: true,
        push_sent: true,
        read: false,
        read_at: null,
        related_student: {
          id: '3',
          name: 'মোহাম্মদ আলী',
          student_id: 'S003'
        },
        related_event: {
          id: '1',
          title: 'Annual Sports Day'
        },
        created_at: '2024-01-23T09:00:00Z'
      },
      {
        id: '4',
        guardian: {
          id: '1',
          name: 'আব্দুল রহমান',
          guardian_id: 'G001'
        },
        title: 'Attendance Alert',
        message: 'Your child was absent from school today. Please provide a reason for the absence or contact the school office.',
        notification_type: 'attendance',
        priority: 'urgent',
        email_sent: true,
        sms_sent: true,
        push_sent: true,
        read: false,
        read_at: null,
        related_student: {
          id: '2',
          name: 'আয়েশা রহমান',
          student_id: 'S002'
        },
        related_event: null,
        created_at: '2024-01-25T08:30:00Z'
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
      setTotalPages(1);
    }, 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Notification data:', formData);
    setIsModalOpen(false);
    resetForm();
  };

  const handleMarkAsRead = async (id: string) => {
    console.log('Marking notification as read:', id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      console.log('Deleting notification:', id);
    }
  };

  const handleResend = async (id: string, type: 'email' | 'sms' | 'push') => {
    console.log(`Resending ${type} notification:`, id);
  };

  const resetForm = () => {
    setFormData({
      guardian_id: '',
      title: '',
      message: '',
      notification_type: 'general',
      priority: 'medium',
      related_student_id: '',
      related_event_id: '',
      send_email: true,
      send_sms: false,
      send_push: true
    });
  };

  const getNotificationTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'academic': 'Academic',
      'attendance': 'Attendance',
      'fee': 'Fee',
      'event': 'Event',
      'emergency': 'Emergency',
      'general': 'General'
    };
    return types[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'academic': return <CheckCircleIcon className="w-5 h-5" />;
      case 'attendance': return <ClockIcon className="w-5 h-5" />;
      case 'fee': return <EnvelopeIcon className="w-5 h-5" />;
      case 'event': return <BellIcon className="w-5 h-5" />;
      case 'emergency': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.guardian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.notification_type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    const matchesRead = readFilter === 'all' || 
                       (readFilter === 'read' && notification.read) ||
                       (readFilter === 'unread' && !notification.read);
    return matchesSearch && matchesType && matchesPriority && matchesRead;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <PageHeader title="Guardian Notifications" subtitle="Manage and send notifications to guardians" />
        </Card>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title="Guardian Notifications" 
          subtitle="Manage and send notifications to guardians"
          actions={
            <Button onClick={() => setIsModalOpen(true)}>
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          }
        />
      </Card>

      <Card>
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          right={
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="academic">Academic</option>
                <option value="attendance">Attendance</option>
                <option value="fee">Fee</option>
                <option value="event">Event</option>
                <option value="emergency">Emergency</option>
                <option value="general">General</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </select>
            </div>
          }
        />
      </Card>

      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className={`hover:shadow-lg transition-shadow ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.notification_type === 'emergency' ? 'bg-red-100' :
                  notification.notification_type === 'academic' ? 'bg-green-100' :
                  notification.notification_type === 'fee' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {getNotificationTypeIcon(notification.notification_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    To: {notification.guardian.name} ({notification.guardian.guardian_id})
                  </p>
                  <p className="text-gray-700">{notification.message}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                  {notification.priority}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="capitalize">{getNotificationTypeLabel(notification.notification_type)}</span>
                {notification.related_student && (
                  <span>Student: {notification.related_student.name}</span>
                )}
                {notification.related_event && (
                  <span>Event: {notification.related_event.title}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  {notification.email_sent && <EnvelopeIcon className="w-3 h-3 text-green-500" />}
                  {notification.sms_sent && <ChatBubbleLeftRightIcon className="w-3 h-3 text-blue-500" />}
                  {notification.push_sent && <BellIcon className="w-3 h-3 text-purple-500" />}
                </div>
                <div className="flex space-x-2">
                  {!notification.read && (
                    <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleResend(notification.id, 'email')}>
                    <EnvelopeIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(notification.id)}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Send First Notification
            </Button>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <Card>
          <Pagination
            page={currentPage}
            pageSize={10}
            total={notifications.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}

      {/* Send Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Send Notification</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian *
                  </label>
                  <select
                    required
                    value={formData.guardian_id}
                    onChange={(e) => setFormData({...formData, guardian_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Guardian</option>
                    <option value="1">আব্দুল রহমান (G001)</option>
                    <option value="2">ফাতেমা বেগম (G002)</option>
                    <option value="3">মোহাম্মদ আলী (G003)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Type *
                  </label>
                  <select
                    required
                    value={formData.notification_type}
                    onChange={(e) => setFormData({...formData, notification_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="attendance">Attendance</option>
                    <option value="fee">Fee</option>
                    <option value="event">Event</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Student
                  </label>
                  <select
                    value={formData.related_student_id}
                    onChange={(e) => setFormData({...formData, related_student_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Student (Optional)</option>
                    <option value="1">আহমেদ রহমান (S001)</option>
                    <option value="2">আয়েশা রহমান (S002)</option>
                    <option value="3">মোহাম্মদ আলী (S003)</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Delivery Methods</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.send_email}
                      onChange={(e) => setFormData({...formData, send_email: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">Email</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.send_sms}
                      onChange={(e) => setFormData({...formData, send_sms: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">SMS</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.send_push}
                      onChange={(e) => setFormData({...formData, send_push: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">Push Notification</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianNotifications;


import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import { apiService } from '../../services/api';
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  room_number: string;
  building_name: string;
  reported_by: string;
  assigned_to?: string;
  priority: string;
  status: string;
  estimated_cost?: number;
  actual_cost?: number;
  reported_date: string;
  assigned_date?: string;
  completed_date?: string;
  notes: string;
}

interface Room {
  id: number;
  room_number: string;
  building_name: string;
  room_type: string;
}

interface User {
  id: number;
  name: string;
  role: string;
}

const Maintenance: React.FC = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

  // Form states
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    room_id: '',
    priority: 'medium',
    estimated_cost: 0,
    notes: ''
  });

  const [assignForm, setAssignForm] = useState({
    assigned_to: '',
    notes: ''
  });

  const [completeForm, setCompleteForm] = useState({
    actual_cost: 0,
    notes: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    building: '',
    search: '',
  });

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    in_progress: 0,
    completed: 0,
    total_cost: 0
  });

  useEffect(() => {
    fetchMaintenanceRequests();
    fetchAvailableRooms();
    fetchAvailableUsers();
    fetchStats();
  }, [currentPage, filters]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockRequests: MaintenanceRequest[] = [
        {
          id: 1,
          title: 'Leaky Faucet',
          description: 'The bathroom faucet is leaking continuously',
          room_number: 'A-105',
          building_name: 'Building A',
          reported_by: 'John Doe',
          assigned_to: 'Mike Johnson',
          priority: 'medium',
          status: 'assigned',
          estimated_cost: 50,
          reported_date: '2024-01-15T10:00:00Z',
          assigned_date: '2024-01-15T14:00:00Z',
          notes: 'Plumbing issue in bathroom'
        },
        {
          id: 2,
          title: 'Broken Window',
          description: 'Window glass is cracked and needs replacement',
          room_number: 'B-210',
          building_name: 'Building B',
          reported_by: 'Jane Smith',
          priority: 'high',
          status: 'pending',
          estimated_cost: 150,
          reported_date: '2024-01-14T09:00:00Z',
          notes: 'Safety concern - needs immediate attention'
        },
        {
          id: 3,
          title: 'Electrical Issue',
          description: 'Power outlet not working properly',
          room_number: 'C-305',
          building_name: 'Building C',
          reported_by: 'Bob Wilson',
          assigned_to: 'Sarah Davis',
          priority: 'urgent',
          status: 'in_progress',
          estimated_cost: 100,
          actual_cost: 120,
          reported_date: '2024-01-13T16:00:00Z',
          assigned_date: '2024-01-14T08:00:00Z',
          notes: 'Electrical work in progress'
        },
        {
          id: 4,
          title: 'AC Not Working',
          description: 'Air conditioning unit is not cooling properly',
          room_number: 'A-108',
          building_name: 'Building A',
          reported_by: 'Alice Brown',
          assigned_to: 'Mike Johnson',
          priority: 'high',
          status: 'completed',
          estimated_cost: 200,
          actual_cost: 180,
          reported_date: '2024-01-10T11:00:00Z',
          assigned_date: '2024-01-11T09:00:00Z',
          completed_date: '2024-01-12T15:00:00Z',
          notes: 'AC unit repaired and working properly'
        }
      ];

      // Apply filters
      let filteredRequests = mockRequests.filter(request => {
        if (filters.priority && request.priority !== filters.priority) return false;
        if (filters.status && request.status !== filters.status) return false;
        if (filters.building && request.building_name !== filters.building) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            request.title.toLowerCase().includes(searchLower) ||
            request.description.toLowerCase().includes(searchLower) ||
            request.room_number.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

      setMaintenanceRequests(paginatedRequests);
      setTotalCount(filteredRequests.length);
      setTotalPages(Math.ceil(filteredRequests.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      // Mock data for available rooms
      const mockRooms: Room[] = [
        { id: 1, room_number: 'A-101', building_name: 'Building A', room_type: 'Double Room' },
        { id: 2, room_number: 'A-102', building_name: 'Building A', room_type: 'Single Room' },
        { id: 3, room_number: 'B-201', building_name: 'Building B', room_type: 'Triple Room' },
        { id: 4, room_number: 'C-301', building_name: 'Building C', room_type: 'Double Room' },
      ];
      setAvailableRooms(mockRooms);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      // Mock data for available users (maintenance staff)
      const mockUsers: User[] = [
        { id: 1, name: 'Mike Johnson', role: 'Plumber' },
        { id: 2, name: 'Sarah Davis', role: 'Electrician' },
        { id: 3, name: 'Tom Wilson', role: 'General Maintenance' },
        { id: 4, name: 'Lisa Brown', role: 'HVAC Technician' },
      ];
      setAvailableUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats
      setStats({
        pending: 8,
        assigned: 5,
        in_progress: 3,
        completed: 25,
        total_cost: 4500
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleCreateRequest = async () => {
    try {
      // Mock API call
      console.log('Creating maintenance request:', requestForm);
      setShowRequestModal(false);
      setRequestForm({
        title: '',
        description: '',
        room_id: '',
        priority: 'medium',
        estimated_cost: 0,
        notes: ''
      });
      fetchMaintenanceRequests();
      fetchStats();
    } catch (error) {
      console.error('Error creating maintenance request:', error);
    }
  };

  const handleAssignRequest = async () => {
    try {
      // Mock API call
      console.log('Assigning request:', assignForm);
      setShowAssignModal(false);
      setAssignForm({ assigned_to: '', notes: '' });
      fetchMaintenanceRequests();
    } catch (error) {
      console.error('Error assigning request:', error);
    }
  };

  const handleCompleteRequest = async () => {
    try {
      // Mock API call
      console.log('Completing request:', completeForm);
      setShowCompleteModal(false);
      setCompleteForm({ actual_cost: 0, notes: '' });
      fetchMaintenanceRequests();
      fetchStats();
    } catch (error) {
      console.error('Error completing request:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterOptions = [
    { label: 'All Priorities', value: '' },
    { label: 'Urgent', value: 'urgent' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const buildingOptions = [
    { label: 'All Buildings', value: '' },
    { label: 'Building A', value: 'Building A' },
    { label: 'Building B', value: 'Building B' },
    { label: 'Building C', value: 'Building C' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Requests"
        description="Manage and track maintenance requests for hostel facilities"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowRequestModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Request
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">${stats.total_cost}</p>
            </div>
          </div>
        </Card>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search by title, description, or room..."
        filterOptions={[
          { key: 'priority', label: 'Priority', options: filterOptions },
          { key: 'status', label: 'Status', options: statusOptions },
          { key: 'building', label: 'Building', options: buildingOptions },
        ]}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maintenanceRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{request.description.substring(0, 50)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.room_number}</div>
                      <div className="text-sm text-gray-500">{request.building_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.assigned_to || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.actual_cost ? `$${request.actual_cost}` : request.estimated_cost ? `$${request.estimated_cost}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowAssignModal(true);
                          }}
                        >
                          <UserIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {request.status === 'in_progress' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowCompleteModal(true);
                          }}
                        >
                          <CheckCircleIcon className="h-4 w-4" />
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
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* New Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="New Maintenance Request"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={requestForm.title}
            onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            value={requestForm.description}
            onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
            rows={4}
            required
          />

          <Select
            label="Room"
            value={requestForm.room_id}
            onChange={(value) => setRequestForm({ ...requestForm, room_id: value })}
            options={availableRooms.map(room => ({
              value: room.id.toString(),
              label: `${room.room_number} - ${room.building_name}`
            }))}
            required
          />

          <Select
            label="Priority"
            value={requestForm.priority}
            onChange={(value) => setRequestForm({ ...requestForm, priority: value })}
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Urgent', value: 'urgent' },
            ]}
            required
          />

          <Input
            label="Estimated Cost"
            type="number"
            value={requestForm.estimated_cost}
            onChange={(e) => setRequestForm({ ...requestForm, estimated_cost: parseFloat(e.target.value) })}
            min={0}
            step={0.01}
          />

          <Textarea
            label="Notes"
            value={requestForm.notes}
            onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateRequest}>
            Create Request
          </Button>
        </div>
      </Modal>

      {/* Assign Request Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Maintenance Request"
        size="md"
      >
        <div className="space-y-4">
          {selectedRequest && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm">
                <div><span className="font-medium">Title:</span> {selectedRequest.title}</div>
                <div><span className="font-medium">Room:</span> {selectedRequest.room_number} - {selectedRequest.building_name}</div>
                <div><span className="font-medium">Priority:</span> {selectedRequest.priority}</div>
              </div>
            </div>
          )}

          <Select
            label="Assign To"
            value={assignForm.assigned_to}
            onChange={(value) => setAssignForm({ ...assignForm, assigned_to: value })}
            options={availableUsers.map(user => ({
              value: user.id.toString(),
              label: `${user.name} (${user.role})`
            }))}
            required
          />

          <Textarea
            label="Assignment Notes"
            value={assignForm.notes}
            onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssignRequest}>
            Assign Request
          </Button>
        </div>
      </Modal>

      {/* Complete Request Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Maintenance Request"
        size="md"
      >
        <div className="space-y-4">
          {selectedRequest && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm">
                <div><span className="font-medium">Title:</span> {selectedRequest.title}</div>
                <div><span className="font-medium">Room:</span> {selectedRequest.room_number} - {selectedRequest.building_name}</div>
                <div><span className="font-medium">Estimated Cost:</span> ${selectedRequest.estimated_cost}</div>
              </div>
            </div>
          )}

          <Input
            label="Actual Cost"
            type="number"
            value={completeForm.actual_cost}
            onChange={(e) => setCompleteForm({ ...completeForm, actual_cost: parseFloat(e.target.value) })}
            min={0}
            step={0.01}
            required
          />

          <Textarea
            label="Completion Notes"
            value={completeForm.notes}
            onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCompleteRequest}>
            Complete Request
          </Button>
        </div>
      </Modal>

      {/* Request Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Maintenance Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                  {selectedRequest.priority}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.room_number} - {selectedRequest.building_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reported By</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.reported_by}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.assigned_to || 'Unassigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reported Date</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedRequest.reported_date).toLocaleString()}</p>
              </div>
              {selectedRequest.assigned_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Date</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedRequest.assigned_date).toLocaleString()}</p>
                </div>
              )}
              {selectedRequest.completed_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Completed Date</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedRequest.completed_date).toLocaleString()}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Cost</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.estimated_cost ? `$${selectedRequest.estimated_cost}` : 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Actual Cost</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.actual_cost ? `$${selectedRequest.actual_cost}` : 'Not specified'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRequest.description}</p>
            </div>
            {selectedRequest.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.notes}</p>
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

export default Maintenance;

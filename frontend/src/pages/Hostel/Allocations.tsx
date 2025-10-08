import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/UI/Dialog';
import Input from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';
import {
  XCircleIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Allocation {
  id: number;
  student_name: string;
  student_id: string;
  room_number: string;
  building_name: string;
  bed_number: number;
  check_in_date: string;
  check_out_date?: string;
  status: string;
  allocated_by: string;
  notes: string;
  created_at: string;
}

interface Room {
  id: number;
  room_number: string;
  building_name: string;
  room_type: string;
  available_beds: number;
  current_capacity: number;
}

interface Student {
  id: number;
  full_name: string;
  student_id: string;
  email: string;
  phone: string;
}

const Allocations: React.FC = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  // Form states
  const [allocationForm, setAllocationForm] = useState({
    student_id: '',
    room_id: '',
    bed_number: 1,
    check_in_date: '',
    notes: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    building: '',
    status: '',
    search: '',
  });

  const fetchAllocations = useCallback(async () => {
    try {
      // Mock data for demonstration
      const mockAllocations: Allocation[] = [
        {
          id: 1,
          student_name: 'John Doe',
          student_id: 'STU001',
          room_number: 'A-101',
          building_name: 'Building A',
          bed_number: 1,
          check_in_date: '2024-01-15',
          status: 'active',
          allocated_by: 'Admin User',
          notes: 'Regular allocation',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          student_name: 'Jane Smith',
          student_id: 'STU002',
          room_number: 'A-101',
          building_name: 'Building A',
          bed_number: 2,
          check_in_date: '2024-01-15',
          status: 'active',
          allocated_by: 'Admin User',
          notes: 'Regular allocation',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 3,
          student_name: 'Mike Johnson',
          student_id: 'STU003',
          room_number: 'B-205',
          building_name: 'Building B',
          bed_number: 1,
          check_in_date: '2024-01-14',
          check_out_date: '2024-06-30',
          status: 'inactive',
          allocated_by: 'Admin User',
          notes: 'Temporary allocation',
          created_at: '2024-01-14T09:00:00Z',
        },
      ];

      // Apply filters
      let filteredAllocations = mockAllocations.filter(allocation => {
        if (filters.building && allocation.building_name !== filters.building) return false;
        if (filters.status && allocation.status !== filters.status) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            allocation.student_name.toLowerCase().includes(searchLower) ||
            allocation.student_id.toLowerCase().includes(searchLower) ||
            allocation.room_number.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedAllocations = filteredAllocations.slice(startIndex, endIndex);

      setAllocations(paginatedAllocations);
      setTotalCount(filteredAllocations.length);
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchAllocations();
    fetchAvailableRooms();
    fetchAvailableStudents();
  }, [fetchAllocations]);

  const fetchAvailableRooms = async () => {
    try {
      // Mock data for available rooms
      const mockRooms: Room[] = [
        { id: 1, room_number: 'A-102', building_name: 'Building A', room_type: 'Single Room', available_beds: 1, current_capacity: 0 },
        { id: 2, room_number: 'A-103', building_name: 'Building A', room_type: 'Double Room', available_beds: 2, current_capacity: 0 },
        { id: 3, room_number: 'B-201', building_name: 'Building B', room_type: 'Triple Room', available_beds: 3, current_capacity: 0 },
      ];
      setAvailableRooms(mockRooms);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      // Mock data for available students
      const mockStudents: Student[] = [
        { id: 1, full_name: 'Alice Brown', student_id: 'STU004', email: 'alice@example.com', phone: '+1234567890' },
        { id: 2, full_name: 'Bob Wilson', student_id: 'STU005', email: 'bob@example.com', phone: '+1234567891' },
        { id: 3, full_name: 'Carol Davis', student_id: 'STU006', email: 'carol@example.com', phone: '+1234567892' },
      ];
      setAvailableStudents(mockStudents);
    } catch (error) {
      console.error('Error fetching available students:', error);
    }
  };



  const handleCreateAllocation = async () => {
    try {
      // Mock API call
      console.log('Creating allocation:', allocationForm);
      setShowAllocationModal(false);
      setAllocationForm({
        student_id: '',
        room_id: '',
        bed_number: 1,
        check_in_date: '',
        notes: ''
      });
      fetchAllocations();
    } catch (error) {
      console.error('Error creating allocation:', error);
    }
  };

  const handleCheckOut = async (allocationId: number) => {
    try {
      // Mock API call
      console.log('Checking out allocation:', allocationId);
      fetchAllocations();
    } catch (error) {
      console.error('Error checking out allocation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterOptions = [
    { label: 'All Buildings', value: '' },
    { label: 'Building A', value: 'Building A' },
    { label: 'Building B', value: 'Building B' },
    { label: 'Building C', value: 'Building C' },
  ];

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Allocations"
        subtitle="Manage student room allocations, check-ins, and check-outs"
        actions={
          <Button variant="default" size="sm" onClick={() => setShowAllocationModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Allocation
          </Button>
        }
      />

      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        searchPlaceholder="Search by student name, ID, or room..."
        right={
          <div className="flex gap-2">
            <select
              value={filters.building}
              onChange={(e) => setFilters(prev => ({ ...prev, building: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        }
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
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in Date
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
              {allocations.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{allocation.student_name}</div>
                      <div className="text-sm text-gray-500">{allocation.student_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{allocation.room_number}</div>
                      <div className="text-sm text-gray-500">{allocation.building_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Bed {allocation.bed_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(allocation.check_in_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(allocation.status)}`}>
                      {allocation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAllocation(allocation);
                          setShowDetailModal(true);
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {allocation.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCheckOut(allocation.id)}
                        >
                          <XCircleIcon className="h-4 w-4" />
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
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* New Allocation Dialog */}
      <Dialog open={showAllocationModal} onOpenChange={setShowAllocationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Room Allocation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <select
                value={allocationForm.student_id}
                onChange={(e) => setAllocationForm({ ...allocationForm, student_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select student</option>
                {availableStudents.map(student => (
                  <option key={student.id} value={student.id.toString()}>
                    {student.full_name} ({student.student_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <select
                value={allocationForm.room_id}
                onChange={(e) => setAllocationForm({ ...allocationForm, room_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select room</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id.toString()}>
                    {room.room_number} - {room.building_name} ({room.available_beds} beds available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
              <Input
                type="number"
                value={allocationForm.bed_number}
                onChange={(e) => setAllocationForm({ ...allocationForm, bed_number: parseInt(e.target.value) })}
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
              <Input
                type="date"
                value={allocationForm.check_in_date}
                onChange={(e) => setAllocationForm({ ...allocationForm, check_in_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <Textarea
                value={allocationForm.notes}
                onChange={(e) => setAllocationForm({ ...allocationForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setShowAllocationModal(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleCreateAllocation}>
              Create Allocation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Allocation Detail Dialog */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Allocation Details</DialogTitle>
          </DialogHeader>
        {selectedAllocation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAllocation.student_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAllocation.student_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAllocation.room_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Building</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAllocation.building_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bed Number</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAllocation.bed_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAllocation.status)}`}>
                  {selectedAllocation.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedAllocation.check_in_date).toLocaleDateString()}</p>
              </div>
              {selectedAllocation.check_out_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedAllocation.check_out_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Allocated By</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAllocation.allocated_by}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedAllocation.created_at).toLocaleString()}</p>
              </div>
            </div>
            {selectedAllocation.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAllocation.notes}</p>
              </div>
            )}
          </div>
        )}

                 <div className="flex justify-end mt-6">
           <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
             Close
           </Button>
         </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Allocations;

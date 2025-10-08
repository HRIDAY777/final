import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import Input from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import {
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface VisitorLog {
  id: number;
  visitor_name: string;
  visitor_phone: string;
  student_name: string;
  student_id: string;
  purpose: string;
  entry_time: string;
  exit_time?: string;
  approved_by: string;
  notes: string;
  is_inside: boolean;
  duration?: string;
}

interface Student {
  id: number;
  full_name: string;
  student_id: string;
  room_number: string;
  building_name: string;
}

const Visitors: React.FC = () => {
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorLog | null>(null);

  // Form states
  const [entryForm, setEntryForm] = useState({
    visitor_name: '',
    visitor_phone: '',
    student_id: '',
    purpose: '',
    notes: ''
  });

  const [exitForm, setExitForm] = useState({
    notes: ''
  });

  // Filter states
  const [searchValue, setSearchValue] = useState('');

  // Stats
  const [stats, setStats] = useState({
    today_visitors: 0,
    currently_inside: 0,
    weekly_visitors: 0,
    monthly_visitors: 0
  });

  const fetchVisitorLogs = useCallback(async () => {
    try {
      // Mock data for demonstration
      const mockVisitors: VisitorLog[] = [
        {
          id: 1,
          visitor_name: 'John Smith',
          visitor_phone: '+1234567890',
          student_name: 'Alice Johnson',
          student_id: 'STU001',
          purpose: 'Family visit',
          entry_time: '2024-01-15T14:30:00Z',
          exit_time: '2024-01-15T16:30:00Z',
          approved_by: 'Admin User',
          notes: 'Regular family visit',
          is_inside: false,
          duration: '2 hours'
        },
        {
          id: 2,
          visitor_name: 'Sarah Wilson',
          visitor_phone: '+1234567891',
          student_name: 'Bob Brown',
          student_id: 'STU002',
          purpose: 'Study group',
          entry_time: '2024-01-15T15:00:00Z',
          approved_by: 'Admin User',
          notes: 'Study session in common room',
          is_inside: true
        },
        {
          id: 3,
          visitor_name: 'Mike Davis',
          visitor_phone: '+1234567892',
          student_name: 'Carol White',
          student_id: 'STU003',
          purpose: 'Delivery',
          entry_time: '2024-01-15T10:00:00Z',
          exit_time: '2024-01-15T10:15:00Z',
          approved_by: 'Security Guard',
          notes: 'Package delivery',
          is_inside: false,
          duration: '15 minutes'
        }
      ];

      // Apply search filter
      let filteredVisitors = mockVisitors;
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        filteredVisitors = mockVisitors.filter(visitor => 
          visitor.visitor_name.toLowerCase().includes(searchLower) ||
          visitor.student_name.toLowerCase().includes(searchLower) ||
          visitor.purpose.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedVisitors = filteredVisitors.slice(startIndex, endIndex);

      setVisitorLogs(paginatedVisitors);
      setTotalCount(filteredVisitors.length);
    } catch (error) {
      console.error('Error fetching visitor logs:', error);
    }
  }, [currentPage, searchValue]);

  useEffect(() => {
    fetchVisitorLogs();
    fetchAvailableStudents();
    fetchStats();
  }, [fetchVisitorLogs]);



  const fetchAvailableStudents = async () => {
    try {
      // Mock data for available students
      const mockStudents: Student[] = [
        { id: 1, full_name: 'Alice Brown', student_id: 'STU001', room_number: 'A-101', building_name: 'Building A' },
        { id: 2, full_name: 'Bob Wilson', student_id: 'STU002', room_number: 'A-102', building_name: 'Building A' },
        { id: 3, full_name: 'Carol Davis', student_id: 'STU003', room_number: 'B-201', building_name: 'Building B' },
        { id: 4, full_name: 'Mike Johnson', student_id: 'STU004', room_number: 'C-301', building_name: 'Building C' },
      ];
      setAvailableStudents(mockStudents);
    } catch (error) {
      console.error('Error fetching available students:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats
      setStats({
        today_visitors: 12,
        currently_inside: 3,
        weekly_visitors: 45,
        monthly_visitors: 180
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };



  const handleRecordEntry = async () => {
    try {
      // Mock API call
      console.log('Recording visitor entry:', entryForm);
      setShowEntryModal(false);
      setEntryForm({
        visitor_name: '',
        visitor_phone: '',
        student_id: '',
        purpose: '',
        notes: ''
      });
      fetchVisitorLogs();
      fetchStats();
    } catch (error) {
      console.error('Error recording visitor entry:', error);
    }
  };

  const handleRecordExit = async () => {
    try {
      // Mock API call
      console.log('Recording visitor exit:', exitForm);
      setShowExitModal(false);
      setExitForm({ notes: '' });
      fetchVisitorLogs();
      fetchStats();
    } catch (error) {
      console.error('Error recording visitor exit:', error);
    }
  };

  const getStatusColor = (isInside: boolean) => {
    return isInside ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (isInside: boolean) => {
    return isInside ? 'Inside' : 'Left';
  };



  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Management"
        subtitle="Manage visitor entry and exit logs for hostel security"
        actions={
          <Button variant="default" size="sm" onClick={() => setShowEntryModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Record Entry
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today&apos;s Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today_visitors}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Currently Inside</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currently_inside}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.weekly_visitors}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthly_visitors}</p>
            </div>
          </div>
        </Card>
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by visitor name, student name, or purpose..."
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exit Time
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
              {visitorLogs.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{visitor.visitor_name}</div>
                      <div className="text-sm text-gray-500">{visitor.visitor_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{visitor.student_name}</div>
                      <div className="text-sm text-gray-500">{visitor.student_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visitor.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(visitor.entry_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visitor.exit_time ? new Date(visitor.exit_time).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(visitor.is_inside)}`}>
                      {getStatusText(visitor.is_inside)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedVisitor(visitor);
                          setShowDetailModal(true);
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {visitor.is_inside && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVisitor(visitor);
                            setShowExitModal(true);
                          }}
                        >
                          <ArrowRightIcon className="h-4 w-4" />
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

      {/* Entry Modal */}
      <Modal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        title="Record Visitor Entry"
        size="lg"
      >
                 <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name</label>
             <Input
               value={entryForm.visitor_name}
               onChange={(e) => setEntryForm({ ...entryForm, visitor_name: e.target.value })}
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Phone</label>
             <Input
               value={entryForm.visitor_phone}
               onChange={(e) => setEntryForm({ ...entryForm, visitor_phone: e.target.value })}
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Student</label>
             <Select
               value={entryForm.student_id}
               onValueChange={(value) => setEntryForm({ ...entryForm, student_id: value })}
             >
               <option value="">Select a student</option>
               {availableStudents.map(student => (
                 <option key={student.id} value={student.id.toString()}>
                   {student.full_name} ({student.student_id}) - {student.room_number}
                 </option>
               ))}
             </Select>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
             <Textarea
               value={entryForm.purpose}
               onChange={(e) => setEntryForm({ ...entryForm, purpose: e.target.value })}
               rows={3}
               required
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
             <Textarea
               value={entryForm.notes}
               onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
               rows={3}
             />
           </div>
         </div>

         <div className="flex justify-end space-x-3 mt-6">
           <Button variant="secondary" onClick={() => setShowEntryModal(false)}>
             Cancel
           </Button>
           <Button variant="default" onClick={handleRecordEntry}>
             Record Entry
           </Button>
         </div>
      </Modal>

      {/* Exit Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Record Visitor Exit"
        size="md"
      >
        <div className="space-y-4">
          {selectedVisitor && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm">
                <div><span className="font-medium">Visitor:</span> {selectedVisitor.visitor_name}</div>
                <div><span className="font-medium">Student:</span> {selectedVisitor.student_name}</div>
                <div><span className="font-medium">Entry Time:</span> {new Date(selectedVisitor.entry_time).toLocaleString()}</div>
                <div><span className="font-medium">Purpose:</span> {selectedVisitor.purpose}</div>
              </div>
            </div>
          )}

          <Textarea
            label="Exit Notes"
            value={exitForm.notes}
            onChange={(e) => setExitForm({ ...exitForm, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowExitModal(false)}>
            Cancel
          </Button>
                     <Button variant="default" onClick={handleRecordExit}>
             Record Exit
           </Button>
        </div>
      </Modal>

      {/* Visitor Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Visitor Details"
        size="lg"
      >
        {selectedVisitor && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Visitor Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVisitor.visitor_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visitor Phone</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVisitor.visitor_phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVisitor.student_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVisitor.student_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVisitor.purpose}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedVisitor.is_inside)}`}>
                  {getStatusText(selectedVisitor.is_inside)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Entry Time</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedVisitor.entry_time).toLocaleString()}</p>
              </div>
              {selectedVisitor.exit_time && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exit Time</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedVisitor.exit_time).toLocaleString()}</p>
                </div>
              )}
              {selectedVisitor.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedVisitor.duration}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Approved By</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVisitor.approved_by}</p>
              </div>
            </div>
            {selectedVisitor.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVisitor.notes}</p>
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

export default Visitors;

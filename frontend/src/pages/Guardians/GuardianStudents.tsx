import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { Skeleton } from '../../components/UI/Skeleton';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface GuardianStudent {
  id: string;
  guardian: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  student: {
    id: string;
    name: string;
    student_id: string;
    class: string;
    section: string;
    roll_number: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
    gender: string;
    blood_group: string;
    status: string;
  };
  relationship: string;
  is_primary_guardian: boolean;
  is_emergency_contact: boolean;
  is_fee_payer: boolean;
  is_authorized_pickup: boolean;
  can_view_academic_records: boolean;
  can_view_attendance: boolean;
  can_view_fees: boolean;
  can_receive_notifications: boolean;
  created_at: string;
}

const GuardianStudents: React.FC = () => {
  const [relationships, setRelationships] = useState<GuardianStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<GuardianStudent | null>(null);

  const [formData, setFormData] = useState({
    guardian_id: '',
    student_id: '',
    relationship: 'father',
    is_primary_guardian: false,
    is_emergency_contact: false,
    is_fee_payer: false,
    is_authorized_pickup: false,
    can_view_academic_records: true,
    can_view_attendance: true,
    can_view_fees: true,
    can_receive_notifications: true
  });

  // Mock data
  useEffect(() => {
    const mockRelationships: GuardianStudent[] = [
      {
        id: '1',
        guardian: {
          id: '1',
          name: 'আব্দুল রহমান',
          email: 'abdul.rahman@email.com',
          phone: '+880 1712345678'
        },
        student: {
          id: '1',
          name: 'আহমেদ রহমান',
          student_id: 'S001',
          class: 'Class 8',
          section: 'A',
          roll_number: '001',
          email: 'ahmed.rahman@email.com',
          phone: '+880 1612345678',
          address: 'House #123, Road #5, Dhanmondi, Dhaka',
          date_of_birth: '2010-05-15',
          gender: 'M',
          blood_group: 'B+',
          status: 'active'
        },
        relationship: 'father',
        is_primary_guardian: true,
        is_emergency_contact: true,
        is_fee_payer: true,
        is_authorized_pickup: true,
        can_view_academic_records: true,
        can_view_attendance: true,
        can_view_fees: true,
        can_receive_notifications: true,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        guardian: {
          id: '1',
          name: 'আব্দুল রহমান',
          email: 'abdul.rahman@email.com',
          phone: '+880 1712345678'
        },
        student: {
          id: '2',
          name: 'আয়েশা রহমান',
          student_id: 'S002',
          class: 'Class 5',
          section: 'B',
          roll_number: '015',
          email: 'ayesha.rahman@email.com',
          phone: '+880 1512345678',
          address: 'House #123, Road #5, Dhanmondi, Dhaka',
          date_of_birth: '2013-08-20',
          gender: 'F',
          blood_group: 'O+',
          status: 'active'
        },
        relationship: 'father',
        is_primary_guardian: true,
        is_emergency_contact: true,
        is_fee_payer: true,
        is_authorized_pickup: true,
        can_view_academic_records: true,
        can_view_attendance: true,
        can_view_fees: true,
        can_receive_notifications: true,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        guardian: {
          id: '2',
          name: 'ফাতেমা বেগম',
          email: 'fatema.begum@email.com',
          phone: '+880 1812345678'
        },
        student: {
          id: '3',
          name: 'মোহাম্মদ আলী',
          student_id: 'S003',
          class: 'Class 10',
          section: 'A',
          roll_number: '008',
          email: 'mohammad.ali@email.com',
          phone: '+880 1412345678',
          address: 'House #456, Road #8, Gulshan, Dhaka',
          date_of_birth: '2008-12-10',
          gender: 'M',
          blood_group: 'A+',
          status: 'active'
        },
        relationship: 'mother',
        is_primary_guardian: true,
        is_emergency_contact: true,
        is_fee_payer: true,
        is_authorized_pickup: true,
        can_view_academic_records: true,
        can_view_attendance: true,
        can_view_fees: true,
        can_receive_notifications: true,
        created_at: '2024-01-20T14:30:00Z'
      }
    ];

    setTimeout(() => {
      setRelationships(mockRelationships);
      setLoading(false);
      setTotalPages(1);
    }, 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Relationship data:', formData);
    setIsModalOpen(false);
    setEditingRelationship(null);
    resetForm();
  };

  const handleEdit = (relationship: GuardianStudent) => {
    setEditingRelationship(relationship);
    setFormData({
      guardian_id: relationship.guardian.id,
      student_id: relationship.student.id,
      relationship: relationship.relationship,
      is_primary_guardian: relationship.is_primary_guardian,
      is_emergency_contact: relationship.is_emergency_contact,
      is_fee_payer: relationship.is_fee_payer,
      is_authorized_pickup: relationship.is_authorized_pickup,
      can_view_academic_records: relationship.can_view_academic_records,
      can_view_attendance: relationship.can_view_attendance,
      can_view_fees: relationship.can_view_fees,
      can_receive_notifications: relationship.can_receive_notifications
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this relationship?')) {
      console.log('Deleting relationship:', id);
    }
  };

  const resetForm = () => {
    setFormData({
      guardian_id: '',
      student_id: '',
      relationship: 'father',
      is_primary_guardian: false,
      is_emergency_contact: false,
      is_fee_payer: false,
      is_authorized_pickup: false,
      can_view_academic_records: true,
      can_view_attendance: true,
      can_view_fees: true,
      can_receive_notifications: true
    });
  };

  const getRelationshipLabel = (relationship: string) => {
    const relationships: { [key: string]: string } = {
      'father': 'Father',
      'mother': 'Mother',
      'grandfather': 'Grandfather',
      'grandmother': 'Grandmother',
      'uncle': 'Uncle',
      'aunt': 'Aunt',
      'brother': 'Brother',
      'sister': 'Sister',
      'guardian': 'Legal Guardian',
      'other': 'Other'
    };
    return relationships[relationship] || relationship;
  };

  const filteredRelationships = relationships.filter(relationship => {
    const matchesSearch = relationship.guardian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relationship.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relationship.student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelationship = relationshipFilter === 'all' || relationship.relationship === relationshipFilter;
    return matchesSearch && matchesRelationship;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <PageHeader title="Guardian-Student Relationships" subtitle="Manage guardian and student connections" />
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48" />
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
          title="Guardian-Student Relationships" 
          subtitle="Manage guardian and student connections"
          actions={
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Relationship
            </Button>
          }
        />
      </Card>

      <Card>
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          right={
            <select
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Relationships</option>
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="grandfather">Grandfather</option>
              <option value="grandmother">Grandmother</option>
              <option value="uncle">Uncle</option>
              <option value="aunt">Aunt</option>
              <option value="guardian">Legal Guardian</option>
              <option value="other">Other</option>
            </select>
          }
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRelationships.map((relationship) => (
          <Card key={relationship.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {relationship.student.name}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {relationship.student.student_id}</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {getRelationshipLabel(relationship.relationship)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <AcademicCapIcon className="w-4 h-4 mr-2" />
                {relationship.student.class} - Section {relationship.student.section}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon className="w-4 h-4 mr-2" />
                Guardian: {relationship.guardian.name}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                {relationship.guardian.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {relationship.guardian.phone}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {relationship.is_primary_guardian && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full text-center">
                  Primary Guardian
                </span>
              )}
              {relationship.is_emergency_contact && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full text-center">
                  Emergency Contact
                </span>
              )}
              {relationship.is_fee_payer && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full text-center">
                  Fee Payer
                </span>
              )}
              {relationship.is_authorized_pickup && (
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full text-center">
                  Authorized Pickup
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Created: {new Date(relationship.created_at).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(relationship)}>
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <EyeIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(relationship.id)}>
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRelationships.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No relationships found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add First Relationship
            </Button>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <Card>
          <Pagination
            page={currentPage}
            pageSize={10}
            total={relationships.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}

      {/* Relationship Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingRelationship ? 'Edit Relationship' : 'Add New Relationship'}
            </h2>
            
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
                    <option value="1">আব্দুল রহমান</option>
                    <option value="2">ফাতেমা বেগম</option>
                    <option value="3">মোহাম্মদ আলী</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student *
                  </label>
                  <select
                    required
                    value={formData.student_id}
                    onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Student</option>
                    <option value="1">আহমেদ রহমান (S001)</option>
                    <option value="2">আয়েশা রহমান (S002)</option>
                    <option value="3">মোহাম্মদ আলী (S003)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <select
                    required
                    value={formData.relationship}
                    onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="grandfather">Grandfather</option>
                    <option value="grandmother">Grandmother</option>
                    <option value="uncle">Uncle</option>
                    <option value="aunt">Aunt</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                    <option value="guardian">Legal Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_primary_guardian}
                      onChange={(e) => setFormData({...formData, is_primary_guardian: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">Primary Guardian</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_emergency_contact}
                      onChange={(e) => setFormData({...formData, is_emergency_contact: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">Emergency Contact</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_fee_payer}
                      onChange={(e) => setFormData({...formData, is_fee_payer: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">Fee Payer</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_authorized_pickup}
                      onChange={(e) => setFormData({...formData, is_authorized_pickup: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">Authorized Pickup</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.can_view_academic_records}
                      onChange={(e) => setFormData({...formData, can_view_academic_records: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">View Academic Records</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.can_view_attendance}
                      onChange={(e) => setFormData({...formData, can_view_attendance: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">View Attendance</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.can_view_fees}
                      onChange={(e) => setFormData({...formData, can_view_fees: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">View Fees</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.can_receive_notifications}
                      onChange={(e) => setFormData({...formData, can_receive_notifications: e.target.checked})}
                      className="rounded mr-2"
                    />
                    <label className="text-sm text-gray-700">Receive Notifications</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRelationship(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRelationship ? 'Update Relationship' : 'Add Relationship'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianStudents;


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
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface Guardian {
  id: string;
  guardian_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  occupation: string;
  status: 'active' | 'inactive' | 'suspended';
  is_active: boolean;
  created_at: string;
  students_count: number;
}

const Guardians: React.FC = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    occupation: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Bangladesh',
    gender: 'M',
    date_of_birth: '',
    blood_group: '',
    education_level: '',
    employer: '',
    annual_income: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockGuardians: Guardian[] = [
      {
        id: '1',
        guardian_id: 'G001',
        first_name: 'আব্দুল',
        last_name: 'রহমান',
        email: 'abdul.rahman@email.com',
        phone: '+880 1712345678',
        occupation: 'Engineer',
        status: 'active',
        is_active: true,
        created_at: '2024-01-15',
        students_count: 2
      },
      {
        id: '2',
        guardian_id: 'G002',
        first_name: 'ফাতেমা',
        last_name: 'বেগম',
        email: 'fatema.begum@email.com',
        phone: '+880 1812345678',
        occupation: 'Teacher',
        status: 'active',
        is_active: true,
        created_at: '2024-01-20',
        students_count: 1
      },
      {
        id: '3',
        guardian_id: 'G003',
        first_name: 'মোহাম্মদ',
        last_name: 'আলী',
        email: 'mohammad.ali@email.com',
        phone: '+880 1912345678',
        occupation: 'Doctor',
        status: 'active',
        is_active: true,
        created_at: '2024-01-25',
        students_count: 3
      }
    ];

    setTimeout(() => {
      setGuardians(mockGuardians);
      setLoading(false);
      setTotalPages(1);
    }, 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Guardian data:', formData);
    setIsModalOpen(false);
    setEditingGuardian(null);
    resetForm();
  };

  const handleEdit = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    setFormData({
      first_name: guardian.first_name,
      last_name: guardian.last_name,
      email: guardian.email,
      phone: guardian.phone,
      occupation: guardian.occupation,
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Bangladesh',
      gender: 'M',
      date_of_birth: '',
      blood_group: '',
      education_level: '',
      employer: '',
      annual_income: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this guardian?')) {
      // Handle deletion
      console.log('Deleting guardian:', id);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      occupation: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Bangladesh',
      gender: 'M',
      date_of_birth: '',
      blood_group: '',
      education_level: '',
      employer: '',
      annual_income: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGuardians = guardians.filter(guardian => {
    const matchesSearch = guardian.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guardian.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guardian.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guardian.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || guardian.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <PageHeader title="Guardians" subtitle="Manage guardian information and relationships" />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          title="Guardians" 
          subtitle="Manage guardian information and relationships"
          actions={
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Guardian
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          }
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuardians.map((guardian) => (
          <Card key={guardian.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {guardian.first_name} {guardian.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {guardian.guardian_id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(guardian.status)}`}>
                {guardian.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                {guardian.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {guardian.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AcademicCapIcon className="w-4 h-4 mr-2" />
                {guardian.occupation}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {guardian.students_count} student(s)
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(guardian)}>
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <EyeIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(guardian.id)}>
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredGuardians.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No guardians found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add First Guardian
            </Button>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <Card>
          <Pagination
            page={currentPage}
            pageSize={10}
            total={guardians.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}

      {/* Guardian Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingGuardian ? 'Edit Guardian' : 'Add New Guardian'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingGuardian(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGuardian ? 'Update Guardian' : 'Add Guardian'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guardians;


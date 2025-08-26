import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import Input from '../../components/UI/Input';

import { Textarea } from '../../components/UI/Textarea';
import { apiService } from '../../services/api';
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface Class {
  id: number;
  name: string;
}

interface AcademicYear {
  id: number;
  name: string;
}

const CreateStudent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [formData, setFormData] = useState({
    // User data
    user: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      is_active: true
    },
    password: '',
    
    // Student data
    student_id: '',
    admission_number: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Bangladesh',
    current_class: '',
    admission_date: '',
    academic_year: '',
    status: 'active',
    is_active: true
  });

  useEffect(() => {
    fetchClasses();
    fetchAcademicYears();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await apiService.get('/classes/') as any;
      setClasses(data.results || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const data = await apiService.get('/academics/academic-years/') as any;
      setAcademicYears(data.results || []);
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev];
        if (typeof parentValue !== 'object' || parentValue === null) {
          return { ...prev, [field]: value };
        }
        return {
          ...prev,
          [parent]: {
            ...parentValue,
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const studentId = `STU${year}${random}`;
    setFormData(prev => ({ ...prev, student_id: studentId }));
  };

  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const admissionNumber = `ADM${year}${random}`;
    setFormData(prev => ({ ...prev, admission_number: admissionNumber }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the data for submission
      const submitData = {
        user: {
          username: formData.user.username || formData.email,
          email: formData.email || formData.user.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_active: formData.user.is_active
        },
        password: formData.password,
        student_id: formData.student_id,
        admission_number: formData.admission_number,
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        blood_group: formData.blood_group,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        current_class: formData.current_class || null,
        admission_date: formData.admission_date,
        academic_year: formData.academic_year || null,
        status: formData.status,
        is_active: formData.is_active
      };

      await apiService.post('/students/', submitData);
      alert('Student created successfully!');
      window.location.href = '/students/list';
    } catch (error: any) {
      console.error('Failed to create student:', error);
      alert(error.response?.data?.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title="Add New Student" 
          subtitle="Create a new student profile"
          actions={
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
          }
        />
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.student_id}
                      onChange={(e) => handleInputChange('student_id', e.target.value)}
                      placeholder="Student ID"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateStudentId}
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admission Number *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.admission_number}
                      onChange={(e) => handleInputChange('admission_number', e.target.value)}
                      placeholder="Admission Number"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateAdmissionNumber}
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <Input
                    value={formData.middle_name}
                    onChange={(e) => handleInputChange('middle_name', e.target.value)}
                    placeholder="Middle Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                                     <select
                     value={formData.gender}
                     onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('gender', e.target.value)}
                     required
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                     <option value="">Select Gender</option>
                     <option value="M">Male</option>
                     <option value="F">Female</option>
                     <option value="O">Other</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                                 <select
                   value={formData.blood_group}
                   onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('blood_group', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 >
                   <option value="">Select Blood Group</option>
                   <option value="A+">A+</option>
                   <option value="A-">A-</option>
                   <option value="B+">B+</option>
                   <option value="B-">B-</option>
                   <option value="AB+">AB+</option>
                   <option value="AB-">AB-</option>
                   <option value="O+">O+</option>
                   <option value="O-">O-</option>
                 </select>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email Address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full Address"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    placeholder="Postal Code"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </Card>

          {/* Academic Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Class
                  </label>
                                     <select
                     value={formData.current_class}
                     onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('current_class', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                     <option value="">Select Class</option>
                     {classes.map(cls => (
                       <option key={cls.id} value={cls.id}>{cls.name}</option>
                     ))}
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                                     <select
                     value={formData.academic_year}
                     onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('academic_year', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                     <option value="">Select Academic Year</option>
                     {academicYears.map(year => (
                       <option key={year.id} value={year.id}>{year.name}</option>
                     ))}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admission Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => handleInputChange('admission_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                                     <select
                     value={formData.status}
                     onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('status', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                     <option value="graduated">Graduated</option>
                     <option value="transferred">Transferred</option>
                     <option value="suspended">Suspended</option>
                     <option value="expelled">Expelled</option>
                   </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  value={formData.user.username}
                  onChange={(e) => handleInputChange('user.username', e.target.value)}
                  placeholder="Username (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active Account
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Button */}
        <Card>
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create Student'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateStudent;

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';
import { apiService } from '../../services/api';
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const CreateTeacher: React.FC = () => {
  const [loading, setLoading] = useState(false);
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
    
    // Teacher data
    teacher_id: '',
    employee_number: '',
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
    joining_date: '',
    employment_type: 'full_time',
    designation: '',
    department: '',
    qualification: '',
    specialization: '',
    status: 'active',
    is_active: true
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const generateTeacherId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const teacherId = `TCH${year}${random}`;
    setFormData(prev => ({ ...prev, teacher_id: teacherId }));
  };

  const generateEmployeeNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const employeeNumber = `EMP${year}${random}`;
    setFormData(prev => ({ ...prev, employee_number: employeeNumber }));
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
        teacher_id: formData.teacher_id,
        employee_number: formData.employee_number,
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
        joining_date: formData.joining_date,
        employment_type: formData.employment_type,
        designation: formData.designation,
        department: formData.department,
        qualification: formData.qualification,
        specialization: formData.specialization,
        status: formData.status,
        is_active: formData.is_active
      };

      await apiService.post('/teachers/', submitData);
      alert('Teacher created successfully!');
      window.location.href = '/teachers/list';
    } catch (error: any) {
      console.error('Failed to create teacher:', error);
      alert(error.response?.data?.message || 'Failed to create teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title="Add New Teacher" 
          subtitle="Create a new teacher profile"
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
                    Teacher ID *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.teacher_id}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('teacher_id', e.target.value)}
                      placeholder="Teacher ID"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateTeacherId}
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Number *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.employee_number}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('employee_number', e.target.value)}
                      placeholder="Employee Number"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateEmployeeNumber}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('first_name', e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('middle_name', e.target.value)}
                    placeholder="Middle Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={formData.last_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('last_name', e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('date_of_birth', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select Gender</SelectItem>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(value) => handleInputChange('blood_group', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select Blood Group</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                    placeholder="Email Address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('city', e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('state', e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('postal_code', e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('country', e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </Card>

          {/* Employment Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.joining_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('joining_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type
                  </label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(value) => handleInputChange('employment_type', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Employment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="visiting">Visiting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation *
                  </label>
                  <Input
                    value={formData.designation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('designation', e.target.value)}
                    placeholder="Designation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <Input
                    value={formData.department}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('department', e.target.value)}
                    placeholder="Department"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <Input
                    value={formData.qualification}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('qualification', e.target.value)}
                    placeholder="Highest Qualification"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <Input
                    value={formData.specialization}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('specialization', e.target.value)}
                    placeholder="Specialization"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="resigned">Resigned</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('user.username', e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('is_active', e.target.checked)}
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
              {loading ? 'Creating...' : 'Create Teacher'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateTeacher;

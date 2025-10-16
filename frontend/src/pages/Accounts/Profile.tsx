import React, { useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../stores/authStore';
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || 'John',
    last_name: user?.last_name || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone_number: '+1 (555) 123-4567',
    date_of_birth: '1990-01-01',
    gender: 'male',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postal_code: '10001',
    bio: 'Experienced educator with a passion for student development and innovative teaching methods.',
    language: 'en',
    timezone: 'America/New_York'
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/auth/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      const updatedProfile = await response.json();
      console.log('Profile saved successfully:', updatedProfile);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      first_name: user?.first_name || 'John',
      last_name: user?.last_name || 'Doe',
      email: user?.email || 'john.doe@example.com',
      phone_number: '+1 (555) 123-4567',
      date_of_birth: '1990-01-01',
      gender: 'male',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      postal_code: '10001',
      bio: 'Experienced educator with a passion for student development and innovative teaching methods.',
      language: 'en',
      timezone: 'America/New_York'
    });
    setIsEditing(false);
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderInput = (label: string, field: string, type: string = 'text', placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={profileData[field as keyof typeof profileData]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      ) : (
        <p className="text-gray-900 dark:text-gray-100">{profileData[field as keyof typeof profileData]}</p>
      )}
    </div>
  );

  const renderSelect = (label: string, field: string, options: { value: string; label: string }[]) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {isEditing ? (
        <select
          value={profileData[field as keyof typeof profileData]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-gray-900 dark:text-gray-100">
          {options.find(opt => opt.value === profileData[field as keyof typeof profileData])?.label}
        </p>
      )}
    </div>
  );

  const renderTextarea = (label: string, field: string, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {isEditing ? (
        <textarea
          value={profileData[field as keyof typeof profileData]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      ) : (
        <p className="text-gray-900 dark:text-gray-100">{profileData[field as keyof typeof profileData]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <XMarkIcon className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Profile Picture" />
            <div className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-16 w-16 text-gray-600" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                    <CameraIcon className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {profileData.first_name} {profileData.last_name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{profileData.email}</p>
            </div>
          </Card>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader title="Basic Information" />
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('First Name', 'first_name', 'text', 'Enter first name')}
                {renderInput('Last Name', 'last_name', 'text', 'Enter last name')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Email', 'email', 'email', 'Enter email address')}
                {renderInput('Phone Number', 'phone_number', 'tel', 'Enter phone number')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Date of Birth', 'date_of_birth', 'date')}
                {renderSelect('Gender', 'gender', [
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ])}
              </div>
            </div>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader title="Address Information" />
            <div className="p-6 space-y-4">
              {renderTextarea('Address', 'address', 'Enter your address')}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('City', 'city', 'text', 'Enter city')}
                {renderInput('State/Province', 'state', 'text', 'Enter state')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Country', 'country', 'text', 'Enter country')}
                {renderInput('Postal Code', 'postal_code', 'text', 'Enter postal code')}
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader title="Additional Information" />
            <div className="p-6 space-y-4">
              {renderTextarea('Bio', 'bio', 'Tell us about yourself')}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect('Language', 'language', [
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' }
                ])}
                {renderSelect('Timezone', 'timezone', [
                  { value: 'America/New_York', label: 'Eastern Time' },
                  { value: 'America/Chicago', label: 'Central Time' },
                  { value: 'America/Denver', label: 'Mountain Time' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time' },
                  { value: 'UTC', label: 'UTC' }
                ])}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(user?.date_joined || '2024-01-01').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Active
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <EnvelopeIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Email Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Verified
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { Skeleton } from '../../components/UI/Skeleton';
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  DocumentTextIcon,
  UsersIcon,
  CogIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface GuardianProfileData {
  id: string;
  guardian_id: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone: string;
  alternate_phone: string;
  occupation: string;
  employer: string;
  annual_income: number;
  education_level: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  gender: string;
  date_of_birth: string;
  blood_group: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile_picture: string;
  emergency_contact: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  marital_status: string;
  spouse_name: string;
  spouse_occupation: string;
  spouse_phone: string;
  total_children: number;
  children_in_school: number;
  preferred_contact_method: string;
  preferred_contact_time: string;
  students: Array<{
    id: string;
    name: string;
    class: string;
    relationship: string;
  }>;
}

const GuardianProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [guardian, setGuardian] = useState<GuardianProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  useEffect(() => {
    const mockGuardian: GuardianProfileData = {
      id: '1',
      guardian_id: 'G001',
      first_name: 'আব্দুল',
      last_name: 'রহমান',
      middle_name: 'মোহাম্মদ',
      email: 'abdul.rahman@email.com',
      phone: '+880 1712345678',
      alternate_phone: '+880 1812345678',
      occupation: 'Software Engineer',
      employer: 'Tech Solutions Ltd.',
      annual_income: 1200000,
      education_level: 'bachelor',
      address: 'House #123, Road #5, Dhanmondi',
      city: 'Dhaka',
      state: 'Dhaka',
      postal_code: '1205',
      country: 'Bangladesh',
      gender: 'M',
      date_of_birth: '1985-03-15',
      blood_group: 'B+',
      status: 'active',
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T15:30:00Z',
      profile_picture: '',
      emergency_contact: '+880 1912345678',
      emergency_contact_name: 'ফাতেমা বেগম',
      emergency_contact_relationship: 'Spouse',
      marital_status: 'married',
      spouse_name: 'ফাতেমা বেগম',
      spouse_occupation: 'Teacher',
      spouse_phone: '+880 1812345678',
      total_children: 2,
      children_in_school: 2,
      preferred_contact_method: 'phone',
      preferred_contact_time: 'evening',
      students: [
        {
          id: '1',
          name: 'আহমেদ রহমান',
          class: 'Class 8A',
          relationship: 'Father'
        },
        {
          id: '2',
          name: 'আয়েশা রহমান',
          class: 'Class 5B',
          relationship: 'Father'
        }
      ]
    };

    setTimeout(() => {
      setGuardian(mockGuardian);
      setLoading(false);
    }, 1000);
  }, [id]);

  const getEducationLevel = (level: string) => {
    const levels: { [key: string]: string } = {
      'primary': 'Primary',
      'secondary': 'Secondary',
      'higher_secondary': 'Higher Secondary',
      'bachelor': 'Bachelor',
      'master': 'Master',
      'phd': 'PhD',
      'other': 'Other'
    };
    return levels[level] || level;
  };

  const getMaritalStatus = (status: string) => {
    const statuses: { [key: string]: string } = {
      'single': 'Single',
      'married': 'Married',
      'divorced': 'Divorced',
      'widowed': 'Widowed'
    };
    return statuses[status] || status;
  };

  const getContactMethod = (method: string) => {
    const methods: { [key: string]: string } = {
      'phone': 'Phone',
      'email': 'Email',
      'sms': 'SMS',
      'whatsapp': 'WhatsApp'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <PageHeader title="Guardian Profile" subtitle="Detailed guardian information" />
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <Skeleton className="h-64" />
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Skeleton className="h-32" />
            </Card>
            <Card>
              <Skeleton className="h-48" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!guardian) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Guardian not found</h3>
            <p className="text-gray-500">The guardian you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title={`${guardian.first_name} ${guardian.last_name}`}
          subtitle={`Guardian ID: ${guardian.guardian_id}`}
          actions={
            <div className="flex space-x-2">
              <Button variant="outline">
                <CogIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button>
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          }
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {guardian.profile_picture ? (
                <img 
                  src={guardian.profile_picture} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-blue-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {guardian.first_name} {guardian.last_name}
            </h3>
            <p className="text-gray-500 mb-2">{guardian.occupation}</p>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              guardian.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {guardian.status}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <EnvelopeIcon className="w-4 h-4 mr-3" />
              {guardian.email}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="w-4 h-4 mr-3" />
              {guardian.phone}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-3" />
              {guardian.city}, {guardian.state}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <UsersIcon className="w-4 h-4 mr-3" />
              {guardian.total_children} children ({guardian.children_in_school} in school)
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <Card>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview' },
                  { id: 'personal', name: 'Personal Info' },
                  { id: 'family', name: 'Family' },
                  { id: 'students', name: 'Students' },
                  { id: 'documents', name: 'Documents' },
                  { id: 'settings', name: 'Settings' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="text-sm text-gray-900">{guardian.first_name} {guardian.middle_name} {guardian.last_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Guardian ID</dt>
                        <dd className="text-sm text-gray-900">{guardian.guardian_id}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                        <dd className="text-sm text-gray-900">{guardian.date_of_birth}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Blood Group</dt>
                        <dd className="text-sm text-gray-900">{guardian.blood_group}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Primary Phone</dt>
                        <dd className="text-sm text-gray-900">{guardian.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Alternate Phone</dt>
                        <dd className="text-sm text-gray-900">{guardian.alternate_phone}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">{guardian.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="text-sm text-gray-900">{guardian.address}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h4>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Occupation</dt>
                        <dd className="text-sm text-gray-900">{guardian.occupation}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Employer</dt>
                        <dd className="text-sm text-gray-900">{guardian.employer}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Annual Income</dt>
                        <dd className="text-sm text-gray-900">৳{guardian.annual_income.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Education Level</dt>
                        <dd className="text-sm text-gray-900">{getEducationLevel(guardian.education_level)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h4>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Gender</dt>
                        <dd className="text-sm text-gray-900">{guardian.gender === 'M' ? 'Male' : guardian.gender === 'F' ? 'Female' : 'Other'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Marital Status</dt>
                        <dd className="text-sm text-gray-900">{getMaritalStatus(guardian.marital_status)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Preferred Contact Method</dt>
                        <dd className="text-sm text-gray-900">{getContactMethod(guardian.preferred_contact_method)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Preferred Contact Time</dt>
                        <dd className="text-sm text-gray-900">{guardian.preferred_contact_time}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {activeTab === 'family' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Spouse Information</h4>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Spouse Name</dt>
                        <dd className="text-sm text-gray-900">{guardian.spouse_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Spouse Occupation</dt>
                        <dd className="text-sm text-gray-900">{guardian.spouse_occupation}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Spouse Phone</dt>
                        <dd className="text-sm text-gray-900">{guardian.spouse_phone}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Emergency Contact Name</dt>
                        <dd className="text-sm text-gray-900">{guardian.emergency_contact_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                        <dd className="text-sm text-gray-900">{guardian.emergency_contact_relationship}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Emergency Phone</dt>
                        <dd className="text-sm text-gray-900">{guardian.emergency_contact}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {activeTab === 'students' && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Associated Students</h4>
                  <div className="space-y-4">
                    {guardian.students.map((student) => (
                      <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{student.name}</h5>
                            <p className="text-sm text-gray-500">{student.class}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {student.relationship}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No documents uploaded yet.</p>
                    <Button variant="outline" className="mt-4">
                      Upload Document
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">Email Notifications</h5>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">SMS Notifications</h5>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">Push Notifications</h5>
                        <p className="text-sm text-gray-500">Receive push notifications</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuardianProfile;


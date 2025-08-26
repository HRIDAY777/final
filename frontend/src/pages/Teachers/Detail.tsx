import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Teacher {
  id: number;
  teacher_id: string;
  employee_number: string;
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  designation: string;
  department: string;
  employment_type: string;
  qualification: string;
  specialization: string;
  status: string;
  is_active: boolean;
  joining_date: string;
  created_at: string;
  profile?: any;
  qualifications?: any[];
  experiences?: any[];
  subjects?: any[];
  classes?: any[];
  attendance_records?: any[];
  salaries?: any[];
  leaves?: any[];
  performance_records?: any[];
  documents?: any[];
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    suspended: 'bg-red-100 text-red-700',
    resigned: 'bg-amber-100 text-amber-700',
    retired: 'bg-blue-100 text-blue-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{status}</span>;
};

const GenderBadge: React.FC<{ gender: string }> = ({ gender }) => {
  const map: Record<string, string> = {
    M: 'bg-blue-100 text-blue-700',
    F: 'bg-pink-100 text-pink-700',
    O: 'bg-purple-100 text-purple-700',
  };
  const klass = map[gender] || 'bg-gray-100 text-gray-700';
  const label = gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{label}</span>;
};

const TeacherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchTeacher();
    }
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const data = await apiService.get(`/teachers/${id}/`);
      setTeacher(data);
    } catch (error) {
      console.error('Failed to fetch teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <PageHeader title="Teacher Details" subtitle="Loading..." />
        </Card>
        <div className="animate-pulse">
          <Card>
            <div className="h-64 bg-gray-200 rounded"></div>
          </Card>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="space-y-6">
        <Card>
          <PageHeader title="Teacher Not Found" subtitle="The requested teacher could not be found" />
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'qualifications', name: 'Qualifications', icon: AcademicCapIcon },
    { id: 'experiences', name: 'Experiences', icon: ChartBarIcon },
    { id: 'subjects', name: 'Subjects', icon: DocumentTextIcon },
    { id: 'classes', name: 'Classes', icon: UserGroupIcon },
    { id: 'attendance', name: 'Attendance', icon: CalendarIcon },
    { id: 'leaves', name: 'Leaves', icon: ExclamationTriangleIcon },
    { id: 'performance', name: 'Performance', icon: TrophyIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title={teacher.full_name}
          subtitle={`Teacher ID: ${teacher.teacher_id} • Employee: ${teacher.employee_number}`}
          left={
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
          }
          right={
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => window.location.href = `/teachers/${id}/edit`}
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          }
        />
      </Card>

      {/* Teacher Overview Card */}
      <Card>
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Basic Information</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-500">Age:</span> {teacher.age} years
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Gender:</span> <GenderBadge gender={teacher.gender} />
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Blood Group:</span> {teacher.blood_group || '-'}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Status:</span> <StatusBadge status={teacher.status} />
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {teacher.email || '-'}
                  </p>
                  <p className="text-sm flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {teacher.phone || '-'}
                  </p>
                  <p className="text-sm flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {teacher.city}, {teacher.state}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Employment Information</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-500">Department:</span> {teacher.department}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Designation:</span> {teacher.designation}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Type:</span> {teacher.employment_type.replace('_', ' ')}
                  </p>
                  <p className="text-sm flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(teacher.joining_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Quick Stats</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-500">Qualifications:</span> {teacher.qualifications?.length || 0}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Experiences:</span> {teacher.experiences?.length || 0}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Subjects:</span> {teacher.subjects?.length || 0}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Classes:</span> {teacher.classes?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Complete Address</h4>
                  <p className="text-sm text-gray-600">
                    {teacher.address}<br />
                    {teacher.city}, {teacher.state} {teacher.postal_code}<br />
                    {teacher.country}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Account Status:</span> 
                      <span className={`ml-2 ${teacher.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {teacher.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Created:</span> 
                      <span className="ml-2">{new Date(teacher.created_at).toLocaleDateString()}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Qualification:</span> 
                      <span className="ml-2">{teacher.qualification || '-'}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Specialization:</span> 
                      <span className="ml-2">{teacher.specialization || '-'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content would go here */}
          {activeTab !== 'overview' && (
            <div className="text-center py-8">
              <p className="text-gray-500">Content for {activeTab} tab will be implemented here</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TeacherDetail;

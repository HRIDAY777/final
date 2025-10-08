import React, { useEffect, useState, useCallback } from 'react';
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

interface Student {
  id: number;
  student_id: string;
  admission_number: string;
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
  current_class_name: string;
  academic_year_name: string;
  status: string;
  is_active: boolean;
  admission_date: string;
  created_at: string;
  profile?: any;
  guardians?: any[];
  documents?: any[];
  achievements?: any[];
  academic_records?: any[];
  disciplinary_records?: any[];
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    graduated: 'bg-blue-100 text-blue-700',
    transferred: 'bg-amber-100 text-amber-700',
    suspended: 'bg-red-100 text-red-700',
    expelled: 'bg-red-200 text-red-800',
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

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStudent = useCallback(async () => {
    try {
      const data = await apiService.get(`/students/${id}/`) as any;
      setStudent(data);
    } catch (error) {
      console.error('Failed to fetch student:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id, fetchStudent]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <PageHeader title="Student Details" subtitle="Loading..." />
        </Card>
        <div className="animate-pulse">
          <Card>
            <div className="h-64 bg-gray-200 rounded"></div>
          </Card>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Card>
          <PageHeader title="Student Not Found" subtitle="The requested student could not be found" />
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'guardians', name: 'Guardians', icon: UserGroupIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
    { id: 'achievements', name: 'Achievements', icon: TrophyIcon },
    { id: 'academic', name: 'Academic Records', icon: AcademicCapIcon },
    { id: 'discipline', name: 'Disciplinary Records', icon: ExclamationTriangleIcon },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title={student.full_name}
          subtitle={`Student ID: ${student.student_id} • Admission: ${student.admission_number}`}
          actions={
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = `/students/${id}/edit`}
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          }
        />
      </Card>

      {/* Student Overview Card */}
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
                    <span className="text-gray-500">Age:</span> {student.age} years
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Gender:</span> <GenderBadge gender={student.gender} />
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Blood Group:</span> {student.blood_group || '-'}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Status:</span> <StatusBadge status={student.status} />
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {student.email || '-'}
                  </p>
                  <p className="text-sm flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {student.phone || '-'}
                  </p>
                  <p className="text-sm flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {student.city}, {student.state}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Academic Information</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-500">Class:</span> {student.current_class_name || '-'}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Academic Year:</span> {student.academic_year_name || '-'}
                  </p>
                  <p className="text-sm flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(student.admission_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Quick Stats</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-500">Guardians:</span> {student.guardians?.length || 0}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Documents:</span> {student.documents?.length || 0}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Achievements:</span> {student.achievements?.length || 0}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Academic Records:</span> {student.academic_records?.length || 0}
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
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
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
                    {student.address}<br />
                    {student.city}, {student.state} {student.postal_code}<br />
                    {student.country}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Account Status:</span> 
                      <span className={`ml-2 ${student.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Created:</span> 
                      <span className="ml-2">{new Date(student.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </div>

              {student.profile && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h5>
                      <p className="text-sm text-gray-600">
                        {student.profile.emergency_contact_name || 'Not specified'}<br />
                        {student.profile.emergency_contact || 'Not specified'}<br />
                        {student.profile.emergency_contact_relation || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Medical Information</h5>
                      <p className="text-sm text-gray-600">
                        <strong>Conditions:</strong> {student.profile.medical_conditions || 'None'}<br />
                        <strong>Allergies:</strong> {student.profile.allergies || 'None'}<br />
                        <strong>Medications:</strong> {student.profile.medications || 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guardians Tab */}
          {activeTab === 'guardians' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Guardians</h4>
                <Button size="sm">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Add Guardian
                </Button>
              </div>
              
              {student.guardians && student.guardians.length > 0 ? (
                <div className="space-y-4">
                  {student.guardians.map((guardian, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{guardian.full_name}</h5>
                          <p className="text-sm text-gray-600">{guardian.relationship}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p><PhoneIcon className="w-4 h-4 inline mr-1" />{guardian.phone}</p>
                            <p><EnvelopeIcon className="w-4 h-4 inline mr-1" />{guardian.email || '-'}</p>
                            <p><MapPinIcon className="w-4 h-4 inline mr-1" />{guardian.address}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {guardian.is_primary_guardian && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Primary</span>
                          )}
                          {guardian.is_emergency_contact && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Emergency</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No guardians found</p>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Documents</h4>
                <Button size="sm">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
              
              {student.documents && student.documents.length > 0 ? (
                <div className="space-y-4">
                  {student.documents.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{doc.title}</h5>
                          <p className="text-sm text-gray-600">{doc.document_type}</p>
                          <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.is_verified ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Verified</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Pending</span>
                          )}
                          <Button size="sm" variant="outline">Download</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No documents found</p>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Achievements</h4>
                <Button size="sm">
                  <TrophyIcon className="w-4 h-4 mr-2" />
                  Add Achievement
                </Button>
              </div>
              
              {student.achievements && student.achievements.length > 0 ? (
                <div className="space-y-4">
                  {student.achievements.map((achievement, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                          <p className="text-sm text-gray-600">{achievement.achievement_type} • {achievement.level}</p>
                          <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(achievement.date_achieved).toLocaleDateString()} • {achievement.position}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                            {achievement.points_awarded} pts
                          </span>
                          {achievement.is_verified ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Verified</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No achievements found</p>
              )}
            </div>
          )}

          {/* Academic Records Tab */}
          {activeTab === 'academic' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Academic Records</h4>
                <Button size="sm">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </div>
              
              {student.academic_records && student.academic_records.length > 0 ? (
                <div className="space-y-4">
                  {student.academic_records.map((record, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {record.academic_year} • {record.class_enrolled}
                          </h5>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Percentage:</span>
                              <p className="font-medium">{record.percentage}%</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Grade:</span>
                              <p className="font-medium">{record.grade}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Rank:</span>
                              <p className="font-medium">{record.rank || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Attendance:</span>
                              <p className="font-medium">{record.attendance_percentage}%</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.is_promoted ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Promoted</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Not Promoted</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No academic records found</p>
              )}
            </div>
          )}

          {/* Disciplinary Records Tab */}
          {activeTab === 'discipline' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Disciplinary Records</h4>
                <Button size="sm">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </div>
              
              {student.disciplinary_records && student.disciplinary_records.length > 0 ? (
                <div className="space-y-4">
                  {student.disciplinary_records.map((record, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{record.discipline_type}</h5>
                          <p className="text-sm text-gray-600">Severity: {record.severity}</p>
                          <p className="text-sm text-gray-500 mt-1">{record.violation}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.incident_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            record.severity === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                            record.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                            record.severity === 'major' ? 'bg-red-100 text-red-700' :
                            'bg-red-200 text-red-800'
                          }`}>
                            {record.severity}
                          </span>
                          {record.is_resolved ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Resolved</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Open</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No disciplinary records found</p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StudentDetail;

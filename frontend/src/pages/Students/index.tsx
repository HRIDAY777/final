import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  ChartBarIcon, 
  AcademicCapIcon,
  DocumentTextIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_students: number;
  active_students: number;
  new_admissions: number;
  gender_distribution: Array<{ gender: string; count: number }>;
  status_distribution: Array<{ status: string; count: number }>;
  class_distribution: Array<{ current_class__name: string; count: number }>;
  recent_students: Array<any>;
}

const Students: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await apiService.get('/students/dashboard/') as any;
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ 
    title, value, icon, color 
  }) => (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <PageHeader title="Students" subtitle="Student management dashboard" />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
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
          title="Students" 
          subtitle="Comprehensive student management system"
          actions={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/students/list'}>
                View All Students
              </Button>
              <Button onClick={() => window.location.href = '/students/create'}>
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          }
        />
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.total_students || 0}
          icon={<UserGroupIcon className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Students"
          value={stats?.active_students || 0}
          icon={<AcademicCapIcon className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="New Admissions"
          value={stats?.new_admissions || 0}
          icon={<UserPlusIcon className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Analytics"
          value={0}
          icon={<ChartBarIcon className="w-6 h-6 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/students/create'}
            >
              <UserPlusIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Add Student</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/students/import'}
            >
              <DocumentTextIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Import Students</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/students/guardians'}
            >
              <UserGroupIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Manage Guardians</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/students/achievements'}
            >
              <TrophyIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Achievements</span>
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Students</h3>
          <div className="space-y-3">
            {stats?.recent_students?.slice(0, 5).map((student: any) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{student.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {student.student_id} • {student.current_class_name || 'No Class'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/students/${student.id}`}
                >
                  View
                </Button>
              </div>
            ))}
            {(!stats?.recent_students || stats.recent_students.length === 0) && (
              <p className="text-gray-500 text-center py-4">No recent students</p>
            )}
          </div>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <div className="space-y-3">
            {stats?.gender_distribution?.map((item: any) => (
              <div key={item.gender} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {item.gender === 'M' ? 'Male' : item.gender === 'F' ? 'Female' : 'Other'}
                </span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(item.count / (stats?.total_students || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {stats?.status_distribution?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{item.status}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(item.count / (stats?.total_students || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Students;

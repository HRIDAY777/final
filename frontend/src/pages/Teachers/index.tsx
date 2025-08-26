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
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_teachers: number;
  active_teachers: number;
  head_teachers: number;
  new_teachers: number;
  department_distribution: Array<{ department: string; count: number }>;
  experience_distribution: Array<{ experience: string; count: number }>;
  recent_teachers: Array<any>;
}

const Teachers: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await apiService.get('/teachers/dashboard/');
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
          <PageHeader title="Teachers" subtitle="Teacher management dashboard" />
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
          title="Teachers" 
          subtitle="Comprehensive teacher management system"
          right={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/teachers/list'}>
                View All Teachers
              </Button>
              <Button onClick={() => window.location.href = '/teachers/create'}>
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          }
        />
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teachers"
          value={stats?.total_teachers || 0}
          icon={<UserGroupIcon className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Teachers"
          value={stats?.active_teachers || 0}
          icon={<AcademicCapIcon className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Head Teachers"
          value={stats?.head_teachers || 0}
          icon={<TrophyIcon className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="New Teachers"
          value={stats?.new_teachers || 0}
          icon={<UserPlusIcon className="w-6 h-6 text-white" />}
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
              onClick={() => window.location.href = '/teachers/create'}
            >
              <UserPlusIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Add Teacher</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/teachers/attendance'}
            >
              <DocumentTextIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Attendance</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/teachers/leaves'}
            >
              <ExclamationTriangleIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Leave Requests</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/teachers/performance'}
            >
              <ChartBarIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Performance</span>
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Teachers</h3>
          <div className="space-y-3">
            {stats?.recent_teachers?.slice(0, 5).map((teacher: any) => (
              <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{teacher.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {teacher.teacher_id} • {teacher.department}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/teachers/${teacher.id}`}
                >
                  View
                </Button>
              </div>
            ))}
            {(!stats?.recent_teachers || stats.recent_teachers.length === 0) && (
              <p className="text-gray-500 text-center py-4">No recent teachers</p>
            )}
          </div>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <div className="space-y-3">
            {stats?.department_distribution?.map((item: any) => (
              <div key={item.department} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {item.department || 'No Department'}
                </span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(item.count / (stats?.total_teachers || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Distribution</h3>
          <div className="space-y-3">
            {stats?.experience_distribution?.map((item: any) => (
              <div key={item.experience} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {item.experience.replace('_', ' ')} years
                </span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(item.count / (stats?.total_teachers || 1)) * 100}%` }}
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

export default Teachers;

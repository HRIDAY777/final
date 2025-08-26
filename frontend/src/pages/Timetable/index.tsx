import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_schedules: number;
  active_schedules: number;
  total_conflicts: number;
  unresolved_conflicts: number;
  total_rooms: number;
  available_rooms: number;
  total_time_slots: number;
  recent_changes: Array<any>;
  upcoming_classes: Array<any>;
}

const Timetable: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await apiService.get('/timetable/dashboard/stats/');
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
          <PageHeader title="Timetable" subtitle="Schedule management dashboard" />
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
          title="Timetable" 
          subtitle="Comprehensive schedule and timetable management"
          right={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/timetable/schedules'}>
                View Schedules
              </Button>
              <Button onClick={() => window.location.href = '/timetable/create'}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          }
        />
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Schedules"
          value={stats?.total_schedules || 0}
          icon={<CalendarIcon className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Schedules"
          value={stats?.active_schedules || 0}
          icon={<ClockIcon className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Available Rooms"
          value={stats?.available_rooms || 0}
          icon={<BuildingOfficeIcon className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Unresolved Conflicts"
          value={stats?.unresolved_conflicts || 0}
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-white" />}
          color="bg-red-500"
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
              onClick={() => window.location.href = '/timetable/create'}
            >
              <CalendarIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Create Schedule</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/timetable/rooms'}
            >
              <BuildingOfficeIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Manage Rooms</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/timetable/conflicts'}
            >
              <ExclamationTriangleIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Resolve Conflicts</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/timetable/templates'}
            >
              <DocumentTextIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Templates</span>
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h3>
          <div className="space-y-3">
            {stats?.upcoming_classes?.slice(0, 5).map((class_schedule: any) => (
              <div key={class_schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{class_schedule.class_name}</p>
                  <p className="text-sm text-gray-600">
                    {class_schedule.subject_name} • {class_schedule.teacher_name}
                  </p>
                  <p className="text-xs text-gray-500">{class_schedule.time_slot_display}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{class_schedule.room_name}</p>
                </div>
              </div>
            ))}
            {(!stats?.upcoming_classes || stats.upcoming_classes.length === 0) && (
              <p className="text-gray-500 text-center py-4">No upcoming classes</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Changes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Changes</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/timetable/changes'}
          >
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {stats?.recent_changes?.slice(0, 5).map((change: any) => (
            <div key={change.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {change.change_type} - {change.class_schedule_display}
                </p>
                <p className="text-sm text-gray-600">
                  {change.changed_by_name} • {new Date(change.changed_at).toLocaleDateString()}
                </p>
                {change.reason && (
                  <p className="text-xs text-gray-500">{change.reason}</p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs rounded-md ${
                change.change_type === 'created' ? 'bg-green-100 text-green-700' :
                change.change_type === 'updated' ? 'bg-blue-100 text-blue-700' :
                change.change_type === 'deleted' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {change.change_type}
              </span>
            </div>
          ))}
          {(!stats?.recent_changes || stats.recent_changes.length === 0) && (
            <p className="text-gray-500 text-center py-4">No recent changes</p>
          )}
        </div>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-indigo-500">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Time Slots</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_time_slots || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Conflicts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_conflicts || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-500">
              <CogIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_rooms || 0}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Timetable;

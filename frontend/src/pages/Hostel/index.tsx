import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';
import {
  HomeModernIcon,
  UserGroupIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_buildings: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  total_students: number;
  pending_maintenance: number;
  overdue_fees: number;
  today_visitors: number;
}

interface RecentAllocation {
  id: number;
  student_name: string;
  room_number: string;
  building_name: string;
  check_in_date: string;
  status: string;
}

interface UpcomingMaintenance {
  id: number;
  title: string;
  room_number: string;
  priority: string;
  status: string;
  reported_date: string;
}

const Hostel: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_buildings: 0,
    total_rooms: 0,
    occupied_rooms: 0,
    available_rooms: 0,
    total_students: 0,
    pending_maintenance: 0,
    overdue_fees: 0,
    today_visitors: 0,
  });

  const [recentAllocations, setRecentAllocations] = useState<RecentAllocation[]>([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<UpcomingMaintenance[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demonstration
      setStats({
        total_buildings: 5,
        total_rooms: 120,
        occupied_rooms: 98,
        available_rooms: 22,
        total_students: 245,
        pending_maintenance: 8,
        overdue_fees: 15,
        today_visitors: 12,
      });

      setRecentAllocations([
        {
          id: 1,
          student_name: 'John Doe',
          room_number: 'A-101',
          building_name: 'Building A',
          check_in_date: '2024-01-15',
          status: 'active',
        },
        {
          id: 2,
          student_name: 'Jane Smith',
          room_number: 'B-205',
          building_name: 'Building B',
          check_in_date: '2024-01-14',
          status: 'active',
        },
        {
          id: 3,
          student_name: 'Mike Johnson',
          room_number: 'C-301',
          building_name: 'Building C',
          check_in_date: '2024-01-13',
          status: 'active',
        },
      ]);

      setUpcomingMaintenance([
        {
          id: 1,
          title: 'Leaky Faucet',
          room_number: 'A-105',
          priority: 'medium',
          status: 'assigned',
          reported_date: '2024-01-15',
        },
        {
          id: 2,
          title: 'Broken Window',
          room_number: 'B-210',
          priority: 'high',
          status: 'pending',
          reported_date: '2024-01-14',
        },
        {
          id: 3,
          title: 'Electrical Issue',
          room_number: 'C-305',
          priority: 'urgent',
          status: 'in_progress',
          reported_date: '2024-01-13',
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Management"
        description="Manage student accommodations, room allocations, fees, and maintenance"
        actions={
          <div className="flex space-x-3">
            <Button variant="primary" size="sm">
              <HomeModernIcon className="h-4 w-4 mr-2" />
              Add Room
            </Button>
            <Button variant="secondary" size="sm">
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Allocate Room
            </Button>
            <Button variant="secondary" size="sm">
              <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HomeModernIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Buildings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_buildings}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_maintenance}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Fees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue_fees}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Room Occupancy</h3>
            <Button variant="ghost" size="sm">
              <EyeIcon className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Rooms</span>
              <span className="font-semibold">{stats.total_rooms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Occupied</span>
              <span className="font-semibold text-green-600">{stats.occupied_rooms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available</span>
              <span className="font-semibold text-blue-600">{stats.available_rooms}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(stats.occupied_rooms / stats.total_rooms) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {((stats.occupied_rooms / stats.total_rooms) * 100).toFixed(1)}% occupancy rate
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Activity</h3>
            <Button variant="ghost" size="sm">
              <EyeIcon className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Allocations</span>
              <span className="font-semibold text-green-600">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Check-outs</span>
              <span className="font-semibold text-red-600">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Visitors</span>
              <span className="font-semibold text-blue-600">{stats.today_visitors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Maintenance Completed</span>
              <span className="font-semibold text-purple-600">2</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Allocations and Upcoming Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Allocations</h3>
            <Button variant="ghost" size="sm">
              <EyeIcon className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentAllocations.map((allocation) => (
              <div key={allocation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{allocation.student_name}</p>
                  <p className="text-sm text-gray-600">
                    {allocation.building_name} - Room {allocation.room_number}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(allocation.status)}`}>
                    {allocation.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{allocation.check_in_date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Maintenance</h3>
            <Button variant="ghost" size="sm">
              <EyeIcon className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingMaintenance.map((maintenance) => (
              <div key={maintenance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{maintenance.title}</p>
                  <p className="text-sm text-gray-600">Room {maintenance.room_number}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(maintenance.priority)}`}>
                    {maintenance.priority}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{maintenance.reported_date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Hostel;

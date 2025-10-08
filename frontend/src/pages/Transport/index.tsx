import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';
import { 
  TruckIcon, 
  UserIcon, 
  MapIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_vehicles: number;
  active_vehicles: number;
  total_drivers: number;
  active_drivers: number;
  total_routes: number;
  active_routes: number;
  total_trips_today: number;
  completed_trips_today: number;
  delayed_trips_today: number;
  vehicles_needing_service: number;
  drivers_with_expired_license: number;
  recent_trips: Array<any>;
  upcoming_trips: Array<any>;
}

const Transport: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await apiService.get('/transport/dashboard/stats/') as DashboardStats;
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
          <PageHeader title="Transport" subtitle="Transport management dashboard" />
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
          title="Transport" 
          subtitle="Comprehensive transport and fleet management"
          actions={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/transport/vehicles'}>
                View Vehicles
              </Button>
              <Button onClick={() => window.location.href = '/transport/trips'}>
                <TruckIcon className="w-4 h-4 mr-2" />
                Manage Trips
              </Button>
            </div>
          }
        />
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Vehicles"
          value={stats?.total_vehicles || 0}
          icon={<TruckIcon className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Drivers"
          value={stats?.active_drivers || 0}
          icon={<UserIcon className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Active Routes"
          value={stats?.active_routes || 0}
          icon={<MapIcon className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Today&apos;s Trips"
          value={stats?.total_trips_today || 0}
          icon={<ClockIcon className="w-6 h-6 text-white" />}
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
              onClick={() => window.location.href = '/transport/vehicles'}
            >
              <TruckIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Manage Vehicles</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/transport/drivers'}
            >
              <UserIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Manage Drivers</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/transport/routes'}
            >
              <MapIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Manage Routes</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => window.location.href = '/transport/trips'}
            >
              <ClockIcon className="w-6 h-6 mb-2" />
              <span className="text-sm">Schedule Trips</span>
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Completed Trips</span>
              </div>
              <span className="text-lg font-semibold text-green-600">
                {stats?.completed_trips_today || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Delayed Trips</span>
              </div>
              <span className="text-lg font-semibold text-red-600">
                {stats?.delayed_trips_today || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <WrenchScrewdriverIcon className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Vehicles Needing Service</span>
              </div>
              <span className="text-lg font-semibold text-yellow-600">
                {stats?.vehicles_needing_service || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Expired Licenses</span>
              </div>
              <span className="text-lg font-semibold text-orange-600">
                {stats?.drivers_with_expired_license || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Trips</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/transport/trips'}
          >
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {stats?.recent_trips?.slice(0, 5).map((trip: any) => (
            <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{trip.trip_id}</p>
                <p className="text-sm text-gray-600">
                  {trip.route_name} • {trip.vehicle_number}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(trip.scheduled_departure).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-md ${
                  trip.status === 'completed' ? 'bg-green-100 text-green-700' :
                  trip.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  trip.status === 'delayed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {trip.status.replace('_', ' ')}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {trip.total_passengers} passengers
                </p>
              </div>
            </div>
          ))}
          {(!stats?.recent_trips || stats.recent_trips.length === 0) && (
            <p className="text-gray-500 text-center py-4">No recent trips</p>
          )}
        </div>
      </Card>

      {/* Upcoming Trips */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Trips</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/transport/trips'}
          >
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {stats?.upcoming_trips?.slice(0, 5).map((trip: any) => (
            <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{trip.trip_id}</p>
                <p className="text-sm text-gray-600">
                  {trip.route_name} • {trip.driver_name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(trip.scheduled_departure).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700">
                  {trip.trip_type.replace('_', ' ')}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {trip.start_location} → {trip.end_location}
                </p>
              </div>
            </div>
          ))}
          {(!stats?.upcoming_trips || stats.upcoming_trips.length === 0) && (
            <p className="text-gray-500 text-center py-4">No upcoming trips</p>
          )}
        </div>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-indigo-500">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.active_vehicles || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_drivers || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-500">
              <MapIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_routes || 0}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Transport;

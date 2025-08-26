import React, { useState, useEffect } from 'react';
import { Card, PageHeader, FilterBar, Pagination, Button } from '../../components/UI';
import { useTranslation } from '../../utils/i18n';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon, 
  ClockIcon, 
  TruckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  stops: string[];
  estimatedTime: string;
  distance: string;
  assignedVehicle: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
}

const Routes: React.FC = () => {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startLocation: '',
    endLocation: '',
    stops: '',
    estimatedTime: '',
    distance: '',
    assignedVehicle: '',
    status: 'active' as const
  });

  // Mock data
  useEffect(() => {
    const mockRoutes: Route[] = [
      {
        id: '1',
        name: 'Route A - Central to North Campus',
        startLocation: 'Central Campus',
        endLocation: 'North Campus',
        stops: ['Central Campus', 'City Center', 'University Gate', 'North Campus'],
        estimatedTime: '45 minutes',
        distance: '12 km',
        assignedVehicle: 'Bus-001',
        status: 'active',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Route B - East to West Campus',
        startLocation: 'East Campus',
        endLocation: 'West Campus',
        stops: ['East Campus', 'Shopping Mall', 'Hospital', 'West Campus'],
        estimatedTime: '35 minutes',
        distance: '8 km',
        assignedVehicle: 'Bus-002',
        status: 'active',
        createdAt: '2024-01-20'
      },
      {
        id: '3',
        name: 'Route C - South Campus Express',
        startLocation: 'South Campus',
        endLocation: 'Central Campus',
        stops: ['South Campus', 'Central Campus'],
        estimatedTime: '20 minutes',
        distance: '5 km',
        assignedVehicle: 'Bus-003',
        status: 'maintenance',
        createdAt: '2024-02-01'
      }
    ];

    setTimeout(() => {
      setRoutes(mockRoutes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.endLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoute) {
      // Update existing route
      setRoutes(routes.map(route =>
        route.id === editingRoute.id
          ? { ...route, ...formData, stops: formData.stops.split(',').map(s => s.trim()) }
          : route
      ));
    } else {
      // Add new route
      const newRoute: Route = {
        id: Date.now().toString(),
        ...formData,
        stops: formData.stops.split(',').map(s => s.trim()),
        createdAt: new Date().toISOString().split('T')[0]
      };
      setRoutes([...routes, newRoute]);
    }
    setShowModal(false);
    setEditingRoute(null);
    setFormData({
      name: '',
      startLocation: '',
      endLocation: '',
      stops: '',
      estimatedTime: '',
      distance: '',
      assignedVehicle: '',
      status: 'active'
    });
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      startLocation: route.startLocation,
      endLocation: route.endLocation,
      stops: route.stops.join(', '),
      estimatedTime: route.estimatedTime,
      distance: route.distance,
      assignedVehicle: route.assignedVehicle,
      status: route.status
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm(t('confirm.delete_route'))) return;
    setRoutes(routes.filter(route => route.id !== id));
  };

  const StatusBadge: React.FC<{ status: Route['status'] }> = ({ status }) => {
    const getStatusColor = (status: Route['status']) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'inactive': return 'bg-gray-100 text-gray-800';
        case 'maintenance': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
        {t(`transport.route_status_${status}`)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={t('transport.routes')}
        subtitle={t('transport.routes_subtitle')}
        actions={
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            {t('transport.add_route')}
          </Button>
        }
      />

      <Card>
        <FilterBar
          placeholder={t('placeholder.search_routes')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredRoutes.length === 0 ? (
          <div className="text-center py-8">
            <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('messages.no_routes_found')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transport.route_name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transport.start_location')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transport.end_location')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transport.estimated_time')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transport.distance')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transport.assigned_vehicle')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('transport.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{route.name}</div>
                            <div className="text-sm text-gray-500">{route.stops.length} {t('transport.stops')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {route.startLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {route.endLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{route.estimatedTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {route.distance}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TruckIcon className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{route.assignedVehicle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={route.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(route)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(route.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRoute ? t('transport.edit_route') : t('transport.add_route')}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('transport.route_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('placeholder.enter_route_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('transport.start_location')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.startLocation}
                    onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                    placeholder={t('placeholder.enter_start_location')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('transport.end_location')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.endLocation}
                    onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                    placeholder={t('placeholder.enter_end_location')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('transport.stops')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.stops}
                    onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                    placeholder={t('placeholder.enter_stops')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('transport.estimated_time')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      placeholder={t('placeholder.enter_estimated_time')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('transport.distance')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                      placeholder={t('placeholder.enter_distance')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('transport.assigned_vehicle')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.assignedVehicle}
                    onChange={(e) => setFormData({ ...formData, assignedVehicle: e.target.value })}
                    placeholder={t('placeholder.enter_assigned_vehicle')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('transport.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Route['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">{t('transport.route_status_active')}</option>
                    <option value="inactive">{t('transport.route_status_inactive')}</option>
                    <option value="maintenance">{t('transport.route_status_maintenance')}</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingRoute(null);
                      setFormData({
                        name: '',
                        startLocation: '',
                        endLocation: '',
                        stops: '',
                        estimatedTime: '',
                        distance: '',
                        assignedVehicle: '',
                        status: 'active'
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {editingRoute ? t('common.update') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routes;



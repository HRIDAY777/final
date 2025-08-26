import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { getPaginatedData, apiService } from '../../services/api';
import { useTranslation } from '../../utils/i18n';
import { 
  TruckIcon, 
  FunnelIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface VehicleListItem {
  id: number;
  vehicle_number: string;
  registration_number: string;
  vehicle_type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  fuel_type: string;
  status: string;
  is_active: boolean;
  current_mileage: number;
  insurance_expiry: string;
  permit_expiry: string;
  fitness_expiry: string;
  puc_expiry: string;
  next_service_date: string;
  created_at: string;
}

interface Paginated<T> { count: number; results: T[]; }

const VehicleTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, string> = {
    bus: 'bg-blue-100 text-blue-700',
    van: 'bg-green-100 text-green-700',
    car: 'bg-purple-100 text-purple-700',
    minibus: 'bg-orange-100 text-orange-700',
    truck: 'bg-red-100 text-red-700',
    other: 'bg-gray-100 text-gray-700',
  };
  const klass = map[type] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{type}</span>;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-gray-100 text-gray-700',
    retired: 'bg-red-100 text-red-700',
  };
  const klass = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs rounded-md ${klass}`}>{status}</span>;
};

const Vehicles: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [vehicleType, setVehicleType] = useState<string>('');
  const [fuelType, setFuelType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [items, setItems] = useState<VehicleListItem[]>([]);
  const [selected, setSelected] = useState<VehicleListItem | null>(null);
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(() => ({ search, vehicleType, fuelType, status }), [search, vehicleType, fuelType, status]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.vehicleType) params.vehicle_type = filters.vehicleType;
      if (filters.fuelType) params.fuel_type = filters.fuelType;
      if (filters.status) params.status = filters.status;
      
      const data = await getPaginatedData<VehicleListItem>('/transport/vehicles/', page, pageSize, params) as unknown as Paginated<VehicleListItem>;
      setItems(data.results || []);
      setTotal(data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters.search, filters.vehicleType, filters.fuelType, filters.status]);

  const openVehicle = async (row: VehicleListItem) => {
    setSelected(row);
    try {
      const data = await apiService.get(`/transport/vehicles/${row.id}/`);
      setVehicle(data);
    } catch (e) {
      setVehicle(null);
    }
  };

  const toggleActive = async (row: VehicleListItem) => {
    const action = row.is_active ? 'deactivate' : 'activate';
    await apiService.post(`/transport/vehicles/${row.id}/${action}/`);
    fetchVehicles();
  };

  const remove = async (row: VehicleListItem) => {
    if (!confirm(t('confirm.delete_vehicle'))) return;
    await apiService.delete(`/transport/vehicles/${row.id}/`);
    fetchVehicles();
  };

  const exportVehicles = async () => {
    try {
      const response = await apiService.get('/transport/vehicles/export/', { 
        params: { format: 'csv' },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vehicles.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title={t('transport.vehicles')} 
          subtitle={t('transport.vehicles_subtitle')}
          actions={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <FunnelIcon className="w-4 h-4 mr-2" />
                {t('common.filter')}
              </Button>
              <Button variant="outline" onClick={exportVehicles}>
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                {t('common.export')}
              </Button>
              <Button onClick={() => window.location.href = '/transport/vehicles/create'}>
                <TruckIcon className="w-4 h-4 mr-2" />
                {t('transport.add_vehicle')}
              </Button>
            </div>
          }
        />
        
        <FilterBar
          searchPlaceholder={t('placeholder.search_vehicles')}
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
        />

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('transport.vehicle_type')}</label>
                <select 
                  value={vehicleType} 
                  onChange={(e) => { setVehicleType(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">{t('transport.all_types')}</option>
                  <option value="bus">{t('transport.vehicle_type_bus')}</option>
                  <option value="van">{t('transport.vehicle_type_van')}</option>
                  <option value="car">{t('transport.vehicle_type_car')}</option>
                  <option value="minibus">{t('transport.vehicle_type_minibus')}</option>
                  <option value="truck">{t('transport.vehicle_type_truck')}</option>
                  <option value="other">{t('transport.vehicle_type_other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('transport.fuel_type')}</label>
                <select 
                  value={fuelType} 
                  onChange={(e) => { setFuelType(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">{t('transport.all_fuel_types')}</option>
                  <option value="petrol">{t('transport.fuel_type_petrol')}</option>
                  <option value="diesel">{t('transport.fuel_type_diesel')}</option>
                  <option value="electric">{t('transport.fuel_type_electric')}</option>
                  <option value="hybrid">{t('transport.fuel_type_hybrid')}</option>
                  <option value="cng">{t('transport.fuel_type_cng')}</option>
                  <option value="lpg">{t('transport.fuel_type_lpg')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('transport.status')}</label>
                <select 
                  value={status} 
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="">{t('transport.all_status')}</option>
                  <option value="active">{t('transport.vehicle_status_active')}</option>
                  <option value="maintenance">{t('transport.vehicle_status_maintenance')}</option>
                  <option value="inactive">{t('transport.vehicle_status_inactive')}</option>
                  <option value="retired">{t('transport.vehicle_status_retired')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => { setVehicleType(''); setFuelType(''); setStatus(''); setPage(1); }}
                  className="w-full"
                >
                  {t('common.clear_filters')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600 border-b">
              <tr>
                <th className="py-3 pr-4 font-medium">{t('transport.vehicle')}</th>
                <th className="py-3 pr-4 font-medium">{t('transport.type')}</th>
                <th className="py-3 pr-4 font-medium">{t('transport.capacity')}</th>
                <th className="py-3 pr-4 font-medium">{t('transport.status')}</th>
                <th className="py-3 pr-4 font-medium">{t('transport.mileage')}</th>
                <th className="py-3 pr-4 font-medium">{t('transport.documents')}</th>
                <th className="py-3 pr-4 font-medium">{t('transport.service')}</th>
                <th className="py-3 pr-0 font-medium text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-8 text-center text-gray-500" colSpan={8}>{t('common.loading')}</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="py-8 text-center text-gray-500" colSpan={8}>{t('messages.no_vehicles_found')}</td></tr>
              ) : (
                items.map(row => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 pr-4">
                      <div>
                        <p className="font-medium text-gray-900">{row.vehicle_number}</p>
                        <p className="text-xs text-gray-500">{row.registration_number}</p>
                        <p className="text-xs text-gray-500">{row.make} {row.model} ({row.year})</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <VehicleTypeBadge type={row.vehicle_type} />
                    </td>
                    <td className="py-4 pr-4">{row.capacity} {t('transport.seats')}</td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-4 pr-4">{row.current_mileage.toLocaleString()} {t('transport.km')}</td>
                    <td className="py-4 pr-4">
                                              <div className="text-xs space-y-1">
                          <div className={`${new Date(row.insurance_expiry) < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                            {t('transport.insurance')}: {new Date(row.insurance_expiry).toLocaleDateString()}
                          </div>
                          <div className={`${new Date(row.permit_expiry) < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                            {t('transport.permit')}: {new Date(row.permit_expiry).toLocaleDateString()}
                          </div>
                          <div className={`${new Date(row.fitness_expiry) < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                            {t('transport.fitness')}: {new Date(row.fitness_expiry).toLocaleDateString()}
                          </div>
                        </div>
                    </td>
                    <td className="py-4 pr-4">
                      {row.next_service_date && (
                        <div className={`text-xs ${new Date(row.next_service_date) <= new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                          {new Date(row.next_service_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-4 pr-0">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => openVehicle(row)}
                          title={t('common.view')}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => window.location.href = `/transport/vehicles/${row.id}/edit`}
                          title={t('common.edit')}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => window.location.href = `/transport/vehicles/${row.id}/maintenance`}
                          title={t('transport.maintenance')}
                        >
                          <WrenchScrewdriverIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => toggleActive(row)}
                          title={row.is_active ? t('transport.deactivate') : t('transport.activate')}
                        >
                          {row.is_active ? t('transport.deactivate') : t('transport.activate')}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => remove(row)}
                          title={t('common.delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Card>

      {/* Vehicle Detail Modal */}
      {selected && (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selected.vehicle_number}</h3>
              <p className="text-sm text-gray-600">
                {selected.make} {selected.model} • {selected.registration_number}
              </p>
            </div>
            <Button variant="outline" onClick={() => { setSelected(null); setVehicle(null); }}>
              {t('common.close')}
            </Button>
          </div>
          {vehicle ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('transport.vehicle_information')}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">{t('transport.vehicle_number')}:</span>
                    <span className="ml-2 font-medium">{vehicle.vehicle_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.registration')}:</span>
                    <span className="ml-2 font-medium">{vehicle.registration_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.type')}:</span>
                    <span className="ml-2"><VehicleTypeBadge type={vehicle.vehicle_type} /></span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.make_model')}:</span>
                    <span className="ml-2 font-medium">{vehicle.make} {vehicle.model}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.year')}:</span>
                    <span className="ml-2 font-medium">{vehicle.year}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.capacity')}:</span>
                    <span className="ml-2 font-medium">{vehicle.capacity} {t('transport.seats')}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('transport.technical_details')}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">{t('transport.fuel_type')}:</span>
                    <span className="ml-2 font-medium">{vehicle.fuel_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.current_mileage')}:</span>
                    <span className="ml-2 font-medium">{vehicle.current_mileage.toLocaleString()} {t('transport.km')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.status')}:</span>
                    <span className="ml-2"><StatusBadge status={vehicle.status} /></span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.purchase_date')}:</span>
                    <span className="ml-2 font-medium">
                      {new Date(vehicle.purchase_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('transport.document_status')}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">{t('transport.insurance')}:</span>
                    <span className={`ml-2 ${vehicle.is_insurance_expired ? 'text-red-600' : 'text-green-600'}`}>
                      {new Date(vehicle.insurance_expiry).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.permit')}:</span>
                    <span className={`ml-2 ${vehicle.is_puc_expired ? 'text-red-600' : 'text-green-600'}`}>
                      {new Date(vehicle.permit_expiry).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.fitness')}:</span>
                    <span className={`ml-2 ${vehicle.is_fitness_expired ? 'text-red-600' : 'text-green-600'}`}>
                      {new Date(vehicle.fitness_expiry).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('transport.puc')}:</span>
                    <span className={`ml-2 ${vehicle.is_puc_expired ? 'text-red-600' : 'text-green-600'}`}>
                      {new Date(vehicle.puc_expiry).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default Vehicles;



import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface MaintenanceRecord {
  id: string;
  title: string;
  description: string;
  asset: string;
  asset_name: string;
  maintenance_type: string;
  maintenance_type_display: string;
  scheduled_date: string;
  completed_date: string;
  is_completed: boolean;
  performed_by: string;
  cost: number;
  notes: string;
  created_at: string;
}

const Maintenance: React.FC = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    maintenance_type: '',
    is_completed: '',
    scheduled_from: '',
    scheduled_to: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockMaintenanceRecords: MaintenanceRecord[] = [
      {
        id: '1',
        title: 'Annual Laptop Maintenance',
        description: 'Regular cleaning and software updates for staff laptops',
        asset: '1',
        asset_name: 'Dell Latitude Laptop',
        maintenance_type: 'preventive',
        maintenance_type_display: 'Preventive',
        scheduled_date: '2024-12-15',
        completed_date: '',
        is_completed: false,
        performed_by: '',
        cost: 0,
        notes: 'Includes hardware cleaning and software optimization',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Projector Lamp Replacement',
        description: 'Replace projector lamp that has exceeded its lifespan',
        asset: '2',
        asset_name: 'Epson Projector',
        maintenance_type: 'corrective',
        maintenance_type_display: 'Corrective',
        scheduled_date: '2024-11-10',
        completed_date: '2024-11-10',
        is_completed: true,
        performed_by: 'AV Technician',
        cost: 150.00,
        notes: 'Lamp replaced successfully, projector working optimally',
        created_at: '2024-10-15T14:30:00Z'
      },
      {
        id: '3',
        title: 'Microscope Calibration',
        description: 'Annual calibration of laboratory microscopes',
        asset: '4',
        asset_name: 'Microscope Set',
        maintenance_type: 'preventive',
        maintenance_type_display: 'Preventive',
        scheduled_date: '2024-10-05',
        completed_date: '',
        is_completed: false,
        performed_by: '',
        cost: 0,
        notes: 'Overdue maintenance - needs immediate attention',
        created_at: '2024-09-01T09:15:00Z'
      },
      {
        id: '4',
        title: 'Desk Repair',
        description: 'Fix loose drawer and damaged surface',
        asset: '3',
        asset_name: 'Office Desk',
        maintenance_type: 'corrective',
        maintenance_type_display: 'Corrective',
        scheduled_date: '2024-12-20',
        completed_date: '',
        is_completed: false,
        performed_by: '',
        cost: 0,
        notes: 'Minor repairs needed for continued use',
        created_at: '2024-11-20T11:45:00Z'
      },
      {
        id: '5',
        title: 'Computer System Update',
        description: 'Update operating system and security patches',
        asset: '1',
        asset_name: 'Dell Latitude Laptop',
        maintenance_type: 'preventive',
        maintenance_type_display: 'Preventive',
        scheduled_date: '2024-06-15',
        completed_date: '2024-06-15',
        is_completed: true,
        performed_by: 'IT Support',
        cost: 0,
        notes: 'All updates installed successfully',
        created_at: '2024-05-15T16:20:00Z'
      }
    ];

    setTimeout(() => {
      setMaintenanceRecords(mockMaintenanceRecords);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
  }, []);

  const getMaintenanceTypeBadge = (type: string) => {
    switch (type) {
      case 'preventive':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Preventive</span>;
      case 'corrective':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Corrective</span>;
      case 'emergency':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Emergency</span>;
      case 'upgrade':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Upgrade</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{type}</span>;
    }
  };

  const getStatusBadge = (isCompleted: boolean, scheduledDate: string) => {
    if (isCompleted) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>;
    }
    
    const today = new Date();
    const scheduled = new Date(scheduledDate);
    
    if (scheduled < today) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Overdue</span>;
    } else if (scheduled.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Due Soon</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Scheduled</span>;
    }
  };

  const getPriorityIcon = (isCompleted: boolean, scheduledDate: string) => {
    if (isCompleted) {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    }
    
    const today = new Date();
    const scheduled = new Date(scheduledDate);
    
    if (scheduled < today) {
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
    } else if (scheduled.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    } else {
      return <CalendarIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleDelete = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      setMaintenanceRecords(maintenanceRecords.filter(r => r.id !== selectedRecord.id));
      setShowDeleteModal(false);
      setSelectedRecord(null);
    }
  };

  const filteredMaintenanceRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(search.toLowerCase()) ||
                         record.description.toLowerCase().includes(search.toLowerCase()) ||
                         record.asset_name.toLowerCase().includes(search.toLowerCase()) ||
                         record.performed_by.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !filters.maintenance_type || record.maintenance_type === filters.maintenance_type;
    const matchesCompleted = filters.is_completed === '' || 
                           (filters.is_completed === 'true' ? record.is_completed : !record.is_completed);
    
    let matchesDate = true;
    if (filters.scheduled_from) {
      const scheduledDate = new Date(record.scheduled_date);
      const fromDate = new Date(filters.scheduled_from);
      matchesDate = matchesDate && scheduledDate >= fromDate;
    }
    if (filters.scheduled_to) {
      const scheduledDate = new Date(record.scheduled_date);
      const toDate = new Date(filters.scheduled_to);
      matchesDate = matchesDate && scheduledDate <= toDate;
    }
    
    return matchesSearch && matchesType && matchesCompleted && matchesDate;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
          <p className="text-gray-600">Track asset maintenance schedules and records</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/inventory/maintenance/create">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Schedule Maintenance
            </Button>
          </Link>
          <Link to="/inventory/maintenance/calendar">
            <Button variant="outline">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={{
          maintenance_type: [
            { value: '', label: 'All Types' },
            { value: 'preventive', label: 'Preventive' },
            { value: 'corrective', label: 'Corrective' },
            { value: 'emergency', label: 'Emergency' },
            { value: 'upgrade', label: 'Upgrade' }
          ],
          is_completed: [
            { value: '', label: 'All Records' },
            { value: 'true', label: 'Completed' },
            { value: 'false', label: 'Pending' }
          ]
        }}
        dateFilters={['scheduled_from', 'scheduled_to']}
      />

      {/* Maintenance Records List */}
      <Card>
        <CardHeader title={`Maintenance Records (${filteredMaintenanceRecords.length})`} />
        <div className="p-6">
          {filteredMaintenanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Link to="/inventory/maintenance/create">
                <Button>Schedule Your First Maintenance</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMaintenanceRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getPriorityIcon(record.is_completed, record.scheduled_date)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                          {getMaintenanceTypeBadge(record.maintenance_type)}
                          {getStatusBadge(record.is_completed, record.scheduled_date)}
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-gray-600">{record.description}</p>
                          {record.notes && (
                            <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <CubeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{record.asset_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Scheduled: {new Date(record.scheduled_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {record.performed_by || 'Not assigned'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              ${record.cost.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {record.is_completed && record.completed_date && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-800">
                                Completed on {new Date(record.completed_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/inventory/maintenance/${record.id}`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/inventory/maintenance/${record.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(record)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Maintenance Record</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedRecord.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;

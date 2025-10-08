import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CubeIcon,
  MapPinIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface Asset {
  id: string;
  name: string;
  description: string;
  category: string;
  category_name: string;
  supplier: string;
  supplier_name: string;
  serial_number: string;
  model: string;
  brand: string;
  condition: string;
  condition_display: string;
  status: string;
  status_display: string;
  location: string;
  room_number: string;
  department: string;
  purchase_price: number;
  current_value: number;
  purchase_date: string;
  warranty_expiry: string;
  last_maintenance: string;
  next_maintenance: string;
  assigned_to: string;
  assigned_date: string;
  created_at: string;
}

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters] = useState({
    category: '',
    condition: '',
    status: '',
    department: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockAssets: Asset[] = [
      {
        id: '1',
        name: 'Dell Latitude Laptop',
        description: 'High-performance laptop for staff use',
        category: 'electronics',
        category_name: 'Electronics',
        supplier: 'dell',
        supplier_name: 'Dell Technologies',
        serial_number: 'DL-2024-001',
        model: 'Latitude 5520',
        brand: 'Dell',
        condition: 'excellent',
        condition_display: 'Excellent',
        status: 'in_use',
        status_display: 'In Use',
        location: 'Main Building',
        room_number: '101',
        department: 'IT Department',
        purchase_price: 1200.00,
        current_value: 1000.00,
        purchase_date: '2024-01-15',
        warranty_expiry: '2027-01-15',
        last_maintenance: '2024-06-15',
        next_maintenance: '2024-12-15',
        assigned_to: 'John Smith',
        assigned_date: '2024-01-20',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Epson Projector',
        description: 'High-definition projector for presentations',
        category: 'electronics',
        category_name: 'Electronics',
        supplier: 'epson',
        supplier_name: 'Epson Corporation',
        serial_number: 'EP-2024-002',
        model: 'PowerLite 1781W',
        brand: 'Epson',
        condition: 'good',
        condition_display: 'Good',
        status: 'available',
        status_display: 'Available',
        location: 'Auditorium',
        room_number: 'A101',
        department: 'AV Department',
        purchase_price: 800.00,
        current_value: 600.00,
        purchase_date: '2024-02-10',
        warranty_expiry: '2026-02-10',
        last_maintenance: '2024-05-10',
        next_maintenance: '2024-11-10',
        assigned_to: '',
        assigned_date: '',
        created_at: '2024-02-10T14:30:00Z'
      },
      {
        id: '3',
        name: 'Office Desk',
        description: 'Standard office desk with drawers',
        category: 'furniture',
        category_name: 'Furniture',
        supplier: 'office-supplies',
        supplier_name: 'Office Supplies Co.',
        serial_number: 'FD-2024-003',
        model: 'Executive Desk',
        brand: 'OfficeMax',
        condition: 'fair',
        condition_display: 'Fair',
        status: 'in_use',
        status_display: 'In Use',
        location: 'Administration Building',
        room_number: '201',
        department: 'Administration',
        purchase_price: 300.00,
        current_value: 150.00,
        purchase_date: '2023-08-20',
        warranty_expiry: '',
        last_maintenance: '',
        next_maintenance: '',
        assigned_to: 'Sarah Johnson',
        assigned_date: '2023-08-25',
        created_at: '2023-08-20T09:15:00Z'
      },
      {
        id: '4',
        name: 'Microscope Set',
        description: 'Laboratory microscope for science classes',
        category: 'lab-equipment',
        category_name: 'Lab Equipment',
        supplier: 'science-supplies',
        supplier_name: 'Science Supplies Inc.',
        serial_number: 'MS-2024-004',
        model: 'Student Microscope',
        brand: 'Leica',
        condition: 'excellent',
        condition_display: 'Excellent',
        status: 'maintenance',
        status_display: 'Under Maintenance',
        location: 'Science Lab',
        room_number: 'S101',
        department: 'Science Department',
        purchase_price: 500.00,
        current_value: 450.00,
        purchase_date: '2024-03-05',
        warranty_expiry: '2026-03-05',
        last_maintenance: '2024-07-05',
        next_maintenance: '2024-10-05',
        assigned_to: 'Dr. Michael Brown',
        assigned_date: '2024-03-10',
        created_at: '2024-03-05T11:45:00Z'
      }
    ];

    setTimeout(() => {
      setAssets(mockAssets);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
  }, []);

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Excellent</span>;
      case 'good':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Good</span>;
      case 'fair':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Fair</span>;
      case 'poor':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Poor</span>;
      case 'damaged':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Damaged</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{condition}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Available</span>;
      case 'in_use':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">In Use</span>;
      case 'maintenance':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Under Maintenance</span>;
      case 'retired':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Retired</span>;
      case 'lost':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Lost</span>;
      case 'stolen':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Stolen</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const handleDelete = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedAsset) {
      setAssets(assets.filter(a => a.id !== selectedAsset.id));
      setShowDeleteModal(false);
      setSelectedAsset(null);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) ||
                         asset.description.toLowerCase().includes(search.toLowerCase()) ||
                         asset.serial_number.toLowerCase().includes(search.toLowerCase()) ||
                         asset.assigned_to.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !filters.category || asset.category === filters.category;
    const matchesCondition = !filters.condition || asset.condition === filters.condition;
    const matchesStatus = !filters.status || asset.status === filters.status;
    const matchesDepartment = !filters.department || asset.department === filters.department;
    
    return matchesSearch && matchesCategory && matchesCondition && matchesStatus && matchesDepartment;
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
          <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600">Manage and track all school assets</p>
        </div>
        <Link to="/inventory/assets/create">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Assets List */}
      <Card>
        <CardHeader title={`Assets (${filteredAssets.length})`} />
        <div className="p-6">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Link to="/inventory/assets/create">
                <Button>Add Your First Asset</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <CubeIcon className="w-8 h-8 text-blue-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                          {getConditionBadge(asset.condition)}
                          {getStatusBadge(asset.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{asset.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {asset.location} - Room {asset.room_number}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {asset.assigned_to || 'Unassigned'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              ${asset.current_value.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Purchased: {asset.purchase_date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/inventory/assets/${asset.id}`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/inventory/assets/${asset.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(asset)}
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
          page={page}
          pageSize={10}
          total={totalPages * 10}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Asset</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{selectedAsset.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
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

export default Assets;



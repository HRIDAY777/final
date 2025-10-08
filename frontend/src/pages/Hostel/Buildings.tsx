import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/UI/Dialog';
import Input from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';

import {
  HomeModernIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Building {
  id: number;
  name: string;
  address: string;
  total_floors: number;
  description: string;
  is_active: boolean;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  occupancy_rate: number;
  created_at: string;
}

const Buildings: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    address: '',
    total_floors: 1,
    description: '',
    is_active: true
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });



  const fetchBuildings = useCallback(async () => {
    try {
      // Mock data for demonstration
      const mockBuildings: Building[] = [
        {
          id: 1,
          name: 'Building A',
          address: '123 Main Street, Campus Area',
          total_floors: 5,
          description: 'Main hostel building with modern amenities',
          is_active: true,
          total_rooms: 50,
          occupied_rooms: 45,
          available_rooms: 5,
          occupancy_rate: 90,
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 2,
          name: 'Building B',
          address: '456 Oak Avenue, Campus Area',
          total_floors: 4,
          description: 'Secondary hostel building with premium facilities',
          is_active: true,
          total_rooms: 40,
          occupied_rooms: 38,
          available_rooms: 2,
          occupancy_rate: 95,
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 3,
          name: 'Building C',
          address: '789 Pine Street, Campus Area',
          total_floors: 6,
          description: 'Newest hostel building with luxury accommodations',
          is_active: true,
          total_rooms: 60,
          occupied_rooms: 55,
          available_rooms: 5,
          occupancy_rate: 91.7,
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 4,
          name: 'Building D',
          address: '321 Elm Street, Campus Area',
          total_floors: 3,
          description: 'Older building under renovation',
          is_active: false,
          total_rooms: 30,
          occupied_rooms: 0,
          available_rooms: 30,
          occupancy_rate: 0,
          created_at: '2024-01-01T10:00:00Z',
        }
      ];

      // Apply filters
      let filteredBuildings = mockBuildings.filter(building => {
        if (filters.status === 'active' && !building.is_active) return false;
        if (filters.status === 'inactive' && building.is_active) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            building.name.toLowerCase().includes(searchLower) ||
            building.address.toLowerCase().includes(searchLower) ||
            building.description.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedBuildings = filteredBuildings.slice(startIndex, endIndex);

      setBuildings(paginatedBuildings);
      setTotalCount(filteredBuildings.length);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);



  const handleCreateBuilding = async () => {
    try {
      // Mock API call
      console.log('Creating building:', buildingForm);
      setShowBuildingModal(false);
      setBuildingForm({
        name: '',
        address: '',
        total_floors: 1,
        description: '',
        is_active: true
      });
      fetchBuildings();
    } catch (error) {
      console.error('Error creating building:', error);
    }
  };

  const handleUpdateBuilding = async () => {
    try {
      // Mock API call
      console.log('Updating building:', buildingForm);
      setShowBuildingModal(false);
      setIsEditing(false);
      setBuildingForm({
        name: '',
        address: '',
        total_floors: 1,
        description: '',
        is_active: true
      });
      fetchBuildings();
    } catch (error) {
      console.error('Error updating building:', error);
    }
  };

  const handleEditBuilding = (building: Building) => {
    setSelectedBuilding(building);
    setBuildingForm({
      name: building.name,
      address: building.address,
      total_floors: building.total_floors,
      description: building.description,
      is_active: building.is_active
    });
    setIsEditing(true);
    setShowBuildingModal(true);
  };

  const handleDeleteBuilding = async (buildingId: number) => {
    try {
      // Mock API call
      console.log('Deleting building:', buildingId);
      fetchBuildings();
    } catch (error) {
      console.error('Error deleting building:', error);
    }
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 90) return 'bg-red-100 text-red-800';
    if (occupancy >= 75) return 'bg-yellow-100 text-yellow-800';
    if (occupancy >= 50) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const filterOptions = [
    { label: 'All Buildings', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Buildings"
        subtitle="Manage hostel buildings, floors, and room configurations"
        actions={
          <Button variant="default" size="sm" onClick={() => setShowBuildingModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Building
          </Button>
        }
      />

      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        searchPlaceholder="Search by building name, address, or description..."
        right={
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map((building) => (
          <Card key={building.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HomeModernIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{building.name}</h3>
                    <p className="text-sm text-gray-500">{building.address}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(building.is_active)}`}>
                  {building.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Floors:</span>
                  <span className="font-medium">{building.total_floors}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Rooms:</span>
                  <span className="font-medium">{building.total_rooms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-medium text-green-600">{building.occupied_rooms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-blue-600">{building.available_rooms}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Occupancy Rate:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOccupancyColor(building.occupancy_rate)}`}>
                    {building.occupancy_rate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {building.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {building.description}
                </p>
              )}

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBuilding(building);
                      setShowDetailModal(true);
                    }}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditBuilding(building)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBuilding(building.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="secondary" size="sm">
                  View Rooms
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

             <div className="flex justify-center">
         <Pagination
           page={currentPage}
           pageSize={10}
           total={totalCount}
           onPageChange={setCurrentPage}
         />
       </div>

             {/* Building Dialog */}
       <Dialog open={showBuildingModal} onOpenChange={setShowBuildingModal}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>{isEditing ? 'Edit Building' : 'Add New Building'}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
               <Input
                 value={buildingForm.name}
                 onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
               <Textarea
                 value={buildingForm.address}
                 onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                 rows={2}
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
               <Input
                 type="number"
                 value={buildingForm.total_floors}
                 onChange={(e) => setBuildingForm({ ...buildingForm, total_floors: parseInt(e.target.value) })}
                 min={1}
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
               <Textarea
                 value={buildingForm.description}
                 onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
                 rows={3}
               />
             </div>

             <div className="flex items-center">
               <input
                 type="checkbox"
                 id="is_active"
                 checked={buildingForm.is_active}
                 onChange={(e) => setBuildingForm({ ...buildingForm, is_active: e.target.checked })}
                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
               />
               <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                 Active Building
               </label>
             </div>
           </div>

           <div className="flex justify-end space-x-3 mt-6">
             <Button
               variant="secondary"
               onClick={() => {
                 setShowBuildingModal(false);
                 setIsEditing(false);
                 setBuildingForm({
                   name: '',
                   address: '',
                   total_floors: 1,
                   description: '',
                   is_active: true
                 });
               }}
             >
               Cancel
             </Button>
             <Button
               variant="default"
               onClick={isEditing ? handleUpdateBuilding : handleCreateBuilding}
             >
               {isEditing ? 'Update Building' : 'Create Building'}
             </Button>
           </div>
         </DialogContent>
       </Dialog>

             {/* Building Detail Dialog */}
       <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Building Details</DialogTitle>
           </DialogHeader>
           {selectedBuilding && (
             <div className="space-y-6">
               <div className="bg-gray-50 p-4 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <HomeModernIcon className="h-8 w-8 text-blue-600" />
                     <div className="ml-3">
                       <h3 className="text-xl font-semibold text-gray-900">{selectedBuilding.name}</h3>
                       <p className="text-sm text-gray-500">{selectedBuilding.address}</p>
                     </div>
                   </div>
                   <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedBuilding.is_active)}`}>
                     {selectedBuilding.is_active ? 'Active' : 'Inactive'}
                   </span>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <h4 className="text-lg font-medium text-gray-900 mb-4">Building Information</h4>
                   <div className="space-y-3">
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Total Floors</label>
                       <p className="mt-1 text-sm text-gray-900">{selectedBuilding.total_floors}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Description</label>
                       <p className="mt-1 text-sm text-gray-900">{selectedBuilding.description || 'No description available'}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Created At</label>
                       <p className="mt-1 text-sm text-gray-900">{new Date(selectedBuilding.created_at).toLocaleDateString()}</p>
                     </div>
                   </div>
                 </div>

                 <div>
                   <h4 className="text-lg font-medium text-gray-900 mb-4">Room Statistics</h4>
                   <div className="space-y-3">
                     <div className="flex justify-between">
                       <span className="text-sm text-gray-600">Total Rooms:</span>
                       <span className="font-medium">{selectedBuilding.total_rooms}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-gray-600">Occupied Rooms:</span>
                       <span className="font-medium text-green-600">{selectedBuilding.occupied_rooms}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-gray-600">Available Rooms:</span>
                       <span className="font-medium text-blue-600">{selectedBuilding.available_rooms}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Occupancy Rate:</span>
                       <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOccupancyColor(selectedBuilding.occupancy_rate)}`}>
                         {selectedBuilding.occupancy_rate.toFixed(1)}%
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="flex justify-end space-x-3">
                 <Button
                   variant="secondary"
                   onClick={() => handleEditBuilding(selectedBuilding)}
                 >
                   <PencilIcon className="h-4 w-4 mr-2" />
                   Edit Building
                 </Button>
                 <Button variant="default">
                   <EyeIcon className="h-4 w-4 mr-2" />
                   View Rooms
                 </Button>
               </div>
             </div>
           )}

           <div className="flex justify-end mt-6">
             <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
               Close
             </Button>
           </div>
         </DialogContent>
       </Dialog>
    </div>
  );
};

export default Buildings;

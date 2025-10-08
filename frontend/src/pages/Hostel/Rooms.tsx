import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import {
  HomeModernIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface RoomListItem {
  id: number;
  room_number: string;
  building_name: string;
  floor: number;
  room_type_name: string;
  status: string;
  current_capacity: number;
  available_beds: number;
  occupancy_rate: number;
  is_occupied: boolean;
  description: string;
  amenities: string[];
}



const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const OccupancyBadge: React.FC<{ occupancy: number }> = ({ occupancy }) => {
  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 90) return 'bg-red-100 text-red-800';
    if (occupancy >= 75) return 'bg-yellow-100 text-yellow-800';
    if (occupancy >= 50) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOccupancyColor(occupancy)}`}>
      {occupancy.toFixed(1)}%
    </span>
  );
};

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<RoomListItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter states
  const [searchValue, setSearchValue] = useState('');

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockRooms: RoomListItem[] = [
        {
          id: 1,
          room_number: 'A-101',
          building_name: 'Building A',
          floor: 1,
          room_type_name: 'Double Room',
          status: 'available',
          current_capacity: 2,
          available_beds: 2,
          occupancy_rate: 0,
          is_occupied: false,
          description: 'Comfortable double room with modern amenities',
          amenities: ['WiFi', 'AC', 'Private Bathroom']
        },
        {
          id: 2,
          room_number: 'A-102',
          building_name: 'Building A',
          floor: 1,
          room_type_name: 'Single Room',
          status: 'occupied',
          current_capacity: 1,
          available_beds: 0,
          occupancy_rate: 100,
          is_occupied: true,
          description: 'Cozy single room with study desk',
          amenities: ['WiFi', 'AC', 'Study Desk']
        },
        {
          id: 3,
          room_number: 'B-201',
          building_name: 'Building B',
          floor: 2,
          room_type_name: 'Triple Room',
          status: 'maintenance',
          current_capacity: 3,
          available_beds: 0,
          occupancy_rate: 0,
          is_occupied: false,
          description: 'Spacious triple room for group accommodation',
          amenities: ['WiFi', 'AC', 'Shared Bathroom', 'Kitchen']
        }
      ];

      // Apply search filter
      let filteredRooms = mockRooms;
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        filteredRooms = mockRooms.filter(room => 
          room.room_number.toLowerCase().includes(searchLower) ||
          room.building_name.toLowerCase().includes(searchLower) ||
          room.room_type_name.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

      setRooms(paginatedRooms);
      setTotalCount(filteredRooms.length);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchValue]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);



  const handleExport = () => {
    // Export functionality
    console.log('Exporting rooms data...');
  };

  const handleViewDetails = (room: RoomListItem) => {
    setSelectedRoom(room);
    setShowDetailModal(true);
  };

  const handleEdit = (room: RoomListItem) => {
    console.log('Edit room:', room);
  };

  const handleDelete = (room: RoomListItem) => {
    console.log('Delete room:', room);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Management"
        subtitle="Manage hostel rooms, allocations, and maintenance"
        actions={
          <div className="flex space-x-3">
            <Button variant="default" size="sm">
              <HomeModernIcon className="h-4 w-4 mr-2" />
              Add Room
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      <Card>
        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search rooms..."
        />

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading rooms...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Building
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occupancy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available Beds
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {room.room_number}
                            </div>
                            <div className="text-sm text-gray-500">Floor {room.floor}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {room.building_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {room.room_type_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={room.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <OccupancyBadge occupancy={room.occupancy_rate} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {room.available_beds} / {room.current_capacity + room.available_beds}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(room)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(room)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(room)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <Pagination
                  page={currentPage}
                  pageSize={10}
                  total={totalCount}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedRoom && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Room Details - {selectedRoom.room_number}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Room Number</dt>
                      <dd className="text-sm text-gray-900">{selectedRoom.room_number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Building</dt>
                      <dd className="text-sm text-gray-900">{selectedRoom.building_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Floor</dt>
                      <dd className="text-sm text-gray-900">{selectedRoom.floor}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Room Type</dt>
                      <dd className="text-sm text-gray-900">{selectedRoom.room_type_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm">
                        <StatusBadge status={selectedRoom.status} />
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Occupancy Details</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Current Capacity</dt>
                      <dd className="text-sm text-gray-900">{selectedRoom.current_capacity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Available Beds</dt>
                      <dd className="text-sm text-gray-900">{selectedRoom.available_beds}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Occupancy Rate</dt>
                      <dd className="text-sm">
                        <OccupancyBadge occupancy={selectedRoom.occupancy_rate} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-900">{selectedRoom.description}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleEdit(selectedRoom)}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Room
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;



import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../services/api';

export interface Hostel {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  email?: string;
  capacity: number;
  occupied: number;
  available: number;
  description?: string;
  amenities: string[];
  rules: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: number;
  hostel: number;
  name: string;
  floors: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  description?: string;
  is_active: boolean;
}

export interface Room {
  id: number;
  building: number;
  room_number: string;
  floor: number;
  room_type: 'single' | 'double' | 'triple' | 'dormitory';
  capacity: number;
  occupied: number;
  available: number;
  rent_amount: number;
  amenities: string[];
  is_available: boolean;
  is_active: boolean;
  description?: string;
}

export interface StudentAllocation {
  id: number;
  student: number;
  room: number;
  hostel: number;
  allocation_date: string;
  check_in_date: string;
  check_out_date?: string;
  status: 'active' | 'inactive' | 'transferred' | 'graduated';
  rent_amount: number;
  deposit_amount: number;
  is_active: boolean;
  notes?: string;
}

export interface Fee {
  id: number;
  student_allocation: number;
  fee_type: 'rent' | 'deposit' | 'maintenance' | 'electricity' | 'water' | 'other';
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  payment_method?: string;
  receipt_number?: string;
  notes?: string;
}

export interface Maintenance {
  id: number;
  hostel: number;
  building?: number;
  room?: number;
  issue_type: 'electrical' | 'plumbing' | 'carpentry' | 'cleaning' | 'security' | 'other';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  reported_by: number;
  assigned_to?: number;
  reported_date: string;
  completed_date?: string;
  cost?: number;
  notes?: string;
}

export interface Visitor {
  id: number;
  hostel: number;
  visitor_name: string;
  visitor_phone: string;
  visitor_id_type: 'national_id' | 'passport' | 'driving_license' | 'other';
  visitor_id_number: string;
  purpose: string;
  student_visited: number;
  check_in_time: string;
  check_out_time?: string;
  status: 'checked_in' | 'checked_out';
  notes?: string;
}

export interface Rule {
  id: number;
  hostel: number;
  title: string;
  description: string;
  category: 'general' | 'room' | 'visitor' | 'security' | 'other';
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface HostelState {
  hostels: Hostel[];
  buildings: Building[];
  rooms: Room[];
  studentAllocations: StudentAllocation[];
  fees: Fee[];
  maintenance: Maintenance[];
  visitors: Visitor[];
  rules: Rule[];
  loading: boolean;
  error: string | null;
  selectedHostel: Hostel | null;
  selectedBuilding: Building | null;
  selectedRoom: Room | null;
  filters: {
    hostel: string;
    building: string;
    room_type: string;
    status: string;
    search: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface HostelActions {
  // Fetch actions
  fetchHostels: (params?: any) => Promise<void>;
  fetchHostelById: (id: number) => Promise<void>;
  fetchBuildings: (hostelId: number, params?: any) => Promise<void>;
  fetchBuildingById: (id: number) => Promise<void>;
  fetchRooms: (buildingId: number, params?: any) => Promise<void>;
  fetchRoomById: (id: number) => Promise<void>;
  fetchStudentAllocations: (hostelId: number, params?: any) => Promise<void>;
  fetchStudentAllocationById: (id: number) => Promise<void>;
  fetchFees: (allocationId: number, params?: any) => Promise<void>;
  fetchFeeById: (id: number) => Promise<void>;
  fetchMaintenance: (hostelId: number, params?: any) => Promise<void>;
  fetchMaintenanceById: (id: number) => Promise<void>;
  fetchVisitors: (hostelId: number, params?: any) => Promise<void>;
  fetchVisitorById: (id: number) => Promise<void>;
  fetchRules: (hostelId: number, params?: any) => Promise<void>;
  fetchRuleById: (id: number) => Promise<void>;
  
  // Create actions
  createHostel: (data: Partial<Hostel>) => Promise<Hostel>;
  createBuilding: (data: Partial<Building>) => Promise<Building>;
  createRoom: (data: Partial<Room>) => Promise<Room>;
  createStudentAllocation: (data: Partial<StudentAllocation>) => Promise<StudentAllocation>;
  createFee: (data: Partial<Fee>) => Promise<Fee>;
  createMaintenance: (data: Partial<Maintenance>) => Promise<Maintenance>;
  createVisitor: (data: Partial<Visitor>) => Promise<Visitor>;
  createRule: (data: Partial<Rule>) => Promise<Rule>;
  
  // Update actions
  updateHostel: (id: number, data: Partial<Hostel>) => Promise<Hostel>;
  updateBuilding: (id: number, data: Partial<Building>) => Promise<Building>;
  updateRoom: (id: number, data: Partial<Room>) => Promise<Room>;
  updateStudentAllocation: (id: number, data: Partial<StudentAllocation>) => Promise<StudentAllocation>;
  updateFee: (id: number, data: Partial<Fee>) => Promise<Fee>;
  updateMaintenance: (id: number, data: Partial<Maintenance>) => Promise<Maintenance>;
  updateVisitor: (id: number, data: Partial<Visitor>) => Promise<Visitor>;
  updateRule: (id: number, data: Partial<Rule>) => Promise<Rule>;
  
  // Delete actions
  deleteHostel: (id: number) => Promise<void>;
  deleteBuilding: (id: number) => Promise<void>;
  deleteRoom: (id: number) => Promise<void>;
  deleteStudentAllocation: (id: number) => Promise<void>;
  deleteFee: (id: number) => Promise<void>;
  deleteMaintenance: (id: number) => Promise<void>;
  deleteVisitor: (id: number) => Promise<void>;
  deleteRule: (id: number) => Promise<void>;
  
  // Utility actions
  setSelectedHostel: (hostel: Hostel | null) => void;
  setSelectedBuilding: (building: Building | null) => void;
  setSelectedRoom: (room: Room | null) => void;
  setFilters: (filters: Partial<HostelState['filters']>) => void;
  setPagination: (pagination: Partial<HostelState['pagination']>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: HostelState = {
  hostels: [],
  buildings: [],
  rooms: [],
  studentAllocations: [],
  fees: [],
  maintenance: [],
  visitors: [],
  rules: [],
  loading: false,
  error: null,
  selectedHostel: null,
  selectedBuilding: null,
  selectedRoom: null,
  filters: {
    hostel: '',
    building: '',
    room_type: '',
    status: '',
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

export const useHostelStore = create<HostelState & HostelActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch actions
      fetchHostels: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/hostel/hostels/', { params });
          set({
            hostels: response.data.results || response.data,
            pagination: {
              page: response.data.page || 1,
              pageSize: response.data.page_size || 20,
              total: response.data.count || response.data.length,
            },
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch hostels',
            loading: false,
          });
        }
      },

      fetchHostelById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/hostel/hostels/${id}/`);
          set({ selectedHostel: response.data, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch hostel',
            loading: false,
          });
        }
      },

      fetchBuildings: async (hostelId: number, params = {}) => {
        try {
          const response = await api.get(`/hostel/hostels/${hostelId}/buildings/`, { params });
          set((state) => ({
            buildings: state.buildings.filter(building => building.hostel !== hostelId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch buildings' });
        }
      },

      fetchBuildingById: async (id: number) => {
        try {
          const response = await api.get(`/hostel/buildings/${id}/`);
          set({ selectedBuilding: response.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch building' });
        }
      },

      fetchRooms: async (buildingId: number, params = {}) => {
        try {
          const response = await api.get(`/hostel/buildings/${buildingId}/rooms/`, { params });
          set((state) => ({
            rooms: state.rooms.filter(room => room.building !== buildingId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch rooms' });
        }
      },

      fetchRoomById: async (id: number) => {
        try {
          const response = await api.get(`/hostel/rooms/${id}/`);
          set({ selectedRoom: response.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch room' });
        }
      },

      fetchStudentAllocations: async (hostelId: number, params = {}) => {
        try {
          const response = await api.get(`/hostel/hostels/${hostelId}/allocations/`, { params });
          set((state) => ({
            studentAllocations: state.studentAllocations.filter(allocation => allocation.hostel !== hostelId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student allocations' });
        }
      },

      fetchStudentAllocationById: async (id: number) => {
        try {
          const response = await api.get(`/hostel/allocations/${id}/`);
          // Update the allocation in the list
          set((state) => ({
            studentAllocations: state.studentAllocations.map(allocation =>
              allocation.id === id ? response.data : allocation
            ),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch student allocation' });
        }
      },

      fetchFees: async (allocationId: number, params = {}) => {
        try {
          const response = await api.get(`/hostel/allocations/${allocationId}/fees/`, { params });
          set((state) => ({
            fees: state.fees.filter(fee => fee.student_allocation !== allocationId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch fees' });
        }
      },

      fetchFeeById: async (id: number) => {
        try {
          const response = await api.get(`/hostel/fees/${id}/`);
          set((state) => ({
            fees: state.fees.map(fee => fee.id === id ? response.data : fee),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch fee' });
        }
      },

      fetchMaintenance: async (hostelId: number, params = {}) => {
        try {
          const response = await api.get(`/hostel/hostels/${hostelId}/maintenance/`, { params });
          set((state) => ({
            maintenance: state.maintenance.filter(maint => maint.hostel !== hostelId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch maintenance' });
        }
      },

      fetchMaintenanceById: async (id: number) => {
        try {
          const response = await api.get(`/hostel/maintenance/${id}/`);
          set((state) => ({
            maintenance: state.maintenance.map(maint => maint.id === id ? response.data : maint),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch maintenance' });
        }
      },

      fetchVisitors: async (hostelId: number, params = {}) => {
        try {
          const response = await api.get(`/hostel/hostels/${hostelId}/visitors/`, { params });
          set((state) => ({
            visitors: state.visitors.filter(visitor => visitor.hostel !== hostelId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch visitors' });
        }
      },

      fetchVisitorById: async (id: number) => {
        try {
          const response = await api.get(`/hostel/visitors/${id}/`);
          set((state) => ({
            visitors: state.visitors.map(visitor => visitor.id === id ? response.data : visitor),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch visitor' });
        }
      },

      fetchRules: async (hostelId: number, params = {}) => {
        try {
          const response = await api.get(`/hostel/hostels/${hostelId}/rules/`, { params });
          set((state) => ({
            rules: state.rules.filter(rule => rule.hostel !== hostelId)
              .concat(response.data),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch rules' });
        }
      },

      fetchRuleById: async (id: number) => {
        try {
          const response = await api.get(`/hostel/rules/${id}/`);
          set((state) => ({
            rules: state.rules.map(rule => rule.id === id ? response.data : rule),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch rule' });
        }
      },

      // Create actions
      createHostel: async (data: Partial<Hostel>) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/hostel/hostels/', data);
          set((state) => ({
            hostels: [...state.hostels, response.data],
            loading: false,
          }));
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to create hostel',
            loading: false,
          });
          throw error;
        }
      },

      createBuilding: async (data: Partial<Building>) => {
        try {
          const response = await api.post('/hostel/buildings/', data);
          set((state) => ({
            buildings: [...state.buildings, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create building' });
          throw error;
        }
      },

      createRoom: async (data: Partial<Room>) => {
        try {
          const response = await api.post('/hostel/rooms/', data);
          set((state) => ({
            rooms: [...state.rooms, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create room' });
          throw error;
        }
      },

      createStudentAllocation: async (data: Partial<StudentAllocation>) => {
        try {
          const response = await api.post('/hostel/allocations/', data);
          set((state) => ({
            studentAllocations: [...state.studentAllocations, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create student allocation' });
          throw error;
        }
      },

      createFee: async (data: Partial<Fee>) => {
        try {
          const response = await api.post('/hostel/fees/', data);
          set((state) => ({
            fees: [...state.fees, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create fee' });
          throw error;
        }
      },

      createMaintenance: async (data: Partial<Maintenance>) => {
        try {
          const response = await api.post('/hostel/maintenance/', data);
          set((state) => ({
            maintenance: [...state.maintenance, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create maintenance' });
          throw error;
        }
      },

      createVisitor: async (data: Partial<Visitor>) => {
        try {
          const response = await api.post('/hostel/visitors/', data);
          set((state) => ({
            visitors: [...state.visitors, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create visitor' });
          throw error;
        }
      },

      createRule: async (data: Partial<Rule>) => {
        try {
          const response = await api.post('/hostel/rules/', data);
          set((state) => ({
            rules: [...state.rules, response.data],
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create rule' });
          throw error;
        }
      },

      // Update actions
      updateHostel: async (id: number, data: Partial<Hostel>) => {
        set({ loading: true, error: null });
        try {
          const response = await api.patch(`/hostel/hostels/${id}/`, data);
          set((state) => ({
            hostels: state.hostels.map(hostel =>
              hostel.id === id ? response.data : hostel
            ),
            selectedHostel: state.selectedHostel?.id === id ? response.data : state.selectedHostel,
            loading: false,
          }));
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update hostel',
            loading: false,
          });
          throw error;
        }
      },

      updateBuilding: async (id: number, data: Partial<Building>) => {
        try {
          const response = await api.patch(`/hostel/buildings/${id}/`, data);
          set((state) => ({
            buildings: state.buildings.map(building =>
              building.id === id ? response.data : building
            ),
            selectedBuilding: state.selectedBuilding?.id === id ? response.data : state.selectedBuilding,
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update building' });
          throw error;
        }
      },

      updateRoom: async (id: number, data: Partial<Room>) => {
        try {
          const response = await api.patch(`/hostel/rooms/${id}/`, data);
          set((state) => ({
            rooms: state.rooms.map(room =>
              room.id === id ? response.data : room
            ),
            selectedRoom: state.selectedRoom?.id === id ? response.data : state.selectedRoom,
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update room' });
          throw error;
        }
      },

      updateStudentAllocation: async (id: number, data: Partial<StudentAllocation>) => {
        try {
          const response = await api.patch(`/hostel/allocations/${id}/`, data);
          set((state) => ({
            studentAllocations: state.studentAllocations.map(allocation =>
              allocation.id === id ? response.data : allocation
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update student allocation' });
          throw error;
        }
      },

      updateFee: async (id: number, data: Partial<Fee>) => {
        try {
          const response = await api.patch(`/hostel/fees/${id}/`, data);
          set((state) => ({
            fees: state.fees.map(fee =>
              fee.id === id ? response.data : fee
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update fee' });
          throw error;
        }
      },

      updateMaintenance: async (id: number, data: Partial<Maintenance>) => {
        try {
          const response = await api.patch(`/hostel/maintenance/${id}/`, data);
          set((state) => ({
            maintenance: state.maintenance.map(maint =>
              maint.id === id ? response.data : maint
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update maintenance' });
          throw error;
        }
      },

      updateVisitor: async (id: number, data: Partial<Visitor>) => {
        try {
          const response = await api.patch(`/hostel/visitors/${id}/`, data);
          set((state) => ({
            visitors: state.visitors.map(visitor =>
              visitor.id === id ? response.data : visitor
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update visitor' });
          throw error;
        }
      },

      updateRule: async (id: number, data: Partial<Rule>) => {
        try {
          const response = await api.patch(`/hostel/rules/${id}/`, data);
          set((state) => ({
            rules: state.rules.map(rule =>
              rule.id === id ? response.data : rule
            ),
          }));
          return response.data;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update rule' });
          throw error;
        }
      },

      // Delete actions
      deleteHostel: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await api.delete(`/hostel/hostels/${id}/`);
          set((state) => ({
            hostels: state.hostels.filter(hostel => hostel.id !== id),
            selectedHostel: state.selectedHostel?.id === id ? null : state.selectedHostel,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete hostel',
            loading: false,
          });
          throw error;
        }
      },

      deleteBuilding: async (id: number) => {
        try {
          await api.delete(`/hostel/buildings/${id}/`);
          set((state) => ({
            buildings: state.buildings.filter(building => building.id !== id),
            selectedBuilding: state.selectedBuilding?.id === id ? null : state.selectedBuilding,
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete building' });
          throw error;
        }
      },

      deleteRoom: async (id: number) => {
        try {
          await api.delete(`/hostel/rooms/${id}/`);
          set((state) => ({
            rooms: state.rooms.filter(room => room.id !== id),
            selectedRoom: state.selectedRoom?.id === id ? null : state.selectedRoom,
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete room' });
          throw error;
        }
      },

      deleteStudentAllocation: async (id: number) => {
        try {
          await api.delete(`/hostel/allocations/${id}/`);
          set((state) => ({
            studentAllocations: state.studentAllocations.filter(allocation => allocation.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete student allocation' });
          throw error;
        }
      },

      deleteFee: async (id: number) => {
        try {
          await api.delete(`/hostel/fees/${id}/`);
          set((state) => ({
            fees: state.fees.filter(fee => fee.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete fee' });
          throw error;
        }
      },

      deleteMaintenance: async (id: number) => {
        try {
          await api.delete(`/hostel/maintenance/${id}/`);
          set((state) => ({
            maintenance: state.maintenance.filter(maint => maint.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete maintenance' });
          throw error;
        }
      },

      deleteVisitor: async (id: number) => {
        try {
          await api.delete(`/hostel/visitors/${id}/`);
          set((state) => ({
            visitors: state.visitors.filter(visitor => visitor.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete visitor' });
          throw error;
        }
      },

      deleteRule: async (id: number) => {
        try {
          await api.delete(`/hostel/rules/${id}/`);
          set((state) => ({
            rules: state.rules.filter(rule => rule.id !== id),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to delete rule' });
          throw error;
        }
      },

      // Utility actions
      setSelectedHostel: (hostel) => set({ selectedHostel: hostel }),
      setSelectedBuilding: (building) => set({ selectedBuilding: building }),
      setSelectedRoom: (room) => set({ selectedRoom: room }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'hostel-store',
    }
  )
);

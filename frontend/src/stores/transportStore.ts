import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiService } from '../services/api';

export interface Vehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  license_plate: string;
  registration_number: string;
  insurance_number: string;
  insurance_expiry: string;
  fitness_certificate_expiry: string;
  permit_expiry: string;
  fuel_type: string;
  mileage: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: number;
  driver_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  experience_years: number;
  address: string;
  emergency_contact: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: number;
  route_name: string;
  route_number: string;
  start_location: string;
  end_location: string;
  distance: number;
  estimated_time: number;
  stops: string[];
  fare: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  vehicle: Vehicle;
  driver: Driver;
  route: Route;
  departure_time: string;
  arrival_time: string;
  days_of_week: string[];
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: number;
  schedule: Schedule;
  vehicle: Vehicle;
  driver: Driver;
  route: Route;
  departure_time: string;
  arrival_time: string;
  actual_departure: string;
  actual_arrival: string;
  passengers: any[];
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Maintenance {
  id: number;
  vehicle: Vehicle;
  maintenance_type: string;
  description: string;
  cost: number;
  performed_by: string;
  maintenance_date: string;
  next_maintenance_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TransportState {
  // Vehicles
  vehicles: any;
  currentVehicle: Vehicle | null;
  vehiclesLoading: boolean;
  vehiclesError: string | null;

  // Drivers
  drivers: any;
  currentDriver: Driver | null;
  driversLoading: boolean;
  driversError: string | null;

  // Routes
  routes: any;
  currentRoute: Route | null;
  routesLoading: boolean;
  routesError: string | null;

  // Schedules
  schedules: any;
  currentSchedule: Schedule | null;
  schedulesLoading: boolean;
  schedulesError: string | null;

  // Trips
  trips: any;
  currentTrip: Trip | null;
  tripsLoading: boolean;
  tripsError: string | null;

  // Maintenance
  maintenance: any;
  currentMaintenance: Maintenance | null;
  maintenanceLoading: boolean;
  maintenanceError: string | null;
}

interface TransportActions {
  // Vehicle actions
  // eslint-disable-next-line no-unused-vars
  fetchVehicles: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchVehicleById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createVehicle: (data: Partial<Vehicle>) => Promise<Vehicle>;
  // eslint-disable-next-line no-unused-vars
  updateVehicle: (id: number, data: Partial<Vehicle>) => Promise<Vehicle>;
  // eslint-disable-next-line no-unused-vars
  deleteVehicle: (id: number) => Promise<void>;

  // Driver actions
  // eslint-disable-next-line no-unused-vars
  fetchDrivers: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchDriverById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createDriver: (data: Partial<Driver>) => Promise<Driver>;
  // eslint-disable-next-line no-unused-vars
  updateDriver: (id: number, data: Partial<Driver>) => Promise<Driver>;
  // eslint-disable-next-line no-unused-vars
  deleteDriver: (id: number) => Promise<void>;

  // Route actions
  // eslint-disable-next-line no-unused-vars
  fetchRoutes: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchRouteById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createRoute: (data: Partial<Route>) => Promise<Route>;
  // eslint-disable-next-line no-unused-vars
  updateRoute: (id: number, data: Partial<Route>) => Promise<Route>;
  // eslint-disable-next-line no-unused-vars
  deleteRoute: (id: number) => Promise<void>;

  // Schedule actions
  // eslint-disable-next-line no-unused-vars
  fetchSchedules: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchScheduleById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createSchedule: (data: Partial<Schedule>) => Promise<Schedule>;
  // eslint-disable-next-line no-unused-vars
  updateSchedule: (id: number, data: Partial<Schedule>) => Promise<Schedule>;
  // eslint-disable-next-line no-unused-vars
  deleteSchedule: (id: number) => Promise<void>;

  // Trip actions
  // eslint-disable-next-line no-unused-vars
  fetchTrips: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchTripById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createTrip: (data: Partial<Trip>) => Promise<Trip>;
  // eslint-disable-next-line no-unused-vars
  updateTrip: (id: number, data: Partial<Trip>) => Promise<Trip>;
  // eslint-disable-next-line no-unused-vars
  deleteTrip: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  startTrip: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  endTrip: (id: number) => Promise<void>;

  // Maintenance actions
  // eslint-disable-next-line no-unused-vars
  fetchMaintenance: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchMaintenanceById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createMaintenance: (data: Partial<Maintenance>) => Promise<Maintenance>;
  // eslint-disable-next-line no-unused-vars
  updateMaintenance: (id: number, data: Partial<Maintenance>) => Promise<Maintenance>;
  // eslint-disable-next-line no-unused-vars
  deleteMaintenance: (id: number) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: TransportState = {
  vehicles: null,
  currentVehicle: null,
  vehiclesLoading: false,
  vehiclesError: null,

  drivers: null,
  currentDriver: null,
  driversLoading: false,
  driversError: null,

  routes: null,
  currentRoute: null,
  routesLoading: false,
  routesError: null,

  schedules: null,
  currentSchedule: null,
  schedulesLoading: false,
  schedulesError: null,

  trips: null,
  currentTrip: null,
  tripsLoading: false,
  tripsError: null,

  maintenance: null,
  currentMaintenance: null,
  maintenanceLoading: false,
  maintenanceError: null,
};

export const useTransportStore = create<TransportState & TransportActions>()(
  devtools(
    // eslint-disable-next-line no-unused-vars
    (set, get) => ({
      ...initialState,

      // Vehicle actions
      fetchVehicles: async (params = {}) => {
        set({ vehiclesLoading: true, vehiclesError: null });
        try {
          const response = await apiService.get<Vehicle[]>('/transport/vehicles/', { params });
          set({ vehicles: response, vehiclesLoading: false });
        } catch (error: any) {
          set({ 
            vehiclesError: error.response?.data?.message || 'Failed to fetch vehicles',
            vehiclesLoading: false 
          });
        }
      },

      fetchVehicleById: async (id: number) => {
        set({ vehiclesLoading: true, vehiclesError: null });
        try {
          const response = await apiService.get<Vehicle>(`/transport/vehicles/${id}/`);
          set({ currentVehicle: response, vehiclesLoading: false });
        } catch (error: any) {
          set({ 
            vehiclesError: error.response?.data?.message || 'Failed to fetch vehicle',
            vehiclesLoading: false 
          });
        }
      },

      createVehicle: async (data: Partial<Vehicle>) => {
        set({ vehiclesLoading: true, vehiclesError: null });
        try {
          const response = await apiService.post<Vehicle>('/transport/vehicles/', data);
          set({ vehiclesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            vehiclesError: error.response?.data?.message || 'Failed to create vehicle',
            vehiclesLoading: false 
          });
          throw error;
        }
      },

      updateVehicle: async (id: number, data: Partial<Vehicle>) => {
        set({ vehiclesLoading: true, vehiclesError: null });
        try {
          const response = await apiService.patch<Vehicle>(`/transport/vehicles/${id}/`, data);
          set({ vehiclesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            vehiclesError: error.response?.data?.message || 'Failed to update vehicle',
            vehiclesLoading: false 
          });
          throw error;
        }
      },

      deleteVehicle: async (id: number) => {
        set({ vehiclesLoading: true, vehiclesError: null });
        try {
          await apiService.delete(`/transport/vehicles/${id}/`);
          set({ vehiclesLoading: false });
        } catch (error: any) {
          set({ 
            vehiclesError: error.response?.data?.message || 'Failed to delete vehicle',
            vehiclesLoading: false 
          });
          throw error;
        }
      },

      // Driver actions
      fetchDrivers: async (params = {}) => {
        set({ driversLoading: true, driversError: null });
        try {
          const response = await apiService.get<Driver[]>('/transport/drivers/', { params });
          set({ drivers: response, driversLoading: false });
        } catch (error: any) {
          set({ 
            driversError: error.response?.data?.message || 'Failed to fetch drivers',
            driversLoading: false 
          });
        }
      },

      fetchDriverById: async (id: number) => {
        set({ driversLoading: true, driversError: null });
        try {
          const response = await apiService.get<Driver>(`/transport/drivers/${id}/`);
          set({ currentDriver: response, driversLoading: false });
        } catch (error: any) {
          set({ 
            driversError: error.response?.data?.message || 'Failed to fetch driver',
            driversLoading: false 
          });
        }
      },

      createDriver: async (data: Partial<Driver>) => {
        set({ driversLoading: true, driversError: null });
        try {
          const response = await apiService.post<Driver>('/transport/drivers/', data);
          set({ driversLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            driversError: error.response?.data?.message || 'Failed to create driver',
            driversLoading: false 
          });
          throw error;
        }
      },

      updateDriver: async (id: number, data: Partial<Driver>) => {
        set({ driversLoading: true, driversError: null });
        try {
          const response = await apiService.patch<Driver>(`/transport/drivers/${id}/`, data);
          set({ driversLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            driversError: error.response?.data?.message || 'Failed to update driver',
            driversLoading: false 
          });
          throw error;
        }
      },

      deleteDriver: async (id: number) => {
        set({ driversLoading: true, driversError: null });
        try {
          await apiService.delete(`/transport/drivers/${id}/`);
          set({ driversLoading: false });
        } catch (error: any) {
          set({ 
            driversError: error.response?.data?.message || 'Failed to delete driver',
            driversLoading: false 
          });
          throw error;
        }
      },

      // Route actions
      fetchRoutes: async (params = {}) => {
        set({ routesLoading: true, routesError: null });
        try {
          const response = await apiService.get<Route[]>('/transport/routes/', { params });
          set({ routes: response, routesLoading: false });
        } catch (error: any) {
          set({ 
            routesError: error.response?.data?.message || 'Failed to fetch routes',
            routesLoading: false 
          });
        }
      },

      fetchRouteById: async (id: number) => {
        set({ routesLoading: true, routesError: null });
        try {
          const response = await apiService.get<Route>(`/transport/routes/${id}/`);
          set({ currentRoute: response, routesLoading: false });
        } catch (error: any) {
          set({ 
            routesError: error.response?.data?.message || 'Failed to fetch route',
            routesLoading: false 
          });
        }
      },

      createRoute: async (data: Partial<Route>) => {
        set({ routesLoading: true, routesError: null });
        try {
          const response = await apiService.post<Route>('/transport/routes/', data);
          set({ routesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            routesError: error.response?.data?.message || 'Failed to create route',
            routesLoading: false 
          });
          throw error;
        }
      },

      updateRoute: async (id: number, data: Partial<Route>) => {
        set({ routesLoading: true, routesError: null });
        try {
          const response = await apiService.patch<Route>(`/transport/routes/${id}/`, data);
          set({ routesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            routesError: error.response?.data?.message || 'Failed to update route',
            routesLoading: false 
          });
          throw error;
        }
      },

      deleteRoute: async (id: number) => {
        set({ routesLoading: true, routesError: null });
        try {
          await apiService.delete(`/transport/routes/${id}/`);
          set({ routesLoading: false });
        } catch (error: any) {
          set({ 
            routesError: error.response?.data?.message || 'Failed to delete route',
            routesLoading: false 
          });
          throw error;
        }
      },

      // Schedule actions
      fetchSchedules: async (params = {}) => {
        set({ schedulesLoading: true, schedulesError: null });
        try {
          const response = await apiService.get<Schedule[]>('/transport/schedules/', { params });
          set({ schedules: response, schedulesLoading: false });
        } catch (error: any) {
          set({ 
            schedulesError: error.response?.data?.message || 'Failed to fetch schedules',
            schedulesLoading: false 
          });
        }
      },

      fetchScheduleById: async (id: number) => {
        set({ schedulesLoading: true, schedulesError: null });
        try {
          const response = await apiService.get<Schedule>(`/transport/schedules/${id}/`);
          set({ currentSchedule: response, schedulesLoading: false });
        } catch (error: any) {
          set({ 
            schedulesError: error.response?.data?.message || 'Failed to fetch schedule',
            schedulesLoading: false 
          });
        }
      },

      createSchedule: async (data: Partial<Schedule>) => {
        set({ schedulesLoading: true, schedulesError: null });
        try {
          const response = await apiService.post<Schedule>('/transport/schedules/', data);
          set({ schedulesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            schedulesError: error.response?.data?.message || 'Failed to create schedule',
            schedulesLoading: false 
          });
          throw error;
        }
      },

      updateSchedule: async (id: number, data: Partial<Schedule>) => {
        set({ schedulesLoading: true, schedulesError: null });
        try {
          const response = await apiService.patch<Schedule>(`/transport/schedules/${id}/`, data);
          set({ schedulesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            schedulesError: error.response?.data?.message || 'Failed to update schedule',
            schedulesLoading: false 
          });
          throw error;
        }
      },

      deleteSchedule: async (id: number) => {
        set({ schedulesLoading: true, schedulesError: null });
        try {
          await apiService.delete(`/transport/schedules/${id}/`);
          set({ schedulesLoading: false });
        } catch (error: any) {
          set({ 
            schedulesError: error.response?.data?.message || 'Failed to delete schedule',
            schedulesLoading: false 
          });
          throw error;
        }
      },

      // Trip actions
      fetchTrips: async (params = {}) => {
        set({ tripsLoading: true, tripsError: null });
        try {
          const response = await apiService.get<Trip[]>('/transport/trips/', { params });
          set({ trips: response, tripsLoading: false });
        } catch (error: any) {
          set({ 
            tripsError: error.response?.data?.message || 'Failed to fetch trips',
            tripsLoading: false 
          });
        }
      },

      fetchTripById: async (id: number) => {
        set({ tripsLoading: true, tripsError: null });
        try {
          const response = await apiService.get<Trip>(`/transport/trips/${id}/`);
          set({ currentTrip: response, tripsLoading: false });
        } catch (error: any) {
          set({ 
            tripsError: error.response?.data?.message || 'Failed to fetch trip',
            tripsLoading: false 
          });
        }
      },

      createTrip: async (data: Partial<Trip>) => {
        set({ tripsLoading: true, tripsError: null });
        try {
          const response = await apiService.post<Trip>('/transport/trips/', data);
          set({ tripsLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            tripsError: error.response?.data?.message || 'Failed to create trip',
            tripsLoading: false 
          });
          throw error;
        }
      },

      updateTrip: async (id: number, data: Partial<Trip>) => {
        set({ tripsLoading: true, tripsError: null });
        try {
          const response = await apiService.patch<Trip>(`/transport/trips/${id}/`, data);
          set({ tripsLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            tripsError: error.response?.data?.message || 'Failed to update trip',
            tripsLoading: false 
          });
          throw error;
        }
      },

      deleteTrip: async (id: number) => {
        set({ tripsLoading: true, tripsError: null });
        try {
          await apiService.delete(`/transport/trips/${id}/`);
          set({ tripsLoading: false });
        } catch (error: any) {
          set({ 
            tripsError: error.response?.data?.message || 'Failed to delete trip',
            tripsLoading: false 
          });
          throw error;
        }
      },

      startTrip: async (id: number) => {
        set({ tripsLoading: true, tripsError: null });
        try {
          await apiService.post(`/transport/trips/${id}/start/`);
          set({ tripsLoading: false });
        } catch (error: any) {
          set({ 
            tripsError: error.response?.data?.message || 'Failed to start trip',
            tripsLoading: false 
          });
          throw error;
        }
      },

      endTrip: async (id: number) => {
        set({ tripsLoading: true, tripsError: null });
        try {
          await apiService.post(`/transport/trips/${id}/end/`);
          set({ tripsLoading: false });
        } catch (error: any) {
          set({ 
            tripsError: error.response?.data?.message || 'Failed to end trip',
            tripsLoading: false 
          });
          throw error;
        }
      },

      // Maintenance actions
      fetchMaintenance: async (params = {}) => {
        set({ maintenanceLoading: true, maintenanceError: null });
        try {
          const response = await apiService.get<Maintenance[]>('/transport/maintenance/', { params });
          set({ maintenance: response, maintenanceLoading: false });
        } catch (error: any) {
          set({ 
            maintenanceError: error.response?.data?.message || 'Failed to fetch maintenance',
            maintenanceLoading: false 
          });
        }
      },

      fetchMaintenanceById: async (id: number) => {
        set({ maintenanceLoading: true, maintenanceError: null });
        try {
          const response = await apiService.get<Maintenance>(`/transport/maintenance/${id}/`);
          set({ currentMaintenance: response, maintenanceLoading: false });
        } catch (error: any) {
          set({ 
            maintenanceError: error.response?.data?.message || 'Failed to fetch maintenance',
            maintenanceLoading: false 
          });
        }
      },

      createMaintenance: async (data: Partial<Maintenance>) => {
        set({ maintenanceLoading: true, maintenanceError: null });
        try {
          const response = await apiService.post<Maintenance>('/transport/maintenance/', data);
          set({ maintenanceLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            maintenanceError: error.response?.data?.message || 'Failed to create maintenance',
            maintenanceLoading: false 
          });
          throw error;
        }
      },

      updateMaintenance: async (id: number, data: Partial<Maintenance>) => {
        set({ maintenanceLoading: true, maintenanceError: null });
        try {
          const response = await apiService.patch<Maintenance>(`/transport/maintenance/${id}/`, data);
          set({ maintenanceLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            maintenanceError: error.response?.data?.message || 'Failed to update maintenance',
            maintenanceLoading: false 
          });
          throw error;
        }
      },

      deleteMaintenance: async (id: number) => {
        set({ maintenanceLoading: true, maintenanceError: null });
        try {
          await apiService.delete(`/transport/maintenance/${id}/`);
          set({ maintenanceLoading: false });
        } catch (error: any) {
          set({ 
            maintenanceError: error.response?.data?.message || 'Failed to delete maintenance',
            maintenanceLoading: false 
          });
          throw error;
        }
      },

      // Utility actions
      clearErrors: () => {
        set({
          vehiclesError: null,
          driversError: null,
          routesError: null,
          schedulesError: null,
          tripsError: null,
          maintenanceError: null,
        });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'transport-store',
    }
  )
);

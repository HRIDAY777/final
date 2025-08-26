import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../services/api';

export interface Event {
  id: number;
  title: string;
  description: string;
  category: EventCategory;
  venue: EventVenue;
  organizer: EventOrganizer;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  registered_count: number;
  price: number;
  status: string;
  image: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventVenue {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  capacity: number;
  facilities: string[];
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventOrganizer {
  id: number;
  name: string;
  description: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  logo: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: number;
  event: Event;
  student: any;
  registration_date: string;
  status: string;
  payment_status: string;
  amount_paid: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface EventSchedule {
  id: number;
  event: Event;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  speaker: string;
  room: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventSponsor {
  id: number;
  event: Event;
  name: string;
  logo: string;
  website: string;
  sponsorship_level: string;
  amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EventsState {
  // Events
  events: any;
  currentEvent: Event | null;
  eventsLoading: boolean;
  eventsError: string | null;

  // Categories
  categories: any;
  currentCategory: EventCategory | null;
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Venues
  venues: any;
  currentVenue: EventVenue | null;
  venuesLoading: boolean;
  venuesError: string | null;

  // Organizers
  organizers: any;
  currentOrganizer: EventOrganizer | null;
  organizersLoading: boolean;
  organizersError: string | null;

  // Registrations
  registrations: any;
  currentRegistration: EventRegistration | null;
  registrationsLoading: boolean;
  registrationsError: string | null;

  // Schedules
  schedules: any;
  currentSchedule: EventSchedule | null;
  schedulesLoading: boolean;
  schedulesError: string | null;

  // Sponsors
  sponsors: any;
  currentSponsor: EventSponsor | null;
  sponsorsLoading: boolean;
  sponsorsError: string | null;
}

interface EventsActions {
  // Event actions
  fetchEvents: (params?: any) => Promise<void>;
  fetchEventById: (id: number) => Promise<void>;
  createEvent: (data: Partial<Event>) => Promise<Event>;
  updateEvent: (id: number, data: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: number) => Promise<void>;

  // Category actions
  fetchCategories: (params?: any) => Promise<void>;
  fetchCategoryById: (id: number) => Promise<void>;
  createCategory: (data: Partial<EventCategory>) => Promise<EventCategory>;
  updateCategory: (id: number, data: Partial<EventCategory>) => Promise<EventCategory>;
  deleteCategory: (id: number) => Promise<void>;

  // Venue actions
  fetchVenues: (params?: any) => Promise<void>;
  fetchVenueById: (id: number) => Promise<void>;
  createVenue: (data: Partial<EventVenue>) => Promise<EventVenue>;
  updateVenue: (id: number, data: Partial<EventVenue>) => Promise<EventVenue>;
  deleteVenue: (id: number) => Promise<void>;

  // Organizer actions
  fetchOrganizers: (params?: any) => Promise<void>;
  fetchOrganizerById: (id: number) => Promise<void>;
  createOrganizer: (data: Partial<EventOrganizer>) => Promise<EventOrganizer>;
  updateOrganizer: (id: number, data: Partial<EventOrganizer>) => Promise<EventOrganizer>;
  deleteOrganizer: (id: number) => Promise<void>;

  // Registration actions
  fetchRegistrations: (params?: any) => Promise<void>;
  fetchRegistrationById: (id: number) => Promise<void>;
  createRegistration: (data: Partial<EventRegistration>) => Promise<EventRegistration>;
  updateRegistration: (id: number, data: Partial<EventRegistration>) => Promise<EventRegistration>;
  deleteRegistration: (id: number) => Promise<void>;
  approveRegistration: (id: number) => Promise<void>;
  rejectRegistration: (id: number, reason: string) => Promise<void>;

  // Schedule actions
  fetchSchedules: (params?: any) => Promise<void>;
  fetchScheduleById: (id: number) => Promise<void>;
  createSchedule: (data: Partial<EventSchedule>) => Promise<EventSchedule>;
  updateSchedule: (id: number, data: Partial<EventSchedule>) => Promise<EventSchedule>;
  deleteSchedule: (id: number) => Promise<void>;

  // Sponsor actions
  fetchSponsors: (params?: any) => Promise<void>;
  fetchSponsorById: (id: number) => Promise<void>;
  createSponsor: (data: Partial<EventSponsor>) => Promise<EventSponsor>;
  updateSponsor: (id: number, data: Partial<EventSponsor>) => Promise<EventSponsor>;
  deleteSponsor: (id: number) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: EventsState = {
  events: null,
  currentEvent: null,
  eventsLoading: false,
  eventsError: null,

  categories: null,
  currentCategory: null,
  categoriesLoading: false,
  categoriesError: null,

  venues: null,
  currentVenue: null,
  venuesLoading: false,
  venuesError: null,

  organizers: null,
  currentOrganizer: null,
  organizersLoading: false,
  organizersError: null,

  registrations: null,
  currentRegistration: null,
  registrationsLoading: false,
  registrationsError: null,

  schedules: null,
  currentSchedule: null,
  schedulesLoading: false,
  schedulesError: null,

  sponsors: null,
  currentSponsor: null,
  sponsorsLoading: false,
  sponsorsError: null,
};

export const useEventsStore = create<EventsState & EventsActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Event actions
      fetchEvents: async (params = {}) => {
        set({ eventsLoading: true, eventsError: null });
        try {
          const response = await api.get('/events/events/', { params });
          set({ events: response.data, eventsLoading: false });
        } catch (error: any) {
          set({ 
            eventsError: error.response?.data?.message || 'Failed to fetch events',
            eventsLoading: false 
          });
        }
      },

      fetchEventById: async (id: number) => {
        set({ eventsLoading: true, eventsError: null });
        try {
          const response = await api.get(`/events/events/${id}/`);
          set({ currentEvent: response.data, eventsLoading: false });
        } catch (error: any) {
          set({ 
            eventsError: error.response?.data?.message || 'Failed to fetch event',
            eventsLoading: false 
          });
        }
      },

      createEvent: async (data: Partial<Event>) => {
        set({ eventsLoading: true, eventsError: null });
        try {
          const response = await api.post('/events/events/', data);
          set({ eventsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            eventsError: error.response?.data?.message || 'Failed to create event',
            eventsLoading: false 
          });
          throw error;
        }
      },

      updateEvent: async (id: number, data: Partial<Event>) => {
        set({ eventsLoading: true, eventsError: null });
        try {
          const response = await api.put(`/events/events/${id}/`, data);
          set({ eventsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            eventsError: error.response?.data?.message || 'Failed to update event',
            eventsLoading: false 
          });
          throw error;
        }
      },

      deleteEvent: async (id: number) => {
        set({ eventsLoading: true, eventsError: null });
        try {
          await api.delete(`/events/events/${id}/`);
          set({ eventsLoading: false });
        } catch (error: any) {
          set({ 
            eventsError: error.response?.data?.message || 'Failed to delete event',
            eventsLoading: false 
          });
          throw error;
        }
      },

      // Category actions
      fetchCategories: async (params = {}) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.get('/events/categories/', { params });
          set({ categories: response.data, categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to fetch categories',
            categoriesLoading: false 
          });
        }
      },

      fetchCategoryById: async (id: number) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.get(`/events/categories/${id}/`);
          set({ currentCategory: response.data, categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to fetch category',
            categoriesLoading: false 
          });
        }
      },

      createCategory: async (data: Partial<EventCategory>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.post('/events/categories/', data);
          set({ categoriesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to create category',
            categoriesLoading: false 
          });
          throw error;
        }
      },

      updateCategory: async (id: number, data: Partial<EventCategory>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.put(`/events/categories/${id}/`, data);
          set({ categoriesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to update category',
            categoriesLoading: false 
          });
          throw error;
        }
      },

      deleteCategory: async (id: number) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          await api.delete(`/events/categories/${id}/`);
          set({ categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to delete category',
            categoriesLoading: false 
          });
          throw error;
        }
      },

      // Venue actions
      fetchVenues: async (params = {}) => {
        set({ venuesLoading: true, venuesError: null });
        try {
          const response = await api.get('/events/venues/', { params });
          set({ venues: response.data, venuesLoading: false });
        } catch (error: any) {
          set({ 
            venuesError: error.response?.data?.message || 'Failed to fetch venues',
            venuesLoading: false 
          });
        }
      },

      fetchVenueById: async (id: number) => {
        set({ venuesLoading: true, venuesError: null });
        try {
          const response = await api.get(`/events/venues/${id}/`);
          set({ currentVenue: response.data, venuesLoading: false });
        } catch (error: any) {
          set({ 
            venuesError: error.response?.data?.message || 'Failed to fetch venue',
            venuesLoading: false 
          });
        }
      },

      createVenue: async (data: Partial<EventVenue>) => {
        set({ venuesLoading: true, venuesError: null });
        try {
          const response = await api.post('/events/venues/', data);
          set({ venuesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            venuesError: error.response?.data?.message || 'Failed to create venue',
            venuesLoading: false 
          });
          throw error;
        }
      },

      updateVenue: async (id: number, data: Partial<EventVenue>) => {
        set({ venuesLoading: true, venuesError: null });
        try {
          const response = await api.put(`/events/venues/${id}/`, data);
          set({ venuesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            venuesError: error.response?.data?.message || 'Failed to update venue',
            venuesLoading: false 
          });
          throw error;
        }
      },

      deleteVenue: async (id: number) => {
        set({ venuesLoading: true, venuesError: null });
        try {
          await api.delete(`/events/venues/${id}/`);
          set({ venuesLoading: false });
        } catch (error: any) {
          set({ 
            venuesError: error.response?.data?.message || 'Failed to delete venue',
            venuesLoading: false 
          });
          throw error;
        }
      },

      // Organizer actions
      fetchOrganizers: async (params = {}) => {
        set({ organizersLoading: true, organizersError: null });
        try {
          const response = await api.get('/events/organizers/', { params });
          set({ organizers: response.data, organizersLoading: false });
        } catch (error: any) {
          set({ 
            organizersError: error.response?.data?.message || 'Failed to fetch organizers',
            organizersLoading: false 
          });
        }
      },

      fetchOrganizerById: async (id: number) => {
        set({ organizersLoading: true, organizersError: null });
        try {
          const response = await api.get(`/events/organizers/${id}/`);
          set({ currentOrganizer: response.data, organizersLoading: false });
        } catch (error: any) {
          set({ 
            organizersError: error.response?.data?.message || 'Failed to fetch organizer',
            organizersLoading: false 
          });
        }
      },

      createOrganizer: async (data: Partial<EventOrganizer>) => {
        set({ organizersLoading: true, organizersError: null });
        try {
          const response = await api.post('/events/organizers/', data);
          set({ organizersLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            organizersError: error.response?.data?.message || 'Failed to create organizer',
            organizersLoading: false 
          });
          throw error;
        }
      },

      updateOrganizer: async (id: number, data: Partial<EventOrganizer>) => {
        set({ organizersLoading: true, organizersError: null });
        try {
          const response = await api.put(`/events/organizers/${id}/`, data);
          set({ organizersLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            organizersError: error.response?.data?.message || 'Failed to update organizer',
            organizersLoading: false 
          });
          throw error;
        }
      },

      deleteOrganizer: async (id: number) => {
        set({ organizersLoading: true, organizersError: null });
        try {
          await api.delete(`/events/organizers/${id}/`);
          set({ organizersLoading: false });
        } catch (error: any) {
          set({ 
            organizersError: error.response?.data?.message || 'Failed to delete organizer',
            organizersLoading: false 
          });
          throw error;
        }
      },

      // Registration actions
      fetchRegistrations: async (params = {}) => {
        set({ registrationsLoading: true, registrationsError: null });
        try {
          const response = await api.get('/events/registrations/', { params });
          set({ registrations: response.data, registrationsLoading: false });
        } catch (error: any) {
          set({ 
            registrationsError: error.response?.data?.message || 'Failed to fetch registrations',
            registrationsLoading: false 
          });
        }
      },

      fetchRegistrationById: async (id: number) => {
        set({ registrationsLoading: true, registrationsError: null });
        try {
          const response = await api.get(`/events/registrations/${id}/`);
          set({ currentRegistration: response.data, registrationsLoading: false });
        } catch (error: any) {
          set({ 
            registrationsError: error.response?.data?.message || 'Failed to fetch registration',
            registrationsLoading: false 
          });
        }
      },

      createRegistration: async (data: Partial<EventRegistration>) => {
        set({ registrationsLoading: true, registrationsError: null });
        try {
          const response = await api.post('/events/registrations/', data);
          set({ registrationsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            registrationsError: error.response?.data?.message || 'Failed to create registration',
            registrationsLoading: false 
          });
          throw error;
        }
      },

      updateRegistration: async (id: number, data: Partial<EventRegistration>) => {
        set({ registrationsLoading: true, registrationsError: null });
        try {
          const response = await api.put(`/events/registrations/${id}/`, data);
          set({ registrationsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            registrationsError: error.response?.data?.message || 'Failed to update registration',
            registrationsLoading: false 
          });
          throw error;
        }
      },

      deleteRegistration: async (id: number) => {
        set({ registrationsLoading: true, registrationsError: null });
        try {
          await api.delete(`/events/registrations/${id}/`);
          set({ registrationsLoading: false });
        } catch (error: any) {
          set({ 
            registrationsError: error.response?.data?.message || 'Failed to delete registration',
            registrationsLoading: false 
          });
          throw error;
        }
      },

      approveRegistration: async (id: number) => {
        set({ registrationsLoading: true, registrationsError: null });
        try {
          await api.post(`/events/registrations/${id}/approve/`);
          set({ registrationsLoading: false });
        } catch (error: any) {
          set({ 
            registrationsError: error.response?.data?.message || 'Failed to approve registration',
            registrationsLoading: false 
          });
          throw error;
        }
      },

      rejectRegistration: async (id: number, reason: string) => {
        set({ registrationsLoading: true, registrationsError: null });
        try {
          await api.post(`/events/registrations/${id}/reject/`, { reason });
          set({ registrationsLoading: false });
        } catch (error: any) {
          set({ 
            registrationsError: error.response?.data?.message || 'Failed to reject registration',
            registrationsLoading: false 
          });
          throw error;
        }
      },

      // Schedule actions
      fetchSchedules: async (params = {}) => {
        set({ schedulesLoading: true, schedulesError: null });
        try {
          const response = await api.get('/events/schedules/', { params });
          set({ schedules: response.data, schedulesLoading: false });
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
          const response = await api.get(`/events/schedules/${id}/`);
          set({ currentSchedule: response.data, schedulesLoading: false });
        } catch (error: any) {
          set({ 
            schedulesError: error.response?.data?.message || 'Failed to fetch schedule',
            schedulesLoading: false 
          });
        }
      },

      createSchedule: async (data: Partial<EventSchedule>) => {
        set({ schedulesLoading: true, schedulesError: null });
        try {
          const response = await api.post('/events/schedules/', data);
          set({ schedulesLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            schedulesError: error.response?.data?.message || 'Failed to create schedule',
            schedulesLoading: false 
          });
          throw error;
        }
      },

      updateSchedule: async (id: number, data: Partial<EventSchedule>) => {
        set({ schedulesLoading: true, schedulesError: null });
        try {
          const response = await api.put(`/events/schedules/${id}/`, data);
          set({ schedulesLoading: false });
          return response.data;
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
          await api.delete(`/events/schedules/${id}/`);
          set({ schedulesLoading: false });
        } catch (error: any) {
          set({ 
            schedulesError: error.response?.data?.message || 'Failed to delete schedule',
            schedulesLoading: false 
          });
          throw error;
        }
      },

      // Sponsor actions
      fetchSponsors: async (params = {}) => {
        set({ sponsorsLoading: true, sponsorsError: null });
        try {
          const response = await api.get('/events/sponsors/', { params });
          set({ sponsors: response.data, sponsorsLoading: false });
        } catch (error: any) {
          set({ 
            sponsorsError: error.response?.data?.message || 'Failed to fetch sponsors',
            sponsorsLoading: false 
          });
        }
      },

      fetchSponsorById: async (id: number) => {
        set({ sponsorsLoading: true, sponsorsError: null });
        try {
          const response = await api.get(`/events/sponsors/${id}/`);
          set({ currentSponsor: response.data, sponsorsLoading: false });
        } catch (error: any) {
          set({ 
            sponsorsError: error.response?.data?.message || 'Failed to fetch sponsor',
            sponsorsLoading: false 
          });
        }
      },

      createSponsor: async (data: Partial<EventSponsor>) => {
        set({ sponsorsLoading: true, sponsorsError: null });
        try {
          const response = await api.post('/events/sponsors/', data);
          set({ sponsorsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            sponsorsError: error.response?.data?.message || 'Failed to create sponsor',
            sponsorsLoading: false 
          });
          throw error;
        }
      },

      updateSponsor: async (id: number, data: Partial<EventSponsor>) => {
        set({ sponsorsLoading: true, sponsorsError: null });
        try {
          const response = await api.put(`/events/sponsors/${id}/`, data);
          set({ sponsorsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            sponsorsError: error.response?.data?.message || 'Failed to update sponsor',
            sponsorsLoading: false 
          });
          throw error;
        }
      },

      deleteSponsor: async (id: number) => {
        set({ sponsorsLoading: true, sponsorsError: null });
        try {
          await api.delete(`/events/sponsors/${id}/`);
          set({ sponsorsLoading: false });
        } catch (error: any) {
          set({ 
            sponsorsError: error.response?.data?.message || 'Failed to delete sponsor',
            sponsorsLoading: false 
          });
          throw error;
        }
      },

      // Utility actions
      clearErrors: () => {
        set({
          eventsError: null,
          categoriesError: null,
          venuesError: null,
          organizersError: null,
          registrationsError: null,
          schedulesError: null,
          sponsorsError: null,
        });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'events-store',
    }
  )
);

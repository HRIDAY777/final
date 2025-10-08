import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiService } from '../services/api';

export interface Notice {
  id: number;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: string;
  target_audience: string[];
  publish_date: string;
  expiry_date: string;
  is_published: boolean;
  is_featured: boolean;
  attachments: NoticeAttachment[];
  recipients: NoticeRecipient[];
  created_by: any;
  created_at: string;
  updated_at: string;
}

export interface NoticeCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoticeAttachment {
  id: number;
  notice: Notice;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface NoticeRecipient {
  id: number;
  notice: Notice;
  recipient_type: string;
  recipient_id: number;
  is_read: boolean;
  read_at: string;
  created_at: string;
  updated_at: string;
}

export interface NoticeTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoticeSettings {
  id: number;
  default_category: NoticeCategory;
  auto_publish: boolean;
  require_approval: boolean;
  max_attachments: number;
  max_file_size: number;
  allowed_file_types: string[];
  notification_enabled: boolean;
  email_notification: boolean;
  sms_notification: boolean;
  created_at: string;
  updated_at: string;
}

interface NoticesState {
  // Notices
  notices: Notice[] | null;
  currentNotice: Notice | null;
  noticesLoading: boolean;
  noticesError: string | null;

  // Categories
  categories: NoticeCategory[] | null;
  currentCategory: NoticeCategory | null;
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Attachments
  attachments: NoticeAttachment[] | null;
  currentAttachment: NoticeAttachment | null;
  attachmentsLoading: boolean;
  attachmentsError: string | null;

  // Recipients
  recipients: NoticeRecipient[] | null;
  currentRecipient: NoticeRecipient | null;
  recipientsLoading: boolean;
  recipientsError: string | null;

  // Templates
  templates: NoticeTemplate[] | null;
  currentTemplate: NoticeTemplate | null;
  templatesLoading: boolean;
  templatesError: string | null;

  // Settings
  settings: NoticeSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;
}

interface NoticesActions {
  // Notice actions
  // eslint-disable-next-line no-unused-vars
  fetchNotices: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchNoticeById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createNotice: (data: Partial<Notice>) => Promise<Notice>;
  // eslint-disable-next-line no-unused-vars
  updateNotice: (id: number, data: Partial<Notice>) => Promise<Notice>;
  // eslint-disable-next-line no-unused-vars
  deleteNotice: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  publishNotice: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  unpublishNotice: (id: number) => Promise<void>;

  // Category actions
  // eslint-disable-next-line no-unused-vars
  fetchCategories: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchCategoryById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createCategory: (data: Partial<NoticeCategory>) => Promise<NoticeCategory>;
  // eslint-disable-next-line no-unused-vars
  updateCategory: (id: number, data: Partial<NoticeCategory>) => Promise<NoticeCategory>;
  // eslint-disable-next-line no-unused-vars
  deleteCategory: (id: number) => Promise<void>;

  // Attachment actions
  // eslint-disable-next-line no-unused-vars
  fetchAttachments: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchAttachmentById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createAttachment: (data: Partial<NoticeAttachment>) => Promise<NoticeAttachment>;
  // eslint-disable-next-line no-unused-vars
  updateAttachment: (id: number, data: Partial<NoticeAttachment>) => Promise<NoticeAttachment>;
  // eslint-disable-next-line no-unused-vars
  deleteAttachment: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  uploadAttachment: (noticeId: number, file: File) => Promise<NoticeAttachment>;

  // Recipient actions
  // eslint-disable-next-line no-unused-vars
  fetchRecipients: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchRecipientById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createRecipient: (data: Partial<NoticeRecipient>) => Promise<NoticeRecipient>;
  // eslint-disable-next-line no-unused-vars
  updateRecipient: (id: number, data: Partial<NoticeRecipient>) => Promise<NoticeRecipient>;
  // eslint-disable-next-line no-unused-vars
  deleteRecipient: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  markAsRead: (id: number) => Promise<void>;

  // Template actions
  // eslint-disable-next-line no-unused-vars
  fetchTemplates: (params?: any) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  fetchTemplateById: (id: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createTemplate: (data: Partial<NoticeTemplate>) => Promise<NoticeTemplate>;
  // eslint-disable-next-line no-unused-vars
  updateTemplate: (id: number, data: Partial<NoticeTemplate>) => Promise<NoticeTemplate>;
  // eslint-disable-next-line no-unused-vars
  deleteTemplate: (id: number) => Promise<void>;

  // Settings actions
  // eslint-disable-next-line no-unused-vars
  fetchSettings: () => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  updateSettings: (data: Partial<NoticeSettings>) => Promise<NoticeSettings>;

  // Utility actions
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: NoticesState = {
  notices: null,
  currentNotice: null,
  noticesLoading: false,
  noticesError: null,

  categories: null,
  currentCategory: null,
  categoriesLoading: false,
  categoriesError: null,

  attachments: null,
  currentAttachment: null,
  attachmentsLoading: false,
  attachmentsError: null,

  recipients: null,
  currentRecipient: null,
  recipientsLoading: false,
  recipientsError: null,

  templates: null,
  currentTemplate: null,
  templatesLoading: false,
  templatesError: null,

  settings: null,
  settingsLoading: false,
  settingsError: null,
};

export const useNoticesStore = create<NoticesState & NoticesActions>()(
  devtools(
    // eslint-disable-next-line no-unused-vars
    (set, get) => ({
      ...initialState,

      // Notice actions
      fetchNotices: async (params = {}) => {
        set({ noticesLoading: true, noticesError: null });
        try {
          const response = await apiService.get<Notice[]>('/notices/notices/', { params });
          set({ notices: response, noticesLoading: false });
        } catch (error: any) {
          set({ 
            noticesError: error.response?.data?.message || 'Failed to fetch notices',
            noticesLoading: false 
          });
        }
      },

      fetchNoticeById: async (id: number) => {
        set({ noticesLoading: true, noticesError: null });
        try {
          const response = await apiService.get<Notice>(`/notices/notices/${id}/`);
          set({ currentNotice: response, noticesLoading: false });
        } catch (error: any) {
          set({ 
            noticesError: error.response?.data?.message || 'Failed to fetch notice',
            noticesLoading: false 
          });
        }
      },

      createNotice: async (data: Partial<Notice>) => {
        set({ noticesLoading: true, noticesError: null });
        try {
          const response = await apiService.post<Notice>('/notices/notices/', data);
          set({ noticesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            noticesError: error.response?.data?.message || 'Failed to create notice',
            noticesLoading: false 
          });
          throw error;
        }
      },

      updateNotice: async (id: number, data: Partial<Notice>) => {
        set({ noticesLoading: true, noticesError: null });
        try {
          const response = await apiService.put<Notice>(`/notices/notices/${id}/`, data);
          set({ noticesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            noticesError: error.response?.data?.message || 'Failed to update notice',
            noticesLoading: false 
          });
          throw error;
        }
      },

      deleteNotice: async (id: number) => {
        set({ noticesLoading: true, noticesError: null });
        try {
          await apiService.delete(`/notices/notices/${id}/`);
          set({ noticesLoading: false });
        } catch (error: any) {
          set({ 
            noticesError: error.response?.data?.message || 'Failed to delete notice',
            noticesLoading: false 
          });
          throw error;
        }
      },

      publishNotice: async (id: number) => {
        set({ noticesLoading: true, noticesError: null });
        try {
          await apiService.post(`/notices/notices/${id}/publish/`);
          set({ noticesLoading: false });
        } catch (error: any) {
          set({ 
            noticesError: error.response?.data?.message || 'Failed to publish notice',
            noticesLoading: false 
          });
          throw error;
        }
      },

      unpublishNotice: async (id: number) => {
        set({ noticesLoading: true, noticesError: null });
        try {
          await apiService.post(`/notices/notices/${id}/unpublish/`);
          set({ noticesLoading: false });
        } catch (error: any) {
          set({ 
            noticesError: error.response?.data?.message || 'Failed to unpublish notice',
            noticesLoading: false 
          });
          throw error;
        }
      },

      // Category actions
      fetchCategories: async (params = {}) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await apiService.get<NoticeCategory[]>('/notices/categories/', { params });
          set({ categories: response, categoriesLoading: false });
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
          const response = await apiService.get<NoticeCategory>(`/notices/categories/${id}/`);
          set({ currentCategory: response, categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to fetch category',
            categoriesLoading: false 
          });
        }
      },

      createCategory: async (data: Partial<NoticeCategory>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await apiService.post<NoticeCategory>('/notices/categories/', data);
          set({ categoriesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to create category',
            categoriesLoading: false 
          });
          throw error;
        }
      },

      updateCategory: async (id: number, data: Partial<NoticeCategory>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await apiService.put<NoticeCategory>(`/notices/categories/${id}/`, data);
          set({ categoriesLoading: false });
          return response;
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
          await apiService.delete(`/notices/categories/${id}/`);
          set({ categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to delete category',
            categoriesLoading: false 
          });
          throw error;
        }
      },

      // Attachment actions
      fetchAttachments: async (params = {}) => {
        set({ attachmentsLoading: true, attachmentsError: null });
        try {
          const response = await apiService.get<NoticeAttachment[]>('/notices/attachments/', { params });
          set({ attachments: response, attachmentsLoading: false });
        } catch (error: any) {
          set({ 
            attachmentsError: error.response?.data?.message || 'Failed to fetch attachments',
            attachmentsLoading: false 
          });
        }
      },

      fetchAttachmentById: async (id: number) => {
        set({ attachmentsLoading: true, attachmentsError: null });
        try {
          const response = await apiService.get<NoticeAttachment>(`/notices/attachments/${id}/`);
          set({ currentAttachment: response, attachmentsLoading: false });
        } catch (error: any) {
          set({ 
            attachmentsError: error.response?.data?.message || 'Failed to fetch attachment',
            attachmentsLoading: false 
          });
        }
      },

      createAttachment: async (data: Partial<NoticeAttachment>) => {
        set({ attachmentsLoading: true, attachmentsError: null });
        try {
          const response = await apiService.post<NoticeAttachment>('/notices/attachments/', data);
          set({ attachmentsLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            attachmentsError: error.response?.data?.message || 'Failed to create attachment',
            attachmentsLoading: false 
          });
          throw error;
        }
      },

      updateAttachment: async (id: number, data: Partial<NoticeAttachment>) => {
        set({ attachmentsLoading: true, attachmentsError: null });
        try {
          const response = await apiService.put<NoticeAttachment>(`/notices/attachments/${id}/`, data);
          set({ attachmentsLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            attachmentsError: error.response?.data?.message || 'Failed to update attachment',
            attachmentsLoading: false 
          });
          throw error;
        }
      },

      deleteAttachment: async (id: number) => {
        set({ attachmentsLoading: true, attachmentsError: null });
        try {
          await apiService.delete(`/notices/attachments/${id}/`);
          set({ attachmentsLoading: false });
        } catch (error: any) {
          set({ 
            attachmentsError: error.response?.data?.message || 'Failed to delete attachment',
            attachmentsLoading: false 
          });
          throw error;
        }
      },

      uploadAttachment: async (noticeId: number, file: File) => {
        set({ attachmentsLoading: true, attachmentsError: null });
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('notice', noticeId.toString());
          
          const response = await apiService.upload<NoticeAttachment>('/notices/attachments/upload/', file);
          set({ attachmentsLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            attachmentsError: error.response?.data?.message || 'Failed to upload attachment',
            attachmentsLoading: false 
          });
          throw error;
        }
      },

      // Recipient actions
      fetchRecipients: async (params = {}) => {
        set({ recipientsLoading: true, recipientsError: null });
        try {
          const response = await apiService.get<NoticeRecipient[]>('/notices/recipients/', { params });
          set({ recipients: response, recipientsLoading: false });
        } catch (error: any) {
          set({ 
            recipientsError: error.response?.data?.message || 'Failed to fetch recipients',
            recipientsLoading: false 
          });
        }
      },

      fetchRecipientById: async (id: number) => {
        set({ recipientsLoading: true, recipientsError: null });
        try {
          const response = await apiService.get<NoticeRecipient>(`/notices/recipients/${id}/`);
          set({ currentRecipient: response, recipientsLoading: false });
        } catch (error: any) {
          set({ 
            recipientsError: error.response?.data?.message || 'Failed to fetch recipient',
            recipientsLoading: false 
          });
        }
      },

      createRecipient: async (data: Partial<NoticeRecipient>) => {
        set({ recipientsLoading: true, recipientsError: null });
        try {
          const response = await apiService.post<NoticeRecipient>('/notices/recipients/', data);
          set({ recipientsLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            recipientsError: error.response?.data?.message || 'Failed to create recipient',
            recipientsLoading: false 
          });
          throw error;
        }
      },

      updateRecipient: async (id: number, data: Partial<NoticeRecipient>) => {
        set({ recipientsLoading: true, recipientsError: null });
        try {
          const response = await apiService.put<NoticeRecipient>(`/notices/recipients/${id}/`, data);
          set({ recipientsLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            recipientsError: error.response?.data?.message || 'Failed to update recipient',
            recipientsLoading: false 
          });
          throw error;
        }
      },

      deleteRecipient: async (id: number) => {
        set({ recipientsLoading: true, recipientsError: null });
        try {
          await apiService.delete(`/notices/recipients/${id}/`);
          set({ recipientsLoading: false });
        } catch (error: any) {
          set({ 
            recipientsError: error.response?.data?.message || 'Failed to delete recipient',
            recipientsLoading: false 
          });
          throw error;
        }
      },

      markAsRead: async (id: number) => {
        set({ recipientsLoading: true, recipientsError: null });
        try {
          await apiService.post(`/notices/recipients/${id}/mark-read/`);
          set({ recipientsLoading: false });
        } catch (error: any) {
          set({ 
            recipientsError: error.response?.data?.message || 'Failed to mark as read',
            recipientsLoading: false 
          });
          throw error;
        }
      },

      // Template actions
      fetchTemplates: async (params = {}) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          const response = await apiService.get<NoticeTemplate[]>('/notices/templates/', { params });
          set({ templates: response, templatesLoading: false });
        } catch (error: any) {
          set({ 
            templatesError: error.response?.data?.message || 'Failed to fetch templates',
            templatesLoading: false 
          });
        }
      },

      fetchTemplateById: async (id: number) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          const response = await apiService.get<NoticeTemplate>(`/notices/templates/${id}/`);
          set({ currentTemplate: response, templatesLoading: false });
        } catch (error: any) {
          set({ 
            templatesError: error.response?.data?.message || 'Failed to fetch template',
            templatesLoading: false 
          });
        }
      },

      createTemplate: async (data: Partial<NoticeTemplate>) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          const response = await apiService.post<NoticeTemplate>('/notices/templates/', data);
          set({ templatesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            templatesError: error.response?.data?.message || 'Failed to create template',
            templatesLoading: false 
          });
          throw error;
        }
      },

      updateTemplate: async (id: number, data: Partial<NoticeTemplate>) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          const response = await apiService.put<NoticeTemplate>(`/notices/templates/${id}/`, data);
          set({ templatesLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            templatesError: error.response?.data?.message || 'Failed to update template',
            templatesLoading: false 
          });
          throw error;
        }
      },

      deleteTemplate: async (id: number) => {
        set({ templatesLoading: true, templatesError: null });
        try {
          await apiService.delete(`/notices/templates/${id}/`);
          set({ templatesLoading: false });
        } catch (error: any) {
          set({ 
            templatesError: error.response?.data?.message || 'Failed to delete template',
            templatesLoading: false 
          });
          throw error;
        }
      },

      // Settings actions
      fetchSettings: async () => {
        set({ settingsLoading: true, settingsError: null });
        try {
          const response = await apiService.get<NoticeSettings>('/notices/settings/');
          set({ settings: response, settingsLoading: false });
        } catch (error: any) {
          set({ 
            settingsError: error.response?.data?.message || 'Failed to fetch settings',
            settingsLoading: false 
          });
        }
      },

      updateSettings: async (data: Partial<NoticeSettings>) => {
        set({ settingsLoading: true, settingsError: null });
        try {
          const response = await apiService.put<NoticeSettings>('/notices/settings/', data);
          set({ settings: response, settingsLoading: false });
          return response;
        } catch (error: any) {
          set({ 
            settingsError: error.response?.data?.message || 'Failed to update settings',
            settingsLoading: false 
          });
          throw error;
        }
      },

      // Utility actions
      clearErrors: () => {
        set({
          noticesError: null,
          categoriesError: null,
          attachmentsError: null,
          recipientsError: null,
          templatesError: null,
          settingsError: null,
        });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'notices-store',
    }
  )
);

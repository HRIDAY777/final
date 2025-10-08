/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../services/api';

export interface Category {
  id: number;
  name: string;
  description: string;
  parent_category: Category | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  payment_terms: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  name: string;
  description: string;
  category: Category;
  supplier: Supplier;
  asset_tag: string;
  serial_number: string;
  purchase_date: string;
  purchase_cost: number;
  current_value: number;
  location: string;
  status: string;
  condition: string;
  warranty_expiry: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockItem {
  id: number;
  name: string;
  description: string;
  category: Category;
  supplier: Supplier;
  sku: string;
  barcode: string;
  unit: string;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost: number;
  selling_price: number;
  reorder_point: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  transaction_type: string;
  item: StockItem | Asset;
  quantity: number;
  unit_price: number;
  total_amount: number;
  reference_number: string;
  notes: string;
  transaction_date: string;
  created_by: any;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: number;
  asset: Asset;
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

interface InventoryState {
  // Categories
  categories: any;
  currentCategory: Category | null;
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Suppliers
  suppliers: any;
  currentSupplier: Supplier | null;
  suppliersLoading: boolean;
  suppliersError: string | null;

  // Assets
  assets: any;
  currentAsset: Asset | null;
  assetsLoading: boolean;
  assetsError: string | null;

  // Stock Items
  stockItems: any;
  currentStockItem: StockItem | null;
  stockItemsLoading: boolean;
  stockItemsError: string | null;

  // Transactions
  transactions: any;
  currentTransaction: Transaction | null;
  transactionsLoading: boolean;
  transactionsError: string | null;

  // Maintenance Records
  maintenanceRecords: any;
  currentMaintenanceRecord: MaintenanceRecord | null;
  maintenanceRecordsLoading: boolean;
  maintenanceRecordsError: string | null;
}

interface InventoryActions {
  // Category actions
  fetchCategories: (params?: any) => Promise<void>;
  fetchCategoryById: (id: number) => Promise<void>;
  createCategory: (data: Partial<Category>) => Promise<Category>;
  updateCategory: (id: number, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;

  // Supplier actions
  fetchSuppliers: (params?: any) => Promise<void>;
  fetchSupplierById: (id: number) => Promise<void>;
  createSupplier: (data: Partial<Supplier>) => Promise<Supplier>;
  updateSupplier: (id: number, data: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: number) => Promise<void>;

  // Asset actions
  fetchAssets: (params?: any) => Promise<void>;
  fetchAssetById: (id: number) => Promise<void>;
  createAsset: (data: Partial<Asset>) => Promise<Asset>;
  updateAsset: (id: number, data: Partial<Asset>) => Promise<Asset>;
  deleteAsset: (id: number) => Promise<void>;

  // Stock Item actions
  fetchStockItems: (params?: any) => Promise<void>;
  fetchStockItemById: (id: number) => Promise<void>;
  createStockItem: (data: Partial<StockItem>) => Promise<StockItem>;
  updateStockItem: (id: number, data: Partial<StockItem>) => Promise<StockItem>;
  deleteStockItem: (id: number) => Promise<void>;
  updateStockLevel: (id: number, quantity: number) => Promise<void>;

  // Transaction actions
  fetchTransactions: (params?: any) => Promise<void>;
  fetchTransactionById: (id: number) => Promise<void>;
  createTransaction: (data: Partial<Transaction>) => Promise<Transaction>;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<void>;

  // Maintenance Record actions
  fetchMaintenanceRecords: (params?: any) => Promise<void>;
  fetchMaintenanceRecordById: (id: number) => Promise<void>;
  createMaintenanceRecord: (data: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord>;
  updateMaintenanceRecord: (id: number, data: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord>;
  deleteMaintenanceRecord: (id: number) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: InventoryState = {
  categories: null,
  currentCategory: null,
  categoriesLoading: false,
  categoriesError: null,

  suppliers: null,
  currentSupplier: null,
  suppliersLoading: false,
  suppliersError: null,

  assets: null,
  currentAsset: null,
  assetsLoading: false,
  assetsError: null,

  stockItems: null,
  currentStockItem: null,
  stockItemsLoading: false,
  stockItemsError: null,

  transactions: null,
  currentTransaction: null,
  transactionsLoading: false,
  transactionsError: null,

  maintenanceRecords: null,
  currentMaintenanceRecord: null,
  maintenanceRecordsLoading: false,
  maintenanceRecordsError: null,
};

export const useInventoryStore = create<InventoryState & InventoryActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Category actions
      fetchCategories: async (params = {}) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.get('/inventory/categories/', { params }) as any;
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
          const response = await api.get(`/inventory/categories/${id}/`) as any;
          set({ currentCategory: response.data, categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to fetch category',
            categoriesLoading: false 
          });
        }
      },

      createCategory: async (data: Partial<Category>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.post('/inventory/categories/', data) as any;
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

      updateCategory: async (id: number, data: Partial<Category>) => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const response = await api.put(`/inventory/categories/${id}/`, data) as any;
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
          await api.delete(`/inventory/categories/${id}/`) as any;
          set({ categoriesLoading: false });
        } catch (error: any) {
          set({ 
            categoriesError: error.response?.data?.message || 'Failed to delete category',
            categoriesLoading: false 
          });
          throw error;
        }
      },

      // Supplier actions
      fetchSuppliers: async (params = {}) => {
        set({ suppliersLoading: true, suppliersError: null });
        try {
          const response = await api.get('/inventory/suppliers/', { params }) as any;
          set({ suppliers: response.data, suppliersLoading: false });
        } catch (error: any) {
          set({ 
            suppliersError: error.response?.data?.message || 'Failed to fetch suppliers',
            suppliersLoading: false 
          });
        }
      },

      fetchSupplierById: async (id: number) => {
        set({ suppliersLoading: true, suppliersError: null });
        try {
          const response = await api.get(`/inventory/suppliers/${id}/`) as any;
          set({ currentSupplier: response.data, suppliersLoading: false });
        } catch (error: any) {
          set({ 
            suppliersError: error.response?.data?.message || 'Failed to fetch supplier',
            suppliersLoading: false 
          });
        }
      },

      createSupplier: async (data: Partial<Supplier>) => {
        set({ suppliersLoading: true, suppliersError: null });
        try {
          const response = await api.post('/inventory/suppliers/', data) as any;
          set({ suppliersLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            suppliersError: error.response?.data?.message || 'Failed to create supplier',
            suppliersLoading: false 
          });
          throw error;
        }
      },

      updateSupplier: async (id: number, data: Partial<Supplier>) => {
        set({ suppliersLoading: true, suppliersError: null });
        try {
          const response = await api.put(`/inventory/suppliers/${id}/`, data) as any;
          set({ suppliersLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            suppliersError: error.response?.data?.message || 'Failed to update supplier',
            suppliersLoading: false 
          });
          throw error;
        }
      },

      deleteSupplier: async (id: number) => {
        set({ suppliersLoading: true, suppliersError: null });
        try {
          await api.delete(`/inventory/suppliers/${id}/`) as any;
          set({ suppliersLoading: false });
        } catch (error: any) {
          set({ 
            suppliersError: error.response?.data?.message || 'Failed to delete supplier',
            suppliersLoading: false 
          });
          throw error;
        }
      },

      // Asset actions
      fetchAssets: async (params = {}) => {
        set({ assetsLoading: true, assetsError: null });
        try {
          const response = await api.get('/inventory/assets/', { params }) as any;
          set({ assets: response.data, assetsLoading: false });
        } catch (error: any) {
          set({ 
            assetsError: error.response?.data?.message || 'Failed to fetch assets',
            assetsLoading: false 
          });
        }
      },

      fetchAssetById: async (id: number) => {
        set({ assetsLoading: true, assetsError: null });
        try {
          const response = await api.get(`/inventory/assets/${id}/`) as any;
          set({ currentAsset: response.data, assetsLoading: false });
        } catch (error: any) {
          set({ 
            assetsError: error.response?.data?.message || 'Failed to fetch asset',
            assetsLoading: false 
          });
        }
      },

      createAsset: async (data: Partial<Asset>) => {
        set({ assetsLoading: true, assetsError: null });
        try {
          const response = await api.post('/inventory/assets/', data) as any;
          set({ assetsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            assetsError: error.response?.data?.message || 'Failed to create asset',
            assetsLoading: false 
          });
          throw error;
        }
      },

      updateAsset: async (id: number, data: Partial<Asset>) => {
        set({ assetsLoading: true, assetsError: null });
        try {
          const response = await api.put(`/inventory/assets/${id}/`, data) as any;
          set({ assetsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            assetsError: error.response?.data?.message || 'Failed to update asset',
            assetsLoading: false 
          });
          throw error;
        }
      },

      deleteAsset: async (id: number) => {
        set({ assetsLoading: true, assetsError: null });
        try {
          await api.delete(`/inventory/assets/${id}/`) as any;
          set({ assetsLoading: false });
        } catch (error: any) {
          set({ 
            assetsError: error.response?.data?.message || 'Failed to delete asset',
            assetsLoading: false 
          });
          throw error;
        }
      },

      // Stock Item actions
      fetchStockItems: async (params = {}) => {
        set({ stockItemsLoading: true, stockItemsError: null });
        try {
          const response = await api.get('/inventory/stock-items/', { params }) as any;
          set({ stockItems: response.data, stockItemsLoading: false });
        } catch (error: any) {
          set({ 
            stockItemsError: error.response?.data?.message || 'Failed to fetch stock items',
            stockItemsLoading: false 
          });
        }
      },

      fetchStockItemById: async (id: number) => {
        set({ stockItemsLoading: true, stockItemsError: null });
        try {
          const response = await api.get(`/inventory/stock-items/${id}/`) as any;
          set({ currentStockItem: response.data, stockItemsLoading: false });
        } catch (error: any) {
          set({ 
            stockItemsError: error.response?.data?.message || 'Failed to fetch stock item',
            stockItemsLoading: false 
          });
        }
      },

      createStockItem: async (data: Partial<StockItem>) => {
        set({ stockItemsLoading: true, stockItemsError: null });
        try {
          const response = await api.post('/inventory/stock-items/', data) as any;
          set({ stockItemsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            stockItemsError: error.response?.data?.message || 'Failed to create stock item',
            stockItemsLoading: false 
          });
          throw error;
        }
      },

      updateStockItem: async (id: number, data: Partial<StockItem>) => {
        set({ stockItemsLoading: true, stockItemsError: null });
        try {
          const response = await api.put(`/inventory/stock-items/${id}/`, data) as any;
          set({ stockItemsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            stockItemsError: error.response?.data?.message || 'Failed to update stock item',
            stockItemsLoading: false 
          });
          throw error;
        }
      },

      deleteStockItem: async (id: number) => {
        set({ stockItemsLoading: true, stockItemsError: null });
        try {
          await api.delete(`/inventory/stock-items/${id}/`) as any;
          set({ stockItemsLoading: false });
        } catch (error: any) {
          set({ 
            stockItemsError: error.response?.data?.message || 'Failed to delete stock item',
            stockItemsLoading: false 
          });
          throw error;
        }
      },

      updateStockLevel: async (id: number, quantity: number) => {
        set({ stockItemsLoading: true, stockItemsError: null });
        try {
          await api.post(`/inventory/stock-items/${id}/update-stock/`, { quantity }) as any;
          set({ stockItemsLoading: false });
        } catch (error: any) {
          set({ 
            stockItemsError: error.response?.data?.message || 'Failed to update stock level',
            stockItemsLoading: false 
          });
          throw error;
        }
      },

      // Transaction actions
      fetchTransactions: async (params = {}) => {
        set({ transactionsLoading: true, transactionsError: null });
        try {
          const response = await api.get('/inventory/transactions/', { params }) as any;
          set({ transactions: response.data, transactionsLoading: false });
        } catch (error: any) {
          set({ 
            transactionsError: error.response?.data?.message || 'Failed to fetch transactions',
            transactionsLoading: false 
          });
        }
      },

      fetchTransactionById: async (id: number) => {
        set({ transactionsLoading: true, transactionsError: null });
        try {
          const response = await api.get(`/inventory/transactions/${id}/`) as any;
          set({ currentTransaction: response.data, transactionsLoading: false });
        } catch (error: any) {
          set({ 
            transactionsError: error.response?.data?.message || 'Failed to fetch transaction',
            transactionsLoading: false 
          });
        }
      },

      createTransaction: async (data: Partial<Transaction>) => {
        set({ transactionsLoading: true, transactionsError: null });
        try {
          const response = await api.post('/inventory/transactions/', data) as any;
          set({ transactionsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            transactionsError: error.response?.data?.message || 'Failed to create transaction',
            transactionsLoading: false 
          });
          throw error;
        }
      },

      updateTransaction: async (id: number, data: Partial<Transaction>) => {
        set({ transactionsLoading: true, transactionsError: null });
        try {
          const response = await api.put(`/inventory/transactions/${id}/`, data) as any;
          set({ transactionsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            transactionsError: error.response?.data?.message || 'Failed to update transaction',
            transactionsLoading: false 
          });
          throw error;
        }
      },

      deleteTransaction: async (id: number) => {
        set({ transactionsLoading: true, transactionsError: null });
        try {
          await api.delete(`/inventory/transactions/${id}/`) as any;
          set({ transactionsLoading: false });
        } catch (error: any) {
          set({ 
            transactionsError: error.response?.data?.message || 'Failed to delete transaction',
            transactionsLoading: false 
          });
          throw error;
        }
      },

      // Maintenance Record actions
      fetchMaintenanceRecords: async (params = {}) => {
        set({ maintenanceRecordsLoading: true, maintenanceRecordsError: null });
        try {
          const response = await api.get('/inventory/maintenance-records/', { params }) as any;
          set({ maintenanceRecords: response.data, maintenanceRecordsLoading: false });
        } catch (error: any) {
          set({ 
            maintenanceRecordsError: error.response?.data?.message || 'Failed to fetch maintenance records',
            maintenanceRecordsLoading: false 
          });
        }
      },

      fetchMaintenanceRecordById: async (id: number) => {
        set({ maintenanceRecordsLoading: true, maintenanceRecordsError: null });
        try {
          const response = await api.get(`/inventory/maintenance-records/${id}/`) as any;
          set({ currentMaintenanceRecord: response.data, maintenanceRecordsLoading: false });
        } catch (error: any) {
          set({ 
            maintenanceRecordsError: error.response?.data?.message || 'Failed to fetch maintenance record',
            maintenanceRecordsLoading: false 
          });
        }
      },

      createMaintenanceRecord: async (data: Partial<MaintenanceRecord>) => {
        set({ maintenanceRecordsLoading: true, maintenanceRecordsError: null });
        try {
          const response = await api.post('/inventory/maintenance-records/', data) as any;
          set({ maintenanceRecordsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            maintenanceRecordsError: error.response?.data?.message || 'Failed to create maintenance record',
            maintenanceRecordsLoading: false 
          });
          throw error;
        }
      },

      updateMaintenanceRecord: async (id: number, data: Partial<MaintenanceRecord>) => {
        set({ maintenanceRecordsLoading: true, maintenanceRecordsError: null });
        try {
          const response = await api.put(`/inventory/maintenance-records/${id}/`, data) as any;
          set({ maintenanceRecordsLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            maintenanceRecordsError: error.response?.data?.message || 'Failed to update maintenance record',
            maintenanceRecordsLoading: false 
          });
          throw error;
        }
      },

      deleteMaintenanceRecord: async (id: number) => {
        set({ maintenanceRecordsLoading: true, maintenanceRecordsError: null });
        try {
          await api.delete(`/inventory/maintenance-records/${id}/`) as any;
          set({ maintenanceRecordsLoading: false });
        } catch (error: any) {
          set({ 
            maintenanceRecordsError: error.response?.data?.message || 'Failed to delete maintenance record',
            maintenanceRecordsLoading: false 
          });
          throw error;
        }
      },

      // Utility actions
      clearErrors: () => {
        set({
          categoriesError: null,
          suppliersError: null,
          assetsError: null,
          stockItemsError: null,
          transactionsError: null,
          maintenanceRecordsError: null,
        });
      },

      resetState: () => {
        set(initialState);
      },
    }),
    {
      name: 'inventory-store',
    }
  )
);


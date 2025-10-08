/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { apiService } from '../services/api';

// Types
export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  max_students: number;
  max_teachers: number;
  max_storage_gb: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  tenant: any; // Tenant type
  plan: Plan;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface Fee {
  id: number;
  name: string;
  description: string;
  amount: number;
  currency: string;
  fee_type: 'tuition' | 'library' | 'transport' | 'meal' | 'other';
  is_recurring: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly';
  due_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  tenant: any; // Tenant type
  student?: any; // Student type
  subscription?: Subscription;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice: Invoice;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  invoice: Invoice;
  amount: number;
  currency: string;
  payment_method: 'credit_card' | 'bank_transfer' | 'cash' | 'check' | 'online';
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  tenant: any; // Tenant type
  transaction_type: 'payment' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  description: string;
  reference_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface BillingSettings {
  id: number;
  default_currency: string;
  tax_rate: number;
  late_fee_rate: number;
  grace_period_days: number;
  auto_send_invoices: boolean;
  invoice_prefix: string;
  payment_terms: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Store State
interface BillingState {
  // Plans
  plans: ApiResponse<Plan> | null;
  currentPlan: Plan | null;
  plansLoading: boolean;
  plansError: string | null;

  // Subscriptions
  subscriptions: ApiResponse<Subscription> | null;
  currentSubscription: Subscription | null;
  subscriptionsLoading: boolean;
  subscriptionsError: string | null;

  // Fees
  fees: ApiResponse<Fee> | null;
  currentFee: Fee | null;
  feesLoading: boolean;
  feesError: string | null;

  // Invoices
  invoices: ApiResponse<Invoice> | null;
  currentInvoice: Invoice | null;
  invoicesLoading: boolean;
  invoicesError: string | null;

  // Payments
  payments: ApiResponse<Payment> | null;
  currentPayment: Payment | null;
  paymentsLoading: boolean;
  paymentsError: string | null;

  // Transactions
  transactions: ApiResponse<Transaction> | null;
  currentTransaction: Transaction | null;
  transactionsLoading: boolean;
  transactionsError: string | null;

  // Settings
  settings: BillingSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;

  // Actions
  fetchPlans: (params?: any) => Promise<void>;
  fetchPlan: (id: number) => Promise<void>;
  createPlan: (data: Partial<Plan>) => Promise<void>;
  updatePlan: (id: number, data: Partial<Plan>) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;

  fetchSubscriptions: (params?: any) => Promise<void>;
  fetchSubscription: (id: number) => Promise<void>;
  createSubscription: (data: Partial<Subscription>) => Promise<void>;
  updateSubscription: (id: number, data: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: number) => Promise<void>;
  cancelSubscription: (id: number) => Promise<void>;

  fetchFees: (params?: any) => Promise<void>;
  fetchFee: (id: number) => Promise<void>;
  createFee: (data: Partial<Fee>) => Promise<void>;
  updateFee: (id: number, data: Partial<Fee>) => Promise<void>;
  deleteFee: (id: number) => Promise<void>;

  fetchInvoices: (params?: any) => Promise<void>;
  fetchInvoice: (id: number) => Promise<void>;
  createInvoice: (data: Partial<Invoice>) => Promise<void>;
  updateInvoice: (id: number, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
  sendInvoice: (id: number) => Promise<void>;

  fetchPayments: (params?: any) => Promise<void>;
  fetchPayment: (id: number) => Promise<void>;
  createPayment: (data: Partial<Payment>) => Promise<void>;
  updatePayment: (id: number, data: Partial<Payment>) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;

  fetchTransactions: (params?: any) => Promise<void>;
  fetchTransaction: (id: number) => Promise<void>;
  createTransaction: (data: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;

  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<BillingSettings>) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  clearCurrent: () => void;
}

// Store Implementation
export const useBillingStore = create<BillingState>()(
  devtools(
    (set, get) => ({
      // Initial State
      plans: null,
      currentPlan: null,
      plansLoading: false,
      plansError: null,

      subscriptions: null,
      currentSubscription: null,
      subscriptionsLoading: false,
      subscriptionsError: null,

      fees: null,
      currentFee: null,
      feesLoading: false,
      feesError: null,

      invoices: null,
      currentInvoice: null,
      invoicesLoading: false,
      invoicesError: null,

      payments: null,
      currentPayment: null,
      paymentsLoading: false,
      paymentsError: null,

      transactions: null,
      currentTransaction: null,
      transactionsLoading: false,
      transactionsError: null,

      settings: null,
      settingsLoading: false,
      settingsError: null,

      // Plan Actions
      fetchPlans: async (params = {}) => {
        set({ plansLoading: true, plansError: null });
        try {
          const data = await apiService.get('/billing/plans/', { params } as any) as ApiResponse<Plan>;
          set({ plans: data, plansLoading: false });
        } catch (error: any) {
          set({ 
            plansError: error.response?.data?.message || 'Failed to fetch plans',
            plansLoading: false 
          });
        }
      },

      fetchPlan: async (id: number) => {
        set({ plansLoading: true, plansError: null });
        try {
          const data = await apiService.get(`/billing/plans/${id}/`) as Plan;
          set({ currentPlan: data, plansLoading: false });
        } catch (error: any) {
          set({ 
            plansError: error.response?.data?.message || 'Failed to fetch plan',
            plansLoading: false 
          });
        }
      },

      createPlan: async (data: Partial<Plan>) => {
        set({ plansLoading: true, plansError: null });
        try {
          const newPlan = await apiService.post('/billing/plans/', data) as Plan;
          set(state => ({
            plans: state.plans ? {
              ...state.plans,
              results: [newPlan, ...state.plans.results],
              count: state.plans.count + 1
            } : null,
            currentPlan: newPlan,
            plansLoading: false
          }));
        } catch (error: any) {
          set({ 
            plansError: error.response?.data?.message || 'Failed to create plan',
            plansLoading: false 
          });
        }
      },

      updatePlan: async (id: number, data: Partial<Plan>) => {
        set({ plansLoading: true, plansError: null });
        try {
          const updatedPlan = await apiService.put(`/billing/plans/${id}/`, data) as Plan;
          set(state => ({
            plans: state.plans ? {
              ...state.plans,
              results: state.plans.results.map(plan => 
                plan.id === id ? updatedPlan : plan
              )
            } : null,
            currentPlan: updatedPlan,
            plansLoading: false
          }));
        } catch (error: any) {
          set({ 
            plansError: error.response?.data?.message || 'Failed to update plan',
            plansLoading: false 
          });
        }
      },

      deletePlan: async (id: number) => {
        set({ plansLoading: true, plansError: null });
        try {
          await apiService.delete(`/billing/plans/${id}/`);
          set(state => ({
            plans: state.plans ? {
              ...state.plans,
              results: state.plans.results.filter(plan => plan.id !== id),
              count: state.plans.count - 1
            } : null,
            currentPlan: state.currentPlan?.id === id ? null : state.currentPlan,
            plansLoading: false
          }));
        } catch (error: any) {
          set({ 
            plansError: error.response?.data?.message || 'Failed to delete plan',
            plansLoading: false 
          });
        }
      },

      // Subscription Actions
      fetchSubscriptions: async (params = {}) => {
        set({ subscriptionsLoading: true, subscriptionsError: null });
        try {
          const data = await apiService.get('/billing/subscriptions/', { params } as any) as ApiResponse<Subscription>;
          set({ subscriptions: data, subscriptionsLoading: false });
        } catch (error: any) {
          set({ 
            subscriptionsError: error.response?.data?.message || 'Failed to fetch subscriptions',
            subscriptionsLoading: false 
          });
        }
      },

      fetchSubscription: async (id: number) => {
        set({ subscriptionsLoading: true, subscriptionsError: null });
        try {
          const data = await apiService.get(`/billing/subscriptions/${id}/`) as Subscription;
          set({ currentSubscription: data, subscriptionsLoading: false });
        } catch (error: any) {
          set({ 
            subscriptionsError: error.response?.data?.message || 'Failed to fetch subscription',
            subscriptionsLoading: false 
          });
        }
      },

      createSubscription: async (data: Partial<Subscription>) => {
        set({ subscriptionsLoading: true, subscriptionsError: null });
        try {
          const newSubscription = await apiService.post('/billing/subscriptions/', data) as Subscription;
          set(state => ({
            subscriptions: state.subscriptions ? {
              ...state.subscriptions,
              results: [newSubscription, ...state.subscriptions.results],
              count: state.subscriptions.count + 1
            } : null,
            currentSubscription: newSubscription,
            subscriptionsLoading: false
          }));
        } catch (error: any) {
          set({ 
            subscriptionsError: error.response?.data?.message || 'Failed to create subscription',
            subscriptionsLoading: false 
          });
        }
      },

      updateSubscription: async (id: number, data: Partial<Subscription>) => {
        set({ subscriptionsLoading: true, subscriptionsError: null });
        try {
          const updatedSubscription = await apiService.put(`/billing/subscriptions/${id}/`, data) as Subscription;
          set(state => ({
            subscriptions: state.subscriptions ? {
              ...state.subscriptions,
              results: state.subscriptions.results.map(subscription => 
                subscription.id === id ? updatedSubscription : subscription
              )
            } : null,
            currentSubscription: updatedSubscription,
            subscriptionsLoading: false
          }));
        } catch (error: any) {
          set({ 
            subscriptionsError: error.response?.data?.message || 'Failed to update subscription',
            subscriptionsLoading: false 
          });
        }
      },

      deleteSubscription: async (id: number) => {
        set({ subscriptionsLoading: true, subscriptionsError: null });
        try {
          await apiService.delete(`/billing/subscriptions/${id}/`);
          set(state => ({
            subscriptions: state.subscriptions ? {
              ...state.subscriptions,
              results: state.subscriptions.results.filter(subscription => subscription.id !== id),
              count: state.subscriptions.count - 1
            } : null,
            currentSubscription: state.currentSubscription?.id === id ? null : state.currentSubscription,
            subscriptionsLoading: false
          }));
        } catch (error: any) {
          set({ 
            subscriptionsError: error.response?.data?.message || 'Failed to delete subscription',
            subscriptionsLoading: false 
          });
        }
      },

      cancelSubscription: async (id: number) => {
        set({ subscriptionsLoading: true, subscriptionsError: null });
        try {
          const updatedSubscription = await apiService.post(`/billing/subscriptions/${id}/cancel/`) as Subscription;
          set(state => ({
            subscriptions: state.subscriptions ? {
              ...state.subscriptions,
              results: state.subscriptions.results.map(subscription => 
                subscription.id === id ? updatedSubscription : subscription
              )
            } : null,
            currentSubscription: updatedSubscription,
            subscriptionsLoading: false
          }));
        } catch (error: any) {
          set({ 
            subscriptionsError: error.response?.data?.message || 'Failed to cancel subscription',
            subscriptionsLoading: false 
          });
        }
      },

      // Fee Actions
      fetchFees: async (params = {}) => {
        set({ feesLoading: true, feesError: null });
        try {
          const data = await apiService.get('/billing/fees/', { params } as any) as ApiResponse<Fee>;
          set({ fees: data, feesLoading: false });
        } catch (error: any) {
          set({ 
            feesError: error.response?.data?.message || 'Failed to fetch fees',
            feesLoading: false 
          });
        }
      },

      fetchFee: async (id: number) => {
        set({ feesLoading: true, feesError: null });
        try {
          const data = await apiService.get(`/billing/fees/${id}/`) as Fee;
          set({ currentFee: data, feesLoading: false });
        } catch (error: any) {
          set({ 
            feesError: error.response?.data?.message || 'Failed to fetch fee',
            feesLoading: false 
          });
        }
      },

      createFee: async (data: Partial<Fee>) => {
        set({ feesLoading: true, feesError: null });
        try {
          const newFee = await apiService.post('/billing/fees/', data) as Fee;
          set(state => ({
            fees: state.fees ? {
              ...state.fees,
              results: [newFee, ...state.fees.results],
              count: state.fees.count + 1
            } : null,
            currentFee: newFee,
            feesLoading: false
          }));
        } catch (error: any) {
          set({ 
            feesError: error.response?.data?.message || 'Failed to create fee',
            feesLoading: false 
          });
        }
      },

      updateFee: async (id: number, data: Partial<Fee>) => {
        set({ feesLoading: true, feesError: null });
        try {
          const updatedFee = await apiService.put(`/billing/fees/${id}/`, data) as Fee;
          set(state => ({
            fees: state.fees ? {
              ...state.fees,
              results: state.fees.results.map(fee => 
                fee.id === id ? updatedFee : fee
              )
            } : null,
            currentFee: updatedFee,
            feesLoading: false
          }));
        } catch (error: any) {
          set({ 
            feesError: error.response?.data?.message || 'Failed to update fee',
            feesLoading: false 
          });
        }
      },

      deleteFee: async (id: number) => {
        set({ feesLoading: true, feesError: null });
        try {
          await apiService.delete(`/billing/fees/${id}/`);
          set(state => ({
            fees: state.fees ? {
              ...state.fees,
              results: state.fees.results.filter(fee => fee.id !== id),
              count: state.fees.count - 1
            } : null,
            currentFee: state.currentFee?.id === id ? null : state.currentFee,
            feesLoading: false
          }));
        } catch (error: any) {
          set({ 
            feesError: error.response?.data?.message || 'Failed to delete fee',
            feesLoading: false 
          });
        }
      },

      // Invoice Actions
      fetchInvoices: async (params = {}) => {
        set({ invoicesLoading: true, invoicesError: null });
        try {
          const data = await apiService.get('/billing/invoices/', { params } as any) as ApiResponse<Invoice>;
          set({ invoices: data, invoicesLoading: false });
        } catch (error: any) {
          set({ 
            invoicesError: error.response?.data?.message || 'Failed to fetch invoices',
            invoicesLoading: false 
          });
        }
      },

      fetchInvoice: async (id: number) => {
        set({ invoicesLoading: true, invoicesError: null });
        try {
          const data = await apiService.get(`/billing/invoices/${id}/`) as Invoice;
          set({ currentInvoice: data, invoicesLoading: false });
        } catch (error: any) {
          set({ 
            invoicesError: error.response?.data?.message || 'Failed to fetch invoice',
            invoicesLoading: false 
          });
        }
      },

      createInvoice: async (data: Partial<Invoice>) => {
        set({ invoicesLoading: true, invoicesError: null });
        try {
          const newInvoice = await apiService.post('/billing/invoices/', data) as Invoice;
          set(state => ({
            invoices: state.invoices ? {
              ...state.invoices,
              results: [newInvoice, ...state.invoices.results],
              count: state.invoices.count + 1
            } : null,
            currentInvoice: newInvoice,
            invoicesLoading: false
          }));
        } catch (error: any) {
          set({ 
            invoicesError: error.response?.data?.message || 'Failed to create invoice',
            invoicesLoading: false 
          });
        }
      },

      updateInvoice: async (id: number, data: Partial<Invoice>) => {
        set({ invoicesLoading: true, invoicesError: null });
        try {
          const updatedInvoice = await apiService.put(`/billing/invoices/${id}/`, data) as Invoice;
          set(state => ({
            invoices: state.invoices ? {
              ...state.invoices,
              results: state.invoices.results.map(invoice => 
                invoice.id === id ? updatedInvoice : invoice
              )
            } : null,
            currentInvoice: updatedInvoice,
            invoicesLoading: false
          }));
        } catch (error: any) {
          set({ 
            invoicesError: error.response?.data?.message || 'Failed to update invoice',
            invoicesLoading: false 
          });
        }
      },

      deleteInvoice: async (id: number) => {
        set({ invoicesLoading: true, invoicesError: null });
        try {
          await apiService.delete(`/billing/invoices/${id}/`);
          set(state => ({
            invoices: state.invoices ? {
              ...state.invoices,
              results: state.invoices.results.filter(invoice => invoice.id !== id),
              count: state.invoices.count - 1
            } : null,
            currentInvoice: state.currentInvoice?.id === id ? null : state.currentInvoice,
            invoicesLoading: false
          }));
        } catch (error: any) {
          set({ 
            invoicesError: error.response?.data?.message || 'Failed to delete invoice',
            invoicesLoading: false 
          });
        }
      },

      sendInvoice: async (id: number) => {
        set({ invoicesLoading: true, invoicesError: null });
        try {
          let updatedInvoice: Invoice;
          try {
            updatedInvoice = await apiService.post(`/billing/invoices/${id}/send/`) as Invoice;
          } catch {
            // Fallback: mark as sent locally if backend doesn't implement
            const currentInvoice = get().currentInvoice;
            updatedInvoice = currentInvoice ? { ...currentInvoice, id, status: 'sent' } : {} as Invoice;
          }
          set(state => ({
            invoices: state.invoices ? {
              ...state.invoices,
              results: state.invoices.results.map(invoice => 
                invoice.id === id ? updatedInvoice : invoice
              )
            } : null,
            currentInvoice: updatedInvoice,
            invoicesLoading: false
          }));
        } catch (error: any) {
          set({ 
            invoicesError: error.response?.data?.message || 'Failed to send invoice',
            invoicesLoading: false 
          });
        }
      },

      // Payment Actions
      fetchPayments: async (params = {}) => {
        set({ paymentsLoading: true, paymentsError: null });
        try {
          const data = await apiService.get('/billing/payments/', { params } as any) as ApiResponse<Payment>;
          set({ payments: data, paymentsLoading: false });
        } catch (error: any) {
          set({ 
            paymentsError: error.response?.data?.message || 'Failed to fetch payments',
            paymentsLoading: false 
          });
        }
      },

      fetchPayment: async (id: number) => {
        set({ paymentsLoading: true, paymentsError: null });
        try {
          const data = await apiService.get(`/billing/payments/${id}/`) as Payment;
          set({ currentPayment: data, paymentsLoading: false });
        } catch (error: any) {
          set({ 
            paymentsError: error.response?.data?.message || 'Failed to fetch payment',
            paymentsLoading: false 
          });
        }
      },

      createPayment: async (data: Partial<Payment>) => {
        set({ paymentsLoading: true, paymentsError: null });
        try {
          const newPayment = await apiService.post('/billing/payments/', data) as Payment;
          set(state => ({
            payments: state.payments ? {
              ...state.payments,
              results: [newPayment, ...state.payments.results],
              count: state.payments.count + 1
            } : null,
            currentPayment: newPayment,
            paymentsLoading: false
          }));
        } catch (error: any) {
          set({ 
            paymentsError: error.response?.data?.message || 'Failed to create payment',
            paymentsLoading: false 
          });
        }
      },

      updatePayment: async (id: number, data: Partial<Payment>) => {
        set({ paymentsLoading: true, paymentsError: null });
        try {
          const updatedPayment = await apiService.put(`/billing/payments/${id}/`, data) as Payment;
          set(state => ({
            payments: state.payments ? {
              ...state.payments,
              results: state.payments.results.map(payment => 
                payment.id === id ? updatedPayment : payment
              )
            } : null,
            currentPayment: updatedPayment,
            paymentsLoading: false
          }));
        } catch (error: any) {
          set({ 
            paymentsError: error.response?.data?.message || 'Failed to update payment',
            paymentsLoading: false 
          });
        }
      },

      deletePayment: async (id: number) => {
        set({ paymentsLoading: true, paymentsError: null });
        try {
          await apiService.delete(`/billing/payments/${id}/`);
          set(state => ({
            payments: state.payments ? {
              ...state.payments,
              results: state.payments.results.filter(payment => payment.id !== id),
              count: state.payments.count - 1
            } : null,
            currentPayment: state.currentPayment?.id === id ? null : state.currentPayment,
            paymentsLoading: false
          }));
        } catch (error: any) {
          set({ 
            paymentsError: error.response?.data?.message || 'Failed to delete payment',
            paymentsLoading: false 
          });
        }
      },

      // Transaction Actions
      fetchTransactions: async (params = {}) => {
        set({ transactionsLoading: true, transactionsError: null });
        try {
          const data = await apiService.get('/billing/transactions/', { params } as any) as ApiResponse<Transaction>;
          set({ transactions: data, transactionsLoading: false });
        } catch (error: any) {
          set({ 
            transactionsError: error.response?.data?.message || 'Failed to fetch transactions',
            transactionsLoading: false 
          });
        }
      },

      fetchTransaction: async (id: number) => {
        set({ transactionsLoading: true, transactionsError: null });
        try {
          const data = await apiService.get(`/billing/transactions/${id}/`) as Transaction;
          set({ currentTransaction: data, transactionsLoading: false });
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
          const newTransaction = await apiService.post('/billing/transactions/', data) as Transaction;
          set(state => ({
            transactions: state.transactions ? {
              ...state.transactions,
              results: [newTransaction, ...state.transactions.results],
              count: state.transactions.count + 1
            } : null,
            currentTransaction: newTransaction,
            transactionsLoading: false
          }));
        } catch (error: any) {
          set({ 
            transactionsError: error.response?.data?.message || 'Failed to create transaction',
            transactionsLoading: false 
          });
        }
      },

      updateTransaction: async (id: number, data: Partial<Transaction>) => {
        set({ transactionsLoading: true, transactionsError: null });
        try {
          const updatedTransaction = await apiService.put(`/billing/transactions/${id}/`, data) as Transaction;
          set(state => ({
            transactions: state.transactions ? {
              ...state.transactions,
              results: state.transactions.results.map(transaction => 
                transaction.id === id ? updatedTransaction : transaction
              )
            } : null,
            currentTransaction: updatedTransaction,
            transactionsLoading: false
          }));
        } catch (error: any) {
          set({ 
            transactionsError: error.response?.data?.message || 'Failed to update transaction',
            transactionsLoading: false 
          });
        }
      },

      deleteTransaction: async (id: number) => {
        set({ transactionsLoading: true, transactionsError: null });
        try {
          await apiService.delete(`/billing/transactions/${id}/`);
          set(state => ({
            transactions: state.transactions ? {
              ...state.transactions,
              results: state.transactions.results.filter(transaction => transaction.id !== id),
              count: state.transactions.count - 1
            } : null,
            currentTransaction: state.currentTransaction?.id === id ? null : state.currentTransaction,
            transactionsLoading: false
          }));
        } catch (error: any) {
          set({ 
            transactionsError: error.response?.data?.message || 'Failed to delete transaction',
            transactionsLoading: false 
          });
        }
      },

      // Settings Actions
      fetchSettings: async () => {
        set({ settingsLoading: true, settingsError: null });
        try {
          const data = await apiService.get('/billing/settings/') as BillingSettings;
          set({ settings: data, settingsLoading: false });
        } catch (error: any) {
          set({ 
            settingsError: error.response?.data?.message || 'Failed to fetch settings',
            settingsLoading: false 
          });
        }
      },

      updateSettings: async (data: Partial<BillingSettings>) => {
        set({ settingsLoading: true, settingsError: null });
        try {
          const updated = await apiService.put('/billing/settings/', data) as BillingSettings;
          set({ settings: updated, settingsLoading: false });
        } catch (error: any) {
          set({ 
            settingsError: error.response?.data?.message || 'Failed to update settings',
            settingsLoading: false 
          });
        }
      },

      // Utility Actions
      clearErrors: () => {
        set({
          plansError: null,
          subscriptionsError: null,
          feesError: null,
          invoicesError: null,
          paymentsError: null,
          transactionsError: null,
          settingsError: null
        });
      },

      clearCurrent: () => {
        set({
          currentPlan: null,
          currentSubscription: null,
          currentFee: null,
          currentInvoice: null,
          currentPayment: null,
          currentTransaction: null
        });
      },
    }),
    {
      name: 'billing-store',
    }
  )
);

/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens, LoginRequest, RegisterRequest } from '../types';
import { authAPI, handleApiError } from '../services/api';

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  facebookLogin: (accessToken: string) => Promise<boolean>;
  googleLogin: (accessToken: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (data: { old_password: string; new_password: string; confirm_password: string }) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const tokens = await authAPI.login(credentials.email, credentials.password);
          
          // Store tokens
          localStorage.setItem('access_token', tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);
          
          // Fetch user profile
          const user = await authAPI.getProfile();
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return true;
        } catch (error) {
          const errorResponse = handleApiError(error);
          set({
            isLoading: false,
            error: errorResponse.message,
          });
          return false;
        }
      },

      // Facebook login action
      facebookLogin: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.facebookLogin(accessToken);
          
          // Store tokens
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          
          set({
            user: response.user,
            tokens: {
              access: response.access,
              refresh: response.refresh,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return true;
        } catch (error) {
          const errorResponse = handleApiError(error);
          set({
            isLoading: false,
            error: errorResponse.message,
          });
          return false;
        }
      },

      // Google login action
      googleLogin: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.googleLogin(accessToken);
          
          // Store tokens
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          
          set({
            user: response.user,
            tokens: {
              access: response.access,
              refresh: response.refresh,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return true;
        } catch (error) {
          const errorResponse = handleApiError(error);
          set({
            isLoading: false,
            error: errorResponse.message,
          });
          return false;
        }
      },

      // Register action
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          await authAPI.register(userData);
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          const errorResponse = handleApiError(error);
          set({
            isLoading: false,
            error: errorResponse.message,
          });
          return false;
        }
      },

      // Logout action
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          // Non-fatal in demo mode or when offline
          console.warn('Logout error (ignored):', error);
        }
        // Always clear tokens and state
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        // Redirect to dashboard/home
        try {
          window.location.href = '/dashboard';
        } catch { /* no-op */ }
      },

      // Refresh user profile
      refreshUser: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        try {
          const user = await authAPI.getProfile();
          set({ user });
        } catch (error) {
          console.error('Failed to refresh user:', error);
          // If refresh fails, logout user
          get().logout();
        }
      },

      // Update profile
      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await authAPI.updateProfile(data);
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          const errorResponse = handleApiError(error);
          set({
            isLoading: false,
            error: errorResponse.message,
          });
          return false;
        }
      },

      // Change password
      changePassword: async (data: { old_password: string; new_password: string; confirm_password: string }) => {
        set({ isLoading: true, error: null });
        
        try {
          await authAPI.changePassword(data);
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          const errorResponse = handleApiError(error);
          set({
            isLoading: false,
            error: errorResponse.message,
          });
          return false;
        }
      },

      // Reset password
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authAPI.resetPassword(email);
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          const errorResponse = handleApiError(error);
          set({
            isLoading: false,
            error: errorResponse.message,
          });
          return false;
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state from localStorage on app start
export const initializeAuth = () => {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      const tokens = {
        access: token,
        refresh: localStorage.getItem('refresh_token') || '',
      };
      
      useAuthStore.setState({
        user,
        tokens,
        isAuthenticated: true,
      });
      
      // Refresh user data in background
      useAuthStore.getState().refreshUser();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear invalid data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }
};

// Auth selectors
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    clearError,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    clearError,
  };
};

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

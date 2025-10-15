/**
 * Generic API Service
 * Provides reusable API methods for CRUD operations
 */
import { apiClient } from '../lib/api-client'
import type { AxiosResponse } from 'axios'

export interface PaginationParams {
  page?: number
  page_size?: number
  ordering?: string
  search?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface FilterParams {
  [key: string]: any
}

class ApiService {
  /**
   * Generic list method with pagination and filtering
   */
  async list<T>(
    endpoint: string,
    params?: PaginationParams & FilterParams
  ): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await apiClient.get(endpoint, {
      params,
    })
    return response.data
  }

  /**
   * Get single item by ID
   */
  async get<T>(endpoint: string, id: string | number): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.get(`${endpoint}/${id}/`)
    return response.data
  }

  /**
   * Create new item
   */
  async create<T>(endpoint: string, data: Partial<T>): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.post(`${endpoint}/`, data)
    return response.data
  }

  /**
   * Update item by ID
   */
  async update<T>(endpoint: string, id: string | number, data: Partial<T>): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.put(`${endpoint}/${id}/`, data)
    return response.data
  }

  /**
   * Partial update item by ID
   */
  async patch<T>(endpoint: string, id: string | number, data: Partial<T>): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.patch(`${endpoint}/${id}/`, data)
    return response.data
  }

  /**
   * Delete item by ID
   */
  async delete(endpoint: string, id: string | number): Promise<void> {
    await apiClient.delete(`${endpoint}/${id}/`)
  }

  /**
   * Bulk create
   */
  async bulkCreate<T>(endpoint: string, data: Partial<T>[]): Promise<T[]> {
    const response: AxiosResponse<T[]> = await apiClient.post(`${endpoint}/bulk/`, data)
    return response.data
  }

  /**
   * Bulk update
   */
  async bulkUpdate<T>(endpoint: string, data: Array<Partial<T> & { id: string | number }>): Promise<T[]> {
    const response: AxiosResponse<T[]> = await apiClient.put(`${endpoint}/bulk/`, data)
    return response.data
  }

  /**
   * Bulk delete
   */
  async bulkDelete(endpoint: string, ids: Array<string | number>): Promise<void> {
    await apiClient.post(`${endpoint}/bulk-delete/`, { ids })
  }

  /**
   * Export data
   */
  async export(endpoint: string, format: 'csv' | 'xlsx' | 'pdf' = 'csv', params?: FilterParams): Promise<Blob> {
    const response: AxiosResponse<Blob> = await apiClient.get(`${endpoint}/export/`, {
      params: { ...params, format },
      responseType: 'blob',
    })
    return response.data
  }

  /**
   * Import data
   */
  async import(endpoint: string, file: File): Promise<{ success: number; errors: string[] }> {
    const response = await apiClient.upload(`${endpoint}/import/`, file)
    return response.data
  }

  /**
   * Search
   */
  async search<T>(endpoint: string, query: string, params?: FilterParams): Promise<T[]> {
    const response: AxiosResponse<T[]> = await apiClient.get(`${endpoint}/search/`, {
      params: { q: query, ...params },
    })
    return response.data
  }

  /**
   * Get statistics
   */
  async stats<T>(endpoint: string, params?: FilterParams): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.get(`${endpoint}/stats/`, {
      params,
    })
    return response.data
  }
}

// Create singleton instance
export const apiService = new ApiService()

// Export default
export default apiService

// Specific service factories
export const createCrudService = <T>(baseEndpoint: string) => ({
  list: (params?: PaginationParams & FilterParams) => 
    apiService.list<T>(baseEndpoint, params),
  
  get: (id: string | number) => 
    apiService.get<T>(baseEndpoint, id),
  
  create: (data: Partial<T>) => 
    apiService.create<T>(baseEndpoint, data),
  
  update: (id: string | number, data: Partial<T>) => 
    apiService.update<T>(baseEndpoint, id, data),
  
  patch: (id: string | number, data: Partial<T>) => 
    apiService.patch<T>(baseEndpoint, id, data),
  
  delete: (id: string | number) => 
    apiService.delete(baseEndpoint, id),
  
  bulkCreate: (data: Partial<T>[]) => 
    apiService.bulkCreate<T>(baseEndpoint, data),
  
  bulkUpdate: (data: Array<Partial<T> & { id: string | number }>) => 
    apiService.bulkUpdate<T>(baseEndpoint, data),
  
  bulkDelete: (ids: Array<string | number>) => 
    apiService.bulkDelete(baseEndpoint, ids),
  
  export: (format?: 'csv' | 'xlsx' | 'pdf', params?: FilterParams) => 
    apiService.export(baseEndpoint, format, params),
  
  import: (file: File) => 
    apiService.import(baseEndpoint, file),
  
  search: (query: string, params?: FilterParams) => 
    apiService.search<T>(baseEndpoint, query, params),
  
  stats: (params?: FilterParams) => 
    apiService.stats(baseEndpoint, params),
})

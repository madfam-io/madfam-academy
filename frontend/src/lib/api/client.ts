import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../../store/auth.store';

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add tenant context if available
        const tenantId = useAuthStore.getState().user?.tenantId;
        if (tenantId) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        // Add request timestamp for debugging
        config.headers['X-Request-Time'] = new Date().toISOString();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Return the data property for successful responses
        return response.data.data || response.data;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const refreshToken = useAuthStore.getState().refreshToken;
            if (refreshToken) {
              const response = await this.post('/auth/refresh', { refreshToken });
              const { accessToken, user } = response;
              
              useAuthStore.getState().setAuth(accessToken, refreshToken, user);
              
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          // Handle insufficient permissions
          const errorMessage = error.response.data?.message || 'Insufficient permissions';
          throw new ApiError(errorMessage, 403, error.response.data?.errors);
        }

        // Handle 429 Too Many Requests
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const errorMessage = `Rate limit exceeded. Retry after ${retryAfter} seconds.`;
          throw new ApiError(errorMessage, 429, error.response.data?.errors);
        }

        // Handle network errors
        if (!error.response) {
          throw new ApiError('Network error. Please check your connection.', 0);
        }

        // Handle other errors
        const message = error.response.data?.message || error.message || 'An error occurred';
        const status = error.response.status || 500;
        const errors = error.response.data?.errors || [];

        throw new ApiError(message, status, errors);
      }
    );
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }

  // File upload helper
  async uploadFile<T = any>(
    url: string, 
    file: File, 
    fieldName = 'file',
    additionalData?: Record<string, any>,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  // Download file helper
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Batch requests helper
  async batch<T = any>(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: any;
  }>): Promise<T[]> {
    const promises = requests.map(request => {
      switch (request.method) {
        case 'GET':
          return this.get(request.url);
        case 'POST':
          return this.post(request.url, request.data);
        case 'PUT':
          return this.put(request.url, request.data);
        case 'PATCH':
          return this.patch(request.url, request.data);
        case 'DELETE':
          return this.delete(request.url);
        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }
    });

    return Promise.all(promises);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health');
  }

  // Get API version
  async getVersion(): Promise<{ version: string; buildDate: string }> {
    return this.get('/version');
  }

  // Update configuration
  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.baseURL) {
      this.client.defaults.baseURL = newConfig.baseURL;
    }
    
    if (newConfig.timeout) {
      this.client.defaults.timeout = newConfig.timeout;
    }
    
    if (newConfig.headers) {
      this.client.defaults.headers = {
        ...this.client.defaults.headers,
        ...newConfig.headers,
      };
    }
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  public status: number;
  public errors: Array<{ field?: string; message: string; code?: string }>;

  constructor(
    message: string, 
    status: number, 
    errors: Array<{ field?: string; message: string; code?: string }> = []
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  // Check if error is a specific type
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isValidationError(): boolean {
    return this.status === 400;
  }

  isRateLimited(): boolean {
    return this.status === 429;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  // Get field-specific errors
  getFieldErrors(): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};
    
    this.errors.forEach(error => {
      if (error.field) {
        if (!fieldErrors[error.field]) {
          fieldErrors[error.field] = [];
        }
        fieldErrors[error.field].push(error.message);
      }
    });
    
    return fieldErrors;
  }
}

// Create and export the API client instance
const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/v1',
  timeout: 30000, // 30 seconds
  headers: {
    'X-Client-Version': '1.0.0',
    'X-Platform': 'web',
  },
});

export { apiClient, ApiClient };
export type { ApiClientConfig, ApiResponse };

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<{
      access_token: string;
      token_type: string;
      user: any;
    }>>('/auth/login', { email, password });
    return response.data;
  }

  async register(name: string, email: string, password: string, role: string = 'operator') {
    const response = await this.client.post<ApiResponse<{
      access_token: string;
      token_type: string;
      user: any;
    }>>('/auth/register', { name, email, password, role });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get<ApiResponse<any>>('/auth/me');
    return response.data;
  }

  // CRM endpoints
  async getContacts() {
    const response = await this.client.get<ApiResponse<any[]>>('/crm/contacts');
    return response.data;
  }

  async createContact(contactData: any) {
    const response = await this.client.post<ApiResponse<any>>('/crm/contacts', contactData);
    return response.data;
  }

  async getProposals() {
    const response = await this.client.get<ApiResponse<any[]>>('/crm/proposals');
    return response.data;
  }

  async createProposal(proposalData: any) {
    const response = await this.client.post<ApiResponse<any>>('/crm/proposals', proposalData);
    return response.data;
  }

  async updateProposalStatus(proposalId: string, status: string) {
    const response = await this.client.put(`/crm/proposals/${proposalId}/status`, { status });
    return response.data;
  }

  async createInteraction(interactionData: any) {
    const response = await this.client.post<ApiResponse<any>>('/crm/interactions', interactionData);
    return response.data;
  }

  // Financial endpoints
  async getAccountsPayable() {
    const response = await this.client.get<ApiResponse<any[]>>('/financial/accounts-payable');
    return response.data;
  }

  async createAccountsPayable(payableData: any) {
    const response = await this.client.post<ApiResponse<any>>('/financial/accounts-payable', payableData);
    return response.data;
  }

  async getAccountsReceivable() {
    const response = await this.client.get<ApiResponse<any[]>>('/financial/accounts-receivable');
    return response.data;
  }

  async getCashFlow(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await this.client.get<ApiResponse<any[]>>(`/financial/cash-flow?${params}`);
    return response.data;
  }

  async getCashFlowProjection(daysAhead: number = 60) {
    const response = await this.client.get<ApiResponse<any[]>>(`/financial/cash-flow-projection?days_ahead=${daysAhead}`);
    return response.data;
  }

  // File upload
  async uploadFile(file: File, bucket: string, folder?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (folder) formData.append('folder', folder);

    const response = await this.client.post<ApiResponse<{
      bucket: string;
      object_name: string;
      file_url: string;
    }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Generic methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

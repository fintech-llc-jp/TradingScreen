import { OrderBook, AuthResponse, LoginRequest, OrderRequest, OrderResponse, Execution, ExecutionHistoryResponse } from '../types';

const API_BASE_URL = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.getToken() && !endpoint.includes('/auth/')) {
      headers.Authorization = `Bearer ${this.getToken()}`;
    }

    console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
    console.log('Headers:', headers);
    if (options.body) {
      console.log('Request Body:', options.body);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Response: ${response.status} ${response.statusText}`);
      console.error('Error Details:', errorText);
      
      // 401エラー（Unauthorized）の場合はトークン期限切れの可能性
      if (response.status === 401) {
        console.warn('🔐 トークンが無効または期限切れです。再ログインが必要です。');
        this.clearToken();
        // カスタムイベントを発火して再ログインを促す
        window.dispatchEvent(new CustomEvent('token-expired'));
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ API Response: ${options.method || 'GET'} ${url}`, data);
    return data;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async getOrderBook(symbol: string, depth: number = 10): Promise<OrderBook> {
    return this.request<OrderBook>(`/market/board/${symbol}?depth=${depth}`);
  }

  async getSimpleOrderBook(symbol: string): Promise<OrderBook> {
    return this.request<OrderBook>(`/market/board/${symbol}/simple`);
  }

  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    return this.request<OrderResponse>('/orders/new', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async getExecutions(page: number = 0, size: number = 10, symbol?: string): Promise<Execution[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (symbol) {
      params.append('symbol', symbol);
    }
    
    const response = await this.request<ExecutionHistoryResponse>(`/executions/history?${params}`);
    return response.executions;
  }

  async getAllExecutions(page: number = 0, size: number = 10, symbol?: string): Promise<Execution[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (symbol) {
      params.append('symbol', symbol);
    }
    
    const response = await this.request<ExecutionHistoryResponse>(`/executions/all?${params}`);
    return response.executions;
  }
}

export const apiClient = new ApiClient();
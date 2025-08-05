import { OrderBook, AuthResponse, LoginRequest, OrderRequest, OrderResponse, Execution, ExecutionHistoryResponse, VolumeCalculationResponse, PortfolioSummary, Position, TradeHistoryItem, NewsSummaryResponse, NewsTranslationResponse } from '../types';

const API_BASE_URL = import.meta.env.PROD
  ? 'https://exch-sim-service-953974838707.asia-northeast1.run.app/api'
  : '/api';

const NEWS_API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_NEWS_API_URL || 'https://news-server-120035357891.asia-northeast1.run.app/api')
  : '/api';

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
    options: RequestInit = {},
    baseUrl: string = API_BASE_URL
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
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

  private async newsRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${NEWS_API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // ニュースAPIには認証ヘッダーを追加しない
    console.log(`🔄 News API Request: ${options.method || 'GET'} ${url}`);
    console.log('Headers:', headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📡 News API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ News API Error Response: ${response.status} ${response.statusText}`);
      console.error('Error Details:', errorText);
      throw new Error(`News API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ News API Response: ${options.method || 'GET'} ${url}`, data);
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

  async signUp(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // サインアップ成功後、自動でログイン状態にする
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    // ローカルでトークンをクリア
    this.clearToken();
    // カスタムイベントを発火してログアウトを通知
    window.dispatchEvent(new CustomEvent('user-logout'));
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

  async getVolumeCalculation(symbol: string, fromTime: string, toTime: string): Promise<VolumeCalculationResponse> {
    const params = new URLSearchParams({
      symbol: symbol,
      fromTime: fromTime,
      toTime: toTime
    });
    
    return this.request<VolumeCalculationResponse>(`/executions/volume?${params}`);
  }

  async get24HourVolume(symbol: string): Promise<number> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const toTime = now.toISOString().substring(0, 19);
    const fromTime = yesterday.toISOString().substring(0, 19);
    
    console.log(`📊 Volume API call: ${symbol} from ${fromTime} to ${toTime} (UTC)`);
    console.log(`📊 Current time: ${now.toISOString()}, Yesterday: ${yesterday.toISOString()}`);
    
    try {
      const response = await this.getVolumeCalculation(symbol, fromTime, toTime);
      console.log(`📊 Volume API response for ${symbol}:`, response);
      console.log(`📊 Total volume: ${response.totalVolume}, Execution count: ${response.executionCount}`);
      
      // 警告: 取引量が0の場合
      if (response.totalVolume === 0) {
        console.warn(`⚠️ 取引量が0です - ${symbol}: 期間内に約定がない可能性があります`);
        console.warn(`⚠️ 確認してください: 約定データの時刻が ${fromTime} から ${toTime} の範囲内にあるか?`);
      }
      
      return response.totalVolume;
    } catch (error) {
      console.error(`❌ 24時間取引量取得エラー (${symbol}):`, error);
      console.error(`❌ エラー詳細:`, error);
      return 0;
    }
  }

  // ポジション管理API
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    return this.request<PortfolioSummary>('/positions/summary');
  }

  async getSymbolPosition(symbol: string): Promise<Position> {
    return this.request<Position>(`/positions/${symbol}`);
  }

  async getTradeHistory(limit?: number, symbol?: string): Promise<TradeHistoryItem[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (symbol) params.append('symbol', symbol);
    
    return this.request<TradeHistoryItem[]>(`/positions/trades?${params}`);
  }

  // ニュースAPI
  async getNewsSummaries(page: number = 0, size: number = 10): Promise<NewsSummaryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    return this.newsRequest<NewsSummaryResponse>(`/news/summaries?${params}`);
  }

  async getNewsTranslations(page: number = 0, size: number = 10): Promise<NewsTranslationResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    return this.newsRequest<NewsTranslationResponse>(`/news/translations?${params}`);
  }
}

export const apiClient = new ApiClient();
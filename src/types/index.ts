export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdateTime?: string;
}

export interface MarketData {
  symbol: string;
  lastPrice?: number;
  bestBid?: number;
  bestAsk?: number;
  spread?: number;
  volume24h?: number;
}

export type Symbol = 'G_BTCJPY' | 'G_FX_BTCJPY' | 'B_BTCJPY' | 'B_FX_BTCJPY';

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface OrderRequest {
  symbol: string;
  price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  ordType: 'LIMIT' | 'MARKET';
  tif: 'GTC' | 'IOC' | 'FOK';
}

export interface OrderResponse {
  orderId: string;
  clOrdID: string;
  ordStatus: string;
  message?: string;
}

export interface Execution {
  execID: string;
  orderId?: string;
  clOrdID: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  lastQty: number;
  lastPx: number;
  leavesQty?: number;
  cumQty?: number;
  avgPx?: number;
  ordStatus?: string;
  execStatus?: string;
  execType?: string;
  transactTime?: string;
  counterPartyUsername?: string;
  createdAt?: string;
}

export interface ExecutionHistoryResponse {
  username: string;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  executions: Execution[];
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  pnl?: number;
}
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
}

export type Symbol = 'G_BTCJPY' | 'G_FX_BTCJPY' | 'B_BTCJPY' | 'B_FX_BTCJPY';

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
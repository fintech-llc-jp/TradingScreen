import React, { useState, useEffect, useCallback } from 'react';
import { OrderBook, Symbol } from '../types';
import { apiClient } from '../services/api';
import { formatSymbol } from '../utils/formatters';
import OrderBookComponent from './OrderBookComponent';

interface MarketBoardProps {
  symbol: Symbol;
}

const MarketBoard: React.FC<MarketBoardProps> = ({ symbol }) => {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderBook = useCallback(async () => {
    try {
      setError(null);
      const data = await apiClient.getOrderBook(symbol, 10);
      setOrderBook(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 1000);
    return () => clearInterval(interval);
  }, [fetchOrderBook]);

  return (
    <div className="market-board">
      <div className="market-board-header">
        <h3 className="symbol-title">{formatSymbol(symbol)}</h3>
        <button 
          className="refresh-button"
          onClick={fetchOrderBook}
          disabled={loading}
        >
          🔄
        </button>
      </div>
      <OrderBookComponent 
        orderBook={orderBook}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default MarketBoard;
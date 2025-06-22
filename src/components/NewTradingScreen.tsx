import React, { useState, useEffect, useCallback } from 'react';
import { Symbol, OrderBook, OrderRequest, Execution } from '../types';
import { apiClient } from '../services/api';
import { getMockOrderBook, getMockExecutions } from '../utils/mockData';
import SymbolSelector from './SymbolSelector';
import DetailedOrderBook from './DetailedOrderBook';
import OrderForm from './OrderForm';
import ExecutionHistory from './ExecutionHistory';
import ApiStatusChecker from './ApiStatusChecker';
import ReLoginButton from './ReLoginButton';

const SYMBOLS: Symbol[] = ['G_BTCJPY', 'G_FX_BTCJPY', 'B_BTCJPY', 'B_FX_BTCJPY'];

const NewTradingScreen: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol>('G_FX_BTCJPY');
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // 仮の市場データ（実際のAPIから取得する場合は別途実装）
  const [lastPrice] = useState(14981474);
  const [volume24h] = useState(617.5708);

  const fetchOrderBook = useCallback(async () => {
    try {
      setError(null);
      if (useMockData) {
        // モックデータを使用
        const mockData = getMockOrderBook(selectedSymbol);
        setOrderBook(mockData);
        setLoading(false);
      } else {
        // 実際のAPIを呼び出し
        const data = await apiClient.getOrderBook(selectedSymbol, 15);
        setOrderBook(data);
        setLoading(false);
      }
    } catch (err) {
      console.error('API呼び出しエラー、モックデータに切り替えます:', err);
      setUseMockData(true);
      const mockData = getMockOrderBook(selectedSymbol);
      setOrderBook(mockData);
      setError('APIエラーのためモックデータを表示中');
      setLoading(false);
    }
  }, [selectedSymbol, useMockData]);

  const fetchExecutions = useCallback(async () => {
    try {
      setExecutionsLoading(true);
      if (useMockData) {
        // モックデータを使用
        const mockData = getMockExecutions();
        setExecutions(mockData);
      } else {
        // 実際のAPIを呼び出し
        const data = await apiClient.getExecutions(10);
        setExecutions(data);
      }
    } catch (err) {
      console.error('約定履歴の取得に失敗、モックデータを使用:', err);
      const mockData = getMockExecutions();
      setExecutions(mockData);
    } finally {
      setExecutionsLoading(false);
    }
  }, [useMockData]);

  const handlePlaceOrder = async (order: OrderRequest) => {
    try {
      if (useMockData) {
        // モックデータモードでは注文をシミュレート
        console.log('モック注文:', order);
        
        // 新しい約定をモック履歴に追加
        const newExecution: Execution = {
          execID: `exec_${Date.now()}`,
          orderId: `order_${Date.now()}`,
          clOrdID: `client_${Date.now()}`,
          symbol: order.symbol,
          side: order.side,
          lastQty: order.quantity,
          lastPx: order.price,
          leavesQty: 0,
          cumQty: order.quantity,
          avgPx: order.price,
          ordStatus: 'FILLED',
          execType: 'TRADE',
          transactTime: new Date().toISOString(),
        };
        
        setExecutions(prev => [newExecution, ...prev.slice(0, 9)]);
        alert(`モック注文が約定されました: ${order.side} ${(order.quantity/1000).toFixed(3)} BTC @ ${order.price.toLocaleString()}`);
      } else {
        await apiClient.placeOrder(order);
        setTimeout(fetchExecutions, 500);
        alert('注文が正常に発注されました');
      }
    } catch (error) {
      console.error('注文APIエラー、モックモードに切り替えます:', error);
      setUseMockData(true);
      
      // モック注文として処理
      const newExecution: Execution = {
        execID: `exec_${Date.now()}`,
        orderId: `order_${Date.now()}`,
        clOrdID: `client_${Date.now()}`,
        symbol: order.symbol,
        side: order.side,
        lastQty: order.quantity,
        lastPx: order.price,
        leavesQty: 0,
        cumQty: order.quantity,
        avgPx: order.price,
        ordStatus: 'FILLED',
        execType: 'TRADE',
        transactTime: new Date().toISOString(),
      };
      
      setExecutions(prev => [newExecution, ...prev.slice(0, 9)]);
      alert(`APIエラーのためモック注文として処理: ${order.side} ${(order.quantity/1000).toFixed(3)} BTC @ ${order.price.toLocaleString()}`);
    }
  };

  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 1000);
    return () => clearInterval(interval);
  }, [fetchOrderBook]);

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 3000);
    return () => clearInterval(interval);
  }, [fetchExecutions]);

  const bestBid = orderBook?.bids.length ? orderBook.bids[0].price : undefined;
  const bestAsk = orderBook?.asks.length ? orderBook.asks[0].price : undefined;

  return (
    <div className="new-trading-screen">
      <SymbolSelector
        symbols={SYMBOLS}
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
      />
      
      {useMockData && (
        <div className="mock-data-notice">
          ⚠️ APIエラーのためモックデータを表示中です
          <div className="mock-controls">
            <ReLoginButton onLoginSuccess={() => setUseMockData(false)} />
            <ApiStatusChecker />
            <button 
              className="force-real-data-button"
              onClick={() => setUseMockData(false)}
            >
              実データモードに戻す
            </button>
          </div>
        </div>
      )}
      
      <div className="trading-layout">
        <div className="left-panel">
          <DetailedOrderBook
            orderBook={orderBook}
            loading={loading}
            error={error}
            lastPrice={lastPrice}
            volume24h={volume24h}
          />
        </div>
        
        <div className="right-panel">
          <OrderForm
            symbol={selectedSymbol}
            onPlaceOrder={handlePlaceOrder}
            bestBid={bestBid}
            bestAsk={bestAsk}
          />
          
          <ExecutionHistory
            executions={executions}
            loading={executionsLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default NewTradingScreen;
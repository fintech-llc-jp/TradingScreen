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
  const [allExecutions, setAllExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [allExecutionsLoading, setAllExecutionsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  
  // 商品別約定履歴キャッシュ
  const [executionsCache, setExecutionsCache] = useState<Record<Symbol, Execution[]>>({});
  const [allExecutionsCache, setAllExecutionsCache] = useState<Record<Symbol, Execution[]>>({});

  // 仮の市場データ（実際のAPIから取得する場合は別途実装）
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
    console.log(`🔄 fetchExecutions開始: ${selectedSymbol}, useMockData: ${useMockData}`);
    setExecutionsLoading(true);
    
    try {
      let newData: Execution[];
      
      if (useMockData) {
        // モックデータを使用
        console.log(`📋 モックデータ生成中 (${selectedSymbol})`);
        newData = getMockExecutions(selectedSymbol);
        console.log(`✅ モックデータ生成完了:`, newData);
      } else {
        // 実際のAPIを呼び出し
        console.log(`📋 API呼び出し開始: /api/executions/history?page=0&size=10&symbol=${selectedSymbol}`);
        newData = await apiClient.getExecutions(0, 10, selectedSymbol);
        console.log(`✅ API呼び出し成功 (${newData.length}件):`, newData);
      }
      
      console.log(`💾 約定履歴を更新: ${selectedSymbol} (${newData.length}件)`);
      setExecutions(newData);
      
      // キャッシュも更新
      setExecutionsCache(prev => ({
        ...prev,
        [selectedSymbol]: newData
      }));
      
    } catch (err) {
      console.error(`❌ 約定履歴取得エラー (${selectedSymbol}):`, err);
      const mockData = getMockExecutions(selectedSymbol);
      console.log(`🔄 モックデータにフォールバック:`, mockData);
      setExecutions(mockData);
      
      // エラー時もキャッシュ更新
      setExecutionsCache(prev => ({
        ...prev,
        [selectedSymbol]: mockData
      }));
    } finally {
      console.log(`🏁 fetchExecutions完了: ${selectedSymbol}`);
      setExecutionsLoading(false);
    }
  }, [useMockData, selectedSymbol]);

  const fetchAllExecutions = useCallback(async () => {
    console.log(`🔄 fetchAllExecutions開始: ${selectedSymbol}, useMockData: ${useMockData}`);
    setAllExecutionsLoading(true);
    
    try {
      let newData: Execution[];
      
      if (useMockData) {
        // モックデータを使用
        console.log(`📋 全体約定モックデータ生成中 (${selectedSymbol})`);
        newData = getMockExecutions(selectedSymbol);
        console.log(`✅ 全体約定モックデータ生成完了:`, newData);
      } else {
        // 実際のAPIを呼び出し
        console.log(`📋 全体約定API呼び出し開始: /api/executions/all?page=0&size=10&symbol=${selectedSymbol}`);
        newData = await apiClient.getAllExecutions(0, 10, selectedSymbol);
        console.log(`✅ 全体約定API呼び出し成功 (${newData.length}件):`, newData);
      }
      
      console.log(`💾 全体約定履歴を更新: ${selectedSymbol} (${newData.length}件)`);
      setAllExecutions(newData);
      
      // キャッシュも更新
      setAllExecutionsCache(prev => ({
        ...prev,
        [selectedSymbol]: newData
      }));
      
    } catch (err) {
      console.error(`❌ 全体約定履歴取得エラー (${selectedSymbol}):`, err);
      const mockData = getMockExecutions(selectedSymbol);
      console.log(`🔄 全体約定モックデータにフォールバック:`, mockData);
      setAllExecutions(mockData);
      
      // エラー時もキャッシュ更新
      setAllExecutionsCache(prev => ({
        ...prev,
        [selectedSymbol]: mockData
      }));
    } finally {
      console.log(`🏁 fetchAllExecutions完了: ${selectedSymbol}`);
      setAllExecutionsLoading(false);
    }
  }, [useMockData, selectedSymbol]);

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
        console.log('💰 注文成功、約定履歴を500ms後に更新します');
        setTimeout(() => {
          console.log('🔄 約定履歴を手動更新中...');
          fetchExecutions();
        }, 500);
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

  // 商品切り替え時の処理
  useEffect(() => {
    const cachedData = executionsCache[selectedSymbol];
    if (cachedData && cachedData.length > 0) {
      console.log(`💾 キャッシュから約定履歴を表示: ${selectedSymbol}`);
      setExecutions(cachedData);
    }
    
    const allCachedData = allExecutionsCache[selectedSymbol];
    if (allCachedData && allCachedData.length > 0) {
      console.log(`💾 キャッシュから全体約定履歴を表示: ${selectedSymbol}`);
      setAllExecutions(allCachedData);
    }
  }, [selectedSymbol, executionsCache, allExecutionsCache]);

  // 約定履歴の定期取得
  useEffect(() => {
    console.log('🔄 約定履歴の定期取得を開始');
    fetchExecutions();
    fetchAllExecutions();
    const interval = setInterval(() => {
      fetchExecutions();
      fetchAllExecutions();
    }, 5000); // 5秒に延長
    return () => {
      console.log('🛑 約定履歴の定期取得を停止');
      clearInterval(interval);
    };
  }, [fetchExecutions, fetchAllExecutions]);

  const handleTabChange = useCallback((tab: 'my' | 'all') => {
    console.log(`📱 タブ切り替え: ${tab}`);
    if (tab === 'all' && allExecutions.length === 0) {
      fetchAllExecutions();
    }
  }, [allExecutions.length, fetchAllExecutions]);

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
            allExecutions={allExecutions}
            loading={executionsLoading}
            allLoading={allExecutionsLoading}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
};

export default NewTradingScreen;
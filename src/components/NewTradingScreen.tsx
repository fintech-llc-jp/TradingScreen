import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Symbol, OrderBook, OrderRequest, Execution } from '../types';
import { apiClient } from '../services/api';
import { getMockOrderBook, getMockExecutions } from '../utils/mockData';
import SymbolSelector from './SymbolSelector';
import DetailedOrderBook from './DetailedOrderBook';
import OrderForm from './OrderForm';
import ExecutionHistory from './ExecutionHistory';
import ApiStatusChecker from './ApiStatusChecker';
import ReLoginButton from './ReLoginButton';
import MultiMarketBoard from './MultiMarketBoard';
import PositionsScreen from './PositionsScreen';
import NewsScreen from './NewsScreen';
import { logger } from '../utils/logger';

const SYMBOLS: Symbol[] = ['G_BTCJPY', 'G_FX_BTCJPY', 'B_BTCJPY', 'B_FX_BTCJPY'];

const NewTradingScreen: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol>('G_FX_BTCJPY');
  const [orderBooks, setOrderBooks] = useState<Record<Symbol, OrderBook | null>>({} as Record<Symbol, OrderBook | null>);
  const [, ] = useState<Record<Symbol, boolean>>({} as Record<Symbol, boolean>);
  const [orderBooksInitialLoading, setOrderBooksInitialLoading] = useState<Record<Symbol, boolean>>({} as Record<Symbol, boolean>);
  const [orderBooksErrors, setOrderBooksErrors] = useState<Record<Symbol, string | null>>({} as Record<Symbol, string | null>);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [allExecutions, setAllExecutions] = useState<Execution[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [allExecutionsLoading, setAllExecutionsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [, setMockDataSymbols] = useState<Set<Symbol>>(new Set());
  const [activeTab, setActiveTab] = useState<'single' | 'multi' | 'positions' | 'news'>('single');
  const [logoutLoading, setLogoutLoading] = useState(false);
  
  // 初回ロード判定用のRef
  const initialLoadedSymbols = useRef<Set<Symbol>>(new Set());
  
  // 商品別約定履歴キャッシュ
  const [executionsCache, setExecutionsCache] = useState<Record<Symbol, Execution[]>>({} as Record<Symbol, Execution[]>);
  const [allExecutionsCache, setAllExecutionsCache] = useState<Record<Symbol, Execution[]>>({} as Record<Symbol, Execution[]>);

  // 24時間取引量データ
  const [volume24h, setVolume24h] = useState<number>(0);
  const [volumeLoading, setVolumeLoading] = useState(false);

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      setLogoutLoading(true);
      try {
        apiClient.logout();
        logger.info('ログアウトが完了しました');
      } catch (error) {
        logger.error('ログアウトエラー:', error);
      } finally {
        setLogoutLoading(false);
      }
    }
  };

  const fetchOrderBook = useCallback(async (symbol: Symbol) => {
    // 初回のみローディング状態を設定
    const isInitialLoad = !initialLoadedSymbols.current.has(symbol);
    if (isInitialLoad) {
      setOrderBooksInitialLoading(prev => ({ ...prev, [symbol]: true }));
    }
    setOrderBooksErrors(prev => ({ ...prev, [symbol]: null }));

    try {
      let data: OrderBook;
      if (useMockData) {
        data = getMockOrderBook(symbol);
      } else {
        data = await apiClient.getOrderBook(symbol, 15);
      }
      setOrderBooks(prev => ({ ...prev, [symbol]: data }));
      
      // 初回ロード完了をマーク
      if (isInitialLoad) {
        initialLoadedSymbols.current.add(symbol);
      }
      
      // データが正常に取得できた場合はモック状態を解除
      setMockDataSymbols(prev => {
        const newSet = new Set(prev);
        newSet.delete(symbol);
        if (newSet.size === 0) {
          setUseMockData(false);
        }
        return newSet;
      });
    } catch (err) {
      logger.error(`OrderBook fetch error for ${symbol}:`, err);
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      
      setOrderBooksErrors(prev => ({ 
        ...prev, 
        [symbol]: `API Error: ${errorMessage}` 
      }));
      
      // 初回ロード失敗時のみモックデータにフォールバック
      if (isInitialLoad) {
        logger.info(`Using mock data fallback for ${symbol} due to initial load failure`);
        const mockData = getMockOrderBook(symbol);
        setOrderBooks(prev => ({ ...prev, [symbol]: mockData }));
        setMockDataSymbols(prev => new Set([...prev, symbol]));
        setUseMockData(true);
        initialLoadedSymbols.current.add(symbol);
      } else {
        logger.info(`Keeping existing data for ${symbol} despite API error`);
      }
    } finally {
      if (isInitialLoad) {
        setOrderBooksInitialLoading(prev => ({ ...prev, [symbol]: false }));
      }
    }
  }, [useMockData]);

  const fetchAllOrderBooks = useCallback(async () => {
    // 並列実行に戻す（レートリミット対策は間隔調整で対応）
    logger.info('📊 fetchAllOrderBooks開始:', new Date().toLocaleTimeString());
    const promises = SYMBOLS.map(symbol => fetchOrderBook(symbol));
    const results = await Promise.allSettled(promises);
    
    // 結果をログ出力
    results.forEach((result, index) => {
      const symbol = SYMBOLS[index];
      if (result.status === 'rejected') {
        logger.error(`❌ ${symbol} OrderBook取得失敗:`, result.reason);
      } else {
        logger.info(`✅ ${symbol} OrderBook取得成功`);
      }
    });
  }, [fetchOrderBook]);

  const fetchExecutions = useCallback(async () => {
    logger.info(`🔄 fetchExecutions開始: ${selectedSymbol}, useMockData: ${useMockData}`);
    setExecutionsLoading(true);
    
    try {
      let newData: Execution[];
      
      if (useMockData) {
        // モックデータを使用
        logger.info(`📋 モックデータ生成中 (${selectedSymbol})`);
        newData = getMockExecutions(selectedSymbol);
        logger.info(`✅ モックデータ生成完了:`, newData);
      } else {
        // 実際のAPIを呼び出し
        logger.info(`📋 API呼び出し開始: /api/executions/history?page=0&size=10&symbol=${selectedSymbol}`);
        newData = await apiClient.getExecutions(0, 10, selectedSymbol);
        logger.info(`✅ API呼び出し成功 (${newData.length}件):`, newData);
      }
      
      logger.info(`💾 約定履歴を更新: ${selectedSymbol} (${newData.length}件)`);
      setExecutions(newData);
      
      // キャッシュも更新
      setExecutionsCache(prev => ({
        ...prev,
        [selectedSymbol]: newData
      }));
      
    } catch (err) {
      logger.error(`❌ 約定履歴取得エラー (${selectedSymbol}):`, err);
      const mockData = getMockExecutions(selectedSymbol);
      logger.info(`🔄 モックデータにフォールバック:`, mockData);
      setExecutions(mockData);
      
      // エラー時もキャッシュ更新
      setExecutionsCache(prev => ({
        ...prev,
        [selectedSymbol]: mockData
      }));
    } finally {
      logger.info(`🏁 fetchExecutions完了: ${selectedSymbol}`);
      setExecutionsLoading(false);
    }
  }, [useMockData, selectedSymbol]);

  const fetchAllExecutions = useCallback(async () => {
    logger.info(`🔄 fetchAllExecutions開始: ${selectedSymbol}, useMockData: ${useMockData}`);
    setAllExecutionsLoading(true);
    
    try {
      let newData: Execution[];
      
      if (useMockData) {
        // モックデータを使用
        logger.info(`📋 全体約定モックデータ生成中 (${selectedSymbol})`);
        newData = getMockExecutions(selectedSymbol);
        logger.info(`✅ 全体約定モックデータ生成完了:`, newData);
      } else {
        // 実際のAPIを呼び出し
        logger.info(`📋 全体約定API呼び出し開始: /api/executions/all?page=0&size=10&symbol=${selectedSymbol}`);
        newData = await apiClient.getAllExecutions(0, 10, selectedSymbol);
        logger.info(`✅ 全体約定API呼び出し成功 (${newData.length}件):`, newData);
      }
      
      logger.info(`💾 全体約定履歴を更新: ${selectedSymbol} (${newData.length}件)`);
      setAllExecutions(newData);
      
      // キャッシュも更新
      setAllExecutionsCache(prev => ({
        ...prev,
        [selectedSymbol]: newData
      }));
      
    } catch (err) {
      logger.error(`❌ 全体約定履歴取得エラー (${selectedSymbol}):`, err);
      const mockData = getMockExecutions(selectedSymbol);
      logger.info(`🔄 全体約定モックデータにフォールバック:`, mockData);
      setAllExecutions(mockData);
      
      // エラー時もキャッシュ更新
      setAllExecutionsCache(prev => ({
        ...prev,
        [selectedSymbol]: mockData
      }));
    } finally {
      logger.info(`🏁 fetchAllExecutions完了: ${selectedSymbol}`);
      setAllExecutionsLoading(false);
    }
  }, [useMockData, selectedSymbol]);

  const fetch24HourVolume = useCallback(async () => {
    logger.info(`📊 24時間取引量取得開始: ${selectedSymbol}`);
    setVolumeLoading(true);
    
    try {
      if (useMockData) {
        // モックデータでは固定値を使用
        const mockVolume = Math.random() * 1000 + 100; // 100-1100 BTCのランダム値
        logger.info(`📋 モック24時間取引量: ${mockVolume.toFixed(4)} BTC`);
        setVolume24h(mockVolume);
      } else {
        // 実際のAPIを呼び出し
        logger.info(`📊 API呼び出し: ${selectedSymbol}の24時間取引量`);
        const volume = await apiClient.get24HourVolume(selectedSymbol);
        logger.info(`✅ 24時間取引量取得成功: ${volume.toFixed(4)} BTC`);
        setVolume24h(volume);
      }
    } catch (err) {
      logger.error(`❌ 24時間取引量取得エラー (${selectedSymbol}):`, err);
      // エラー時はモック値を使用
      const fallbackVolume = Math.random() * 500 + 50;
      setVolume24h(fallbackVolume);
    } finally {
      logger.info(`🏁 24時間取引量取得完了: ${selectedSymbol}`);
      setVolumeLoading(false);
    }
  }, [selectedSymbol, useMockData]);

  const handlePlaceOrder = async (order: OrderRequest) => {
    try {
      if (useMockData) {
        // モックデータモードでは注文をシミュレート
        logger.info('モック注文:', order);
        
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
        logger.info('💰 注文成功、約定履歴を500ms後に更新します');
        setTimeout(() => {
          logger.info('🔄 約定履歴を手動更新中...');
          fetchExecutions();
        }, 500);
        alert('注文が正常に発注されました');
      }
    } catch (error) {
      logger.error('注文APIエラー、モックモードに切り替えます:', error);
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
    fetchAllOrderBooks();
    const interval = setInterval(fetchAllOrderBooks, 1000);
    return () => clearInterval(interval);
  }, [fetchAllOrderBooks]);

  // 商品切り替え時の処理
  useEffect(() => {
    const cachedData = executionsCache[selectedSymbol];
    if (cachedData && cachedData.length > 0) {
      logger.info(`💾 キャッシュから約定履歴を表示: ${selectedSymbol}`);
      setExecutions(cachedData);
    }
    
    const allCachedData = allExecutionsCache[selectedSymbol];
    if (allCachedData && allCachedData.length > 0) {
      logger.info(`💾 キャッシュから全体約定履歴を表示: ${selectedSymbol}`);
      setAllExecutions(allCachedData);
    }
  }, [selectedSymbol, executionsCache, allExecutionsCache]);

  // 約定履歴の定期取得
  useEffect(() => {
    logger.info('🔄 約定履歴の定期取得を開始');
    fetchExecutions();
    fetchAllExecutions();
    fetch24HourVolume();
    const interval = setInterval(() => {
      fetchExecutions();
      fetchAllExecutions();
      fetch24HourVolume();
    }, 30000); // 30秒に変更（取引量データも含むため）
    return () => {
      logger.info('🛑 約定履歴の定期取得を停止');
      clearInterval(interval);
    };
  }, [fetchExecutions, fetchAllExecutions, fetch24HourVolume]);

  const handleTabChange = useCallback((tab: 'my' | 'all') => {
    logger.info(`📱 タブ切り替え: ${tab}`);
    if (tab === 'all' && allExecutions.length === 0) {
      fetchAllExecutions();
    }
  }, [allExecutions.length, fetchAllExecutions]);

  // 商品切り替え時に24時間取引量を再取得
  useEffect(() => {
    fetch24HourVolume();
  }, [selectedSymbol, fetch24HourVolume]);

  const selectedOrderBook = orderBooks[selectedSymbol];
  const bestBid = selectedOrderBook?.bids.length ? selectedOrderBook.bids[0].price : undefined;
  const bestAsk = selectedOrderBook?.asks.length ? selectedOrderBook.asks[0].price : undefined;

  return (
    <div className="new-trading-screen">
      <div className="header">
        <h1>New Trading Screen</h1>
        <button onClick={handleLogout} disabled={logoutLoading}>
          {logoutLoading ? 'ログアウト中...' : 'ログアウト'}
        </button>
      </div>
      <div className="main-tabs">
        <button 
          className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          個別マーケット
        </button>
        <button 
          className={`tab-button ${activeTab === 'multi' ? 'active' : ''}`}
          onClick={() => setActiveTab('multi')}
        >
          マーケット一覧
        </button>
        <button 
          className={`tab-button ${activeTab === 'positions' ? 'active' : ''}`}
          onClick={() => setActiveTab('positions')}
        >
          ポジション
        </button>
        <button 
          className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          ニュース
        </button>
      </div>

      {activeTab === 'single' && (
        <>
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
                orderBook={selectedOrderBook}
                loading={orderBooksInitialLoading[selectedSymbol] || false}
                error={orderBooksErrors[selectedSymbol] || null}
                volume24h={volume24h}
                volumeLoading={volumeLoading}
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
        </>
      )}
      
      {activeTab === 'multi' && (
        <MultiMarketBoard 
          symbols={SYMBOLS} 
          onPlaceOrder={handlePlaceOrder}
          orderBooks={orderBooks}
          initialLoading={orderBooksInitialLoading}
          errors={orderBooksErrors}
          useMockData={useMockData}
        />
      )}
      
      {activeTab === 'positions' && (
        <PositionsScreen />
      )}
      
      {activeTab === 'news' && (
        <NewsScreen />
      )}
    </div>
  );
};

export default NewTradingScreen;
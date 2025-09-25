import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PortfolioSummary, Position, TradeHistoryItem } from '../types';
import { apiClient } from '../services/api';
import { logger } from '../utils/logger';

const PositionsScreen: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeHistoryLoading, setTradeHistoryLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
  const [useMockData, setUseMockData] = useState(false);

  // モックデータ生成関数
  const generateMockPortfolio = (): PortfolioSummary => {
    const mockPositions: Position[] = [
      {
        symbol: 'G_FX_BTCJPY',
        netQty: 0.05,
        averageBuyPrice: 4950000,
        realizedPnL: 15000,
        unrealizedPnL: -3000,
        totalPnL: 12000
      },
      {
        symbol: 'G_BTCJPY',
        netQty: 0.02,
        averageBuyPrice: 4970000,
        realizedPnL: 8000,
        unrealizedPnL: 1500,
        totalPnL: 9500
      }
    ];

    return {
      username: 'demo_user',
      totalRealizedPnL: 23000,
      totalUnrealizedPnL: -1500,
      totalPnL: 21500,
      totalTradeCount: 15,
      totalTradingVolume: 0.25,
      positions: mockPositions,
      symbolTradeCounts: {
        'G_FX_BTCJPY': 10,
        'G_BTCJPY': 5
      }
    };
  };

  const generateMockTradeHistory = (): TradeHistoryItem[] => {
    return [
      {
        id: 'trade_1',
        symbol: 'G_FX_BTCJPY',
        side: 'BUY',
        quantity: 0.01,
        price: 4950000,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        realizedPnL: 0
      },
      {
        id: 'trade_2',
        symbol: 'G_FX_BTCJPY',
        side: 'SELL',
        quantity: 0.005,
        price: 4980000,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        realizedPnL: 150
      },
      {
        id: 'trade_3',
        symbol: 'G_BTCJPY',
        side: 'BUY',
        quantity: 0.02,
        price: 4970000,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        realizedPnL: 0
      }
    ];
  };

  const fetchPortfolioSummary = useCallback(async () => {
    logger.info('🏦 fetchPortfolioSummary 開始, useMockData:', useMockData);
    setLoading(true);
    setError(null);

    try {
      if (useMockData) {
        logger.info('📋 モックデータを使用');
        const mockData = generateMockPortfolio();
        logger.info('✅ モックポートフォリオデータ生成:', mockData);
        setPortfolio(mockData);
      } else {
        logger.info('🔄 API呼び出し: getPortfolioSummary');
        const data = await apiClient.getPortfolioSummary();
        logger.info('✅ ポートフォリオデータ取得成功:', data);
        setPortfolio(data);
        setUseMockData(false);
      }
    } catch (err) {
      logger.error('❌ ポートフォリオ取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラー');
      
      // エラー時はモックデータにフォールバック
      logger.info('🔄 モックデータにフォールバック');
      const mockData = generateMockPortfolio();
      logger.info('✅ モックデータ設定:', mockData);
      setPortfolio(mockData);
      setUseMockData(true);
    } finally {
      logger.info('🏁 fetchPortfolioSummary 完了');
      setLoading(false);
    }
  }, [useMockData]);

  const fetchTradeHistory = useCallback(async () => {
    logger.info('📈 fetchTradeHistory 開始, selectedSymbol:', selectedSymbol, 'useMockData:', useMockData);
    setTradeHistoryLoading(true);

    try {
      if (useMockData) {
        logger.info('📋 取引履歴モックデータを使用');
        const mockData = generateMockTradeHistory();
        logger.info('✅ モック取引履歴データ生成:', mockData);
        setTradeHistory(mockData);
      } else {
        const symbol = selectedSymbol === 'all' ? undefined : selectedSymbol;
        logger.info('🔄 API呼び出し: getTradeHistory, symbol:', symbol);
        const data = await apiClient.getTradeHistory(20, symbol);
        logger.info('✅ 取引履歴データ取得成功:', data);
        setTradeHistory(data);
      }
    } catch (err) {
      logger.error('❌ 取引履歴取得エラー:', err);
      
      // エラー時はモックデータにフォールバック
      logger.info('🔄 取引履歴モックデータにフォールバック');
      const mockData = generateMockTradeHistory();
      logger.info('✅ モック取引履歴データ設定:', mockData);
      setTradeHistory(mockData);
    } finally {
      logger.info('🏁 fetchTradeHistory 完了');
      setTradeHistoryLoading(false);
    }
  }, [selectedSymbol, useMockData]);

  // Store the latest functions in refs to avoid dependency issues
  const fetchPortfolioSummaryRef = useRef(fetchPortfolioSummary);
  fetchPortfolioSummaryRef.current = fetchPortfolioSummary;

  const fetchTradeHistoryRef = useRef(fetchTradeHistory);
  fetchTradeHistoryRef.current = fetchTradeHistory;

  useEffect(() => {
    logger.info('🚀 PositionsScreen useEffect - 初期データ取得');
    fetchPortfolioSummaryRef.current();
    fetchTradeHistoryRef.current();
  }, []); // Empty dependency array to prevent recreation

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const formatPnL = (pnl: number): string => {
    const formatted = formatCurrency(pnl);
    return pnl >= 0 ? `+${formatted}` : formatted;
  };

  const getPnLColor = (pnl: number): string => {
    return pnl >= 0 ? '#4ade80' : '#f87171';
  };

  const handleRefresh = () => {
    logger.info('🔄 手動更新ボタンクリック');
    fetchPortfolioSummaryRef.current();
    fetchTradeHistoryRef.current();
  };

  if (loading) {
    return (
      <div className="positions-screen">
        <div className="loading">ポートフォリオを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="positions-screen">
      <div className="positions-header">
        <h2>ポジション・損益</h2>
        <div className="header-controls">
          {useMockData && (
            <div className="mock-notice">⚠️ モックデータ表示中</div>
          )}
          <button onClick={handleRefresh} className="refresh-button">
            更新
          </button>
        </div>
      </div>

      {portfolio && (
        <>
          {/* ポートフォリオサマリー */}
          <div className="portfolio-summary">
            <h3>ポートフォリオサマリー</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">総実現損益:</span>
                <span 
                  className="value" 
                  style={{ color: getPnLColor(portfolio.totalRealizedPnL) }}
                >
                  {formatPnL(portfolio.totalRealizedPnL)}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">総未実現損益:</span>
                <span 
                  className="value" 
                  style={{ color: getPnLColor(portfolio.totalUnrealizedPnL) }}
                >
                  {formatPnL(portfolio.totalUnrealizedPnL)}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">総損益:</span>
                <span 
                  className="value total-pnl" 
                  style={{ color: getPnLColor(portfolio.totalPnL) }}
                >
                  {formatPnL(portfolio.totalPnL)}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">総取引回数:</span>
                <span className="value">{portfolio.totalTradeCount}回</span>
              </div>
              <div className="summary-item">
                <span className="label">総取引量:</span>
                <span className="value">{portfolio.totalTradingVolume.toFixed(4)} BTC</span>
              </div>
            </div>
          </div>

          {/* ポジション一覧 */}
          <div className="positions-list">
            <h3>保有ポジション</h3>
            {portfolio.positions.length > 0 ? (
              <div className="positions-table">
                <div className="table-header">
                  <div>銘柄</div>
                  <div>数量</div>
                  <div>平均買値</div>
                  <div>実現損益</div>
                  <div>未実現損益</div>
                  <div>総損益</div>
                </div>
                {portfolio.positions.map((position) => (
                  <div key={position.symbol} className="table-row">
                    <div className="symbol">{position.symbol}</div>
                    <div>{position.netQty.toFixed(4)} BTC</div>
                    <div>{formatCurrency(position.averageBuyPrice)}</div>
                    <div style={{ color: getPnLColor(position.realizedPnL) }}>
                      {formatPnL(position.realizedPnL)}
                    </div>
                    <div style={{ color: getPnLColor(position.unrealizedPnL) }}>
                      {formatPnL(position.unrealizedPnL)}
                    </div>
                    <div style={{ color: getPnLColor(position.totalPnL) }}>
                      {formatPnL(position.totalPnL)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-positions">保有ポジションはありません</div>
            )}
          </div>

          {/* 取引履歴 */}
          <div className="trade-history">
            <div className="trade-history-header">
              <h3>取引履歴</h3>
              <select 
                value={selectedSymbol} 
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="symbol-filter"
              >
                <option value="all">全ての銘柄</option>
                {portfolio.positions.map(p => (
                  <option key={p.symbol} value={p.symbol}>{p.symbol}</option>
                ))}
              </select>
            </div>
            
            {tradeHistoryLoading ? (
              <div className="loading">取引履歴を読み込み中...</div>
            ) : tradeHistory.length > 0 ? (
              <div className="trades-table">
                <div className="table-header">
                  <div>時刻</div>
                  <div>銘柄</div>
                  <div>売買</div>
                  <div>数量</div>
                  <div>価格</div>
                  <div>実現損益</div>
                </div>
                {tradeHistory.map((trade) => (
                  <div key={trade.id} className="table-row">
                    <div>{new Date(trade.timestamp).toLocaleString('ja-JP')}</div>
                    <div>{trade.symbol}</div>
                    <div className={`side ${trade.side.toLowerCase()}`}>
                      {trade.side === 'BUY' ? '買い' : '売り'}
                    </div>
                    <div>{trade.quantity.toFixed(4)} BTC</div>
                    <div>{formatCurrency(trade.price)}</div>
                    <div style={{ color: getPnLColor(trade.realizedPnL || 0) }}>
                      {trade.realizedPnL ? formatPnL(trade.realizedPnL) : '-'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-trades">取引履歴はありません</div>
            )}
          </div>
        </>
      )}

      <style>{`
        .positions-screen {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          color: #333;
        }

        .positions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .positions-header h2 {
          margin: 0;
          color: #333;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mock-notice {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .refresh-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .refresh-button:hover {
          background: #2563eb;
        }

        .portfolio-summary, .positions-list, .trade-history {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .portfolio-summary h3, .positions-list h3, .trade-history h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .summary-item .label {
          font-weight: 500;
          color: #64748b;
        }

        .summary-item .value {
          font-weight: 600;
          font-size: 16px;
        }

        .summary-item .total-pnl {
          font-size: 18px;
          font-weight: 700;
        }

        .positions-table, .trades-table {
          width: 100%;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 100px 120px 120px 120px 120px;
          gap: 10px;
          padding: 10px;
          background: #f1f5f9;
          border-radius: 6px;
          font-weight: 600;
          color: #475569;
        }

        .trades-table .table-header {
          grid-template-columns: 150px 120px 60px 100px 120px 120px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 100px 120px 120px 120px 120px;
          gap: 10px;
          padding: 12px 10px;
          border-bottom: 1px solid #e2e8f0;
          align-items: center;
        }

        .trades-table .table-row {
          grid-template-columns: 150px 120px 60px 100px 120px 120px;
        }

        .table-row:hover {
          background: #f8fafc;
        }

        .symbol {
          font-weight: 500;
          color: #1e40af;
        }

        .side.buy {
          color: #16a34a;
          font-weight: 600;
        }

        .side.sell {
          color: #dc2626;
          font-weight: 600;
        }

        .trade-history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .symbol-filter {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
        }

        .no-positions, .no-trades, .loading {
          text-align: center;
          color: #64748b;
          padding: 40px;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 5px;
          }
          
          .trades-table .table-header,
          .trades-table .table-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PositionsScreen;
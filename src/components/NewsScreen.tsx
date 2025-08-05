import React, { useState, useEffect, useCallback } from 'react';
import { NewsSummary, NewsTranslation } from '../types';
import { apiClient } from '../services/api';

const NewsScreen: React.FC = () => {
  const [newsType, setNewsType] = useState<'summaries' | 'translations'>('summaries');
  const [summaries, setSummaries] = useState<NewsSummary[]>([]);
  const [translations, setTranslations] = useState<NewsTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  // モックデータ生成関数
  const generateMockSummaries = (): NewsSummary[] => {
    return [
      {
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        summary1_jp: 'ビットコインが急騰、50万円台を記録。機関投資家の参入が背景にある模様。',
        summary2_jp: '米連邦準備制度理事会（FED）が金利据え置きを発表。暗号資産市場にポジティブな影響。',
        summary3_jp: 'イーサリアムのアップデートが成功。ネットワーク効率性の向上が期待される。',
        impact: 8.5,
        bitcoin_price: '5000000'
      },
      {
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        summary1_jp: '大手企業による暗号資産への投資が増加。市場の成熟化が進む。',
        summary2_jp: '規制当局が暗号資産取引所への監督を強化。コンプライアンス体制の重要性が高まる。',
        summary3_jp: 'DeFi（分散型金融）プロトコルの資金流入が過去最高を記録。',
        impact: 7.2,
        bitcoin_price: '4980000'
      },
      {
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        summary1_jp: '中央銀行デジタル通貨（CBDC）の検討が世界各国で加速。',
        summary2_jp: 'NFT市場が活況。アート作品の高額取引が相次ぐ。',
        summary3_jp: 'ステーブルコインの市場規模が拡大。決済手段としての利用が増加。',
        impact: 6.8,
        bitcoin_price: '4950000'
      }
    ];
  };

  const generateMockTranslations = (): NewsTranslation[] => {
    return [
      {
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        url: 'https://example.com/crypto-news-1',
        title_jp: 'ビットコイン、史上最高値を更新',
        summary_jp: '機関投資家の大量買いにより、ビットコインが史上最高値を更新。マイクロストラテジーやテスラなどの企業が保有する暗号資産の価値も急上昇している。専門家は今後も上昇トレンドが続くと予想している。',
        impact: 9.1
      },
      {
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        url: 'https://example.com/crypto-news-2',
        title_jp: 'イーサリアム2.0のアップデート完了',
        summary_jp: 'イーサリアムネットワークの大型アップデートが無事完了。取引処理速度の向上と手数料の削減が実現された。開発者コミュニティからは高い評価を得ており、DeFiエコシステムの更なる発展が期待される。',
        impact: 8.3
      },
      {
        timestamp: new Date(Date.now() - 9000000).toISOString(),
        url: 'https://example.com/crypto-news-3',
        title_jp: '日本政府、デジタル円の実証実験を開始',
        summary_jp: '日本銀行と金融庁が共同で、中央銀行デジタル通貨（CBDC）である「デジタル円」の実証実験を開始。民間銀行との連携や一般消費者への影響を検証する予定。2025年の本格導入を目指している。',
        impact: 7.9
      }
    ];
  };

  const fetchNewsSummaries = useCallback(async (pageNum: number = 0, reset: boolean = true) => {
    if (reset) {
      setLoading(true);
      setError(null);
      setSummaries([]); // Clear old data immediately
    }

    try {
      if (useMockData) {
        const mockData = generateMockSummaries();
        if (reset) {
          setSummaries(mockData);
        } else {
          setSummaries(prev => [...prev, ...mockData]);
        }
        setHasMore(pageNum < 2); // モックデータは3ページまで
      } else {
        const response = await apiClient.getNewsSummaries(pageNum, 10);
        if (reset) {
          setSummaries(response.content);
        } else {
          setSummaries(prev => [...prev, ...response.content]);
        }
        setHasMore(pageNum < response.totalPages - 1);
        setUseMockData(false);
      }
    } catch (err) {
      console.error('ニュースサマリー取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラー');
      
      // エラー時はモックデータにフォールバック
      const mockData = generateMockSummaries();
      if (reset) {
        setSummaries(mockData);
      } else {
        setSummaries(prev => [...prev, ...mockData]);
      }
      setUseMockData(true);
      setHasMore(pageNum < 2);
    } finally {
      if (reset) {
        setLoading(false);
      }
    }
  }, [useMockData]);

  const fetchNewsTranslations = useCallback(async (pageNum: number = 0, reset: boolean = true) => {
    if (reset) {
      setLoading(true);
      setError(null);
      setTranslations([]); // Clear old data immediately
    }

    try {
      if (useMockData) {
        const mockData = generateMockTranslations();
        if (reset) {
          setTranslations(mockData);
        } else {
          setTranslations(prev => [...prev, ...mockData]);
        }
        setHasMore(pageNum < 2);
      } else {
        const response = await apiClient.getNewsTranslations(pageNum, 10);
        if (reset) {
          setTranslations(response.content);
        } else {
          setTranslations(prev => [...prev, ...response.content]);
        }
        setHasMore(pageNum < response.totalPages - 1);
        setUseMockData(false);
      }
    } catch (err) {
      console.error('ニュース翻訳取得エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラー');
      
      // エラー時はモックデータにフォールバック
      const mockData = generateMockTranslations();
      if (reset) {
        setTranslations(mockData);
      } else {
        setTranslations(prev => [...prev, ...mockData]);
      }
      setUseMockData(true);
      setHasMore(pageNum < 2);
    } finally {
      if (reset) {
        setLoading(false);
      }
    }
  }, [useMockData]);

  useEffect(() => {
    setPage(0);
    if (newsType === 'summaries') {
      fetchNewsSummaries(0, true);
    } else {
      fetchNewsTranslations(0, true);
    }
  }, [newsType, fetchNewsSummaries, fetchNewsTranslations]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    
    if (newsType === 'summaries') {
      fetchNewsSummaries(nextPage, false);
    } else {
      fetchNewsTranslations(nextPage, false);
    }
  };

  const handleRefresh = () => {
    setPage(0);
    if (newsType === 'summaries') {
      fetchNewsSummaries(0, true);
    } else {
      fetchNewsTranslations(0, true);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImpactColor = (score: number): string => {
    if (score >= 8) return '#ef4444'; // 高影響: 赤
    if (score >= 6) return '#f59e0b'; // 中影響: オレンジ
    return '#10b981'; // 低影響: 緑
  };

  const getImpactLabel = (score: number): string => {
    if (score >= 8) return '高';
    if (score >= 6) return '中';
    return '低';
  };

  if (loading) {
    return (
      <div className="news-screen">
        <div className="loading">ニュースを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="news-screen">
      <div className="news-header">
        <h2>ニュース</h2>
        <div className="header-controls">
          {useMockData && (
            <div className="mock-notice">⚠️ モックデータ表示中</div>
          )}
          <button onClick={handleRefresh} className="refresh-button">
            更新
          </button>
        </div>
      </div>

      <div className="news-tabs">
        <button 
          className={`tab-button ${newsType === 'summaries' ? 'active' : ''}`}
          onClick={() => setNewsType('summaries')}
        >
          ニュースサマリー
        </button>
        <button 
          className={`tab-button ${newsType === 'translations' ? 'active' : ''}`}
          onClick={() => setNewsType('translations')}
        >
          ニュース翻訳
        </button>
      </div>

      {error && (
        <div className="error-message">
          エラーが発生しました: {error}
        </div>
      )}

      <div className="news-content">
        {newsType === 'summaries' ? (
          <div className="summaries-list">
            {summaries.map((summary, index) => (
              <div key={`${summary.timestamp}-${index}`} className="summary-card">
                <div className="card-header">
                  <span className="timestamp">{formatTimestamp(summary.timestamp)}</span>
                  <div className="impact-badge" style={{ backgroundColor: getImpactColor(summary.impact || 0) }}>
                    影響度: {getImpactLabel(summary.impact || 0)} ({(summary.impact || 0).toFixed(1)})
                  </div>
                </div>
                
                {summary.bitcoin_price && (
                  <div className="bitcoin-price">
                    BTC価格: ${parseInt(summary.bitcoin_price).toLocaleString()}
                  </div>
                )}
                
                <div className="summaries">
                  <div className="summary-item">
                    <span className="summary-number">1.</span>
                    <span className="summary-text">{summary.summary1_jp}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-number">2.</span>
                    <span className="summary-text">{summary.summary2_jp}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-number">3.</span>
                    <span className="summary-text">{summary.summary3_jp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="translations-list">
            {translations.map((translation, index) => (
              <div key={`${translation.timestamp}-${index}`} className="translation-card">
                <div className="card-header">
                  <span className="timestamp">{formatTimestamp(translation.timestamp)}</span>
                  <div className="impact-badge" style={{ backgroundColor: getImpactColor(translation.impact || 0) }}>
                    影響度: {getImpactLabel(translation.impact || 0)} ({(translation.impact || 0).toFixed(1)})
                  </div>
                </div>
                
                <h3 className="news-title">{translation.title_jp}</h3>
                <p className="news-summary">{translation.summary_jp}</p>
                
                <a 
                  href={translation.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="news-link"
                >
                  元記事を読む →
                </a>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="load-more">
            <button onClick={handleLoadMore} className="load-more-button">
              さらに読み込む
            </button>
          </div>
        )}

        {!hasMore && (summaries.length > 0 || translations.length > 0) && (
          <div className="end-message">
            すべてのニュースを表示しました
          </div>
        )}
      </div>

      <style>{`
        .news-screen {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .news-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .news-header h2 {
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

        .news-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-button {
          background: none;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          color: #64748b;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-button:hover {
          color: #334155;
          background: #f8fafc;
        }

        .tab-button.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
        }

        .news-content {
          min-height: 400px;
        }

        .summary-card, .translation-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .timestamp {
          color: #64748b;
          font-size: 14px;
        }

        .impact-badge {
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .bitcoin-price {
          background: #f0f9ff;
          color: #0369a1;
          padding: 8px 12px;
          border-radius: 6px;
          font-weight: 600;
          margin-bottom: 16px;
          display: inline-block;
        }

        .summaries {
          space-y: 12px;
        }

        .summary-item {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          align-items: flex-start;
        }

        .summary-number {
          color: #3b82f6;
          font-weight: 600;
          min-width: 20px;
        }

        .summary-text {
          line-height: 1.6;
          color: #374151;
        }

        .news-title {
          color: #1e40af;
          margin: 0 0 12px 0;
          font-size: 18px;
          line-height: 1.4;
        }

        .news-summary {
          color: #374151;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .news-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .news-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .load-more {
          text-align: center;
          margin: 32px 0;
        }

        .load-more-button {
          background: #f8fafc;
          color: #3b82f6;
          border: 1px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .load-more-button:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .end-message {
          text-align: center;
          color: #64748b;
          font-style: italic;
          margin: 32px 0;
          padding: 20px;
        }

        .loading {
          text-align: center;
          color: #64748b;
          padding: 40px;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .news-screen {
            padding: 12px;
          }
          
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .tab-button {
            padding: 8px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default NewsScreen;
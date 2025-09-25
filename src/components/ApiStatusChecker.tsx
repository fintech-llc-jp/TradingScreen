import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { logger } from '../utils/logger';

const ApiStatusChecker: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>('');

  const checkApiStatus = async () => {
    setChecking(true);
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      logger.info('🔍 API状態確認を開始...');
      
      // 1. 保存されているトークンを確認
      const token = apiClient.getToken();
      logger.info('🔑 保存されているトークン:', token);
      logger.info('🔑 トークンの長さ:', token?.length);
      
      // 2. 手動でfetchテスト（プロキシ経由）
      logger.info('📡 プロキシ経由でのfetchテスト...');
      const proxyResponse = await fetch('/api/market/board/G_FX_BTCJPY?depth=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      logger.info('プロキシ経由ステータス:', proxyResponse.status, proxyResponse.statusText);
      
      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text();
        logger.error('プロキシ経由エラー:', errorText);
      } else {
        const data = await proxyResponse.json();
        logger.info('プロキシ経由成功:', data);
      }
      
      // 3. 直接アクセステスト（CORS回避のため）
      logger.info('🌐 直接アクセステスト...');
      try {
        const directResponse = await fetch('http://localhost:8080/api/market/board/G_FX_BTCJPY?depth=5', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        logger.info('直接アクセスステータス:', directResponse.status, directResponse.statusText);
      } catch (corsError) {
        logger.info('CORS制限により直接アクセス不可（正常）:', corsError);
      }
      
      // 4. APIクライアント経由テスト
      logger.info('📊 APIクライアント経由テスト...');
      await apiClient.getOrderBook('G_FX_BTCJPY', 5);
      logger.info('✅ APIクライアント: 成功');
      
      setLastCheck(`${timestamp} - API正常`);
      alert('API接続テスト成功！');
      
    } catch (error) {
      logger.error('❌ API状態確認エラー:', error);
      setLastCheck(`${timestamp} - API異常`);
      
      if (error instanceof Error) {
        logger.error('エラー詳細:', error.message);
        logger.error('エラースタック:', error.stack);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="api-status-checker">
      <button 
        onClick={checkApiStatus}
        disabled={checking}
        className="status-check-button"
      >
        {checking ? '確認中...' : 'API状態確認'}
      </button>
      {lastCheck && (
        <div className="last-check">
          最終確認: {lastCheck}
        </div>
      )}
    </div>
  );
};

export default ApiStatusChecker;
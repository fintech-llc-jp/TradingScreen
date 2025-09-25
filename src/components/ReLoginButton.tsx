import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { AUTH_CONFIG } from '../config/auth';
import { logger } from '../utils/logger';

interface ReLoginButtonProps {
  onLoginSuccess: () => void;
}

const ReLoginButton: React.FC<ReLoginButtonProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleReLogin = async () => {
    setLoading(true);
    
    try {
      logger.info('🔄 再ログインを試行中...');
      await apiClient.login({
        username: AUTH_CONFIG.username,
        password: AUTH_CONFIG.password
      });
      
      logger.info('✅ 再ログイン成功');
      onLoginSuccess();
      alert('再ログインが成功しました！');
    } catch (error) {
      logger.error('❌ 再ログインに失敗:', error);
      alert(`再ログインに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleReLogin}
      disabled={loading}
      className="relogin-button"
    >
      {loading ? '再ログイン中...' : '🔐 再ログイン'}
    </button>
  );
};

export default ReLoginButton;
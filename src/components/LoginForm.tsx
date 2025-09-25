import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { AUTH_CONFIG } from '../config/auth';
import { logger } from '../utils/logger';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onShowSignUp: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onShowSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualLogin = async () => {
    if (!username || !password) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      logger.info('🚀 Manual login initiated from LoginForm');
      await apiClient.login({
        username,
        password
      });
      logger.info('✅ Manual login successful in LoginForm');
      onLoginSuccess();
    } catch (err) {
      logger.error('❌ Manual login failed in LoginForm:', err);
      
      let errorMessage = 'ログインに失敗しました';
      if (err instanceof Error) {
        if (err.message.includes('403')) {
          errorMessage = 'アクセスが拒否されました。サーバー設定またはCORSの問題の可能性があります。';
        } else if (err.message.includes('401')) {
          errorMessage = 'ユーザー名またはパスワードが正しくありません。';
        } else if (err.message.includes('Network')) {
          errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('🤖 Auto login initiated from LoginForm');
      await apiClient.login({
        username: AUTH_CONFIG.username,
        password: AUTH_CONFIG.password
      });
      logger.info('✅ Auto login successful in LoginForm');
      onLoginSuccess();
    } catch (err) {
      logger.error('❌ Auto login failed in LoginForm:', err);
      
      let errorMessage = 'ログインに失敗しました';
      if (err instanceof Error) {
        if (err.message.includes('403')) {
          errorMessage = 'アクセスが拒否されました。サーバー設定またはCORSの問題の可能性があります。';
        } else if (err.message.includes('401')) {
          errorMessage = 'デモアカウントの認証に失敗しました。';
        } else if (err.message.includes('Network')) {
          errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Trading Screen</h2>
        <p>マーケットデータを表示するためにログインしてください</p>
        
        <div className="form-group">
          <label htmlFor="username">ユーザー名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
          />
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          onClick={handleManualLogin}
          disabled={loading}
          className="login-button"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>

        <div className="auto-login-section">
          <p>または</p>
          <button 
            onClick={handleAutoLogin}
            disabled={loading}
            className="auto-login-button"
          >
            {loading ? 'ログイン中...' : 'デモアカウントでログイン'}
          </button>
        </div>

        <div className="signup-link">
          <p>アカウントをお持ちでない方は</p>
          <button 
            onClick={onShowSignUp}
            className="link-button"
          >
            新規登録はこちら
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
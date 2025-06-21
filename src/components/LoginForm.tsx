import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { AUTH_CONFIG } from '../config/auth';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAutoLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.login({
        username: AUTH_CONFIG.username,
        password: AUTH_CONFIG.password
      });
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Trading Screen</h2>
        <p>マーケットデータを表示するためにログインしてください</p>
        
        <div className="login-info">
          <p><strong>ユーザー名:</strong> {AUTH_CONFIG.username}</p>
          <p><strong>パスワード:</strong> {AUTH_CONFIG.password}</p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          onClick={handleAutoLogin}
          disabled={loading}
          className="login-button"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
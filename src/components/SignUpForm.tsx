import React, { useState } from 'react';
import { apiClient } from '../services/api';

interface SignUpFormProps {
  onSignUpSuccess: () => void;
  onShowLogin: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUpSuccess, onShowLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!username || !password) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.signUp({ username, password });
      onSignUpSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'サインアップに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>アカウント登録</h2>
        <p>新しいアカウントを作成します。</p>
        
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

        <div className="warning-message">
          <p><strong>重要:</strong> ユーザー名とパスワードは忘れないように安全な場所に保管してください。紛失した場合、復元することはできません。</p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          onClick={handleSignUp}
          disabled={loading}
          className="login-button"
        >
          {loading ? '登録中...' : '登録'}
        </button>

        <div className="login-link">
          <p>すでにアカウントをお持ちの方は</p>
          <button 
            onClick={onShowLogin}
            className="link-button"
          >
            ログインはこちら
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
import { useState, useEffect } from 'react';
import NewTradingScreen from './components/NewTradingScreen';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
import { apiClient } from './services/api';
import './App.css';
import './NewApp.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
    
    // トークン期限切れイベントリスナーを追加
    const handleTokenExpired = () => {
      console.warn('🔐 トークンが期限切れになりました。再ログインしてください。');
      setIsAuthenticated(false);
      alert('セッションが期限切れになりました。再ログインしてください。');
    };

    // ユーザーログアウトイベントリスナーを追加
    const handleUserLogout = () => {
      console.log('👋 ユーザーがログアウトしました');
      setIsAuthenticated(false);
      setShowSignUp(false); // ログイン画面に戻る
    };
    
    window.addEventListener('token-expired', handleTokenExpired);
    window.addEventListener('user-logout', handleUserLogout);
    
    return () => {
      window.removeEventListener('token-expired', handleTokenExpired);
      window.removeEventListener('user-logout', handleUserLogout);
    };
  }, []);

  const handleSignUpSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading">アプリケーションを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <NewTradingScreen />
      ) : showSignUp ? (
        <SignUpForm 
          onSignUpSuccess={handleSignUpSuccess} 
          onShowLogin={() => setShowSignUp(false)}
        />
      ) : (
        <LoginForm 
          onLoginSuccess={handleLoginSuccess}
          onShowSignUp={() => setShowSignUp(true)}
        />
      )}
    </div>
  );
}

export default App;
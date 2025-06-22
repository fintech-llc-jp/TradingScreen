import { useState, useEffect } from 'react';
import NewTradingScreen from './components/NewTradingScreen';
import LoginForm from './components/LoginForm';
import { apiClient } from './services/api';
import './App.css';
import './NewApp.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    
    window.addEventListener('token-expired', handleTokenExpired);
    
    return () => {
      window.removeEventListener('token-expired', handleTokenExpired);
    };
  }, []);

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
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
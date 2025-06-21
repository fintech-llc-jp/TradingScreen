import { useState, useEffect } from 'react';
import TradingScreen from './components/TradingScreen';
import LoginForm from './components/LoginForm';
import { apiClient } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
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
        <TradingScreen />
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
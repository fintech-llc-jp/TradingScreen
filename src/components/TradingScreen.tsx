import React from 'react';
import { Symbol } from '../types';
import MarketBoard from './MarketBoard';

const SYMBOLS: Symbol[] = ['G_BTCJPY', 'G_FX_BTCJPY', 'B_BTCJPY', 'B_FX_BTCJPY'];

const TradingScreen: React.FC = () => {
  return (
    <div className="trading-screen">
      <header className="app-header">
        <h1>Trading Screen</h1>
        <div className="status-indicator">
          <span className="status-dot"></span>
          Live Market Data
        </div>
      </header>
      
      <main className="market-grid">
        {SYMBOLS.map((symbol) => (
          <MarketBoard key={symbol} symbol={symbol} />
        ))}
      </main>
    </div>
  );
};

export default TradingScreen;
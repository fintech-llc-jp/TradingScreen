import React from 'react';
import { Symbol } from '../types';
import { formatSymbol } from '../utils/formatters';

interface SymbolSelectorProps {
  symbols: Symbol[];
  selectedSymbol: Symbol;
  onSymbolChange: (symbol: Symbol) => void;
}

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  symbols,
  selectedSymbol,
  onSymbolChange,
}) => {
  return (
    <div className="symbol-selector">
      <h2 className="selector-title">商品選択</h2>
      <div className="symbol-tabs">
        {symbols.map((symbol) => (
          <button
            key={symbol}
            className={`symbol-tab ${selectedSymbol === symbol ? 'active' : ''}`}
            onClick={() => onSymbolChange(symbol)}
          >
            {formatSymbol(symbol)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SymbolSelector;
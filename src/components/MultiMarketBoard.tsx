import React, { useState, useCallback, memo } from 'react';
import { OrderBook, Symbol, OrderRequest } from '../types';
import { formatSymbol, formatPrice, formatQuantity } from '../utils/formatters';
import CompactOrderForm from './CompactOrderForm';

interface MultiMarketBoardProps {
  symbols: Symbol[];
  onPlaceOrder: (order: OrderRequest) => Promise<void>;
  orderBooks: Record<Symbol, OrderBook | null>;
  initialLoading: Record<Symbol, boolean>;
  errors: Record<Symbol, string | null>;
  useMockData: boolean;
}

interface CompactMarketDisplayProps {
  symbol: Symbol;
  orderBook: OrderBook | null;
  initialLoading: boolean;
  error: string | null;
}

interface CompactOrderBookProps {
  symbol: Symbol;
  orderBook: OrderBook | null;
  initialLoading: boolean;
  error: string | null;
  onPlaceOrder: (order: OrderRequest) => Promise<void>;
  formState: OrderFormState;
  onFormStateChange: (state: Partial<OrderFormState>) => void;
}

const CompactMarketDisplay: React.FC<CompactMarketDisplayProps> = memo(({
  symbol,
  orderBook,
  initialLoading,
  error,
}) => {
  if (initialLoading) {
    return (
      <>
        <div className="market-symbol">{formatSymbol(symbol)}</div>
        <div className="loading-compact">読み込み中...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="market-symbol">{formatSymbol(symbol)}</div>
        <div className="error-compact">エラー</div>
      </>
    );
  }

  if (!orderBook || !orderBook.asks.length || !orderBook.bids.length) {
    return (
      <>
        <div className="market-symbol">{formatSymbol(symbol)}</div>
        <div className="no-data-compact">データなし</div>
      </>
    );
  }

  const asks = orderBook.asks.slice(0, 8);
  const bids = orderBook.bids.slice(0, 8);

  return (
    <>
      <div className="market-symbol">{formatSymbol(symbol)}</div>
      
      <div className="compact-order-book">
        <div className="compact-price-header">
          <span className="compact-header-label">Ask</span>
          <span className="compact-current-price"></span>
          <span className="compact-header-label right">Bid</span>
        </div>
        
        <div className="compact-order-book-content">
          <div className="compact-asks-section">
            {asks.slice().reverse().map((ask, index) => (
              <div key={index} className="compact-order-level ask-level">
                <div className="compact-level-data">
                  <span className="compact-quantity ask-quantity">{formatQuantity(ask.quantity)}</span>
                  <span className="compact-price ask-price">{formatPrice(ask.price)}</span>
                  <span className="compact-quantity-spacer"></span>
                </div>
              </div>
            ))}
          </div>

          <div className="compact-spread-section">
            {asks.length > 0 && bids.length > 0 && (
              <div className="compact-spread">
                スプレッド: {formatPrice(asks[0].price - bids[0].price)}
              </div>
            )}
          </div>
          
          <div className="compact-bids-section">
            {bids.map((bid, index) => (
              <div key={index} className="compact-order-level bid-level">
                <div className="compact-level-data">
                  <span className="compact-quantity-spacer"></span>
                  <span className="compact-price bid-price">{formatPrice(bid.price)}</span>
                  <span className="compact-quantity bid-quantity">{formatQuantity(bid.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
});

const CompactOrderBook: React.FC<CompactOrderBookProps> = ({
  symbol,
  orderBook,
  initialLoading,
  error,
  onPlaceOrder,
  formState,
  onFormStateChange,
}) => {
  return (
    <div className="compact-market-item">
      <CompactMarketDisplay
        symbol={symbol}
        orderBook={orderBook}
        initialLoading={initialLoading}
        error={error}
      />
      
      <CompactOrderForm
        symbol={symbol}
        orderBook={orderBook}
        onPlaceOrder={onPlaceOrder}
        formState={formState}
        onFormStateChange={onFormStateChange}
      />
    </div>
  );
};

interface OrderFormState {
  side: 'BUY' | 'SELL';
  ordType: 'LIMIT' | 'MARKET';
  price: string;
  quantity: string;
}

const MultiMarketBoard: React.FC<MultiMarketBoardProps> = ({ 
  symbols, 
  onPlaceOrder, 
  orderBooks, 
  initialLoading, 
  errors, 
  useMockData 
}) => {
  const [orderFormStates, setOrderFormStates] = useState<Record<Symbol, OrderFormState>>({});


  const getOrderFormState = useCallback((symbol: Symbol): OrderFormState => {
    return orderFormStates[symbol] || {
      side: 'BUY',
      ordType: 'LIMIT',
      price: '',
      quantity: ''
    };
  }, [orderFormStates]);

  const updateOrderFormState = useCallback((symbol: Symbol, state: Partial<OrderFormState>) => {
    setOrderFormStates(prev => ({
      ...prev,
      [symbol]: { ...getOrderFormState(symbol), ...state }
    }));
  }, [getOrderFormState]);


  return (
    <div className="multi-market-board">
      <div className="multi-market-header">
        <h3>マーケット一覧</h3>
      </div>
      
      {useMockData && (
        <div className="mock-notice-compact">
          ⚠️ モックデータ表示中
        </div>
      )}
      
      <div className="markets-grid">
        {symbols.map(symbol => (
          <CompactOrderBook
            key={symbol}
            symbol={symbol}
            orderBook={orderBooks[symbol] || null}
            initialLoading={initialLoading[symbol] || false}
            error={errors[symbol] || null}
            onPlaceOrder={onPlaceOrder}
            formState={getOrderFormState(symbol)}
            onFormStateChange={(state) => updateOrderFormState(symbol, state)}
          />
        ))}
      </div>
    </div>
  );
};

export default MultiMarketBoard;
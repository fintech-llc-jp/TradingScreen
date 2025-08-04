import React, { useState, memo } from 'react';
import { Symbol, OrderRequest, OrderBook } from '../types';

interface OrderFormState {
  side: 'BUY' | 'SELL';
  ordType: 'LIMIT' | 'MARKET';
  price: string;
  quantity: string;
}

interface CompactOrderFormProps {
  symbol: Symbol;
  orderBook: OrderBook | null;
  onPlaceOrder: (order: OrderRequest) => Promise<void>;
  formState: OrderFormState;
  onFormStateChange: (state: Partial<OrderFormState>) => void;
}

const CompactOrderForm: React.FC<CompactOrderFormProps> = ({
  symbol,
  orderBook,
  onPlaceOrder,
  formState,
  onFormStateChange,
}) => {
  const [loading, setLoading] = useState(false);
  
  const { side, ordType, price, quantity } = formState;

  const bestBid = orderBook?.bids.length ? orderBook.bids[0].price : undefined;
  const bestAsk = orderBook?.asks.length ? orderBook.asks[0].price : undefined;

  const handleQuickPrice = (type: 'bid' | 'ask') => {
    if (type === 'bid' && bestBid) {
      onFormStateChange({ price: bestBid.toString() });
    } else if (type === 'ask' && bestAsk) {
      onFormStateChange({ price: bestAsk.toString() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const numPrice = parseFloat(price);
    const numQuantity = parseFloat(quantity);

    if (ordType === 'LIMIT' && (!numPrice || numPrice <= 0)) {
      alert('有効な価格を入力してください');
      return;
    }

    if (!numQuantity || numQuantity < 0.001) {
      alert('数量は0.001以上で入力してください');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        symbol,
        price: ordType === 'MARKET' ? (side === 'BUY' ? bestAsk || 0 : bestBid || 0) : numPrice,
        quantity: numQuantity,
        side,
        ordType,
        tif: 'GTC' as const,
      };

      await onPlaceOrder(orderData);
      onFormStateChange({ price: '', quantity: '' });
    } catch (error) {
      console.error('注文エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compact-order-form">
      <form onSubmit={handleSubmit}>
        <div className="compact-order-controls">
          <div className="compact-side-selector">
            <button
              type="button"
              className={`compact-side-btn ${side === 'BUY' ? 'active buy' : ''}`}
              onClick={() => onFormStateChange({ side: 'BUY' })}
            >
              買い
            </button>
            <button
              type="button"
              className={`compact-side-btn ${side === 'SELL' ? 'active sell' : ''}`}
              onClick={() => onFormStateChange({ side: 'SELL' })}
            >
              売り
            </button>
          </div>

          <div className="compact-order-type">
            <select
              value={ordType}
              onChange={(e) => {
                const newValue = e.target.value as 'LIMIT' | 'MARKET';
                onFormStateChange({ ordType: newValue });
              }}
              className="compact-select"
            >
              <option value="LIMIT">指値</option>
              <option value="MARKET">成行</option>
            </select>
          </div>
        </div>

        {ordType === 'LIMIT' && (
          <div className="compact-price-input">
            <div className="compact-input-group">
              <input
                type="number"
                value={price}
                onChange={(e) => onFormStateChange({ price: e.target.value })}
                placeholder="価格"
                className="compact-input"
                step="0.01"
              />
              <div className="compact-quick-buttons">
                <button
                  type="button"
                  className="compact-quick-btn bid-btn"
                  onClick={() => handleQuickPrice('bid')}
                  disabled={!bestBid}
                >
                  Bid
                </button>
                <button
                  type="button"
                  className="compact-quick-btn ask-btn"
                  onClick={() => handleQuickPrice('ask')}
                  disabled={!bestAsk}
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="compact-quantity-input">
          <input
            type="number"
            value={quantity}
            onChange={(e) => onFormStateChange({ quantity: e.target.value })}
            placeholder="数量"
            className="compact-input"
            step="0.001"
            min="0.001"
          />
        </div>

        <button
          type="submit"
          disabled={loading || (!price && ordType === 'LIMIT') || !quantity}
          className={`compact-submit-btn ${side.toLowerCase()}`}
        >
          {loading ? '処理中...' : `${side === 'BUY' ? '買い' : '売り'}注文`}
        </button>
      </form>
    </div>
  );
};

export default memo(CompactOrderForm);
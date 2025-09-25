import React, { useState } from 'react';
import { Symbol, OrderRequest } from '../types';
import { logger } from '../utils/logger';

interface OrderFormProps {
  symbol: Symbol;
  onPlaceOrder: (order: OrderRequest) => Promise<void>;
  bestBid?: number;
  bestAsk?: number;
}

const OrderForm: React.FC<OrderFormProps> = ({
  symbol,
  onPlaceOrder,
  bestBid,
  bestAsk,
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [ordType, setOrdType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [tif, setTif] = useState<'GTC' | 'IOC' | 'FOK'>('GTC');
  const [loading, setLoading] = useState(false);

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
        quantity: numQuantity, // 0.01 BTC をそのまま送信
        side,
        ordType,
        tif,
      };
      
      logger.info('📝 注文データ:', orderData);
      logger.info(`💡 入力: ${numQuantity} BTC → API送信: ${orderData.quantity} BTC`);
      
      await onPlaceOrder(orderData);
      
      if (ordType === 'LIMIT') {
        setPrice('');
      }
      setQuantity('');
    } catch (error) {
      logger.error('注文エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillBestPrice = () => {
    if (side === 'BUY' && bestBid) {
      setPrice(bestBid.toString());
    } else if (side === 'SELL' && bestAsk) {
      setPrice(bestAsk.toString());
    }
  };

  return (
    <div className="order-form">
      <h3 className="order-form-title">注文</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="order-controls">
          <div className="side-selector">
            <button
              type="button"
              className={`side-button buy-button ${side === 'BUY' ? 'active' : ''}`}
              onClick={() => setSide('BUY')}
            >
              買い
            </button>
            <button
              type="button"
              className={`side-button sell-button ${side === 'SELL' ? 'active' : ''}`}
              onClick={() => setSide('SELL')}
            >
              売り
            </button>
          </div>

          <div className="order-type-selector">
            <label>
              <input
                type="radio"
                value="LIMIT"
                checked={ordType === 'LIMIT'}
                onChange={(e) => setOrdType(e.target.value as 'LIMIT')}
              />
              指値
            </label>
            <label>
              <input
                type="radio"
                value="MARKET"
                checked={ordType === 'MARKET'}
                onChange={(e) => setOrdType(e.target.value as 'MARKET')}
              />
              成行
            </label>
          </div>
        </div>

        {ordType === 'LIMIT' && (
          <div className="input-group">
            <label>価格</label>
            <div className="price-input-container">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="価格を入力"
                step="1"
                min="0"
                required
              />
              <button
                type="button"
                className="best-price-button"
                onClick={fillBestPrice}
                title="最良価格を入力"
              >
                最良
              </button>
            </div>
          </div>
        )}

        <div className="input-group">
          <label>数量 (BTC)</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.001以上で入力"
            step="0.001"
            min="0.001"
            required
          />
        </div>

        <div className="input-group">
          <label>有効期限</label>
          <select
            value={tif}
            onChange={(e) => setTif(e.target.value as 'GTC' | 'IOC' | 'FOK')}
          >
            <option value="GTC">GTC (注文取消まで有効)</option>
            <option value="IOC">IOC (即座に約定または取消)</option>
            <option value="FOK">FOK (全量約定または取消)</option>
          </select>
        </div>

        <button
          type="submit"
          className={`submit-button ${side.toLowerCase()}-submit`}
          disabled={loading}
        >
          {loading ? '注文中...' : `${side === 'BUY' ? '買い' : '売り'}注文`}
        </button>
      </form>

      <div className="market-info">
        <div className="info-row">
          <span>最良買い価格:</span>
          <span className="bid-price">{bestBid ? bestBid.toLocaleString() : '---'}</span>
        </div>
        <div className="info-row">
          <span>最良売り価格:</span>
          <span className="ask-price">{bestAsk ? bestAsk.toLocaleString() : '---'}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
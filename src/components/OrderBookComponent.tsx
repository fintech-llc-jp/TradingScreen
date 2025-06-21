import React from 'react';
import { OrderBook } from '../types';
import { formatPrice, formatQuantity } from '../utils/formatters';

interface OrderBookComponentProps {
  orderBook: OrderBook | null;
  loading: boolean;
  error: string | null;
}

const OrderBookComponent: React.FC<OrderBookComponentProps> = ({
  orderBook,
  loading,
  error,
}) => {
  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="error">エラー: {error}</div>;
  }

  if (!orderBook) {
    return <div className="no-data">データがありません</div>;
  }

  const maxQuantity = Math.max(
    ...orderBook.bids.map(b => b.quantity),
    ...orderBook.asks.map(a => a.quantity)
  );

  return (
    <div className="order-book">
      <div className="asks-section">
        <div className="section-header">売り注文 (Ask)</div>
        <div className="book-levels">
          {orderBook.asks.slice().reverse().map((ask, index) => (
            <div key={index} className="book-level ask-level">
              <div 
                className="quantity-bar ask-bar"
                style={{ width: `${(ask.quantity / maxQuantity) * 100}%` }}
              />
              <div className="level-content">
                <span className="price ask-price">{formatPrice(ask.price)}</span>
                <span className="quantity">{formatQuantity(ask.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="spread-section">
        <div className="spread-info">
          {orderBook.asks.length > 0 && orderBook.bids.length > 0 && (
            <div className="spread">
              スプレッド: {formatPrice(orderBook.asks[0].price - orderBook.bids[0].price)}
            </div>
          )}
        </div>
      </div>

      <div className="bids-section">
        <div className="section-header">買い注文 (Bid)</div>
        <div className="book-levels">
          {orderBook.bids.map((bid, index) => (
            <div key={index} className="book-level bid-level">
              <div 
                className="quantity-bar bid-bar"
                style={{ width: `${(bid.quantity / maxQuantity) * 100}%` }}
              />
              <div className="level-content">
                <span className="price bid-price">{formatPrice(bid.price)}</span>
                <span className="quantity">{formatQuantity(bid.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBookComponent;
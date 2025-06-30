import React from 'react';
import { OrderBook } from '../types';
import { formatPrice, formatQuantity } from '../utils/formatters';

interface DetailedOrderBookProps {
  orderBook: OrderBook | null;
  loading: boolean;
  error: string | null;
  lastPrice?: number;
  volume24h?: number;
}

const DetailedOrderBook: React.FC<DetailedOrderBookProps> = ({
  orderBook,
  loading,
  error,
  lastPrice,
  volume24h,
}) => {
  if (loading) {
    return <div className="detailed-loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="detailed-error">エラー: {error}</div>;
  }

  if (!orderBook) {
    return <div className="detailed-no-data">データがありません</div>;
  }

  const bestBid = orderBook.bids.length > 0 ? orderBook.bids[0].price : 0;
  const bestAsk = orderBook.asks.length > 0 ? orderBook.asks[0].price : 0;
  const spread = bestAsk - bestBid;
  const spreadPercentage = bestBid > 0 ? (spread / bestBid) * 100 : 0;

  const maxQuantity = Math.max(
    ...orderBook.bids.map(b => b.quantity),
    ...orderBook.asks.map(a => a.quantity)
  );

  return (
    <div className="detailed-order-book">
      <div className="market-header">
        <div className="market-status">
          <span className="status-label">マーケット:</span>
          <span className="status-value running">RUNNING</span>
          <div className="status-indicators">
            <div className="indicator"></div>
            <div className="indicator"></div>
            <div className="indicator"></div>
            <div className="indicator"></div>
          </div>
        </div>
        <div className="volume-info">
          <span className="volume-label">24時間取引量:</span>
          <span className="volume-value">{volume24h?.toFixed(4) || '0.0000'} BTC</span>
        </div>
      </div>

      <div className="price-header">
        <span className="header-label">Ask</span>
        <span className="current-price"></span>
        <span className="header-label right">Bid</span>
      </div>

      <div className="order-book-content">
        <div className="asks-section">
          {orderBook.asks.slice().reverse().map((ask, index) => (
            <div key={index} className="order-level ask-level">
              <div 
                className="quantity-bar ask-bar"
                style={{ width: `${(ask.quantity / maxQuantity) * 100}%` }}
              />
              <div className="level-data">
                <span className="quantity ask-quantity">{formatQuantity(ask.quantity)}</span>
                <span className="price ask-price">{formatPrice(ask.price)}</span>
                <span className="quantity-spacer"></span>
              </div>
            </div>
          ))}
        </div>

        <div className="spread-info-section">
          <div className="spread-container">
            <div className="spread-details">
              <span className="spread-label">スプレッド:</span>
              <span className="spread-value">
                {formatPrice(spread)} ({spreadPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="bids-section">
          {orderBook.bids.map((bid, index) => (
            <div key={index} className="order-level bid-level">
              <div 
                className="quantity-bar bid-bar"
                style={{ width: `${(bid.quantity / maxQuantity) * 100}%` }}
              />
              <div className="level-data">
                <span className="quantity-spacer"></span>
                <span className="price bid-price">{formatPrice(bid.price)}</span>
                <span className="quantity bid-quantity">{formatQuantity(bid.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailedOrderBook;
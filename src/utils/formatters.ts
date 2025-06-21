export const formatPrice = (price: number): string => {
  return price.toLocaleString('ja-JP');
};

export const formatQuantity = (quantity: number): string => {
  return quantity.toLocaleString('ja-JP');
};

export const formatSymbol = (symbol: string): string => {
  switch (symbol) {
    case 'G_BTCJPY':
      return 'GMO BTC/JPY (現物)';
    case 'G_FX_BTCJPY':
      return 'GMO BTC/JPY (FX)';
    case 'B_BTCJPY':
      return 'bitFlyer BTC/JPY (現物)';
    case 'B_FX_BTCJPY':
      return 'bitFlyer BTC/JPY (FX)';
    default:
      return symbol;
  }
};

export const getSpread = (bestBid?: number, bestAsk?: number): number | null => {
  if (bestBid && bestAsk) {
    return bestAsk - bestBid;
  }
  return null;
};

export const getSpreadPercentage = (bestBid?: number, bestAsk?: number): number | null => {
  const spread = getSpread(bestBid, bestAsk);
  if (spread && bestBid) {
    return (spread / bestBid) * 100;
  }
  return null;
};
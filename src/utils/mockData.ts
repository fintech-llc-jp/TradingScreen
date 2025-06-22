import { OrderBook, Execution } from '../types';

export const getMockOrderBook = (symbol: string): OrderBook => {
  // 商品ごとに異なる価格を設定
  const basePrices: Record<string, number> = {
    'G_BTCJPY': 14980000,
    'G_FX_BTCJPY': 14981000,
    'B_BTCJPY': 14979000,
    'B_FX_BTCJPY': 14982000,
  };
  
  const basePrice = basePrices[symbol] || 14980000;
  const spread = 1000;
  
  return {
    symbol,
    bids: [
      { price: basePrice - spread, quantity: 10000 },
      { price: basePrice - spread - 500, quantity: 34400 },
      { price: basePrice - spread - 1000, quantity: 600000 },
      { price: basePrice - spread - 1500, quantity: 165800 },
      { price: basePrice - spread - 2000, quantity: 25400 },
      { price: basePrice - spread - 2500, quantity: 274000 },
      { price: basePrice - spread - 3000, quantity: 38996 },
      { price: basePrice - spread - 3500, quantity: 106480 },
      { price: basePrice - spread - 4000, quantity: 10000 },
      { price: basePrice - spread - 4500, quantity: 109560 },
    ],
    asks: [
      { price: basePrice, quantity: 10000 },
      { price: basePrice + 500, quantity: 105688 },
      { price: basePrice + 1000, quantity: 52000 },
      { price: basePrice + 1500, quantity: 25300 },
      { price: basePrice + 2000, quantity: 25400 },
      { price: basePrice + 2500, quantity: 112288 },
      { price: basePrice + 3000, quantity: 179896 },
      { price: basePrice + 3500, quantity: 110088 },
      { price: basePrice + 4000, quantity: 55000 },
      { price: basePrice + 4500, quantity: 33000 },
    ],
  };
};

export const getMockExecutions = (): Execution[] => {
  const now = new Date();
  return [
    {
      execID: 'exec1',
      orderId: 'order1',
      clOrdID: 'client1',
      symbol: 'G_FX_BTCJPY',
      side: 'BUY',
      lastQty: 10000,
      lastPx: 14980000,
      leavesQty: 0,
      cumQty: 10000,
      avgPx: 14980000,
      ordStatus: 'FILLED',
      execType: 'TRADE',
      transactTime: new Date(now.getTime() - 60000).toISOString(),
    },
    {
      execID: 'exec2',
      orderId: 'order2',
      clOrdID: 'client2',
      symbol: 'G_FX_BTCJPY',
      side: 'SELL',
      lastQty: 5000,
      lastPx: 14979000,
      leavesQty: 0,
      cumQty: 5000,
      avgPx: 14979000,
      ordStatus: 'FILLED',
      execType: 'TRADE',
      transactTime: new Date(now.getTime() - 120000).toISOString(),
    },
  ];
};
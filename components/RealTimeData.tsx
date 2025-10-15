'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, Activity } from 'lucide-react';
import type { SolanaTransactionExplanation } from '@/types/transaction';

interface Props {
  transaction: SolanaTransactionExplanation;
}

interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export default function RealTimeData({ transaction }: Props) {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock market data - in a real app, this would come from an API
  useEffect(() => {
    const mockData: Record<string, MarketData> = {
      'SOL': {
        price: 200.45,
        change24h: 2.34,
        volume24h: 1200000000,
        marketCap: 95000000000
      },
      'WSOL': {
        price: 200.45,
        change24h: 2.34,
        volume24h: 1200000000,
        marketCap: 95000000000
      },
      '抹茶币': {
        price: 0.000015,
        change24h: -5.67,
        volume24h: 5000000,
        marketCap: 15000000
      }
    };
    
    setTimeout(() => {
      setMarketData(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getTokensInTransaction = () => {
    const tokens = new Set<string>();
    transaction.tokenTransfers.forEach(transfer => {
      if (transfer.tokenSymbol) {
        tokens.add(transfer.tokenSymbol);
      }
    });
    return Array.from(tokens);
  };

  const tokens = getTokensInTransaction();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Loading Market Data...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Real-Time Market Data</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          Live
        </div>
      </div>
      
      <div className="space-y-4">
        {tokens.map(token => {
          const data = marketData[token];
          if (!data) return null;
          
          const isPositive = data.change24h >= 0;
          
          return (
            <div key={token} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{token}</h4>
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Price</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${data.price.toFixed(data.price < 1 ? 6 : 2)}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Activity className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">24h Volume</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${(data.volume24h / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
              
              {data.marketCap > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Market Cap: ${(data.marketCap / 1000000000).toFixed(1)}B
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 <strong>Market Context:</strong> Token prices can change rapidly. The values shown here are current market rates and may differ from your transaction time.
        </p>
      </div>
    </div>
  );
}

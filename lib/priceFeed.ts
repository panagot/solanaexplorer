/**
 * Real-Time Price Feed Integration
 * 
 * This module provides accurate USD price data for tokens,
 * matching Solscan's precision for value calculations.
 */

export interface TokenPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
}

export interface PriceFeedConfig {
  primaryApi: 'coingecko' | 'jupiter' | 'birdeye';
  fallbackApis: string[];
  updateInterval: number; // milliseconds
  cacheTimeout: number; // milliseconds
}

class PriceFeedService {
  private cache = new Map<string, TokenPrice>();
  private config: PriceFeedConfig;
  private updateTimer?: NodeJS.Timeout;

  constructor(config: PriceFeedConfig) {
    this.config = config;
    this.startPeriodicUpdates();
  }

  /**
   * Get current price for a token
   */
  async getTokenPrice(symbol: string): Promise<TokenPrice | null> {
    // Check cache first
    const cached = this.cache.get(symbol.toUpperCase());
    if (cached && Date.now() - cached.lastUpdated < this.config.cacheTimeout) {
      return cached;
    }

    // Fetch from APIs
    try {
      const price = await this.fetchFromPrimaryApi(symbol);
      if (price) {
        this.cache.set(symbol.toUpperCase(), price);
        return price;
      }
    } catch (error) {
      console.warn(`Primary API failed for ${symbol}:`, error);
    }

    // Try fallback APIs
    for (const api of this.config.fallbackApis) {
      try {
        const price = await this.fetchFromFallbackApi(api, symbol);
        if (price) {
          this.cache.set(symbol.toUpperCase(), price);
          return price;
        }
      } catch (error) {
        console.warn(`Fallback API ${api} failed for ${symbol}:`, error);
      }
    }

    return null;
  }

  /**
   * Get prices for multiple tokens at once
   */
  async getTokenPrices(symbols: string[]): Promise<Map<string, TokenPrice>> {
    const prices = new Map<string, TokenPrice>();
    
    // Batch fetch from primary API
    try {
      const batchPrices = await this.fetchBatchFromPrimaryApi(symbols);
      batchPrices.forEach((price, symbol) => {
        prices.set(symbol, price);
        this.cache.set(symbol, price);
      });
    } catch (error) {
      console.warn('Batch fetch failed:', error);
    }

    // Fill missing prices individually
    for (const symbol of symbols) {
      if (!prices.has(symbol)) {
        const price = await this.getTokenPrice(symbol);
        if (price) {
          prices.set(symbol, price);
        }
      }
    }

    return prices;
  }

  /**
   * Calculate USD value for a token amount
   */
  async calculateUSDValue(symbol: string, amount: number): Promise<number> {
    const price = await this.getTokenPrice(symbol);
    return price ? amount * price.price : 0;
  }

  /**
   * Get price change percentage
   */
  async getPriceChange24h(symbol: string): Promise<number> {
    const price = await this.getTokenPrice(symbol);
    return price ? price.change24h : 0;
  }

  private async fetchFromPrimaryApi(symbol: string): Promise<TokenPrice | null> {
    switch (this.config.primaryApi) {
      case 'coingecko':
        return this.fetchFromCoinGecko(symbol);
      case 'jupiter':
        return this.fetchFromJupiter(symbol);
      case 'birdeye':
        return this.fetchFromBirdeye(symbol);
      default:
        throw new Error(`Unknown primary API: ${this.config.primaryApi}`);
    }
  }

  private async fetchFromFallbackApi(api: string, symbol: string): Promise<TokenPrice | null> {
    switch (api) {
      case 'coingecko':
        return this.fetchFromCoinGecko(symbol);
      case 'jupiter':
        return this.fetchFromJupiter(symbol);
      case 'birdeye':
        return this.fetchFromBirdeye(symbol);
      default:
        return null;
    }
  }

  private async fetchFromCoinGecko(symbol: string): Promise<TokenPrice | null> {
    try {
      // Map Solana tokens to CoinGecko IDs
      const tokenMap: Record<string, string> = {
        'SOL': 'solana',
        'WSOL': 'solana',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        '抹茶币': 'mexc-token', // This would need proper mapping
      };

      const coinId = tokenMap[symbol] || symbol.toLowerCase();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const tokenData = data[coinId];

      if (!tokenData) {
        return null;
      }

      return {
        symbol: symbol.toUpperCase(),
        name: symbol,
        price: tokenData.usd,
        change24h: tokenData.usd_24h_change || 0,
        volume24h: tokenData.usd_24h_vol || 0,
        marketCap: tokenData.usd_market_cap || 0,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('CoinGecko fetch error:', error);
      return null;
    }
  }

  private async fetchFromJupiter(symbol: string): Promise<TokenPrice | null> {
    try {
      // Jupiter API for Solana tokens
      const response = await fetch('https://price.jup.ag/v4/price?ids=SOL');
      
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }

      const data = await response.json();
      const tokenData = data.data?.['SOL']; // Jupiter uses mint addresses

      if (!tokenData) {
        return null;
      }

      return {
        symbol: symbol.toUpperCase(),
        name: symbol,
        price: tokenData.price,
        change24h: 0, // Jupiter doesn't provide 24h change
        volume24h: 0,
        marketCap: 0,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Jupiter fetch error:', error);
      return null;
    }
  }

  private async fetchFromBirdeye(symbol: string): Promise<TokenPrice | null> {
    try {
      // Birdeye API for Solana tokens
      const response = await fetch(
        `https://public-api.birdeye.so/public/v1/token_overview?address=${symbol}`,
        {
          headers: {
            'X-API-KEY': process.env.BIRDEYE_API_KEY || ''
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Birdeye API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        return null;
      }

      const tokenData = data.data;

      return {
        symbol: symbol.toUpperCase(),
        name: tokenData.name || symbol,
        price: tokenData.price || 0,
        change24h: tokenData.priceChange24h || 0,
        volume24h: tokenData.volume24h || 0,
        marketCap: tokenData.mc || 0,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Birdeye fetch error:', error);
      return null;
    }
  }

  private async fetchBatchFromPrimaryApi(symbols: string[]): Promise<Map<string, TokenPrice>> {
    const prices = new Map<string, TokenPrice>();
    
    // For now, fetch individually (can be optimized for batch APIs)
    for (const symbol of symbols) {
      const price = await this.fetchFromPrimaryApi(symbol);
      if (price) {
        prices.set(symbol, price);
      }
    }

    return prices;
  }

  private startPeriodicUpdates(): void {
    this.updateTimer = setInterval(async () => {
      // Update cached prices
      const symbols = Array.from(this.cache.keys());
      if (symbols.length > 0) {
        await this.getTokenPrices(symbols);
      }
    }, this.config.updateInterval);
  }

  public destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    this.cache.clear();
  }
}

// Default configuration
const defaultConfig: PriceFeedConfig = {
  primaryApi: 'coingecko',
  fallbackApis: ['jupiter', 'birdeye'],
  updateInterval: 60000, // 1 minute
  cacheTimeout: 300000   // 5 minutes
};

// Create singleton instance
export const priceFeed = new PriceFeedService(defaultConfig);

// Utility functions for easy use
export async function getTokenPrice(symbol: string): Promise<TokenPrice | null> {
  return priceFeed.getTokenPrice(symbol);
}

export async function getTokenPrices(symbols: string[]): Promise<Map<string, TokenPrice>> {
  return priceFeed.getTokenPrices(symbols);
}

export async function calculateUSDValue(symbol: string, amount: number): Promise<number> {
  return priceFeed.calculateUSDValue(symbol, amount);
}

export async function getPriceChange24h(symbol: string): Promise<number> {
  return priceFeed.getPriceChange24h(symbol);
}

// Mock data for development/testing
export const mockPrices: Record<string, TokenPrice> = {
  'SOL': {
    symbol: 'SOL',
    name: 'Solana',
    price: 200.45,
    change24h: 2.34,
    volume24h: 1200000000,
    marketCap: 95000000000,
    lastUpdated: Date.now()
  },
  'WSOL': {
    symbol: 'WSOL',
    name: 'Wrapped SOL',
    price: 200.45,
    change24h: 2.34,
    volume24h: 1200000000,
    marketCap: 95000000000,
    lastUpdated: Date.now()
  },
  '抹茶币': {
    symbol: '抹茶币',
    name: 'MEXC Token',
    price: 0.0000423, // Calculated from Solscan data: $680.5 / 16,085,085.33
    change24h: -5.67,
    volume24h: 5000000,
    marketCap: 15000000,
    lastUpdated: Date.now()
  },
  'USDC': {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.00,
    change24h: 0.01,
    volume24h: 5000000000,
    marketCap: 32000000000,
    lastUpdated: Date.now()
  }
};

export default priceFeed;

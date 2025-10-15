/**
 * Token Metadata Integration
 * 
 * This module provides token logos, names, and metadata
 * to match Solscan's professional token display.
 */

export interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
  decimals: number;
  tags?: string[];
  extensions?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
}

export interface TokenList {
  name: string;
  timestamp: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tokens: TokenMetadata[];
}

class TokenMetadataService {
  private cache = new Map<string, TokenMetadata>();
  private tokenLists: TokenList[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadTokenLists();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize token metadata service:', error);
    }
  }

  /**
   * Load token lists from various sources
   */
  private async loadTokenLists(): Promise<void> {
    const tokenListUrls = [
      'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json',
      'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json',
      'https://raw.githubusercontent.com/raydium-io/raydium-sdk/main/src/token/raydium-mainnet.json'
    ];

    for (const url of tokenListUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const tokenList: TokenList = await response.json();
          this.tokenLists.push(tokenList);
          
          // Cache all tokens
          tokenList.tokens.forEach(token => {
            this.cache.set(token.address, token);
            this.cache.set(token.symbol.toUpperCase(), token);
          });
        }
      } catch (error) {
        console.warn(`Failed to load token list from ${url}:`, error);
      }
    }
  }

  /**
   * Get token metadata by address or symbol
   */
  async getTokenMetadata(identifier: string): Promise<TokenMetadata | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Check cache first
    const cached = this.cache.get(identifier) || this.cache.get(identifier.toUpperCase());
    if (cached) {
      return cached;
    }

    // Try to fetch from API if not in cache
    try {
      const metadata = await this.fetchFromAPI(identifier);
      if (metadata) {
        this.cache.set(identifier, metadata);
        this.cache.set(metadata.symbol.toUpperCase(), metadata);
        return metadata;
      }
    } catch (error) {
      console.warn(`Failed to fetch metadata for ${identifier}:`, error);
    }

    return null;
  }

  /**
   * Get token logo URL
   */
  async getTokenLogo(identifier: string): Promise<string | null> {
    const metadata = await this.getTokenMetadata(identifier);
    return metadata?.logoURI || null;
  }

  /**
   * Get token name
   */
  async getTokenName(identifier: string): Promise<string | null> {
    const metadata = await this.getTokenMetadata(identifier);
    return metadata?.name || null;
  }

  /**
   * Get token symbol
   */
  async getTokenSymbol(identifier: string): Promise<string | null> {
    const metadata = await this.getTokenMetadata(identifier);
    return metadata?.symbol || null;
  }

  /**
   * Get token decimals
   */
  async getTokenDecimals(identifier: string): Promise<number> {
    const metadata = await this.getTokenMetadata(identifier);
    return metadata?.decimals || 9; // Default to 9 for Solana tokens
  }

  /**
   * Search tokens by name or symbol
   */
  async searchTokens(query: string): Promise<TokenMetadata[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const results: TokenMetadata[] = [];
    const lowerQuery = query.toLowerCase();

    for (const tokenList of this.tokenLists) {
      for (const token of tokenList.tokens) {
        if (
          token.name.toLowerCase().includes(lowerQuery) ||
          token.symbol.toLowerCase().includes(lowerQuery)
        ) {
          results.push(token);
        }
      }
    }

    return results.slice(0, 20); // Limit results
  }

  /**
   * Get popular tokens
   */
  async getPopularTokens(): Promise<TokenMetadata[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const popularSymbols = ['SOL', 'USDC', 'USDT', 'RAY', 'SRM', 'ORCA', 'JUP'];
    const popularTokens: TokenMetadata[] = [];

    for (const symbol of popularSymbols) {
      const token = this.cache.get(symbol);
      if (token) {
        popularTokens.push(token);
      }
    }

    return popularTokens;
  }

  private async fetchFromAPI(identifier: string): Promise<TokenMetadata | null> {
    try {
      // Try Birdeye API for token info
      const response = await fetch(
        `https://public-api.birdeye.so/public/v1/token_overview?address=${identifier}`,
        {
          headers: {
            'X-API-KEY': process.env.BIRDEYE_API_KEY || ''
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data.success || !data.data) {
        return null;
      }

      const tokenData = data.data;

      return {
        address: identifier,
        symbol: tokenData.symbol || identifier,
        name: tokenData.name || tokenData.symbol || identifier,
        logoURI: tokenData.logoURI,
        decimals: tokenData.decimals || 9,
        extensions: {
          website: tokenData.website,
          twitter: tokenData.twitter,
          telegram: tokenData.telegram,
          discord: tokenData.discord
        }
      };
    } catch (error) {
      console.error('API fetch error:', error);
      return null;
    }
  }
}

// Create singleton instance
export const tokenMetadata = new TokenMetadataService();

// Utility functions
export async function getTokenMetadata(identifier: string): Promise<TokenMetadata | null> {
  return tokenMetadata.getTokenMetadata(identifier);
}

export async function getTokenLogo(identifier: string): Promise<string | null> {
  return tokenMetadata.getTokenLogo(identifier);
}

export async function getTokenName(identifier: string): Promise<string | null> {
  return tokenMetadata.getTokenName(identifier);
}

export async function getTokenSymbol(identifier: string): Promise<string | null> {
  return tokenMetadata.getTokenSymbol(identifier);
}

export async function getTokenDecimals(identifier: string): Promise<number> {
  return tokenMetadata.getTokenDecimals(identifier);
}

export async function searchTokens(query: string): Promise<TokenMetadata[]> {
  return tokenMetadata.searchTokens(query);
}

export async function getPopularTokens(): Promise<TokenMetadata[]> {
  return tokenMetadata.getPopularTokens();
}

// Mock data for development
export const mockTokenMetadata: Record<string, TokenMetadata> = {
  'SOL': {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    decimals: 9,
    tags: ['native'],
    extensions: {
      website: 'https://solana.com',
      twitter: 'https://twitter.com/solana'
    }
  },
  'WSOL': {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'WSOL',
    name: 'Wrapped SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    decimals: 9,
    tags: ['wrapped']
  },
  'USDC': {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    decimals: 6,
    tags: ['stablecoin'],
    extensions: {
      website: 'https://www.centre.io',
      twitter: 'https://twitter.com/centre_io'
    }
  },
  '抹茶币': {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Placeholder
    symbol: '抹茶币',
    name: 'MEXC Token',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    decimals: 6,
    tags: ['exchange-token'],
    extensions: {
      website: 'https://www.mexc.com',
      twitter: 'https://twitter.com/MEXC_Global'
    }
  }
};

export default tokenMetadata;

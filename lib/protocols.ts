/**
 * Comprehensive Solana Protocol and Program ID Mappings
 * 
 * This file contains all major Solana protocols, their program IDs,
 * and transaction type mappings for accurate transaction detection.
 */

export interface ProtocolInfo {
  name: string;
  category: 'dex' | 'lending' | 'staking' | 'nft' | 'gaming' | 'meme' | 'infrastructure' | 'bridge' | 'derivatives';
  description: string;
  website?: string;
  transactionTypes: string[];
}

export const PROTOCOL_MAPPINGS: Record<string, ProtocolInfo> = {
  // DEX and AMM Protocols
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': {
    name: 'Jupiter V6',
    category: 'dex',
    description: 'Jupiter aggregator for best swap rates',
    website: 'https://jup.ag',
    transactionTypes: ['swap', 'route']
  },
  'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB': {
    name: 'Jupiter V4',
    category: 'dex',
    description: 'Jupiter aggregator V4',
    website: 'https://jup.ag',
    transactionTypes: ['swap', 'route']
  },
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': {
    name: 'Raydium AMM',
    category: 'dex',
    description: 'Raydium automated market maker',
    website: 'https://raydium.io',
    transactionTypes: ['swap', 'add_liquidity', 'remove_liquidity']
  },
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK': {
    name: 'Raydium CLMM',
    category: 'dex',
    description: 'Raydium concentrated liquidity market maker',
    website: 'https://raydium.io',
    transactionTypes: ['swap', 'add_liquidity', 'remove_liquidity']
  },
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM': {
    name: 'Orca Whirlpools',
    category: 'dex',
    description: 'Orca concentrated liquidity pools',
    website: 'https://orca.so',
    transactionTypes: ['swap', 'add_liquidity', 'remove_liquidity']
  },
  '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin': {
    name: 'Serum DEX',
    category: 'dex',
    description: 'Serum decentralized exchange',
    website: 'https://projectserum.com',
    transactionTypes: ['swap', 'place_order', 'cancel_order']
  },
  'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA': {
    name: 'Pump.fun AMM',
    category: 'meme',
    description: 'Pump.fun meme token AMM',
    website: 'https://pump.fun',
    transactionTypes: ['swap', 'create_token', 'bond']
  },
  'pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ': {
    name: 'Pump Fees Program',
    category: 'meme',
    description: 'Pump.fun fee calculation program',
    website: 'https://pump.fun',
    transactionTypes: ['fee_calculation']
  },
  'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB': {
    name: 'Meteora DLMM',
    category: 'dex',
    description: 'Meteora dynamic liquidity market maker',
    website: 'https://meteora.ag',
    transactionTypes: ['swap', 'add_liquidity', 'remove_liquidity']
  },
  'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo': {
    name: 'Lifinity',
    category: 'dex',
    description: 'Lifinity AMM with concentrated liquidity',
    website: 'https://lifinity.io',
    transactionTypes: ['swap', 'add_liquidity', 'remove_liquidity']
  },

  // Lending Protocols
  'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo': {
    name: 'Solend',
    category: 'lending',
    description: 'Solend lending protocol',
    website: 'https://solend.fi',
    transactionTypes: ['deposit', 'withdraw', 'borrow', 'repay', 'liquidate']
  },
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': {
    name: 'Mango Markets',
    category: 'lending',
    description: 'Mango Markets decentralized trading and lending',
    website: 'https://mango.markets',
    transactionTypes: ['deposit', 'withdraw', 'borrow', 'repay', 'trade', 'liquidate']
  },
  'HyaB3W9q6XdA5xwpU4XnSZV94htfmbmqJXZcEbRaJutt': {
    name: 'Kamino Finance',
    category: 'lending',
    description: 'Kamino automated lending strategies',
    website: 'https://kamino.finance',
    transactionTypes: ['deposit', 'withdraw', 'rebalance']
  },
  '7sPptkymzv8RSKxvt1u6FJZ7M1Y8C3xTADvTQR3i8Nw': {
    name: 'Tulip Protocol',
    category: 'lending',
    description: 'Tulip yield farming and lending',
    website: 'https://tulip.garden',
    transactionTypes: ['deposit', 'withdraw', 'stake', 'unstake']
  },

  // Staking Protocols
  'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD': {
    name: 'Marinade Finance',
    category: 'staking',
    description: 'Marinade liquid staking protocol',
    website: 'https://marinade.finance',
    transactionTypes: ['stake', 'unstake', 'delegate']
  },
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': {
    name: 'Lido Staked SOL',
    category: 'staking',
    description: 'Lido liquid staking for SOL',
    website: 'https://lido.fi',
    transactionTypes: ['stake', 'unstake']
  },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': {
    name: 'BlazeStake',
    category: 'staking',
    description: 'BlazeStake liquid staking protocol',
    website: 'https://blazestake.com',
    transactionTypes: ['stake', 'unstake']
  },
  '7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn': {
    name: 'Jito',
    category: 'staking',
    description: 'Jito MEV-protected staking',
    website: 'https://jito.wtf',
    transactionTypes: ['stake', 'unstake', 'claim_rewards']
  },

  // NFT and Gaming
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': {
    name: 'Metaplex',
    category: 'nft',
    description: 'Metaplex NFT standard',
    website: 'https://metaplex.com',
    transactionTypes: ['mint_nft', 'transfer_nft', 'burn_nft', 'update_metadata']
  },
  'SAGE2HAwep459SNq61LHvjxPk4pLPEJLoMETef7f7EE': {
    name: 'SAGE',
    category: 'gaming',
    description: 'SAGE space strategy game',
    website: 'https://sage.xyz',
    transactionTypes: ['warp', 'consume', 'craft', 'trade']
  },
  'Cargo2VNTPPTi9c1vq1Jw5d3BWUNr18MjRtSupAghKEk': {
    name: 'Cargo',
    category: 'gaming',
    description: 'Cargo gaming protocol',
    website: 'https://cargo.gg',
    transactionTypes: ['consume', 'craft', 'trade']
  },

  // Derivatives and Perpetuals
  'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH': {
    name: 'Drift Protocol',
    category: 'derivatives',
    description: 'Drift perpetual trading protocol',
    website: 'https://drift.trade',
    transactionTypes: ['open_position', 'close_position', 'add_margin', 'remove_margin', 'liquidate']
  },
  '5quBtoiQqxF9Jv6KYKctB59NT3gtJDz6Tcbz2B8ASmup': {
    name: 'Mango Markets V4',
    category: 'derivatives',
    description: 'Mango Markets perpetual trading',
    website: 'https://mango.markets',
    transactionTypes: ['open_position', 'close_position', 'add_margin', 'remove_margin']
  },

  // Infrastructure and Utilities
  'ComputeBudget111111111111111111111111111111': {
    name: 'Compute Budget Program',
    category: 'infrastructure',
    description: 'Solana compute budget management',
    transactionTypes: ['set_compute_unit_limit', 'set_compute_unit_price']
  },
  'MemoSq4gqABAXKb96qnH8TysKcWfC85B2q2': {
    name: 'Memo Program',
    category: 'infrastructure',
    description: 'Solana memo program for transaction notes',
    transactionTypes: ['memo']
  },
  'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo': {
    name: 'Memo Program V2',
    category: 'infrastructure',
    description: 'Solana memo program V2',
    transactionTypes: ['memo']
  },

  // Bridges
  'Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o': {
    name: 'Wormhole Bridge',
    category: 'bridge',
    description: 'Wormhole cross-chain bridge',
    website: 'https://wormhole.com',
    transactionTypes: ['bridge_in', 'bridge_out', 'complete_transfer']
  },
  'WnFt12ZrnzZrFZkt2xsNsaJzoWvcd3qsKFWQzyftKzA': {
    name: 'Allbridge',
    category: 'bridge',
    description: 'Allbridge cross-chain bridge',
    website: 'https://allbridge.io',
    transactionTypes: ['bridge_in', 'bridge_out']
  }
};

// Popular token mappings with Jupiter integration
export const POPULAR_TOKENS: Record<string, { symbol: string; name: string; decimals: number; logo?: string }> = {
  // Native SOL and Wrapped SOL
  'So11111111111111111111111111111111111111112': { symbol: 'WSOL', name: 'Wrapped SOL', decimals: 9 },
  
  // Major Stablecoins
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', name: 'Marinade Staked SOL', decimals: 9 },
  
  // Liquid Staking Tokens
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': { symbol: 'stSOL', name: 'Lido Staked SOL', decimals: 9 },
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': { symbol: 'bSOL', name: 'BlazeStake Staked SOL', decimals: 9 },
  '7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn': { symbol: 'JitoSOL', name: 'Jito Staked SOL', decimals: 9 },
  
  // DEX Tokens
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { symbol: 'MNGO', name: 'Mango', decimals: 6 },
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': { symbol: 'PYTH', name: 'Pyth Network', decimals: 6 },
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': { symbol: 'WIF', name: 'dogwifhat', decimals: 6 },
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM': { symbol: 'BONK', name: 'Bonk', decimals: 5 },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', name: 'Bonk', decimals: 5 },
  
  // Popular Meme Tokens
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'MEXC', name: 'MEXC Token', decimals: 6 },
  
  // DeFi Tokens
  'HBB111SCpVgz9UpbqjqR3LCiFzWqFjQ3iBzVVdYd3YmU': { symbol: 'HBB', name: 'Hubble Protocol', decimals: 6 },
  'CWE8jPTUYhdCTZYWPTe1o5DFqfdjzWKc9WKz6rSjQUdG': { symbol: 'LINK', name: 'Chainlink', decimals: 6 },
  
  // Gaming Tokens
  'SAGE2HAwep459SNq61LHvjxPk4pLPEJLoMETef7f7EE': { symbol: 'SAGE', name: 'SAGE Token', decimals: 9 },
  'Cargo2VNTPPTi9c1vq1Jw5d3BWUNr18MjRtSupAghKEk': { symbol: 'CARGO', name: 'Cargo Token', decimals: 9 }
};

// Transaction type mappings for better detection
export const TRANSACTION_TYPE_PATTERNS: Record<string, string[]> = {
  'swap': ['swap', 'exchange', 'trade', 'sell', 'buy'],
  'deposit': ['deposit', 'supply', 'lend', 'stake'],
  'withdraw': ['withdraw', 'redeem', 'unstake', 'claim'],
  'borrow': ['borrow', 'take_loan'],
  'repay': ['repay', 'pay_back', 'close_loan'],
  'liquidate': ['liquidate', 'liquidation'],
  'add_liquidity': ['add_liquidity', 'provide_liquidity', 'deposit_liquidity'],
  'remove_liquidity': ['remove_liquidity', 'withdraw_liquidity', 'burn_liquidity'],
  'mint_nft': ['mint', 'create_nft', 'mint_nft'],
  'transfer_nft': ['transfer', 'send_nft'],
  'burn_nft': ['burn', 'destroy_nft'],
  'bridge_in': ['bridge_in', 'deposit_bridge'],
  'bridge_out': ['bridge_out', 'withdraw_bridge'],
  'open_position': ['open_position', 'create_position'],
  'close_position': ['close_position', 'settle_position'],
  'add_margin': ['add_margin', 'increase_margin'],
  'remove_margin': ['remove_margin', 'decrease_margin']
};

export function getProtocolInfo(programId: string): ProtocolInfo | null {
  return PROTOCOL_MAPPINGS[programId] || null;
}

export function getTokenInfo(mint: string): { symbol: string; name: string; decimals: number } | null {
  return POPULAR_TOKENS[mint] || null;
}

export function detectTransactionType(instructionType: string, programName: string): string {
  const lowerType = instructionType.toLowerCase();
  const lowerProgram = programName.toLowerCase();
  
  // Check for specific patterns
  for (const [txType, patterns] of Object.entries(TRANSACTION_TYPE_PATTERNS)) {
    if (patterns.some(pattern => lowerType.includes(pattern) || lowerProgram.includes(pattern))) {
      return txType;
    }
  }
  
  return 'unknown';
}

export interface SolanaTransactionExplanation {
  signature: string;
  success: boolean;
  summary: string;
  timestamp?: number;
  fee: number; // in lamports
  feeSOL: number; // in SOL
  slot: number;
  blockTime?: number;
  
  // Account changes
  accountChanges: AccountChange[];
  
  // Instructions
  instructions: Instruction[];
  
  // Token transfers
  tokenTransfers: TokenTransfer[];
  
  // Program calls
  programCalls: ProgramCall[];
  
  // Transaction type
  transactionType: TransactionType;
  
  // Error information
  error?: string;
  
  // Balance changes
  balanceChanges?: BalanceChange[];
  
  // Educational content
  educationalContent?: string[];
}

export interface BalanceChange {
  account: string;
  preBalance: number;
  postBalance: number;
  change: number;
  changeType: 'increase' | 'decrease';
  usdValue: string;
}

export interface AccountChange {
  account: string;
  changeType: 'created' | 'modified' | 'deleted';
  lamports: number;
  owner?: string;
  executable: boolean;
  rentEpoch?: number;
  data?: string;
  description: string;
}

export interface Instruction {
  programId: string;
  programName: string;
  accounts: string[];
  data: string;
  description: string;
  innerInstructions?: Instruction[];
}

export interface TokenTransfer {
  from: string;
  to: string;
  amount: number;
  mint: string;
  tokenName?: string;
  tokenSymbol?: string;
  decimals: number;
  description: string;
}

export interface ProgramCall {
  programId: string;
  programName: string;
  instruction: string;
  description: string;
  accounts: string[];
}

export type TransactionType = 
  | 'transfer'
  | 'swap'
  | 'stake'
  | 'unstake'
  | 'create_account'
  | 'close_account'
  | 'nft_mint'
  | 'nft_transfer'
  | 'program_deploy'
  | 'burn'
  | 'SWAP'
  | 'TRANSFER'
  | 'STAKE'
  | 'NFT'
  | 'DEFI'
  | 'unknown';

export interface Action {
  type: 'transfer' | 'swap' | 'stake' | 'create' | 'modify' | 'delete' | 'mint' | 'burn';
  description: string;
  icon: string;
}

import { ParsedTransactionWithMeta, ParsedInstruction } from '@solana/web3.js';
import { SolanaTransactionExplanation, AccountChange, Instruction, TokenTransfer, ProgramCall, TransactionType, Action } from '@/types/transaction';
import { PROGRAM_NAMES, getProgramName } from './solanaClient';
import { PROTOCOL_MAPPINGS, POPULAR_TOKENS, detectTransactionType } from './protocols';

export function parseSolanaTransaction(tx: ParsedTransactionWithMeta): SolanaTransactionExplanation {
  const signature = tx.transaction.signatures[0];
  const success = tx.meta?.err === null;
  const fee = tx.meta?.fee || 0;
  const feeSOL = fee / 1e9; // Convert lamports to SOL
  const slot = tx.slot;
  const blockTime = tx.blockTime;

  // Parse account changes
  const accountChanges = parseAccountChanges(tx);
  
  // Parse instructions
  const instructions = parseInstructions(tx);
  
  // Parse token transfers
  const tokenTransfers = parseTokenTransfers(tx);
  
  // Parse program calls
  const programCalls = parseProgramCalls(tx);
  
  // Determine transaction type
  const transactionType = determineTransactionType(instructions, tokenTransfers, accountChanges);
  
  // Generate summary
  const summary = generateSummary(transactionType, instructions, tokenTransfers, accountChanges);
  
  // Generate error message if failed
  const error = success ? undefined : JSON.stringify(tx.meta?.err);

  // Parse balance changes
  const balanceChanges = parseBalanceChanges(tx);
  
  // Generate educational content
  const educationalContent = generateEducationalContent(transactionType, instructions, tokenTransfers, balanceChanges);

  return {
    signature,
    success,
    summary,
    timestamp: blockTime ? blockTime * 1000 : undefined,
    fee,
    feeSOL,
    slot,
    blockTime: blockTime || undefined,
    accountChanges,
    instructions,
    tokenTransfers,
    programCalls,
    transactionType,
    error,
    balanceChanges,
    educationalContent
  };
}

function parseAccountChanges(tx: ParsedTransactionWithMeta): AccountChange[] {
  const changes: AccountChange[] = [];
  
  if (!tx.meta?.preBalances || !tx.meta?.postBalances || !tx.transaction.message.accountKeys) {
    return changes;
  }

  const accountKeys = tx.transaction.message.accountKeys;
  
  for (let i = 0; i < accountKeys.length; i++) {
    const account = accountKeys[i].pubkey.toString();
    const preBalance = tx.meta.preBalances[i];
    const postBalance = tx.meta.postBalances[i];
    const balanceChange = postBalance - preBalance;
    
    if (balanceChange !== 0) {
      const changeType = preBalance === 0 ? 'created' : postBalance === 0 ? 'deleted' : 'modified';
      
      changes.push({
        account: account,
        changeType,
        lamports: postBalance,
        owner: accountKeys[i].pubkey.toString(),
        executable: false,
        description: generateAccountChangeDescription(changeType, balanceChange, account)
      });
    }
  }
  
  return changes;
}

function parseInstructions(tx: ParsedTransactionWithMeta): Instruction[] {
  const instructions: Instruction[] = [];
  
  if (!tx.transaction.message.instructions) {
    return instructions;
  }

  for (const instruction of tx.transaction.message.instructions) {
    if ('parsed' in instruction) {
      const parsed = instruction.parsed;
      const programId = instruction.programId.toString();
      const programName = getProgramName(programId);
      
      // Debug: Log program ID and resolved name
      // if (programId === 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA') {
      //   console.log('Pump.fun program detected:', programId, '->', programName);
      // }
      
      instructions.push({
        programId,
        programName,
        accounts: (instruction as any).accounts || [],
        data: JSON.stringify(parsed),
        description: generateInstructionDescription(parsed, programName),
        innerInstructions: []
      });
    } else {
      const programId = instruction.programId.toString();
      const programName = getProgramName(programId);
      
      // Debug: Log program ID and resolved name
      // if (programId === 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA') {
      //   console.log('Pump.fun program detected (raw):', programId, '->', programName);
      // }
      
      instructions.push({
        programId,
        programName,
        accounts: (instruction as any).accounts || [],
        data: (instruction as any).data || '',
        description: `Raw instruction call to ${programName}`,
        innerInstructions: []
      });
    }
  }
  
  return instructions;
}

function parseTokenTransfers(tx: ParsedTransactionWithMeta): TokenTransfer[] {
  const transfers: TokenTransfer[] = [];
  
  if (!tx.meta?.preTokenBalances || !tx.meta?.postTokenBalances) {
    return transfers;
  }

  // Create maps for easier lookup
  const preBalances = new Map<string, any>();
  const postBalances = new Map<string, any>();
  
  tx.meta.preTokenBalances.forEach(balance => {
    const key = `${balance.accountIndex}-${balance.mint}`;
    preBalances.set(key, balance);
  });
  
  tx.meta.postTokenBalances.forEach(balance => {
    const key = `${balance.accountIndex}-${balance.mint}`;
    postBalances.set(key, balance);
  });
  
  // Find balance changes
  for (const [key, preBalance] of Array.from(preBalances.entries())) {
    const postBalance = postBalances.get(key);
    if (postBalance) {
      const preAmount = parseFloat(preBalance.uiTokenAmount?.uiAmountString || '0');
      const postAmount = parseFloat(postBalance.uiTokenAmount?.uiAmountString || '0');
      const change = postAmount - preAmount;
      
      if (change !== 0) {
        // Get token info from either pre or post balance
        const tokenInfo = preBalance.uiTokenAmount || postBalance.uiTokenAmount;
        
        // Enhanced token name detection
        const tokenSymbol = getTokenSymbol(preBalance.mint, tokenInfo?.symbol);
        const tokenName = getTokenName(preBalance.mint, tokenInfo?.name);
        
        transfers.push({
          from: change < 0 ? preBalance.owner : postBalance.owner,
          to: change > 0 ? postBalance.owner : preBalance.owner,
          amount: Math.abs(change),
          mint: preBalance.mint,
          tokenName: tokenName,
          tokenSymbol: tokenSymbol,
          decimals: tokenInfo?.decimals || 0,
          description: generateTokenTransferDescription(change, tokenSymbol)
        });
      }
    }
  }
  
  // Also check for new token accounts (not in preBalances but in postBalances)
  for (const [key, postBalance] of Array.from(postBalances.entries())) {
    if (!preBalances.has(key)) {
      const tokenInfo = postBalance.uiTokenAmount;
      if (tokenInfo && parseFloat(tokenInfo.uiAmountString || '0') > 0) {
        transfers.push({
          from: 'Unknown',
          to: postBalance.owner,
          amount: parseFloat(tokenInfo.uiAmountString || '0'),
          mint: postBalance.mint,
          tokenName: tokenInfo.name || 'Unknown Token',
          tokenSymbol: tokenInfo.symbol || 'Unknown',
          decimals: tokenInfo.decimals || 0,
          description: `Received ${parseFloat(tokenInfo.uiAmountString || '0')} ${tokenInfo.symbol || 'tokens'}`
        });
      }
    }
  }
  
  return transfers;
}

function parseProgramCalls(tx: ParsedTransactionWithMeta): ProgramCall[] {
  const calls: ProgramCall[] = [];
  
  if (!tx.transaction.message.instructions) {
    return calls;
  }

  for (const instruction of tx.transaction.message.instructions) {
    const programId = instruction.programId.toString();
    const programName = getProgramName(programId);
    
    let instructionType = 'Unknown';
    if ('parsed' in instruction) {
      instructionType = instruction.parsed.type || 'Unknown';
    }
    
    calls.push({
      programId,
      programName,
      instruction: instructionType,
      description: `${instructionType} call to ${programName}`,
      accounts: (instruction as any).accounts || []
    });
  }
  
  return calls;
}

function determineTransactionType(
  instructions: Instruction[],
  tokenTransfers: TokenTransfer[],
  accountChanges: AccountChange[]
): TransactionType {
  // Check for specific transaction types based on instructions and transfers
  
  // Debug: Log all program names to see what we're detecting
  // console.log('Program names detected:', instructions.map(ix => ix.programName));
  
  // Check for token burns first (very important in Solana)
  const burnInstructions = instructions.filter(ix => 
    (ix.description && ix.description.toLowerCase().includes('burn'))
  );
  if (burnInstructions.length > 0) {
    return 'burn';
  }
  
  // Check for token burns in transfers (negative amounts)
  const burnTransfers = tokenTransfers.filter(t => t.amount < 0);
  if (burnTransfers.length > 0) {
    // If we have negative transfers, this is likely a burn
    // Check if it's a single burn transfer or part of a more complex operation
    if (tokenTransfers.length === 1 || burnTransfers.length === tokenTransfers.length) {
      return 'burn';
    }
  }
  
  // Check for gaming-related burns (like SAGE warpToCoordinate)
  const gamingInstructions = instructions.filter(ix => 
    (ix.description && (
      ix.description.toLowerCase().includes('warp') ||
      ix.description.toLowerCase().includes('sage') ||
      ix.description.toLowerCase().includes('consume') ||
      ix.description.toLowerCase().includes('fuel')
    ))
  );
  if (gamingInstructions.length > 0 && burnTransfers.length > 0) {
    return 'burn';
  }
  
        // Check for Pump.fun first (very common for meme tokens)
        if (instructions.some(ix => ix.programName.includes('Pump.fun'))) {
          return 'swap';
        }
        
        if (instructions.some(ix => ix.programName.includes('Jupiter'))) {
          return 'swap';
        }
        
        if (instructions.some(ix => ix.programName.includes('Raydium'))) {
          return 'swap';
        }
        
        if (instructions.some(ix => ix.programName.includes('Serum'))) {
          return 'swap';
        }
        
        if (instructions.some(ix => ix.programName.includes('Orca'))) {
          return 'swap';
        }
  
  if (instructions.some(ix => ix.programName.includes('Stake'))) {
    return 'stake';
  }
  
  // Check for swap patterns in token transfers
  if (tokenTransfers.length >= 2) {
    const hasIncoming = tokenTransfers.some(t => t.amount > 0);
    const hasOutgoing = tokenTransfers.some(t => t.amount < 0);
    if (hasIncoming && hasOutgoing) {
      return 'swap';
    }
  }
  
  // Check for SOL transfers (System Program transfers)
  const solTransfers = instructions.filter(ix => 
    ix.programName.includes('System Program') && 
    ix.description && ix.description.toLowerCase().includes('transfer')
  );
  if (solTransfers.length > 0) {
    return 'transfer';
  }
  
  if (tokenTransfers.length > 0) {
    if (tokenTransfers.some(t => t.mint.includes('NFT') || t.tokenName?.includes('NFT'))) {
      return 'nft_transfer';
    }
    return 'transfer';
  }
  
  if (accountChanges.some(ac => ac.changeType === 'created')) {
    return 'create_account';
  }
  
  return 'unknown';
}

function generateSummary(
  type: TransactionType,
  instructions: Instruction[],
  tokenTransfers: TokenTransfer[],
  accountChanges: AccountChange[]
): string {
  switch (type) {
    case 'transfer':
      if (tokenTransfers.length > 0) {
        const transfer = tokenTransfers[0];
        return `Transferred ${transfer.amount} ${transfer.tokenSymbol || 'tokens'} from ${transfer.from.slice(0, 8)}... to ${transfer.to.slice(0, 8)}...`;
      }
             // Check for SOL transfers in instructions
             const solTransfers = instructions.filter(ix => 
               ix.programName.includes('System Program') && 
               ix.description && ix.description.toLowerCase().includes('transfer')
             );
      if (solTransfers.length > 0) {
        if (solTransfers.length === 1) {
          const transfer = solTransfers[0];
          // Extract SOL amount from description
          const amountMatch = transfer.description.match(/Transfer ([\d.]+) SOL/);
          if (amountMatch) {
            return `Transferred ${amountMatch[1]} SOL to another wallet`;
          }
          return 'Transferred SOL to another wallet';
        } else {
          return `Made ${solTransfers.length} SOL transfers to different wallets`;
        }
      }
      return 'Transfer transaction';
      
    case 'swap':
      if (tokenTransfers.length >= 2) {
        const outgoing = tokenTransfers.find(t => t.amount < 0);
        const incoming = tokenTransfers.find(t => t.amount > 0);
        if (outgoing && incoming) {
          const outgoingAmount = Math.abs(outgoing.amount).toLocaleString();
          const incomingAmount = incoming.amount.toLocaleString();
          return `Swapped ${outgoingAmount} ${outgoing.tokenSymbol || 'tokens'} for ${incomingAmount} ${incoming.tokenSymbol || 'tokens'}`;
        }
      }
      // Try to extract swap details from instructions (prioritize Pump.fun)
      const swapInstructions = instructions.filter(ix => 
        ix.programName.includes('Pump.fun') ||
        ix.programName.includes('Raydium') || 
        ix.programName.includes('Jupiter') || 
        ix.programName.includes('Serum') || 
        ix.programName.includes('Orca')
      );
      if (swapInstructions.length > 0) {
        return `Token swap via ${swapInstructions[0].programName}`;
      }
      return 'Token swap transaction via DEX';
      
    case 'burn':
      if (tokenTransfers.length > 0) {
        const burnTransfer = tokenTransfers.find(t => t.amount < 0);
        if (burnTransfer) {
          const burnAmount = Math.abs(burnTransfer.amount).toLocaleString();
          return `Burned ${burnAmount} ${burnTransfer.tokenSymbol || 'tokens'}`;
        }
      }
      return 'Token burn transaction';
      
    case 'stake':
      return 'Staking transaction';
      
    case 'unstake':
      return 'Unstaking transaction';
      
    case 'nft_transfer':
      return 'NFT transfer transaction';
      
    case 'create_account':
      return 'Account creation transaction';
      
    default:
      if (instructions.length > 2) {
        return `Complex transaction with ${instructions.length} operations`;
      }
      return `Transaction with ${instructions.length} instruction(s)`;
  }
}

function generateAccountChangeDescription(changeType: string, balanceChange: number, account: string): string {
  const shortAccount = `${account.slice(0, 8)}...${account.slice(-4)}`;
  
  switch (changeType) {
    case 'created':
      return `Created account ${shortAccount} with ${balanceChange / 1e9} SOL`;
    case 'deleted':
      return `Deleted account ${shortAccount}`;
    case 'modified':
      const changeSOL = balanceChange / 1e9;
      return `Modified account ${shortAccount} (${changeSOL > 0 ? '+' : ''}${changeSOL} SOL)`;
    default:
      return `Account ${shortAccount} changed`;
  }
}

function generateInstructionDescription(parsed: any, programName: string): string {
  if (parsed.type === 'transfer') {
    const solAmount = parsed.info?.lamports ? (parsed.info.lamports / 1e9).toFixed(9) : 'unknown amount';
    return `Transfer ${solAmount} SOL via ${programName}`;
  }
  
  if (parsed.type === 'burn') {
    return `Burn tokens via ${programName}`;
  }
  
  if (parsed.type === 'createAccount') {
    return `Create account via ${programName}`;
  }
  
  if (parsed.type === 'createAccountWithSeed') {
    return `Create account with seed via ${programName}`;
  }
  
  if (parsed.type === 'initializeAccount') {
    return `Initialize token account via ${programName}`;
  }
  
  if (parsed.type === 'closeAccount') {
    return `Close token account via ${programName}`;
  }
  
  // Enhanced swap detection for Raydium and other DEXs
  if (parsed.type === 'swap' || parsed.type === 'swapV2') {
    const amount = parsed.info?.amount ? (Number(parsed.info.amount) / 1e6).toLocaleString() : 'unknown amount';
    return `Swap ${amount} tokens via ${programName}`;
  }
  
  // Check for gaming-specific operations
  if (parsed.type && parsed.type.toLowerCase().includes('warp')) {
    return `Warp to coordinate via ${programName}`;
  }
  
  if (parsed.type && parsed.type.toLowerCase().includes('consume')) {
    return `Consume cargo via ${programName}`;
  }
  
  return `${parsed.type} operation via ${programName}`;
}

function generateTokenTransferDescription(change: number, symbol: string): string {
  const amount = Math.abs(change);
  const direction = change > 0 ? 'received' : 'sent';
  const tokenName = symbol || 'tokens';
  
  // For negative amounts, use "burned" instead of "sent" to be more accurate
  if (change < 0) {
    return `burned ${amount} ${tokenName}`;
  }
  
  return `${direction} ${amount} ${tokenName}`;
}

// Common token mappings
// Use comprehensive token mappings from protocols.ts

function getTokenSymbol(mint: string, fallbackSymbol?: string): string {
  if (fallbackSymbol && fallbackSymbol !== 'Unknown' && fallbackSymbol !== '抹茶币') {
    return fallbackSymbol;
  }
  
  // Check comprehensive token mappings first
  const tokenInfo = POPULAR_TOKENS[mint];
  if (tokenInfo) {
    return tokenInfo.symbol;
  }
  
  // Try to extract symbol from mint address (last 4 characters)
  if (mint.length >= 4) {
    const shortMint = mint.slice(-4);
    return `Token-${shortMint}`;
  }
  
  return 'Unknown';
}

function getTokenName(mint: string, fallbackName?: string): string {
  if (fallbackName && fallbackName !== 'Unknown Token' && fallbackName !== 'MEXC Token') {
    return fallbackName;
  }
  
  // Check comprehensive token mappings first
  const tokenInfo = POPULAR_TOKENS[mint];
  if (tokenInfo) {
    return tokenInfo.name;
  }
  
  // Try to extract name from mint address
  if (mint.length >= 8) {
    const shortMint = mint.slice(-8);
    return `Token ${shortMint}`;
  }
  
  return 'Unknown Token';
}

// Use the enhanced getProgramName from solanaClient instead of local function

export function generateActions(
  accountChanges: AccountChange[],
  tokenTransfers: TokenTransfer[],
  instructions: Instruction[]
): Action[] {
  const actions: Action[] = [];
  const actionMap = new Map<string, Action>();

  // Add actions from account changes
  accountChanges.forEach(change => {
    let actionKey = change.changeType;
    let icon = '📦';
    let description = change.description;

    switch (change.changeType) {
      case 'created':
        icon = '✨';
        break;
      case 'modified':
        icon = '🔄';
        break;
      case 'deleted':
        icon = '🗑️';
        break;
    }

    if (!actionMap.has(actionKey)) {
      actionMap.set(actionKey, {
        type: actionKey as any,
        description,
        icon,
      });
    }
  });

  // Add actions from token transfers
  tokenTransfers.forEach(transfer => {
    const actionKey = 'transfer';
    if (!actionMap.has(actionKey)) {
      actionMap.set(actionKey, {
        type: 'transfer',
        description: 'Token transfer',
        icon: '➡️',
      });
    }
  });

  return Array.from(actionMap.values());
}

function parseBalanceChanges(tx: ParsedTransactionWithMeta): any[] {
  const balanceChanges: any[] = [];
  
  if (tx.meta?.preBalances && tx.meta?.postBalances && tx.transaction.message.accountKeys) {
    tx.transaction.message.accountKeys.forEach((account, index) => {
      const preBalance = tx.meta!.preBalances[index];
      const postBalance = tx.meta!.postBalances[index];
      const change = postBalance - preBalance;
      
      if (change !== 0) {
        const changeSOL = change / 1e9; // Convert lamports to SOL
        balanceChanges.push({
          account: account.toString(),
          preBalance: preBalance / 1e9,
          postBalance: postBalance / 1e9,
          change: changeSOL,
          changeType: change > 0 ? 'increase' : 'decrease',
          usdValue: calculateUSDValue('SOL', Math.abs(changeSOL))
        });
      }
    });
  }
  
  return balanceChanges;
}

function calculateUSDValue(tokenType: string, amount: number): string {
  // Mock USD prices for popular Solana tokens (in a real app, you'd fetch from an API)
  const prices: { [key: string]: number } = {
    'SOL': 200.00,
    'USDC': 1.00,
    'USDT': 1.00,
    'RAY': 2.50,
    'SRM': 0.15,
    'ORCA': 3.20,
    'JUP': 0.80,
    'BONK': 0.00002,
    'WIF': 2.80,
    'POPCAT': 0.25,
    'BOME': 0.0001,
    'PEPE': 0.000001,
    'DOGE': 0.08,
    'SHIB': 0.00001,
  };

  const price = prices[tokenType] || 0;
  const usdValue = amount * price;
  
  if (usdValue < 0.01) {
    return '< $0.01';
  } else if (usdValue < 1) {
    return `$${usdValue.toFixed(3)}`;
  } else if (usdValue < 1000) {
    return `$${usdValue.toFixed(2)}`;
  } else {
    return `$${(usdValue / 1000).toFixed(2)}K`;
  }
}

function generateEducationalContent(transactionType: TransactionType, instructions: Instruction[], tokenTransfers: TokenTransfer[], balanceChanges: any[]): string[] {
  const content: string[] = [];

  // Protocol-specific educational content
  switch (transactionType) {
    case 'SWAP':
      content.push("💡 Token swaps on Solana are executed through decentralized exchanges (DEXs) like Jupiter, Raydium, or Orca. These platforms use automated market makers (AMMs) to provide liquidity and determine exchange rates.");
      break;
    case 'TRANSFER':
      content.push("💡 Solana transfers are extremely fast and cheap, typically completing in under 1 second and costing less than $0.01. This makes Solana ideal for micro-transactions and high-frequency trading.");
      break;
    case 'STAKE':
      content.push("💡 Staking on Solana helps secure the network while earning rewards. Validators process transactions and maintain the blockchain, and stakers receive a portion of the rewards for delegating their SOL.");
      break;
    case 'NFT':
      content.push("💡 NFTs on Solana are stored as Metaplex tokens, making them more efficient and cheaper to mint compared to other blockchains. The Metaplex standard is the most widely used NFT standard on Solana.");
      break;
    case 'DEFI':
      content.push("💡 Solana's DeFi ecosystem includes lending protocols like Solend, DEXs like Raydium and Orca, and yield farming opportunities. The high throughput and low fees make it attractive for DeFi activities.");
      break;
  }

  // Balance change educational content
  if (balanceChanges.length > 0) {
    const totalValue = balanceChanges.reduce((sum, change) => {
      const usdValue = parseFloat(change.usdValue.replace(/[$,K]/g, '')) || 0;
      return sum + (change.changeType === 'increase' ? usdValue : -usdValue);
    }, 0);

    if (totalValue > 0) {
      content.push("💰 Your portfolio value increased from this transaction. This could be from trading profits, staking rewards, or receiving tokens.");
    } else if (totalValue < 0) {
      content.push("📉 Your portfolio value decreased from this transaction. This is normal for trades, fees, or when sending tokens to others.");
    }
  }

  // Solana-specific educational content
  if (instructions.some(ix => ix.programId === 'ComputeBudget111111111111111111111111111111')) {
    content.push("⚡ Solana's compute budget system allows you to set priority fees for faster transaction processing. Higher fees increase the chance of your transaction being included in the next block.");
  }

  if (tokenTransfers.length > 0) {
    content.push("🔄 Token transfers on Solana use the SPL Token standard, which is similar to ERC-20 on Ethereum but more efficient. Each token has its own mint address and can be transferred between accounts.");
  }

  // Gas efficiency education
  content.push("⚡ Solana's unique architecture allows for extremely low transaction fees (often less than $0.01) and fast confirmation times (under 1 second), making it one of the most efficient blockchains for transactions.");

  return content;
}

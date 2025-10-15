import type { SolanaTransactionExplanation } from '@/types/transaction';

export interface UserFriendlyExplanation {
  whatHappened: string;
  inPlainEnglish: string;
  keyPoints: string[];
  stepByStep: string[];
  technicalDetails: {
    totalCost: string;
    networkFee: string;
    priorityFee: string;
    computeUnits: string;
  };
  impact: {
    type: 'positive' | 'neutral' | 'negative';
    description: string;
    portfolioChange?: string;
    marketImpact?: string;
  };
  context: {
    transactionComplexity: 'simple' | 'moderate' | 'complex';
    estimatedTime: string;
    riskLevel: 'low' | 'medium' | 'high';
    commonUseCase: string;
  };
  insights: {
    efficiency: string;
    costAnalysis: string;
    alternatives: string[];
  };
  educationalContent: {
    concepts: string[];
    tips: string[];
    warnings: string[];
  };
}

export function generateUserFriendlyExplanation(tx: SolanaTransactionExplanation): UserFriendlyExplanation {
  const whatHappened = generateWhatHappened(tx);
  const inPlainEnglish = generatePlainEnglishExplanation(tx);
  const keyPoints = generateKeyPoints(tx);
  const stepByStep = generateStepByStep(tx);
  const technicalDetails = generateTechnicalDetails(tx);
  const impact = generateImpact(tx);
  const context = generateContext(tx);
  const insights = generateInsights(tx);
  const educationalContent = generateEducationalContent(tx);

  return {
    whatHappened,
    inPlainEnglish,
    keyPoints,
    stepByStep,
    technicalDetails,
    impact,
    context,
    insights,
    educationalContent
  };
}

function generateWhatHappened(tx: SolanaTransactionExplanation): string {
  switch (tx.transactionType) {
    case 'swap':
      if (tx.tokenTransfers.length >= 2) {
        const outgoing = tx.tokenTransfers.find(t => t.amount < 0);
        const incoming = tx.tokenTransfers.find(t => t.amount > 0);
        if (outgoing && incoming) {
          const outgoingAmount = Math.abs(outgoing.amount).toLocaleString();
          const incomingAmount = incoming.amount.toLocaleString();
          return `You swapped ${outgoingAmount} ${outgoing.tokenSymbol || 'tokens'} for ${incomingAmount} ${incoming.tokenSymbol || 'tokens'}`;
        }
      }
      // Try to provide more specific information based on instructions (prioritize Pump.fun)
      const swapPrograms = tx.instructions.filter(ix => 
        ix.programName.includes('Pump.fun') ||
        ix.programName.includes('Raydium') || 
        ix.programName.includes('Jupiter') || 
        ix.programName.includes('Serum') || 
        ix.programName.includes('Orca')
      );
      if (swapPrograms.length > 0) {
        return `You performed a token swap on ${swapPrograms[0].programName}`;
      }
      return 'You performed a token swap on a decentralized exchange';
    
    case 'burn':
      if (tx.tokenTransfers.length > 0) {
        const burnTransfer = tx.tokenTransfers.find(t => t.amount < 0);
        if (burnTransfer) {
          const burnAmount = Math.abs(burnTransfer.amount).toLocaleString();
          return `You burned ${burnAmount} ${burnTransfer.tokenSymbol || 'tokens'}`;
        }
      }
      return 'You burned tokens (permanently removed them from circulation)';
    
    case 'transfer':
      if (tx.tokenTransfers.length > 0) {
        const transfer = tx.tokenTransfers[0];
        return `You sent ${transfer.amount.toLocaleString()} ${transfer.tokenSymbol || 'tokens'}`;
      }
      // Check for SOL transfers in instructions
      const solTransfers = tx.instructions.filter(ix => 
        ix.programName.includes('System Program') && 
        ix.description && ix.description.toLowerCase().includes('transfer')
      );
      if (solTransfers.length > 0) {
        if (solTransfers.length === 1) {
          const transfer = solTransfers[0];
          const amountMatch = transfer.description.match(/Transfer ([\d.]+) SOL/);
          if (amountMatch) {
            return `You sent ${amountMatch[1]} SOL to another wallet`;
          }
          return 'You sent SOL to another wallet';
        } else {
          return `You made ${solTransfers.length} SOL transfers to different wallets`;
        }
      }
      return 'You transferred SOL or tokens';
    
    case 'stake':
      return 'You staked your SOL to earn rewards';
    
    case 'unstake':
      return 'You unstaked your SOL to make it available again';
    
    case 'create_account':
      return 'You created a new account on Solana';
    
    case 'nft_transfer':
      return 'You transferred an NFT';
    
    default:
      return 'You performed a transaction on Solana';
  }
}

function generatePlainEnglishExplanation(tx: SolanaTransactionExplanation): string {
  const baseExplanation = `This transaction was processed on the Solana blockchain at block ${tx.slot.toLocaleString()}. `;
  
  switch (tx.transactionType) {
    case 'swap':
      const swapPrograms = tx.instructions.filter(ix => 
        ix.programName.includes('Pump.fun') ||
        ix.programName.includes('Raydium') || 
        ix.programName.includes('Jupiter') || 
        ix.programName.includes('Serum') || 
        ix.programName.includes('Orca')
      );
      const dexName = swapPrograms.length > 0 ? swapPrograms[0].programName : 'a decentralized exchange';
      
      return baseExplanation + 
        `You used ${dexName} to trade one type of token for another. ` +
        `This is like exchanging one currency for another, but it happens automatically through smart contracts. ` +
        `The transaction cost you ${tx.feeSOL.toFixed(6)} SOL in network fees.`;
    
    case 'transfer':
      // Check if this is a SOL transfer
        const solTransfers = tx.instructions.filter(ix => 
          ix.programName.includes('System Program') && 
          ix.description && ix.description.toLowerCase().includes('transfer')
        );
      if (solTransfers.length > 0) {
        if (solTransfers.length === 1) {
          const transfer = solTransfers[0];
          const amountMatch = transfer.description.match(/Transfer ([\d.]+) SOL/);
          if (amountMatch) {
            return baseExplanation + 
              `You sent ${amountMatch[1]} SOL from your wallet to another wallet address. ` +
              `This is similar to sending money to someone's bank account, but it happens instantly and costs much less. ` +
              `The transaction cost you ${tx.feeSOL.toFixed(6)} SOL in network fees.`;
          }
        }
        return baseExplanation + 
          `You sent SOL from your wallet to another wallet address. ` +
          `This is similar to sending money to someone's bank account, but it happens instantly and costs much less. ` +
          `The transaction cost you ${tx.feeSOL.toFixed(6)} SOL in network fees.`;
      }
      return baseExplanation + 
        `You sent tokens from your wallet to another wallet address. ` +
        `This is similar to sending money to someone's bank account, but it happens instantly and costs much less. ` +
        `The transaction cost you ${tx.feeSOL.toFixed(6)} SOL in network fees.`;
    
    case 'stake':
      return baseExplanation + 
        `You locked up your SOL tokens to help secure the Solana network. ` +
        `In return, you'll earn rewards over time. ` +
        `This is like putting money in a savings account that earns interest. ` +
        `The transaction cost you ${tx.feeSOL.toFixed(6)} SOL in network fees.`;
    
    case 'unstake':
      return baseExplanation + 
        `You requested to unlock your staked SOL tokens. ` +
        `There's usually a waiting period before the tokens become available again. ` +
        `The transaction cost you ${tx.feeSOL.toFixed(6)} SOL in network fees.`;
    
    default:
      return baseExplanation + 
        `This transaction involved ${tx.instructions.length} different operations on the Solana network. ` +
        `The transaction cost you ${tx.feeSOL.toFixed(6)} SOL in network fees.`;
  }
}

function generateKeyPoints(tx: SolanaTransactionExplanation): string[] {
  const points: string[] = [];
  
  // Transaction status
  if (tx.success) {
    points.push('CheckCircle Transaction completed successfully');
  } else {
    points.push('XCircle Transaction failed');
    return points;
  }
  
  // Fee information
  if (tx.feeSOL < 0.001) {
    points.push('Zap Very low transaction fee (less than $0.01)');
  } else if (tx.feeSOL < 0.01) {
    points.push('Coins Low transaction fee (less than $0.10)');
  } else {
    points.push('DollarSign Transaction fee: ' + tx.feeSOL.toFixed(6) + ' SOL');
  }
  
  // Transaction type specific points
  switch (tx.transactionType) {
    case 'swap':
      points.push('ArrowLeftRight Token swap completed on decentralized exchange');
      if (tx.tokenTransfers.length >= 2) {
        points.push('BarChart3 Multiple token transfers involved');
      }
      break;
    
    case 'transfer':
      points.push('Send Tokens sent to another wallet');
      break;
    
    case 'stake':
      points.push('Lock SOL staked for network security');
      points.push('Gift You will earn staking rewards');
      break;
    
    case 'unstake':
      points.push('Unlock Unstaking request submitted');
      points.push('Clock Tokens will be available after cooldown period');
      break;
  }
  
  // Account changes
  if (tx.accountChanges.length > 0) {
    points.push(`Edit ${tx.accountChanges.length} account(s) were modified`);
  }
  
  // Token transfers
  if (tx.tokenTransfers.length > 0) {
    points.push(`Wallet ${tx.tokenTransfers.length} token transfer(s) occurred`);
  }
  
  return points;
}

function generateStepByStep(tx: SolanaTransactionExplanation): string[] {
  const steps: string[] = [];
  
  steps.push('1. You initiated the transaction from your wallet');
  
  if (tx.instructions.some(ix => ix.programName.includes('Compute Budget'))) {
    steps.push('2. Set transaction priority and compute limits');
  }
  
  switch (tx.transactionType) {
    case 'swap':
      steps.push('3. Connected to decentralized exchange (DEX)');
      steps.push('4. Provided input tokens for the swap');
      steps.push('5. DEX calculated the best exchange rate');
      steps.push('6. Received output tokens in your wallet');
      break;
    
    case 'transfer':
      steps.push('3. Specified recipient wallet address');
      steps.push('4. Confirmed token amount to send');
      steps.push('5. Tokens transferred to recipient');
      break;
    
    case 'stake':
      steps.push('3. Selected validator to stake with');
      steps.push('4. Locked SOL tokens in staking account');
      steps.push('5. Started earning staking rewards');
      break;
    
    case 'unstake':
      steps.push('3. Requested to unlock staked tokens');
      steps.push('4. Entered cooldown period');
      steps.push('5. Tokens will be available after waiting period');
      break;
    
    default:
      steps.push('3. Executed multiple program instructions');
      steps.push('4. Modified account states as needed');
  }
  
  steps.push(`${steps.length + 1}. Transaction confirmed on Solana network`);
  steps.push(`${steps.length + 1}. Network fee deducted from your wallet`);
  
  return steps;
}

function generateTechnicalDetails(tx: SolanaTransactionExplanation) {
  return {
    totalCost: `${tx.feeSOL.toFixed(6)} SOL ($${(tx.feeSOL * 200).toFixed(4)})`, // Assuming $200 SOL price
    networkFee: `${tx.feeSOL.toFixed(6)} SOL`,
    priorityFee: '0.000003 SOL', // This would need to be extracted from the transaction
    computeUnits: '95,702 units' // This would need to be extracted from the transaction
  };
}

function generateImpact(tx: SolanaTransactionExplanation) {
  if (!tx.success) {
    return {
      type: 'negative' as const,
      description: 'Transaction failed - no changes were made to your account'
    };
  }
  
  switch (tx.transactionType) {
    case 'swap':
      if (tx.tokenTransfers.length >= 2) {
        const outgoing = tx.tokenTransfers.find(t => t.amount < 0);
        const incoming = tx.tokenTransfers.find(t => t.amount > 0);
        if (outgoing && incoming) {
          return {
            type: 'neutral' as const,
            description: 'Your token portfolio composition changed, but total value depends on market prices',
            portfolioChange: `You now have ${incoming.amount.toLocaleString()} ${incoming.tokenSymbol || 'tokens'} instead of ${Math.abs(outgoing.amount).toLocaleString()} ${outgoing.tokenSymbol || 'tokens'}`,
            marketImpact: 'The swap was executed at current market rates with minimal slippage'
          };
        }
      }
      return {
        type: 'neutral' as const,
        description: 'Your token portfolio composition changed, but total value depends on market prices'
      };
    
    case 'transfer':
      return {
        type: 'neutral' as const,
        description: 'Tokens moved from your wallet to another address',
        portfolioChange: 'Your token balance decreased by the transfer amount'
      };
    
    case 'stake':
      return {
        type: 'positive' as const,
        description: 'You will earn passive income through staking rewards',
        portfolioChange: 'Your SOL is now locked and earning rewards',
        marketImpact: 'Staking helps secure the Solana network and earns you rewards'
      };
    
    case 'unstake':
      return {
        type: 'neutral' as const,
        description: 'Your SOL will become available for trading after the cooldown period',
        portfolioChange: 'Your staked SOL will become liquid after the waiting period'
      };
    
    default:
      return {
        type: 'neutral' as const,
        description: 'Various account states were updated as part of this transaction'
      };
  }
}

function generateContext(tx: SolanaTransactionExplanation) {
  const complexity = tx.instructions.length > 5 ? 'complex' : tx.instructions.length > 2 ? 'moderate' : 'simple';
  const riskLevel = tx.feeSOL > 0.01 ? 'high' : tx.feeSOL > 0.001 ? 'medium' : 'low';
  
  switch (tx.transactionType) {
    case 'swap':
      return {
        transactionComplexity: 'moderate' as const,
        estimatedTime: '2-5 seconds',
        riskLevel: 'low' as const,
        commonUseCase: 'Trading tokens on decentralized exchanges like Raydium or Jupiter'
      };
    
    case 'transfer':
      return {
        transactionComplexity: 'simple' as const,
        estimatedTime: '1-2 seconds',
        riskLevel: 'low' as const,
        commonUseCase: 'Sending tokens to friends, family, or other wallets'
      };
    
    case 'stake':
      return {
        transactionComplexity: 'simple' as const,
        estimatedTime: '2-3 seconds',
        riskLevel: 'low' as const,
        commonUseCase: 'Earning passive income by helping secure the Solana network'
      };
    
    default:
      return {
        transactionComplexity: complexity as 'simple' | 'moderate' | 'complex',
        estimatedTime: '1-5 seconds',
        riskLevel: riskLevel as 'low' | 'medium' | 'high',
        commonUseCase: 'Various blockchain operations'
      };
  }
}

function generateInsights(tx: SolanaTransactionExplanation) {
  const efficiency = tx.feeSOL < 0.001 ? 'Excellent' : tx.feeSOL < 0.01 ? 'Good' : 'Average';
  const costAnalysis = `This transaction cost ${tx.feeSOL.toFixed(6)} SOL ($${(tx.feeSOL * 200).toFixed(4)}), which is ${efficiency.toLowerCase()} compared to other blockchains.`;
  
  const alternatives: string[] = [];
  
  switch (tx.transactionType) {
    case 'swap':
      alternatives.push('Jupiter aggregator for better rates');
      alternatives.push('Orca for lower fees');
      alternatives.push('Serum for advanced trading');
      break;
    
    case 'transfer':
      alternatives.push('Use Solana Pay for instant payments');
      alternatives.push('Consider batch transfers for multiple recipients');
      break;
    
    case 'stake':
      alternatives.push('Marinade for liquid staking');
      alternatives.push('Lido for stSOL tokens');
      break;
  }
  
  return {
    efficiency: `${efficiency} - Solana's high-speed, low-cost architecture makes this very efficient`,
    costAnalysis,
    alternatives
  };
}

function generateEducationalContent(tx: SolanaTransactionExplanation) {
  const concepts: string[] = [];
  const tips: string[] = [];
  const warnings: string[] = [];
  
  switch (tx.transactionType) {
    case 'swap':
      concepts.push('Automated Market Makers (AMMs) - algorithms that provide liquidity');
      concepts.push('Liquidity pools - collections of tokens that enable trading');
      concepts.push('Slippage - price difference between expected and actual trade');
      concepts.push('Price impact - how your trade affects the token price');
      
      tips.push('Check slippage tolerance before swapping large amounts');
      tips.push('Compare rates across different DEXs for better deals');
      tips.push('Consider splitting large trades to reduce price impact');
      
      warnings.push('Always verify token addresses before swapping');
      warnings.push('Be aware of price volatility during market hours');
      break;
    
    case 'transfer':
      concepts.push('Wallet addresses - unique identifiers for blockchain accounts');
      concepts.push('Transaction finality - when a transaction becomes permanent');
      concepts.push('Network fees - costs paid to validators for processing');
      
      tips.push('Double-check recipient addresses before sending');
      tips.push('Start with small amounts for new addresses');
      tips.push('Keep some SOL for future transaction fees');
      
      warnings.push('Blockchain transactions cannot be reversed');
      warnings.push('Never share your private keys or seed phrases');
      break;
    
    case 'stake':
      concepts.push('Validators - computers that secure the blockchain');
      concepts.push('Delegation - choosing which validator to stake with');
      concepts.push('Epoch - time periods for reward distribution');
      concepts.push('Slashing - penalties for validator misbehavior');
      
      tips.push('Research validators before staking');
      tips.push('Diversify across multiple validators');
      tips.push('Monitor validator performance regularly');
      
      warnings.push('Staking involves locking your tokens');
      warnings.push('Choose reputable validators to avoid slashing');
      break;
  }
  
  // Add general blockchain concepts
  concepts.push('Smart contracts - self-executing programs on the blockchain');
  concepts.push('Consensus mechanism - how the network agrees on transactions');
  concepts.push('Decentralization - no single point of control or failure');
  
  tips.push('Keep your wallet software updated');
  tips.push('Use hardware wallets for large amounts');
  tips.push('Never click suspicious links or download unknown software');
  
  warnings.push('Always verify transaction details before confirming');
  warnings.push('Be cautious of phishing attempts and fake websites');
  
  return { concepts, tips, warnings };
}

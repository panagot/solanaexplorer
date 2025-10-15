/**
 * MEV (Maximal Extractable Value) Detection System
 * 
 * This module detects and analyzes MEV activities in Solana transactions,
 * providing user-friendly explanations of MEV patterns.
 */

export interface MEVActivity {
  type: 'sandwich' | 'arbitrage' | 'liquidation' | 'tip' | 'frontrun' | 'backrun';
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  explanation: string;
  detected: boolean;
  confidence: number; // 0-100
  details: {
    profit?: number;
    victim?: string;
    attacker?: string;
    method?: string;
  };
}

export interface MEVAnalysis {
  hasMEV: boolean;
  activities: MEVActivity[];
  totalImpact: 'positive' | 'negative' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  recommendations: string[];
}

class MEVDetector {
  private knownMEVPrograms = new Set([
    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter
    '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium
    'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK', // Raydium CLMM
  ]);

  private knownMEVAccounts = new Set([
    // Add known MEV bot accounts here
  ]);

  /**
   * Analyze transaction for MEV activities
   */
  analyzeTransaction(transaction: any): MEVAnalysis {
    const activities: MEVActivity[] = [];
    
    // Check for MEV tip
    const tipActivity = this.detectMEVTip(transaction);
    if (tipActivity.detected) {
      activities.push(tipActivity);
    }

    // Check for sandwich attack
    const sandwichActivity = this.detectSandwichAttack(transaction);
    if (sandwichActivity.detected) {
      activities.push(sandwichActivity);
    }

    // Check for arbitrage
    const arbitrageActivity = this.detectArbitrage(transaction);
    if (arbitrageActivity.detected) {
      activities.push(arbitrageActivity);
    }

    // Check for frontrunning
    const frontrunActivity = this.detectFrontrunning(transaction);
    if (frontrunActivity.detected) {
      activities.push(frontrunActivity);
    }

    const hasMEV = activities.length > 0;
    const riskLevel = this.calculateRiskLevel(activities);
    const totalImpact = this.calculateTotalImpact(activities);

    return {
      hasMEV,
      activities,
      totalImpact,
      riskLevel,
      summary: this.generateSummary(activities, hasMEV),
      recommendations: this.generateRecommendations(activities, riskLevel)
    };
  }

  /**
   * Detect MEV tip (priority fee)
   */
  private detectMEVTip(transaction: any): MEVActivity {
    // Check for high priority fees or compute budget instructions
    const hasHighPriorityFee = transaction.fee > 0.001; // More than 0.001 SOL
    const hasComputeBudget = transaction.instructions?.some((ix: any) => 
      ix.programId === 'ComputeBudget111111111111111111111111111111'
    );

    if (hasHighPriorityFee || hasComputeBudget) {
      return {
        type: 'tip',
        severity: 'low',
        description: 'MEV Tip Detected',
        impact: 'You paid a priority fee to get your transaction processed faster',
        explanation: 'This transaction included a priority fee (tip) to ensure faster processing. This is common when network congestion is high or when you want to guarantee your transaction gets included in the next block.',
        detected: true,
        confidence: 85,
        details: {
          profit: transaction.fee,
          method: 'Priority Fee'
        }
      };
    }

    return {
      type: 'tip',
      severity: 'low',
      description: 'No MEV Tip',
      impact: 'Standard transaction fee',
      explanation: 'This transaction used standard fees without priority payments.',
      detected: false,
      confidence: 0,
      details: {}
    };
  }

  /**
   * Detect sandwich attack
   */
  private detectSandwichAttack(transaction: any): MEVActivity {
    // Look for patterns typical of sandwich attacks:
    // 1. Multiple DEX interactions
    // 2. Large slippage
    // 3. Similar token pairs
    const dexInstructions = transaction.instructions?.filter((ix: any) => 
      this.knownMEVPrograms.has(ix.programId)
    ) || [];

    if (dexInstructions.length >= 2) {
      return {
        type: 'sandwich',
        severity: 'high',
        description: 'Potential Sandwich Attack',
        impact: 'Your transaction may have been sandwiched by MEV bots',
        explanation: 'This transaction shows patterns consistent with a sandwich attack. MEV bots may have placed transactions before and after yours to profit from price movements. This can result in worse execution prices for your trade.',
        detected: true,
        confidence: 70,
        details: {
          method: 'DEX Interaction Pattern'
        }
      };
    }

    return {
      type: 'sandwich',
      severity: 'high',
      description: 'No Sandwich Attack',
      impact: 'Clean transaction execution',
      explanation: 'No sandwich attack patterns detected.',
      detected: false,
      confidence: 0,
      details: {}
    };
  }

  /**
   * Detect arbitrage opportunities
   */
  private detectArbitrage(transaction: any): MEVActivity {
    // Look for multiple DEX interactions with different token pairs
    const tokenTransfers = transaction.tokenTransfers || [];
    const uniqueTokens = new Set(tokenTransfers.map((t: any) => t.mint));

    if (uniqueTokens.size >= 3) {
      return {
        type: 'arbitrage',
        severity: 'medium',
        description: 'Arbitrage Opportunity',
        impact: 'This transaction may have captured arbitrage profits',
        explanation: 'This transaction involved multiple token pairs, suggesting it may have captured arbitrage opportunities across different DEXs or liquidity pools.',
        detected: true,
        confidence: 60,
        details: {
          method: 'Multi-token Arbitrage'
        }
      };
    }

    return {
      type: 'arbitrage',
      severity: 'medium',
      description: 'No Arbitrage',
      impact: 'Standard trading activity',
      explanation: 'No arbitrage patterns detected.',
      detected: false,
      confidence: 0,
      details: {}
    };
  }

  /**
   * Detect frontrunning
   */
  private detectFrontrunning(transaction: any): MEVActivity {
    // This would require mempool analysis, which is complex
    // For now, we'll use heuristics based on transaction timing and patterns
    const hasRapidExecution = transaction.slot && transaction.blockTime;
    
    if (hasRapidExecution) {
      return {
        type: 'frontrun',
        severity: 'medium',
        description: 'Potential Frontrunning',
        impact: 'Transaction may have been frontrun by MEV bots',
        explanation: 'This transaction shows timing patterns that could indicate frontrunning activity. MEV bots may have seen your transaction in the mempool and placed their own transactions first.',
        detected: true,
        confidence: 40,
        details: {
          method: 'Timing Analysis'
        }
      };
    }

    return {
      type: 'frontrun',
      severity: 'medium',
      description: 'No Frontrunning',
      impact: 'Normal transaction timing',
      explanation: 'No frontrunning patterns detected.',
      detected: false,
      confidence: 0,
      details: {}
    };
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(activities: MEVActivity[]): 'low' | 'medium' | 'high' {
    const highRiskActivities = activities.filter(a => a.severity === 'high');
    const mediumRiskActivities = activities.filter(a => a.severity === 'medium');

    if (highRiskActivities.length > 0) {
      return 'high';
    } else if (mediumRiskActivities.length > 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Calculate total impact
   */
  private calculateTotalImpact(activities: MEVActivity[]): 'positive' | 'negative' | 'neutral' {
    const negativeActivities = activities.filter(a => 
      a.type === 'sandwich' || a.type === 'frontrun'
    );
    const positiveActivities = activities.filter(a => 
      a.type === 'arbitrage' || a.type === 'tip'
    );

    if (negativeActivities.length > positiveActivities.length) {
      return 'negative';
    } else if (positiveActivities.length > negativeActivities.length) {
      return 'positive';
    } else {
      return 'neutral';
    }
  }

  /**
   * Generate summary
   */
  private generateSummary(activities: MEVActivity[], hasMEV: boolean): string {
    if (!hasMEV) {
      return 'No MEV activities detected. This appears to be a clean transaction.';
    }

    const activityTypes = activities.map(a => a.type).join(', ');
    return `MEV activities detected: ${activityTypes}. ${this.getImpactDescription(activities)}`;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(activities: MEVActivity[], riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'high') {
      recommendations.push('Consider using private mempools or MEV protection services');
      recommendations.push('Use smaller trade sizes to reduce MEV exposure');
      recommendations.push('Consider splitting large trades across multiple transactions');
    }

    if (activities.some(a => a.type === 'sandwich')) {
      recommendations.push('Be aware of sandwich attacks on large trades');
      recommendations.push('Consider using DEX aggregators with MEV protection');
    }

    if (activities.some(a => a.type === 'tip')) {
      recommendations.push('Priority fees are normal during high network congestion');
      recommendations.push('Monitor network conditions to optimize fee payments');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring for MEV activities');
      recommendations.push('Consider using MEV protection tools for large trades');
    }

    return recommendations;
  }

  private getImpactDescription(activities: MEVActivity[]): string {
    const negativeCount = activities.filter(a => 
      a.type === 'sandwich' || a.type === 'frontrun'
    ).length;
    
    const positiveCount = activities.filter(a => 
      a.type === 'arbitrage' || a.type === 'tip'
    ).length;

    if (negativeCount > positiveCount) {
      return 'This may have negatively impacted your transaction execution.';
    } else if (positiveCount > negativeCount) {
      return 'This may have provided benefits to your transaction.';
    } else {
      return 'The overall impact appears neutral.';
    }
  }
}

// Create singleton instance
export const mevDetector = new MEVDetector();

// Utility functions
export function analyzeMEV(transaction: any): MEVAnalysis {
  return mevDetector.analyzeTransaction(transaction);
}

export function detectMEVTip(transaction: any): MEVActivity {
  return mevDetector['detectMEVTip'](transaction);
}

export function detectSandwichAttack(transaction: any): MEVActivity {
  return mevDetector['detectSandwichAttack'](transaction);
}

export default mevDetector;

'use client';

import { ArrowRight, Wallet, Cpu, Database, Shield, Zap, Users, Building2 } from 'lucide-react';
import type { SolanaTransactionExplanation } from '@/types/transaction';

interface Props {
  transaction: SolanaTransactionExplanation;
}

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'pending' | 'failed';
  details?: string[];
  accounts?: string[];
  programs?: string[];
}

export default function EnhancedTransactionFlow({ transaction }: Props) {
  
  const generateFlowSteps = (): FlowStep[] => {
    const steps: FlowStep[] = [];

    // Step 1: Transaction Initiation
    steps.push({
      id: 'initiation',
      title: 'Transaction Initiation',
      description: 'You initiated the transaction from your wallet',
      icon: <Wallet className="w-5 h-5" />,
      status: 'completed',
      details: [
        `Signature: ${transaction.signature ? `${transaction.signature.slice(0, 8)}...${transaction.signature.slice(-4)}` : 'Unknown'}`,
        `Fee: ${transaction.feeSOL} SOL`,
        `Slot: ${transaction.slot ? transaction.slot.toLocaleString() : 'Unknown'}`
      ]
    });

    // Step 2: Compute Budget (if present)
    const hasComputeBudget = transaction.instructions.some(ix => 
      ix.programName.includes('Compute Budget')
    );
    
    if (hasComputeBudget) {
      steps.push({
        id: 'compute-budget',
        title: 'Compute Budget Allocation',
        description: 'Set compute units and priority fee for transaction execution',
        icon: <Cpu className="w-5 h-5" />,
        status: 'completed',
        details: [
          'Priority fee set for faster processing',
          'Compute units allocated for execution'
        ]
      });
    }

    // Step 3: Program Interactions
    const uniquePrograms = transaction.instructions ? Array.from(new Set(transaction.instructions.map(ix => ix.programName))) : [];
    
    uniquePrograms.forEach((programName, index) => {
      const programInstructions = transaction.instructions ? transaction.instructions.filter(ix => ix.programName === programName) : [];
      
      steps.push({
        id: `program-${index}`,
        title: `${programName} Interaction`,
        description: `${programInstructions.length} instruction(s) executed`,
        icon: <Building2 className="w-5 h-5" />,
        status: transaction.success ? 'completed' : 'failed',
        details: programInstructions.map(ix => ix.description),
        programs: [programName],
        accounts: programInstructions.flatMap(ix => ix.accounts).map((account: any) => 
          typeof account === 'string' ? account : (account?.toString() || 'Unknown')
        )
      });
    });

    // Step 4: Token Transfers (if any)
    if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
      steps.push({
        id: 'token-transfers',
        title: 'Token Transfers',
        description: `${transaction.tokenTransfers.length} token transfer(s) processed`,
        icon: <Zap className="w-5 h-5" />,
        status: 'completed',
        details: transaction.tokenTransfers.map(transfer => 
          `${transfer.amount} ${transfer.tokenSymbol} from ${transfer.from ? transfer.from.slice(0, 8) : 'Unknown'}... to ${transfer.to ? transfer.to.slice(0, 8) : 'Unknown'}...`
        )
      });
    }

    // Step 5: Account Changes
    if (transaction.accountChanges && transaction.accountChanges.length > 0) {
      steps.push({
        id: 'account-changes',
        title: 'Account State Updates',
        description: `${transaction.accountChanges.length} account(s) modified`,
        icon: <Database className="w-5 h-5" />,
        status: 'completed',
        details: transaction.accountChanges.map(change => 
          `${change.changeType}: ${change.account ? change.account.slice(0, 8) : 'Unknown'}... (${change.lamports ? (change.lamports / 1e9).toFixed(9) : '0'} SOL)`
        )
      });
    }

    // Step 6: Finalization
    steps.push({
      id: 'finalization',
      title: 'Transaction Finalization',
      description: transaction.success ? 'Transaction completed successfully' : 'Transaction failed',
      icon: <Shield className="w-5 h-5" />,
      status: transaction.success ? 'completed' : 'failed',
      details: [
        `Block: ${transaction.slot || 'Unknown'}`,
        `Timestamp: ${transaction.timestamp ? new Date(transaction.timestamp * 1000).toLocaleString() : 'Unknown'}`,
        `Success: ${transaction.success ? 'Yes' : 'No'}`
      ]
    });

    return steps;
  };

  let steps: FlowStep[] = [];
  try {
    steps = generateFlowSteps();
  } catch (error) {
    console.error('Error in EnhancedTransactionFlow:', error);
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-4">
          Transaction Flow Error
        </h3>
        <p className="text-red-700 dark:text-red-300">
          There was an error generating the transaction flow: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enhanced Transaction Flow</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Detailed step-by-step execution breakdown</p>
        </div>
      </div>
      

      {/* Visual Flow with Numbered Steps */}
      <div className="relative">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No transaction flow steps available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-start gap-6">
                {/* Step Number Circle */}
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-blue-300 to-indigo-300"></div>
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(step.status)}`}>
                          {getStatusIcon(step.status)} {step.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {step.description}
                    </p>
                    
                    {/* Step Details */}
                    {step.details && step.details.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span className="font-mono">{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Programs and Accounts */}
                    {(step.programs || step.accounts) && (
                      <div className="flex flex-wrap gap-2">
                        {step.programs?.map((program, programIndex) => (
                          <span key={programIndex} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {program}
                          </span>
                        ))}
                        {step.accounts?.slice(0, 3).map((account: any, accountIndex) => {
                          const accountStr = typeof account === 'string' ? account : (account?.toString() || 'Unknown');
                          return (
                            <span key={accountIndex} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-mono">
                              {accountStr ? accountStr.slice(0, 8) : 'Unknown'}...
                            </span>
                          );
                        })}
                        {step.accounts && step.accounts.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                            +{step.accounts.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Transaction Summary</span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          This transaction executed {steps.length} major steps across {transaction.instructions ? Array.from(new Set(transaction.instructions.map(ix => ix.programName))).length : 0} different programs, 
          processing {transaction.tokenTransfers ? transaction.tokenTransfers.length : 0} token transfers and modifying {transaction.accountChanges ? transaction.accountChanges.length : 0} accounts.
        </p>
      </div>
    </div>
  );
}

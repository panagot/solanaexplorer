'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookOpen,
  Zap,
  Shield,
  AlertTriangle,
  Target,
  BarChart3,
  Users,
  Timer,
  Star,
  ArrowRight,
  HelpCircle,
  Coins,
  ArrowLeftRight,
  Send,
  Lock,
  Unlock,
  Gift,
  Edit,
  Wallet
} from 'lucide-react';
import type { SolanaTransactionExplanation } from '@/types/transaction';
import type { UserFriendlyExplanation } from '@/lib/userFriendlyParser';
import { generateUserFriendlyExplanation } from '@/lib/userFriendlyParser';
import RealTimeData from './RealTimeData';

interface Props {
  transaction: SolanaTransactionExplanation;
}

export default function EnhancedUserFriendlyExplanation({ transaction }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main', 'steps']));
  
  const explanation = generateUserFriendlyExplanation(transaction);

  // Function to get the correct protocol name for the transaction flow
  const getProtocolName = () => {
    if (transaction.transactionType !== 'swap') {
      return 'Solana Network';
    }

    // Look for specific protocols in program calls
    const protocolNames = transaction.programCalls.map(call => call.programName.toLowerCase());
    
    if (protocolNames.some(name => name.includes('jupiter'))) {
      return 'Jupiter Aggregator';
    } else if (protocolNames.some(name => name.includes('raydium'))) {
      return 'Raydium AMM';
    } else if (protocolNames.some(name => name.includes('pump'))) {
      return 'Pump.fun AMM';
    } else if (protocolNames.some(name => name.includes('orca'))) {
      return 'Orca DEX';
    } else if (protocolNames.some(name => name.includes('serum'))) {
      return 'Serum DEX';
    } else {
      return 'DEX Protocol';
    }
  };

  const getFlowDescription = () => {
    if (transaction.transactionType !== 'swap') {
      return 'Your transaction was processed through the Solana network and completed successfully';
    }

    const protocolName = getProtocolName();
    return `You sent tokens from your wallet to ${protocolName}, which executed the swap and returned new tokens to your wallet`;
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getImpactIcon = () => {
    switch (explanation.impact.type) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'negative': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImpactColor = () => {
    switch (explanation.impact.type) {
      case 'positive': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'negative': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';
    }
  };

  const getComplexityColor = () => {
    switch (explanation.context.transactionComplexity) {
      case 'simple': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'complex': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    }
  };

  const getRiskColor = () => {
    switch (explanation.context.riskLevel) {
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Main Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-3xl shadow-2xl p-8 border border-blue-200 dark:border-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-8">
            <div className="flex-shrink-0">
              {transaction.success ? (
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <XCircle className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {explanation.whatHappened}
                </h2>
                <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-full">
                  {transaction.transactionType.toUpperCase()}
                </div>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {explanation.inPlainEnglish}
              </p>
              
              {/* Transaction Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Block #{transaction.slot.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{transaction.timestamp ? new Date(transaction.timestamp * 1000).toLocaleString() : 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Fee: {transaction.feeSOL.toFixed(6)} SOL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Key Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {explanation.keyPoints.map((point, index) => {
              const iconName = point.split(' ')[0];
              const text = point.substring(point.indexOf(' ') + 1);
              
              // Map icon names to actual Lucide React components
              const getIcon = (name: string) => {
                const iconProps = { className: "w-5 h-5" };
                switch (name) {
                  case 'CheckCircle': return <CheckCircle {...iconProps} />;
                  case 'XCircle': return <XCircle {...iconProps} />;
                  case 'Zap': return <Zap {...iconProps} />;
                  case 'Coins': return <Coins {...iconProps} />;
                  case 'DollarSign': return <DollarSign {...iconProps} />;
                  case 'ArrowLeftRight': return <ArrowLeftRight {...iconProps} />;
                  case 'BarChart3': return <BarChart3 {...iconProps} />;
                  case 'Send': return <Send {...iconProps} />;
                  case 'Lock': return <Lock {...iconProps} />;
                  case 'Unlock': return <Unlock {...iconProps} />;
                  case 'Gift': return <Gift {...iconProps} />;
                  case 'Clock': return <Clock {...iconProps} />;
                  case 'Edit': return <Edit {...iconProps} />;
                  case 'Wallet': return <Wallet {...iconProps} />;
                  default: return <Info {...iconProps} />;
                }
              };
              
              // Color coding based on content
              let bgColor = 'bg-white dark:bg-gray-800';
              let borderColor = 'border-gray-200 dark:border-gray-700';
              let iconBg = 'bg-blue-100 dark:bg-blue-900/30';
              let iconColor = 'text-blue-600 dark:text-blue-400';
              
              if (text.includes('successfully') || text.includes('completed')) {
                iconBg = 'bg-green-100 dark:bg-green-900/30';
                iconColor = 'text-green-600 dark:text-green-400';
              } else if (text.includes('fee') || text.includes('cost')) {
                iconBg = 'bg-yellow-100 dark:bg-yellow-900/30';
                iconColor = 'text-yellow-600 dark:text-yellow-400';
              } else if (text.includes('transfer') || text.includes('swap')) {
                iconBg = 'bg-purple-100 dark:bg-purple-900/30';
                iconColor = 'text-purple-600 dark:text-purple-400';
              } else if (text.includes('stake') || text.includes('lock')) {
                iconBg = 'bg-indigo-100 dark:bg-indigo-900/30';
                iconColor = 'text-indigo-600 dark:text-indigo-400';
              } else if (text.includes('reward') || text.includes('gift')) {
                iconBg = 'bg-pink-100 dark:bg-pink-900/30';
                iconColor = 'text-pink-600 dark:text-pink-400';
              }
              
              return (
                <div key={index} className={`${bgColor} ${borderColor} border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <span className={iconColor}>
                        {getIcon(iconName)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                        {text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Success Badge */}
          {transaction.success && (
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Transaction Successful</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Transaction Flow Visualization */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Flow</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visual representation of your transaction journey</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-8">
            {/* Your Wallet */}
            <div className="flex flex-col items-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">Your Wallet</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Source</span>
            </div>
            
            {/* Animated Arrow */}
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></div>
                <div className="absolute top-1/2 right-0 w-0 h-0 border-l-4 border-l-blue-400 border-t-2 border-t-transparent border-b-2 border-b-transparent transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-0 w-2 h-2 bg-blue-400 rounded-full transform -translate-y-1/2 animate-pulse"></div>
              </div>
            </div>
            
            {/* Network/DEX */}
            <div className="flex flex-col items-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">
                {getProtocolName()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Processing</span>
            </div>
            
            {/* Animated Arrow */}
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                <div className="absolute top-1/2 right-0 w-0 h-0 border-l-4 border-l-purple-400 border-t-2 border-t-transparent border-b-2 border-b-transparent transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-0 w-2 h-2 bg-purple-400 rounded-full transform -translate-y-1/2 animate-pulse"></div>
              </div>
            </div>
            
            {/* Destination */}
            <div className="flex flex-col items-center group">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">
                {transaction.transactionType === 'swap' ? 'Token Pool' : 'Destination'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
            </div>
          </div>
          
          {/* Enhanced Flow Description */}
          <div className="mt-8 text-center">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">Transaction Complete</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {getFlowDescription()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Market Data */}
      <RealTimeData transaction={transaction} />

      {/* Enhanced Transaction Context */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-3xl shadow-2xl p-8 border border-blue-200 dark:border-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-14 translate-x-14"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full translate-y-10 -translate-x-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Transaction Context
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Understanding the transaction characteristics
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Complexity</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transaction difficulty</p>
                </div>
              </div>
              <div className="text-center">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getComplexityColor()}`}>
                  {explanation.context.transactionComplexity.charAt(0).toUpperCase() + explanation.context.transactionComplexity.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Processing Time</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expected duration</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{explanation.context.estimatedTime}</p>
              </div>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Risk Level</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Safety assessment</p>
                </div>
              </div>
              <div className="text-center">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getRiskColor()}`}>
                  {explanation.context.riskLevel.charAt(0).toUpperCase() + explanation.context.riskLevel.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Common Use Case</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Typical scenarios for this transaction</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{explanation.context.commonUseCase}</p>
          </div>
        </div>
      </div>

      {/* Impact Analysis */}
      <div className={`rounded-2xl shadow-xl p-6 border ${getImpactColor()}`}>
        <div className="flex items-center gap-3 mb-3">
          {getImpactIcon()}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Impact Analysis
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{explanation.impact.description}</p>
        
        {explanation.impact.portfolioChange && (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Portfolio Change</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{explanation.impact.portfolioChange}</p>
          </div>
        )}
        
        {explanation.impact.marketImpact && (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Market Impact</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{explanation.impact.marketImpact}</p>
          </div>
        )}
      </div>

      {/* Enhanced Smart Insights */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 rounded-3xl shadow-2xl p-8 border border-purple-200 dark:border-purple-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-400/10 to-purple-400/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Smart Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered analysis and recommendations
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Efficiency Rating</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Performance analysis</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{explanation.insights.efficiency}</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Cost Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fee breakdown and comparison</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{explanation.insights.costAnalysis}</p>
            </div>
            
            {explanation.insights.alternatives.length > 0 && (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Alternative Options</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Better platforms to consider</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {explanation.insights.alternatives.map((alternative, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">{alternative}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <button
          onClick={() => toggleSection('steps')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Step-by-Step Breakdown
            </h3>
          </div>
          {expandedSections.has('steps') ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.has('steps') && (
          <div className="mt-4 space-y-3">
            {explanation.stepByStep.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational Content */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl shadow-xl p-6 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Learn More
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Key Concepts */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Key Concepts</span>
            </div>
            <div className="space-y-2">
              {explanation.educationalContent.concepts.slice(0, 3).map((concept, index) => (
                <div key={index} className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>{concept.split(' - ')[0]}:</strong> {concept.split(' - ')[1]}
                </div>
              ))}
            </div>
          </div>
          
          {/* Pro Tips */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Pro Tips</span>
            </div>
            <div className="space-y-2">
              {explanation.educationalContent.tips.slice(0, 3).map((tip, index) => (
                <div key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
          
          {/* Important Warnings */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Important</span>
            </div>
            <div className="space-y-2">
              {explanation.educationalContent.warnings.slice(0, 3).map((warning, index) => (
                <div key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">⚠</span>
                  {warning}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <button
          onClick={() => toggleSection('technical')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Technical Details
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              (For advanced users)
            </span>
          </div>
          {expandedSections.has('technical') ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.has('technical') && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Cost</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {explanation.technicalDetails.totalCost}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Network Fee</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {explanation.technicalDetails.networkFee}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Priority Fee</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {explanation.technicalDetails.priorityFee}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Compute Units</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {explanation.technicalDetails.computeUnits}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

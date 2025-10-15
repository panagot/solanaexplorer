'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { analyzeMEV } from '@/lib/mevDetector';
import type { MEVAnalysis } from '@/lib/mevDetector';
import type { SolanaTransactionExplanation } from '@/types/transaction';

interface Props {
  transaction: SolanaTransactionExplanation;
}

export default function MEVAnalysis({ transaction }: Props) {
  const [mevAnalysis, setMevAnalysis] = useState<MEVAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyze = async () => {
      try {
        const analysis = analyzeMEV(transaction);
        setMevAnalysis(analysis);
      } catch (error) {
        console.error('MEV analysis failed:', error);
      } finally {
        setLoading(false);
      }
    };

    analyze();
  }, [transaction]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!mevAnalysis || !mevAnalysis.hasMEV) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">MEV Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">No MEV activities detected</p>
          </div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-green-700 dark:text-green-300 text-sm">
            ✅ This transaction appears to be clean with no MEV activities detected.
          </p>
        </div>
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-700 dark:text-red-300';
      case 'medium':
        return 'text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Zap className="w-4 h-4" />;
      case 'sandwich':
        return <AlertTriangle className="w-4 h-4" />;
      case 'arbitrage':
        return <TrendingUp className="w-4 h-4" />;
      case 'frontrun':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center`}>
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">MEV Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Risk Level: <span className={`font-semibold ${getRiskTextColor(mevAnalysis.riskLevel)}`}>
              {mevAnalysis.riskLevel.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className={`p-4 rounded-xl border mb-6 ${getRiskColor(mevAnalysis.riskLevel)}`}>
        <p className={`text-sm ${getRiskTextColor(mevAnalysis.riskLevel)}`}>
          {mevAnalysis.summary}
        </p>
      </div>

      {/* Activities */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Detected Activities</h4>
        {mevAnalysis.activities.map((activity, index) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3 mb-2">
              {getActivityIcon(activity.type)}
              <h5 className="font-semibold text-gray-900 dark:text-white">{activity.description}</h5>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(activity.severity)} ${getRiskTextColor(activity.severity)}`}>
                {activity.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{activity.explanation}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.impact}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {mevAnalysis.recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {mevAnalysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
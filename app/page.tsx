'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Moon, Sun, History, TrendingUp, Copy, Download, Share2, ExternalLink, ArrowRight, XCircle } from 'lucide-react';
import { fetchTransactionDetails, fetchRecentTransactions } from '@/lib/solanaClient';
import { parseSolanaTransaction } from '@/lib/transactionParser';
import type { SolanaTransactionExplanation } from '@/types/transaction';
import EnhancedTransactionFlow from '@/components/EnhancedTransactionFlow';
import MEVAnalysis from '@/components/MEVAnalysis';
import EnhancedUserFriendlyExplanation from '@/components/EnhancedUserFriendlyExplanation';
import BalanceChanges from '@/components/BalanceChanges';
import EducationalContent from '@/components/EducationalContent';

export default function Home() {
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<SolanaTransactionExplanation | null>(null);
  const [history, setHistory] = useState<SolanaTransactionExplanation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [recentTxs, setRecentTxs] = useState<string[]>([]);
  const [showRecentFeed, setShowRecentFeed] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showWhySection, setShowWhySection] = useState(false);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('solana-tx-history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to load history:', e);
        }
      }

      const savedDarkMode = localStorage.getItem('solana-dark-mode');
      if (savedDarkMode === 'true') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('solana-dark-mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('solana-dark-mode', 'false');
      }
    }
  }, [darkMode]);

  const fetchRecentTransactionsLocal = async () => {
    try {
      const signatures = await fetchRecentTransactions(10);
      setRecentTxs(signatures);
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error);
    }
  };

  const handleExplain = async () => {
    if (!signature.trim()) {
      setError('Please enter a transaction signature');
      return;
    }

    setLoading(true);
    setError('');
    setTransaction(null);

    try {
      console.log('Fetching transaction:', signature);
      const rawTransaction = await fetchTransactionDetails(signature.trim());
      
      if (!rawTransaction) {
        throw new Error('Transaction not found');
      }

      console.log('Parsing transaction...');
      const explanation = parseSolanaTransaction(rawTransaction);
      setTransaction(explanation);
      
      // Add to history
      const newHistory = [explanation, ...history.filter(h => h.signature !== explanation.signature)].slice(0, 10);
      setHistory(newHistory);
      if (typeof window !== 'undefined') {
        localStorage.setItem('solana-tx-history', JSON.stringify(newHistory));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (tx: SolanaTransactionExplanation) => {
    setSignature(tx.signature);
    setTransaction(tx);
    setShowHistory(false);
  };

  const loadFromRecent = async (digest: string) => {
    setSignature(digest);
    setLoading(true);
    setError('');
    setTransaction(null);

    try {
      const rawTransaction = await fetchTransactionDetails(digest);
      if (!rawTransaction) {
        throw new Error('Transaction not found');
      }

      const explanation = parseSolanaTransaction(rawTransaction);
      setTransaction(explanation);
      
      const newHistory = [explanation, ...history.filter(h => h.signature !== explanation.signature)].slice(0, 10);
      setHistory(newHistory);
      if (typeof window !== 'undefined') {
        localStorage.setItem('solana-tx-history', JSON.stringify(newHistory));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
    } finally {
      setLoading(false);
      setShowRecentFeed(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportToJSON = () => {
    if (!transaction) return;
    
    const dataStr = JSON.stringify(transaction, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solana-transaction-${transaction.signature.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareTransaction = async () => {
    if (!transaction) return;
    
    const shareData = {
      title: 'Solana Transaction Analysis',
      text: `Transaction: ${transaction.signature}\nSummary: ${transaction.summary}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      await copyToClipboard(shareData.text, 'share');
    }
  };

  const openInExplorer = () => {
    if (!transaction) return;
    window.open(`https://solscan.io/tx/${transaction.signature}`, '_blank');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'swap': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'transfer': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'stake': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'create_account': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col">
      {/* Ultra-Professional Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 flex items-center justify-center">
                <img 
                  src="https://solana.com/src/img/branding/solanaLogoMark.png" 
                  alt="Solana Logo" 
                  className="w-10 h-10"
                />
              </div>
                     <div>
                       <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                         Solana Explorer
                       </h1>
                       <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                         Making Transactions Easy to Read
                       </p>
                     </div>
            </div>
            
            {/* Premium Search in Header */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="flex gap-4">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Enter transaction signature..."
                    className="w-full p-4 pl-12 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:text-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:border-slate-300 dark:group-hover:border-slate-500"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <button
                  onClick={handleExplain}
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span className="font-semibold">Analyze</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowRecentFeed(!showRecentFeed);
                  if (!showRecentFeed) fetchRecentTransactionsLocal();
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
                title="Recent transactions"
              >
                <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent</span>
              </button>
              
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
                title="View history"
              >
                <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">History</span>
              </button>
              
                     <button
                       onClick={() => setShowWhySection(!showWhySection)}
                       className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/40 dark:to-indigo-900/40 hover:from-blue-200 dark:hover:from-blue-900/60 rounded-xl transition-all duration-200 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-md"
                       title="Why we built this"
                     >
                       <span className="text-blue-600 dark:text-blue-400 text-lg">💡</span>
                     </button>
                     
                     <button
                       onClick={toggleDarkMode}
                       className="p-3 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
                       title="Toggle dark mode"
                     >
                       {darkMode ? (
                         <Sun className="w-5 h-5 text-amber-500" />
                       ) : (
                         <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                       )}
                     </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 flex-1">

        {/* Recent Feed Panel */}
        {showRecentFeed && recentTxs.length > 0 && (
          <div className="mb-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Latest Transactions
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {recentTxs.length} recent transactions on Solana
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTxs.map((digest) => (
                <button
                  key={digest}
                  onClick={() => loadFromRecent(digest)}
                  className="text-left p-5 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-300 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Search className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {digest.slice(0, 12)}...
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white font-medium">
                        Analyze Transaction
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && history.length > 0 && (
          <div className="mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Transaction History
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {history.length} analyzed transactions
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('solana-tx-history');
                  }
                  setHistory([]);
                }}
                className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((tx) => (
                <button
                  key={tx.signature}
                  onClick={() => loadFromHistory(tx)}
                  className="text-left p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.transactionType === 'swap' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                      tx.transactionType === 'transfer' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                      tx.transactionType === 'stake' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                      'bg-gradient-to-br from-slate-500 to-gray-600'
                    }`}>
                      <span className="text-white text-xs font-bold">
                        {tx.transactionType === 'swap' ? 'SW' : 
                         tx.transactionType === 'transfer' ? 'TR' :
                         tx.transactionType === 'stake' ? 'ST' : 'TX'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {tx.signature.slice(0, 12)}...
                      </p>
                      <p className="text-sm text-slate-900 dark:text-white font-medium line-clamp-2 mb-2">
                        {tx.summary}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date((tx.timestamp || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 dark:text-red-400 text-sm">⚠</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Analysis Error</h3>
                <p className="text-red-700 dark:text-red-400 mb-3">{error}</p>
                <p className="text-sm text-red-600 dark:text-red-500">
                  💡 <strong>Tip:</strong> Try a fresh transaction signature from <a href="https://solscan.io" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Solscan</a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Why We Built This - Ultra Premium Toggleable */}
        {showWhySection && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-700">
            <div className="relative">
              {/* Premium Background with Multiple Layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5 rounded-3xl blur-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/3 via-blue-500/3 to-purple-500/3 rounded-3xl"></div>
              
              <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 dark:border-slate-700/30 shadow-2xl">
                {/* Floating Orbs */}
                <div className="absolute top-8 right-8 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-lg animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-md animate-pulse delay-500"></div>
                
                <div className="relative z-10">
                  {/* Premium Header */}
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-blue-500/20">
                          <span className="text-white text-2xl">💡</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent tracking-tight">
                          Why We Built This
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium mt-1">
                          Making Solana accessible to everyone
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowWhySection(false)}
                      className="group p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 hover:scale-110"
                      title="Close"
                    >
                      <XCircle className="w-6 h-6 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Hero Statement */}
                  <div className="mb-12 text-center">
                    <div className="max-w-4xl mx-auto">
                      <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                        Current Solana explorers show raw blockchain data that's overwhelming and technical.
                      </p>
                    </div>
                  </div>
                  
                  {/* Premium Problem vs Solution Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Problem Card - Enhanced */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      <div className="relative bg-gradient-to-br from-red-50/90 to-rose-50/90 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur-xl rounded-3xl p-8 border border-red-200/60 dark:border-red-700/60 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-2xl">😵</span>
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">The Problem</h4>
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Why current explorers are hard to read</p>
                          </div>
                        </div>
                        <ul className="space-y-4">
                          {[
                            "Raw transaction data is overwhelming and hard to read",
                            "Existing explorers require blockchain expertise to understand", 
                            "Users can't easily read what their transactions actually did",
                            "No clear explanations make transactions confusing to read"
                          ].map((item, index) => (
                            <li key={index} className="flex items-start gap-4 group/item">
                              <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-125 transition-transform"></div>
                              <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Solution Card - Enhanced */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      <div className="relative bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-xl rounded-3xl p-8 border border-green-200/60 dark:border-green-700/60 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-2xl">💡</span>
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Our Solution</h4>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Making transactions easy to read</p>
                          </div>
                        </div>
                        <ul className="space-y-4">
                          {[
                            "Easy-to-read plain English explanations for everyone",
                            "Clear visual transaction flows that are simple to follow",
                            "Readable USD values and market context", 
                            "Educational content that makes blockchain easy to read"
                          ].map((item, index) => (
                            <li key={index} className="flex items-start gap-4 group/item">
                              <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-125 transition-transform"></div>
                              <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ultra-Professional Example Transactions */}
        <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/50 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-slate-900/90 rounded-3xl p-8 mb-10 border border-slate-200/60 dark:border-slate-700/60 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-semibold mb-4 shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Examples
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              Try Example Transactions
            </h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">
              Click any example below to see our advanced analysis in action
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
              <span className="text-blue-600 dark:text-blue-400 text-lg">📖</span>
              <p className="text-blue-700 dark:text-blue-300 font-semibold text-sm">
                An Easy to Read Solana Blockchain Explorer
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setSignature('abc123def4567890123456789012345678901234567890123456789012345678901234567890')}
              className="group p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 text-left transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white text-sm">🔄</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Jupiter Swap</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Token aggregator</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                Advanced token swap analysis through Jupiter's aggregation protocol
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium">
                <span>Try this example</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            
            <button
              onClick={() => setSignature('def456abc1237890123456789012345678901234567890123456789012345678901234567890')}
              className="group p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white text-sm">🏊</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Raydium AMM</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Automated market maker</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                Comprehensive AMM swap analysis with liquidity pool insights
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                <span>Try this example</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            
            <button
              onClick={() => setSignature('xyz789abc1234567890123456789012345678901234567890123456789012345678901234567890')}
              className="group p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white text-sm">🚀</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Pump.fun</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Meme token platform</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                Meme token swap analysis with bonding curve mechanics
              </p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 text-xs font-medium">
                <span>Try this example</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
              <span className="text-slate-600 dark:text-slate-400 text-xs">
                💡 <strong>Pro tip:</strong> Copy any transaction signature from <a href="https://solscan.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">Solscan</a> or <a href="https://explorer.solana.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">Solana Explorer</a>
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        {transaction && (
          <div className="space-y-6">
            {/* Professional Summary Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0">
                    {transaction.success ? (
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl">✓</span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl">✗</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Transaction Analysis
                      </h2>
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getTransactionTypeColor(transaction.transactionType)}`}>
                        {transaction.transactionType.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                      {transaction.summary}
                    </p>
                  </div>
                </div>

                {/* Professional Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => copyToClipboard(transaction.signature, 'signature')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-200 font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    {copied === 'signature' ? 'Copied!' : 'Copy Signature'}
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl transition-all duration-200 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </button>
                  <button
                    onClick={shareTransaction}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl transition-all duration-200 font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={openInExplorer}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl transition-all duration-200 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Solscan
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced User-Friendly Explanation */}
            <EnhancedUserFriendlyExplanation transaction={transaction} />

            {/* Enhanced Transaction Flow */}
            <EnhancedTransactionFlow transaction={transaction} />

            {/* MEV Analysis */}
            <MEVAnalysis transaction={transaction} />

            {/* Balance Changes */}
            {transaction.balanceChanges && transaction.balanceChanges.length > 0 && (
              <BalanceChanges balanceChanges={transaction.balanceChanges} />
            )}

            {/* Educational Content */}
            {transaction.educationalContent && transaction.educationalContent.length > 0 && (
              <EducationalContent educationalContent={transaction.educationalContent} />
            )}

            {/* Error Information */}
            {transaction.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-4">
                  Transaction Failed
                </h3>
                <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4">
                  <pre className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                    {transaction.error}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Professional Footer */}
      <footer className="mt-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Features */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Real-time transaction monitoring</li>
                <li>• MEV detection & analysis</li>
                <li>• Educational content & explanations</li>
                <li>• Balance change tracking</li>
              </ul>
            </div>
            
            {/* Technology */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Technology</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Built with Next.js & TypeScript</li>
                <li>• Solana Web3.js integration</li>
                <li>• Rust program analysis</li>
                <li>• High-performance transaction parsing</li>
              </ul>
            </div>
            
            {/* Community */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Open source project</li>
                <li>• No registration required</li>
                <li>• Professional analysis tools</li>
                <li>• Built for Solana ecosystem</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Made with ❤️ for the Solana community
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                <span>© 2024 Solana Explorer</span>
                <span>•</span>
                <span>Grant Submission</span>
                <span>•</span>
                <span>Easy to Read Blockchain Explorer</span>
              </div>
              <a 
                href="https://twitter.com/Panagot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                title="Follow @Panagot on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
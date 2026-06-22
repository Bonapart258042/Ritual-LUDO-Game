import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  History, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  Award, 
  Hourglass,
  Trash2,
  TrendingUp,
  Coins
} from 'lucide-react';
import { 
  getRitualTransactions, 
  RitualTransaction, 
  RITUAL_EXPLORER 
} from '../utils/web3';
import { audio } from '../utils/audio';

interface VictoryRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWalletAddress: string | null;
}

export default function VictoryRecordsModal({
  isOpen,
  onClose,
  currentWalletAddress
}: VictoryRecordsModalProps) {
  const [transactions, setTransactions] = useState<RitualTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Load transactions from various keys to ensure absolute completeness
  const refreshHistory = () => {
    const list: RitualTransaction[] = [];
    const hashSet = new Set<string>();

    // 1. Fetch from 'ritual_transactions' key as explicitly requested:
    try {
      const raw = localStorage.getItem('ritual_transactions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((tx: any) => {
            if (tx && tx.hash && !hashSet.has(tx.hash)) {
              hashSet.add(tx.hash);
              list.push(tx);
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed to parsed 'ritual_transactions' local storage key:", e);
    }

    // 2. Fetch from active wallet address list:
    if (currentWalletAddress) {
      try {
        const walletTxs = getRitualTransactions(currentWalletAddress);
        walletTxs.forEach((tx) => {
          if (tx && tx.hash && !hashSet.has(tx.hash)) {
            hashSet.add(tx.hash);
            list.push(tx);
          }
        });
      } catch (e) {
        console.warn("Failed to load active wallet tx transactions:", e);
      }
    }

    // 3. Aggregate all wallet histories as a safety fallback
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ritual_tx_history_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((tx: any) => {
                if (tx && tx.hash && !hashSet.has(tx.hash)) {
                  hashSet.add(tx.hash);
                  list.push(tx);
                }
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to scan all storage keys:", e);
    }

    // Sort descending by timestamp
    const sorted = list.sort((a, b) => b.timestamp - a.timestamp);
    setTransactions(sorted);
  };

  useEffect(() => {
    if (isOpen) {
      refreshHistory();
      setCurrentPage(1);
    }
  }, [isOpen, currentWalletAddress]);

  // Handle Clipboard copies
  const handleCopyHash = (hash: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      audio?.playMove();
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  // Clear overall ledger with prompt
  const handleClearLedger = () => {
    if (!window.confirm("Are you sure you want to purge all historical victory records on this device? This action is irreversible.")) {
      return;
    }
    
    // Clear targeted keys
    localStorage.removeItem('ritual_transactions');
    if (currentWalletAddress) {
      localStorage.removeItem(`ritual_tx_history_${currentWalletAddress.toLowerCase()}`);
    }
    // Remove other matching keys
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ritual_tx_history_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (_) {}

    audio?.playCapture();
    refreshHistory();
    setCurrentPage(1);
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(tx => {
    const query = searchTerm.toLowerCase();
    return (
      tx.winner.toLowerCase().includes(query) ||
      tx.hash.toLowerCase().includes(query) ||
      (tx.walletAddress && tx.walletAddress.toLowerCase().includes(query))
    );
  });

  // Calculate statistics
  const totalGames = transactions.length;
  const totalGas = transactions.reduce((acc, tx) => {
    const val = parseFloat(tx.gasSpent);
    return isNaN(val) ? acc : acc + val;
  }, 0);

  const averageMoves = totalGames > 0
    ? Math.round(transactions.reduce((acc, tx) => acc + (tx.moves || 0), 0) / totalGames)
    : 0;

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-slate-900/95 border border-indigo-500/25 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden z-10"
          >
            {/* Header section with abstract network lines */}
            <div className="p-6 pb-4 border-b border-white/5 relative bg-gradient-to-r from-indigo-950/30 to-slate-900">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <History className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-black text-white italic tracking-wide uppercase">On-Chain Victory Ledger</h3>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Ritual Network Ledger Certifications</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audio?.playMove();
                    onClose();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats dashboard strip */}
              {transactions.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                  <div className="bg-slate-950/50 border border-white/5 rounded-xl p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-slate-400 uppercase">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>Certified</span>
                    </div>
                    <div className="text-sm font-display font-black text-white mt-0.5">{totalGames} Games</div>
                  </div>
                  
                  <div className="bg-slate-950/50 border border-white/5 rounded-xl p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-slate-400 uppercase">
                      <Coins className="w-3 h-3 text-indigo-400" />
                      <span>Gas Spent</span>
                    </div>
                    <div className="text-sm font-display font-black text-indigo-300 mt-0.5">
                      {totalGas.toFixed(4)} R
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-white/5 rounded-xl p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-[9px] font-mono text-slate-400 uppercase">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>Avg Moves</span>
                    </div>
                    <div className="text-sm font-display font-black text-emerald-400 mt-0.5">{averageMoves}</div>
                  </div>
                </div>
              )}
            </div>

            {/* List and Actions panel */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {/* Search & Action bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by winner name or transaction hash..."
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {transactions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLedger}
                    className="p-2 border border-rose-500/25 hover:border-rose-500 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    title="Wipe Local Ledger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Transactions layout */}
              {paginatedTransactions.length === 0 ? (
                <div className="py-12 px-4 text-center bg-slate-950/30 border border-white/5 rounded-2xl space-y-3">
                  <Cpu className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-xs text-white font-extrabold font-mono uppercase tracking-wider">No Records Catalogued</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                      {transactions.length === 0 
                        ? 'Connect to the Ritual testnet, secure a legendary board victory, and broadcast the outcomes to write your deed into the ledger!'
                        : 'No records matching the current query index filter.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedTransactions.map((tx) => (
                    <div
                      key={tx.hash}
                      className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col gap-2.5 transition-all hover:bg-slate-950/70 text-xs border-l-2 hover:border-l-indigo-500 border-l-indigo-500/30"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-white font-bold flex items-center gap-1">
                          👑 Winner: <span className="text-[#ffe066]">{tx.winner}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                          <Hourglass className="w-11 h-11 h-3 w-3 text-indigo-400" />
                          {new Date(tx.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-300 border-t border-b border-white/5 py-2 font-mono">
                        <div>
                          <span className="text-slate-400">Total Moves:</span>{' '}
                          <span className="text-[#ffe066] font-bold">{tx.moves || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Match Time:</span>{' '}
                          <span className="text-amber-300 font-bold">{tx.duration ? `${tx.duration}s` : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Gas Spent:</span>{' '}
                          <span className="text-indigo-300 font-bold">{tx.gasSpent}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Verification:</span>{' '}
                          <span className="text-emerald-400 font-bold">Confirmed ✓</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 bg-black/40 border border-white/5 px-2.5 py-1.5 rounded-xl">
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]" title={tx.hash}>
                          Tx: {tx.hash}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyHash(tx.hash)}
                            className="text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all p-1 hover:bg-white/5 rounded"
                            title="Copy Transaction Hash"
                          >
                            {copiedHash === tx.hash ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          
                          <a
                            href={`${RITUAL_EXPLORER}/tx/${tx.hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-405 text-slate-400 hover:text-amber-400 active:scale-95 transition-all p-1 hover:bg-white/5 rounded flex items-center justify-center"
                            title="Inspect on Ritual Block BlockScanner"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="p-4 px-6 border-t border-white/5 bg-slate-950/20 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    audio?.playMove();
                    setCurrentPage(prev => Math.max(1, prev - 1));
                  }}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-lg border border-white/10 flex items-center gap-1 transition-all ${
                    currentPage === 1 
                      ? 'text-slate-600 bg-transparent border-white/5 cursor-not-allowed' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                
                <span className="text-[11px] font-mono text-slate-400">
                  Page <strong className="text-white">{currentPage}</strong> of{' '}
                  <strong className="text-white">{totalPages}</strong>
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    audio?.playMove();
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  }}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-lg border border-white/10 flex items-center gap-1 transition-all ${
                    currentPage === totalPages 
                      ? 'text-slate-600 bg-transparent border-white/5 cursor-not-allowed' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer'
                  }`}
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

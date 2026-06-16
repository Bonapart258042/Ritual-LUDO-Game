/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Wallet, 
  Network, 
  Coins, 
  AlertCircle, 
  ExternalLink, 
  Check, 
  Copy, 
  Database, 
  X, 
  Sparkles,
  RefreshCw,
  Trophy
} from 'lucide-react';
import { 
  Web3WalletState, 
  WalletType, 
  RITUAL_CHAIN_ID, 
  RITUAL_RPC_HTTP, 
  RITUAL_EXPLORER, 
  RITUAL_CONTRACTS,
  getRitualTransactions,
  RitualTransaction
} from '../utils/web3';
import { audio } from '../utils/audio';

interface Web3WalletHubProps {
  walletState: Web3WalletState;
  onConnect: (type: WalletType) => Promise<void>;
  onDisconnect: () => void;
  onSwitchNetwork: () => Promise<void>;
  onFaucetClaim?: () => void;
}

export default function Web3WalletHub({ 
  walletState, 
  onConnect, 
  onDisconnect, 
  onSwitchNetwork,
  onFaucetClaim
}: Web3WalletHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedContract, setCopiedContract] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeTab, setActiveTab] = useState<'contracts' | 'history'>('contracts');

  const transactions = walletState.address ? getRitualTransactions(walletState.address) : [];

  const handleCopyContract = (name: string, address: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopiedContract(name);
      audio?.playMove();
      setTimeout(() => setCopiedContract(null), 2000);
    }
  };

  const handleCopyAddress = (addr: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(addr);
      setCopiedAddress(true);
      audio?.playMove();
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const isChainCorrect = walletState.chainId === RITUAL_CHAIN_ID;

  return (
    <>
      {/* Direct Connection & status tracker in header */}
      <div className="flex items-center gap-2">
        <button
          id="btn-open-web3-hub"
          onClick={() => {
            if (walletState.status !== 'connected') {
              onConnect('metamask');
            } else {
              setIsOpen(true);
            }
            audio?.playYardExit();
          }}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer border ${
            walletState.status === 'connected'
              ? isChainCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
              : 'bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-amber-500/20 border-amber-500/40 hover:border-amber-400 text-white font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:scale-[1.02]'
          }`}
        >
          <img 
            src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
            alt="MetaMask" 
            className="w-4 h-4 animate-pulse" 
          />
          <span>
            {walletState.status === 'connected' && walletState.address
              ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`
              : 'Connect MetaMask'}
          </span>
          {walletState.status === 'connected' && (
            <span className={`w-1.5 h-1.5 rounded-full ${isChainCorrect ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-amber-400 shadow-[0_0_5px_#fbbf24]'}`} />
          )}
        </button>
      </div>

      {/* Main Full HUD Modal (Only available when connected) */}
      {isOpen && walletState.status === 'connected' && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all overflow-y-auto">
          <div 
            id="web3-hub-overlay"
            className="absolute inset-0" 
            onClick={() => setIsOpen(false)} 
          />

          <div
            id="web3-hub-modal"
            className="bg-gradient-to-b from-[#0c1e3e] via-[#061229] to-[#030914] border border-indigo-500/20 rounded-[2.5rem] max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative z-10 text-slate-200 animate-scale-in"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-[#cc6600] flex items-center justify-center text-white shadow-xl">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                    MetaMask Web3 Hub <span className="text-[9px] font-mono non-italic uppercase tracking-widest bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-full">Ritual Testnet 1979</span>
                  </h3>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Connected with Deployment Address</p>
                </div>
              </div>

              <button
                id="btn-close-web3-portal"
                onClick={() => {
                  setIsOpen(false);
                  audio?.playMove();
                }}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connected details */}
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 uppercase">Provider:</span>
                    <span className="text-xs font-mono font-black text-amber-400 uppercase bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-pulse" /> MetaMask Wallet (EVM)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-mono text-slate-400">Address:</span>
                    <div className="flex items-center gap-1 bg-black/40 border border-white/5 px-2.5 py-1 rounded-xl">
                      <span className="text-xs font-mono text-white font-extrabold">
                        {walletState.address}
                      </span>
                      <button
                        id="btn-copy-address"
                        onClick={() => walletState.address && handleCopyAddress(walletState.address)}
                        className="text-slate-400 hover:text-white cursor-pointer ml-1"
                        title="Copy full address"
                      >
                        {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Network validation indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/5 font-sans">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-xs text-slate-350 block leading-tight">Blockchain Network:</span>
                      <span className="text-xs text-white font-mono font-black">
                        {isChainCorrect ? "Ritual Testnet (ID 1979)" : `Other Network (ID ${walletState.chainId})`}
                      </span>
                    </div>
                  </div>

                  {!isChainCorrect ? (
                    <button
                      id="btn-switch-ritual-network"
                      onClick={() => {
                        onSwitchNetwork();
                        audio?.playYardExit();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-display font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} /> Switch to Ritual Testnet
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-mono font-black uppercase text-emerald-300">Synchronized on Ritual</span>
                    </div>
                  )}
                </div>

                {/* Token Balance */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 font-sans">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block font-mono">AVAILABLE RITUAL BALANCE:</span>
                      <span className="text-base text-white font-mono font-black">
                        {walletState.balance} <span className="text-amber-400">RITUAL</span>
                      </span>
                    </div>
                  </div>

                  {onFaucetClaim && (
                    <button
                      id="btn-claim-sandbox-ritual"
                      onClick={() => {
                        onFaucetClaim();
                        audio?.playMove();
                      }}
                      className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 font-mono font-black rounded-lg cursor-pointer transition-all text-[10px]"
                      title="Claim +100 RITUAL gas tokens to test transaction gas fees"
                    >
                      Claim +100 Faucet
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-indigo-500/15">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('contracts');
                    audio?.playMove();
                  }}
                  className={`flex-1 pb-3 text-xs font-mono uppercase tracking-wider font-black border-b-2 transition-all cursor-pointer ${
                    activeTab === 'contracts'
                      ? 'border-amber-500 text-white font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-250'
                  }`}
                >
                  System Contracts
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('history');
                    audio?.playMove();
                  }}
                  className={`flex-1 pb-3 text-xs font-mono uppercase tracking-wider font-black border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'border-amber-500 text-white font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-255'
                  }`}
                >
                  Transaction History 
                  {transactions.length > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full text-[9px] scale-95 leading-none">
                      {transactions.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'contracts' && (
                /* Ritual Testnet System Contracts */
                <div className="space-y-3 font-sans animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-indigo-500/10 pb-1.5">
                    <Database className="w-4 h-4 text-[#ffe066]" />
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-200">Ritual System Contracts (MetaMask Deployments)</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(RITUAL_CONTRACTS).map(([name, address]) => (
                      <div 
                        key={name}
                        className="p-2 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col gap-1 transition-all hover:bg-slate-950/70"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-black text-indigo-300 uppercase tracking-wide">
                            {name}
                          </span>
                          <a 
                            href={`${RITUAL_EXPLORER}/address/${address}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[9px] font-mono text-slate-500 hover:text-amber-400 flex items-center gap-0.5"
                          >
                            Explorer <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        
                        <div className="flex items-center justify-between gap-1.5 mt-0.5 bg-black/30 border border-white/5 px-2 py-0.5 rounded-lg">
                          <span className="text-[9.5px] font-mono text-slate-350 truncate">
                            {address}
                          </span>
                          <button
                            id={`btn-copy-contract-${name}`}
                            onClick={() => handleCopyContract(name, address)}
                            className="text-slate-500 hover:text-white shrink-0 cursor-pointer"
                            title="Copy contract hash"
                          >
                            {copiedContract === name ? (
                              <Check className="w-3 h-3 text-emerald-400 animate-pulse" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3 font-sans animate-fade-in">
                  <div className="flex items-center justify-between border-b border-indigo-500/10 pb-1.5">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#ffe066]" />
                      <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-200">
                        Victory Deed Ledger
                      </h4>
                    </div>
                    {transactions.length > 0 && (
                      <button
                        onClick={() => {
                          if (walletState.address && typeof window !== 'undefined') {
                            localStorage.removeItem(`ritual_tx_history_${walletState.address.toLowerCase()}`);
                            audio?.playCapture();
                          }
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-mono font-bold uppercase transition-all cursor-pointer bg-rose-500/5 px-2 py-0.5 rounded-lg border border-rose-500/15 hover:bg-rose-500/10"
                      >
                        Clear Ledger
                      </button>
                    )}
                  </div>

                  {transactions.length === 0 ? (
                    <div className="py-8 px-4 text-center bg-slate-950/40 border border-white/5 rounded-2xl space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
                        No transactions registered on Ritual yet. Play Ludo, achieve ultimate victory, and click <strong>"Broadcast Victory"</strong> to serialize your deed forever!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                      {transactions.map((tx) => (
                        <div 
                          key={tx.hash}
                          className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col gap-2 transition-all hover:bg-slate-950/70 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-white font-extrabold flex items-center gap-1">
                              👑 Winner: <span className="text-[#ffe066]">{tx.winner}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(tx.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300 border-t border-b border-white/5 py-1.5 font-mono">
                            <div>
                              <span className="text-slate-400">Moves Count:</span> <span className="text-[#ffe066] font-bold">{tx.moves}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Duration:</span> <span className="text-[#ffe065] font-bold">{tx.duration}s</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Gas Spent:</span> <span className="text-indigo-300 font-bold">{tx.gasSpent}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Status:</span> <span className="text-emerald-400 font-bold">Confirmed ✓</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 bg-black/30 border border-white/5 px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] font-mono text-slate-400 truncate">
                              Hash: {tx.hash}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                    navigator.clipboard.writeText(tx.hash);
                                    setCopiedContract(tx.hash);
                                    audio?.playMove();
                                    setTimeout(() => setCopiedContract(null), 2000);
                                  }
                                }}
                                className="text-slate-400 hover:text-white cursor-pointer hover:scale-105 active:scale-95 transition-all"
                                title="Copy Tx Hash"
                              >
                                {copiedContract === tx.hash ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <a 
                                href={`${RITUAL_EXPLORER}/tx/${tx.hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-amber-400 hover:scale-105 transition-all"
                                title="View in Ritual Explorer"
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
              )}

              <div className="flex gap-2 font-mono">
                <button
                  id="btn-disconnect-wallet"
                  onClick={() => {
                    onDisconnect();
                    setIsOpen(false);
                    audio?.playMove();
                  }}
                  className="w-full py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-450 hover:text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>

            {/* Chain parameters reference summary */}
            <div className="bg-slate-950/60 rounded-3xl p-4 border border-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
              <div>
                <p className="text-slate-450 block text-[9px] uppercase font-bold tracking-widest text-[#ffe066]">RITUAL TESTNET RPC ENDPOINT</p>
                <code className="text-slate-300 select-all">{RITUAL_RPC_HTTP}</code>
              </div>
              <div>
                <p className="text-slate-450 block text-[9px] uppercase font-bold tracking-widest text-[#ffe066]">EXPLORER PORTAL</p>
                <a 
                  href={RITUAL_EXPLORER}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                >
                  explorer.ritualfoundation.org <ExternalLink className="w-3" />
                </a>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}

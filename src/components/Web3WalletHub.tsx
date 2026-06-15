/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  Web3WalletState, 
  WalletType, 
  RITUAL_CHAIN_ID, 
  RITUAL_CHAIN_HEX, 
  RITUAL_RPC_HTTP, 
  RITUAL_EXPLORER, 
  RITUAL_CONTRACTS, 
  hasMetaMask, 
  hasOKXWallet 
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
      {/* Small floating status tracker in header or setup page */}
      <div className="flex items-center gap-2">
        <button
          id="btn-open-web3-hub"
          onClick={() => {
            setIsOpen(true);
            audio?.playYardExit();
          }}
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer border ${
            walletState.status === 'connected'
              ? isChainCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10 text-slate-300'
          }`}
        >
          <Wallet className={`w-4 h-4 ${walletState.status === 'connected' ? 'animate-pulse' : ''}`} />
          <span className="hidden md:inline">
            {walletState.status === 'connected' && walletState.address
              ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`
              : 'Connect Wallet'}
          </span>
          <span className="md:hidden">
            {walletState.status === 'connected' ? 'Connected' : 'Connect'}
          </span>
          {walletState.status === 'connected' && (
            <span className={`w-1.5 h-1.5 rounded-full ${isChainCorrect ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          )}
        </button>
      </div>

      {/* Main Full HUD Drawer/Dialog */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all overflow-y-auto">
          <div 
            id="web3-hub-overlay"
            className="absolute inset-0" 
            onClick={() => setIsOpen(false)} 
          />

          <div
            id="web3-hub-modal"
            className="bg-gradient-to-b from-[#0c1e3e] via-[#061229] to-[#030914] border border-indigo-500/20 rounded-[2.5rem] max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative z-10 text-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black tracking-tight text-white uppercase italic flex items-center gap-2">
                    Web3 Wallet Portal <span className="text-[9px] font-mono non-italic uppercase tracking-widest bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-full">Ritual Testnet 1979</span>
                  </h3>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-450">MetaMask & OKX Wallet Integration</p>
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

            {/* Wallet Status / Connection Form */}
            {walletState.status === 'disconnected' || walletState.status === 'connecting' ? (
              <div className="space-y-4">
                <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-5 space-y-2 text-center">
                  <Coins className="w-12 h-12 text-amber-400 mx-auto animate-bounce mb-2" />
                  <h4 className="font-display font-black text-white text-base uppercase">Connect to Sign Ludo Deeds</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    By connecting MetaMask or OKX, you can write match outcome transactions on the <strong>Ritual Testnet (Chain ID 1979)</strong> and accumulate historic credits.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* MetaMask Connection Button */}
                  <button
                    id="btn-connect-metamask"
                    onClick={() => {
                      onConnect('metamask');
                      audio?.playYardExit();
                    }}
                    disabled={walletState.status === 'connecting'}
                    className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-white/10 hover:border-amber-500/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] group"
                  >
                    <img 
                      src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
                      alt="MetaMask Logo" 
                      className="w-10 h-10 group-hover:scale-110 transition-transform"
                    />
                    <span className="font-display font-extrabold text-xs text-white uppercase tracking-wider">MetaMask Wallet</span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {hasMetaMask() ? "Detected Web3" : "Browser Extension"}
                    </span>
                  </button>

                  {/* OKX Connection Button */}
                  <button
                    id="btn-connect-okx"
                    onClick={() => {
                      onConnect('okx');
                      audio?.playYardExit();
                    }}
                    disabled={walletState.status === 'connecting'}
                    className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-white/10 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] group"
                  >
                    {/* High contrast OKX minimalist graphic */}
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-black text-[10px] text-white tracking-tighter border border-white/20 group-hover:scale-110 transition-transform font-sans">
                      OKX
                    </div>
                    <span className="font-display font-extrabold text-xs text-white uppercase tracking-wider">OKX Wallet</span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {hasOKXWallet() ? "Detected OKX" : "Extension Portal"}
                    </span>
                  </button>

                  {/* Simulated Connection Button */}
                  <button
                    id="btn-connect-sandbox"
                    onClick={() => {
                      onConnect('simulated');
                      audio?.playYardExit();
                    }}
                    disabled={walletState.status === 'connecting'}
                    className="p-4 rounded-2xl bg-gradient-to-b from-[#102a5c]/30 via-slate-950 to-[#102a5c]/20 border border-indigo-400/20 hover:border-indigo-400/80 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] group relative"
                  >
                    <div className="absolute top-2 right-2 bg-indigo-500/25 border border-indigo-400/30 rounded-full px-2 py-0.5 text-[8px] font-mono font-semibold text-indigo-300">
                      SANDBOX
                    </div>
                    <Database className="w-10 h-10 text-indigo-400 group-hover:rotate-6 transition-transform" />
                    <span className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Simulated Faucet</span>
                    <span className="text-[9px] font-mono text-indigo-300">Interactive Preview</span>
                  </button>
                </div>

                {walletState.status === 'connecting' && (
                  <div className="text-center py-2 text-xs font-mono text-amber-400 animate-pulse flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Connection handshaking logic initializing...
                  </div>
                )}

                {walletState.errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2 font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{walletState.errorMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Connected details */
              <div className="space-y-5">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 uppercase">Provider:</span>
                      <span className="text-xs font-mono font-black text-amber-400 uppercase bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-pulse" /> {walletState.walletType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs font-mono text-slate-400">Account:</span>
                      <div className="flex items-center gap-1 bg-black/40 border border-white/5 px-2.5 py-1 rounded-xl">
                        <span className="text-xs font-mono text-white font-extrabold">
                          {walletState.address}
                        </span>
                        <button
                          id="btn-copy-address"
                          onClick={() => walletState.address && handleCopyAddress(walletState.address)}
                          className="text-slate-400 hover:text-white cursor-pointer ml-1"
                          title="Copy full hex address"
                        >
                          {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Network verification indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-indigo-400" />
                      <div>
                        <span className="text-xs text-slate-350 block font-sans">Blockchain Network:</span>
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
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 block font-mono">AVAILABLE RITUAL TOKENS:</span>
                        <span className="text-base text-white font-mono font-black">
                          {walletState.balance} <span className="text-amber-400">RITUAL</span>
                        </span>
                      </div>
                    </div>

                    {walletState.walletType === 'simulated' && onFaucetClaim && (
                      <button
                        id="btn-claim-sandbox-ritual"
                        onClick={() => {
                          onFaucetClaim();
                          audio?.playMove();
                        }}
                        className="px-3 py-1 text-[10px] bg-indigo-500/20 border border-indigo-400/30 hover:bg-indigo-500/35 text-indigo-300 font-mono font-black rounded-lg cursor-pointer transition-all"
                        title="Add +1000 simulated RITUAL tokens to test transaction gas fees"
                      >
                        Claim +1000 Faucet
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    id="btn-disconnect-wallet"
                    onClick={() => {
                      onDisconnect();
                      audio?.playMove();
                    }}
                    className="w-full py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-450 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                  >
                    Disconnect Account
                  </button>
                </div>
              </div>
            )}

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

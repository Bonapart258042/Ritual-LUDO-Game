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
import { LUDO_REGISTRAR_BYTECODE } from '../utils/contractData';
import { useEffect } from 'react';

interface Web3WalletHubProps {
  walletState: Web3WalletState;
  onConnect: (type: WalletType) => Promise<void>;
  onDisconnect: () => void;
  onSwitchNetwork: () => Promise<void>;
  onFaucetClaim?: () => void;
  ludoContractAddress: string;
  onUpdateLudoContract: (address: string) => void;
}

export default function Web3WalletHub({ 
  walletState, 
  onConnect, 
  onDisconnect, 
  onSwitchNetwork,
  onFaucetClaim,
  ludoContractAddress,
  onUpdateLudoContract
}: Web3WalletHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedContract, setCopiedContract] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeTab, setActiveTab] = useState<'contracts' | 'history'>('contracts');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [hasBytecode, setHasBytecode] = useState<boolean | null>(null);
  const [bytecodeLoading, setBytecodeLoading] = useState(false);
  const [inputAddress, setInputAddress] = useState(ludoContractAddress);

  useEffect(() => {
    setInputAddress(ludoContractAddress);
  }, [ludoContractAddress]);

  useEffect(() => {
    let active = true;
    const verifyContractBytecode = async () => {
      if (!ludoContractAddress || walletState.status !== 'connected') {
        setHasBytecode(null);
        return;
      }
      const anyWindow = window as any;
      const provider = anyWindow?.ethereum;
      if (!provider) {
        setHasBytecode(false);
        return;
      }
      setBytecodeLoading(true);
      try {
        const code = await provider.request({
          method: 'eth_getCode',
          params: [ludoContractAddress, 'latest']
        });
        if (active) {
          const hasCode = code && code !== '0x' && code !== '0x0' && code !== '0x00';
          setHasBytecode(hasCode);
        }
      } catch (e) {
        console.error("Error verifying bytecode:", e);
        if (active) setHasBytecode(false);
      } finally {
        if (active) setBytecodeLoading(false);
      }
    };

    verifyContractBytecode();
    return () => {
      active = false;
    };
  }, [ludoContractAddress, walletState.status, walletState.chainId]);

  const deployRegistrarContract = async () => {
    const anyWindow = window as any;
    const provider = anyWindow?.ethereum;
    if (!provider) {
      setDeployError("MetaMask is not available to sign contract deployment.");
      return;
    }
    
    setIsDeploying(true);
    setDeployError(null);
    try {
      if (walletState.chainId !== RITUAL_CHAIN_ID) {
        throw new Error("Must switch MetaMask to Ritual Testnet to deploy.");
      }
      
      const txParams: any = {
        from: walletState.address,
        data: LUDO_REGISTRAR_BYTECODE,
        gasPrice: '0x3B9ACA00', // Default 1.0 Gwei in hex
      };
      
      // Attempt to query current gas price
      try {
        const gasPriceHex = await provider.request({ method: 'eth_gasPrice' });
        if (gasPriceHex) {
          txParams.gasPrice = gasPriceHex;
        }
      } catch (e) {
        console.warn("Could not query gas price, using 1 gwei fallback", e);
      }
      
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      
      audio?.playMove();
      
      // Wait for mining to find Receipt (polling up to 15 times, 2s interval)
      let deployedAddress: string | null = null;
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const receipt = await provider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash]
          });
          if (receipt && receipt.contractAddress) {
            deployedAddress = receipt.contractAddress;
            break;
          }
        } catch (e) {
          console.warn("Error getting transaction receipt:", e);
        }
      }
      
      if (deployedAddress) {
        onUpdateLudoContract(deployedAddress);
        audio?.playYardExit();
      } else {
        throw new Error(`Deployment broadcast success (Tx Hash: ${txHash.substring(0, 10)}...) but contractAddress took too long to resolve. Please query receipt on-chain and paste below!`);
      }
    } catch (err: any) {
      console.error("Failed to deploy registrar:", err);
      setDeployError(err?.message || JSON.stringify(err));
    } finally {
      setIsDeploying(false);
    }
  };

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
                <div className="space-y-4 font-sans animate-fade-in text-left">
                  {/* Active Ludo Victory Registrar Dashboard */}
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        👑 LUDO VICTORY REGISTRAR CONFIGURATION
                      </span>
                      <span className="text-[9px] font-mono non-italic uppercase tracking-widest bg-amber-500/15 border border-amber-500/35 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                        V1.0.0
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
                      To run a real, verified on-chain victory recording, MetaMask must broadcast transactions to a deployed Ludo smart contract implementing the <code className="text-amber-400 font-mono text-[10px]">registerLudoVictory(...)</code> function. Direct EOA transfers or sending calldata to system proxies are not valid contract execution paths.
                    </p>

                    {/* Verification Badges */}
                    <div className="text-[10.5px] font-mono leading-relaxed p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-slate-450 text-[9px] uppercase font-bold">
                        <span>On-Chain Status Verification</span>
                        {bytecodeLoading && <span className="animate-pulse text-indigo-400">Verifying...</span>}
                      </div>

                      {!ludoContractAddress ? (
                        <div className="text-amber-300 flex items-start gap-1">
                          <span className="shrink-0 text-amber-400 block">⚠️</span>
                          <span><strong>Address Empty:</strong> Transactions will fallback to offline/mock simulators. Paste an address or deploy a fresh instance in 1-click below to activate.</span>
                        </div>
                      ) : ludoContractAddress.toLowerCase() === '0x532f0df0896f353d8c3dd8cc134e8129da2a3948' ? (
                        <div className="text-rose-300 flex items-start gap-1">
                          <span className="shrink-0 text-rose-400 block">❌</span>
                          <span><strong>System/Proxy Address:</strong> The chosen address is a system proxy that does not support ludo victory logs. Transactions will revert. Please deploy a custom contract instance.</span>
                        </div>
                      ) : hasBytecode === true ? (
                        <div className="text-emerald-300 flex items-start gap-1">
                          <span className="shrink-0 text-emerald-400 block">✓</span>
                          <span><strong>Active Smart Contract:</strong> Verified EVM contract detected on Ritual Testnet! MetaMask will execute direct calls successfully.</span>
                        </div>
                      ) : hasBytecode === false ? (
                        <div className="text-amber-300 flex items-start gap-1">
                          <span className="shrink-0 text-amber-400 block">⚠️</span>
                          <span><strong>Code Verification Failed (EOA detected):</strong> eth_getCode returned empty code. This address is a standard EOA account, not a smart contract. Calldata calls will fail in MetaMask. Please deploy a registrar contract.</span>
                        </div>
                      ) : (
                        <div className="text-indigo-300">
                          Loading bytecode verification state...
                        </div>
                      )}
                    </div>

                    {/* Contract Address Input Configuration */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Active Contract Address:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputAddress}
                          onChange={(e) => {
                            setInputAddress(e.target.value);
                            setHasBytecode(null);
                          }}
                          placeholder="0x... (EVM contract address)"
                          className="w-full bg-black/40 border border-indigo-500/30 rounded-xl px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateLudoContract(inputAddress);
                            audio?.playMove();
                          }}
                          className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-mono font-black text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center shrink-0"
                        >
                          Save Address
                        </button>
                      </div>
                    </div>

                    {/* Deployer action */}
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-sans">Deploy instance to your current account in 1-click:</span>
                        <span className="text-[10px] font-mono text-slate-500">Gas: ~100k</span>
                      </div>

                      <button
                        type="button"
                        onClick={deployRegistrarContract}
                        disabled={isDeploying}
                        className={`w-full py-2.5 rounded-xl font-mono font-bold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                          isDeploying
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold animate-pulse'
                            : 'bg-gradient-to-r from-amber-500 to-[#cc6600] hover:brightness-110 border border-amber-600/30 text-slate-950 font-extrabold'
                        }`}
                      >
                        <RefreshCw className={`w-4 h-4 ${isDeploying ? 'animate-spin' : ''}`} />
                        {isDeploying ? 'Deploying and verifying on-chain... Please wait' : '🚀 Deploy Ludo Victory Registrar Contract'}
                      </button>

                      {deployError && (
                        <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10.5px] font-sans text-rose-300 leading-relaxed max-h-[100px] overflow-y-auto select-text">
                          ☠️ <strong>Deployment failed:</strong> {deployError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ritual Testnet System Contracts */}
                  <div className="flex items-center gap-2 border-b border-indigo-500/10 pb-1.5 pt-2">
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

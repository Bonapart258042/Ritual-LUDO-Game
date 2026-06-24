/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, PlayerColor } from '../types';
import { motion } from 'motion/react';
import { 
  Crown, HelpCircle, Users, Play, ShieldAlert, Sparkles, X, Swords, Trophy, 
  Share2, Copy, Check, Link2, Plus, Users2, Bot, Gamepad2, ScrollText,
  Network, Coins, AlertCircle, Database, RefreshCw, Search, ChevronLeft, 
  ChevronRight, TrendingUp, Award, History, Trash2, ExternalLink, Cpu, 
  Terminal, Compass, Wallet, Key
} from 'lucide-react';
import { PREDEFINED_EMOJIS, generateProceduralAvatar } from '../utils/avatar';
import { audio } from '../utils/audio';
import { 
  Web3WalletState, 
  WalletType, 
  RITUAL_CHAIN_ID, 
  RITUAL_EXPLORER,
  getRitualTransactions,
  RitualTransaction
} from '../utils/web3';

interface WelcomeScreenProps {
  onStartGame: (players: Player[], theme: 'royal' | 'cosmic') => void;
  web3Wallet: Web3WalletState;
  connectWeb3Wallet: (type: WalletType) => Promise<void>;
  disconnectWeb3Wallet: () => void;
  switchRitualNetwork: () => Promise<void>;
  claimFaucetRitual: () => void;
  ludoContractAddress: string;
  updateLudoContractAddress: (address: string) => void;
  deployContractInGame: () => Promise<void>;
  isDeployingContract: boolean;
  deployContractError: string | null;
  onOpenVictoryRecords: () => void;
}

export default function WelcomeScreen({ 
  onStartGame,
  web3Wallet,
  connectWeb3Wallet,
  disconnectWeb3Wallet,
  switchRitualNetwork,
  claimFaucetRitual,
  ludoContractAddress,
  updateLudoContractAddress,
  deployContractInGame,
  isDeployingContract,
  deployContractError,
  onOpenVictoryRecords
}: WelcomeScreenProps) {
  const [theme, setTheme] = useState<'royal' | 'cosmic'>('royal');
  const [activeMainTab, setActiveMainTab] = useState<'ludo' | 'ritual'>('ludo');
  
  // Set default configurations for players (Red customized to Ashish PRO)
  const [playerConfigs, setPlayerConfigs] = useState<Record<PlayerColor, { name: string; isComputer: boolean; isActive: boolean; avatar: string }>>({
    red:    { name: 'Ashish (PRO)', isComputer: false, isActive: true, avatar: '👑' },
    green:  { name: 'Green Warrior', isComputer: false, isActive: true, avatar: '⚔️' },
    yellow: { name: 'Yellow Scholar', isComputer: true, isActive: true, avatar: '🦉' },
    blue:   { name: 'Blue Wizard', isComputer: true, isActive: true, avatar: '🧙‍♂️' }
  });

  const [activePreset, setActivePreset] = useState<'single' | 'local2' | 'local3' | 'local4' | 'custom'>('custom');

  const applyPreset = (preset: 'single' | 'local2' | 'local3' | 'local4') => {
    setActivePreset(preset);
    if (preset === 'single') {
      setPlayerConfigs({
        red:    { name: 'Ashish (PRO)', isComputer: false, isActive: true, avatar: '👑' },
        green:  { name: 'Bot Viru', isComputer: true, isActive: true, avatar: '🤖' },
        yellow: { name: 'Bot Gabbar', isComputer: true, isActive: true, avatar: '👾' },
        blue:   { name: 'Bot Thakur', isComputer: true, isActive: true, avatar: '👽' }
      });
    } else if (preset === 'local2') {
      setPlayerConfigs({
        red:    { name: 'Player 1', isComputer: false, isActive: true, avatar: '👑' },
        green:  { name: 'Player 2', isComputer: false, isActive: true, avatar: '⚔️' },
        yellow: { name: 'Yellow Scholar', isComputer: true, isActive: false, avatar: '🦉' },
        blue:   { name: 'Blue Wizard', isComputer: true, isActive: false, avatar: '🧙‍♂️' }
      });
    } else if (preset === 'local3') {
      setPlayerConfigs({
        red:    { name: 'Player 1', isComputer: false, isActive: true, avatar: '👑' },
        green:  { name: 'Player 2', isComputer: false, isActive: true, avatar: '⚔️' },
        yellow: { name: 'Player 3', isComputer: false, isActive: true, avatar: '🦉' },
        blue:   { name: 'Blue Wizard', isComputer: true, isActive: false, avatar: '🧙‍♂️' }
      });
    } else if (preset === 'local4') {
      setPlayerConfigs({
        red:    { name: 'Player 1', isComputer: false, isActive: true, avatar: '👑' },
        green:  { name: 'Player 2', isComputer: false, isActive: true, avatar: '⚔️' },
        yellow: { name: 'Player 3', isComputer: false, isActive: true, avatar: '🦉' },
        blue:   { name: 'Player 4', isComputer: false, isActive: true, avatar: '🧙‍♂️' }
      });
    }
    audio?.playYardExit();
  };

  const [editingAvatarColor, setEditingAvatarColor] = useState<PlayerColor | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // --- MULTIPLAYER ROOM & INVITATION STATES ---
  const [roomCode, setRoomCode] = useState<string>(() => {
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `LUDO-${rand}-ASHISH`;
  });
  const [inviteInput, setInviteInput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionMessage, setConnectionMessage] = useState<string>('');

  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    : `https://ai.studio/build?room=${roomCode}`;

  const handleCopyInvite = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`Hey! Join my Pachisi Ludo Arena match! Room Code: ${roomCode}. Link: ${inviteUrl}`);
      setIsCopied(true);
      audio?.playMove();
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleJoinCode = () => {
    if (!inviteInput.trim()) return;
    setIsConnecting(true);
    setConnectionMessage('Handshaking with room channel...');
    audio?.playMove();
    
    setTimeout(() => {
      setConnectionMessage('Synchronizing court seats...');
      setTimeout(() => {
        setIsConnecting(false);
        setConnectionMessage(`Successfully entered Lobby #${inviteInput.trim()}! Grid sync complete.`);
        audio?.playYardExit();
        
        // Populate custom Multiplayer Names for remote seats
        setPlayerConfigs(prev => ({
          ...prev,
          red: { name: 'Ashish (PRO)', isComputer: false, isActive: true, avatar: '👑' },
          green: { name: 'Player Elite', isComputer: false, isActive: true, avatar: '🥷' },
          yellow: { name: 'Host Champion', isComputer: false, isActive: true, avatar: '🧙‍♂️' },
          blue: { name: 'Rival Star', isComputer: false, isActive: true, avatar: '🚀' }
        }));

        setSimLogs(prev => [
          `Joined multiplayer lobby #${inviteInput.trim()}!`,
          'All player slots connected!',
          ...prev
        ]);
      }, 1000);
    }, 1200);
  };

  const handleSimulateOnlineFriends = () => {
    const names = ['Rohit Racer', 'Pooja Star', 'Ankit King', 'Vikram Sledge', 'Sneha Ludo', 'Kabir Boss'];
    const emojis = ['🥷', '💅', '🎮', '🐼', '🦊', '🦁'];
    
    const randomName1 = names[Math.floor(Math.random() * names.length)];
    const randomEmoji1 = emojis[Math.floor(Math.random() * emojis.length)];
    
    const remainingNames = names.filter(n => n !== randomName1);
    const randomName2 = remainingNames[Math.floor(Math.random() * remainingNames.length)];
    const randomEmoji2 = emojis.filter(e => e !== randomEmoji1)[Math.floor(Math.random() * emojis.length)];

    setPlayerConfigs(prev => ({
      ...prev,
      green: { name: randomName1, isComputer: false, isActive: true, avatar: randomEmoji1 },
      yellow: { name: randomName2, isComputer: false, isActive: true, avatar: randomEmoji2 },
      blue: { name: 'Blue Wizard', isComputer: false, isActive: true, avatar: '🧙‍♂️' } // Make Blue Wizard a human to play on same device!
    }));

    audio?.playYardExit();
    setSimLogs(prev => [
      `Invited friend ${randomName1} joined seat Green!`,
      `Invited friend ${randomName2} joined seat Yellow!`,
      `Invited local player "Blue Wizard" initialized manual mode!`,
      ...prev
    ]);
  };

  // --- LUDO KING SIMULATION ENGINE STATES ---
  const [simDiceValue, setSimDiceValue] = useState<number>(6);
  const [simActivePlayer, setSimActivePlayer] = useState<number>(0); // 0: Red, 1: Green, 2: Yellow, 3: Blue
  const [isSimDiceRolling, setIsSimDiceRolling] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([
    'Match started!',
    'Ashish (PRO) entered Lobby #54228',
    'Waiting for hosts...'
  ]);
  const [simTokens, setSimTokens] = useState<Array<{ color: PlayerColor; cellIndex: number }>>([
    { color: 'red', cellIndex: 8 },
    { color: 'green', cellIndex: 21 },
    { color: 'yellow', cellIndex: 34 },
    { color: 'blue', cellIndex: 47 },
  ]);

  // Simulation step timer to run match automatically
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsSimDiceRolling(true);

      setTimeout(() => {
        const rolled = Math.floor(Math.random() * 6) + 1;
        setSimDiceValue(rolled);
        setIsSimDiceRolling(false);

        const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
        const names = [playerConfigs.red.name, playerConfigs.green.name, playerConfigs.yellow.name, playerConfigs.blue.name];
        
        const activeColor = colors[simActivePlayer];
        const activeName = names[simActivePlayer];

        setSimTokens((prev) =>
          prev.map((t) => {
            if (t.color === activeColor) {
              const nextIndex = (t.cellIndex + rolled) % 52;
              return { ...t, cellIndex: nextIndex };
            }
            return t;
          })
        );

        // Populate beautiful game action logs
        const movesLog = [
          `${activeName} rolled a mighty ${rolled}!`,
          `${activeName} advanced piece on circle track.`,
          `${activeName} reached secure star zone!`,
          `${activeName} avoids danger!`,
          `${activeName} is on streak to Home path!`
        ];
        const randomLog = movesLog[Math.floor(Math.random() * movesLog.length)];
        setSimLogs((prev) => [randomLog, ...prev.slice(0, 4)]);

        // Move to next active player
        setSimActivePlayer((prev) => (prev + 1) % 4);
      }, 700);
    }, 3200);

    return () => clearInterval(intervalId);
  }, [simActivePlayer, playerConfigs]);

  // Map arbitrary 0-51 circular track index to miniature SVG coordinates
  const getSimTokenCoords = (cellIndex: number) => {
    const angle = (cellIndex / 52) * 2 * Math.PI;
    const radius = 62; // orbit radius on mini board
    const centerX = 90;
    const centerY = 90;
    return {
      cx: centerX + Math.cos(angle) * radius,
      cy: centerY + Math.sin(angle) * radius,
    };
  };

  const renderMiniDiceDots = (val: number) => {
    const strokeProps = { fill: '#1e293b' };
    const dotPaths: Record<number, React.ReactNode[]> = {
      1: [<circle key="1c" cx="90" cy="90" r="3" {...strokeProps} />],
      2: [
        <circle key="2tl" cx="84" cy="84" r="2.5" {...strokeProps} />,
        <circle key="2br" cx="96" cy="96" r="2.5" {...strokeProps} />
      ],
      3: [
        <circle key="3tl" cx="84" cy="84" r="2.5" {...strokeProps} />,
        <circle key="3c" cx="90" cy="90" r="2.5" {...strokeProps} />,
        <circle key="3br" cx="96" cy="96" r="2.5" {...strokeProps} />
      ],
      4: [
        <circle key="4tl" cx="84" cy="84" r="2.5" {...strokeProps} />,
        <circle key="4tr" cx="96" cy="84" r="2.5" {...strokeProps} />,
        <circle key="4bl" cx="84" cy="96" r="2.5" {...strokeProps} />,
        <circle key="4br" cx="96" cy="96" r="2.5" {...strokeProps} />
      ],
      5: [
        <circle key="5tl" cx="84" cy="84" r="2.5" {...strokeProps} />,
        <circle key="5tr" cx="96" cy="84" r="2.5" {...strokeProps} />,
        <circle key="5c" cx="90" cy="90" r="2.5" {...strokeProps} />,
        <circle key="5bl" cx="84" cy="96" r="2.5" {...strokeProps} />,
        <circle key="5br" cx="96" cy="96" r="2.5" {...strokeProps} />
      ],
      6: [
        <circle key="6tl" cx="84" cy="83" r="2.2" {...strokeProps} />,
        <circle key="6tr" cx="96" cy="83" r="2.2" {...strokeProps} />,
        <circle key="6ml" cx="84" cy="90" r="2.2" {...strokeProps} />,
        <circle key="6mr" cx="96" cy="90" r="2.2" {...strokeProps} />,
        <circle key="6bl" cx="84" cy="97" r="2.2" {...strokeProps} />,
        <circle key="6br" cx="96" cy="97" r="2.2" {...strokeProps} />
      ]
    };
    return dotPaths[val] || dotPaths[1];
  };

  const togglePlayerActive = (color: PlayerColor) => {
    // Ensure we have at least 2 players active
    const activeCount = Object.values(playerConfigs).filter((p: any) => p.isActive).length;
    if (activeCount <= 2 && playerConfigs[color].isActive) {
      return; // Cannot deactivate further
    }
    setActivePreset('custom');
    setPlayerConfigs(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        isActive: !prev[color].isActive
      }
    }));
  };

  const handleConfigChange = (color: PlayerColor, field: 'name' | 'isComputer', value: string | boolean) => {
    setActivePreset('custom');
    setPlayerConfigs(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        [field]: value
      }
    }));
  };

  const handleStart = () => {
    const players: Player[] = (['green', 'yellow', 'blue', 'red'] as PlayerColor[]).map(color => {
      const config = playerConfigs[color];
      return {
        id: color,
        color,
        name: config.isActive ? config.name : '',
        isComputer: config.isComputer,
        isActive: config.isActive,
        hasFinished: false,
        avatar: config.avatar
      };
    });
    onStartGame(players, theme);
  };

  return (
    <div className="relative w-full rounded-[36px] overflow-hidden bg-gradient-to-b from-[#102a5c] via-[#091b3d] to-[#040b1a] border border-white/20 p-4 md:p-6 shadow-2xl">
      {/* Decorative Ludo King Background Lattice Pattern */}
      <div className="absolute inset-0 opacity-[0.09] pointer-events-none mix-blend-screen z-0 overflow-hidden">
        <svg className="w-full h-full text-white" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ludopattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="40" cy="40" r="4.5" fill="currentColor" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              <circle cx="70" cy="10" r="1.5" fill="currentColor" />
              <circle cx="10" cy="70" r="1.5" fill="currentColor" />
              <circle cx="70" cy="70" r="1.5" fill="currentColor" />
              <path d="M0 0 L80 80 M80 0 L0 80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ludopattern)" />
        </svg>
      </div>

      {/* Atmospheric neon game room shadows */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-64 h-64 bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto py-4 px-2 md:px-6 relative z-10">
        {/* Visual Title Header (Recreating the exact Ludo King Logo Style) */}
        <div className="text-center mb-10 relative">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 text-amber-300 rounded-full text-[10px] font-mono tracking-widest uppercase mb-4 shadow"
          >
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> TOURNAMENT GRADE MULTIPLAYER
          </motion.div>

          {/* 3D Modern LUDO KING Logo */}
          <div className="flex items-center justify-center gap-2 md:gap-4 relative select-none mb-4">
            {/* Letter L with floating Sparkly Crown */}
            <div className="relative">
              <svg className="w-12 h-12 md:w-16 md:h-16 absolute -top-9 -left-4 md:-top-12 md:-left-6 -rotate-12 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] animate-bounce" style={{ animationDuration: '4s' }} viewBox="0 0 100 100">
                <path d="M15,75 L85,75 L95,35 L70,52 L50,20 L30,52 L5,35 Z" fill="url(#logoGoldGrad)" stroke="#78350f" strokeWidth="3" />
                <circle cx="50" cy="20" r="5" fill="#ef4444" className="animate-pulse" />
                <circle cx="5" cy="35" r="4.5" fill="#3b82f6" />
                <circle cx="95" cy="35" r="4.5" fill="#3b82f6" />
                <circle cx="30" cy="52" r="4" fill="#10b981" />
                <circle cx="70" cy="52" r="4" fill="#10b981" />
                <rect x="25" y="68" width="50" height="7" rx="3" fill="#b45309" />
                <defs>
                  <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffe066" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="w-12 h-12 md:w-18 md:h-18 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 border-[3px] md:border-[4px] border-white shadow-[0_5px_8px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center font-display font-black text-xl md:text-3xl text-white transform hover:scale-105 transition-all">
                L
              </div>
            </div>

            {/* Letter U */}
            <div className="w-12 h-12 md:w-18 md:h-18 rounded-full bg-gradient-to-b from-rose-400 to-red-600 border-[3px] md:border-[4px] border-white shadow-[0_5px_8px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center font-display font-black text-xl md:text-3xl text-white transform hover:scale-105 transition-all">
              U
            </div>

            {/* Letter D */}
            <div className="w-12 h-12 md:w-18 md:h-18 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600 border-[3px] md:border-[4px] border-white shadow-[0_5px_8px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center font-display font-black text-xl md:text-3xl text-white transform hover:scale-105 transition-all">
              D
            </div>

            {/* Letter O restored to its clean circular state */}
            <div className="w-12 h-12 md:w-18 md:h-18 rounded-full bg-gradient-to-b from-emerald-400 to-teal-600 border-[3px] md:border-[4px] border-white shadow-[0_5px_8px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.7)] flex items-center justify-center font-display font-black text-xl md:text-3xl text-white transform hover:scale-105 transition-all">
              O
            </div>

            {/* KING Gold Text Typography */}
            <div className="ml-1 md:ml-2">
              <div className="tracking-tight leading-none text-left select-none">
                <span className="text-[8px] md:text-[9px] font-mono block text-amber-300 font-extrabold uppercase tracking-[0.25em] drop-shadow-sm">OFFICIAL MATCH</span>
                <span className="text-2xl md:text-4xl font-black italic uppercase tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] leading-none filter">
                  KING
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-300 font-sans max-w-sm mx-auto leading-relaxed">
            Experience the #1 classic multiplayer casual race game. Assemble your squad to rule the kingdom!
          </p>
        </div>

      {/* Main Tab Selector (Ludo Arena vs Ritual Developer Web3 Terminal) */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 flex gap-2 backdrop-blur-md">
          <button
            onClick={() => {
              setActiveMainTab('ludo');
              audio?.playMove();
            }}
            className={`px-5 py-2.5 rounded-xl font-display font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'ludo'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Ludo Lounge
          </button>
          <button
            onClick={() => {
              setActiveMainTab('ritual');
              audio?.playMove();
            }}
            className={`px-5 py-2.5 rounded-xl font-display font-black text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'ritual'
                ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-bold shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-4 h-4 animate-pulse" />
            Ritual Web3 Terminal
          </button>
        </div>
      </div>

      {activeMainTab === 'ludo' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Play Setup Column (8 cols) */}
        <div id="play-setup-card" className="md:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-glass p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Assemble the Court
            </h2>
            <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl text-xs font-mono">
              <button
                id="theme-select-royal"
                onClick={() => setTheme('royal')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${theme === 'royal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium' : 'text-slate-400 hover:bg-white/5'}`}
              >
                Royal Gold
              </button>
              <button
                id="theme-select-cosmic"
                onClick={() => setTheme('cosmic')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${theme === 'cosmic' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium' : 'text-slate-400 hover:bg-white/5'}`}
              >
                Cosmic Neon
              </button>
            </div>
          </div>

          {/* Quick Play Presets */}
          <div className="space-y-3 bg-white/5 p-4 md:p-5 rounded-2xl border border-white/10 shadow-inner">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                ⚡ Choose Battle Mode
              </span>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-400/20">
                Preset Setup
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                id="preset-single"
                onClick={() => applyPreset('single')}
                className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                  activePreset === 'single'
                    ? 'bg-[#ffe066]/10 border-amber-400 text-white shadow-lg ring-1 ring-amber-450/30'
                    : 'bg-slate-950/40 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bot className={`w-4 h-4 ${activePreset === 'single' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="font-display font-black text-xs md:text-sm tracking-wide">Single Player</span>
                </div>
                <span className="text-[10px] leading-tight text-slate-400">Red Player vs 3 Bots</span>
              </button>

              <button
                id="preset-local-2"
                onClick={() => applyPreset('local2')}
                className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                  activePreset === 'local2'
                    ? 'bg-[#ffe066]/10 border-amber-400 text-white shadow-lg ring-1 ring-amber-450/30'
                    : 'bg-slate-950/40 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users2 className={`w-4 h-4 ${activePreset === 'local2' ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="font-display font-black text-xs md:text-sm tracking-wide">Local 1v1</span>
                </div>
                <span className="text-[10px] leading-tight text-slate-400">2 Players on same screen</span>
              </button>

              <button
                id="preset-local-3"
                onClick={() => applyPreset('local3')}
                className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                  activePreset === 'local3'
                    ? 'bg-[#ffe066]/10 border-amber-400 text-white shadow-lg ring-1 ring-amber-450/30'
                    : 'bg-slate-950/40 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${activePreset === 'local3' ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className="font-display font-black text-xs md:text-sm tracking-wide">3 Players Solo</span>
                </div>
                <span className="text-[10px] leading-tight text-slate-400">3 Players on same screen</span>
              </button>

              <button
                id="preset-local-4"
                onClick={() => applyPreset('local4')}
                className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                  activePreset === 'local4'
                    ? 'bg-[#ffe066]/10 border-amber-400 text-white shadow-lg ring-1 ring-amber-450/30'
                    : 'bg-slate-950/40 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Swords className={`w-4 h-4 ${activePreset === 'local4' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="font-display font-black text-xs md:text-sm tracking-wide">4 Players War</span>
                </div>
                <span className="text-[10px] leading-tight text-slate-400">All 4 seats human-controlled</span>
              </button>
            </div>
          </div>

          <div id="manually-arrange-header" className="pt-2 flex items-center justify-between border-t border-white/5">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              🛠️ Customize Seats & Controller Mode
            </span>
            {activePreset === 'custom' ? (
              <span className="text-[9px] font-mono font-black tracking-tighter text-amber-500 uppercase animate-pulse">
                Custom Setup Active
              </span>
            ) : (
              <span className="text-[9px] font-mono text-slate-500 uppercase">
                Tweaking Preset
              </span>
            )}
          </div>

          {/* Color Config List */}
          <div className="divide-y divide-white/10">
            {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
              const cfg = playerConfigs[color];
              const colorText = color.toUpperCase();
              
              // Map theme colors
              const badgeColors = {
                red: 'bg-rose-500 text-white shadow-glow-red',
                green: 'bg-emerald-500 text-white shadow-glow-green',
                yellow: 'bg-amber-400 text-slate-950 shadow-glow-yellow',
                blue: 'bg-sky-500 text-white shadow-glow-blue'
              };

              return (
                <div key={color} className={`py-4 transition-all ${cfg.isActive ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Active Status Toggle */}
                      <button
                        id={`toggle-player-active-${color}`}
                        onClick={() => togglePlayerActive(color)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                          cfg.isActive 
                            ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold' 
                            : 'border-white/20 hover:border-white/40 bg-white/5 text-white'
                        }`}
                      >
                        {cfg.isActive && '✓'}
                      </button>

                      {/* Interactive Avatar button or color badge */}
                      {cfg.isActive ? (
                        <button
                          id={`btn-open-avatar-${color}`}
                          onClick={() => setEditingAvatarColor(color)}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden relative group cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md shrink-0"
                          style={{
                            background: color === 'red' ? 'rgba(239, 68, 68, 0.15)' :
                                        color === 'green' ? 'rgba(12, 192, 120, 0.15)' :
                                        color === 'yellow' ? 'rgba(245, 158, 11, 0.15)' :
                                        'rgba(14, 165, 233, 0.15)'
                          }}
                          title="Click to customize identity"
                        >
                          {cfg.avatar.startsWith('data:image') ? (
                            <img src={cfg.avatar} alt="portrait" className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-lg select-none leading-none">{cfg.avatar}</span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] font-bold text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity uppercase text-white tracking-tighter">
                            Edit
                          </div>
                        </button>
                      ) : (
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-display font-black text-xs ${badgeColors[color]} opacity-50`}>
                          {colorText.charAt(0)}
                        </div>
                      )}

                      {/* Name editor if active */}
                      {cfg.isActive ? (
                        <div className="flex-1 min-w-[120px]">
                          <input
                            id={`input-player-name-${color}`}
                            type="text"
                            maxLength={14}
                            value={cfg.name}
                            onChange={(e) => handleConfigChange(color, 'name', e.target.value)}
                            className="bg-transparent border-b border-dashed border-white/20 hover:border-white/40 focus:border-amber-400 focus:outline-none py-0.5 text-sm text-slate-100 font-display font-extrabold tracking-wide w-full transition-colors"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-mono text-slate-500">Inactive Seat</span>
                      )}
                    </div>

                    {/* Controller Mode: Human or Machine (Computer) */}
                    {cfg.isActive && (
                      <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-xl self-end sm:self-auto">
                        <button
                          id={`btn-mode-human-${color}`}
                          onClick={() => handleConfigChange(color, 'isComputer', false)}
                          className={`px-3 py-1 text-xs rounded-lg transition-all font-sans cursor-pointer ${
                            !cfg.isComputer ? 'bg-white/10 border border-white/10 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Human
                        </button>
                        <button
                          id={`btn-mode-cpu-${color}`}
                          onClick={() => handleConfigChange(color, 'isComputer', true)}
                          className={`px-3 py-1 text-xs rounded-lg transition-all font-sans cursor-pointer ${
                            cfg.isComputer ? 'bg-white/10 border border-white/10 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          CPU Bot
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action trigger */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <button
              id="btn-rules-help"
              onClick={() => setShowHowToPlay(true)}
              className="text-slate-400 hover:text-white font-semibold text-xs font-mono tracking-wider uppercase underline flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Divine Rules of Battle
            </button>
            
            <motion.button
              id="btn-start-game"
              onClick={handleStart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl cursor-pointer shadow-xl flex items-center justify-center gap-2 font-display font-bold tracking-widest text-base uppercase transition-all ${
                theme === 'royal' 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-amber-500/10 hover:brightness-110' 
                  : 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-indigo-600/10 hover:brightness-110'
              }`}
            >
              <Play className="w-4 h-4 fill-current" /> Begin the Match
            </motion.button>
          </div>
        </div>

        {/* Simulated Ludo King Live Tournament Arena (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/12 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
            
            {/* Header with live blinking dot */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-rose-500 animate-pulse" />
                <span className="text-sm font-display font-black tracking-wide uppercase italic text-white">Live Tournament Arena</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">LIVE</span>
              </div>
            </div>

            {/* Interactive Miniature Board Visualization */}
            <div className="flex justify-center items-center py-2">
              <div className="relative w-44 h-44 rounded-2xl bg-slate-950/40 p-1.5 border border-white/10 shadow-inner">
                <svg className="w-full h-full" viewBox="0 0 180 180">
                  {/* Quad 1: Red Yard (Bottom-Left) */}
                  <rect x="10" y="100" width="70" height="70" rx="8" fill="#fda4af" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1.5" />
                  <circle cx="30" cy="120" r="8" fill="#f43f5e" />
                  <circle cx="60" cy="150" r="8" fill="#f43f5e" />
                  <circle cx="30" cy="150" r="5" fill="#fda4af" />
                  <circle cx="60" cy="120" r="5" fill="#fda4af" />

                  {/* Quad 2: Green Yard (Top-Left) */}
                  <rect x="10" y="10" width="70" height="70" rx="8" fill="#a7f3d0" fillOpacity="0.25" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx="30" cy="30" r="8" fill="#10b981" />
                  <circle cx="60" cy="60" r="8" fill="#10b981" />
                  <circle cx="30" cy="60" r="5" fill="#a7f3d0" />
                  <circle cx="60" cy="30" r="5" fill="#a7f3d0" />

                  {/* Quad 3: Yellow Yard (Top-Right) */}
                  <rect x="100" y="10" width="70" height="70" rx="8" fill="#fde68a" fillOpacity="0.25" stroke="#eab308" strokeWidth="1.5" />
                  <circle cx="120" cy="30" r="8" fill="#eab308" />
                  <circle cx="150" cy="60" r="8" fill="#eab308" />
                  <circle cx="120" cy="60" r="5" fill="#fde68a" />
                  <circle cx="150" cy="30" r="5" fill="#fde68a" />

                  {/* Quad 4: Blue Yard (Bottom-Right) */}
                  <rect x="100" y="100" width="70" height="70" rx="8" fill="#bae6fd" fillOpacity="0.25" stroke="#0ea5e9" strokeWidth="1.5" />
                  <circle cx="120" cy="150" r="8" fill="#0ea5e9" />
                  <circle cx="150" cy="120" r="8" fill="#0ea5e9" />
                  <circle cx="120" cy="120" r="5" fill="#bae6fd" />
                  <circle cx="150" cy="150" r="5" fill="#bae6fd" />

                  {/* Center Triangular Home Area */}
                  <polygon points="80,80 100,80 90,90" fill="#eab308" />
                  <polygon points="100,80 100,100 90,90" fill="#0ea5e9" />
                  <polygon points="80,100 100,100 90,90" fill="#ef4444" />
                  <polygon points="80,80 80,100 90,90" fill="#10b981" />

                  {/* Outer Circular Tracks */}
                  <circle cx="90" cy="90" r="62" fill="none" stroke="white" strokeWidth="1" strokeDasharray="3,5" strokeOpacity="0.2" />

                  {/* Star Positions Decoration */}
                  <g stroke="#ffffff" strokeWidth="0.5" fill="#eab308">
                    <polygon points="90,24 92,28 97,28 93,31 95,35 90,32 85,35 87,31 83,28 88,28" />
                    <polygon points="156,90 158,94 163,94 159,97 161,101 156,98 151,101 153,97 149,94 154,94" />
                    <polygon points="90,156 92,160 97,160 93,163 95,167 90,164 85,167 87,163 83,160 88,160" />
                    <polygon points="24,90 26,94 31,94 27,97 29,101 24,98 19,101 21,97 17,94 22,94" />
                  </g>

                  {/* Interactive Simulated Rolling Dice in the center of board */}
                  <g className={`${isSimDiceRolling ? 'animate-spin' : ''}`} style={{ transformOrigin: '90px 90px' }}>
                    <rect x="76" y="76" width="28" height="28" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                    {renderMiniDiceDots(simDiceValue)}
                  </g>

                  {/* Interactive Bouncing Simulated Pawns Racing */}
                  {simTokens.map((token, i) => {
                    const coords = getSimTokenCoords(token.cellIndex);
                    const activePulse = simActivePlayer === i ? 'animate-bounce' : 'animate-pulse';
                    const fillColors = {
                      red: '#ef4444',
                      green: '#10b981',
                      yellow: '#f59e0b',
                      blue: '#0ea5e9'
                    };
                    return (
                      <g key={token.color} className={activePulse} style={{ animationDuration: simActivePlayer === i ? '0.8s' : '3s' }}>
                        {/* Colored Pawn Crown Top */}
                        <circle cx={coords.cx} cy={coords.cy - 4} r="3.5" fill={fillColors[token.color]} stroke="#ffffff" strokeWidth="1" />
                        {/* Pawn Base Cone */}
                        <path d={`M${coords.cx - 4.5},${coords.cy + 3} L${coords.cx + 4.5},${coords.cy + 3} L${coords.cx},${coords.cy - 4} Z`} fill={fillColors[token.color]} stroke="#ffffff" strokeWidth="1" />
                        {/* Shadow underneath */}
                        <ellipse cx={coords.cx} cy={coords.cy + 4.5} rx="3" ry="1" fill="#000000" fillOpacity="0.45" />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Simulated Live Tournament Console logs */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span className="uppercase tracking-wider font-bold">ARCADE FEED LOGS</span>
                <span className="text-amber-400">ROOM #54228</span>
              </div>
              <div className="space-y-1.5 h-20 overflow-y-hidden select-none font-sans">
                {simLogs.map((log, idx) => (
                  <div key={idx} className={`text-xs flex items-center gap-1.5 transition-opacity duration-300 ${idx === 0 ? 'text-amber-300 font-extrabold' : 'text-slate-300 opacity-60'}`}>
                    <span className="text-amber-500 font-mono text-[9px]">●</span>
                    <span className="leading-tight text-[11px] font-sans truncate">{log}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Multiplayer & Share Room Invitation Control */}
          <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-blue-950/80 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-display font-black tracking-wide uppercase italic text-white">Party Invitation Lobby</span>
              </div>
              <p className="text-[10px] uppercase font-mono text-slate-400 mt-1">Multiplayer Online Hub</p>
            </div>

            {/* Room Invite Code Section with copy */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest block font-extrabold text-amber-300">Invite Your Crew</label>
              <div className="flex gap-2">
                <div className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between flex-1 font-mono text-xs text-indigo-300 font-black">
                  <span>{roomCode}</span>
                </div>
                <button
                  id="btn-copy-invite"
                  onClick={handleCopyInvite}
                  className={`px-3 py-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    isCopied 
                      ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-400' 
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                  }`}
                  title="Copy shareable link"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[9px] font-sans text-slate-400 leading-snug">
                Pachisi supports full synchronous local multiplayer! Share invite link with friends to play together on custom laptops, or simulate online rivals joining your lobby below!
              </p>
            </div>

            {/* Simulated Friend Joining Trigger */}
            <button
              id="btn-simulate-friends"
              onClick={handleSimulateOnlineFriends}
              className="w-full py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-200 hover:text-white text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5 animate-pulse" /> Simulate Online Joiners
            </button>

            {/* External Lobby Connector Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-mono uppercase tracking-widest block font-semibold text-slate-400">Join Friend's Lobby Code</label>
              <div className="flex gap-2">
                <input
                  id="input-friend-lobby"
                  type="text"
                  placeholder="e.g. LUDO-47392-ASHISH"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-400 flex-1 font-mono"
                />
                <button
                  id="btn-connect-lobby"
                  onClick={handleJoinCode}
                  disabled={isConnecting}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 text-slate-950 font-display font-extrabold text-xs uppercase rounded-xl transition-all hover:brightness-115 active:scale-95 cursor-pointer shrink-0"
                >
                  {isConnecting ? 'Syncing...' : 'Connect'}
                </button>
              </div>

              {connectionMessage && (
                <div className="text-[10px] font-mono text-emerald-400 mt-1 animate-pulse bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded-lg">
                  {connectionMessage}
                </div>
              )}
            </div>

          </div>

          {/* AI Grandmasters Panel */}
          <div className="bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-[2rem] p-6 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-indigo-400 font-display font-black text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> BOT MATCHING READY
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              No real-life players? Turn on <strong className="text-indigo-300 font-bold">CPU Grandmaster bots</strong>. They adapt to high competitiveness levels with minimax defensive patterns and smart escapes!
            </p>
          </div>
        </div> {/* Closes md:col-span-4 */}
      </div>
      )}

      {activeMainTab === 'ritual' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
        >
          {/* Web3 Core Control Center (8 columns) */}
          <div className="md:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-display font-bold text-slate-100 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400 animate-pulse" /> Ritual Testnet Developer Portal
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-300 font-extrabold">
                Active Environment
              </span>
            </div>

            {/* Wallet Integration Segment */}
            <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-400" /> MetaMask Integration Status
                </h3>
                {web3Wallet.status === 'connected' ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-md font-bold uppercase">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    CONNECTED
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono rounded-md font-bold uppercase">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    DISCONNECTED
                  </span>
                )}
              </div>

              {web3Wallet.status !== 'connected' ? (
                <div className="space-y-4 py-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Connect your MetaMask wallet browser extension to unlock advanced on-chain features like real-time contract deployment, custom transaction logs, and permanent victory verification.
                  </p>
                  <button
                    onClick={() => {
                      connectWeb3Wallet('metamask');
                      audio?.playYardExit();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:brightness-110 active:scale-[0.99] text-slate-950 rounded-xl font-display font-extrabold tracking-wider text-xs uppercase cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <img 
                      src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
                      alt="MetaMask" 
                      className="w-4 h-4" 
                    />
                    Connect MetaMask Extension
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Connected Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-black/45 border border-white/5 p-3 rounded-xl space-y-1">
                      <span className="text-[9px] font-mono text-slate-450 block uppercase">YOUR METAMASK ADDRESS</span>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-white text-xs font-mono select-all truncate">
                          {web3Wallet.address}
                        </code>
                        <button
                          onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                              navigator.clipboard.writeText(web3Wallet.address || '');
                              audio?.playMove();
                            }
                          }}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                          title="Copy Address"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/45 border border-white/5 p-3 rounded-xl space-y-1">
                      <span className="text-[9px] font-mono text-slate-450 block uppercase">CURRENT BALANCE</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          {web3Wallet.balance} RITUAL
                        </span>
                        <button
                          onClick={() => {
                            claimFaucetRitual();
                            audio?.playYardExit();
                          }}
                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-white text-[9.5px] font-mono rounded font-bold uppercase transition-all cursor-pointer"
                        >
                          Claim +100 Faucet
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Network Switch Warning */}
                  {web3Wallet.chainId !== RITUAL_CHAIN_ID && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                      <div className="space-y-1.5">
                        <p className="text-xs text-amber-200 font-bold font-sans">
                          Incorrect MetaMask Network Detected
                        </p>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          MetaMask is connected, but not to the Ritual Testnet. You must be on the Ritual Chain (ID: 1979) to deploy contracts or register victories.
                        </p>
                        <button
                          onClick={() => {
                            switchRitualNetwork();
                            audio?.playMove();
                          }}
                          className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase rounded transition-all cursor-pointer"
                        >
                          Switch to Ritual Testnet (Chain ID 1979)
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        disconnectWeb3Wallet();
                        audio?.playYardExit();
                      }}
                      className="text-slate-450 hover:text-rose-400 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Contract Segment */}
            <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-display font-bold text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400 animate-pulse" /> Ludo Victory Registrar Setup
              </h3>
              
              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                The Ludo Victory Registrar is an immutable on-chain smart contract written in Solidity. When a player wins, the match statistics (moves, duration, gas cost, timestamp) are hashed and broadcasted directly to the registrar contract address below.
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                    🎯 Registrar Contract Destination
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ludoContractAddress}
                      onChange={(e) => updateLudoContractAddress(e.target.value)}
                      placeholder="0x... (paste EVM contract address)"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-indigo-400 focus:bg-black/80"
                    />
                    <button
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(ludoContractAddress);
                          audio?.playMove();
                        }
                      }}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 p-2.5 rounded-xl transition-all cursor-pointer"
                      title="Copy Address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 1-Click Deployer Panel */}
                <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-300 font-extrabold uppercase tracking-wider">
                      Solidity 1-Click Deployer
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">Gas Cost: ~180,000 gas</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-normal font-sans">
                    Need a fresh sandbox contract? Deploy an individual, fully compliant copy of the <strong>Ludo Victory Registrar</strong> directly onto the Ritual network.
                  </p>

                  <button
                    onClick={() => {
                      deployContractInGame();
                      audio?.playYardExit();
                    }}
                    disabled={isDeployingContract || web3Wallet.status !== 'connected'}
                    className={`w-full py-2.5 rounded-xl font-mono font-bold text-[11px] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      web3Wallet.status !== 'connected'
                        ? 'bg-slate-800/50 text-slate-500 border-slate-700/30 cursor-not-allowed'
                        : isDeployingContract
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:brightness-110 text-white border-indigo-500/30 shadow-md'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDeployingContract ? 'animate-spin' : ''}`} />
                    {isDeployingContract ? 'Deploying & Verifying Contract...' : '🚀 Deploy Custom Registrar (1-Click)'}
                  </button>

                  {deployContractError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-sans leading-relaxed">
                      ❌ <strong>Deployment failed:</strong> {deployContractError}
                    </div>
                  )}

                  {web3Wallet.status !== 'connected' && (
                    <p className="text-[10px] text-amber-300/80 italic text-center font-mono">
                      * Please connect MetaMask first to activate contract deployment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Web3 Right Side Panel (4 columns) */}
          <div className="md:col-span-4 space-y-6">
            {/* Quick Ledger Check Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-display font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> Onchain Ledger
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  SECURE
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-normal font-sans">
                Each official game victory on this workstation is double-written to both client state and local ledger.
              </p>

              <button
                onClick={() => {
                  onOpenVictoryRecords();
                  audio?.playYardExit();
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-500/15 border border-emerald-500/30 hover:border-emerald-400 hover:from-emerald-500/25 hover:to-emerald-500/15 text-emerald-300 rounded-xl font-mono font-bold text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-500/5"
              >
                <History className="w-4 h-4 text-emerald-400" /> Open Victory Ledger
              </button>
            </div>

            {/* Network Node Information Card */}
            <div className="bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-display font-black text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4 text-indigo-400 animate-pulse" /> Ritual testnet parameters
              </div>
              
              <div className="space-y-3 font-mono text-[10px] leading-relaxed">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-400 uppercase">Network Name</span>
                  <span className="text-white font-bold">Ritual Testnet</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-400 uppercase">Chain ID</span>
                  <span className="text-white font-bold">1979</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-slate-450 uppercase">Currency</span>
                  <span className="text-amber-400 font-bold">RITUAL</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-450 uppercase block">RPC Endpoint</span>
                  <span className="text-white font-semibold break-all text-[9px] bg-black/35 p-1.5 rounded border border-white/5">
                    https://rpc.ritual.net
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-450 uppercase block">Block Explorer</span>
                  <a 
                    href="https://explorer.ritual.net" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-300 font-semibold hover:underline flex items-center gap-1 text-[9px] break-all bg-black/35 p-1.5 rounded border border-white/5"
                  >
                    https://explorer.ritual.net
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rules overlay Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] max-w-lg w-full p-6 space-y-4 shadow-glass relative text-slate-200"
          >
            <h3 className="text-xl font-display font-black text-white border-b border-white/10 pb-2 flex items-center gap-2 uppercase italic">
              <ScrollText className="w-5 h-5 inline animate-pulse text-amber-500" /> Ludo Sacred Rituals
            </h3>
            
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed font-sans h-80 overflow-y-auto pr-2">
              <p>
                <strong className="text-amber-400">1. Dice & Tokens:</strong> Players take turns rolling a six-sided die. Each player controls 4 tokens resting in their Corner Yard.
              </p>
              <p>
                <strong className="text-amber-400">2. Entering Play:</strong> A token can only be launched onto play index 1 (the start zone) when the player rolls a <strong>6</strong> or a <strong>1</strong>.
              </p>
              <p>
                <strong className="text-amber-400">3. Movement & Capturing:</strong> Move tokens clockwise around the circuit. If your token lands on an enemy token, the enemy is <i>captured</i> (sent back to the yard), and you are awarded an immediate bonus roll!
              </p>
              <p>
                <strong className="text-amber-400">4. Protected Stars:</strong> Landing on a space marked with a Star protects you. Multiple colors can coexist peacefully in safe zones without capture.
              </p>
              <p>
                <strong className="text-amber-400">5. Home Path & Victory:</strong> Once a token completes the perimeter travel, it ascends up its designated Home Path column. You must roll exact numbers to reach the center Home Triangle. First player to get all <strong>4 tokens home</strong> wins the Royal Crown!
              </p>
            </div>

            <button
              id="btn-close-rules"
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:brightness-95 text-slate-950 rounded-xl font-display font-extrabold cursor-pointer text-sm shadow-md"
            >
              I Understand the Ritual
            </button>
          </motion.div>
        </div>
      )}

      {/* Dynamic Avatar Customize Sub-Modal */}
      {editingAvatarColor && (
        <div id="avatar-selector-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            id="avatar-selector-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
            onClick={() => setEditingAvatarColor(null)}
          />

          <motion.div
            id="avatar-selector-box"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-[32px] p-6 shadow-glass relative z-10 text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  editingAvatarColor === 'green' ? 'bg-emerald-400' :
                  editingAvatarColor === 'yellow' ? 'bg-amber-400' :
                  editingAvatarColor === 'blue' ? 'bg-sky-400' : 'bg-rose-500'
                }`} />
                <h3 className="text-lg font-display font-extrabold tracking-tight uppercase italic text-white">
                  Identity Calibration
                </h3>
              </div>
              <button
                id="btn-close-avatar-selector"
                onClick={() => setEditingAvatarColor(null)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Preview Area */}
            <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-2xl border border-white/5 mb-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6 pointer-events-none" />
              <div className="w-20 h-20 rounded-[24px] overflow-hidden border-2 border-white/20 shadow-xl flex items-center justify-center bg-white/5 relative group mb-3">
                {playerConfigs[editingAvatarColor].avatar.startsWith('data:image') ? (
                  <img
                    src={playerConfigs[editingAvatarColor].avatar}
                    alt="avatar-preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-4xl select-none">{playerConfigs[editingAvatarColor].avatar}</span>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400">
                Previewing: {playerConfigs[editingAvatarColor].isComputer ? '⚡ Court AI' : playerConfigs[editingAvatarColor].name}
              </span>
            </div>

            {/* Options Tabs or Sections */}
            <div className="space-y-4">
              {/* Option 1: Emojis Grid */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2 font-bold">
                  Ancient Character Sigils
                </span>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto pr-1">
                  {PREDEFINED_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      id={`btn-choose-emoji-${emoji}`}
                      onClick={() => {
                        setPlayerConfigs((prev) => ({
                          ...prev,
                          [editingAvatarColor]: {
                            ...prev[editingAvatarColor],
                            avatar: emoji,
                          },
                        }));
                      }}
                      className={`h-11 rounded-xl flex items-center justify-center text-xl cursor-pointer transition-all ${
                        playerConfigs[editingAvatarColor].avatar === emoji
                          ? 'bg-amber-400/20 border border-amber-400 text-white scale-105'
                          : 'bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Portrait Generator */}
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2 font-bold">
                  Royal Portrait Synthesis
                </span>
                <button
                  id="btn-generate-avatar"
                  onClick={() => {
                    // Generate custom portrait on demand
                    const randomSeed = Math.random().toString(36).substring(7);
                    const imageBase64 = generateProceduralAvatar(randomSeed, editingAvatarColor);
                    setPlayerConfigs((prev) => ({
                      ...prev,
                      [editingAvatarColor]: {
                        ...prev[editingAvatarColor],
                        avatar: imageBase64,
                      },
                    }));
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 active:scale-[0.99] text-white rounded-2xl font-display font-extrabold tracking-widest uppercase text-xs cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 border border-violet-500/30"
                >
                  <Sparkles className="w-4 h-4 fill-current animate-spin-slow" />
                  Calibrate Cyber Portrait
                </button>
              </div>
            </div>

            {/* Confirm Seal */}
            <button
              id="btn-confirm-avatar"
              onClick={() => setEditingAvatarColor(null)}
              className="w-full mt-6 py-3 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Exalt Alignment
            </button>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}

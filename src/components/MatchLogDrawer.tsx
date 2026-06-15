/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ListFilter, ScrollText, Swords, Trophy, Sparkles, MessageSquare, Flame } from 'lucide-react';
import { GameAction } from '../types';
import { useState, useMemo } from 'react';

interface MatchLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actions: GameAction[];
}

export default function MatchLogDrawer({ isOpen, onClose, actions }: MatchLogDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'capture' | 'goal' | 'roll' | 'system'>('all');

  // Compute game statistics based on action list
  const stats = useMemo(() => {
    let rollCount = 0;
    let captureCount = 0;
    let goalCount = 0;
    let penaltyCount = 0;

    actions.forEach((act) => {
      const msg = act.message.toUpperCase();
      if (act.type === 'roll' || msg.includes('ROLLED')) {
        rollCount++;
      }
      if (act.type === 'capture' || msg.includes('CAPTURED')) {
        captureCount++;
      }
      if (act.type === 'goal' || msg.includes('GLORY') || msg.includes('VICTORY') || msg.includes('FINISHED')) {
        goalCount++;
      }
      if (act.type === 'system' || msg.includes('TIMED OUT') || msg.includes('SKIP')) {
        penaltyCount++;
      }
    });

    return { rollCount, captureCount, goalCount, penaltyCount };
  }, [actions]);

  // Filters match actions list dynamically
  const filteredActions = useMemo(() => {
    return actions.filter((act) => {
      // Search text match
      const matchesSearch = act.message.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Type filter match
      if (activeFilter === 'all') return true;
      if (activeFilter === 'capture') {
        return act.type === 'capture' || act.message.includes('CAPTURED');
      }
      if (activeFilter === 'goal') {
        return (
          act.type === 'goal' ||
          act.message.includes('GLORY') ||
          act.message.includes('VICTORY') ||
          act.message.includes('FINISHED')
        );
      }
      if (activeFilter === 'roll') {
        return act.type === 'roll' || act.message.includes('rolled');
      }
      if (activeFilter === 'system') {
        return (
          act.type === 'system' ||
          act.message.includes('COURT DECREE') ||
          act.message.includes('TIMED OUT') ||
          act.message.includes('began')
        );
      }
      return true;
    });
  }, [actions, searchTerm, activeFilter]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="match-log-drawer-root" className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <motion.div
            id="match-log-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020617]/60 backdrop-blur-sm pointer-events-auto cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            id="match-log-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full max-w-md h-full bg-[#0f172a]/95 border-l border-white/10 shadow-glass backdrop-blur-2xl text-slate-100 flex flex-col z-10 overflow-hidden"
          >
            {/* Header section with glowing highlights */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="p-6 border-b border-white/10 flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-black text-white tracking-tight uppercase italic">
                    Court Chronicles
                  </h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Grand Match Log & Annals
                  </p>
                </div>
              </div>

              <button
                id="btn-close-match-log"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="p-6 bg-white/[0.02] border-b border-white/5 grid grid-cols-4 gap-2 relative">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 text-center relative group overflow-hidden">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  ⚔️ Capture
                </span>
                <span id="stat-captures" className="font-display font-black text-lg text-rose-400">
                  {stats.captureCount}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 text-center relative group overflow-hidden">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  🏆 Glory
                </span>
                <span id="stat-goals" className="font-display font-black text-lg text-emerald-400">
                  {stats.goalCount}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 text-center relative group overflow-hidden">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  🎲 Rolls
                </span>
                <span id="stat-rolls" className="font-display font-black text-lg text-sky-400">
                  {stats.rollCount}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 text-center relative group overflow-hidden">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  ⏱️ Penalty
                </span>
                <span id="stat-penalties" className="font-display font-black text-lg text-amber-500">
                  {stats.penaltyCount}
                </span>
              </div>
            </div>

            {/* Sticky Search & Filter Panel */}
            <div className="p-6 space-y-4 border-b border-white/5 relative bg-[#0f172a]/40 backdrop-blur-sm">
              {/* Search input with icons */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="match-log-search"
                  type="text"
                  placeholder="Query chronicles (e.g. Red, captured)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all font-sans"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Advanced Horizontal Category Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border shrink-0 transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  All Logs
                </button>
                <button
                  onClick={() => setActiveFilter('capture')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border shrink-0 transition-all cursor-pointer ${
                    activeFilter === 'capture'
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  Captures
                </button>
                <button
                  onClick={() => setActiveFilter('goal')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border shrink-0 transition-all cursor-pointer ${
                    activeFilter === 'goal'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  Palace Goals
                </button>
                <button
                  onClick={() => setActiveFilter('roll')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border shrink-0 transition-all cursor-pointer ${
                    activeFilter === 'roll'
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  Dice Rolls
                </button>
                <button
                  onClick={() => setActiveFilter('system')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border shrink-0 transition-all cursor-pointer ${
                    activeFilter === 'system'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  Decrees
                </button>
              </div>
            </div>

            {/* List Action Chronicles */}
            <div id="match-log-scroller" className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-3">
              {filteredActions.map((act, idx) => {
                const isCapture = act.type === 'capture' || act.message.includes('CAPTURED');
                const isGoal = act.type === 'goal' || act.message.includes('GLORY') || act.message.includes('VICTORY') || act.message.includes('FINISHED');
                const isRoll = act.type === 'roll' || act.message.includes('rolled');
                const isTimeout = act.message.includes('TIMED OUT');

                // Determine row icon/styling
                let iconNode = <MessageSquare className="w-4 h-4 text-slate-400" />;
                let activeRowStyle = 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]';
                let tagNode = null;

                if (isCapture) {
                  iconNode = <Swords className="w-4 h-4 text-rose-400" />;
                  activeRowStyle = 'border-rose-500/10 bg-rose-500/[0.02] hover:bg-rose-500/[0.04]';
                  tagNode = (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold tracking-tight">
                      CAPTURE
                    </span>
                  );
                } else if (isGoal) {
                  iconNode = <Trophy className="w-4 h-4 text-emerald-400 animate-pulse" />;
                  activeRowStyle = 'border-emerald-500/10 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04]';
                  tagNode = (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold tracking-tight">
                      GLORY
                    </span>
                  );
                } else if (isRoll) {
                  iconNode = <Sparkles className="w-4 h-4 text-sky-400" />;
                  activeRowStyle = 'border-sky-500/10 bg-sky-500/[0.02] hover:bg-sky-500/[0.04]';
                  tagNode = (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 tracking-tight">
                      ROLL
                    </span>
                  );
                } else if (isTimeout) {
                  iconNode = <Flame className="w-4 h-4 text-amber-500 animate-bounce" />;
                  activeRowStyle = 'border-amber-500/10 bg-amber-500/[0.02] hover:bg-amber-500/[0.04]';
                  tagNode = (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 tracking-tight font-bold">
                      TIMEOUT
                    </span>
                  );
                }

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(idx * 0.02, 0.2) }}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${activeRowStyle}`}
                  >
                    <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                      {iconNode}
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-500">{act.timestamp}</span>
                        {tagNode}
                      </div>
                      <p className="text-xs text-slate-200 leading-normal font-sans tracking-wide">
                        {act.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {filteredActions.length === 0 && (
                <div className="text-center py-16 text-slate-500 italic space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto opacity-40" />
                  <p className="text-xs">No matching chronicles found.</p>
                </div>
              )}
            </div>

            {/* Persistent Summary Footer */}
            <div className="p-6 border-t border-white/10 bg-white/[0.01] relative flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Total recorded events:</span>
              <span id="lbl-total-actions" className="font-extrabold text-white text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                {actions.length} Decree{actions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

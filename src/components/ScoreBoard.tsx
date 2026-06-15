/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameAction, Player, PlayerColor, Token } from '../types';
import { audio } from '../utils/audio';
import { motion } from 'motion/react';
import { Crown, Trophy, Volume2, VolumeX, RotateCcw, MessageSquare, ListTodo, ScrollText, Swords, Home } from 'lucide-react';
import { useState } from 'react';

interface ScoreBoardProps {
  players: Player[];
  activePlayerIndex: number;
  tokens: Token[];
  actions: GameAction[];
  onRestart: () => void;
  winnerOrder: PlayerColor[];
  timeLeft?: number;
  onOpenMatchLog?: () => void;
  soundOn?: boolean;
  onToggleSound?: () => void;
  winStreaks?: Record<PlayerColor, number>;
}

export default function ScoreBoard({
  players,
  activePlayerIndex,
  tokens,
  actions,
  onRestart,
  winnerOrder,
  timeLeft,
  onOpenMatchLog,
  soundOn,
  onToggleSound,
  winStreaks
}: ScoreBoardProps) {
  const [internalSoundOn, setInternalSoundOn] = useState(audio.isSoundEnabled());

  const isSoundActive = soundOn !== undefined ? soundOn : internalSoundOn;

  const handleToggleSound = () => {
    if (onToggleSound) {
      onToggleSound();
    } else {
      const newVal = audio.toggleSound();
      setInternalSoundOn(newVal);
    }
  };

  const getFinishedCount = (color: PlayerColor) => {
    return tokens.filter((t) => t.color === color && t.step === 57).length;
  };

  const getCaptureCount = (playerName: string) => {
    if (!playerName) return 0;
    return actions.filter((act) => 
      (act.type === 'capture' || act.message.includes('CAPTURED!')) && 
      act.message.includes(`CAPTURED! ${playerName} cut`)
    ).length;
  };

  const getActivePlayerName = () => {
    const active = players[activePlayerIndex];
    return active ? active.name : 'Unknown';
  };

  const getLeaderboardPosition = (color: PlayerColor) => {
    const idx = winnerOrder.indexOf(color);
    if (idx !== -1) return idx + 1;
    return null;
  };

  const activePlayer = players[activePlayerIndex];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-glass space-y-6 flex flex-col justify-between h-full">
      {/* Top action tray */}
      <div className="space-y-6">
        <div id="scoreboard-header" className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-display font-black text-white tracking-tight">Royal Assembly</h3>
            <p className="text-xs text-slate-400 font-sans">Current status of courts & players</p>
          </div>
          
          <div className="flex gap-2">
            <button
              id="btn-toggle-sound"
              onClick={handleToggleSound}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSoundActive 
                  ? 'bg-amber-500/20 border-amber-100/10 text-amber-300 hover:bg-amber-500/30' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              {isSoundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              id="btn-restart-game-bar"
              onClick={onRestart}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/15 text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic active turn indicator */}
        <motion.div
          id="active-turn-card"
          className={`p-4 bg-white/5 rounded-2xl border relative overflow-hidden shadow-inner font-sans text-slate-100 transition-colors duration-500 ${
            activePlayer?.color === 'green' ? 'border-emerald-500/30' :
            activePlayer?.color === 'yellow' ? 'border-amber-400/30' :
            activePlayer?.color === 'blue' ? 'border-sky-500/30' : 'border-rose-500/30'
          }`}
          animate={{
            boxShadow: activePlayer?.color === 'green' ? [
              "0 0 12px rgba(16, 185, 129, 0.08), inset 0 0 8px rgba(16, 185, 129, 0.04)",
              "0 0 24px rgba(16, 185, 129, 0.28), inset 0 0 12px rgba(16, 185, 129, 0.12)",
              "0 0 12px rgba(16, 185, 129, 0.08), inset 0 0 8px rgba(16, 185, 129, 0.04)"
            ] : activePlayer?.color === 'yellow' ? [
              "0 0 12px rgba(245, 158, 11, 0.08), inset 0 0 8px rgba(245, 158, 11, 0.04)",
              "0 0 24px rgba(245, 158, 11, 0.28), inset 0 0 12px rgba(245, 158, 11, 0.12)",
              "0 0 12px rgba(245, 158, 11, 0.08), inset 0 0 8px rgba(245, 158, 11, 0.04)"
            ] : activePlayer?.color === 'blue' ? [
              "0 0 12px rgba(14, 165, 233, 0.08), inset 0 0 8px rgba(14, 165, 233, 0.04)",
              "0 0 24px rgba(14, 165, 233, 0.28), inset 0 0 12px rgba(14, 165, 233, 0.12)",
              "0 0 12px rgba(14, 165, 233, 0.08), inset 0 0 8px rgba(14, 165, 233, 0.04)"
            ] : [
              "0 0 12px rgba(244, 63, 94, 0.08), inset 0 0 8px rgba(244, 63, 94, 0.04)",
              "0 0 24px rgba(244, 63, 94, 0.28), inset 0 0 12px rgba(244, 63, 94, 0.12)",
              "0 0 12px rgba(244, 63, 94, 0.08), inset 0 0 8px rgba(244, 63, 94, 0.04)"
            ]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-4 -mt-4 pointer-events-none" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold">Active Royal Decree</span>
          <div className="flex items-center gap-2.5 mt-2">
            <div className="relative shrink-0 flex items-center justify-center">
              <div className={`absolute -inset-1 rounded-xl opacity-60 blur animate-pulse ${
                activePlayer?.color === 'green' ? 'bg-emerald-500' :
                activePlayer?.color === 'yellow' ? 'bg-amber-400' :
                activePlayer?.color === 'blue' ? 'bg-sky-500' : 'bg-rose-500'
              }`} />
              {activePlayer && winStreaks && winStreaks[activePlayer.id] > 0 && (
                <div 
                  id={`active-streak-badge-${activePlayer.id}`}
                  className="absolute -top-1.5 -right-1.5 z-10 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-mono font-black text-[9px] px-1 min-w-[15px] h-[15px] rounded-full flex items-center justify-center shadow-lg border border-slate-950 select-none animate-bounce"
                  style={{ animationDuration: '3.5s' }}
                  title={`${winStreaks[activePlayer.id]} Session Wins`}
                >
                  🔥{winStreaks[activePlayer.id]}
                </div>
              )}
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center text-sm shadow">
                {activePlayer?.avatar ? (
                  activePlayer.avatar.startsWith('data:image') ? (
                    <img src={activePlayer.avatar} alt="active portrait" className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-[15px] select-none leading-none">{activePlayer.avatar}</span>
                  )
                ) : (
                  activePlayer?.color.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <h4 id="lbl-active-player-name" className="text-lg font-display font-extrabold text-white uppercase italic leading-none">
              {getActivePlayerName()}'s Turn
            </h4>
          </div>
          <p className="text-xs text-slate-350 mt-1 font-mono">
            {activePlayer?.isComputer ? '⚡ Court AI is deliberating...' : '✍️ Player manual dispatch'}
          </p>

          {/* Action timer for active human players */}
          {!activePlayer?.isComputer && timeLeft !== undefined && (
            <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                <span className="text-slate-400 flex items-center gap-1">
                  ⏱️ Chrono Limit
                </span>
                <span className={`font-black ${
                  timeLeft <= 5 ? 'text-rose-400 animate-pulse text-xs' : 
                  timeLeft <= 10 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className={`h-full rounded-full ${
                    timeLeft <= 5 ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                    timeLeft <= 10 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                    'bg-gradient-to-r from-emerald-400 to-teal-500'
                  }`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>
          )}

          {/* AI Turn Processing Progress */}
          {activePlayer?.isComputer && (
            <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5 opacity-60">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <span>⏱️ Chrono Limit</span>
                <span>AI Processing</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-indigo-500/50 rounded-full w-full animate-pulse" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Players list with court values */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Player Stands
          </h4>
          
          <div className="space-y-2">
            {players.filter(p => p.isActive).map((p) => {
              const count = getFinishedCount(p.id);
              const leaderRank = getLeaderboardPosition(p.id);
              const isCurrent = p.id === activePlayer?.id;

              const getPillColor = () => {
                switch (p.color) {
                  case 'green': return 'bg-emerald-500 text-white shadow-glow-green';
                  case 'yellow': return 'bg-amber-400 text-slate-950 border border-amber-300 shadow-glow-yellow';
                  case 'blue': return 'bg-sky-500 text-white shadow-glow-blue';
                  case 'red': return 'bg-rose-500 text-white shadow-glow-red';
                }
              };

              return (
                <motion.div
                  id={`court-row-${p.id}`}
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isCurrent 
                       ? (p.color === 'green' ? 'bg-white/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.08)]' :
                          p.color === 'yellow' ? 'bg-white/10 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.08)]' :
                          p.color === 'blue' ? 'bg-white/10 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.08)]' :
                          'bg-white/10 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.08)]')
                       : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                  animate={isCurrent ? {
                    scale: [1, 1.02, 1],
                    boxShadow: p.color === 'green' ? [
                      "0 0 12px rgba(16, 185, 129, 0.08), inset 0 0 6px rgba(16, 185, 129, 0.04)",
                      "0 0 24px rgba(16, 185, 129, 0.28), inset 0 0 12px rgba(16, 185, 129, 0.12)",
                      "0 0 12px rgba(16, 185, 129, 0.08), inset 0 0 8px rgba(16, 185, 129, 0.04)"
                    ] : p.color === 'yellow' ? [
                      "0 0 12px rgba(245, 158, 11, 0.08), inset 0 0 6px rgba(245, 158, 11, 0.04)",
                      "0 0 24px rgba(245, 158, 11, 0.28), inset 0 0 12px rgba(245, 158, 11, 0.12)",
                      "0 0 12px rgba(245, 158, 11, 0.08), inset 0 0 8px rgba(245, 158, 11, 0.04)"
                    ] : p.color === 'blue' ? [
                      "0 0 12px rgba(14, 165, 233, 0.08), inset 0 0 6px rgba(14, 165, 233, 0.04)",
                      "0 0 24px rgba(14, 165, 233, 0.28), inset 0 0 12px rgba(14, 165, 233, 0.12)",
                      "0 0 12px rgba(14, 165, 233, 0.08), inset 0 0 8px rgba(14, 165, 233, 0.04)"
                    ] : [
                      "0 0 12px rgba(244, 63, 94, 0.08), inset 0 0 6px rgba(244, 63, 94, 0.04)",
                      "0 0 24px rgba(244, 63, 94, 0.28), inset 0 0 12px rgba(244, 63, 94, 0.12)",
                      "0 0 12px rgba(244, 63, 94, 0.08), inset 0 0 8px rgba(244, 63, 94, 0.04)"
                    ]
                  } : {
                    scale: 1,
                    boxShadow: "none"
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Circle badge with dynamic pulsing glow if current turn */}
                    <div className="relative shrink-0">
                      {isCurrent && (
                        <div className={`absolute -inset-1 rounded-xl opacity-75 blur-[2px] animate-pulse ${
                          p.color === 'green' ? 'bg-emerald-500' :
                          p.color === 'yellow' ? 'bg-amber-400' :
                          p.color === 'blue' ? 'bg-sky-500' : 'bg-rose-500'
                        }`} />
                      )}
                      {winStreaks && winStreaks[p.id] > 0 && (
                        <div 
                          id={`streak-badge-${p.id}`}
                          className="absolute -top-1 -right-1 z-10 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-mono font-black text-[9px] px-1 min-w-[15px] h-[15px] rounded-full flex items-center justify-center shadow-lg border border-slate-950 select-none animate-bounce"
                          style={{ animationDuration: '3.5s' }}
                          title={`${winStreaks[p.id]} Session Wins`}
                        >
                          🔥{winStreaks[p.id]}
                        </div>
                      )}
                      <div className={`relative w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center font-display font-black text-xs transition-all duration-300 ${getPillColor()} ${
                        isCurrent ? 'ring-2 ring-white scale-105' : ''
                      }`}>
                        {p.avatar ? (
                          p.avatar.startsWith('data:image') ? (
                            <img src={p.avatar} alt="portrait" className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[15px] select-none leading-none">{p.avatar}</span>
                          )
                        ) : (
                          p.color.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-display font-extrabold text-white flex items-center gap-1.5">
                        {p.name}
                        {p.isComputer && <span className="text-[9px] bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono">CPU</span>}
                      </span>
                      {/* Finished display as dots */}
                      <div className="flex gap-1 mt-1">
                        {[0, 1, 2, 3].map((dotIdx) => (
                          <div
                            key={dotIdx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              dotIdx < count 
                                ? (p.color === 'green' ? 'bg-emerald-500 shadow-glow-green' :
                                   p.color === 'yellow' ? 'bg-amber-400 shadow-glow-yellow' :
                                   p.color === 'blue' ? 'bg-sky-500 shadow-glow-blue' : 'bg-rose-500 shadow-glow-red')
                                : 'bg-white/15'
                            }`}
                          />
                        ))}
                        <span className="text-[9px] text-slate-400 ml-1.5 font-mono">{count}/4 Goal</span>
                      </div>
                    </div>
                  </div>

                  {/* Winner rank indicator */}
                  <div>
                    {leaderRank ? (
                      <span className="flex items-center gap-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-display font-black text-[10px] px-2 py-1 rounded-lg uppercase tracking-wider">
                        <Trophy className="w-3 h-3 text-amber-400 mr-1" /> Rank {leaderRank}
                      </span>
                    ) : (
                      count === 4 && (
                        <span className="text-[10px] text-slate-400 italic font-mono uppercase tracking-wider">Complete</span>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Clash Analytics Panel */}
        <div id="scoreboard-stats" className="space-y-2.5 pb-2">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Clash Analytics
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {players.filter(p => p.isActive).map((p) => {
              const finished = getFinishedCount(p.id);
              const captures = getCaptureCount(p.name);
              
              const getBadgeTheme = () => {
                switch (p.color) {
                  case 'green': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
                  case 'yellow': return 'bg-amber-400/15 border-amber-400/25 text-amber-300';
                  case 'blue': return 'bg-sky-500/10 border-sky-500/20 text-sky-300';
                  case 'red': return 'bg-rose-500/10 border-rose-500/20 text-rose-300';
                }
              };

              return (
                <div
                  key={p.id}
                  id={`stat-card-${p.color}`}
                  className={`p-2 rounded-xl border ${getBadgeTheme()} flex items-center justify-between font-sans shadow-sm transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm select-none shrink-0" role="img" aria-label="avatar">{p.avatar || '👑'}</span>
                    <span className="text-xs font-display font-semibold truncate text-white">{p.name.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-white/5 font-mono text-[9px] text-slate-300">
                    <span className="flex items-center gap-0.5" title="Reached Home Palace">
                      <Home className="w-2.5 h-2.5 text-indigo-400" /> {finished}
                    </span>
                    <span className="flex items-center gap-0.5" title="Captures Performed">
                      <Swords className="w-2.5 h-2.5 text-rose-400" /> {captures}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Logs Feed (Height managed) */}
      <div className="mt-4 border-t border-white/10 pt-4 flex-1 flex flex-col min-h-[140px] max-h-[220px]">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-450 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Court Chronicles
          </h4>
          {onOpenMatchLog && (
            <button
              id="btn-open-full-logs"
              onClick={onOpenMatchLog}
              className="text-[9px] font-mono font-black text-amber-300 hover:text-amber-200 transition-all bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 rounded-md px-2 py-0.5 flex items-center gap-1 cursor-pointer select-none active:scale-95"
            >
              <ScrollText className="w-2.5 h-2.5" />
              <span>Full Log</span>
            </button>
          )}
        </div>
        <div id="game-logs-scroll" className="flex-1 overflow-y-auto space-y-1.5 text-[10px] font-mono pr-1 text-slate-300 max-h-[160px] scrollbar-thin">
          {actions.slice(-8).map((act, i) => {
            // Apply vibrant color highlights to distinct key words in logs
            const isCapture = act.message.includes('CAPTURED');
            const isGlory = act.message.includes('GLORY') || act.message.includes('VICTORY');
            const isRolled = act.message.includes('rolled');
            
            let messageStyle = 'text-slate-300';
            if (isCapture) messageStyle = 'text-rose-300 font-bold';
            else if (isGlory) messageStyle = 'text-emerald-300 font-bold';
            else if (isRolled) messageStyle = 'text-indigo-200';

            return (
              <div key={i} className="py-1 border-b border-white/5 flex justify-between gap-2">
                <span className={`flex-1 leading-normal ${messageStyle}`}>&gt; {act.message}</span>
                <span className="text-slate-500 font-light shrink-0">{act.timestamp}</span>
              </div>
            );
          })}
          {actions.length === 0 && (
            <div className="text-center py-6 text-slate-500 italic">No decrees recorded yet. Roll to start!</div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CellCoords, Player, PlayerColor, Token, BoardTheme } from '../types';
import { COLOR_CONFIGS, getTokenCoords, isSafeCell, OUTER_TRACK } from '../utils/gameConstants';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, Sparkles } from 'lucide-react';

interface GameBoardProps {
  tokens: Token[];
  activePlayer: Player | null;
  diceValue: number;
  hasRolled: boolean;
  playableTokenIds: number[];
  onTokenClick: (tokenId: number) => void;
  theme: BoardTheme;
}

const THEME_STYLES: Record<BoardTheme, {
  boardOuter: string;
  boardBg: string;
  boardBorder: string;
  cellBg: string;
  cellBorder: string;
  greenMain: string;
  greenYard: string;
  greenToken: string;
  greenHex: string;
  yellowMain: string;
  yellowYard: string;
  yellowToken: string;
  yellowHex: string;
  blueMain: string;
  blueYard: string;
  blueToken: string;
  blueHex: string;
  redMain: string;
  redYard: string;
  redToken: string;
  redHex: string;
  starIconColor: string;
  starBg: string;
  yardInnerBg: string;
}> = {
  royal: {
    boardOuter: "bg-zinc-900 border-zinc-950",
    boardBg: "bg-slate-100",
    boardBorder: "border-slate-400",
    cellBg: "bg-white",
    cellBorder: "border-slate-300",
    greenMain: "bg-emerald-500",
    greenYard: "bg-emerald-500",
    greenToken: "bg-gradient-to-tr from-emerald-950 via-emerald-600 to-emerald-400 border-zinc-950 text-white shadow-[0_5px_10px_rgba(0,0,0,0.6)] ring-1 ring-white/40 ring-inset shadow-glow-green",
    greenHex: "#10b981",
    yellowMain: "bg-amber-400",
    yellowYard: "bg-amber-400",
    yellowToken: "bg-gradient-to-tr from-amber-800 via-amber-450 to-yellow-250 border-zinc-950 text-neutral-950 shadow-[0_5px_10px_rgba(0,0,0,0.6)] ring-1 ring-white/50 ring-inset shadow-glow-yellow",
    yellowHex: "#fbbf24",
    blueMain: "bg-sky-500",
    blueYard: "bg-sky-500",
    blueToken: "bg-gradient-to-tr from-blue-950 via-sky-600 to-sky-350 border-zinc-950 text-white shadow-[0_5px_10px_rgba(0,0,0,0.6)] ring-1 ring-white/40 ring-inset shadow-glow-blue",
    blueHex: "#0ea5e9",
    redMain: "bg-rose-500",
    redYard: "bg-rose-500",
    redToken: "bg-gradient-to-tr from-red-950 via-rose-600 to-rose-400 border-zinc-950 text-white shadow-[0_5px_10px_rgba(0,0,0,0.6)] ring-1 ring-white/40 ring-inset shadow-glow-red",
    redHex: "#f43f5e",
    starIconColor: "text-slate-800 stroke-slate-500",
    starBg: "bg-yellow-105",
    yardInnerBg: "bg-white",
  },
  cosmic: {
    boardOuter: "bg-slate-950 border-slate-900",
    boardBg: "bg-slate-900",
    boardBorder: "border-indigo-900/60",
    cellBg: "bg-slate-950/40",
    cellBorder: "border-indigo-950/45",
    greenMain: "bg-teal-500",
    greenYard: "bg-gradient-to-br from-teal-900 to-teal-950 border-teal-800",
    greenToken: "bg-gradient-to-tr from-teal-950 via-teal-500 to-teal-300 border-teal-900 text-white shadow-[0_5px_10px_rgba(0,0,0,0.8)] ring-1 ring-white/30",
    greenHex: "#14b8a6",
    yellowMain: "bg-yellow-500",
    yellowYard: "bg-gradient-to-br from-yellow-900 to-yellow-950 border-yellow-850",
    yellowToken: "bg-gradient-to-tr from-yellow-950 via-yellow-500 to-yellow-300 border-yellow-900 text-slate-950 shadow-[0_5px_10px_rgba(0,0,0,0.8)] ring-1 ring-white/45",
    yellowHex: "#eab308",
    blueMain: "bg-indigo-500",
    blueYard: "bg-gradient-to-br from-indigo-900 to-indigo-950 border-indigo-850",
    blueToken: "bg-gradient-to-tr from-indigo-950 via-indigo-500 to-indigo-300 border-indigo-900 text-white shadow-[0_5px_10px_rgba(0,0,0,0.8)] ring-1 ring-white/30",
    blueHex: "#6366f1",
    redMain: "bg-purple-500",
    redYard: "bg-gradient-to-br from-purple-900 to-purple-950 border-purple-850",
    redToken: "bg-gradient-to-tr from-purple-950 via-purple-500 to-purple-305 border-purple-900 text-white shadow-[0_5px_10px_rgba(0,0,0,0.8)] ring-1 ring-white/30",
    redHex: "#a855f7",
    starIconColor: "text-indigo-400 stroke-indigo-400/80",
    starBg: "bg-indigo-950/30",
    yardInnerBg: "bg-slate-950/80 border border-indigo-950/40",
  },
  neon: {
    boardOuter: "bg-black border-purple-950",
    boardBg: "bg-[#090514]",
    boardBorder: "border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    cellBg: "bg-[#0c071d]",
    cellBorder: "border-purple-500/15",
    greenMain: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
    greenYard: "bg-zinc-950 border border-emerald-500/30",
    greenToken: "bg-gradient-to-tr from-black via-emerald-850 to-emerald-400 border-emerald-400 text-emerald-250 shadow-[0_0_12px_rgba(16,185,129,0.6)] ring-1 ring-white/20",
    greenHex: "#10b981",
    yellowMain: "bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.3)]",
    yellowYard: "bg-zinc-950 border border-pink-500/30",
    yellowToken: "bg-gradient-to-tr from-black via-pink-850 to-pink-400 border-pink-400 text-pink-250 shadow-[0_0_12px_rgba(236,72,153,0.6)] ring-1 ring-white/30",
    yellowHex: "#ec4899",
    blueMain: "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]",
    blueYard: "bg-zinc-950 border border-cyan-500/30",
    blueToken: "bg-gradient-to-tr from-black via-cyan-850 to-cyan-400 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.6)] ring-1 ring-white/20",
    blueHex: "#22d3ee",
    redMain: "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]",
    redYard: "bg-zinc-950 border border-purple-500/30",
    redToken: "bg-gradient-to-tr from-black via-purple-850 to-purple-400 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.6)] ring-1 ring-white/20",
    redHex: "#a855f7",
    starIconColor: "text-yellow-400 stroke-yellow-300 drop-shadow-[0_0_4px_#fbbf24]",
    starBg: "bg-yellow-950/20",
    yardInnerBg: "bg-black border border-purple-500/20",
  },
  woodland: {
    boardOuter: "bg-amber-950 border-amber-950",
    boardBg: "bg-stone-100",
    boardBorder: "border-stone-850 shadow-inner",
    cellBg: "bg-stone-50/90",
    cellBorder: "border-stone-250",
    greenMain: "bg-emerald-800",
    greenYard: "bg-stone-50 border border-emerald-950/35",
    greenToken: "bg-gradient-to-tr from-emerald-950 via-emerald-800 to-emerald-600 border-stone-900 text-emerald-100 shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
    greenHex: "#15803d",
    yellowMain: "bg-orange-600",
    yellowYard: "bg-stone-50 border border-orange-950/35",
    yellowToken: "bg-gradient-to-tr from-amber-950 via-orange-700 to-orange-450 border-stone-900 text-amber-50 shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
    yellowHex: "#ea580c",
    blueMain: "bg-teal-700",
    blueYard: "bg-stone-50 border border-teal-950/35",
    blueToken: "bg-gradient-to-tr from-teal-950 via-teal-700 to-teal-500 border-stone-900 text-teal-100 shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
    blueHex: "#0f766e",
    redMain: "bg-red-800",
    redYard: "bg-stone-50 border border-red-950/35",
    redToken: "bg-gradient-to-tr from-red-950 via-red-800 to-red-605 border-stone-900 text-red-100 shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
    redHex: "#b91c1c",
    starIconColor: "text-stone-700 stroke-stone-500",
    starBg: "bg-stone-200/50",
    yardInnerBg: "bg-stone-100/90 border border-stone-200",
  },
  slate: {
    boardOuter: "bg-slate-900 border-slate-950",
    boardBg: "bg-slate-50",
    boardBorder: "border-slate-350 shadow-inner",
    cellBg: "bg-white",
    cellBorder: "border-slate-200",
    greenMain: "bg-slate-700",
    greenYard: "bg-slate-105 border border-slate-300",
    greenToken: "bg-gradient-to-tr from-slate-950 via-slate-800 to-slate-500 border-slate-950 text-white shadow-[0_3px_6px_rgba(0,0,0,0.35)]",
    greenHex: "#475569",
    yellowMain: "bg-slate-400",
    yellowYard: "bg-slate-105 border border-slate-300",
    yellowToken: "bg-gradient-to-tr from-slate-900 via-slate-500 to-slate-300 border-slate-700 text-slate-950 shadow-[0_3px_6px_rgba(0,0,0,0.35)]",
    yellowHex: "#94a3b8",
    blueMain: "bg-slate-600",
    blueYard: "bg-slate-105 border border-slate-300",
    blueToken: "bg-gradient-to-tr from-slate-950 via-slate-650 to-slate-450 border-slate-800 text-white shadow-[0_3px_6px_rgba(0,0,0,0.35)]",
    blueHex: "#334155",
    redMain: "bg-slate-500",
    redYard: "bg-slate-105 border border-slate-300",
    redToken: "bg-gradient-to-tr from-slate-850 via-slate-600 to-slate-400 border-slate-750 text-white shadow-[0_3px_6px_rgba(0,0,0,0.35)]",
    redHex: "#64748b",
    starIconColor: "text-slate-600 stroke-slate-450",
    starBg: "bg-slate-100",
    yardInnerBg: "bg-slate-50 border border-slate-200",
  }
};

export default function GameBoard({
  tokens,
  activePlayer,
  diceValue,
  hasRolled,
  playableTokenIds,
  onTokenClick,
  theme
}: GameBoardProps) {
  const [hoveredToken, setHoveredToken] = useState<{ color: PlayerColor; id: number } | null>(null);

  const isYardPulsing = (color: PlayerColor) => {
    if (!activePlayer || activePlayer.id !== color) return false;
    if (!hasRolled || (diceValue !== 6 && diceValue !== 1)) return false;
    return tokens.some((t) => t.color === color && t.step === 0);
  };

  const currentStyle = THEME_STYLES[theme] || THEME_STYLES.royal;

  const getPieceStyle = (token: Token) => {
    switch (token.color) {
      case 'green': return currentStyle.greenToken;
      case 'yellow': return currentStyle.yellowToken;
      case 'blue': return currentStyle.blueToken;
      case 'red': return currentStyle.redToken;
    }
  };

  const renderTokenButton = (token: Token, sizeClass: string) => {
    const isPlayable = activePlayer && 
                       activePlayer.id === token.color && 
                       hasRolled && 
                       playableTokenIds.includes(token.id);

    return (
      <motion.button
        id={`piece-${token.color}-${token.id}`}
        key={`token-${token.color}-${token.id}`}
        layoutId={`token-piece-${token.color}-${token.id}`}
        layout
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        onMouseEnter={() => setHoveredToken({ color: token.color, id: token.id })}
        onMouseLeave={() => setHoveredToken(null)}
        onClick={() => isPlayable && onTokenClick(token.id)}
        disabled={!isPlayable}
        whileHover={isPlayable ? { scale: 1.25, zIndex: 30 } : {}}
        animate={isPlayable ? { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.2 } } : { scale: 1 }}
        className={`rounded-full border-[2.5px] aspect-square flex items-center justify-center pointer-events-auto leading-none relative ${getPieceStyle(token)} ${sizeClass} ${
          isPlayable ? 'cursor-pointer ring-2 ring-yellow-400 z-20 shadow-2xl brightness-110' : 'cursor-default opacity-95'
        }`}
      >
        {/* Floating active neon indicator with a pointing arrow down at the piece */}
        {isPlayable && (
          <div className="absolute -top-7.5 md:-top-8.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30">
            <motion.div
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              className="flex items-center justify-center bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 text-slate-950 rounded-full w-4.5 h-4.5 md:w-5 md:h-5 shadow-[0_3px_8px_rgba(251,191,36,0.5)] border border-white/60 shrink-0"
            >
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
            </motion.div>
            <div className="w-1.5 h-1.5 bg-amber-500 rotate-45 -mt-0.5 border-r border-b border-black/10 shrink-0" />
          </div>
        )}

        {/* Glossy top-left light reflecting specular spot */}
        <span className="absolute top-0.5 left-0.5 w-[30%] h-[30%] rounded-full bg-white/45 filter blur-[0.2px] pointer-events-none" />
        
        {/* Inner concentric ring layer for rich premium visual depth */}
        <span className="absolute inset-[1.5px] rounded-full border border-white/20 pointer-events-none mix-blend-overlay" />

        {/* Raised distinct numbers for optimal readability */}
        <span className="z-10 text-[9px] md:text-[11px] font-sans font-black tracking-tighter drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.95)] relative flex items-center justify-center">
          {token.id + 1}
        </span>
      </motion.button>
    );
  };

  // Compile layout tokens by cell coordinate to display stacked tokens elegantly
  const getTokensAtCell = (r: number, c: number) => {
    return tokens.filter((t) => {
      const coords = getTokenCoords(t.color, t.id, t.step);
      return coords.r === r && coords.c === c;
    });
  };

  // Check if cell is a starting point for any color
  const getStartingCellColor = (r: number, c: number): PlayerColor | null => {
    if (r === 6 && c === 1) return 'green';
    if (r === 1 && c === 8) return 'yellow';
    if (r === 8 && c === 13) return 'blue';
    if (r === 13 && c === 6) return 'red';
    return null;
  };

  // Get path for the hovered token to highlight its destination
  const getHoveredPathCells = (): CellCoords[] => {
    if (!hoveredToken) return [];
    
    const token = tokens.find((t) => t.color === hoveredToken.color && t.id === hoveredToken.id);
    if (!token) return [];

    // If in yard, show starting cell on roll 6 or 1
    if (token.step === 0) {
      if (diceValue === 6 || diceValue === 1) {
        return [getTokenCoords(token.color, token.id, 1)];
      }
      return [];
    }

    const path: CellCoords[] = [];
    const maxStep = Math.min(57, token.step + diceValue);
    
    for (let s = token.step + 1; s <= maxStep; s++) {
      path.push(getTokenCoords(token.color, token.id, s));
    }
    return path;
  };

  const hoveredPath = getHoveredPathCells();
  const highlightSet = new Set(hoveredPath.map((cell) => `${cell.r},${cell.c}`));

  // Generate 15x15 board cells
  const renderCells = () => {
    const cells = [];
    
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        const isYard =
          (r < 6 && c < 6) || // Top-Left Green
          (r < 6 && c > 8) || // Top-Right Yellow
          (r > 8 && c < 6) || // Bottom-Left Red
          (r > 8 && c > 8);   // Bottom-Right Blue

        const isCenterHome = r >= 6 && r <= 8 && c >= 6 && c <= 8;

        if (isYard) {
          // Rendered as big containers using absolute positioning later (to avoid grid gaps)
          // or we can style grid cells to look like continuous quadrants
          cells.push(
            <div
              key={`${r}-${c}`}
              className={`w-full h-full border-[0.5px] ${
                theme === 'royal' ? 'border-amber-900/10' : 'border-indigo-950/10'
              } opacity-0 bg-transparent pointer-events-none`}
              style={{ gridRowStart: r + 1, gridColumnStart: c + 1 }}
            />
          );
          continue;
        }

        if (isCenterHome) {
          // Absolute central area, will overlay SVG center
          cells.push(
            <div
              key={`${r}-${c}`}
              className="w-full h-full bg-transparent pointer-events-none"
              style={{ gridRowStart: r + 1, gridColumnStart: c + 1 }}
            />
          );
          continue;
        }

        // Track Cell Logic
        const currentStyle = THEME_STYLES[theme] || THEME_STYLES.royal;
        let cellBg = currentStyle.cellBg;
        let cellBorder = currentStyle.cellBorder;
        let cellHighlightRing = '';

        // Highlight cells on token path hover using smart relative background tint
        if (highlightSet.has(`${r},${c}`)) {
          const hoveredColor = hoveredToken?.color;
          if (hoveredColor === 'green') cellBg = 'bg-emerald-500/30';
          else if (hoveredColor === 'yellow') cellBg = 'bg-amber-500/30';
          else if (hoveredColor === 'blue') cellBg = 'bg-sky-500/30';
          else if (hoveredColor === 'red') cellBg = 'bg-rose-500/30';
          cellHighlightRing = 'ring-2 ring-amber-500/50 ring-inset shadow-md animate-pulse';
        }

        // Check color properties
        // Green home path: row 7, cols 1..5
        if (r === 7 && c >= 1 && c <= 5) {
          cellBg = currentStyle.greenMain;
        }
        // Yellow home path: col 7, rows 1..5
        else if (c === 7 && r >= 1 && r <= 5) {
          cellBg = currentStyle.yellowMain;
        }
        // Blue home path: row 7, cols 9..13
        if (r === 7 && c >= 9 && c <= 13) {
          cellBg = currentStyle.blueMain;
        }
        // Red home path: col 7, rows 9..13
        else if (c === 7 && r >= 9 && r <= 13) {
          cellBg = currentStyle.redMain;
        }

        const isGameStar = OUTER_TRACK.some((coords, idx) => {
          return coords.r === r && coords.c === c && [9, 22, 35, 48].includes(idx);
        });

        const startColor = getStartingCellColor(r, c);
        if (startColor) {
          if (startColor === 'green') cellBg = currentStyle.greenMain;
          else if (startColor === 'yellow') cellBg = currentStyle.yellowMain;
          else if (startColor === 'blue') cellBg = currentStyle.blueMain;
          else if (startColor === 'red') cellBg = currentStyle.redMain;
        }

        const tokensInCell = getTokensAtCell(r, c);
        const hasPlayableToken = tokensInCell.some((token) => {
          return activePlayer && 
                 activePlayer.id === token.color && 
                 hasRolled && 
                 playableTokenIds.includes(token.id);
        });

        // Arrow cell coordinates
        const isGreenArrowCell = r === 7 && c === 0;
        const isYellowArrowCell = r === 0 && c === 7;
        const isBlueArrowCell = r === 7 && c === 14;
        const isRedArrowCell = r === 14 && c === 7;

        // Visual arrow styles mapped to custom theme tones
        const arrowColors = {
          green: theme === 'royal' ? 'text-emerald-600' : theme === 'cosmic' ? 'text-teal-400' : theme === 'neon' ? 'text-emerald-400' : theme === 'woodland' ? 'text-emerald-700' : 'text-slate-650',
          yellow: theme === 'royal' ? 'text-amber-500' : theme === 'cosmic' ? 'text-yellow-400' : theme === 'neon' ? 'text-pink-400' : theme === 'woodland' ? 'text-orange-500' : 'text-slate-400',
          blue: theme === 'royal' ? 'text-sky-600' : theme === 'cosmic' ? 'text-indigo-400' : theme === 'neon' ? 'text-cyan-400' : theme === 'woodland' ? 'text-teal-600' : 'text-slate-500',
          red: theme === 'royal' ? 'text-rose-600' : theme === 'cosmic' ? 'text-purple-400' : theme === 'neon' ? 'text-purple-400' : theme === 'woodland' ? 'text-red-700' : 'text-slate-550'
        };

        cells.push(
          <div
            key={`cell-${r}-${c}`}
            className={`w-full h-full border ${cellBorder} relative flex items-center justify-center transition-all ${cellBg} ${cellHighlightRing} ${hasPlayableToken ? 'z-30 bg-white/5' : 'overflow-hidden'}`}
            style={{ gridRowStart: r + 1, gridColumnStart: c + 1 }}
          >
            {/* Animated pulsing target ring & glow around cell containing playable tokens */}
            {hasPlayableToken && activePlayer && (
              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ 
                  opacity: [0.5, 0.9, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                className={`absolute inset-0 border-2 ${
                  activePlayer.id === 'green' ? 'border-emerald-400 shadow-[inset_0_0_8px_rgba(52,211,153,0.6)]' :
                  activePlayer.id === 'yellow' ? 'border-amber-400 shadow-[inset_0_0_8px_rgba(251,191,36,0.6)]' :
                  activePlayer.id === 'blue' ? 'border-sky-400 shadow-[inset_0_0_8px_rgba(56,189,248,0.6)]' :
                  'border-rose-450 shadow-[inset_0_0_8px_rgba(251,113,133,0.6)]'
                } pointer-events-none z-0 rounded-sm`}
              />
            )}

            {/* Render star icons on safe spaces exactly like reference (outline star) */}
            {isGameStar && (
              <svg viewBox="0 0 24 24" className={`absolute w-[70%] h-[70%] ${currentStyle.starIconColor} fill-transparent stroke-[1.5] pointer-events-none z-0`}>
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            )}

            {/* Standard Arrows on correct cells */}
            {isGreenArrowCell && (
              <span className={`${arrowColors.green} font-display font-black text-xs md:text-sm select-none leading-none pointer-events-none transform scale-125`}>▶</span>
            )}
            {isYellowArrowCell && (
              <span className={`${arrowColors.yellow} font-display font-black text-xs md:text-sm select-none leading-none pointer-events-none transform scale-125`}>▼</span>
            )}
            {isBlueArrowCell && (
              <span className={`${arrowColors.blue} font-display font-black text-xs md:text-sm select-none leading-none pointer-events-none transform scale-125`}>◀</span>
            )}
            {isRedArrowCell && (
              <span className={`${arrowColors.red} font-display font-black text-xs md:text-sm select-none leading-none pointer-events-none transform scale-125`}>▲</span>
            )}
            
            {/* Display multiple pieces beautifully */}
            {tokensInCell.length > 0 && (
              <div className={`grid ${
                tokensInCell.length > 1 ? 'grid-cols-2 p-0.5 gap-0.5' : 'grid-cols-1'
               } w-full h-full items-center justify-items-center absolute inset-0 ${hasPlayableToken ? 'z-30' : 'z-10'}`}>
                {tokensInCell.map((token) => {
                  const sizeClass = tokensInCell.length > 1 ? 'w-5.5 h-5.5 md:w-6.5 md:h-6.5' : 'w-8 h-8 md:w-9.5 md:h-9.5';
                  return renderTokenButton(token, sizeClass);
                })}
              </div>
            )}
          </div>
        );
      }
    }

    return cells;
  };

  return (
    <div id="game-board-container" className={`w-full max-w-[560px] mx-auto relative aspect-square p-2 md:p-3 rounded-[36px] shadow-2xl overflow-hidden transition-all duration-300 ${currentStyle.boardOuter}`}>
      {/* Container with bright high-contrast borders */}
      <div className={`relative w-full h-full rounded-2xl overflow-hidden border flex items-center justify-center transition-all duration-300 ${currentStyle.boardBg} ${currentStyle.boardBorder}`}>
        {/* 15x15 Master Grid */}
        <div className="grid grid-cols-15 grid-rows-15 w-full h-full absolute inset-0 pointer-events-none z-10">
          {renderCells()}
        </div>

        {/* Turn started flash overlay */}
        <AnimatePresence mode="wait">
          {activePlayer && (
            <motion.div
              key={`turn-flash-${activePlayer.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [1, 1, 0] }}
              transition={{ times: [0, 0.2, 1], duration: 1.1, ease: "easeOut" }}
              className="absolute inset-0 pointer-events-none z-45 flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Radial gradient background splash */}
              <div 
                className="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none"
                style={{
                  background: activePlayer.id === 'green'
                    ? 'radial-gradient(circle, rgba(16,185,129,0.7) 0%, rgba(16,185,129,0.2) 50%, transparent 80%)'
                    : activePlayer.id === 'yellow'
                    ? 'radial-gradient(circle, rgba(251,191,36,0.7) 0%, rgba(251,191,36,0.2) 50%, transparent 80%)'
                    : activePlayer.id === 'blue'
                    ? 'radial-gradient(circle, rgba(14,165,233,0.7) 0%, rgba(14,165,233,0.2) 50%, transparent 80%)'
                    : 'radial-gradient(circle, rgba(244,63,94,0.7) 0%, rgba(244,63,94,0.2) 50%, transparent 80%)'
                }}
              />

              {/* Board Border Flash Ring */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1.05, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className={`absolute inset-0 border-8 ${
                  activePlayer.id === 'green' ? 'border-emerald-400' :
                  activePlayer.id === 'yellow' ? 'border-amber-400' :
                  activePlayer.id === 'blue' ? 'border-sky-400' :
                  'border-rose-450'
                } rounded-2xl pointer-events-none`}
              />

              {/* Diagonal shine beam */}
              <motion.div 
                initial={{ x: '-100%', y: '-100%' }}
                animate={{ x: '100%', y: '100%' }}
                transition={{ duration: 0.75, ease: "easeInOut" }}
                className="absolute w-[150%] h-[30px] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-[35deg] pointer-events-none"
              />

              {/* Centered Pill Message */}
              <motion.div
                initial={{ scale: 0.75, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: [0, 1, 1, 0], y: 0 }}
                transition={{ times: [0, 0.15, 0.75, 1], duration: 1.1, ease: 'backOut' }}
                className="px-5 py-2.5 bg-slate-950/95 border border-white/20 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.65)] flex items-center gap-2 z-50 pointer-events-none max-w-[85%]"
              >
                {/* Micro indicator dot of color */}
                <span className={`w-3 h-3 rounded-full shrink-0 shadow-sm animate-pulse ${
                  activePlayer.id === 'green' ? 'bg-emerald-400' :
                  activePlayer.id === 'yellow' ? 'bg-amber-400' :
                  activePlayer.id === 'blue' ? 'bg-sky-400' :
                  'bg-rose-400'
                }`} />
                <span className="font-display font-black tracking-wider uppercase text-[10px] md:text-sm text-white whitespace-nowrap">
                  {activePlayer.isComputer ? `${activePlayer.name}'s Turn (AI)` : `Your Turn: ${activePlayer.name}`}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OVERLAY QUADRANTS (Yards) for beautiful, uninterrupted styling */}
        {/* 1. Green Yard (Top-Left, 6x6) */}
        <motion.div 
          id="bg-yard-green"
          className={`absolute top-0 left-0 w-[40%] h-[40%] border-r border-b border-slate-400/40 p-3 md:p-4 flex items-center justify-center z-20 overflow-hidden ${currentStyle.greenYard}`}
          animate={isYardPulsing('green') ? {
            boxShadow: [
              "inset 0 0 25px rgba(255, 255, 255, 0.25)",
              "inset 0 0 50px rgba(52, 211, 153, 0.8), 0 0 35px rgba(52, 211, 153, 0.55)",
              "inset 0 0 25px rgba(255, 255, 255, 0.25)"
            ],
            scale: [1, 1.018, 1],
            transition: { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
          } : { scale: 1, boxShadow: "none" }}
        >
          <div className={`w-full h-full rounded-[24px] p-2.5 md:p-4 grid grid-cols-2 grid-rows-2 gap-2.5 md:gap-4 shadow-md relative ${currentStyle.yardInnerBg}`}>
            {/* Active turn indicator subtle ring */}
            {activePlayer?.id === 'green' && (
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: [0.55, 1, 0.55],
                  scale: [0.99, 1.01, 0.99],
                  boxShadow: [
                    "0 0 4px rgba(16, 185, 129, 0.2), inset 0 0 4px rgba(16, 185, 129, 0.2)",
                    "0 0 16px rgba(16, 185, 129, 0.8), inset 0 0 8px rgba(16, 185, 129, 0.4)",
                    "0 0 4px rgba(16, 185, 129, 0.2), inset 0 0 4px rgba(16, 185, 129, 0.2)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                className="absolute inset-[3px] border-[3px] border-emerald-450 rounded-[22px] pointer-events-none z-30"
              />
            )}

            {[0, 1, 2, 3].map((val) => {
              const yardToken = tokens.find(t => t.color === 'green' && t.id === val && t.step === 0);
              return (
                <div key={val} className={`w-full h-full rounded-full border flex items-center justify-center shadow-inner relative ${currentStyle.greenMain} border-black/10`}>
                  {yardToken ? (
                    renderTokenButton(yardToken, 'w-[75%] h-[75%] md:w-[80%] md:h-[80%]')
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-black/10" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 2. Yellow Yard (Top-Right, 6x6) */}
        <motion.div 
          id="bg-yard-yellow"
          className={`absolute top-0 right-0 w-[40%] h-[40%] border-l border-b border-slate-400/40 p-3 md:p-4 flex items-center justify-center z-20 overflow-hidden ${currentStyle.yellowYard}`}
          animate={isYardPulsing('yellow') ? {
            boxShadow: [
              "inset 0 0 25px rgba(255, 255, 255, 0.25)",
              "inset 0 0 50px rgba(251, 191, 36, 0.8), 0 0 35px rgba(251, 191, 36, 0.55)",
              "inset 0 0 25px rgba(255, 255, 255, 0.25)"
            ],
            scale: [1, 1.018, 1],
            transition: { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
          } : { scale: 1, boxShadow: "none" }}
        >
          <div className={`w-full h-full rounded-[24px] p-2.5 md:p-4 grid grid-cols-2 grid-rows-2 gap-2.5 md:gap-4 shadow-md relative ${currentStyle.yardInnerBg}`}>
            {/* Active turn indicator subtle ring */}
            {activePlayer?.id === 'yellow' && (
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: [0.55, 1, 0.55],
                  scale: [0.99, 1.01, 0.99],
                  boxShadow: [
                    "0 0 4px rgba(245, 158, 11, 0.2), inset 0 0 4px rgba(245, 158, 11, 0.2)",
                    "0 0 16px rgba(245, 158, 11, 0.8), inset 0 0 8px rgba(245, 158, 11, 0.4)",
                    "0 0 4px rgba(245, 158, 11, 0.2), inset 0 0 4px rgba(245, 158, 11, 0.2)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                className="absolute inset-[3px] border-[3px] border-amber-400 rounded-[22px] pointer-events-none z-30"
              />
            )}

            {[0, 1, 2, 3].map((val) => {
              const yardToken = tokens.find(t => t.color === 'yellow' && t.id === val && t.step === 0);
              return (
                <div key={val} className={`w-full h-full rounded-full border flex items-center justify-center shadow-inner relative ${currentStyle.yellowMain} border-black/10`}>
                  {yardToken ? (
                    renderTokenButton(yardToken, 'w-[75%] h-[75%] md:w-[80%] md:h-[80%]')
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-black/10" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 3. Blue Yard (Bottom-Right, 6x6) */}
        <motion.div 
          id="bg-yard-blue"
          className={`absolute bottom-0 right-0 w-[40%] h-[40%] border-l border-t border-slate-400/40 p-3 md:p-4 flex items-center justify-center z-20 overflow-hidden ${currentStyle.blueYard}`}
          animate={isYardPulsing('blue') ? {
            boxShadow: [
              "inset 0 0 25px rgba(255, 255, 255, 0.25)",
              "inset 0 0 50px rgba(56, 189, 248, 0.8), 0 0 35px rgba(56, 189, 248, 0.55)",
              "inset 0 0 25px rgba(255, 255, 255, 0.25)"
            ],
            scale: [1, 1.018, 1],
            transition: { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
          } : { scale: 1, boxShadow: "none" }}
        >
          <div className={`w-full h-full rounded-[24px] p-2.5 md:p-4 grid grid-cols-2 grid-rows-2 gap-2.5 md:gap-4 shadow-md relative ${currentStyle.yardInnerBg}`}>
            {/* Active turn indicator subtle ring */}
            {activePlayer?.id === 'blue' && (
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: [0.55, 1, 0.55],
                  scale: [0.99, 1.01, 0.99],
                  boxShadow: [
                    "0 0 4px rgba(14, 165, 233, 0.2), inset 0 0 4px rgba(14, 165, 233, 0.2)",
                    "0 0 16px rgba(14, 165, 233, 0.8), inset 0 0 8px rgba(14, 165, 233, 0.4)",
                    "0 0 4px rgba(14, 165, 233, 0.2), inset 0 0 4px rgba(14, 165, 233, 0.2)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                className="absolute inset-[3px] border-[3px] border-sky-455 rounded-[22px] pointer-events-none z-30"
              />
            )}

            {[0, 1, 2, 3].map((val) => {
              const yardToken = tokens.find(t => t.color === 'blue' && t.id === val && t.step === 0);
              return (
                <div key={val} className={`w-full h-full rounded-full border flex items-center justify-center shadow-inner relative ${currentStyle.blueMain} border-black/10`}>
                  {yardToken ? (
                    renderTokenButton(yardToken, 'w-[75%] h-[75%] md:w-[80%] md:h-[80%]')
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-black/10" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 4. Red Yard (Bottom-Left, 6x6) */}
        <motion.div 
          id="bg-yard-red"
          className={`absolute bottom-0 left-0 w-[40%] h-[40%] border-r border-t border-slate-400/40 p-3 md:p-4 flex items-center justify-center z-20 overflow-hidden ${currentStyle.redYard}`}
          animate={isYardPulsing('red') ? {
            boxShadow: [
              "inset 0 0 25px rgba(255, 255, 255, 0.25)",
              "inset 0 0 50px rgba(251, 113, 133, 0.8), 0 0 35px rgba(251, 113, 133, 0.55)",
              "inset 0 0 25px rgba(255, 255, 255, 0.25)"
            ],
            scale: [1, 1.018, 1],
            transition: { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
          } : { scale: 1, boxShadow: "none" }}
        >
          <div className={`w-full h-full rounded-[24px] p-2.5 md:p-4 grid grid-cols-2 grid-rows-2 gap-2.5 md:gap-4 shadow-md relative ${currentStyle.yardInnerBg}`}>
            {/* Active turn indicator subtle ring */}
            {activePlayer?.id === 'red' && (
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: [0.55, 1, 0.55],
                  scale: [0.99, 1.01, 0.99],
                  boxShadow: [
                    "0 0 4px rgba(244, 63, 94, 0.2), inset 0 0 4px rgba(244, 63, 94, 0.2)",
                    "0 0 16px rgba(244, 63, 94, 0.8), inset 0 0 8px rgba(244, 63, 94, 0.4)",
                    "0 0 4px rgba(244, 63, 94, 0.2), inset 0 0 4px rgba(244, 63, 94, 0.2)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                className="absolute inset-[3px] border-[3px] border-rose-455 rounded-[22px] pointer-events-none z-30"
              />
            )}

            {[0, 1, 2, 3].map((val) => {
              const yardToken = tokens.find(t => t.color === 'red' && t.id === val && t.step === 0);
              return (
                <div key={val} className={`w-full h-full rounded-full border flex items-center justify-center shadow-inner relative ${currentStyle.redMain} border-black/10`}>
                  {yardToken ? (
                    renderTokenButton(yardToken, 'w-[75%] h-[75%] md:w-[80%] md:h-[80%]')
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-black/10" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CENTER EXQUISITE HOME TRIANGLE OVERLAY */}
        <div
          id="board-home-center"
          className={`absolute top-[40%] left-[40%] w-[20%] h-[20%] flex items-center justify-center pointer-events-auto border border-slate-400/40 z-25 ${currentStyle.yardInnerBg}`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Green Triangle (Left) */}
            <polygon points="0,0 50,50 0,100" fill={currentStyle.greenHex} className="stroke-slate-400/20 stroke-[1]" />
            {/* Yellow Triangle (Top) */}
            <polygon points="0,0 100,0 50,50" fill={currentStyle.yellowHex} className="stroke-slate-400/20 stroke-[1]" />
            {/* Blue Triangle (Right) */}
            <polygon points="100,0 50,50 100,100" fill={currentStyle.blueHex} className="stroke-slate-400/20 stroke-[1]" />
            {/* Red Triangle (Bottom) */}
            <polygon points="0,100 50,50 100,100" fill={currentStyle.redHex} className="stroke-slate-400/20 stroke-[1]" />
            {/* Center Crown Emblem */}
            <circle cx="50" cy="50" r="10" fill={theme === 'cosmic' || theme === 'neon' ? '#0c0a1c' : '#ffffff'} fillOpacity="0.9" className="stroke-amber-600 stroke-[1.5]" />
            <path d="M47,48 L44,45 L47,42 L50,45 L53,42 L56,45 L53,48 Z" fill="#b45309" transform="translate(0, 0)" />
          </svg>

        {/* Display finished tokens inside center home triangle */}
        {/* We place small trophies or avatars for players who finish! */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-1 pointer-events-none">
          {/* Green Finished Spot */}
          <div className="col-start-1 row-start-2 flex items-center justify-center">
            {tokens.filter(t => t.color === 'green' && t.step === 57).length > 0 && (
              <div className="w-4 h-4 rounded-full bg-emerald-600 border border-white text-[8px] text-white flex items-center justify-center font-bold shadow">
                {tokens.filter(t => t.color === 'green' && t.step === 57).length}✓
              </div>
            )}
          </div>
          {/* Yellow Finished Spot */}
          <div className="col-start-2 row-start-1 flex items-center justify-center">
            {tokens.filter(t => t.color === 'yellow' && t.step === 57).length > 0 && (
              <div className="w-4 h-4 rounded-full bg-amber-500 border border-slate-950 text-[8px] text-slate-950 flex items-center justify-center font-bold shadow">
                {tokens.filter(t => t.color === 'yellow' && t.step === 57).length}✓
              </div>
            )}
          </div>
          {/* Blue Finished Spot */}
          <div className="col-start-3 row-start-2 flex items-center justify-center">
            {tokens.filter(t => t.color === 'blue' && t.step === 57).length > 0 && (
              <div className="w-4 h-4 rounded-full bg-sky-600 border border-white text-[8px] text-white flex items-center justify-center font-bold shadow">
                {tokens.filter(t => t.color === 'blue' && t.step === 57).length}✓
              </div>
            )}
          </div>
          {/* Red Finished Spot */}
          <div className="col-start-2 row-start-3 flex items-center justify-center">
            {tokens.filter(t => t.color === 'red' && t.step === 57).length > 0 && (
              <div className="w-4 h-4 rounded-full bg-rose-600 border border-white text-[8px] text-white flex items-center justify-center font-bold shadow">
                {tokens.filter(t => t.color === 'red' && t.step === 57).length}✓
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

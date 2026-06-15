import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Cpu, Trophy, Palette } from 'lucide-react';
import { BoardTheme } from '../types';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty: AIDifficulty;
  onChangeDifficulty: (difficulty: AIDifficulty) => void;
  theme: BoardTheme;
  onChangeTheme: (theme: BoardTheme) => void;
}

const THEME_PREVIEWS: Array<{ id: BoardTheme; name: string; desc: string; colors: string[]; text: string }> = [
  { id: 'royal', name: 'Ritual Royal', desc: 'Ancient golden court style', colors: ['bg-emerald-500', 'bg-amber-400', 'bg-sky-500', 'bg-rose-500'], text: 'text-amber-400' },
  { id: 'cosmic', name: 'Cosmic Nebula', desc: 'Intergalactic deep space', colors: ['bg-teal-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500'], text: 'text-indigo-400' },
  { id: 'neon', name: 'Neon Night', desc: 'Cyberpunk electric night glow', colors: ['bg-emerald-400', 'bg-pink-500', 'bg-cyan-400', 'bg-purple-500'], text: 'text-pink-400' },
  { id: 'woodland', name: 'Woodland Classic', desc: 'Forest pine & cozy dark maple', colors: ['bg-emerald-800', 'bg-orange-600', 'bg-teal-700', 'bg-red-800'], text: 'text-emerald-500' },
  { id: 'slate', name: 'Minimalist Slate', desc: 'Sleek architectural stone work', colors: ['bg-slate-700', 'bg-slate-400', 'bg-slate-600', 'bg-slate-500'], text: 'text-slate-300' }
];

export default function SettingsModal({
  isOpen,
  onClose,
  difficulty,
  onChangeDifficulty,
  theme,
  onChangeTheme,
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id="settings-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            id="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0f172a]/75 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            id="settings-content"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-950/85 border border-white/10 rounded-[32px] p-6 md:p-8 shadow-glass backdrop-blur-2xl text-slate-100 z-10 space-y-6 relative custom-scrollbar"
          >
            {/* Close Button */}
            <button
              id="btn-close-settings"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: AI Difficulty */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-display font-extrabold text-white tracking-tight uppercase italic">
                  Court Algorithms
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  AI Difficulty Calibration
                </p>
              </div>
            </div>

            {/* Difficulty Cards */}
            <div className="space-y-3 pt-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                Select Intelligence Mode
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Easy Card */}
                <button
                  id="btn-diff-easy"
                  onClick={() => onChangeDifficulty('easy')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-full transition-all cursor-pointer ${
                    difficulty === 'easy'
                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-white/5 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg border ${
                      difficulty === 'easy' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}>
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-display font-black text-xs text-slate-100 tracking-wide uppercase">
                      Novice
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight font-sans">
                    Plays relaxedly, making moves at random with minimal awareness of strategic capture zones or safety cells.
                  </p>
                </button>

                {/* Medium Card */}
                <button
                  id="btn-diff-medium"
                  onClick={() => onChangeDifficulty('medium')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-full transition-all cursor-pointer ${
                    difficulty === 'medium'
                      ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'bg-white/5 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg border ${
                      difficulty === 'medium' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}>
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-display font-black text-xs text-slate-100 tracking-wide uppercase">
                      Strategist
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight font-sans">
                    Intelligently scores releases, goal conversions, and 60% of visible capture opportunities. Standard challenge.
                  </p>
                </button>

                {/* Hard Card */}
                <button
                  id="btn-diff-hard"
                  onClick={() => onChangeDifficulty('hard')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-full transition-all cursor-pointer ${
                    difficulty === 'hard'
                      ? 'bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                      : 'bg-white/5 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg border ${
                      difficulty === 'hard' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}>
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-display font-black text-xs text-slate-100 tracking-wide uppercase">
                      Royal AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight font-sans">
                    Risk mitigation. Escapes enemy attack ranges, prioritize securing safe star nodes, and makes 100% calculation of captures.
                  </p>
                </button>
              </div>
            </div>

            {/* Header: Board Aesthetics */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 pt-4">
              <div className="p-2.5 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b]">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-display font-extrabold text-white tracking-tight uppercase italic">
                  Board Athletics & Arts
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b]">
                  Ludo Arena Custom Themes
                </p>
              </div>
            </div>

            {/* Themes Grid */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                Convene Visual Vibe
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {THEME_PREVIEWS.map((p) => {
                  const isSelected = theme === p.id;
                  return (
                    <button
                      key={p.id}
                      id={`btn-theme-${p.id}`}
                      onClick={() => onChangeTheme(p.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-[115px] transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-white/5 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-display font-black text-xs text-slate-100 tracking-wide uppercase group-hover:text-white transition-colors">
                            {p.name}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-450 leading-tight font-sans">
                          {p.desc}
                        </p>
                      </div>

                      {/* Swatch Mini Preview consisting of 4 dots */}
                      <div className="flex items-center gap-1.5 pt-2">
                        <div className="flex gap-1 bg-black/30 px-2 py-1 rounded-full border border-white/5">
                          {p.colors.map((colorBg, idx) => (
                            <span
                              key={idx}
                              className={`w-2 h-2 rounded-full ${colorBg} shadow-sm shrink-0`}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Button */}
            <button
              id="btn-confirm-settings"
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:brightness-95 text-slate-950 font-display font-black tracking-widest uppercase text-xs cursor-pointer shadow-lg transition-all rounded-2xl"
            >
              Seal Calibration
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

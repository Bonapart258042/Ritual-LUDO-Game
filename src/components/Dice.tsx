/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface DiceProps {
  value: number;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
  color: 'green' | 'yellow' | 'blue' | 'red';
}

export default function Dice({ value, isRolling, disabled, onRoll, color }: DiceProps) {
  const getDiceColorClasses = () => {
    switch (color) {
      case 'green': return 'bg-emerald-600 shadow-emerald-500/30 text-white';
      case 'yellow': return 'bg-amber-500 shadow-amber-400/30 text-slate-900';
      case 'blue': return 'bg-sky-600 shadow-sky-500/30 text-white';
      case 'red': return 'bg-rose-600 shadow-rose-500/30 text-white';
    }
  };

  const renderDots = () => {
    const dotClasses = `w-2.5 h-2.5 rounded-full ${color === 'yellow' ? 'bg-slate-950' : 'bg-white'}`;
    
    // Position classes inside a 3x3 grid template
    switch (value) {
      case 1:
        return (
          <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 p-1 justify-items-center items-center">
            <div className="col-start-2 row-start-2 border-none">
              <div id={`dice-dot-1-1`} className={dotClasses} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 p-1 justify-items-center items-center">
            <div className="col-start-1 row-start-1 border-none">
              <div id="dice-dot-2-1" className={dotClasses} />
            </div>
            <div className="col-start-3 row-start-3 border-none">
              <div id="dice-dot-2-2" className={dotClasses} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 p-1 justify-items-center items-center">
            <div className="col-start-1 row-start-1 border-none">
              <div id="dice-dot-3-1" className={dotClasses} />
            </div>
            <div className="col-start-2 row-start-2 border-none">
              <div id="dice-dot-3-2" className={dotClasses} />
            </div>
            <div className="col-start-3 row-start-3 border-none">
              <div id="dice-dot-3-3" className={dotClasses} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 p-1 justify-items-center items-center">
            <div className="col-start-1 row-start-1 border-none">
              <div id="dice-dot-4-1" className={dotClasses} />
            </div>
            <div className="col-start-3 row-start-1 border-none">
              <div id="dice-dot-4-2" className={dotClasses} />
            </div>
            <div className="col-start-1 row-start-3 border-none">
              <div id="dice-dot-4-3" className={dotClasses} />
            </div>
            <div className="col-start-3 row-start-3 border-none">
              <div id="dice-dot-4-4" className={dotClasses} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 p-1 justify-items-center items-center">
            <div className="col-start-1 row-start-1 border-none">
              <div id="dice-dot-5-1" className={dotClasses} />
            </div>
            <div className="col-start-3 row-start-1 border-none">
              <div id="dice-dot-5-2" className={dotClasses} />
            </div>
            <div className="col-start-2 row-start-2 border-none">
              <div id="dice-dot-5-3" className={dotClasses} />
            </div>
            <div className="col-start-1 row-start-3 border-none">
              <div id="dice-dot-5-4" className={dotClasses} />
            </div>
            <div className="col-start-3 row-start-3 border-none">
              <div id="dice-dot-5-5" className={dotClasses} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 p-1 justify-items-center items-center">
            <div className="col-start-1 row-start-1 border-none">
              <div id="dice-dot-6-1" className={dotClasses} />
            </div>
            <div className="col-start-3 row-start-1 border-none">
              <div id="dice-dot-6-2" className={dotClasses} />
            </div>
            <div className="col-start-1 row-start-2 border-none">
              <div id="dice-dot-6-3" className={dotClasses} />
            </div>
            <div className="col-start-3 row-start-2 border-none">
              <div id="dice-dot-6-4" className={dotClasses} />
            </div>
            <div className="col-start-1 row-start-3 border-none">
              <div id="dice-dot-6-5" className={dotClasses} />
            </div>
            <div className="col-start-3 row-start-3 border-none">
              <div id="dice-dot-6-6" className={dotClasses} />
            </div>
          </div>
        );
      default:
        // Render 1 single centered dot as fallback
        return (
          <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 p-1 justify-items-center items-center">
            <div className="col-start-2 row-start-2 border-none">
              <div id="dice-dot-d-1" className={dotClasses} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <motion.button
        id={`btn-roll-dice-${color}`}
        disabled={disabled}
        onClick={onRoll}
        whileHover={!disabled ? { scale: 1.08, rotate: 5 } : {}}
        whileTap={!disabled ? { scale: 0.92 } : {}}
        animate={
          isRolling
            ? {
                rotateX: [0, 360, 720],
                rotateY: [0, 180, 540],
                scale: [1, 1.25, 1],
                transition: { duration: 0.6, ease: 'easeInOut' }
              }
            : {}
        }
        className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20 relative cursor-pointer font-bold ${getDiceColorClasses()} ${
          disabled ? 'opacity-40 cursor-not-allowed contrast-75' : 'hover:brightness-110 active:brightness-95'
        }`}
      >
        <div className="absolute inset-0.5 rounded-lg border border-white/10 pointer-events-none" />
        {renderDots()}
      </motion.button>
    </div>
  );
}

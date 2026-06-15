/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlayerColor = 'green' | 'yellow' | 'blue' | 'red';
export type BoardTheme = 'royal' | 'cosmic' | 'neon' | 'woodland' | 'slate';

export interface Player {
  id: PlayerColor;
  name: string;
  color: PlayerColor;
  isComputer: boolean;
  isActive: boolean;
  hasFinished: boolean;
  avatar: string;
}

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // 0: in yard, 1-51: track, 52-56: home path, 57: home
}

export type GameState = 'welcome' | 'playing' | 'finished';
export type DiceState = 'idle' | 'rolling' | 'rolled' | 'no_moves';

export interface CellCoords {
  r: number; // 0 - 14
  c: number; // 0 - 14
}

export interface GameAction {
  type: string;
  message: string;
  timestamp: string;
}

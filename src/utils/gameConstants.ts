/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CellCoords, PlayerColor } from '../types';

// The 52 coordinates of the outer track of the Ludo board, in clockwise order
export const OUTER_TRACK: CellCoords[] = [
  { r: 6, c: 0 },   // 0
  { r: 6, c: 1 },   // 1  (Green Start)
  { r: 6, c: 2 },   // 2
  { r: 6, c: 3 },   // 3
  { r: 6, c: 4 },   // 4
  { r: 6, c: 5 },   // 5
  { r: 5, c: 6 },   // 6
  { r: 4, c: 6 },   // 7
  { r: 3, c: 6 },   // 8
  { r: 2, c: 6 },   // 9  (Safe/Star)
  { r: 1, c: 6 },   // 10
  { r: 0, c: 6 },   // 11
  { r: 0, c: 7 },   // 12
  { r: 0, c: 8 },   // 13 (Yellow Start is next, at 14)
  { r: 1, c: 8 },   // 14 
  { r: 2, c: 8 },   // 15
  { r: 3, c: 8 },   // 16
  { r: 4, c: 8 },   // 17
  { r: 5, c: 8 },   // 18
  { r: 6, c: 9 },   // 19
  { r: 6, c: 10 },  // 20
  { r: 6, c: 11 },  // 21
  { r: 6, c: 12 },  // 22 (Safe/Star)
  { r: 6, c: 13 },  // 23
  { r: 6, c: 14 },  // 24
  { r: 7, c: 14 },  // 25
  { r: 8, c: 14 },  // 26 (Blue Start is next, at 27)
  { r: 8, c: 13 },  // 27
  { r: 8, c: 12 },  // 28
  { r: 8, c: 11 },  // 29
  { r: 8, c: 10 },  // 30
  { r: 8, c: 9 },   // 31
  { r: 9, c: 8 },   // 32
  { r: 10, c: 8 },  // 33
  { r: 11, c: 8 },  // 34
  { r: 12, c: 8 },  // 35 (Safe/Star)
  { r: 13, c: 8 },  // 36
  { r: 14, c: 8 },  // 37
  { r: 14, c: 7 },  // 38
  { r: 14, c: 6 },  // 39 (Red Start is next, at 40)
  { r: 13, c: 6 },  // 40
  { r: 12, c: 6 },  // 41
  { r: 11, c: 6 },  // 42
  { r: 10, c: 6 },  // 43
  { r: 9, c: 6 },   // 44
  { r: 8, c: 5 },   // 45
  { r: 8, c: 4 },   // 46
  { r: 8, c: 3 },   // 47
  { r: 8, c: 2 },   // 48 (Safe/Star)
  { r: 8, c: 1 },   // 49
  { r: 8, c: 0 },   // 50
  { r: 7, c: 0 }    // 51
];

// Start and End specifications for each player, along with Yard positions
export interface ColorConfig {
  startIndex: number;
  endIndex: number;
  homePath: CellCoords[];
  yardCoords: CellCoords[];
  name: string;
  themeColor: string; // Tailwind class
  hexColor: string;
}

export const COLOR_CONFIGS: Record<PlayerColor, ColorConfig> = {
  green: {
    startIndex: 1, // (6, 1)
    endIndex: 0,   // (6, 0)
    homePath: [
      { r: 7, c: 1 },
      { r: 7, c: 2 },
      { r: 7, c: 3 },
      { r: 7, c: 4 },
      { r: 7, c: 5 }
    ],
    yardCoords: [
      { r: 2, c: 2 }, { r: 2, c: 3 },
      { r: 3, c: 2 }, { r: 3, c: 3 }
    ],
    name: "Green Team",
    themeColor: "emerald",
    hexColor: "#10b981"
  },
  yellow: {
    startIndex: 14, // (1, 8)
    endIndex: 12,  // (0, 7)
    homePath: [
      { r: 1, c: 7 },
      { r: 2, c: 7 },
      { r: 3, c: 7 },
      { r: 4, c: 7 },
      { r: 5, c: 7 }
    ],
    yardCoords: [
      { r: 2, c: 11 }, { r: 2, c: 12 },
      { r: 3, c: 11 }, { r: 3, c: 12 }
    ],
    name: "Yellow Team",
    themeColor: "amber",
    hexColor: "#f59e0b"
  },
  blue: {
    startIndex: 27, // (8, 13)
    endIndex: 25,  // (7, 14)
    homePath: [
      { r: 7, c: 13 },
      { r: 7, c: 12 },
      { r: 7, c: 11 },
      { r: 7, c: 10 },
      { r: 7, c: 9 }
    ],
    yardCoords: [
      { r: 11, c: 11 }, { r: 11, c: 12 },
      { r: 12, c: 11 }, { r: 12, c: 12 }
    ],
    name: "Blue Team",
    themeColor: "sky",
    hexColor: "#0ea5e9"
  },
  red: {
    startIndex: 40, // (13, 6)
    endIndex: 38,  // (14, 7)
    homePath: [
      { r: 13, c: 7 },
      { r: 12, c: 7 },
      { r: 11, c: 7 },
      { r: 10, c: 7 },
      { r: 9, c: 7 }
    ],
    yardCoords: [
      { r: 11, c: 2 }, { r: 11, c: 3 },
      { r: 12, c: 2 }, { r: 12, c: 3 }
    ],
    name: "Red Team",
    themeColor: "rose",
    hexColor: "#f43f5e"
  }
};

// Safe zones on outer track
export const SAFE_TRACK_INDICES = [1, 9, 14, 22, 27, 35, 40, 48];

export function getTokenCoords(color: PlayerColor, tokenId: number, step: number): CellCoords {
  const config = COLOR_CONFIGS[color];
  if (step === 0) {
    // Return yard spot
    return config.yardCoords[tokenId];
  } else if (step >= 1 && step <= 51) {
    // On common track
    const trackIdx = (config.startIndex + step - 1) % 52;
    return OUTER_TRACK[trackIdx];
  } else if (step >= 52 && step <= 56) {
    // In home path
    return config.homePath[step - 52];
  } else {
    // In center home center
    // Let's place it nicely inside the 3x3 center triangle based on color
    switch (color) {
      case 'green':  return { r: 7, c: 6 };
      case 'yellow': return { r: 6, c: 7 };
      case 'blue':   return { r: 7, c: 8 };
      case 'red':    return { r: 8, c: 7 };
    }
  }
}

// Check if a tile coordinate is a static safe spot on the board
export function isSafeCell(r: number, c: number): boolean {
  // Check if it's one of the safe track coordinates
  const isOnSafeTrack = OUTER_TRACK.some((cell, idx) => {
    return cell.r === r && cell.c === c && SAFE_TRACK_INDICES.includes(idx);
  });
  if (isOnSafeTrack) return true;

  // Check if it's in any player's home path
  for (const color of ['green', 'yellow', 'blue', 'red'] as PlayerColor[]) {
    if (COLOR_CONFIGS[color].homePath.some(cell => cell.r === r && cell.c === c)) {
      return true;
    }
  }

  // Check if it's in home center
  if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
    return true;
  }

  return false;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerColor } from '../types';

export const PREDEFINED_EMOJIS = [
  '👑', '⚔️', '🛡️', '🦁', '🐉', '🧙‍♂️', '🦉', '🦊', '🦄', '🐯', '⚡', '🔥', '🌙', '💀', '🛸', '🤖', '🦅', '💎', '🍀'
];

/**
 * Procedurallly generates a beautiful, glowing vector gradient portrait SVG as a Data URL.
 * Combines high-contrast geometric backdrops and stylized retro/minimalist character elements.
 */
export function generateProceduralAvatar(seed: string, color: PlayerColor): string {
  // Simple hashing algorithm
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  // High-vibrancy modern color sets
  const colorPalettes = [
    { from: '#10b981', to: '#047857' }, // Emerald Glow
    { from: '#fbbf24', to: '#d97706' }, // Royal Amber
    { from: '#38bdf8', to: '#0369a1' }, // Deep Sky
    { from: '#f43f5e', to: '#be123c' }, // Crimson Rose
    { from: '#a855f7', to: '#6b21a8' }, // Mystic Amethyst
    { from: '#ec4899', to: '#9d174d' }, // Neon Ruby
    { from: '#06b6d4', to: '#0891b2' }, // Radiant Teal
    { from: '#6366f1', to: '#3730a3' }, // Indigo Velvet
  ];

  // Pick gradient set based on color bias and hash
  let palette = colorPalettes[hash % colorPalettes.length];
  
  // Align with Ludo team color coordinates if possible
  if (color === 'green') palette = { from: '#10b981', to: '#065f46' };
  else if (color === 'yellow') palette = { from: '#fbbf24', to: '#b45309' };
  else if (color === 'blue') palette = { from: '#0ea5e9', to: '#1e3a8a' };
  else if (color === 'red') palette = { from: '#f43f5e', to: '#9f1239' };

  const leftEyeX = 35;
  const rightEyeX = 65;
  const eyeY = 40 + (hash % 10);
  const mouthY = 62 + (hash % 8);
  const coreHue = hash % 360;

  // Modern human/abstract cyber overlay features
  const facialOverlays = [
    // 0: Traditional Royal Crown portrait
    `<path d="M 28 32 L 36 50 L 50 30 L 64 50 L 72 32 L 68 70 L 32 70 Z" fill="#ffffff" fill-opacity="0.9" />
     <circle cx="50" cy="58" r="6" fill="${palette.from}" />
     <circle cx="50" cy="30" r="3" fill="#ffffff" />
     <circle cx="28" cy="32" r="3.5" fill="#ffffff" />
     <circle cx="72" cy="32" r="3.5" fill="#ffffff" />`,

    // 1: Modern Abstract Visor
    `<rect x="25" y="${eyeY - 4}" width="50" height="12" rx="6" fill="#ffffff" fill-opacity="0.95" />
     <rect x="28" y="${eyeY - 2}" width="44" height="8" rx="4" fill="hsl(${coreHue}, 90%, 55%)" />
     <line x1="42" y1="${mouthY}" x2="58" y2="${mouthY}" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />`,

    // 2: Cyber scholar with round frames
    `<circle cx="${leftEyeX}" cy="${eyeY}" r="11" stroke="#ffffff" stroke-width="3" fill="none" />
     <circle cx="${rightEyeX}" cy="${eyeY}" r="11" stroke="#ffffff" stroke-width="3" fill="none" />
     <line x1="${leftEyeX + 11}" y1="${eyeY}" x2="${rightEyeX - 11}" y2="${eyeY}" stroke="#ffffff" stroke-width="3" />
     <circle cx="${leftEyeX}" cy="${eyeY}" r="4" fill="#ffffff" />
     <circle cx="${rightEyeX}" cy="${eyeY}" r="4" fill="#ffffff" />
     <path d="M 44 ${mouthY} Q 50 ${mouthY + 10} 56 ${mouthY}" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" />`,

    // 3: High-tech virtual network lines (Abstract)
    `<line x1="20" y1="50" x2="80" y2="50" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.4" />
     <line x1="50" y1="20" x2="50" y2="80" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.4" />
     <circle cx="50" cy="50" r="22" stroke="#ffffff" stroke-width="2" stroke-dasharray="4,4" fill="none" />
     <polygon points="50,28 66,60 34,60" fill="#ffffff" fill-opacity="0.9" />
     <circle cx="50" cy="50" r="6" fill="hsl(${coreHue}, 95%, 60%)" />`,

    // 4: Minimalist Neon Samurai mask
    `<path d="M 30 35 L 70 35 L 64 64 L 50 78 L 36 64 Z" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-width="3.5" />
     <polygon points="35,42 48,46 38,48" fill="#ffffff" />
     <polygon points="65,42 52,46 62,48" fill="#ffffff" />
     <path d="M 45 62 L 50 66 L 55 62" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none" />`,

    // 5: Ancient Totem / Tribal Shield
    `<path d="M 50 18 C 30 18 24 45 24 60 C 24 75 50 84 50 84 C 50 84 76 75 76 60 C 76 45 70 18 50 18 Z" fill="#ffffff" fill-opacity="0.95" />
     <circle cx="40" cy="42" r="5" fill="#0f172a" />
     <circle cx="60" cy="42" r="5" fill="#0f172a" />
     <rect x="44" y="52" width="12" height="18" rx="2" fill="hsl(${coreHue}, 90%, 50%)" />`
  ];

  const graphicMarkup = facialOverlays[hash % facialOverlays.length];

  // Built as clean, valid XML SVG node string
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="pgrad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.from}" />
          <stop offset="100%" stop-color="${palette.to}" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="30" fill="url(#pgrad-${hash})" />
      <circle cx="50" cy="50" r="41" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2" fill="none" />
      <g>
        ${graphicMarkup}
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;
}

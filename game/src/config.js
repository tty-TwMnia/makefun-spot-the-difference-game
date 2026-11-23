// config.js — canvas geometry, palette and the level table for Spot the Difference.

export const VIEW = {
  width: 1280,
  height: 800,
  panelY: 168,
  panelW: 568,
  panelH: 426,
  leftX: 36,
  rightX: 676,
  // Scenes are painted in a 400 x 300 design space, scaled to fill a panel.
  designW: 400,
  designH: 300,
};

export const INK = '#263238';
export const PAPER = '#f6efe3';
export const ACCENT = '#ff6b5e';
export const TEAL = '#2a9d8f';
export const GOLD = '#e9c46a';

// Each level: how many differences, how long on the clock, and which
// subtlety band of the scene's difference list to draw from.
export const LEVELS = [
  { name: 'Warm-up', diffs: 5, seconds: 150, maxSubtlety: 2 },
  { name: 'Getting Tricky', diffs: 7, seconds: 180, maxSubtlety: 2 },
  { name: 'Eagle Eye', diffs: 9, seconds: 210, maxSubtlety: 3 },
];

export const HINTS_PER_LEVEL = 2;
export const MISS_PENALTY_SECONDS = 5;

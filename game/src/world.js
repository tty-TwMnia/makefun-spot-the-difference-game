// world.js — builds a level: chooses a scene and this level's differences,
// and tracks what has been found, the clock, hints and score.

import { LEVELS, HINTS_PER_LEVEL } from './config.js';
import { SCENES } from './scenes.js';
import { mulberry32, shuffle } from './random.js';

export function createLevel(levelIndex, seed, sceneIndex = null) {
  const spec = LEVELS[levelIndex % LEVELS.length];
  const scene = SCENES[(sceneIndex ?? levelIndex) % SCENES.length];
  const rng = mulberry32(seed * 7919 + levelIndex * 131 + 17);
  // Draw from the subtlety bands in order: every obvious one the level
  // allows, then medium, then sneaky, shuffled inside each band.
  const byBand = [1, 2, 3]
    .filter((band) => band <= spec.maxSubtlety)
    .flatMap((band) => shuffle(rng, scene.diffs.filter((d) => d.subtlety === band)));
  const chosen = byBand.slice(0, spec.diffs).map((d) => ({ ...d, found: false, foundAt: 0 }));
  return {
    levelIndex,
    spec,
    scene,
    diffs: chosen,
    mods: new Set(chosen.map((d) => d.id)),
    timeLeft: spec.seconds,
    hintsLeft: HINTS_PER_LEVEL,
    hintId: null,
    hintUntil: 0,
    misses: 0,
    shakeUntil: 0,
    startedAt: 0,
  };
}

export function foundCount(level) {
  return level.diffs.filter((d) => d.found).length;
}

export function remainingCount(level) {
  return level.diffs.length - foundCount(level);
}

export function isComplete(level) {
  return remainingCount(level) === 0;
}

// A click in design-space coordinates: the nearest unfound difference
// whose circle holds the point, or null.
export function differenceAt(level, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const d of level.diffs) {
    if (d.found) continue;
    const dist = Math.hypot(x - d.x, y - d.y);
    if (dist <= d.r && dist < bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}

// Spend a hint on the unfound difference the player has overlooked longest
// (the first unfound one in the level's list).
export function spendHint(level, now) {
  if (level.hintsLeft <= 0) return null;
  const target = level.diffs.find((d) => !d.found);
  if (!target) return null;
  level.hintsLeft -= 1;
  level.hintId = target.id;
  level.hintUntil = now + 2600;
  return target;
}

export function scoreFor(level, secondsLeft) {
  const found = foundCount(level);
  return found * 100 + Math.max(0, Math.round(secondsLeft)) * 2 - level.misses * 25;
}

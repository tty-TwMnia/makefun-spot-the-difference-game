// shots.js — posed states for the maker's screenshots. Opening the game
// with ?shot=<name>&seed=<n> freezes it in a real mid-game state, drawn by
// the same renderer a player sees; the maker photographs that.

import { createLevel } from './world.js';

const NOW = 100000;

function posed(levelIndex, sceneIndex, seed, found, timeLeft, hintsLeft) {
  const level = createLevel(levelIndex, seed, sceneIndex);
  level.diffs.forEach((d, i) => {
    if (i < found) {
      d.found = true;
      d.foundAt = NOW - 1200 - i * 300; // animation at rest
    }
  });
  level.timeLeft = timeLeft;
  level.hintsLeft = hintsLeft;
  level.startedAt = NOW;
  return level;
}

export function poseState(name, seed) {
  switch (name) {
    case 'play':
      return { screen: 'play', level: posed(1, 0, seed, 3, 118, 1), score: 385, best: 1240, now: NOW, missMark: null };
    case 'market':
      return { screen: 'play', level: posed(1, 1, seed, 2, 96, 2), score: 240, best: 1240, now: NOW, missMark: null };
    case 'late':
      return { screen: 'play', level: posed(2, 2, seed, 5, 23, 0), score: 815, best: 1240, now: NOW, missMark: null };
    case 'won': {
      const level = posed(0, 0, seed, 5, 74, 1);
      return { screen: 'won', level, score: 648, best: 1240, now: NOW, missMark: null };
    }
    default:
      return null;
  }
}

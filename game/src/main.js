// main.js — boots the game, owns the state machine (title -> play -> won /
// lost), the clock and the score, and wires input to the world.

import { MISS_PENALTY_SECONDS } from './config.js';
import { createLevel, differenceAt, spendHint, isComplete, scoreFor } from './world.js';
import { drawGame } from './render.js';
import { locate, canvasPoint } from './input.js';
import { sfx } from './audio.js';
import { poseState } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const baseSeed = Number(params.get('seed') ?? (Date.now() % 100000)) || 1;

let best = 0;
try { best = Number(localStorage.getItem('spotdiff-best') ?? 0) || 0; } catch { best = 0; }

const state = {
  screen: 'title',
  level: createLevel(0, baseSeed),
  score: 0,
  banked: 0,
  best,
  now: 0,
  missMark: null,
};

if (shotName) {
  const posed = poseState(shotName, baseSeed);
  if (posed) Object.assign(state, posed);
}

function displayScore() {
  const found = state.level.diffs.filter((d) => d.found).length;
  return state.banked + found * 100 - state.level.misses * 25;
}

function startLevel(levelIndex, seedBump = 0) {
  state.level = createLevel(levelIndex, baseSeed + seedBump);
  state.screen = 'play';
  state.missMark = null;
}

function onPanel(point) {
  const level = state.level;
  const hit = differenceAt(level, point.x, point.y);
  const now = state.now;
  if (hit) {
    hit.found = true;
    hit.foundAt = now;
    if (level.hintId === hit.id) level.hintId = null;
    sfx.find();
    if (isComplete(level)) {
      state.banked += scoreFor(level, level.timeLeft);
      state.screen = 'won';
      sfx.win();
      if (state.banked > state.best) {
        state.best = state.banked;
        try { localStorage.setItem('spotdiff-best', String(state.best)); } catch { /* private mode */ }
      }
    }
  } else {
    level.misses += 1;
    level.timeLeft = Math.max(0, level.timeLeft - MISS_PENALTY_SECONDS);
    level.shakeUntil = now + 260;
    state.missMark = {
      x: point.side === 'left' ? 36 + point.x * (568 / 400) : 676 + point.x * (568 / 400),
      y: 168 + point.y * (568 / 400),
      until: now + 450,
    };
    sfx.miss();
  }
}

function onAction(action) {
  if (action.kind === 'next') {
    sfx.click();
    if (state.screen === 'title') startLevel(0);
    else if (state.screen === 'won') {
      if (state.level.levelIndex + 1 >= 3) { state.banked = 0; startLevel(0); }
      else startLevel(state.level.levelIndex + 1);
    } else if (state.screen === 'lost') startLevel(state.level.levelIndex, 1);
    return;
  }
  if (state.screen !== 'play') return;
  if (action.kind === 'panel') onPanel(action);
  else if (action.kind === 'hint') {
    if (spendHint(state.level, state.now)) sfx.hint();
  } else if (action.kind === 'restart') startLevel(state.level.levelIndex, 1);
}

canvas.addEventListener('pointerdown', (event) => {
  const p = canvasPoint(canvas, event);
  onAction(locate(p.x, p.y, state.screen));
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'h' || event.key === 'H') onAction({ kind: 'hint' });
  else if (event.key === 'r' || event.key === 'R') onAction({ kind: 'restart' });
  else if (event.key === ' ' || event.key === 'Enter') onAction({ kind: 'next' });
});

let last = performance.now();
function frame(nowMs) {
  state.now = nowMs;
  const dt = Math.min(0.1, (nowMs - last) / 1000);
  last = nowMs;
  if (state.screen === 'play' && !shotName) {
    state.level.timeLeft -= dt;
    if (state.level.timeLeft <= 0) {
      state.level.timeLeft = 0;
      state.screen = 'lost';
      sfx.lose();
    }
  }
  state.score = displayScore();
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

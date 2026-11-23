// input.js — turns pointer and keyboard events into game actions: clicks
// inside a panel become design-space points, clicks on buttons press them.

import { VIEW } from './config.js';
import { HINT_BUTTON, RESTART_BUTTON, NEXT_BUTTON } from './render.js';

const SCALE = VIEW.panelW / VIEW.designW;

// Where a canvas point falls: {kind:'panel', side, x, y} in design space,
// {kind:'hint'|'restart'|'next'}, or {kind:'none'}.
export function locate(canvasX, canvasY, screen) {
  if (screen !== 'play') {
    return inRect(canvasX, canvasY, NEXT_BUTTON) ? { kind: 'next' } : { kind: 'none' };
  }
  if (inRect(canvasX, canvasY, HINT_BUTTON)) return { kind: 'hint' };
  if (inRect(canvasX, canvasY, RESTART_BUTTON)) return { kind: 'restart' };
  for (const [side, px] of [['left', VIEW.leftX], ['right', VIEW.rightX]]) {
    if (canvasX >= px && canvasX <= px + VIEW.panelW &&
        canvasY >= VIEW.panelY && canvasY <= VIEW.panelY + VIEW.panelH) {
      return { kind: 'panel', side, x: (canvasX - px) / SCALE, y: (canvasY - VIEW.panelY) / SCALE };
    }
  }
  return { kind: 'none' };
}

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

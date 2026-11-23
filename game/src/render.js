// render.js — paints one frame: the two panels, the found markers, the
// counter, the clock bar and the overlays. Everything the player (and the
// screenshots) see is drawn here from the level state.

import { VIEW, INK, PAPER, ACCENT, TEAL, GOLD } from './config.js';
import { foundCount, remainingCount } from './world.js';

export const HINT_BUTTON = { x: 36, y: 640, w: 168, h: 52 };
export const RESTART_BUTTON = { x: 1076, y: 640, w: 168, h: 52 };
export const NEXT_BUTTON = { x: 490, y: 470, w: 300, h: 64 };

const SCALE = VIEW.panelW / VIEW.designW;

function panelPath(ctx, x) {
  ctx.beginPath();
  ctx.rect(x, VIEW.panelY, VIEW.panelW, VIEW.panelH);
}

function drawPanel(ctx, level, x, mods, now) {
  ctx.save();
  panelPath(ctx, x);
  ctx.clip();
  ctx.translate(x, VIEW.panelY);
  ctx.scale(SCALE, SCALE);
  level.scene.paint(ctx, mods);
  // markers on the differences already found: a ring that pops, then rests
  for (const d of level.diffs) {
    if (!d.found) continue;
    const age = Math.min(1, (now - d.foundAt) / 220);
    const pop = 1 + 0.45 * (1 - age) * (1 - age);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5.5 / SCALE;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * 0.82 * pop, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 3.4 / SCALE;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * 0.82 * pop, 0, Math.PI * 2);
    ctx.stroke();
  }
  // the hint pulse: a breathing gold ring on both panels
  if (level.hintId && now < level.hintUntil) {
    const d = level.diffs.find((it) => it.id === level.hintId);
    if (d && !d.found) {
      const pulse = 1 + 0.16 * Math.sin(now / 130);
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3 / SCALE;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * 1.05 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
  // frame and shadow edge
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  panelPath(ctx, x);
  ctx.stroke();
}

function drawMarkerLegend(ctx, state) {
  // last miss: a short red cross where the click landed
  if (state.missMark && state.now < state.missMark.until) {
    const { x, y } = state.missMark;
    ctx.strokeStyle = '#d90429';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 11, y - 11);
    ctx.lineTo(x + 11, y + 11);
    ctx.moveTo(x + 11, y - 11);
    ctx.lineTo(x - 11, y + 11);
    ctx.stroke();
  }
}

function drawHud(ctx, state) {
  const level = state.level;
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 37px system-ui, sans-serif';
  ctx.fillText('SPOT THE DIFFERENCE', 36, 52);
  ctx.font = '600 21px system-ui, sans-serif';
  ctx.fillStyle = '#5b6b73';
  ctx.fillText(`${level.scene.title} · Level ${level.levelIndex + 1}: ${level.spec.name}`, 38, 92);

  // the counter the whole game turns on
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText(`${remainingCount(level)} TO GO`, 640, 54);
  ctx.font = '600 20px system-ui, sans-serif';
  ctx.fillStyle = TEAL;
  ctx.fillText(`${foundCount(level)} FOUND`, 640, 90);

  ctx.textAlign = 'right';
  ctx.fillStyle = INK;
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText(`SCORE ${state.score}`, 1244, 54);
  ctx.font = '600 20px system-ui, sans-serif';
  ctx.fillStyle = '#5b6b73';
  ctx.fillText(`BEST ${state.best}`, 1244, 90);

  // the clock: a bar that drains and reddens — time pressure in the frame
  const frac = Math.max(0, level.timeLeft / level.spec.seconds);
  ctx.fillStyle = '#e3d9c6';
  ctx.fillRect(36, 122, 1208, 16);
  ctx.fillStyle = frac < 0.2 ? '#d90429' : TEAL;
  ctx.fillRect(36, 122, 1208 * frac, 16);
  ctx.fillStyle = INK;
  ctx.textAlign = 'right';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(`${Math.ceil(level.timeLeft)}s`, 1244, 108);

  // buttons
  drawButton(ctx, HINT_BUTTON, `HINT · ${level.hintsLeft}`, level.hintsLeft > 0);
  drawButton(ctx, RESTART_BUTTON, 'RESTART', true);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5b6b73';
  ctx.font = '600 19px system-ui, sans-serif';
  ctx.fillText('Click a difference in either picture · a miss costs 5 seconds', 640, 730);
}

function drawButton(ctx, r, label, enabled) {
  ctx.fillStyle = enabled ? GOLD : '#d8cfba';
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 12);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 21px system-ui, sans-serif';
  ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 1);
}

function drawOverlay(ctx, state, title, lines, buttonLabel) {
  ctx.fillStyle = 'rgba(246,239,227,0.88)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.fillText(title, 640, 300);
  ctx.font = '600 26px system-ui, sans-serif';
  ctx.fillStyle = '#43545c';
  lines.forEach((line, i) => ctx.fillText(line, 640, 362 + i * 38));
  if (buttonLabel) drawButton(ctx, NEXT_BUTTON, buttonLabel, true);
}

export function drawGame(ctx, state) {
  const now = state.now;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const level = state.level;
  const shake = now < level.shakeUntil ? Math.sin(now / 18) * 5 : 0;
  ctx.save();
  ctx.translate(shake, 0);
  drawPanel(ctx, level, VIEW.leftX, new Set(), now);
  drawPanel(ctx, level, VIEW.rightX, level.mods, now);
  ctx.restore();
  drawHud(ctx, state);
  drawMarkerLegend(ctx, state);

  if (state.screen === 'title') {
    drawOverlay(ctx, state, 'SPOT THE DIFFERENCE',
      ['Two pictures. A few quiet lies between them.', 'Find every difference before the clock runs out.'], 'START');
  } else if (state.screen === 'won') {
    drawOverlay(ctx, state, 'ALL FOUND!',
      [`${level.scene.title} cleared · score ${state.score}`,
       state.level.levelIndex + 1 >= 3 ? 'You finished every scene. Play again to beat your score.' : 'The next scene is trickier.'], 
      state.level.levelIndex + 1 >= 3 ? 'PLAY AGAIN' : 'NEXT SCENE');
  } else if (state.screen === 'lost') {
    drawOverlay(ctx, state, "TIME'S UP",
      [`${remainingCount(level)} differences stayed hidden.`, 'The gold rings show where they were.'],
      'TRY AGAIN');
    // reveal: gold rings over the overlay, at the unfound differences
    for (const panelX of [VIEW.leftX, VIEW.rightX]) {
      for (const d of level.diffs) {
        if (d.found) continue;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(panelX + d.x * SCALE, VIEW.panelY + d.y * SCALE, d.r * SCALE * 0.82, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

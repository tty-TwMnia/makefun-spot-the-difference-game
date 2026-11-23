// Spot the difference — submission driver for this entry.
//
// The game itself lives in game/ as plain static files: no build step, no
// network, nothing to install. This driver stages the deliverable for the
// judge. It copies game/ and screenshots/ into the output directory and
// writes dossier.json there, the summary the judge reads, produced with
// the vendored make.fun library.
//
// The grader runs it as `node main.ts`, which writes to /output. To
// rehearse locally, point MAKEFUN_OUTPUT_DIR at a scratch directory:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the staged game locally with `node serve.ts` and open
// http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The scorer's own caps, mirrored here so that an entry the scorer would
// refuse is refused by this driver first, before it is ever graded: at
// most 4 screenshots of at most 256 KiB each, at most 993 game files and
// 48 MiB of game files in all, and no path under game/ over 1000 bytes.
// Only text_max_bytes shapes the dossier's bytes; the rest are gates.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

// Copy a whole directory tree, creating the target first so the copy
// lands in an existing directory on every platform.
function stageTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function main(): void {
  const entryDir = fileURLToPath(new URL('.', import.meta.url));
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  const gameDir = join(entryDir, 'game');
  if (!existsSync(gameDir)) {
    throw new Error(`game/ is missing beside main.ts (looked in ${entryDir})`);
  }

  mkdirSync(outputDir, { recursive: true });
  stageTree(gameDir, join(outputDir, 'game'));

  const shotsDir = join(entryDir, 'screenshots');
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }

  const dossier = buildDossier(outputDir, DOSSIER_LIMITS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

main();

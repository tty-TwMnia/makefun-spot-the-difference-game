// scenes.js — the three original scenes. Each scene paints itself in a
// 400 x 300 design space. A scene's differences are small mutations: the
// painter receives `mods`, the set of difference ids switched on for this
// panel, and draws those elements differently. The left panel is painted
// with no mods, the right panel with the level's chosen difference ids, so
// a difference is visible by construction and its marker position is the
// element's own centre.

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function vgrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

function text(ctx, str, x, y, size, fill, align = 'center') {
  ctx.fillStyle = fill;
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// ---------------------------------------------------------------- harbour café
function paintHarbour(ctx, mods) {
  // sky, sea, promenade
  ctx.fillStyle = vgrad(ctx, 0, 150, [[0, '#aee3f5'], [1, '#e8f7ee']]);
  ctx.fillRect(0, 0, 400, 150);
  ctx.fillStyle = vgrad(ctx, 150, 212, [[0, '#57b7c7'], [1, '#2a9db8']]);
  ctx.fillRect(0, 150, 400, 62);
  rect(ctx, 0, 212, 400, 88, '#e8d9b0');
  for (let i = 0; i < 7; i++) line(ctx, 12 + i * 56, 176 + (i % 3) * 12, 40 + i * 56, 176 + (i % 3) * 12, '#bfeaf2', 2.5);

  // sun and clouds
  circle(ctx, 52, 48, mods.has('sun-big') ? 27 : 20, '#ffd93b');
  circle(ctx, 52, 48, mods.has('sun-big') ? 33 : 26, 'rgba(255,217,59,0.25)');
  cloud(ctx, 96, 40);
  if (!mods.has('cloud-gone')) cloud(ctx, 168, 30);
  cloud(ctx, 300, 36);
  if (mods.has('extra-gull')) gull(ctx, 262, 60);
  gull(ctx, 226, 52);
  gull(ctx, 128, 66);

  // lighthouse on rocks, right
  poly(ctx, [[322, 212], [368, 212], [360, 188], [330, 188]], '#8d99ae');
  rect(ctx, 336, 128, 18, 62, '#f4f1de');
  rect(ctx, 336, 146, 18, 10, '#e63946');
  rect(ctx, 336, 168, 18, 10, '#e63946');
  rect(ctx, 333, 118, 24, 10, '#3a506b');
  if (mods.has('lamp-lit')) {
    circle(ctx, 345, 133, 13, 'rgba(255,209,102,0.5)');
    circle(ctx, 345, 133, 6, '#ffd166');
  } else {
    circle(ctx, 345, 133, 6, '#6c757d');
  }

  // sailboats
  boat(ctx, 292, 182, '#ffffff');
  boat(ctx, mods.has('boat-moved') ? 66 : 44, 168, '#ffe8d6');

  // café building
  rect(ctx, 96, 118, 158, 94, '#fdf6e3');
  poly(ctx, [[88, 118], [262, 118], [238, 96], [112, 96]], '#bc6c25');
  rect(ctx, 160, 168, 26, 44, '#7f5539');
  circle(ctx, 180, 191, 2.4, '#ffd166');
  // windows: left plain, right with shutters that can close
  rect(ctx, 112, 140, 26, 26, '#a8dadc');
  rect(ctx, 112, 140, 26, 4, '#457b9d');
  if (mods.has('window-shut')) {
    rect(ctx, 214, 140, 26, 26, '#457b9d');
    line(ctx, 214, 148, 240, 148, '#1d3557', 2);
    line(ctx, 214, 158, 240, 158, '#1d3557', 2);
  } else {
    rect(ctx, 214, 140, 26, 26, '#ffe8a3');
    rect(ctx, 214, 140, 26, 4, '#457b9d');
  }
  // hanging sign: round in one panel, square in the other
  line(ctx, 175, 96, 175, 88, '#3a506b', 2);
  if (mods.has('sign-shape')) {
    rect(ctx, 152, 84, 46, 18, '#3a506b');
  } else {
    circle(ctx, 175, 93, 12, '#3a506b');
  }
  text(ctx, 'CAFE', 175, mods.has('sign-shape') ? 93 : 93, 10, '#ffffff');

  // striped awning over the terrace
  const awning = mods.has('awning-teal') ? '#2a9d8f' : '#ff6b5e';
  for (let i = 0; i < 6; i++) {
    poly(ctx, [[100 + i * 26, 132], [126 + i * 26, 132], [130 + i * 26, 118], [104 + i * 26, 118]],
      i % 2 ? '#ffffff' : awning);
  }

  // terrace: two tables with umbrellas, cups, chairs
  umbrella(ctx, 128, 176, '#e63946', mods.has('umbrella-tilt') ? -0.28 : 0.05);
  table(ctx, 128, 208);
  circle(ctx, 120, 200, 4, '#ffffff'); // cup on the left table, always there
  umbrella(ctx, 238, 176, '#ffb703', 0.05);
  table(ctx, 238, 208);
  if (!mods.has('cup-gone')) circle(ctx, 246, 200, 4, '#ffffff');
  chair(ctx, 268, 216, mods.has('chair-color') ? '#4361ee' : '#2a9d8f');
  chair(ctx, 84, 216, '#2a9d8f');

  // cat by the door, tail up or down
  circle(ctx, 150, 240, 9, '#f4a261');
  circle(ctx, 150, 228, 6.5, '#f4a261');
  poly(ctx, [[144, 224], [147, 216], [150, 224]], '#f4a261');
  poly(ctx, [[150, 224], [153, 216], [156, 224]], '#f4a261');
  if (mods.has('cat-tail')) {
    line(ctx, 158, 242, 168, 246, '#f4a261', 3.5);
  } else {
    line(ctx, 158, 240, 166, 230, '#f4a261', 3.5);
  }

  // string lights across the terrace front
  for (let i = 0; i < 9; i++) {
    const x = 100 + i * 20;
    const y = 108 + Math.sin(i * 0.9) * 3;
    circle(ctx, x, y, 2.2, i % 2 ? '#ffd166' : '#ff8fa3');
  }
}

function cloud(ctx, x, y) {
  circle(ctx, x, y, 12, '#ffffff');
  circle(ctx, x + 13, y + 2, 9, '#ffffff');
  circle(ctx, x - 13, y + 3, 8, '#ffffff');
}

function gull(ctx, x, y) {
  line(ctx, x - 7, y, x, y - 4, '#3a506b', 1.8);
  line(ctx, x, y - 4, x + 7, y, '#3a506b', 1.8);
}

function boat(ctx, x, y, sail) {
  poly(ctx, [[x - 14, y + 10], [x + 14, y + 10], [x + 8, y + 17], [x - 8, y + 17]], '#7f5539');
  line(ctx, x, y + 10, x, y - 14, '#3a506b', 2);
  poly(ctx, [[x + 1, y - 14], [x + 1, y + 8], [x + 12, y + 8]], sail);
  poly(ctx, [[x - 1, y - 10], [x - 1, y + 8], [x - 10, y + 8]], '#ffd166');
}

function umbrella(ctx, x, y, color, tilt) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  line(ctx, 0, 0, 0, 34, '#7f5539', 3);
  poly(ctx, [[-24, 0], [24, 0], [0, -16]], color);
  ctx.restore();
}

function table(ctx, x, y) {
  rect(ctx, x - 17, y, 34, 4, '#ffffff');
  line(ctx, x, y + 4, x, y + 16, '#8d99ae', 3);
}

function chair(ctx, x, y, color) {
  rect(ctx, x, y - 12, 4, 16, color);
  rect(ctx, x, y - 2, 14, 4, color);
  rect(ctx, x + 11, y - 2, 3, 12, color);
}

// ---------------------------------------------------------------- night market
function paintMarket(ctx, mods) {
  ctx.fillStyle = vgrad(ctx, 0, 210, [[0, '#1d3557'], [1, '#6d597a']]);
  ctx.fillRect(0, 0, 400, 210);
  rect(ctx, 0, 210, 400, 90, '#4a3b47');

  // stars and moon
  const stars = [[30, 30], [88, 18], [150, 34], [210, 16], [262, 30], [330, 24], [372, 44], [120, 56], [292, 52]];
  for (const [x, y] of stars) {
    if (mods.has('star-gone') && x > 300) continue;
    circle(ctx, x, y, 1.6, '#ffeedd');
  }
  if (mods.has('moon-full')) {
    circle(ctx, 56, 52, 15, '#ffeeb9');
  } else {
    circle(ctx, 56, 52, 15, '#ffeeb9');
    circle(ctx, 63, 47, 13, '#27395c');
  }

  // lantern string across the top
  const lanternColors = ['#ff5d8f', '#ffd166', '#06d6a0', '#4cc9f0', '#ff8fa3', '#ffd166', '#06d6a0', '#ff5d8f'];
  for (let i = 0; i < 8; i++) {
    const x = 36 + i * 47;
    const y = 66 + Math.sin(i * 1.1) * 5;
    line(ctx, x - 24, y - 10, x, y, '#0f2537', 1.5);
    line(ctx, x, y, x + 24, y - 10, '#0f2537', 1.5);
    if (mods.has('lantern-gone') && i === 5) continue;
    let color = lanternColors[i];
    if (mods.has('lantern-color') && i === 3) color = '#ffd166';
    circle(ctx, x, y + 4, 10, color);
    circle(ctx, x, y + 4, 14, 'rgba(255,220,150,0.18)');
    line(ctx, x, y + 14, x, y + 19, '#ffd166', 1.5);
  }

  // three stalls
  stall(ctx, 30, 150, mods.has('stall-stripe') ? '#4361ee' : '#e63946', '#ffffff');
  stall(ctx, 155, 150, '#ffb703', '#ffffff');
  stall(ctx, 280, 150, '#2a9d8f', '#ffffff');

  // fruit crates under the left stall: five apples, or four
  rect(ctx, 44, 216, 66, 22, '#9c6644');
  const apples = [[56, 214], [72, 212], [88, 214], [64, 222], [82, 222]];
  apples.forEach(([x, y], idx) => {
    if (mods.has('fruit-count') && idx === 4) return;
    circle(ctx, x, y, 6, '#ef476f');
    line(ctx, x, y - 6, x + 2, y - 10, '#606c38', 1.6);
  });
  // jars on the middle counter: three, or two
  rect(ctx, 168, 190, 16, 20, '#ffd166');
  rect(ctx, 190, 190, 16, 20, '#06d6a0');
  if (!mods.has('jar-gone')) rect(ctx, 212, 190, 16, 20, '#ff8fa3');
  // hanging banner on the right stall: fish icon, or a star
  rect(ctx, 316, 108, 34, 30, '#f4f1de');
  if (mods.has('banner-icon')) {
    poly(ctx, [[333, 114], [336, 120], [342, 120], [337, 124], [339, 130], [333, 126], [327, 130], [329, 124], [324, 120], [330, 120]], '#e63946');
  } else {
    poly(ctx, [[322, 123], [338, 118], [338, 128], [322, 123]], '#4361ee');
    poly(ctx, [[338, 118], [346, 113], [344, 123], [346, 133], [338, 128]], '#4361ee');
  }

  // bicycle leaning at the right
  ctx.strokeStyle = '#ced4da';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(330, 252, 15, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(372, 252, 15, 0, Math.PI * 2); ctx.stroke();
  line(ctx, 330, 252, 350, 228, '#ced4da', 2.5);
  line(ctx, 350, 228, 372, 252, '#ced4da', 2.5);
  line(ctx, 350, 228, 344, 224, '#ced4da', 2.5);
  if (mods.has('bike-basket')) {
    poly(ctx, [[356, 222], [372, 222], [368, 234], [359, 234]], '#ffb703');
  }

  // ground lantern, lit or dark
  rect(ctx, 52, 246, 18, 24, '#3a506b');
  if (mods.has('glow-off')) {
    rect(ctx, 56, 251, 10, 12, '#495057');
  } else {
    rect(ctx, 56, 251, 10, 12, '#ffd166');
    circle(ctx, 61, 257, 15, 'rgba(255,209,102,0.22)');
  }
}

function stall(ctx, x, y, stripe, plain) {
  for (let i = 0; i < 5; i++) {
    poly(ctx, [[x + i * 22, y], [x + i * 22 + 22, y], [x + i * 22 + 26, y - 18], [x + i * 22 + 4, y - 18]],
      i % 2 ? plain : stripe);
  }
  rect(ctx, x + 4, y, 5, 62, '#7f5539');
  rect(ctx, x + 103, y, 5, 62, '#7f5539');
  rect(ctx, x, y + 34, 112, 8, '#9c6644');
  rect(ctx, x, y + 42, 112, 26, '#6f4518');
}

// ---------------------------------------------------------------- mountain cabin
function paintCabin(ctx, mods) {
  ctx.fillStyle = vgrad(ctx, 0, 170, [[0, '#bfe6f5'], [1, '#eefaf1']]);
  ctx.fillRect(0, 0, 400, 170);
  // distant snowy peaks
  poly(ctx, [[-10, 170], [80, 62], [170, 170]], '#90a4b8');
  poly(ctx, [[62, 84], [80, 62], [98, 84], [88, 78], [80, 86], [70, 78]], '#ffffff');
  poly(ctx, [[120, 170], [230, 48], [330, 170]], '#7d93a8');
  poly(ctx, [[208, 70], [230, 48], [252, 70], [240, 62], [230, 74], [218, 62]], '#ffffff');
  // meadow and lake
  rect(ctx, 0, 170, 400, 62, '#7fb069');
  ctx.fillStyle = vgrad(ctx, 232, 300, [[0, '#8fd0dd'], [1, '#5fb4c9']]);
  ctx.fillRect(0, 232, 400, 68);
  for (let i = 0; i < 6; i++) {
    if (mods.has('reflection') && i === 3) continue;
    line(ctx, 30 + i * 62, 252 + (i % 3) * 13, 66 + i * 62, 252 + (i % 3) * 13, '#dff7fb', 2.5);
  }

  // pines framing the scene
  pine(ctx, 26, 150, 64);
  pine(ctx, 356, 146, 72);
  if (mods.has('tree-swap')) {
    circle(ctx, 96, 158, 17, '#588157');
    line(ctx, 96, 172, 96, 186, '#7f5539', 4);
  } else {
    pine(ctx, 96, 158, 44);
  }
  pine(ctx, 316, 168, 40);

  // birds
  gull(ctx, 120, 46);
  gull(ctx, 150, 58);
  if (mods.has('bird-extra')) gull(ctx, 96, 34);

  // cabin
  rect(ctx, 168, 138, 118, 76, '#a98467');
  for (let i = 0; i < 5; i++) line(ctx, 168, 152 + i * 15, 286, 152 + i * 15, '#7f5539', 2);
  poly(ctx, [[156, 140], [298, 140], [262, 106], [192, 106]], '#6f4518');
  if (!mods.has('snowcap')) {
    poly(ctx, [[192, 106], [262, 106], [276, 118], [180, 118]], '#ffffff');
  }
  rect(ctx, 238, 84, 14, 28, '#8d6e63');
  if (!mods.has('smoke-gone')) {
    circle(ctx, 245, 72, 6, 'rgba(240,240,240,0.85)');
    circle(ctx, 252, 58, 8.5, 'rgba(240,240,240,0.7)');
    circle(ctx, 262, 42, 11, 'rgba(240,240,240,0.5)');
  }
  rect(ctx, 216, 168, 24, 46, mods.has('door-color') ? '#a63d40' : '#5f4330');
  circle(ctx, 234, 192, 2.2, '#ffd166');
  // window: lamplit or dark
  if (mods.has('window-dark')) {
    rect(ctx, 182, 158, 22, 22, '#33424f');
  } else {
    rect(ctx, 182, 158, 22, 22, '#ffd166');
  }
  rect(ctx, 182, 158, 22, 3, '#5f4330');
  line(ctx, 193, 158, 193, 180, '#5f4330', 2.5);
  // door lantern: gold, or red
  line(ctx, 262, 160, 262, 168, '#3a2e25', 2);
  circle(ctx, 262, 174, 5.5, mods.has('lantern-color') ? '#e63946' : '#ffd166');

  // wood pile
  const logs = [[318, 226], [332, 226], [325, 214], [318, 240], [332, 240], [325, 252]];
  logs.forEach(([x, y], idx) => {
    if (mods.has('woodpile') && idx === 2) return;
    circle(ctx, x, y, 7, '#b08968');
    circle(ctx, x, y, 3.4, '#ddb892');
  });

  // deer at the left edge: both antlers, or one
  rect(ctx, 44, 200, 30, 17, '#b08968');
  circle(ctx, 76, 194, 8, '#b08968');
  line(ctx, 50, 216, 48, 230, '#8d6e63', 3.4);
  line(ctx, 68, 216, 70, 230, '#8d6e63', 3.4);
  line(ctx, 78, 188, 84, 178, '#8d6e63', 2.2);
  if (!mods.has('deer-antler')) line(ctx, 74, 187, 70, 177, '#8d6e63', 2.2);

  // stepping stones to the lake
  const stones = [[188, 224], [205, 236], [196, 252], [214, 264]];
  stones.forEach(([x, y], idx) => {
    if (mods.has('path-stones') && idx === 1) return;
    poly(ctx, [[x - 9, y], [x + 9, y], [x + 6, y + 7], [x - 6, y + 7]], '#adb5bd');
  });
}

function pine(ctx, x, y, h) {
  line(ctx, x, y, x, y + 12, '#7f5539', 4);
  poly(ctx, [[x - h * 0.28, y + 4], [x + h * 0.28, y + 4], [x, y - h * 0.55]], '#2d6a4f');
  poly(ctx, [[x - h * 0.22, y - h * 0.22], [x + h * 0.22, y - h * 0.22], [x, y - h * 0.78]], '#40916c');
  poly(ctx, [[x - h * 0.15, y - h * 0.45], [x + h * 0.15, y - h * 0.45], [x, y - h]], '#52b788');
}

// ---------------------------------------------------------------- the catalogue
// x, y: marker centre in design space. r: click radius. subtlety: 1 obvious,
// 2 medium, 3 sneaky. Levels draw from the bands in order.
export const SCENES = [
  {
    id: 'harbour',
    title: 'Harbour Café',
    paint: paintHarbour,
    diffs: [
      { id: 'awning-teal', x: 175, y: 125, r: 30, subtlety: 1, label: 'awning stripes changed colour' },
      { id: 'lamp-lit', x: 345, y: 133, r: 17, subtlety: 1, label: 'lighthouse lamp lit' },
      { id: 'chair-color', x: 272, y: 210, r: 16, subtlety: 1, label: 'chair changed colour' },
      { id: 'sun-big', x: 52, y: 48, r: 28, subtlety: 2, label: 'a bigger sun' },
      { id: 'cloud-gone', x: 168, y: 32, r: 22, subtlety: 2, label: 'a cloud vanished' },
      { id: 'cup-gone', x: 246, y: 200, r: 13, subtlety: 2, label: 'a cup vanished' },
      { id: 'boat-moved', x: 55, y: 178, r: 22, subtlety: 2, label: 'a boat drifted' },
      { id: 'window-shut', x: 227, y: 153, r: 17, subtlety: 2, label: 'shutters closed' },
      { id: 'sign-shape', x: 175, y: 93, r: 15, subtlety: 3, label: 'the sign changed shape' },
      { id: 'cat-tail', x: 158, y: 238, r: 15, subtlety: 3, label: "the cat's tail dropped" },
      { id: 'extra-gull', x: 262, y: 60, r: 13, subtlety: 3, label: 'an extra gull' },
      { id: 'umbrella-tilt', x: 128, y: 168, r: 24, subtlety: 3, label: 'an umbrella tilted' },
    ],
  },
  {
    id: 'market',
    title: 'Night Market',
    paint: paintMarket,
    diffs: [
      { id: 'lantern-color', x: 177, y: 70, r: 16, subtlety: 1, label: 'a lantern changed colour' },
      { id: 'stall-stripe', x: 85, y: 141, r: 30, subtlety: 1, label: 'canopy stripes changed colour' },
      { id: 'glow-off', x: 61, y: 258, r: 16, subtlety: 1, label: 'the ground lantern went out' },
      { id: 'moon-full', x: 56, y: 52, r: 18, subtlety: 2, label: 'the moon filled out' },
      { id: 'lantern-gone', x: 271, y: 70, r: 16, subtlety: 2, label: 'a lantern is missing' },
      { id: 'banner-icon', x: 333, y: 123, r: 17, subtlety: 2, label: 'the banner sign changed' },
      { id: 'bike-basket', x: 364, y: 228, r: 14, subtlety: 2, label: 'the bicycle gained a basket' },
      { id: 'fruit-count', x: 82, y: 222, r: 13, subtlety: 3, label: 'an apple is missing' },
      { id: 'jar-gone', x: 220, y: 200, r: 13, subtlety: 3, label: 'a jar vanished' },
      { id: 'star-gone', x: 345, y: 30, r: 26, subtlety: 3, label: 'stars went out' },
    ],
  },
  {
    id: 'cabin',
    title: 'Mountain Cabin',
    paint: paintCabin,
    diffs: [
      { id: 'smoke-gone', x: 252, y: 58, r: 20, subtlety: 1, label: 'the chimney smoke stopped' },
      { id: 'window-dark', x: 193, y: 169, r: 15, subtlety: 1, label: 'the window went dark' },
      { id: 'door-color', x: 228, y: 191, r: 16, subtlety: 1, label: 'the cabin door changed colour' },
      { id: 'snowcap', x: 227, y: 112, r: 30, subtlety: 2, label: 'snow slid off the roof' },
      { id: 'woodpile', x: 325, y: 214, r: 14, subtlety: 2, label: 'a log is missing' },
      { id: 'lantern-color', x: 262, y: 174, r: 12, subtlety: 2, label: 'the door lantern changed colour' },
      { id: 'tree-swap', x: 96, y: 162, r: 20, subtlety: 2, label: 'a pine became a round tree' },
      { id: 'deer-antler', x: 76, y: 184, r: 14, subtlety: 3, label: 'the deer lost an antler' },
      { id: 'bird-extra', x: 96, y: 34, r: 12, subtlety: 3, label: 'an extra bird' },
      { id: 'reflection', x: 234, y: 252, r: 22, subtlety: 3, label: 'a lake shimmer vanished' },
      { id: 'path-stones', x: 205, y: 236, r: 12, subtlety: 3, label: 'a stepping stone vanished' },
    ],
  },
];

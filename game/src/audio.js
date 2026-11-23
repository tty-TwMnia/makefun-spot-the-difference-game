// audio.js — a tiny WebAudio synth: every sound is an oscillator blip the
// game makes itself, no audio files. Silent where WebAudio is unavailable.

let ctx = null;

function ac() {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  if (!ctx) ctx = new window.AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freqA, freqB, seconds, type = 'sine', gainPeak = 0.16, delay = 0) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqA, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqB, 1), t0 + seconds);
  gain.gain.setValueAtTime(gainPeak, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + seconds + 0.02);
}

export const sfx = {
  find() { blip(660, 990, 0.14, 'sine', 0.18); blip(990, 1320, 0.12, 'sine', 0.1, 0.05); },
  miss() { blip(180, 90, 0.18, 'square', 0.07); },
  hint() { blip(880, 880, 0.1, 'triangle', 0.12); blip(1174, 1174, 0.14, 'triangle', 0.12, 0.1); },
  win() { [523, 659, 784, 1046].forEach((f, i) => blip(f, f, 0.22, 'triangle', 0.14, i * 0.11)); },
  lose() { [392, 330, 262].forEach((f, i) => blip(f, f * 0.94, 0.24, 'triangle', 0.12, i * 0.13)); },
  click() { blip(440, 440, 0.05, 'sine', 0.06); },
};

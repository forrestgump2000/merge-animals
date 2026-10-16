// Tiny chiptune-style sound effects with WebAudio (no files needed).
let ctx = null;
let muted = false;
try { muted = localStorage.getItem('mergeAnimals.muted') === '1'; } catch {}

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('mergeAnimals.muted', muted ? '1' : '0'); } catch {}
  muted ? stopMusic() : startMusic();
  return muted;
}

function tone(freq, dur, type = 'square', vol = 0.08, when = 0, slideTo = null) {
  if (!ctx || muted) return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, vol = 0.1, freq = 1200, when = 0) {
  if (!ctx || muted) return;
  const t = ctx.currentTime + when;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = ctx.createBufferSource();
  s.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = vol;
  s.connect(f).connect(g).connect(ctx.destination);
  s.start(t);
}

export const sfx = {
  click: () => tone(660, 0.06, 'square', 0.05),
  splash: () => { noise(0.35, 0.18, 1800); tone(300, 0.2, 'sine', 0.06, 0, 120); },
  reel: () => tone(900 + Math.random() * 300, 0.03, 'square', 0.025),
  reveal: (tier) => [0, 4, 7, 12].slice(0, 2 + Math.min(2, tier)).forEach((n, i) => tone(440 * 2 ** (n / 12), 0.15, 'square', 0.06, i * 0.08)),
  whoosh: () => { tone(200, 1.2, 'sawtooth', 0.04, 0, 1400); noise(1.2, 0.06, 800); },
  boom: () => { noise(0.5, 0.25, 600); tone(110, 0.5, 'square', 0.08, 0, 40); [0, 4, 7, 12].forEach((n, i) => tone(523 * 2 ** (n / 12), 0.2, 'square', 0.05, 0.15 + i * 0.07)); },
  hit: () => { noise(0.12, 0.2, 2000); tone(220, 0.12, 'square', 0.07, 0, 90); },
  crit: () => { noise(0.2, 0.3, 3000); tone(440, 0.2, 'sawtooth', 0.08, 0, 80); },
  miss: () => tone(500, 0.15, 'triangle', 0.06, 0, 900),
  coin: () => { tone(988, 0.08, 'square', 0.05); tone(1319, 0.25, 'square', 0.05, 0.08); },
  win: () => [0, 4, 7, 12, 7, 12].forEach((n, i) => tone(523 * 2 ** (n / 12), 0.18, 'square', 0.06, i * 0.11)),
  lose: () => [7, 4, 0, -5].forEach((n, i) => tone(392 * 2 ** (n / 12), 0.25, 'triangle', 0.07, i * 0.18)),
  pop: () => tone(300, 0.15, 'square', 0.06, 0, 900),
  explode: () => { noise(0.8, 0.3, 900); tone(90, 0.6, 'square', 0.08, 0, 30); },
};

// ---------------- background music ----------------
// Gentle generated tunes (soft piano-like notes over slow chords), a bit like Minecraft's
// ambient music. The mood follows the background theme.
const MOODS = {
  calm: { root: 57, beat: 0.42, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [[0, 4, 7], [5, 9, 12], [-3, 0, 4], [7, 11, 14]], wave: 'triangle' },
  bright: { root: 60, beat: 0.32, scale: [0, 2, 4, 5, 7, 9, 12, 14, 16], chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 9]], wave: 'square' },
  dark: { root: 50, beat: 0.5, scale: [0, 3, 5, 7, 10, 12, 15], chords: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -2, 2]], wave: 'triangle' },
};
let musicOn = true;
try { musicOn = localStorage.getItem('mergeAnimals.music') !== '0'; } catch {}
let mood = 'calm';
let musicGain = null, timer = null, nextT = 0, step = 0, melodyIdx = 3;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
export const isMusicOn = () => musicOn;

function note(midi, t, dur, vol, type) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.value = mtof(midi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(musicGain);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function pad(midi, t, dur, vol) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = mtof(midi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.35);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(musicGain);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function playStep(t) {
  const m = MOODS[mood];
  const bar = Math.floor(step / 8) % m.chords.length, pos = step % 8;
  const chord = m.chords[bar];
  if (pos === 0) {
    for (const n of chord) pad(m.root + n, t, m.beat * 8.5, 0.035);
    note(m.root - 12 + chord[0], t, m.beat * 4, 0.07, 'sine');
  }
  if (pos === 4) note(m.root - 12 + chord[0] + 7, t, m.beat * 3, 0.04, 'sine');
  if (Math.random() < (pos % 2 === 0 ? 0.6 : 0.25)) {
    melodyIdx = Math.max(0, Math.min(m.scale.length - 1, melodyIdx + Math.round((Math.random() - 0.5) * 3)));
    note(m.root + 12 + m.scale[melodyIdx], t, m.beat * 3, 0.045, m.wave);
    if (Math.random() < 0.3) note(m.root + 24 + m.scale[melodyIdx], t, m.beat * 2, 0.015, 'sine');
  }
  step++;
}
export function startMusic() {
  if (!ctx || muted || !musicOn || timer) return;
  musicGain = ctx.createGain();
  musicGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 2);
  musicGain.connect(ctx.destination);
  nextT = ctx.currentTime + 0.1;
  timer = setInterval(() => {
    while (nextT < ctx.currentTime + 0.6) {
      playStep(nextT);
      nextT += MOODS[mood].beat;
    }
  }, 120);
}
export function stopMusic() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  const g = musicGain;
  g.gain.cancelScheduledValues(ctx.currentTime);
  g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
  setTimeout(() => g.disconnect(), 800);
}
export function setMusicOn(on) {
  musicOn = on;
  try { localStorage.setItem('mergeAnimals.music', on ? '1' : '0'); } catch {}
  on ? startMusic() : stopMusic();
}
export function setMood(m) {
  if (MOODS[m]) mood = m;
}

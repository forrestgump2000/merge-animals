import { VB, hash3, fibDirs } from './voxel.js';

export const RARITIES = [
  { id: 'common', name: 'Common', color: '#c8c8c8', value: 1 },
  { id: 'uncommon', name: 'Uncommon', color: '#55ff55', value: 2 },
  { id: 'rare', name: 'Rare', color: '#55a5ff', value: 4 },
  { id: 'epic', name: 'Epic', color: '#d35cff', value: 8 },
  { id: 'legendary', name: 'Legendary', color: '#ffaa00', value: 16 },
  { id: 'mythic', name: 'Mythic', color: '#ff4040', value: 32 },
];

const W = 0xffffff, K = 0x1a1a1a;
const belly = (top, bot, yb = 0) => (x, y) => (y < yb ? bot : top);
const mottle = (cols) => (x, y, z) => cols[Math.floor(hash3(x, y, Math.abs(z)) * cols.length)];
const mod = (a, n) => ((a % n) + n) % n;

export const FISH = [
  // ---------------- COMMON ----------------
  {
    id: 'bluegill', name: 'Bluegill', rarity: 0, hp: 24, atk: 5, spd: 6,
    eye: { x: 8, y: 2, size: 2 },
    build(v) {
      const top = 0x3f6b5a, mid = 0x6b8f5e, bot = 0xf0a838;
      const col = (x, y) => (y < -2 ? bot : mod(x, 5) === 0 ? 0x2f5246 : y > 2 ? top : mid);
      v.ellipsoid(0, 0, 0, 10, 7, 3.5, col);
      v.polyXY([[-9, 0], [-14, 5], [-13, 0], [-14, -5]], 0, 0, mid);
      v.polyXY([[5, 5], [1, 9], [-6, 9], [-9, 4]], 0, 0, top);
      v.polyXY([[-2, -5], [-6, -8], [-9, -4]], 0, 0, mid);
      v.polyXZ([[3, 1], [0, 6], [-2, 5], [1, 1]], -1, -1, mid, true);
      v.paint((p) => p.x >= 6 && p.y <= 0 && p.y >= -2 && Math.abs(p.z) >= 2, 0x4a7fb5);
      v.paint((p) => p.x >= 4 && p.x <= 5 && p.y >= 0 && p.y <= 1 && Math.abs(p.z) >= 2, 0x1b2a5a);
    },
  },
  {
    id: 'goldfish', name: 'Goldfish', rarity: 0, hp: 22, atk: 4, spd: 5,
    eye: { x: 6, y: 1, size: 2 },
    build(v) {
      const O = 0xf28c28, O2 = 0xffb347, L = 0xfff1d6;
      v.ellipsoid(0, 0, 0, 8, 6, 4.5, belly(O, O2, -2));
      v.ellipsoid(-6, 0, 0, 4, 3.5, 3, O);
      v.polyXY([[-8, 0], [-17, 9], [-14, 1], [-14, -1], [-17, -9]], -1, 1, (x) => (x < -14 ? L : O2));
      v.polyXY([[2, 5], [-1, 10], [-5, 8], [-5, 5]], 0, 0, O);
      v.polyXZ([[3, 1], [1, 6], [-1, 6], [1, 1]], -2, -2, O2, true);
    },
  },
  {
    id: 'tuna', name: 'Tuna', rarity: 0, hp: 26, atk: 6, spd: 9,
    eye: { x: 11, y: 1, size: 2 },
    build(v) {
      const top = 0x1f3b73, side = 0x8fa3b8, bot = 0xdfe6ec, Y = 0xf2c80f;
      const col = (x, y) => (y > 1 ? top : y < -1 ? bot : side);
      v.ellipsoid(0, 0, 0, 14, 5, 4, col);
      v.ellipsoid(-12, 0, 0, 4, 1.6, 1.6, col);
      v.polyXY([[-14, 0], [-19, 8], [-17, 1], [-17, -1], [-19, -8]], 0, 0, top);
      v.polyXY([[3, 4], [0, 8], [-3, 4]], 0, 0, top);
      v.polyXY([[-4, 3], [-6, 7], [-7, 3]], 0, 0, Y);
      v.polyXY([[-4, -3], [-6, -7], [-7, -3]], 0, 0, Y);
      for (let x = -8; x >= -12; x -= 2) {
        const e = Math.round(5 * Math.sqrt(Math.max(0, 1 - (x / 14) ** 2)));
        v.set(x, e + 1, 0, Y);
        v.set(x, -e - 1, 0, Y);
      }
      v.polyXZ([[5, 2], [0, 7], [-1, 6], [2, 2]], 0, 0, side, true);
    },
  },
  {
    id: 'halibut', name: 'Halibut', rarity: 0, hp: 28, atk: 4, spd: 4, tilt: 0.7,
    eye: { mode: 'top', x: 7, z: 2, size: 2 },
    build(v) {
      const col = (x, y, z) => (y < 0 ? 0xf2efe8 : hash3(x, y, z) < 0.25 ? 0x8a7558 : 0x6b5b45);
      v.ellipsoid(0, 0, 0, 13, 0.8, 9.5, col);
      v.ellipsoid(0, 0, 0, 11, 2.2, 7, col);
      v.ellipsoid(-11, 0, 0, 3, 1, 2, col);
      v.polyXZ([[-12, 0], [-17, 6], [-17, -6]], 0, 0, 0x6b5b45);
    },
  },
  {
    id: 'needlefish', name: 'Needlefish', rarity: 0, hp: 18, atk: 7, spd: 10,
    eye: { x: 8, y: 0, size: 2 },
    build(v) {
      const T = 0x2b8a8f;
      v.ellipsoid(0, 0, 0, 11, 2.6, 2, belly(T, 0xd8e4ea, -1));
      v.capsule(10, 0, 0, 19, 0, 0, 1.2, 0.6, 0x3a9ca0);
      v.capsule(10, -1, 0, 21, -1, 0, 0.9, 0.6, 0x9fb7bd);
      v.polyXY([[-10, 0], [-15, 4], [-13, 0], [-15, -4]], 0, 0, T);
      v.polyXY([[-4, 2], [-9, 5], [-9, 2]], 0, 0, T);
      v.polyXY([[-4, -2], [-9, -5], [-9, -2]], 0, 0, 0x9fb7bd);
      v.paint((p) => p.y === 0 && Math.abs(p.z) >= 1 && p.x < 8 && p.x > -10, 0x5fd3d8);
    },
  },
  {
    id: 'catfish', name: 'Catfish', rarity: 0, hp: 27, atk: 5, spd: 4,
    eye: { x: 10, y: 1, size: 1 },
    build(v) {
      const F = 0x5a5244;
      v.ellipsoid(0, 0, 0, 13, 4.5, 4.5, belly(0x6b6152, 0xd9cfb8, -2));
      v.ellipsoid(9, -0.5, 0, 5, 3.5, 5, belly(0x6b6152, 0xd9cfb8, -2));
      v.polyXY([[-12, 0], [-17, 5], [-18, 0], [-17, -5]], 0, 0, F);
      v.polyXY([[3, 4], [1, 8], [-1, 4]], 0, 0, F);
      v.polyXY([[-2, -3], [-11, -6], [-12, -3]], 0, 0, F);
      v.polyXZ([[5, 3], [2, 8], [0, 7], [2, 3]], -2, -2, F, true);
      for (const s of [1, -1]) {
        v.capsule(13, 0, 2 * s, 19, -2, 6 * s, 0.6, 0.5, 0x3d362c);
        v.capsule(13, -2, 1 * s, 16, -6, 2 * s, 0.6, 0.5, 0x3d362c);
      }
    },
  },
  {
    id: 'koi', name: 'Koi', rarity: 0, hp: 25, atk: 5, spd: 6,
    eye: { x: 8, y: 1, size: 2 },
    build(v) {
      const col = (x, y, z) => (hash3(Math.floor(x / 4), Math.floor(y / 3), Math.floor(Math.abs(z) / 3)) < 0.45 ? 0xff5a1f
        : hash3(x, y, Math.abs(z)) < 0.04 ? 0x1a1a1a : 0xfaf6ef);
      v.ellipsoid(0, 0, 0, 11, 5, 4, col);
      v.polyXY([[-10, 0], [-17, 6], [-15, 0], [-17, -6]], 0, 0, 0xffe0cc);
      v.polyXY([[4, 4], [1, 7], [-6, 6], [-7, 4]], 0, 0, 0xfaf6ef);
      v.polyXZ([[4, 2], [1, 7], [-1, 6], [1, 2]], -2, -2, 0xfaf6ef, true);
      for (const s of [1, -1]) v.capsule(10, -2, s, 13, -3, 2 * s, 0.5, 0.5, 0xff8a5b);
    },
  },
  // ---------------- UNCOMMON ----------------
  {
    id: 'clownfish', name: 'Clownfish', rarity: 1, hp: 32, atk: 7, spd: 7,
    eye: { x: 7, y: 1, size: 2 },
    build(v) {
      const O = 0xff7b1c;
      v.ellipsoid(0, 0, 0, 10, 6, 4, O);
      v.polyXY([[-8, 0], [-14, 5], [-15, 0], [-14, -5]], 0, 0, O);
      v.polyXY([[3, 5], [0, 8], [-6, 7], [-8, 4]], 0, 0, O);
      v.polyXY([[-2, -5], [-5, -8], [-8, -6], [-7, -4]], 0, 0, O);
      v.polyXZ([[4, 2], [1, 7], [-1, 6], [1, 2]], -1, -1, O, true);
      for (const [c, w] of [[4, 1], [-2, 1], [-10, 0]]) {
        v.paint((p) => Math.abs(p.x - c) === w + 1, K);
        v.paint((p) => Math.abs(p.x - c) <= w, W);
      }
      v.paint((p) => p.z === 0 && (Math.abs(p.y) >= 7 || p.x <= -14), K);
    },
  },
  {
    id: 'angelfish', name: 'Angelfish', rarity: 1, hp: 30, atk: 7, spd: 8,
    eye: { x: 5, y: 1, size: 2 },
    build(v) {
      const Y = 0xffd23f, B = 0x2b59c3;
      v.ellipsoid(0, 0, 0, 7, 7, 2.5, Y);
      v.polyXY([[3, 5], [0, 8], [-9, 17], [-7, 6], [-5, 4]], 0, 0, Y);
      v.polyXY([[3, -5], [0, -8], [-9, -17], [-7, -6], [-5, -4]], 0, 0, Y);
      v.polyXY([[-6, 0], [-11, 5], [-12, 4], [-12, -4], [-11, -5]], 0, 0, Y);
      v.polyXZ([[2, 1], [0, 4], [-2, 4], [0, 1]], -1, -1, Y, true);
      v.paint((p) => [3, 4, -2, -3, -8].includes(p.x) || Math.abs(p.y) >= 12 || p.x <= -12, B);
    },
  },
  {
    id: 'parrotfish', name: 'Parrotfish', rarity: 1, hp: 34, atk: 7, spd: 6,
    eye: { x: 7, y: 2, size: 2 },
    build(v) {
      const T = 0x2ec4b6, T2 = 0x1a9e92, P = 0xff6fa8;
      const col = (x, y) => (y < -3 ? P : mod(Math.floor(x / 2) + Math.floor(y / 2), 2) ? T : T2);
      v.ellipsoid(0, 0, 0, 11, 6, 4, col);
      v.ellipsoid(10, -1, 0, 3, 2.2, 2, 0xf3e9d2);
      v.paint((p) => p.x >= 11 && p.y === -1, 0xb8a98a);
      v.polyXY([[-10, 0], [-16, 6], [-14, 0], [-16, -6]], 0, 0, P);
      v.polyXY([[6, 5], [3, 8], [-8, 7], [-9, 4]], 0, 0, P);
      v.polyXY([[-2, -5], [-5, -7], [-9, -4]], 0, 0, P);
      v.polyXZ([[3, 1], [0, 6], [-2, 5], [1, 1]], -1, -1, P, true);
      v.paint((p) => p.x >= 5 && p.x <= 8 && p.y >= 0 && p.y <= 1 && Math.abs(p.z) >= 2, P);
    },
  },
  {
    id: 'boxfish', name: 'Boxfish', rarity: 1, hp: 40, atk: 5, spd: 4,
    eye: { x: 4, y: 2, size: 2 },
    build(v) {
      const Y = 0xffd60a;
      const s = (a) => mod(a, 3) === 1;
      const col = (x, y, z) => ((s(x) && s(y)) || (s(x) && s(z) && Math.abs(y) >= 5) ? 0x222222 : Y);
      v.box(-6, -5, -4, 6, 5, 4, col);
      v.removeIf((p) => (Math.abs(p.y) === 5) + (Math.abs(p.z) === 4) + (Math.abs(p.x) === 6) >= 2);
      v.box(-9, -2, -1, -7, 2, 1, Y);
      v.polyXY([[-9, 0], [-13, 4], [-13, -4]], 0, 0, Y);
      v.box(7, -2, -1, 8, -1, 1, 0xff8c42);
      v.polyXZ([[3, 4], [1, 7], [-1, 7], [0, 4]], -1, -1, Y, true);
      v.polyXY([[-2, 5], [-4, 7], [-5, 5]], 0, 0, Y);
    },
  },
  {
    id: 'eel', name: 'Eel', rarity: 1, hp: 30, atk: 9, spd: 8,
    eye: { x: 13, y: 0, size: 2, pupil: 0x111111, white: 0xf5e663 },
    build(v) {
      const G = 0x4f7f2a, G2 = 0x2f4f18;
      const col = (x, y, z) => (hash3(x, y, z) < 0.25 ? G2 : G);
      const yy = (x) => Math.sin(x * 0.3) * 2.5;
      for (let x = 12; x >= -18; x -= 0.5) {
        const r = x > 8 ? 2.8 : Math.max(0.7, 2.6 * Math.min(1, (x + 19) / 20));
        v.ellipsoid(x, yy(x), 0, 1, r, r * 0.8, col);
        v.set(x, Math.round(yy(x) + r) + 1, 0, G2);
      }
      const yh = Math.round(yy(12));
      v.ellipsoid(12, yh, 0, 4, 3, 2.6, col);
      v.box(14, yh - 2, -1, 16, yh - 1, 1, 0x5a1a1a);
      v.removeIf((p) => p.x >= 15 && p.y === yh - 1 && Math.abs(p.z) <= 1);
      v.set(15, yh - 1, 1, W); v.set(15, yh - 1, -1, W);
    },
  },
  {
    id: 'urchin', name: 'Sea Urchin', rarity: 1, hp: 36, atk: 6, spd: 2,
    eye: { x: 5, y: 1, size: 2 },
    build(v) {
      v.ellipsoid(0, 0, 0, 6, 6, 6, (x, y, z) => (hash3(x, y, z) < 0.2 ? 0x6a2c8a : 0x4b1d5e));
      for (const [dx, dy, dz] of fibDirs(64)) {
        v.capsule(dx * 5, dy * 5, dz * 5, dx * 11.5, dy * 11.5, dz * 11.5, 0.7, 0.45,
          (x, y, z) => (x * x + y * y + z * z > 81 ? 0xc89be0 : 0x7a3a9a));
      }
    },
  },
  {
    id: 'piranha', name: 'Piranha', rarity: 1, hp: 28, atk: 10, spd: 8,
    eye: { x: 6, y: 2, size: 2, white: 0xffe08a },
    build(v) {
      const col = (x, y, z) => (y < -1 ? 0xd62828 : hash3(x, y, z) < 0.1 ? 0xb8c4cf : 0x7d8a96);
      v.ellipsoid(0, 0, 0, 9, 6.5, 3.5, col);
      v.polyXY([[-8, 0], [-13, 5], [-12, 0], [-13, -5]], 0, 0, 0x4a535c);
      v.polyXY([[1, 6], [-2, 9], [-5, 6]], 0, 0, 0x4a535c);
      v.polyXY([[-2, -6], [-5, -8], [-7, -5]], 0, 0, 0xd62828);
      v.box(8, -4, -2, 10, -2, 2, col);
      for (let z = -2; z <= 2; z++) v.set(10, -1, z, mod(z, 2) === 0 ? W : 0x3a0a0a);
      v.paint((p) => p.x === 9 && p.y === -1, 0x3a0a0a);
    },
  },
  {
    id: 'jellyfish', name: 'Jellyfish', rarity: 1, hp: 30, atk: 8, spd: 3,
    eye: { x: 4, y: 3, size: 2 },
    build(v) {
      v.ellipsoid(0, 2, 0, 7, 6, 7, (x, y, z) => (hash3(x, y, z) < 0.15 ? 0xffb3e6 : 0xf78fd0));
      v.ellipsoid(0, 1, 0, 8, 1, 8, 0xe86bbf);
      v.removeIf((p) => p.y < 1);
      v.chain([[0, 1, 0, 1.6], [1, -5, 0, 1.2], [-1, -9, 0, 1]], 0xff7ac8);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2, bx = Math.cos(a) * 5, bz = Math.sin(a) * 5, w = Math.sin(i * 1.7) * 1.5;
        v.chain([[bx, 0, bz, 0.6], [bx + w, -5, bz, 0.55], [bx, -10, bz, 0.5], [bx - w, -13, bz, 0.5]], 0xffc2ea);
        v.set(bx - w, -14, bz, 0xfff0ff, true);
      }
    },
  },
  {
    id: 'barracuda', name: 'Barracuda', rarity: 1, hp: 29, atk: 10, spd: 9,
    eye: { x: 12, y: 1, size: 2 },
    build(v) {
      const D = 0x4a5866;
      const col = (x, y) => (y < -1 ? 0xe8eef2 : mod(x, 4) === 0 && y >= 0 ? D : 0x9aaab8);
      v.ellipsoid(0, 0, 0, 15, 3.5, 3, col);
      v.capsule(13, 0, 0, 19, -0.5, 0, 2, 0.8, 0x8a9aa8);
      v.capsule(13, -1.5, 0, 19.5, -1.5, 0, 1.5, 0.6, 0xd0d8de);
      v.set(17, -1, 1, W); v.set(17, -1, -1, W); v.set(15, -1, 1, W); v.set(15, -1, -1, W);
      v.polyXY([[-14, 0], [-19, 6], [-17, 0], [-19, -6]], 0, 0, D);
      v.polyXY([[3, 3], [0, 7], [-2, 3]], 0, 0, D);
      v.polyXY([[-7, 3], [-9, 5], [-10, 3]], 0, 0, D);
    },
  },
  // ---------------- RARE ----------------
  {
    id: 'pufferfish', name: 'Pufferfish', rarity: 2, hp: 52, atk: 9, spd: 4,
    eye: { x: 6, y: 2, size: 2 },
    build(v) {
      const top = 0xd9b45a, bot = 0xf5ecd0;
      v.ellipsoid(0, 0, 0, 8, 7.5, 7, (x, y, z) => (y < -1 ? bot : hash3(x, y, z) < 0.12 ? 0x7a5a2a : top));
      for (const [dx, dy, dz] of fibDirs(46)) {
        v.capsule(dx * 6.5, dy * 6, dz * 5.8, dx * 10, dy * 9.5, dz * 9, 0.6, 0.5, 0xf2e2b0);
      }
      v.polyXY([[-7, 0], [-12, 4], [-12, -4]], 0, 0, top);
      v.polyXY([[-1, 7], [-4, 9], [-5, 7]], 0, 0, top);
      v.box(8, -2, -1, 9, -1, 1, 0xb07a3a);
    },
  },
  {
    id: 'seahorse', name: 'Seahorse', rarity: 2, hp: 42, atk: 10, spd: 7,
    eye: { x: 4, y: 11, size: 2 },
    build(v) {
      const O = 0xf4a259, O2 = 0xd9822b;
      const col = (x, y) => (mod(y, 2) === 0 ? O : O2);
      v.chain([[1, 9, 0, 2.6], [0, 6, 0, 3.2], [1.5, 2, 0, 3.6], [1, -2, 0, 3.2], [-1, -5, 0, 2.4],
        [-2, -9, 0, 1.8], [0, -12, 0, 1.4], [3, -12, 0, 1.2], [5, -10, 0, 1], [4, -8, 0, 0.9], [2, -8.5, 0, 0.7]], col);
      v.ellipsoid(2, 11, 0, 3.5, 2.8, 2.4, col);
      v.capsule(4, 11, 0, 10, 10, 0, 1.2, 1.0, O);
      v.capsule(1, 13, 0, 0, 16, 0, 0.8, 0.6, O2);
      v.polyXY([[-2, 2], [-6, 4], [-6, -1], [-2, -1]], 0, 0, 0xffd29a);
      v.paint((p) => p.x >= 3 && p.y < 5 && p.y > -3, 0xf8c48a);
    },
  },
  {
    id: 'stingray', name: 'Stingray', rarity: 2, hp: 46, atk: 11, spd: 8, tilt: 0.6,
    eye: { mode: 'top', x: 5, z: 2, size: 2 },
    build(v) {
      const col = (x, y, z) => (y < 0 ? 0xefe9e2 : hash3(x, y, z) < 0.12 ? 0x5b4f47 : 0x7d6e63);
      v.polyXZ([[9, 0], [3, 8], [-1, 14], [-4, 12], [-8, 0], [-4, -12], [-1, -14], [3, -8]], 0, 0, col);
      v.polyXZ([[7, 0], [2, 6], [-2, 9], [-6, 0], [-2, -9], [2, -6]], -1, 1, col);
      v.ellipsoid(1, 0, 0, 7, 2, 4, col);
      v.capsule(-7, 0, 0, -24, 0, 0, 0.9, 0.5, 0x5b4f47);
      v.capsule(-12, 0, 0, -15, 1, 0, 0.6, 0.5, 0xd8cbb8);
    },
  },
  {
    id: 'stonefish', name: 'Stonefish', rarity: 2, hp: 50, atk: 10, spd: 3,
    eye: { x: 6, y: 3, size: 2, white: 0xffd27a },
    build(v) {
      const m = mottle([0x6b5a4a, 0x8a7560, 0x4f4338, 0x9c6644, 0x7a6a55]);
      v.ellipsoid(0, 0, 0, 10, 5, 5.5, m);
      v.ellipsoid(-8, -1, 0, 4, 3, 3, m);
      v.polyXY([[-10, -1], [-14, 3], [-14, -4]], 0, 0, m);
      for (let i = 0; i < 12; i++) {
        const x = Math.round(v.rng() * 14 - 7), z = Math.round(v.rng() * 6 - 3);
        v.ellipsoid(x, 3, z, 1.6, 1.6, 1.6, m);
        v.ellipsoid(x, 3, -z, 1.6, 1.6, 1.6, m);
      }
      for (let x = 6; x >= -6; x -= 2) v.capsule(x, 4, 0, x - 1, 8 - Math.abs(x) * 0.2, 0, 0.6, 0.5, 0xa0522d);
      v.box(9, 1, -2, 10, 1, 2, 0x3a2a20);
    },
  },
  {
    id: 'sunfish', name: 'Sunfish', rarity: 2, hp: 58, atk: 8, spd: 3,
    eye: { x: 5, y: 2, size: 2 },
    build(v) {
      const G = 0x9aa5b1, G2 = 0xc4ccd5, G3 = 0x7d8894;
      v.ellipsoid(0, 0, 0, 9, 9, 3, (x, y, z) => (y < -4 ? G2 : hash3(x, y, z) < 0.1 ? G3 : G));
      v.polyXY([[-2, 7], [1, 7], [-4, 20], [-7, 19]], 0, 0, G);
      v.polyXY([[-2, -7], [1, -7], [-4, -20], [-7, -19]], 0, 0, G2);
      v.ellipsoid(-9, 0, 0, 2.5, 8, 1.5, G3);
      v.paint((p) => p.x <= -10 && mod(p.y, 3) === 0, G2);
      v.paint((p) => p.x >= 8 && p.y === -1 && Math.abs(p.z) <= 1, 0x4a4f55);
    },
  },
  {
    id: 'lionfish', name: 'Lionfish', rarity: 2, hp: 44, atk: 12, spd: 6,
    eye: { x: 7, y: 2, size: 2, white: 0xffe0a0 },
    build(v) {
      const R = 0xc8321e, Wh = 0xfff2e6;
      v.ellipsoid(0, 0, 0, 9, 5.5, 3.5, (x) => (mod(x, 3) === 0 ? Wh : R));
      const stripe = (x, y) => (mod(y, 2) === 0 ? Wh : R);
      for (let i = 0; i < 8; i++) {
        const x = 5 - i * 1.6;
        v.capsule(x, 4, 0, x - 2, 13 - i * 0.6, 0, 0.55, 0.5, stripe);
      }
      for (let k = 0; k < 6; k++)
        for (const s of [1, -1]) v.capsule(3, -1, 3 * s, 3 - k * 2, -7 + k * 0.8, 9 * s, 0.55, 0.5, stripe);
      v.polyXY([[-8, 0], [-13, 4], [-13, -4]], 0, 0, 0xf2c0b0);
    },
  },
  {
    id: 'swordfish', name: 'Swordfish', rarity: 2, hp: 48, atk: 13, spd: 10,
    eye: { x: 10, y: 1, size: 2 },
    build(v) {
      const D = 0x2a3366, col = belly(0x34407a, 0xcfd6e0, -1);
      v.ellipsoid(0, 0, 0, 14, 5, 4, col);
      v.ellipsoid(-12, 0, 0, 3, 1.6, 1.6, col);
      v.capsule(13, 0.5, 0, 28, 0, 0, 1.4, 0.5, 0x5a5f80);
      v.polyXY([[6, 4], [4, 12], [1, 11], [-1, 4]], 0, 0, D);
      v.polyXY([[-14, 0], [-20, 9], [-17, 0], [-20, -9]], 0, 0, D);
      v.polyXZ([[5, 2], [0, 8], [-1, 7], [2, 2]], -3, -3, D, true);
    },
  },
  // ---------------- EPIC ----------------
  {
    id: 'anglerfish', name: 'Anglerfish', rarity: 3, hp: 64, atk: 14, spd: 5,
    eye: { x: 5, y: 3, size: 2, white: 0xfff8c0 },
    build(v) {
      const m = mottle([0x3a2e2b, 0x3a2e2b, 0x4d3c36]);
      v.ellipsoid(0, 0, 0, 9, 7, 6, m);
      v.ellipsoid(-8, 0, 0, 4, 3, 2.5, m);
      v.polyXY([[-10, 0], [-15, 5], [-15, -5]], 0, 0, 0x3a2e2b);
      v.polyXY([[-2, 6], [-6, 9], [-8, 5]], 0, 0, 0x3a2e2b);
      v.paint((p) => p.x >= 4 && p.y <= 0 && p.y >= -4 && Math.abs(p.z) <= 4, 0x3a0a0a);
      v.removeIf((p) => p.x >= 7 && p.y <= -1 && p.y >= -3 && Math.abs(p.z) <= 3);
      for (let z = -3; z <= 3; z++) v.set(8, mod(z, 2) === 0 ? -1 : -3, z, W);
      v.chain([[2, 6.5, 0, 0.6], [4, 10, 0, 0.6], [8, 12, 0, 0.6], [11, 11, 0, 0.6], [12, 9.5, 0, 0.6]], 0x5a4a40);
      v.ellipsoid(12, 8, 0, 1.5, 1.5, 1.5, 0xfff27a, { glow: true });
    },
  },
  {
    id: 'blobfish', name: 'Blobfish', rarity: 3, hp: 76, atk: 11, spd: 2,
    eye: { x: 6, y: 2, size: 1 },
    build(v) {
      const P = 0xf2a7b8, P2 = 0xe58aa0;
      v.ellipsoid(1, -1, 0, 8, 5, 6.5, P);
      v.ellipsoid(1, 1, 0, 7, 5, 5, P);
      v.ellipsoid(-6, -1, 0, 5, 3.5, 3.5, P);
      v.polyXY([[-9, -1], [-13, 2], [-13, -4]], 0, 0, P2);
      v.ellipsoid(9, -1, 0, 2.5, 3, 2.5, P2);
      v.paint((p) => p.y === -4 && p.x >= 8, 0xa84863);
      v.paint((p) => hash3(p.x, p.y, p.z) < 0.08, 0xf7c3cf);
    },
  },
  {
    id: 'oarfish', name: 'Oarfish', rarity: 3, hp: 66, atk: 13, spd: 7,
    eye: { x: 16, y: -1, size: 1 },
    build(v) {
      const S = 0xd7dee6, R = 0xe2333a;
      const col = (x, y, z) => (hash3(x, y, z) < 0.15 ? 0x8a97a6 : S);
      const yy = (x) => Math.sin(x * 0.22) * 2.5;
      for (let x = 17; x >= -20; x -= 0.5) {
        const r = x < -12 ? Math.max(0.6, (1.8 * (x + 21)) / 9) : x > 12 ? 2.2 : 1.8;
        v.ellipsoid(x, yy(x), 0, 1, Math.max(r * 1.4, 0.6), Math.max(r * 0.7, 0.5), col);
        v.set(x, Math.round(yy(x) + r * 1.4) + 1, 0, R);
      }
      const h = yy(15);
      for (const [a, b] of [[[16, 3], [14, 10]], [[15, 3], [11, 9]], [[14, 3], [9, 7]]])
        v.capsule(a[0], h + a[1], 0, b[0], h + b[1], 0, 0.6, 0.5, R);
      v.capsule(13, yy(13) - 2, 0, 9, yy(13) - 8, 0, 0.6, 0.5, R);
    },
  },
  {
    id: 'shark', name: 'Shark', rarity: 3, hp: 62, atk: 16, spd: 10,
    eye: { x: 11, y: 1, size: 1 },
    build(v) {
      const top = 0x6f7f91;
      const col = belly(top, 0xeef2f5, -1);
      v.ellipsoid(0, 0, 0, 13, 5, 4.5, col);
      v.ellipsoid(10, 0, 0, 5, 4, 3.5, col);
      v.ellipsoid(-11, 0, 0, 4, 2, 2, col);
      v.polyXY([[3, 4], [-2, 12], [-4, 11], [-5, 4]], 0, 0, top);
      v.polyXY([[-13, 0], [-20, 10], [-18, 1], [-17, -1], [-19, -6], [-14, -1]], 0, 0, top);
      v.polyXZ([[4, 2], [-2, 10], [-4, 9], [0, 2]], -3, -3, top, true);
      v.polyXY([[-8, -3], [-10, -6], [-11, -3]], 0, 0, top);
      v.paint((p) => (p.x === 4 || p.x === 6) && Math.abs(p.y) <= 2 && Math.abs(p.z) >= 3, 0x4a5868);
      v.paint((p) => p.y === -2 && p.x >= 10 && Math.abs(p.z) >= 2, 0x3a2a2a);
      v.paint((p) => p.y === -3 && p.x >= 10 && mod(p.x + p.z, 2) === 0 && Math.abs(p.z) >= 2, W);
    },
  },
  {
    id: 'hammerhead', name: 'Hammerhead', rarity: 3, hp: 66, atk: 15, spd: 8,
    eye: { x: 15, y: 0, size: 1 },
    build(v) {
      const F = 0x6a7a72, col = belly(0x7d8c84, 0xeef2f0, -1);
      v.ellipsoid(0, 0, 0, 13, 4.5, 4, col);
      v.ellipsoid(-11, 0, 0, 4, 2, 2, col);
      v.ellipsoid(10, 0, 0, 4, 3.5, 3, col);
      v.ellipsoid(14, 0, 0, 2.5, 1.8, 9, col);
      v.polyXY([[3, 4], [-1, 13], [-3, 12], [-4, 4]], 0, 0, F);
      v.polyXY([[-13, 0], [-20, 10], [-18, 1], [-17, -1], [-19, -6], [-14, -1]], 0, 0, F);
      v.polyXZ([[4, 2], [-2, 9], [-4, 8], [0, 2]], -3, -3, F, true);
      v.paint((p) => p.y === -1 && p.x >= 12 && Math.abs(p.z) <= 2, 0x3a2a2a);
    },
  },
  {
    id: 'coelacanth', name: 'Coelacanth', rarity: 3, hp: 70, atk: 13, spd: 5,
    eye: { x: 10, y: 1, size: 2, white: 0xd0f0ff },
    build(v) {
      const col = (x, y, z) => (hash3(x, y, Math.abs(z)) < 0.1 ? 0xe8f0ff : 0x203a6a);
      v.ellipsoid(0, 0, 0, 13, 5.5, 4, col);
      for (const s of [1, -1]) {
        v.capsule(5, -3, 3 * s, 2, -6, 7 * s, 1.2, 1, col);
        v.ellipsoid(1, -7, 8 * s, 2, 1.2, 1, col);
      }
      v.capsule(-4, 5, 0, -7, 9, 0, 1.2, 1, col);
      v.ellipsoid(-8, 10, 0, 2.5, 1.5, 0.6, col);
      v.capsule(-4, -5, 0, -7, -9, 0, 1.2, 1, col);
      v.ellipsoid(-8, -10, 0, 2.5, 1.5, 0.6, col);
      v.polyXY([[-12, 0], [-17, 6], [-19, 0], [-17, -6]], 0, 0, col);
      v.capsule(-13, 0, 0, -22, 0, 0, 1.2, 0.8, col);
      v.ellipsoid(-22, 0, 0, 2, 1.5, 0.6, col);
      v.polyXY([[2, 5], [0, 9], [-2, 5]], 0, 0, col);
    },
  },
  // ---------------- LEGENDARY ----------------
  {
    id: 'whale', name: 'Whale', rarity: 4, hp: 110, atk: 18, spd: 4,
    eye: { x: 14, y: 0, size: 2 },
    build(v) {
      const top = 0x2f5d8a, bot = 0xbcd0e0, groove = 0x8fa7bb;
      const col = (x, y) => (y < -2 ? (mod(x, 2) === 0 && x > 0 ? groove : bot) : top);
      v.ellipsoid(2, 0, 0, 16, 7, 6.5, col);
      v.ellipsoid(12, -0.5, 0, 8, 6.5, 6, col);
      v.ellipsoid(-13, 0, 0, 7, 3.5, 3, col);
      v.polyXZ([[-17, 0], [-23, 9], [-25, 8], [-21, 0]], 0, 0, top, true);
      v.polyXZ([[6, 1], [0, 11], [-2, 10], [2, 1]], -4, -4, top, true);
      v.polyXY([[-6, 6], [-9, 8], [-11, 5]], 0, 0, top);
      v.paint((p) => (p.x === 11 || p.x === 12) && p.z === 0 && p.y >= 5, 0x1c3a57);
      v.paint((p) => p.y === -2 && p.x >= 10 && Math.abs(p.z) >= 3, 0x1c3a57);
    },
  },
  {
    id: 'narwhal', name: 'Narwhal', rarity: 4, hp: 100, atk: 21, spd: 6,
    eye: { x: 10, y: 0, size: 1 },
    build(v) {
      const F = 0x6a747e;
      const col = (x, y, z) => (y < -2 ? 0xe9edf0 : hash3(x, y, Math.abs(z)) < 0.3 ? 0x5a646e : 0x9aa4ae);
      v.ellipsoid(0, 0, 0, 14, 6, 5.5, col);
      v.ellipsoid(10, 0, 0, 6, 5, 5, col);
      v.ellipsoid(-12, 0, 0, 6, 3, 2.5, col);
      v.polyXZ([[-16, 0], [-21, 8], [-23, 7], [-20, 0]], 0, 0, F, true);
      v.polyXZ([[6, 2], [2, 9], [0, 8], [3, 2]], -3, -3, F, true);
      v.capsule(15, 1, 0, 32, 3, 0, 0.9, 0.5, (x) => (mod(x, 2) === 0 ? 0xf5ecd2 : 0xd8cba5));
    },
  },
  {
    id: 'orca', name: 'Orca', rarity: 4, hp: 115, atk: 20, spd: 7,
    eye: { x: 11, y: 1, size: 1 },
    build(v) {
      const B = 0x161616;
      const col = (x, y) => (y < -2 && x > -10 ? 0xf4f4f4 : B);
      v.ellipsoid(0, 0, 0, 15, 6.5, 5.5, col);
      v.ellipsoid(11, 0, 0, 6, 5, 4.5, col);
      v.ellipsoid(-13, 0, 0, 6, 3, 2.5, col);
      v.polyXY([[2, 5], [0, 15], [-2, 14], [-4, 5]], 0, 0, B);
      v.polyXZ([[-17, 0], [-22, 8], [-24, 7], [-21, 0]], 0, 0, B, true);
      v.polyXZ([[6, 3], [3, 9], [0, 9], [2, 3]], -4, -4, B, true);
      v.paint((p) => p.x >= 6 && p.x <= 9 && p.y >= 1 && p.y <= 3 && Math.abs(p.z) >= 3, 0xf4f4f4);
      v.paint((p) => p.x <= -2 && p.x >= -7 && p.y >= 5 && p.z !== 0, 0x8a8a8a);
    },
  },
  {
    id: 'squid', name: 'Colossal Squid', rarity: 4, hp: 125, atk: 19, spd: 5,
    eye: { x: 6, y: 1, size: 3, white: 0xfff2a8, glow: true, pupil: 0x111111 },
    build(v) {
      const col = (x, y, z) => (hash3(x, y, Math.abs(z)) < 0.15 ? 0xa3222d : 0xc8323c);
      const arm = (x, y, z) => (hash3(x, y, Math.abs(z)) < 0.07 ? 0xfff0e0 : 0xd94450);
      v.ellipsoid(-8, 0, 0, 12, 5, 5, col);
      v.polyXZ([[-13, 0], [-18, 8], [-21, 0]], -1, 0, col, true);
      v.ellipsoid(5, 0, 0, 4, 4.5, 4.5, col);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2, oy = Math.cos(a) * 2.5, oz = Math.sin(a) * 2.5, w = Math.sin(i * 2.3);
        v.chain([[8, oy, oz, 1.2], [13, oy * 1.6 + w, oz * 1.6, 1], [18, oy * 2, oz * 2 + w, 0.8], [22, oy * 1.8 - w, oz * 2.2, 0.6]], arm);
      }
      for (const s of [1, -1]) {
        v.chain([[8, -1, 1.5 * s, 0.8], [16, -3, 3 * s, 0.6], [26, -2, 4 * s, 0.6], [30, 0, 4 * s, 0.6]], arm);
        v.ellipsoid(30, 0, 4 * s, 2, 1.4, 1.2, 0xa3222d);
      }
      for (const s of [1, -1]) v.set(4, -3, 4 * s, 0x9ff7ff, true);
    },
  },
  // ---------------- MYTHIC ----------------
  {
    id: 'megalodon', name: 'Megalodon', rarity: 5, hp: 140, atk: 26, spd: 9,
    eye: { x: 15, y: 2, size: 2, pupil: 0xff2a2a, white: 0x222222, glow: true },
    build(v) {
      const top = 0x3b4757;
      const col = (x, y, z) => (y < -2 ? 0xc9ced6 : hash3(x, y, z) < 0.05 ? 0x8a94a3 : top);
      v.ellipsoid(0, 0, 0, 17, 7, 6, col);
      v.ellipsoid(13, -0.5, 0, 7, 6, 5, col);
      v.ellipsoid(-14, 0, 0, 5, 2.6, 2.5, col);
      v.polyXY([[4, 6], [-3, 16], [-6, 15], [-7, 6]], 0, 0, top);
      v.polyXY([[-17, 0], [-26, 13], [-23, 1], [-22, -1], [-25, -8], [-18, -1]], 0, 0, top);
      v.polyXZ([[6, 3], [-2, 13], [-5, 12], [1, 3]], -4, -4, top, true);
      v.polyXY([[-10, -5], [-13, -9], [-14, -5]], 0, 0, top);
      v.paint((p) => [6, 8, 10].includes(p.x) && Math.abs(p.y) <= 3 && Math.abs(p.z) >= 4, 0x232b36);
      v.paint((p) => p.x >= 14 && p.y <= -1 && p.y >= -5 && Math.abs(p.z) <= 4, 0x5a0f0f);
      v.removeIf((p) => p.x >= 17 && p.y <= -2 && p.y >= -4 && Math.abs(p.z) <= 3);
      for (let z = -3; z <= 3; z++) {
        v.set(18, -2, z, W);
        if (mod(z, 2) === 1) v.set(18, -3, z, W);
        v.set(17, -4, z, mod(z, 2) === 0 ? W : 0x5a0f0f);
      }
    },
  },
];

// ---------------- MORE SEA CREATURES (new shapes) ----------------
FISH.push(
  {
    id: 'starfish', name: 'Starfish', rarity: 0, hp: 26, atk: 4, spd: 1, tilt: 0.9,
    eye: { mode: 'top', x: 2, z: 1, size: 1 },
    build(v) {
      const col = (x, y, z) => (hash3(x, y, Math.abs(z)) < 0.12 ? 0xffe0b0 : 0xff8c42);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        v.capsule(0, 0, 0, Math.cos(a) * 10, 0, Math.sin(a) * 10, 2.6, 0.8, col);
      }
      v.ellipsoid(0, 0, 0, 3.5, 2, 3.5, col);
      v.removeIf((p) => p.y < -1 || p.y > 1);
    },
  },
  {
    id: 'octopus', name: 'Octopus', rarity: 2, hp: 47, atk: 11, spd: 6,
    eye: { x: 2, y: 2, size: 2, white: 0xfff2c0 },
    build(v) {
      const col = (x, y, z) => (hash3(x, y, Math.abs(z)) < 0.15 ? 0xc0502a : 0xe0703a);
      v.ellipsoid(-3, 4, 0, 6, 6, 5.5, col);
      v.ellipsoid(0, -1, 0, 4, 3, 4, col);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.2, c = Math.cos(a), s = Math.sin(a), w = Math.sin(i * 2.1);
        v.chain([[c * 3, -2, s * 3, 1.3], [c * 7, -6, s * 7, 1], [c * 10 + w, -9, s * 10, 0.8], [c * 12, -7, s * 12 + w, 0.6]],
          (x, y, z) => (y < -4 && hash3(x, y, Math.abs(z)) < 0.3 ? 0xffd2b8 : 0xe0703a));
      }
    },
  },
  {
    id: 'turtle', name: 'Sea Turtle', rarity: 2, hp: 60, atk: 9, spd: 4,
    eye: { x: 13, y: 1, size: 1 },
    build(v) {
      const shell = (x, y, z) => (y < -1 ? 0xe8d9a0 : mod(x + Math.abs(z), 5) === 0 || mod(x - Math.abs(z), 5) === 0 ? 0x4a3a1a : 0x6b8a3a);
      const skin = (x, y, z) => (hash3(x, y, Math.abs(z)) < 0.2 ? 0x8aa86a : 0x6f8f4f);
      v.ellipsoid(0, 1, 0, 10, 4, 8, shell);
      v.capsule(8, 0, 0, 11, 0.5, 0, 1.8, 1.8, skin);
      v.ellipsoid(12.5, 0.5, 0, 3, 2.5, 2.5, skin);
      v.polyXZ([[5, 6], [2, 16], [-1, 15], [1, 6]], -1, -1, skin, true);
      v.polyXZ([[-7, 5], [-11, 9], [-12, 7], [-8, 4]], -1, -1, skin, true);
      v.capsule(-9, 0, 0, -12, -0.5, 0, 1, 0.6, skin);
    },
  },
);

// ---------------- VARIETIES (recolored / remixed versions of a base fish) ----------------
// map: base color -> new color (or [color, true] to make it glow)
function V(baseId, o) {
  const base = FISH.find((f) => f.id === baseId);
  return {
    id: o.id, name: o.name, rarity: o.r, hp: o.hp, atk: o.atk, spd: o.spd ?? base.spd,
    tilt: base.tilt, eye: { ...base.eye, ...(o.eye || {}) }, base: baseId, word: o.w, adj: o.adj,
    build(v) {
      base.build(v);
      if (o.map) {
        const map = new Map(Object.entries(o.map).map(([k, val]) => [Number(k), val]));
        for (const p of v.m.values()) {
          const m = map.get(p.c);
          if (m === undefined) continue;
          if (Array.isArray(m)) { p.c = m[0]; p.g = true; } else p.c = m;
        }
      }
      o.extra?.(v);
    },
  };
}
const spots = (pred, rate, col, glow) => (v) => v.paint((p) => pred(p) && hash3(p.x, p.y, Math.abs(p.z)) < rate, col, glow);

FISH.push(
  // ----- common -----
  V('tuna', { id: 'mackerel', name: 'Mackerel', r: 0, hp: 22, atk: 5, spd: 9, w: 'Mack', adj: 'Stripy',
    map: { 0x1f3b73: 0x1f6f5f, 0x8fa3b8: 0xc0d0dc, 0xf2c80f: 0x8fa3b8 },
    extra: (v) => v.paint((p) => p.y > 1 && mod(p.x + p.y * 2, 4) === 0, 0x0f2f2a) }),
  V('tuna', { id: 'salmon', name: 'Salmon', r: 0, hp: 25, atk: 5, spd: 8, w: 'Salmo', adj: 'Leaping',
    map: { 0x1f3b73: 0x6a7f8f, 0x8fa3b8: 0xf0a0a0, 0xdfe6ec: 0xf5e6e6, 0xf2c80f: 0x8a9aa8 },
    extra: spots((p) => p.y > 1, 0.12, 0x1a1a1a) }),
  V('tuna', { id: 'trout', name: 'Rainbow Trout', r: 0, hp: 24, atk: 5, spd: 8, w: 'Trout', adj: 'Rainbow',
    map: { 0x1f3b73: 0x5a6b3a, 0x8fa3b8: 0xff8fa3, 0xdfe6ec: 0xf0f0e0, 0xf2c80f: 0x7a8a5a },
    extra: spots((p) => p.y > -2, 0.08, 0x1a1a1a) }),
  V('tuna', { id: 'bass', name: 'Largemouth Bass', r: 0, hp: 27, atk: 6, spd: 6, w: 'Bass', adj: 'Bassy',
    map: { 0x1f3b73: 0x3d5a2a, 0x8fa3b8: 0x7a9a4a, 0xdfe6ec: 0xe8e8c8, 0xf2c80f: 0x4a6a2a },
    extra: spots((p) => p.y === 0 && Math.abs(p.z) >= 3, 0.5, 0x2a3a1a) }),
  V('tuna', { id: 'sardine', name: 'Sardine', r: 0, hp: 18, atk: 5, spd: 10, w: 'Sardi', adj: 'Tiny',
    map: { 0x1f3b73: 0x2a5a8a, 0x8fa3b8: 0xd8e4ee, 0xdfe6ec: 0xffffff, 0xf2c80f: 0x9ab0c4 } }),
  V('bluegill', { id: 'pumpkinseed', name: 'Pumpkinseed', r: 0, hp: 23, atk: 5, w: 'Pumpkin', adj: 'Spooky',
    map: { 0xf0a838: 0xff7b1c, 0x3f6b5a: 0x5f7a3a, 0x6b8f5e: 0x9fb05a, 0x1b2a5a: 0xff2a2a } }),
  V('halibut', { id: 'flounder', name: 'Flounder', r: 0, hp: 26, atk: 4, w: 'Floun', adj: 'Sandy',
    map: { 0x6b5b45: 0xa68f62, 0x8a7558: 0xc4ad7c }, extra: spots((p) => p.y > 0, 0.08, 0x4a3a2a) }),
  V('goldfish', { id: 'blackmoor', name: 'Black Moor', r: 0, hp: 23, atk: 4, w: 'Moor', adj: 'Gloomy',
    map: { 0xf28c28: 0x1e1e22, 0xffb347: 0x2e2e36, 0xfff1d6: 0x55555f }, eye: { size: 3 } }),
  V('goldfish', { id: 'calico', name: 'Calico Goldfish', r: 0, hp: 22, atk: 5, w: 'Calico', adj: 'Patchy',
    extra: (v) => v.paint(() => true, (x, y, z) => [0xff8c28, 0x1e1e22, 0xfaf6ef][Math.floor(hash3(Math.floor(x / 3), Math.floor(y / 3), Math.floor(Math.abs(z) / 3)) * 3)]) }),
  V('jellyfish', { id: 'moonjelly', name: 'Moon Jelly', r: 0, hp: 24, atk: 4, w: 'Moon', adj: 'Moonlit',
    map: { 0xffb3e6: 0xdff2ff, 0xf78fd0: 0xc7e6ff, 0xe86bbf: 0xa8d4ff, 0xff7ac8: 0xff9ad5, 0xffc2ea: 0xe8f6ff } }),
  V('eel', { id: 'gardeneel', name: 'Garden Eel', r: 0, hp: 20, atk: 6, w: 'Garden', adj: 'Peeking',
    map: { 0x4f7f2a: 0xf2efe6, 0x2f4f18: 0x1a1a1a } }),
  // ----- uncommon -----
  V('clownfish', { id: 'blackclown', name: 'Black Clownfish', r: 1, hp: 32, atk: 8, w: 'Shadow', adj: 'Midnight',
    map: { 0xff7b1c: 0x1c1c1c } }),
  V('clownfish', { id: 'maroonclown', name: 'Maroon Clownfish', r: 1, hp: 34, atk: 8, w: 'Maroon', adj: 'Grumpy',
    map: { 0xff7b1c: 0x7a0f1e, 0xffffff: 0xfff3c4 } }),
  V('tuna', { id: 'bluefin', name: 'Bluefin Tuna', r: 1, hp: 34, atk: 8, spd: 10, w: 'Bluefin', adj: 'Turbo',
    map: { 0x1f3b73: 0x0f1f4f, 0x8fa3b8: 0x7a8a9f, 0xf2c80f: 0xffd700 } }),
  V('shark', { id: 'lemonshark', name: 'Lemon Shark', r: 1, hp: 36, atk: 9, w: 'Lemon', adj: 'Sour',
    map: { 0x6f7f91: 0xc9b26b } }),
  V('shark', { id: 'nurseshark', name: 'Nurse Shark', r: 1, hp: 38, atk: 8, spd: 4, w: 'Nurse', adj: 'Sleepy',
    map: { 0x6f7f91: 0x9a7a52, 0xeef2f5: 0xe0cfb0 },
    extra: (v) => { for (const s of [1, -1]) v.capsule(13, -1, s, 15, -4, s, 0.6, 0.5, 0x6a5232); } }),
  V('hammerhead', { id: 'bonnethead', name: 'Bonnethead', r: 1, hp: 35, atk: 9, w: 'Bonnet', adj: 'Fancy',
    map: { 0x7d8c84: 0x8a7d6a, 0x6a7a72: 0x7a6d5a } }),
  V('catfish', { id: 'bluecat', name: 'Blue Catfish', r: 1, hp: 36, atk: 7, w: 'Bluecat', adj: 'Moody',
    map: { 0x6b6152: 0x4f6a85, 0x5a5244: 0x3d5670 } }),
  V('eel', { id: 'ribboneel', name: 'Ribbon Eel', r: 1, hp: 30, atk: 9, w: 'Ribbon', adj: 'Twirly',
    map: { 0x4f7f2a: 0x1f5fd6, 0x2f4f18: 0xffd60a } }),
  V('boxfish', { id: 'cowfish', name: 'Cowfish', r: 1, hp: 40, atk: 6, w: 'Cow', adj: 'Mooing',
    extra: (v) => { for (const s of [1, -1]) { v.capsule(6, 4, 2 * s, 10, 7, 2 * s, 0.7, 0.5, 0xffd60a); v.capsule(-6, -4, 2 * s, -9, -6, 2 * s, 0.7, 0.5, 0xffd60a); } } }),
  V('seahorse', { id: 'pygmyhorse', name: 'Pygmy Seahorse', r: 1, hp: 30, atk: 8, w: 'Pygmy', adj: 'Itty-Bitty',
    map: { 0xf4a259: 0xff9ec4, 0xd9822b: 0xff6fa8, 0xf8c48a: 0xffc4dc, 0xffd29a: 0xffb3d1 },
    extra: spots(() => true, 0.15, 0xd94a8a) }),
  V('urchin', { id: 'redurchin', name: 'Red Urchin', r: 1, hp: 38, atk: 7, w: 'Ruby', adj: 'Prickly',
    map: { 0x4b1d5e: 0x8a1a1a, 0x6a2c8a: 0xa82a2a, 0x7a3a9a: 0xc83a3a, 0xc89be0: 0xff8a7a } }),
  // ----- rare -----
  V('shark', { id: 'mako', name: 'Mako Shark', r: 2, hp: 46, atk: 13, spd: 11, w: 'Mako', adj: 'Lightning',
    map: { 0x6f7f91: 0x2f4f8f } }),
  V('shark', { id: 'blueshark', name: 'Blue Shark', r: 2, hp: 48, atk: 12, w: 'Azure', adj: 'Sapphire',
    map: { 0x6f7f91: 0x2f6fe0 } }),
  V('pufferfish', { id: 'spottedpuffer', name: 'Spotted Puffer', r: 2, hp: 54, atk: 9, w: 'Dotty', adj: 'Dotted',
    map: { 0xd9b45a: 0x5a4a3a, 0x7a5a2a: 0xffffff, 0xf2e2b0: 0x8a7a6a }, extra: spots((p) => p.y >= -1, 0.15, 0xffffff) }),
  V('angelfish', { id: 'emperorangel', name: 'Emperor Angelfish', r: 2, hp: 44, atk: 10, w: 'Emperor', adj: 'Royal',
    map: { 0xffd23f: 0x1b3fa0, 0x2b59c3: 0xffd23f } }),
  V('parrotfish', { id: 'rainbowparrot', name: 'Rainbow Parrotfish', r: 2, hp: 46, atk: 10, w: 'Rainbow', adj: 'Dazzling',
    extra: (v) => v.paint((p) => p.c !== 0xf3e9d2 && p.c !== 0xb8a98a, (x) => [0xff4d4d, 0xff9f1c, 0xffe14d, 0x4dd17a, 0x3fa0ff, 0xa45cff][mod(Math.floor(x / 3), 6)]) }),
  V('eel', { id: 'electriceel', name: 'Electric Eel', r: 2, hp: 42, atk: 14, w: 'Volt', adj: 'Electric',
    map: { 0x4f7f2a: 0x2a2a2e, 0x2f4f18: [0xffe14d, true] } }),
  V('stingray', { id: 'eagleray', name: 'Spotted Eagle Ray', r: 2, hp: 46, atk: 11, w: 'Eagle', adj: 'Soaring',
    map: { 0x7d6e63: 0x1d2433, 0x5b4f47: 0xf0f0f0 }, extra: (v) => v.paint((p) => p.x < -7, 0x1d2433) }),
  V('koi', { id: 'goldenkoi', name: 'Golden Koi', r: 2, hp: 44, atk: 10, w: 'Golden', adj: 'Golden',
    map: { 0xff5a1f: 0xffc93c, 0xfaf6ef: 0xffe9a3, 0x1a1a1a: 0xd4a017, 0xffe0cc: 0xfff2b0 } }),
  V('catfish', { id: 'albinocat', name: 'Albino Catfish', r: 2, hp: 48, atk: 9, w: 'Albino', adj: 'Ghostly',
    map: { 0x6b6152: 0xf5d9d9, 0x5a5244: 0xf0c4c4, 0xd9cfb8: 0xffffff, 0x3d362c: 0xffb3b3 }, eye: { pupil: 0xff2a2a } }),
  V('piranha', { id: 'blackpiranha', name: 'Black Piranha', r: 2, hp: 42, atk: 14, w: 'Onyx', adj: 'Ravenous',
    map: { 0x7d8a96: 0x26262c, 0xb8c4cf: 0x3a3a44, 0xd62828: 0x3a3a44, 0x4a535c: 0x1a1a1f }, eye: { white: 0xff2a2a } }),
  V('barracuda', { id: 'greatbarracuda', name: 'Great Barracuda', r: 2, hp: 44, atk: 14, w: 'Great', adj: 'Sly',
    map: { 0x4a5866: 0x1a1f26, 0x9aaab8: 0x7d8fa0 }, extra: spots((p) => p.y < 0, 0.06, 0x1a1f26) }),
  V('orca', { id: 'dolphin', name: 'Dolphin', r: 2, hp: 50, atk: 11, spd: 10, w: 'Dolph', adj: 'Playful',
    map: { 0x161616: 0x7a8a99, 0xf4f4f4: 0xdfe6ea, 0x8a8a8a: 0x7a8a99 },
    extra: (v) => { v.paint((p) => p.x >= 6 && p.x <= 9 && p.y >= 1 && p.y <= 3, 0x7a8a99); v.capsule(16, -1, 0, 21, -1.5, 0, 2, 1.4, 0x7a8a99); } }),
  V('tuna', { id: 'flyingfish', name: 'Flying Fish', r: 2, hp: 40, atk: 11, spd: 11, w: 'Fly', adj: 'Flying',
    map: { 0x1f3b73: 0x1f4fa0, 0xf2c80f: 0x9fd3ff },
    extra: (v) => v.polyXZ([[4, 2], [-6, 14], [-10, 12], [-2, 2]], 0, 0, 0x9fd3ff, true) }),
  V('jellyfish', { id: 'boxjelly', name: 'Box Jelly', r: 2, hp: 40, atk: 14, w: 'Cube', adj: 'Stinging',
    map: { 0xffb3e6: 0xbff8ff, 0xf78fd0: 0x9fefff, 0xe86bbf: 0x6fe0ff, 0xff7ac8: 0x8fe8ff, 0xffc2ea: [0x7ff7ff, true] } }),
  // ----- epic -----
  V('shark', { id: 'tigershark', name: 'Tiger Shark', r: 3, hp: 68, atk: 17, w: 'Tiger', adj: 'Striped',
    map: { 0x6f7f91: 0x7a7560 }, extra: (v) => v.paint((p) => p.y > 0 && mod(p.x, 3) === 0, 0x3a3528) }),
  V('shark', { id: 'goblinshark', name: 'Goblin Shark', r: 3, hp: 64, atk: 17, w: 'Goblin', adj: 'Creepy',
    map: { 0x6f7f91: 0xd99aa0, 0xeef2f5: 0xf5d0d4 },
    extra: (v) => v.capsule(12, 1, 0, 21, 1.5, 0, 1.6, 0.6, 0xd99aa0) }),
  V('shark', { id: 'bullshark', name: 'Bull Shark', r: 3, hp: 76, atk: 15, spd: 7, w: 'Bull', adj: 'Stubborn',
    map: { 0x6f7f91: 0x6e6a62 }, extra: (v) => v.ellipsoid(2, -0.5, 0, 9, 5, 5, (x, y) => (y < -1 ? 0xeef2f5 : 0x6e6a62)) }),
  V('stingray', { id: 'manta', name: 'Manta Ray', r: 3, hp: 74, atk: 13, w: 'Manta', adj: 'Majestic',
    map: { 0x7d6e63: 0x1f1f24, 0x5b4f47: 0x2f2f36 },
    extra: (v) => { for (const s of [1, -1]) v.capsule(8, 0, 3 * s, 12, 0, 4 * s, 1, 0.8, 0x1f1f24); } }),
  V('seahorse', { id: 'seadragon', name: 'Leafy Sea Dragon', r: 3, hp: 62, atk: 14, w: 'Dragon', adj: 'Leafy',
    map: { 0xf4a259: 0xc8d44a, 0xd9822b: 0x9ab03a, 0xf8c48a: 0xe8e070, 0xffd29a: 0x7a9a2a },
    extra: (v) => { for (const [x, y] of [[0, 8], [-2, 4], [-3, 0], [-2, -4], [-4, -8], [3, 13], [4, 4]]) v.polyXY([[x, y], [x - 4, y + 3], [x - 3, y + 5], [x - 1, y + 2]], 0, 0, 0x7a9a2a); } }),
  V('jellyfish', { id: 'lionsmane', name: "Lion's Mane Jelly", r: 3, hp: 66, atk: 15, w: 'Mane', adj: 'Fiery',
    map: { 0xffb3e6: 0xff9a4d, 0xf78fd0: 0xe0602a, 0xe86bbf: 0xc0401a, 0xff7ac8: 0xff7040, 0xffc2ea: 0xffb070 } }),
  V('swordfish', { id: 'bluemarlin', name: 'Blue Marlin', r: 3, hp: 66, atk: 17, spd: 11, w: 'Marlin', adj: 'Swift',
    map: { 0x34407a: 0x1a3fa8, 0x2a3366: 0x10286a }, extra: (v) => v.paint((p) => p.y > 0 && mod(p.x, 4) === 0 && p.x < 12, 0x6fa8ff) }),
  V('swordfish', { id: 'sailfish', name: 'Sailfish', r: 3, hp: 62, atk: 16, spd: 12, w: 'Sail', adj: 'Sailing',
    map: { 0x34407a: 0x2a4a9a },
    extra: (v) => v.polyXY([[8, 4], [6, 14], [-6, 15], [-10, 4]], 0, 0, (x, y) => (hash3(x, y, 1) < 0.15 ? 0x0a1a4a : 0x3a5ac0)) }),
  V('whale', { id: 'beluga', name: 'Beluga', r: 3, hp: 80, atk: 13, w: 'Belu', adj: 'Chirpy',
    map: { 0x2f5d8a: 0xeef1f4, 0xbcd0e0: 0xffffff, 0x8fa7bb: 0xdde3e8, 0x1c3a57: 0x9aa4ae },
    extra: (v) => v.ellipsoid(16, 2, 0, 4, 4, 4, 0xf4f6f8) }),
  V('squid', { id: 'giantsquid', name: 'Giant Squid', r: 3, hp: 72, atk: 15, w: 'Giant', adj: 'Tentacled',
    map: { 0xa3222d: 0xb0485a, 0xc8323c: 0xe07a8a, 0xd94450: 0xf09aa5 } }),
  V('anglerfish', { id: 'abyssal', name: 'Abyssal Angler', r: 3, hp: 70, atk: 16, w: 'Abyss', adj: 'Abyssal',
    map: { 0x3a2e2b: 0x0d0d1a, 0x4d3c36: 0x1a1a33, 0x3a0a0a: 0x0a0a2a, 0x5a4a40: 0x22224a, 0xfff27a: [0x3fe0ff, true] } }),
  // ----- legendary -----
  V('shark', { id: 'greatwhite', name: 'Great White Shark', r: 4, hp: 118, atk: 22, spd: 9, w: 'White', adj: 'Terrifying',
    map: { 0x6f7f91: 0x5d6670 },
    extra: (v) => v.paint((p) => p.y === -2 && p.x >= 10 && Math.abs(p.z) >= 2 && mod(p.x + p.z, 2) === 0, 0xffffff) }),
  V('shark', { id: 'whaleshark', name: 'Whale Shark', r: 4, hp: 135, atk: 16, spd: 4, w: 'Spotty', adj: 'Gentle',
    map: { 0x6f7f91: 0x2c3e5a },
    extra: (v) => v.paint((p) => p.y > -1 && mod(p.x, 3) === 0 && mod(p.y + Math.abs(p.z), 3) === 0, 0xeaf2ff) }),
  V('whale', { id: 'humpback', name: 'Humpback Whale', r: 4, hp: 120, atk: 18, w: 'Hump', adj: 'Singing',
    map: { 0x2f5d8a: 0x2b2f36, 0xbcd0e0: 0xd0d4d8, 0x8fa7bb: 0x9aa0a8 },
    extra: (v) => { v.polyXZ([[8, 2], [2, 16], [-1, 15], [4, 2]], -4, -4, 0xeeeeee, true); spots((p) => p.x > 8 && p.y > 2, 0.25, 0x6a6f78)(v); } }),
  V('whale', { id: 'spermwhale', name: 'Sperm Whale', r: 4, hp: 130, atk: 20, w: 'Boxhead', adj: 'Boxy',
    map: { 0x2f5d8a: 0x5a5552, 0xbcd0e0: 0x8a8480, 0x8fa7bb: 0x7a7470 },
    extra: (v) => v.box(12, -4, -5, 22, 5, 5, 0x5a5552), eye: { x: 13 } }),
  V('tuna', { id: 'arowana', name: 'Golden Arowana', r: 4, hp: 105, atk: 21, spd: 8, w: 'Arowa', adj: 'Lucky',
    map: { 0x1f3b73: 0xc9a227, 0x8fa3b8: 0xffd75e, 0xdfe6ec: 0xfff1b0, 0xf2c80f: 0xff9f1c },
    extra: (v) => v.paint((p) => p.c === 0xffd75e && mod(p.x + p.y, 2) === 0, 0xe8b830) }),
  // ----- mythic -----
  V('squid', { id: 'kraken', name: 'Kraken', r: 5, hp: 150, atk: 25, spd: 6, w: 'Kraken', adj: 'Legendary',
    map: { 0xa3222d: 0x3d1a5c, 0xc8323c: 0x5a2a8a, 0xd94450: 0x6e3aa8, 0xfff0e0: [0x7fffd4, true] }, eye: { white: 0x7fffd4 } }),
  V('megalodon', { id: 'lavamega', name: 'Lava Megalodon', r: 5, hp: 145, atk: 28, w: 'Magma', adj: 'Molten',
    map: { 0x3b4757: 0x1a1414, 0xc9ced6: 0x3a2a26, 0x8a94a3: [0xff6a00, true], 0x232b36: [0xff3d00, true], 0x5a0f0f: [0xff4500, true] },
    extra: spots((p) => p.y > -2, 0.07, 0xff8c1a, true), eye: { pupil: 0xffd000 } }),
  V('megalodon', { id: 'ghostmega', name: 'Ghost Megalodon', r: 5, hp: 135, atk: 27, spd: 11, w: 'Ghost', adj: 'Haunted',
    map: { 0x3b4757: 0xcfe3ea, 0xc9ced6: 0xffffff, 0x8a94a3: 0xa8d8e8, 0x232b36: 0x9cc7d6, 0x5a0f0f: 0x2a3a4a },
    eye: { pupil: 0x3fffff, white: 0xa8d8e8 } }),
  V('oarfish', { id: 'leviathan', name: 'Leviathan', r: 5, hp: 140, atk: 26, spd: 9, w: 'Levia', adj: 'Mighty',
    map: { 0xd7dee6: 0x0f4a5a, 0x8a97a6: 0x0a3340, 0xe2333a: [0x3ff5ff, true] }, eye: { size: 2, pupil: 0x3ff5ff, glow: true } }),
  V('whale', { id: 'cosmicwhale', name: 'Cosmic Whale', r: 5, hp: 160, atk: 23, w: 'Cosmo', adj: 'Cosmic',
    map: { 0x2f5d8a: 0x2a1458, 0xbcd0e0: 0x5a3aa8, 0x8fa7bb: 0x7a5ad0, 0x1c3a57: 0x120830 },
    extra: (v) => { spots(() => true, 0.05, 0xffffff, true)(v); spots(() => true, 0.03, 0xff9ff3, true)(v); } }),
);
FISH.sort((a, b) => a.rarity - b.rarity);

export const FISH_BY_ID = Object.fromEntries(FISH.map((f, i) => [f.id, { ...f, index: i }]));

// ---------- voxel generation ----------
const rawCache = new Map();
function rawVoxels(fish) {
  if (!rawCache.has(fish.id)) {
    const v = new VB(fish.id.length * 7919 + 13);
    fish.build(v);
    rawCache.set(fish.id, v);
  }
  return rawCache.get(fish.id);
}

function bboxCenter(list) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of list) {
    if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x;
    if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y;
  }
  return { cx: Math.round((x0 + x1) / 2), cy: Math.round((y0 + y1) / 2), len: x1 - x0 };
}

export function fishVoxels(fish) {
  const raw = rawVoxels(fish);
  const v = new VB();
  for (const p of raw.list()) v.m.set(VB.key(p.x, p.y, p.z), { ...p });
  v.eyes(fish.eye);
  return v.list();
}

// Finds the closest voxel of a fish (in merged coordinates) so its colors can be
// painted onto parts of the merged body that came from the other fish.
function nearestFinder(list, ox, oy) {
  const C = 4, grid = new Map();
  for (const p of list) {
    const x = p.x - ox, y = p.y - oy;
    const k = Math.floor(x / C) + ',' + Math.floor(y / C) + ',' + Math.floor(p.z / C);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push({ x, y, z: p.z, c: p.c, g: p.g });
  }
  return (x, y, z) => {
    const gx = Math.floor(x / C), gy = Math.floor(y / C), gz = Math.floor(z / C);
    let best = null, bd = Infinity;
    for (let r = 0; r < 12; r++) {
      for (let i = -r; i <= r; i++)
        for (let j = -r; j <= r; j++)
          for (let k = -r; k <= r; k++) {
            if (Math.max(Math.abs(i), Math.abs(j), Math.abs(k)) !== r) continue;
            const cell = grid.get(gx + i + ',' + (gy + j) + ',' + (gz + k));
            if (!cell) continue;
            for (const p of cell) {
              const d = (p.x - x) ** 2 + (p.y - y) ** 2 + (p.z - z) ** 2;
              if (d < bd) { bd = d; best = p; }
            }
          }
      if (best && Math.sqrt(bd) < r * C) break;
    }
    return best || list[0];
  };
}

// Merge two fish into one fused creature. No halves: the shapes are overlaid into a single
// body, and colors flow from A (head) into B (tail) through a noisy dithered blend.
export function mergeVoxels(a, b) {
  const ra = rawVoxels(a).list(), rb = rawVoxels(b).list();
  const ca = bboxCenter(ra), cb = bboxCenter(rb);
  const shiftA = Math.round(ca.len * 0.1), shiftB = -Math.round(cb.len * 0.1);
  const v = new VB();
  const tmp = new Map();
  for (const p of ra) {
    const x = p.x - ca.cx + shiftA, y = p.y - ca.cy;
    tmp.set(VB.key(x, y, p.z), { x, y, z: p.z, a: p });
  }
  for (const p of rb) {
    const x = p.x - cb.cx + shiftB, y = p.y - cb.cy;
    const k = VB.key(x, y, p.z);
    const e = tmp.get(k);
    if (e) e.b = p; else tmp.set(k, { x, y, z: p.z, b: p });
  }
  let x0 = Infinity, x1 = -Infinity;
  for (const e of tmp.values()) { if (e.x < x0) x0 = e.x; if (e.x > x1) x1 = e.x; }
  const len = Math.max(1, x1 - x0), xc = (x0 + x1) / 2;
  const near = [nearestFinder(ra, ca.cx - shiftA, ca.cy), nearestFinder(rb, cb.cx - shiftB, cb.cy)];
  for (const e of tmp.values()) {
    // head end takes A's look, tail end takes B's, with a noisy dithered seam in between
    const n = (hash3(Math.floor(e.x / 3), Math.floor(e.y / 3), Math.floor(Math.abs(e.z) / 3)) - 0.5) * 0.8;
    const m = 0.5 + ((e.x - xc) / len) * 1.8 + n;
    const wantA = m > hash3(e.x, e.y, Math.abs(e.z)) * 0.4 + 0.3;
    const own = wantA ? e.a : e.b;
    const pick = own || near[wantA ? 0 : 1](e.x, e.y, e.z);
    v.m.set(VB.key(e.x, e.y, e.z), { x: e.x, y: e.y, z: e.z, c: pick.c, g: !!own && pick.g, t: 'b', src: wantA ? 0 : 1 });
  }
  const eye = { ...a.eye };
  if (eye.mode === 'top') eye.x = eye.x - ca.cx + shiftA;
  else { eye.x = eye.x - ca.cx + shiftA; eye.y = eye.y - ca.cy; }
  v.eyes(eye);
  for (const p of v.m.values()) if (p.src === undefined) p.src = 0;
  return v.list();
}

// ---------- names & stats ----------
// Name pieces for each fish: word starts (heads), word endings (tails) and a describing word.
const NAMES = {
  bluegill: [['Blue', 'Gill'], ['gill', 'blu'], 'Splashy'],
  goldfish: [['Gold', 'Goldy'], ['goldie', 'glimmer'], 'Shiny'],
  tuna: [['Tuna', 'Tun'], ['tuna', 'zoom'], 'Speedy'],
  halibut: [['Hali', 'Flat'], ['ibut', 'flop'], 'Flat'],
  needlefish: [['Needle', 'Pokey'], ['needle', 'stab'], 'Pointy'],
  catfish: [['Cat', 'Whisker'], ['cat', 'whisker'], 'Whiskered'],
  koi: [['Koi', 'Lucky'], ['koi', 'lucky'], 'Lucky'],
  clownfish: [['Clown', 'Bozo'], ['clown', 'honk'], 'Silly'],
  angelfish: [['Angel', 'Halo'], ['angel', 'halo'], 'Holy'],
  parrotfish: [['Parrot', 'Squawk'], ['parrot', 'beak'], 'Chatty'],
  boxfish: [['Box', 'Cube'], ['box', 'cube'], 'Blocky'],
  eel: [['Eel', 'Zap'], ['eel', 'zap'], 'Shocking'],
  urchin: [['Urchin', 'Spike'], ['urchin', 'spike'], 'Spiky'],
  piranha: [['Pira', 'Chomp'], ['ranha', 'chomp'], 'Hungry'],
  jellyfish: [['Jelly', 'Wobble'], ['jelly', 'wobble'], 'Wobbly'],
  barracuda: [['Barra', 'Cuda'], ['cuda', 'barra'], 'Sneaky'],
  pufferfish: [['Puff', 'Puffer'], ['puff', 'balloon'], 'Puffy'],
  seahorse: [['Sea', 'Pony'], ['horse', 'pony'], 'Galloping'],
  stingray: [['Sting', 'Glide'], ['ray', 'sting'], 'Gliding'],
  stonefish: [['Stone', 'Rock'], ['stone', 'rock'], 'Rocky'],
  sunfish: [['Sun', 'Mola'], ['sun', 'mola'], 'Sunny'],
  lionfish: [['Lion', 'Mane'], ['lion', 'roar'], 'Roaring'],
  swordfish: [['Sword', 'Blade'], ['sword', 'blade'], 'Stabby'],
  anglerfish: [['Angler', 'Lantern'], ['angler', 'glow'], 'Glowing'],
  blobfish: [['Blob', 'Goo'], ['blob', 'goo'], 'Squishy'],
  oarfish: [['Oar', 'Ribbon'], ['oar', 'ribbon'], 'Wavy'],
  shark: [['Shark', 'Jaw'], ['shark', 'jaws'], 'Fearsome'],
  hammerhead: [['Hammer', 'Bonk'], ['hammer', 'bonk'], 'Bonking'],
  coelacanth: [['Coela', 'Fossil'], ['canth', 'fossil'], 'Prehistoric'],
  whale: [['Whale', 'Blubber'], ['whale', 'blub'], 'Giant'],
  narwhal: [['Narwhal', 'Uni'], ['whal', 'corn'], 'Magical'],
  orca: [['Orca', 'Killer'], ['orca', 'ka'], 'Savage'],
  squid: [['Squid', 'Kraken'], ['squid', 'tacle'], 'Colossal'],
  megalodon: [['Mega', 'Megalo'], ['lodon', 'don'], 'Ancient'],
};
const TITLES = [
  ['Jr.', 'McSplash', 'the Wiggly', 'von Blub', 'the Snack', 'III', 'the Soggy'],
  ['Jr.', 'McSplash', 'the Wiggly', 'von Blub', 'the Snack', 'III', 'the Soggy'],
  ['Rex', 'the Great', 'Prime', 'of the Deep', 'the Brave', 'the Bold', 'Supreme'],
  ['Rex', 'the Great', 'Prime', 'of the Deep', 'the Brave', 'the Bold', 'Supreme'],
  ['the Destroyer', 'King of Tides', 'Overlord', 'the Unstoppable', 'Lord of the Abyss', 'Omega', 'the Titan'],
  ['the Destroyer', 'King of Tides', 'Overlord', 'the Unstoppable', 'Lord of the Abyss', 'Omega', 'the Titan'],
];

NAMES.starfish = [['Star', 'Twinkle'], ['star', 'twinkle'], 'Starry'];
NAMES.octopus = [['Octo', 'Inky'], ['pus', 'ink'], 'Eight-Armed'];
NAMES.turtle = [['Turtle', 'Shell'], ['tle', 'shell'], 'Shelled'];
// varieties reuse their base fish's endings with their own special word
function namesFor(f) {
  if (NAMES[f.id]) return NAMES[f.id];
  const b = NAMES[f.base];
  return [[f.word, b[0][0]], b[1], f.adj];
}

function blend(head, tail) {
  if (head.slice(-1).toLowerCase() === tail[0].toLowerCase()) tail = tail.slice(1);
  return head + tail.toLowerCase();
}

export function mergeName(a, b) {
  const h = Math.floor(hash3(FISH.findIndex((f) => f.id === a.id) * 31 + 7, FISH.findIndex((f) => f.id === b.id) * 17 + 3, 11) * 1000);
  const na = namesFor(a), nb = namesFor(b);
  const rarity = Math.max(a.rarity, b.rarity);
  if (a.id === b.id) {
    if (a.id === 'megalodon') return 'Ultra Megalodon';
    if (a.id === 'narwhal') return 'Unicorn Narwhal';
    return `${['King', 'Twin', 'Double', 'Mega'][h % 4]} ${a.name}`;
  }
  const name = blend(na[0][h % 2], nb[1][(h >> 1) % 2]);
  const title = TITLES[rarity][(h >> 2) % TITLES[rarity].length];
  switch ((h >> 4) % 4) {
    case 0: return name;
    case 1: return `${nb[2]} ${name}`;
    case 2: return `${name} ${title}`;
    default: return `${na[2]} ${blend(nb[0][0], na[1][0])}`;
  }
}

export function makeCreature(a, b) {
  const same = a.rarity === b.rarity;
  const rarity = Math.min(5, Math.max(a.rarity, b.rarity) + (same && a.rarity < 5 ? 1 : 0));
  const bonus = same ? 1.1 : 1;
  return {
    a, b,
    name: mergeName(a, b),
    rarity,
    hp: Math.round((a.hp + b.hp) * bonus),
    atk: Math.round((a.atk + b.atk) * bonus),
    spd: (a.spd + b.spd) / 2,
    value: RARITIES[a.rarity].value + RARITIES[b.rarity].value,
    voxels: mergeVoxels(a, b),
  };
}

export const BAITS = [
  { id: 'worm', name: 'Worm', price: 0, pack: 0, odds: [55, 28, 12, 4, 0.9, 0.1], desc: 'Free & unlimited.' },
  { id: 'shrimp', name: 'Shrimp', price: 30, pack: 12, odds: [35, 33, 20, 9, 2.5, 0.5], desc: 'A tasty snack.' },
  { id: 'squid', name: 'Squid', price: 75, pack: 12, odds: [18, 28, 30, 18, 5, 1], desc: 'Big fish love it.' },
  { id: 'golden', name: 'Golden Lure', price: 180, pack: 12, odds: [6, 16, 32, 30, 12, 4], desc: 'Shiny = rare.' },
  { id: 'chum', name: 'Mega Chum', price: 450, pack: 12, odds: [0, 6, 22, 38, 22, 12], desc: 'Megalodon bait!' },
];

export function rollFish(bait, rng = Math.random) {
  const total = bait.odds.reduce((s, o) => s + o, 0);
  let r = rng() * total, tier = 0;
  for (; tier < bait.odds.length; tier++) {
    r -= bait.odds[tier];
    if (r < 0) break;
  }
  tier = Math.min(tier, 5);
  const pool = FISH.filter((f) => f.rarity === tier);
  return pool[Math.floor(rng() * pool.length)];
}

// ---------- battle ----------
export function simulate(c1, c2, rng = Math.random) {
  let h = [c1.hp, c2.hp];
  const f = [c1, c2];
  let turn = c1.spd === c2.spd ? (rng() < 0.5 ? 0 : 1) : c1.spd > c2.spd ? 0 : 1;
  const log = [];
  while (h[0] > 0 && h[1] > 0 && log.length < 300) {
    const att = f[turn], def = 1 - turn;
    const miss = rng() < 0.07;
    const crit = !miss && rng() < 0.12;
    const dmg = miss ? 0 : Math.max(1, Math.round(att.atk * (0.75 + rng() * 0.5) * (crit ? 1.8 : 1)));
    h[def] = Math.max(0, h[def] - dmg);
    log.push({ who: turn, dmg, crit, miss, hp: [...h] });
    turn = def;
  }
  return { winner: h[0] > 0 ? 0 : 1, log };
}

export function winChance(c1, c2, n = 600) {
  let w = 0;
  for (let i = 0; i < n; i++) if (simulate(c1, c2).winner === 0) w++;
  return Math.min(0.99, Math.max(0.01, w / n));
}

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
    id: 'bluegill', name: 'Bluegill', rarity: 0, hp: 24, atk: 5, spd: 6, pre: 'Blue', suf: 'gill',
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
    id: 'goldfish', name: 'Goldfish', rarity: 0, hp: 22, atk: 4, spd: 5, pre: 'Gold', suf: 'goldie',
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
    id: 'tuna', name: 'Tuna', rarity: 0, hp: 26, atk: 6, spd: 9, pre: 'Tuna', suf: 'tuna',
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
    id: 'halibut', name: 'Halibut', rarity: 0, hp: 28, atk: 4, spd: 4, pre: 'Hali', suf: 'ibut', tilt: 0.7,
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
    id: 'needlefish', name: 'Needlefish', rarity: 0, hp: 18, atk: 7, spd: 10, pre: 'Needle', suf: 'needle',
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
  // ---------------- UNCOMMON ----------------
  {
    id: 'clownfish', name: 'Clownfish', rarity: 1, hp: 32, atk: 7, spd: 7, pre: 'Clown', suf: 'clown',
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
    id: 'angelfish', name: 'Angelfish', rarity: 1, hp: 30, atk: 7, spd: 8, pre: 'Angel', suf: 'angel',
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
    id: 'parrotfish', name: 'Parrotfish', rarity: 1, hp: 34, atk: 7, spd: 6, pre: 'Parrot', suf: 'parrot',
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
    id: 'boxfish', name: 'Boxfish', rarity: 1, hp: 40, atk: 5, spd: 4, pre: 'Box', suf: 'box',
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
    id: 'eel', name: 'Eel', rarity: 1, hp: 30, atk: 9, spd: 8, pre: 'Eel', suf: 'eel',
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
    id: 'urchin', name: 'Sea Urchin', rarity: 1, hp: 36, atk: 6, spd: 2, pre: 'Urchin', suf: 'urchin',
    eye: { x: 5, y: 1, size: 2 },
    build(v) {
      v.ellipsoid(0, 0, 0, 6, 6, 6, (x, y, z) => (hash3(x, y, z) < 0.2 ? 0x6a2c8a : 0x4b1d5e));
      for (const [dx, dy, dz] of fibDirs(64)) {
        v.capsule(dx * 5, dy * 5, dz * 5, dx * 11.5, dy * 11.5, dz * 11.5, 0.7, 0.45,
          (x, y, z) => (x * x + y * y + z * z > 81 ? 0xc89be0 : 0x7a3a9a));
      }
    },
  },
  // ---------------- RARE ----------------
  {
    id: 'pufferfish', name: 'Pufferfish', rarity: 2, hp: 52, atk: 9, spd: 4, pre: 'Puffer', suf: 'puff',
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
    id: 'seahorse', name: 'Seahorse', rarity: 2, hp: 42, atk: 10, spd: 7, pre: 'Sea', suf: 'horse',
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
    id: 'stingray', name: 'Stingray', rarity: 2, hp: 46, atk: 11, spd: 8, pre: 'Sting', suf: 'ray', tilt: 0.6,
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
    id: 'stonefish', name: 'Stonefish', rarity: 2, hp: 50, atk: 10, spd: 3, pre: 'Stone', suf: 'stone',
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
    id: 'sunfish', name: 'Sunfish', rarity: 2, hp: 58, atk: 8, spd: 3, pre: 'Sun', suf: 'sun',
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
  // ---------------- EPIC ----------------
  {
    id: 'anglerfish', name: 'Anglerfish', rarity: 3, hp: 64, atk: 14, spd: 5, pre: 'Angler', suf: 'angler',
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
    id: 'blobfish', name: 'Blobfish', rarity: 3, hp: 76, atk: 11, spd: 2, pre: 'Blob', suf: 'blob',
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
    id: 'oarfish', name: 'Oarfish', rarity: 3, hp: 66, atk: 13, spd: 7, pre: 'Oar', suf: 'oar',
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
    id: 'shark', name: 'Shark', rarity: 3, hp: 62, atk: 16, spd: 10, pre: 'Shark', suf: 'shark',
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
  // ---------------- LEGENDARY ----------------
  {
    id: 'whale', name: 'Whale', rarity: 4, hp: 110, atk: 18, spd: 4, pre: 'Whale', suf: 'whale',
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
  // ---------------- MYTHIC ----------------
  {
    id: 'megalodon', name: 'Megalodon', rarity: 5, hp: 140, atk: 26, spd: 9, pre: 'Mega', suf: 'lodon',
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
export function mergeName(a, b) {
  if (a.id === b.id) return a.id === 'megalodon' ? 'Ultra Megalodon' : 'King ' + a.name;
  const n = a.pre + b.suf;
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
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

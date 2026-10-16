// Generates the Merge Animals app icon (32x32 pixel art) as SVG and scaled PNGs.
// Run: node scripts/make-icon.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const N = 32;
const px = Array.from({ length: N }, () => Array(N).fill(null));
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const hash = (x, y) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// water
const water = ['#4fb3e8', '#43a6df', '#3998d4', '#2f8ac8', '#277cbb', '#206fad', '#1a629e', '#15568f'];
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    let i = Math.min(water.length - 1, Math.floor(y / 4) + (hash(x, y) < 0.18 ? 1 : 0));
    px[y][x] = water[i];
  }
// light rays
for (let y = 0; y < 26; y++) for (const x0 of [6, 18]) { const x = x0 + Math.floor(y / 3); if (x < N && hash(x, y) < 0.7) px[y][x] = '#5cc0f0'; }
// sand + kelp
const sand = ['#e3cf8f', '#d8c27e', '#ecd99b', '#cdb571'];
for (let y = 27; y < N; y++) for (let x = 0; x < N; x++) if (y > 27 || hash(x, 3) < 0.6) px[y][x] = sand[Math.floor(hash(x, y) * 4)];
for (let y = 17; y < 28; y++) { px[y][2 + (y % 3 === 0 ? 1 : 0)] = '#3c8a2e'; px[y + 3 < 28 ? y + 3 : 27][29 - (y % 4 === 0 ? 1 : 0)] = '#4fa03a'; }

// the fused fish: clownfish head (right) flowing into shark tail (left)
const cx = 16, cy = 14, rx = 11, ry = 7;
const inBody = (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const inTail = (x, y) => { const d = Math.abs(y - cy); return x >= 1 && x <= 6 && d <= 1 + (6 - x) * 1.1 && d >= Math.max(0, (6 - x) * 0.7 - 0.5); };
const inFin = (x, y) => y >= 3 && y <= 8 && x >= 9 && x <= 15 && (y - 3) >= (15 - x) * 0.9 - 1 && x - 9 >= (8 - y) * 0.9 - 1.5;
const inFish = (x, y) => inBody(x, y) || inTail(x, y) || inFin(x, y);
const fishColor = (x, y) => {
  const shark = y > cy + 2 ? '#eef2f5' : '#7a8a9c';
  const band = x === 20 || x === 21 || x === 13 || x === 14;
  const bandEdge = x === 19 || x === 22 || x === 12 || x === 15;
  const clown = band ? '#ffffff' : bandEdge ? '#1a1a1a' : '#ff7b1c';
  const t = (x - 7) / 10 + (hash(x, y) - 0.5) * 0.6; // dithered blend: tail -> shark, head -> clown
  return t > 0.5 ? clown : shark;
};
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (inFish(x, y)) px[y][x] = inFin(x, y) && !inBody(x, y) ? '#7a8a9c' : fishColor(x, y);
// outline
const out = px.map((r) => r.slice());
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++)
    if (!inFish(x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inFish(x + dx, y + dy))) out[y][x] = '#10233a';
// eye + mouth
out[11][23] = '#ffffff'; out[11][24] = '#ffffff'; out[12][23] = '#ffffff'; out[12][24] = '#111111';
out[16][26] = '#10233a'; out[16][25] = '#10233a';
// sparkles & bubbles
for (const [x, y, c] of [[28, 4, '#fff6a0'], [5, 23, '#fff6a0']]) {
  out[y][x] = '#ffffff';
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) out[y + dy][x + dx] = c;
}
for (const [x, y] of [[28, 13], [29, 10], [27, 18]]) out[y][x] = '#dff6ff';

// ---- SVG ----
let rects = '';
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${out[y][x]}"/>`;
writeFileSync('public/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${rects}</svg>\n`);

// ---- PNG ----
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
}
function png(size) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = hex(out[Math.floor((y * N) / size)][Math.floor((x * N) / size)]);
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
writeFileSync('public/icon-512.png', png(512));
writeFileSync('public/icon-192.png', png(192));
writeFileSync('public/apple-touch-icon.png', png(192));
writeFileSync('public/favicon-32.png', png(32));
console.log('icons written');

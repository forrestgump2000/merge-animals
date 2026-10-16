import * as THREE from 'three';
import { hash3, mulberry32 } from './voxel.js';

export const UNIT = 0.1;

function noiseTexture(size, lo, hi, seed) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const rng = mulberry32(seed);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const v = Math.round(lo + rng() * (hi - lo));
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(x, y, 1, 1);
    }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function paletteTexture(size, colors, seed) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const rng = mulberry32(seed);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      g.fillStyle = colors[Math.floor(rng() * colors.length)];
      g.fillRect(x, y, 1, 1);
    }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const voxelTex = noiseTexture(4, 205, 255, 7);
const BOX = new THREE.BoxGeometry(UNIT, UNIT, UNIT);
const MAT = new THREE.MeshLambertMaterial({ map: voxelTex });
const GLOW = new THREE.MeshBasicMaterial({ map: voxelTex });

const _c = new THREE.Color();

// A blocky model built from voxels, rendered with instancing. Each voxel can be moved
// independently, which powers the swim wiggle, merge swirl and death explosion.
export class VoxelModel {
  constructor(voxels, opts = {}) {
    const set = new Set(voxels.map((v) => v.x + ',' + v.y + ',' + v.z));
    const solid = (x, y, z) => set.has(x + ',' + y + ',' + z);
    const surf = voxels.filter(
      (v) => !(solid(v.x + 1, v.y, v.z) && solid(v.x - 1, v.y, v.z) && solid(v.x, v.y + 1, v.z) &&
        solid(v.x, v.y - 1, v.z) && solid(v.x, v.y, v.z + 1) && solid(v.x, v.y, v.z - 1))
    );
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const v of surf) {
      x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x);
      y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
      z0 = Math.min(z0, v.z); z1 = Math.max(z1, v.z);
    }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    this.size = { x: (x1 - x0 + 1) * UNIT, y: (y1 - y0 + 1) * UNIT, z: (z1 - z0 + 1) * UNIT };
    this.halfLen = this.size.x / 2;
    this.group = new THREE.Group();
    this.inner = new THREE.Group();
    this.group.add(this.inner);
    this.n = surf.length;
    this.vox = surf;
    this.base = new Float32Array(this.n * 3);
    this.pos = new Float32Array(this.n * 3);
    this.scl = new Float32Array(this.n).fill(1);
    this.col = new Float32Array(this.n * 3);
    this.baseCol = new Float32Array(this.n * 3);
    this.meshIdx = new Int32Array(this.n);
    const nGlow = surf.filter((v) => v.g).length;
    this.mesh = new THREE.InstancedMesh(BOX, MAT, Math.max(1, this.n - nGlow));
    this.glow = new THREE.InstancedMesh(BOX, GLOW, Math.max(1, nGlow));
    this.mesh.count = this.n - nGlow;
    this.glow.count = nGlow;
    for (const m of [this.mesh, this.glow]) {
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      this.inner.add(m);
    }
    let ni = 0, gi = 0;
    surf.forEach((v, i) => {
      this.base[i * 3] = (v.x - cx) * UNIT;
      this.base[i * 3 + 1] = (v.y - cy) * UNIT;
      this.base[i * 3 + 2] = v.z * UNIT;
      const j = 0.92 + hash3(v.x, v.y, v.z) * 0.14;
      _c.setHex(v.c, THREE.SRGBColorSpace);
      this.baseCol[i * 3] = _c.r * j;
      this.baseCol[i * 3 + 1] = _c.g * j;
      this.baseCol[i * 3 + 2] = _c.b * j;
      this.meshIdx[i] = v.g ? -(gi++ + 1) : ni++;
    });
    this.pos.set(this.base);
    this.col.set(this.baseCol);
    this.xmin = (x0 - cx) * UNIT;
    this.wiggle = opts.wiggle ?? 1;
    this.flashT = 0;
    this.writeColors();
    this.writeMatrices();
  }
  voxelCenterSrc(i) {
    return this.vox[i];
  }
  writeMatrices() {
    const a = this.mesh.instanceMatrix.array, b = this.glow.instanceMatrix.array;
    for (let i = 0; i < this.n; i++) {
      const mi = this.meshIdx[i];
      const arr = mi >= 0 ? a : b;
      const o = (mi >= 0 ? mi : -mi - 1) * 16;
      const s = this.scl[i];
      arr[o] = s; arr[o + 1] = 0; arr[o + 2] = 0; arr[o + 3] = 0;
      arr[o + 4] = 0; arr[o + 5] = s; arr[o + 6] = 0; arr[o + 7] = 0;
      arr[o + 8] = 0; arr[o + 9] = 0; arr[o + 10] = s; arr[o + 11] = 0;
      arr[o + 12] = this.pos[i * 3]; arr[o + 13] = this.pos[i * 3 + 1]; arr[o + 14] = this.pos[i * 3 + 2]; arr[o + 15] = 1;
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.glow.instanceMatrix.needsUpdate = true;
  }
  writeColors() {
    for (let i = 0; i < this.n; i++) {
      const mi = this.meshIdx[i];
      const m = mi >= 0 ? this.mesh : this.glow;
      _c.setRGB(this.col[i * 3], this.col[i * 3 + 1], this.col[i * 3 + 2]);
      m.setColorAt(mi >= 0 ? mi : -mi - 1, _c);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    if (this.glow.instanceColor) this.glow.instanceColor.needsUpdate = true;
  }
  // tint toward a color (0..1), used for hit flashes
  tint(hex, amt) {
    _c.setHex(hex);
    for (let i = 0; i < this.n; i++) {
      this.col[i * 3] = this.baseCol[i * 3] * (1 - amt) + _c.r * amt;
      this.col[i * 3 + 1] = this.baseCol[i * 3 + 1] * (1 - amt) + _c.g * amt;
      this.col[i * 3 + 2] = this.baseCol[i * 3 + 2] * (1 - amt) + _c.b * amt;
    }
    this.writeColors();
  }
  // swimming: an undulating wave that grows toward the tail
  swim(t, amp = 1) {
    const len = Math.max(0.5, -this.xmin);
    for (let i = 0; i < this.n; i++) {
      const x = this.base[i * 3];
      const k = x < 0.2 ? Math.min(1, (0.2 - x) / len) : 0;
      this.pos[i * 3] = x;
      this.pos[i * 3 + 1] = this.base[i * 3 + 1];
      this.pos[i * 3 + 2] = this.base[i * 3 + 2] + Math.sin(t * 7 - x * 3) * k * k * 0.22 * amp * this.wiggle;
    }
    this.writeMatrices();
  }
  dispose() {
    this.group.removeFromParent();
    this.mesh.dispose();
    this.glow.dispose();
  }
}

// ---------- the underwater world ----------
export function createWorld(renderer) {
  const scene = new THREE.Scene();
  const water = new THREE.Color(0x1f6fa8);
  scene.background = water;
  scene.fog = new THREE.Fog(0x1f6fa8, 9, 26);

  scene.add(new THREE.HemisphereLight(0xcfeaff, 0x806a40, 2.1));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(3, 8, 6);
  scene.add(sun);

  const S = 0.5;
  const block = new THREE.BoxGeometry(S, S, S);
  const sandMat = new THREE.MeshLambertMaterial({
    map: paletteTexture(8, ['#e3cf8f', '#d8c27e', '#ecd99b', '#cdb571', '#f0e0a8'], 3),
  });
  const stoneMat = new THREE.MeshLambertMaterial({
    map: paletteTexture(8, ['#8a8a8a', '#7a7a7a', '#999', '#6c6c6c', '#a3a3a3'], 4),
  });
  const rng = mulberry32(42);
  const floorY = -2.6;
  const sand = [], stone = [];
  for (let x = -24; x <= 24; x++)
    for (let z = -16; z <= 4; z++) {
      const h = Math.floor(hash3(Math.floor(x / 3), 0, Math.floor(z / 3)) * 2 + hash3(x, 1, z) * 1.2);
      for (let y = -1; y < h; y++) (hash3(x, y + 5, z) < 0.06 ? stone : sand).push([x * S, floorY + y * S, z * S]);
    }
  const mk = (list, mat) => {
    const m = new THREE.InstancedMesh(block, mat, list.length);
    const o = new THREE.Object3D();
    list.forEach((p, i) => {
      o.position.set(...p);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    scene.add(m);
    return m;
  };
  mk(sand, sandMat);
  mk(stone, stoneMat);

  // kelp, coral and rocks
  const smallBlock = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const decoMat = new THREE.MeshLambertMaterial({ map: voxelTex });
  const kelps = [];
  const deco = [];
  for (let i = 0; i < 26; i++) {
    const x = (rng() - 0.5) * 22, z = -2.5 - rng() * 5;
    if (Math.abs(x) < 1 && z > -3) continue;
    const h = 6 + Math.floor(rng() * 12);
    const kelp = { x, z, h, phase: rng() * 6, blocks: [] };
    for (let k = 0; k < h; k++) kelp.blocks.push(k);
    kelps.push(kelp);
  }
  const kelpCount = kelps.reduce((s, k) => s + k.h, 0);
  const kelpMesh = new THREE.InstancedMesh(smallBlock, decoMat, kelpCount);
  kelpMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  let ki = 0;
  for (const k of kelps)
    for (let j = 0; j < k.h; j++) {
      _c.setHex(j % 3 === 0 ? 0x3c8a2e : j % 3 === 1 ? 0x2f7a25 : 0x4fa03a, THREE.SRGBColorSpace);
      kelpMesh.setColorAt(ki++, _c);
    }
  scene.add(kelpMesh);
  const coralColors = [0xff6f91, 0xff9f43, 0xb46cff, 0xffd166, 0x4ecdc4];
  for (let i = 0; i < 18; i++) {
    const x = (rng() - 0.5) * 20, z = -1.5 - rng() * 6;
    const c = coralColors[Math.floor(rng() * coralColors.length)];
    const n = 3 + Math.floor(rng() * 6);
    let px = x, py = floorY + 0.25, pz = z;
    for (let j = 0; j < n; j++) {
      deco.push([px, py, pz, c]);
      py += 0.3;
      if (rng() < 0.4) px += rng() < 0.5 ? 0.3 : -0.3;
      if (rng() < 0.3) deco.push([px + 0.3, py, pz, c]);
    }
  }
  const decoMesh = new THREE.InstancedMesh(smallBlock, decoMat, deco.length);
  const o = new THREE.Object3D();
  deco.forEach((d, i) => {
    o.position.set(d[0], d[1], d[2]);
    o.updateMatrix();
    decoMesh.setMatrixAt(i, o.matrix);
    _c.setHex(d[3], THREE.SRGBColorSpace);
    decoMesh.setColorAt(i, _c);
  });
  scene.add(decoMesh);

  // light shafts
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xbfe8ff, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const rays = [];
  for (let i = 0; i < 7; i++) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(0.8 + rng(), 20), rayMat);
    r.position.set((rng() - 0.5) * 18, 5, -6 - rng() * 4);
    r.rotation.z = 0.35;
    rays.push(r);
    scene.add(r);
  }

  // bubbles
  const NB = 70;
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.55 });
  const bubbles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), bubbleMat, NB);
  bubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bubbles.frustumCulled = false;
  const bub = [];
  for (let i = 0; i < NB; i++) bub.push({ x: (rng() - 0.5) * 18, y: floorY + rng() * 10, z: -1 - rng() * 6, s: 0.5 + rng(), v: 0.4 + rng() * 0.6 });
  scene.add(bubbles);

  // bursts of bubbles (splashes, hits)
  const NP = 240;
  const partMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }), NP);
  partMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  partMesh.frustumCulled = false;
  const parts = [];
  scene.add(partMesh);

  function burst(pos, n = 20, color = 0xdff6ff, speed = 2) {
    for (let i = 0; i < n; i++) {
      if (parts.length >= NP) parts.shift();
      parts.push({
        x: pos.x, y: pos.y, z: pos.z,
        vx: (Math.random() - 0.5) * speed, vy: Math.random() * speed * 0.8 + 0.3, vz: (Math.random() - 0.5) * speed,
        life: 0.8 + Math.random() * 0.6, age: 0, color,
      });
    }
  }

  const m4 = new THREE.Matrix4();
  function update(t, dt) {
    let i = 0;
    for (const k of kelps)
      for (let j = 0; j < k.h; j++) {
        const sway = Math.sin(t * 1.2 + k.phase + j * 0.25) * j * 0.025;
        m4.makeTranslation(k.x + sway, floorY + 0.25 + j * 0.3, k.z);
        kelpMesh.setMatrixAt(i++, m4);
      }
    kelpMesh.instanceMatrix.needsUpdate = true;
    bub.forEach((b, j) => {
      b.y += b.v * dt;
      if (b.y > 7) b.y = floorY;
      m4.makeScale(b.s, b.s, b.s).setPosition(b.x + Math.sin(t * 2 + j) * 0.05, b.y, b.z);
      bubbles.setMatrixAt(j, m4);
    });
    bubbles.instanceMatrix.needsUpdate = true;
    rays.forEach((r, j) => (r.material.opacity = 0.05 + Math.sin(t * 0.5 + j) * 0.025));
    for (let j = parts.length - 1; j >= 0; j--) {
      const p = parts[j];
      p.age += dt;
      if (p.age > p.life) { parts.splice(j, 1); continue; }
      p.vy += 0.6 * dt;
      p.vx *= 0.97; p.vz *= 0.97;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    }
    for (let j = 0; j < NP; j++) {
      const p = parts[j];
      if (!p) { m4.makeScale(0, 0, 0); partMesh.setMatrixAt(j, m4); continue; }
      const s = 1 - p.age / p.life;
      m4.makeScale(s, s, s).setPosition(p.x, p.y, p.z);
      partMesh.setMatrixAt(j, m4);
      _c.setHex(p.color);
      partMesh.setColorAt(j, _c);
    }
    partMesh.instanceMatrix.needsUpdate = true;
    if (partMesh.instanceColor) partMesh.instanceColor.needsUpdate = true;
  }

  return { scene, update, burst };
}

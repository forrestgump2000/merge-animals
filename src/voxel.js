// Voxel builder: a tiny DSL for drawing blocky (Minecraft-style) creatures.
// Coordinates: x = length (head points +x), y = up, z = width (symmetric around 0).

export function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const colorAt = (col, x, y, z) => (typeof col === 'function' ? col(x, y, z) : col);

function pointInPoly(px, py, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  const qx = ax + dx * t - px, qy = ay + dy * t - py;
  return Math.sqrt(qx * qx + qy * qy);
}

function inPolyThick(px, py, pts) {
  if (pointInPoly(px, py, pts)) return true;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    if (distToSeg(px, py, pts[j][0], pts[j][1], pts[i][0], pts[i][1]) <= 0.5) return true;
  }
  return false;
}

export class VB {
  constructor(seed = 1) {
    this.m = new Map();
    this.rng = mulberry32(seed);
  }
  static key(x, y, z) {
    return x + ',' + y + ',' + z;
  }
  set(x, y, z, c, glow = false, tag = 'b') {
    x = Math.round(x); y = Math.round(y); z = Math.round(z);
    this.m.set(VB.key(x, y, z), { x, y, z, c: colorAt(c, x, y, z), g: glow, t: tag });
  }
  has(x, y, z) {
    return this.m.has(VB.key(x, y, z));
  }
  get(x, y, z) {
    return this.m.get(VB.key(x, y, z));
  }
  del(x, y, z) {
    this.m.delete(VB.key(x, y, z));
  }
  ellipsoid(cx, cy, cz, rx, ry, rz, col, opt = {}) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
        for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++) {
          const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2;
          if (d <= 1) this.set(x, y, z, col, opt.glow, opt.tag);
        }
  }
  box(x0, y0, z0, x1, y1, z1, col, opt = {}) {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) this.set(x, y, z, col, opt.glow, opt.tag);
  }
  // flat polygon in the XY plane, extruded over z0..z1
  polyXY(pts, z0, z1, col) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++)
      for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
        if (inPolyThick(x, y, pts)) for (let z = z0; z <= z1; z++) this.set(x, y, z, col);
  }
  // flat polygon in the XZ plane (points are [x, z]), extruded over y0..y1
  polyXZ(pts, y0, y1, col, mirror = false) {
    const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++)
      for (let z = Math.floor(Math.min(...zs)); z <= Math.ceil(Math.max(...zs)); z++)
        if (inPolyThick(x, z, pts))
          for (let y = y0; y <= y1; y++) {
            this.set(x, y, z, col);
            if (mirror) this.set(x, y, -z, col);
          }
  }
  capsule(ax, ay, az, bx, by, bz, r1, r2, col, opt = {}) {
    const r = Math.max(r1, r2);
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    const l2 = dx * dx + dy * dy + dz * dz || 1;
    for (let x = Math.floor(Math.min(ax, bx) - r); x <= Math.ceil(Math.max(ax, bx) + r); x++)
      for (let y = Math.floor(Math.min(ay, by) - r); y <= Math.ceil(Math.max(ay, by) + r); y++)
        for (let z = Math.floor(Math.min(az, bz) - r); z <= Math.ceil(Math.max(az, bz) + r); z++) {
          const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy + (z - az) * dz) / l2));
          const qx = ax + dx * t - x, qy = ay + dy * t - y, qz = az + dz * t - z;
          const rr = Math.max(0.55, r1 + (r2 - r1) * t);
          if (qx * qx + qy * qy + qz * qz <= rr * rr) this.set(x, y, z, col, opt.glow, opt.tag);
        }
  }
  chain(pts, col, opt) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay, az, ar] = pts[i];
      const [bx, by, bz, br] = pts[i + 1];
      this.capsule(ax, ay, az, bx, by, bz, ar, br, col, opt);
    }
  }
  paint(pred, col) {
    for (const v of this.m.values()) if (pred(v)) v.c = colorAt(col, v.x, v.y, v.z);
  }
  removeIf(pred) {
    for (const [k, v] of this.m) if (pred(v)) this.m.delete(k);
  }
  // Minecraft-mob style eyes, placed on the outer surface on both sides.
  eyes(spec) {
    const s = spec.size || 2;
    const pupil = spec.pupil ?? 0x111111;
    const white = spec.white ?? 0xffffff;
    for (let a = 0; a < s; a++)
      for (let b = 0; b < s; b++) {
        const isPupil = s === 1 || (a < s / 2 && b < Math.max(1, s - 1));
        const c = isPupil ? pupil : white;
        const g = isPupil && !!spec.glow;
        if (spec.mode === 'top') {
          const ex = spec.x - a;
          for (const ez of [spec.z + b, -(spec.z + b)]) {
            let y = 0;
            if (!this.has(ex, 0, ez)) continue;
            while (this.has(ex, y + 1, ez)) y++;
            this.set(ex, y, ez, c, g, 'e');
          }
        } else {
          const ex = spec.x - a, ey = spec.y + b;
          if (!this.has(ex, ey, 0)) continue;
          let z = 0;
          while (this.has(ex, ey, z + 1)) z++;
          this.set(ex, ey, z, c, g, 'e');
          this.set(ex, ey, -z, c, g, 'e');
        }
      }
  }
  list() {
    return [...this.m.values()];
  }
}

export function fibDirs(n) {
  const out = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    out.push([Math.cos(g * i) * r, y, Math.sin(g * i) * r]);
  }
  return out;
}

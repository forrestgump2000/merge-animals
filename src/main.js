import * as THREE from 'three';
import './style.css';
import { VoxelModel, createWorld } from './render.js';
import { FISH, RARITIES, BAITS, fishVoxels, makeCreature, rollFish, simulate, winChance } from './fish.js';
import { sfx, unlock, toggleMute, isMuted } from './audio.js';
import { pixelIcon } from './icons.js';

// ---------------- save data ----------------
const SAVE_KEY = 'mergeAnimals.save.v1';
const save = { coins: 50, bait: {}, using: 'worm', caught: {}, merges: {}, wins: 0, losses: 0, tank: [] };
try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch {}
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {} };

// ---------------- three.js setup ----------------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
const world = createWorld(renderer);
const scene = world.scene;
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const camBase = new THREE.Vector3(0, 0.9, 9.5);
camera.position.copy(camBase);
camera.lookAt(0, 0.2, 0);
const stage = new THREE.Group();
scene.add(stage);

let L = {};
function layout() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const portrait = camera.aspect < 0.9;
  L = portrait
    ? { slotX: 1.35, fit: 2.5, battleX: 1.45, battleFit: 2.6, mergeFit: 3.3, y: 0.9 }
    : { slotX: 2.3, fit: 3.4, battleX: 2.5, battleFit: 3.6, mergeFit: 4.6, y: 0.45 };
  const need = L.slotX + L.fit / 2 + 0.25;
  const halfW = Math.tan(THREE.MathUtils.degToRad(22.5)) * camBase.z * camera.aspect;
  stage.scale.setScalar(Math.min(1, halfW / need));
  stage.position.y = L.y;
}
window.addEventListener('resize', () => {
  layout();
  relayout();
});
layout();

// put resting actors back where the current layout wants them (after a resize/rotate)
function relayout() {
  if (G.busy) return;
  const place = (a, x, fit) => {
    if (!a) return;
    a.model.group.position.x = x;
    const s = fitScale(a.model, fit);
    a.model.group.scale.setScalar(s);
    a.labelDy = a.model.size.y * s * 0.5 + 0.35;
  };
  if (G.phase === 'roll1' || G.phase === 'merge') {
    place(G.fishActors[0], -L.slotX, L.fit);
    place(G.fishActors[1], L.slotX, L.fit);
  } else if (G.phase === 'merged') {
    place(G.cActors[G.team], 0, L.mergeFit);
  } else if (G.phase === 'pick' || G.phase === 'result') {
    place(G.cActors[0], -L.battleX, L.battleFit);
    place(G.cActors[1], L.battleX, L.battleFit);
  }
}

// ---------------- tweens & actors ----------------
const tweens = [];
const ease = {
  inOut: (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2),
  out: (k) => 1 - (1 - k) ** 3,
  in: (k) => k * k * k,
  lin: (k) => k,
  back: (k) => 1 + 2.7 * (k - 1) ** 3 + 1.7 * (k - 1) ** 2,
};
function tween(ms, fn, e = ease.inOut) {
  return new Promise((res) => tweens.push({ t: 0, dur: ms / 1000, fn, e, res }));
}
const wait = (ms) => tween(ms, () => {});
const lerp = (a, b, k) => a + (b - a) * k;

const actors = new Set();
function addActor(model, opts = {}) {
  const a = { model, mode: 'swim', amp: 1, phase: Math.random() * 6, bob: 0.08, ...opts };
  actors.add(a);
  stage.add(model.group);
  return a;
}
function removeActor(a) {
  if (!a) return;
  actors.delete(a);
  if (a.label) a.label.remove();
  a.model.dispose();
}
function fitScale(model, max) {
  return Math.min(1.25, max / Math.max(model.size.x, model.size.y * 1.15));
}

// ---------------- DOM helpers ----------------
const $ = (id) => document.getElementById(id);
const labelsEl = $('labels');
const tmpV = new THREE.Vector3();
function project(obj, dy = 0) {
  obj.getWorldPosition(tmpV);
  tmpV.y += dy;
  tmpV.project(camera);
  return { x: (tmpV.x * 0.5 + 0.5) * window.innerWidth, y: (-tmpV.y * 0.5 + 0.5) * window.innerHeight };
}
function attachLabel(actor, html, dy) {
  const el = document.createElement('div');
  el.className = 'label';
  el.innerHTML = html;
  labelsEl.appendChild(el);
  actor.label = el;
  actor.labelDy = dy;
  return el;
}
function floatText(obj, text, cls = '') {
  const p = project(obj, 0.6);
  const el = document.createElement('div');
  el.className = 'float ' + cls;
  el.textContent = text;
  el.style.left = p.x + 'px';
  el.style.top = p.y + 'px';
  labelsEl.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}
let toastTimer;
function toast(html) {
  const t = $('toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function flash(color = '#fff') {
  const f = $('flash');
  f.style.background = color;
  f.classList.remove('go');
  void f.offsetWidth;
  f.classList.add('go');
}
let shakeT = 0, shakeAmp = 0;
const shake = (amp = 0.15, t = 0.35) => { shakeAmp = amp; shakeT = t; };

const rar = (i) => RARITIES[i];
const rarTag = (i) => `<span class="rar" style="color:${rar(i).color}">${rar(i).name}</span>`;
const nameTag = (name, i) => `<span style="color:${rar(i).color}">${name}</span>`;
const coinImg = () => `<img class="ico" src="${pixelIcon('coin')}" alt="">`;

// ---------------- HUD ----------------
// ---------------- selling ----------------
const TANK_MAX = 40;
// winners in the Tank are battle veterans and sell for double
function sellPrice(c, veteran = false) {
  return Math.max(2, Math.round(c.value * (veteran ? 4 : 2) * (1 + c.rarity * 0.15)));
}

async function sellCurrent() {
  if (G.busy) return;
  G.busy = true;
  render();
  const a = G.cActors[G.team], c = G.creatures[G.team];
  const price = sellPrice(c);
  a.label?.remove(); a.label = null;
  a.model.group.getWorldPosition(tmpV);
  world.burst(tmpV.clone(), 40, 0xffd700, 3);
  sfx.coin();
  const s0 = a.model.group.scale.x;
  await tween(500, (e) => { a.model.group.scale.setScalar(s0 * (1 - e)); a.model.group.rotation.y = e * Math.PI * 3; }, ease.in);
  removeActor(a);
  G.cActors[G.team] = null;
  G.creatures[G.team] = null;
  save.coins += price;
  persist();
  toast(`Sold ${nameTag(c.name, c.rarity)} for ${coinImg()}${price}!`);
  G.fish = [null, null];
  G.busy = false;
  G.phase = 'roll0';
  render();
}

function openTank() {
  const p = $('panel');
  p.className = 'panel';
  const total = save.tank.reduce((s, c) => s + sellPrice(c, true), 0);
  p.innerHTML = `<div class="ptitle">Your Tank <small>${save.tank.length}/${TANK_MAX} · ${coinImg()}${save.coins}</small></div>
    <div class="hint dark">Creatures that win battles for you live here. Sell them for coins!</div>
    <div class="tank">${save.tank.length ? save.tank.map((c, i) => `<div class="bait">
      <div class="binfo"><div class="bname" style="color:${RARITIES[c.rarity].color}">${c.name}</div>
      <div class="bdesc">${c.a} + ${c.b} · ${RARITIES[c.rarity].name} · ❤ ${c.hp} ⚔ ${c.atk}</div></div>
      <button class="mc-btn small" data-sell="${i}">Sell ${coinImg()}${sellPrice(c, true)}</button></div>`).join('')
      : '<div class="empty-tank">Empty! Win a battle to add your fighter here.</div>'}</div>
    ${save.tank.length > 1 ? `<button class="mc-btn gold close" id="sellAll">Sell All for ${coinImg()}${total}</button>` : ''}
    <button class="mc-btn close" id="closeModal">Close</button>`;
  p.querySelectorAll('[data-sell]').forEach((b) => (b.onclick = () => {
    const c = save.tank.splice(Number(b.dataset.sell), 1)[0];
    save.coins += sellPrice(c, true);
    persist(); sfx.coin(); updateHud();
    toast(`Sold ${nameTag(c.name, c.rarity)}!`);
    openTank();
  }));
  if ($('sellAll')) $('sellAll').onclick = () => {
    save.coins += total;
    save.tank = [];
    persist(); sfx.coin(); updateHud();
    toast(`Sold everything for ${coinImg()}${total}!`);
    openTank();
  };
  $('closeModal').onclick = closeModal;
  $('modal').hidden = false;
}

function updateHud() {
  $('coins').textContent = save.coins;
  const b = BAITS.find((x) => x.id === save.using) || BAITS[0];
  $('baitIco').src = pixelIcon(b.id);
  $('baitName').textContent = b.id === 'worm' ? 'Worm ∞' : `${b.name} ×${save.bait[b.id] || 0}`;
  $('muteBtn').textContent = isMuted() ? '♪̸' : '♪';
  $('muteBtn').classList.toggle('off', isMuted());
}
$('coinIco').src = pixelIcon('coin');

// ---------------- game state ----------------
const G = { phase: 'title', team: 0, fish: [null, null], fishActors: [null, null], creatures: [null, null], cActors: [null, null], busy: false, pick: -1, odds: null };

function setMsg(html) { $('msg').innerHTML = html; }
function setActions(list) {
  const el = $('actions');
  el.innerHTML = '';
  for (const a of list) {
    const b = document.createElement('button');
    b.className = 'mc-btn ' + (a.cls || '');
    b.innerHTML = a.label;
    b.disabled = G.busy || !!a.disabled;
    b.onclick = () => { sfx.click(); a.onClick(); };
    el.appendChild(b);
  }
}

function slotsHtml() {
  const f = G.fish;
  const chip = (x) => (x ? `<span class="chip" style="border-color:${rar(x.rarity).color}">${nameTag(x.name, x.rarity)}</span>` : '<span class="chip empty">?</span>');
  const prev = G.team === 1 && G.creatures[0]
    ? `<div class="prev">Creature 1: ${nameTag(G.creatures[0].name, G.creatures[0].rarity)}</div>` : '';
  return `${prev}<div class="slots"><b>Creature ${G.team + 1}:</b> ${chip(f[0])} + ${chip(f[1])}</div>`;
}

function creatureCard(c) {
  return `<div class="card"><div class="cname">${nameTag(c.name, c.rarity)}</div>
    <div class="csub">${c.a.name} + ${c.b.name} · ${rarTag(c.rarity)}</div>
    <div class="cstats"><span>❤ ${c.hp}</span><span>⚔ ${c.atk}</span><span>⚡ ${c.spd.toFixed(1)}</span></div></div>`;
}

function render() {
  updateHud();
  const p = G.phase;
  if (p === 'roll0' || p === 'roll1') {
    setMsg(slotsHtml() + `<div class="hint">Cast your line to catch fish #${p === 'roll0' ? 1 : 2}!</div>`);
    setActions([{ label: '🎣 Cast Line', cls: 'big', onClick: castLine }]);
  } else if (p === 'merge') {
    setMsg(slotsHtml() + `<div class="hint">Two fish caught. Time to merge them!</div>`);
    setActions([{ label: '✨ MERGE!', cls: 'big gold', onClick: doMerge }]);
  } else if (p === 'merged') {
    const c = G.creatures[G.team];
    setMsg(creatureCard(c));
    setActions([
      G.team === 0
        ? { label: 'Make Creature 2 ▶', cls: 'big', onClick: nextCreature }
        : { label: '⚔ Choose Your Fighter', cls: 'big gold', onClick: toFight },
      { label: `💰 Sell ${coinImg()}${sellPrice(c)}`, onClick: sellCurrent },
    ]);
  } else if (p === 'pick') {
    const [c0, c1] = G.creatures;
    setMsg(`<div class="hint">Who will win? Pick your fighter! Underdogs pay more.</div>`);
    setActions([0, 1].map((i) => {
      const c = G.creatures[i];
      return {
        label: `<span class="pname" style="color:${rar(c.rarity).color}">${c.name}</span>
          <span class="psub">Win ${Math.round(G.odds[i] * 100)}% · Pays ${coinImg()}${G.payout[i]}</span>`,
        cls: 'pick',
        onClick: () => battle(i),
      };
    }));
    void c0; void c1;
  } else if (p === 'battle') {
    setMsg(`<div class="hint">You picked ${nameTag(G.creatures[G.pick].name, G.creatures[G.pick].rarity)}. FIGHT!</div>`);
    setActions([]);
  } else if (p === 'result') {
    setActions([{ label: '🎣 Play Again', cls: 'big', onClick: startRound }]);
  }
}

// ---------------- round flow ----------------
function clearStage() {
  for (const a of [...actors]) removeActor(a);
  G.fishActors = [null, null];
  G.cActors = [null, null];
}

function startRound() {
  clearStage();
  $('hpbars').hidden = true;
  G.team = 0;
  G.fish = [null, null];
  G.creatures = [null, null];
  G.phase = 'roll0';
  render();
}

function currentBait() {
  let b = BAITS.find((x) => x.id === save.using) || BAITS[0];
  if (b.id !== 'worm' && !(save.bait[b.id] > 0)) { save.using = 'worm'; b = BAITS[0]; }
  return b;
}

function beam(x, color) {
  const geo = new THREE.BoxGeometry(0.9, 12, 0.9);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, 4, -0.6);
  stage.add(m);
  tween(1600, (e) => { mat.opacity = 0.4 * (1 - e); m.scale.x = m.scale.z = 1 + e; }, ease.lin).then(() => { m.removeFromParent(); geo.dispose(); mat.dispose(); });
}

async function castLine() {
  if (G.busy) return;
  G.busy = true;
  const slot = G.phase === 'roll0' ? 0 : 1;
  const bait = currentBait();
  if (bait.id !== 'worm') {
    save.bait[bait.id]--;
    if (save.bait[bait.id] <= 0) { toast(`Out of ${bait.name}! Switched to Worm.`); save.using = 'worm'; }
  }
  const fish = rollFish(bait);
  render();
  const x = slot === 0 ? -L.slotX : L.slotX;
  sfx.splash();
  const sp = new THREE.Vector3(x * stage.scale.x, -1.5, 0);
  world.burst(sp, 30);
  for (let i = 0; i < 14; i++) {
    const r = FISH[Math.floor(Math.random() * FISH.length)];
    setMsg(slotsHtml() + `<div class="reel">🎣 ${nameTag(r.name, r.rarity)}</div>`);
    sfx.reel();
    await wait(55 + i * 9);
  }
  G.fish[slot] = fish;
  setMsg(slotsHtml() + `<div class="reel big">You caught a ${nameTag(fish.name, fish.rarity)}! ${rarTag(fish.rarity)}</div>`);
  const model = new VoxelModel(fishVoxels(fish));
  const s = fitScale(model, L.fit);
  model.group.scale.setScalar(s);
  model.group.rotation.y = slot === 0 ? 0 : Math.PI;
  model.inner.rotation.x = fish.tilt || 0;
  const actor = addActor(model);
  G.fishActors[slot] = actor;
  model.group.position.set(x, -4, 0);
  sfx.reveal(fish.rarity);
  if (fish.rarity >= 2) beam(x, new THREE.Color(rar(fish.rarity).color).getHex());
  if (fish.rarity >= 4) { shake(0.2, 0.5); flash(rar(fish.rarity).color); }
  if (fish.rarity === 5) toast('🔥 <b>MYTHIC CATCH!</b> 🔥');
  await tween(700, (e, k) => {
    model.group.position.y = lerp(-4, 0, e) + Math.sin(k * Math.PI) * 0.8;
    model.inner.rotation.z = (1 - e) * Math.PI * 2;
  }, ease.out);
  world.burst(new THREE.Vector3(x * stage.scale.x, stage.position.y, 0), 14);
  attachLabel(actor, `${nameTag(fish.name, fish.rarity)}`, model.size.y * s * 0.5 + 0.35);
  if (!save.caught[fish.id]) { save.caught[fish.id] = true; toast(`New Fishdex entry: ${nameTag(fish.name, fish.rarity)}!`); }
  persist();
  G.busy = false;
  G.phase = slot === 0 ? 'roll1' : 'merge';
  render();
}

async function doMerge() {
  if (G.busy) return;
  G.busy = true;
  render();
  const [fa, fb] = G.fish;
  const [aa, ab] = G.fishActors;
  const creature = makeCreature(fa, fb);
  for (const a of [aa, ab]) { a.label?.remove(); a.label = null; }
  sfx.whoosh();
  const ax = aa.model.group.position.x, bx = ab.model.group.position.x;
  await tween(900, (e) => {
    aa.model.group.position.x = lerp(ax, -0.6, e);
    ab.model.group.position.x = lerp(bx, 0.6, e);
    aa.model.group.rotation.y = e * e * Math.PI * 4;
    ab.model.group.rotation.y = Math.PI + e * e * Math.PI * 4;
    aa.amp = ab.amp = 1 + e * 3;
  }, ease.in);

  // Build the merged creature, then fly every voxel in from the two fish.
  const target = new VoxelModel(creature.voxels);
  const sc = fitScale(target, L.mergeFit);
  target.group.scale.setScalar(sc);
  const ta = addActor(target, { mode: 'manual' });
  stage.updateMatrixWorld(true);
  const n = target.n;
  const src = new Float32Array(n * 3), srcCol = new Float32Array(n * 3), delay = new Float32Array(n), lift = new Float32Array(n);
  const inv = new THREE.Matrix4().copy(target.inner.matrixWorld).invert();
  const pools = [aa.model, ab.model].map((m) => {
    const idx = [...Array(m.n).keys()];
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return { m, idx, c: 0 };
  });
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const pool = pools[target.vox[i].src ?? 0];
    const j = pool.idx[pool.c++ % pool.idx.length];
    v.set(pool.m.pos[j * 3], pool.m.pos[j * 3 + 1], pool.m.pos[j * 3 + 2]).applyMatrix4(pool.m.inner.matrixWorld).applyMatrix4(inv);
    src[i * 3] = v.x; src[i * 3 + 1] = v.y; src[i * 3 + 2] = v.z;
    srcCol[i * 3] = pool.m.baseCol[j * 3]; srcCol[i * 3 + 1] = pool.m.baseCol[j * 3 + 1]; srcCol[i * 3 + 2] = pool.m.baseCol[j * 3 + 2];
    delay[i] = Math.random() * 0.35;
    lift[i] = (Math.random() - 0.3) * 1.6;
  }
  removeActor(aa); removeActor(ab);
  G.fishActors = [null, null];
  world.burst(new THREE.Vector3(0, stage.position.y, 0), 50, 0xfff2a8, 3);
  await tween(1700, (e, k) => {
    for (let i = 0; i < n; i++) {
      const kk = Math.min(1, Math.max(0, (k - delay[i]) / 0.65));
      const q = ease.inOut(kk);
      let px = lerp(src[i * 3], target.base[i * 3], q);
      let pz = lerp(src[i * 3 + 2], target.base[i * 3 + 2], q);
      const ang = (1 - q) * 6;
      const r = 1 + Math.sin(q * Math.PI) * 0.6;
      const c = Math.cos(ang), s = Math.sin(ang);
      target.pos[i * 3] = (px * c - pz * s) * r;
      target.pos[i * 3 + 2] = (px * s + pz * c) * r;
      target.pos[i * 3 + 1] = lerp(src[i * 3 + 1], target.base[i * 3 + 1], q) + Math.sin(q * Math.PI) * lift[i];
      target.scl[i] = 1 + Math.sin(q * Math.PI) * 0.8;
      for (let ch = 0; ch < 3; ch++) target.col[i * 3 + ch] = lerp(srcCol[i * 3 + ch], target.baseCol[i * 3 + ch], q);
    }
    target.writeMatrices();
    target.writeColors();
  }, ease.lin);
  target.scl.fill(1);
  sfx.boom();
  flash(rar(creature.rarity).color);
  shake(0.18, 0.4);
  world.burst(new THREE.Vector3(0, stage.position.y, 0), 60, 0xffffff, 4);
  if (creature.rarity >= 2) beam(0, new THREE.Color(rar(creature.rarity).color).getHex());
  ta.mode = 'swim';
  await tween(500, (e) => target.group.scale.setScalar(sc * lerp(1.35, 1, e)), ease.back);
  attachLabel(ta, `${nameTag(creature.name, creature.rarity)}<small>${rar(creature.rarity).name}</small>`, target.size.y * sc * 0.5 + 0.4);
  G.creatures[G.team] = creature;
  G.cActors[G.team] = ta;
  if (!save.merges[creature.name]) { save.merges[creature.name] = creature.rarity; persist(); }
  G.busy = false;
  G.phase = 'merged';
  render();
}

async function nextCreature() {
  if (G.busy) return;
  G.busy = true;
  render();
  const a = G.cActors[0];
  a.label?.remove(); a.label = null;
  a.amp = 2.5;
  const x0 = a.model.group.position.x;
  a.model.group.rotation.y = Math.PI;
  sfx.whoosh();
  await tween(800, (e) => (a.model.group.position.x = lerp(x0, -14, e)), ease.in);
  removeActor(a);
  G.cActors[0] = null;
  G.team = 1;
  G.fish = [null, null];
  G.busy = false;
  G.phase = 'roll0';
  render();
}

async function toFight() {
  if (G.busy) return;
  G.busy = true;
  render();
  const [c0, c1] = G.creatures;
  const p0 = winChance(c0, c1);
  G.odds = [p0, 1 - p0];
  const base = 3 * (c0.value + c1.value);
  G.payout = G.odds.map((p) => Math.max(3, Math.min(base * 8, Math.round(base / p))));

  const right = G.cActors[1];
  right.label?.remove(); right.label = null;
  const m0 = new VoxelModel(c0.voxels);
  const s0 = fitScale(m0, L.battleFit);
  m0.group.scale.setScalar(s0);
  m0.group.position.set(-14, 0, 0);
  const left = addActor(m0);
  G.cActors[0] = left;
  const s1 = fitScale(right.model, L.battleFit);
  const startS = right.model.group.scale.x;
  sfx.whoosh();
  await tween(1000, (e) => {
    m0.group.position.x = lerp(-14, -L.battleX, e);
    right.model.group.position.x = lerp(0, L.battleX, e);
    right.model.group.rotation.y = lerp(0, Math.PI, e);
    right.model.group.scale.setScalar(lerp(startS, s1, e));
  }, ease.out);
  attachLabel(left, nameTag(c0.name, c0.rarity), m0.size.y * s0 * 0.5 + 0.35);
  attachLabel(right, nameTag(c1.name, c1.rarity), right.model.size.y * s1 * 0.5 + 0.35);
  G.busy = false;
  G.phase = 'pick';
  render();
}

function setHp(i, hp, max) {
  const el = $('hp' + i);
  el.querySelector('.fill').style.width = (100 * hp) / max + '%';
  el.querySelector('.hpnum').textContent = `${hp} / ${max}`;
}

async function explode(actor) {
  const m = actor.model;
  actor.mode = 'manual';
  actor.label?.remove(); actor.label = null;
  const n = m.n, vel = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const bx = m.base[i * 3], by = m.base[i * 3 + 1], bz = m.base[i * 3 + 2];
    const d = Math.hypot(bx, by, bz) || 1;
    const sp = 1.5 + Math.random() * 2.5;
    vel[i * 3] = (bx / d) * sp + (Math.random() - 0.5);
    vel[i * 3 + 1] = (by / d) * sp + Math.random() * 1.5;
    vel[i * 3 + 2] = (bz / d) * sp + (Math.random() - 0.5);
  }
  sfx.explode();
  shake(0.25, 0.5);
  flash('#ff5555');
  await tween(1500, (e, k) => {
    const t = k * 1.5;
    for (let i = 0; i < n; i++) {
      m.pos[i * 3] = m.base[i * 3] + vel[i * 3] * t;
      m.pos[i * 3 + 1] = m.base[i * 3 + 1] + vel[i * 3 + 1] * t - 2.2 * t * t;
      m.pos[i * 3 + 2] = m.base[i * 3 + 2] + vel[i * 3 + 2] * t;
      m.scl[i] = Math.max(0, 1 - k * 0.9);
    }
    m.writeMatrices();
  }, ease.lin);
  m.group.visible = false;
}

async function battle(pick) {
  if (G.busy) return;
  G.busy = true;
  G.pick = pick;
  G.phase = 'battle';
  render();
  const [c0, c1] = G.creatures;
  const fighters = G.cActors;
  $('hpbars').hidden = false;
  [c0, c1].forEach((c, i) => {
    const el = $('hp' + i);
    el.querySelector('.hpname').innerHTML = nameTag(c.name, c.rarity) + (i === pick ? ' ⭐' : '');
    setHp(i, c.hp, c.hp);
  });
  const sim = simulate(c0, c1);
  await wait(500);
  for (const ev of sim.log) {
    const A = fighters[ev.who].model, D = fighters[1 - ev.who];
    const dir = ev.who === 0 ? 1 : -1;
    const hx = A.group.position.x, dx = D.model.group.position.x;
    await tween(200, (e) => (A.group.position.x = hx + dir * 1.1 * e), ease.in);
    if (ev.miss) {
      sfx.miss();
      floatText(D.model.group, 'MISS', 'miss');
      await tween(260, (e, k) => (D.model.group.position.y = Math.sin(k * Math.PI) * 0.7), ease.lin);
    } else {
      ev.crit ? sfx.crit() : sfx.hit();
      if (ev.crit) shake(0.2, 0.35);
      floatText(D.model.group, (ev.crit ? 'CRIT! ' : '') + '-' + ev.dmg, ev.crit ? 'crit' : 'dmg');
      D.model.group.getWorldPosition(tmpV);
      world.burst(tmpV.clone(), ev.crit ? 26 : 12, ev.crit ? 0xffd166 : 0xff6b6b, 2.5);
      setHp(1 - ev.who, ev.hp[1 - ev.who], (1 - ev.who === 0 ? c0 : c1).hp);
      await tween(260, (e, k) => {
        D.model.tint(0xff2020, 0.7 * (1 - k));
        D.model.group.position.x = dx + dir * 0.35 * Math.sin(k * Math.PI);
      }, ease.lin);
      D.model.tint(0xffffff, 0);
    }
    await tween(220, (e) => (A.group.position.x = lerp(hx + dir * 1.1, hx, e)), ease.out);
    await wait(240);
  }
  const winner = sim.winner;
  await explode(fighters[1 - winner]);
  const W = fighters[winner].model;
  await tween(700, (e, k) => {
    W.group.position.y = Math.sin(k * Math.PI) * 1.0;
    W.inner.rotation.x = k * Math.PI * 2;
  }, ease.inOut);
  W.inner.rotation.x = 0;
  const won = winner === pick;
  const wc = G.creatures[winner];
  let tankMsg = '';
  if (won) {
    if (save.tank.length < TANK_MAX) {
      save.tank.push({ name: wc.name, rarity: wc.rarity, value: wc.value, hp: wc.hp, atk: wc.atk, a: wc.a.name, b: wc.b.name });
      tankMsg = `<div class="hint">🏆 ${nameTag(wc.name, wc.rarity)} joined your Tank! Sell it there for ${coinImg()}${sellPrice(wc, true)}.</div>`;
    } else tankMsg = `<div class="hint">Your Tank is full! Sell some creatures to make room.</div>`;
    const pay = G.payout[pick];
    save.coins += pay;
    save.wins++;
    sfx.win();
    setTimeout(sfx.coin, 600);
    for (let i = 0; i < 4; i++) setTimeout(() => world.burst(new THREE.Vector3((Math.random() - 0.5) * 4, 2, 0), 18, 0xffd700, 3), i * 150);
    setMsg(`<div class="result win">YOU WIN!</div><div class="hint">${nameTag(wc.name, wc.rarity)} won the battle. +${coinImg()}${pay} coins</div>${tankMsg}`);
  } else {
    save.losses++;
    sfx.lose();
    setMsg(`<div class="result lose">YOU LOST</div><div class="hint">${nameTag(wc.name, wc.rarity)} won the battle. Better luck next time!</div>`);
  }
  persist();
  G.busy = false;
  G.phase = 'result';
  render();
}

// ---------------- shop ----------------
function oddsBar(odds) {
  const total = odds.reduce((a, b) => a + b, 0);
  return `<div class="odds">${odds.map((o, i) => (o > 0 ? `<i style="width:${(o / total) * 100}%;background:${RARITIES[i].color}" title="${RARITIES[i].name} ${o}%"></i>` : '')).join('')}</div>
  <div class="oddsTxt">${odds.map((o, i) => `<span style="color:${RARITIES[i].color}">${o}%</span>`).join(' ')}</div>`;
}

function openShop() {
  const p = $('panel');
  p.className = 'panel';
  p.innerHTML = `<div class="ptitle">Bait Shop <span class="pcoins">${coinImg()}${save.coins}</span></div>
    <div class="legend">${RARITIES.map((r) => `<span style="color:${r.color}">■ ${r.name}</span>`).join(' ')}</div>
    <div class="baits">${BAITS.map((b) => {
      const have = b.id === 'worm' ? '∞' : save.bait[b.id] || 0;
      const using = save.using === b.id;
      return `<div class="bait ${using ? 'using' : ''}">
        <img class="bicon" src="${pixelIcon(b.id)}" alt="">
        <div class="binfo"><div class="bname">${b.name} <small>(have ${have})</small></div><div class="bdesc">${b.desc}</div>${oddsBar(b.odds)}</div>
        <div class="bbtns">
          ${b.price ? `<button class="mc-btn small" data-buy="${b.id}" ${save.coins < b.price ? 'disabled' : ''}>Buy ${b.pack}<br>${coinImg()}${b.price}</button>` : ''}
          <button class="mc-btn small" data-use="${b.id}" ${using || (b.id !== 'worm' && !(save.bait[b.id] > 0)) ? 'disabled' : ''}>${using ? 'Using ✓' : 'Use'}</button>
        </div></div>`;
    }).join('')}</div>
    <button class="mc-btn close" id="closeModal">Close</button>`;
  p.querySelectorAll('[data-buy]').forEach((btn) => (btn.onclick = () => {
    const b = BAITS.find((x) => x.id === btn.dataset.buy);
    if (save.coins < b.price) return;
    save.coins -= b.price;
    save.bait[b.id] = (save.bait[b.id] || 0) + b.pack;
    save.using = b.id;
    persist();
    sfx.coin();
    toast(`Bought ${b.pack} ${b.name}!`);
    updateHud();
    openShop();
  }));
  p.querySelectorAll('[data-use]').forEach((btn) => (btn.onclick = () => {
    sfx.click();
    save.using = btn.dataset.use;
    persist();
    updateHud();
    openShop();
  }));
  $('closeModal').onclick = closeModal;
  $('modal').hidden = false;
}

// ---------------- fishdex ----------------
let dex = null;
function openDex() {
  if (G.busy) return;
  stage.visible = false;
  for (const a of actors) if (a.label) a.label.style.display = 'none';
  $('bottom').hidden = true;
  $('hpbars').style.visibility = 'hidden';
  const p = $('panel');
  p.className = 'panel sheet';
  const caught = FISH.filter((f) => save.caught[f.id]).length;
  p.innerHTML = `<div class="ptitle">Fishdex <small>${caught}/${FISH.length} caught · ${Object.keys(save.merges).length} merges found · ${save.wins}W ${save.losses}L</small></div>
    <div class="dexinfo" id="dexinfo"></div>
    <div class="dexgrid">${FISH.map((f) => `<button class="dexbtn ${save.caught[f.id] ? '' : 'unk'}" data-f="${f.id}" style="border-color:${rar(f.rarity).color}">
      <span style="color:${rar(f.rarity).color}">${f.name}</span>${save.caught[f.id] ? ' ✓' : ''}</button>`).join('')}</div>
    <button class="mc-btn close" id="closeModal">Close</button>`;
  p.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { sfx.click(); showDexFish(b.dataset.f); }));
  $('closeModal').onclick = closeModal;
  $('modal').hidden = false;
  $('modal').classList.add('dexmode');
  showDexFish(FISH[0].id);
}
function showDexFish(id) {
  const f = FISH.find((x) => x.id === id);
  if (dex) { dex.model.dispose(); scene.remove(dex.holder); }
  const model = new VoxelModel(fishVoxels(f));
  const holder = new THREE.Group();
  const portrait = camera.aspect < 0.9;
  holder.position.set(0, portrait ? 1.7 : 1.3, 0);
  holder.rotation.x = 0.35;
  const s = fitScale(model, portrait ? 3.0 : 3.8);
  model.group.scale.setScalar(s);
  model.inner.rotation.x = f.tilt ? f.tilt * 0.5 : 0;
  holder.add(model.group);
  scene.add(holder);
  dex = { model, holder, rot: 0.6 };
  document.querySelectorAll('.dexbtn').forEach((b) => b.classList.toggle('sel', b.dataset.f === id));
  $('dexinfo').innerHTML = `${nameTag(f.name, f.rarity)} · ${rarTag(f.rarity)} · ❤ ${f.hp} ⚔ ${f.atk} ⚡ ${f.spd} ${save.caught[f.id] ? '' : '<i>(not caught yet)</i>'}`;
}
function closeModal() {
  sfx.click();
  $('modal').hidden = true;
  $('modal').classList.remove('dexmode');
  if (dex) {
    dex.model.dispose();
    scene.remove(dex.holder);
    dex = null;
    stage.visible = true;
    for (const a of actors) if (a.label) a.label.style.display = '';
    $('bottom').hidden = false;
    $('hpbars').style.visibility = '';
  }
}

// drag to spin the dex model
let drag = null;
canvas.addEventListener('pointerdown', (e) => { if (dex) drag = { x: e.clientX, r: dex.rot }; });
window.addEventListener('pointermove', (e) => { if (drag && dex) dex.rot = drag.r + (e.clientX - drag.x) * 0.01; });
window.addEventListener('pointerup', () => (drag = null));

// ---------------- buttons ----------------
$('shopBtn').onclick = () => { sfx.click(); openShop(); };
$('baitBtn').onclick = () => { sfx.click(); openShop(); };
$('dexBtn').onclick = () => { sfx.click(); openDex(); };
$('tankBtn').onclick = () => { sfx.click(); openTank(); };
$('muteBtn').onclick = () => { toggleMute(); updateHud(); sfx.click(); };
$('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

// title screen: a demo creature swims in the background
let demo = null;
(function titleDemo() {
  const pool = FISH.filter((f) => f.rarity >= 2);
  const a = pool[Math.floor(Math.random() * pool.length)];
  const b = FISH[Math.floor(Math.random() * FISH.length)];
  const c = makeCreature(a, b);
  const m = new VoxelModel(c.voxels);
  m.group.scale.setScalar(fitScale(m, L.mergeFit));
  demo = addActor(m);
  $('demoName').innerHTML = `${a.name} + ${b.name} = ${nameTag(c.name, c.rarity)}`;
})();
$('playBtn').onclick = () => {
  unlock();
  sfx.click();
  $('title').classList.add('hide');
  removeActor(demo);
  demo = null;
  startRound();
};

updateHud();

// ---------------- main loop ----------------
const clock = new THREE.Clock();
let time = 0;
function frame() {
  const rawDt = Math.min(0.25, clock.getDelta());
  const dt = Math.min(0.05, rawDt);
  time += dt;
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    tw.t += rawDt;
    const k = Math.min(1, tw.t / tw.dur);
    tw.fn(tw.e(k), k, dt);
    if (k >= 1) { tweens.splice(i, 1); tw.res(); }
  }
  for (const a of actors) {
    if (a.mode === 'swim') a.model.swim(time + a.phase, a.amp);
    a.model.inner.position.y = Math.sin(time * 1.6 + a.phase) * a.bob;
    if (a.label) {
      const p = project(a.model.group, a.labelDy * stage.scale.x);
      a.label.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -100%)`;
    }
  }
  if (dex) {
    if (!drag) dex.rot += dt * 0.5;
    dex.holder.rotation.y = dex.rot;
    dex.model.swim(time, 1);
    dex.holder.position.y += (Math.sin(time * 1.6) * 0.003);
  }
  if (demo) demo.model.group.rotation.y = Math.sin(time * 0.4) * 0.6;
  world.update(time, dt);
  camera.position.copy(camBase);
  if (shakeT > 0) {
    shakeT -= dt;
    camera.position.x += (Math.random() - 0.5) * shakeAmp;
    camera.position.y += (Math.random() - 0.5) * shakeAmp;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

if (import.meta.env.DEV) window.__ma = { G, save, castLine, doMerge, nextCreature, toFight, battle, openDex, showDexFish, closeModal };
if (import.meta.env.DEV) {
  window.__ma.previewMerge = (a, b) => {
    const fa = FISH.find((f) => f.id === a), fb = FISH.find((f) => f.id === b);
    const c = makeCreature(fa, fb);
    if (dex) { dex.model.dispose(); scene.remove(dex.holder); }
    stage.visible = false;
    $('title').classList.add('hide');
    const model = new VoxelModel(c.voxels);
    const holder = new THREE.Group();
    holder.position.set(0, 1.2, 0);
    model.group.scale.setScalar(fitScale(model, 4.4));
    holder.add(model.group);
    scene.add(holder);
    dex = { model, holder, rot: 0.3 };
    return c.name;
  };
}

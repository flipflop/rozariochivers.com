/**
 * The Skyport scene: procedural geometry only, toon-shaded in the almanac inks.
 * buildWorld() -> { scene, player, monitors, screens, obstacles, floor, update(t, dt, moving) }
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const C = { paper: 0xF1ECDF, paper2: 0xE8E1CF, paper3: 0xDCD3BD, ink: 0x161616, ink2: 0x3A3833,
  blue: 0x7DB6D8, blueDeep: 0x4F8DB3, red: 0xC8452E, sky: 0xCFE3EE, cloud: 0xB9D5E4 };
export const LOUNGE_R = 15.2, WALK_R = 13.4, MON_R = 11;

const grad = new THREE.DataTexture(new Uint8Array([120, 195, 255]), 3, 1, THREE.RedFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const mats = new Map();
const toon = (c, o = {}) => { const k = c + JSON.stringify(o); if (!mats.has(k)) mats.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...o })); return mats.get(k); };
const noLine = (m) => { m.userData.outlineParameters = { visible: false }; return m; };
const far = (c) => { const k = 'far' + c; if (!mats.has(k)) mats.set(k, noLine(new THREE.MeshToonMaterial({ color: c, gradientMap: grad }))); return mats.get(k); };

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Collects geometry per material and merges it into one mesh each (fewer draw calls). */
class Batch {
  constructor() { this.m = new Map(); }
  add(mat, geo, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
    const g = geo.clone().applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s)));
    const g2 = g.index ? g.toNonIndexed() : g; g.dispose && 0;
    g2.deleteAttribute('uv');
    if (!this.m.has(mat)) this.m.set(mat, []);
    this.m.get(mat).push(g2);
  }
  flush(parent) { for (const [mat, list] of this.m) parent.add(new THREE.Mesh(mergeGeometries(list), mat)); }
}

function floorTexture() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), m = S / 2;
  const hex = (n) => '#' + n.toString(16).padStart(6, '0');
  g.fillStyle = hex(C.paper); g.fillRect(0, 0, S, S);
  for (let i = 0; i < 32; i++) { g.fillStyle = i % 2 ? hex(C.paper2) : hex(C.paper); g.beginPath(); g.moveTo(m, m); g.arc(m, m, m, (i / 32) * 6.2832, ((i + 1) / 32) * 6.2832); g.fill(); }
  const ring = (r0, r1, col) => { g.fillStyle = col; g.beginPath(); g.arc(m, m, r1 * m, 0, 6.2832); g.arc(m, m, r0 * m, 0, 6.2832, true); g.fill('evenodd'); };
  ring(0.9, 0.97, hex(C.blue)); ring(0.97, 0.985, hex(C.ink)); ring(0.52, 0.535, hex(C.ink)); ring(0.535, 0.56, hex(C.blue));
  g.fillStyle = hex(C.ink); g.beginPath(); g.arc(m, m, 0.14 * m, 0, 6.2832); g.fill();
  g.fillStyle = hex(C.blue); for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.2832; g.beginPath(); g.arc(m + Math.cos(a) * 0.72 * m, m + Math.sin(a) * 0.72 * m, 9, 0, 6.2832); g.fill(); }
  g.fillStyle = hex(C.red); for (let i = 0; i < 8; i++) { const a = ((i + 0.5) / 8) * 6.2832; g.beginPath(); g.arc(m + Math.cos(a) * 0.72 * m, m + Math.sin(a) * 0.72 * m, 7, 0, 6.2832); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

/** Broadcast card for a chapter. */
function cardCanvas(p) {
  const W = 512, H = 320, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#F1ECDF'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#7DB6D8'; g.fillRect(0, 0, W, 56);
  g.fillStyle = '#161616'; g.font = '700 26px Oswald, sans-serif'; g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = '4px';
  g.fillText('FLIGHT ' + p.flight, 20, 29); g.textAlign = 'right'; g.fillText('CHAPTER ' + String(p.n).padStart(2, '0'), W - 20, 29); g.textAlign = 'left';
  g.fillRect(0, 56, 150, H - 56 - 44);
  g.font = '700 118px Oswald, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; if ('letterSpacing' in g) g.letterSpacing = '0px';
  g.fillStyle = '#161616'; g.strokeStyle = '#F1ECDF'; g.lineWidth = 3; g.strokeText(String(p.n).padStart(2, '0'), 75, 215);
  g.fillStyle = '#4F8DB3'; g.fillText('', 0, 0);
  g.textAlign = 'left'; g.fillStyle = '#161616'; g.font = '400 52px Marcellus, serif';
  const words = p.title.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > 330 && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur);
  const fs = lines.length > 2 ? 38 : 52; g.font = `400 ${fs}px Marcellus, serif`;
  lines.slice(0, 3).forEach((l, i) => g.fillText(l, 172, 120 + (i - (Math.min(lines.length, 3) - 1) / 2) * (fs + 6) + 20));
  g.fillStyle = '#3A3833'; g.font = '400 19px Jost, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; if ('letterSpacing' in g) g.letterSpacing = '0px';
  let sf = p.standfirst.slice(0, 92); sf = sf.slice(0, sf.lastIndexOf(' ')) + '…'; const sl = []; let sc = '';
  for (const w of sf.split(' ')) { const t = sc ? sc + ' ' + w : w; if (g.measureText(t).width > 322 && sc) { sl.push(sc); sc = w; } else sc = t; }
  sl.push(sc); sl.slice(0, 3).forEach((l, i) => g.fillText(l, 172, 196 + i * 23));
  g.strokeStyle = '#161616'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(172, 178); g.lineTo(W - 20, 178); g.stroke();
  g.fillStyle = '#7DB6D8'; g.fillRect(W - 78, 188, 58, 38); g.strokeStyle = '#161616'; g.beginPath(); g.moveTo(W - 82, 226); g.lineTo(W - 74, 204); g.lineTo(W - 62, 214); g.lineTo(W - 48, 192); g.lineTo(W - 20, 226); g.stroke();
  g.fillStyle = '#161616'; g.fillRect(0, H - 44, W, 44);
  g.fillStyle = '#F1ECDF'; g.font = '500 20px Oswald, sans-serif'; g.textBaseline = 'middle'; if ('letterSpacing' in g) g.letterSpacing = '3px';
  g.fillText(p.status, 44, H - 21); g.textAlign = 'right'; g.fillText(p.kind.toUpperCase().slice(0, 26), W - 18, H - 21);
  if (p.status === 'BOARDING') { g.fillStyle = '#C8452E'; g.beginPath(); g.arc(24, H - 22, 7, 0, 6.2832); g.fill(); }
  g.fillStyle = 'rgba(22,22,22,.16)'; for (let y = 60; y < H - 48; y += 9) for (let x = (y / 9) % 2 ? 160 : 163; x < W; x += 6) g.fillRect(x, y, 1.5, 1.5);
  return c;
}

function scanTexture() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d');
  for (let y = 0; y < 256; y += 4) { g.fillStyle = 'rgba(22,22,22,.22)'; g.fillRect(0, y, 4, 2); }
  const bar = g.createLinearGradient(0, 90, 0, 150); bar.addColorStop(0, 'rgba(255,255,255,0)'); bar.addColorStop(.5, 'rgba(255,255,255,.28)'); bar.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = bar; g.fillRect(0, 90, 4, 60);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

const spikeQ = (d) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
function starburst(b, x, y, z, s, bodyMat, spikeMat, n = 16) {
  b.add(bodyMat, new THREE.SphereGeometry(0.3 * s, 12, 8), [x, y, z]);
  for (let i = 0; i < n; i++) {
    const yy = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - yy * yy), a = i * 2.39996;
    const d = new THREE.Vector3(Math.cos(a) * r, yy, Math.sin(a) * r), e = new THREE.Euler().setFromQuaternion(spikeQ(d));
    const len = (i % 2 ? 0.95 : 0.65) * s;
    b.add(spikeMat, new THREE.ConeGeometry(0.07 * s, len, 5), [x + d.x * (0.3 * s + len / 2 - 0.02), y + d.y * (0.3 * s + len / 2 - 0.02), z + d.z * (0.3 * s + len / 2 - 0.02)], [e.x, e.y, e.z]);
  }
}

export function buildWorld({ projects, reduced, lowTier }) {
  const R = rng(1958);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.sky); scene.fog = new THREE.Fog(C.sky, 70, 230);
  scene.add(new THREE.AmbientLight(0xffffff, 1.35));
  const sun = new THREE.DirectionalLight(0xfff6e4, 1.9); sun.position.set(-10, 20, 12); scene.add(sun);
  const obstacles = [], occluders = [];
  const P = toon(C.paper), P2 = toon(C.paper2), BL = toon(C.blue), BD = toon(C.blueDeep), INK = toon(C.ink), INK2 = toon(C.ink2), RED = toon(C.red);

  /* ---------- lounge ---------- */
  const lounge = new THREE.Group(); scene.add(lounge);
  const HOLE = 1.4;
  const floor = new THREE.Mesh(new THREE.RingGeometry(HOLE, LOUNGE_R, 72, 1), noLine(new THREE.MeshBasicMaterial({ map: floorTexture() })));
  floor.rotation.x = -Math.PI / 2; lounge.add(floor);
  const lathe = (pts, mat, seg = 72) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg), mat);
  const slab = lathe([[HOLE, -0.02], [LOUNGE_R + 0.3, -0.02], [LOUNGE_R - 1, -1.22], [HOLE, -1.22]], P2); lounge.add(slab);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(LOUNGE_R + 0.2, 0.28, 8, 96), INK); rim.rotation.x = Math.PI / 2; lounge.add(rim);
  const under = lathe([[HOLE, -1.22], [LOUNGE_R - 1, -1.22], [3.4, -4.4], [HOLE, -4.4]], BL); lounge.add(under);
  const pyl = new THREE.Mesh(new THREE.LatheGeometry([[2.6, 0], [1.5, -6], [1.3, -16], [1.8, -28], [4.5, -40], [7, -44]].map(([x, y]) => new THREE.Vector2(x, y)), 24), P2); pyl.position.y = -4.4; lounge.add(pyl);
  for (const y of [-9, -17, -26]) { const t = new THREE.Mesh(new THREE.TorusGeometry(2.4 - (y / -26) * 0.4 + 0.6, 0.18, 6, 32), INK); t.rotation.x = Math.PI / 2; t.position.y = y; lounge.add(t); }

  const db = new Batch();
  for (let i = 0; i < 6; i++) db.add(INK, new THREE.TorusGeometry(LOUNGE_R, 0.14, 6, 48, Math.PI), [0, 0, 0], [0, (i * Math.PI) / 6, 0]);
  for (const f of [0.25, 0.55, 0.82]) { const a = Math.asin(f); db.add(INK, new THREE.TorusGeometry(Math.cos(a) * LOUNGE_R, 0.1, 6, 64), [0, f * LOUNGE_R, 0], [Math.PI / 2, 0, 0]); }
  db.add(INK, new THREE.SphereGeometry(0.7, 12, 8), [0, LOUNGE_R, 0]);
  db.flush(lounge);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(LOUNGE_R - 0.05, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), noLine(new THREE.MeshBasicMaterial({ color: C.blue, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide })));
  lounge.add(glass);

  const fb = new Batch();
  /* ---------- return lift (exit to the almanac) ---------- */
  const lift = new THREE.Group(); lounge.add(lift);
  const LH = 3.4, glassMat = noLine(new THREE.MeshToonMaterial({ color: C.blue, gradientMap: grad, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }));
  const ribMat = noLine(new THREE.MeshToonMaterial({ color: C.ink, gradientMap: grad }));
  const lip = lathe([[HOLE, 0.3], [1.75, 0.3], [1.85, 0], [HOLE, 0]], INK, 48); lift.add(lip);
  const inlay = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 6, 48), BL); inlay.rotation.x = Math.PI / 2; inlay.position.y = 0.31; lift.add(inlay);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(HOLE, HOLE, 4.2, 32, 1, true), noLine(new THREE.MeshBasicMaterial({ color: C.ink2, side: THREE.BackSide }))); shaft.position.y = -2.1; lift.add(shaft);
  const sbot = new THREE.Mesh(new THREE.CircleGeometry(HOLE, 24), noLine(new THREE.MeshBasicMaterial({ color: C.ink }))); sbot.rotation.x = -Math.PI / 2; sbot.position.y = -4.2; lift.add(sbot);
  const car = new THREE.Group(); lift.add(car);
  const shaftDisc = new THREE.Mesh(new THREE.CircleGeometry(HOLE, 24), noLine(new THREE.MeshBasicMaterial({ color: 0x0a0a0a }))); shaftDisc.rotation.x = -Math.PI / 2; shaftDisc.position.y = -0.35; lift.add(shaftDisc);
  const plat = new THREE.Group(); car.add(plat); plat.position.y = 0.02;
  const pd = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.12, 32), P2); pd.position.y = 0; plat.add(pd);
  const pr = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.03, 6, 32), BL); pr.rotation.x = Math.PI / 2; pr.position.y = 0.07; plat.add(pr);
  const tube = new THREE.Group(); car.add(tube); tube.position.y = -LH;
  const GAP = 1.85, tg = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, LH, 32, 1, true, GAP / 2, Math.PI * 2 - GAP), glassMat); tg.position.y = LH / 2; tube.add(tg);
  for (const y of [0.15, 1.2, 2.2, 3.1]) { const g = new THREE.Group(); g.rotation.y = -(Math.PI / 2 + GAP / 2); g.position.y = y; tube.add(g); const r = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.07, 6, 40, Math.PI * 2 - GAP), ribMat); r.rotation.x = Math.PI / 2; g.add(r); }
  for (const sgn of [-1, 1]) { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, LH, 6), INK); j.position.set(Math.sin(sgn * GAP / 2) * 1.3, LH / 2, Math.cos(sgn * GAP / 2) * 1.3); tube.add(j); }
  const capG = new THREE.Group(); capG.rotation.y = -(Math.PI / 2 + GAP / 2); capG.position.y = LH; tube.add(capG); const capR = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.11, 8, 40, Math.PI * 2 - GAP), P); capR.rotation.x = Math.PI / 2; capG.add(capR);
  const doors = new THREE.Group(); tube.add(doors);
  const dg = (ts) => new THREE.CylinderGeometry(1.4, 1.4, LH - 0.2, 8, 1, true, ts, GAP / 2);
  const dl = new THREE.Group(), dr = new THREE.Group(); doors.add(dl, dr);
  const dm = noLine(new THREE.MeshToonMaterial({ color: C.blueDeep, gradientMap: grad, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }));
  for (const [grp, ts] of [[dl, 0], [dr, -GAP / 2]]) { const m = new THREE.Mesh(dg(ts), dm); m.position.y = LH / 2; grp.add(m);
    for (const e of [ts, ts + GAP / 2]) { const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, LH - 0.2, 5), INK); edge.position.set(Math.sin(e) * 1.4, LH / 2, Math.cos(e) * 1.4); grp.add(edge); } }
  const sc = document.createElement('canvas'); sc.width = 512; sc.height = 96; { const g = sc.getContext('2d'); g.fillStyle = '#161616'; g.fillRect(0, 0, 512, 96); g.fillStyle = '#F1ECDF'; g.font = '500 38px Oswald, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; if ('letterSpacing' in g) g.letterSpacing = '3px'; g.fillText('\u2193 ALMANAC \u00B7 RETURN LIFT', 256, 50); g.strokeStyle = '#7DB6D8'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 90); }
  const stex = new THREE.CanvasTexture(sc); stex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Sprite(noLine(new THREE.SpriteMaterial({ map: stex, fog: false, toneMapped: false }))); sign.scale.set(1.5, 0.28, 1); sign.position.y = 4.1; car.add(sign);
  const own = new Set([glassMat, ribMat, dm]), carMats = [];
  car.traverse((o) => { if (o.material) { if (!own.has(o.material)) o.material = o.material.clone(); carMats.push(o.material); } });
  /* iris hatch: 8 ink blades with paper edge lines, vertices animated (no allocation per frame) */
  const NB = 8, IR = 1.42, iris = new THREE.Group(); iris.position.y = 0.31; lift.add(iris);
  const irisMat = noLine(new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })), edgeMat = noLine(new THREE.LineBasicMaterial({ color: C.paper }));
  const blades = Array.from({ length: NB }, (_, i) => { const g = new THREE.BufferGeometry(), lg = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3)); lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
    const m = new THREE.Mesh(g, irisMat), l = new THREE.LineSegments(lg, edgeMat); m.position.y = i * 0.002; l.position.y = i * 0.002 + 0.003; m.frustumCulled = l.frustumCulled = false; iris.add(m, l); return { g, lg, a0: (i * Math.PI * 2) / NB }; });
  function setIris(c) {
    iris.visible = c > 0.001; if (!iris.visible) return;
    for (const b of blades) {
      const a1 = b.a0 + (Math.PI * 2 / NB) * 1.35, am = (b.a0 + a1) / 2, rx = Math.cos(am) * IR, rz = Math.sin(am) * IR, tw = Math.sin(c * Math.PI) * 0.45;
      const tx = rx * (1 - c) - Math.sin(am) * tw, tz = rz * (1 - c) + Math.cos(am) * tw, p0x = Math.cos(b.a0) * IR, p0z = Math.sin(b.a0) * IR, p1x = Math.cos(a1) * IR, p1z = Math.sin(a1) * IR;
      b.g.attributes.position.array.set([p0x, 0, p0z, rx, 0, rz, tx, 0, tz, rx, 0, rz, p1x, 0, p1z, tx, 0, tz]); b.g.attributes.position.needsUpdate = true;
      b.lg.attributes.position.array.set([p0x, 0, p0z, tx, 0, tz, tx, 0, tz, p1x, 0, p1z]); b.lg.attributes.position.needsUpdate = true;
    }
  }
  setIris(1);
  const liftApi = { glass: glassMat, rib: ribMat, plat, doorOpen: 0, doorAngle: 0, gap: GAP, car, mats: carMats, irisC: null, pick: [tg, lip, pd] };
  /* boomerang tables + tulip chairs */
  const sh = new THREE.Shape(); sh.moveTo(-1.5, -0.2); sh.bezierCurveTo(-0.9, 0.9, 0.9, 0.9, 1.5, -0.2); sh.bezierCurveTo(0.9, 0.1, -0.9, 0.1, -1.5, -0.2);
  const boom = new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: false }); boom.rotateX(Math.PI / 2); boom.translate(0, 0.9, 0.3);
  const chairG = new THREE.LatheGeometry([[0, 0], [0.4, 0], [0.38, 0.06], [0.1, 0.3], [0.09, 0.5], [0.35, 0.62], [0.55, 0.85], [0.6, 1.15], [0.52, 1.17], [0.45, 0.92], [0.2, 0.78], [0, 0.78]].map(([x, y]) => new THREE.Vector2(x, y)), 14);
  const chairMat = new THREE.MeshToonMaterial({ color: C.blue, gradientMap: grad, side: THREE.DoubleSide }), chairRed = new THREE.MeshToonMaterial({ color: C.red, gradientMap: grad, side: THREE.DoubleSide });
  const furn = new THREE.Group();
  [0, 2, 4, 6].forEach((i, k) => {
    const a = ((i + 0.5) * Math.PI) / 4, x = Math.cos(a) * 5.6, z = Math.sin(a) * 5.6, grp = new THREE.Group();
    grp.position.set(x, 0, z); grp.rotation.y = -a;
    const t = new THREE.Mesh(boom, P2); grp.add(t);
    for (const lx of [-1.0, 0, 1.0]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.9, 6), INK); l.position.set(lx, 0.45, lx === 0 ? 0.6 : 0.1); grp.add(l); }
    [[-0.1, -1.5, 0.1], [1.5, 1.0, 0.1]].forEach(([cx, cz], j) => { const ch = new THREE.Mesh(chairG, (k + j) === 2 ? chairRed : chairMat); ch.scale.setScalar(0.85); ch.position.set(cx * 0.9, 0, cz * 1.3 + (j ? 0.4 : -0.1)); ch.rotation.y = j ? Math.PI * 0.75 : Math.PI * 0.25; grp.add(ch);
      const w = { x: Math.cos(-a) * ch.position.x + Math.sin(-a) * ch.position.z, z: -Math.sin(-a) * ch.position.x + Math.cos(-a) * ch.position.z }; obstacles.push({ x: x + w.x, z: z + w.z, r: 0.5 }); });
    furn.add(grp); obstacles.push({ x, z, r: 1.0 });
  });
  lounge.add(furn); fb.flush(lounge);

  /* ---------- monitors ---------- */
  const monitors = [], screens = [];
  const scan = scanTexture();
  const frameG = new THREE.BoxGeometry(3.6, 2.4, 0.3), scrG = new THREE.PlaneGeometry(3.2, 2.0);
  const neck = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.1, -0.9), new THREE.Vector3(0, 2, -0.9), new THREE.Vector3(0, 3.1, -0.8), new THREE.Vector3(0, 3.35, -0.3), new THREE.Vector3(0, 3.3, -0.15)]), 24, 0.075, 8);
  projects.forEach((p, i) => {
    const a = (i / projects.length) * Math.PI * 2 + Math.PI / 8, x = Math.cos(a) * MON_R, z = Math.sin(a) * MON_R;
    const g = new THREE.Group(); g.position.set(x, 0, z); g.lookAt(0, 0, 0);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, 0.2, 20), INK); base.position.set(0, 0.1, -0.9); g.add(base);
    g.add(new THREE.Mesh(neck, INK2));
    const frame = new THREE.Mesh(frameG, i % 4 === 1 ? toon(C.blueDeep) : INK); frame.position.set(0, 3.4, 0); g.add(frame);
    const tex = new THREE.CanvasTexture(cardCanvas(p)); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const screen = new THREE.Mesh(scrG, noLine(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }))); screen.position.set(0, 3.4, 0.16); screen.userData.index = i; g.add(screen);
    const ov = new THREE.Mesh(scrG, noLine(new THREE.MeshBasicMaterial({ map: scan, transparent: true, depthWrite: false, toneMapped: false }))); ov.position.set(0, 3.4, 0.165); g.add(ov);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), RED); led.position.set(1.55, 2.38, 0.16); g.add(led);
    lounge.add(g); screens.push(screen);
    monitors.push({ x, z, p, i, group: g, ov });
    obstacles.push({ x: x + Math.cos(a) * 0.9, z: z + Math.sin(a) * 0.9, r: 0.8 });
  });

  /* ---------- outside: cloud sea, needle city, traffic ---------- */
  const out = new THREE.Group(); scene.add(out);
  const seaFloor = new THREE.Mesh(new THREE.CircleGeometry(600, 48), noLine(new THREE.MeshBasicMaterial({ color: C.cloud })));
  seaFloor.rotation.x = -Math.PI / 2; seaFloor.position.y = -40; out.add(seaFloor);
  const cb = new Batch(), cm = [far(C.paper), far(0xFFFFFF), far(C.cloud)];
  const sph = new THREE.SphereGeometry(1, 10, 7);
  for (let i = 0; i < 170; i++) {
    const a = R() * 6.2832, r = Math.sqrt(R()) * 190 + 6, s = 8 + R() * 14;
    cb.add(cm[i % 3], sph, [Math.cos(a) * r, -37 + R() * 3.5 + (i % 3) * 0.4, Math.sin(a) * r], [0, 0, 0], [s, 2.5 + R() * 3.5, s * (0.7 + R() * 0.5)]);
  }
  cb.flush(out);
  const tb = new Batch(), disc = new THREE.CylinderGeometry(1, 0.55, 0.3, 18), cap = new THREE.SphereGeometry(1, 14, 6, 0, 6.2832, 0, 1.5708);
  for (let i = 0; i < 64; i++) {
    const a = R() * 6.2832, r = 30 + R() * 110, h = 14 + R() * 44, bx = Math.cos(a) * r, bz = Math.sin(a) * r, w = 0.7 + R() * 1.1;
    const m = [far(C.paper2), far(C.blue), far(C.paper)][i % 3];
    tb.add(m, new THREE.ConeGeometry(w, h, 8), [bx, -38 + h / 2, bz]);
    tb.add(far(C.ink), new THREE.CylinderGeometry(0.04, 0.04, 5, 4), [bx, -38 + h + 2, bz]);
    if (i % 3 !== 2) { const sy = -38 + h * (0.55 + R() * 0.25), rad = 2.6 + R() * 3.4; tb.add(i % 2 ? far(C.paper) : far(C.blueDeep), disc, [bx, sy, bz], [0, 0, 0], [rad, 1, rad]); tb.add(i % 2 ? far(C.blue) : far(C.paper2), cap, [bx, sy + 0.15, bz], [0, 0, 0], [rad * 0.45, rad * 0.4, rad * 0.45]); if (i % 7 === 0) tb.add(far(C.red), new THREE.SphereGeometry(0.4, 8, 6), [bx, sy + rad * 0.4 + 0.6, bz]); }
  }
  tb.flush(out);
  const sunDisc = new THREE.Group(); sunDisc.position.set(-90, 60, -190);
  sunDisc.add(new THREE.Mesh(new THREE.CircleGeometry(30, 48), noLine(new THREE.MeshBasicMaterial({ color: C.paper, fog: false }))));
  const sr = new THREE.Mesh(new THREE.RingGeometry(30, 34, 48), noLine(new THREE.MeshBasicMaterial({ color: C.blue, fog: false }))); sr.position.z = -0.1; sunDisc.add(sr); scene.add(sunDisc);

  const mover = [];
  const saucerG = new THREE.LatheGeometry([[0, -0.4], [1.2, -0.25], [3, 0], [3.1, 0.12], [1.5, 0.35], [0, 0.4]].map(([x, y]) => new THREE.Vector2(x, y)), 18);
  const mkCurve = (n, r0) => new THREE.CatmullRomCurve3(Array.from({ length: n }, (_, k) => { const a = (k / n) * 6.2832 + R() * 0.3, r = r0 + R() * 40; return new THREE.Vector3(Math.cos(a) * r, -8 + R() * 28, Math.sin(a) * r); }), true);
  /* pulp 1950s rocket, 5:1 slim: silver ogive body (widest 40% up), red nose (top 15%), 3 hairline seam rings, 3 curved scythe fins; shared geometry */
  const RL = 5.6, RT = -2.8, NOSE_Y = RT + RL * 0.85;
  const spl = new THREE.SplineCurve([[0, -2.8], [0.2, -2.8], [0.3, -2.5], [0.43, -1.6], [0.5, -0.85], [0.52, -0.56], [0.5, 0.2], [0.44, 1.0], [0.34, 1.75], [0.21, 2.3], [0.08, 2.7], [0, 2.8]].map(([x, y]) => new THREE.Vector2(x, y)));
  const sp = spl.getPoints(30), rAt = (y) => { let best = sp[0]; for (const q of sp) if (Math.abs(q.y - y) < Math.abs(best.y - y)) best = q; return best.x; };
  const latheOf = (pts) => new THREE.LatheGeometry(pts, 20);
  const bodyG = latheOf(sp.filter((q) => q.y <= NOSE_Y + 0.12)), noseG = latheOf(sp.filter((q) => q.y >= NOSE_Y));
  const finShape = new THREE.Shape(); finShape.moveTo(0.4, -0.9); finShape.quadraticCurveTo(0.8, -1.9, 1.15, -3.0); finShape.quadraticCurveTo(0.62, -2.5, 0.46, -2.45); finShape.lineTo(0.4, -0.9);
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: RL * 0.04, bevelEnabled: false, curveSegments: 5 }); finGeo.translate(0, 0, -RL * 0.02);
  const rb = new Batch(), RB = new Batch();
  for (let f = 0; f < 3; f++) rb.add(RED, finGeo, [0, 0, 0], [0, (f * Math.PI * 2) / 3, 0]);
  rb.add(RED, noseG);
  for (const y of [-1.9, -0.3, 1.1]) RB.add(INK, new THREE.TorusGeometry(rAt(y) + 0.003, 0.005, 3, 20), [0, y, 0], [Math.PI / 2, 0, 0]);
  const silver = toon(0xDCE1E4), rbGeos = [], seamGeos = [];
  rb.flush({ add: (m) => rbGeos.push(m.geometry) }); RB.flush({ add: (m) => seamGeos.push(m.geometry) });
  const finNoseGeo = rbGeos[0], seamGeo = seamGeos[0];
  const flameA = new THREE.ConeGeometry(0.36, 1.3, 10), flameB = new THREE.ConeGeometry(0.24, 0.9, 8);
  const flameMA = noLine(new THREE.MeshBasicMaterial({ color: C.red, transparent: true, opacity: 0.6, depthWrite: false })), flameMB = noLine(new THREE.MeshBasicMaterial({ color: C.paper }));
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group(); g.add(new THREE.Mesh(bodyG, silver), new THREE.Mesh(finNoseGeo, RED), new THREE.Mesh(seamGeo, noLine(INK.clone())));
    const fg = new THREE.Group(); fg.position.y = RT; g.add(fg);
    const fa = new THREE.Mesh(flameA, flameMA), fb = new THREE.Mesh(flameB, flameMB); fa.rotation.x = fb.rotation.x = Math.PI; fa.position.y = -0.65; fb.position.y = -0.47; fg.add(fa, fb);
    const w = new THREE.Group(); w.add(g); g.scale.setScalar(1.8); out.add(w);
    mover.push({ o: w, fg, fb, c: mkCurve(6, 46 + i * 9), sp: 0.0045 + R() * 0.003, off: R(), rocket: true });
  }
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group(); g.add(new THREE.Mesh(saucerG, i % 2 ? far(C.blue) : far(C.paper2)));
    const d = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 6, 0, 6.2832, 0, 1.5708), far(C.blueDeep)); d.position.y = 0.3; g.add(d);
    const tr = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 6, 20), far(C.ink)); tr.rotation.x = Math.PI / 2; tr.position.y = 0.1; g.add(tr);
    g.scale.setScalar(1.4 + (i % 3) * 0.4); out.add(g);
    mover.push({ o: g, c: mkCurve(5, 38 + i * 9), sp: 0.0028 + R() * 0.002, off: R(), rocket: false });
  }

  /* ---------- print-style exhaust: saucer thrust dots ---------- */
  const nS = mover.filter((m) => !m.rocket).length;
  const BALL = new THREE.SphereGeometry(0.5, 8, 6);
  const dots = new THREE.InstancedMesh(BALL, noLine(new THREE.MeshToonMaterial({ color: C.blue, gradientMap: grad })), nS * 3);
  dots.frustumCulled = false; out.add(dots);
  const dummy = new THREE.Object3D(), qFlip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI), qI = new THREE.Quaternion(), qT = new THREE.Quaternion(), vA = new THREE.Vector3(), vP = new THREE.Vector3();
  const put = (mesh, i, x, y, z, q, sx, sy, sz) => { dummy.position.set(x, y, z); dummy.quaternion.copy(q); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix); };
  function exhaust(t) {
    let si = 0;
    for (const m of mover) {
      const o = m.o;
      if (m.rocket) {
        if (!reduced) { m.fg.scale.set(1 + 0.06 * Math.sin(t * 31 + m.off * 40), 1 + 0.12 * Math.sin(t * 28 + m.off * 40), 1 + 0.06 * Math.sin(t * 31 + m.off * 40)); m.fb.scale.y = 1 + 0.1 * Math.sin(t * 37 + m.off * 17); }
      } else {
        for (let j = 0; j < 3; j++) { const a = (j * Math.PI * 2) / 3 + t * 0.5; vP.set(Math.cos(a) * 1.5, -0.55, Math.sin(a) * 1.5); o.localToWorld(vP); const sz = 0.4 * o.scale.x * (reduced ? 1 : 1 + 0.25 * Math.sin(t * 3 + j * 2 + si)); put(dots, si * 3 + j, vP.x, vP.y, vP.z, qI, sz, sz, sz); }
        si++;
      }
    }
    dots.instanceMatrix.needsUpdate = true;
  }
  /* ---------- your robot (1950s sci-fi homage, original design) ---------- */
  const player = new THREE.Group(), body = new THREE.Group(); player.add(body); body.scale.setScalar(1.25);
  const add = (par, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); par.add(m); return m; };
  const torso = new THREE.Group(); body.add(torso);
  add(torso, new THREE.CylinderGeometry(0.46, 0.52, 0.9, 16), INK2, 0, 1.2, 0);
  for (const y of [0.78, 0.88, 0.98]) add(torso, new THREE.TorusGeometry(0.5 - (y - 0.78) * 0.1, 0.035, 6, 20), BD, 0, y + 0.15, 0).rotation.x = Math.PI / 2;
  add(torso, new THREE.CylinderGeometry(0.5, 0.5, 0.12, 16), INK, 0, 1.78, 0);
  for (let k = 0; k < 4; k++) add(torso, new THREE.TorusGeometry(0.5, 0.025, 5, 20), P, 0, 1.74 + k * 0.03, 0).rotation.x = Math.PI / 2;
  add(torso, new THREE.BoxGeometry(0.42, 0.34, 0.05), P2, 0, 1.2, 0.46);
  const lightR = add(torso, new THREE.SphereGeometry(0.06, 8, 6), RED, -0.1, 1.2, 0.5), lightB = add(torso, new THREE.SphereGeometry(0.06, 8, 6), BL, 0.1, 1.2, 0.5);
  add(torso, new THREE.CylinderGeometry(0.2, 0.3, 0.12, 12), INK, 0, 1.86, 0);
  const head = new THREE.Group(); head.position.y = 1.92; torso.add(head);
  const dome = add(head, new THREE.SphereGeometry(0.4, 18, 12, 0, 6.2832, 0, 1.5708), noLine(new THREE.MeshToonMaterial({ color: C.blue, gradientMap: grad, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })), 0, 0, 0);
  add(head, new THREE.CylinderGeometry(0.42, 0.42, 0.06, 18), INK, 0, 0, 0);
  for (const [rx, rz] of [[-0.14, 0.05], [0.14, -0.05], [0, 0.17], [0, -0.17]]) add(head, new THREE.CylinderGeometry(0.018, 0.018, 0.34, 4), INK, rx, 0.18, rz);
  const discs = [0.14, 0.3].map((y, k) => add(head, new THREE.CylinderGeometry(0.16 - k * 0.04, 0.16 - k * 0.04, 0.025, 14), k ? RED : P, 0, y, 0));
  add(head, new THREE.CylinderGeometry(0.012, 0.012, 0.28, 4), INK, 0, 0.55, 0); add(head, new THREE.SphereGeometry(0.04, 6, 5), RED, 0, 0.7, 0);
  for (const s of [-1, 1]) add(head, new THREE.TorusGeometry(0.1, 0.025, 5, 14), INK, s * 0.43, 0.12, 0).rotation.y = Math.PI / 2;
  const mkArm = (s) => { const g = new THREE.Group(); g.position.set(s * 0.58, 1.6, 0); torso.add(g);
    for (let k = 0; k < 7; k++) add(g, new THREE.TorusGeometry(0.08, 0.035, 5, 10), k % 2 ? INK2 : INK, s * k * 0.02, -0.08 - k * 0.09, 0).rotation.x = Math.PI / 2;
    for (const f of [-1, 1]) { const c = add(g, new THREE.ConeGeometry(0.045, 0.24, 5), RED, f * 0.06, -0.78, 0); c.rotation.z = f * 0.3; c.rotation.x = Math.PI; } return g; };
  const arms = [mkArm(-1), mkArm(1)];
  const legs = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(s * 0.26, 0, 0); body.add(g);
    [[0.15, 0.17], [0.46, 0.15], [0.75, 0.13]].forEach(([y, r]) => add(g, new THREE.SphereGeometry(r, 10, 8), y > 0.7 ? INK2 : INK, 0, y + 0.1, 0));
    add(g, new THREE.SphereGeometry(0.3, 12, 8), INK, 0, 0.05, 0.08).scale.set(0.7, 0.35, 1); return g; });
  const robotMats = []; body.traverse((o) => { if (o.material) { o.material = o.material.clone(); robotMats.push(o.material); } });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.62, 20), noLine(new THREE.MeshBasicMaterial({ color: C.ink, transparent: true, opacity: 0.25, depthWrite: false })));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; scene.add(shadow);
  player.position.set(0, 0, 4.5); scene.add(player);

  lounge.traverse((o) => { o.updateMatrix(); o.matrixAutoUpdate = false; });
  [car, tube, plat, doors, dl, dr, sign].forEach((o) => { o.matrixAutoUpdate = true; });
  out.traverse((o) => { if (o.parent === out && o.isMesh) { o.updateMatrix(); o.matrixAutoUpdate = false; } });
  const tan = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const dAng = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  function update(t, dt, speed01, stride) {
    const rise = Math.max(0, Math.min(1, (t - 0.7) / 1.2)); tube.position.y = -LH + (LH + 0.3) * (1 - Math.pow(1 - rise, 3)) + (reduced || rise < 1 || liftApi.locked ? 0 : Math.sin(t * 1.6) * 0.05);
    setIris(liftApi.irisC !== null ? liftApi.irisC : 1 - (1 - Math.pow(1 - Math.min(1, t / 0.7), 3)));
    const near = Math.hypot(player.position.x, player.position.z) < 2.5 && !liftApi.locked;
    liftApi.doorOpen += ((near ? 1 : 0) - liftApi.doorOpen) * (1 - Math.exp(-5 * dt));
    dl.rotation.y = liftApi.doorOpen * GAP * 0.5 * 1.02; dr.rotation.y = -liftApi.doorOpen * GAP * 0.5 * 1.02;
    sign.visible = !liftApi.locked && rise > 0.9; sign.position.y = 4.1 + (reduced ? 0 : Math.sin(t * 1.3) * 0.08);
    const flick = reduced ? 1 : 0.88 + 0.12 * Math.sin(t * 47) * Math.sin(t * 13);
    if (!reduced) scan.offset.y = -t * 0.08;
    for (const m of monitors) m.ov.material.opacity = flick;
    for (const m of mover) {
      const u = (m.off + t * m.sp) % 1; m.c.getPointAt(u, m.o.position);
      if (!reduced) m.o.position.y += Math.sin(t * 0.8 + m.off * 20) * 0.6;
      if (m.rocket) { m.c.getTangentAt(u, tan); m.o.quaternion.setFromUnitVectors(up, tan); } else { m.o.rotation.y = t * 0.6; m.o.rotation.z = reduced ? 0 : Math.sin(t + m.off * 9) * 0.08; }
    }
    exhaust(t);
    const w = stride * 1.8, idle = 1 - Math.min(1, speed01 * 2);
    body.position.y = Math.abs(Math.sin(w)) * 0.06 * speed01;
    body.rotation.z = Math.sin(w) * 0.07 * speed01;
    legs[0].position.y = Math.max(0, Math.sin(w)) * 0.12 * speed01; legs[1].position.y = Math.max(0, -Math.sin(w)) * 0.12 * speed01;
    arms[0].rotation.x = Math.sin(w) * 0.4 * speed01; arms[1].rotation.x = -Math.sin(w) * 0.4 * speed01;
    if (!reduced) { discs[0].rotation.y = t * (0.8 + idle * 0.6); discs[1].rotation.y = -t * (1.2 + idle * 0.8); head.rotation.y = Math.sin(t * 0.7) * 0.15 * idle; }
    const on = reduced ? 1 : (Math.sin(t * 4) > -0.2 ? 1 : 0.15);
    lightR.scale.setScalar(on); lightB.scale.setScalar(reduced ? 1 : (Math.sin(t * 3 + 2) > -0.2 ? 1 : 0.15));
    shadow.position.x = player.position.x; shadow.position.z = player.position.z;
  }
  return { scene, movers: mover, robotMats, lift: liftApi, occluders, player, body, monitors, screens, obstacles, floor, shadow, update };
}

/** Renderer, input, movement, collision and follow camera. */
import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { buildWorld, WALK_R } from './world.js';

const DEPTH = 4.1, NEAR = 3.6, ease = (x) => 1 - Math.pow(1 - x, 3), SPEED = 5;

export function startEngine({ stage, projects, reduced, onNear, onOpen, onExit, onReady, isPaused, joy }) {
  const dpr = window.devicePixelRatio || 1, coarse = matchMedia('(pointer: coarse)').matches, conn = navigator.connection || {};
  const lowTier = coarse || conn.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  let pr = Math.max(1, Math.min(dpr, coarse ? 1.5 : 2, conn.saveData ? 1 : 9));
  if (lowTier && !coarse) pr = Math.min(pr, 1.25);
  const renderer = new THREE.WebGLRenderer({ antialias: dpr < 2, stencil: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(pr);
  renderer.domElement.tabIndex = 0; renderer.domElement.style.touchAction = 'none';
  stage.appendChild(renderer.domElement);
  const fx = new OutlineEffect(renderer, { defaultThickness: 0.0036, defaultColor: [0.086, 0.086, 0.086] });
  const W = buildWorld({ projects, reduced, lowTier });
  const cam = new THREE.PerspectiveCamera(50, 1, 0.5, 600);
  const P = W.player.position;
  let locked = false, armed = true, ph = null, pt = 0, lastFrame = performance.now(), clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), nearLift = false, yaw = Math.PI / 2 + 0.42, target = null, near = null, speed01 = 0, face = 0, spd = 0, stride = 0; const vel = new THREE.Vector3(), prev = new THREE.Vector3(), MAXDT = 1 / 30;
  const tmp = new THREE.Vector3(), camPos = new THREE.Vector3(), look = new THREE.Vector3();
  let rt = 0; const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; fx.setSize(w, h); cam.aspect = w / h; cam.fov = w / h < 0.8 ? 62 : 50; cam.updateProjectionMatrix(); };
  resize(); new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(resize, 120); }).observe(stage);

  const ac = new AbortController(), sig = { signal: ac.signal };
  const keys = new Set();
  addEventListener('keydown', (e) => {
    if (isPaused() || locked) return;
    const k = e.key.toLowerCase();
    if (k === 'e' || k === 'enter') { if (near) onOpen(near); return; }
    if ('wasd'.includes(k) && k.length === 1 || k.startsWith('arrow')) { keys.add(k); target = null; if (k.startsWith('arrow')) e.preventDefault(); }
  }, sig);
  addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()), { ...sig, passive: true });
  addEventListener('blur', () => keys.clear(), { ...sig, passive: true });

  /* click / tap: monitor (open if close, else walk to it) or floor (walk) */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; }, { passive: true });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down || isPaused() || locked || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return; down = null;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, cam);
    if (ray.intersectObjects(W.lift.pick)[0] && !ray.intersectObjects(W.screens)[0]) { target = new THREE.Vector3(0, 0, 0); return; }
    const h = ray.intersectObjects(W.screens)[0];
    if (h) { const m = W.monitors[h.object.userData.index]; if (Math.hypot(m.x - P.x, m.z - P.z) < NEAR + 1) onOpen(m.p); else target = new THREE.Vector3(m.x * 0.8, 0, m.z * 0.8); return; }
    if (ray.ray.intersectPlane(plane, hit) && hit.length() < WALK_R + 0.5) target = hit.clone();
  });

  if (/left/.test(location.hash)) keys.add('a');
  const startClip = () => { const L = W.lift; L.rib.color.setHex(0xC8452E); L.rib.emissive.setHex(0x601810); L.mats.concat(W.robotMats).forEach((m) => { m.clippingPlanes = [clip]; }); renderer.localClippingEnabled = true; };
  const fwd = new THREE.Vector3(), right = new THREE.Vector3(), mv = new THREE.Vector3();
  let avg = 0.016, gov = 0, dbg = /debug/.test(location.hash), t = /lift/.test(location.hash) ? 2 : 0, frames = 0, last = performance.now();
  function frame(now) {
    const dt = Math.min(MAXDT, (now - last) / 1000); last = now; t += dt; lastFrame = performance.now();
    if (!isPaused() && !locked) {
      let ix = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
      let iz = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
      if (joy.x || joy.y) { ix = joy.x; iz = joy.y; target = null; }
      fwd.set(Math.cos(yaw), 0, Math.sin(yaw)); right.set(-fwd.z, 0, fwd.x);
      mv.set(0, 0, 0).addScaledVector(right, ix).addScaledVector(fwd, iz);
      let mag = Math.min(1, mv.length());
      if (mag > 0.01) mv.normalize(); else if (target) {
        mv.copy(target).sub(P); mv.y = 0; const d = mv.length();
        if (d < 0.25) { target = null; mag = 0; mv.set(0, 0, 0); } else { mv.divideScalar(d); mag = 1; }
      } else mag = 0;
      /* input -> velocity (damped, never set directly) -> position -> collisions -> facing */
      const ka = 1 - Math.exp(-10 * dt);
      vel.x += (mv.x * SPEED * mag - vel.x) * ka; vel.z += (mv.z * SPEED * mag - vel.z) * ka;
      P.x += vel.x * dt; P.z += vel.z * dt;
      /* push-out also removes the velocity driving into the obstacle, so velocity and collision never fight */
      const slide = (nx, nz) => { const vn = vel.x * nx + vel.z * nz; if (vn < 0) { vel.x -= vn * nx; vel.z -= vn * nz; } };
      for (const o of W.obstacles) { const dx = P.x - o.x, dz = P.z - o.z, d = Math.hypot(dx, dz), min = o.r + 0.38; if (d < min && d > 1e-4) { P.x = o.x + (dx / d) * min; P.z = o.z + (dz / d) * min; slide(dx / d, dz / d); } }
      { const d = Math.hypot(P.x, P.z), L = W.lift, free = L.doorOpen > 0.8 && Math.abs(Math.atan2(Math.sin(Math.atan2(P.x, P.z) - L.doorAngle), Math.cos(Math.atan2(P.x, P.z) - L.doorAngle))) < L.gap / 2 - 0.12;
        if (d < 1.75 && d > 1.05 && !free) { const k2 = 1.75 / d; slide(P.x / d, P.z / d); P.x *= k2; P.z *= k2; } else if (d < 1.05 && L.doorOpen < 0.8 && !armed) { /* inside with doors closing: stay */ } }
      const rr = Math.hypot(P.x, P.z); if (rr > WALK_R) { P.x *= WALK_R / rr; P.z *= WALK_R / rr; slide(-P.x / WALK_R, -P.z / WALK_R); }
      /* facing follows the INPUT direction only, and only when input is meaningful */
      if (mag > 0.1) face = Math.atan2(mv.x, mv.z);
      speed01 = Math.hypot(vel.x, vel.z) / SPEED;
    }
    { const L = W.lift, dc = Math.hypot(P.x, P.z);
      if (dc > 0.9 && !locked) armed = true;
      if (!locked && armed && dc < 0.6 && L.doorOpen > 0.5) { locked = true; armed = false; L.locked = true; onExit('confirm'); }
      if (ph) {
        const dur = { doors: 0.5, down: 1.8, iris: 0.7, beat: 0.3 }[ph], hold = (location.hash.match(/hold(mid|iris|closed)/) || [])[1];
        pt += dbg ? 0.34 : dt / dur;
        if (ph === 'doors') { if (pt >= 1) { ph = 'down'; pt = 0; startClip(); } }
        else if (ph === 'down') { if (hold === 'mid' && pt > 0.62) pt = 0.62; const y = -DEPTH * Math.min(1, pt) * Math.min(1, pt); P.y = y; L.car.position.y = y; W.shadow.visible = false; if (pt >= 1) { ph = 'iris'; pt = 0; L.irisC = 0; } }
        else if (ph === 'iris') { if (hold === 'iris' && pt > 0.5) pt = 0.5; L.irisC = 1 - Math.pow(1 - Math.min(1, pt), 3); if (pt >= 1) { ph = 'beat'; pt = 0; } }
        else if (ph === 'beat') { L.irisC = 1; if (hold === 'closed') pt = 0.5; if (pt >= 1) { ph = null; onExit(false); } }
      }
      const sx = P.x - cam.position.x, sz = P.z - cam.position.z, ll = sx * sx + sz * sz, u = Math.max(0, Math.min(1, ((0 - cam.position.x) * sx + (0 - cam.position.z) * sz) / ll));
      const hit = Math.hypot(cam.position.x + sx * u, cam.position.z + sz * u) < 1.6 || Math.hypot(cam.position.x, cam.position.z) < 2;
      L.glass.opacity += ((hit ? 0.1 : 0.25) - L.glass.opacity) * (1 - Math.exp(-8 * dt));
      const nl = dc < 3.4 && !locked; if (nl !== nearLift) { nearLift = nl; onNear(near, nearLift); }
    }
    let da = face - W.body.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); W.body.rotation.y += da * (1 - Math.exp(-10 * dt));
    /* animation: amplitude from smoothed speed, phase from distance travelled; runs before the camera */
    spd += (speed01 - spd) * (1 - Math.exp(-8 * dt)); stride += spd * SPEED * dt;
    W.update(t, dt, spd, stride);
    /* camera sits on the centre side of your robot, so screens face it */
    /* camera re-centres only while not strafing, so lateral input can't feed back into the view yaw */
    const rr = Math.hypot(P.x, P.z), lateral = Math.abs(mv.x * right.x + mv.z * right.z) * speed01;
    if (rr > 4 && lateral < 0.15) { const ty = Math.atan2(P.z, P.x) + 0.42; let dy = ty - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); yaw += dy * (1 - Math.exp(-1.6 * Math.min(1, (rr - 4) / 3) * dt)); }
    const cx = Math.cos(yaw), cz = Math.sin(yaw);
    const k = frames++ < 4 ? 1 : 1 - Math.exp(-4 * dt);
    camPos.set(P.x - cx * 11, 8.4, P.z - cz * 11); cam.position.lerp(camPos, k);
    look.lerp(tmp.set(P.x + cx * 3, 2.0, P.z + cz * 3), k); cam.lookAt(look);
    if (/rocket/.test(location.hash)) { const r = W.movers[0].o.position; if (/rocketzoom/.test(location.hash)) { const sx = tmp.set(1, 0, 0).applyQuaternion(W.movers[0].o.quaternion); cam.position.set(r.x + sx.x * 24, r.y + 1.5, r.z + sx.z * 24); } else cam.position.set(r.x + 13, r.y + 5, r.z + 24); cam.lookAt(r.x, r.y - 0.5, r.z); }
    if (/close/.test(location.hash)) { cam.position.set(P.x + 2, 2.7, P.z + 4.2); cam.lookAt(P.x, 1.9, P.z); }
    let best = null, bd = NEAR;
    for (const m of W.monitors) { const d = Math.hypot(m.x - P.x, m.z - P.z); if (d < bd) { bd = d; best = m.p; } }
    if (best !== near) { near = best; onNear(near, nearLift); }
    for (const o of W.occluders) {
      const sx = P.x - cam.position.x, sz = P.z - cam.position.z, L = sx * sx + sz * sz;
      const u = Math.max(0, Math.min(1, ((o.x - cam.position.x) * sx + (o.z - cam.position.z) * sz) / L));
      o.g.visible = !(Math.hypot(cam.position.x - o.x, cam.position.z - o.z) < (o.x || o.z ? 3 : 11) || u < 0.97 && Math.hypot(cam.position.x + sx * u - o.x, cam.position.z + sz * u - o.z) < o.r + 0.5);
    }
    if (dbg && /left/.test(location.hash) && frames < 40) console.info('[left] f', frames, 'yaw', yaw.toFixed(3), 'face', W.body.rotation.y.toFixed(3), 'x', P.x.toFixed(2), 'z', P.z.toFixed(2));
    fx.render(W.scene, cam);
    if (frames === 1 && onReady) requestAnimationFrame(onReady);
    /* frame-time governor: step pixel ratio down (never below 1) when the rolling average is over 20 ms */
    avg += (dt - avg) * 0.05; if (++gov > 90 && avg > 0.02 && pr > 1) { pr = Math.max(1, pr - 0.25); renderer.setPixelRatio(pr); resize(); gov = 0; avg = 0.016; }
    if (dbg && frames % 10 === 0) console.info('[lounge] ph', ph, pt.toFixed(2), 'calls', renderer.info.render.calls, 'tris', renderer.info.render.triangles, 'pr', pr);
  }
  /* first frame: snap camera */
  camPos.set(P.x - Math.cos(yaw) * 11, 8.4, P.z - Math.sin(yaw) * 11); cam.position.copy(camPos); look.set(P.x, 1.6, P.z + 2);
  if (/near/.test(location.hash)) { const m = W.monitors[2]; P.set(m.x * 0.7, 0, m.z * 0.7); yaw = Math.atan2(m.z, m.x) + 0.42; camPos.set(P.x - Math.cos(yaw) * 11, 8.4, P.z - Math.sin(yaw) * 11); cam.position.copy(camPos); look.set(P.x, 1.6, P.z); if (/panel/.test(location.hash)) setTimeout(() => onOpen(m.p), 1500); }
  if (/lift/.test(location.hash)) { const hx = location.hash; if (/liftopen/.test(hx)) P.set(0, 0, 2.4); else if (/liftdesc/.test(hx)) { P.set(0, 0, 0.3); W.lift.doorOpen = 1; } else P.set(0, 0, 5); yaw = Math.PI / 2 + 0.42; camPos.set(P.x - Math.cos(yaw) * 11, 8.4, P.z - Math.sin(yaw) * 11); cam.position.copy(camPos); look.set(P.x, 1.6, P.z); }
  renderer.setAnimationLoop(frame);
  const run = () => { last = performance.now(); renderer.setAnimationLoop(frame); };
  document.addEventListener('visibilitychange', () => (document.hidden ? renderer.setAnimationLoop(null) : run()));
  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); renderer.setAnimationLoop(null); });
  renderer.domElement.addEventListener('webglcontextrestored', run);
  addEventListener('pagehide', () => { renderer.setAnimationLoop(null); W.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const m = o.material; if (m) [].concat(m).forEach((x) => { x.map && x.map.dispose(); x.dispose(); }); }); renderer.dispose(); });
  window.__lounge = { teleport(x, z) { P.set(x, 0, z); }, world: W, cam };
  const dispose = () => { ac.abort(); renderer.setAnimationLoop(null); W.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const m = o.material; if (m) [].concat(m).forEach((x) => { x.map && x.map.dispose(); x.dispose(); }); }); renderer.dispose(); };
  return { open: () => near && onOpen(near), dispose, unlock() { locked = false; W.lift.locked = false; P.set(0, 0, 1.5); }, descend() { const hm = location.hash.match(/hold(mid|iris|closed|nav)/); if (dbg && hm) { startClip(); W.shadow.visible = false; if (hm[1] === 'mid') { ph = 'down'; pt = 0.62; } else { P.y = W.lift.car.position.y = -DEPTH; W.lift.irisC = hm[1] === 'iris' ? 0 : 1; ph = hm[1] === 'iris' ? 'iris' : 'beat'; pt = hm[1] === 'nav' ? 0.9 : 0.5; } return; } if (reduced) { P.y = -DEPTH; W.lift.car.position.y = -DEPTH; W.lift.irisC = 1; ph = null; onExit(false); } else { ph = 'doors'; pt = 0; } }, lastFrame: () => lastFrame, walkToLift() { target = new THREE.Vector3(0, 0, 0); } };
}

// ═══════════════════════════ paper_kit.js · format "papel" · PAPER CUT-OUT kit (window.PK) ═══════════════════════════
// The paper cut-out look as reusable, animatable, pure-of-t drawing functions on a canvas ctx (draw on K).
// Every function draws in the ctx's CURRENT coordinates (use X([K], x, y, s, rot, fn) / K.translate for placement).
// Shadows are scaled with the current transform, so pieces look right at any size.
//
// ── FONTS ── Figtree + Nunito are awaited before the first frame (ASSETS entry '__pkfonts'). PK.F = '800 {s}px Figtree' helpers:
//    PK.font(size, weight = 800, fam = 'Figtree')
//
// ── PAPER PRIMITIVES ──
//    PK.paper(K, pts, col, o)        torn cut-out fill of polygon pts [[x,y],...] with white torn rim + soft drop shadow.
//        o: { rim: true, rimCol, shadow: 1 (0 = none, >1 darker), lift: 0 (0..1+: lifted higher, bigger/offset shadow),
//             seed (KEEP CONSTANT for animated shapes; default derives from size), amp (torn amplitude, ~2.2), hf (fibre jitter),
//             tone: false (inner top-left shading on big pieces), alpha, raw: false (no tearing), stroke: [col, lw] }
//        returns the torn polygon.
//    PK.line(K, pts, w, col, o)      a paper strip / stroke along an open polyline (brows, gyri, wires).   o: { shadow, seed, cap }
//    PK.rect(K, x, y, w, h, r, col, o) · PK.ellipse(K, cx, cy, rx, ry, col, o) · PK.blob(K, cx, cy, rx, ry, bumps, amt, col, o)
//    PK.limb(K, pts, w, col, o)      thick rounded limb along a path (arms, legs, posts).
//    PK.text(K, str, x, y, size, col, o)  cut-out paper letters (rim + shadow).  o: { font: 'Figtree'|'Nunito', weight, rot, ls, rim }
//    PK.plate(K, str, x, y, o)       a word on a torn coloured paper plate (labels: one or two words).
//        o: { size: 64, fill: '#ffd54a', color: ink, rot: 0, padX, padY, font, seed }  returns {w, h}
//    PK.wob(t, seed, amp = 3)        idle rotation wobble in DEGREES (paper puppet sway).  PK.bob(t, seed, amp) idle y offset px.
//    PK.pop(t, t0, f = 2.8, z = 0.42) paper pop scale 0 → 1 with overshoot (0 before t0).  PK.popIn(t, t0) = {s, r} scale + wobble rot.
//    PK.dropY(t, t0, h = 700) (also PK.drop(t, t0, h) when the 1st arg is a number) y offset of a dropped piece (falls from -h, bounces, settles 0).  PK.squash(t, tLand) → {sx, sy}
//    PK.fall(t, t0, o)               gravity fall after t0 → {x, y, r} offsets (o: vx, vy, spin, g).
//    PK.confetti(K, x, y, dt, o)     paper confetti burst (o: n 16, spread 320, cols, seed, dur 1.2, size 18, up 1).
//    PK.puff(K, x, y, dt, o)         white paper poof (dust/smoke circles bursting out; o: n 7, r 60, col, seed, dur 0.7).
//    PK.smoke(K, x, y, dt, o)        one rising, growing smoke cloud (o: s 1, dur 2.4, col, seed).
//    PK.sparkle(K, x, y, r, col, rot) 4-point paper sparkle.   PK.star(K, x, y, ro, ri, col, o)   PK.heart(K, x, y, s, col, o)
//    PK.cloud(K, x, y, s, col, o)    paper cloud.   PK.fibre(K, alpha = 0.5) paper fibre texture over the whole frame (screen space).
//    PK.geo.{ell, rrect, path, rough, limbPoly, blob, boltPts, star, cloudPoly, bbox, tr, trace, rot, scale}  raw geometry.
//
// ── BACKGROUNDS (screen space, call in back(T, K, t)) ── all animated, o.ground shifts the horizon (screen y, default 1500)
//    PK.bg.day(K, t, o)     sky, pale circle, rotating sun, drifting clouds, layered paper hills, swaying grass.
//                           o: { sun: true, clouds: true, circle: true, sky, hills: [4 cols] }
//    PK.bg.night(K, t, o)   navy paper sky, moon, twinkling stars, dark hills.
//    PK.bg.battle(K, t, o)  dusty sky, smoke puffs on the horizon, little tent, waving flag, sandbags (toy-like, no weapons).
//    PK.bg.tent(K, t, o)    field-hospital tent interior: canvas walls, roof, pole, swinging lamp, plank floor, plus-sign banner.
//    PK.bg.wall(K, t, col, o) plain coloured paper wall with soft torn patches; o.floor = floor colour (or false).
//
// ── CAPTIONS ── PK.captions(K, t) in every scene's top(): word-by-word torn paper strips (screen y 170-430), Figtree 800 navy,
//    one key word per phrase on a coloured highlight strip, phrases split on punctuation/pauses, never across beat cuts.
//    Also lays the paper fibre texture over the frame first. Overrides: PK.capEm = { wordIdx: true } (force key word),
//    PK.capNoEm = { phraseFirstWordIdx: true } (no key word in that phrase), PK.capBreak = { wordIdx: true } (start a phrase there).
//    PK.capHide(t) → true to hide (default: last 0.5 s of the reel). PK.phrases() → [{i0, i1, show, end, em, lines}]
//
// ── CHARACTERS ── (K, x, y, s, st) → anchors {head, handL, handR, ...} in the caller's coords. x, y = feet/base point (kid,
//    soldier, doctor, dial, lever), centre (brain, drop, bolt). Common st: t (for idle/blink), rot (deg), alpha, sx/sy (squash),
//    flip (-1 mirrors), blink (0..1, auto from t when undefined), look: [lx, ly] (-1..1), mouth: 'smile'|'o'|'grimace'|'flat'|'open'|'frown'|'small',
//    brow: -1..1 (up = surprised), angry: 0..1 (brows slant in), worried: 0..1, blush: true.
//    PK.kid(K, x, y, s, st)      explorer kid (hat, star tee, shorts). st: armL, armR (deg from hanging down, + = outward/up),
//                                elbowL, elbowR (deg extra bend), legL, legR (deg, + = foot to the right), run (phase rad, drives
//                                legs/arms/bob), headRot (deg), arm: 'L'|'R'|true (bandage on forearm), knee: 'L'|'R'|true (knee
//                                bandage), scrape: 'L'|'R' (pink scratch on knee), wrap 0..1 (bandage reveal), tears 0..1, sweat 0..1,
//                                hat: true, helmet: false, holdKnee: true (both hands to knee, overrides arms)
//                                ~700 px tall at s = 1 (feet at y, hat top at y - 700).
//    PK.soldier(K, x, y, s, st)  same body, green helmet + jacket + khaki trousers, toy-like (no weapons). Same st.
//    PK.doctor(K, x, y, s, st)   1940s doctor: white coat, round glasses, moustache, head mirror, clipboard (st.clip true,
//                                st.ticks 0..3 green checks on it, st.clipRaise 0..1), ~720 px tall at s = 1.
//    PK.brain(K, x, y, s, st)    pink paper brain (centre at x, y; ~430 × 320 at s = 1) with eyes, blush, white gloved hands.
//                                st.handL / st.handR: [x, y] targets in CALLER coords (it reaches/grabs there), else idle pose;
//                                st.wave 0..1 (left hand waves), st.point: 'L'|'R' (index finger), st.grip: 'L'|'R'|true (fist on knob),
//                                st.plug: true (nerve plug on the left).
//    PK.drop(K, x, y, s, st)     mint painkiller droplet with a face (~130 × 170 at s = 1). st.stop: true (holds a STOP sign up),
//                                st.armL/armR, st.wave, st.shield: true, st.col.
//    PK.bolt(K, x, y, s, st)     red/pink zig-zag pain bolt (~120 × 300 at s = 1). st.angry: true (eyes + angry brows),
//                                st.ghost: true (dashed outline only), st.col, st.glow 0..1, rot, face: false.
//    PK.dial(K, x, y, s, st)     PAIN box on a post (base at x, y; ~300 × 530 at s = 1). st.v 0..1 needle (0 green … 1 red),
//                                st.lit 0..1 (ticks lit up to this value; default all), st.label 'PAIN', st.post: true.
//                                returns { knob, needleTip, top }.
//    PK.lever(K, x, y, s, st)    big switch lever on a box (base at x, y; ~300 × 420). st.v 0..1 (0 = up-left / red lamp, 1 =
//                                down-right / green lamp), st.labels: ['ON', 'OFF'] optional, st.a0/a1 stick angles (deg, default -55/55). returns { ball, pivot }.
//    PK.pal                      the palette (skin, shirt, brain, pain '#ff3d5e', mint '#3cc9a8', ink '#22203f', …).
// Preview sheet: scenes/preview_kit.js → reel stills . 0.5 1.5 --only preview_kit --out kit
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
(() => {
  const PK = window.PK = {};
  const D = Math.PI / 180, TWO = Math.PI * 2;
  const cl01 = x => Math.min(1, Math.max(0, x));
  const lp = (a, b, t) => a + (b - a) * t;
  const hs = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const nz = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lp(hs(i), hs(i + 1), u) * 2 - 1; };
  function prng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const spr = (dt, f = 2.4, z = 0.36) => { if (dt <= 0) return 0; const w = TWO * f; return 1 - Math.exp(-z * w * dt) * Math.cos(w * Math.sqrt(1 - z * z) * dt); };
  const rng0 = (dt, f = 3.5, k = 7) => dt < 0 ? 0 : Math.exp(-k * dt) * Math.cos(TWO * f * dt);

  // ── palette ──
  const pal = PK.pal = {
    ink: '#22203f', paperW: '#fffaf0', cream: '#f3ead8', rimShadow: 'rgba(35,30,55,0.30)',
    skin: '#f2c29c', skinDk: '#e2a97e', hair: '#6b3f2a', shirt: '#ef5b7b', shorts: '#3f5fb0', shoe: '#2f2a44', hat: '#e2b866', hatBand: '#7b4f2c',
    eyeW: '#fffaf0', pupil: '#2b2230', mouth: '#b8324e', tongue: '#f27a93', blush: '#f58ca5', star: '#ffd54a', bandage: '#fffaf0',
    brain: '#f7a1c4', brainLine: '#c75b8d', glove: '#fffaf0',
    box: '#6b5bd6', boxDk: '#4a3fa3', panel: '#2c2950', knob: '#f5ecd9', pointer: '#e8364f', plate: '#ffd54a',
    ticks: ['#4cc77a', '#ffd54a', '#e8364f'],
    pain: '#ff3d5e', painDk: '#d42a4a', mint: '#3cc9a8', mintDk: '#2aa588', mintLt: '#8fe6cf', danger: '#ffb02e', fire: '#ff7a2e', ok: '#3bd16f',
    sky: '#9fd8ec', skyPale: '#b9e4f2', sun: '#ffd54a', cloud: '#ffffff',
    hills: ['#5aa66a', '#4b9660', '#7cc47e', '#69b56f'],
    army: '#6b8f3e', armyDk: '#4f6e2c', armyLt: '#86a957', khaki: '#b39a64', boot: '#4a3426',
    coat: '#eef0f2', coatDk: '#d5dae2', trousers: '#3d3f55', docHair: '#8c7b6b', tie: '#3cc9a8', clip: '#b07a45',
  };
  PK.font = (size, weight = 800, fam = 'Figtree') => `${weight} ${size}px ${fam}`;

  // ── fonts: wait for Figtree + Nunito before the first frame ──
  try {
    const _li = window.loadImg;
    if (typeof _li === 'function' && !_li.__pk) {
      const wrapped = function (k, src) {
        if (k === '__pkfonts') return Promise.all(['800 100px Figtree', '900 100px Figtree', '700 100px Figtree', '900 100px Nunito', '800 100px Nunito']
          .map(f => document.fonts.load(f).catch(() => {}))).then(() => {});
        if (k === '__pkpreview') return new Promise(res => { const sc = document.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = () => { console.warn('no ' + src); res(); }; document.body.appendChild(sc); });
        return _li(k, src);
      };
      wrapped.__pk = true; window.loadImg = wrapped;
    }
    if (typeof ASSETS !== 'undefined' && !ASSETS.some(a => a[0] === '__pkfonts')) ASSETS.push(['__pkfonts', '']);
    // the kit preview sheet (scenes/preview_kit.js) is loaded only for `reel stills . … --only preview_kit`
    if (typeof ONLY !== 'undefined' && ONLY === 'preview_kit' && typeof ASSETS !== 'undefined') ASSETS.push(['__pkpreview', 'scenes/preview_kit.js']);
  } catch (e) { console.warn('paper_kit fonts: ' + e.message); }

  // ═════════════ geometry ═════════════
  function ell(cx, cy, rx, ry, n = 64) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TWO; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } p.closed = true; return p; }
  function rrect(x, y, w, h, r, n = 8) { r = Math.max(0.5, Math.min(r, w / 2, h / 2)); const p = []; const cs = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]]; for (const [cx, cy, a0] of cs) for (let i = 0; i <= n; i++) { const a = (a0 + 90 * i / n) * D; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } p.closed = true; return p; }
  function path(cmds, closed = false, step = 6) {
    const p = []; let cx = 0, cy = 0;
    for (const c of cmds) {
      const t = c[0];
      if (t === 'M') { cx = c[1]; cy = c[2]; p.push([cx, cy]); }
      else if (t === 'L') { const d = Math.hypot(c[1] - cx, c[2] - cy), n = Math.max(1, Math.ceil(d / step)); for (let i = 1; i <= n; i++) p.push([cx + (c[1] - cx) * i / n, cy + (c[2] - cy) * i / n]); cx = c[1]; cy = c[2]; }
      else if (t === 'Q') { const [, x1, y1, x, y] = c; const d = Math.hypot(x1 - cx, y1 - cy) + Math.hypot(x - x1, y - y1); const n = Math.max(2, Math.ceil(d / step)); for (let i = 1; i <= n; i++) { const s = i / n, u = 1 - s; p.push([u * u * cx + 2 * u * s * x1 + s * s * x, u * u * cy + 2 * u * s * y1 + s * s * y]); } cx = x; cy = y; }
      else if (t === 'C') { const [, x1, y1, x2, y2, x, y] = c; const d = Math.hypot(x1 - cx, y1 - cy) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x - x2, y - y2); const n = Math.max(2, Math.ceil(d / step)); for (let i = 1; i <= n; i++) { const s = i / n, u = 1 - s; p.push([u * u * u * cx + 3 * u * u * s * x1 + 3 * u * s * s * x2 + s * s * s * x, u * u * u * cy + 3 * u * u * s * y1 + 3 * u * s * s * y2 + s * s * s * y]); } cx = x; cy = y; }
    }
    p.closed = closed; return p;
  }
  function dens(p, step = 6) { const out = []; const n = p.length; const segs = p.closed ? n : n - 1; for (let i = 0; i < segs; i++) { const a = p[i], b = p[(i + 1) % n]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]); const k = Math.max(1, Math.ceil(d / step)); for (let j = 0; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]); } if (!p.closed) out.push(p[n - 1]); out.closed = p.closed; return out; }
  // torn edge: smooth multi-sine wobble along arc length + fibre jitter keyed to arc length (stable while a shape moves)
  function rough(p, amp, freq = 1, seed = 1, hf = 0) {
    const q = dens(p, 5); const r = prng(seed * 9973 + 11); const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
    const f = [0.011 * freq, 0.029 * freq, 0.071 * freq]; const n = q.length; const out = []; let s = 0;
    for (let i = 0; i < n; i++) {
      const a = q.closed ? q[(i - 1 + n) % n] : q[Math.max(0, i - 1)], b = q.closed ? q[(i + 1) % n] : q[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; const nx = -dy / d, ny = dx / d;
      if (i > 0) s += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
      const off = amp * (0.55 * Math.sin(s * f[0] + ph[0]) + 0.3 * Math.sin(s * f[1] + ph[1]) + 0.15 * Math.sin(s * f[2] + ph[2])) + hf * (hs(seed * 3.17 + Math.floor(s / 4.5) * 0.731) - 0.5) * 2;
      out.push([q[i][0] + nx * off, q[i][1] + ny * off]);
    }
    out.closed = q.closed; return out;
  }
  function limbPoly(p, w) {
    const q = dens(Object.assign(p.slice(), { closed: false }), 5); const n = q.length, h = w / 2, L = [], Rr = [];
    if (n < 2) return ell(p[0][0], p[0][1], h, h);
    for (let i = 0; i < n; i++) { const a = q[Math.max(0, i - 1)], b = q[Math.min(n - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; const nx = -dy / d, ny = dx / d; L.push([q[i][0] + nx * h, q[i][1] + ny * h]); Rr.push([q[i][0] - nx * h, q[i][1] - ny * h]); }
    const out = [...L]; const e = q[n - 1]; const ea = Math.atan2(L[n - 1][1] - e[1], L[n - 1][0] - e[0]);
    for (let k = 1; k < 12; k++) { const a = ea - Math.PI * k / 12; out.push([e[0] + Math.cos(a) * h, e[1] + Math.sin(a) * h]); }
    for (let i = n - 1; i >= 0; i--) out.push(Rr[i]);
    const s0 = q[0]; const sa = Math.atan2(Rr[0][1] - s0[1], Rr[0][0] - s0[0]);
    for (let k = 1; k < 12; k++) { const a = sa - Math.PI * k / 12; out.push([s0[0] + Math.cos(a) * h, s0[1] + Math.sin(a) * h]); }
    out.closed = true; return out;
  }
  function blobG(cx, cy, rx, ry, n, a, N = 180, flatB = 1) { const p = []; for (let i = 0; i < N; i++) { const t = i / N * TWO; const k = 1 + a * (Math.pow(Math.abs(Math.sin(n * t / 2)), 0.5) - 0.6); const sy = Math.sin(t) > 0 ? flatB : 1; p.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k * sy]); } p.closed = true; return p; }
  function boltPts(cx, cy, s, rot = 0) { const b = [[-4, -74], [28, -74], [8, -18], [32, -18], [-18, 76], [-2, 8], [-28, 8]]; const c = Math.cos(rot * D), si = Math.sin(rot * D); const p = b.map(([x, y]) => { x *= s; y *= s; return [cx + x * c - y * si, cy + x * si + y * c]; }); p.closed = true; return p; }
  function starG(cx, cy, ro, ri, n, rot = -90) { const p = []; for (let i = 0; i < n * 2; i++) { const a = (rot + i * 180 / n) * D, r = i % 2 ? ri : ro; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } p.closed = true; return p; }
  function bbox(p) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of p) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; }
  const tr = (p, dx, dy) => { const q = p.map(([x, y]) => [x + dx, y + dy]); q.closed = p.closed; return q; };
  const rotP = (p, cx, cy, deg) => { const c = Math.cos(deg * D), s = Math.sin(deg * D); const q = p.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); q.closed = p.closed; return q; };
  const scaleP = (p, cx, cy, sx, sy = sx) => { const q = p.map(([x, y]) => [cx + (x - cx) * sx, cy + (y - cy) * sy]); q.closed = p.closed; return q; };
  function trace(c, p, close) { c.beginPath(); c.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]); if (close) c.closePath(); }
  function cloudPoly(x, y, s) {
    const cs = [[-60, 10, 42], [-20, -18, 55], [35, -8, 48], [70, 14, 36], [0, 20, 44]].map(([dx, dy, r]) => [x + dx * s, y + dy * s, r * s]);
    const cx = x, cy = y + 4 * s, p = [];
    for (let i = 0; i < 120; i++) { const a = i / 120 * TWO, ux = Math.cos(a), uy = Math.sin(a); let best = 0;
      for (const [ox, oy, r] of cs) { const fx = cx - ox, fy = cy - oy; const b = fx * ux + fy * uy, cc = fx * fx + fy * fy - r * r; const disc = b * b - cc; if (disc >= 0) { const t = -b + Math.sqrt(disc); if (t > best) best = t; } }
      p.push([cx + ux * best, cy + uy * best]); }
    p.closed = true; return p;
  }
  PK.geo = { ell, rrect, path, dens, rough, limbPoly, blob: blobG, boltPts, star: starG, cloudPoly, bbox, tr, trace, rot: rotP, scale: scaleP };

  // ═════════════ paper primitives ═════════════
  const tScale = c => { const m = c.getTransform(); return Math.max(0.05, Math.hypot(m.a, m.b)); };
  const autoSeed = (p, bb) => Math.round(p.length * 31 + Math.round(bb.w) * 7 + Math.round(bb.h) * 3);
  function paper(c, pts, col, o = {}) {
    if (!pts || pts.length < 3) return pts;
    const bb = bbox(pts), sc = tScale(c), small = o.small ?? (Math.max(bb.w, bb.h) * sc < 46);
    const seed = o.seed ?? autoSeed(pts, bb);
    const q = o.raw ? pts : rough(pts, o.amp ?? (small ? 0.8 : 2.2), small ? 2 : 3, seed, o.hf ?? (small ? 0.35 : 1.3));
    const lift = o.lift || 0, sh = o.shadow ?? 1;
    c.save();
    if (o.alpha != null) c.globalAlpha *= cl01(o.alpha);
    if (sh > 0) {
      c.shadowColor = `rgba(35,30,55,${Math.min(0.6, 0.28 * sh * (1 + lift * 0.3))})`;
      c.shadowBlur = (small ? 4 : 15) * (1 + lift * 1.4) * sc; c.shadowOffsetX = (small ? 1.5 : 4) * (1 + lift) * sc; c.shadowOffsetY = (small ? 2.5 : 8) * (1 + lift * 1.6) * sc;
    }
    const rim = o.rim ?? !small;
    if (rim) { const rw = (o.rimW ?? 3.2) / sc; trace(c, tr(q, -rw, -rw * 1.05), true); c.fillStyle = o.rimCol || pal.paperW; c.fill(); trace(c, tr(q, rw * 0.5, rw * 0.6), true); c.fill(); c.shadowColor = 'transparent'; }
    trace(c, q, true); c.fillStyle = col; c.fill();
    c.restore();
    if (o.tone && !small) { c.save(); if (o.alpha != null) c.globalAlpha *= cl01(o.alpha); trace(c, q, true); c.clip(); c.globalAlpha *= 0.09; c.fillStyle = '#000'; trace(c, tr(q, 14, 16), true); c.rect(bb.x0 - 50, bb.y0 - 50, bb.w + 100, bb.h + 100); c.fill('evenodd'); c.restore(); }
    if (o.stroke) { c.save(); trace(c, q, true); c.strokeStyle = o.stroke[0]; c.lineWidth = o.stroke[1]; c.lineJoin = 'round'; c.stroke(); c.restore(); }
    return q;
  }
  PK.paper = paper;
  PK.line = (c, pts, w, col, o = {}) => {
    if (!pts || pts.length < 2) return;
    const sc = tScale(c); const q = o.raw ? pts : rough(pts, o.amp ?? 0.8, 2, o.seed ?? (pts.length * 13 + Math.round(w)), 0.5);
    c.save(); if (o.alpha != null) c.globalAlpha *= cl01(o.alpha);
    if ((o.shadow ?? 1) > 0) { c.shadowColor = `rgba(35,30,55,${0.28 * (o.shadow ?? 1)})`; c.shadowBlur = 5 * sc; c.shadowOffsetX = 2 * sc; c.shadowOffsetY = 3 * sc; }
    c.lineCap = o.cap || 'round'; c.lineJoin = 'round'; if (o.dash) c.setLineDash(o.dash);
    trace(c, q, false); c.lineWidth = w; c.strokeStyle = col; c.stroke(); c.restore();
  };
  PK.rect = (c, x, y, w, h, r, col, o) => paper(c, rrect(x, y, w, h, r), col, o);
  PK.ellipse = (c, cx, cy, rx, ry, col, o) => paper(c, ell(cx, cy, rx, ry), col, o);
  PK.blob = (c, cx, cy, rx, ry, n, a, col, o) => paper(c, blobG(cx, cy, rx, ry, n, a), col, o);
  PK.limb = (c, pts, w, col, o) => paper(c, limbPoly(pts, w), col, Object.assign({ seed: 7 + Math.round(w) }, o));
  PK.cloud = (c, x, y, s, col = pal.cloud, o = {}) => paper(c, cloudPoly(x, y, s), col, Object.assign({ seed: 31 + Math.round(s * 10), amp: 3 }, o));
  PK.star = (c, x, y, ro, ri, col, o = {}) => paper(c, starG(x, y, ro, ri, o.n || 5, o.rot ?? -90), col, Object.assign({ seed: 55 }, o));
  PK.heart = (c, x, y, s, col = pal.pain, o = {}) => {
    const p = path([['M', 0, 30], ['C', -70, -20, -40, -80, 0, -40], ['C', 40, -80, 70, -20, 0, 30]], true, 4).map(([a, b]) => [x + a * s, y + b * s]); p.closed = true;
    return paper(c, p, col, Object.assign({ seed: 77 }, o));
  };
  PK.sparkle = (c, x, y, r, col = '#fff3b0', rot = 0) => {
    const p = []; for (let i = 0; i < 8; i++) { const a = (i * 45 + rot) * D - Math.PI / 2, rr = i % 2 ? r * 0.26 : r; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } p.closed = true;
    paper(c, p, col, { seed: 9, amp: 0.6, rim: r > 18, small: r <= 18 });
  };
  PK.text = (c, str, x, y, size, col = pal.ink, o = {}) => {
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot * D); if (o.alpha != null) c.globalAlpha *= cl01(o.alpha);
    c.font = PK.font(size, o.weight || 900, o.font || 'Figtree'); c.textAlign = o.align || 'center'; c.textBaseline = 'alphabetic';
    if (o.ls) c.letterSpacing = o.ls + 'px';
    const sc = tScale(c);
    if (o.rim !== false) { c.save(); c.shadowColor = 'rgba(35,30,55,0.32)'; c.shadowBlur = 10 * sc; c.shadowOffsetX = 3 * sc; c.shadowOffsetY = 6 * sc; c.lineJoin = 'round'; c.lineWidth = size * 0.16; c.strokeStyle = o.rimCol || pal.paperW; c.strokeText(str, 0, 0); c.restore(); }
    c.fillStyle = col; c.fillText(str, 0, 0); c.restore();
  };
  PK.plate = (c, str, x, y, o = {}) => {
    const size = o.size || 64; c.save(); c.font = PK.font(size, o.weight || 900, o.font || 'Figtree'); if (o.ls) c.letterSpacing = o.ls + 'px';
    const tw = c.measureText(str).width; c.restore();
    const pw = tw + (o.padX ?? size * 0.7), ph = size * 1.25 + (o.padY ?? 0);
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot * D); if (o.alpha != null) c.globalAlpha *= cl01(o.alpha);
    paper(c, rrect(-pw / 2, -ph / 2, pw, ph, o.r ?? size * 0.22), o.fill || pal.plate, { seed: o.seed ?? (str.length * 17 + size), amp: 2.4, lift: o.lift || 0 });
    c.font = PK.font(size, o.weight || 900, o.font || 'Figtree'); if (o.ls) c.letterSpacing = o.ls + 'px'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = o.color || pal.ink; c.fillText(str, 0, size * 0.36);
    c.restore(); return { w: pw, h: ph };
  };

  // ── motion helpers ──
  PK.wob = (t, seed = 0, amp = 3) => amp * (0.62 * Math.sin(t * 2.1 + seed * 1.7) + 0.38 * nz(t * 1.3 + seed * 7.1));
  PK.bob = (t, seed = 0, amp = 6) => amp * Math.sin(t * 2.6 + seed * 2.3);
  PK.pop = (t, t0, f = 2.8, z = 0.42) => t < t0 ? 0 : spr(t - t0, f, z);
  PK.popIn = (t, t0, o = {}) => ({ s: PK.pop(t, t0, o.f || 2.8, o.z || 0.42), r: rng0(t - t0, o.rf || 2.6, o.rk || 5) * (o.ra ?? 12) });
  PK.dropY = (t, t0, h = 700) => { if (t < t0) return -h; const dt = t - t0, tf = 0.28; if (dt < tf) { const u = dt / tf; return -h * (1 - u * u); } return -Math.abs(Math.sin((dt - tf) * 10)) * Math.exp(-(dt - tf) * 7) * h * 0.08; };
  PK.squash = (t, tLand, amt = 0.22) => { const k = rng0(t - tLand, 3.2, 7) * amt; return { sx: 1 + k, sy: 1 - k }; };
  PK.fall = (t, t0, o = {}) => { const dt = Math.max(0, t - t0); const g = o.g ?? 2600; return { x: (o.vx || 0) * dt, y: (o.vy ?? -300) * dt + 0.5 * g * dt * dt, r: (o.spin ?? 120) * dt }; };
  PK.confetti = (c, x, y, dt, o = {}) => {
    if (dt < 0) return; const dur = o.dur || 1.2; if (dt > dur) return;
    const n = o.n || 16, sp = o.spread || 320, cols = o.cols || ['#ffd54a', '#ff7aa2', '#3cc9a8', '#6b8cff', '#ff9b3d', '#ffffff'], r = prng(o.seed || 3), sz = o.size || 18;
    for (let i = 0; i < n; i++) {
      const a = (o.dir ?? -90) * D + (r() - 0.5) * (o.arc ?? 2 * Math.PI) * 1, v = sp * (0.55 + r() * 0.8) * 2.4;
      const vx = Math.cos(a) * v, vy = Math.sin(a) * v - (o.up ?? 1) * 260;
      const drag = Math.exp(-dt * 2.2), px = x + vx * (1 - drag) / 2.2, py = y + vy * (1 - drag) / 2.2 + 700 * dt * dt;
      const rot = r() * 360 + dt * (r() - 0.5) * 900, s = sz * (0.6 + r() * 0.7), col = cols[i % cols.length], kind = r();
      const fade = 1 - cl01((dt - dur * 0.65) / (dur * 0.35));
      c.save(); c.globalAlpha *= fade; c.translate(px, py); c.rotate(rot * D); c.scale(1, 0.4 + 0.6 * Math.abs(Math.cos(dt * 9 + i)));
      c.shadowColor = 'rgba(35,30,55,0.25)'; c.shadowBlur = 3; c.shadowOffsetY = 2;
      c.fillStyle = col; c.beginPath();
      if (kind < 0.45) c.rect(-s / 2, -s * 0.32, s, s * 0.64); else if (kind < 0.75) { c.moveTo(0, -s * 0.55); c.lineTo(s * 0.5, s * 0.4); c.lineTo(-s * 0.5, s * 0.4); c.closePath(); } else c.arc(0, 0, s * 0.42, 0, TWO);
      c.fill(); c.restore();
    }
  };
  PK.puff = (c, x, y, dt, o = {}) => {
    if (dt < 0) return; const dur = o.dur || 0.7; if (dt > dur) return;
    const n = o.n || 7, R = o.r || 60, r = prng(o.seed || 11), u = dt / dur, e = 1 - Math.pow(1 - u, 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TWO + r() * 0.6 + (o.rot || 0), d = R * (0.4 + 1.3 * e) * (0.8 + r() * 0.5), rr = R * (0.32 + 0.18 * r()) * (1 - u * 0.85) * Math.min(1, u * 6 + 0.3);
      paper(c, ell(x + Math.cos(a) * d, y + Math.sin(a) * d * (o.flat || 0.8) - u * R * 0.3, rr, rr), o.col || '#ffffff', { seed: i * 7 + 3, small: rr < 22, alpha: 1 - Math.max(0, u - 0.6) / 0.4 });
    }
  };
  PK.smoke = (c, x, y, dt, o = {}) => {
    if (dt < 0) return; const dur = o.dur || 2.4; if (dt > dur) return; const u = dt / dur, s = (o.s || 1) * (0.35 + 0.9 * (1 - Math.pow(1 - u, 2)));
    paper(c, cloudPoly(x + (o.drift ?? 30) * u, y - (o.rise ?? 160) * u, s), o.col || '#ece8e0', { seed: o.seed || 5, amp: 3, alpha: Math.min(1, u * 8) * (1 - cl01((u - 0.7) / 0.3)) });
  };

  // fibre texture (multiply specks) over the frame, screen space
  let FIB = null;
  function fibrePat(c) {
    if (FIB) return FIB;
    const cv = document.createElement('canvas'); cv.width = cv.height = 300; const x = cv.getContext('2d'); const r = prng(41); x.fillStyle = '#d9cbb0';
    for (let i = 0; i < 2600; i++) { x.globalAlpha = r(); const s = 1 + r() * 2; x.fillRect(r() * 300, r() * 300, s * 3, s); }
    FIB = c.createPattern(cv, 'repeat'); return FIB;
  }
  PK.fibre = (c, alpha = 0.5) => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.globalAlpha = alpha; c.fillStyle = fibrePat(c); c.fillRect(0, 0, 1080, 1920); c.restore(); };

  // ═════════════ backgrounds (screen space) ═════════════
  const BW = 1080, BH = 1920;
  const piece = (c, p, col, seed, sh = 1, o = {}) => paper(c, p, col, Object.assign({ seed, amp: 3, hf: 1.6, shadow: sh }, o));
  const hillsPts = (g) => [
    path([['M', -40, g + 60], ['C', 200, g - 100, 460, g - 80, 640, g + 20], ['L', 640, BH + 40], ['L', -40, BH + 40], ['Z']], true),
    path([['M', 400, g + 40], ['C', 640, g - 80, 900, g - 80, 1120, g], ['L', 1120, BH + 40], ['L', 400, BH + 40], ['Z']], true),
    path([['M', -40, g], ['C', 300, g - 38, 720, g + 20, 1120, g - 22], ['L', 1120, BH + 40], ['L', -40, BH + 40], ['Z']], true),
    path([['M', -40, g + 200], ['C', 300, g + 160, 700, g + 220, 1120, g + 180], ['L', 1120, BH + 40], ['L', -40, BH + 40], ['Z']], true),
  ];
  function grass(c, t, g, col, n = 12, seed = 1) {
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) / n * BW + (hs(i + seed) - 0.5) * 60, y = g + 6 - 20 * Math.sin(x / BW * Math.PI * 0.9 + 0.3) * 0.6 + (hs(i * 3 + seed) - 0.5) * 16, s = 0.7 + hs(i * 5 + seed) * 0.6;
      c.save(); c.translate(x, y); c.rotate((Math.sin(t * 2.2 + i * 1.3) * 7 + nz(t * 0.9 + i) * 4) * D); c.scale(s, s);
      const p = path([['M', -18, 4], ['L', -10, -34], ['L', -4, -6], ['L', 2, -46], ['L', 8, -6], ['L', 16, -30], ['L', 20, 4], ['Z']], true, 4);
      paper(c, p, col, { seed: 200 + i, amp: 0.8, rim: false, shadow: 0.6, small: true }); c.restore();
    }
  }
  PK.bg = {};
  PK.bg.day = (c, t, o = {}) => {
    const g = o.ground ?? 1500, hl = o.hills || pal.hills;
    c.fillStyle = o.sky || pal.sky; c.fillRect(0, 0, BW, BH);
    if (o.circle !== false) piece(c, ell(540, g - 740, 560, 560), o.pale || pal.skyPale, 3, 0.6);
    if (o.sun !== false) { c.save(); c.translate(o.sunX ?? 950, o.sunY ?? 560); c.rotate(t * 0.35); const k = 1 + 0.03 * Math.sin(t * 2); c.scale(k, k);
      for (let i = 0; i < 10; i++) { c.save(); c.rotate(i * 36 * D); paper(c, [[-12, -100], [12, -100], [0, -132]], o.sunCol || pal.sun, { seed: 300 + i, rim: false, shadow: 0.5, amp: 0.5 }); c.restore(); }
      piece(c, ell(0, 0, 78, 78), o.sunCol || pal.sun, 4); c.restore(); }
    if (o.clouds !== false) { const cs = o.cloudList || [[160, 470, 1.15, 14], [950, 820, 0.85, 10], [700, 400, 0.5, 18], [420, 700, 0.6, 8]];
      cs.forEach(([x0, y, s, sp], i) => { const x = ((x0 + t * sp + 300) % (BW + 600) + BW + 600) % (BW + 600) - 300; piece(c, cloudPoly(x, y + Math.sin(t * 0.8 + i) * 6, s), '#ffffff', 10 + i, 1, { alpha: o.cloudA ?? 1 }); }); }
    const hp = hillsPts(g);
    piece(c, hp[0], hl[0], 21); piece(c, hp[1], hl[1], 22); grass(c, t, g - 2, shadeHex(hl[2], -0.12), 9, 3); piece(c, hp[2], hl[2], 23); piece(c, hp[3], hl[3], 24);
    if (o.grass !== false) grass(c, t, g + 190, shadeHex(hl[3], -0.1), 10, 7);
  };
  PK.bg.night = (c, t, o = {}) => {
    const g = o.ground ?? 1500;
    c.fillStyle = o.sky || '#22305e'; c.fillRect(0, 0, BW, BH);
    piece(c, ell(540, g - 740, 560, 560), '#2b3b72', 3, 0.5);
    for (let i = 0; i < 26; i++) { const x = hs(i * 1.7) * BW, y = 120 + hs(i * 2.9) * (g - 260), tw = 0.6 + 0.4 * Math.sin(t * (2 + hs(i) * 3) + i * 2), r = (7 + hs(i * 4.1) * 10) * tw;
      paper(c, starG(x, y, r, r * 0.45, 5, -90 + t * 20 * (hs(i) - 0.5)), '#fff3b0', { seed: 400 + i, small: true, shadow: 0.4 }); }
    c.save(); c.translate(o.moonX ?? 860, o.moonY ?? 560); c.rotate(Math.sin(t * 0.5) * 4 * D);
    piece(c, ell(0, 0, 90, 90), '#fff1b8', 5); paper(c, ell(26, -16, 16, 16), '#efdf9c', { seed: 6, rim: false, shadow: 0 }); paper(c, ell(-30, 22, 11, 11), '#efdf9c', { seed: 7, rim: false, shadow: 0 }); c.restore();
    [[200, 520, 0.9, 10], [760, 860, 0.7, 7]].forEach(([x0, y, s, sp], i) => { const x = ((x0 + t * sp + 300) % (BW + 600) + BW + 600) % (BW + 600) - 300; piece(c, cloudPoly(x, y, s), '#3b4c86', 30 + i, 0.8); });
    const hp = hillsPts(g); const hl = o.hills || ['#2d5a5f', '#264f55', '#35686a', '#2c5c5e'];
    piece(c, hp[0], hl[0], 21); piece(c, hp[1], hl[1], 22); piece(c, hp[2], hl[2], 23); piece(c, hp[3], hl[3], 24);
    grass(c, t, g - 2, '#24484c', 9, 5);
  };
  PK.bg.battle = (c, t, o = {}) => {
    const g = o.ground ?? 1500;
    c.fillStyle = o.sky || '#bcd9e0'; c.fillRect(0, 0, BW, BH);
    piece(c, ell(540, g - 740, 560, 560), '#cfe5e6', 3, 0.5);
    c.save(); c.translate(900, 520); c.rotate(t * 0.25); piece(c, ell(0, 0, 70, 70), '#ffe08a', 4); c.restore();
    [[220, 520, 0.9, 9], [760, 760, 0.65, 13]].forEach(([x0, y, s, sp], i) => { const x = ((x0 + t * sp + 300) % (BW + 600) + BW + 600) % (BW + 600) - 300; piece(c, cloudPoly(x, y, s), '#f4f1ea', 40 + i); });
    // distant ridge
    piece(c, path([['M', -40, g - 120], ['C', 160, g - 230, 360, g - 200, 520, g - 150], ['C', 680, g - 240, 900, g - 230, 1120, g - 160], ['L', 1120, g + 200], ['L', -40, g + 200], ['Z']], true), '#9fb57c', 25);
    // smoke puffs looping on the horizon (each a cycle of rising clouds)
    for (const [sx, per, ph, sc] of (o.smoke || [[180, 3.2, 0, 0.9], [560, 3.8, 1.3, 0.7], [960, 3.4, 2.1, 1.0]])) {
      for (let k = 0; k < 2; k++) { const dt = ((t + ph + k * per / 2) % per + per) % per; PK.smoke(c, sx, g - 170, dt, { s: sc, dur: per, rise: 260, drift: 40, seed: Math.round(sx) + k, col: '#e9e4da' }); }
    }
    const hp = hillsPts(g);
    piece(c, hp[0], '#8eac62', 21); piece(c, hp[1], '#7f9f58', 22);
    // little tent (khaki), flag waving
    const tx = o.tentX ?? 860, ty = g - 30;
    piece(c, [[tx - 150, ty], [tx, ty - 190], [tx + 150, ty]], '#c9b27a', 50); paper(c, [[tx - 40, ty], [tx, ty - 120], [tx + 40, ty]], '#7d6a45', { seed: 51, shadow: 0.5 });
    PK.line(c, [[tx, ty - 190], [tx, ty - 240]], 6, '#7b5a3a');
    const fx = o.flagX ?? 150, fy = g - 300;
    PK.limb(c, [[fx, g + 10], [fx, fy]], 12, '#8a6440', { seed: 52 });
    const fl = []; for (let i = 0; i <= 12; i++) { const u = i / 12; fl.push([fx + u * 130, fy + 6 + Math.sin(t * 6 - u * 4) * 12 * u]); } for (let i = 12; i >= 0; i--) { const u = i / 12; fl.push([fx + u * 130, fy + 76 + Math.sin(t * 6 - u * 4) * 12 * u - u * 10]); } fl.closed = true;
    paper(c, fl, o.flagCol || '#ffb02e', { seed: 53 });
    piece(c, hp[2], '#a2bf6c', 23);
    // sandbags
    for (let i = 0; i < 5; i++) paper(c, ell(60 + i * 70, g + 70 - (i % 2) * 6, 44, 24), '#d6c28f', { seed: 60 + i });
    for (let i = 0; i < 4; i++) paper(c, ell(95 + i * 70, g + 32, 44, 24), '#cdb882', { seed: 70 + i });
    piece(c, hp[3], '#93b363', 24);
    grass(c, t, g + 190, '#7c9c50', 10, 9);
  };
  PK.bg.tent = (c, t, o = {}) => {
    const g = o.floor ?? 1520;
    c.fillStyle = '#e3cf9c'; c.fillRect(0, 0, BW, BH);
    for (let i = 0; i < 6; i++) piece(c, rrect(-20 + i * 190, 120, 200, g, 4), i % 2 ? '#e8d6a8' : '#dcc58e', 80 + i, 0.4);
    // roof flaps
    piece(c, [[-60, 60], [540, 380], [1140, 60], [1140, -40], [-60, -40]], '#cbb173', 90, 1.2);
    for (let i = 0; i < 9; i++) { const x = i * 135; paper(c, [[x - 70, -10], [x + 70, -10], [x, 70 + 10 * Math.sin(t * 1.5 + i)]], '#bfa463', { seed: 91 + i, shadow: 0.6 }); }
    // window flap with sky
    piece(c, rrect(720, 560, 250, 300, 30), '#9fd8ec', 100, 0.5); PK.cloud(c, 800 + ((t * 12) % 200), 650, 0.4);
    paper(c, [[720, 560], [970, 560], [970, 640], [845, 700], [720, 640]], '#cdb57c', { seed: 101 });
    // pole
    PK.limb(c, [[540, 380], [540, g + 40]], 34, '#8a6a45', { seed: 102 });
    // banner with a mint plus (hospital)
    c.save(); c.translate(250, 640); c.rotate(PK.wob(t, 3, 2) * D);
    PK.line(c, [[-90, -120], [-80, -60]], 4, '#6b4f33'); PK.line(c, [[90, -120], [80, -60]], 4, '#6b4f33');
    paper(c, rrect(-110, -70, 220, 160, 18), '#fffaf0', { seed: 103 });
    paper(c, rrect(-22, -50, 44, 120, 8), pal.mint, { seed: 104 }); paper(c, rrect(-60, -12, 120, 44, 8), pal.mint, { seed: 105 }); c.restore();
    // swinging lamp
    const la = Math.sin(t * 1.8) * 9;
    c.save(); c.translate(540, 380); c.rotate(la * D); PK.line(c, [[0, 0], [0, 150]], 4, '#5c4630');
    paper(c, [[-50, 190], [-26, 140], [26, 140], [50, 190]], '#3f5a3a', { seed: 106 }); paper(c, ell(0, 196, 26, 16), '#fff3b0', { seed: 107 }); c.restore();
    // floor planks
    piece(c, rrect(-40, g, BW + 80, BH - g + 40, 4), '#c79a66', 110);
    for (let i = 0; i < 4; i++) PK.line(c, [[-20, g + 70 + i * 90], [BW + 20, g + 62 + i * 90]], 4, '#a87d50', { shadow: 0 });
  };
  PK.bg.wall = (c, t, col = '#ffe3b3', o = {}) => {
    c.fillStyle = col; c.fillRect(0, 0, BW, BH);
    const pats = o.patches ?? [[220, 600, 300, 0.06], [860, 980, 340, -0.05], [380, 1350, 260, 0.04], [900, 380, 220, 0.05]];
    pats.forEach(([x, y, r, k], i) => piece(c, blobG(x + Math.sin(t * 0.5 + i) * 10, y + Math.cos(t * 0.4 + i) * 8, r, r * 0.8, 5 + i, 0.08), shadeHex(col, k), 120 + i, 0.5));
    if (o.floor !== false) { const g = o.ground ?? 1560; piece(c, path([['M', -40, g], ['C', 300, g - 26, 760, g + 24, 1120, g - 10], ['L', 1120, BH + 40], ['L', -40, BH + 40], ['Z']], true), o.floor || shadeHex(col, -0.18), 130); }
  };

  function shadeHex(h, a) { if (!h || h[0] !== '#') return h; const n = parseInt(h.slice(1), 16); const rgb = [n >> 16 & 255, n >> 8 & 255, n & 255]; const t = a > 0 ? 255 : 0, k = Math.abs(a); return '#' + rgb.map(v => Math.round(v + (t - v) * k).toString(16).padStart(2, '0')).join(''); }
  function mixHex(a, b, t) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const ca = [A >> 16 & 255, A >> 8 & 255, A & 255], cb = [B >> 16 & 255, B >> 8 & 255, B & 255]; return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
  PK.shade = shadeHex; PK.mix = mixHex;
  const tickCol = v => { const [a, b, c] = pal.ticks; return v < 0.5 ? mixHex(a, b, v * 2) : mixHex(b, c, (v - 0.5) * 2); };
  PK.tickCol = tickCol;

  // ═════════════ characters ═════════════
  const autoBlink = (t, seed = 0) => { if (t == null) return 0; let b = 0; for (let k = Math.floor(t / 3.3) - 1; k <= Math.floor(t / 3.3) + 1; k++) { const bt = k * 3.3 + hs(k + seed * 13) * 1.8, d = Math.abs(t - bt); if (d < 0.09) b = Math.max(b, 1 - d / 0.09); } return b; };
  // world anchor from local coords
  const anchor = (x, y, s, rot, flip, lx, ly) => { const c = Math.cos(rot * D), si = Math.sin(rot * D); lx *= s * flip; ly *= s; return [x + lx * c - ly * si, y + lx * si + ly * c]; };
  const toLocal = (x, y, s, rot, flip, wx, wy) => { const dx = wx - x, dy = wy - y, c = Math.cos(-rot * D), si = Math.sin(-rot * D); return [(dx * c - dy * si) / s * flip, (dx * si + dy * c) / s]; };

  function eye(c, cx, cy, rx, ry, lx, ly, blink, o = {}) {
    if (blink > 0.82) { PK.line(c, path([['M', cx - rx * 0.85, cy + 2], ['Q', cx, cy + ry * 0.45, cx + rx * 0.85, cy + 2]]), Math.max(4, rx * 0.2), o.ink || pal.pupil, { seed: 3 }); return; }
    const k = 1 - blink * 0.9;
    c.save(); c.translate(cx, cy); c.scale(1, k);
    if (!o.dot) paper(c, ell(0, 0, rx, ry, 40), o.white || pal.eyeW, { seed: 11, amp: 0.8, rim: false, shadow: 0.7, small: true });
    const pr = o.dot ? 0.7 : 0.58;
    paper(c, ell(lx * rx * 0.3, ly * ry * 0.28, rx * pr, ry * (o.dot ? 0.75 : 0.56), 32), o.pupil || pal.pupil, { seed: 12, small: true, shadow: 0.3, rim: false, amp: 0.4 });
    c.beginPath(); c.arc(lx * rx * 0.3 + rx * 0.2, ly * ry * 0.28 - ry * 0.2, rx * 0.2, 0, TWO); c.fillStyle = pal.eyeW; c.fill();
    c.restore();
  }
  function mouthShape(c, kind, cx, cy, w, o = {}) {
    const mc = o.col || pal.mouth;
    if (kind === 'o') { paper(c, ell(cx, cy + w * 0.2, w * 0.36, w * 0.46, 32), mc, { seed: 21, small: true, rim: false }); paper(c, ell(cx, cy + w * 0.42, w * 0.2, w * 0.14, 20), pal.tongue, { seed: 22, small: true, shadow: 0, rim: false }); return; }
    if (kind === 'flat') { PK.line(c, [[cx - w * 0.45, cy + w * 0.2], [cx + w * 0.45, cy + w * 0.18]], Math.max(5, w * 0.12), mc, { seed: 23 }); return; }
    if (kind === 'frown') { PK.line(c, path([['M', cx - w * 0.5, cy + w * 0.4], ['Q', cx, cy - w * 0.15, cx + w * 0.5, cy + w * 0.4]]), Math.max(5, w * 0.13), mc, { seed: 24 }); return; }
    if (kind === 'grimace') {
      paper(c, rrect(cx - w * 0.62, cy - w * 0.04, w * 1.24, w * 0.56, w * 0.2), mc, { seed: 25, small: true, rim: false });
      paper(c, rrect(cx - w * 0.5, cy + w * 0.05, w * 1.0, w * 0.38, w * 0.12), pal.eyeW, { seed: 26, small: true, shadow: 0, rim: false });
      PK.line(c, [[cx - w * 0.5, cy + w * 0.24], [cx + w * 0.5, cy + w * 0.24]], 3, mc, { shadow: 0 });
      for (const k of [-0.25, 0, 0.25]) PK.line(c, [[cx + w * k, cy + w * 0.06], [cx + w * k, cy + w * 0.42]], 2.5, mc, { shadow: 0 });
      return;
    }
    if (kind === 'open') {
      const p = path([['M', cx - w * 0.5, cy], ['Q', cx, cy - w * 0.06, cx + w * 0.5, cy], ['Q', cx + w * 0.45, cy + w * 0.8, cx, cy + w * 0.8], ['Q', cx - w * 0.45, cy + w * 0.8, cx - w * 0.5, cy], ['Z']], true, 4);
      paper(c, p, mc, { seed: 27, small: true, rim: false }); paper(c, ell(cx, cy + w * 0.58, w * 0.26, w * 0.14, 20), pal.tongue, { seed: 28, small: true, shadow: 0, rim: false }); return;
    }
    const sm = kind === 'small' ? 0.55 : 1;
    const p = path([['M', cx - w * 0.5 * sm, cy], ['Q', cx, cy + w * 1.25 * sm, cx + w * 0.5 * sm, cy], ['Q', cx, cy + w * 0.34 * sm, cx - w * 0.5 * sm, cy], ['Z']], true, 4);
    paper(c, p, mc, { seed: 29, small: true, rim: false, shadow: 0.6 });
  }
  function brows(c, xs, y, w, o) { // xs: [left eye x, right eye x]
    const up = (o.brow || 0) * 16, ang = o.angry || 0, wor = o.worried || 0, lw = o.lw || 8;
    xs.forEach((x, i) => {
      const sgn = i === 0 ? 1 : -1;  // inner end is toward the centre
      const inner = [x + sgn * w * 0.5, y - up + ang * 14 - wor * 12], outer = [x - sgn * w * 0.5, y - up - ang * 6 + wor * 6];
      const mid = [x, y - up - 12 + ang * 2];
      PK.line(c, path([['M', outer[0], outer[1]], ['Q', mid[0], mid[1], inner[0], inner[1]]]), lw, o.ink || pal.ink, { seed: 31 + i });
    });
  }
  function glove(c, x, y, r, ang, kind = 'open', col = pal.glove) {
    c.save(); c.translate(x, y); c.rotate(ang);
    paper(c, rrect(-r * 1.15, -r * 0.42, r * 0.5, r * 0.84, r * 0.2), col, { seed: 41, small: true });   // cuff
    if (kind === 'fist') { paper(c, ell(0, 0, r * 0.95, r * 0.85, 32), col, { seed: 42, amp: 1 }); for (const k of [-0.4, 0, 0.4]) PK.line(c, [[r * 0.35, r * k * 0.8], [r * 0.8, r * k * 0.8]], 2.5, '#d9d0c0', { shadow: 0 }); }
    else if (kind === 'point') { paper(c, ell(0, 0, r * 0.85, r * 0.8, 32), col, { seed: 43, amp: 1 }); paper(c, rrect(r * 0.4, -r * 0.62, r * 1.15, r * 0.4, r * 0.2), col, { seed: 44, small: true }); }
    else { paper(c, ell(0, 0, r, r * 0.94, 32), col, { seed: 45, amp: 1 }); for (const k of [-0.5, 0, 0.5]) PK.line(c, [[r * 0.45, r * k * 0.75], [r * 0.9, r * k * 0.8]], 2.5, '#d9d0c0', { shadow: 0 }); }
    paper(c, ell(-r * 0.15, -r * 0.92, r * 0.34, r * 0.48, 24), col, { seed: 46, small: true });       // thumb
    c.restore();
  }

  // ── kid / soldier (shared body) ──
  function body(c, x, y, s, st, kind) {
    st = st || {}; const t = st.t ?? 0, flip = st.flip || 1, rot = st.rot || 0;
    const soldier = kind === 'soldier';
    const run = st.run != null ? st.run : null;
    const bob = run != null ? -Math.abs(Math.sin(run)) * 16 : Math.sin(t * 2.6 + (st.seed || 0)) * 2.5;
    let armL = st.armL ?? 28, armR = st.armR ?? 18, elL = st.elbowL ?? 10, elR = st.elbowR ?? -6;
    let legL = st.legL ?? 0, legR = st.legR ?? 0;
    if (run != null) { legL = 34 * Math.sin(run); legR = -34 * Math.sin(run); armL = 30 - 40 * Math.sin(run); armR = 30 + 40 * Math.sin(run); elL = 60; elR = 60; }
    const hold = st.holdKnee;
    const blink = st.blink ?? autoBlink(st.t, st.seed || 0);
    const look = st.look || [0, 0];
    const C = soldier ? { shirt: pal.army, sleeve: pal.army, arm: pal.army, leg: pal.khaki, shorts: pal.khaki, shoe: pal.boot } : { shirt: pal.shirt, sleeve: pal.shirt, arm: pal.skin, leg: pal.skin, shorts: pal.shorts, shoe: pal.shoe };
    const anchors = {};
    c.save(); c.translate(x, y); c.rotate(rot * D); c.scale(s * flip, s); if (st.alpha != null) c.globalAlpha *= cl01(st.alpha);
    const sq = st.sy ?? (1 + (st.squash ? -st.squash : 0)), sxx = st.sx ?? (1 + (st.squash ? st.squash * 0.6 : 0));
    c.scale(sxx, sq); c.translate(0, bob);
    // legs
    const legs = [[-30, legL, -1, 'L'], [32, legR, 1, 'R']];
    for (const [hx, a, sd, side] of legs) {
      const hy = -130, L = 110, fx = hx + Math.sin(a * D) * L, fy = hy + Math.cos(a * D) * L;
      paper(c, limbPoly([[hx, hy], [fx, fy]], 46), C.leg, { seed: 501 + sd });
      const kx = hx + Math.sin(a * D) * 62, ky = hy + Math.cos(a * D) * 62; anchors['knee' + side] = [kx, ky];
      if (st.knee === side || st.knee === true) { c.save(); c.translate(kx, ky); c.rotate(-a * D); c.scale(cl01(st.wrap ?? 1), 1); paper(c, rrect(-30, -14, 60, 28, 6), pal.bandage, { seed: 505 + sd }); PK.line(c, [[-14, -12], [-14, 12]], 2.5, '#d8cdb8', { shadow: 0 }); PK.line(c, [[14, -12], [14, 12]], 2.5, '#d8cdb8', { shadow: 0 }); c.restore(); }
      if (st.scrape === side) { for (const k of [-1, 0, 1]) PK.line(c, [[kx - 14 + k * 3, ky - 8 + k * 9], [kx + 14 + k * 3, ky - 14 + k * 9]], 5, '#ff6b86', { seed: 507 + k }); }
      c.save(); c.translate(fx + sd * 12, fy + 16); c.rotate(-a * 0.6 * D); paper(c, ell(0, 0, 48, 25, 40), C.shoe, { seed: 510 + sd }); c.restore();
    }
    // shorts / trousers
    paper(c, soldier ? rrect(-80, -186, 160, 96, 22) : rrect(-76, -184, 152, 94, 24), C.shorts, { seed: 520 });
    // arms (behind shirt? no — drawn after the shirt so poses read)
    const shirtP = path([['M', -73, -332], ['C', -63, -348, 63, -348, 73, -332], ['L', 95, -162], ['C', 95, -142, -93, -142, -93, -162], ['Z']], true);
    paper(c, shirtP, C.shirt, { seed: 530, tone: true });
    if (soldier) {
      paper(c, [[-46, -340], [0, -300], [-10, -340]], pal.armyDk, { seed: 531, small: false }); paper(c, [[46, -340], [0, -300], [10, -340]], pal.armyDk, { seed: 532 });
      paper(c, rrect(-70, -282, 48, 40, 8), pal.armyLt, { seed: 533 }); paper(c, rrect(22, -282, 48, 40, 8), pal.armyLt, { seed: 534 });
      for (const yy of [-280, -235, -190]) paper(c, ell(0, yy, 7, 7), '#e9c46a', { seed: 535, small: true });
      paper(c, rrect(-92, -178, 184, 22, 6), pal.armyDk, { seed: 536 });
    } else { paper(c, starG(0, -245, 34, 15, 5), pal.star, { seed: 537 }); }
    // arm builder
    const armPts = (side, a, e) => {
      const sd = side === 'L' ? -1 : 1, sh = [sd * 72, -314];
      const d1 = [sd * Math.sin(a * D), Math.cos(a * D)], d2 = [sd * Math.sin((a + e) * D), Math.cos((a + e) * D)];
      const el = [sh[0] + d1[0] * 88, sh[1] + d1[1] * 88], hd = [el[0] + d2[0] * 80, el[1] + d2[1] * 80];
      return { sh, el, hd, d1, d2 };
    };
    const arms = hold ? [['L', -12, -18], ['R', -14, -16]] : [['L', armL, elL], ['R', armR, elR]];
    const deferred = [];
    const drawArm = ([side, a, e]) => {
      const A = armPts(side, a, e); let hd = A.hd;
      if (hold) { const kn = anchors['knee' + (st.holdKnee === 'R' ? 'R' : 'L')]; hd = [kn[0] + (side === 'L' ? -26 : 26), kn[1] - 18]; }
      const mid = hold ? [(A.sh[0] + hd[0]) / 2 + (side === 'L' ? -30 : 30), (A.sh[1] + hd[1]) / 2] : A.el;
      paper(c, limbPoly(path([['M', A.sh[0], A.sh[1]], ['Q', mid[0], mid[1], hd[0], hd[1]]]), 38), C.arm, { seed: 540 + (side === 'L' ? 0 : 1) });
      if ((st.arm === side || st.arm === true) && !soldier || (soldier && (st.arm === side || st.arm === true))) {
        const w = cl01(st.wrap ?? 1); const p0 = [lp(mid[0], hd[0], 0.15), lp(mid[1], hd[1], 0.15)], p1 = [lp(mid[0], hd[0], 0.15 + 0.7 * w), lp(mid[1], hd[1], 0.15 + 0.7 * w)];
        if (w > 0.02) { paper(c, limbPoly([p0, p1], 50), pal.bandage, { seed: 548 }); const n = 3; for (let i = 0; i < n; i++) { const u = (i + 0.5) / n * w; const px = lp(p0[0], hd[0], u * 0.82), py = lp(p0[1], hd[1], u * 0.82); PK.line(c, [[px - 12, py - 16], [px + 14, py + 14]], 3.5, '#d8cdb8', { shadow: 0 }); } }
        anchors['band' + side] = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      }
      const sl = [A.sh[0] + A.d1[0] * 40, A.sh[1] + A.d1[1] * 40];
      paper(c, limbPoly([A.sh, hold ? [A.sh[0] + (hd[0] - A.sh[0]) * 0.25, A.sh[1] + (hd[1] - A.sh[1]) * 0.25] : sl], 54), C.sleeve, { seed: 550 + (side === 'L' ? 0 : 1) });
      paper(c, ell(hd[0], hd[1], 29, 29, 36), pal.skin, { seed: 556 });
      anchors['hand' + side] = hd; anchors['elbow' + side] = mid;
    };
    for (const A of arms) { const P0 = armPts(A[0], A[1], A[2]); if (!hold && P0.hd[1] < -380) deferred.push(A); else drawArm(A); }
    // head group
    c.save(); c.translate(0, -340); c.rotate((st.headRot || 0) * D + (st.t != null ? Math.sin(t * 1.7 + (st.seed || 0)) * 1.5 * D : 0)); c.translate(0, 340);
    paper(c, ell(-149, -470, 26, 33), pal.skin, { seed: 560 }); paper(c, ell(149, -470, 26, 33), pal.skin, { seed: 561 });
    paper(c, ell(0, -477, 150, 137, 80), pal.skin, { seed: 562, tone: true });
    const hairC = pal.hair;
    paper(c, path([['M', -135, -575], ['C', -149, -540, -145, -505, -129, -490], ['C', -123, -515, -113, -535, -97, -550], ['C', -105, -525, -103, -512, -95, -505], ['C', -85, -535, -75, -555, -57, -575], ['Z']], true), hairC, { seed: 563 });
    paper(c, path([['M', 135, -575], ['C', 149, -540, 145, -505, 129, -490], ['C', 123, -515, 113, -535, 97, -550], ['C', 105, -525, 103, -512, 95, -505], ['C', 85, -535, 75, -555, 57, -575], ['Z']], true), hairC, { seed: 564 });
    eye(c, -50, -468, 34, 42, look[0], look[1], blink); eye(c, 50, -468, 34, 42, look[0], look[1], blink);
    brows(c, [-50, 50], -528, 60, { brow: st.brow, angry: st.angry, worried: st.worried });
    paper(c, ell(-92, -414, 25, 14), pal.blush, { seed: 565, rim: false, shadow: 0, small: true });
    paper(c, ell(92, -414, 25, 14), pal.blush, { seed: 566, rim: false, shadow: 0, small: true });
    mouthShape(c, st.mouth || 'smile', 0, -408, 70);
    if (st.tears) { for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) { const u = ((t * 1.4 + k * 0.5 + (sd > 0 ? 0.25 : 0)) % 1); c.save(); c.globalAlpha *= cl01(st.tears) * (1 - u); paper(c, path([['M', 0, -14], ['C', 9, -2, 10, 8, 0, 12], ['C', -10, 8, -9, -2, 0, -14], ['Z']], true, 3).map(([a, b]) => [sd * 74 + sd * u * 30 + a, -440 + u * 120 + b]), '#7fd0f5', { seed: 567, small: true }); c.restore(); } }
    if (st.sweat) { const u = (t * 0.9) % 1; c.save(); c.globalAlpha *= cl01(st.sweat) * (1 - u * 0.7); paper(c, path([['M', 0, -16], ['C', 10, -2, 11, 9, 0, 13], ['C', -11, 9, -10, -2, 0, -16], ['Z']], true, 3).map(([a, b]) => [128 + a, -545 + u * 60 + b]), '#a8e3ff', { seed: 568, small: true }); c.restore(); }
    // hat / helmet
    if (soldier || st.helmet) {
      paper(c, path([['M', -158, -560], ['C', -160, -730, 160, -730, 158, -560], ['Z']], true), pal.army, { seed: 570, tone: true });
      paper(c, rrect(-176, -580, 352, 40, 20), pal.armyDk, { seed: 571 });
      PK.line(c, path([['M', -110, -640], ['Q', -40, -690, 40, -680]]), 9, pal.armyLt, { seed: 572 });
      for (const [hx, hy] of [[-60, -625], [50, -640], [100, -600], [-115, -595]]) paper(c, ell(hx, hy, 8, 8), pal.armyLt, { seed: 573, small: true, rim: false });
      anchors.top = [0, -720];
    } else if (st.hat !== false) {
      paper(c, ell(0, -590, 204, 36), pal.hat, { seed: 575 });
      paper(c, path([['M', -123, -590], ['C', -123, -710, 123, -710, 123, -590], ['Z']], true), pal.hat, { seed: 576, tone: true });
      paper(c, path([['M', -119, -622], ['C', -45, -630, 45, -630, 119, -622], ['L', 122, -596], ['C', 45, -602, -45, -602, -122, -596], ['Z']], true), pal.hatBand, { seed: 577 });
      anchors.top = [0, -700];
    } else anchors.top = [0, -620];
    c.restore();
    deferred.forEach(drawArm);
    c.restore();
    // convert anchors to caller coords (approx: ignores squash and head rotation)
    const out = {};
    for (const k in anchors) out[k] = anchor(x, y, s, rot, flip, anchors[k][0] * sxx, (anchors[k][1] + bob) * sq);
    out.head = anchor(x, y, s, rot, flip, 0, (-477 + bob) * sq);
    return out;
  }
  PK.kid = (c, x, y, s, st = {}) => body(c, x, y, s, st, 'kid');
  PK.soldier = (c, x, y, s, st = {}) => body(c, x, y, s, st, 'soldier');

  // ── doctor (1940s) ──
  PK.doctor = (c, x, y, s, st = {}) => {
    const t = st.t ?? 0, flip = st.flip || 1, rot = st.rot || 0, blink = st.blink ?? autoBlink(st.t, 5), look = st.look || [0, 0];
    const bob = Math.sin(t * 2.4) * 2.5; const anchors = {};
    let armL = st.armL ?? 20, armR = st.armR ?? 30, elL = st.elbowL ?? -10, elR = st.elbowR ?? 70;
    c.save(); c.translate(x, y); c.rotate(rot * D); c.scale(s * flip, s); if (st.alpha != null) c.globalAlpha *= cl01(st.alpha); c.translate(0, bob);
    for (const [hx, sd] of [[-30, -1], [32, 1]]) { paper(c, limbPoly([[hx, -150], [hx + sd * 2, -20]], 44), pal.trousers, { seed: 601 + sd }); paper(c, ell(hx + sd * 12, -2, 48, 24), '#2a2433', { seed: 603 + sd }); }
    // coat
    const coat = path([['M', -78, -336], ['C', -66, -352, 66, -352, 78, -336], ['L', 112, -110], ['C', 60, -96, -60, -96, -112, -110], ['Z']], true);
    paper(c, coat, pal.coat, { seed: 610, tone: true });
    paper(c, [[-40, -344], [40, -344], [0, -250]], '#bfe0f5', { seed: 611 });  // shirt
    paper(c, [[-9, -330], [9, -330], [12, -262], [0, -245], [-12, -262]], pal.tie, { seed: 612, small: false });
    paper(c, [[-62, -340], [-8, -332], [-30, -220], [-70, -280]], pal.coatDk, { seed: 613 }); paper(c, [[62, -340], [8, -332], [30, -220], [70, -280]], pal.coatDk, { seed: 614 });
    paper(c, rrect(30, -230, 52, 50, 8), pal.coatDk, { seed: 615 });
    PK.line(c, [[42, -232], [42, -262]], 6, '#3f5fb0', { seed: 616 }); PK.line(c, [[56, -232], [58, -258]], 6, '#ef5b7b', { seed: 617 });
    PK.line(c, [[0, -230], [0, -120]], 3, '#cfd5de', { shadow: 0 }); for (const yy of [-210, -170, -130]) paper(c, ell(-12, yy, 6, 6), '#cfd5de', { seed: 618, small: true });
    // stethoscope
    PK.line(c, path([['M', -52, -335], ['Q', -70, -250, -30, -215], ['Q', 0, -200, 10, -230]]), 6, '#55536a', { seed: 619 });
    paper(c, ell(14, -236, 13, 13), '#c9ced8', { seed: 620, small: true });
    // arms
    const armPts = (side, a, e) => { const sd = side === 'L' ? -1 : 1, sh = [sd * 76, -318]; const d1 = [sd * Math.sin(a * D), Math.cos(a * D)], d2 = [sd * Math.sin((a + e) * D), Math.cos((a + e) * D)]; const el = [sh[0] + d1[0] * 76, sh[1] + d1[1] * 76], hd = [el[0] + d2[0] * 66, el[1] + d2[1] * 66]; return { sh, el, hd }; };
    const clipSide = st.clipSide || 'R';
    for (const [side, a, e] of [['L', armL, elL], ['R', armR, elR]]) {
      const A = armPts(side, a, e);
      paper(c, limbPoly(path([['M', A.sh[0], A.sh[1]], ['Q', A.el[0], A.el[1], A.hd[0], A.hd[1]]]), 42), pal.coat, { seed: 630 + (side === 'L' ? 0 : 1) });
      anchors['hand' + side] = A.hd;
      if (st.clip !== false && side === clipSide) {
        const cr = (st.clipRaise || 0);
        c.save(); c.translate(A.hd[0] - (side === 'R' ? 20 : -20), A.hd[1] - 70 - cr * 30); c.rotate(((side === 'R' ? -8 : 8) + cr * -6) * D);
        paper(c, rrect(-62, -84, 124, 168, 12), pal.clip, { seed: 640 }); paper(c, rrect(-50, -66, 100, 140, 6), pal.paperW, { seed: 641 });
        paper(c, rrect(-26, -94, 52, 26, 8), '#b8bcc8', { seed: 642 });
        for (let i = 0; i < 3; i++) { PK.line(c, [[-10, -40 + i * 38], [38, -40 + i * 38]], 4, '#c8bfae', { shadow: 0 }); const p = cl01((st.ticks ?? 0) - i); if (p > 0) { PK.line(c, [[-38, -42 + i * 38], [-30, -32 + i * 38], [-30 + 18 * p, -52 + i * 38 + (1 - p) * 10]].slice(0, p > 0.4 ? 3 : 2), 6, pal.ok, { seed: 643 + i }); } else paper(c, rrect(-40, -50 + i * 38, 16, 16, 3), '#e5ddcc', { seed: 646, small: true, rim: false, shadow: 0 }); }
        c.restore(); anchors.clip = [A.hd[0], A.hd[1] - 70];
      }
      paper(c, ell(A.hd[0], A.hd[1], 26, 26, 32), pal.skin, { seed: 650 });
    }
    // head
    c.save(); c.translate(0, -345); c.rotate((st.headRot || 0) * D + Math.sin(t * 1.5) * 1.2 * D); c.translate(0, 345);
    paper(c, ell(-142, -478, 24, 31), pal.skin, { seed: 660 }); paper(c, ell(142, -478, 24, 31), pal.skin, { seed: 661 });
    paper(c, ell(0, -480, 142, 136, 80), pal.skin, { seed: 662, tone: true });
    // hair: neat side part, grey-brown
    paper(c, path([['M', -146, -470], ['C', -160, -600, -60, -650, 20, -628], ['C', 100, -640, 160, -580, 146, -470], ['C', 128, -540, 90, -566, 40, -566], ['C', -20, -575, -70, -560, -100, -540], ['C', -120, -520, -132, -500, -146, -470], ['Z']], true), pal.docHair, { seed: 663 });
    PK.line(c, path([['M', -30, -610], ['Q', 10, -580, 70, -590]]), 4, '#6c5d50', { shadow: 0 });
    // head mirror (1940s)
    PK.line(c, path([['M', -138, -545], ['Q', 0, -600, 138, -545]]), 9, '#55536a', { seed: 664 });
    paper(c, ell(-40, -585, 34, 34), '#d7dde6', { seed: 665 }); paper(c, ell(-40, -585, 12, 12), '#55536a', { seed: 666, small: true });
    eye(c, -50, -478, 26, 31, look[0], look[1], blink); eye(c, 50, -478, 26, 31, look[0], look[1], blink);
    for (const ex of [-50, 50]) { c.save(); c.shadowColor = 'rgba(35,30,55,0.3)'; c.shadowBlur = 4; c.shadowOffsetY = 2; c.beginPath(); c.arc(ex, -478, 40, 0, TWO); c.lineWidth = 7; c.strokeStyle = '#3a3340'; c.stroke(); c.restore(); }
    PK.line(c, path([['M', -12, -486], ['Q', 0, -496, 12, -486]]), 6, '#3a3340', { shadow: 0 });
    brows(c, [-50, 50], -537 - (st.brow || 0) * 14, 58, { brow: (st.brow || 0) * 0.6, angry: st.angry, worried: st.worried, ink: '#5a4a3e', lw: 9 });
    paper(c, ell(-88, -425, 20, 11), pal.blush, { seed: 667, rim: false, shadow: 0, small: true }); paper(c, ell(88, -425, 20, 11), pal.blush, { seed: 668, rim: false, shadow: 0, small: true });
    paper(c, ell(0, -440, 16, 13), pal.skinDk, { seed: 669, small: true });
    mouthShape(c, st.mouth || 'smile', 0, -398, 52);
    // moustache
    const mw = 1 + 0.06 * Math.sin(t * 3);
    paper(c, path([['M', 0, -424], ['C', -30, -438, -72, -428, -76 * mw, -404], ['C', -52, -410, -26, -402, 0, -412], ['C', 26, -402, 52, -410, 76 * mw, -404], ['C', 72, -428, 30, -438, 0, -424], ['Z']], true, 4), '#7a5c45', { seed: 670 });
    c.restore();
    c.restore();
    const out = {}; for (const k in anchors) out[k] = anchor(x, y, s, rot, flip, anchors[k][0], anchors[k][1] + bob);
    out.head = anchor(x, y, s, rot, flip, 0, -480 + bob); out.top = anchor(x, y, s, rot, flip, 0, -640 + bob);
    return out;
  };

  // ── brain ──
  const GYRI = [
    [['M', 0, -153], ['C', -14, -120, 16, -90, -2, -51]],
    [['M', -164, -69], ['C', -144, -99, -114, -69, -92, -97]],
    [['M', -184, -7], ['C', -164, -29, -142, -1, -120, -25]],
    [['M', -90, -133], ['C', -72, -115, -58, -137, -38, -121]],
    [['M', 164, -69], ['C', 144, -99, 114, -69, 92, -97]],
    [['M', 184, -7], ['C', 164, -29, 142, -1, 120, -25]],
    [['M', 90, -133], ['C', 72, -115, 58, -137, 38, -121]],
    [['M', -158, 65], ['C', -146, 81, -128, 71, -120, 87]],
    [['M', 158, 65], ['C', 146, 81, 128, 71, 120, 87]],
  ].map(cm => path(cm));
  PK.brain = (c, x, y, s, st = {}) => {
    const t = st.t ?? 0, flip = st.flip || 1, rot = st.rot || 0, blink = st.blink ?? autoBlink(st.t, 2), look = st.look || [0, 0];
    const br = 1 + 0.018 * Math.sin(t * 2.4);
    const anchors = {};
    c.save(); c.translate(x, y); c.rotate(rot * D); c.scale(s * flip, s); if (st.alpha != null) c.globalAlpha *= cl01(st.alpha);
    c.scale((st.sx ?? 1) * br, (st.sy ?? 1) / br);
    // arms (behind the brain)
    const handFor = (side) => {
      const tgt = side === 'L' ? st.handL : st.handR;
      if (tgt) { const l = toLocal(x, y, s, rot, flip, tgt[0], tgt[1]); return [l[0] / ((st.sx ?? 1) * br), l[1] / ((st.sy ?? 1) / br)]; }
      if (side === 'L') { const w = st.wave ? Math.sin(t * 9) * 26 * st.wave : 0; return [-275 + w, -105 + Math.sin(t * 2.2) * 6 - Math.abs(w) * 0.3]; }
      return [272, 150 + Math.sin(t * 2.0 + 1) * 6];
    };
    for (const side of ['L', 'R']) {
      const sd = side === 'L' ? -1 : 1, sh = [sd * 196, side === 'L' ? 20 : 55], hd = handFor(side);
      const mx = (sh[0] + hd[0]) / 2 + sd * 40, my = Math.min(sh[1], hd[1]) + (hd[1] < sh[1] ? 20 : 40);
      const ctrl = st['bend' + side] ? [mx + st['bend' + side][0], my + st['bend' + side][1]] : [mx, (sh[1] + hd[1]) / 2 + (side === 'L' ? 30 : 0)];
      paper(c, limbPoly(path([['M', sh[0], sh[1]], ['Q', ctrl[0], ctrl[1], hd[0], hd[1]]]), 22), pal.brain, { seed: 701 + (sd > 0 ? 1 : 0) });
      const ang = Math.atan2(hd[1] - ctrl[1], hd[0] - ctrl[0]);
      const kind = (st.grip === side || st.grip === true) ? 'fist' : st.point === side ? 'point' : 'open';
      glove(c, hd[0], hd[1], 31, ang, kind);
      anchors['hand' + side] = hd;
    }
    if (st.plug) { paper(c, rrect(-238, 22, 30, 36, 8), '#a7a2b8', { seed: 705 }); anchors.plug = [-238, 40]; }
    paper(c, blobG(0, 0, 215, 158, 13, 0.06, 200, 0.92), st.col || pal.brain, { seed: 710, tone: true, amp: 2.6 });
    GYRI.forEach((g, i) => PK.line(c, g, 7, st.lineCol || pal.brainLine, { seed: 720 + i }));
    eye(c, -55, 25, 31, 37, look[0], look[1], blink); eye(c, 55, 25, 31, 37, look[0], look[1], blink);
    brows(c, [-55, 55], -28, 56, { brow: st.brow, angry: st.angry, worried: st.worried, lw: 9 });
    paper(c, ell(-92, 77, 22, 12), pal.blush, { seed: 730, rim: false, shadow: 0, small: true }); paper(c, ell(92, 77, 22, 12), pal.blush, { seed: 731, rim: false, shadow: 0, small: true });
    mouthShape(c, st.mouth || 'smile', 0, 77, 84);
    if (st.sweat) { const u = (t * 0.9) % 1; c.save(); c.globalAlpha *= cl01(st.sweat) * (1 - u * 0.7); paper(c, path([['M', 0, -16], ['C', 10, -2, 11, 9, 0, 13], ['C', -11, 9, -10, -2, 0, -16], ['Z']], true, 3).map(([a, b]) => [190 + a, -60 + u * 60 + b]), '#a8e3ff', { seed: 732, small: true }); c.restore(); }
    c.restore();
    const sx = (st.sx ?? 1) * br, sy = (st.sy ?? 1) / br, out = {};
    for (const k in anchors) out[k] = anchor(x, y, s, rot, flip, anchors[k][0] * sx, anchors[k][1] * sy);
    out.top = anchor(x, y, s, rot, flip, 0, -160 * sy); out.center = [x, y]; out.mouth = anchor(x, y, s, rot, flip, 0, 90 * sy);
    return out;
  };

  // ── painkiller drop ──
  const DROP = path([['M', 0, -100], ['C', 26, -62, 64, -30, 64, 14], ['C', 64, 52, 34, 74, 0, 74], ['C', -34, 74, -64, 52, -64, 14], ['C', -64, -30, -26, -62, 0, -100], ['Z']], true, 4);
  PK.drop = (c, x, y, s, st = {}) => {
    if (typeof c === 'number') return PK.dropY(c, x, y);   // PK.drop(t, t0, h) = the drop-in motion helper
    const t = st.t ?? 0, flip = st.flip || 1, rot = st.rot || 0, blink = st.blink ?? autoBlink(st.t, (st.seed || 0) + 7), look = st.look || [0, 0];
    const col = st.col || pal.mint, anchors = {};
    c.save(); c.translate(x, y); c.rotate(rot * D); c.scale(s * flip, s); if (st.alpha != null) c.globalAlpha *= cl01(st.alpha);
    const b = Math.sin(t * 3 + (st.seed || 0)) * 0.03; c.translate(0, 74); c.scale((st.sx ?? 1) * (1 + b), (st.sy ?? 1) * (1 - b)); c.translate(0, -74);
    // arms
    const aL = st.armL ?? (st.wave ? 130 + Math.sin(t * 10) * 25 : 30), aR = st.armR ?? (st.stop ? 150 : 30);
    for (const [side, a] of [['L', aL], ['R', aR]]) {
      const sd = side === 'L' ? -1 : 1, sh = [sd * 52, 20], hd = [sh[0] + sd * Math.sin(a * D) * 46, sh[1] + Math.cos(a * D) * 46];
      paper(c, limbPoly([sh, hd], 14), shadeHex(col, -0.12), { seed: 801 + (sd > 0 ? 1 : 0) }); paper(c, ell(hd[0], hd[1], 11, 11), shadeHex(col, -0.12), { seed: 803, small: true });
      anchors['hand' + side] = hd;
      if (side === 'R' && st.stop) {
        c.save(); c.translate(hd[0], hd[1]); c.rotate((st.signRot ?? 8) * D);
        PK.limb(c, [[0, 14], [0, -120]], 9, '#8a6440', { seed: 804 });
        const oc = []; for (let i = 0; i < 8; i++) { const a2 = (22.5 + i * 45) * D; oc.push([Math.cos(a2) * 58, -150 + Math.sin(a2) * 58]); } oc.closed = true;
        paper(c, oc, '#ff3d5e', { seed: 805 });
        c.font = PK.font(30, 900, 'Figtree'); c.textAlign = 'center'; c.fillStyle = '#fffaf0'; c.fillText('STOP', 0, -139);
        c.restore(); anchors.sign = [hd[0], hd[1] - 150];
      }
      if (side === 'L' && st.shield) { c.save(); c.translate(hd[0] - 10, hd[1] - 10); paper(c, path([['M', -40, -46], ['L', 40, -46], ['L', 40, 0], ['C', 40, 30, 0, 50, 0, 50], ['C', 0, 50, -40, 30, -40, 0], ['Z']], true), '#fffaf0', { seed: 806 }); paper(c, rrect(-8, -34, 16, 60, 4), col, { seed: 807, small: true }); paper(c, rrect(-26, -12, 52, 16, 4), col, { seed: 808, small: true }); c.restore(); }
    }
    paper(c, DROP, col, { seed: 810, tone: true });
    paper(c, ell(-28, -18, 12, 22), st.hl || pal.mintLt, { seed: 811, small: true, rim: false, shadow: 0 });
    eye(c, -22, 14, 13, 16, look[0], look[1], blink, { dot: true }); eye(c, 22, 14, 13, 16, look[0], look[1], blink, { dot: true });
    paper(c, ell(-40, 36, 11, 6), pal.blush, { seed: 812, small: true, rim: false, shadow: 0 }); paper(c, ell(40, 36, 11, 6), pal.blush, { seed: 813, small: true, rim: false, shadow: 0 });
    mouthShape(c, st.mouth || 'smile', 0, 36, 26);
    if (st.angry || st.brow) brows(c, [-22, 22], -8, 22, { brow: st.brow, angry: st.angry, lw: 5 });
    c.restore();
    const out = {}; for (const k in anchors) out[k] = anchor(x, y, s, rot, flip, anchors[k][0], anchors[k][1]); out.top = anchor(x, y, s, rot, flip, 0, -100);
    return out;
  };

  // ── pain bolt ──
  const BOLT = boltPts(0, 0, 2, 0);
  PK.bolt = (c, x, y, s, st = {}) => {
    const t = st.t ?? 0, rot = st.rot ?? 0, col = st.col || pal.pain;
    c.save(); c.translate(x, y); c.rotate(rot * D); c.scale(s * (st.sx ?? 1), s * (st.sy ?? 1)); if (st.alpha != null) c.globalAlpha *= cl01(st.alpha);
    if (st.ghost) { c.save(); c.setLineDash([20, 14]); c.lineWidth = 6 / Math.max(0.3, s); c.strokeStyle = col; c.globalAlpha *= 0.85; trace(c, rough(BOLT, 1.5, 1, 3), true); c.stroke(); c.globalAlpha *= 0.2; c.fillStyle = col; c.fill(); c.restore(); c.restore(); return { tip: anchor(x, y, s, rot, 1, -36, 152) }; }
    if (st.glow) { c.save(); c.shadowColor = `rgba(255,61,94,${0.7 * st.glow})`; c.shadowBlur = 40 * s; trace(c, BOLT, true); c.fillStyle = col; c.fill(); c.restore(); }
    paper(c, BOLT, col, { seed: 901, amp: 2, tone: true, lift: st.lift || 0 });
    paper(c, [[-2, -140], [40, -140], [26, -110], [6, -110]], shadeHex(col, 0.35), { seed: 902, rim: false, shadow: 0, alpha: 0.7 });
    if (st.angry || st.face) {
      const bl = st.blink ?? autoBlink(st.t, 9);
      eye(c, 2, -20, 11, 13, st.look ? st.look[0] : 0.3, st.look ? st.look[1] : 0.2, bl, { white: pal.paperW });
      eye(c, 30, -20, 11, 13, st.look ? st.look[0] : 0.3, st.look ? st.look[1] : 0.2, bl, { white: pal.paperW });
      if (st.angry) { PK.line(c, [[-12, -42], [12, -32]], 6, pal.ink, { seed: 903 }); PK.line(c, [[44, -42], [20, -32]], 6, pal.ink, { seed: 904 }); }
      mouthShape(c, st.mouth || (st.angry ? 'grimace' : 'smile'), 16, 6, st.angry ? 22 : 20);
    }
    c.restore();
    return { tip: anchor(x, y, s, rot, 1, -36, 152), top: anchor(x, y, s, rot, 1, 24, -148) };
  };

  // ── PAIN dial on a post ──
  PK.dial = (c, x, y, s, st = {}) => {
    const v = cl01(st.v ?? 0.1), lit = st.lit ?? 1, t = st.t ?? 0, N = st.n || 9, rot = st.rot || 0;
    c.save(); c.translate(x, y); c.rotate(rot * D); c.scale(s * (st.sx ?? 1), s * (st.sy ?? 1)); if (st.alpha != null) c.globalAlpha *= cl01(st.alpha);
    if (st.post !== false) { paper(c, ell(0, 0, 104, 22), pal.boxDk, { seed: 951 }); paper(c, rrect(-22, -150, 44, 150, 10), pal.boxDk, { seed: 952 }); }
    paper(c, rrect(-150, -525, 300, 395, 40), pal.box, { seed: 953, tone: true });
    for (const [sx, sy] of [[-125, -500], [125, -500], [-125, -155], [125, -155]]) paper(c, ell(sx, sy, 7, 7), pal.boxDk, { seed: 954, small: true, rim: false });
    paper(c, rrect(-128, -503, 256, 262, 30), pal.panel, { seed: 955, rim: false });
    const cy = -375;
    for (let i = 0; i < N; i++) {
      const a = (135 + i * 270 / (N - 1)) * D, u = i / (N - 1), on = u <= lit + 1e-6;
      const pulse = on && Math.abs(u - lit) < 0.5 / (N - 1) ? 1 + 0.15 * Math.sin(t * 10) : 1;
      PK.line(c, [[Math.cos(a) * 86, cy + Math.sin(a) * 86], [Math.cos(a) * 116 * pulse, cy + Math.sin(a) * 116 * pulse]], 17, on ? tickCol(u) : '#4a4672', { seed: 960 + i, alpha: on ? 1 : 0.9 });
    }
    paper(c, blobG(0, cy, 62, 62, 12, 0.09, 120), pal.knob, { seed: 970 });
    paper(c, ell(0, cy, 42, 42), pal.paperW, { seed: 971 });
    const na = (135 + v * 270) * D + (st.jitter ? Math.sin(t * 40) * st.jitter * D : 0), pn = na + Math.PI / 2;
    const np = [[Math.cos(pn) * 15, cy + Math.sin(pn) * 15], [Math.cos(na) * 104, cy + Math.sin(na) * 104], [-Math.cos(pn) * 15, cy - Math.sin(pn) * 15]]; np.closed = true;
    paper(c, np, pal.pointer, { seed: 972, amp: 0.8 }); paper(c, ell(0, cy, 19, 19), pal.pointer, { seed: 973, small: true });
    if (st.label !== false) { paper(c, rrect(-90, -218, 180, 70, 18), pal.plate, { seed: 974 }); c.font = PK.font(st.labelSize || 56, 800, 'Figtree'); c.textAlign = 'center'; c.fillStyle = pal.ink; c.letterSpacing = '3px'; c.fillText(st.label || 'PAIN', 0, -162); c.letterSpacing = '0px'; }
    c.restore();
    const sx = st.sx ?? 1, sy = st.sy ?? 1;
    return { knob: anchor(x, y, s, rot, 1, 0, cy * sy), needleTip: anchor(x, y, s, rot, 1, Math.cos(na) * 104 * sx, (cy + Math.sin(na) * 104) * sy), top: anchor(x, y, s, rot, 1, 0, -525 * sy), knobEdge: anchor(x, y, s, rot, 1, 40 * sx, (cy - 40) * sy) };
  };

  // ── big switch lever ──
  PK.lever = (c, x, y, s, st = {}) => {
    const v = st.v ?? 0, t = st.t ?? 0, rot = st.rot || 0;
    const ang = lp(st.a0 ?? -55, st.a1 ?? 55, v);
    c.save(); c.translate(x, y); c.rotate(rot * D); c.scale(s, s); if (st.alpha != null) c.globalAlpha *= cl01(st.alpha);
    paper(c, rrect(-160, -170, 320, 170, 34), pal.box, { seed: 1001, tone: true });
    paper(c, rrect(-120, -150, 240, 54, 27), pal.panel, { seed: 1002, rim: false });
    const lamps = [[-110, -50, '#ff3d5e', v < 0.5], [110, -50, '#3bd16f', v >= 0.5]];
    for (const [lx, ly, col, on] of lamps) { if (on) { c.save(); c.shadowColor = col; c.shadowBlur = 30 * s; paper(c, ell(lx, ly, 22, 22), col, { seed: 1003 }); c.restore(); } else paper(c, ell(lx, ly, 22, 22), shadeHex(col, -0.55), { seed: 1004 }); }
    if (st.labels) { c.font = PK.font(30, 900, 'Figtree'); c.textAlign = 'center'; c.fillStyle = '#fffaf0'; c.fillText(st.labels[0], -110, -82); c.fillText(st.labels[1], 110, -82); }
    const px = 0, py = -122, L = st.len || 250;
    c.save(); c.translate(px, py); c.rotate(ang * D);
    paper(c, limbPoly([[0, 0], [0, -L]], 26), '#c9ced8', { seed: 1005 });
    paper(c, ell(0, -L, 46, 46), st.ballCol || pal.pain, { seed: 1006, tone: true }); paper(c, ell(-14, -L - 14, 12, 10), '#ffffff', { seed: 1007, small: true, rim: false, shadow: 0, alpha: 0.6 });
    c.restore();
    paper(c, ell(px, py, 30, 30), pal.boxDk, { seed: 1008 }); paper(c, ell(px, py, 12, 12), '#c9ced8', { seed: 1009, small: true });
    c.restore();
    const ball = anchor(x, y, s, rot, 1, px + Math.sin(ang * D) * L, py - Math.cos(ang * D) * L);
    return { ball, pivot: anchor(x, y, s, rot, 1, px, py) };
  };

  // ═════════════ captions ═════════════
  PK.capEm = PK.capEm || {}; PK.capNoEm = PK.capNoEm || {}; PK.capBreak = PK.capBreak || {};
  const CAPC = { size: 104, maxW: 880, y1: 262, y2: [208, 346], ink: '#22203f', strip: '#fffaf0', hi: ['#ffd54a', '#ff9ec4', '#7fdcc3'], lead: 0.25 };
  PK.capStyle = CAPC;
  let PH = null; const MC = document.createElement('canvas').getContext('2d');
  const cleanW = w => String(w).replace(/[^\p{L}\p{N}'’%$-]/gu, '');
  const isStop = w => { try { return typeof isStopWord === 'function' ? isStopWord(w) : false; } catch (e) { return false; } };
  function buildPhrases() {
    const ws = (typeof WORDS !== 'undefined' && WORDS) || [];
    const cuts = (typeof ORDER !== 'undefined' && typeof B !== 'undefined') ? ORDER.map(k => B[k]).filter(v => v > 0).sort((a, b) => a - b) : [];
    const seg = i => { let n = 0; for (const c of cuts) if (ws[i].s >= c - 1e-3) n++; return n; };
    const clauses = []; let cur = [];
    for (let i = 0; i < ws.length; i++) {
      if (cur.length) { const p = ws[i - 1]; if (seg(i) !== seg(i - 1) || /[.,!?;:…—]["'”’)]*$/.test(p.w) || ws[i].s - p.e > 0.35 || PK.capBreak[i]) { clauses.push(cur); cur = []; } }
      cur.push(i);
    }
    if (cur.length) clauses.push(cur);
    const chunks = [];
    const CONN = new Set(['and', 'but', 'so', 'that', 'which', 'in', 'at', 'with', 'before', 'after', 'when', 'if', 'because', 'on', 'for', 'like', 'from', 'only', 'then', 'to']);
    const WEAKEND = new Set(['the', 'a', 'an', 'your', 'its', 'their', 'his', 'her', 'my', 'of', 'to', 'in', 'at', 'and', 'can', 'has', 'have', 'been', 'is', 'are', 'was']);
    const lw_ = i => cleanW(ws[i].w).toLowerCase();
    for (const cl of clauses) {
      const n = cl.length; if (n <= 5) { chunks.push(cl); continue; }
      const best = new Array(n + 1).fill(1e9), from = new Array(n + 1).fill(0); best[0] = 0;
      for (let e = 1; e <= n; e++) for (let sz = 2; sz <= 5; sz++) { const b = e - sz; if (b < 0 || best[b] >= 1e9) continue;
        let cst = (sz - 4) * (sz - 4) * 0.6; if (b > 0 && CONN.has(lw_(cl[b]))) cst -= 2; if (e < n && WEAKEND.has(lw_(cl[e - 1]))) cst += 2.5;
        if (best[b] + cst < best[e]) { best[e] = best[b] + cst; from[e] = b; } }
      if (best[n] >= 1e9) { for (let st = 0; st < n; st += 5) chunks.push(cl.slice(st, st + 5)); continue; }
      const cutsAt = []; for (let e = n; e > 0; e = from[e]) cutsAt.unshift([from[e], e]);
      for (const [b, e] of cutsAt) chunks.push(cl.slice(b, e));
    }
    const out = [];
    chunks.forEach((ix, n) => {
      const i0 = ix[0], i1 = ix[ix.length - 1], sg = seg(i0); const segStart = sg > 0 ? cuts[sg - 1] : 0;
      const show = Math.max(segStart, ws[i0].s - CAPC.lead);
      let em = ix.filter(i => PK.capEm[i]);
      if (!em.length && !PK.capNoEm[i0]) { let best = -1, bs = -1; for (const i of ix) { const w = cleanW(ws[i].w); const sc = /\d/.test(w) ? 100 : isStop(w) || w.length < 4 ? -1 : w.length + (i - i0) * 0.3; if (sc > bs) { bs = sc; best = i; } } if (best >= 0 && bs > 0) em = [best]; }
      out.push({ n, i0, i1, ix, show, em, seg: sg });
    });
    // let a phrase's last word breathe: the next phrase waits until ≥ 0.35 s after that word started (but ≤ 0.06 s before its own word)
    for (let k = 1; k < out.length; k++) { const p = out[k], pr = out[k - 1]; if (p.seg !== pr.seg) continue; const w0 = ws[p.i0].s; p.show = Math.max(p.show, Math.min(w0 - 0.06, ws[pr.i1].s + 0.35)); }
    const DE = typeof DUR_END === 'function' ? DUR_END() : 999;
    out.forEach((p, k) => { const nx = out[k + 1]; const last = ws[p.i1].e; p.end = nx ? Math.min(nx.show, Math.max(last + 1.4, nx.show - 99)) : DE + 1; if (nx && nx.show - last > 2.2) p.end = last + 1.2; });
    // layout
    out.forEach(p => {
      let fs = CAPC.size; MC.font = PK.font(fs, 800); const sp = MC.measureText(' ').width + fs * 0.16;
      const wd = p.ix.map(i => MC.measureText(cleanCap(ws[i].w)).width);
      const tot = wd.reduce((a, b) => a + b, 0) + sp * (wd.length - 1);
      let lines;
      if (tot <= CAPC.maxW || p.ix.length < 2) lines = [p.ix.slice()];
      else { let bk = 1, bw = 1e9; for (let k = 1; k < p.ix.length; k++) { const a = wd.slice(0, k).reduce((x, y) => x + y, 0) + sp * (k - 1), b = wd.slice(k).reduce((x, y) => x + y, 0) + sp * (wd.length - k - 1); const m = Math.max(a, b) + (a > b ? 0 : 6); if (m < bw) { bw = m; bk = k; } } lines = [p.ix.slice(0, bk), p.ix.slice(bk)]; }
      const lw = lines.map(L => L.reduce((a, i) => a + MC.measureText(cleanCap(ws[i].w)).width, 0) + sp * (L.length - 1));
      const mx = Math.max(...lw); if (mx > 900) fs = Math.floor(fs * 900 / mx);
      p.fs = fs; p.lines = lines;
    });
    return out;
  }
  const cleanCap = w => String(w).replace(/[—–]+$/, '');
  PK.phrases = () => (PH || (PH = buildPhrases()));
  PK.capHide = window.PK_NOCAP ? (() => true) : PK.capHide || (t => { const DE = typeof DUR_END === 'function' ? DUR_END() : 999; return t > DE - 0.5; });
  PK.captions = (c, t, o = {}) => {
    if (o.fibre !== false && PK.fibreOn !== false) PK.fibre(c, 0.5);
    if (PK.capHide(t)) return;
    const ph = PK.phrases(); const ws = WORDS;
    const p = ph.find(q => t >= q.show && t < q.end); if (!p) return;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    const fs = p.fs, exitP = cl01((t - (p.end - 0.12)) / 0.12);
    const ys = p.lines.length === 1 ? [CAPC.y1] : CAPC.y2;
    p.lines.forEach((L, li) => {
      const ta0 = Math.max(p.show, ws[L[0]].s - CAPC.lead); if (t < ta0) return;
      c.font = PK.font(fs, 800); const sp = c.measureText(' ').width + fs * 0.16;
      const wd = L.map(i => c.measureText(cleanCap(ws[i].w)).width); const tw = wd.reduce((a, b) => a + b, 0) + sp * (L.length - 1);
      const dt = t - ta0, f0 = ta0 <= 0.001, sIn = f0 ? 0.92 + 0.08 * spr(dt + 0.08, 3.2, 0.45) : 0.55 + 0.45 * spr(dt, 3.2, 0.45), rIn = f0 ? 0 : rng0(dt, 2.4, 5) * 7;
      const baseRot = (li === 0 ? -2.2 : 1.8) * (p.n % 2 ? -1 : 1) + PK.wob(t, p.n * 3 + li, 0.5);
      c.save(); c.translate(540, ys[li] - exitP * 30); c.rotate((baseRot + rIn) * D); c.scale(sIn, sIn * (1 - exitP)); c.globalAlpha = Math.min(1, (p.show <= 0.001 ? 1 : 0) + dt * 12) * (1 - exitP * 0.4);
      // visible width (strip unrolls word by word, eased)
      let vis = 0, acc = 0; L.forEach((i, k) => { const ta = Math.max(ta0, ws[i].s - CAPC.lead); const u = cl01((t - ta) / 0.14); const e2 = 1 - Math.pow(1 - u, 3); if (u > 0) vis = acc + (wd[k] + (k ? sp : 0)) * e2 + (k ? 0 : 0); acc += wd[k] + (k ? sp : 0); });
      vis = Math.max(vis, Math.min(wd[0], 60));
      const phh = fs * 1.14, x0s = -tw / 2 - 35;
      paper(c, rrect(x0s, -phh / 2, vis + 70, phh, 6), CAPC.strip, { seed: 1200 + p.n * 7 + li, amp: 2.6, hf: 2.2, rim: false, lift: 0.3 });
      let xx = -tw / 2;
      L.forEach((i, k) => {
        const ta = Math.max(ta0, ws[i].s - CAPC.lead), wdt = t - ta, w = wd[k];
        if (wdt >= 0) {
          if (p.em.includes(i)) {
            const hx = cl01(wdt / 0.12); const hc = CAPC.hi[p.n % CAPC.hi.length];
            c.save(); c.translate(xx + w / 2, fs * 0.02); c.rotate((-2.5 + (p.n % 2) * 4) * D); c.scale(hx, 1);
            paper(c, rrect(-w / 2 - 14, -fs * 0.46, w + 28, fs * 0.9, 4), hc, { seed: 1300 + i, amp: 1.8, hf: 1.6, rim: false, shadow: 0.7 });
            c.restore();
          }
          const ws_ = ta <= 0.001 ? 0.85 + 0.15 * spr(wdt + 0.05, 3.6, 0.42) : 0.6 + 0.4 * spr(wdt, 3.6, 0.42);
          c.save(); c.translate(xx + w / 2, fs * 0.34); c.scale(ws_, ws_); c.globalAlpha *= Math.min(1, (ta <= 0.001 ? 1 : 0) + wdt * 14);
          c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = CAPC.ink; c.fillText(cleanCap(ws[i].w), 0, 0); c.restore();
        }
        xx += w + sp;
      });
      c.restore();
    });
    c.restore();
  };
})();

// ───────────────────────── SOMBRAS: teatro de sombras en papel, para el motor canvas2d ─────────────────────────
// Dibuja todo sobre K (capa opaca) en coordenadas de pantalla, desde sc.back(T, K, t). No usa presentador ni subtítulos del motor.
// Nada de este archivo sabe de qué trata el video: personajes paramétricos, decorados, luz, hilo, textos y transiciones.
const SOM = (() => {
  const FLOOR = 1200, LIP = 1262, TOP = 84;              // suelo de los títeres, borde inferior de la pantalla, borde superior
  const INK = '#170705', THREAD = '#FF1E34', CREAM = '#FFEFD2';
  const PALS = {                                         // centro → medio → borde → esquina
    ember: ['#FFD184', '#F7923A', '#C8441B', '#6B1A0E'],
    amber: ['#FFE2A0', '#F6AE4E', '#CF6A22', '#7A2E10'],
    dusk:  ['#FFB866', '#E0682A', '#97301A', '#3E100A'],
    rust:  ['#EE7E36', '#B03C18', '#691D0F', '#2A0B07'],
  };
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const css = a => `rgb(${a.map(v => Math.round(v)).join(',')})`;
  const pth = d => new Path2D(d);
  const seeded = s => { let x = s * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
  const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const prog = (t, a, d) => ease((t - a) / d);
  const backOut = x => { x = Math.max(0, Math.min(1, x)); const c = 1.5; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // ── la luz: contraluz cálido que parpadea ──
  let LIGHT = '#FFD184';                                  // color que se ve a través de los calados del papel en este cuadro
  function flicker(t) { return 1 + 0.045 * noise1(t * 6.3) + 0.03 * noise1(t * 17.1 + 9) + 0.02 * Math.sin(t * 1.1); }
  function mixPal(a, b, m) { const A = PALS[a] || PALS.ember, B = PALS[b || a] || A; return A.map((c, i) => { const p = hex(c), q = hex(B[i]); return p.map((v, k) => lerp(v, q[k], m || 0)); }); }
  function backlight(ctx, t, o = {}) {
    const pal = mixPal(o.pal || 'ember', o.pal2, o.mix), pw = (o.power ?? 1) * flicker(t), dark = [18, 6, 4];
    const cx = (o.cx ?? 540) + noise1(t * 2.4) * 16, cy = (o.cy ?? 720) + noise1(t * 2.1 + 5) * 16;
    const shade = c => css(c.map((v, k) => lerp(dark[k], v, Math.min(1.08, pw))));
    const g = ctx.createRadialGradient(cx, cy, 30, cx, cy, o.r ?? 1050);
    g.addColorStop(0, shade(pal[0])); g.addColorStop(0.36, shade(pal[1])); g.addColorStop(0.72, shade(pal[2])); g.addColorStop(1, shade(pal[3]));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    LIGHT = shade(pal[0]);
    ctx.save(); ctx.globalAlpha = 0.5; ctx.drawImage(paperTex(), 0, 0); ctx.restore();
  }
  let _tex = null;
  function paperTex() {                                    // fibras del papel de la pantalla (fijas, deterministas)
    if (_tex) return _tex;
    _tex = mk(W, H); const c = _tex.getContext('2d'), R = seeded(11);
    for (let i = 0; i < 2400; i++) {
      const x = R() * W, y = R() * H, a = R() * 6.28, l = 8 + R() * 46;
      c.strokeStyle = R() < 0.55 ? `rgba(70,20,8,${0.03 + R() * 0.07})` : `rgba(255,235,190,${0.03 + R() * 0.07})`;
      c.lineWidth = 0.7 + R() * 1.1; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + R() * 8, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
    return _tex;
  }
  // polvo en el haz de luz: vida mínima en todo cuadro
  function dust(ctx, t, n = 34, alpha = 0.3) {
    ctx.save();
    for (let i = 0; i < n; i++) {
      const x = (hash(i) * 1100 + t * (6 + hash(i + 50) * 12) + 18 * Math.sin(t * 0.4 + i)) % 1100 - 10;
      const y = TOP + ((hash(i + 90) * 1120 - t * (5 + hash(i + 7) * 10)) % 1120 + 1120) % 1120;
      ctx.globalAlpha = alpha * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 2.1)));
      ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(x, y, 1.4 + hash(i + 3) * 2.2, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  // ── marco del teatro y borde del escenario (la franja de subtítulos) ──
  let _frame = null;
  function frameLayer() {
    if (_frame) return _frame;
    _frame = mk(W, H); const c = _frame.getContext('2d');
    const op = new Path2D();
    op.moveTo(34, TOP + 8);
    op.bezierCurveTo(240, TOP + 44, 430, TOP + 34, 540, TOP + 66);
    op.bezierCurveTo(650, TOP + 34, 840, TOP + 44, 1046, TOP + 8);
    op.bezierCurveTo(1022, 520, 1022, 900, 1050, LIP);
    op.lineTo(30, LIP);
    op.bezierCurveTo(58, 900, 58, 520, 34, TOP + 8);
    op.closePath();
    const fr = new Path2D(); fr.rect(0, 0, W, H); fr.addPath(op);
    c.fillStyle = '#100504'; c.fill(fr, 'evenodd');
    c.strokeStyle = 'rgba(255,160,80,0.22)'; c.lineWidth = 2; c.stroke(op);
    return _frame;
  }
  let _apron = null;
  function apronLayer() {                                  // frente tallado del escenario: calado de nubes, muy bajo de contraste
    if (_apron) return _apron;
    _apron = mk(W, H); const c = _apron.getContext('2d');
    c.strokeStyle = 'rgba(190,104,56,0.13)'; c.lineWidth = 5; c.lineCap = 'round';
    c.strokeRect(46, 1438, 988, 400); c.lineWidth = 2; c.strokeRect(62, 1454, 956, 368);
    c.lineWidth = 4;
    for (let r = 0; r < 4; r++) for (let i = -1; i < 9; i++) {
      const x = 90 + i * 124 + (r % 2) * 62, y = 1510 + r * 88;
      c.beginPath(); c.arc(x, y, 30, Math.PI, TAU); c.arc(x + 42, y, 12, Math.PI, 0, true); c.moveTo(x + 30, y); c.arc(x + 62, y, 32, Math.PI, 0.3 * Math.PI, false); c.stroke();
    }
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.fillRect(0, 0, 62, H); c.fillRect(1018, 0, 62, H); c.fillRect(0, 1822, W, 98); c.fillRect(0, 1262, W, 192);
    return _apron;
  }
  function frame(ctx, t, power = 1) {
    ctx.drawImage(frameLayer(), 0, 0);
    const pw = Math.min(1.1, power) * flicker(t);
    const g = ctx.createLinearGradient(0, LIP, 0, 1820);          // la pantalla ilumina el borde de madera
    g.addColorStop(0, `rgba(214,92,36,${0.34 * pw})`); g.addColorStop(0.3, `rgba(150,56,22,${0.15 * pw})`); g.addColorStop(1, 'rgba(60,20,8,0)');
    ctx.fillStyle = g; ctx.fillRect(0, LIP, W, H - LIP);
    ctx.fillStyle = `rgba(255,190,120,${0.5 * pw})`; ctx.fillRect(30, LIP, 1020, 3);
    ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.min(1, pw); ctx.drawImage(apronLayer(), 0, 0); ctx.restore();
  }

  // ── decorados: se pintan una vez (con desenfoque si están lejos de la pantalla) y se reutilizan ──
  const _flats = {};
  function flat(key, w, h, paint, o = {}) {
    if (_flats[key]) return _flats[key];
    const raw = mk(w, h), rc = raw.getContext('2d'); rc.fillStyle = INK; rc.strokeStyle = INK; paint(rc, w, h);
    if (!o.blur) return (_flats[key] = raw);
    const out = mk(w, h), oc = out.getContext('2d'); oc.filter = `blur(${o.blur}px)`; oc.drawImage(raw, 0, 0); oc.filter = 'none';
    return (_flats[key] = out);
  }
  const place = (ctx, f, x, y, alpha = 1) => { ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(f, x, y); ctx.restore(); };
  function mountains(c, w, h, seed, n, minH = 0.35, maxH = 0.98) {          // picos redondeados tipo pintura de tinta
    const R = seeded(seed);
    for (let i = 0; i < n; i++) {
      const x = (i + 0.2 + R() * 0.6) * w / n, pw = (0.6 + R() * 0.7) * w / n, top = h * (1 - lerp(minH, maxH, R()));
      c.beginPath(); c.moveTo(x - pw, h);
      c.bezierCurveTo(x - pw * 0.72, h - (h - top) * 0.55, x - pw * 0.5, top + 20, x - pw * 0.14, top);
      c.bezierCurveTo(x + pw * 0.1, top - 12, x + pw * 0.34, top + 44, x + pw * 0.48, h - (h - top) * 0.5);
      c.bezierCurveTo(x + pw * 0.6, h - (h - top) * 0.25, x + pw * 0.8, h - 16, x + pw, h); c.closePath(); c.fill();
    }
  }
  function roof(c, x, y, w, h) {                                            // techo de aleros curvos, y = línea del alero
    const f = w * 0.16;
    c.beginPath(); c.moveTo(x - w / 2 - f, y - h * 0.28);
    c.quadraticCurveTo(x - w / 2 + f * 0.2, y + h * 0.2, x - w * 0.2, y - h * 0.5);
    c.quadraticCurveTo(x - w * 0.07, y - h * 0.9, x, y - h);
    c.quadraticCurveTo(x + w * 0.07, y - h * 0.9, x + w * 0.2, y - h * 0.5);
    c.quadraticCurveTo(x + w / 2 - f * 0.2, y + h * 0.2, x + w / 2 + f, y - h * 0.28);
    c.quadraticCurveTo(x + w / 2 - f * 0.4, y + h * 0.46, x + w * 0.3, y + h * 0.1);
    c.lineTo(x - w * 0.3, y + h * 0.1);
    c.quadraticCurveTo(x - w / 2 + f * 0.4, y + h * 0.46, x - w / 2 - f, y - h * 0.28); c.closePath(); c.fill();
  }
  function pagoda(c, x, y, floors, w) {
    let cy = y, fw = w;
    for (let i = 0; i < floors; i++) {
      const fh = fw * 0.5;
      c.fillRect(x - fw * 0.3, cy - fh, fw * 0.6, fh + 2);
      if (fw > 44) { c.save(); c.globalCompositeOperation = 'destination-out'; c.fillRect(x - fw * 0.09, cy - fh * 0.72, fw * 0.18, fh * 0.46); c.restore(); }
      roof(c, x, cy - fh, fw * 1.06, fw * 0.3); cy -= fh + fw * 0.15; fw *= 0.8;
    }
    c.fillRect(x - 3, cy - 56, 6, 64);
  }
  function house(c, x, y, w, h, win = 1) {
    c.fillRect(x - w * 0.42, y - h, w * 0.84, h + 2); roof(c, x, y - h, w, h * 0.5);
    c.save(); c.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < win; i++) {
      const wx = x + (i - (win - 1) / 2) * w * 0.34;
      c.beginPath(); if (c.roundRect) c.roundRect(wx - w * 0.09, y - h * 0.72, w * 0.18, h * 0.42, 6); c.fill();
    }
    c.restore();
  }
  function rock(c, x, y, w, h) {
    c.beginPath(); c.moveTo(x - w / 2, y + 4);
    c.bezierCurveTo(x - w * 0.55, y - h * 0.5, x - w * 0.3, y - h, x - w * 0.08, y - h * 0.96);
    c.bezierCurveTo(x + w * 0.16, y - h * 1.04, x + w * 0.46, y - h * 0.64, x + w * 0.52, y + 4); c.closePath(); c.fill();
  }
  function ground(c, y, w, seed = 3, amp = 16) {                            // suelo con lomas suaves, hasta abajo de la pantalla
    const R = seeded(seed); c.beginPath(); c.moveTo(-20, y + 8);
    let px = -20, py = y + 8;
    for (let x = 160; x < w + 300; x += 180) { const ny = y + (R() - 0.5) * amp; c.quadraticCurveTo(x - 90, py + (R() - 0.5) * amp, x, ny); px = x; py = ny; }
    c.lineTo(w + 300, y + 400); c.lineTo(-20, y + 400); c.closePath(); c.fill();
  }
  function stall(c, x, y, w, h, seed = 1) {                                 // puesto de mercado: palos, toldo festoneado, mesa, tinajas
    const R = seeded(seed);
    c.fillRect(x - w / 2, y - h, 10, h); c.fillRect(x + w / 2 - 10, y - h, 10, h);
    c.fillRect(x - w / 2 - 6, y - h * 0.34, w + 12, 16); c.fillRect(x - w / 2 + 16, y - h * 0.34, 8, h * 0.34); c.fillRect(x + w / 2 - 24, y - h * 0.34, 8, h * 0.34);
    c.beginPath(); c.moveTo(x - w / 2 - 34, y - h + 40); c.quadraticCurveTo(x, y - h - 66, x + w / 2 + 34, y - h + 40);
    const n = 7, sw = (w + 68) / n;
    for (let i = n; i > 0; i--) c.quadraticCurveTo(x - w / 2 - 34 + (i - 0.5) * sw, y - h + 72, x - w / 2 - 34 + (i - 1) * sw, y - h + 40);
    c.closePath(); c.fill();
    for (let i = 0; i < 4; i++) {                                           // tinajas y bultos
      const jx = x - w * 0.34 + i * w * 0.22, jr = 18 + R() * 16, jy = y - h * 0.34;
      c.beginPath(); c.ellipse(jx, jy - jr * 0.9, jr, jr, 0, 0, TAU); c.fill(); c.fillRect(jx - jr * 0.4, jy - jr * 2.2, jr * 0.8, jr * 0.6);
    }
  }

  // ── piezas vivas ──
  function lantern(ctx, x, y, s, t, ph = 0) {                               // farol colgante con calados
    const a = Math.sin(t * 1.5 + ph) * 0.09;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = INK; ctx.fillRect(-1.5, 0, 3, 46 * s); ctx.translate(0, 46 * s);
    ctx.beginPath(); ctx.ellipse(0, 34 * s, 27 * s, 34 * s, 0, 0, TAU); ctx.fill();
    ctx.fillRect(-14 * s, -2, 28 * s, 6 * s); ctx.fillRect(-14 * s, 64 * s, 28 * s, 6 * s); ctx.fillRect(-1.5, 70 * s, 3, 28 * s);
    ctx.fillStyle = LIGHT; for (const k of [-0.55, 0, 0.55]) { ctx.beginPath(); ctx.ellipse(k * 27 * s, 34 * s, 4.5 * s, 21 * s * (1 - Math.abs(k) * 0.3), 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  function willow(ctx, x, y, s, t, o = {}) {                                // sauce: tronco fijo, ramas colgantes que se mecen
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s); ctx.fillStyle = INK; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.moveTo(-46, 8); ctx.bezierCurveTo(-26, -160, -44, -300, 8, -470); ctx.lineTo(38, -460); ctx.bezierCurveTo(14, -300, 46, -150, 70, 8); ctx.closePath(); ctx.fill();
    const tips = [[30, -470, 330, -540], [20, -460, -170, -560], [34, -400, 400, -390], [12, -360, -250, -400], [20, -440, 120, -640]];
    ctx.lineCap = 'round';
    for (const [a, b, c2, d] of tips) { ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c2) / 2, d - 66, c2, d); ctx.stroke(); }
    for (let i = 0; i < 26; i++) {
      const [a, b, c2, d] = tips[i % tips.length], k = 0.3 + 0.7 * hash(i + 3), bx = lerp(a, c2, k), by = lerp(b, d, k) - 40 * Math.sin(k * 3.14), len = 240 + hash(i + 8) * 300;
      const sw = Math.sin(t * 0.9 + i * 0.7) * (16 + hash(i) * 20);
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + sw * 0.3, by + len * 0.5, bx + sw, by + len); ctx.stroke();
      for (let j = 1; j < 7; j++) { const q = j / 7, lx = bx + sw * q * q, ly = by + len * q; ctx.save(); ctx.translate(lx, ly); ctx.rotate(0.6 * (j % 2 ? 1 : -1)); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, 7, 3.2, 10, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    }
    ctx.restore();
  }
  function birds(ctx, x, y, s, t, n = 5) {                                  // bandada de papel, aleteo determinista
    ctx.save(); ctx.fillStyle = INK;
    for (let i = 0; i < n; i++) {
      const bx = x + (i % 2 ? 1 : -1) * ((i + 1) >> 1) * 62 * s + Math.sin(t * 0.8 + i) * 8, by = y + ((i + 1) >> 1) * 28 * s + Math.sin(t * 1.1 + i * 2) * 5, f = Math.sin(t * 7 + i * 1.7) * 22 * s;
      ctx.beginPath(); ctx.moveTo(bx - 34 * s, by - f); ctx.quadraticCurveTo(bx - 14 * s, by - f * 0.3, bx, by + 6 * s); ctx.quadraticCurveTo(bx + 14 * s, by - f * 0.3, bx + 34 * s, by - f); ctx.quadraticCurveTo(bx + 12 * s, by + f * 0.2 + 2 * s, bx, by + 12 * s); ctx.quadraticCurveTo(bx - 12 * s, by + f * 0.2 + 2 * s, bx - 34 * s, by - f); ctx.fill();
    }
    ctx.restore();
  }
  function moon(ctx, x, y, r, t, o = {}) {                                  // disco de papel crema; o.bite = eclipse (0..1), o.phase = fase
    ctx.save();
    const a = o.alpha ?? 1; ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.6);
    g.addColorStop(0, 'rgba(255,226,170,0.42)'); g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.fill();
    const d = ctx.createLinearGradient(x - r, y - r, x + r, y + r); d.addColorStop(0, '#FFEFC9'); d.addColorStop(1, '#F7D7A4');
    ctx.fillStyle = d; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (o.phase !== undefined || o.bite) {                                  // sombra de la fase
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r + 0.5, 0, TAU); ctx.clip(); ctx.fillStyle = o.shade || 'rgba(60,18,10,0.92)';
      const off = o.bite ? lerp(2.2, 0, o.bite) : o.phase;
      ctx.beginPath(); ctx.arc(x + off * r, y, r * 1.04, 0, TAU); ctx.fill(); ctx.restore();
      if (o.bite) { ctx.save(); ctx.globalAlpha = a * o.bite * (o.corona ?? 0.9); ctx.strokeStyle = '#FFE7BD'; ctx.lineWidth = 5; ctx.shadowColor = '#FFD49A'; ctx.shadowBlur = 34; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore(); }
    }
    ctx.restore();
  }
  function sack(ctx, x, y, s, t, o = {}) {                                  // bolsa colgante: (x, y) = punto de cuelgue; devuelve la boca
    const sw = Math.sin(t * 1.3 + (o.ph || 0)) * 0.05 + (o.jolt || 0);
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.scale(s, s); ctx.fillStyle = INK;
    ctx.fillRect(-2.5, 0, 5, 34);
    ctx.fill(pth('M-22,34 L22,34 L18,54 C50,74 76,120 70,172 C64,214 34,232 0,232 C-34,232 -64,214 -70,172 C-76,120 -50,74 -18,54 Z'));
    ctx.fillStyle = LIGHT;
    ctx.fill(pth('M-34,108 L-22,96 L-10,108 L-22,120Z M10,108 L22,96 L34,108 L22,120Z M-12,152 L0,140 L12,152 L0,164Z M-42,158 L-32,148 L-22,158 L-32,168Z M22,158 L32,148 L42,158 L32,168Z'));
    ctx.fillRect(-20, 42, 40, 3);
    ctx.restore();
    const m = new DOMMatrix().translateSelf(x, y).rotateSelf(sw * 57.3).scaleSelf(s, s).transformPoint(new DOMPoint(0, 226));
    return { x: m.x, y: m.y, a: sw };
  }

  // ── el hilo: lo único saturado además de la luz ──
  function smooth(ctx, pts) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } const l = pts[pts.length - 1]; ctx.lineTo(l[0], l[1]); }
  function thread(ctx, pts, o = {}) {
    if (!pts || pts.length < 2) return;
    let P2 = pts;
    if (o.p !== undefined && o.p < 1) { const n = Math.max(2, Math.ceil(pts.length * Math.max(0.001, o.p))); P2 = pts.slice(0, n); }
    const w = o.w ?? 9, col = o.col || THREAD;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(30,4,4,0.72)'; ctx.lineWidth = w + 5; ctx.beginPath(); smooth(ctx, P2); ctx.stroke();
    ctx.shadowColor = col; ctx.shadowBlur = o.glow ?? 18; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); smooth(ctx, P2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,150,150,0.5)'; ctx.lineWidth = Math.max(1.5, w * 0.22); ctx.beginPath(); smooth(ctx, P2); ctx.stroke();
    ctx.restore();
  }
  const hang = (x, y, len, t, ph = 0, amp = 1, n = 16) => Array.from({ length: n }, (_, i) => { const q = i / (n - 1); return [x + Math.sin(t * 1.3 + ph + q * 1.7) * 26 * amp * q * q, y + len * q]; });
  const sag = (a, b, depth, t, n = 20, wob = 3) => Array.from({ length: n }, (_, i) => { const q = i / (n - 1); return [lerp(a[0], b[0], q), lerp(a[1], b[1], q) + depth * 4 * q * (1 - q) + Math.sin(t * 1.4 + q * 7) * wob * Math.sin(q * 3.14)]; });
  const onFloor = (a, b, y, t, n = 26, amp = 5) => Array.from({ length: n }, (_, i) => { const q = i / (n - 1), rise = Math.min(1, Math.min(q, 1 - q) * 9); return [lerp(a[0], b[0], q), lerp(lerp(a[1], b[1], q), y + Math.sin(q * 19 + t * 0.7) * amp, rise)]; });
  function knot(ctx, x, y, r = 11) { ctx.save(); ctx.shadowColor = THREAD; ctx.shadowBlur = 14; ctx.fillStyle = THREAD; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }

  // ── personajes: títeres articulados en perfil, mirando a +x, pies en (0,0), alto ≈ 560 ──
  const HEAD = pth('M-22,4 C-30,-18 -46,-36 -46,-68 C-46,-102 -18,-120 8,-118 C28,-116 40,-102 42,-86 L58,-62 C60,-57 55,-55 47,-55 L47,-47 L42,-43 L45,-35 C45,-22 33,-16 21,-18 L19,4 Z');
  const HEADS = {
    round: HEAD,
    fine: pth('M-14,4 C-20,-14 -40,-34 -42,-66 C-44,-100 -18,-118 8,-116 C24,-114 34,-104 38,-86 L46,-66 C47,-62 44,-61 39,-60 L41,-52 L37,-48 L39,-42 C38,-28 28,-20 16,-20 L14,4 Z'),
    child: pth('M-16,3 C-34,-10 -44,-34 -40,-58 C-36,-86 -10,-96 12,-90 C30,-86 40,-70 38,-54 L46,-44 C46,-40 42,-40 37,-39 L36,-30 C32,-18 22,-12 12,-12 L12,3 Z'),
  };
  const HATS = {
    none: null,
    scholar: pth('M-50,-68 C-54,-112 -30,-144 4,-144 C36,-144 48,-120 47,-90 C20,-98 -18,-92 -50,-68 Z M-44,-90 C-72,-92 -100,-78 -118,-50 L-106,-42 C-88,-62 -64,-72 -42,-74 Z M-44,-74 C-66,-70 -88,-52 -98,-26 L-86,-22 C-76,-44 -60,-56 -40,-62 Z'),
    elder: pth('M-30,-108 C-38,-134 -14,-156 8,-148 C26,-140 22,-120 8,-110 Z M-34,-146 L28,-122 L30,-127 L-32,-151 Z M-48,-62 C-52,-100 -26,-124 6,-120 C2,-104 -24,-92 -48,-62Z'),
    cloth: pth('M-48,-64 C-54,-110 -22,-132 8,-128 C30,-124 46,-110 46,-94 C20,-100 -14,-94 -48,-64 Z M-46,-92 C-64,-96 -82,-84 -86,-66 L-74,-64 C-70,-76 -58,-82 -44,-78 Z'),
    bun: pth('M-48,-60 C-54,-104 -24,-126 8,-122 C28,-120 40,-108 42,-94 C14,-100 -16,-90 -48,-60 Z M-44,-74 C-70,-92 -82,-60 -66,-44 C-54,-34 -40,-44 -38,-58 Z'),
    tall: pth('M-44,-92 L-38,-176 L42,-176 L46,-96 C14,-104 -14,-100 -44,-92 Z M-122,-132 L-40,-128 L-40,-118 L-122,-124 Z M-122,-148 L-112,-148 L-112,-108 L-122,-108 Z'),
    updo: pth('M-30,-16 C-54,-40 -60,-84 -46,-110 C-36,-128 -12,-134 10,-128 C-2,-140 -2,-160 14,-168 C34,-176 50,-160 46,-142 C44,-134 38,-128 32,-122 C34,-118 34,-114 34,-110 C20,-118 -4,-112 -14,-90 C-22,-70 -22,-40 -30,-16 Z M-26,-150 L60,-178 L62,-173 L-24,-145 Z'),
    twin: pth('M-40,-44 C-46,-78 -20,-96 10,-90 C-6,-86 -22,-70 -40,-44 Z M-22,-92 a15,15 0 1,1 .1,0 Z M16,-96 a13,13 0 1,1 .1,0 Z'),
  };
  const ROBE = {
    long: pth('M-20,-436 C-52,-420 -62,-380 -66,-300 C-70,-210 -86,-100 -112,-14 Q-116,2 -100,2 L66,2 Q84,2 80,-14 C62,-90 52,-190 52,-290 C52,-370 44,-420 22,-436 Z'),
    broad: pth('M-24,-436 C-70,-420 -86,-370 -92,-300 C-98,-210 -112,-100 -130,-14 Q-132,2 -116,2 L86,2 Q102,2 98,-14 C92,-100 92,-170 84,-250 C76,-340 56,-420 26,-436 Z'),
    gown: pth('M-16,-436 C-44,-420 -50,-384 -50,-310 C-50,-260 -46,-240 -56,-180 C-68,-110 -100,-50 -142,-10 Q-150,2 -130,2 L60,2 Q78,2 72,-12 C56,-80 42,-160 40,-230 C40,-262 46,-300 44,-340 C42,-390 36,-420 18,-436 Z'),
    seated: pth('M-20,-436 C-60,-420 -80,-360 -84,-280 C-88,-220 -100,-150 -108,-60 Q-110,-30 -84,-30 L70,-30 L86,130 Q88,150 104,150 L150,150 Q166,150 160,132 L146,-60 C144,-90 120,-112 80,-120 L44,-128 C50,-200 50,-330 22,-436 Z'),
    tunic: pth('M-18,-336 C-48,-322 -54,-290 -56,-240 C-58,-196 -66,-166 -76,-138 L66,-138 C58,-168 50,-200 50,-246 C50,-292 42,-322 18,-336 Z'),
  };
  const LACE = {
    long: 'M-90,-52 l9,-11 l9,11 l-9,11Z M-62,-52 l9,-11 l9,11 l-9,11Z M-34,-52 l9,-11 l9,11 l-9,11Z M-6,-52 l9,-11 l9,11 l-9,11Z M22,-52 l9,-11 l9,11 l-9,11Z M46,-52 l8,-10 l8,10 l-8,10Z M-40,-340 a7,7 0 1,0 .1,0Z M-40,-300 a7,7 0 1,0 .1,0Z M-44,-260 a7,7 0 1,0 .1,0Z M-48,-220 a7,7 0 1,0 .1,0Z M-54,-180 a7,7 0 1,0 .1,0Z',
    broad: 'M-110,-50 l9,-11 l9,11 l-9,11Z M-80,-50 l9,-11 l9,11 l-9,11Z M-50,-50 l9,-11 l9,11 l-9,11Z M-20,-50 l9,-11 l9,11 l-9,11Z M10,-50 l9,-11 l9,11 l-9,11Z M40,-50 l9,-11 l9,11 l-9,11Z M64,-50 l9,-11 l9,11 l-9,11Z M-30,-220 a12,12 0 1,0 .1,0Z M10,-220 a12,12 0 1,0 .1,0Z M-30,-180 a12,12 0 1,0 .1,0Z M10,-180 a12,12 0 1,0 .1,0Z',
    gown: 'M-110,-46 l9,-11 l9,11 l-9,11Z M-80,-46 l9,-11 l9,11 l-9,11Z M-50,-46 l9,-11 l9,11 l-9,11Z M-20,-46 l9,-11 l9,11 l-9,11Z M10,-46 l9,-11 l9,11 l-9,11Z M38,-46 l8,-10 l8,10 l-8,10Z M-24,-160 a8,8 0 1,0 .1,0Z M-8,-110 a8,8 0 1,0 .1,0Z M-40,-100 a8,8 0 1,0 .1,0Z',
    seated: 'M-70,-56 l8,-10 l8,10 l-8,10Z M-44,-56 l8,-10 l8,10 l-8,10Z M-18,-56 l8,-10 l8,10 l-8,10Z M8,-56 l8,-10 l8,10 l-8,10Z M34,-56 l8,-10 l8,10 l-8,10Z M60,-56 l8,-10 l8,10 l-8,10Z M-40,-340 a7,7 0 1,0 .1,0Z M-44,-290 a7,7 0 1,0 .1,0Z M-50,-240 a7,7 0 1,0 .1,0Z',
    tunic: 'M-44,-164 l8,-10 l8,10 l-8,10Z M-18,-164 l8,-10 l8,10 l-8,10Z M8,-164 l8,-10 l8,10 l-8,10Z M34,-164 l7,-9 l7,9 l-7,9Z',
  };
  const BELT = { long: [-62, -256, 112, 10], broad: [-88, -270, 170, 12], gown: [-44, -318, 86, 9], seated: [-66, -256, 112, 10], tunic: [-54, -236, 102, 9] };
  const SHOE = pth('M-30,1 L26,1 C38,1 50,-6 56,-20 L46,-22 C38,-12 22,-22 -22,-22 C-30,-22 -32,-8 -30,1 Z');
  const UPPER = pth('M-18,-4 Q0,-16 18,-4 L14,102 Q0,110 -14,102 Z');
  const FORE = pth('M-13,0 L13,0 L10,88 L-10,88 Z');
  const SLEEVE = pth('M-13,8 C-44,34 -58,84 -46,122 C-26,118 -10,106 -9,88 Z');
  const FIST = pth('M-10,86 L10,86 C14,96 13,110 4,114 L-6,114 C-13,108 -13,96 -10,86 Z');
  const POINTER = pth('M-10,86 L10,86 L9,104 L3,140 L-3,140 L-7,110 Z');
  const THIGH = pth('M-22,0 L22,0 L15,96 L-15,96 Z'), SHIN = pth('M-14,0 L14,0 L10,92 L-10,92 Z M-12,86 L34,88 C40,92 40,100 34,102 L-12,102 Z');

  const SPECS = {
    scholar: { robe: 'long', hat: 'scholar', eye: 1 },
    elder:   { robe: 'long', hat: 'elder', eye: 1, beard: 150, hunch: 7 },
    worker:  { robe: 'tunic', hat: 'cloth', eye: 1, wide: false },
    woman:   { robe: 'gown', hat: 'bun', eye: 1, narrow: true },
    lady:    { robe: 'gown', hat: 'updo', face: 'fine', eye: 1, narrow: true },
    official:{ robe: 'broad', hat: 'tall', eye: 1, beard: 66 },
  };
  function spec(base, extra) { return Object.assign({}, SPECS[base] || SPECS.scholar, extra); }

  // pose: {x,y,s,flip,lean,head,aF:[hombro,codo],aB:[hombro,codo],step,legs:[[m,r],[m,r]],bob,point,prop,rods,pin}
  // Ángulos en grados: 0 = hacia abajo, 90 = hacia adelante, 180 = hacia arriba.
  function figure(ctx, sp, pose) {
    const short = sp.robe === 'tunic', neckY = short ? -340 : -440, s = pose.s ?? 1, an = {};
    const base = ctx.getTransform(), inv = base.inverse();
    const rec = (k, x, y) => { const p = inv.multiply(ctx.getTransform()).transformPoint(new DOMPoint(x, y)); an[k] = [p.x, p.y]; };
    ctx.save(); ctx.translate(pose.x, (pose.y ?? FLOOR + 4) - (pose.bob || 0)); ctx.scale(s * (pose.flip ? -1 : 1), s);
    ctx.fillStyle = INK;
    const soft = () => { ctx.shadowColor = 'rgba(24,6,4,0.55)'; ctx.shadowBlur = 16 * s; };
    const hard = () => { ctx.shadowBlur = 0; };
    const lean = ((pose.lean || 0) + (sp.hunch || 0)) * D2R;
    const holes = (d) => { hard(); ctx.fillStyle = LIGHT; ctx.fill(typeof d === 'string' ? pth(d) : d); ctx.fillStyle = INK; };

    function arm(a, pointer, front, prop) {
      ctx.save(); ctx.translate(front ? 6 : -4, neckY + 36);
      ctx.rotate(-(a ? a[0] : 8) * D2R); soft(); ctx.fill(UPPER);
      ctx.translate(0, 98); ctx.rotate(-(a ? a[1] : 12) * D2R); ctx.fill(FORE); if (sp.robe !== 'tunic') ctx.fill(SLEEVE);
      ctx.fill(pointer ? POINTER : FIST); hard();
      rec(front ? 'hand' : 'hand2', 0, 110);
      if (prop) { ctx.save(); ctx.translate(0, 110); prop(ctx); ctx.restore(); }
      if (front) { ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, TAU); ctx.fill(); ctx.fillStyle = INK; }
      ctx.restore();
    }
    function leg(l, front) {
      ctx.save(); ctx.translate(front ? 6 : -6, -176); ctx.rotate(-(l ? l[0] : 0) * D2R); soft(); ctx.fill(THIGH);
      ctx.translate(0, 92); ctx.rotate(-(l ? l[1] : 0) * D2R); ctx.fill(SHIN); hard(); rec(front ? 'foot' : 'foot2', 0, 92); ctx.restore();
    }

    if (short) { leg(pose.legs && pose.legs[1], false); }
    ctx.save(); ctx.rotate(lean);
    arm(pose.aB, false, false, pose.propB);
    ctx.restore();
    if (short) leg(pose.legs && pose.legs[0], true);
    else if (sp.robe !== 'seated') {                                                                  // zapatos bajo la túnica
      const st = (pose.step || 0) * 40;
      ctx.save(); ctx.translate(-16 - st, 0); ctx.fill(SHOE); ctx.restore();
      ctx.save(); ctx.translate(20 + st, 0); ctx.fill(SHOE); ctx.restore();
    }
    rec('foot', 34 + (pose.step || 0) * 40, -12);
    rec('hem', 62, -10);
    ctx.save(); ctx.rotate(lean);
    if (!short && pose.step) ctx.transform(1, 0, Math.sin((pose.step || 0)) * 0.018, 1, 0, 0);
    soft(); ctx.fill(ROBE[sp.robe]); hard();
    holes(LACE[sp.robe]);
    { const b = BELT[sp.robe]; ctx.fillStyle = LIGHT; ctx.fillRect(b[0], b[1], b[2], b[3]); ctx.fillStyle = INK; }
    // cabeza
    ctx.save(); ctx.translate(2, neckY + 2); ctx.rotate(-(pose.head || 0) * D2R); ctx.scale(sp.headS || 1, sp.headS || 1);
    soft(); ctx.fill(HEADS[sp.face || 'round']); hard();
    if (sp.beard) { ctx.save(); ctx.translate(26, -26); ctx.rotate(Math.sin((pose.t || 0) * 1.6) * 0.05); ctx.fill(pth(`M2,0 C14,${sp.beard * 0.3} 6,${sp.beard * 0.7} -8,${sp.beard} C-14,${sp.beard * 0.6} -14,${sp.beard * 0.25} -16,4 Z`)); ctx.restore(); }
    const hat = HATS[sp.hat]; if (hat) ctx.fill(hat);
    if (sp.eye === 1) { ctx.fillStyle = LIGHT; ctx.beginPath(); ctx.ellipse(25, -76, 6.5, pose.blink ? 1 : 4.2, -0.1, 0, TAU); ctx.fill(); ctx.fillStyle = INK; }
    if (sp.eye === 0) { ctx.fillStyle = LIGHT; ctx.fillRect(16, -77, 18, 2.6); ctx.fillStyle = INK; }
    rec('head', 40, -80);
    if (pose.front) { ctx.save(); pose.front(ctx); ctx.restore(); }
    ctx.restore();
    arm(pose.aF, pose.point, true, pose.prop);
    ctx.restore();
    ctx.restore();
    // varillas de los títeres
    if (pose.rods !== false) {
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const k of pose.rods === 'both' ? ['hand', 'hand2'] : ['hand']) if (an[k] && an[k][1] < FLOOR) { ctx.beginPath(); ctx.moveTo(an[k][0], an[k][1]); ctx.lineTo(an[k][0] + (k === 'hand' ? 16 : -14) * (pose.flip ? -1 : 1), FLOOR + 60); ctx.stroke(); }
      ctx.restore();
    }
    return an;
  }
  // ciclos de caminar y correr (deterministas): phase en radianes
  const walkLong = (ph) => ({ step: Math.sin(ph) * 0.9, bob: Math.abs(Math.cos(ph)) * 7, lean: 3 + Math.sin(ph * 2) * 0.6, aF: [8 + Math.sin(ph) * 13, 18], aB: [8 - Math.sin(ph) * 13, 18] });
  const runCycle = (ph) => {
    const sw = Math.sin(ph), k = Math.cos(ph);
    return { legs: [[sw * 52 + 8, -(30 + 58 * Math.max(0, -k))], [-sw * 52 + 8, -(30 + 58 * Math.max(0, k))]], bob: Math.abs(k) * 20 - 10, lean: 13, aF: [-sw * 58 + 12, 78], aB: [sw * 58 + 12, 78], head: -4 };
  };
  const walkShort = (ph) => {
    const sw = Math.sin(ph), k = Math.cos(ph);
    return { legs: [[sw * 24, -(6 + 22 * Math.max(0, -k))], [-sw * 24, -(6 + 22 * Math.max(0, k))]], bob: Math.abs(k) * 6, lean: 4, aF: [-sw * 20 + 8, 22], aB: [sw * 20 + 8, 22] };
  };
  // gira un títere sobre su varilla: devuelve la escala X (±) para una vuelta de papel entre t0 y t0+d
  const turnScale = (t, t0, d) => { const q = prog(t, t0, d); return Math.cos(q * Math.PI); };

  // ── textos ──
  function bigText(ctx, lines, o) {
    const size = o.size || 170, lead = o.lead || size * 1.02, font = `900 ${size}px Figtree, Inter, sans-serif`;
    ctx.save(); ctx.font = font; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    let ci = 0;
    lines.forEach((ln, li) => {
      const y = o.y + li * lead, tw = ctx.measureText(ln).width, x0 = (o.x ?? 540) - tw / 2;
      for (let i = 0; i < ln.length; i++) {
        const ch = ln[i], px = x0 + ctx.measureText(ln.slice(0, i)).width, cw = ctx.measureText(ch).width; ci++;
        if (ch === ' ') continue;
        const a = o.vis ? o.vis(ci - 1, li, i) : 1; if (a <= 0) continue;
        const rt = (hash(ci * 3.1 + (o.seed || 0)) - 0.5) * 3.6 * D2R + Math.sin((o.t || 0) * 0.9 + ci) * 0.5 * D2R, dy = (hash(ci * 7.7 + (o.seed || 0)) - 0.5) * 8 + Math.sin((o.t || 0) * 1.1 + ci * 0.7) * 1.6;
        const rise = (1 - backOut(a)) * 46;
        ctx.save(); ctx.translate(px + cw / 2, y + dy + rise); ctx.rotate(rt); ctx.globalAlpha = Math.min(1, a * 1.6) * (o.alpha ?? 1);
        if (o.scale) ctx.scale(o.scale, o.scale);
        ctx.fillStyle = 'rgba(30,8,4,0.8)'; ctx.fillText(ch, -cw / 2 + 5, 8);
        ctx.fillStyle = o.color || CREAM; ctx.fillText(ch, -cw / 2, 0);
        ctx.restore();
      }
    });
    ctx.restore();
  }
  // Subtítulos: frases por índice de palabra, palabra a palabra, en la franja oscura bajo la pantalla (arriba de y = 1400).
  function captions(ctx, t, phrases, o = {}) {
    const start = o.start || (i => WORDS[i].s), lead = o.lead ?? 0.1, size = o.size || 62, lh = size * 1.14, red = o.red || new Set(), em = o.em || new Set();
    let ph = null, pi = -1;
    for (let i = 0; i < phrases.length; i++) if (t >= start(phrases[i][0]) - lead - 0.05) { ph = phrases[i]; pi = i; }
    if (!ph || ph[3] === 'off') return;
    const last = ph[1], nxt = phrases[pi + 1], outT = nxt ? Math.min(start(nxt[0]) - lead - 0.05, WORDS[last].e + (o.hold ?? 1.1)) : 1e9;
    if (t > outT) return;
    const fade = 1 - prog(t, outT - 0.14, 0.14);
    ctx.save(); ctx.textBaseline = 'alphabetic';
    const wr = []; for (let i = ph[0]; i <= last; i++) wr.push({ i, w: WORDS[i].w });
    const fnt = (i) => `${em.has(i) ? 900 : 700} ${size}px Figtree, Inter, sans-serif`, spw = size * 0.27;
    for (const x of wr) { ctx.font = fnt(x.i); x.wd = ctx.measureText(x.w).width; }
    const wid = a2 => a2.reduce((q, x) => q + x.wd, 0) + (a2.length - 1) * spw, maxW = o.maxW || 940;
    let lines = [wr];
    if (wid(wr) > maxW) {                                   // dos líneas parejas: nunca una palabra huérfana
      let bk = 1, bd = 1e9; for (let k = 1; k < wr.length; k++) { const d = Math.abs(wid(wr.slice(0, k)) - wid(wr.slice(k))); if (d < bd) { bd = d; bk = k; } }
      lines = [wr.slice(0, bk), wr.slice(bk)];
    }
    const y0 = (o.y ?? 1352) - (lines.length - 1) * lh * 0.5 + (lines.length === 1 ? 14 : 0);
    lines.forEach((ln, k) => {
      const tw = ln.reduce((a, x) => a + x.wd, 0) + (ln.length - 1) * spw; let x = 540 - tw / 2;
      for (const q of ln) {
        const a = prog(t, start(q.i) - lead, 0.12);
        ctx.font = fnt(q.i); ctx.globalAlpha = lerp(o.dim ?? 0.26, 1, a) * fade; ctx.fillStyle = red.has(q.i) && a > 0 ? '#FF3345' : (em.has(q.i) ? '#FFFFFF' : CREAM);
        ctx.fillText(q.w, x, y0 + k * lh);
        x += q.wd + spw;
      }
    });
    ctx.restore();
  }
  // apagón breve de la lámpara: multiplica la potencia alrededor del cambio de escena tc
  const dip = (t, tc, a = 0.3, b = 0.4, floor = 0.08) => { const q = t < tc ? prog(t, tc - a, a) : 1 - prog(t, tc, b); return lerp(1, floor, q); };
  const ready = () => document.fonts.load('900 100px Figtree').then(() => document.fonts.load('700 100px Figtree'));

  return { FLOOR, LIP, TOP, INK, THREAD, CREAM, PALS, backlight, dust, frame, flat, place, mountains, roof, pagoda, house, rock, ground, stall, lantern, willow, birds, moon, sack,
    thread, hang, sag, onFloor, knot, figure, spec, SPECS, walkLong, walkShort, runCycle, turnScale, bigText, captions, dip, prog, ease, backOut, seeded, pth, ready, mk,
    light: () => LIGHT };
})();
// las fuentes de los textos se cargan antes del primer cuadro
{ const _r = SOM.ready(), _base = window.renderAt; window.renderAt = async t => { await _r; return _base(t); }; }

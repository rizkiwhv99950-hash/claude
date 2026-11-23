// ───────── SOMBRAS · piezas: utilería y decorados listos, sin tema. Cargar después de sombras.js ─────────
const SOMP = (() => {
  const S = SOM, { FLOOR, INK, prog, backOut } = S;
  // Flor (o sello, estrella de pétalos) calada: la luz pasa por el papel. p = apertura 0..1. Se usa también como pose.front.
  function flower(K, x, y, r, p) {
    if (p <= 0) return;
    K.save(); K.translate(x, y); K.shadowColor = 'rgba(255,230,170,0.9)'; K.shadowBlur = 26 * p; K.fillStyle = '#FFF0C4';
    for (let i = 0; i < 6; i++) {
      const q = backOut(prog(p, i * 0.1, 0.5));
      K.save(); K.rotate(i / 6 * TAU); K.scale(q, q); K.beginPath(); K.moveTo(0, 0); K.bezierCurveTo(r * 0.36, -r * 0.3, r * 0.4, -r * 0.92, 0, -r * 1.1); K.bezierCurveTo(-r * 0.4, -r * 0.92, -r * 0.36, -r * 0.3, 0, 0); K.fill(); K.restore();
    }
    K.shadowBlur = 0; K.fillStyle = INK; K.beginPath(); K.arc(0, 0, r * 0.2 * p, 0, TAU); K.fill(); K.restore();
  }
  const onForehead = (p, r = 15) => x => flower(x, 19, -97, r, p);
  // Bastón con gancho: devuelve el punto de cuelgue (sirve para S.sack o S.lantern).
  function staff(K, x, top) {
    K.save(); K.strokeStyle = INK; K.lineCap = 'round'; K.lineWidth = 13; K.beginPath(); K.moveTo(x, FLOOR + 6); K.bezierCurveTo(x + 10, FLOOR - 200, x - 8, top + 200, x + 8, top + 50);
    K.bezierCurveTo(x + 12, top - 8, x + 70, top - 22, x + 78, top + 22); K.stroke(); K.restore();
    return [x + 78, top + 22];
  }
  // Libro abierto en la mano (pose.prop). a = suma de ángulos del brazo, para dejarlo derecho.
  const book = a => x => {
    x.rotate(a * D2R); x.fillStyle = INK; x.fill(S.pth('M0,6 L78,-18 L78,38 L0,62 L-78,38 L-78,-18 Z'));
    x.strokeStyle = S.light(); x.lineWidth = 3; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(10, 14 + i * 14); x.lineTo(68, -6 + i * 14); x.moveTo(-10, 14 + i * 14); x.lineTo(-68, -6 + i * 14); x.stroke(); }
    x.fillStyle = INK;
  };
  // Criatura en brazos (pose.prop, con aF: [44, 88]). Tranquila y entera.
  const carried = (t, sum = 132) => x => {
    x.save(); x.rotate(sum * D2R); x.translate(-30, -16); x.fillStyle = INK;
    x.fill(S.pth('M-44,4 C-50,-26 -24,-40 8,-38 C38,-36 54,-22 54,-4 C54,14 30,24 2,24 C-22,24 -42,20 -44,4 Z'));
    x.save(); x.translate(-12 + Math.sin(t * 1.4) * 1.2, -32); x.rotate(-0.08 + Math.sin(t * 1.1) * 0.05); x.scale(0.62, 0.62);
    x.fill(S.pth('M-16,3 C-34,-10 -44,-34 -40,-58 C-36,-86 -10,-96 12,-90 C30,-86 40,-70 38,-54 L46,-44 C46,-40 42,-40 37,-39 L36,-30 C32,-18 22,-12 12,-12 L12,3 Z'));
    x.beginPath(); x.arc(-16, -98, 12, 0, TAU); x.fill(); x.fillStyle = S.light(); x.beginPath(); x.arc(20, -54, 4, 0, TAU); x.fill(); x.restore();
    x.fillStyle = S.light(); x.fill(S.pth('M-22,0 l7,-8 l7,8 l-7,8Z M0,0 l7,-8 l7,8 l-7,8Z M22,0 l6,-7 l6,7 l-6,7Z')); x.restore();
  };
  // Primer plano de perfil, de pecho para arriba. o = { flip, flower: 0..1 }. (x, y) = base del cuello.
  function bust(K, x, y, s, t, o = {}) {
    K.save(); K.translate(x, y); K.scale(o.flip ? -s : s, s); K.fillStyle = INK; K.shadowColor = 'rgba(24,6,4,0.55)'; K.shadowBlur = 30;
    K.fill(S.pth('M-14,4 C-20,-14 -40,-34 -42,-66 C-44,-100 -18,-118 8,-116 C24,-114 34,-104 38,-86 L46,-66 C47,-62 44,-61 39,-60 L41,-52 L37,-48 L39,-42 C38,-28 28,-20 16,-20 L14,4 Z'));
    K.fill(S.pth('M-30,-16 C-54,-40 -60,-84 -46,-110 C-36,-128 -12,-134 10,-128 C-2,-140 -2,-160 14,-168 C34,-176 50,-160 46,-142 C44,-134 38,-128 32,-122 C34,-118 34,-114 34,-110 C20,-118 -4,-112 -14,-90 C-22,-70 -22,-40 -30,-16 Z'));
    K.fill(S.pth('M-15,-2 L-17,24 C-60,30 -100,50 -118,110 L-132,190 L126,190 L112,110 C96,54 56,30 18,24 L16,-2 Z'));
    K.shadowBlur = 0; K.fillStyle = S.light();
    K.fill(S.pth('M-17,14 C-6,19 8,19 18,14 L18,18 C8,23 -6,23 -17,18 Z M-10,28 L2,44 L14,28 L2,70 Z M-84,92 l9,-11 l9,11 l-9,11Z M-56,92 l9,-11 l9,11 l-9,11Z M-28,92 l9,-11 l9,11 l-9,11Z M0,92 l9,-11 l9,11 l-9,11Z M28,92 l9,-11 l9,11 l-9,11Z M56,92 l9,-11 l9,11 l-9,11Z'));
    K.beginPath(); K.ellipse(20, -74, 6.5, 2.1, -0.1, 0, TAU); K.fill(); K.fillStyle = INK;
    if (o.flower) flower(K, 19, -97, 13, o.flower);
    K.restore();
  }
  // Primer plano de dos pies bajo una túnica. flip = mira a la izquierda. Tobillo para atar: (x + 72, y - 112).
  function feet(K, x, y, flip, s, t, ph = 0) {
    K.save(); K.translate(x, y + Math.sin(t * 1.2 + ph) * 2); K.scale(s * (flip ? -1 : 1), s); K.fillStyle = INK; K.shadowColor = 'rgba(24,6,4,0.55)'; K.shadowBlur = 22;
    const shoe = S.pth('M-46,-178 L44,-178 L46,-66 C96,-60 150,-40 176,-74 L196,-62 C182,-14 130,4 70,4 L-52,4 C-62,-30 -50,-110 -46,-178 Z');
    K.save(); K.translate(-90, 0); K.fill(shoe); K.restore(); K.save(); K.translate(70, 0); K.fill(shoe); K.restore();
    K.fill(S.pth('M-190,-1400 L170,-1400 C176,-700 186,-420 226,-190 Q234,-164 212,-164 L-222,-164 Q-244,-164 -238,-190 C-210,-420 -196,-700 -190,-1400 Z'));
    K.shadowBlur = 0; K.fillStyle = S.light(); K.fill(S.pth('M-196,-226 l15,-18 l15,18 l-15,18Z M-146,-226 l15,-18 l15,18 l-15,18Z M-96,-226 l15,-18 l15,18 l-15,18Z M-46,-226 l15,-18 l15,18 l-15,18Z M4,-226 l15,-18 l15,18 l-15,18Z M54,-226 l15,-18 l15,18 l-15,18Z M104,-226 l15,-18 l15,18 l-15,18Z M154,-226 l13,-16 l13,16 l-13,16Z')); K.restore();
  }
  // Arco de lunas que se encienden para contar tiempo. n, t0 y d se eligen; (cuántas lunas = lo que diga el guion).
  function moonArc(K, t, n, t0, d, o = {}) {
    for (let i = 0; i < n; i++) {
      const q = i / (n - 1), a = lerp(Math.PI * 1.08, Math.PI * 1.92, q), x = 540 + Math.cos(a) * (o.rx || 448), y = (o.cy || 860) + Math.sin(a) * (o.ry || 620), p = backOut(prog(t, t0 + q * d, 0.26));
      if (p <= 0.01) continue;
      const ph = lerp(-1.6, 1.6, q);
      S.moon(K, x, y + (1 - p) * 40, (o.r || 38) * p, t, { phase: Math.abs(ph) < 0.1 ? 3 : ph, shade: 'rgba(84,26,12,0.95)' });
      K.fillStyle = INK; K.fillRect(x - 1.5, y + 40 * p, 3, FLOOR - y);
    }
  }
  // Sombra gigante y borrosa: alguien se aleja hacia la lámpara. go = 0..1. Sirve para sugerir sin mostrar.
  function bigShadow(K, sp, pose, go) {
    K.save(); K.globalAlpha = 0.5 * Math.min(1, go * 3) * (1 - prog(go, 0.85, 0.15)); K.filter = `blur(${Math.round(4 + go * 16)}px)`;
    S.figure(K, sp, Object.assign({}, pose, { s: lerp(pose.s || 1, 3.4, go), y: FLOOR + 20 + go * 400, rods: false })); K.filter = 'none'; K.restore();
  }
  // Decorados: devuelven una imagen ya pintada; se colocan con S.place(K, img, x, y, alpha).
  const flats = {
    ground: () => S.flat('ground', 3600, 560, (x, w) => S.ground(x, 60, w, 5)),          // S.place(K, f, -600, FLOOR - 60)
    far: () => S.flat('far', 1800, 620, (x, w, h) => S.mountains(x, w, h, 7, 7), { blur: 4 }),   // alpha 0.17
    mid: () => S.flat('mid', 2000, 520, (x, w, h) => S.mountains(x, w, h, 21, 6, 0.3, 0.75), { blur: 2 }),  // alpha 0.3
    town: () => S.flat('town', 2600, 720, (x, w, h) => { const y = h - 8; S.pagoda(x, 420, y, 5, 210); [[120, 240, 110, 1], [900, 280, 130, 2], [1240, 230, 110, 1], [1560, 300, 140, 2], [2080, 260, 120, 2], [2420, 280, 130, 2]].forEach(a => S.house(x, a[0], y, a[1], a[2], a[3])); S.pagoda(x, 1860, y, 3, 150); }, { blur: 1 }),
    market: () => S.flat('market', 2800, 680, (x, w, h) => { const y = h - 8; [[300, 320, 380], [760, 280, 340], [1180, 330, 400], [1640, 300, 360], [2100, 340, 390], [2520, 280, 350]].forEach((a, i) => S.stall(x, a[0], y, a[1], a[2], i + 1)); }, { blur: 1.2 }),  // alpha 0.5
    roofs: () => S.flat('roofs', 2800, 420, (x, w, h) => { for (let i = 0; i < 9; i++) S.house(x, 120 + i * 320, h - 8, 280 + (i % 3) * 30, 100 + (i % 2) * 40, 2); }, { blur: 3 }),  // alpha 0.3
    hall: () => S.flat('hall', 1200, 1200, (x, w) => { x.fillRect(120, 300, 46, 900); x.fillRect(w - 166, 300, 46, 900); x.fillRect(90, 330, w - 180, 34); S.roof(x, w / 2, 290, 980, 210); for (let i = 0; i < 12; i++) x.fillRect(180 + i * 76, 364, 3, 120 + (i % 2) * 34); }, { blur: 0.6 }),  // S.place(K, f, -60, 4, 0.92)
    // Pared traslúcida con ventana redonda: detrás se dibuja S.moon(K, 540, 552, 276, t), y adentro de la luna, escenas chicas (recuerdos, sueños).
    room: () => S.flat('room', 1200, 1300, (x, w, h) => {
      x.save(); x.fillStyle = 'rgba(23,7,5,0.3)'; x.fillRect(0, 0, w, h); x.restore();
      x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(w / 2, 552, 276, 0, TAU); x.fill(); x.restore();
      x.lineWidth = 22; x.beginPath(); x.arc(w / 2, 552, 288, 0, TAU); x.stroke();
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; x.save(); x.translate(w / 2 + Math.cos(a) * 288, 552 + Math.sin(a) * 288); x.rotate(a); x.fillRect(-14, -8, 28, 16); x.restore(); }
      x.fillRect(0, 150, w, 16); for (let i = 0; i < 2; i++) x.fillRect(100 + i * 960, 150, 30, 1100);
    }),  // S.place(K, f, -60, 0, 0.92)
  };
  // Motor mínimo de escenas: escenas = [{ from, lamp(t), cam(t), draw(K,t), top(K,t) }]; cortes = tiempos con apagón de lámpara.
  function teatro(escenas, cortes, cap) {
    return {
      noHeadline: () => true, noChrome: true, label: '',
      back(T, K, t) {
        let cur = escenas[0]; for (const s of escenas) if (t >= s.from) cur = s;
        const lamp = cur.lamp ? cur.lamp(t) : {}; let pw = lamp.power ?? 1;
        for (const c of cortes || []) pw *= S.dip(t, c, 0.22, 0.34, 0.14);
        S.backlight(K, t, Object.assign({}, lamp, { power: pw }));
        const cam = cur.cam ? cur.cam(t) : {};
        K.save(); K.translate(540, 720); K.scale(cam.z || 1, cam.z || 1); K.translate(-(cam.x ?? 540), -(cam.y ?? 720)); cur.draw(K, t); K.restore();
        K.fillStyle = `rgba(16,5,4,${Math.max(0, 1 - pw * 1.3) * 0.86})`; K.fillRect(0, 0, W, H);
        if (cur.top) cur.top(K, t);
        S.frame(K, t, pw);
        if (cap) S.captions(K, t, cap.frases, cap.opciones || {});
      },
    };
  }
  return { flower, onForehead, staff, book, carried, bust, feet, moonArc, bigShadow, flats, teatro };
})();

// ═════════════ "Dikejar" · shadow theater ═════════════
// A paper shadow play about chasing: she walks ahead, he runs after, tied by one red thread (the only colour: the bond).
// Married, she turns her back but peeks; her own shadow on the wall opens its arms while she says "go"; he almost
// leaves, comes back and asks again; he brings warm tea and sits beside her; at the end she waits like a queen and he
// arrives first, bowing with a paper flower. Silhouettes and light only.
(() => {
  const S = SOM, F2 = SOMP.flats, { FLOOR, INK, prog, backOut } = S;
  const D = D2R;
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  // ── word cues (indices from build/word_index.txt) ──
  const w = i => WORDS[i].s;
  const T = {
    perempuan: w(3), dikejar: w(5), laki: w(6), mengejar: w(8),
    jadi: w(9), menikah: w(13), istrimu: w(15), aku: w(17), ngomong: w(20), belum: w(24), menghindar: w(27), bisa: w(28), menunggu: w(32), dikejar2: w(33),
    perempuan2: w(34), bilang: w(37), bukan: w(40), maunya: w(41), nggak: w(42), sering: w(45),
    makanya: w(46), jangan: w(47), pergi: w(49), datang: w(50), tanya: w(51), kalau: w(54), serius: w(57), hormati: w(58),
    mengejar2: w(59), hadir: w(63), bawakan: w(64), teh: w(65), duduk: w(67), biar: w(70), situ: w(76),
    biar2: w(77), terhormat: w(80), ratu: w(83), dan: w(84), malu: w(91), datang2: w(92), duluan: w(93), paling: w(97), butuh: w(98), namanya: w(99), cowok: w(101),
  };
  const S2 = T.jadi - 0.1, S3 = T.perempuan2 - 0.7, S4 = T.makanya - 0.1, S5 = T.mengejar2 - 0.1, S6 = T.biar2 - 0.1;

  // ── sound: few cues, on the words ──
  cue(T.laki, 'swoosh', -8);
  cue(T.mengejar, 'thud', -8);
  cue(S2 - 0.1, 'whoosh', -10);
  cue(T.menikah, 'shimmer', -10);
  cue(T.aku, 'thud', -8);
  cue(T.menghindar, 'swoosh', -12);
  cue(T.bilang, 'thud', -8);
  cue(T.bukan, 'shimmer', -12);
  cue(S4 - 0.1, 'whoosh', -10);
  cue(T.pergi, 'swoosh', -10);
  cue(T.hormati, 'thud', -12);
  cue(T.hadir, 'shimmer', -10);
  cue(T.duduk, 'thud', -12);
  cue(S6 - 0.1, 'whoosh', -10);
  cue(T.ratu, 'shimmer', -8);
  cue(T.paling, 'shimmer', -10);
  cue(T.cowok, 'ding', -10);

  // ── cast ──
  const HER = S.spec('lady');
  const HER_SEATED = S.spec('lady', { robe: 'seated' });
  const HIM = S.spec('worker', { hat: 'cloth' });
  const HIM_ROBE = S.spec('scholar');
  const HIM_SEATED = S.spec('scholar', { robe: 'seated' });

  // a puppet that can turn on its rod: turn = S.turnScale value (+1 normal, -1 turned around)
  function smFig(K, sp, pose, turn = 1) {
    const sx = Math.max(0.06, Math.abs(turn));
    K.save();
    K.translate(pose.x, 0);
    K.scale(sx, 1);
    K.translate(-pose.x, 0);
    const an = S.figure(K, sp, Object.assign({}, pose, { flip: turn < 0 ? !pose.flip : pose.flip }));
    K.restore();
    return an;
  }

  // standard backdrop: soft far hills, middle hills, ground, a moon
  function smOutdoor(K, t, o = {}) {
    S.place(K, F2.far(), -300 + (o.px || 0) * 0.3, FLOOR - 560, 0.17);
    if (o.moon !== false) S.moon(K, o.mx ?? 800, o.my ?? 560, o.mr ?? 110, t, o.moonOpt || {});
    if (o.birds) S.birds(K, 900 - (t - o.birds) * 70, 520, 0.8, t);
    S.place(K, F2.mid(), -500 + (o.px || 0) * 0.6, FLOOR - 420, 0.28);
    S.place(K, F2.ground(), -600 + (o.px || 0), FLOOR - 60);
  }

  // the red thread between two points, sagging and breathing
  function smThread(K, a, b, t, o = {}) {
    if (!a || !b) return;
    const depth = o.depth ?? 60;
    S.thread(K, S.sag(a, b, depth, t, 22, o.wob ?? 3), { w: o.w || 7, p: o.p ?? 1, glow: o.glow ?? 0.6 });
  }

  // a teacup with rising steam, held in the hand (pose.prop)
  const smTea = t => x => {
    x.save();
    x.rotate(-70 * D);
    x.fillStyle = INK;
    x.fill(S.pth('M-30,-10 L30,-10 L24,26 Q0,34 -24,26 Z'));
    x.fill(S.pth('M28,-2 C46,-4 48,18 26,16 L26,10 C38,10 38,2 28,4 Z'));
    x.fillRect(-38, 28, 76, 6);
    x.strokeStyle = 'rgba(23,7,5,0.55)';
    x.lineWidth = 5;
    x.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const u = (t * 0.7 + k / 3) % 1;
      x.globalAlpha = Math.sin(u * Math.PI) * 0.8;
      x.beginPath();
      x.moveTo(-14 + k * 14, -16 - u * 50);
      x.bezierCurveTo(-24 + k * 14, -34 - u * 50, -4 + k * 14, -44 - u * 50, -14 + k * 14, -62 - u * 50);
      x.stroke();
    }
    x.restore();
  };

  // a paper crown on her head (pose.front, head coordinates)
  const smCrown = (p, t) => x => {
    if (p <= 0) return;
    x.save();
    x.translate(0, -150 - (1 - backOut(p)) * 60);
    x.scale(p, p);
    x.fillStyle = INK;
    x.fill(S.pth('M-44,20 L-50,-28 L-26,-4 L-6,-40 L12,-4 L36,-30 L32,20 Z'));
    x.fillStyle = S.light();
    x.beginPath();
    x.arc(-6, -2, 6, 0, TAU);
    x.fill();
    x.restore();
  };

  // a paper fan of light bursting behind a big moment (cut-out rays through the screen)
  function smRays(K, x, y, t, t0, o = {}) {
    const p = prog(t, t0, 0.5) * (o.fade ? 1 - prog(t, o.fade, 0.6) : 1);
    if (p <= 0) return;
    K.save();
    K.translate(x, y);
    K.rotate(t * 0.15);
    K.globalAlpha = 0.28 * p;
    K.fillStyle = '#FFF0C4';
    for (let i = 0; i < 16; i++) {
      K.rotate(TAU / 16);
      K.beginPath();
      K.moveTo(0, 0);
      K.lineTo(-30, -(o.r || 700) * p);
      K.lineTo(30, -(o.r || 700) * p);
      K.closePath();
      K.fill();
    }
    K.restore();
  }

  // a chair/throne silhouette
  function smThrone(K, x, s) {
    K.save();
    K.translate(x, FLOOR + 4);
    K.scale(s, s);
    K.fillStyle = INK;
    K.fill(S.pth('M-70,0 L-70,-150 L-90,-160 L-90,-430 C-90,-470 -50,-480 -40,-440 L-40,-170 L110,-170 L110,0 L90,0 L90,-130 L-50,-130 L-50,0 Z'));
    K.fillStyle = S.light();
    for (let i = 0; i < 4; i++) {
      K.beginPath();
      K.arc(-65, -400 + i * 60, 7, 0, TAU);
      K.fill();
    }
    K.restore();
  }

  // a low table with two cups (for sitting together)
  function smTable(K, x, t) {
    K.save();
    K.translate(x, FLOOR + 4);
    K.fillStyle = INK;
    K.fillRect(-90, -120, 180, 16);
    K.fillRect(-76, -104, 12, 104);
    K.fillRect(64, -104, 12, 104);
    K.fill(S.pth('M-30,-120 L-6,-120 L-10,-146 L-26,-146 Z'));
    K.restore();
  }

  const smVis = (t, t0, step = 0.035) => ci => prog(t, t0 + ci * step, 0.2);

  // ═════════════ scenes ═════════════
  const scenes = [];

  // 01 · she walks ahead, he runs after  [0 → S2]
  scenes.push({
    from: 0,
    lamp: t => ({ pal: 'dusk', pal2: 'amber', mix: cl(t / 4), cx: 560, cy: 760, power: 1 }),
    cam: t => ({ z: 1.02 + t * 0.01, x: 540, y: 760 }),
    draw(K, t) {
      smOutdoor(K, t, { px: -t * 30, birds: 0 });
      S.willow(K, 960, FLOOR, 1, t);
      // she glides in from the right, glancing back on "dikejar"
      const hx = 120 + 520 * prog(t, 0, 2.2) + Math.max(0, t - 2.2) * 45;
      const look = prog(t, T.dikejar, 0.3) * (1 - prog(t, T.laki + 0.6, 0.4));
      const her = smFig(K, HER, Object.assign(S.walkLong(t * 4), { x: hx, s: 1.02, t, flip: false, head: look * 25, aB: [10 + look * 30, 30], rods: true }), look > 0.5 ? -1 : 1);
      // he runs in from the left on "laki-laki"
      const mx = -200 + 520 * prog(t, T.laki - 0.2, 1.2) + Math.max(0, t - T.mengejar) * 30;
      let him = null;
      if (t > T.laki - 0.4) him = S.figure(K, HIM, Object.assign(S.runCycle(t * 9), { x: mx, s: 1.0, t, rods: false, aF: [80, 10] }));
      if (him && her) smThread(K, him.hand, her.hand2 || her.hand, t, { depth: 90 - 60 * prog(t, T.mengejar, 0.4), p: prog(t, T.laki, 0.6) });
      S.dust(K, t);
    },
    top(K, t) {
      if (t > T.dikejar - 0.1 && t < S2 - 0.3) S.bigText(K, ['Dikejar'], { x: 540, y: 300, size: 140, t, seed: 3, vis: smVis(t, T.dikejar - 0.1), alpha: 1 - prog(t, S2 - 0.6, 0.3) });
      if (t > T.mengejar - 0.1 && t < S2 - 0.3) S.bigText(K, ['& mengejar'], { x: 540, y: 440, size: 110, t, seed: 4, color: '#FFD9A8', vis: smVis(t, T.mengejar - 0.1), alpha: 1 - prog(t, S2 - 0.6, 0.3) });
    },
  });

  // 02 · married; she turns her back but peeks, waiting  [S2 → S3]
  scenes.push({
    from: S2,
    lamp: t => ({ pal: 'amber', pal2: 'rust', mix: 0.55 * prog(t, T.aku, 0.6) * (1 - prog(t, T.bisa, 1.2)), cx: 540, cy: 600, power: 1 - 0.25 * prog(t, T.aku, 0.5) * (1 - prog(t, T.menunggu, 0.8)) }),
    cam: t => ({ z: 1.0 + 0.06 * prog(t, T.menikah, 6), x: 540, y: 720 }),
    draw(K, t) {
      S.moon(K, 540, 552, 276, t, { phase: lerp(0.4, 1.6, prog(t, S2, 8)) });
      S.place(K, F2.room(), -60, 0, 0.92);
      const lt = SOMP.staff(K, 900, 760);
      S.lantern(K, lt[0], lt[1], 0.9, t, 1);
      // side by side on "menikah", tied by a knot
      const apart = prog(t, T.aku, 0.5) * 140;
      const turn = S.turnScale(t, T.aku - 0.05, 0.4);                     // she turns her back
      const peek = prog(t, T.menghindar, 0.4) * (1 - prog(t, T.bisa + 0.5, 0.4));
      const wait = prog(t, T.menunggu, 0.5);
      const him = S.figure(K, HIM_ROBE, { x: 360, s: 1.0, t, aF: [30 + 20 * prog(t, T.istrimu, 0.4) - 25 * prog(t, T.aku, 0.4), 30], aB: [10, 20], head: -8 * prog(t, T.aku, 0.4), lean: -3 * prog(t, T.aku, 0.4) });
      const her = smFig(K, HER, { x: 620 + apart, s: 1.0, t, flip: true, head: turn < 0 ? -peek * 30 : 0, aF: turn < 0 ? [70, 120] : [40, 20], aB: turn < 0 ? [70, 120] : [20, 20], lean: wait * 4 }, turn);
      const join = prog(t, T.menikah, 0.5);
      if (join > 0) smThread(K, him.hand, her.hand || her.hand2, t, { depth: 20 + 80 * prog(t, T.aku, 0.4) - 50 * wait, p: join, glow: 0.4 + 0.6 * wait });
      if (join > 0.5 && t < T.aku) {
        const a = him.hand, b = her.hand || her.hand2;
        if (a && b) S.knot(K, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 14, 10);
      }
      S.dust(K, t);
    },
    top(K, t) {
      if (t > T.menunggu - 0.1) S.bigText(K, ['menunggu', 'dikejar'], { x: 540, y: 250, size: 110, lead: 112, t, seed: 7, vis: smVis(t, T.menunggu - 0.1, 0.03), alpha: 1 - prog(t, S3 - 0.3, 0.25) });
    },
  });

  // 03 · she says "go", her shadow on the wall opens its arms  [S3 → S4]
  scenes.push({
    from: S3,
    lamp: t => ({ pal: 'ember', pal2: 'dusk', mix: 0.3 + 0.3 * Math.sin(t * 0.8), cx: 420, cy: 700, power: 1 }),
    cam: t => ({ z: 1.04 + 0.05 * prog(t, S3, 5), x: 540, y: 740 }),
    draw(K, t) {
      // the big soft shadow behind her tells the truth: arms open
      const truth = prog(t, T.bukan, 0.6);
      K.save();
      K.globalAlpha = 0.18 + 0.32 * truth;
      K.filter = 'blur(10px)';
      S.figure(K, HER, { x: 700, y: FLOOR + 160, s: 1.8, t, flip: true, aF: [40 + 110 * truth, 20 - 10 * truth], aB: [40 + 110 * truth, 20 - 10 * truth], head: 10 * truth, rods: false });
      K.filter = 'none';
      K.restore();
      // in front: she points away, chin up ("pergi!")
      const say = prog(t, T.bilang, 0.3);
      S.figure(K, HER, { x: 560, s: 1.08, t, flip: true, point: say > 0.5, aF: [20 + 90 * say, 10], aB: [10, 20], head: -12 * say + Math.sin(t * 2) * 2 });
      // small him at the edge, scratching his head on "nggak selalu, tapi sering"
      const shrug = prog(t, T.nggak, 0.4);
      S.figure(K, HIM, { x: 170, s: 0.72, t, aF: [150 * shrug, 120 * shrug], aB: [20, 20], head: 8 * shrug + Math.sin(t * 6) * 3 * shrug, rods: false });
      S.dust(K, t);
    },
    top(K, t) {
      if (t > T.bilang) S.bigText(K, ['"Pergi!"'], { x: 380, y: 360, size: 130, t, seed: 9, vis: smVis(t, T.bilang), alpha: 1 - prog(t, T.nggak, 0.3) });
      if (t > T.maunya - 0.1 && t < T.nggak + 0.3) S.bigText(K, ['(jangan)'], { x: 760, y: 470, size: 70, t, seed: 10, color: '#FFD9A8', vis: smVis(t, T.maunya - 0.1), alpha: 1 - prog(t, T.nggak, 0.3) });
    },
  });

  // 04 · he almost leaves, turns, comes back, asks again; then honours her answer  [S4 → S5]
  scenes.push({
    from: S4,
    lamp: t => ({ pal: 'dusk', pal2: 'amber', mix: prog(t, T.datang, 1.2) * (1 - 0.6 * prog(t, T.serius, 0.5)), cx: 640, cy: 720, power: 1 - 0.18 * prog(t, T.serius, 0.5) }),
    cam: t => ({ z: 1.02 + 0.04 * prog(t, S4, 6), x: 560, y: 760 }),
    draw(K, t) {
      smOutdoor(K, t, { mx: 300, my: 520, mr: 90 });
      const lt = SOMP.staff(K, 980, 800);
      S.lantern(K, lt[0], lt[1], 0.85, t, 2);
      // he walks away to the left, halts on "pergi", turns on "datang", walks back
      const away = prog(t, T.makanya, 1.6);
      const back = prog(t, T.datang, 0.9);
      const mx = 560 - 260 * away + 180 * back;
      const turn = S.turnScale(t, T.pergi - 0.1, 0.45);
      const walking = (t < T.pergi) || (t > T.datang && t < T.datang + 0.9);
      const bow = prog(t, T.tanya, 0.35) * (1 - prog(t, T.kalau, 0.3));
      const honour = prog(t, T.hormati, 0.4);
      const pose = Object.assign(walking ? S.walkLong(t * 5) : {}, {
        x: mx - 50 * honour, s: 1.0, t, flip: true, lean: 14 * bow + 22 * honour,
        aF: honour > 0 ? [60 + 40 * honour, 120 * honour] : [8 + 70 * bow, 20], head: 10 * bow + 15 * honour,
      });
      const him = smFig(K, HIM_ROBE, pose, turn);
      const her = S.figure(K, HER, { x: 900, s: 1.0, t, flip: true, head: -6 + 10 * prog(t, T.tanya, 0.5), aF: [20, 20], aB: [15, 15] });
      smThread(K, him.hand, her.hand2 || her.hand, t, { depth: 140 - 100 * back + 60 * honour, p: 1, glow: 0.4 + 0.5 * bow });
      S.dust(K, t);
    },
    top(K, t) {
      if (t > T.tanya - 0.1 && t < T.kalau - 0.1) S.bigText(K, ['sekali lagi?'], { x: 540, y: 330, size: 110, t, seed: 12, vis: smVis(t, T.tanya - 0.1), alpha: 1 - prog(t, T.kalau - 0.3, 0.25) });
      if (t > T.hormati - 0.1) S.bigText(K, ['hormati'], { x: 540, y: 330, size: 130, t, seed: 13, color: '#FFD9A8', vis: smVis(t, T.hormati - 0.1), alpha: 1 - prog(t, S5 - 0.3, 0.25) });
    },
  });

  // 05 · being there: warm tea, sitting beside her  [S5 → S6]
  scenes.push({
    from: S5,
    lamp: t => ({ pal: 'amber', pal2: 'ember', mix: prog(t, T.hadir, 0.8), cx: 540, cy: 700, power: 0.8 + 0.25 * prog(t, T.hadir, 0.6) }),
    cam: t => ({ z: 1.0 + 0.07 * prog(t, T.duduk, 2.5), x: 540, y: 760 }),
    draw(K, t) {
      S.moon(K, 540, 552, 276, t, { phase: 3 });
      S.place(K, F2.room(), -60, 0, 0.92);
      const lt = SOMP.staff(K, 160, 740);
      S.lantern(K, lt[0], lt[1], 0.95 + 0.15 * prog(t, T.hadir, 0.5), t, 3);
      smTable(K, 540, t);
      // she sits on the right, waiting
      const her = S.figure(K, HER_SEATED, { x: 760, s: 0.95, t, flip: true, head: -4 - 14 * prog(t, T.duduk, 0.5), aF: [40, 50], aB: [30, 40] });
      // he walks in with tea on "bawakan teh", sits on "duduk"
      const sit = prog(t, T.duduk, 0.45);
      let him;
      if (sit < 0.5) {
        const mx = -150 + 470 * prog(t, T.bawakan - 0.2, 1.3);
        him = S.figure(K, HIM_ROBE, Object.assign(t < T.bawakan + 1.1 ? S.walkLong(t * 5) : {}, { x: mx, s: 1.0, t, aF: [80, 10], prop: smTea(t), alpha: 1 - sit * 2 }));
      } else {
        him = S.figure(K, HIM_SEATED, { x: 340, s: 0.95, t, aF: [70, 40], aB: [30, 30], head: 6 + 4 * Math.sin(t * 1.2), prop: smTea(t) });
      }
      const p = prog(t, T.biar, 0.6);
      if (p > 0) smThread(K, him.hand2 || him.hand, her.hand2 || her.hand, t, { depth: 60, p, glow: 0.9 });
      S.dust(K, t, 40, 0.38);
    },
    top(K, t) {
      if (t > T.hadir - 0.1 && t < T.bawakan + 0.2) S.bigText(K, ['hadir'], { x: 540, y: 330, size: 150, t, seed: 15, vis: smVis(t, T.hadir - 0.1), alpha: 1 - prog(t, T.bawakan - 0.1, 0.3) });
    },
  });

  // 06 · she waits like a queen; he arrives first, bowing with a paper flower  [S6 → end]
  scenes.push({
    from: S6,
    lamp: t => ({ pal: 'amber', pal2: 'ember', mix: 0.4 + 0.4 * prog(t, T.ratu, 1), cx: 640, cy: 660, power: 1 }),
    cam: t => ({ z: 1.0 + 0.05 * prog(t, S6, 9), x: 560, y: 740 }),
    draw(K, t) {
      S.place(K, F2.hall(), -60, 4, 0.92);
      smRays(K, 760, 640, t, T.ratu, { r: 760 });
      smThrone(K, 790, 1.0);
      S.figure(K, HER_SEATED, { x: 800, s: 1.0, t, flip: true, head: -4 + 3 * Math.sin(t * 0.9), aF: [40, 50], aB: [30, 40], front: smCrown(prog(t, T.ratu - 0.2, 0.5), t) });
      // he runs in on "datang duluan", bows low, the flower opens on "paling butuh", shrugs on "namanya juga cowok"
      if (t > T.dan - 0.2) {
        const run = prog(t, T.datang2 - 0.2, 0.9);
        const mx = -180 + 580 * run;
        const shy = prog(t, T.malu - 0.3, 0.4) * (1 - prog(t, T.datang2, 0.3));
        const bow = prog(t, T.duluan + 0.3, 0.5) * (1 - prog(t, T.namanya, 0.4));
        const shrug = prog(t, T.namanya, 0.4);
        const flower = prog(t, T.paling, 0.6);
        const pose = Object.assign(run > 0 && run < 1 ? S.runCycle(t * 9) : {}, {
          x: t < T.datang2 - 0.2 ? -60 + 120 * prog(t, T.dan - 0.2, 0.8) : mx, s: 0.96, t, rods: false,
          lean: 30 * bow, head: -10 * shy + 20 * bow - 8 * shrug,
          aF: shrug > 0 ? [lerp(85, 160, shrug), lerp(10, 110, shrug)] : [85 * Math.max(bow, run > 0.95 ? 1 : 0), 10],
          aB: shrug > 0 ? [lerp(20, 160, shrug), lerp(20, 110, shrug)] : [20 + 40 * shy, 20 + 90 * shy],
          prop: x => SOMP.flower(x, 0, 30, 34, flower * (1 - shrug)),
        });
        S.figure(K, HIM, pose);
      }
      S.dust(K, t, 40, 0.36);
    },
    top(K, t) {
      if (t > T.ratu - 0.15 && t < T.dan + 0.4) S.bigText(K, ['seperti ratu'], { x: 540, y: 300, size: 120, t, seed: 17, vis: smVis(t, T.ratu - 0.15), alpha: 1 - prog(t, T.dan + 0.1, 0.3) });
      if (t > T.namanya - 0.1) S.bigText(K, ['Namanya', 'juga cowok'], { x: 540, y: 270, size: 120, lead: 124, t, seed: 18, color: '#FFD9A8', vis: smVis(t, T.namanya - 0.1, 0.03) });
    },
  });

  // captions: phrase by phrase in the strip under the screen
  const FRASES = [[0, 2], [3, 5], [6, 8], [9, 13], [14, 16], [17, 23], [24, 27], [28, 33], [34, 41], [42, 45], [46, 49], [50, 53], [54, 58], [59, 63], [64, 69], [70, 76], [77, 80], [81, 83], [84, 91], [92, 98], [99, 101, null, 'off']];
  SC.teatro = SOMP.teatro(scenes, [S2, S4, S6], { frases: FRASES, opciones: { hold: 1.2, em: new Set([5, 8, 32, 33, 49, 58, 63, 83, 101]) } });
})();

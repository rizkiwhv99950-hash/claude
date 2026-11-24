// ═════════════ "Curhat" · shadow theater ═════════════
// He is a guard by habit: problems make gears spin above his head. Tired after work, he hears her story about the boss
// (a little official scolding inside the moon window) as "fix my problem", jumps up with a hammer, says "resign aja";
// the light goes cold, she turns away, the red thread goes slack. Then he puts the hammer down, sits beside her,
// says "pasti capek ya", and the thread glows again. End: a paper ear lights up inside the moon.
(() => {
  const S = SOM, F2 = SOMP.flats, { FLOOR, INK, prog, backOut } = S;
  const D = D2R;
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  // ── word cues (indices from build/word_index.txt) ──
  const w = i => WORDS[i].s;
  const T = {
    cowok: w(2), malas: w(4), curhat: w(7),
    katanya: w(8), laki: w(10), penjaga: w(13), masalah: w(16), kepalanya: w(17), sibuk: w(19), keluar: w(22),
    jadi: w(23), pulang: w(26), capek: w(30), lalu: w(31), cerita: w(34), atasan: w(36), menyebalkan: w(38), dengar: w(41), kalimat: w(44), tolong: w(45),
    dia: w(48), buru: w(50), solusi: w(52), ya: w(53), resign: w(55), diam: w(59), berhenti: w(61), bingung: w(66), kesal: w(70),
    padahal: w(71), didengar: w(78), nggak: w(79), keluar2: w(83), cukup: w(84), ditemani: w(85), bilang: w(88), pasti: w(89),
    yang: w(92), sederhana: w(96), sepasang: w(97), telinga: w(98),
  };
  const S2 = T.katanya - 0.1, S3 = T.jadi - 0.1, S4 = T.dia - 0.5, S5 = T.padahal - 0.1, S6 = T.yang - 0.1;

  // ── sound: few cues, on the words ──
  cue(T.malas, 'swoosh', -12);
  cue(S2 - 0.1, 'whoosh', -10);
  cue(T.penjaga, 'thud', -8);
  cue(T.masalah, 'boom', -14);
  cue(T.kepalanya, 'click', -10);
  cue(S3 - 0.1, 'whoosh', -10);
  cue(T.pulang + 0.6, 'thud', -12);
  cue(T.atasan, 'swoosh', -12);
  cue(T.tolong, 'thud', -8);
  cue(T.solusi, 'click', -8);
  cue(T.resign, 'stamp', -8);
  cue(T.diam, 'swoosh', -12);
  cue(T.berhenti, 'thud', -12);
  cue(S5 - 0.1, 'whoosh', -10);
  cue(T.didengar, 'thud', -12);
  cue(T.ditemani, 'shimmer', -10);
  cue(T.pasti, 'shimmer', -10);
  cue(T.telinga, 'ding', -10);

  // ── cast ──
  const HER = S.spec('lady');
  const HER_SEATED = S.spec('lady', { robe: 'seated' });
  const HIM = S.spec('scholar', { hat: 'cloth' });
  const HIM_TIRED = S.spec('scholar', { hat: 'cloth', hunch: 9 });
  const HIM_SEATED = S.spec('scholar', { hat: 'cloth', robe: 'seated' });
  const GUARD = S.spec('official', { beard: 0 });
  const BOSS = S.spec('official');

  // a puppet that can turn on its rod: turn = S.turnScale value (+1 normal, -1 turned around)
  function cuFig(K, sp, pose, turn = 1) {
    const sx = Math.max(0.06, Math.abs(turn));
    K.save();
    K.translate(pose.x, 0);
    K.scale(sx, 1);
    K.translate(-pose.x, 0);
    const an = S.figure(K, sp, Object.assign({}, pose, { flip: turn < 0 ? !pose.flip : pose.flip }));
    K.restore();
    return an;
  }

  // the red thread between two puppets
  function cuThread(K, a, b, t, o = {}) {
    if (!a || !b || (o.p ?? 1) <= 0) return;
    S.thread(K, S.sag(a, b, o.depth ?? 60, t, 22, o.wob ?? 3), { w: o.w || 7, p: o.p ?? 1, glow: o.glow ?? 0.6 });
  }

  // gears spinning above his head (silhouette gears with light-holes)
  function cuGears(K, x, y, t, p, spin = 1) {
    if (p <= 0.01) return;
    const gear = (cx, cy, r, n, a) => {
      K.save();
      K.translate(cx, cy);
      K.rotate(a);
      K.fillStyle = INK;
      K.beginPath();
      for (let i = 0; i < n * 2; i++) {
        const rr = i % 2 ? r : r * 1.22, aa = i / (n * 2) * TAU;
        K.lineTo(Math.cos(aa - 0.12) * rr, Math.sin(aa - 0.12) * rr);
        K.lineTo(Math.cos(aa + 0.12) * rr, Math.sin(aa + 0.12) * rr);
      }
      K.closePath();
      K.fill();
      K.fillStyle = S.light();
      K.beginPath();
      K.arc(0, 0, r * 0.35, 0, TAU);
      K.fill();
      K.restore();
    };
    K.save();
    K.translate(x, y - (1 - backOut(p)) * 40);
    K.scale(p, p);
    gear(0, 0, 46, 8, t * 3 * spin);
    gear(70, -40, 30, 6, -t * 4.6 * spin + 0.3);
    gear(-58, -46, 24, 6, -t * 5.4 * spin);
    K.restore();
  }

  // a storm cloud with a flickering paper lightning bolt ("a problem")
  function cuStorm(K, x, y, t, p) {
    if (p <= 0.01) return;
    K.save();
    K.translate(x + Math.sin(t * 1.3) * 10, y);
    K.scale(p, p);
    K.fillStyle = INK;
    [[-60, 0, 50], [0, -24, 64], [60, 0, 48], [-20, 22, 50], [30, 20, 46]].forEach(([cx, cy, r]) => {
      K.beginPath();
      K.arc(cx, cy, r, 0, TAU);
      K.fill();
    });
    if (Math.sin(t * 9) > 0.2) {
      K.fillStyle = S.light();
      K.fill(S.pth('M-6,40 L18,40 L4,74 L22,74 L-14,130 L-2,86 L-18,86 Z'));
    }
    K.restore();
  }

  // a spear for the guard (a staff with a blade)
  function cuSpear(K, x, top) {
    K.save();
    K.fillStyle = INK;
    K.fillRect(x - 6, top, 12, FLOOR + 6 - top);
    K.fill(S.pth(`M${x - 18},${top + 4} L${x},${top - 70} L${x + 18},${top + 4} Z`));
    K.fillStyle = S.light();
    K.fillRect(x - 10, top + 10, 20, 5);
    K.restore();
  }

  // a gate with a little roof behind the guard
  function cuGate(K, x, t) {
    K.save();
    K.fillStyle = INK;
    K.fillRect(x - 230, FLOOR - 520, 40, 520);
    K.fillRect(x + 190, FLOOR - 520, 40, 520);
    K.fillRect(x - 250, FLOOR - 540, 500, 30);
    K.restore();
    S.lantern(K, x - 120, FLOOR - 470, 0.7, t, 0);
    S.lantern(K, x + 120, FLOOR - 470, 0.7, t, 1);
  }

  // a hammer held in the hand ("a solution"), pose.prop
  const cuHammer = (p) => x => {
    if (p <= 0) return;
    x.save();
    x.rotate(-20 * D);
    x.scale(p, p);
    x.fillStyle = INK;
    x.fillRect(-6, -10, 12, 120);
    x.fill(S.pth('M-40,96 L40,96 L40,134 L-40,134 Z'));
    x.restore();
  };

  // the boss scolding, inside the moon window (a memory drawn small, clipped to the disc)
  function cuBossInMoon(K, cx, cy, r, t, p) {
    if (p <= 0.01) return;
    K.save();
    K.beginPath();
    K.arc(cx, cy, r - 8, 0, TAU);
    K.clip();
    K.globalAlpha = p;
    const wag = Math.sin(t * 10) * 18;
    K.translate(cx + 30, cy + r * 0.95);
    K.scale(0.62, 0.62);
    S.figure(K, BOSS, { x: 0, y: 0, s: 1, t, point: true, aF: [120 + wag, 20], aB: [20, 30], head: 6, rods: false, flip: false });
    cuStorm(K, 120, -620, t, 0.8);
    K.restore();
  }

  // a paper ear, cut out so the light shines through
  function cuEar(K, x, y, s, t, p) {
    if (p <= 0.01) return;
    K.save();
    K.translate(x, y);
    K.scale(s * backOut(p), s * backOut(p));
    K.rotate(Math.sin(t * 1.4) * 0.05);
    K.fillStyle = INK;
    K.fill(S.pth('M-40,-110 C30,-150 120,-110 120,-20 C120,40 80,60 60,90 C40,120 40,160 0,170 C-40,176 -70,150 -66,110 C-64,80 -40,70 -30,40 C-24,20 -70,10 -70,-40 C-70,-80 -60,-100 -40,-110 Z'));
    K.fillStyle = S.light();
    K.fill(S.pth('M-20,-70 C30,-96 84,-66 84,-20 C84,10 60,24 46,44 C36,58 30,80 16,88 C30,60 28,40 20,30 C40,20 56,0 50,-24 C44,-50 10,-60 -20,-44 Z'));
    K.restore();
  }

  // sound waves of her voice (arcs coming from her mouth), fading when she stops
  function cuVoice(K, x, y, t, p, dir = -1) {
    if (p <= 0.01) return;
    K.save();
    K.strokeStyle = INK;
    K.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const u = (t * 1.6 + k / 3) % 1;
      K.globalAlpha = p * (1 - u);
      K.lineWidth = 6;
      K.beginPath();
      K.arc(x, y, 30 + u * 90, dir < 0 ? Math.PI - 0.5 : -0.5, dir < 0 ? Math.PI + 0.5 : 0.5);
      K.stroke();
    }
    K.restore();
  }

  const cuVis = (t, t0, step = 0.035) => ci => prog(t, t0 + ci * step, 0.2);

  // standard outdoor backdrop
  function cuOutdoor(K, t, o = {}) {
    S.place(K, F2.far(), -300, FLOOR - 560, 0.17);
    S.moon(K, o.mx ?? 820, o.my ?? 520, o.mr ?? 100, t, o.moonOpt || {});
    S.place(K, F2.mid(), -500, FLOOR - 420, 0.28);
    S.place(K, F2.ground(), -600, FLOOR - 60);
  }

  // ═════════════ scenes ═════════════
  const scenes = [];

  // 01 · she talks, he looks away  [0 → S2]
  scenes.push({
    from: 0,
    lamp: t => ({ pal: 'dusk', pal2: 'amber', mix: cl(t / 3), cx: 540, cy: 720, power: 1 }),
    cam: t => ({ z: 1.04 + t * 0.012, x: 540, y: 760 }),
    draw(K, t) {
      S.moon(K, 540, 552, 276, t, { phase: 1.2 });
      S.place(K, F2.room(), -60, 0, 0.92);
      const talk = 0.5 + 0.5 * Math.sin(t * 7);
      const her = S.figure(K, HER, { x: 790, s: 1.02, t, flip: true, aF: [60 + 30 * talk, 50], aB: [30, 40], head: 4 * talk });
      cuVoice(K, her.head[0] - 30, her.head[1] + 20, t, 1, -1);
      const away = prog(t, T.malas - 0.2, 0.4);
      const him = cuFig(K, HIM, { x: 290, s: 1.02, t, head: -14 * away + 6 * Math.sin(t * 3) * away, aF: [20, 30], aB: [10, 20], lean: -4 * away }, S.turnScale(t, T.malas - 0.2, 0.4) < 0 ? -1 : 1);
      cuThread(K, him.hand, her.hand, t, { depth: 70 + 60 * away, p: 1, glow: 0.5 });
      S.dust(K, t);
    },
    top(K, t) {
      if (t > T.malas - 0.1) S.bigText(K, ['malas', 'dengar?'], { x: 540, y: 260, size: 130, lead: 130, t, seed: 2, vis: cuVis(t, T.malas - 0.1), alpha: 1 - prog(t, S2 - 0.35, 0.25) });
    },
  });

  // 02 · the guard by habit: a problem, and the gears start spinning  [S2 → S3]
  scenes.push({
    from: S2,
    lamp: t => ({ pal: 'amber', pal2: 'rust', mix: 0.6 * prog(t, T.masalah, 0.5), cx: 540, cy: 700, power: 1 - 0.15 * prog(t, T.masalah, 0.4) }),
    cam: t => ({ z: 1.0 + 0.05 * prog(t, S2, 5.5), x: 540, y: 760 }),
    draw(K, t) {
      cuOutdoor(K, t, { mx: 260, my: 500 });
      cuGate(K, 540, t);
      cuSpear(K, 690, 560);
      const alert = prog(t, T.masalah, 0.3);
      const g = S.figure(K, GUARD, { x: 560, s: 1.05, t, aF: [40 + 20 * alert, 60], aB: [20, 20], head: -6 * alert + Math.sin(t * 2) * 2, lean: -3 * alert });
      cuStorm(K, 900 - 120 * prog(t, T.masalah, 1.5), 520, t, prog(t, T.masalah - 0.1, 0.5));
      cuGears(K, g.head[0] - 10, g.head[1] - 160, t, prog(t, T.kepalanya, 0.4), 1 + 1.5 * prog(t, T.sibuk, 0.4));
      S.dust(K, t);
    },
    top(K, t) {
      if (t > T.penjaga - 0.1 && t < T.masalah) S.bigText(K, ['penjaga'], { x: 540, y: 300, size: 150, t, seed: 4, vis: cuVis(t, T.penjaga - 0.1), alpha: 1 - prog(t, T.masalah - 0.3, 0.25) });
      if (t > T.keluar - 0.2) S.bigText(K, ['cari jalan keluar'], { x: 540, y: 300, size: 100, t, seed: 5, color: '#FFD9A8', vis: cuVis(t, T.keluar - 0.2), alpha: 1 - prog(t, S3 - 0.35, 0.25) });
    },
  });

  // 03 · he comes home tired; she talks about the boss; he hears "fix my problem"  [S3 → S4]
  scenes.push({
    from: S3,
    lamp: t => ({ pal: 'amber', pal2: 'dusk', mix: prog(t, T.capek, 0.6), cx: 520, cy: 640, power: 1 - 0.25 * prog(t, T.capek, 0.6) + 0.15 * prog(t, T.tolong, 0.3) }),
    cam: t => ({ z: 1.0 + 0.06 * prog(t, T.dengar, 1.5), x: 540, y: 740 }),
    draw(K, t) {
      S.moon(K, 540, 552, 276, t, { phase: 3 });
      cuBossInMoon(K, 540, 552, 276, t, prog(t, T.atasan - 0.1, 0.5));
      S.place(K, F2.room(), -60, 0, 0.92);
      // he walks in hunched, drops the bag
      const walk = prog(t, T.pulang - 0.3, 1.3);
      const mx = -150 + 410 * walk;
      const drop = prog(t, T.pulang + 0.6, 0.3);
      const him = S.figure(K, HIM_TIRED, Object.assign(walk > 0 && walk < 1 ? S.walkLong(t * 4) : {}, {
        x: mx, s: 1.0, t, aF: [10, 10], aB: [8, 10], head: 10 + 8 * prog(t, T.capek, 0.5), lean: 4 + 6 * prog(t, T.capek, 0.5),
      }));
      if (drop > 0) S.sack(K, him.hand2 ? him.hand2[0] : mx, lerp(him.hand2 ? him.hand2[1] : FLOOR - 300, FLOOR - 60, drop), 0.8, t);
      // she starts telling the story
      const talking = prog(t, T.lalu, 0.4);
      const talk = talking * (0.5 + 0.5 * Math.sin(t * 7));
      const her = S.figure(K, HER, { x: 820, s: 1.0, t, flip: true, aF: [50 + 50 * talk, 60], aB: [30 + 20 * talk, 40], head: 4 * talk });
      cuVoice(K, her.head[0] - 30, her.head[1] + 20, t, talking, -1);
      cuGears(K, him.head[0] - 10, him.head[1] - 150, t, prog(t, T.dengar, 0.4), 2);
      cuThread(K, him.hand, her.hand, t, { depth: 90, p: 1, glow: 0.4 });
      S.dust(K, t);
    },
    top(K, t) {
      if (t > T.tolong - 0.1) S.bigText(K, ['"Tolong selesaikan', 'masalahku."'], { x: 540, y: 210, size: 92, lead: 100, t, seed: 7, vis: cuVis(t, T.tolong - 0.1, 0.025), alpha: 1 - prog(t, S4 - 0.3, 0.25) });
    },
  });

  // 04 · the quick fix: hammer, "resign aja"; cold light, she turns away, the thread goes slack  [S4 → S5]
  scenes.push({
    from: S4,
    lamp: t => ({ pal: 'amber', pal2: 'rust', mix: prog(t, T.diam, 0.6), cx: 540, cy: 680, power: 1 - 0.35 * prog(t, T.diam, 0.8) }),
    cam: t => ({ z: 1.02 + 0.05 * prog(t, S4, 8), x: 540, y: 750 }),
    draw(K, t) {
      S.moon(K, 540, 552, 276, t, { phase: 3, bite: 0.6 * prog(t, T.diam, 1.2) });
      S.place(K, F2.room(), -60, 0, 0.92);
      const up = prog(t, T.buru, 0.3);
      const point = prog(t, T.resign, 0.2) * (1 - prog(t, T.bingung - 0.3, 0.3));
      const scratch = prog(t, T.bingung, 0.3);
      const him = S.figure(K, HIM, {
        x: 300 + 60 * up, s: 1.02, t, point: point > 0.5,
        aF: scratch > 0 ? [lerp(90, 160, scratch), lerp(20, 150, scratch)] : point > 0.5 ? [80, 10] : [30 + 40 * up, 70 * up],
        aB: [20 + 30 * up, 30], lean: 6 * up - 6 * scratch, head: -4 * up + 8 * Math.sin(t * 5) * scratch,
        prop: scratch > 0 || point > 0.5 ? null : cuHammer(prog(t, T.solusi - 0.2, 0.3)),
      });
      const turn = S.turnScale(t, T.diam - 0.1, 0.45);
      const her = cuFig(K, HER, { x: 830, s: 1.0, t, flip: true, aF: turn < 0 ? [70, 120] : [40, 40], aB: turn < 0 ? [70, 120] : [30, 30], head: turn < 0 ? -10 * prog(t, T.kesal, 0.3) : 0 }, turn);
      cuGears(K, him.head[0] - 10, him.head[1] - 150, t, 1 - prog(t, T.diam, 0.5), 3);
      const slack = prog(t, T.berhenti, 0.6);
      cuThread(K, him.hand2 || him.hand, her.hand || her.hand2, t, { depth: 60 + 220 * slack, p: 1, glow: 0.6 - 0.5 * slack, wob: 3 - 2 * slack });
      S.dust(K, t, 28, 0.22);
    },
    top(K, t) {
      if (t > T.ya - 0.1 && t < T.diam + 0.3) S.bigText(K, ['"Ya udah,', 'resign aja."'], { x: 540, y: 230, size: 104, lead: 110, t, seed: 9, vis: cuVis(t, T.ya - 0.1, 0.03), alpha: 1 - prog(t, T.diam, 0.3) });
      if (t > T.bingung - 0.1) S.bigText(K, ['?'], { x: 400, y: 380, size: 200, t, seed: 10, vis: cuVis(t, T.bingung - 0.1), alpha: 1 - prog(t, S5 - 0.3, 0.25) });
    },
  });

  // 05 · just listening: hammer down, sit beside her, "pasti capek ya"  [S5 → S6]
  scenes.push({
    from: S5,
    lamp: t => ({ pal: 'rust', pal2: 'amber', mix: prog(t, T.didengar, 1.2), cx: 540, cy: 680, power: 0.75 + 0.3 * prog(t, T.ditemani, 0.8) }),
    cam: t => ({ z: 1.0 + 0.07 * prog(t, T.ditemani, 3), x: 540, y: 760 }),
    draw(K, t) {
      S.moon(K, 540, 552, 276, t, { phase: 3 });
      S.place(K, F2.room(), -60, 0, 0.92);
      const lt = SOMP.staff(K, 940, 760);
      S.lantern(K, lt[0], lt[1], 0.9 + 0.15 * prog(t, T.ditemani, 0.6), t, 2);
      // the hammer drops on the floor on "didengar"
      const hd = prog(t, T.didengar, 0.35);
      K.save();
      K.translate(lerp(300, 200, hd), lerp(FLOOR - 320, FLOOR - 30, hd));
      K.rotate(lerp(-0.3, -1.57, hd));
      cuHammer(1)(K);
      K.restore();
      const sit = prog(t, T.ditemani, 0.5);
      const her = S.figure(K, HER_SEATED, { x: 770, s: 0.98, t, flip: true, aF: [40, 50], aB: [30, 40], head: 8 * prog(t, T.pasti + 0.3, 0.6), lean: -4 * prog(t, T.pasti + 0.3, 0.6) });
      let him;
      if (sit < 0.5) {
        him = S.figure(K, HIM, { x: 300, s: 1.0, t, aF: [10, 10], aB: [10, 10], head: 6 });
        cuGears(K, him.head[0] - 10, him.head[1] - 150, t, 1 - prog(t, T.nggak, 0.6), 0.4);
      } else {
        him = S.figure(K, HIM_SEATED, { x: 350, s: 0.98, t, aF: [60 + 30 * prog(t, T.pasti, 0.4), 30], aB: [30, 30], head: 8 + 3 * Math.sin(t * 1.3) });
      }
      cuThread(K, him.hand, her.hand || her.hand2, t, { depth: lerp(260, 40, prog(t, T.ditemani, 0.8)), p: 1, glow: lerp(0.15, 1, prog(t, T.ditemani, 0.8)) });
      S.dust(K, t, 40, 0.36);
    },
    top(K, t) {
      if (t > T.pasti - 0.1) S.bigText(K, ['"Pasti capek ya."'], { x: 540, y: 300, size: 104, t, seed: 12, color: '#FFD9A8', vis: cuVis(t, T.pasti - 0.1), alpha: 1 - prog(t, S6 - 0.3, 0.25) });
    },
  });

  // 06 · a pair of ears: the ear lights up inside the moon  [S6 → end]
  scenes.push({
    from: S6,
    lamp: t => ({ pal: 'amber', pal2: 'ember', mix: prog(t, T.telinga, 0.8), cx: 540, cy: 560, power: 1.05 }),
    cam: t => ({ z: 1.0 + 0.06 * prog(t, S6, 4), x: 540, y: 700 }),
    draw(K, t) {
      S.moon(K, 540, 552, 276, t, { phase: 3 });
      cuEar(K, 530, 552, 1.3, t, prog(t, T.telinga - 0.15, 0.6));
      S.place(K, F2.room(), -60, 0, 0.92);
      const her = S.figure(K, HER_SEATED, { x: 770, s: 0.98, t, flip: true, aF: [40, 50], aB: [30, 40], head: 8, lean: -4 });
      const him = S.figure(K, HIM_SEATED, { x: 350, s: 0.98, t, aF: [90, 30], aB: [30, 30], head: 8 + 3 * Math.sin(t * 1.3) });
      cuThread(K, him.hand, her.hand || her.hand2, t, { depth: 40, p: 1, glow: 1 });
      S.knot(K, 560, FLOOR - 250, 10 + 3 * Math.sin(t * 4));
      S.dust(K, t, 46, 0.4);
    },
    top(K, t) {
      if (t > T.sepasang - 0.1) S.bigText(K, ['Sepasang telinga.'], { x: 540, y: 200, size: 104, t, seed: 14, vis: cuVis(t, T.sepasang - 0.1) });
    },
  });

  // captions: phrase by phrase in the strip under the screen
  const FRASES = [[0, 7], [8, 13], [14, 16], [17, 22], [23, 30], [31, 38], [39, 44], [45, 47, null, 'off'], [48, 52], [53, 56], [57, 59], [60, 63], [64, 70], [71, 78], [79, 83], [84, 88], [89, 91, null, 'off'], [92, 96], [97, 98, null, 'off']];
  SC.teatro = SOMP.teatro(scenes, [S2, S5], { frases: FRASES, opciones: { hold: 1.2, em: new Set([4, 13, 22, 30, 38, 52, 56, 59, 70, 78, 85, 96]) } });
})();

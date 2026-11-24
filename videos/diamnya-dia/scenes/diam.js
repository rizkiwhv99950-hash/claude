// ═════════════ "Diamnya dia" · papel ═════════════
// Her stories are paper speech bubbles. Happy: they burst out of her in every colour, each with a little picture.
// Hurt: they turn grey and fall in paper rain, her answers shrink to tiny bubbles. End: one big blank bubble holding a
// taped-up heart, a story with no words. Screen coordinates, draw on K. Key content above y 1400.
(() => {
  const D = Math.PI / 180;
  const hs = n => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const pp = (t, t0, d) => cl((t - t0) / d);
  const oBack = u => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
  };
  const oCub = u => 1 - Math.pow(1 - u, 3);
  const settle = (t, t0, f = 16, k = 5, a = 0.12) => (t < t0 ? 0 : Math.exp(-(t - t0) * k) * Math.sin((t - t0) * f) * a);
  const PINK = '#ff4f9e', RED = '#ff3d5e', YEL = '#ffd54a', INK = '#22203f', CREAM = '#fffaf0', MINT = '#7fdcc3';
  const SKIN = '#f2c29c', SKIN_DK = '#e2a97e', HAIR = '#3b2626', DRESS = '#f2b134', DRESS_DK = '#d9951c', BLUSH = '#f58ca5';
  const GREY = '#9aa0b8';

  PK.capHide = () => false;

  // ── word cues (indices from build/word_index.txt) ──
  const w = i => wi(i);
  const W = {
    tiba: w(2), pendiam: w(4),
    kata: w(5), banyak: w(6), orang: w(7), perempuan: w(8), bahagia: w(11), ramai: w(13),
    ceritanya: w(14), mana: w(16), menu: w(18), siang: w(20), kucing: w(22), kabur: w(25),
    tertawa: w(28), sebelum: w(30), selesai: w(32), lalu: w(33), baru: w(35), muncul: w(36), padahal: w(37), habis: w(41),
    tapi: w(42), hatinya: w(44), terluka: w(46), suaranya: w(47), pelan: w(48), hilang: w(49),
    jawab: w(50), pendek: w(52), nggak: w(54), iya: w(56), terserah: w(58),
    jadi: w(59), diamnya: w(60), cerita: w(64), hanya: w(65), tanpa: w(67),
  };

  // ── sound + camera punches ──
  cue(W.tiba, 'swoosh', -8);
  cue(W.pendiam + 0.1, 'thud', -4);
  kick(W.pendiam + 0.12, 0.6, 0.4);
  cue(W.kata, 'pop', -5);
  cue(W.orang, 'pop', -5);
  cue(W.perempuan, 'swoosh', -4);
  cue(W.bahagia, 'shimmer', -6);
  cue(W.ramai, 'impact', -3);
  kick(W.ramai + 0.03, 1, 0.8);
  cue(W.ceritanya, 'pop', -4);
  cue(W.mana, 'pop', -4);
  cue(W.menu, 'pop', -2);
  kick(W.menu + 0.03, 0.5, 0.4);
  cue(W.kucing, 'pop', -2);
  cue(W.kabur, 'whoosh', -6);
  cue(W.tertawa, 'ding', -4);
  kick(W.tertawa + 0.05, 0.7, 0.8);
  cue(W.sebelum, 'pop', -5);
  cue(W.baru, 'pop', -3);
  cue(W.muncul, 'pop', -4);
  cue(W.padahal, 'thud', -6);
  cue(W.hatinya, 'pop', -6);
  cue(W.terluka, 'impact', -3);
  kick(W.terluka + 0.05, 1, 0.9);
  cue(W.pelan, 'swoosh', -10);
  cue(W.jawab, 'click', -6);
  cue(W.nggak, 'pop', -8);
  cue(W.iya, 'pop', -9);
  cue(W.terserah, 'pop', -10);
  cue(W.diamnya, 'riser', -10);
  cue(W.cerita, 'shimmer', -4);
  kick(W.cerita + 0.05, 0.5, 0.3);
  cue(W.tanpa, 'shimmer', -10);

  // camera: slow drifting push inside a scene, identity at both cuts
  const dmCam = (S0, S1f, amp = 1) => t => {
    const S1 = typeof S1f === 'function' ? S1f() : S1f;
    const u = cl((t - S0) / Math.max(0.1, S1 - S0)), e = Math.sin(Math.PI * u);
    return {
      x: Math.sin(t * 1.3) * 26 * e * amp,
      y: Math.cos(t * 1.1) * 18 * e * amp,
      z: 1 + 0.08 * e * amp,
      r: Math.sin(t * 0.9) * 0.018 * e * amp,
    };
  };

  // ═════════════ props invented for this reel ═════════════

  // beat counter for the rays (colour swap + punch on each word)
  function dmBeat(t, times) {
    let n = 0, last = -99;
    for (const tt of times) if (t >= tt) { n++; last = tt; }
    return { n, bump: Math.exp(-(t - last) * 5) };
  }

  // rotating paper rays behind the hero
  function dmRays(K, x, y, t, o = {}) {
    const bt = o.beats ? dmBeat(t, o.beats) : { n: 0, bump: 0 };
    const n = o.n || 14, r0 = o.r0 || 170, r1 = (o.r1 || 760) * (1 + 0.35 * bt.bump), wd = (o.w || 0.11) * (1 + 0.5 * bt.bump);
    let cols = o.cols || ['#ffb347', '#fffaf0'];
    if (bt.n % 2) cols = [cols[1], cols[0]];
    K.save();
    K.translate(x, y);
    K.rotate(t * (o.speed || 0.3) + bt.n * 0.22);
    if (o.alpha != null) K.globalAlpha *= o.alpha;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, rr = r1 * (0.9 + 0.1 * Math.sin(t * 3 + i));
      PK.paper(K, [
        [Math.cos(a - wd) * r0, Math.sin(a - wd) * r0],
        [Math.cos(a) * rr, Math.sin(a) * rr],
        [Math.cos(a + wd) * r0, Math.sin(a + wd) * r0],
      ], cols[i % cols.length], { seed: (o.seed || 300) + i, shadow: 0.25, amp: 1.4, rim: false });
    }
    K.restore();
  }

  // floating confetti dots in the background
  function dmDots(K, t, cols, n = 10) {
    for (let i = 0; i < n; i++) {
      const sp = 40 + hs(i + 3) * 50;
      const y = 1560 - ((t * sp + hs(i + 9) * 1500) % 1500);
      const x = 70 + hs(i) * 940 + Math.sin(t * 1.3 + i) * 24;
      K.save();
      K.globalAlpha *= 0.55;
      PK.ellipse(K, x, y, 12 + hs(i + 5) * 10, 12 + hs(i + 5) * 10, cols[i % cols.length], { seed: 900 + i, small: true, shadow: 0.3 });
      K.restore();
    }
  }

  // paper rain
  function dmRain(K, t, t0, amt = 1) {
    const a = cl((t - t0) * 2) * amt;
    if (a <= 0) return;
    K.save();
    K.globalAlpha *= a;
    for (let i = 0; i < 34; i++) {
      const x = hs(i) * 1140 - 30;
      const y = ((t * (900 + hs(i + 2) * 300) + hs(i + 7) * 2000) % 2000) - 150;
      PK.line(K, [[x, y], [x - 14, y + 60]], 7, '#e9eeff', { shadow: 0.3, seed: 950 + i });
    }
    K.restore();
  }

  // ── the woman: a paper puppet, bust, base point = waist centre ──
  // st: t, mood 'happy'|'sad'|'calm'|'pensive', talk 0..1, laugh 0..1, look [x,y], tilt deg, arm 0..1 (right arm up), tear 0..1
  function dmEyes(K, t, st) {
    const blink = ((t + 0.7) % 3.3) < 0.1 ? 1 : 0;
    const look = st.look || [0, 0];
    K.strokeStyle = INK;
    K.fillStyle = INK;
    K.lineWidth = 7;
    K.lineCap = 'round';
    for (const ex of [-40, 40]) {
      if (st.laugh > 0.3 || (st.mood === 'happy' && st.talk > 0.5)) {
        K.beginPath();
        K.arc(ex, 12, 15, Math.PI * 1.15, Math.PI * 1.85);
        K.stroke();
      } else if (st.mood === 'calm' && st.closed) {
        K.beginPath();
        K.arc(ex, 2, 14, 0.2, Math.PI - 0.2);
        K.stroke();
      } else {
        K.beginPath();
        K.ellipse(ex + look[0] * 7, 4 + look[1] * 7, 10, 13 * (1 - blink) + 0.5, 0, 0, Math.PI * 2);
        K.fill();
        if (!blink) PK.ellipse(K, ex + look[0] * 7 - 3, look[1] * 7, 3, 3, '#ffffff', { rim: false, shadow: 0, small: true, seed: 1090 });
      }
    }
    // brows
    K.lineWidth = 6;
    if (st.mood === 'sad' || st.mood === 'pensive') {
      K.beginPath();
      K.moveTo(-62, -26); K.lineTo(-22, -36);
      K.moveTo(62, -26); K.lineTo(22, -36);
      K.stroke();
    } else {
      K.beginPath();
      K.arc(-40, -16, 24, Math.PI * 1.2, Math.PI * 1.8);
      K.stroke();
      K.beginPath();
      K.arc(40, -16, 24, Math.PI * 1.2, Math.PI * 1.8);
      K.stroke();
    }
  }
  function dmMouth(K, t, st) {
    K.strokeStyle = '#b8324e';
    K.fillStyle = '#b8324e';
    K.lineWidth = 6;
    K.lineCap = 'round';
    if (st.laugh > 0.3) {
      const o = 18 + 8 * Math.abs(Math.sin(t * 16));
      K.beginPath();
      K.moveTo(-30, 50);
      K.quadraticCurveTo(0, 50 + o * 2, 30, 50);
      K.closePath();
      K.fill();
      PK.ellipse(K, 0, 50 + o * 0.9, 12, 6, '#f27a93', { rim: false, shadow: 0, small: true, seed: 1091 });
    } else if (st.talk > 0.05) {
      const o = 4 + st.talk * 16 * Math.abs(Math.sin(t * 13) * 0.7 + Math.sin(t * 7.3) * 0.3);
      K.beginPath();
      K.ellipse(0, 58, 16, o, 0, 0, Math.PI * 2);
      K.fill();
    } else if (st.mood === 'sad' || st.mood === 'pensive') {
      K.beginPath();
      K.arc(0, 78, 18, Math.PI * 1.2, Math.PI * 1.8);
      K.stroke();
    } else {
      K.beginPath();
      K.arc(0, 44, 22, 0.25, Math.PI - 0.25);
      K.stroke();
    }
  }
  function dmHead(K, t, st) {
    PK.ellipse(K, 0, 0, 105, 118, SKIN, { seed: 1007, tone: true });
    PK.ellipse(K, -104, 10, 16, 24, SKIN_DK, { seed: 1010, small: true });
    PK.ellipse(K, 104, 10, 16, 24, SKIN_DK, { seed: 1011, small: true });
    PK.ellipse(K, -106, 40, 7, 7, YEL, { seed: 1012, small: true });
    PK.ellipse(K, 106, 40, 7, 7, YEL, { seed: 1013, small: true });
    PK.blob(K, 0, -88, 118, 52, 8, 0.15, HAIR, { seed: 1008, shadow: 0.4 });
    PK.paper(K, [[-110, -80], [-60, -70], [-100, 30]], HAIR, { seed: 1014, shadow: 0.3 });
    PK.paper(K, [[110, -80], [60, -70], [100, 30]], HAIR, { seed: 1015, shadow: 0.3 });
    PK.ellipse(K, -64, 38, 18, 10, BLUSH, { rim: false, shadow: 0, seed: 1016 });
    PK.ellipse(K, 64, 38, 18, 10, BLUSH, { rim: false, shadow: 0, seed: 1017 });
    dmEyes(K, t, st);
    dmMouth(K, t, st);
    if (st.tear > 0) {
      const u = (t * 0.8) % 1;
      K.save();
      K.globalAlpha *= st.tear * (1 - u * 0.6);
      PK.paper(K, PK.geo.path([['M', 0, -14], ['C', 9, -2, 10, 8, 0, 12], ['C', -10, 8, -9, -2, 0, -14], ['Z']], true, 3).map(([a, b]) => [-44 + a, 30 + u * 70 + b]), '#a8e3ff', { seed: 1018, small: true });
      K.restore();
    }
  }
  // long hair behind the head, swaying a little
  function dmHairBack(K, t, st) {
    K.save();
    K.translate(0, -220);
    K.rotate((st.tilt || 0) * D * 0.5 + Math.sin(t * 1.6) * 0.02);
    PK.blob(K, 0, 0, 150, 160, 9, 0.08, HAIR, { seed: 1001 });
    PK.rect(K, -140, 0, 280, 220, 70, HAIR, { seed: 1002 });
    K.restore();
  }

  // the dress, with a cream collar and two pocket stitches
  function dmDress(K, t, st) {
    const col = st.dress || DRESS;
    PK.paper(K, [[-115, -70], [115, -70], [180, 260], [-180, 260]], col, { seed: 1003, tone: true });
    PK.paper(K, [[-42, -70], [42, -70], [0, -22]], CREAM, { seed: 1004, small: true });
    PK.line(K, [[-120, 150], [-60, 150]], 5, PK.shade(col, -0.2), { shadow: 0, seed: 1021, dash: [10, 8] });
    PK.line(K, [[60, 150], [120, 150]], 5, PK.shade(col, -0.2), { shadow: 0, seed: 1022, dash: [10, 8] });
  }

  // left arm hangs, right arm gestures (arm 0..1 = raised)
  function dmArms(K, t, st, arm) {
    const sleeve = st.dressDk || DRESS_DK;
    PK.limb(K, [[-112, -50], [-150, 80], [-132, 200]], 46, sleeve, { seed: 1005 });
    PK.ellipse(K, -132, 214, 26, 26, SKIN, { seed: 1006, small: true });
    const wv = Math.sin(t * 7) * 18 * arm;
    const hx = 150 + arm * 40 + wv, hy = 190 - arm * 300;
    PK.limb(K, [[112, -50], [150 + arm * 30, 70 - arm * 120], [hx, hy]], 46, sleeve, { seed: 1019 });
    PK.ellipse(K, hx, hy + (arm > 0.5 ? -14 : 14), 26, 26, SKIN, { seed: 1020, small: true });
  }

  function dmWoman(K, x, y, s, st) {
    const t = st.t || 0, arm = st.arm || 0;
    const sq = st.sq || { sx: 1, sy: 1 };
    const br = Math.sin(t * 2.2) * 0.012 + (st.laugh || 0) * Math.abs(Math.sin(t * 16)) * 0.025;
    K.save();
    K.translate(x, y);
    K.scale(s * sq.sx * (1 + br), s * sq.sy * (1 - br));
    dmHairBack(K, t, st);
    dmDress(K, t, st);
    dmArms(K, t, st, arm);
    // neck + head
    PK.rect(K, -26, -125, 52, 75, 14, SKIN_DK, { seed: 1009 });
    K.save();
    K.translate(0, -130);
    K.rotate(((st.tilt || 0) + PK.wob(t, 4, 2)) * D);
    K.translate(0, -95);
    dmHead(K, t, st);
    K.restore();
    K.restore();
    return { mouth: [x + 0, y - 165 * s], chest: [x, y - 10 * s], head: [x, y - 225 * s] };
  }

  // ── speech bubble icons (drawn around 0,0, about 100 px) ──
  const ICON = {
    heart: K => PK.heart(K, 0, 8, 0.95, RED, { seed: 1101 }),
    star: K => PK.star(K, 0, 4, 54, 24, '#ff9f1c', { n: 5, seed: 1102 }),
    note: K => {
      PK.ellipse(K, -18, 30, 24, 17, INK, { seed: 1103, small: true });
      PK.rect(K, 0, -42, 11, 74, 3, INK, { seed: 1104, small: true });
      PK.paper(K, [[6, -42], [44, -26], [44, -8], [6, -22]], INK, { seed: 1105, small: true });
    },
    sun: (K, t) => {
      K.save();
      K.rotate(t * 0.8);
      for (let i = 0; i < 8; i++) {
        const a = i * 45 * D;
        PK.line(K, [[Math.cos(a) * 40, Math.sin(a) * 40], [Math.cos(a) * 58, Math.sin(a) * 58]], 8, '#ffb02e', { shadow: 0.2, seed: 1106 + i });
      }
      K.restore();
      PK.ellipse(K, 0, 0, 32, 32, '#ffb02e', { seed: 1115 });
    },
    haha: K => PK.text(K, 'HAHA', 0, 16, 46, INK, { rim: false }),
    food: (K, t) => {
      for (let k = 0; k < 3; k++) {
        const u = (t * 0.8 + k / 3) % 1;
        K.save();
        K.globalAlpha *= Math.sin(u * Math.PI) * 0.8;
        PK.line(K, [[-24 + k * 24, -20 - u * 40], [-30 + k * 24 + Math.sin(t * 4 + k) * 8, -50 - u * 40]], 6, '#ffffff', { shadow: 0, seed: 1120 + k });
        K.restore();
      }
      PK.line(K, [[20, -54], [58, 6]], 7, '#8a5a30', { seed: 1124 });
      PK.line(K, [[34, -58], [64, 0]], 7, '#8a5a30', { seed: 1125 });
      PK.paper(K, PK.geo.path([['M', -62, -4], ['L', 62, -4], ['C', 60, 40, 30, 52, 0, 52], ['C', -30, 52, -60, 40, -62, -4], ['Z']], true), '#ffffff', { seed: 1126 });
      PK.rect(K, -62, 6, 124, 10, 4, '#ff7a7a', { seed: 1127, small: true, shadow: 0 });
      for (let k = 0; k < 4; k++) PK.line(K, [[-46 + k * 26, -6], [-36 + k * 26, -18], [-26 + k * 26, -6]], 6, '#ffd54a', { shadow: 0, seed: 1128 + k });
    },
    cat: (K, t) => {
      PK.paper(K, [[-44, -14], [-36, -58], [-12, -32]], '#f5a25d', { seed: 1131 });
      PK.paper(K, [[44, -14], [36, -58], [12, -32]], '#f5a25d', { seed: 1132 });
      PK.ellipse(K, 0, 4, 50, 42, '#f5a25d', { seed: 1133, tone: true });
      const bl = ((t + 1.3) % 2.7) < 0.1;
      K.fillStyle = INK;
      for (const ex of [-18, 18]) {
        K.beginPath();
        K.ellipse(ex, 0, 6, bl ? 1 : 8, 0, 0, 7);
        K.fill();
      }
      PK.paper(K, [[-6, 14], [6, 14], [0, 22]], '#ff7a9a', { seed: 1134, small: true, rim: false });
      K.strokeStyle = INK;
      K.lineWidth = 3;
      K.beginPath();
      K.moveTo(-14, 20); K.lineTo(-48, 14);
      K.moveTo(-14, 24); K.lineTo(-48, 28);
      K.moveTo(14, 20); K.lineTo(48, 14);
      K.moveTo(14, 24); K.lineTo(48, 28);
      K.stroke();
    },
    flower: (K, t) => {
      K.save();
      K.rotate(t * 0.6);
      for (let i = 0; i < 6; i++) {
        const a = i * 60 * D;
        PK.ellipse(K, Math.cos(a) * 28, Math.sin(a) * 28, 20, 20, '#ff9ec4', { seed: 1140 + i, small: true });
      }
      K.restore();
      PK.ellipse(K, 0, 0, 18, 18, YEL, { seed: 1147, small: true });
    },
    phone: (K, t) => {
      PK.rect(K, -30, -50, 60, 100, 12, INK, { seed: 1150 });
      PK.rect(K, -22, -38, 44, 74, 6, MINT, { seed: 1151, shadow: 0, rim: false });
      if (Math.sin(t * 8) > 0) PK.ellipse(K, 24, -48, 12, 12, RED, { seed: 1152, small: true });
    },
    lines: (K, t) => {
      // a story cut off mid-sentence
      [[-60, -26, 110], [-60, 0, 90], [-60, 26, 40]].forEach(([x, y, wd], k) => PK.line(K, [[x, y], [x + wd, y]], 9, INK, { shadow: 0, seed: 1160 + k }));
      PK.text(K, '...', 22, 34, 44, PINK, { rim: false });
    },
  };

  // a paper speech bubble with its tail aimed at (tx, ty) and an icon or a word inside
  function dmBubble(K, x, y, t, o) {
    const s = o.s ?? 1;
    if (s <= 0.001) return;
    const wd = o.w || 190, ht = o.h || 150;
    const col = o.grey ? PK.mix(o.col || CREAM, GREY, o.grey) : (o.col || CREAM);
    const sqz = o.squish || 0;
    K.save();
    K.translate(x, y);
    K.rotate(((o.rot || 0) + PK.wob(t, o.seed || 1, 3)) * D);
    K.scale(s * (1 + sqz * 0.25), s * (1 - sqz * 0.45));
    if (o.alpha != null) K.globalAlpha *= o.alpha;
    if (o.tx != null) {
      const dx = (o.tx - x) / s, dy = (o.ty - y) / s, d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(d - 10, ht * 0.5 + 70);
      const tip = [dx / d * reach, dy / d * reach], nx = -dy / d * 24, ny = dx / d * 24;
      PK.paper(K, [[nx, ny], tip, [-nx, -ny]], col, { seed: (o.seed || 1) + 2000, shadow: 0.5 });
    }
    PK.rect(K, -wd / 2, -ht / 2, wd, ht, ht * 0.42, col, { seed: (o.seed || 1) + 2100, lift: 0.3, tone: true });
    K.save();
    if (o.grey) K.globalAlpha *= 1 - o.grey * 0.6;
    if (o.icon) ICON[o.icon](K, t);
    if (o.word) PK.text(K, o.word, 0, o.wordSize ? o.wordSize * 0.36 : 16, o.wordSize || 44, INK, { rim: false });
    K.restore();
    K.restore();
  }

  // gossiping head with a "bla" bubble (for "kata banyak orang")
  function dmGossip(K, x, y, s, t, k) {
    K.save();
    K.translate(x, y + PK.bob(t, k + 3, 6));
    K.scale(s, s);
    K.rotate(PK.wob(t, k + 9, 5) * D);
    const cols = ['#6b5bd6', '#3cc9a8', '#ffb02e'];
    PK.rect(K, -50, 30, 100, 70, 30, cols[k % 3], { seed: 1200 + k });
    PK.ellipse(K, 0, 0, 48, 52, SKIN, { seed: 1203 + k });
    PK.blob(K, 0, -36, 52, 22, 7, 0.2, ['#2f2a44', '#6b3f2a', '#8c7b6b'][k % 3], { seed: 1206 + k, shadow: 0.3 });
    K.fillStyle = INK;
    K.beginPath();
    K.ellipse(-16, 0, 5, 6, 0, 0, 7);
    K.ellipse(16, 0, 5, 6, 0, 0, 7);
    K.fill();
    K.beginPath();
    K.ellipse(0, 24, 9, 4 + 6 * Math.abs(Math.sin(t * 12 + k)), 0, 0, 7);
    K.fillStyle = '#b8324e';
    K.fill();
    dmBubble(K, 70, -90, t, { w: 130, h: 80, word: 'bla', wordSize: 40, col: CREAM, seed: 30 + k, s: 1, tx: 20, ty: -20 });
    K.restore();
  }

  // a paper cat running across the floor
  function dmRunCat(K, x, y, t) {
    const ph = t * 18;
    K.save();
    K.translate(x, y + Math.abs(Math.sin(ph)) * -16);
    for (let k = 0; k < 4; k++) {
      const lx = -40 + k * 26, a = Math.sin(ph + k * 1.7) * 30;
      PK.limb(K, [[lx, 10], [lx + Math.sin(a * D) * 40, 50]], 16, '#e48b45', { seed: 1220 + k });
    }
    PK.line(K, [[-60, -10], [-100, -40 + Math.sin(ph) * 10], [-110, -80]], 14, '#e48b45', { seed: 1225 });
    PK.ellipse(K, 0, 0, 70, 34, '#f5a25d', { seed: 1226, tone: true });
    K.translate(70, -30);
    K.scale(0.8, 0.8);
    ICON.cat(K, t);
    K.restore();
  }

  // the heart on her chest that tears in two
  function dmTearHeart(K, x, y, t, t0, tTear) {
    const p = PK.pop(t, t0);
    if (p <= 0.001) return;
    const sp = t < tTear ? 0 : oCub(pp(t, tTear, 0.35));
    const beat = t < tTear ? 1 + 0.08 * Math.max(0, Math.sin(t * 9)) : 1;
    const zig = [[0, -44], [10, -30], [-8, -12], [8, 4], [-6, 20], [0, 34]];
    for (const side of [-1, 1]) {
      K.save();
      K.translate(x + side * sp * 34, y + sp * 10);
      K.rotate(side * sp * 14 * D);
      K.scale(p * beat * 2, p * beat * 2);
      K.beginPath();
      K.moveTo(0, -80);
      K.lineTo(side * 100, -80);
      K.lineTo(side * 100, 60);
      K.lineTo(0, 60);
      zig.slice().reverse().forEach(([a, b]) => K.lineTo(a, b));
      K.closePath();
      K.clip();
      PK.heart(K, 0, 0, 1, t < tTear ? RED : PK.mix(RED, '#8a8fb0', sp * 0.5), { seed: 1240, lift: 0.4 });
      K.restore();
    }
  }

  // taped-up heart (inside the blank bubble)
  function dmTapedHeart(K, x, y, s, t) {
    K.save();
    K.translate(x, y);
    K.scale(s * (1 + 0.05 * Math.max(0, Math.sin(t * 5))), s);
    PK.heart(K, 0, 0, 1.6, RED, { seed: 1250, tone: true });
    PK.line(K, [[-3, -60], [8, -40], [-6, -20], [6, 0], [0, 24]], 4, '#b32a44', { shadow: 0, seed: 1251 });
    K.save();
    K.rotate(-30 * D);
    PK.rect(K, -50, -14, 100, 28, 3, '#f3e6c4', { seed: 1252, shadow: 0.5, alpha: 0.9 });
    K.restore();
    K.save();
    K.rotate(25 * D);
    K.translate(0, 20);
    PK.rect(K, -44, -13, 88, 26, 3, '#f3e6c4', { seed: 1253, shadow: 0.5, alpha: 0.9 });
    K.restore();
    K.restore();
  }


  // the wall colour flips on each stressed word (a paper palette switch: the room is "loud")
  function dmWallCycle(t, beats, cols) {
    let n = 0;
    for (const b of beats) if (t >= b) n++;
    return cols[n % cols.length];
  }

  // bubbles jostle when a new story pushes in
  function dmJostle(t, t0, i) {
    if (t < t0) return [0, 0];
    const dt = t - t0, e = Math.exp(-dt * 3);
    return [Math.sin(dt * 14 + i) * 28 * e, Math.cos(dt * 12 + i * 2) * 18 * e];
  }

  // HA HA HA letters bouncing around her head
  function dmHaHa(K, t, t0, t1) {
    if (t < t0 || t > t1) return;
    ['HA', 'HA', 'HA'].forEach((str, k) => {
      const p = PK.pop(t, t0 + k * 0.14);
      if (p <= 0) return;
      const out = 1 - pp(t, t1 - 0.25, 0.25);
      K.save();
      K.translate(360 + k * 180, 760 - k * 30 + Math.sin(t * 10 + k) * 14);
      K.rotate(((k - 1) * 12 + Math.sin(t * 8 + k) * 6) * D);
      K.scale(p * out, p * out);
      PK.text(K, str, 0, 0, 96, PINK);
      K.restore();
    });
  }

  // "ke mana-mana": a dashed trail looping around the stage
  function dmTrail(K, t, t0) {
    if (t < t0) return;
    const u = oCub(pp(t, t0, 0.6)), pts = [];
    for (let k = 0; k <= 60 * u; k++) {
      const a = k / 60 * Math.PI * 2.2 + 0.6 + t * 0.15;
      pts.push([540 + Math.cos(a) * 420, 820 + Math.sin(a) * 300]);
    }
    if (pts.length > 1) PK.line(K, pts, 6, '#ffb02e', { dash: [14, 16], shadow: 0 });
    if (pts.length > 1) {
      const [hx, hy] = pts[pts.length - 1];
      PK.ellipse(K, hx, hy, 14, 14, '#ffb02e', { seed: 1400, small: true });
    }
  }

  // sparkles in a ring (for "bahagia")
  function dmSparkRing(K, t, t0, t1, pts) {
    if (t < t0 || t > t1) return;
    pts.forEach(([x, y], k) => {
      const s = cl((t - t0 - k * 0.07) * 5) * (0.7 + 0.3 * Math.sin(t * 8 + k));
      if (s > 0) PK.sparkle(K, x, y, 44 * s, k % 2 ? '#ffffff' : YEL, t * 60 + k * 20);
    });
  }

  // a small grey rain cloud that follows her (sad scenes)
  function dmRainCloud(K, x, y, t, t0, amt = 1) {
    const p = oBack(pp(t, t0, 0.5)) * amt;
    if (p <= 0.001) return;
    K.save();
    K.translate(x + Math.sin(t * 1.2) * 20, y + Math.sin(t * 1.7) * 8 - (1 - p) * 300);
    K.scale(p, p);
    for (let i = 0; i < 9; i++) {
      const dx = -110 + i * 28, u = (t * 1.6 + hs(i + 70)) % 1;
      K.save();
      K.globalAlpha *= 1 - u;
      PK.line(K, [[dx, 40 + u * 220], [dx - 8, 70 + u * 220]], 6, '#dfe6ff', { shadow: 0, seed: 1410 + i });
      K.restore();
    }
    PK.cloud(K, 0, 0, 1.25, '#7d86ad', { seed: 1420 });
    PK.cloud(K, -60, 10, 0.8, '#8f98be', { seed: 1421 });
    K.restore();
  }

  // puddles on the floor with rain rings
  function dmPuddles(K, t, t0) {
    const a = cl((t - t0) * 1.5);
    if (a <= 0) return;
    K.save();
    K.globalAlpha *= a;
    [[180, 1640, 150], [880, 1660, 170], [540, 1720, 120]].forEach(([x, y, r], i) => {
      PK.ellipse(K, x, y, r, r * 0.22, '#7f8bbd', { seed: 1430 + i, rim: false, shadow: 0 });
      dmRipple(K, x + Math.sin(i * 3) * 40, y, t, i);
    });
    K.restore();
  }
  function dmRipple(K, x, y, t, i) {
    for (let k = 0; k < 2; k++) {
      const u = (t * 0.9 + k * 0.5 + i * 0.3) % 1;
      K.save();
      K.globalAlpha *= 1 - u;
      K.strokeStyle = '#dfe6ff';
      K.lineWidth = 3;
      K.beginPath();
      K.ellipse(x, y, 20 + u * 80, (20 + u * 80) * 0.22, 0, 0, Math.PI * 2);
      K.stroke();
      K.restore();
    }
  }

  // the whole stage steps back on each short answer: she gets smaller in her own frame
  function dmStageZoom(t, beats) {
    let z = 1;
    beats.forEach((b, i) => {
      if (t >= b) z -= 0.07 * oBack(pp(t, b, 0.35));
    });
    return z;
  }
  function dmWithZoom(K, z, cx, cy, fn) {
    K.save();
    K.translate(cx, cy);
    K.scale(z, z);
    K.translate(-cx, -cy);
    fn();
    K.restore();
  }

  // one short answer bubble
  function dmAnswer(K, t, a, i, next) {
    const p = PK.pop(t, a.t0);
    if (p <= 0.001) return;
    const fade = next != null ? 1 - 0.5 * pp(t, next, 0.4) : 1;
    const sink = next != null ? 40 * oCub(pp(t, next, 0.6)) : 0;
    dmBubble(K, a.x, a.y + sink + PK.bob(t, i + 30, 5), t, {
      word: a.word, wordSize: 64, w: a.word.length * 36 + 100, h: 130, col: '#e6e9f5', grey: 0.3,
      s: p * a.s, alpha: fade, seed: 60 + i, tx: MOUTH[0], ty: MOUTH[1],
    });
  }

  // little paper hearts rising in the night sky
  function dmHeartsRise(K, t, t0) {
    if (t < t0) return;
    for (let i = 0; i < 10; i++) {
      const st = t0 + i * 0.12, dt = t - st;
      if (dt < 0) continue;
      const x = 120 + hs(i + 80) * 840 + Math.sin(dt * 2 + i) * 30;
      const y = 1400 - dt * (160 + hs(i + 90) * 120);
      if (y < 300) continue;
      K.save();
      K.globalAlpha *= cl(dt * 3) * cl((y - 300) / 300);
      K.translate(x, y);
      K.rotate(Math.sin(dt * 3 + i) * 0.3);
      PK.heart(K, 0, 0, 0.45 + hs(i + 85) * 0.3, i % 2 ? '#ff9ec4' : RED, { seed: 1440 + i, shadow: 0.3 });
      K.restore();
    }
  }

  // fireflies drifting around her at night
  function dmFireflies(K, t) {
    for (let i = 0; i < 8; i++) {
      const x = 540 + Math.sin(t * (0.5 + hs(i) * 0.6) + i * 2) * (200 + hs(i + 3) * 260);
      const y = 1000 + Math.cos(t * (0.4 + hs(i + 1) * 0.5) + i) * (220 + hs(i + 4) * 160);
      const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.5 + i * 1.7));
      K.save();
      K.globalAlpha *= a;
      PK.ellipse(K, x, y, 9, 9, '#fff3b0', { seed: 1460 + i, small: true, rim: false, shadow: 0 });
      K.restore();
    }
  }

  // ── bubble layout around her head (woman at 540,1200 → mouth ≈ 540,1035) ──
  const WS = 1.2, WY = 1260;
  const MOUTH = [540, WY - 165 * WS];
  const SLOTS = {
    heart: [185, 640, -6], star: [405, 525, 4], note: [670, 525, -4], haha: [895, 640, 6],
    sun: [540, 690, 0], food: [200, 910, -5], cat: [880, 910, 5],
  };
  const APPEAR = {
    heart: W.ramai, star: W.ramai + 0.12, note: W.ramai + 0.24, haha: W.ceritanya, sun: W.mana, food: W.menu, cat: W.kucing,
  };
  const COLS = { heart: '#ffd1e1', star: '#fff1b8', note: '#c9f2e6', haha: CREAM, sun: '#ffe2b0', food: '#e7dcff', cat: '#ffd9bf' };
  const FOCUS = { food: 1, cat: 1 };
  function dmStoryBubbles(K, t, o = {}) {
    const keys = ['heart', 'star', 'note', 'haha', 'sun', 'food', 'cat'];
    keys.forEach((k, i) => {
      const t0 = APPEAR[k];
      let s = PK.pop(t, t0);
      if (s <= 0.001) return;
      if (FOCUS[k]) s *= 1 + 0.45 * Math.exp(-(t - t0) * 2.2);
      s *= 1.15;
      if (o.laugh) s *= 1 + 0.06 * Math.abs(Math.sin(t * 16 + i));
      const [x0, y0, r] = SLOTS[k];
      const jo = o.jostle ? dmJostle(t, o.jostle, i) : [0, 0];
      const x = x0 + jo[0], y = y0 + jo[1];
      const fall = o.fallAt ? o.fallAt[i] : null;
      let fx = 0, fy = 0, fr = 0, alpha = 1, squish = 0;
      if (fall != null && t > fall) {
        squish = oCub(pp(t, fall, 0.25));
        const f = PK.fall(t, fall + 0.2, { vx: (hs(i + 50) - 0.5) * 200, vy: -150, g: 1800, spin: (hs(i + 60) - 0.5) * 200 });
        fx = f.x; fy = f.y; fr = f.r;
        alpha = 1 - pp(t, fall + 0.4, 0.6);
        s *= 1 - 0.35 * squish;
      }
      if (alpha <= 0) return;
      dmBubble(K, x + fx, y + fy + PK.bob(t, i + 1, 7), t, {
        icon: k, col: COLS[k], seed: 10 + i, s, rot: r + fr, tx: MOUTH[0], ty: MOUTH[1],
        w: FOCUS[k] ? 220 : 190, h: FOCUS[k] ? 170 : 150, grey: o.grey || 0, alpha, squish,
      });
    });
  }

  // ═════════════ 01 · sunyi  [0 → CUT_B] ═════════════
  SC.sunyi = {
    noHeadline: () => true,
    cam: dmCam(0, CUT_B, 0.8),
    back: (T, K, t) => PK.bg.wall(K, t, '#cfd8f0', { floor: '#b4c0e4' }),
    draw(T, K, t) {
      dmRays(K, 540, 760, t, { cols: ['#b8c6ee', '#e6ecfb'], beats: [W.tiba, W.pendiam], speed: 0.2 });
      dmDots(K, t, ['#9fb1e6', CREAM]);
      const by = 640 + PK.dropY(t, 0, 600) + PK.bob(t, 2, 6);
      const shake = t > W.tiba && t < W.pendiam ? Math.sin(t * 50) * 6 : 0;
      const sag = oCub(pp(t, W.pendiam + 0.3, 0.4));
      dmBubble(K, 540 + shake, by + sag * 30, t, { w: 320, h: 200, col: CREAM, seed: 5, tx: MOUTH[0], ty: MOUTH[1], squish: sag * 0.5, rot: sag * -6 });
      // "..." dots: bob, then fall out on "pendiam"
      for (let k = 0; k < 3; k++) {
        const ft = W.pendiam + k * 0.12;
        const f = t > ft ? PK.fall(t, ft, { vx: (k - 1) * 80, vy: -200, spin: 200 }) : { x: 0, y: 0, r: 0 };
        const dy = Math.sin(t * 6 + k) * 10;
        PK.ellipse(K, 540 + shake + (k - 1) * 70 + f.x, by + dy + f.y, 20, 20, INK, { seed: 1300 + k, small: true });
      }
      dmWoman(K, 540, WY + PK.bob(t, 5, 4), WS, { t, mood: 'pensive', look: [0, 0.8], tilt: -6 });
    },
    top: (T, K, t) => PK.captions(K, t),
  };

  // ═════════════ 02 · ramai  [CUT_B → CUT_C] ═════════════
  SC.ramai = {
    noHeadline: () => true,
    cam: dmCam(CUT_B, CUT_C, 1),
    back: (T, K, t) => PK.bg.wall(K, t, dmWallCycle(t, [W.perempuan, W.bahagia, W.ramai], ['#ffe6b5', '#ff9fbf', '#86d9c3']), { floor: '#f3c98a' }),
    draw(T, K, t) {
      dmRays(K, 540, 850, t, { beats: [W.kata, W.orang, W.perempuan, W.bahagia, W.ramai] });
      dmDots(K, t, ['#ffb98a', '#ff9ec4', MINT]);
      // gossiping heads, then they slide away to make room for her
      const away = oCub(pp(t, W.perempuan, 0.4));
      [[200, 760, W.kata], [540, 640, W.banyak], [880, 760, W.orang]].forEach(([x, y, t0], k) => {
        const p = PK.pop(t, t0) * (1 - away);
        if (p > 0.001) dmGossip(K, x + (k - 1) * away * 400, y - away * 300, p * 1.7, t, k);
      });
      // she springs up on "perempuan"
      const up = oBack(pp(t, W.perempuan, 0.45));
      if (t >= W.perempuan) {
        const happy = t >= W.bahagia;
        dmWoman(K, 540, WY + (1 - up) * 700 + PK.bob(t, 5, 5), WS, {
          t, mood: happy ? 'happy' : 'calm', talk: t > W.ramai ? 1 : 0,
          arm: happy ? oCub(pp(t, W.bahagia, 0.3)) : 0, look: [0, -0.3], tilt: happy ? 4 : 0,
          sq: PK.squash(t, W.ramai, 0.15),
        });
        dmSparkRing(K, t, W.bahagia, W.ramai + 0.4, [[300, 900], [780, 880], [260, 1180], [820, 1160], [540, 700]]);
      }
      dmStoryBubbles(K, t);
      if (t >= W.ramai) PK.confetti(K, 540, 900, t - W.ramai, { n: 22, spread: 600, cols: [PINK, YEL, MINT, CREAM], seed: 5 });
    },
    top: (T, K, t) => PK.captions(K, t),
  };

  // ═════════════ 03 · cerita  [CUT_C → CUT_D] ═════════════
  SC.cerita = {
    noHeadline: () => true,
    cam: dmCam(CUT_C, CUT_D, 1),
    back: (T, K, t) => PK.bg.wall(K, t, dmWallCycle(t, [W.ceritanya, W.mana, W.menu, W.kucing, W.kabur], ['#86d9c3', '#ffe6b5', '#ff9fbf']), { floor: '#f3c98a' }),
    draw(T, K, t) {
      dmRays(K, 540, 850, t, { beats: [W.ceritanya, W.mana, W.menu, W.kucing, W.kabur] });
      dmDots(K, t, ['#ffb98a', '#ff9ec4', MINT]);
      dmTrail(K, t, W.mana);
      dmWoman(K, 540, WY + PK.bob(t, 5, 5), WS, {
        t, mood: 'happy', talk: 1, arm: 0.6 + 0.4 * Math.sin(t * 2), look: t > W.kucing ? [0.8, -0.2] : t > W.menu ? [-0.8, -0.2] : [0, -0.3], tilt: 4,
      });
      dmStoryBubbles(K, t);
      // the neighbour's cat runs off on "kabur"
      if (t >= W.kabur) {
        const x = 1200 - 1500 * pp(t, W.kabur, 1.0);
        dmRunCat(K, x, 1330, t);
        PK.puff(K, x + 120, 1370, (t - W.kabur) % 0.3, { n: 4, r: 30, seed: 7 });
      }
    },
    top: (T, K, t) => PK.captions(K, t),
  };

  // ═════════════ 04 · tawa  [CUT_D → CUT_E] ═════════════
  const EXTRA = [
    { icon: 'lines', x: 300, y: 790, t0: W.sebelum, col: CREAM, seed: 40, r: -8 },
    { icon: 'phone', x: 780, y: 790, t0: W.baru, col: '#c9f2e6', seed: 41, r: 7 },
    { icon: 'flower', x: 170, y: 1180, t0: W.muncul, col: '#ffd1e1', seed: 42, r: -4 },
    { icon: 'heart', x: 910, y: 1180, t0: W.muncul + 0.25, col: '#fff1b8', seed: 43, r: 5 },
  ];
  SC.tawa = {
    noHeadline: () => true,
    cam: dmCam(CUT_D, CUT_E, 1),
    back: (T, K, t) => PK.bg.wall(K, t, dmWallCycle(t, [W.tertawa, W.sebelum, W.lalu, W.muncul, W.padahal], ['#ffdca8', '#ff9fbf', '#86d9c3']), { floor: '#f0bd7a' }),
    draw(T, K, t) {
      dmRays(K, 540, 850, t, { beats: [W.tertawa, W.sebelum, W.selesai, W.baru, W.muncul, W.padahal], cols: ['#ff9f43', '#fffaf0'] });
      dmDots(K, t, ['#ffb98a', '#ff9ec4', MINT]);
      const laugh = t < W.sebelum + 0.8 ? cl((t - W.tertawa) * 4) : 0.2 * Math.abs(Math.sin(t * 2));
      const jt = t >= W.padahal ? W.padahal : t >= W.muncul ? W.muncul : t >= W.baru ? W.baru : null;
      dmStoryBubbles(K, t, { laugh: laugh > 0.3, jostle: jt });
      dmHaHa(K, t, W.tertawa, W.selesai);
      // new stories pile up on top of the unfinished one
      EXTRA.forEach((e, i) => {
        const p = PK.pop(t, e.t0);
        if (p <= 0.001) return;
        let sq = 0;
        if (i === 0 && t > W.padahal) sq = 0.4 * oCub(pp(t, W.padahal, 0.3)) + 0.05 * Math.sin(t * 9);
        const jo = jt != null ? dmJostle(t, jt, i + 7) : [0, 0];
        dmBubble(K, e.x + jo[0], e.y + jo[1] + PK.bob(t, i + 20, 8), t, {
          icon: e.icon, col: e.col, seed: e.seed, s: p * (1 + 0.3 * Math.exp(-(t - e.t0) * 3)), rot: e.r, tx: MOUTH[0], ty: MOUTH[1], squish: sq,
        });
      });
      dmWoman(K, 540, WY + PK.bob(t, 5, 5), WS, {
        t, mood: 'happy', talk: laugh > 0.3 ? 0 : 1, laugh, arm: laugh > 0.3 ? 1 : 0.5, look: [0, -0.2], tilt: laugh > 0.3 ? -8 : 4,
      });
    },
    top: (T, K, t) => PK.captions(K, t),
  };

  // ═════════════ 05 · luka  [CUT_E → CUT_F] ═════════════
  const FALL_AT = [0, 1, 2, 3, 4, 5, 6].map(i => W.pelan + i * 0.13);
  SC.luka = {
    noHeadline: () => true,
    cam: dmCam(CUT_E, CUT_F, 0.7),
    back: (T, K, t) => PK.bg.wall(K, t, '#a9b4dc', { floor: '#8d98c4' }),
    draw(T, K, t) {
      dmRays(K, 540, 850, t, { cols: ['#9aa6d4', '#c3cbea'], beats: [W.tapi, W.hatinya, W.terluka, W.suaranya, W.pelan], speed: 0.15 });
      const grey = oCub(pp(t, W.terluka, 1.0));
      dmStoryBubbles(K, t, { grey, fallAt: FALL_AT });
      dmWoman(K, 540, WY + PK.bob(t, 5, 3), WS, {
        t, mood: t > W.hatinya ? 'sad' : 'calm', talk: t < W.hatinya ? 0.6 : 0, look: [0, 0.8], tilt: -6,
        tear: pp(t, W.terluka + 0.3, 0.4), dress: PK.mix(DRESS, '#8b8fb8', grey * 0.5), dressDk: PK.mix(DRESS_DK, '#6f7399', grey * 0.5),
      });
      dmTearHeart(K, 540, WY + 80, t, W.hatinya, W.terluka);
      dmRainCloud(K, 540, 690, t, W.pelan + 0.5);
      dmPuddles(K, t, W.tapi);
      dmRain(K, t, W.tapi);
    },
    top: (T, K, t) => PK.captions(K, t),
  };

  // ═════════════ 06 · pendek  [CUT_F → CUT_G] ═════════════
  // her answers shrink: each bubble smaller, greyer and lower than the last
  const ANSWERS = [
    { word: '—', t0: W.pendek, x: 540, y: 600, s: 1.1 },
    { word: 'nggak apa-apa', t0: W.nggak, x: 400, y: 740, s: 1.0 },
    { word: 'iya', t0: W.iya, x: 800, y: 780, s: 0.85 },
    { word: 'terserah', t0: W.terserah, x: 300, y: 900, s: 0.75 },
  ];
  SC.pendek = {
    noHeadline: () => true,
    cam: dmCam(CUT_F, CUT_G, 0.7),
    back: (T, K, t) => PK.bg.wall(K, t, '#a9b4dc', { floor: '#8d98c4' }),
    draw(T, K, t) {
      dmRays(K, 540, 850, t, { cols: ['#9aa6d4', '#c3cbea'], beats: [W.jawab, W.pendek, W.nggak, W.iya, W.terserah], speed: 0.12, alpha: 0.7 });
      dmPuddles(K, t, CUT_F - 1);
      const z = dmStageZoom(t, [W.pendek, W.nggak, W.iya, W.terserah]);
      dmWithZoom(K, z, 540, 1250, () => {
        dmWoman(K, 540, WY + PK.bob(t, 5, 3), WS, {
          t, mood: 'sad', talk: (t > W.nggak && t < W.nggak + 1) || (t > W.iya && t < W.iya + 0.5) || (t > W.terserah && t < W.terserah + 0.6) ? 0.3 : 0,
          look: [0.3, 0.9], tilt: -8, tear: 0.6, dress: PK.mix(DRESS, '#8b8fb8', 0.5), dressDk: PK.mix(DRESS_DK, '#6f7399', 0.5),
        });
        dmTearHeart(K, 540, WY + 80, t, CUT_F - 5, CUT_F - 4);
        dmRainCloud(K, 540, 690, t, CUT_F - 5, 1 + 0.12 * (1 - z) / 0.28);
      });
      ANSWERS.forEach((a, i) => dmAnswer(K, t, a, i, i < ANSWERS.length - 1 ? ANSWERS[i + 1].t0 : null));
      dmRain(K, t, CUT_F - 1, 0.8 + 0.6 * (1 - z));
    },
    top: (T, K, t) => PK.captions(K, t),
  };

  // ═════════════ 07 · tanpakata  [CUT_G → end] ═════════════
  SC.tanpakata = {
    noHeadline: () => true,
    cam: dmCam(CUT_G, () => DUR_END(), 0.6),
    back: (T, K, t) => PK.bg.night(K, t, {}),
    draw(T, K, t) {
      dmRays(K, 540, 700, t, { cols: ['#3a3f7a', '#4c5296'], beats: [W.diamnya, W.cerita, W.hanya, W.tanpa], speed: 0.12, alpha: 0.8 });
      // one big blank bubble rises out of her
      const rise = oBack(pp(t, W.diamnya, 0.8));
      dmRays(K, 540, 640, t, { cols: ['#2c3170', '#ffe9a8'], r0: 190, r1: 460, n: 18, speed: -0.2, alpha: 0.35 * oCub(pp(t, W.cerita, 0.6)), seed: 1470, beats: [W.hanya, W.tanpa] });
      if (t >= W.diamnya) {
        dmBubble(K, 540, 1000 - rise * 360 + PK.bob(t, 3, 8), t, { w: 520, h: 330, col: CREAM, seed: 70, s: 0.3 + 0.7 * rise, tx: MOUTH[0], ty: MOUTH[1] });
        const hp = PK.pop(t, W.cerita);
        if (hp > 0.001) dmTapedHeart(K, 540, 640 + PK.bob(t, 3, 8), hp * 1.1, t);
      }
      dmFireflies(K, t);
      dmHeartsRise(K, t, W.cerita);
      // stars twinkle around it on "tanpa kata"
      [[220, 520], [860, 540], [180, 820], [900, 800], [540, 420], [330, 900], [760, 920]].forEach(([x, y], k) => {
        const s = cl((t - W.tanpa - k * 0.08) * 4) * (0.6 + 0.4 * Math.sin(t * 6 + k * 2));
        if (s > 0) PK.sparkle(K, x, y, 38 * s, k % 2 ? '#ffffff' : YEL, t * 40 + k * 30);
      });
      dmWoman(K, 540, WY + PK.bob(t, 5, 3), WS, {
        t, mood: 'calm', closed: t > W.tanpa + 0.2, look: [0, -1], tilt: 3, dress: PK.mix(DRESS, '#8b8fb8', 0.25), dressDk: PK.mix(DRESS_DK, '#6f7399', 0.25),
      });
    },
    top: (T, K, t) => PK.captions(K, t),
  };
})();

// ═════════════ "Bagaimana kita jatuh cinta" · papel ═════════════
// The brain is a paper puppet with a little carnival inside: a heart literally FALLS on it, a HADIAH prize booth lights up
// (reward centre), a strict judge's lamp dims until he sleeps (social judgment), and the photo gets a perfect 10.
// Screen coordinates, draw on K. Key content above y 1400, captions are PK.captions (top strip).
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

  // last word stays on screen (short tail)
  PK.capHide = () => false;

  // ── word cues (indices from build/word_index.txt) ──
  const W_APA = wi(0), W_TERJADI = wi(2), W_OTAK = wi(4), W_KITA = wi(6), W_JATUH = wi(7), W_CINTA = wi(8);
  const W_LIHAT = wi(9), W_FOTO = wi(10), W_SAJA = wi(11), W_PUSAT = wi(13), W_HADIAH = wi(14), W_OTAKMU = wi(16);
  const W_KAYA = wi(18), W_DOPA = wi(19), W_LANGSUNG = wi(20), W_NYALA = wi(21);
  const W_TAPI = wi(22), W_LEBIH = wi(25), W_ANEH = wi(26), W_BAGIAN = wi(27), W_BIASA = wi(30), W_MENILAI = wi(31);
  const W_ORANG = wi(32), W_JUSTRU = wi(34), W_REDUP = wi(35);
  const W_MUNGKIN = wi(36), W_SEBAB = wi(38), W_DIA = wi(39), W_LIHATAN = wi(40), W_SEMPURNA = wi(41);
  const HEART_LAND = W_JATUH + 0.28;

  // ── sound + camera punches, on the words ──
  cue(0.3, 'thud', -6);
  cue(W_TERJADI, 'swoosh', -6);
  cue(W_OTAK, 'pop', -4);
  cue(W_JATUH, 'swoosh', -4);
  cue(HEART_LAND, 'impact', -2);
  kick(HEART_LAND + 0.02, 1, 0.8);
  cue(W_LIHAT + 0.02, 'swoosh', -4);
  cue(W_FOTO + 0.05, 'click', -2);
  kick(W_FOTO + 0.06, 0.5, 0.3);
  cue(W_PUSAT + 0.28, 'thud', -2);
  kick(W_PUSAT + 0.3, 0.6, 0.6);
  cue(W_OTAKMU, 'pop', -6);
  cue(W_DOPA, 'pop', -3);
  cue(W_NYALA + 0.04, 'ding', -2);
  kick(W_NYALA + 0.06, 1, 0.8);
  cue(W_LEBIH, 'swoosh', -8);
  cue(W_ANEH, 'pop', -3);
  cue(W_BAGIAN + 0.28, 'thud', -3);
  kick(W_BAGIAN + 0.3, 0.7, 0.6);
  cue(W_MENILAI, 'click', -3);
  cue(W_ORANG, 'swoosh', -6);
  cue(W_JUSTRU, 'click', -4);
  cue(W_REDUP + 0.05, 'swoosh', -8);
  cue(CUT_D + 0.28, 'impact', -4);
  kick(CUT_D + 0.3, 0.6, 0.5);
  cue(W_DIA, 'shimmer', -6);
  cue(W_SEMPURNA + 0.03, 'stamp', 0);
  kick(W_SEMPURNA + 0.06, 1.1, 0.9);

  // camera: a slow drifting push inside each scene, exactly identity at both cuts
  const cnCam = (S0, S1f, amp = 1) => t => {
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

  // floating background hearts (idle life of every stage)
  function cnHearts(K, t, col, n = 9) {
    for (let i = 0; i < n; i++) {
      const sp = 60 + hs(i + 3) * 60;
      const y = 1560 - ((t * sp + hs(i + 9) * 1500) % 1500);
      const x = 70 + hs(i) * 940 + Math.sin(t * 1.4 + i) * 26;
      const s = 0.34 + hs(i + 5) * 0.45;
      K.save();
      K.globalAlpha *= 0.6;
      K.translate(x, y);
      K.rotate(PK.wob(t, i + 20, 12) * D);
      PK.heart(K, 0, 0, s, col, { seed: 900 + i, shadow: 0.4 });
      K.restore();
    }
  }

  // event pulse for the rays: how many beats have passed, and a decaying bump after the latest one
  function cnBeat(t, times) {
    let n = 0, last = -99;
    for (const tt of times) if (t >= tt) { n++; last = tt; }
    return { n, bump: Math.exp(-(t - last) * 5) };
  }

  // rotating paper sun-rays behind a hero (o.beats: word times that swap the colours and punch the rays out)
  function cnRays(K, x, y, t, o = {}) {
    const bt = o.beats ? cnBeat(t, o.beats) : { n: 0, bump: 0 };
    const n = o.n || 14, r0 = o.r0 || 160, r1 = (o.r1 || 620) * (1 + 0.25 * bt.bump), w = (o.w || 0.11) * (1 + 0.5 * bt.bump);
    let cols = o.cols || ['#ffb3c9', '#fff0f4'];
    if (bt.n % 2) cols = [cols[1], cols[0]];
    K.save();
    K.translate(x, y);
    K.rotate(t * (o.speed || 0.35) + (o.off || 0) + bt.n * 0.22);
    if (o.alpha != null) K.globalAlpha *= o.alpha;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r1 * (0.9 + 0.1 * Math.sin(t * 3 + i));
      PK.paper(K, [
        [Math.cos(a - w) * r0, Math.sin(a - w) * r0],
        [Math.cos(a) * rr, Math.sin(a) * rr],
        [Math.cos(a + w) * r0, Math.sin(a + w) * r0],
      ], cols[i % cols.length], { seed: (o.seed || 300) + i, shadow: 0.25, amp: 1.4, rim: false });
    }
    K.restore();
  }

  // a big "?" hanging on a string, swinging in
  function cnQuestion(K, x, y, t, t0, o = {}) {
    if (t < t0) return;
    const dt = t - t0;
    const drop = dt < 0.3 ? -500 * (1 - oCub(dt / 0.3)) : 0;
    const swing = Math.sin(dt * 4) * 22 * Math.exp(-dt * 1.2) + Math.sin(t * 1.8) * 5;
    K.save();
    K.translate(x, y - 260 + drop);
    K.rotate(swing * D);
    PK.line(K, [[0, -400], [0, 150]], 5, '#8a6440');
    PK.text(K, '?', 0, 300, o.size || 230, o.col || PINK);
    K.restore();
  }

  // OTAK label with an arrow pointing at the brain
  function cnLabel(K, x, y, t, t0, str, tx, ty) {
    const lp = PK.pop(t, t0);
    if (lp <= 0.001) return;
    const u = oCub(pp(t, t0 + 0.1, 0.3));
    PK.line(K, [[x + 40, y + 40], [lerp(x + 40, tx, u), lerp(y + 40, ty, u)]], 7, INK, { shadow: 0.4, dash: [18, 12] });
    if (u > 0.95) {
      const a = Math.atan2(ty - y - 40, tx - x - 40);
      K.save();
      K.translate(tx, ty);
      K.rotate(a);
      PK.paper(K, [[0, 0], [-34, -18], [-34, 18]], INK, { seed: 310, small: true });
      K.restore();
    }
    K.save();
    K.translate(x, y);
    K.rotate((-8 + PK.wob(t, 2, 4) + (1 - Math.min(1, lp)) * 30) * D);
    K.scale(lp, lp);
    PK.plate(K, str, 0, 0, { size: 92, fill: YEL });
    K.restore();
  }

  // the heart that literally falls
  function cnFallingHeart(K, x, baseY, t, t0, tLand) {
    if (t < t0) return;
    const landed = t >= tLand;
    const sq = PK.squash(t, tLand, 0.3);
    const hb = landed ? 1 + settle(t, tLand, 18, 5, 0.12) : 1;
    const beat = landed ? 1 + 0.06 * Math.max(0, Math.sin(t * 9)) : 1;
    const hy = baseY + PK.dropY(t, t0, 900);
    K.save();
    K.translate(x, hy);
    K.rotate(PK.wob(t, 5, 4) * D);
    K.scale(3.5 * hb * sq.sx * beat, 3.5 * hb * sq.sy * beat);
    PK.heart(K, 0, 0, 1, RED, { seed: 77, lift: 0.6, tone: true });
    PK.ellipse(K, -18, -24, 8, 5, '#ffffff', { seed: 311, rim: false, shadow: 0, small: true });
    K.restore();
  }

  // a ring of twinkling paper sparkles
  function cnSparkles(K, cx, cy, t, t0, pts, size = 40) {
    if (t < t0) return;
    pts.forEach(([x, y], k) => {
      const s = cl((t - t0 - k * 0.06) * 5) * (0.7 + 0.3 * Math.sin(t * 8 + k * 2));
      if (s > 0) PK.sparkle(K, cx + x, cy + y, size * s, k % 2 ? '#ffffff' : YEL, t * 50 + k * 30);
    });
  }

  // polaroid with a paper portrait that develops (dev 0..1)
  function cnPortrait(K, dev, t) {
    K.fillStyle = PK.mix('#3a3556', '#ffc9dc', dev);
    K.fillRect(-130, -160, 260, 266);
    K.globalAlpha *= cl(dev * 1.4);
    PK.heart(K, 70, -100, 0.55, '#ffffff', { seed: 402, shadow: 0, rim: false });
    PK.ellipse(K, 0, 118, 108, 74, '#5b8de0', { seed: 403 });
    PK.rect(K, -20, 20, 40, 50, 10, '#f2c29c', { seed: 404, shadow: 0.5 });
    PK.blob(K, 0, -50, 74, 62, 9, 0.12, '#6b3f2a', { seed: 405 });
    PK.ellipse(K, 0, -16, 54, 62, '#f2c29c', { seed: 406 });
    PK.blob(K, 0, -66, 62, 26, 7, 0.18, '#6b3f2a', { seed: 407, shadow: 0.4 });
    const bl = PK.wob(t, 3, 1) > 0.85 ? 0.2 : 1;
    K.fillStyle = INK;
    for (const ex of [-20, 20]) {
      K.beginPath();
      K.ellipse(ex, -18, 6, 7 * bl, 0, 0, Math.PI * 2);
      K.fill();
    }
    K.strokeStyle = '#b8324e';
    K.lineWidth = 5;
    K.lineCap = 'round';
    K.beginPath();
    K.arc(0, 4, 18, 0.2, Math.PI - 0.2);
    K.stroke();
    PK.ellipse(K, -32, 8, 10, 6, '#f58ca5', { seed: 408, rim: false, shadow: 0 });
    PK.ellipse(K, 32, 8, 10, 6, '#f58ca5', { seed: 409, rim: false, shadow: 0 });
  }
  function cnPolaroid(K, x, y, s, rot, dev, t) {
    K.save();
    K.translate(x, y);
    K.rotate(rot * D);
    K.scale(s, s);
    PK.rect(K, -150, -180, 300, 370, 6, CREAM, { seed: 401, lift: 0.5, tone: true });
    K.save();
    K.beginPath();
    K.rect(-128, -158, 256, 262);
    K.clip();
    cnPortrait(K, dev, t);
    K.restore();
    PK.heart(K, 0, 150, 0.38, RED, { seed: 410, shadow: 0.5 });
    K.restore();
  }

  // camera flash: a white paper starburst that blooms and fades
  function cnFlash(K, x, y, t, t0) {
    const dt = t - t0;
    if (dt < 0 || dt > 0.5) return;
    const u = dt / 0.5, r = 80 + 420 * oCub(u);
    K.save();
    K.globalAlpha *= 1 - u;
    PK.star(K, x, y, r, r * 0.45, '#ffffff', { n: 10, seed: 320, rot: t * 60 });
    K.restore();
  }

  // HADIAH prize marquee: swinging on two strings, bulbs chase once lit
  function cnBulbs(K, on, t) {
    const bulbs = [];
    for (let i = 0; i < 9; i++) bulbs.push([-200 + i * 50, -90]);
    bulbs.push([235, -30], [235, 30]);
    for (let i = 8; i >= 0; i--) bulbs.push([-200 + i * 50, 90]);
    bulbs.push([-235, 30], [-235, -30]);
    bulbs.forEach(([bx, by], i) => {
      const lit = on && ((i + Math.floor(t * 9)) % 3 !== 0);
      PK.ellipse(K, bx, by, 15, 15, lit ? '#fff3b0' : '#7a7386', { seed: 440 + i, small: true, shadow: 0.4, rim: lit });
      if (lit) PK.ellipse(K, bx - 4, by - 4, 5, 5, '#ffffff', { seed: 470 + i, rim: false, shadow: 0, small: true });
    });
  }
  function cnSign(K, x, y, t, tOn, swing) {
    const on = t >= tOn, flash = on ? Math.exp(-(t - tOn) * 4) : 0;
    K.save();
    K.translate(x, y - 330);
    K.rotate(swing * D);
    K.translate(0, 330);
    PK.line(K, [[-170, -80], [-150, -420]], 6, '#8a6440');
    PK.line(K, [[170, -80], [150, -420]], 6, '#8a6440');
    if (on) cnRays(K, 0, 0, t, { n: 12, r0: 150, r1: 330 + flash * 140, w: 0.09, cols: [YEL, '#fff3b0'], speed: 0.6, seed: 420 });
    const sc = 1.15 * (1 + flash * 0.12);
    K.scale(sc, sc);
    PK.rect(K, -235, -90, 470, 180, 26, on ? PINK : '#b9a3b4', { seed: 430, tone: true, lift: 0.4 });
    PK.rect(K, -205, -62, 410, 124, 16, on ? '#c2185b' : '#8f7d8c', { seed: 431, shadow: 0.3 });
    PK.text(K, 'HADIAH', 0, 30, 88, on ? CREAM : '#d9cfd6', { ls: 4 });
    cnBulbs(K, on, t);
    K.restore();
  }

  // dashed paper arrow that draws itself from a to b
  function cnArrow(K, ax, ay, bx, by, t, t0, col = INK) {
    const u = oCub(pp(t, t0, 0.35));
    if (u <= 0) return;
    const mx = (ax + bx) / 2 + 80, my = (ay + by) / 2;
    const pts = [];
    for (let k = 0; k <= 20 * u; k++) {
      const s = k / 20, v = 1 - s;
      pts.push([v * v * ax + 2 * v * s * mx + s * s * bx, v * v * ay + 2 * v * s * my + s * s * by]);
    }
    if (pts.length > 1) PK.line(K, pts, 7, col, { dash: [18, 12], shadow: 0.3 });
    if (u > 0.97) {
      const a = Math.atan2(by - my, bx - mx);
      K.save();
      K.translate(bx, by);
      K.rotate(a);
      PK.paper(K, [[0, 0], [-36, -20], [-36, 20]], col, { seed: 330, small: true });
      K.restore();
    }
  }

  // dopamine gumballs pouring out of the sign and bouncing on the floor
  const GB = Array.from({ length: 18 }, (_, i) => ({
    dx: (i % 5 - 2) * 34,
    vx: (hs(i + 1) - 0.5) * 680,
    vy: -380 - hs(i + 4) * 320,
    dl: i * 0.045,
    fl: 1380 - (i % 3) * 18,
    col: [YEL, '#ff9ec4', MINT, '#ffb02e'][i % 4],
  }));
  function cnGumballs(K, t, t0, x0, y0) {
    GB.forEach((b, i) => {
      const st = t0 + b.dl;
      if (t < st) return;
      const dt = t - st, g = 2600, yl = b.fl - y0;
      const tHit = (-b.vy + Math.sqrt(b.vy * b.vy + 2 * g * yl)) / g;
      let x, y;
      if (dt < tHit) {
        x = x0 + b.dx + b.vx * dt;
        y = y0 + b.vy * dt + 0.5 * g * dt * dt;
      } else {
        const db = dt - tHit;
        x = x0 + b.dx + b.vx * tHit + b.vx * 0.15 * (1 - Math.exp(-db * 3));
        y = b.fl - Math.abs(Math.sin(db * 9)) * Math.exp(-db * 4) * 70 - Math.abs(Math.sin(t * 4 + i)) * 6;
      }
      x = cl(x, 90, 990);
      K.save();
      K.translate(x, y);
      K.rotate((b.vx * 0.4 * Math.min(dt, tHit + 0.6)) * D);
      PK.ellipse(K, 0, 0, 26, 26, b.col, { seed: 480 + i, small: true });
      PK.ellipse(K, -8, -8, 7, 6, '#ffffff', { seed: 500 + i, rim: false, shadow: 0, small: true });
      K.restore();
    });
  }

  // ── judge's office inside the brain (lamp level 0..1 = how awake the judging is) ──
  function cnLamp(K, x, top, t, level, flick) {
    const sw = Math.sin(t * 2.2) * 7 + flick * 5;
    K.save();
    K.translate(x, top);
    K.rotate(sw * D);
    if (level > 0.05) {
      K.save();
      K.globalAlpha *= level * 0.55;
      PK.paper(K, [[-28, 112], [28, 112], [150, 330], [-150, 330]], '#fff3b0', { seed: 610, shadow: 0, rim: false, raw: true });
      K.restore();
    }
    PK.line(K, [[0, 0], [0, 70]], 5, '#2c2950', { shadow: 0.3 });
    PK.paper(K, [[-22, 68], [22, 68], [56, 116], [-56, 116]], '#3cc9a8', { seed: 611 });
    PK.ellipse(K, 0, 120, 18, 12, PK.mix('#5a5570', '#fff3b0', level), { seed: 612, small: true, rim: false });
    K.restore();
  }
  function cnPeople(K, t, people, bot) {
    if (people <= 0) return;
    [[255, '#ff9ec4', 0], [345, MINT, 1]].forEach(([px, col, k]) => {
      const off = (1 - oBack(cl(people - k * 0.25))) * -300;
      const by = bot - 16 + PK.bob(t, k + 4, 5);
      K.save();
      K.translate(px + off, by);
      K.rotate(PK.wob(t, k + 30, 3) * D);
      PK.rect(K, -34, -150, 68, 150, 30, col, { seed: 620 + k });
      PK.ellipse(K, 0, -188, 36, 40, '#f2c29c', { seed: 622 + k });
      PK.blob(K, 0, -216, 40, 18, 6, 0.2, k ? '#2f2a44' : '#6b3f2a', { seed: 624 + k, shadow: 0.3 });
      K.fillStyle = INK;
      K.beginPath();
      K.ellipse(-11, -188, 4, 5, 0, 0, 7);
      K.ellipse(11, -188, 4, 5, 0, 0, 7);
      K.fill();
      K.restore();
    });
  }
  function cnScoreCard(K, x, y, num, sx, rot) {
    K.save();
    K.translate(x, y);
    K.scale(sx, 1);
    K.rotate(rot * D);
    PK.rect(K, -52, -64, 104, 128, 8, CREAM, { seed: 633, lift: 0.3 });
    PK.text(K, num, 0, 34, 96, RED, { rim: false });
    K.restore();
  }
  function cnJudgeFace(K, t, sleep) {
    PK.ellipse(K, 0, 0, 60, 66, '#f2c29c', { seed: 634 });
    PK.blob(K, 0, -50, 56, 24, 7, 0.2, '#cfcad8', { seed: 635, shadow: 0.3 });
    K.strokeStyle = INK;
    K.lineWidth = 5;
    for (const ex of [-22, 22]) {
      K.beginPath();
      K.arc(ex, -2, 19, 0, Math.PI * 2);
      K.stroke();
      if (sleep > 0.5) {
        K.beginPath();
        K.arc(ex, -2, 9, 0.15, Math.PI - 0.15);
        K.stroke();
      } else {
        K.fillStyle = INK;
        K.beginPath();
        K.ellipse(ex + 2 + Math.sin(t * 1.7) * 3, 0, 5, 6, 0, 0, 7);
        K.fill();
      }
    }
    K.beginPath();
    K.moveTo(-3, -2);
    K.lineTo(3, -2);
    K.stroke();
    if (sleep < 0.5) {
      // strict brows, flat mouth
      K.beginPath();
      K.moveTo(-40, -32);
      K.lineTo(-8, -24);
      K.moveTo(40, -32);
      K.lineTo(8, -24);
      K.stroke();
      K.beginPath();
      K.moveTo(-14, 34);
      K.lineTo(14, 34);
      K.stroke();
    } else {
      K.beginPath();
      K.ellipse(0, 34, 8, 10 + Math.sin(t * 3) * 2, 0, 0, 7);
      K.stroke();
    }
  }
  function cnZzz(K, x, y, t) {
    for (let k = 0; k < 3; k++) {
      const u = (t * 0.7 + k / 3) % 1;
      K.save();
      K.globalAlpha *= Math.sin(u * Math.PI);
      PK.text(K, 'Z', x + u * 90 + k * 8, y - u * 200, 46 + k * 14, CREAM, { rot: -12 + k * 8 });
      K.restore();
    }
  }
  function cnOffice(K, t, o) {
    const { y0, level, raise, card, flip, people, sleep, cardFall } = o;
    const top = 990 + y0, X0 = 170, X1 = 910, BOT = 1390 + y0;
    K.save();
    PK.rect(K, X0, top, X1 - X0, BOT - top, 14, PK.mix('#1f1b3a', '#7d74c4', level), { seed: 600, tone: true, lift: 0.3 });
    for (let i = 0; i < 6; i++) {
      PK.line(K, [[X0 + 70 + i * 120, top + 20], [X0 + 70 + i * 120, BOT - 140]], 5, PK.mix('#191630', '#6a61b0', level), { shadow: 0, seed: 601 + i });
    }
    cnLamp(K, 600, top, t, level, o.flick || 0);
    cnPeople(K, t, people, BOT);
    // judge body
    const jx = 610, jy = BOT - 150, droop = sleep * 22 + Math.sin(t * 2) * 2;
    PK.rect(K, jx - 75, jy - 70, 150, 150, 40, '#3d3f55', { seed: 630 });
    PK.paper(K, [[jx - 14, jy - 70], [jx + 14, jy - 70], [jx, jy - 20]], CREAM, { seed: 631, small: true });
    // arm + score card
    const hx = jx + 105, hy = jy - 40 - raise * 130;
    if (cardFall == null) {
      PK.limb(K, [[jx + 60, jy - 40], [jx + 95, jy - 20 - raise * 50], [hx, hy]], 30, '#3d3f55', { seed: 632 });
      cnScoreCard(K, hx, hy - 60, flip < 0.5 ? card[0] : card[1], Math.max(0.04, Math.abs(Math.cos(flip * Math.PI))), PK.wob(t, 7, 2));
    } else {
      const f = PK.fall(t, cardFall, { vx: 120, vy: -200, spin: 160 });
      cnScoreCard(K, hx + f.x, Math.min(hy - 60 + f.y, BOT - 70), card[1], 1, f.r);
    }
    // judge head (droops when asleep)
    K.save();
    K.translate(jx, jy - 70);
    K.rotate(droop * D);
    K.translate(0, -70);
    cnJudgeFace(K, t, sleep);
    K.restore();
    // desk
    PK.rect(K, 410, BOT - 120, 420, 112, 10, '#b07a45', { seed: 640, tone: true });
    PK.rect(K, 395, BOT - 132, 450, 26, 8, '#8a5a30', { seed: 641 });
    PK.plate(K, 'PENILAI', 620, BOT - 58, { size: 44, fill: YEL, seed: 642 });
    // darkness over the room
    if (level < 1) {
      K.save();
      K.globalAlpha *= (1 - level) * 0.45;
      K.fillStyle = '#0d0b1e';
      K.fillRect(X0 + 6, top + 6, X1 - X0 - 12, BOT - top - 12);
      K.restore();
    }
    if (sleep > 0.3) cnZzz(K, jx + 60, jy - 170, t);
    K.restore();
  }

  // dashed callout from a spot on the brain down to the office corners
  function cnCallout(K, sx, sy, t, t0, yTop) {
    const u = oCub(pp(t, t0, 0.3));
    if (u <= 0) return;
    for (const cx of [190, 890]) {
      PK.line(K, [[sx, sy], [lerp(sx, cx, u), lerp(sy, yTop, u)]], 6, '#6b5bd6', { dash: [16, 14], shadow: 0 });
    }
  }

  // heart eyes over the brain's eyes
  function cnHeartEyes(K, bx, by, bs, t, t0) {
    if (t < t0) return;
    const hp = PK.pop(t, t0) * (1 + 0.1 * Math.sin(t * 10));
    for (const ex of [-55, 55]) {
      K.save();
      K.translate(bx + ex * bs, by + 22 * bs);
      K.scale(hp * 0.5 * bs / 0.85, hp * 0.5 * bs / 0.85);
      PK.heart(K, 0, 0, 1, RED, { seed: 79 });
      K.restore();
    }
  }

  // 10/10 rosette stamp
  function cnRosette(K, x, y, t, t0) {
    if (t < t0) return;
    const dt = t - t0;
    const s = dt < 0.14 ? 2.2 - 1.2 * (dt / 0.14) : 1 + Math.exp(-(dt - 0.14) * 7) * Math.cos((dt - 0.14) * 22) * 0.08;
    K.save();
    K.translate(x, y);
    K.rotate((-12 + PK.wob(t, 11, 3)) * D);
    K.scale(s, s);
    PK.paper(K, [[-50, 60], [-80, 190], [-40, 165], [-15, 200], [5, 70]], PINK, { seed: 650 });
    PK.paper(K, [[50, 60], [80, 190], [40, 165], [15, 200], [-5, 70]], '#c2185b', { seed: 651 });
    K.save();
    K.rotate(t * 0.8);
    PK.star(K, 0, 0, 140, 112, YEL, { n: 18, seed: 652, lift: 0.5 });
    K.restore();
    PK.ellipse(K, 0, 0, 100, 100, PINK, { seed: 653 });
    PK.text(K, '10/10', 0, 20, 62, CREAM, { rim: false });
    K.restore();
  }

  // a burst of hearts flying out of a point
  function cnHeartBurst(K, x, y, t, t0, n = 6, seed = 30) {
    if (t < t0) return;
    for (let k = 0; k < n; k++) {
      const f = PK.fall(t, t0, { vx: (hs(k + seed) - 0.5) * 900, vy: -900 - hs(k + seed + 10) * 400, g: 1500, spin: 90 });
      K.save();
      K.translate(x + f.x, y + f.y);
      K.rotate(f.r * D);
      PK.heart(K, 0, 0, 0.7, k % 2 ? RED : PINK, { seed: 80 + k });
      K.restore();
    }
  }

  // ═════════════ 01 · jatuh  [0 → CUT_B] ═════════════
  SC.jatuh = {
    noHeadline: () => true,
    cam: cnCam(0, CUT_B, 0.8),
    back: (T, K, t) => PK.bg.wall(K, t, '#ffd3df', { floor: '#f5b8c9' }),
    draw(T, K, t) {
      const landed = t >= HEART_LAND;
      const by = 1020 + PK.dropY(t, 0, 520) + PK.bob(t, 1, 6);
      cnRays(K, 540, by - 40, t, { r1: 700, speed: 0.5, beats: [W_TERJADI, W_OTAK, W_JATUH, HEART_LAND] });
      cnHearts(K, t, '#ff8fb4');
      cnQuestion(K, 880, 760, t, W_TERJADI, { size: 200 });
      cnLabel(K, 210, 600, t, W_OTAK, 'OTAK', 380, 880);
      const sq = PK.squash(t, 0.28), hsq = PK.squash(t, HEART_LAND, 0.3);
      PK.brain(K, 540, by, 1.45, {
        t,
        sx: sq.sx * (landed ? hsq.sy : 1),
        sy: sq.sy * (landed ? hsq.sx : 1),
        look: landed ? [0, -0.9] : t > W_TERJADI ? [0.9, -0.4] : [Math.sin(t * 1.5) * 0.5, -0.3],
        mouth: landed ? 'o' : (t > W_KITA ? 'small' : 'smile'),
        brow: landed ? 0.9 : 0.2,
        wave: t < W_OTAK ? 0.8 : 0,
      });
      cnFallingHeart(K, 540, by - 290, t, W_JATUH, HEART_LAND);
      if (landed) {
        PK.confetti(K, 540, by - 270, t - HEART_LAND, { n: 18, spread: 420, cols: [RED, PINK, YEL, CREAM], seed: 3 });
        cnSparkles(K, 540, by - 250, t, HEART_LAND, [[-300, -40], [-210, -230], [0, -310], [210, -230], [300, -40]], 28);
      }
    },
    top: (T, K, t) => PK.captions(K, t),
  };

  // ═════════════ 02 · hadiah  [CUT_B → CUT_C] ═════════════
  const SIGN_X = 400, SIGN_Y = 650;
  SC.hadiah = {
    noHeadline: () => true,
    cam: cnCam(CUT_B, CUT_C, 1),
    back: (T, K, t) => PK.bg.wall(K, t, '#ffe6b5', { floor: '#f3c98a' }),
    draw(T, K, t) {
      cnRays(K, 800, 900, t, { r1: 700, speed: -0.3, cols: ['#ffd98c', '#fff4dc'], seed: 340, beats: [W_FOTO, W_PUSAT + 0.28, W_DOPA, W_NYALA + 0.04] });
      cnHearts(K, t, '#ffb98a', 7);
      // sign drops on "pusat hadiah" and swings
      const sDrop = PK.dropY(t, W_PUSAT, 900);
      let swing = Math.sin(t * 1.7) * 2;
      if (t > W_PUSAT) swing += Math.sin((t - W_PUSAT) * 3.2) * 9 * Math.exp(-(t - W_PUSAT) * 0.6);
      if (t > W_NYALA) swing += Math.sin((t - W_NYALA) * 14) * 6 * Math.exp(-(t - W_NYALA) * 4);
      if (t >= W_PUSAT) cnSign(K, SIGN_X, SIGN_Y + sDrop, t, W_NYALA + 0.04, swing);
      // DOPAMIN plate
      const dp = PK.pop(t, W_DOPA);
      if (dp > 0.001) {
        K.save();
        K.translate(820, 1230);
        K.rotate((5 + PK.wob(t, 9, 3)) * D);
        K.scale(dp, dp);
        PK.plate(K, 'DOPAMIN', 0, 0, { size: 64, fill: MINT });
        K.restore();
      }
      // polaroid slides in from the right
      const ps = oBack(pp(t, W_LIHAT, 0.45)), px = 1300 - (1300 - 790) * ps, prot = 9 + PK.wob(t, 4, 2.5);
      const dev = oCub(pp(t, W_FOTO, 0.7));
      if (t >= W_DOPA) cnGumballs(K, t, W_DOPA, SIGN_X, SIGN_Y + 105);
      // brain (holds the photo)
      const by = 1180 + PK.bob(t, 2, 6), lit = t > W_NYALA;
      const ns = lit ? PK.squash(t, W_NYALA + 0.04, 0.18) : { sx: 1, sy: 1 };
      PK.brain(K, 380, by, 1.25, {
        t, sx: ns.sx, sy: ns.sy,
        handR: [px - 165, 990],
        look: t > W_SAJA ? (t > W_PUSAT + 0.3 && t < W_DOPA + 0.5 ? [-0.2, -1] : [0.9, -0.4]) : [0.3, 0],
        mouth: lit ? 'open' : t > W_SAJA ? 'smile' : 'small',
        brow: lit ? 1 : 0.3,
        wave: t > W_KAYA && t < W_NYALA ? 0.6 : 0,
      });
      cnPolaroid(K, px, 900, 1.15 * (1 + settle(t, W_FOTO, 20, 6, 0.08)), prot, dev, t);
      cnFlash(K, px, 880, t, W_FOTO);
      // small heart above the head on "saja"
      const hp = PK.pop(t, W_SAJA);
      if (hp > 0.001) {
        K.save();
        K.translate(600, 930 + PK.bob(t, 6, 8));
        K.scale(hp * 0.9 * (1 + 0.08 * Math.max(0, Math.sin(t * 9))), hp * 0.9);
        K.rotate(PK.wob(t, 6, 6) * D);
        PK.heart(K, 0, 0, 1, RED, { seed: 78 });
        K.restore();
      }
      // arrow: the sign is inside "otakmu"
      if (t < W_DOPA + 0.3) cnArrow(K, 760, 640, 470, 1000, t, W_OTAKMU, '#c2185b');
    },
    top: (T, K, t) => PK.captions(K, t),
  };

  // ═════════════ 03 · penilai  [CUT_C → CUT_D] ═════════════
  SC.penilai = {
    noHeadline: () => true,
    cam: cnCam(CUT_C, CUT_D, 0.8),
    back: (T, K, t) => PK.bg.wall(K, t, '#d8d2f3', { floor: '#b9b0e6' }),
    draw(T, K, t) {
      let level = 1;
      if (t >= W_JUSTRU && t < W_REDUP) level = Math.sin(t * 55) > 0 ? 1 : 0.55;
      else if (t >= W_REDUP) level = 1 - 0.88 * oCub(pp(t, W_REDUP, 0.6));
      cnRays(K, 540, 690, t, { r1: 700, speed: 0.25, cols: ['#b9aef0', '#efebff'], alpha: 0.35 + 0.65 * level, seed: 350, beats: [W_TAPI, W_LEBIH, W_ANEH, W_BAGIAN + 0.28, W_MENILAI, W_ORANG] });
      cnHearts(K, t, '#b7a9f0', 6);
      const shake = t > W_LEBIH && t < W_ANEH + 0.3 ? Math.sin(t * 40) * 6 : 0;
      const bx = -400 + 920 * oBack(pp(t, CUT_C, 0.45)) + shake, by = 690 + PK.bob(t, 3, 6);
      const oy = PK.dropY(t, W_BAGIAN, 1100);
      if (t >= W_BAGIAN) cnCallout(K, bx + 130, by + 35, t, W_BAGIAN + 0.2, 1000 + oy);
      const bz = 1.15 * (1 + 0.3 * Math.sin(Math.PI * pp(t, W_LEBIH, W_ANEH + 0.2 - W_LEBIH)));
      PK.brain(K, bx, by, bz, {
        t,
        look: t > W_BAGIAN + 0.4 ? [0.2, 1] : t > W_ANEH ? [0.9, -0.3] : [0, 0],
        mouth: t > W_REDUP + 0.3 ? 'smile' : t > W_ANEH ? 'o' : 'small',
        brow: t > W_ANEH ? 0.8 : 0,
        worried: t > W_LEBIH && t < W_BAGIAN ? 0.6 : 0,
      });
      // the judging spot on the brain dims with the lamp
      if (t >= W_BAGIAN) {
        const rp = PK.pop(t, W_BAGIAN + 0.15);
        K.save();
        K.translate(bx + 130, by + 35);
        K.scale(rp, rp);
        PK.ellipse(K, 0, 0, 34, 34, PK.mix('#5a5570', YEL, level), { seed: 660 });
        K.restore();
      }
      cnQuestion(K, 910, 700, t, W_ANEH, { size: 220 });
      if (t >= W_BAGIAN) cnOffice(K, t, {
        y0: oy, level,
        raise: oBack(pp(t, W_MENILAI, 0.3)),
        card: ['4', '3'], flip: pp(t, W_ORANG + 0.1, 0.25),
        people: pp(t, W_ORANG, 0.5),
        sleep: oCub(pp(t, W_REDUP + 0.15, 0.5)),
        cardFall: t > W_REDUP + 0.25 ? W_REDUP + 0.25 : null,
        flick: t > W_JUSTRU && t < W_REDUP ? Math.sin(t * 40) : 0,
      });
    },
    top: (T, K, t) => PK.captions(K, t),
  };

  // ═════════════ 04 · sempurna  [CUT_D → end] ═════════════
  SC.sempurna = {
    noHeadline: () => true,
    cam: cnCam(CUT_D, () => DUR_END(), 0.9),
    back: (T, K, t) => PK.bg.wall(K, t, '#ffd3df', { floor: '#f5b8c9' }),
    draw(T, K, t) {
      cnRays(K, 540, 860, t, { r1: 760, speed: 0.45, seed: 360, beats: [CUT_D + 0.28, W_SEBAB, W_DIA, W_LIHATAN, W_SEMPURNA] });
      cnHearts(K, t, '#ff8fb4', 11);
      const py = 860 + PK.dropY(t, CUT_D, 1000), sq = PK.squash(t, CUT_D + 0.28, 0.12);
      const zoom = 1 + 0.08 * oCub(pp(t, W_DIA, 0.3)) + settle(t, W_SEMPURNA, 18, 5, 0.05);
      K.save();
      K.translate(540, py);
      K.scale(sq.sx * zoom, sq.sy * zoom);
      cnPolaroid(K, 0, 0, 1.75, -4 + PK.wob(t, 12, 1.5), 1, t);
      K.restore();
      cnSparkles(K, 540, 860, t, W_DIA, [[-240, -260], [250, -220], [-290, 140], [280, 40], [0, -340]], 44);
      // brain pops up bottom-left and gets heart eyes
      const bp = PK.pop(t, W_SEBAB), bxx = 250, bs = 0.85;
      const byy = 1250 + (1 - Math.min(1, bp)) * 400 + PK.bob(t, 9, 5);
      if (t >= W_SEBAB) {
        PK.brain(K, bxx, byy, bs, { t, look: [0.7, -0.8], mouth: t > W_SEMPURNA ? 'open' : 'smile', brow: 0.6, blink: t >= W_LIHATAN ? 1 : undefined, wave: t > W_SEMPURNA ? 1 : 0 });
        cnHeartEyes(K, bxx, byy, bs, t, W_LIHATAN);
      }
      // perfect score
      cnRosette(K, 770, 1080, t, W_SEMPURNA);
      if (t >= W_SEMPURNA) {
        PK.confetti(K, 770, 1080, t - W_SEMPURNA, { n: 24, spread: 520, cols: [RED, PINK, YEL, MINT], seed: 8 });
        cnHeartBurst(K, 770, 1080, t, W_SEMPURNA, 6, 30);
      }
    },
    top: (T, K, t) => PK.captions(K, t),
  };
})();

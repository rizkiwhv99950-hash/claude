// Starter scenes for the paper format. They prove the kit runs with any script. They are a skeleton: invent this reel's own props.
// Screen coordinates. Key content stays above y 1400 and inside x 60..1020. Captions: paper strips from PK.captions in top().
(() => {
  const a0 = 0, b0 = CUT_B;
  SC.escena_a = {
    noHeadline: () => true,
    back: (T, K, t) => PK.bg.day(K, t, {}),
    draw(T, K, t) {
      const y0 = PK.dropY(t, a0 + 0.05, 500), sq = PK.squash(t, a0 + 0.5);
      K.save(); K.translate(540, 1240 + y0); K.scale(sq.sx, sq.sy);
      PK.kid(K, 0, 0, 0.95, { t, armL: 40 + Math.sin(t * 2) * 12, armR: 150, mouth: t % 2 < 1 ? 'open' : 'smile', brow: 0.5 });
      K.restore();
      const st = keyWordIdx(0, Math.min(8, WORDS.length - 1)), tw = wi(st), p = PK.pop(t, tw);
      if (p > 0.001) { K.save(); K.translate(540, 560); K.scale(p, p); K.rotate(PK.wob(t, 3, 2) * Math.PI / 180); PK.plate(K, cleanWord(st).toUpperCase(), 0, 0, { size: 96, fill: '#ffd54a' }); K.restore(); }
    },
    top: (T, K, t) => PK.captions(K, t),
  };
  SC.escena_b = {
    noHeadline: () => true,
    back: (T, K, t) => PK.bg.wall(K, t, '#a8d8ea', { floor: '#f3ead8' }),
    draw(T, K, t) {
      const c = clauses(b0, DUR_END()).slice(0, 3);
      c.forEach((q, i) => {
        const p = PK.pop(t, q.s); if (p <= 0.001) return;
        K.save(); K.translate(240 + i * 300, 640 + (i % 2) * 180 + PK.bob(t, i + 2, 6)); K.scale(p, p); K.rotate(PK.wob(t, i + 5, 3) * Math.PI / 180);
        PK.cloud(K, 0, 0, 0.9, '#fffaf0'); PK.plate(K, cleanWord(q.key).toUpperCase().slice(0, 10), 0, 6, { size: 52, fill: ['#ffd54a', '#ff9eb5', '#9be3c8'][i] });
        K.restore();
      });
      PK.kid(K, 540, 1320, 0.8, { t, run: t * 7, mouth: 'smile', flip: 1 });
    },
    top: (T, K, t) => PK.captions(K, t),
  };
})();

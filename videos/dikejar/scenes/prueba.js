// Prueba del kit: otro tema (un mensajero que une dos pueblos), solo con sombras.js y piezas.js. Sin voz.
(() => {
  const S = SOM, F2 = SOMP.flats, { FLOOR } = S, CART = S.spec('worker');
  const pueblos = () => S.flat('pueblos', 1400, 520, (x, w, h) => { S.house(x, 190, h - 8, 290, 170, 2); S.house(x, 1040, h - 8, 250, 150, 2); S.pagoda(x, 880, h - 8, 3, 120); });
  const carta = x => { x.rotate(150 * D2R); x.fillStyle = S.INK; x.fillRect(-34, -22, 68, 44); x.fillStyle = S.light(); x.fill(S.pth('M-30,-18 L0,4 L30,-18 L30,-14 L0,9 L-30,-14 Z')); x.fillStyle = S.INK; };
  SC.teatro = SOMP.teatro([{
    from: 0,
    lamp: t => ({ pal: 'dusk', pal2: 'amber', mix: t / 4.5, cx: 540, cy: 780, power: 1 }),
    cam: t => ({ z: 1 + t * 0.006, x: 540, y: 760 }),
    draw(K, t) {
      S.place(K, F2.far(), -300, FLOOR - 560, 0.17);
      S.moon(K, 800, 600, 120, t);
      S.birds(K, 620 - t * 60, 590, 0.9, t);
      S.place(K, F2.mid(), -500, FLOOR - 420, 0.28);
      S.place(K, pueblos(), 0, FLOOR - 512, 1);
      S.place(K, F2.ground(), -600, FLOOR - 60);
      const q = t / 4.5, x = lerp(250, 760, q);
      const camino = S.onFloor([120, FLOOR + 6], [x - 30, FLOOR + 6], FLOOR + 6, t, 30, 5);
      S.thread(K, camino, { w: 9 });
      const g = SOMP.staff(K, 330, 800); S.lantern(K, g[0], g[1], 0.9, t, 0);
      S.figure(K, CART, Object.assign(S.runCycle(t * 9), { x, s: 1.1, t, rods: false, prop: carta }));
      S.dust(K, t);
    },
    top(K, t) { S.bigText(K, ['El último', 'mensajero'], { x: 540, y: 270, size: 150, lead: 148, t, seed: 2 }); },
  }], [], { frases: [[0, 10]], opciones: { hold: 9 } });
})();

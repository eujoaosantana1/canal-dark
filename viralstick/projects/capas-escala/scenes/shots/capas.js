// capas.js — personagens/objetos sobre fundo chroma para recorte das capas
import { E, registerShot } from '/engine/core.js';
import { head, polyO, oval } from '/engine/toon.js';
import { CAST, bust, drawSet, ES, DT } from '../lib.js';
const chroma = (g, c) => { g.fillStyle = c || '#00ff00'; g.fillRect(0, 0, E.W, E.H); };
const K = {
  retrato(g, t, info, p) { chroma(g, p.bg); g.save(); g.translate(E.W / 2, E.H * (p.y || 0.42)); bust(g, 0, 0, p.r || 300, CAST[p.k], { expr: p.expr, look: p.look || [0, 0.05], blink: 0, talk: p.boca || 0 }); g.restore(); },
  arvore_capa(g, t, info, p) { chroma(g, '#ff00ff'); ES.arvore(g, E.W / 2, E.H * 0.98, p.s || 1.9, g => head(g, 0, 0, 78, { ...CAST[p.k], expr: p.expr || 'happy', blink: 0, front: true, talk: 0.4 }), 0); },
  noel_capa(g, t, info, p) { chroma(g, p.bg); DT.noel(g, E.W / 2, E.H * 0.97, p.s || 1.55, p.parado ? 2.3 : -0.9, { placa: p.placa || null }); },
  coxinha_capa(g, t, info, p) { chroma(g, p.bg); g.save(); g.translate(E.W / 2, E.H * 0.55); g.scale(2.6, 2.6);
    polyO(g, [[0, -170], [110, 40], [80, 120], [-80, 120], [-110, 40]], '#f5a623', 7); oval(g, 0, 70, 105, 60, '#f5a623', 0);
    for (let i = 0; i < 9; i++) oval(g, -60 + (i * 37) % 120, -20 + (i * 53) % 110, 6, 6, '#c77d14', 0); g.restore(); },
  fundo(g, t, info, p) { drawSet(g, p.set, 0, p.o || {}); },
};
for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

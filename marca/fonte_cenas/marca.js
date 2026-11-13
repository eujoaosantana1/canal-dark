import { E, registerShot } from '/engine/core.js';
import { label, box, oval, INK } from '/engine/toon.js';
import { CAST, bust, person, pill, M, MJ } from '../lib.js';
const NOME = globalThis.NOME_CANAL = 'REPARTIÇÃO DO UNIVERSO';
function ceuLimpo(g) {
  const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#9575cd'); gr.addColorStop(1, '#ffe0f0');
  g.fillStyle = gr; g.fillRect(-50, -50, E.W + 100, E.H + 100);
}
function nuvens(g, pts) { for (const [x, y, s] of pts) M.cloud(g, x, y, s, '#fffaff'); }
function carimbo(g, x, y, s, rot, txt) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.strokeStyle = '#d32f2f'; g.lineWidth = 14; g.strokeRect(-230, -62, 460, 124); g.lineWidth = 5; g.strokeRect(-212, -46, 424, 92);
  label(g, txt, 0, 4, { size: 72, color: '#d32f2f', stroke: 0 }); g.restore();
}
const K = {
  logo(g, t, info, p) {
    // quadrado 1080x1080 no centro (x 420..1500)
    ceuLimpo(g);
    nuvens(g, [[560, 300, 0.7], [1380, 260, 0.6], [520, 820, 0.8], [1420, 860, 0.7]]);
    const c = CAST[p.k || 'CONTADOR'];
    bust(g, 960, 520, 215, c, { expr: 'smile', blink: 0, look: [0.15, 0.1] });
    if (p.carimbo) carimbo(g, 960, 960, 0.9, -0.08, p.carimbo);
  },
  banner(g, t, info, p) {
    globalThis.PLACA_CEU = NOME;
    ceuLimpo(g);
    nuvens(g, [[120, 140, 0.8], [700, 90, 0.5], [1250, 110, 0.6], [1800, 160, 0.8], [60, 980, 0.9], [1880, 960, 0.9]]);
    // chão de nuvem
    g.beginPath(); g.ellipse(960, 1250, 1600, 420, 0, 0, Math.PI * 2); g.strokeStyle = INK; g.lineWidth = 10; g.stroke(); g.fillStyle = '#fffaff'; g.fill();
    // personagens nas laterais (aparecem no computador/TV)
    const L = p.chars || [];
    for (const ch of L) person(g, { ...ch, s: ch.s || 1.55, y: ch.y || 900 }, t, info);
    // título dentro da área segura (x 380..1540, y 382..698)
    box(g, 395, 398, 1130, 160, '#fffdf7', 8, 22);
    label(g, NOME, 960, 480, { size: 80, color: '#5e35b1', stroke: 0 });
    pill(g, 960, 620, p.sub || 'HISTÓRIAS DO BRASILEIRO COMUM', 1, { size: 50, h: 46, bg: '#e53935' });
    if (p.carimbo) carimbo(g, 1440, 392, 0.4, 0.12, p.carimbo);
  }
};
for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

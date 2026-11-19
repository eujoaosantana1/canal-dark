// escala.js — cenários do vídeo 10: fachadas (supermercado, escola) abertas ou fechadas, rua com tudo fechado, palco da escola.
import { E, rng } from '/engine/core.js';
import { box, oval, polyO, tube, label, INK } from '/engine/toon.js';
import * as M from './mundo.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

function ceu(g) { R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#90caf9'); M.cloud(g, 260, 110, 0.7); M.cloud(g, 1560, 90, 0.6); }
function calcada(g) {
  R(g, -E.W, 860, E.W * 3, 600, '#bdbdbd'); for (let x = -E.W; x < E.W * 2; x += 120) R(g, x, 860, 4, 600, 'rgba(0,0,0,.07)');
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
}
// porta de aço (fechada) com placa
function portaAco(g, x, y, w, h, placa) {
  box(g, x, y, w, h, '#90a4ae', 6, 4); for (let yy = y + 24; yy < y + h; yy += 26) R(g, x + 4, yy, w - 8, 5, '#78909c');
  if (placa) { box(g, x + w / 2 - 230, y + h * 0.3, 460, 170, '#fffde7', 6, 6); label(g, placa[0], x + w / 2, y + h * 0.3 + 55, { size: 46, color: '#c62828', stroke: 0 });
    if (placa[1]) label(g, placa[1], x + w / 2, y + h * 0.3 + 115, { size: 30, color: '#37474f', stroke: 0 }); }
}
// fachada de um prédio. o: nome, cor, fechado, escola, placa
export function fachada(g, t = 0, o = {}) {
  ceu(g);
  box(g, 120, 160, 1680, 700, o.escola ? '#fff3e0' : '#eeeeee', 8, 4);
  box(g, 260, 190, 1400, 130, o.cor || '#c62828', 7, 12); label(g, o.nome || 'LOJA', 960, 258, { size: o.nome && o.nome.length > 18 ? 70 : 84, color: '#fff', stroke: 0 });
  if (o.escola) { tube(g, [[1700, 860], [1700, 380]], 12, '#757575', 4); polyO(g, [[1704, 390], [1830, 420], [1704, 450]], '#43a047', 4); for (const x of [260, 1460]) box(g, x, 380, 200, 160, '#b3e5fc', 6, 4); }
  if (o.fechado) portaAco(g, 560, 380, 800, 480, o.placa || ['FECHADO POR FOLGA', 'COLETIVA · ASS.: UNIVERSO']);
  else { box(g, 560, 380, 800, 480, '#b3e5fc', 6, 4); R(g, 956, 380, 8, 480, INK); if (!o.escola) { oval(g, 760, 600, 60, 40, '#ffcc80', 4); box(g, 1080, 560, 120, 90, '#ef9a9a', 4, 6); } }
  calcada(g);
}
// rua com várias lojas fechadas
export function ruaFechada(g, t = 0, o = {}) {
  ceu(g);
  const lojas = [['PADARIA', '#8d6e63'], ['FARMÁCIA', '#2e7d32'], ['POSTO', '#f9a825'], ['MERCADO', '#c62828']];
  lojas.forEach(([nome, c], i) => { const x = 30 + i * 470; box(g, x, 200, 450, 660, '#eeeeee', 7, 4); box(g, x + 25, 225, 400, 90, c, 6, 8); label(g, nome, x + 225, 270, { size: 50, color: '#fff', stroke: 0 });
    portaAco(g, x + 45, 360, 360, 500, i === 1 ? ['FOLGA', ''] : null); });
  calcada(g);
}
// palco/auditório da escola. o.plateia (desenha cadeiras)
export function palco(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#4e342e');
  box(g, 80, 60, 1760, 560, '#6d4c41', 7, 6);
  for (const d of [-1, 1]) { const x0 = d < 0 ? 80 : 1840; polyO(g, [[x0, 60], [x0 + d * -360, 60], [x0 + d * -260, 360], [x0 + d * -320, 620], [x0, 620]], '#c62828', 6); }
  box(g, 80, 30, 1760, 70, '#b71c1c', 6, 6); label(g, 'APRESENTAÇÃO DE FIM DE ANO', 960, 66, { size: 44, color: '#ffe082', stroke: 0 });
  R(g, -E.W, 620, E.W * 3, 40, '#8d6e63'); R(g, -E.W, 660, E.W * 3, 900, '#3e2723');
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 620); g.lineTo(E.W * 2, 620); g.stroke();
}
// fantasia de árvore com o rosto da criança. head = função que desenha a cabeça no (0,0)
export function arvore(g, x, y, s, head, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(t * 2.2 + x) * 0.03);
  box(g, -45, -170, 90, 170, '#795548', 6, 10);
  for (const [dx, dy, r] of [[-110, -300, 95], [110, -300, 95], [0, -400, 110], [-70, -200, 85], [70, -200, 85]]) oval(g, dx, dy, r, r * 0.9, '#43a047', 7);
  for (const [dx, dy] of [[-120, -330], [130, -260], [40, -460], [-60, -170]]) oval(g, dx, dy, 14, 14, '#e53935', 4);
  g.save(); g.translate(0, -290); head(g); g.restore();
  g.restore();
}

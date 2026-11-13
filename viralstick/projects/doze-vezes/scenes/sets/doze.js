// doze.js — cenários do vídeo 9: quarto do Kauã (caixas de entrega), loja de celular, corredor, call center.
import { E, rng } from '/engine/core.js';
import { box, oval, polyO, tube, label, INK } from '/engine/toon.js';
import * as M from './mundo.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// caixa de entrega de papelão. o.fita, o.etiqueta
export function caixa(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -90, -120, 180, 120, '#c8a26b', 5, 6); R(g, -90, -120, 180, 14, '#b08850'); R(g, -12, -120, 24, 120, o.fita || '#d7ccc8');
  if (o.etiqueta !== false) { box(g, 26, -84, 52, 34, '#ffffff', 3, 3); R(g, 32, -76, 38, 4, '#9e9e9e'); R(g, 32, -66, 26, 4, '#9e9e9e'); }
  g.restore();
}
// pilha de caixas (n) a partir de x,y
export function pilha(g, x, y, n = 6, s = 1, seed = 3) {
  const r = rng(seed); let i = 0;
  for (let lin = 0; i < n; lin++) for (let col = 0; col < 3 - lin && i < n; col++, i++)
    caixa(g, x + (col + lin * 0.5) * 185 * s + (r() - 0.5) * 12, y - lin * 118 * s, s * (0.9 + r() * 0.15), { fita: r() > 0.5 ? '#d7ccc8' : '#90caf9' });
}
// quarto/sala do Kauã: sala comum + videogame, sofá novo e caixas
export function quarto(g, t = 0, o = {}) {
  M.sala(g, { ...o, box: false });
  // TV com videogame
  box(g, 1180, 360, 420, 250, '#263238', 7, 12); box(g, 1200, 378, 380, 214, o.night ? '#283593' : '#4fc3f7', 4, 6);
  if (!o.night) { polyO(g, [[1300, 520], [1360, 440], [1420, 520]], '#43a047', 4); oval(g, 1490, 430, 30, 30, '#ffd23f', 4); }
  box(g, 1300, 610, 180, 50, '#37474f', 5, 8); box(g, 1340, 618, 100, 18, '#212121', 3, 6);
  if (o.caixas !== false) pilha(g, 120, 880, o.n || 6, 0.95, 5);
  if (o.night) { g.fillStyle = 'rgba(15,15,50,.25)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
}
// celular de vitrine (desenho pequeno)
function celularVitrine(g, x, y, s, cor) { g.save(); g.translate(x, y); g.scale(s, s); box(g, -40, -80, 80, 160, '#212121', 5, 12); box(g, -32, -68, 64, 132, cor, 3, 6); oval(g, 0, 72, 6, 6, '#616161', 0); g.restore(); }
// etiqueta de preço com texto
export function etiqueta(g, x, y, s, l1, l2, cor = '#e53935', rot = -0.06) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  polyO(g, [[-200, -90], [170, -90], [220, 0], [170, 90], [-200, 90]], cor, 7); oval(g, 165, 0, 14, 14, '#ffffff', 4);
  label(g, l1, -20, -30, { size: 46, color: '#fff', stroke: 0 }); label(g, l2, -20, 34, { size: 40, color: '#ffe082', stroke: 0 });
  g.restore();
}
// loja de celular: faixa 12x SEM JUROS, vitrine, balcão
export function lojaCel(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#e3f2fd'); R(g, -E.W, 560, E.W * 3, 300, '#bbdefb');
  box(g, 360, 40, 1200, 130, '#d32f2f', 8, 14); label(g, '12x SEM JUROS', 960, 108, { size: 92, color: '#fff', stroke: 10 });
  const cores = ['#42a5f5', '#ab47bc', '#26a69a', '#ffa726', '#ec407a', '#7e57c2'];
  for (const yy of [330, 520]) { R(g, 1080, yy + 90, 760, 16, '#90a4ae'); cores.forEach((c, i) => celularVitrine(g, 1140 + i * 125, yy, 0.9, c)); }
  if (o.etiqueta !== false) etiqueta(g, 1460, 250, 0.7, 'R$ 3.000', '12x R$ 250');
  // balcão
  box(g, 260, 640, 640, 220, '#455a64', 7, 10); R(g, 260, 640, 640, 26, '#263238'); box(g, 560, 560, 120, 80, '#212121', 5, 8); box(g, 572, 570, 96, 50, '#69f0ae', 3, 4); label(g, '12x', 620, 596, { size: 28, color: INK, stroke: 0 });
  R(g, -E.W, 860, E.W * 3, 600, '#cfd8dc'); for (let x = -E.W; x < E.W * 2; x += 160) R(g, x, 860, 4, 600, 'rgba(0,0,0,.07)');
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
}
// corredor da casa (para o rolo da fatura)
export function corredor(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#f3d6b3');
  for (const x of [200, 800, 1400]) { box(g, x, 260, 260, 600, '#a1887f', 7, 6); oval(g, x + 220, 560, 12, 12, '#ffd54f', 4); }
  box(g, 560, 160, 160, 110, '#fffde7', 6, 6); oval(g, 640, 215, 30, 30, '#e57373', 4);
  R(g, -E.W, 860, E.W * 3, 600, '#a1887f'); for (let x = -E.W; x < E.W * 2; x += 120) R(g, x, 860, 4, 600, 'rgba(0,0,0,.08)');
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
}
// call center: baias com monitores
export function callCenter(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#eceff1'); R(g, -E.W, 120, E.W * 3, 40, '#cfd8dc');
  box(g, 700, 30, 520, 90, '#3949ab', 6, 8); label(g, 'CENTRAL DE ATENDIMENTO', 960, 76, { size: 40, color: '#fff', stroke: 0 });
  for (let i = 0; i < 4; i++) { const x = 120 + i * 460; box(g, x, 520, 380, 30, '#90a4ae', 5, 4); box(g, x + 110, 380, 160, 130, '#263238', 5, 8); box(g, x + 122, 392, 136, 100, '#80cbc4', 3, 4); box(g, x - 10, 420, 20, 400, '#b0bec5', 4, 4); }
  R(g, -E.W, 860, E.W * 3, 600, '#b0bec5'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
}

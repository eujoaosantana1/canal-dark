// pao.js — cenários do vídeo 5: rua com a Padaria do Nenê e a Maison Gabriel; esquina de Paris; pães.
import { E, rng, clamp, lerp } from '/engine/core.js';
import { box, oval, polyO, tube, label, character, INK } from '/engine/toon.js';
import { POSES, breathe } from '/engine/rig2d.js';
import * as M from './mundo.js';
import * as C from '../cast.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function ceu(g, c1 = '#7fc8f8', c2 = '#d9f1ff', y1 = 760) { const gr = g.createLinearGradient(0, 0, 0, y1); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H + y1 + E.H); }

// pãozinho francês (s ~ 1 = 160 px de largura)
export function pao(g, x, y, s = 1, rot = 0, craque = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  oval(g, 0, 0, 80, 44, '#e4a24a', 5); oval(g, 0, -8, 70, 30, '#eeb764', 0);
  g.strokeStyle = '#a8651f'; g.lineWidth = 6; g.beginPath(); g.moveTo(-40, -18); g.quadraticCurveTo(0, -4, 40, -22); g.stroke();
  if (craque > 0) { g.strokeStyle = '#7a4513'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = -0.6 + i * 0.25; g.beginPath(); g.moveTo(-10 + i * 6, -14); g.lineTo(-10 + i * 6 + Math.cos(a) * 22 * craque, -14 + Math.sin(a) * 18 * craque); g.stroke(); } }
  g.restore();
}
export function baguete(g, x, y, s = 1, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); oval(g, 0, 0, 300, 40, '#d99441', 5);
  g.strokeStyle = '#9a5a1a'; g.lineWidth = 6; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-220 + i * 110, -14); g.lineTo(-170 + i * 110, 10); g.stroke(); } g.restore();
}
export function cesta(g, x, y, s = 1, n = 6) {
  g.save(); g.translate(x, y); g.scale(s, s);
  for (let i = 0; i < n; i++) pao(g, -90 + (i % 4) * 60, -40 - Math.floor(i / 4) * 30, 0.5, -0.2 + i * 0.1);
  polyO(g, [[-150, -40], [150, -40], [120, 60], [-120, 60]], '#a1887f', 6); for (let i = 0; i < 5; i++) R(g, -130 + i * 60, -36, 6, 90, 'rgba(0,0,0,.15)');
  g.restore();
}
function fachada(g, x, y, w, h, cor, toldo, nome, nomeCor, o = {}) {
  box(g, x, y, w, h, cor, 7, 6);
  const tw = w + 40; for (let i = 0; i < 8; i++) box(g, x - 20 + i * tw / 8, y + 120, tw / 8, 70, i % 2 ? toldo : '#fffdf3', 5, 0);
  box(g, x + 20, y + 20, w - 40, 90, o.placaBg || '#fffdf3', 6, 10); label(g, nome, x + w / 2, y + 68, { size: o.placaSize || 54, color: nomeCor, stroke: 0 });
  box(g, x + 40, y + 230, w * 0.55, h - 260, '#bbdefb', 6, 6); box(g, x + w * 0.65, y + 230, w * 0.27, h - 230, '#5d4037', 6, 6);
}
// rua: Padaria do Nenê (esq.) e Maison Gabriel (dir.)
export function ruaPadarias(g, t = 0, o = {}) {
  ceu(g); M.cloud(g, 300, 110, 0.7); M.cloud(g, 1400, 80, 0.6);
  fachada(g, 60, 280, 760, 560, '#f7e3a6', '#e53935', 'PADARIA DO NENÊ', '#c62828');
  for (let i = 0; i < 4; i++) pao(g, 160 + i * 90, 640, 0.55);
  fachada(g, 1100, 280, 760, 560, '#37474f', '#212121', 'Maison Gabriel', '#fafafa', { placaBg: '#212121', placaSize: 58 });
  box(g, 1150, 520, 300, 60, '#fffdf3', 5, 6); label(g, 'PÃO R$ 40', 1300, 552, { size: 34, color: '#37474f', stroke: 0 });
  R(g, -E.W, 840, E.W * 3, 80, '#bdbdbd'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 840); g.lineTo(E.W * 2, 840); g.stroke();
  R(g, -E.W, 920, E.W * 3, 600, '#5f6672'); for (let x = -E.W; x < E.W * 2; x += 240) R(g, x, 1010, 120, 12, '#fafafa');
  if (o.fila === 'maison') { const pal = [C.POVO[0], C.POVO[1], C.POVO[2], C.POVO[3], C.POVO[4]]; for (let i = 0; i < 5; i++) character(g, { x: 1180 + i * 130, y: 900, s: 1.5, facing: -1, c: pal[i], pose: breathe(i % 2 ? POSES.phone : POSES.relaxed, t, 1, i), expr: 'neutral' }); }
}
// esquina de Paris com a boulangerie do Luc e a torre ao fundo
export function paris(g, t = 0, o = {}) {
  ceu(g, '#90caf9', '#fce4ec'); M.cloud(g, 260, 120, 0.6);
  // torre (silhueta)
  g.fillStyle = '#90a4ae'; g.beginPath(); g.moveTo(1500, 110); g.lineTo(1440, 520); g.lineTo(1400, 760); g.lineTo(1450, 760); g.lineTo(1500, 560); g.lineTo(1550, 760); g.lineTo(1600, 760); g.lineTo(1560, 520); g.closePath(); g.fill(); R(g, 1450, 420, 100, 14, '#78909c'); R(g, 1425, 600, 150, 16, '#78909c');
  // prédios
  for (let i = 0; i < 3; i++) { box(g, -60 + i * 420, 220 + (i % 2) * 40, 400, 640, ['#f5e6c8', '#efe0c0', '#f3dfc4'][i], 6, 4); polyO(g, [[-60 + i * 420, 230 + (i % 2) * 40], [-40 + i * 420, 170 + (i % 2) * 40], [320 + i * 420, 170 + (i % 2) * 40], [340 + i * 420, 230 + (i % 2) * 40]], '#78909c', 6); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) box(g, -20 + i * 420 + c * 120, 270 + (i % 2) * 40 + r * 130, 80, 100, '#b3e5fc', 4, 4); }
  // boulangerie
  box(g, 80, 600, 1100, 260, '#1a237e', 7, 6); box(g, 100, 560, 1060, 80, '#fffdf3', 6, 8); label(g, 'BOULANGERIE LUC', 630, 602, { size: 58, color: '#1a237e', stroke: 0 });
  box(g, 140, 660, 620, 180, '#e3f2fd', 5, 6); for (let i = 0; i < 4; i++) baguete(g, 300 + (i % 2) * 300, 720 + Math.floor(i / 2) * 60, 0.45, -0.1);
  box(g, 820, 660, 180, 200, '#5d4037', 5, 6);
  if (o.placa) { box(g, 1020, 660, 140, 110, '#fffdf3', 5, 6); label(g, 'PAIN', 1090, 700, { size: 28, color: '#2e7d32', stroke: 0 }); label(g, 'BRÉSILIEN', 1090, 735, { size: 22, color: '#2e7d32', stroke: 0 }); label(g, '2 €', 1090, 765, { size: 24, color: '#c62828', stroke: 0 }); }
  R(g, -E.W, 860, E.W * 3, 600, '#9e9e9e'); for (let x = -E.W; x < E.W * 2; x += 80) for (let y = 870; y < 1100; y += 50) { g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3; g.strokeRect(x + ((y / 50) % 2) * 40, y, 80, 50); }
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
  if (o.fila) { for (let i = 0; i < 7; i++) character(g, { x: 1250 + i * 120, y: 1000, s: 1.55, facing: -1, c: C.POVO[i % C.POVO.length], pose: breathe(i % 3 ? POSES.relaxed : POSES.crossArms, t, 1, i), expr: i % 2 ? 'smile' : 'happy' }); }
}

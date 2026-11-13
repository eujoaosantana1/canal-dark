// neve.js — cenários do vídeo 6: praça de Teresina (sol / neve), Urupema, casa fria, cafezal.
import { E, rng, clamp, lerp } from '/engine/core.js';
import { box, oval, polyO, tube, label, INK } from '/engine/toon.js';
import * as M from './mundo.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function ceu(g, c1, c2, y1 = 760) { const gr = g.createLinearGradient(0, 0, 0, y1); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H + y1 + E.H); }

// flocos caindo (desenhar por cima de tudo)
export function nevando(g, t, n = 120, k = 1) {
  const r = rng(11); g.fillStyle = '#ffffff';
  for (let i = 0; i < n; i++) { const x0 = r() * (E.W + 200) - 100, sp = 60 + r() * 90, sz = 3 + r() * 6, ph = r() * 10; const y = ((r() * E.H + t * sp) % (E.H + 40)) - 20; const x = x0 + Math.sin(t * 1.3 + ph) * 25; g.globalAlpha = 0.85 * k; g.beginPath(); g.arc(x, y, sz, 0, 7); g.fill(); }
  g.globalAlpha = 1;
}
function mangueira(g, x, y, s = 1, neve = false) {
  g.save(); g.translate(x, y); g.scale(s, s); tube(g, [[0, 0], [0, -220]], 34, '#6d4c41', 6);
  for (const [dx, dy, r] of [[-90, -260, 110], [80, -270, 120], [0, -360, 130]]) oval(g, dx, dy, r, r * 0.8, '#2e7d32', 6);
  if (neve) for (const [dx, dy, r] of [[-90, -330, 90], [80, -345, 100], [0, -450, 110]]) oval(g, dx, dy, r, r * 0.35, '#ffffff', 5);
  g.restore();
}
export function termometro(g, x, y, s = 1, txt = '38°C', cor = '#e53935') {
  g.save(); g.translate(x, y); g.scale(s, s); tube(g, [[0, 0], [0, -300]], 20, '#757575', 5);
  box(g, -150, -420, 300, 140, '#212121', 6, 12); label(g, txt, 0, -345, { size: 74, color: cor, stroke: 0, font: 'Nunito', weight: 900 }); g.restore();
}
// carrinho de isopor com dindins
export function carrinho(g, x, y, s = 1, neve = false) {
  g.save(); g.translate(x, y); g.scale(s, s);
  for (const wx of [-120, 120]) { oval(g, wx, -40, 40, 40, '#424242', 6); oval(g, wx, -40, 14, 14, '#9e9e9e', 4); }
  box(g, -190, -300, 380, 230, '#fafafa', 6, 14); box(g, -200, -320, 400, 40, '#e0e0e0', 6, 10);
  label(g, 'DINDIN', 0, -205, { size: 60, color: '#e65100', stroke: 0 }); label(g, 'R$ 1,00', 0, -140, { size: 40, color: '#2e7d32', stroke: 0 });
  tube(g, [[190, -260], [300, -380]], 14, '#9e9e9e', 5);
  if (neve) { oval(g, 0, -330, 200, 28, '#ffffff', 5); oval(g, -60, -345, 90, 22, '#ffffff', 0); }
  g.restore();
}
// praça com ponte estaiada ao fundo
export function praca(g, t = 0, o = {}) {
  const neve = !!o.neve;
  ceu(g, neve ? '#90a4ae' : '#4fc3f7', neve ? '#eceff1' : '#fff59d');
  if (!neve) { oval(g, 1650, 150, 90, 90, '#ffd54f', 0); g.fillStyle = 'rgba(255,213,79,.25)'; g.beginPath(); g.arc(1650, 150, 170, 0, 7); g.fill(); }
  // ponte estaiada
  g.strokeStyle = '#90a4ae'; g.lineWidth = 6; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(960, 140); g.lineTo(560 + i * 100, 520); g.stroke(); }
  tube(g, [[960, 520], [960, 120]], 30, '#b0bec5', 6); R(g, 300, 515, 1320, 26, '#b0bec5'); label(g, 'TERESINA', 960, 600, { size: 40, color: neve ? '#607d8b' : '#ef6c00', stroke: 0 });
  // chão
  R(g, -E.W, 760, E.W * 3, 600, neve ? '#f5f5f5' : '#e0c39a'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 760); g.lineTo(E.W * 2, 760); g.stroke();
  if (!neve) for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; g.beginPath(); for (let x = 0; x < E.W; x += 30) g.lineTo(x, 700 - i * 40 + Math.sin(x * 0.03 + t * 4 + i) * 6); g.stroke(); }
  mangueira(g, 180, 820, 1.0, neve); mangueira(g, 1760, 820, 1.0, neve);
  termometro(g, 1550, 860, 0.8, neve ? '−3°C' : '38°C', neve ? '#4fc3f7' : '#e53935');
  if (o.carrinho !== false) carrinho(g, o.carX || 1180, 980, 0.9, neve);
  if (neve) nevando(g, t, 140);
}
// Urupema: serra com araucárias e a pousada do Arlindo
function araucaria(g, x, y, s = 1, neve = true) { g.save(); g.translate(x, y); g.scale(s, s); tube(g, [[0, 0], [0, -320]], 16, '#5d4037', 4); for (let i = 0; i < 3; i++) { oval(g, 0, -320 - i * 40, 150 - i * 30, 30, '#33691e', 5); if (neve) oval(g, 0, -335 - i * 40, 120 - i * 26, 12, '#ffffff', 0); } g.restore(); }
export function urupema(g, t = 0, o = {}) {
  ceu(g, '#b0bec5', '#eceff1');
  polyO(g, [[-200, 700], [300, 300], [700, 620], [1100, 260], [1500, 560], [1900, 320], [2200, 700]], '#78909c', 6);
  polyO(g, [[200, 380], [300, 300], [400, 380]], '#ffffff', 0); polyO(g, [[1000, 340], [1100, 260], [1200, 340]], '#ffffff', 0); polyO(g, [[1800, 400], [1900, 320], [2000, 400]], '#ffffff', 0);
  R(g, -E.W, 720, E.W * 3, 700, '#fafafa'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 720); g.lineTo(E.W * 2, 720); g.stroke();
  araucaria(g, 160, 820, 1.1); araucaria(g, 1780, 800, 1.2); araucaria(g, 1600, 760, 0.8);
  // pousada de madeira
  box(g, 600, 420, 760, 400, '#8d6e63', 7, 6); for (let i = 0; i < 9; i++) R(g, 604, 440 + i * 42, 752, 5, 'rgba(0,0,0,.18)');
  polyO(g, [[560, 430], [980, 220], [1400, 430]], '#5d4037', 7); polyO(g, [[620, 410], [980, 236], [1340, 410]], '#ffffff', 0);
  box(g, 1150, 180, 70, 160, '#795548', 6, 4); for (let i = 0; i < 4; i++) { const u = ((t * 0.4 + i * 0.25) % 1); g.globalAlpha = 1 - u; oval(g, 1185 + Math.sin(u * 6) * 20, 160 - u * 160, 30 + u * 30, 22, '#eeeeee', 0); g.globalAlpha = 1; }
  for (let i = 0; i < 3; i++) box(g, 660 + i * 220, 500, 140, 120, o.lotado ? '#ffe082' : '#90a4ae', 5, 6);
  box(g, 860, 660, 160, 160, '#4e342e', 6, 6);
  box(g, 640, 300, 360, 70, '#fffdf3', 6, 10); label(g, 'POUSADA DO ARLINDO', 820, 337, { size: 34, color: '#4e342e', stroke: 0 });
  if (o.vagas || o.lotado) { box(g, 1150, 650, 180, 70, o.lotado ? '#43a047' : '#e53935', 5, 8); label(g, o.lotado ? 'LOTADO' : 'VAGAS', 1240, 688, { size: 34, color: '#fff', stroke: 0 }); }
  label(g, 'URUPEMA (SC)', 960, 960, { size: 46, color: '#78909c', stroke: 0 });
  if (o.neva !== false) nevando(g, t, 80, 0.8);
}
// frio dentro de casa (sobre a sala): geada na janela, fresta, fumacinha
export function frio(g, t) {
  g.fillStyle = 'rgba(200,230,255,.28)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(150 + (i * 29) % 340, 210 + (i * 47) % 260, 18 + (i % 3) * 8, 0, 7); g.fill(); }
  for (let i = 0; i < 5; i++) { const u = ((t * 0.7 + i * 0.2) % 1); tube(g, [[500, 260 + i * 40], [500 + u * 300, 260 + i * 40 + Math.sin(u * 8) * 15]], 4, 'rgba(255,255,255,.7)', 0); }
}
// cafezal (com ou sem geada)
export function cafezal(g, t = 0, o = {}) {
  ceu(g, o.geada ? '#b0bec5' : '#81d4fa', o.geada ? '#eceff1' : '#e1f5fe');
  polyO(g, [[-200, 640], [500, 380], [1100, 560], [1700, 360], [2200, 640]], o.geada ? '#cfd8dc' : '#7cb342', 6);
  R(g, -E.W, 640, E.W * 3, 700, o.geada ? '#eceff1' : '#8d6e63');
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const x = 60 + i * 230 + (r % 2) * 110, y = 700 + r * 120, s = 0.6 + r * 0.25; oval(g, x, y, 70 * s, 55 * s, o.geada ? '#90a4ae' : '#2e7d32', 5); if (o.geada) oval(g, x, y - 20 * s, 60 * s, 22 * s, '#ffffff', 0); else for (let k = 0; k < 4; k++) oval(g, x - 30 * s + k * 20 * s, y + 10 * s, 6 * s, 6 * s, '#c62828', 0); }
  label(g, o.geada ? 'GEADA' : 'CAFEZAL', 960, 140, { size: 70, color: o.geada ? '#546e7a' : '#33691e', stroke: 0 });
}

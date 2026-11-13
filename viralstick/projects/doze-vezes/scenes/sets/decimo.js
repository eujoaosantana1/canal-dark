// decimo.js — cenários do vídeo 8: loja de brinquedos do Seu Nonato (25 de Março), a rua cheia/vazia, sala da Dona Lurdes.
import { E, rng } from '/engine/core.js';
import { box, oval, polyO, tube, label, INK } from '/engine/toon.js';
import * as M from './mundo.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const PELE = ['#f6d2b0', '#e2a874', '#b9784a', '#7a4a2c'];
const ROUPA = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00', '#00897b', '#6d4c41', '#ec407a', '#5c6bc0'];

// Papai Noel de vitrine (boneco). ang = ângulo do braço direito; o.placa = texto pendurado; o.pilha = mostra pilha nova
export function noel(g, x, y, s = 1, ang = 0, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -110, -40, 220, 40, '#5d4037', 6, 8);                        // base
  box(g, -70, -150, 55, 115, '#b71c1c', 6, 10); box(g, 15, -150, 55, 115, '#b71c1c', 6, 10);  // pernas
  box(g, -75, -60, 65, 30, '#212121', 5, 8); box(g, 10, -60, 65, 30, '#212121', 5, 8);        // botas
  box(g, -100, -400, 200, 270, '#d32f2f', 7, 60);                     // corpo
  R(g, -100, -240, 200, 34, '#212121'); box(g, -24, -246, 48, 46, '#fdd835', 5, 6);           // cinto
  tube(g, [[-95, -360], [-140, -260]], 46, '#d32f2f', 6); oval(g, -145, -250, 24, 24, '#ffffff', 5); // braço parado
  g.save(); g.translate(95, -360); g.rotate(ang); tube(g, [[0, 0], [70, -90]], 46, '#d32f2f', 6); oval(g, 78, -104, 24, 24, '#ffffff', 5); g.restore();
  oval(g, 0, -470, 80, 80, '#f6d2b0', 6);                             // rosto
  polyO(g, [[-80, -455], [80, -455], [60, -360], [0, -330], [-60, -360]], '#ffffff', 6); // barba
  oval(g, -28, -485, 8, 10, INK, 0); oval(g, 28, -485, 8, 10, INK, 0); oval(g, 0, -462, 14, 11, '#ef9a9a', 3);
  polyO(g, [[-85, -520], [85, -520], [40, -640], [120, -600]], '#d32f2f', 6); oval(g, 125, -600, 26, 26, '#ffffff', 5);
  box(g, -92, -540, 184, 40, '#ffffff', 6, 18);
  if (o.pilha) { box(g, 120, -200, 46, 90, '#43a047', 5, 8); box(g, 132, -212, 22, 14, '#9e9e9e', 4, 3); label(g, '+', 143, -160, { size: 40, color: '#fff', stroke: 0 }); }
  if (o.placa) { tube(g, [[-60, -300], [0, -230], [60, -300]], 4, INK, 0); box(g, -120, -240, 240, 90, '#fffde7', 6, 8); label(g, o.placa, 0, -194, { size: 40, color: '#c62828', stroke: 0 }); }
  g.restore();
}
// braço do Noel: mexe sozinho; parado = caído
export const noelBraco = (t, parado) => parado ? 2.3 : -0.5 + Math.sin(t * 3.2) * 0.55;

export function presente(g, x, y, s = 1, c = '#e53935', fita = '#fdd835') {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -60, -100, 120, 100, c, 5, 6); R(g, -10, -100, 20, 100, fita); R(g, -60, -58, 120, 18, fita);
  oval(g, -22, -112, 22, 14, fita, 4); oval(g, 22, -112, 22, 14, fita, 4); g.restore();
}
export function bombeiro(g, x, y, s = 1) {                              // caminhão de bombeiro de brinquedo
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -150, -110, 300, 80, '#e53935', 6, 10); box(g, 60, -170, 90, 70, '#e53935', 6, 10); box(g, 80, -160, 50, 34, '#b3e5fc', 4, 4);
  tube(g, [[-140, -130], [40, -170]], 14, '#bdbdbd', 4); for (let i = 0; i < 5; i++) R(g, -120 + i * 34, -152 + i * -7, 6, 26, '#9e9e9e');
  for (const xx of [-90, 90]) { oval(g, xx, -28, 30, 30, '#263238', 6); oval(g, xx, -28, 12, 12, '#bdbdbd', 3); }
  oval(g, 105, -182, 14, 10, '#2196f3', 3); g.restore();
}
function brinquedo(g, x, y, k, r) {
  if (k === 0) { box(g, x - 40, y - 90, 80, 90, ROUPA[Math.floor(r() * 10)], 5, 6); R(g, x - 40, y - 60, 80, 10, '#fff'); }
  else if (k === 1) { oval(g, x, y - 36, 36, 36, ROUPA[Math.floor(r() * 10)], 5); tube(g, [[x - 30, y - 50], [x + 30, y - 22]], 6, '#fff', 0); }
  else if (k === 2) { oval(g, x, y - 40, 34, 40, '#a1887f', 5); oval(g, x, y - 90, 26, 24, '#a1887f', 5); oval(g, x - 20, y - 108, 10, 10, '#a1887f', 4); oval(g, x + 20, y - 108, 10, 10, '#a1887f', 4); oval(g, x - 8, y - 94, 3, 4, INK, 0); oval(g, x + 8, y - 94, 3, 4, INK, 0); }
  else { box(g, x - 50, y - 40, 100, 34, ROUPA[Math.floor(r() * 10)], 5, 10); oval(g, x - 28, y - 6, 12, 12, '#263238', 4); oval(g, x + 28, y - 6, 12, 12, '#263238', 4); }
}
// interior da loja. o: vazia, night, parado (Noel parado + placa SUSPENSO), semNatal, pilha
export function loja(g, t = 0, o = {}) {
  const n = !!o.night;
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, n ? '#5d5470' : '#fff3e0'); R(g, -E.W, 560, E.W * 3, 300, n ? '#544b66' : '#ffe0b2');
  box(g, 600, 50, 760, 110, '#c62828', 7, 14); label(g, 'NONATO BRINQUEDOS', 980, 92, { size: 54, color: '#fff', stroke: 0 }); label(g, 'E PRESENTES · DESDE 1996', 980, 140, { size: 26, color: '#ffe082', stroke: 0 });
  // vitrine com o Noel
  box(g, 70, 210, 470, 650, n ? '#3b4a6b' : '#d6eef8', 8, 6); R(g, 70, 820, 470, 40, '#8d6e63');
  noel(g, 300, 822, 0.88, noelBraco(t, o.parado), { placa: o.parado ? 'SUSPENSO' : null, pilha: o.pilha });
  if (!o.parado && !o.semNatal) label(g, 'FELIZ NATAL', 305, 262, { size: 46, color: '#c62828', stroke: 8 });
  for (const [xx, yy] of [[130, 760], [470, 770]]) presente(g, xx, yy + 50, 0.7, xx < 300 ? '#43a047' : '#1e88e5');
  // prateleiras com brinquedos
  const r = rng(13);
  for (const yy of [320, 480, 640]) { R(g, 1080, yy, 760, 16, '#6d4c41'); R(g, 1080, yy + 16, 760, 6, 'rgba(0,0,0,.15)'); for (let i = 0; i < 7; i++) brinquedo(g, 1130 + i * 108, yy, Math.floor(r() * 4), r); }
  // balcão com caixa registradora
  box(g, 640, 640, 380, 220, '#8d6e63', 7, 8); R(g, 640, 640, 380, 26, '#6d4c41');
  box(g, 860, 540, 130, 100, '#546e7a', 6, 10); box(g, 880, 555, 90, 34, '#a5d6a7', 4, 4); label(g, o.vazia ? '0,00' : '89,90', 925, 574, { size: 22, color: INK, stroke: 0 });
  bombeiro(g, 740, 640, 0.45);
  // festão de Natal
  if (!o.semNatal) { g.strokeStyle = '#2e7d32'; g.lineWidth = 16; g.beginPath(); for (let x = 0; x <= 1920; x += 20) g.lineTo(x, 190 + Math.sin(x / 140) * 26); g.stroke(); for (let x = 70; x < 1920; x += 140) oval(g, x, 214 + Math.sin(x / 140) * 26, 14, 14, ['#e53935', '#fdd835', '#1e88e5'][(x / 140 | 0) % 3], 4); }
  // chão
  R(g, -E.W, 860, E.W * 3, 600, n ? '#4a4258' : '#d7ccc8'); for (let x = -E.W; x < E.W * 2; x += 160) R(g, x, 860, 4, 600, 'rgba(0,0,0,.07)');
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
  if (o.vazia) { g.fillStyle = 'rgba(40,40,60,.12)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
  if (n) { g.fillStyle = 'rgba(15,15,50,.25)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); oval(g, 960, 30, 60, 22, '#fff59d', 5); }
}
// multidão simples (fundo)
export function multidao(g, t, n = 26, y = 900, seed = 5, x0 = -60, passo = 80) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = x0 + i * passo + r() * 30, yy = y + r() * 30 + Math.sin(t * 3 + i) * 4, c = ROUPA[Math.floor(r() * 10)], s = 0.85 + r() * 0.3;
    box(g, x - 34 * s, yy - 150 * s, 68 * s, 150 * s, c, 5, 28 * s); oval(g, x, yy - 180 * s, 28 * s, 28 * s, PELE[Math.floor(r() * 4)], 5);
    if (r() > 0.6) { R(g, x + 30 * s, yy - 90 * s, 40 * s, 44 * s, '#fffde7'); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x + 30 * s, yy - 90 * s, 40 * s, 44 * s); } // sacola
  }
}
// Rua 25 de Março. o.vazia: ninguém + bola rolando
export function rua25(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#90caf9');
  const lojas = [['ENFEITES', '#43a047'], ['NONATO BRINQUEDOS', '#c62828'], ['TECIDOS', '#5c6bc0'], ['BIJUTERIAS', '#8e24aa'], ['PRESENTES', '#fb8c00']];
  lojas.forEach(([nome, c], i) => { const x = -120 + i * 440; box(g, x, 120, 430, 740, i % 2 ? '#ffe0b2' : '#ffccbc', 7, 4); box(g, x + 20, 150, 390, 90, c, 6, 8); label(g, nome, x + 215, 197, { size: nome.length > 12 ? 34 : 46, color: '#fff', stroke: 0 }); box(g, x + 50, 300, 330, 380, '#b3e5fc', 6, 4); box(g, x + 130, 700, 170, 160, '#6d4c41', 6, 4); });
  // varal de luzes
  for (const yy of [60, 100]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); for (let x = 0; x <= 1920; x += 30) g.lineTo(x, yy + Math.sin(x / 200) * 20); g.stroke(); for (let x = 30; x < 1920; x += 90) oval(g, x, yy + 12 + Math.sin(x / 200) * 20, 10, 13, ['#e53935', '#fdd835', '#43a047'][(x / 90 | 0) % 3], 3); }
  tube(g, [[1720, 860], [1720, 420]], 16, '#455a64', 5); box(g, 1560, 400, 320, 80, '#2e7d32', 6, 6); label(g, 'R. 25 DE MARÇO', 1720, 442, { size: 36, color: '#fff', stroke: 0 });
  R(g, -E.W, 860, E.W * 3, 600, '#bdbdbd'); for (let x = -E.W; x < E.W * 2; x += 120) R(g, x, 860, 4, 600, 'rgba(0,0,0,.07)');
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
  if (!o.vazia) { multidao(g, t, 26, 890, 5); multidao(g, t, 24, 960, 9, -20, 85); }
  else { const bx = -100 + ((t * 260) % 2300); g.save(); g.translate(bx, 990); g.rotate(t * 4); oval(g, 0, 0, 70, 70, '#ffffff', 7); polyO(g, [[0, -24], [23, -7], [14, 21], [-14, 21], [-23, -7]], INK, 0); g.restore(); }
}
// sala da Dona Lurdes: sala comum + arvorezinha e fotos dos netos
export function casaLurdes(g, t = 0, o = {}) {
  M.sala(g, o);
  for (let i = 0; i < 3; i++) { box(g, 1300 + i * 130, 260, 100, 120, '#fffde7', 6, 6); oval(g, 1350 + i * 130, 305, 22, 22, PELE[i + 1], 4); box(g, 1325 + i * 130, 330, 50, 40, ROUPA[i * 3], 4, 10); }
  polyO(g, [[1700, 860], [1860, 860], [1780, 560]], '#2e7d32', 6); box(g, 1760, 860, 40, 30, '#6d4c41', 5, 4);
  for (const [x, y, c] of [[1750, 760, '#e53935'], [1810, 700, '#fdd835'], [1770, 640, '#1e88e5'], [1820, 810, '#fdd835']]) oval(g, x, y, 12, 12, c, 3);
}
// greve geral de 1962: rua + multidão com cartazes, tom sépia
export function greve(g, t = 0, o = {}) {
  M.rua(g, o);
  multidao(g, t, 24, 900, 21, -40, 84);
  const cart = ['13º JÁ!', 'GREVE GERAL', 'ABONO DE NATAL POR LEI', '13º JÁ!'];
  cart.forEach((c, i) => { const x = 260 + i * 460, y = 560 + Math.sin(t * 2.5 + i) * 12; tube(g, [[x, y + 60], [x, y + 260]], 12, '#6d4c41', 4); box(g, x - 170, y - 60, 340, 130, '#fffde7', 6, 6); label(g, c, x, y + 6, { size: c.length > 12 ? 30 : 46, color: '#c62828', stroke: 0 }); });
  multidao(g, t, 22, 980, 27, -10, 92);
  g.fillStyle = 'rgba(112,66,20,.28)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
}

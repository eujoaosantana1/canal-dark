// feriado.js — cenários do vídeo 4: loja Fábio Móveis, outdoor, casa da Rose (pote PRAIA), praia de Ubatuba com pousada e filial.
import { E, rng, clamp, lerp, ease } from '/engine/core.js';
import { box, oval, polyO, tube, label, head, INK } from '/engine/toon.js';
import * as M from './mundo.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function ceu(g, night, y1 = 760) { const gr = g.createLinearGradient(0, 0, 0, y1); gr.addColorStop(0, night ? '#0e1438' : '#7fc8f8'); gr.addColorStop(1, night ? '#2b2f6a' : '#d9f1ff'); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H + y1 + E.H); }

export function sofa(g, x, y, s = 1, c = '#c62828', preco) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -200, -150, 400, 110, c, 6, 26); box(g, -230, -60, 460, 80, c, 6, 20); box(g, -250, -110, 60, 140, c, 6, 18); box(g, 190, -110, 60, 140, c, 6, 18);
  R(g, -200, 20, 14, 30, '#5d4037'); R(g, 186, 20, 14, 30, '#5d4037');
  if (preco) { box(g, 60, -230, 170, 80, '#ffd23f', 5, 6); label(g, preco, 145, -188, { size: 34, color: '#c62828', stroke: 0 }); }
  g.restore();
}
export function placaLoja(g, x, y, s = 1, txt = 'FÁBIO MÓVEIS') { g.save(); g.translate(x, y); g.scale(s, s); box(g, -380, -70, 760, 140, '#c62828', 7, 14); label(g, txt, 0, 8, { size: 76, color: '#fff', stroke: 0 }); g.restore(); }
// cara do Fábio (outdoor)
export function caraFabio(g, x, y, r, sorriso = true) { head(g, x, y, r, { skin: '#f6d2b5', hair: 'short', hairColor: '#111', expr: sorriso ? 'happy' : 'neutral' }); }

export function loja(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#ffe0d6'); R(g, -E.W, 580, E.W * 3, 20, '#e8b8a8');
  placaLoja(g, 960, 150, 1.0);
  for (let i = 0; i < 5; i++) { const x = 160 + i * 400; box(g, x - 90, 260, 180, 26, '#fff59d', 4, 10); }
  box(g, 1460, 300, 380, 280, '#fffdf3', 6, 6); label(g, 'PROMOÇÃO', 1650, 360, { size: 50, color: '#c62828', stroke: 0 }); label(g, '10x SEM JUROS', 1650, 440, { size: 40, color: '#37474f', stroke: 0 });
  R(g, -E.W, 860, E.W * 3, 600, '#cfd8dc'); for (let x = -E.W; x < E.W * 2; x += 200) R(g, x, 860, 4, 600, 'rgba(0,0,0,.08)'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
  if (o.sofas !== false) { sofa(g, 330, 870, 0.9, '#c62828', 'R$ 1.999'); sofa(g, 1590, 870, 0.9, '#5c6bc0', 'R$ 2.499'); }
  if (o.vazia) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
}
export function outdoor(g, t = 0, o = {}) {
  ceu(g, false); M.cloud(g, 260, 110, 0.7); M.cloud(g, 1500, 80, 0.6);
  tube(g, [[700, 880], [700, 560]], 30, '#757575', 6); tube(g, [[1220, 880], [1220, 560]], 30, '#757575', 6);
  box(g, 380, 140, 1160, 440, '#fffdf3', 8, 10); box(g, 380, 140, 1160, 110, '#c62828', 8, 10); label(g, 'FÁBIO MÓVEIS', 960, 200, { size: 80, color: '#fff', stroke: 0 });
  caraFabio(g, 620, 410, 110); sofa(g, 1060, 520, 0.85, '#c62828'); label(g, 'AQUI O SOFÁ', 1320, 330, { size: 46, color: '#c62828', stroke: 0 }); label(g, 'NÃO TIRA FOLGA!', 1320, 390, { size: 46, color: '#c62828', stroke: 0 });
  R(g, -E.W, 860, E.W * 3, 600, '#5f6672'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
  for (let x = -E.W; x < E.W * 2; x += 240) R(g, x, 960, 120, 12, '#fafafa');
}
// pote de vidro PRAIA. k: 0..1 cheio; quebrado
export function pote(g, x, y, s = 1, k = 0.5, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (o.quebrado) { for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; polyO(g, [[Math.cos(a) * 60, Math.sin(a) * 20], [Math.cos(a) * 140, Math.sin(a) * 40 - 20], [Math.cos(a + 0.4) * 120, Math.sin(a + 0.4) * 30]], 'rgba(200,230,255,.8)', 4); }
    for (let i = 0; i < 18; i++) oval(g, -150 + (i * 53) % 300, -10 + (i % 3) * 12, 18, 9, i % 3 ? '#ffd54f' : '#ffb74d', 3); g.restore(); return; }
  g.fillStyle = 'rgba(200,230,255,.55)'; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(-90, -200); g.lineTo(90, -200); g.quadraticCurveTo(120, -180, 120, -120); g.lineTo(120, 0); g.quadraticCurveTo(120, 20, 100, 20); g.lineTo(-100, 20); g.quadraticCurveTo(-120, 20, -120, 0); g.lineTo(-120, -120); g.quadraticCurveTo(-120, -180, -90, -200); g.closePath(); g.fill(); g.stroke();
  const h = 200 * k; g.save(); g.beginPath(); g.rect(-116, 16 - h, 232, h); g.clip(); for (let i = 0; i < 40; i++) oval(g, -100 + (i * 37) % 200, 10 - (i * 13) % Math.max(10, h), 20, 10, i % 3 ? '#ffd54f' : '#a5d6a7', 3); g.restore();
  box(g, -100, -240, 200, 40, '#8d6e63', 6, 8);
  box(g, -80, -130, 160, 60, '#fffdf3', 5, 6); label(g, 'PRAIA', 0, -98, { size: 40, color: '#1565c0', stroke: 0 });
  g.restore();
}
export function calendarioParede(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); box(g, -110, -130, 220, 260, '#fffdf3', 6, 6); box(g, -110, -130, 220, 60, '#c62828', 6, 6); label(g, '2026', 0, -98, { size: 36, color: '#fff', stroke: 0 }); for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) R(g, -90 + c * 38, -50 + r * 40, 26, 26, (r * 5 + c) % 7 === 3 ? '#ef9a9a' : '#e0e0e0'); g.restore(); }
export function casaRose(g, t = 0, o = {}) {
  M.sala(g, { box: false, sofa: o.sofa !== false, night: o.night });
  pote(g, 1640, 420, 0.55, o.pote ?? 0.6, { quebrado: o.quebrado });
  calendarioParede(g, 1130, 330, 0.9);
}
// ondas
function mar(g, t, y0 = 560) {
  R(g, -E.W, y0, E.W * 3, 300, '#1e88e5'); for (let k = 0; k < 4; k++) { g.strokeStyle = '#90caf9'; g.lineWidth = 6; g.beginPath(); for (let x = -100; x < E.W + 100; x += 20) g.lineTo(x, y0 + 30 + k * 60 + Math.sin(x * 0.02 + t * 2 + k) * 8); g.stroke(); }
}
export function pousada(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -300, -420, 600, 420, '#ffe0b2', 7, 6); polyO(g, [[-340, -410], [0, -560], [340, -410]], '#8d6e63', 7);
  for (let i = 0; i < 3; i++) box(g, -250 + i * 180, -360, 120, 110, o.luz ? '#fff59d' : '#90caf9', 5, 6);
  box(g, -330, -560 - 70, 660, 80, '#fffdf3', 6, 10); label(g, 'POUSADA DO ZÉ', 0, -585, { size: 46, color: '#00838f', stroke: 0 });
  R(g, -300, -200, 600, 14, '#8d6e63'); for (let i = 0; i < 9; i++) R(g, -290 + i * 72, -186, 8, 186, '#8d6e63');
  if (o.rede !== false) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(-250, -170); g.quadraticCurveTo(-120, -40, 10, -170); g.stroke(); g.fillStyle = '#ef5350'; g.beginPath(); g.moveTo(-230, -150); g.quadraticCurveTo(-120, -50, -10, -150); g.quadraticCurveTo(-120, -80, -230, -150); g.fill(); }
  if (o.placa) { box(g, 110, -150, 170, 70, o.lotado ? '#43a047' : '#e53935', 5, 8); label(g, o.lotado ? 'LOTADO' : 'VAGAS', 195, -112, { size: 30, color: '#fff', stroke: 0 }); }
  g.restore();
}
export function filial(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -260, -340, 520, 340, '#fffdf3', 7, 6); box(g, -280, -420, 560, 100, '#c62828', 7, 10); label(g, 'FÁBIO MÓVEIS UBATUBA', 0, -368, { size: 34, color: '#fff', stroke: 0 });
  if (o.fechada) { for (let i = 0; i < 8; i++) R(g, -240, -300 + i * 36, 480, 22, '#b0bec5'); box(g, -120, -190, 240, 60, '#fffdf3', 5, 6); label(g, 'FECHADO', 0, -158, { size: 36, color: '#c62828', stroke: 0 }); }
  else { for (let i = 0; i < 3; i++) { tube(g, [[-180 + i * 150, 0], [-180 + i * 150, -220]], 8, '#8d6e63'); polyO(g, [[-260 + i * 150, -220], [-180 + i * 150, -290], [-100 + i * 150, -220]], ['#e53935', '#ffd23f', '#43a047'][i], 5); } }
  g.restore();
}
export function praia(g, t = 0, o = {}) {
  ceu(g, false, 560); oval(g, 1650, 150, 70, 70, '#ffd54f', 0); M.cloud(g, 400, 120, 0.7);
  mar(g, t, 520);
  R(g, -E.W, 760, E.W * 3, 600, '#ffe082'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 760); g.lineTo(E.W * 2, 760); g.stroke();
  if (o.sem_predios !== true) { pousada(g, 1450, 880, 0.75, { placa: true, lotado: o.cheia, luz: o.cheia }); filial(g, 420, 880, 0.75, { fechada: o.vazia }); }
  if (o.cheia) { const R0 = rng(5); for (let i = 0; i < 6; i++) { const x = 600 + i * 95 + R0() * 30, y = 980 + R0() * 50; tube(g, [[x, y], [x, y - 200]], 7, '#8d6e63'); polyO(g, [[x - 90, y - 200], [x, y - 260], [x + 90, y - 200]], ['#e53935', '#ffd23f', '#43a047', '#1e88e5'][i % 4], 5); } }
}

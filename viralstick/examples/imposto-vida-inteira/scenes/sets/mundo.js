// sets/mundo.js — cenários e objetos do vídeo (estilo cartoon chapado). Coordenadas do palco 1920x1080, chão em GY.
import { E, clamp, lerp, rng, ease } from '/engine/core.js';
import { box, oval, polyO, blob, tube, label, sign, coin, INK } from '/engine/toon.js';

export const GY = 1000;
const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const floorLine = (g, y) => R(g, -E.W, y - 3, E.W * 3, 6, INK);
const sky = (g, c1, c2) => { const gr = g.createLinearGradient(0, -400, 0, 900); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); };

// ---------- objetos ----------
export function cloud(g, x, y, s = 1, c = '#ffffff') {
  const P = [[-60, 10, 70, 45], [10, -20, 80, 60], [80, 12, 65, 42]];
  const path = () => { g.beginPath(); for (const [a, b, rx, ry] of P) { g.moveTo(x + (a + rx) * s, y + b * s); g.ellipse(x + a * s, y + b * s, rx * s, ry * s, 0, 0, Math.PI * 2); } g.rect(x - 110 * s, y + 10 * s, 240 * s, 45 * s); };
  path(); g.strokeStyle = INK; g.lineWidth = 10; g.lineJoin = 'round'; g.stroke(); path(); g.fillStyle = c; g.fill();
}
export function shoebox(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (o.open !== false) { const R0 = rng(5); for (let i = 0; i < 9; i++) { g.save(); g.translate(-80 + i * 20, -78 - R0() * 22); g.rotate((R0() - 0.5) * 0.6); box(g, -14, -26, 28, 50, '#fffdf3', 3, 2); g.fillStyle = '#bbb'; for (let k = 0; k < 4; k++) g.fillRect(-9, -18 + k * 9, 18, 3); g.restore(); } }
  box(g, -110, -80, 220, 80, '#e57c3a', 5, 4); box(g, -110, -80, 220, 18, '#c55f22', 5, 2);
  if (o.label) label(g, o.label, 0, -38, { size: 26, color: '#fff', stroke: 6 });
  g.restore();
}
export function receipt(g, x, y, s = 1, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); box(g, -22, -36, 44, 72, '#fffdf3', 3, 2); g.fillStyle = '#aaa'; for (let k = 0; k < 6; k++) g.fillRect(-15, -27 + k * 10, k % 3 === 2 ? 16 : 30, 3); g.restore(); }
export function bus(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.facing || 1), s);
  const col = o.color || '#1e88e5';
  box(g, -330, -250, 660, 210, col, 6, 26);
  R(g, -326, -120, 652, 22, '#ffd23f');
  for (let i = 0; i < 5; i++) box(g, -290 + i * 110, -225, 92, 80, o.night ? '#ffe9a8' : '#bfe8fb', 5, 8);
  box(g, 230, -230, 85, 120, o.night ? '#ffe9a8' : '#bfe8fb', 5, 10);
  box(g, -320, -244, 210, 34, '#1b1b1f', 4, 6); label(g, o.sign || 'PIMENTAS–CENTRO', -215, -226, { size: 21, color: '#ffb300', stroke: 0, font: 'Nunito', weight: 900 });
  for (const wx of [-200, 200]) { oval(g, wx, -38, 46, 46, '#2b2b30', 6); oval(g, wx, -38, 20, 20, '#c9c9c9', 4); }
  if (o.driver) { g.save(); g.translate(272, -150); o.driver(g); g.restore(); }
  g.restore();
}
export function hilux(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.facing || 1), s);
  const c = o.color || '#f5f5f5';
  polyO(g, [[-300, -70], [-300, -170], [-30, -170], [10, -270], [190, -270], [250, -170], [320, -150], [330, -70]], c, 6);
  box(g, 30, -255, 70, 75, '#9fd6f0', 5, 8); box(g, 115, -255, 65, 75, '#9fd6f0', 5, 8);
  R(g, -300, -130, 630, 12, '#bdbdbd'); box(g, 300, -150, 30, 22, '#ffe082', 4, 4);
  for (const wx of [-190, 210]) { oval(g, wx, -60, 62, 62, '#2b2b30', 7); oval(g, wx, -60, 28, 28, '#cfcfcf', 5); }
  g.save(); g.translate(-150, -100); g.scale(o.facing || 1, 1); label(g, 'HILUX', 0, 0, { size: 30, color: '#9e9e9e', stroke: 0 }); g.restore();
  g.restore();
}
export function lamp(g, x, y, on = true, h = 520) {
  tube(g, [[x, y], [x, y - h], [x + 70, y - h - 20]], 16, '#5d6670');
  polyO(g, [[x + 40, y - h - 30], [x + 120, y - h - 30], [x + 105, y - h], [x + 55, y - h]], '#3d444c', 5);
  if (on) { g.save(); g.globalAlpha = 0.28; g.fillStyle = '#fff59d'; g.beginPath(); g.moveTo(x + 55, y - h); g.lineTo(x + 105, y - h); g.lineTo(x + 260, y); g.lineTo(x - 100, y); g.closePath(); g.fill(); g.restore(); oval(g, x + 80, y - h - 2, 26, 9, '#fff59d', 3); }
  else oval(g, x + 80, y - h - 2, 26, 9, '#555', 3);
}
export function house(g, x, y, w, h, c, o = {}) {
  box(g, x, y - h, w, h, c, 6, 0);
  polyO(g, [[x - 20, y - h], [x + w / 2, y - h - 110], [x + w + 20, y - h]], o.roof || '#c0573e', 6);
  box(g, x + w * 0.38, y - 170, w * 0.24, 170, o.door || '#7a4a2a', 5, 4);
  for (const wx of [x + 30, x + w - 30 - w * 0.22]) { box(g, wx, y - h + 50, w * 0.22, 90, o.night ? (o.dark ? '#263238' : '#ffe9a8') : '#bfe8fb', 5, 4); }
}
export function tv(g, x, y, s, draw) { g.save(); g.translate(x, y); g.scale(s, s); box(g, -230, -150, 460, 300, '#262a30', 8, 18); g.save(); g.beginPath(); g.rect(-205, -128, 410, 256); g.clip(); draw(g); g.restore(); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(-205, -128, 410, 256); g.restore(); }
export function phone(g, x, y, s, draw, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); box(g, -110, -210, 220, 420, '#212121', 7, 30); g.save(); g.beginPath(); g.rect(-95, -180, 190, 360); g.clip(); draw(g); g.restore(); g.restore(); }
export function letter(g, x, y, s = 1, rot = 0, o = {}) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); box(g, -180, -120, 360, 240, '#fff8e1', 6, 6); polyO(g, [[-180, -120], [0, 20], [180, -120]], '#ffecb3', 5); oval(g, 0, 20, 34, 34, o.seal || '#d32f2f', 5); label(g, o.mark || '☁', 0, 22, { size: 30, color: '#fff', stroke: 0 }); g.restore(); }
export function stamp(g, x, y, str, k = 1, o = {}) { if (k <= 0) return; const s = lerp(2.4, 1, ease.out(k)); g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.18); g.scale(s, s); g.globalAlpha *= clamp(k * 3); const w = o.w || 520; g.strokeStyle = o.color || '#2e7d32'; g.lineWidth = 14; g.strokeRect(-w / 2, -70, w, 140); label(g, str, 0, 6, { size: o.size || 92, color: o.color || '#2e7d32', stroke: 0 }); g.restore(); }
export function arrowDown(g, x, y, s = 1, c = '#ffd23f') { g.save(); g.translate(x, y); g.scale(s, s); polyO(g, [[-22, -80], [22, -80], [22, -10], [50, -10], [0, 40], [-50, -10], [-22, -10]], c, 6); g.restore(); }

// ---------- cenários ----------
export function sala(g, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H + 900, o.night ? '#7c6a8c' : '#f3d6b3');
  R(g, -E.W, 640, E.W * 3, 20, o.night ? '#5c4d6b' : '#d9b38c');
  // janela
  box(g, 140, 200, 360, 280, o.night ? '#1d2550' : '#9fd6f0', 7, 6);
  if (o.night) { g.fillStyle = '#fff59d'; g.beginPath(); g.arc(420, 260, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = '#1d2550'; g.beginPath(); g.arc(432, 252, 22, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(320, 200); g.lineTo(320, 480); g.moveTo(140, 340); g.lineTo(500, 340); g.stroke();
  // estante com a caixa
  box(g, 1420, 250, 380, 24, '#8d5a32', 5, 3); box(g, 1420, 420, 380, 24, '#8d5a32', 5, 3);
  for (let i = 0; i < 6; i++) box(g, 1440 + i * 26, 150, 22, 100, ['#e53935', '#43a047', '#1e88e5', '#fdd835', '#8e24aa', '#fb8c00'][i], 4, 2);
  if (o.box !== false) shoebox(g, 1640, 420, 0.75, { open: false, label: 'CUPONS' });
  // quadro
  box(g, 760, 190, 260, 190, '#fffdf3', 6, 4); g.fillStyle = '#81c784'; g.beginPath(); g.moveTo(780, 360); g.lineTo(860, 260); g.lineTo(930, 330); g.lineTo(1000, 280); g.lineTo(1000, 360); g.closePath(); g.fill();
  // chão
  R(g, -E.W, 860, E.W * 3, 600, o.night ? '#6b4e3a' : '#b07a4a'); floorLine(g, 860);
  for (let x = -E.W; x < E.W * 2; x += 160) R(g, x, 860, 4, 600, 'rgba(0,0,0,.15)');
  if (o.sofa !== false) { box(g, 620, 640, 680, 240, o.night ? '#3f5a8a' : '#4f7cc4', 6, 28); box(g, 660, 600, 600, 140, o.night ? '#46679c' : '#5b8ad6', 6, 24); box(g, 590, 690, 90, 200, '#3d65a8', 6, 20); box(g, 1240, 690, 90, 200, '#3d65a8', 6, 20); }
  if (o.night) { g.fillStyle = 'rgba(20,20,60,.25)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
}
export function quintal(g, t = 0) {
  sky(g, '#7fc8f8', '#d9f1ff'); cloud(g, 300, 120, 0.9); cloud(g, 1500, 90, 0.7);
  R(g, -E.W, 420, E.W * 3, 460, '#f2b880'); for (let x = -E.W; x < E.W * 2; x += 90) R(g, x, 420, 5, 460, 'rgba(0,0,0,.1)'); floorLine(g, 420);
  // bandeirinhas
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-60, 300); g.quadraticCurveTo(960, 420, 1980, 300); g.stroke();
  for (let i = 0; i < 20; i++) { const u = i / 19, x = lerp(-60, 1980, u), y = 300 + 120 * 4 * u * (1 - u) * 0.98; polyO(g, [[x - 22, y], [x + 22, y], [x, y + 46]], ['#e53935', '#fdd835', '#43a047', '#1e88e5'][i % 4], 3); }
  box(g, 620, 150, 680, 90, '#fffdf3', 6, 10); label(g, 'PARABÉNS VALDIR!', 960, 197, { size: 58, color: '#e53935', stroke: 0 });
  // churrasqueira
  box(g, 1500, 440, 300, 420, '#c1440e', 6, 6); for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) R(g, 1505 + c * 75 + (r % 2) * 37, 445 + r * 52, 3, 50, 'rgba(0,0,0,.25)');
  box(g, 1480, 600, 340, 40, '#5d4037', 6, 4); tube(g, [[1520, 580], [1780, 580]], 10, '#9e9e9e');
  for (let i = 0; i < 4; i++) { const y = 360 - ((t * 60 + i * 70) % 280); g.globalAlpha = clamp(1 - (360 - y) / 280) * 0.6; oval(g, 1650 + Math.sin(t * 2 + i) * 30, y, 40 + i * 6, 30, '#eeeeee', 0); g.globalAlpha = 1; }
  R(g, -E.W, 860, E.W * 3, 600, '#9ccc65'); floorLine(g, 860);
}
export function mesaChurrasco(g, x = 960, y = 860) {
  box(g, x - 420, y - 230, 840, 40, '#fafafa', 6, 6); tube(g, [[x - 360, y - 190], [x - 380, y]], 14, '#bdbdbd'); tube(g, [[x + 360, y - 190], [x + 380, y]], 14, '#bdbdbd');
  for (let i = 0; i < 6; i++) { const cx = x - 330 + i * 130; box(g, cx - 16, y - 290, 32, 60, i % 2 ? '#fdd835' : '#c62828', 4, 6); }
  oval(g, x + 40, y - 236, 90, 18, '#795548', 5); for (let i = 0; i < 5; i++) oval(g, x - 20 + i * 30, y - 250, 18, 10, '#8d3b1f', 3);
}
export function rua(g, o = {}) {
  const night = !!o.night;
  sky(g, night ? '#0e1438' : '#7fc8f8', night ? '#2b2f6a' : '#d9f1ff');
  if (night) { const R0 = rng(3); g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { g.globalAlpha = 0.4 + R0() * 0.6; g.fillRect(R0() * E.W * 1.4 - 200, R0() * 480, 3, 3); } g.globalAlpha = 1; }
  else { cloud(g, 260, 140, 0.8); cloud(g, 1350, 110, 0.65); }
  const cols = ['#ef9a9a', '#fff59d', '#a5d6a7', '#90caf9', '#ffcc80', '#ce93d8', '#80deea'];
  for (let i = -2; i < 9; i++) house(g, i * 300 + 20, 760, 260, 300, night ? '#7e8aa8' : cols[(i + 7) % 7], { night, dark: o.darkHouse === i, roof: night ? '#5a3a4a' : '#c0573e' });
  R(g, -E.W, 760, E.W * 3, 60, night ? '#5a5f70' : '#bdbdbd'); floorLine(g, 760);
  R(g, -E.W, 820, E.W * 3, 600, o.dirt ? '#a1724a' : (night ? '#3a3d48' : '#5f6672')); floorLine(g, 820);
  if (o.dirt) { const R0 = rng(8); for (let i = 0; i < 40; i++) oval(g, R0() * E.W * 1.3 - 100, 850 + R0() * 200, 10 + R0() * 18, 5 + R0() * 6, '#8a5d3a', 0); }
  else for (let x = -E.W; x < E.W * 2; x += 240) R(g, x, 930, 120, 12, night ? '#cfcfcf' : '#fafafa');
  if (o.lamps) o.lamps.forEach(([x, on]) => lamp(g, x, 790, on));
}
export function ceu(g, t = 0) {
  sky(g, '#b39ddb', '#ffe0f0');
  const R0 = rng(4); for (let i = 0; i < 8; i++) cloud(g, R0() * E.W * 1.2 - 100 + Math.sin(t * 0.3 + i) * 20, 80 + R0() * 300, 0.5 + R0() * 0.6, '#fffaff');
  // prédio
  box(g, 520, 120, 880, 140, '#fffdf7', 7, 10); label(g, 'RECEITA FEDERAL DO CÉU', 960, 192, { size: 62, color: '#5e35b1', stroke: 0 });
  // arquivos
  for (let i = 0; i < 4; i++) { box(g, 80 + i * 110, 420, 100, 420, '#90a4ae', 5, 6); for (let k = 0; k < 4; k++) { box(g, 92 + i * 110, 440 + k * 100, 76, 80, '#b0bec5', 4, 4); R(g, 118 + i * 110, 470 + k * 100, 24, 8, INK); } }
  for (let i = 0; i < 3; i++) for (let k = 0; k < 7; k++) box(g, 1470 + i * 130 + (k % 2) * 8, 820 - k * 46, 110, 44, ['#ffcc80', '#ffe082', '#bcaaa4'][(i + k) % 3], 4, 3);
  g.beginPath(); g.ellipse(960, 1150, 1500, 330, 0, 0, Math.PI * 2); g.strokeStyle = INK; g.lineWidth = 10; g.stroke(); g.fillStyle = '#fffaff'; g.fill();
}
export function mesaContador(g, x = 960, y = 900) { box(g, x - 380, y - 240, 760, 50, '#8d6e63', 6, 6); box(g, x - 350, y - 190, 700, 200, '#a1887f', 6, 0); for (let k = 0; k < 6; k++) box(g, x + 180 + (k % 2) * 6, y - 290 - k * 26, 140, 26, '#ffe082', 4, 3); }
export function posto(g) {
  sky(g, '#ffcc80', '#fff3e0');
  box(g, -100, 140, 2100, 120, '#d32f2f', 7, 0); label(g, 'POSTO BOM PREÇO', 960, 202, { size: 64, color: '#fff', stroke: 0 });
  for (const x of [260, 1660]) box(g, x - 25, 260, 50, 560, '#eeeeee', 6, 0);
  box(g, 1500, 360, 300, 200, '#263238', 6, 10); label(g, 'GASOLINA', 1650, 400, { size: 34, color: '#fff', stroke: 0 }); label(g, 'R$ 6,29', 1650, 470, { size: 70, color: '#ffd23f', stroke: 0 });
  R(g, -E.W, 820, E.W * 3, 600, '#9e9e9e'); floorLine(g, 820); for (let x = -E.W; x < E.W * 2; x += 300) R(g, x, 900, 140, 10, '#fafafa');
}
export function bomba(g, x, y, s = 1, value = '000,00') { g.save(); g.translate(x, y); g.scale(s, s); box(g, -110, -520, 220, 520, '#ffd23f', 6, 14); box(g, -85, -480, 170, 120, '#1b1b1f', 5, 8); label(g, value, 0, -420, { size: 40, color: '#69f0ae', stroke: 0, font: 'Nunito', weight: 900 }); box(g, -60, -320, 120, 40, '#e53935', 5, 6); tube(g, [[100, -260], [170, -240], [190, -120]], 12, '#212121'); box(g, 150, -150, 60, 40, '#424242', 5, 6); g.restore(); }
export function mercado(g) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#e8f5e9');
  const cols = ['#e53935', '#fdd835', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#ffffff'];
  for (let sx = -300; sx < 2300; sx += 520) { box(g, sx, 160, 480, 600, '#cfd8dc', 6, 4); for (let r = 0; r < 4; r++) { R(g, sx + 6, 300 + r * 140, 468, 16, '#90a4ae'); for (let k = 0; k < 7; k++) box(g, sx + 20 + k * 64, 220 + r * 140, 50, 80, cols[(k + r + sx) % 7 >= 0 ? (k + r + Math.abs(sx)) % 7 : 0], 4, 6); } }
  box(g, 560, 70, 800, 80, '#43a047', 6, 10); label(g, 'MERCADO DO BAIRRO', 960, 112, { size: 48, color: '#fff', stroke: 0 });
  R(g, -E.W, 860, E.W * 3, 600, '#eceff1'); floorLine(g, 860); for (let x = -E.W; x < E.W * 2; x += 120) R(g, x, 860, 3, 600, 'rgba(0,0,0,.12)');
}
export function caixaMercado(g, x = 960, y = 860) { box(g, x - 500, y - 260, 1000, 60, '#37474f', 6, 6); box(g, x - 480, y - 200, 960, 200, '#546e7a', 6, 0); for (let i = 0; i < 9; i++) R(g, x - 470 + i * 104, y - 252, 4, 44, '#263238'); box(g, x + 260, y - 400, 200, 140, '#263238', 6, 10); box(g, x + 280, y - 385, 160, 70, '#69f0ae', 4, 6); }
export function postoSaude(g) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#e0f7fa'); R(g, -E.W, 560, E.W * 3, 300, '#b2ebf2'); floorLine(g, 560);
  box(g, 600, 90, 720, 100, '#ffffff', 6, 10); label(g, 'POSTO DE SAÚDE', 960, 142, { size: 56, color: '#00897b', stroke: 0 });
  for (const x of [470, 1450]) { box(g, x - 40, 100, 80, 80, '#e53935', 5, 4); R(g, x - 10, 112, 20, 56, '#fff'); R(g, x - 28, 130, 56, 20, '#fff'); }
  for (let i = 0; i < 4; i++) box(g, 60 + i * 110, 600, 90, 120, '#26a69a', 5, 10);
  R(g, -E.W, 860, E.W * 3, 600, '#cfd8dc'); floorLine(g, 860);
}
export function balcaoSaude(g, x0 = 900) { box(g, x0, 600, 1300, 50, '#ffffff', 6, 6); box(g, x0 + 20, 650, 1260, 220, '#80cbc4', 6, 0); box(g, x0 + 380, 470, 220, 140, '#263238', 6, 10); box(g, x0 + 396, 486, 188, 108, '#4fc3f7', 4, 4); }
export function escola(g) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#fff3e0');
  box(g, 360, 140, 1200, 480, '#2e5d3a', 9, 6); box(g, 340, 610, 1240, 26, '#8d6e63', 5, 4);
  g.save(); g.beginPath(); g.rect(370, 150, 1180, 460); g.clip(); g.filter = 'blur(10px)'; label(g, '2 + 3 = 5', 960, 300, { size: 110, color: '#f5f5f5', stroke: 0 }); label(g, 'BRASIL', 960, 460, { size: 110, color: '#f5f5f5', stroke: 0 }); g.filter = 'none'; g.restore();
  R(g, -E.W, 860, E.W * 3, 600, '#d7ccc8'); floorLine(g, 860);
}
export function carteira(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); box(g, -150, -170, 300, 30, '#a1887f', 5, 4); tube(g, [[-120, -140], [-120, 0]], 12, '#757575'); tube(g, [[120, -140], [120, 0]], 12, '#757575'); g.restore(); }
export function otica(g) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#ede7f6'); box(g, 560, 80, 800, 100, '#5e35b1', 6, 10); label(g, 'ÓTICA VER BEM', 960, 132, { size: 56, color: '#fff', stroke: 0 });
  for (let r = 0; r < 3; r++) { R(g, 120, 330 + r * 150, 520, 14, '#9575cd'); for (let k = 0; k < 4; k++) { const x = 180 + k * 125, y = 300 + r * 150; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(x - 22, y, 20, 0, 7); g.moveTo(x + 42, y); g.arc(x + 22, y, 20, 0, 7); g.stroke(); } }
  R(g, -E.W, 860, E.W * 3, 600, '#d1c4e9'); floorLine(g, 860);
}

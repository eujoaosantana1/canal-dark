// luz.js — cenários do vídeo 3 (conta de luz): casa da Dona Neide, muro com o Marcão, banheiro, relógio de luz, conta.
import { E, rng, clamp, lerp, ease, prog } from '/engine/core.js';
import { box, oval, polyO, tube, label, INK } from '/engine/toon.js';
import * as M from './mundo.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function ceuDia(g, night) {
  const gr = g.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, night ? '#0e1438' : '#7fc8f8'); gr.addColorStop(1, night ? '#2b2f6a' : '#d9f1ff');
  g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2 + 760);
}

// TV no rack com a luzinha vermelha de stand-by
export function tv(g, x, y, s = 1, t = 0, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -260, 0, 520, 150, '#8d5a32', 6, 8); R(g, -250, 60, 500, 6, 'rgba(0,0,0,.25)');
  box(g, -230, -290, 460, 270, '#1f2228', 7, 14); box(g, -205, -268, 410, 226, o.ligada ? '#4fc3f7' : '#2b3038', 4, 6);
  box(g, -40, -22, 80, 22, '#1f2228', 5, 4);
  if (o.led !== false) { const a = 0.6 + 0.4 * Math.sin(t * 3); g.fillStyle = `rgba(255,40,40,${a})`; g.beginPath(); g.arc(180, -36, 9, 0, 7); g.fill(); g.fillStyle = `rgba(255,40,40,${0.25 * a})`; g.beginPath(); g.arc(180, -36, 26, 0, 7); g.fill(); }
  g.restore();
}
// tomada na parede com plugue (k: 0 plugado, 1 fora)
export function tomada(g, x, y, s = 1, k = 0, fio = true) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -60, -80, 120, 160, '#fafafa', 6, 14); oval(g, 0, 0, 40, 40, '#eeeeee', 5); oval(g, -14, 0, 6, 6, INK, 0); oval(g, 14, 0, 6, 6, INK, 0); oval(g, 0, 18, 5, 5, INK, 0);
  if (fio) { const px = lerp(0, 150, ease.out(k)), py = lerp(0, 60, ease.out(k));
    tube(g, [[px + 30, py + 20], [px + 80, py + 160], [px + 40, 360]], 12, '#212121', 0);
    box(g, px - 38, py - 34, 76, 68, '#424242', 5, 12); }
  g.restore();
}
// máquina de costura antiga
export function costura(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -230, -40, 460, 40, '#8d6e63', 6, 6); tube(g, [[-190, 0], [-200, 230]], 14, '#5d4037'); tube(g, [[190, 0], [200, 230]], 14, '#5d4037');
  polyO(g, [[-160, -40], [-160, -170], [120, -170], [140, -140], [140, -90], [40, -90], [40, -40]], '#263238', 6);
  box(g, 100, -120, 50, 80, '#263238', 6, 6); oval(g, -150, -110, 34, 34, '#b0bec5', 5); label(g, '1979', -20, -130, { size: 26, color: '#ffd23f', stroke: 0 });
  R(g, 118, -40, 6, 30, '#9e9e9e'); box(g, -60, -60, 140, 20, '#90caf9', 3, 4);
  g.restore();
}
// casa da Dona Neide (sala)
export function casa(g, t = 0, o = {}) {
  M.sala(g, { box: false, sofa: o.sofa !== false, night: o.night });
  tomada(g, 1250, 560, 0.7, o.plug ?? 0, o.fio !== false);
  tv(g, 1610, 720, 0.85, t, { led: o.led && !(o.plug > 0.5), ligada: o.tvOn });
  costura(g, 300, 760, 0.8);
  if (o.night && o.escuro) { g.fillStyle = 'rgba(5,5,25,.55)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    if (o.led && !(o.plug > 0.5)) { const a = 0.6 + 0.4 * Math.sin(t * 3); g.fillStyle = `rgba(255,40,40,${a})`; g.beginPath(); g.arc(1610 + 153, 720 - 31, 9, 0, 7); g.fill(); } }
}
// ar-condicionado
export function arCond(g, x, y, s = 1, t = 0, on = true) {
  g.save(); g.translate(x, y); g.scale(s, s); box(g, -140, -90, 280, 180, '#eceff1', 6, 12);
  for (let i = 0; i < 7; i++) R(g, -110 + i * 32, -60, 14, 120, '#b0bec5');
  oval(g, 70, 0, 54, 54, '#cfd8dc', 5); if (on) { g.save(); g.translate(70, 0); g.rotate(t * 14); for (let i = 0; i < 3; i++) { g.rotate(Math.PI * 2 / 3); polyO(g, [[0, 0], [12, -46], [-12, -46]], '#78909c', 3); } g.restore(); }
  if (on) for (let i = 0; i < 3; i++) { const yy = 100 + ((t * 160 + i * 60) % 180); oval(g, -60, yy, 7, 10, '#4fc3f7', 2); }
  g.restore();
}
// poste com fios; gato = fio torto puxado pra casa do Marcão
export function poste(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -22, -760, 44, 760, '#9e9e9e', 6, 6); box(g, -170, -740, 340, 30, '#757575', 5, 4);
  box(g, 60, -660, 110, 140, '#607d8b', 5, 10); label(g, '⚡', 115, -588, { size: 50, color: '#ffd23f', stroke: 0 });
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(-E.W, y - 740 * s); g.quadraticCurveTo(x - 300, y - 690 * s, x - 150 * s, y - 730 * s); g.moveTo(x + 150 * s, y - 730 * s); g.quadraticCurveTo(x + 600, y - 690 * s, E.W * 2, y - 740 * s); g.stroke();
  if (o.gato) { g.strokeStyle = '#d32f2f'; g.lineWidth = 7; g.beginPath(); g.moveTo(x + 140 * s, y - 725 * s); const pts = [[x + 260, y - 640], [x + 330, y - 690], [x + 420, y - 600], [x + 500, y - 640], [x + 620, y - 520]]; for (const [px, py] of pts) g.lineTo(px, py); g.stroke(); if (o.marca) { const k = o.marca; g.globalAlpha = clamp(k); oval(g, x + 420, y - 600, 70 * k, 70 * k, 'rgba(0,0,0,0)', 8); g.globalAlpha = 1; } }
}
// casa da Neide (esq.) | muro | casa do Marcão (dir.) com ar, piscina, luz da garagem e o poste
export function muro(g, t = 0, o = {}) {
  ceuDia(g, o.night); if (!o.night) { M.cloud(g, 250, 120, 0.8); M.cloud(g, 1450, 90, 0.6); }
  // casa da Neide
  box(g, 40, 380, 700, 470, '#f8bbd0', 7, 6); polyO(g, [[10, 390], [390, 220], [770, 390]], '#c0573e', 7);
  box(g, 120, 480, 180, 160, '#bbdefb', 6, 6); box(g, 470, 560, 150, 290, '#8d6e63', 6, 6); oval(g, 595, 710, 10, 10, '#ffd23f', 3);
  label(g, 'COSTURA', 210, 680, { size: 34, color: '#ad1457', stroke: 0 });
  // casa do Marcão
  const off = !!o.off;
  box(g, 1080, 300, 840, 550, '#90caf9', 7, 6); polyO(g, [[1050, 310], [1500, 150], [1950, 310]], '#5d4037', 7);
  box(g, 1150, 420, 260, 190, off ? '#546e7a' : '#e1f5fe', 6, 6); box(g, 1560, 560, 300, 290, '#cfd8dc', 6, 6); for (let i = 0; i < 6; i++) R(g, 1565, 580 + i * 45, 290, 5, '#90a4ae');
  arCond(g, 1290, 360, 0.6, t, !off);
  lampada(g, 1710, 520, !off);
  // chão / calçada
  R(g, -E.W, 850, E.W * 3, 600, '#9ccc65'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 850); g.lineTo(E.W * 2, 850); g.stroke();
  // muro
  box(g, 820, 560, 180, 300, '#e0e0e0', 7, 4); for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) R(g, 826 + c * 60 + (r % 2) * 30, 566 + r * 50, 3, 46, 'rgba(0,0,0,.18)');
  // piscina de plástico
  oval(g, 1440, 950, 260, 70, '#1e88e5', 7); oval(g, 1440, 935, 230, 50, off ? '#64b5f6' : '#4fc3f7', 0); box(g, 1720, 880, 70, 70, '#424242', 5, 10);
  if (!off) for (let i = 0; i < 4; i++) oval(g, 1380 + i * 40, 930 + Math.sin(t * 4 + i) * 6, 8, 5, '#e1f5fe', 0);
  poste(g, 920, 850, 1.0, { gato: o.gato !== false && !o.semGato, marca: o.marca });
  if (o.night) { g.fillStyle = 'rgba(10,10,40,.3)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
}
function lampada(g, x, y, on) {
  box(g, x - 22, y - 60, 44, 40, '#616161', 4, 6); oval(g, x, y - 10, 26, 26, on ? '#fff59d' : '#9e9e9e', 5);
  if (on) { g.fillStyle = 'rgba(255,245,157,.35)'; g.beginPath(); g.moveTo(x - 20, y); g.lineTo(x - 160, y + 300); g.lineTo(x + 160, y + 300); g.lineTo(x + 20, y); g.fill(); }
}
// banheiro com ampulheta grudada no azulejo
export function banheiro(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#e0f7fa');
  for (let x = -40; x < E.W + 80; x += 120) for (let y = -40; y < E.H; y += 120) { g.strokeStyle = '#b2ebf2'; g.lineWidth = 4; g.strokeRect(x, y, 120, 120); }
  tube(g, [[1500, 0], [1500, 160], [1300, 200]], 20, '#b0bec5'); box(g, 1220, 180, 160, 50, '#90a4ae', 5, 20);
  for (let i = 0; i < 14; i++) { const yy = 260 + ((t * 600 + i * 70) % 600); oval(g, 1240 + (i * 37) % 120, yy, 5, 12, '#4fc3f7', 0); }
}
export function ampulheta(g, x, y, s = 1, k = 0.5) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -110, -200, 220, 30, '#8d6e63', 6, 8); box(g, -110, 170, 220, 30, '#8d6e63', 6, 8);
  g.fillStyle = 'rgba(255,255,255,.7)'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-90, -170); g.lineTo(90, -170); g.lineTo(10, 0); g.lineTo(90, 170); g.lineTo(-90, 170); g.lineTo(-10, 0); g.closePath(); g.fill(); g.stroke();
  const top = 1 - k; g.fillStyle = '#ffca28';
  g.beginPath(); g.moveTo(-90 * top, -170 * top + (1 - top) * -10 - 10 * top); g.lineTo(90 * top, -170 * top - 10 * top + (1 - top) * -10); g.lineTo(0, -6); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-90, 168); g.lineTo(90, 168); g.lineTo(90 * (1 - k * 0.8), 168 - 150 * k); g.lineTo(-90 * (1 - k * 0.8), 168 - 150 * k); g.closePath(); g.fill();
  R(g, -3, -6, 6, 170, '#ffca28');
  g.restore();
}
// relógio de luz (medidor) com número
export function medidor(g, x, y, s = 1, num = '04512') {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -200, -260, 400, 520, '#cfd8dc', 7, 14); box(g, -160, -220, 320, 300, '#eceff1', 6, 8);
  box(g, -120, -170, 240, 70, '#212121', 5, 6); for (let i = 0; i < num.length; i++) label(g, num[i], -96 + i * 48, -132, { size: 52, color: '#fafafa', stroke: 0, font: 'Nunito', weight: 900 });
  label(g, 'kWh', 0, -60, { size: 40, color: INK, stroke: 0 }); oval(g, 0, 20, 40, 10, '#90a4ae', 4);
  label(g, 'DISTRIBUIDORA', 0, 160, { size: 30, color: '#1565c0', stroke: 0 });
  g.restore();
}
// conta de luz (papel). o: ano, kwh, valor, destaque ('kwh'|'valor'), carimbo
export function conta(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s, s);
  box(g, -230, -320, 460, 640, '#fffdf3', 6, 8); box(g, -230, -320, 460, 90, '#1565c0', 6, 8);
  label(g, 'CONTA DE LUZ', 0, -275, { size: 40, color: '#fff', stroke: 0 }); if (o.ano) label(g, o.ano, 0, -195, { size: 40, color: '#455a64', stroke: 0 });
  for (let i = 0; i < 4; i++) R(g, -190, -150 + i * 34, i % 2 ? 260 : 360, 10, '#cfd8dc');
  if (o.destaque === 'kwh') box(g, -205, -20, 410, 100, '#fff59d', 5, 10);
  label(g, 'CONSUMO', -180, 10, { size: 30, color: '#455a64', stroke: 0, align: 'left' }); label(g, (o.kwh ?? '---') + ' kWh', 180, 50, { size: 50, color: INK, stroke: 0, align: 'right' });
  if (o.destaque === 'valor') box(g, -205, 120, 410, 140, '#ffcdd2', 5, 10);
  label(g, 'TOTAL A PAGAR', -180, 150, { size: 30, color: '#455a64', stroke: 0, align: 'left' }); label(g, 'R$ ' + (o.valor ?? '---'), 180, 215, { size: 66, color: '#c62828', stroke: 0, align: 'right' });
  g.restore();
}

// salario.js — cenários do vídeo 7: cômodo e cozinha em Guaianases, Av. Paulista, ponto de ônibus.
import { E, rng } from '/engine/core.js';
import { box, oval, polyO, tube, label, INK } from '/engine/toon.js';
import * as M from './mundo.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

export function geladeira(g, x, y, s = 1, aberta = 0, itens = 'pouco') {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -150, -560, 300, 560, '#eceff1', 7, 16); R(g, -150, -380, 300, 6, INK);
  if (aberta > 0) {
    box(g, -140, -550, 280, 540, '#fffde7', 5, 8);
    for (const yy of [-400, -260, -130]) R(g, -130, yy, 260, 8, '#b0bec5');
    if (itens === 'pouco') {
      box(g, -110, -520, 60, 110, '#ffffff', 5, 6); label(g, 'LEITE', -80, -470, { size: 16, color: '#1e88e5', stroke: 0 }); // meia caixa
      for (let i = 0; i < 3; i++) oval(g, 10 + i * 34, -282, 16, 20, '#fff3e0', 4);
      box(g, -60, -210, 120, 70, '#fdd835', 5, 10); label(g, 'MARGARINA', 0, -175, { size: 15, color: '#c62828', stroke: 0 });
    }
    g.save(); g.translate(150, 0); g.scale(-0.35 * aberta, 1); box(g, 0, -560, 300, 560, '#cfd8dc', 7, 16); g.restore();
  } else { tube(g, [[110, -520], [110, -420]], 10, '#90a4ae', 4); tube(g, [[110, -340], [110, -200]], 10, '#90a4ae', 4); }
  g.restore();
}
export function fogao(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -150, -330, 300, 330, '#fafafa', 7, 10); box(g, -150, -360, 300, 40, '#e0e0e0', 6, 6);
  for (const [dx, dy] of [[-70, -345], [70, -345]]) oval(g, dx, dy, 40, 12, '#424242', 4);
  box(g, -120, -270, 240, 180, '#37474f', 5, 8); R(g, -100, -250, 200, 8, '#90a4ae');
  // panela de arroz
  box(g, -110, -440, 120, 80, '#9e9e9e', 5, 10); tube(g, [[-125, -420], [-145, -420]], 8, '#616161', 4);
  g.restore();
}
export function botijao(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -70, -170, 140, 170, '#e53935', 6, 40); box(g, -40, -200, 80, 36, '#e53935', 5, 8); oval(g, 0, -210, 22, 10, '#9e9e9e', 4);
  label(g, '13kg', 0, -90, { size: 30, color: '#fff', stroke: 0 }); g.restore();
}
export function cofrinho(g, x, y, s = 1, quebrado = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (!quebrado) {
    box(g, -60, -220, 120, 220, 'rgba(178,235,242,.85)', 6, 30); box(g, -26, -262, 52, 46, '#29b6f6', 5, 8);
    const r = rng(4); for (let i = 0; i < 14; i++) oval(g, -38 + r() * 76, -24 - r() * 70, 14, 6, r() > 0.5 ? '#ffd54f' : '#bdbdbd', 3);
    R(g, -25, -140, 50, 8, INK);
  } else {
    polyO(g, [[-60, 0], [-40, -120], [-10, -60], [10, -150], [30, -50], [60, -110], [70, 0]], 'rgba(178,235,242,.85)', 6);
  }
  g.restore();
}
// cômodo e cozinha
export function comodo(g, t = 0, o = {}) {
  const n = !!o.night;
  R(g, -E.W, -E.H, E.W * 3, E.H + 900, n ? '#6f6a86' : '#e8d9b8');
  // reboco descascado
  for (const [x, y, w, h] of [[300, 120, 120, 60], [1560, 380, 90, 70], [980, 90, 80, 40]]) { g.fillStyle = n ? '#5f5a76' : '#cdbb95'; g.beginPath(); g.ellipse(x, y, w, h, 0.3, 0, 7); g.fill(); }
  // janela basculante
  box(g, 700, 140, 300, 200, n ? '#1d2550' : '#a7d8ef', 7, 4); for (const yy of [207, 274]) R(g, 700, yy, 300, 6, INK);
  if (n) { g.fillStyle = '#fff59d'; g.beginPath(); g.arc(940, 190, 20, 0, 7); g.fill(); }
  // calendário de parede
  box(g, 1240, 200, 170, 200, '#ffffff', 6, 4); R(g, 1240, 200, 170, 50, '#e53935'); label(g, 'MÊS', 1325, 226, { size: 28, color: '#fff', stroke: 0 });
  for (let i = 0; i < 15; i++) R(g, 1258 + (i % 5) * 30, 270 + Math.floor(i / 5) * 38, 20, 20, '#cfd8dc');
  // prateleira com cofrinho
  box(g, 1480, 470, 300, 22, '#8d6e63', 5, 3); if (o.cofrinho !== false) cofrinho(g, 1560, 470, 0.7); box(g, 1660, 400, 60, 70, '#ffcc80', 4, 4);
  // chão
  R(g, -E.W, 860, E.W * 3, 600, n ? '#5b4a3c' : '#a1887f'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
  for (let x = -E.W; x < E.W * 2; x += 120) R(g, x, 860, 3, 600, 'rgba(0,0,0,.12)');
  // cozinha: pia + fogão + botijão + geladeira
  box(g, 290, 560, 320, 300, '#cfd8dc', 6, 6); box(g, 280, 540, 340, 34, '#eceff1', 6, 6); tube(g, [[470, 540], [470, 480], [510, 480]], 10, '#9e9e9e', 4);
  geladeira(g, 130, 860, 0.9, o.aberta || 0); fogao(g, 780, 860, 0.95); botijao(g, 990, 860, 0.85);
  // cama + mesinha
  box(g, 1350, 700, 560, 160, '#8d6e63', 6, 10); box(g, 1360, 640, 540, 90, '#90caf9', 6, 20); box(g, 1380, 610, 160, 70, '#ffffff', 5, 18);
  box(g, 1100, 720, 200, 24, '#a1887f', 5, 4); tube(g, [[1120, 744], [1120, 860]], 10, '#6d4c41', 4); tube(g, [[1280, 744], [1280, 860]], 10, '#6d4c41', 4);
  if (n) { g.fillStyle = 'rgba(20,20,60,.28)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
}
// Avenida Paulista: prédios de vidro
export function paulista(g, t = 0, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, 800); gr.addColorStop(0, '#64b5f6'); gr.addColorStop(1, '#e3f2fd'); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H + 900);
  const P = [[-40, 120, 380, '#90a4ae'], [360, 40, 420, '#4fc3f7'], [800, 160, 360, '#b0bec5'], [1180, 0, 400, '#81d4fa'], [1600, 140, 400, '#cfd8dc']];
  for (const [x, y, w, c] of P) { box(g, x, y, w, 900 - y, c, 7, 4); for (let yy = y + 30; yy < 860; yy += 70) for (let xx = x + 24; xx < x + w - 40; xx += 70) R(g, xx, yy, 46, 44, 'rgba(255,255,255,.45)'); }
  box(g, 360, 760, 420, 100, '#37474f', 6, 4); label(g, 'ENTRADA', 570, 812, { size: 40, color: '#fff', stroke: 0 });
  box(g, 1660, 700, 90, 160, '#546e7a', 5, 4); label(g, 'SERVIÇO', 1705, 680, { size: 26, color: '#37474f', stroke: 0 });
  R(g, -E.W, 860, E.W * 3, 600, '#bdbdbd'); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-E.W, 860); g.lineTo(E.W * 2, 860); g.stroke();
  // placa de rua
  tube(g, [[120, 860], [120, 520]], 12, '#455a64', 4); box(g, 20, 470, 340, 70, '#1565c0', 6, 8); label(g, 'AV. PAULISTA', 190, 506, { size: 36, color: '#fff', stroke: 0 });
}
// ponto de ônibus de Guaianases (cedo)
export function ponto(g, t = 0, o = {}) {
  M.rua(g, { night: o.night });
  box(g, 160, 480, 30, 520, '#90a4ae', 5, 4); box(g, 100, 420, 400, 70, '#1e88e5', 6, 10); label(g, 'PONTO', 300, 456, { size: 44, color: '#fff', stroke: 0 });
  if (o.bus != null) M.bus(g, o.bus, 1010, 1.15, { sign: 'GUAIANASES' });
}

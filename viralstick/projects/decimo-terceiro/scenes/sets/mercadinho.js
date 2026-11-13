// sets/mercadinho.js — Mercadinho do Jura + objetos reaproveitáveis (rádio, lata, caderninho, telefone fixo, maquininha, fone de ouvido, monitores)
import { E, clamp, lerp, rng, ease } from '/engine/core.js';
import { box, oval, polyO, blob, tube, label, INK } from '/engine/toon.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const floorLine = (g, y) => R(g, -E.W, y - 3, E.W * 3, 6, INK);
const CORES = ['#e53935', '#43a047', '#1e88e5', '#fdd835', '#8e24aa', '#fb8c00', '#00acc1', '#f06292'];

export function prateleira(g, x, y, w, seed = 1) {
  box(g, x, y, w, 22, '#8d5a32', 5, 3);
  const r = rng(seed); let cx = x + 14;
  while (cx < x + w - 50) {
    const pw = 34 + r() * 36, ph = 50 + r() * 70, c = CORES[Math.floor(r() * CORES.length)];
    if (r() < 0.35) { oval(g, cx + pw / 2, y - ph / 2, pw / 2, ph / 2, c, 4); } else box(g, cx, y - ph, pw, ph, c, 4, 4);
    R(g, cx + 6, y - ph * 0.62, pw - 12, ph * 0.22, 'rgba(255,255,255,.75)');
    cx += pw + 8;
  }
}

export function interior(g, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H + 900, o.night ? '#6d5f7a' : '#f6e2b8');
  R(g, -E.W, 120, E.W * 3, 26, '#e7c98f');
  for (let i = 0; i < 4; i++) prateleira(g, 120, 300 + i * 165, 760, 10 + i);
  for (let i = 0; i < 4; i++) prateleira(g, 1150, 300 + i * 165, 650, 20 + i);
  // placa
  box(g, 700, 30, 520, 110, '#c62828', 7, 14); label(g, 'MERCADINHO DO JURA', 960, 88, { size: 46, color: '#fff', stroke: 0 });
  // calendário na parede
  box(g, 930, 190, 130, 150, '#fffdf3', 5, 4); R(g, 930, 190, 130, 34, '#e53935'); label(g, '1988', 995, 285, { size: 30, color: INK, stroke: 0 });
  R(g, -E.W, 900, E.W * 3, 600, o.night ? '#5b4636' : '#c9925e'); floorLine(g, 900);
  for (let x = -E.W; x < E.W * 2; x += 140) R(g, x, 900, 4, 600, 'rgba(0,0,0,.12)');
  if (o.night) { g.fillStyle = 'rgba(20,20,60,.3)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
}

// balcão da frente, com caderninho, lata e rádio em cima
export function balcao(g, t = 0, o = {}) {
  const y = o.balcaoY || 760;
  box(g, 220, y, 1480, 46, '#8d6e63', 6, 6); box(g, 250, y + 46, 1420, 300, '#a1887f', 6, 0);
  for (let i = 0; i < 6; i++) R(g, 300 + i * 230, y + 80, 6, 240, 'rgba(0,0,0,.12)');
  if (o.objetos !== false) {
    radio(g, 470, y + 2, 1, t, o.radioOn);
    lata(g, 1460, y + 2, 1, { aberta: o.lataAberta });
    caderninho(g, 1000, y + 2, 1, {});
  }
}

export function fachada(g, o = {}) {
  const sky = g.createLinearGradient(0, -200, 0, 800);
  sky.addColorStop(0, o.night ? '#1d2550' : '#8fd3f4'); sky.addColorStop(1, o.night ? '#3b3f7a' : '#d6f1ff');
  g.fillStyle = sky; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  // prédios ao fundo
  const r = rng(7);
  for (let i = 0; i < 9; i++) { const h = 260 + r() * 260; box(g, -100 + i * 250, 820 - h, 220, h, o.night ? '#4a4f7a' : '#cfd8dc', 5, 4); for (let k = 0; k < 4; k++) R(g, -70 + i * 250 + (k % 2) * 90, 860 - h + Math.floor(k / 2) * 90, 50, 50, o.night ? (r() < 0.2 ? '#fff59d' : '#2c3159') : '#90caf9'); }
  // loja
  box(g, 420, 300, 1080, 600, '#ffe0b2', 7, 6);
  box(g, 420, 230, 1080, 130, '#c62828', 7, 10); label(g, 'MERCADINHO DO JURA', 960, 298, { size: 66, color: '#fff', stroke: 0 });
  for (let i = 0; i < 9; i++) R(g, 430 + i * 120, 360, 60, 40, i % 2 ? '#fff' : '#e53935');
  box(g, 560, 450, 800, 450, o.night ? '#ffecb3' : '#5d4037', 6, 4);
  if (!o.night) { for (let i = 0; i < 3; i++) prateleira(g, 590, 560 + i * 120, 740, 30 + i); }
  R(g, -E.W, 900, E.W * 3, 600, '#9e9e9e'); floorLine(g, 900); R(g, -E.W, 980, E.W * 3, 600, '#616161');
  if (o.qr) placaQR(g, 1400, 640, 1, o.qr);
  if (o.night) { g.fillStyle = 'rgba(15,15,50,.35)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
}

export function placaQR(g, x, y, s = 1, k = 1) {
  g.save(); g.translate(x, y); g.scale(s * k, s * k);
  box(g, -110, -150, 220, 300, '#ffffff', 6, 10); box(g, -110, -150, 220, 56, '#32bcad', 0, 10); label(g, 'PIX', 0, -122, { size: 34, color: '#fff', stroke: 0 });
  const r = rng(99); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if (r() < 0.5 || (i < 2 && j < 2) || (i > 5 && j < 2) || (i < 2 && j > 5)) R(g, -72 + i * 18, -78 + j * 18, 18, 18, '#111');
  label(g, 'Aceito também', 0, 100, { size: 24, color: INK, stroke: 0, font: 'Nunito', weight: 800 });
  label(g, 'dinheiro e caderninho', 0, 128, { size: 21, color: '#c62828', stroke: 0, font: 'Nunito', weight: 800 });
  g.restore();
}

export function radio(g, x, y, s = 1, t = 0, on = false) {
  g.save(); g.translate(x, y); g.scale(s, s);
  tube(g, [[60, -150], [120, -290]], 6, '#9e9e9e', 4); oval(g, 120, -292, 9, 9, '#9e9e9e', 4);
  box(g, -110, -150, 220, 150, '#6d4c41', 6, 18); oval(g, -45, -75, 46, 46, '#3e2723', 5);
  for (let i = 0; i < 4; i++) R(g, -78, -100 + i * 16, 66, 4, '#8d6e63');
  box(g, 18, -125, 72, 40, '#fff59d', 4, 4); R(g, 30 + (t * 20 % 48), -122, 3, 34, '#e53935');
  oval(g, 40, -48, 14, 14, '#bdbdbd', 4); oval(g, 76, -48, 14, 14, '#bdbdbd', 4);
  if (on) for (let i = 0; i < 3; i++) { g.strokeStyle = '#ffd23f'; g.lineWidth = 8; g.beginPath(); g.arc(-45, -75, 70 + i * 26 + (t * 60 % 26), -2.4, -0.8); g.stroke(); }
  g.restore();
}

export function lata(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -90, -130, 180, 130, '#1565c0', 6, 14);
  R(g, -86, -92, 172, 46, '#fdd835'); label(g, 'BISCOITOS', 0, -68, { size: 26, color: '#c62828', stroke: 0 });
  if (o.aberta) { polyO(g, [[-95, -130], [95, -130], [110, -210], [-80, -190]], '#1976d2', 5);
    for (let i = 0; i < 5; i++) box(g, -70 + i * 28, -150 - (i % 2) * 8, 60, 34, '#81c784', 3, 4); }
  else box(g, -98, -150, 196, 30, '#1976d2', 6, 10);
  g.restore();
}

export function caderninho(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot ?? -0.05);
  box(g, -120, -36, 240, 36, '#5d4037', 5, 6); box(g, -110, -40, 105, 30, '#fffdf3', 4, 3); box(g, 5, -40, 105, 30, '#fffdf3', 4, 3);
  label(g, 'FIADO', 0, -56, { size: 26, color: '#c62828', stroke: 5 });
  g.restore();
}

// caderno grande aberto (para closes): linhas = [['NOME', 'VALOR'], ...], destaque = índice
export function cadernoAberto(g, x, y, s, linhas, k = 1, destaque = -1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -620, -360, 1240, 720, '#6d4c41', 8, 20);
  box(g, -600, -340, 590, 680, '#fffdf3', 6, 6); box(g, 10, -340, 590, 680, '#fffdf3', 6, 6);
  for (let i = 0; i < 12; i++) { R(g, -590, -270 + i * 52, 570, 3, '#90caf9'); R(g, 20, -270 + i * 52, 570, 3, '#90caf9'); }
  R(g, -520, -340, 3, 680, '#ef9a9a'); R(g, 90, -340, 3, 680, '#ef9a9a');
  linhas.forEach((ln, i) => {
    const vis = clamp(k * linhas.length - i); if (vis <= 0) return;
    const col = i < 6 ? -1 : 1, row = i % 6, bx = col < 0 ? -500 : 110, by = -250 + row * 104;
    g.globalAlpha = vis;
    if (i === destaque) { g.fillStyle = 'rgba(255,235,59,.65)'; g.fillRect(bx - 20, by - 40, 520, 80); }
    label(g, ln[0], bx, by, { size: 40, color: '#1a237e', stroke: 0, align: 'left', font: 'Nunito', weight: 800, rot: -0.02 });
    if (ln[1]) label(g, ln[1], bx + 470, by, { size: 40, color: '#c62828', stroke: 0, align: 'right', font: 'Nunito', weight: 800 });
    g.globalAlpha = 1;
  });
  g.restore();
}

export function telefoneFixo(g, x, y, s = 1, t = 0, tocando = false) {
  const sh = tocando ? Math.sin(t * 60) * 5 * (Math.sin(t * 7) > 0 ? 1 : 0) : 0;
  g.save(); g.translate(x + sh, y); g.scale(s, s);
  box(g, -140, -110, 280, 110, '#c62828', 6, 26); box(g, -150, -170, 300, 60, '#e53935', 6, 28);
  oval(g, 0, -55, 44, 44, '#fffdf3', 5); for (let i = 0; i < 10; i++) { const a = -2.6 + i * 0.36; oval(g, Math.cos(a) * 30, -55 + Math.sin(a) * 30, 6, 6, INK, 0); }
  tube(g, [[-150, -120], [-230, -40], [-200, 60]], 7, INK, 0);
  g.restore();
  if (tocando) for (let i = 0; i < 3; i++) { g.strokeStyle = '#ffd23f'; g.lineWidth = 9; const rr = 220 * s + i * 50 + (t * 90 % 50); g.beginPath(); g.arc(x, y - 90 * s, rr, -0.55, 0.55); g.stroke(); g.beginPath(); g.arc(x, y - 90 * s, rr, Math.PI - 0.55, Math.PI + 0.55); g.stroke(); }
}

export function maquininha(g, x, y, s = 1, tela = 'APROXIME', cor = '#69f0ae') {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -150, -290, 300, 580, '#263238', 7, 34); box(g, -115, -250, 230, 170, '#0b1e1a', 5, 10);
  const linhas = tela.split('\n'); linhas.forEach((l, i) => label(g, l, 0, -195 + i * 50 - (linhas.length - 1) * 22, { size: 34, color: cor, stroke: 0, font: 'Nunito', weight: 900 }));
  for (let i = 0; i < 12; i++) box(g, -100 + (i % 3) * 72, -40 + Math.floor(i / 3) * 62, 56, 44, i === 11 ? '#43a047' : i === 9 ? '#e53935' : '#455a64', 4, 8);
  R(g, -60, 240, 120, 12, '#90a4ae');
  g.restore();
}

export function headset(g, x, y, r) {
  g.save(); g.strokeStyle = INK; g.lineWidth = r * 0.16; g.beginPath(); g.arc(x, y - r * 0.05, r * 1.04, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  g.strokeStyle = '#37474f'; g.lineWidth = r * 0.1; g.stroke();
  oval(g, x - r * 1.0, y + r * 0.1, r * 0.2, r * 0.3, '#37474f', r * 0.05); oval(g, x + r * 1.0, y + r * 0.1, r * 0.2, r * 0.3, '#37474f', r * 0.05);
  tube(g, [[x + r * 1.0, y + r * 0.3], [x + r * 0.8, y + r * 0.75], [x + r * 0.35, y + r * 0.85]], r * 0.06, '#37474f', r * 0.03);
  oval(g, x + r * 0.32, y + r * 0.85, r * 0.09, r * 0.09, INK, 0);
  g.restore();
}

// parede de monitores do Suporte Técnico do Universo
export function monitores(g, t = 0, o = {}) {
  const linhas = o.tela || globalThis.TELA_SUPORTE || ['A INTERNET TÁ LENTA', 'A INTERNET TÁ LENTA', 'A INTERNET TÁ LENTA'];
  for (let i = 0; i < 3; i++) {
    const x = 330 + i * 470, y = 170;
    box(g, x, y, 420, 260, '#263238', 7, 12); box(g, x + 18, y + 18, 384, 224, '#0d1b2a', 4, 6);
    for (let k = 0; k < 5; k++) { const l = linhas[(i + k) % linhas.length]; const yy = y + 50 + k * 42 - (t * 40 % 42);
      if (yy > y + 26 && yy < y + 238) label(g, `#${(1000 + i * 37 + k * 11 + Math.floor(t * 3)) % 9999} ${l}`, x + 34, yy, { size: 20, color: '#69f0ae', stroke: 0, align: 'left', font: 'Nunito', weight: 800 }); }
  }
}

// sets/semvoos.js — cenários do vídeo 12 ("E se todos os voos do Brasil fossem cancelados?")
// Aviões sempre genéricos e brancos, sem logotipo de companhia.
import { E, clamp, lerp, rng, ease } from '/engine/core.js';
import { box, oval, polyO, blob, tube, label, INK } from '/engine/toon.js';
import { cloud, sala } from './mundo.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function ceu(g, c1, c2, y1 = 900) { const gr = g.createLinearGradient(0, 0, 0, y1); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }

// ---------- peças ----------
// avião de perfil, nariz para a direita (dir = -1 vira). s = escala (1 = ~520 px de comprimento)
export function aviao(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.dir || 1), s); if (o.rot) g.rotate(o.rot);
  const cauda = o.cauda || '#90a4ae';
  polyO(g, [[-200, -20], [-250, -150], [-205, -150], [-130, -25]], cauda, 6);              // leme
  polyO(g, [[-40, 10], [60, 10], [-60, 120], [-110, 120]], '#cfd8dc', 6);                  // asa de baixo
  blob(g, g => { g.moveTo(-250, -30); g.bezierCurveTo(-200, -55, 150, -60, 210, -45); g.bezierCurveTo(265, -32, 275, 10, 225, 28); g.bezierCurveTo(150, 45, -180, 40, -235, 20); g.closePath(); }, '#ffffff', 6);
  for (let i = 0; i < 9; i++) oval(g, -150 + i * 36, -18, 9, 11, '#4fc3f7', 3);             // janelas
  box(g, 196, -36, 30, 22, '#4fc3f7', 4, 6);                                                 // cabine
  polyO(g, [[-260, -20], [-210, -35], [-175, 0], [-230, 5]], cauda, 5);                     // profundor
  polyO(g, [[-20, 0], [40, 0], [-80, -80], [-110, -80]], '#eceff1', 6);                     // asa de cima (ao fundo)
  box(g, -10, 34, 90, 36, '#b0bec5', 5, 16); oval(g, 80, 52, 8, 16, '#546e7a', 3);          // turbina
  if (o.trem) { tube(g, [[40, 40], [40, 80]], 8, INK, 0); oval(g, 40, 88, 14, 14, '#424242', 4); tube(g, [[-150, 35], [-150, 75]], 8, INK, 0); oval(g, -150, 84, 14, 14, '#424242', 4); }
  g.restore();
}
// táxi branco de perfil (frente para a direita). o.luz (placa acesa), o.vazio
export function taxi(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.dir || 1), s);
  blob(g, g => { g.moveTo(-230, 0); g.lineTo(-230, -70); g.lineTo(-150, -80); g.lineTo(-90, -150); g.lineTo(90, -150); g.lineTo(150, -85); g.lineTo(230, -70); g.lineTo(235, 0); g.closePath(); }, '#fafafa', 6);
  polyO(g, [[-80, -140], [-5, -140], [-5, -88], [-130, -88]], '#90caf9', 5); polyO(g, [[10, -140], [85, -140], [135, -88], [10, -88]], '#90caf9', 5);
  R(g, -228, -52, 460, 14, '#e53935');                                                         // faixa
  box(g, -50, -190, 100, 42, o.luz === false ? '#bdbdbd' : '#fdd835', 5, 6); label(g, 'TÁXI', 0, -168, { size: 26, color: INK, stroke: 0 });
  for (const wx of [-140, 140]) { oval(g, wx, 0, 46, 46, '#263238', 6); oval(g, wx, 0, 18, 18, '#b0bec5', 4); }
  oval(g, 222, -50, 10, 8, '#fff59d', 3);
  g.restore();
}
// placa vertical "TÁXI"
function placaTaxi(g, x, y) { tube(g, [[x, y], [x, y - 300]], 14, '#546e7a', 5); box(g, x - 90, y - 400, 180, 110, '#fdd835', 6, 10); label(g, 'TÁXI', x, y - 343, { size: 54, color: INK, stroke: 0 }); }
// caixa térmica de órgão
export function caixaOrgao(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -150, -170, 300, 190, '#eceff1', 7, 14); box(g, -160, -200, 320, 50, '#1e88e5', 7, 10); box(g, -50, -225, 100, 30, '#1565c0', 6, 8);
  box(g, -125, -130, 250, 64, '#e53935', 4, 8); label(g, 'TRANSPLANTE', 0, -97, { size: 32, color: '#fff', stroke: 0 });
  label(g, 'ÓRGÃO HUMANO', 0, -30, { size: 26, color: '#c62828', stroke: 0 });
  g.restore();
}
// relógio redondo. horas decimal (ex.: 3.5)
export function relogio(g, x, y, r, horas = 0, o = {}) {
  oval(g, x, y, r, r, o.fundo || '#fffdf3', r * 0.08);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = INK; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, r * (i % 3 ? 0.03 : 0.06), 0, 7); g.fill(); }
  const ah = (horas % 12) / 12 * Math.PI * 2 - Math.PI / 2, am = (horas % 1) * Math.PI * 2 - Math.PI / 2;
  tube(g, [[x, y], [x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5]], r * 0.08, INK, 0); tube(g, [[x, y], [x + Math.cos(am) * r * 0.75, y + Math.sin(am) * r * 0.75]], r * 0.05, o.ponteiro || '#e53935', 0);
  oval(g, x, y, r * 0.07, r * 0.07, INK, 0);
}
// barco de madeira (canoa com toldo)
export function barco(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, g => { g.moveTo(-260, -40); g.lineTo(260, -50); g.quadraticCurveTo(230, 30, 150, 40); g.lineTo(-170, 40); g.quadraticCurveTo(-240, 20, -260, -40); g.closePath(); }, '#8d5a2b', 6);
  R(g, -240, -30, 480, 10, '#6d4320');
  box(g, -120, -150, 200, 110, '#26a69a', 5, 8); polyO(g, [[-140, -150], [100, -150], [80, -185], [-120, -185]], '#00796b', 5);
  for (const bx of [-90, -30, 30]) box(g, bx - 20, -80, 40, 36, '#ffcc80', 4, 4);
  g.restore();
}

// ---------- cenários ----------
// ponto de táxi na frente do terminal. o.semAviao (dia sem voos), o.noite, o.taxis (n), o.aviaoT (posição 0..1 do avião)
export function pontoTaxi(g, t = 0, o = {}) {
  if (o.noite) ceu(g, '#0e1438', '#2b2f6a'); else ceu(g, '#7fc8f8', '#e3f5ff');
  if (!o.noite) { const R0 = rng(7); for (let i = 0; i < 4; i++) cloud(g, (R0() * 2200 + t * 18) % 2300 - 200, 90 + R0() * 160, 0.6 + R0() * 0.4, '#ffffff'); }
  if (!o.semAviao) { const k = o.aviaoT ?? ((t * 0.09) % 1.4); aviao(g, lerp(-400, 2300, k), 260 - k * 160, 0.65, { rot: -0.12 }); }
  // terminal
  box(g, -40, 330, 2000, 440, '#cfd8dc', 7, 0); R(g, -40, 330, 2000, 60, '#90a4ae');
  for (let i = 0; i < 12; i++) { R(g, 20 + i * 165, 410, 140, 300, o.noite ? '#fff59d' : '#81d4fa'); R(g, 20 + i * 165, 410, 140, 8, '#eceff1'); }
  // placa no canto esquerdo, acima da altura das cabeças (não fica atrás de personagem nem do texto do meio)
  box(g, 40, 205, 700, 96, '#1565c0', 6, 10); label(g, 'AEROPORTO DE GUARULHOS', 390, 247, { size: 44, color: '#fff', stroke: 0 }); label(g, 'TERMINAL 2 • DESEMBARQUE', 390, 285, { size: 22, color: '#bbdefb', stroke: 0 });
  // calçada e rua
  R(g, -40, 770, 2000, 70, '#bdbdbd'); R(g, -40, 836, 2000, 10, '#757575'); R(g, -40, 846, 2000, 400, '#455a64');
  for (let i = 0; i < 12; i++) R(g, i * 180 + 20, 990, 100, 12, '#eceff1');
  placaTaxi(g, 300, 800);
  const n = o.taxis ?? 3; for (let i = 0; i < n; i++) taxi(g, 1780 - i * 520, 900, 0.85, { luz: true });
  if (o.noite) { g.fillStyle = 'rgba(10,10,40,.35)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
}
// painel de embarque. o.k (0..1: linhas virando CANCELADO), o.vermelho (painel todo vermelho), o.pisca
const DESTINOS = [['06:10', 'RIO DE JANEIRO'], ['06:25', 'BRASÍLIA'], ['06:40', 'SALVADOR'], ['07:05', 'RECIFE'], ['07:20', 'MANAUS'], ['07:35', 'PORTO ALEGRE'], ['07:50', 'FORTALEZA'], ['08:10', 'BELO HORIZONTE'], ['08:30', 'CUIABÁ']];
export function painelVoos(g, t = 0, o = {}) {
  ceu(g, '#37474f', '#263238', 1080);
  R(g, -40, 900, 2000, 300, '#546e7a');
  const x0 = 140, y0 = 90, w = 1640;
  box(g, x0 - 20, y0 - 20, w + 40, 820, '#11161c', 8, 16);
  R(g, x0, y0, w, 90, o.vermelho ? '#b71c1c' : '#0d47a1'); label(g, 'PARTIDAS', x0 + 40, y0 + 47, { size: 54, color: '#ffd23f', stroke: 0, align: 'left' });
  label(g, 'HORA', x0 + 70, y0 + 130, { size: 30, color: '#90a4ae', stroke: 0 }); label(g, 'VOO', x0 + 250, y0 + 130, { size: 30, color: '#90a4ae', stroke: 0 });
  label(g, 'DESTINO', x0 + 420, y0 + 130, { size: 30, color: '#90a4ae', stroke: 0, align: 'left' }); label(g, 'SITUAÇÃO', x0 + 1390, y0 + 130, { size: 30, color: '#90a4ae', stroke: 0 });
  const pisca = Math.sin(t * 7) > -0.2, k = o.k ?? 1;
  const LST = o.destinos || DESTINOS;
  LST.forEach(([h, d], i) => {
    const y = y0 + 200 + i * 66, canc = o.vermelho || i / LST.length < k;
    if (o.vermelho) R(g, x0, y - 30, w, 60, i % 2 ? '#7f1010' : '#8e1414'); else if (i % 2) R(g, x0, y - 30, w, 60, '#161d25');
    label(g, h, x0 + 70, y + 2, { size: 40, color: '#fff59d', stroke: 0 }); label(g, 'VOO ' + (1021 + i * 37), x0 + 250, y + 2, { size: 36, color: '#fff', stroke: 0 });
    label(g, d, x0 + 420, y + 2, { size: 40, color: '#fff', stroke: 0, align: 'left' });
    if (canc) { if (pisca || o.pisca === false) { box(g, x0 + 1230, y - 26, 320, 52, '#e53935', 0, 6); label(g, 'CANCELADO', x0 + 1390, y + 2, { size: 38, color: '#fff', stroke: 0 }); } }
    else label(g, 'CONFIRMADO', x0 + 1390, y + 2, { size: 38, color: '#69f0ae', stroke: 0 });
  });
}
// saguão vazio de Congonhas, esteira parada
export function saguao(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#eceff1');
  R(g, -40, 0, 2000, 110, '#b0bec5'); for (let i = 0; i < 10; i++) R(g, i * 220 - 20, 0, 18, 760, '#cfd8dc');
  box(g, 700, 130, 520, 90, '#1565c0', 6, 10); label(g, 'CONGONHAS', 960, 178, { size: 56, color: '#fff', stroke: 0 });
  // balcões vazios
  for (let i = 0; i < 4; i++) { const x = 140 + i * 230; box(g, x, 560, 200, 190, '#90a4ae', 6, 8); box(g, x + 20, 470, 160, 70, '#263238', 5, 6); label(g, 'FECHADO', x + 100, 507, { size: 26, color: '#ff8a80', stroke: 0 }); }
  // esteira
  box(g, 1080, 640, 760, 120, '#607d8b', 6, 30); R(g, 1110, 660, 700, 40, '#37474f'); for (let i = 0; i < 12; i++) R(g, 1120 + i * 58, 662, 6, 36, '#263238');
  box(g, 1300, 420, 320, 80, '#11161c', 5, 8); label(g, 'ESTEIRA 3', 1460, 450, { size: 30, color: '#ffd23f', stroke: 0 }); label(g, 'PARADA', 1460, 484, { size: 26, color: '#ff8a80', stroke: 0 });
  R(g, -40, 760, 2000, 400, '#d7ccc8'); g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 9; i++) g.fillRect(i * 240, 780, 120, 300);
}
// Marechal Thaumaturgo (AC): rio largo, barco, pista de terra, floresta. o.barcoX, o.pista (mostra), o.dia (0..1 céu)
export function rioAcre(g, t = 0, o = {}) {
  ceu(g, o.tarde ? '#ffb74d' : '#81d4fa', o.tarde ? '#ffe0b2' : '#e1f5fe', 500);
  const R0 = rng(12);
  // floresta ao fundo
  for (let i = 0; i < 40; i++) { const x = i * 52 - 40 + R0() * 20, y = 360 + R0() * 40; oval(g, x, y, 60 + R0() * 30, 70 + R0() * 40, ['#2e7d32', '#388e3c', '#1b5e20'][i % 3], 5); }
  R(g, -40, 400, 2000, 60, '#1b5e20');
  // pista de terra na margem de lá
  if (o.pista !== false) { polyO(g, [[1200, 470], [1880, 470], [1920, 520], [1160, 520]], '#c49a6c', 5); label(g, 'PISTA', 1540, 497, { size: 26, color: '#5d4037', stroke: 0 });
    tube(g, [[1860, 470], [1860, 400]], 6, INK, 0); polyO(g, [[1862, 402], [1910, 412 + Math.sin(t * 4) * 4], [1910, 428 + Math.sin(t * 4) * 4], [1862, 432]], '#ff7043', 3); }
  // rio
  R(g, -40, 500, 2000, 350, '#8d6e3f'); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 6;
  for (let i = 0; i < 16; i++) { const y = 540 + (i % 8) * 38, x = ((i * 260 + t * 40) % 2200) - 150; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 90, y); g.stroke(); }
  if (o.barco !== false) barco(g, o.barcoX ?? 760, 700, 0.8);
  // margem de cá (onde ficam os personagens)
  blob(g, g => { g.moveTo(-40, 860); g.quadraticCurveTo(960, 820, 1960, 870); g.lineTo(1960, 1200); g.lineTo(-40, 1200); g.closePath(); }, '#a1887f', 6);
  R(g, -40, 900, 2000, 300, '#a1887f');
}
// corredor de hospital. o.horas (relógio da parede)
export function hospital(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#e0f2f1');
  polyO(g, [[0, 0], [620, 260], [620, 700], [0, 1000]], '#b2dfdb', 0); polyO(g, [[1920, 0], [1300, 260], [1300, 700], [1920, 1000]], '#b2dfdb', 0);
  R(g, 620, 260, 680, 440, '#e0f2f1'); box(g, 760, 330, 400, 370, '#80cbc4', 6, 6); R(g, 955, 330, 10, 370, '#4db6ac');
  box(g, 720, 270, 480, 50, '#c62828', 5, 8); label(g, 'CENTRO CIRÚRGICO', 960, 297, { size: 30, color: '#fff', stroke: 0 });
  polyO(g, [[0, 1000], [620, 700], [1300, 700], [1920, 1000], [1920, 1200], [0, 1200]], '#cfd8dc', 0);
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 4; g.beginPath(); g.moveTo(960, 700); g.lineTo(960, 1100); g.stroke();
  box(g, 180, 330, 200, 300, '#4db6ac', 5, 6); box(g, 1540, 330, 200, 300, '#4db6ac', 5, 6);
  if (!o.semRelogio) relogio(g, 1580, 170, 90, o.horas ?? 3.2);
}
// mapas. o.modo: 'brasil' | 'europa' | 'atlantico'; o.k (0..1 animação)
const BR = [[300, 40], [420, 30], [520, 90], [640, 120], [760, 180], [800, 260], [770, 330], [700, 420], [660, 520], [600, 600], [520, 660], [450, 760], [380, 700], [390, 600], [320, 540], [250, 520], [180, 430], [120, 380], [80, 300], [140, 220], [220, 160], [250, 90]];
export const CIDADES = { 'SÃO PAULO': [540, 590], 'RIO': [620, 570], 'BRASÍLIA': [520, 460], 'MANAUS': [300, 170], 'RECIFE': [770, 290], 'SALVADOR': [700, 390], 'PORTO ALEGRE': [450, 720], 'CRUZEIRO DO SUL': [120, 310], 'FORTALEZA': [720, 200], 'CUIABÁ': [370, 440], 'BELÉM': [530, 110], 'MARECHAL THAUMATURGO': [95, 345] };
export function mapa(g, t = 0, o = {}) {
  const modo = o.modo || 'brasil', k = o.k ?? 0;
  if (modo === 'brasil') {
    R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#0d47a1'); g.save(); g.translate(o.x ?? 520, o.y ?? 110); g.scale(o.s ?? 1.2, o.s ?? 1.2);
    polyO(g, BR, '#43a047', 7);
    const rotas = o.rotas || [['SÃO PAULO', 'RIO'], ['SÃO PAULO', 'MANAUS'], ['SÃO PAULO', 'RECIFE'], ['BRASÍLIA', 'BELÉM'], ['RIO', 'SALVADOR'], ['SÃO PAULO', 'PORTO ALEGRE'], ['BRASÍLIA', 'FORTALEZA'], ['SÃO PAULO', 'CUIABÁ'], ['RIO', 'BRASÍLIA'], ['MANAUS', 'CRUZEIRO DO SUL']];
    rotas.forEach(([a, b], i) => { const vis = 1 - clamp(k * 1.6 - i * 0.06); if (vis <= 0) return; const [ax, ay] = CIDADES[a], [bx, by] = CIDADES[b];
      g.save(); g.globalAlpha = vis; g.strokeStyle = '#ffd23f'; g.lineWidth = 6; g.setLineDash([16, 12]); g.lineDashOffset = -t * 40; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, Math.min(ay, by) - 70, bx, by); g.stroke(); g.setLineDash([]); g.restore(); });
    for (const nome of o.cidades || ['SÃO PAULO', 'RIO', 'MANAUS', 'RECIFE', 'BRASÍLIA']) { const [x, y] = CIDADES[nome]; oval(g, x, y, 12, 12, '#fff', 4); }
    (o.rotulos || []).forEach(nome => { const [x, y] = CIDADES[nome]; label(g, nome, x, y - 34, { size: 34, color: '#fff', stroke: 8 }); });
    g.restore();
  } else if (modo === 'europa') {
    R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#1565c0');
    polyO(g, [[700, 420], [820, 360], [960, 330], [1100, 300], [1300, 280], [1500, 300], [1700, 260], [1960, 300], [1960, 1100], [1300, 1100], [1100, 1000], [950, 980], [800, 900], [760, 760], [820, 700], [720, 600], [680, 500]], '#66bb6a', 7);
    polyO(g, [[620, 380], [700, 330], [760, 380], [700, 470], [640, 460]], '#66bb6a', 6);                                     // Reino Unido
    polyO(g, [[300, 150], [430, 120], [500, 160], [440, 220], [320, 220]], '#a5d6a7', 6);                                     // Islândia
    label(g, 'ISLÂNDIA', 400, 270, { size: 34, color: '#fff', stroke: 8 }); polyO(g, [[390, 160], [420, 120], [450, 160]], '#6d4c41', 4);
    const a = clamp(k); g.save(); g.globalAlpha = 0.85;
    for (let i = 0; i < 26; i++) { const r = rng(i + 30), d = a * (300 + r() * 1100); if (d < 30) continue; oval(g, 420 + d * (0.8 + r() * 0.3), 140 + d * (0.25 + r() * 0.35) + Math.sin(t + i) * 8, 60 + r() * 70 * a, 40 + r() * 40 * a, '#616161', 0); }
    g.restore();
  } else {
    R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#1565c0');
    polyO(g, [[-40, 200], [300, 150], [520, 260], [560, 420], [420, 560], [300, 760], [-40, 820]], '#66bb6a', 7);              // América do Norte
    polyO(g, [[1640, 180], [1960, 140], [1960, 900], [1700, 760], [1600, 520], [1700, 380]], '#66bb6a', 7);                    // Europa
    const gx = 520, gy = 330; oval(g, gx, gy, 16, 16, '#ffd23f', 5); label(g, 'GANDER', gx + 30, gy - 40, { size: 40, color: '#fff', stroke: 8, align: 'left' });
    for (let i = 0; i < 8; i++) { const r = rng(i + 50), sx = 1700 - r() * 300, sy = 250 + r() * 400, e = clamp(k * 1.3 - i * 0.05), x = lerp(sx, gx + 70 + (i % 4) * 70, e), y = lerp(sy, gy + 70 + Math.floor(i / 4) * 55, e);   // pousam abaixo do nome GANDER
      aviao(g, x, y, 0.22, { dir: -1, rot: Math.atan2(gy - sy, gx - sx) * 0 }); }
  }
}
// Gander (Canadá): ginásio da escola cheio de catres. o.fora (cidadezinha + aviões parados)
export function gander(g, t = 0, o = {}) {
  if (o.fora) {
    ceu(g, '#b3e5fc', '#eceff1'); R(g, -40, 640, 2000, 500, '#cfd8dc');
    for (let i = 0; i < 5; i++) aviao(g, 300 + i * 360, 620 - (i % 2) * 40, 0.55, { trem: true });
    for (let i = 0; i < 7; i++) { const x = 60 + i * 290; box(g, x, 760, 200, 140, ['#ef9a9a', '#90caf9', '#fff59d', '#a5d6a7'][i % 4], 6, 4); polyO(g, [[x - 20, 760], [x + 100, 680], [x + 220, 760]], '#6d4c41', 6); }
    box(g, 700, 940, 520, 80, '#c62828', 6, 10); label(g, 'GANDER • CANADÁ', 960, 982, { size: 44, color: '#fff', stroke: 0 });
    return;
  }
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, '#ffe0b2'); R(g, -40, 0, 2000, 80, '#bcaaa4');
  for (let i = 0; i < 6; i++) { box(g, 80 + i * 320, 140, 200, 160, '#b3e5fc', 6, 6); g.fillStyle = 'rgba(255,255,255,.8)'; for (let j = 0; j < 8; j++) g.fillRect(90 + i * 320 + (j * 37) % 180, 150 + (j * 53) % 140, 6, 6); }
  box(g, 560, 330, 800, 90, '#c62828', 6, 10); label(g, 'BEM-VINDOS A GANDER', 960, 377, { size: 50, color: '#fff', stroke: 0 });
  R(g, -40, 560, 2000, 600, '#d7a96a'); g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 4; for (let i = 0; i < 20; i++) { g.beginPath(); g.moveTo(i * 110, 560); g.lineTo(i * 110 - 300, 1100); g.stroke(); }
  for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { const x = 140 + i * 300 + (r % 2) * 120, y = 640 + r * 150, cor = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28'][(i + r) % 4];
    box(g, x - 110, y, 220, 60, '#eceff1', 5, 8); box(g, x - 20, y + 2, 130, 56, cor, 4, 8); oval(g, x - 75, y + 22, 26, 18, '#ffffff', 4); }
}
// casa do Valdemar (sala simples). o.noite
export function casaValdemar(g, t = 0, o = {}) {
  sala(g, { night: !!o.noite, box: o.box });
  // foto do táxi na parede + boné pendurado
  box(g, 1440, 250, 230, 170, '#8d6e63', 6, 6); R(g, 1458, 268, 194, 134, o.noite ? '#90a4ae' : '#bbdefb'); taxi(g, 1555, 380, 0.32);
  tube(g, [[1760, 280], [1760, 300]], 6, INK, 0); oval(g, 1760, 330, 46, 30, '#fbc02d', 5);
}
// rodoviária lotada
export function rodoviaria(g, t = 0, o = {}) {
  ceu(g, '#90caf9', '#e3f2fd'); box(g, 80, 260, 1760, 520, '#ffe082', 7, 0); box(g, 560, 180, 800, 110, '#ef6c00', 6, 10); label(g, 'RODOVIÁRIA', 960, 237, { size: 60, color: '#fff', stroke: 0 });
  for (let i = 0; i < 6; i++) { box(g, 140 + i * 290, 360, 230, 140, '#263238', 5, 6); label(g, 'ESGOTADO', 255 + i * 290, 432, { size: 32, color: '#ff8a80', stroke: 0 }); }
  R(g, -40, 780, 2000, 400, '#9e9e9e');
}
// hotéis vazios: Fortaleza, Natal, Foz
export function pousadaVazia(g, t = 0, o = {}) {
  ceu(g, '#4fc3f7', '#e1f5fe'); R(g, -40, 820, 2000, 400, '#ffe0b2');
  ['FORTALEZA', 'NATAL', 'FOZ DO IGUAÇU'].forEach((n, i) => { const x = 140 + i * 600; box(g, x, 260, 440, 560, ['#ffccbc', '#c5e1a5', '#b3e5fc'][i], 7, 6);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) box(g, x + 40 + c * 130, 300 + r * 110, 100, 80, '#455a64', 4, 4);
    box(g, x + 60, 160, 320, 80, '#5d4037', 6, 8); label(g, n, x + 220, 200, { size: n.length > 10 ? 32 : 42, color: '#fff', stroke: 0 }); });
}

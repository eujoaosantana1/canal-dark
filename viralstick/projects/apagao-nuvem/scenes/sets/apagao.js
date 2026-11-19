// sets/apagao.js — cenários do vídeo 11 (Jornal do Universo): estúdio do jornal, "nuvem" de servidores, home office
import { E, clamp, lerp, rng, ease } from '/engine/core.js';
import { box, oval, polyO, blob, tube, label, INK } from '/engine/toon.js';
import { cloud } from './mundo.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// logo do jornal: globo com auréola + nome. s = escala
export function logo(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  oval(g, 0, 0, 70, 70, '#1e88e5', 6); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 5;
  g.beginPath(); g.ellipse(0, 0, 30, 68, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(-68, 0); g.lineTo(68, 0); g.stroke();
  g.beginPath(); g.ellipse(0, -20, 60, 14, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = '#ffd23f'; g.lineWidth = 9; g.beginPath(); g.ellipse(0, -92, 56, 14, 0, 0, Math.PI * 2); g.stroke();
  if (o.texto !== false) { label(g, 'JORNAL DO', 100, -24, { size: 44, color: '#ffffff', stroke: 0, align: 'left' }); label(g, 'UNIVERSO', 100, 30, { size: 64, color: '#ffd23f', stroke: 0, align: 'left' }); }
  g.restore();
}

// telão do estúdio. draw = conteúdo (coordenadas locais, 0..w x 0..h)
export function telao(g, x, y, w, h, draw) {
  box(g, x - 14, y - 14, w + 28, h + 28, '#0b1026', 6, 18);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.translate(x, y);
  if (draw) draw(g, w, h); else { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1565c0'); gr.addColorStop(1, '#0d47a1'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  g.restore(); g.strokeStyle = '#4fc3f7'; g.lineWidth = 4; g.strokeRect(x, y, w, h);
}

// estúdio: fundo azul escuro, faixas de luz, telão à direita (o.tela = função de desenho), bancada na frente (desenhada pela cena)
export function estudio(g, t = 0, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#0d1b4c'); gr.addColorStop(1, '#13286b');
  g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.fillStyle = 'rgba(79,195,247,.10)'; for (let i = 0; i < 7; i++) { g.save(); g.translate(200 + i * 260, -50); g.rotate(0.35); g.fillRect(0, 0, 70, 1400); g.restore(); }
  // painel com o mapa-múndi estilizado (pontos)
  const r = rng(11); g.fillStyle = 'rgba(144,202,249,.28)'; for (let i = 0; i < 160; i++) { const px = 60 + r() * 700, py = 120 + r() * 420; g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.fill(); }
  if (o.telao !== false) telao(g, 1080, 130, 720, 420, o.tela);
  R(g, -E.W, 860, E.W * 3, 700, '#0a1438');
}
// bancada do apresentador (na frente do personagem)
export function bancada(g, x = 760, y = 760, w = 900) {
  blob(g, g => { g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x + w / 2 - 40, y + 330); g.lineTo(x - w / 2 + 40, y + 330); g.closePath(); }, '#e3f2fd', 7);
  box(g, x - w / 2 - 10, y - 26, w + 20, 40, '#90caf9', 6, 10);
  logo(g, x - 210, y + 150, 0.9);
}

// rack de servidor. on = 0..1 (luzes); erro = luz vermelha
export function rack(g, x, y, s = 1, t = 0, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -70, -360, 140, 360, o.off ? '#37474f' : '#263238', 6, 8);
  for (let i = 0; i < 8; i++) {
    box(g, -56, -340 + i * 42, 112, 30, o.off ? '#455a64' : '#37474f', 3, 4);
    if (!o.off) { const blink = Math.sin(t * (6 + i) + x) > -0.2; oval(g, 36, -325 + i * 42, 6, 6, o.erro ? (blink ? '#ff5252' : '#7f0000') : (blink ? '#69f0ae' : '#1b5e20'), 0); oval(g, 18, -325 + i * 42, 6, 6, blink ? '#40c4ff' : '#01579b', 0); }
  }
  g.restore();
}
// "a nuvem": céu, nuvens e fileiras de servidores em cima delas. o.apagados = quantos racks desligados; o.erro = racks em vermelho
export function nuvem(g, t = 0, o = {}) {
  const gr = g.createLinearGradient(0, -200, 0, 900); gr.addColorStop(0, '#5c6bc0'); gr.addColorStop(1, '#b3e5fc');
  g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  for (const [x, y, s] of [[200, 160, 1.4], [700, 90, 1.0], [1350, 140, 1.6], [1750, 260, 1.0]]) cloud(g, x + Math.sin(t * 0.3 + x) * 12, y, s, 'rgba(255,255,255,.85)');
  // nuvem-chão
  g.fillStyle = '#ffffff'; for (let i = 0; i < 16; i++) { g.beginPath(); g.arc(-80 + i * 140, 980 + (i % 2) * 30, 150, 0, Math.PI * 2); g.fill(); }
  R(g, -E.W, 1010, E.W * 3, 400, '#ffffff');
  const n = 9, off = o.apagados || 0;
  for (let i = 0; i < n; i++) { const x = 130 + i * 205; rack(g, x, 930, 1.05, t, { off: i % 2 === 1 && i < off * 2 + 1, erro: o.erro && i % 3 === 0 }); }
  if (o.night) { g.fillStyle = 'rgba(10,10,40,.35)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
}

// home office do Rafa: parede, janela, mesa (a cena desenha o notebook e o personagem)
export function escritorio(g, t = 0, o = {}) {
  R(g, -E.W, -E.H, E.W * 3, E.H * 3, o.night ? '#5c5470' : '#dfe7ef');
  // janela
  box(g, 1260, 150, 420, 330, o.night ? '#1a237e' : '#b3e5fc', 7, 8); R(g, 1466, 150, 8, 330, INK); R(g, 1260, 312, 420, 8, INK);
  if (o.night) { g.fillStyle = '#fff59d'; for (const [x, y] of [[1310, 210], [1560, 380], [1600, 200]]) { g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill(); } }
  // quadro de post-its
  box(g, 180, 160, 460, 300, '#bcaaa4', 6, 6);
  const cs = ['#fff176', '#f48fb1', '#81d4fa', '#a5d6a7'];
  for (let i = 0; i < 10; i++) box(g, 205 + (i % 5) * 86, 185 + Math.floor(i / 5) * 130, 70, 70, cs[i % 4], 3, 3);
  label(g, 'REUNIÃO', 425, 420, { size: 34, color: INK, stroke: 0 });
  R(g, -E.W, 900, E.W * 3, 600, o.night ? '#4e4560' : '#b0bec5'); R(g, -E.W, 897, E.W * 3, 6, INK);
}
// mesa + notebook. tela = função de desenho do conteúdo (local 0..300 x 0..190)
export function mesaNotebook(g, x, y, s, tela) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -420, 0, 840, 34, '#8d6e63', 6, 6); tube(g, [[-380, 34], [-380, 300]], 18, '#6d4c41'); tube(g, [[380, 34], [380, 300]], 18, '#6d4c41');
  box(g, -170, -230, 340, 230, '#263238', 6, 14);
  g.save(); g.beginPath(); g.rect(-150, -212, 300, 190); g.clip(); g.translate(-150, -212); if (tela) tela(g); g.restore();
  polyO(g, [[-200, -4], [200, -4], [230, 10], [-230, 10]], '#90a4ae', 5);
  g.restore();
}

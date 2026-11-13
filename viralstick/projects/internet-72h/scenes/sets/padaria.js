// sets/padaria.js — Padaria do Seu Nenê (estilo cartoon chapado)
import { E, layer } from '/engine/core.js';
import { box, oval, polyO, label, sign, INK } from '/engine/toon.js';

export const GY = 1010;          // chão (pés de quem está na frente do balcão)
export const CT = 640;           // tampo do balcão
export const CX0 = 900;          // início do balcão (x)

export function backWall(g) {
  g.fillStyle = '#f7e3a6'; g.fillRect(-E.W, -E.H, E.W * 3, 560 + E.H);                 // parede amarela
  g.fillStyle = '#cfe9ef'; g.fillRect(-E.W, 560, E.W * 3, 600);                      // azulejo
  g.strokeStyle = 'rgba(80,140,160,.35)'; g.lineWidth = 3;
  for (let x = -E.W; x < E.W * 2; x += 70) { g.beginPath(); g.moveTo(x, 560); g.lineTo(x, 1200); g.stroke(); }
  for (let y = 560; y < 1200; y += 70) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
  g.fillStyle = INK; g.fillRect(-E.W, 556, E.W * 3, 6);
  // prateleira de pães
  box(g, 980, 300, 820, 26, '#9a6233', 5, 4);
  for (let i = 0; i < 9; i++) { const x = 1030 + i * 88; oval(g, x, 280, 36, 22, '#e4a24a', 5); g.strokeStyle = '#a8651f'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 14, 274); g.lineTo(x + 6, 286); g.stroke(); }
  box(g, 980, 430, 820, 26, '#9a6233', 5, 4);
  for (let i = 0; i < 5; i++) { const x = 1050 + i * 165; box(g, x - 55, 360, 110, 70, '#f3d9a8', 5, 10); oval(g, x, 372, 40, 16, '#c9773a', 4); }
  // lousa de preços
  sign(g, 470, 250, 560, 210, ['PINGADO  R$ 6,00', 'PÃO NA CHAPA  R$ 5,00'], { size: 46 });
  // janela
  box(g, -300, 160, 520, 330, '#8fd3f4', 6, 6); g.fillStyle = '#ffffff99'; g.fillRect(-260, 200, 60, 250);
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-40, 160); g.lineTo(-40, 490); g.stroke();
  // chão
  g.fillStyle = '#e9e2d4'; g.fillRect(-E.W, 900, E.W * 3, 600);
  g.fillStyle = INK; g.fillRect(-E.W, 897, E.W * 3, 6);
  for (let x = -E.W, k = 0; x < E.W * 2; x += 120, k++) if (k % 2) { g.fillStyle = '#d6cdbb'; g.fillRect(x, 903, 120, 600); }
}
// balcão (desenhar depois de quem fica atrás dele)
export function counter(g, x0 = CX0, x1 = E.W + 300) {
  box(g, x0, CT + 30, x1 - x0, GY - 60 - CT, '#b8743d', 6, 0);                        // corpo de madeira
  box(g, x0 + 40, CT + 60, Math.min(560, x1 - x0 - 80), 170, '#dff3f8', 5, 6);        // vitrine
  for (let i = 0; i < 5; i++) { oval(g, x0 + 110 + i * 100, CT + 190, 38, 20, i % 2 ? '#e8b04e' : '#d98c3a', 4); }
  g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x0 + 60, CT + 74, 14, 140);
  box(g, x0 - 20, CT, x1 - x0 + 40, 34, '#7c4a26', 6, 6);                             // tampo
}
export function padaria(g, cam) { layer(g, cam, 0.85, backWall); }

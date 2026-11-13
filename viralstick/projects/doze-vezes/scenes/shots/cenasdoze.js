// cenasdoze.js — cenas de "E se desse pra parcelar tudo em 12 vezes"
// tela do Suporte: fixa para este vídeo (outros arquivos de cenas tentam trocar; o setter ignora)
const TELA12 = ['PEDIDO 2026/12', 'PARCELAR TUDO', 'EM 12x'];
Object.defineProperty(globalThis, 'TELA_SUPORTE', { get: () => TELA12, set: () => {}, configurable: true });
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { label, box, oval, polyO, tube, INK } from '/engine/toon.js';
import { wl, pop, push, bg, rays, pill, bigText, drawSet, person, M, DZ } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);
const brl = v => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',')).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ícones de produto
function icone(g, nome, s = 1) {
  g.save(); g.scale(s, s);
  if (nome === 'coxinha') { polyO(g, [[0, -170], [110, 40], [80, 120], [-80, 120], [-110, 40]], '#f5a623', 7); oval(g, 0, 70, 105, 60, '#f5a623', 0); for (let i = 0; i < 9; i++) oval(g, -60 + (i * 37) % 120, -20 + (i * 53) % 110, 6, 6, '#c77d14', 0); }
  else if (nome === 'tesoura') { tube(g, [[-120, -120], [60, 60]], 18, '#90a4ae', 5); tube(g, [[120, -120], [-60, 60]], 18, '#90a4ae', 5); oval(g, -90, 100, 46, 46, '#e53935', 7); oval(g, 90, 100, 46, 46, '#e53935', 7); oval(g, -90, 100, 22, 22, '#e3f2fd', 0); oval(g, 90, 100, 22, 22, '#e3f2fd', 0); }
  else if (nome === 'cafe') { box(g, -90, -60, 180, 150, '#ffffff', 7, 20); tube(g, [[90, -20], [140, -10], [140, 40], [90, 50]], 14, '#ffffff', 6); oval(g, 0, -60, 90, 22, '#5d4037', 6); for (const dx of [-30, 20]) tube(g, [[dx, -110], [dx + 15, -150], [dx, -190]], 8, '#bdbdbd', 0); }
  else if (nome === 'onibus') M.bus(g, 0, 150, 0.7, { sign: 'CENTRO' });
  else if (nome === 'celular') { box(g, -90, -170, 180, 340, '#212121', 7, 26); box(g, -76, -150, 152, 290, '#42a5f5', 4, 10); }
  else if (nome === 'salario') { box(g, -170, -90, 340, 180, '#43a047', 7, 10); oval(g, 0, 0, 56, 56, '#81c784', 6); label(g, 'R$', 0, 4, { size: 54, color: '#1b5e20', stroke: 0 }); }
  g.restore();
}

const K = {
  // parcelas aparecendo e somando. p.itens = [[nome, valor, em]], p.titulo, p.salario (mostra % do salário no fim), p.totalEm
  parcelas(g, t, info, p) {
    bg(g, p.fundo || '#263238'); if (p.titulo) bigText(g, E.W / 2, 90, p.titulo, pop(t, 0.05), { size: 64, color: '#ffd23f' });
    const it = p.itens || [], cols = it.length > 8 ? 7 : 4, cw = it.length > 8 ? 255 : 400, chH = it.length > 8 ? 220 : 280, y0 = it.length > 8 ? 210 : 300, x0 = E.W / 2 - (Math.min(cols, it.length) * cw) / 2 + cw / 2;
    let soma = 0;
    it.forEach(([nome, v, em], i) => {
      const q = pop(t, at(info, em, 0.25 + i * Math.min(0.35, info.dur * 0.6 / Math.max(1, it.length)))); if (q <= 0) return; soma += v;
      const x = x0 + (i % cols) * cw, y = y0 + Math.floor(i / cols) * (chH + 30);
      g.save(); g.translate(x, y + chH / 2); g.scale(q, q); g.rotate((i % 3 - 1) * 0.03);
      const big = cw > 300; box(g, -cw / 2 + 12, -chH / 2, cw - 24, chH, '#fffdf5', 6, 12); R(g, -cw / 2 + 12, -chH / 2, cw - 24, big ? 70 : 54, '#7e57c2');
      label(g, nome, 0, -chH / 2 + (big ? 36 : 28), { size: big ? 46 : (nome.length > 8 ? 26 : 30), color: '#fff', stroke: 0 });
      label(g, 'R$ ' + brl(v), 0, big ? 50 : 40, { size: big ? 96 : 62, color: INK, stroke: 0 }); g.restore();
    });
    const tt = p.totalEm != null ? at(info, p.totalEm, info.dur * 0.6) : 0.3;
    if (t > tt) { pill(g, E.W / 2, 900, 'TOTAL: R$ ' + brl(Math.round(soma)) + ' POR MÊS', pop(t, tt), { bg: '#e53935', size: 64 });
      if (p.salario) { const k = ease.out(prog(t, tt + 0.4, tt + 1.4)); const w = 1100, pr = Math.min(1, soma / p.salario);
        box(g, E.W / 2 - w / 2, 990, w, 50, '#455a64', 5, 10); if (k > 0) box(g, E.W / 2 - w / 2, 990, w * pr * k, 50, '#ff7043', 5, 10);
        label(g, Math.round(pr * 100 * k) + '% DO SALÁRIO', E.W / 2, 1015, { size: 34, color: '#fff', stroke: 6 }); } }
  },
  // duas etiquetas: parcelado x à vista. p.a = [l1, l2], p.b = [l1, l2], p.dif (texto), p.difEm, p.bEm
  preco2(g, t, info, p) {
    blurLayer(g, 8, g => drawSet(g, 'loja_cel', t, { etiqueta: false }), { z: 1.3 }, 1);
    g.save(); push(g, t, info, 1.0, 1.05);
    const qa = pop(t, 0.15), qb = pop(t, at(info, p.bEm, info.dur * 0.35));
    if (qa > 0) DZ.etiqueta(g, 560, 470, 1.6 * qa, p.a[0], p.a[1], '#e53935', -0.05);
    if (qb > 0) DZ.etiqueta(g, 1380, 470, 1.6 * qb, p.b[0], p.b[1], '#2e7d32', 0.05);
    g.restore();
    if (p.dif) pill(g, E.W / 2, 860, p.dif, pop(t, at(info, p.difEm, info.dur * 0.7)), { bg: '#212121', size: 60 });
  },
  // produto em 12 vezes. p.item, p.preco (riscado), p.parc ("12x R$ 0,50"), p.em
  em12(g, t, info, p) {
    bg(g, p.fundo || '#fff3e0'); g.save(); push(g, t, info, 1.0, 1.06);
    const q = pop(t, 0.1); if (q > 0) { g.save(); g.translate(540, 560); g.scale(q, q); icone(g, p.item, p.item === 'onibus' ? 1.6 : 2.1); g.restore(); }
    if (p.preco) { const k = pop(t, 0.3); if (k > 0) { g.save(); g.translate(1300, 380); g.scale(k, k); label(g, p.preco, 0, 0, { size: 96, color: '#757575', stroke: 0 });
      const r = ease.out(prog(t, at(info, p.em, info.dur * 0.4) - 0.2, at(info, p.em, info.dur * 0.4) + 0.1)); if (r > 0) { g.strokeStyle = '#e53935'; g.lineWidth = 12; g.beginPath(); g.moveTo(-170, 10); g.lineTo(-170 + 340 * r, -10); g.stroke(); } g.restore(); } }
    const k2 = pop(t, at(info, p.em, info.dur * 0.4)); if (k2 > 0) { g.save(); g.translate(1300, 620); g.scale(k2, k2); label(g, p.parc, 0, 0, { size: p.parc.length > 11 ? 104 : 130, color: '#e53935', stroke: 14 }); label(g, 'SEM JUROS', 0, 120, { size: 52, color: '#43a047', stroke: 8 }); g.restore(); }
    g.restore();
  },
  // a fatura em rolo de papel desenrolando pelo corredor. p.n (parcelas), p.em
  rolo(g, t, info, p) {
    const k = ease.inOut(prog(t, 0.2, Math.max(1.2, info.dur * 0.75)));
    g.save(); push(g, t, info, 1.0, 1.08); drawSet(g, 'corredor', t, {});
    const x1 = lerp(1650, -200, k);
    g.save(); g.beginPath(); g.moveTo(x1, 900); g.lineTo(1700, 860); g.lineTo(1700, 1040); g.lineTo(x1, 1070); g.closePath(); g.fillStyle = '#fffdf5'; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
    for (let x = 1640; x > x1 + 40; x -= 80) { const yy = 905 + (1700 - x) * 0.025; R(g, x - 60, yy, 70, 10, '#9e9e9e'); R(g, x - 60, yy + 30, 50, 10, '#9e9e9e'); R(g, x - 60, yy + 60, 60, 10, '#e57373'); R(g, x - 60, yy + 90, 40, 10, '#9e9e9e'); }
    g.restore();
    oval(g, 1720, 950, 120, 120, '#fffdf5', 8); oval(g, 1720, 950, 36, 36, '#bdbdbd', 6); label(g, 'FATURA', 1720, 790, { size: 56, color: '#c62828', stroke: 6 });
    g.restore();
    const n = Math.round((p.n || 382) * k);
    if (t > 0.3) pill(g, E.W / 2, 140, n + ' PARCELAS', pop(t, 0.3), { bg: '#e53935', size: 84 });
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

// cenasdecimo.js — cenas de "E se o 13º salário deixasse de existir"
// tela do Suporte: fixa para este vídeo (outros arquivos de cenas tentam trocar; o setter ignora)
const TELA13 = ['PEDIDO 2026/13', 'UM ANO SEM', '13º SALÁRIO'];
Object.defineProperty(globalThis, 'TELA_SUPORTE', { get: () => TELA13, set: () => {}, configurable: true });
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { label, box, oval, polyO, tube, INK } from '/engine/toon.js';
import { wl, pop, push, bg, rays, pill, bigText, drawSet, M, DT } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);

function bandeira(g, x, y, w, h, tipo) {
  g.save(); g.translate(x, y);
  const faixasH = (cs) => cs.forEach((c, i) => R(g, 0, i * h / cs.length, w, h / cs.length, c));
  const faixasV = (cs) => cs.forEach((c, i) => R(g, i * w / cs.length, 0, w / cs.length, h, c));
  if (tipo === 'AR') { faixasH(['#74acdf', '#ffffff', '#74acdf']); oval(g, w / 2, h / 2, h * 0.12, h * 0.12, '#f6b40e', 0); }
  else if (tipo === 'MX') { faixasV(['#006847', '#ffffff', '#ce1126']); oval(g, w / 2, h / 2, h * 0.13, h * 0.13, '#8d6e63', 0); }
  else if (tipo === 'IT') faixasV(['#009246', '#ffffff', '#ce2b37']);
  else if (tipo === 'PT') { R(g, 0, 0, w * 0.4, h, '#046a38'); R(g, w * 0.4, 0, w * 0.6, h, '#da291c'); oval(g, w * 0.4, h / 2, h * 0.18, h * 0.18, '#ffe900', 0); }
  else if (tipo === 'US') { for (let i = 0; i < 7; i++) R(g, 0, i * h / 7, w, h / 14, '#b22234'); R(g, 0, h / 14, w, 0, '#fff'); R(g, 0, 0, w * 0.42, h * 0.54, '#3c3b6e'); }
  else if (tipo === 'UK') { R(g, 0, 0, w, h, '#012169'); g.strokeStyle = '#ffffff'; g.lineWidth = h * 0.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke(); g.strokeStyle = '#c8102e'; g.lineWidth = h * 0.07; g.stroke(); R(g, w * 0.42, 0, w * 0.16, h, '#fff'); R(g, 0, h * 0.38, w, h * 0.24, '#fff'); R(g, w * 0.45, 0, w * 0.1, h, '#c8102e'); R(g, 0, h * 0.42, w, h * 0.16, '#c8102e'); }
  else if (tipo === 'BR') { R(g, 0, 0, w, h, '#009c3b'); polyO(g, [[w / 2, h * 0.1], [w * 0.92, h / 2], [w / 2, h * 0.9], [w * 0.08, h / 2]], '#ffdf00', 0); oval(g, w / 2, h / 2, h * 0.24, h * 0.24, '#002776', 0); }
  g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(0, 0, w, h); g.restore();
}

const K = {
  // close do Papai Noel da vitrine. p: parado (começa parado), para (palavra em que para), volta (palavra em que volta), placa, placaEm, pilha, pilhaEm, texto
  noel_close(g, t, info, p) {
    blurLayer(g, 8, g => drawSet(g, p.set || 'loja13', t, { semNatal: p.semNatal }), { z: 1.5, x: 200 }, 1);
    g.save(); push(g, t, info, 1.0, 1.06);
    const tPara = p.para ? at(info, p.para, info.dur * 0.5) : null, tVolta = p.volta ? at(info, p.volta, info.dur * 0.6) : null;
    let parado = !!p.parado; if (tPara != null && t >= tPara) parado = true; if (tVolta != null && t >= tVolta) parado = false;
    const placa = p.placa && t >= at(info, p.placaEm, 0.3) ? p.placa : null, pilha = p.pilha && t >= at(info, p.pilhaEm, 0.3);
    box(g, 520, 120, 880, 900, 'rgba(214,238,248,.55)', 8, 10);
    DT.noel(g, 960, 1000, 1.45, DT.noelBraco(t, parado), { placa, pilha });
    if (tVolta != null && p.tap !== false) { const k = pop(t, tVolta - 0.1, 0.3); if (k > 0 && t < tVolta + 1.2) { g.save(); g.translate(1350, 420); g.scale(k, k); label(g, 'TAP!', 0, 0, { size: 110, color: '#ffd23f', stroke: 14 }); g.restore(); } }
    g.restore();
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, at(info, p.textoEm, 0.3)), { size: 58 });
  },
  // holerite de papel. p: nome, linhas [[txt, val]], risca (índice), riscaEm (palavra), carimbo (texto), fundo
  holerite(g, t, info, p) {
    bg(g, p.fundo || '#37474f'); g.save(); push(g, t, info, 1.0, 1.06);
    g.save(); g.translate(960, 560); g.rotate(-0.02);
    box(g, -520, -430, 1040, 860, '#fffdf5', 8, 10); R(g, -520, -430, 1040, 110, '#c62828');
    label(g, 'HOLERITE · NONATO BRINQUEDOS', 0, -372, { size: 48, color: '#fff', stroke: 0 });
    label(g, p.nome || 'FUNCIONÁRIA: CRIS', -460, -260, { size: 38, color: '#455a64', stroke: 0, align: 'left' });
    (p.linhas || []).forEach(([txt, val], i) => { const y = -150 + i * 110; const q = pop(t, 0.2 + i * 0.25); if (q <= 0) return; g.save(); g.globalAlpha = clamp(q);
      label(g, txt, -300, y, { size: 50, color: INK, stroke: 0 }); label(g, val, 300, y, { size: 50, color: i === p.risca ? '#2e7d32' : INK, stroke: 0 }); R(g, -460, y + 45, 920, 3, '#cfd8dc'); g.restore();
      if (i === p.risca) { const k = ease.out(prog(t, at(info, p.riscaEm, info.dur * 0.5), at(info, p.riscaEm, info.dur * 0.5) + 0.4)); if (k > 0) { g.strokeStyle = '#e53935'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(-470, y + 4); g.lineTo(-470 + 940 * k, y - 4); g.stroke(); } } });
    g.restore();
    if (p.carimbo) { const tc = at(info, p.riscaEm, info.dur * 0.5) + 0.45, k = pop(t, tc, 0.3); if (k > 0) M.stamp(g, 1240, 720, p.carimbo, k, { rot: -0.18 }); }
    g.restore();
  },
  // balanço do Nonato: duas colunas. p.a = [rótulo, valor, cor, em], p.b = idem
  balanco(g, t, info, p) {
    bg(g, p.fundo || '#263238'); if (p.titulo) bigText(g, E.W / 2, 120, p.titulo, pop(t, 0.05), { size: 74, color: '#fff' });
    const mx = Math.max(p.a[1], p.b[1]);
    [p.a, p.b].forEach(([rot, v, c, em], i) => {
      const t0 = at(info, em, 0.3 + i * 1.0), k = ease.out(prog(t, t0, t0 + 0.9)); const x = 640 + i * 640, h = 560 * v / mx * k;
      box(g, x - 170, 900 - h, 340, Math.max(h, 1), c, 7, 12);
      if (k > 0.05) { label(g, (i ? '− R$ ' : '+ R$ ') + Math.round(v * k).toLocaleString('pt-BR'), x, 860 - h - 50, { size: 70, color: c, stroke: 10 }); label(g, rot, x, 980, { size: 46, color: '#fff', stroke: 6 }); }
    });
    g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.moveTo(300, 902); g.lineTo(1620, 902); g.stroke();
  },
  // países com 13º. p.itens = [[sigla, nome, termo, sim, em]]
  paises(g, t, info, p) {
    bg(g, p.fundo || '#1a237e'); if (p.titulo) bigText(g, E.W / 2, 110, p.titulo, pop(t, 0.05), { size: 70, color: '#ffd23f' });
    const it = p.itens || [], cols = it.length === 4 ? 2 : Math.min(3, it.length), rows = Math.ceil(it.length / cols);
    it.forEach(([sig, nome, termo, sim, em], i) => {
      const q = pop(t, at(info, em, 0.3 + i * 0.4)); if (q <= 0) return;
      const cx = E.W / 2 + ((i % cols) - (cols - 1) / 2) * 580, cy = (rows === 1 ? 560 : 400 + Math.floor(i / cols) * 400);
      g.save(); g.translate(cx, cy); g.scale(q, q);
      box(g, -260, -170, 520, 340, '#fffdf5', 7, 18); bandeira(g, -230, -145, 170, 115, sig);
      label(g, nome, 90, -100, { size: nome.length > 9 ? 40 : 50, color: INK, stroke: 0 });
      label(g, termo, 0, 20, { size: termo.length > 16 ? 38 : 48, color: sim ? '#2e7d32' : '#c62828', stroke: 0 });
      if (sim) tube(g, [[145, 110], [170, 135], [210, 85]], 16, '#43a047', 4); else { tube(g, [[160, 85], [205, 130]], 16, '#e53935', 4); tube(g, [[205, 85], [160, 130]], 16, '#e53935', 4); }
      g.restore();
    });
  },
  // jornal velho girando. p: data, linhas (manchete), em
  jornal(g, t, info, p) {
    rays(g, t, '#8d6e63', '#a1887f');
    const k = ease.outBack(prog(t, 0.05, 0.9)); g.save(); g.translate(960, 560); g.rotate((1 - k) * 6 - 0.04); g.scale(0.2 + 0.8 * k, 0.2 + 0.8 * k);
    box(g, -600, -440, 1200, 880, '#f3e9d2', 8, 6); label(g, 'O DIÁRIO DA ÉPOCA', 0, -365, { size: 70, color: '#3e2723', stroke: 0 });
    R(g, -560, -320, 1120, 6, '#3e2723'); label(g, p.data || '1962', 0, -290, { size: 30, color: '#5d4037', stroke: 0 }); R(g, -560, -262, 1120, 3, '#3e2723');
    (p.linhas || []).forEach((l, i) => label(g, l, 0, -170 + i * 92, { size: 72, color: '#1b1b1b', stroke: 0 }));
    for (let i = 0; i < 6; i++) { R(g, -540, 130 + i * 44, 520, 16, '#bcaaa4'); R(g, 20, 130 + i * 44, 520, 16, '#bcaaa4'); }
    g.restore();
    if (p.texto) pill(g, E.W / 2, 1000, p.texto, pop(t, at(info, p.textoEm, 1.0)), { size: 52, bg: '#3e2723' });
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

// kit.js — BIBLIOTECA de cenas genéricas do Canal Dark (reaproveitável em qualquer vídeo; tudo por parâmetro)
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, head, label, box, oval, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, speaking, wl, pop, fadeIn, push, bg, rays, pill, bigText, drawSet, person, bust, M, MJ, POSES, posesAt, breathe } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
// tempo de entrada: número (s) ou palavra do roteiro
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);
function fundo(g, t, f) {
  if (!f || f === 'rays') return rays(g, t);
  if (f === 'rays_azul') return rays(g, t, '#1e88e5', '#42a5f5');
  if (f === 'rays_vermelho') return rays(g, t, '#c62828', '#e53935');
  if (f === 'rays_verde') return rays(g, t, '#2e7d32', '#43a047');
  if (f.startsWith('#')) return bg(g, f);
  blurLayer(g, 8, g => drawSet(g, f, t, {}), { z: 1.3 }, 1); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, E.W, E.H);
}

const K = {
  // pessoa "VOCÊ" pensando. p: balao (texto no balão de pensamento)
  voce2(g, t, info, p) {
    bg(g, '#bfe3f2'); g.fillStyle = '#a9d4e8'; for (let i = 0; i < 14; i++) g.fillRect(i * 150 + 40, 0, 60, E.H);
    g.fillStyle = '#e9e2d4'; g.fillRect(0, 900, E.W, 200); g.fillStyle = INK; g.fillRect(0, 897, E.W, 6);
    g.save(); push(g, t, info, 1.08, 1.0);
    character(g, { x: 760, y: 1000, s: 2.4, facing: 1, c: CAST.VOCE, pose: breathe(posesAt(t, [[0, 'shrug'], [0.6, 'think']]), t), expr: t < 0.6 ? 'surprised' : 'confused', look: [0.6, -0.7], blink: blinkAt(t, 1) });
    const a = pop(t, 0.1); if (a > 0) { g.save(); g.translate(430, 300); g.scale(a, a); label(g, 'VOCÊ', 0, 0, { size: 96, color: '#ffd23f', stroke: 16 }); tube(g, [[40, 50], [150, 140]], 14, '#ffd23f', 6); polyO(g, [[170, 160], [120, 150], [160, 110]], '#ffd23f', 5); g.restore(); }
    const b = pop(t, 0.5); if (b > 0) { g.save(); g.translate(1320, 330); g.scale(b, b); for (const [x, y, r] of [[-170, 150, 22], [-215, 205, 14]]) oval(g, x, y, r, r, '#fff', 5);
      for (const [x, y, r] of [[-120, 0, 110], [0, -50, 130], [130, 0, 110], [0, 60, 120]]) oval(g, x, y, r, r * 0.85, '#fff', 0);
      label(g, p.balao || '?', 0, 10, { size: (p.balao || '?').length > 6 ? 70 : 110, color: '#2e7d32', stroke: 0 }); g.restore(); }
    g.restore();
  },
  // linhas de texto grandes entrando uma a uma. p: linhas[], cores[], fundo, em[] (palavra ou s de cada linha), tam
  cartela(g, t, info, p) {
    fundo(g, t, p.fundo);
    const n = p.linhas.length, tam = p.tam || (n > 2 ? 110 : 140), gap = tam * 1.25, y0 = E.H / 2 - (n - 1) * gap / 2;
    p.linhas.forEach((l, i) => { const t0 = at(info, (p.em || [])[i], 0.15 + i * Math.min(0.9, info.dur / (n + 1))); bigText(g, E.W / 2, y0 + i * gap, l, pop(t, t0), { size: tam, color: (p.cores || [])[i] || '#fff' }); });
    if (p.sub) pill(g, E.W / 2, E.H - 150, p.sub, pop(t, 0.5), { bg: '#212121', size: 52 });
  },
  // número contando. p: de, ate, pre, suf, rotulo, fundo, cor, sep(milhar)
  numero(g, t, info, p) {
    fundo(g, t, p.fundo || 'rays_azul');
    const v = lerp(p.de ?? 0, p.ate, ease.out(prog(t, 0.15, Math.min(1.8, info.dur * 0.6))));
    let s = p.dec ? v.toFixed(p.dec).replace('.', ',') : Math.round(v).toString(); if (p.sep !== false && !p.dec) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    bigText(g, E.W / 2, E.H / 2 - 40, (p.pre || '') + s + (p.suf || ''), pop(t, 0.05), { size: p.tam || 190, color: p.cor || '#ffd23f' });
    if (p.rotulo) pill(g, E.W / 2, E.H / 2 + 170, p.rotulo, pop(t, 0.4), { bg: '#212121', size: 58 });
  },
  // ficha do personagem. p: k, nome, linhas[], cor, em[]
  ficha2(g, t, info, p) {
    bg(g, '#ffe082'); g.fillStyle = '#ffd54f'; for (let i = -10; i < 30; i++) { g.save(); g.translate(i * 120, 0); g.rotate(0.3); g.fillRect(0, -200, 50, 1600); g.restore(); }
    g.save(); push(g, t, info, 1.0, 1.05);
    const k = p.k, sc = k === 'DUDA' ? 1.9 : 2.6;
    character(g, { x: 560, y: 1010, s: sc, facing: 1, c: CAST[k], pose: breathe(POSES.crossArms, t), expr: p.expr || 'smile', talk: talkWho(WHO[k], info.globalT), blink: blinkAt(t, 2) });
    const a = pop(t, 0.15); if (a > 0) { g.save(); g.translate(1290, 470); g.scale(a, a); g.rotate(0.02);
      box(g, -430, -300, 860, 600, '#fffdf3', 8, 18); box(g, -430, -300, 860, 120, p.cor || '#c62828', 8, 18);
      label(g, p.nome, 0, -238, { size: 84, color: '#fff', stroke: 0 });
      (p.linhas || []).forEach((l, i) => { const t0 = at(info, (p.em || [])[i], 0.5 + i * 0.6); const q = pop(t, t0); if (q > 0) label(g, '• ' + l, -370, -110 + i * 92, { size: 58 * q, color: INK, stroke: 0, align: 'left' }); });
      g.restore(); }
    g.restore();
  },
  // cenário + relógio + rótulo de hora. p: set, label ('HORA 0'), h (0-12 ponteiro), chars[], fila (n pessoas)
  hora(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.06);
    drawSet(g, p.set || 'rua', t, p.setOpts || {});
    if (p.fila) fila(g, t, p.fila, p.filaX || 380);
    (p.chars || []).forEach(ch => person(g, ch, t, info));
    if (p.set === 'mercadinho') MJ.balcao(g, t, p);
    g.restore();
    const k = pop(t, 0.1); if (k > 0) { g.save(); g.translate(250, 230); g.scale(k, k); relogio(g, 0, 0, 140, p.h ?? 6, p.m ?? 0); g.restore(); }
    if (p.label) pill(g, 250, 450, p.label, pop(t, 0.25), { bg: '#212121', size: 60 });
    if (p.texto) pill(g, E.W / 2 + 200, 150, p.texto, pop(t, 0.5), { bg: p.textoCor || '#e53935', size: 60 });
  },
  // tela de celular. p: titulo, cor, linhas[], alerta (texto em vermelho no centro), fundo(set), icone
  celular(g, t, info, p) {
    blurLayer(g, 8, g => drawSet(g, p.fundo || 'sala', t, {}), { z: 1.3 }, 1);
    g.save(); push(g, t, info, 1.0, 1.08);
    M.phone(g, 960, 560, 2.2, g => {
      bg(g, '#fafafa'); box(g, -95, -180, 190, 56, p.cor || '#25d366', 0, 0); label(g, p.titulo || '', 0, -152, { size: 26, color: '#fff', stroke: 0 });
      (p.linhas || []).forEach((l, i) => { const q = pop(t, 0.3 + i * 0.35); if (q <= 0) return; box(g, -85, -110 + i * 52, 170, 42, i % 2 ? '#dcf8c6' : '#ffffff', 2, 10); label(g, l, 0, -89 + i * 52, { size: 17, color: INK, stroke: 0, font: 'Nunito', weight: 800 }); });
      if (p.alerta) { const q = pop(t, at(info, p.alertaEm, info.dur * 0.35)); if (q > 0) { g.save(); g.scale(q, q); oval(g, 0, 40, 62, 62, '#e53935', 4); label(g, '✕', 0, 42, { size: 70, color: '#fff', stroke: 0 }); label(g, p.alerta, 0, 135, { size: 22, color: '#e53935', stroke: 0, font: 'Nunito', weight: 900 }); g.restore(); } }
    });
    g.restore();
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, 0.2), { bg: '#212121', size: 56 });
  },
  // corrente de causas: p.itens[] (texto), p.quebra (índice onde corta), p.em[]
  cadeia(g, t, info, p) {
    bg(g, p.fundo || '#e3f2fd'); const n = p.itens.length, gap = 90, w = (1760 - (n - 1) * gap) / n;
    p.itens.forEach((it, i) => {
      const x = 80 + i * (w + gap) + w / 2, q = pop(t, at(info, (p.em || [])[i], 0.2 + i * Math.min(0.8, info.dur / (n + 1))));
      if (q <= 0) return;
      g.save(); g.translate(x, E.H / 2); g.scale(q, q); box(g, -w / 2, -110, w, 220, i === n - 1 ? '#ffd23f' : '#ffffff', 7, 22);
      const ls = it.split('\n'), fs = Math.min(52, (w - 30) / (Math.max(...ls.map(l => l.length)) * 0.62)); ls.forEach((l, j) => label(g, l, 0, 6 + (j - (ls.length - 1) / 2) * fs * 1.15, { size: fs, color: INK, stroke: 0 })); g.restore();
      if (i < n - 1 && q >= 1) { const ax = x + w / 2 + 10, bx = x + w / 2 + gap - 10; tube(g, [[ax, E.H / 2], [bx - 20, E.H / 2]], 14, p.quebra === i ? '#e53935' : '#455a64', 5); polyO(g, [[bx, E.H / 2], [bx - 34, E.H / 2 - 26], [bx - 34, E.H / 2 + 26]], p.quebra === i ? '#e53935' : '#455a64', 5);
        if (p.quebra === i && t > at(info, p.quebraEm, info.dur * 0.7)) label(g, '✕', (ax + bx) / 2, E.H / 2 - 70, { size: 110, color: '#e53935', stroke: 14 }); }
    });
    if (p.titulo) pill(g, E.W / 2, 150, p.titulo, pop(t, 0.1), { bg: '#212121', size: 58 });
  },
  // anel de porcentagem. p: pct (0-100), de, rotulo, cor, fundo, texto
  pct(g, t, info, p) {
    fundo(g, t, p.fundo || '#263238');
    const v = lerp(p.de ?? 0, p.pct, ease.out(prog(t, 0.2, Math.min(1.6, info.dur * 0.6))));
    g.save(); g.translate(E.W / 2, E.H / 2 - 30); g.lineWidth = 70; g.strokeStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(0, 0, 260, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = p.cor || '#ffd23f'; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 260, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * v / 100); g.stroke(); g.restore();
    bigText(g, E.W / 2, E.H / 2 - 30, (p.dec ? v.toFixed(p.dec).replace('.', ',') : Math.round(v)) + '%', pop(t, 0.1), { size: 150, color: '#fff' });
    if (p.rotulo) pill(g, E.W / 2, E.H - 130, p.rotulo, pop(t, 0.5), { bg: p.cor || '#ffd23f', color: INK, size: 54 });
    if (p.texto) label(g, p.texto, E.W / 2, 110, { size: 64, color: '#fff', stroke: 10 });
  },
  // N de cada 10 pessoas. p: n, total(10), rotulo, cor
  pessoas(g, t, info, p) {
    bg(g, '#fff8e1'); const tot = p.total || 10;
    for (let i = 0; i < tot; i++) { const q = pop(t, 0.1 + i * 0.12); if (q <= 0) continue; const on = i < p.n;
      g.save(); g.translate(260 + i * 156, 640); g.scale(q, q); oval(g, 0, -150, 46, 46, on ? (p.cor || '#43a047') : '#bdbdbd', 6); box(g, -52, -95, 104, 170, on ? (p.cor || '#43a047') : '#bdbdbd', 6, 40); g.restore(); }
    bigText(g, E.W / 2, 230, `${p.n} EM CADA ${tot}`, pop(t, 0.2), { size: 110, color: '#ffd23f' });
    if (p.rotulo) pill(g, E.W / 2, 930, p.rotulo, pop(t, 0.8), { bg: '#212121', size: 56 });
  },
  // mapa do Brasil. p.modo: 'apaga' (luzes apagando) | 'cabos' (cabos saindo de Fortaleza) | 'luz' (tudo aceso)
  mapa_br(g, t, info, p) {
    bg(g, p.modo === 'apaga' ? '#0b1026' : '#0d47a1'); g.save(); push(g, t, info, 1.0, 1.08, 200, -120);
    g.save(); g.translate(600, 120); g.scale(1.25, 1.25);
    const BR = [[300, 40], [420, 30], [520, 90], [640, 120], [760, 180], [800, 260], [770, 330], [700, 420], [660, 520], [600, 600], [520, 660], [450, 760], [380, 700], [390, 600], [320, 540], [250, 520], [180, 430], [120, 380], [80, 300], [140, 220], [220, 160], [250, 90]];
    polyO(g, BR, p.modo === 'apaga' ? '#1b2440' : '#43a047', 7);
    const r = rng(3), off = p.modo === 'apaga' ? prog(t, 0.3, Math.max(1, info.dur * 0.7)) : 0;
    for (let i = 0; i < 70; i++) { const x = 150 + r() * 600, y = 100 + r() * 620, lit = r() > off; if (!pontoNo(BR, x, y)) continue; oval(g, x, y, lit ? 7 : 4, lit ? 7 : 4, lit ? '#fff59d' : '#37474f', 0); }
    const FX = 742, FY = 228;
    if (p.modo === 'cabos') {
      const q = prog(t, 0.3, 1.6);
      const dest = [[1200, -40], [1250, 120], [1240, 300], [1150, 520], [900, 760]];
      dest.forEach(([dx, dy], i) => { const e = clamp(q * 1.4 - i * 0.1); if (e <= 0) return; g.strokeStyle = '#ffd23f'; g.lineWidth = 8; g.beginPath(); g.moveTo(FX, FY); g.quadraticCurveTo((FX + dx) / 2 + 60, (FY + dy) / 2 - 80, lerp(FX, dx, e), lerp(FY, dy, e)); g.stroke(); });
      oval(g, FX, FY, 22, 22, '#e53935', 6);
      label(g, 'FORTALEZA', FX - 30, FY - 60, { size: 46, color: '#fff', stroke: 10 });
    }
    g.restore(); g.restore();
    if (p.texto) pill(g, 560, 140, p.texto, pop(t, at(info, p.textoEm, 0.4)), { bg: '#e53935', size: 62 });
    if (p.texto2) pill(g, 560, 290, p.texto2, pop(t, at(info, p.texto2Em, 1.2)), { bg: '#212121', size: 56 });
  },
  // personagem na mesa do céu (burocrata cósmico). p: k, expr, tela[], prop
  mesa_ceu(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.06);
    drawSet(g, p.reparticao ? 'reparticao' : 'suporte', t, { tela: p.tela });
    const k = p.k || 'TECNICO';
    person(g, { k, x: 960, y: 1000, expr: p.expr, pose: p.pose }, t, info);
    M.mesaContador(g, 960, 980);
    oval(g, 1260, 700, 40, 46, '#fffdf3', 5); box(g, 1290, 680, 26, 40, '#fffdf3', 5, 10);
    g.restore();
    if (p.texto) pill(g, E.W / 2, p.textoY || 120, p.texto, pop(t, 0.3), { bg: p.textoCor || '#283593', size: 56 });
  },
  // botão grande apertado na palavra p.em. p: txt, cor
  botao(g, t, info, p) {
    bg(g, '#263238'); const press = at(info, p.em, info.dur * 0.8), dn = t > press ? Math.min(1, (t - press) * 6) : 0;
    g.save(); push(g, t, info, 1, 1.15); oval(g, 960, 700, 380, 120, '#455a64', 8); oval(g, 960, 640 + dn * 30, 300, 110, p.cor || '#e53935', 8); oval(g, 960, 620 + dn * 30, 300, 100, p.cor2 || '#ef5350', 0);
    label(g, p.txt, 960, 625 + dn * 30, { size: p.tam || 56, color: '#fff', stroke: 0 });
    const fy = lerp(-100, 470 + dn * 30, ease.out(prog(t, 0.2, 1.2))); tube(g, [[960, -300], [960, fy]], 70, (CAST[p.k || 'TECNICO'] || {}).skin || '#c68642'); g.restore();
    if (t > press && p.flash !== false) { g.fillStyle = `rgba(229,57,53,${0.3 * (Math.sin(t * 12) * 0.5 + 0.5)})`; g.fillRect(0, 0, E.W, E.H); }
  },
  // caderno aberto. p: linhas [[nome, valor]], destaque, titulo
  caderno(g, t, info, p) {
    bg(g, '#8d6e63'); g.save(); push(g, t, info, 1.0, 1.1, 0, 0);
    MJ.cadernoAberto(g, E.W / 2, E.H / 2 + 20, 1.35, p.linhas, ease.out(prog(t, 0.1, Math.max(0.6, Math.min(2.2, info.dur * 0.5)))), p.destaque ?? -1, t);
    g.restore(); if (p.titulo) pill(g, E.W / 2, 90, p.titulo, pop(t, 0.2), { bg: '#c62828', size: 56 });
  },
  // telefone fixo tocando (ou celular). p: set, texto
  telefone_fixo(g, t, info, p) {
    blurLayer(g, 8, g => drawSet(g, p.set || 'mercadinho', t, {}), { z: 1.3 }, 1);
    g.save(); push(g, t, info, 1.0, 1.1); MJ.telefoneFixo(g, 960, 760, 2.0, t, p.tocando !== false); g.restore();
    if (p.texto) pill(g, E.W / 2, 140, p.texto, pop(t, 0.3), { bg: '#212121', size: 56 });
  },
  // FICA ATÉ O FIM com qualquer personagem. p: k, set
  fica2(g, t, info, p) {
    blurLayer(g, 8, g => drawSet(g, p.set || 'mercadinho', t, {}), { z: 1.6, x: 300, y: 40 }, 1);
    character(g, { x: 1140, y: 1290, s: 3.0, facing: -1, c: CAST[p.k || 'JURA'], pose: breathe(posesAt(t, [[0, 'relaxed'], [0.15, { ...POSES.point, eF: [52, -200], hF: [100, -244] }]], 0.2), t), expr: 'smug', look: [-0.9, 0.2], blink: blinkAt(t, 3) });
    const k = ease.outElastic(prog(t, 0.15, 0.85)); g.save(); g.translate(560, 240); g.rotate(-0.06); g.scale(k, k); box(g, -420, -85, 840, 170, '#e53935', 9, 24); label(g, p.txt || 'FICA ATÉ O FIM!', 0, 6, { size: 92, color: '#fff', stroke: 0 }); g.restore();
  },
  // chamada final para comentários. p: pergunta, botao
  comenta2(g, t, info, p) {
    rays(g, t); const ls = (p.pergunta || 'E VOCÊ?').split('\n');
    ls.forEach((l, i) => bigText(g, E.W / 2, 250 + i * 120, l, pop(t, i * 0.2), { size: 96, color: '#fff' }));
    const k = pop(t, 0.5); if (k > 0) { g.save(); g.translate(E.W / 2, 640); g.scale(k, k); box(g, -560, -100, 1120, 200, '#fff', 8, 30); label(g, p.botao || 'CONTA AÍ EMBAIXO', 0, 6, { size: 92, color: '#e53935', stroke: 0 }); g.restore(); }
    for (let i = 0; i < 3; i++) M.arrowDown(g, 660 + i * 300, 880 + Math.sin(t * 6 + i) * 20, 1.3, '#e53935');
  },
  // fila de gente num cenário. p: set, n, chars[], texto
  fila(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.06, p.cx || 0, 0); drawSet(g, p.set || 'mercado', t, {});
    if (p.caixa) M.caixaMercado(g, 1500, 1000);
    fila(g, t, p.n || 9, p.x0 || 150, p.passo || 150, p.y || 1000);
    (p.chars || []).forEach(ch => person(g, ch, t, info));
    g.restore(); if (p.texto) pill(g, E.W / 2, 130, p.texto, pop(t, 0.3), { bg: p.textoCor || '#e53935', size: 60 });
  },
};

function fila(g, t, n, x0 = 150, passo = 150, y = 1000) {
  const POVO = (M.POVO || []).length ? M.POVO : null;
  const pal = [CAST.CLIENTE, CAST.LURDES, CAST.MOTOBOY, CAST.CAIXA, CAST.VOCE, CAST.MOTORISTA, CAST.ATENDENTE];
  for (let i = 0; i < n; i++) character(g, { x: x0 + i * passo, y: y + (i % 2) * 14, s: 1.9, facing: 1, c: pal[i % pal.length], pose: breathe(i % 3 ? POSES.relaxed : POSES.crossArms, t, 1, i), expr: i % 3 ? 'tired' : 'worried', blink: blinkAt(t, i) });
}
function relogio(g, x, y, r, h, m) {
  oval(g, x, y, r, r, '#fffdf3', r * 0.08);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = INK; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, r * 0.04, 0, 7); g.fill(); }
  const ah = ((h % 12) + m / 60) / 12 * Math.PI * 2 - Math.PI / 2, am = m / 60 * Math.PI * 2 - Math.PI / 2;
  tube(g, [[x, y], [x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5]], r * 0.08, INK, 0); tube(g, [[x, y], [x + Math.cos(am) * r * 0.75, y + Math.sin(am) * r * 0.75]], r * 0.05, INK, 0);
}
function pontoNo(poly, x, y) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }

export { K as KIT, fila, relogio };
for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

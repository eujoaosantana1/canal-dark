// cenas2.js — atos 4 a 6: Receita Federal do Céu, chuva de moedas pelo dia, o dinheiro chega.
import { E, registerShot, layer, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, head, coin, glassCup, label, oval, box, blob, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, talkWho, wl, pop, fadeIn, push, bg, rays, pill, bigText, drawSet, person, bust, M, POSES, posesAt, breathe } from '../lib.js';
import { backWall, counter, CT } from '../sets/padaria.js';
import { VALDIR, VALDIR_CASA, NENE, CONTADOR, FRENTISTA, MARQUINHOS, BIA, BIA_OCULOS, POVO } from '../cast.js';
import { coinRain, drawCoins, cupom } from './cenas1.js';

function clock(g, x, y, r, h, m) { oval(g, x, y, r, r, '#fffdf3', r * 0.08); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = INK; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, r * 0.04, 0, 7); g.fill(); }
  const ah = (h % 12 + m / 60) / 12 * Math.PI * 2 - Math.PI / 2, am = m / 60 * Math.PI * 2 - Math.PI / 2; tube(g, [[x, y], [x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5]], r * 0.07, INK, 0); tube(g, [[x, y], [x + Math.cos(am) * r * 0.75, y + Math.sin(am) * r * 0.75]], r * 0.05, '#e53935', 0); oval(g, x, y, r * 0.06, r * 0.06, INK, 0); }
function contadorDesk(g, t, info, expr, look) {
  M.ceu(g, t); character(g, { x: 960, y: 900, s: 2.3, facing: 1, c: CONTADOR, pose: breathe(POSES.holdFront, t), expr, talk: talkWho('contador', info.globalT), blink: blinkAt(t, 2), look: look || [0, 0.5], front: true }); M.mesaContador(g, 960, 1000);
}
function scroll(g, x, y, s, lines) { g.save(); g.translate(x, y); g.scale(s, s); box(g, -220, -150, 440, 300, '#f5e6c4', 6, 4); for (const d of [-1, 1]) oval(g, d * 230, 0, 26, 160, '#e8d3a2', 5); lines.forEach((l, i) => label(g, l, 0, -90 + i * 50, { size: 34, color: '#5d4037', stroke: 0, font: 'Playfair Display', weight: 900 })); g.restore(); }
function pctBar(g, x, y, w, pct, k, c = '#e53935') { box(g, x, y, w, 70, '#eceff1', 6, 35); const ww = w * pct / 100 * k; if (ww > 8) box(g, x, y, Math.max(70, ww), 70, c, 6, 35); label(g, Math.round(pct * k) + '%', x + w + 120, y + 37, { size: 70, color: '#1b1b1f', stroke: 0 }); }

export const K = {
  relogio3(g, t, info) {
    g.save(); push(g, t, info, 1, 1.1); M.rua(g, { night: true, darkHouse: 3, lamps: [[300, true], [1500, true]] }); g.restore();
    g.fillStyle = 'rgba(10,10,40,.35)'; g.fillRect(0, 0, E.W, E.H); const k = pop(t, 0.1); if (k > 0) { g.save(); g.translate(E.W / 2, 400); g.scale(k, k); clock(g, 0, 0, 200, 3, 0); g.restore(); } pill(g, E.W / 2, 760, '3 DA MADRUGADA', pop(t, 0.3), { bg: '#283593', size: 70 });
  },
  sobe_ceu(g, t, info) {
    const z = key(t, [[0, 1.6], [info.dur * 0.8, 1.0]], ease.inOut), y = key(t, [[0, 500], [info.dur * 0.8, 0]], ease.inOut);
    g.save(); g.translate(E.W / 2, E.H / 2 + y); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); M.ceu(g, t); g.restore();
    for (let i = 0; i < 6; i++) M.cloud(g, (i * 420) % 2200 - 100, ((t * 700 + i * 260) % 1500) - 300, 1.1);
  },
  cpfs(g, t, info) {
    contadorDesk(g, t, info, 'tired'); const n = Math.round(8e9 * ease.out(prog(t, 0.1, 1.6)));
    g.save(); g.translate(E.W / 2, 330); box(g, -640, -90, 1280, 180, '#1b1b1f', 0, 30); label(g, n.toLocaleString('pt-BR') + ' CPFs', 0, 8, { size: 96, color: '#ffd23f', stroke: 0 }); g.restore();
  },
  regra_antiga(g, t, info) {
    rays(g, t, '#d1c4e9', '#ede7f6'); g.save(); push(g, t, info, 1, 1.08); scroll(g, E.W / 2, 560, 2.2, ['REGRA Nº 1', '(nunca usada)']); g.restore();
    for (let i = 0; i < 6; i++) { const k = (t * 0.5 + i / 6) % 1; g.globalAlpha = 1 - k; oval(g, 500 + i * 180, 900 - k * 600, 8, 8, '#bdbdbd', 0); g.globalAlpha = 1; }
  },
  contador_mesa(g, t, info, p) {
    g.save(); push(g, t, info, 1.25, 1.35, 0, -120); contadorDesk(g, t, info, p.expr, p.prop === 'carta' || p.prop === 'pergaminho' ? [0, 0.8] : undefined);
    if (p.prop === 'pergaminho') scroll(g, 960, 700, 0.75, ['QUEM PROVAR,', 'COM NOTA...', 'RECEBE DE VOLTA']);
    if (p.prop === 'chiclete') { M.receipt(g, 960, 720, 3, 0.1); label(g, 'CHICLETE 1,50', 960, 650, { size: 26, color: '#333', stroke: 0, font: 'Nunito', weight: 900 }); }
    if (p.prop === 'carta') { box(g, 760, 600, 400, 260, '#fff8e1', 6, 6); label(g, 'PREZADO VALDIR,', 960, 650, { size: 30, color: '#5d4037', stroke: 0, font: 'Nunito', weight: 900 }); g.fillStyle = '#bcaaa4'; for (let r = 0; r < 4; r++) g.fillRect(800, 690 + r * 34, 320 - r * 30, 10); }
    if (p.prop === 'suor') { for (let i = 0; i < 3; i++) { const k = (t * 1.2 + i * 0.33) % 1; oval(g, 1060 + i * 20, 330 + k * 120, 10, 16, '#81d4fa', 3); } }
    if (p.prop === 'pasta_marcos') { box(g, 760, 620, 400, 240, '#ffb74d', 6, 6); label(g, 'MARCOS ANTÔNIO', 960, 680, { size: 34, color: '#4e342e', stroke: 0 }); const items = [['3 EMPRESAS', 'tres'], ['1 HILUX', 'hilux'], ['0 NOTAS', 'zero']]; items.forEach(([s2, w], i) => { if (t > wl(info, w, 1 + i)) label(g, s2, 960, 735 + i * 42, { size: 34, color: i === 2 ? '#d32f2f' : '#4e342e', stroke: 0 }); }); }
    g.restore(); if (p.texto) pill(g, E.W / 2, 140, p.texto, pop(t, 0.2), { bg: '#5e35b1' });
  },
  zero_pedidos(g, t, info) {
    rays(g, t, '#d1c4e9', '#ede7f6'); g.save(); push(g, t, info, 1, 1.06);
    box(g, 460, 260, 1000, 560, '#fffdf3', 8, 14); label(g, 'PEDIDOS COM PROVA', 960, 330, { size: 60, color: '#5e35b1', stroke: 0 });
    const n = t < wl(info, 'ate', info.dur * 0.6) ? 0 : 1; bigText(g, 960, 600, String(n), 1 + (n ? 0.1 * Math.exp(-(t - wl(info, 'ate', 0)) * 5) : 0), { size: 300, color: n ? '#2e7d32' : '#e53935', stroke: 30 });
    g.restore();
  },
  caixa_cai(g, t, info) {
    const tf = 0.4, fall = ease.in(prog(t, tf, tf + 0.5)), land = t > tf + 0.5;
    g.save(); if (land) { const k = Math.exp(-(t - tf - 0.5) * 8); g.translate(Math.sin(t * 70) * 10 * k, Math.cos(t * 60) * 8 * k); } M.sala(g, { night: true, box: false });
    if (!land) { g.save(); g.translate(1640, lerp(420, 900, fall)); g.rotate(fall * 1.2); M.shoebox(g, 0, 0, 0.9, { open: false, label: 'CUPONS' }); g.restore(); }
    else { M.shoebox(g, 1600, 920, 0.9, { open: false }); const R0 = rng(3); for (let i = 0; i < 40; i++) { const d = ease.out(prog(t, tf + 0.5, tf + 1.2)); M.receipt(g, 1600 + (R0() - 0.5) * 900 * d, 900 + (R0() - 0.3) * 120 * d, 1.1, R0() * 6); } }
    g.restore();
  },
  pedido_chao(g, t, info) {
    bg(g, '#6b4e3a'); g.fillStyle = 'rgba(0,0,0,.15)'; for (let x = 0; x < E.W; x += 160) g.fillRect(x, 0, 4, E.H);
    const form = ease.inOut(prog(t, 0.6, info.dur * 0.75)), R0 = rng(9), word = 'PEDIDO DE RESTITUIÇÃO';
    g.save(); push(g, t, info, 1.1, 1.0);
    for (let i = 0; i < 70; i++) { const tx = 260 + (i % 35) * 40, ty = i < 35 ? 470 : 610; M.receipt(g, lerp(R0() * E.W, tx, form), lerp(R0() * E.H, ty, form), 1.0, lerp(R0() * 6, 0, form)); }
    g.restore(); if (form > 0.95) { label(g, 'PEDIDO DE', E.W / 2, 470, { size: 120, color: '#fff', stroke: 18 }); label(g, 'RESTITUIÇÃO', E.W / 2, 620, { size: 130, color: '#ffd23f', stroke: 18 }); }
  },
  contador_lupa(g, t, info) {
    blurLayer(g, 8, g => M.ceu(g, t), { z: 1.4 }, 1);
    g.save(); push(g, t, info, 1, 1.06); bust(g, 560, 500, 200, CONTADOR, { expr: 'tired', talk: talkWho('contador', info.globalT), blink: blinkAt(t, 2), look: [0.8, 0.5] });
    const R0 = rng(4); for (let i = 0; i < 14; i++) M.receipt(g, 1100 + (i % 7) * 100, 700 + Math.floor(i / 7) * 160, 1.4, (R0() - 0.5) * 0.4);
    const lx = 1100 + (Math.sin(t * 1.2) * 0.5 + 0.5) * 600; g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.arc(lx, 700, 110, 0, 7); g.stroke(); g.fillStyle = 'rgba(200,240,255,.4)'; g.fill(); tube(g, [[lx + 80, 780], [lx + 200, 900]], 24, '#6d4c41');
    g.restore(); pill(g, E.W / 2 + 300, 150, '26 ANOS DE CUPOM', pop(t, 0.2), { bg: '#5e35b1', size: 60 }); if (t > wl(info, 'cpf', 2)) pill(g, E.W / 2 + 300, 300, 'CPF EM TODOS ✓', pop(t, wl(info, 'cpf', 2)), { bg: '#2e7d32', size: 54, h: 50 });
  },
  rodape_zoom(g, t, info, p) {
    cupom(g, t, info, 0.6, 1.2, { bg: p.fundo === 'escuro' ? '#263238' : '#d1c4e9', valor: 'R$ 2,87', itens: [['PINGADO', '6,00'], ['PÃO NA CHAPA', '5,00'], ['CHICLETE', '1,50'], ['CPF NA NOTA', 'SIM']] });
  },
  carimbo(g, t, info, p) {
    rays(g, t, '#c8e6c9', '#e8f5e9'); g.save(); push(g, t, info, 1, 1.04);
    box(g, 560, 220, 800, 660, '#fffdf3', 8, 8); label(g, 'PEDIDO DE RESTITUIÇÃO', 960, 300, { size: 46, color: '#5e35b1', stroke: 0 }); label(g, p.contador ? 'ÓCULOS DA BIA — R$ 480' : 'VALDIR — 26 ANOS', 960, 380, { size: 40, color: '#333', stroke: 0 }); g.fillStyle = '#bdbdbd'; for (let r = 0; r < 5; r++) g.fillRect(660, 450 + r * 50, 600 - (r % 2) * 120, 14);
    const ts = wl(info, 'deferido', 0.6) - 0.1; M.stamp(g, 960, 640, p.txt, prog(t, ts, ts + 0.18), { color: '#2e7d32', w: 640, size: 110 });
    g.restore(); if (t > ts && t < ts + 0.15) { g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, 0, E.W, E.H); }
  },
  aos_pouquinhos(g, t, info) {
    bg(g, '#fff8e1'); const shops = [['PADARIA', '#d94b3d'], ['POSTO', '#1e88e5'], ['MERCADO', '#43a047'], ['FARMÁCIA', '#8e24aa']];
    g.save(); push(g, t, info, 1, 1.05);
    shops.forEach(([n, c], i) => { const x = 330 + i * 420, k = pop(t, 0.1 + i * 0.15); if (k <= 0) return; g.save(); g.translate(x, 620); g.scale(k, k); box(g, -170, -200, 340, 400, '#fffdf3', 6, 10); box(g, -170, -200, 340, 90, c, 6, 10); label(g, n, 0, -155, { size: 42, color: '#fff', stroke: 0 }); box(g, -60, 40, 120, 160, '#8d6e63', 5, 6); g.restore();
      for (let k2 = 0; k2 < 4; k2++) { const tt = (t * 0.9 + k2 * 0.25 + i * 0.1) % 1; coin(g, x + 70, 360 - tt * 200, 24, t * 6 + k2); } });
    g.restore(); pill(g, E.W / 2, 140, 'AOS POUQUINHOS', pop(t, wl(info, 'pouquinhos', 1)), { bg: '#6d4c41' });
  },
  ao_contrario(g, t, info) {
    rays(g, t); const a = ease.inOut(prog(t, 0.2, 1.2));
    g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(a * Math.PI); polyO(g, [[-300, -40], [150, -40], [150, -120], [320, 0], [150, 120], [150, 40], [-300, 40]], '#e53935', 10); g.restore();
    bigText(g, E.W / 2, 880, 'AO CONTRÁRIO', pop(t, 0.6), { size: 120, color: '#fff' });
    for (let i = 0; i < 12; i++) coin(g, 200 + i * 140, 1100 - ((t * 400 + i * 90) % 1300), 30, t * 5 + i);
  },
  hora_cena(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.06);
    if (p.set === 'padaria') { backWall(g); person(g, { k: 'NENE', x: 1400, y: 960, facing: -1, expr: 'smile' }, t, info); counter(g); glassCup(g, 1160, CT + 4, 1.7, 0.95); person(g, { k: 'VALDIR', x: 600 }, t, info); }
    else if (p.set === 'posto') { M.posto(g); M.bomba(g, 900, 1000, 1.25, '000,00'); person(g, { k: 'FRENTISTA', x: 1220, facing: -1 }, t, info); M.hilux; person(g, { k: 'VALDIR', x: 560 }, t, info); }
    else { M.mercado(g); person(g, { k: 'CAIXA', x: 1350, y: 980, facing: -1 }, t, info); M.caixaMercado(g, 1260, 1000); person(g, { k: 'VALDIR', x: 560 }, t, info); person(g, { k: 'BIA', x: 360 }, t, info); }
    g.restore();
    const [h] = p.hora.split(':'); const k = pop(t, 0.1); if (k > 0) { g.save(); g.translate(260, 230); g.scale(k, k); clock(g, 0, 0, 150, +h, 0); g.restore(); label(g, p.hora.replace(':00', 'H'), 260, 450, { size: 90 * k, color: '#fff', stroke: 16 }); }
  },
  padaria_troco(g, t, info) {
    const cam = { z: 1.35, x: 260, y: -40 }; layer(g, cam, 0.85, backWall);
    if (!K._tr) K._tr = coinRain(5, Array.from({ length: 6 }, (_, i) => wl(info, 'imposto', 1.5) + i * 0.12), 1100, 1260, CT - 18, 30);
    layer(g, cam, 1, g => { person(g, { k: 'NENE', x: 1400, y: 960, facing: -1, pose: 'explain' }, t, info); counter(g); glassCup(g, 1180, CT + 4, 1.7, 0.95); drawCoins(g, t, K._tr, 30); });
    pill(g, 520, 170, 'PINGADO R$ 6,00', pop(t, 0.1), { bg: '#6d4c41', size: 60 }); pill(g, 520, 320, 'VOLTOU R$ 1,20', pop(t, wl(info, 'voltou', 2.5)), { bg: '#2e7d32', size: 60 });
  },
  bomba_close(g, t, info, p) {
    M.posto(g); g.save(); push(g, t, info, 1.6, 1.75, 0, -200);
    const v = (254.8 * ease.out(prog(t, 0, info.dur))).toFixed(2).replace('.', ','); M.bomba(g, 900, 1000, 1.25, v);
    if (p.moedas) for (let i = 0; i < 16; i++) { const tt = (t * 1.4 + i / 16) % 1; coin(g, 1140 + Math.sin(i) * 20, 860 + tt * 260, 22, t * 9 + i); }
    g.restore(); if (p.pct) bigText(g, 1420, 360, '40%', pop(t, wl(info, 'quarenta', 0.5)), { size: 220, color: '#ffd23f' }); if (p.pct) label(g, 'DE CADA LITRO', 1420, 520, { size: 56, color: '#fff', stroke: 12 });
  },
  balde(g, t, info) {
    g.save(); push(g, t, info, 1.1, 1.2, 0, -60); M.posto(g); M.bomba(g, 700, 1000, 1.25, '254,80');
    character(g, { x: 1180, y: 1000, s: 2.3, facing: -1, c: FRENTISTA, pose: breathe(POSES.holdFront, t), expr: 'surprised', blink: blinkAt(t, 3), look: [0.4, 0.8] });
    box(g, 920, 780, 190, 170, '#90a4ae', 6, 10); for (let i = 0; i < 12; i++) coin(g, 940 + (i % 6) * 30, 790 - Math.floor(i / 6) * 26 - (t * 20 % 10), 22, i);
    for (let i = 0; i < 12; i++) { const tt = (t * 1.5 + i / 12) % 1; coin(g, 900 + Math.sin(i * 3) * 40, 700 + tt * 120, 20, t * 9 + i); }
    g.restore(); pill(g, E.W / 2, 140, 'PRECISOU DE UM BALDE', pop(t, wl(info, 'balde', 0.8)), { bg: '#1e88e5', size: 62 });
  },
  produto(g, t, info, p) {
    bg(g, '#e8f5e9'); g.save(); push(g, t, info, 1, 1.05);
    const x = 520, y = 560; const k = pop(t, 0.05);
    g.save(); g.translate(x, y); g.scale(k, k);
    if (p.nome === 'ARROZ') { box(g, -150, -230, 300, 460, '#fafafa', 7, 14); box(g, -150, -60, 300, 110, '#43a047', 6, 0); label(g, 'ARROZ', 0, -2, { size: 64, color: '#fff', stroke: 0 }); label(g, '5 kg', 0, 130, { size: 50, color: '#333', stroke: 0 }); }
    if (p.nome === 'SORVETE') { polyO(g, [[-90, -40], [90, -40], [0, 250]], '#e0a060', 7); oval(g, 0, -90, 120, 100, '#f8bbd0', 7); oval(g, -40, -170, 70, 60, '#fff59d', 6); }
    if (p.nome === 'CERVEJA') { box(g, -110, -220, 220, 440, '#ffca28', 7, 30); box(g, -110, -60, 220, 120, '#e53935', 6, 0); label(g, 'CERVEJA', 0, 2, { size: 46, color: '#fff', stroke: 0 }); oval(g, 0, -220, 100, 22, '#e0e0e0', 6); }
    g.restore();
    label(g, 'VOLTOU EM IMPOSTO', 1290, 360, { size: 60, color: '#2e7d32', stroke: 0 }); pctBar(g, 900, 460, 700, p.pct, ease.out(prog(t, 0.3, 1.3)), p.pct > 40 ? '#e53935' : p.pct > 20 ? '#fb8c00' : '#43a047');
    const n = Math.round(p.pct / 100 * 30 * ease.out(prog(t, 0.3, 1.3))); for (let i = 0; i < n; i++) coin(g, 940 + (i % 15) * 46, 700 + Math.floor(i / 15) * 50, 22, 0);
    g.restore(); pill(g, E.W / 2, 130, p.nome, pop(t, 0), { bg: '#1b1b1f', color: '#ffd23f', size: 64 });
  },
  necessidade(g, t, info) {
    bg(g, '#fff8e1'); const t1 = wl(info, 'arroz', 0.6), t2 = wl(info, 'cerveja', info.dur * 0.55);
    g.save(); push(g, t, info, 1, 1.04);
    const card = (x, k, title, sub, c, item) => { if (k <= 0) return; g.save(); g.translate(x, 560); g.scale(k, k); box(g, -340, -330, 680, 660, '#fff', 8, 20); box(g, -340, -330, 680, 120, c, 8, 20); label(g, title, 0, -268, { size: 64, color: '#fff', stroke: 0 }); item(g); label(g, sub, 0, 250, { size: 64, color: c, stroke: 0 }); g.restore(); };
    card(560, pop(t, t1), 'ARROZ', 'NECESSIDADE', '#43a047', g => { box(g, -90, -150, 180, 280, '#fafafa', 6, 10); box(g, -90, -40, 180, 60, '#43a047', 5, 0); });
    card(1360, pop(t, t2), 'CERVEJA', 'OPÇÃO', '#e53935', g => { box(g, -70, -160, 140, 290, '#ffca28', 6, 20); box(g, -70, -50, 140, 70, '#e53935', 5, 0); });
    g.restore();
  },
  contracheque_preco(g, t, info) {
    bg(g, '#eceff1'); g.save(); push(g, t, info, 1, 1.05);
    g.save(); g.translate(560, 540); g.rotate(-0.05); box(g, -300, -340, 600, 680, '#fff', 7, 6); label(g, 'CONTRACHEQUE', 0, -280, { size: 48, color: '#37474f', stroke: 0 }); g.fillStyle = '#b0bec5'; for (let r = 0; r < 6; r++) g.fillRect(-240, -200 + r * 60, 300, 16); label(g, 'IR / INSS', 0, 230, { size: 50, color: '#e53935', stroke: 0 }); g.restore();
    const k = pop(t, wl(info, 'mora', 1.4, 1)); if (k > 0) { g.save(); g.translate(1360, 520); g.rotate(0.1); g.scale(k, k); polyO(g, [[-260, -150], [200, -150], [300, 0], [200, 150], [-260, 150]], '#ffd23f', 8); oval(g, 230, 0, 22, 22, '#fff', 5); label(g, 'PREÇO', -40, -50, { size: 70, color: '#1b1b1f', stroke: 0 }); label(g, '+ IMPOSTO', -40, 50, { size: 60, color: '#e53935', stroke: 0 }); g.restore(); }
    g.restore();
  },
  barra150(g, t, info) {
    bg(g, '#fff3d6'); const k = ease.out(prog(t, 0.3, 1.5)), k2 = ease.out(prog(t, wl(info, 'oitenta', 2.5), wl(info, 'oitenta', 2.5) + 0.8));
    const x = 210, y = 470, w = 1500;
    box(g, x, y, w, 150, '#eceff1', 7, 20); box(g, x, y, w * k, 150, '#ef5350', 7, 20); label(g, '150 DIAS PRO GOVERNO', E.W / 2, 380, { size: 76, color: '#1b1b1f', stroke: 0 });
    if (k2 > 0) { box(g, x, y, w * 84 / 150 * k2, 150, '#b71c1c', 7, 20); label(g, '84 DIAS', x + w * 84 / 150 / 2, y + 78, { size: 80, color: '#fff', stroke: 0 }); label(g, 'ESCONDIDOS NO QUE VOCÊ COMPRA', E.W / 2, 760, { size: 66 * k2, color: '#b71c1c', stroke: 0 }); }
  },
  lei(g, t, info) {
    rays(g, t, '#cfd8dc', '#eceff1'); g.save(); push(g, t, info, 1, 1.06);
    box(g, 560, 200, 800, 640, '#fffdf3', 8, 10); label(g, 'LEI 12.741/2012', 960, 300, { size: 80, color: '#263238', stroke: 0 }); label(g, '"valor aproximado', 960, 470, { size: 60, color: '#455a64', stroke: 0, font: 'Playfair Display', weight: 900 }); label(g, 'dos tributos"', 960, 550, { size: 60, color: '#455a64', stroke: 0, font: 'Playfair Display', weight: 900 });
    g.restore(); M.stamp(g, 1340, 760, 'DESDE 2013', prog(t, wl(info, 'desde', 0.4), wl(info, 'desde', 0.4) + 0.2), { color: '#1565c0', w: 560, size: 90 });
  },
  lixo_cupons(g, t, info) {
    bg(g, '#e0f2f1'); g.save(); push(g, t, info, 1, 1.05);
    box(g, 830, 640, 260, 300, '#78909c', 7, 10); box(g, 810, 610, 300, 50, '#607d8b', 6, 8);
    for (let i = 0; i < 8; i++) { const tt = ((t * 1.2) + i / 8) % 1; M.receipt(g, lerp(300 + i * 160, 960, tt), 300 + Math.sin(tt * Math.PI) * -200 + tt * 380, 1.3, tt * 6); }
    g.restore(); pill(g, E.W / 2, 140, 'NINGUÉM LÊ', pop(t, 0.1), { bg: '#e53935' });
  },
  valdir_le(g, t, info) {
    g.save(); push(g, t, info, 1.2, 1.3, -200, 100); M.sala(g, {});
    character(g, { x: 760, y: 1000, s: 2.3, facing: 1, c: VALDIR_CASA, pose: breathe({ ...POSES.sit, hF: [40, -150], eF: [30, -120] }, t), expr: 'smile', look: [0.6, 0.4], blink: blinkAt(t, 1) });
    M.receipt(g, 870, 820, 2.2, -0.2); M.shoebox(g, 1050, 960, 0.9, { open: true });
    g.restore(); pill(g, E.W / 2, 140, 'O VALDIR LIA', pop(t, wl(info, 'valdir', 0.3)), { bg: '#1e88e5' }); if (t > wl(info, 'guardou', 1.5)) pill(g, E.W / 2, 290, '26 ANOS', pop(t, wl(info, 'guardou', 1.5)), { bg: '#6d4c41', size: 60 });
  },
  multidao(g, t, info) {
    g.save(); push(g, t, info, 1.0, 1.06); M.rua(g, {});
    const R0 = rng(12); for (let i = 0; i < 16; i++) { const c = POVO[i % POVO.length], x = 100 + i * 115 + (R0() - 0.5) * 30, row = i % 2; character(g, { x, y: 1000 + row * 60, s: 1.7 + row * 0.2, facing: x < 960 ? 1 : -1, c, pose: breathe(i % 3 ? POSES.cheer : POSES.point, t, 1.5, i), expr: i % 2 ? 'surprised' : 'happy', blink: blinkAt(t, i) }); }
    g.restore(); pill(g, E.W / 2, 140, 'MEIO GUARULHOS NA PORTA', pop(t, 0.2), { bg: '#e53935', size: 62 });
  },
  hilux_chega(g, t, info) {
    g.save(); push(g, t, info, 1.0, 1.04); M.rua(g, {}); const x = lerp(2600, 1300, ease.out(prog(t, 0, 1.4)));
    for (let i = 0; i < 6; i++) character(g, { x: 120 + i * 140, y: 1000, s: 1.8, facing: 1, c: POVO[i], pose: breathe(POSES.relaxed, t, 1, i), expr: 'surprised', look: [1, 0] });
    M.hilux(g, x, 1010, 1.5, { facing: -1 });
    if (t > 1.5) character(g, { x: x - 380, y: 1000, s: 2.3, facing: -1, c: MARQUINHOS, pose: breathe(POSES.cheer, t), expr: 'happy' });
    g.restore();
  },
  marquinhos_ficha(g, t, info) {
    bg(g, '#ffe0b2'); g.save(); push(g, t, info, 1, 1.04);
    character(g, { x: 400, y: 1010, s: 2.5, facing: 1, c: MARQUINHOS, pose: breathe(POSES.crossArms, t), expr: 'smug' });
    const items = [['hilux', 'HILUX', g => M.hilux(g, 0, 60, 0.45)], ['tres', '3 EMPRESAS', g => { for (let i = 0; i < 3; i++) box(g, -110 + i * 80, -60 - i * 10, 70, 140 + i * 20, '#90a4ae', 5, 4); }], ['zero', '0 CUPONS', g => { M.receipt(g, 0, 10, 2.2); g.strokeStyle = '#e53935'; g.lineWidth = 16; g.beginPath(); g.arc(0, 10, 100, 0, 7); g.moveTo(-70, 80); g.lineTo(70, -60); g.stroke(); }]];
    items.forEach(([w, n, d], i) => { const k = pop(t, wl(info, w, 0.5 + i * 0.6)); if (k <= 0) return; g.save(); g.translate(950 + i * 330, 520); g.scale(k, k); box(g, -150, -170, 300, 340, '#fff', 6, 16); d(g); label(g, n, 0, 210, { size: 46, color: i === 2 ? '#e53935' : '#1b1b1f', stroke: 0 }); g.restore(); });
    g.restore();
  },
  contas_mesa(g, t, info) {
    g.save(); push(g, t, info, 1.2, 1.3, -100, 120); M.sala(g, {});
    character(g, { x: 760, y: 1000, s: 2.3, facing: 1, c: VALDIR_CASA, pose: breathe({ ...POSES.sit, hF: [44, -140] }, t), expr: 'worried', look: [0.6, 0.6], blink: blinkAt(t, 1) });
    box(g, 820, 780, 520, 40, '#8d6e63', 6, 6); box(g, 960, 690, 150, 100, '#455a64', 5, 10); box(g, 975, 700, 120, 30, '#a5d6a7', 3, 3); label(g, (Math.floor(t * 37) % 1000 * 563).toString().slice(0, 6), 1035, 716, { size: 22, color: '#1b1b1f', stroke: 0 });
    M.receipt(g, 1200, 760, 1.4, 0.3); M.receipt(g, 1250, 750, 1.4, -0.2);
    g.restore(); pill(g, E.W / 2, 140, '30 DIAS', pop(t, wl(info, 'trinta', 1.5)), { bg: '#5e35b1' });
  },
  casas(g, t, info) {
    rays(g, t, '#b3e5fc', '#e1f5fe'); const k1 = pop(t, wl(info, 'casa', 0.4)), k2 = pop(t, wl(info, 'duas', 1.4));
    if (k1 > 0) { g.save(); g.translate(700, 760); g.scale(k1, k1); M.house(g, -200, 0, 400, 380, '#ffcc80'); g.restore(); }
    if (k2 > 0) { g.save(); g.translate(1240, 760); g.scale(k2, k2); M.house(g, -200, 0, 400, 380, '#a5d6a7'); g.restore(); bigText(g, 1240, 220, 'TALVEZ DUAS', k2, { size: 90, color: '#fff' }); }
    if (k1 > 0) bigText(g, 700, 220, 'UMA CASA', k1, { size: 90, color: '#fff' });
  },
  prestacoes(g, t, info) {
    bg(g, '#ede7f6'); const n = Math.floor(312 * ease.inOut(prog(t, 0.2, info.dur - 0.3)));
    for (let i = 0; i < 312; i++) { const x = 160 + (i % 26) * 62, y = 230 + Math.floor(i / 26) * 52; box(g, x, y, 52, 42, i < n ? '#7e57c2' : '#fff', 3, 6); }
    pill(g, E.W / 2, 130, `${n} PRESTAÇÕES · SEM SABER`, 1, { bg: '#311b92', size: 60 }); label(g, '26 ANOS', E.W / 2, 1000, { size: 80, color: '#311b92', stroke: 0 });
  },
  otica_cena(g, t, info) {
    const tb = wl(info, 'comprou', 1.2);
    g.save(); push(g, t, info, 1.0, 1.08); M.otica(g);
    person(g, { k: 'VALDIR', x: 700, expr: 'happy' }, t, info);
    character(g, { x: 1080, y: 1000, s: 2.3 * 0.72, facing: -1, c: t > tb ? BIA_OCULOS : BIA, pose: breathe(t > tb ? POSES.cheer : POSES.relaxed, t), expr: t > tb ? 'happy' : 'neutral', blink: blinkAt(t, 2) });
    g.restore(); const tc = wl(info, 'troco', info.dur * 0.8); if (t > tc) for (let i = 0; i < 4; i++) coin(g, 700 + i * 50, 600 - ((t - tc) * 200 % 60), 26, t * 6 + i);
    pill(g, E.W / 2, 140, 'ÓCULOS DA BIA ✓', pop(t, tb), { bg: '#ec407a' });
  },
  ponto_onibus(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.05); M.rua(g, {}); const x = lerp(2400, -500, prog(t, 0.3, info.dur + 1.5));
    box(g, 160, 480, 30, 520, '#90a4ae', 5, 4); box(g, 100, 420, 400, 70, '#1e88e5', 6, 10); label(g, 'PONTO', 300, 456, { size: 44, color: '#fff', stroke: 0 });
    M.bus(g, x, 1010, 1.15, { sign: 'PIMENTAS–CENTRO' });
    character(g, { x: 600, y: 1000, s: 2.3 * 0.72, facing: 1, c: BIA_OCULOS, pose: breathe(POSES.point, t), expr: 'happy', talk: talkWho('bia', info.globalT), blink: blinkAt(t, 2), look: [0.8, -0.2] });
    if (!p.oculos) person(g, { k: 'VALDIR', casa: 1, x: 360 }, t, info);
    g.restore();
  },
  placa_onibus(g, t, info) {
    bg(g, '#1e88e5'); g.save(); push(g, t, info, 1, 1.08); box(g, 260, 380, 1400, 320, '#1b1b1f', 10, 20);
    const shown = 'PIMENTAS–CENTRO'.slice(0, Math.floor(prog(t, 0, 0.6) * 15)); label(g, shown, 960, 545, { size: 150, color: '#ffb300', stroke: 0, font: 'Nunito', weight: 900 }); g.restore();
  },
};
for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

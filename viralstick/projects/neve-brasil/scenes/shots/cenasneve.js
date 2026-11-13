// cenasneve.js — cenas de "E se nevasse no Brasil inteiro?"
globalThis.TELA_SUPORTE = ['TÁ MUITO CALOR', 'TÁ MUITO CALOR', 'TÁ MUITO CALOR'];
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, label, box, oval, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, wl, pop, push, bg, rays, pill, bigText, drawSet, person, bust, M, NV, POSES, posesAt, breathe } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);
const BR = [[300, 40], [420, 30], [520, 90], [640, 120], [760, 180], [800, 260], [770, 330], [700, 420], [660, 520], [600, 600], [520, 660], [450, 760], [380, 700], [390, 600], [320, 540], [250, 520], [180, 430], [120, 380], [80, 300], [140, 220], [220, 160], [250, 90]];

function painel(g, x, y, w, h, set, t, k, c, cap, capCor) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.save(); g.translate(x + w / 2, y + h / 2); g.scale(0.62, 0.62); g.translate(-E.W / 2, -E.H / 2); drawSet(g, set, t, { carrinho: false }); g.restore();
  g.save(); g.translate(x + w / 2, y + h * 0.55); bust(g, 0, 0, 150, CAST[k], { talk: talkWho(WHO[k], c.globalT), blink: blinkAt(t, 2), expr: c.expr }); g.restore();
  g.restore(); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(x, y, w, h);
  pill(g, x + w / 2, y + h - 50, cap, 1, { bg: capCor, size: 40 });
}

const K = {
  // chamada de vídeo: Arlindo (Urupema) x Chiquinha (Teresina)
  videochamada(g, t, info, p) {
    bg(g, '#263238');
    painel(g, 60, 90, 880, 900, p.setA || 'urupema', t, p.kA || 'ARLINDO', { globalT: info.globalT, expr: p.exprA || 'happy' }, p.capA || 'URUPEMA  −2°C', '#1565c0');
    painel(g, 980, 90, 880, 900, p.setB || 'praca_sol', t, p.kB || 'CHIQUINHA', { globalT: info.globalT, expr: p.exprB || 'smile' }, p.capB || 'TERESINA  38°C', '#e65100');
    oval(g, 960, 1040, 34, 34, '#e53935', 4);
  },
  // chuveiro elétrico: chave verão -> inverno; p.cai: disjuntor cai e apaga
  chuveiro(g, t, info, p) {
    R(g, -100, -100, E.W + 200, E.H + 200, '#e0f2f1'); for (let x = 0; x < E.W; x += 120) for (let y = 0; y < E.H; y += 120) { g.strokeStyle = '#b2dfdb'; g.lineWidth = 4; g.strokeRect(x, y, 120, 120); }
    g.save(); push(g, t, info, 1.0, 1.06);
    tube(g, [[700, 0], [700, 180], [820, 220]], 22, '#b0bec5', 5); box(g, 760, 210, 260, 130, '#fafafa', 6, 30); for (let i = 0; i < 6; i++) oval(g, 800 + i * 35, 330, 6, 6, '#90a4ae', 0);
    const tv = at(info, p.em || 'inverno', info.dur * 0.3), inv = t > tv;
    for (let i = 0; i < 18; i++) { const u = ((t * 1.6 + i * 0.11) % 1); tube(g, [[790 + (i * 23) % 200, 350 + u * 600], [790 + (i * 23) % 200, 380 + u * 600]], 5, inv ? '#ffccbc' : '#81d4fa', 0); }
    box(g, 1150, 260, 300, 160, '#fffdf3', 6, 14); label(g, inv ? 'INVERNO' : 'VERÃO', 1300, 330, { size: 52, color: inv ? '#c62828' : '#1565c0', stroke: 0 }); label(g, inv ? '7.700 W' : '3.200 W', 1300, 390, { size: 40, color: '#37474f', stroke: 0 });
    g.restore();
    if (inv) pill(g, 1300, 520, 'ATÉ 7.700 WATTS', pop(t, tv), { bg: '#c62828', size: 50 });
    if (p.cai) { const tc = at(info, p.caiEm || 'caiu', info.dur * 0.6); if (t > tc) { const k = clamp((t - tc) * 3); g.fillStyle = `rgba(0,0,0,${0.85 * k})`; g.fillRect(0, 0, E.W, E.H); bigText(g, E.W / 2, E.H / 2, 'CLEC.', pop(t, tc), { size: 140, color: '#fff' }); } }
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, at(info, p.textoEm, 0.3)), { bg: '#212121', size: 56 });
  },
  // mapa: onde neva de verdade (só um pedacinho do Sul) ou neve no país todo
  mapa_neve(g, t, info, p) {
    const todo = !!p.todo; bg(g, todo ? '#546e7a' : '#0d47a1');
    g.save(); push(g, t, info, 1.0, 1.05, 100, -40); g.save(); g.translate(560, 120); g.scale(1.2, 1.2);
    polyO(g, BR, todo ? '#fafafa' : '#43a047', 7);
    if (!todo) { const q = pop(t, at(info, p.em, 0.5)); if (q > 0) { oval(g, 470, 690, 44 * q, 30 * q, '#ffffff', 5); } }
    g.restore();
    if (todo) { const C = [['MANAUS', 780, 330], ['TERESINA', 1300, 360], ['SALVADOR', 1360, 600], ['RIO', 1170, 830], ['SÃO PAULO', 1050, 860]]; C.forEach(([n, x, y], i) => { const q = pop(t, 0.3 + i * 0.3); if (q > 0) { oval(g, x, y, 12, 12, '#4fc3f7', 4); g.save(); g.translate(x, y - 50); g.scale(q, q); pill(g, 0, 0, n + ' ❄', 1, { bg: '#1565c0', size: 34, h: 34 }); g.restore(); } }); }
    else { const q = pop(t, at(info, p.em, 0.5)); if (q > 0) { g.save(); g.translate(560 + 470 * 1.2 + 260, 120 + 690 * 1.2 - 40); g.scale(q, q); pill(g, 0, 0, 'SERRAS DO SUL', 1, { bg: '#212121', size: 44 }); g.restore(); } }
    g.restore();
    if (todo) NV.nevando(g, t, 120);
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, at(info, p.textoEm, 0.2)), { bg: p.textoCor || '#ffd23f', color: p.textoCor ? '#fff' : INK, size: 54 });
  },
  // isopor cheio de dindin
  isopor(g, t, info, p) {
    drawSet(g, p.neve ? 'praca_neve' : 'praca_sol', t, { carrinho: false });
    g.save(); push(g, t, info, 1.0, 1.08);
    box(g, 460, 360, 1000, 560, '#fafafa', 8, 20); box(g, 500, 400, 920, 480, '#e3f2fd', 5, 10);
    const cores = ['#ffb74d', '#fff9c4', '#f48fb1', '#ffcc80', '#ce93d8'];
    for (let i = 0; i < 40; i++) { const x = 540 + (i % 10) * 88, y = 440 + Math.floor(i / 10) * 105; box(g, x, y, 60, 90, cores[i % 5], 4, 14); }
    g.restore(); if (p.neve) NV.nevando(g, t, 90);
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, at(info, p.textoEm, 0.3)), { bg: p.textoCor || '#e65100', size: 58 });
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

// cenas1.js — atos 1 a 3: abertura, quem é o Valdir, churrasco.
import { E, registerShot, layer, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, head, coin, glassCup, label, sign, oval, box, blob, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, speaking, wl, pop, fadeIn, push, bg, rays, pill, bigText, drawSet, person, bust, closeShot, cenaShot, M, POSES, posesAt, breathe } from '../lib.js';
import { backWall, counter, CT } from '../sets/padaria.js';
import { VALDIR, VALDIR_CASA, NENE, VOCE, MARQUINHOS, BIA } from '../cast.js';

const VX = 600, NX = 1400, NY = 960, SC = 2.3;
export function coinRain(seed, spawns, x0, x1, floorY, cr) {
  const R = rng(seed), bins = {}, list = [];
  for (const ts of spawns) { const x = lerp(x0, x1, R()), b = Math.round((x - x0) / (cr * 1.4)); bins[b] = (bins[b] || 0) + 1; const spread = (bins[b - 1] || 0) + (bins[b + 1] || 0);
    list.push({ t: ts, x, land: floorY - cr * 0.55 * (bins[b] - 1) - spread * cr * 0.12, rot: R() * 6, spin: 6 + R() * 10, h: 900 + R() * 300 }); }
  return list;
}
export function drawCoins(g, t, list, cr) {
  for (const c of list) { if (t < c.t) continue; const dt = t - c.t, y0 = c.land - c.h, y = Math.min(c.land, y0 + 0.5 * 2600 * dt * dt);
    const landed = y >= c.land, tl = landed ? dt - Math.sqrt(2 * c.h / 2600) : 0, bounce = landed ? Math.abs(Math.sin(tl * 14)) * 30 * Math.exp(-tl * 7) : 0;
    coin(g, c.x, y - bounce, cr, landed ? (c.rot % 0.9) - 0.45 : c.rot + dt * c.spin); }
}
const pad = (g, cam) => layer(g, cam, 0.85, backWall);

export const K = {
  close: (g, t, info, p) => closeShot(g, t, info, p),
  cena: (g, t, info, p) => cenaShot(g, t, info, p),
  padaria_wide(g, t, info, p) {
    const cam = { z: key(t, [[0, 1.0], [info.dur, 1.07]]), x: key(t, [[0, 0], [info.dur, 40]]) };
    pad(g, cam);
    layer(g, cam, 1, g => {
      person(g, { k: 'NENE', x: NX, y: NY, facing: -1, expr: 'smile' }, t, info); counter(g);
      if (p.final) glassCup(g, 1160, CT + 4, 1.7, 0.95);
      person(g, { k: 'VALDIR', x: VX, expr: 'smile' }, t, info);
    });
    if (p.final) { g.fillStyle = 'rgba(255,240,180,.12)'; g.fillRect(0, 0, E.W, E.H); }
  },
  padaria_entrega(g, t, info) {
    const cam = { z: 1.45, x: 330, y: -60 }; pad(g, cam);
    layer(g, cam, 1, g => { const reach = ease.out(prog(t, 0.1, 0.6));
      character(g, { x: NX, y: NY, s: SC, facing: -1, c: NENE, pose: breathe(posesAt(t, [[0, 'holdFront'], [0.15, 'reach'], [1.0, 'relaxed']], 0.3), t, 1, 2), expr: 'smile', talk: talkWho('nene', info.globalT), blink: blinkAt(t, 2) });
      counter(g); glassCup(g, lerp(NX - 80, 1160, reach), CT + 4, 1.7, 0.45); });
  },
  meio_copo(g, t, info) {
    const z = key(t, [[0, 1.0], [info.dur, 1.18]], ease.out);
    blurLayer(g, 10, g => backWall(g), { z: 2.4, x: 260, y: 160 }, 1);
    g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
    box(g, -100, 820, E.W + 200, 70, '#7c4a26', 8, 0); g.fillStyle = '#b8743d'; g.fillRect(-100, 890, E.W + 200, 300);
    glassCup(g, E.W / 2, 830, 5.2, 0.45);
    const k = pop(t, 0.3); if (k > 0) { g.save(); g.translate(E.W / 2 + 240, 830 - 46 * 5.2); g.scale(k, k); g.strokeStyle = '#e53935'; g.lineWidth = 10; g.setLineDash([24, 16]); g.beginPath(); g.moveTo(-470, 0); g.lineTo(-20, 0); g.stroke(); g.setLineDash([]); label(g, 'MEIO COPO?', 50, 0, { size: 70, color: '#e53935', stroke: 14, strokeColor: '#fff', align: 'left' }); g.restore(); }
    g.restore();
  },
  chuva_padaria(g, t, info) {
    const c1 = wl(info, 'moedinha', 1.4), c2 = wl(info, 'outra', 2.8), R0 = wl(info, 'chuva', 4.4);
    if (!info.shot._rain) { const sp = [c1 - 0.5, c2 - 0.5]; for (let i = 0; i < 90; i++) sp.push(R0 - 0.5 + i * 0.024 + (i % 7) * 0.006); info.shot._rain = coinRain(7, sp, 1000, 1700, CT - 18, 34); }
    const cam = { z: key(t, [[0, 1.25], [R0 - 0.2, 1.25], [info.dur, 1.12]]), x: 180, y: -40 };
    if (t > R0) { cam.x += Math.sin(t * 61) * 4; cam.y += Math.cos(t * 53) * 3; }
    pad(g, cam);
    layer(g, cam, 1, g => {
      character(g, { x: NX + 60, y: NY, s: SC, facing: -1, c: NENE, pose: breathe(t > R0 ? POSES.handsOnHead : POSES.crossArms, t, 1, 2), expr: t > R0 ? 'surprised' : 'smile', blink: blinkAt(t, 5) });
      counter(g); glassCup(g, 1180, CT + 4, 1.7, 0.45); drawCoins(g, t, info.shot._rain, 34);
      character(g, { x: VX, y: 1000, s: SC, facing: 1, c: VALDIR, pose: breathe(posesAt(t, [[0, 'relaxed'], [c1, 'think'], [R0, 'handsOnHead']], 0.25), t), expr: t < c1 ? 'neutral' : t < R0 ? 'surprised' : 'shocked', blink: t < R0 - 0.2 && blinkAt(t, 6), look: [0.8, 0.3] });
    });
  },
  contador563(g, t, info, p) {
    if (!K._pile) K._pile = coinRain(11, Array.from({ length: 160 }, (_, i) => -2 + i * 0.008), 0, E.W, 1060, 46);
    rays(g, t); drawCoins(g, t + 1, K._pile, 46);
    character(g, { x: 300, y: 1000, s: 1.25, facing: 1, c: VALDIR, pose: breathe(POSES.handsOnHead, t), expr: 'shocked', look: [0.6, -0.6] });
    const k = ease.out(prog(t, 0.15, 1.6)), n = Math.round(563000 * k), bump = t > 1.6 ? 1 + 0.12 * Math.exp(-(t - 1.6) * 6) : 1;
    g.save(); g.translate(E.W / 2 + 80, E.H * 0.4); g.scale(bump, bump); label(g, 'R$ ' + n.toLocaleString('pt-BR'), 0, 0, { size: 230, color: '#fff', stroke: 34 }); g.restore();
    const tg = p.sub ? wl(info, 'primeiro', 2.4) : wl(info, 'imposto', 2.2);
    pill(g, E.W / 2 + 80, E.H * 0.62, p.sub || 'DE IMPOSTO NA VIDA', pop(t, tg));
  },
  carteira(g, t, info) {
    blurLayer(g, 8, g => backWall(g), { z: 1.5, x: -200, y: 60 }, 1);
    g.save(); push(g, t, info, 1, 1.06);
    const pose = { ...POSES.holdFront, hF: [44, -150], hB: [30, -150], eF: [26, -128], eB: [14, -128] };
    character(g, { x: 760, y: 1240, s: 2.9, facing: 1, c: VALDIR, pose: breathe(pose, t), expr: t > 1.0 ? 'sad' : 'neutral', look: [0.7, 0.6], blink: blinkAt(t, 2) });
    const open = ease.outBack(prog(t, 0.25, 0.8)); wallet(g, 900, 800, open, 1.25);
    const m0 = wl(info, 'cor', 0.9); if (t > m0) { const u = t - m0; moth(g, 900 + Math.sin(u * 3) * 60 + u * 140, 760 - u * 230, t, 1.4); }
    g.restore();
  },
  voce(g, t, info, p) {
    bg(g, '#bfe3f2'); g.fillStyle = '#a9d4e8'; for (let i = 0; i < 14; i++) g.fillRect(i * 150 + 40, 0, 60, E.H);
    g.fillStyle = '#e9e2d4'; g.fillRect(0, 900, E.W, 200); g.fillStyle = INK; g.fillRect(0, 897, E.W, 6);
    const th = p.qm ? 0.3 : wl(info, 'quanto', 1.0), qm = p.qm ? 0.3 : wl(info, 'pagou', info.dur * 0.7);
    g.save(); push(g, t, info, 1.08, 1.0);
    character(g, { x: 760, y: 1000, s: 2.4, facing: 1, c: VOCE, pose: breathe(posesAt(t, [[0, 'shrug'], [th, 'think']]), t), expr: t < th ? 'surprised' : 'confused', look: [0.6, -0.7], blink: blinkAt(t, 1) });
    const a = pop(t, 0.1); if (a > 0) { g.save(); g.translate(430, 300); g.scale(a, a); label(g, 'VOCÊ', 0, 0, { size: 96, color: '#ffd23f', stroke: 16 }); tube(g, [[40, 50], [150, 140]], 14, '#ffd23f', 6); polyO(g, [[170, 160], [120, 150], [160, 110]], '#ffd23f', 5); g.restore(); }
    const b = pop(t, th, 0.4);
    if (b > 0) { g.save(); g.translate(1340, 330); g.scale(b, b); for (const [x, y, r] of [[-330, 230, 18], [-290, 180, 28]]) oval(g, x, y, r, r, '#fff', 5);
      blob(g, g => { for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; g.ellipse(Math.cos(an) * 300, Math.sin(an) * 120, 95, 80, 0, 0, Math.PI * 2); } }, '#fff', 5); oval(g, 0, 0, 330, 140, '#fff', 0);
      const R = rng(Math.floor(t * 16) + 3), d = () => Math.floor(R() * 10);
      label(g, t > qm ? 'R$ ???.???' : `R$ ${d()}${d()}${d()}.${d()}${d()}${d()}`, 0, 6, { size: 110, color: '#2e7d32', stroke: 0 }); g.restore(); }
    g.restore();
  },
  fica(g, t, info) {
    blurLayer(g, 8, g => backWall(g), { z: 1.6, x: 300, y: 40 }, 1);
    character(g, { x: 1140, y: 1290, s: 3.0, facing: -1, c: VALDIR, pose: breathe(posesAt(t, [[0, 'relaxed'], [0.15, { ...POSES.point, eF: [52, -200], hF: [100, -244] }]], 0.2), t), expr: 'smug', look: [-0.9, 0.2], blink: blinkAt(t, 3) });
    const k = ease.outElastic(prog(t, 0.15, 0.85)); g.save(); g.translate(560, 240); g.rotate(-0.06); g.scale(k, k); box(g, -420, -85, 840, 170, '#e53935', 9, 24); label(g, 'FICA ATÉ O FIM!', 0, 6, { size: 96, color: '#fff', stroke: 0 }); g.restore();
  },
  calendario(g, t, info) { calendar(g, t, info, wl(info, 'trabalhou', 0.5), wl(info, 'dias', 2.6) + 0.4, 150); },
  cupom_misterio(g, t, info) { cupom(g, t, info, wl(info, 'final', 0.3) + 0.6, wl(info, 'pensando', info.dur - 0.8)); },
  // ---------- ato 2 ----------
  ficha(g, t, info, p) {
    bg(g, '#ffe082'); g.fillStyle = '#ffd54f'; for (let i = -10; i < 30; i++) { g.save(); g.translate(i * 120, 0); g.rotate(0.3); g.fillRect(0, -200, 50, 1600); g.restore(); }
    g.save(); push(g, t, info, 1.0, 1.05);
    character(g, { x: 560, y: 1010, s: 2.6, facing: 1, c: CAST[p.k], pose: breathe(POSES.crossArms, t), expr: 'smile', blink: blinkAt(t, 2) });
    const a = pop(t, 0.15); if (a > 0) { g.save(); g.translate(1290, 470); g.scale(a, a); g.rotate(0.02); box(g, -430, -300, 860, 600, '#fffdf3', 8, 18); box(g, -430, -300, 860, 120, '#1e88e5', 8, 18);
      label(g, p.nome, 0, -238, { size: 92, color: '#fff', stroke: 0 });
      const t1 = wl(info, 'quarenta', 0.9), t2 = wl(info, 'motorista', 2);
      if (t > t1 - 0.1) label(g, p.linhas[0], 0, -60, { size: 110, color: '#263238', stroke: 0 });
      if (t > t2 - 0.1) label(g, p.linhas[1], 0, 110, { size: 90, color: '#e53935', stroke: 0 }); g.restore(); }
    g.restore();
  },
  onibus_rua(g, t, info) {
    g.save(); push(g, t, info, 1.0, 1.04); M.rua(g, {}); const x = lerp(-400, 2300, prog(t, 0, info.dur + 1.2));
    M.bus(g, x, 1000, 1.25, { driver: g => head(g, 0, 0, 34, { ...VALDIR, expr: 'smile', look: [0.6, 0] }) });
    g.restore(); pill(g, E.W / 2, 140, 'LINHA PIMENTAS–CENTRO', pop(t, 0.4), { bg: '#1e88e5', size: 60 }); pill(g, E.W / 2, 290, 'GUARULHOS', pop(t, wl(info, 'guarulhos', 2)), { bg: '#ffd23f', color: '#1b1b1f', size: 50, h: 48 });
  },
  carteira_trabalho(g, t, info) {
    rays(g, t, '#90caf9', '#bbdefb'); g.save(); push(g, t, info, 1.0, 1.06);
    g.save(); g.translate(960, 560); g.rotate(-0.05); box(g, -300, -380, 600, 760, '#1565c0', 9, 24); label(g, 'CARTEIRA DE', 0, -250, { size: 50, color: '#fff', stroke: 0 }); label(g, 'TRABALHO', 0, -190, { size: 64, color: '#fff', stroke: 0 }); oval(g, 0, 20, 110, 110, '#ffd23f', 7);
    const n = Math.round(26 * ease.out(prog(t, 0.3, 1.6))); label(g, String(n), 0, 30, { size: 120, color: '#1565c0', stroke: 0 }); label(g, 'ANOS', 0, 220, { size: 90, color: '#fff', stroke: 0 }); g.restore();
    g.restore(); M.stamp(g, 1420, 300, 'ASSINADA', prog(t, 1.2, 1.5), { color: '#2e7d32', w: 470, size: 80 });
  },
  boletos(g, t, info) {
    bg(g, '#e8f5e9'); g.save(); push(g, t, info, 1, 1.05);
    for (let i = 0; i < 7; i++) { const k = pop(t, 0.1 + i * 0.12); if (k <= 0) continue; g.save(); g.translate(560 + i * 130, 560 + (i % 2) * 40); g.rotate((i - 3) * 0.08); g.scale(k, k); box(g, -150, -200, 300, 400, '#ffffff', 6, 6); g.fillStyle = '#90a4ae'; for (let r = 0; r < 6; r++) g.fillRect(-110, -150 + r * 40, 220 - (r % 3) * 50, 12); g.fillStyle = INK; for (let b = 0; b < 24; b++) g.fillRect(-120 + b * 10, 120, b % 3 ? 4 : 7, 50); M.stamp(g, 0, -10, 'PAGO', prog(t, 0.25 + i * 0.12, 0.45 + i * 0.12), { color: '#2e7d32', w: 230, size: 70 }); g.restore(); }
    g.restore(); pill(g, E.W / 2, 140, 'NUNCA ATRASOU', pop(t, 0.15), { bg: '#2e7d32' });
  },
  chiclete(g, t, info) {
    blurLayer(g, 8, g => backWall(g), { z: 1.5, x: 200, y: 60 }, 1);
    g.save(); push(g, t, info, 1.05, 1.0);
    character(g, { x: 640, y: 1000, s: 2.4, facing: 1, c: VALDIR, pose: breathe(POSES.talk, t), expr: 'smile', talk: talkWho('narrador', info.globalT) * 0, blink: blinkAt(t, 3) });
    box(g, 1050, 620, 520, 400, '#7c4a26', 6, 8); box(g, 1100, 560, 140, 80, '#f48fb1', 5, 10); label(g, 'CHICLETE', 1170, 600, { size: 24, color: '#fff', stroke: 0 }); label(g, 'R$ 1,50', 1400, 600, { size: 54, color: '#1b1b1f', stroke: 0 });
    g.restore();
    const b = pop(t, wl(info, 'cpf', 0.4)); if (b > 0) { g.save(); g.translate(980, 260); g.scale(b, b); blob(g, g => { g.ellipse(0, 0, 330, 120, 0, 0, Math.PI * 2); }, '#fff', 6); polyO(g, [[-200, 80], [-260, 170], [-120, 100]], '#fff', 6); g.fillStyle = '#fff'; g.fillRect(-195, 70, 80, 30); label(g, 'CPF NA NOTA!', 0, 6, { size: 80, color: '#1e88e5', stroke: 0 }); g.restore(); }
  },
  caixa_sapato(g, t, info) {
    blurLayer(g, 6, g => M.sala(g, { box: false }), { z: 1.4, x: 0, y: 100 }, 1);
    g.save(); push(g, t, info, 1.0, 1.1, 0, 60);
    const R0 = rng(21); for (let i = 0; i < 30; i++) { const k = pop(t, 0.05 * i); if (k > 0) { g.save(); g.translate(960 + (R0() - 0.5) * 420, 640 - R0() * 160); g.scale(k, k); M.receipt(g, 0, 0, 1.6, (R0() - 0.5) * 0.8); g.restore(); } }
    M.shoebox(g, 960, 900, 2.6, { open: false, label: '' }); label(g, 'CUPONS FISCAIS', 960, 790, { size: 64, color: '#fff', stroke: 10 });
    g.restore();
    pill(g, E.W / 2, 150, 'DESDE 1999', pop(t, wl(info, 'desde', info.dur * 0.6)), { bg: '#6d4c41', size: 84 });
  },
  // ---------- ato 3 ----------
  quintal_wide(g, t, info) {
    g.save(); push(g, t, info, 1.0, 1.06); M.quintal(g, t);
    person(g, { k: 'MARQUINHOS', x: 1250, facing: -1, pose: 'cheer', expr: 'happy' }, t, info);
    person(g, { k: 'BIA', x: 380, facing: 1, expr: 'happy' }, t, info);
    person(g, { k: 'VALDIR', casa: 1, x: 640, facing: 1, expr: 'smile' }, t, info);
    M.mesaChurrasco(g, 960, 1080); g.restore();
    pill(g, 330, 160, 'SÁBADO', pop(t, 0.2), { bg: '#1e88e5', size: 64 });
  },
  apresenta(g, t, info, p) {
    blurLayer(g, 8, g => drawSet(g, p.set, t), { z: 1.4, x: 200, y: 80 }, 1);
    g.save(); push(g, t, info, 1.0, 1.06);
    character(g, { x: 1180, y: 1060, s: 2.8, facing: -1, c: CAST[p.k], pose: breathe(posesAt(t, [[0, 'crossArms'], [1.2, { ...POSES.cheer, hF: [30, -230], hB: [-24, -232] }]]), t), expr: 'smug', blink: blinkAt(t, 1) });
    g.restore(); label(g, 'MARQUINHOS', 560, 300, { size: 110, color: '#ff7a1a', stroke: 18 });
    const k = pop(t, wl(info, 'empres', 1.0)); if (k > 0) { g.save(); g.translate(560, 470); g.rotate(-0.06); g.scale(k, k); label(g, p.titulo, 0, 0, { size: 90, color: '#fff', stroke: 16 }); g.restore(); }
  },
  pix(g, t, info) {
    bg(g, '#e0f2f1'); g.save(); push(g, t, info, 1.0, 1.05);
    M.phone(g, 680, 560, 1.9, g => { bg(g, '#ffffff'); box(g, -95, -180, 190, 60, '#32bcad', 0, 0); label(g, 'PIX', 0, -150, { size: 40, color: '#fff', stroke: 0 }); label(g, 'RECEBIDO', 0, -60, { size: 26, color: '#32bcad', stroke: 0 }); label(g, 'R$ 4.800', 0, -10, { size: 40, color: '#1b1b1f', stroke: 0 }); label(g, 'R$ 12.300', 0, 60, { size: 40, color: '#1b1b1f', stroke: 0 }); label(g, 'R$ 9.150', 0, 130, { size: 40, color: '#1b1b1f', stroke: 0 }); }, -0.06);
    const k = pop(t, wl(info, 'nota', 1.0)); if (k > 0) { g.save(); g.translate(1320, 540); g.scale(k, k); box(g, -230, -290, 460, 580, '#fffdf3', 7, 6); label(g, 'NOTA FISCAL', 0, -200, { size: 50, color: '#1b1b1f', stroke: 0 }); g.strokeStyle = '#e53935'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(-150, -110); g.lineTo(150, 200); g.moveTo(150, -110); g.lineTo(-150, 200); g.stroke(); g.restore(); }
    g.restore();
  },
  hilux_garagem(g, t, info) {
    rays(g, t, '#90a4ae', '#b0bec5'); g.save(); push(g, t, info, 1.0, 1.08);
    g.fillStyle = '#607d8b'; g.fillRect(-100, 880, E.W + 200, 300); M.hilux(g, 960, 960, 2.0, { facing: 1 });
    for (let i = 0; i < 5; i++) { const k = (t * 1.3 + i * 0.37) % 1; g.save(); g.globalAlpha = 1 - k; g.translate(600 + i * 200, 520 - k * 60); g.rotate(k * 3); polyO(g, [[0, -30], [8, -8], [30, 0], [8, 8], [0, 30], [-8, 8], [-30, 0], [-8, -8]], '#fff', 3); g.restore(); }
    g.restore(); pill(g, E.W / 2, 140, 'HILUX NA GARAGEM', pop(t, 0.2), { bg: '#37474f' });
  },
  onze_anos(g, t, info) {
    bg(g, '#fff8e1'); g.save(); push(g, t, info, 1.0, 1.05);
    for (let i = 0; i < 11; i++) { const k = pop(t, 0.2 + i * 0.11); if (k <= 0) continue; const x = 220 + (i % 6) * 300, y = 380 + Math.floor(i / 6) * 330; g.save(); g.translate(x, y); g.scale(k, k); box(g, -110, -130, 220, 260, '#fff', 6, 10); box(g, -110, -130, 220, 60, '#e53935', 6, 10); label(g, String(2015 + i), 0, -100, { size: 40, color: '#fff', stroke: 0 }); box(g, -30, -40, 60, 120, '#ffca28', 5, 10); oval(g, 0, -40, 30, 10, '#fff', 4); g.restore(); }
    g.restore(); pill(g, E.W / 2, 140, 'FAZ 11 ANOS', pop(t, wl(info, 'onze', 1.0)), { bg: '#1b1b1f', color: '#ffd23f' });
  },
  oculos_preco(g, t, info) {
    blurLayer(g, 8, g => M.quintal(g, t), { z: 1.5, x: 0, y: 200 }, 1);
    g.save(); push(g, t, info, 1.0, 1.1);
    box(g, 360, 640, 1200, 60, '#fafafa', 7, 10);
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.ellipse(840, 520, 120, 95, 0, 0, Math.PI * 2); g.moveTo(1200, 520); g.ellipse(1080, 520, 120, 95, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(950, 500); g.quadraticCurveTo(960, 470, 970, 500); g.stroke();
    g.fillStyle = 'rgba(160,220,255,.45)'; g.beginPath(); g.ellipse(840, 520, 112, 87, 0, 0, 7); g.ellipse(1080, 520, 112, 87, 0, 0, 7); g.fill();
    const k = pop(t, wl(info, 'quatrocentos', 1.6)); if (k > 0) { g.save(); g.translate(1340, 320); g.rotate(0.12); g.scale(k, k); box(g, -190, -80, 380, 160, '#ffd23f', 7, 16); oval(g, -150, 0, 16, 16, '#fff', 5); label(g, 'R$ 480', 20, 6, { size: 90, color: '#1b1b1f', stroke: 0 }); g.restore(); }
    g.restore(); pill(g, E.W / 2, 140, 'OS ÓCULOS DA BIA', pop(t, wl(info, 'oculos', 0.6)), { bg: '#ec407a' });
  },
  sala_aula(g, t, info) {
    g.save(); push(g, t, info, 1.0, 1.1, 0, 120); M.escola(g);
    for (let i = 0; i < 3; i++) M.carteira(g, 560 + i * 400, 1000, 1.4);
    character(g, { x: 960, y: 1010, s: 1.75, facing: 1, c: BIA, pose: breathe({ ...POSES.sit }, t), expr: 'worried', look: [0, -1], blink: blinkAt(t, 2), front: true });
    g.restore();
    const k = pop(t, wl(info, 'primeira', 0.8)); pill(g, 520, 140, 'PRIMEIRA FILA', k, { bg: '#1e88e5', size: 60 });
    const k2 = pop(t, wl(info, 'enxerga', info.dur * 0.7)); if (k2 > 0) { g.save(); g.translate(1470, 210); g.scale(k2, k2); label(g, '?', 0, 0, { size: 200, color: '#ffd23f', stroke: 20 }); g.restore(); }
  },
  risada(g, t, info) {
    g.save(); push(g, t, info, 1.0, 1.05); M.quintal(g, t);
    const laugh = (x, c, f, d = 0) => character(g, { x, y: 1000 + Math.abs(Math.sin(t * 9 + d)) * -12, s: 2.3, facing: f, c, pose: breathe(POSES.cheer, t, 2, d), expr: 'happy', talk: 0.6 + 0.4 * Math.abs(Math.sin(t * 12 + d)), blink: false });
    laugh(1250, MARQUINHOS, -1, 1); laugh(1580, { ...CAST.CIDA }, -1, 2);
    const forced = t > wl(info, 'valdir', 1.2) - 0.1;
    character(g, { x: 640, y: 1000, s: 2.3, facing: 1, c: VALDIR_CASA, pose: breathe(forced ? POSES.relaxed : POSES.stand, t), expr: forced ? 'smile' : 'neutral', look: [0.5, 0], blink: blinkAt(t, 4) });
    M.mesaChurrasco(g, 960, 1080); g.restore();
    for (let i = 0; i < 3; i++) { const k = pop(t, 0.1 + i * 0.2); if (k > 0) label(g, 'HA', 1180 + i * 170, 330 - i * 50, { size: 90 * k, color: '#ffd23f', stroke: 14, rot: (i - 1) * 0.2 }); }
    pill(g, 420, 160, 'POR EDUCAÇÃO', pop(t, wl(info, 'educa', 2.0)), { bg: '#78909c', size: 56 });
  },
  tv_jornal(g, t, info, p) {
    blurLayer(g, 6, g => M.sala(g, {}), { z: 1.3, x: 0, y: 0 }, 1);
    g.save(); push(g, t, info, 1.0, 1.12, 0, -40);
    box(g, 610, 800, 700, 200, '#6d4c41', 6, 8);
    M.tv(g, 960, 520, 1.85, g => { bg(g, '#0d47a1'); box(g, -205, 40, 410, 88, '#e53935', 0, 0); p.manchete.forEach((l, i) => label(g, l, 0, 62 + i * 0, { size: 0.1, stroke: 0 }));
      label(g, p.manchete[0], 0, -70, { size: 30, color: '#fff', stroke: 0 }); label(g, p.manchete[1], 0, -20, { size: 36, color: '#ffd23f', stroke: 0 }); label(g, p.manchete[2], 0, 84, { size: 32, color: '#fff', stroke: 0 });
      if (p.ao_vivo) { box(g, -195, -120, 110, 34, '#e53935', 3, 4); label(g, 'AO VIVO', -140, -102, { size: 22, color: '#fff', stroke: 0 }); }
      label(g, 'JORNAL', 140, -100, { size: 28, color: '#90caf9', stroke: 0 }); });
    g.restore();
  },
};
// ---------- auxiliares ----------
export function wallet(g, x, y, open, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); const a = open * 1.1; g.save(); g.rotate(-a); box(g, -110, -70, 110, 140, '#7a4a2a', 6, 12); box(g, -96, -52, 82, 30, '#5e3720', 4, 6); g.restore(); box(g, 0, -70, 110, 140, '#8a5632', 6, 12); g.strokeStyle = '#c99a6a'; g.setLineDash([8, 7]); g.lineWidth = 3; g.strokeRect(10, -60, 90, 120); g.setLineDash([]); g.restore(); }
export function moth(g, x, y, t, s = 1) { const w = Math.abs(Math.sin(t * 26)); g.save(); g.translate(x, y); g.scale(s, s); for (const d of [-1, 1]) oval(g, d * 16, -4, 20, 26 * (0.3 + 0.7 * w), '#b9b0a2', 4, d * 0.5); oval(g, 0, 0, 7, 16, '#6e655a', 4); g.restore(); }
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'], DIAS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export function calendar(g, t, info, c0, c1, total, o = {}) {
  bg(g, '#fff3d6'); g.save(); push(g, t, info, 1.0, 1.05);
  const days = Math.round(total * ease.inOut(prog(t, c0, c1))); let acc = 0;
  MESES.forEach((m, i) => { const cx = 330 + (i % 6) * 252, cy = 260 + Math.floor(i / 6) * 300, w = 210, h = 240, pp = pop(t, i * 0.04, 0.3); if (pp <= 0) { acc += DIAS[i]; return; }
    g.save(); g.translate(cx, cy); g.scale(pp, pp); box(g, -w / 2, -h / 2, w, h, '#fff', 6, 14); const fill = clamp((days - acc) / DIAS[i]);
    if (fill > 0) { g.save(); g.beginPath(); g.rect(-w / 2 + 3, -h / 2 + 58, (w - 6) * fill, h - 61); g.clip(); g.fillStyle = o.color || '#ef5350'; g.fillRect(-w / 2, -h / 2, w, h); g.restore(); }
    box(g, -w / 2, -h / 2, w, 56, fill >= 1 ? '#c62828' : '#455a64', 6, 14); label(g, m, 0, -h / 2 + 30, { size: 40, color: '#fff', stroke: 0 });
    if (fill >= 1) label(g, '$', 0, 30, { size: 110, color: '#fff', stroke: 12, strokeColor: '#b71c1c' }); g.restore(); acc += DIAS[i]; });
  const c = pop(t, c0, 0.4); if (c > 0) { g.save(); g.translate(E.W / 2, 930); g.scale(c, c); box(g, -560, -80, 1120, 160, '#1b1b1f', 0, 26); label(g, `${days} DIAS ${o.sufixo || 'PRO IMPOSTO'}`, 0, 6, { size: 88, color: '#ffd23f', stroke: 0 }); g.restore(); }
  g.restore();
}
export function cupom(g, t, info, SC, RG, o = {}) {
  bg(g, o.bg || '#2b2d42'); g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.ellipse(E.W / 2, E.H / 2, 700, 520, 0, 0, Math.PI * 2); g.fill();
  const scroll = key(t, [[0, 0], [SC, 640]], ease.inOut), z = key(t, [[0, 1.0], [SC, 1.0], [info.dur, 1.25]], ease.inOut);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(0, -scroll); g.rotate(-0.02);
  const W = 560, top = -420, H = 1400;
  blob(g, g => { g.moveTo(-W / 2, top); g.lineTo(W / 2, top); g.lineTo(W / 2, top + H); for (let i = 0; i <= 14; i++) g.lineTo(W / 2 - i * W / 14, top + H + (i % 2 ? 22 : 0)); g.closePath(); }, '#fbfaf5', 6);
  const L = (s, y, q = {}) => label(g, s, q.x ?? 0, top + y, { size: q.size || 36, color: q.color || '#333', stroke: 0, font: 'Nunito', weight: 800, align: q.align || 'center' });
  L(o.loja || 'PADARIA DO NENÊ', 70, { size: 46 }); L('CUPOM FISCAL', 130, { size: 30, color: '#777' });
  g.strokeStyle = '#999'; g.setLineDash([10, 8]); g.lineWidth = 3; for (const y of [170, 480, 760]) { g.beginPath(); g.moveTo(-W / 2 + 30, top + y); g.lineTo(W / 2 - 30, top + y); g.stroke(); } g.setLineDash([]);
  (o.itens || [['PINGADO', '6,00'], ['PÃO NA CHAPA', '5,00'], ['CHICLETE', '1,50'], ['CPF NA NOTA', 'SIM']]).forEach(([a, b], i) => { L(a, 240 + i * 60, { x: -W / 2 + 40, align: 'left' }); L(b, 240 + i * 60, { x: W / 2 - 40, align: 'right' }); });
  L('TOTAL', 560, { x: -W / 2 + 40, align: 'left', size: 48 }); L(o.total || 'R$ 12,50', 560, { x: W / 2 - 40, align: 'right', size: 48 });
  L('Valor aprox. dos tributos:', 860, { size: 34, color: '#555' });
  g.save(); g.translate(0, top + 940); g.rotate(Math.sin(t * 9) * 0.05 * (t > SC && !o.valor ? 1 : 0)); label(g, o.valor || 'R$ ???', 0, 0, { size: 96, color: '#e53935', stroke: 0 }); g.restore();
  const ring = ease.out(prog(t, RG, RG + 0.6)); if (ring > 0) { g.strokeStyle = '#e53935'; g.lineWidth = 10; g.beginPath(); g.ellipse(0, top + 940, 210, 90, -0.05, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); }
  g.restore();
}
for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

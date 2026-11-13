// shots/01_abertura.js — abertura na padaria: meio copo, chuva de moedas, 563 mil.
import { E, registerShot, layer, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { POSES, posesAt, breathe } from '/engine/rig2d.js';
import { character, head, coin, glassCup, label, oval, box, blob, flap, blinkAt, badge, tube, INK } from '/engine/toon.js';
import { padaria, backWall, counter, GY, CT } from '../sets/padaria.js';
import { VALDIR, NENE } from '../cast.js';

const VX = 600, NX = 1400, NY = 960, SC = 2.3;

// busto para closes: ombros + cabeça grande
function bust(g, x, y, r, c, o = {}) {
  blob(g, g => { g.moveTo(x - r * 1.55, E.H + 40); g.bezierCurveTo(x - r * 1.5, y + r * 1.2, x - r * 0.8, y + r * 1.0, x, y + r * 1.0); g.bezierCurveTo(x + r * 0.8, y + r * 1.0, x + r * 1.5, y + r * 1.2, x + r * 1.55, E.H + 40); g.closePath(); }, c.shirt, r * 0.05);
  if (c.apron) blob(g, g => { g.moveTo(x - r * 0.6, y + r * 1.3); g.lineTo(x + r * 0.6, y + r * 1.3); g.lineTo(x + r * 0.8, E.H + 40); g.lineTo(x - r * 0.8, E.H + 40); g.closePath(); }, c.apron, r * 0.05);
  blob(g, g => g.rect(x - r * 0.28, y + r * 0.7, r * 0.56, r * 0.4), c.skin, r * 0.05);
  if (c.collar) for (const d of [-1, 1]) blob(g, g => { g.moveTo(x + d * r * 0.3, y + r * 0.95); g.lineTo(x + d * r * 0.05, y + r * 1.45); g.lineTo(x + d * r * 0.62, y + r * 1.25); g.closePath(); }, c.collar, r * 0.04);
  if (c.badge) badge(g, x + r * 0.62, y + r * 1.75, r / 70, c);
  head(g, x, y, r, { ...c, ...o });
}
// moedas caindo: lista determinística com ponto de pouso numa pilha por colunas
function coinRain(seed, spawns, x0, x1, floorY, cr) {
  const R = rng(seed), bins = {}, list = [];
  for (const ts of spawns) {
    const x = lerp(x0, x1, R()), b = Math.round((x - x0) / (cr * 1.4)); bins[b] = (bins[b] || 0) + 1;
    const spread = (bins[b - 1] || 0) + (bins[b + 1] || 0);
    list.push({ t: ts, x, land: floorY - cr * 0.55 * (bins[b] - 1) - spread * cr * 0.12, rot: R() * 6, spin: 6 + R() * 10, h: 900 + R() * 300 });
  }
  return list;
}
function drawCoins(g, t, list, cr) {
  for (const c of list) {
    if (t < c.t) continue;
    const dt = t - c.t, y0 = c.land - c.h, y = Math.min(c.land, y0 + 0.5 * 2600 * dt * dt);
    const landed = y >= c.land, tl = landed ? dt - Math.sqrt(2 * c.h / 2600) : 0;
    const bounce = landed ? Math.abs(Math.sin(tl * 14)) * 30 * Math.exp(-tl * 7) : 0;
    coin(g, c.x, y - bounce, cr, landed ? (c.rot % 0.9) - 0.45 : c.rot + dt * c.spin);
  }
}

// s001 — "Um pingado, por favor."  plano aberto, leve push-in
registerShot('s001', { draw(g, t, info) {
  const cam = { z: key(t, [[0, 1.0], [info.dur, 1.07]]), x: key(t, [[0, 0], [info.dur, 40]]) };
  padaria(g, cam);
  layer(g, cam, 1, g => {
    character(g, { x: NX, y: NY, s: SC, facing: -1, c: NENE, pose: breathe(POSES.relaxed, t, 1, 2), expr: 'smile', blink: blinkAt(t, 1) });
    counter(g);
    character(g, { x: VX, y: GY, s: SC, facing: 1, c: VALDIR, pose: breathe(posesAt(t, [[0, 'stand'], [0.4, 'talk'], [2.4, 'relaxed']]), t), expr: 'smile', talk: flap(t, 0.3, 2.6), blink: blinkAt(t) });
  });
}});

// s002 — "Tá aqui."  Nenê põe o copo no balcão
registerShot('s002', { draw(g, t, info) {
  const cam = { z: 1.45, x: 330, y: -60 };
  padaria(g, cam);
  layer(g, cam, 1, g => {
    const reach = ease.out(prog(t, 0.1, 0.6));
    const pose = posesAt(t, [[0, 'holdFront'], [0.15, 'reach'], [1.0, 'relaxed']], 0.3);
    character(g, { x: NX, y: NY, s: SC, facing: -1, c: NENE, pose: breathe(pose, t, 1, 2), expr: 'smile', talk: flap(t, 0.3, 1.3), blink: blinkAt(t, 2) });
    counter(g);
    glassCup(g, lerp(NX - 80, 1160, reach), CT + 4, 1.7, 0.45);
  });
}});

// s003 — "Meio copo."  insert no copo
registerShot('s003', { draw(g, t, info) {
  const z = key(t, [[0, 1.0], [info.dur, 1.18]], ease.out);
  blurLayer(g, 10, g => backWall(g), { z: 2.4, x: 260, y: 160 }, 1);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  box(g, -100, 820, E.W + 200, 70, '#7c4a26', 8, 0); g.fillStyle = '#b8743d'; g.fillRect(-100, 890, E.W + 200, 300);
  glassCup(g, E.W / 2, 830, 5.2, 0.45);
  // marcação "metade"
  const k = ease.outBack(prog(t, 0.35, 0.75));
  if (k > 0) { g.save(); g.translate(E.W / 2 + 240, 830 - 46 * 5.2); g.scale(k, k); g.strokeStyle = '#e53935'; g.lineWidth = 10; g.setLineDash([24, 16]); g.beginPath(); g.moveTo(-470, 0); g.lineTo(-20, 0); g.stroke(); g.setLineDash([]); label(g, 'MEIO COPO?', 50, 0, { size: 70, color: '#e53935', stroke: 14, strokeColor: '#fff', align: 'left' }); g.restore(); }
  g.restore();
}});

// s004 — "Nenê, cadê o resto?"  close no Valdir
registerShot('s004', { draw(g, t, info) {
  blurLayer(g, 8, g => backWall(g), { z: 1.7, x: -380, y: 40 }, 1);
  const zx = key(t, [[0, 1.0], [info.dur, 1.06]]);
  g.save(); g.translate(E.W * 0.42, E.H * 0.44); g.scale(zx, zx); g.rotate(Math.sin(t * 1.3) * 0.015);
  bust(g, 0, -20, 230, VALDIR, { expr: 'confused', talk: flap(t, 0.2, 1.8), blink: blinkAt(t, 3), look: [0.6, 0.1] });
  g.restore();
  if (t > 1.0) { const q = ease.outBack(prog(t, 1.0, 1.3)); g.save(); g.translate(E.W * 0.75, E.H * 0.25); g.scale(q, q); label(g, '?', 0, 0, { size: 220, color: '#ffd23f', stroke: 22 }); g.restore(); }
}});

// s005 — "O resto é imposto, Valdir. Hoje ele veio separado."  close no Nenê
registerShot('s005', { draw(g, t, info) {
  blurLayer(g, 8, g => backWall(g), { z: 1.6, x: 380, y: 60 }, 1);
  const zx = key(t, [[0, 1.04], [info.dur, 1.0]]);
  g.save(); g.translate(E.W * 0.56, E.H * 0.6); g.scale(zx, zx);
  bust(g, 0, 0, 190, NENE, { expr: t > 1.9 ? 'smug' : 'smile', talk: flap(t, 0.2, 2.9), blink: blinkAt(t, 4), look: [-0.5, 0] });
  g.restore();
}});

// s006 — moedas: uma, outra, chuva
let RAIN = null;
registerShot('s006', { draw(g, t, info) {
  const c1 = info.c1 ?? 0.6, c2 = info.c2 ?? 2.0, R0 = info.rain ?? 3.2;
  if (!RAIN) { const sp = [c1 - 0.5, c2 - 0.5]; for (let i = 0; i < 90; i++) sp.push(R0 - 0.5 + i * 0.024 + (i % 7) * 0.006); RAIN = coinRain(7, sp, 1000, 1700, CT - 18, 34); }
  const cam = { z: key(t, [[0, 1.25], [R0 - 0.2, 1.25], [info.dur, 1.12]]), x: 180, y: -40 };
  const sh = t > R0 ? [Math.sin(t * 61) * 4, Math.cos(t * 53) * 3] : [0, 0];
  cam.x += sh[0]; cam.y += sh[1];
  padaria(g, cam);
  layer(g, cam, 1, g => {
    character(g, { x: NX + 60, y: NY, s: SC, facing: -1, c: NENE, pose: breathe(t > R0 ? POSES.handsOnHead : POSES.crossArms, t, 1, 2), expr: t > R0 ? 'surprised' : 'smile', blink: blinkAt(t, 5) });
    counter(g);
    glassCup(g, 1180, CT + 4, 1.7, 0.45);
    drawCoins(g, t, RAIN, 34);
    const pose = posesAt(t, [[0, 'relaxed'], [c1, 'think'], [R0, 'handsOnHead']], 0.25);
    character(g, { x: VX, y: GY, s: SC, facing: 1, c: VALDIR, pose: breathe(pose, t), expr: t < c1 ? 'neutral' : t < R0 ? 'surprised' : 'shocked', blink: t < R0 - 0.2 && blinkAt(t, 6), look: [0.8, 0.3] });
  });
}});

// s007 — "563 mil reais."  contador gigante
const PILE = coinRain(11, Array.from({ length: 160 }, (_, i) => -2 + i * 0.008), 0, E.W, 1060, 46);
registerShot('s007', { draw(g, t, info) {
  // fundo de raios
  g.fillStyle = '#ffcf3a'; g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.rotate(t * 0.12); g.fillStyle = '#ffe07a';
  for (let i = 0; i < 18; i++) { g.rotate(Math.PI * 2 / 18); g.beginPath(); g.moveTo(0, 0); g.lineTo(1600, -140); g.lineTo(1600, 140); g.closePath(); g.fill(); }
  g.restore();
  drawCoins(g, t + 1, PILE, 46);
  // Valdir pequeno em choque
  character(g, { x: 300, y: 1000, s: 1.25, facing: 1, c: VALDIR, pose: breathe(POSES.handsOnHead, t), expr: 'shocked', look: [0.6, -0.6] });
  // número
  const k = ease.out(prog(t, 0.15, 1.6)), n = Math.round(563000 * k);
  const pop = 1 + 0.12 * Math.exp(-Math.max(0, t - 1.6) * 6) * (t > 1.6 ? 1 : 0);
  const str = 'R$ ' + n.toLocaleString('pt-BR');
  g.save(); g.translate(E.W / 2 + 80, E.H * 0.4); g.scale(pop, pop);
  label(g, str, 0, 0, { size: 230, color: '#ffffff', stroke: 34 });
  g.restore();
  const s2 = ease.outBack(prog(t, info.tag ?? 2.2, (info.tag ?? 2.2) + 0.4));
  if (s2 > 0) { g.save(); g.translate(E.W / 2 + 80, E.H * 0.62); g.scale(s2, s2); box(g, -470, -62, 940, 124, '#e53935', 8, 18); label(g, 'DE IMPOSTO NA VIDA', 0, 4, { size: 72, color: '#fff', stroke: 0 }); g.restore(); }
}});

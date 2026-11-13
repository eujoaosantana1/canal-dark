// shots/02_gancho.js — gancho: "sem nunca ver a cor", "e você?", "fica até o fim", 150 dias, final da conta.
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { POSES, posesAt, breathe } from '/engine/rig2d.js';
import { character, head, label, oval, box, blob, polyO, tube, flap, blinkAt, INK } from '/engine/toon.js';
import { backWall } from '../sets/padaria.js';
import { VALDIR, VOCE } from '../cast.js';

function wallet(g, x, y, open, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const a = open * 1.1;
  g.save(); g.rotate(-a); box(g, -110, -70, 110, 140, '#7a4a2a', 6, 12); box(g, -96, -52, 82, 30, '#5e3720', 4, 6); g.restore();
  box(g, 0, -70, 110, 140, '#8a5632', 6, 12); g.strokeStyle = '#c99a6a'; g.setLineDash([8, 7]); g.lineWidth = 3; g.strokeRect(10, -60, 90, 120); g.setLineDash([]);
  g.restore();
}
function moth(g, x, y, t, s = 1) {
  const w = Math.abs(Math.sin(t * 26));
  g.save(); g.translate(x, y); g.scale(s, s);
  for (const d of [-1, 1]) oval(g, d * 16, -4, 20, 26 * (0.3 + 0.7 * w), '#b9b0a2', 4, d * 0.5);
  oval(g, 0, 0, 7, 16, '#6e655a', 4);
  g.restore();
}

// s008 — "Sem nunca ver a cor desse dinheiro."  carteira vazia, sai uma mariposa
registerShot('s008', { draw(g, t, info) {
  blurLayer(g, 8, g => backWall(g), { z: 1.5, x: -200, y: 60 }, 1);
  const z = key(t, [[0, 1.0], [info.dur, 1.06]]);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const pose = { ...POSES.holdFront, hF: [44, -150], hB: [30, -150], eF: [26, -128], eB: [14, -128] };
  character(g, { x: 760, y: 1240, s: 2.9, facing: 1, c: VALDIR, pose: breathe(pose, t), expr: t > 1.0 ? 'sad' : 'neutral', look: [0.7, 0.6], blink: blinkAt(t, 2) });
  const open = ease.outBack(prog(t, 0.25, 0.8));
  wallet(g, 900, 800, open, 1.25);
  const m0 = info.moth ?? 0.7; if (t > m0) { const u = t - m0; moth(g, 900 + Math.sin(u * 3) * 60 + u * 140, 760 - u * 230, t, 1.4); }
  g.restore();
}});

// s009 — "E você? Quanto acha que já pagou?"  o espectador + contador girando
const R9 = rng(9);
registerShot('s009', { draw(g, t, info) {
  const th = info.thought ?? 1.3;
  g.fillStyle = '#bfe3f2'; g.fillRect(0, 0, E.W, E.H);
  g.fillStyle = '#a9d4e8'; for (let i = 0; i < 14; i++) g.fillRect(i * 150 + 40, 0, 60, E.H);
  g.fillStyle = '#e9e2d4'; g.fillRect(0, 900, E.W, 200); g.fillStyle = INK; g.fillRect(0, 897, E.W, 6);
  const z = key(t, [[0, 1.08], [info.dur, 1.0]]);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  character(g, { x: 760, y: 1000, s: 2.4, facing: 1, c: VOCE, pose: breathe(posesAt(t, [[0, 'shrug'], [th, 'think']]), t), expr: t < th ? 'surprised' : 'confused', look: [0.6, -0.7], blink: blinkAt(t, 1) });
  // seta "VOCÊ"
  const a = ease.outBack(prog(t, 0.1, 0.45));
  if (a > 0) { g.save(); g.translate(430, 300); g.scale(a, a); label(g, 'VOCÊ', 0, 0, { size: 96, color: '#ffd23f', stroke: 16 }); tube(g, [[40, 50], [150, 140]], 14, '#ffd23f', 6); polyO(g, [[170, 160], [120, 150], [160, 110]], '#ffd23f', 5); g.restore(); }
  // balão de pensamento com número girando
  const b = ease.outBack(prog(t, th, th + 0.4));
  if (b > 0) {
    g.save(); g.translate(1340, 330); g.scale(b, b);
    for (const [x, y, r] of [[-330, 230, 18], [-290, 180, 28]]) oval(g, x, y, r, r, '#ffffff', 5);
    blob(g, g => { for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; g.ellipse(Math.cos(an) * 300, Math.sin(an) * 120, 95, 80, 0, 0, Math.PI * 2); } }, '#ffffff', 5);
    oval(g, 0, 0, 330, 140, '#ffffff', 0);
    const R = rng(Math.floor(t * 16) + 3), d = () => Math.floor(R() * 10);
    const str = `R$ ${d()}${d()}${d()}.${d()}${d()}${d()}`;
    label(g, t > (info.qm ?? 3.2) ? 'R$ ???.???' : str, 0, 6, { size: 110, color: '#2e7d32', stroke: 0 });
    g.restore();
  }
  g.restore();
}});

// s010 — "Fica até o fim."  Valdir aponta pro espectador
registerShot('s010', { draw(g, t, info) {
  blurLayer(g, 8, g => backWall(g), { z: 1.6, x: 300, y: 40 }, 1);
  character(g, { x: 1140, y: 1290, s: 3.0, facing: -1, c: VALDIR, pose: breathe(posesAt(t, [[0, 'relaxed'], [0.15, { ...POSES.point, eF: [52, -200], hF: [100, -244] }]], 0.2), t), expr: 'smug', talk: 0, look: [-0.9, 0.2], blink: blinkAt(t, 3) });
  const k = ease.outElastic(prog(t, 0.2, 0.9));
  g.save(); g.translate(560, 240); g.rotate(-0.06); g.scale(k, k);
  box(g, -420, -85, 840, 170, '#e53935', 9, 24); label(g, 'FICA ATÉ O FIM!', 0, 6, { size: 96, color: '#ffffff', stroke: 0 });
  g.restore();
}});

// s011 — "Esse ano o brasileiro trabalhou 150 dias só pra pagar imposto."  calendário
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const DIAS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
registerShot('s011', { draw(g, t, info) {
  g.fillStyle = '#fff3d6'; g.fillRect(0, 0, E.W, E.H);
  const z = key(t, [[0, 1.0], [info.dur, 1.05]]);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const days = Math.round(150 * ease.inOut(prog(t, info.c0 ?? 0.6, info.c1 ?? 3.6)));
  let acc = 0;
  MESES.forEach((m, i) => {
    const cx = 330 + (i % 6) * 252, cy = 260 + Math.floor(i / 6) * 300, w = 210, h = 240;
    const pop = ease.outBack(prog(t, i * 0.04, 0.3 + i * 0.04)); if (pop <= 0) { acc += DIAS[i]; return; }
    g.save(); g.translate(cx, cy); g.scale(pop, pop);
    box(g, -w / 2, -h / 2, w, h, '#ffffff', 6, 14);
    const fill = clamp((days - acc) / DIAS[i]);
    if (fill > 0) { g.save(); g.beginPath(); g.rect(-w / 2 + 3, -h / 2 + 58, (w - 6) * fill, h - 61); g.clip(); g.fillStyle = '#ef5350'; g.fillRect(-w / 2, -h / 2, w, h); g.restore(); }
    box(g, -w / 2, -h / 2, w, 56, fill >= 1 ? '#c62828' : '#455a64', 6, 14);
    label(g, m, 0, -h / 2 + 30, { size: 40, color: '#fff', stroke: 0 });
    if (fill >= 1) label(g, '$', 0, 30, { size: 110, color: '#ffffff', stroke: 12, strokeColor: '#b71c1c' });
    g.restore(); acc += DIAS[i];
  });
  const c = ease.outBack(prog(t, (info.c0 ?? 0.6), (info.c0 ?? 0.6) + 0.4));
  if (c > 0) { g.save(); g.translate(E.W / 2, 930); g.scale(c, c); box(g, -520, -80, 1040, 160, '#1b1b1f', 0, 26); label(g, `${days} DIAS PRO IMPOSTO`, 0, 6, { size: 92, color: '#ffd23f', stroke: 0 }); g.restore(); }
  g.restore();
}});

// s012 — "E o final dessa conta não é o que você tá pensando."  cupom fiscal, rodapé misterioso
registerShot('s012', { draw(g, t, info) {
  g.fillStyle = '#2b2d42'; g.fillRect(0, 0, E.W, E.H);
  g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.ellipse(E.W / 2, E.H / 2, 700, 520, 0, 0, Math.PI * 2); g.fill();
  const SC = info.scroll ?? 2.6; const scroll = key(t, [[0, 0], [SC, 640]], ease.inOut), z = key(t, [[0, 1.0], [SC, 1.0], [info.dur, 1.25]], ease.inOut);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(0, -scroll); g.rotate(-0.02);
  const W = 560, top = -420, H = 1400;
  blob(g, g => { g.moveTo(-W / 2, top); g.lineTo(W / 2, top); g.lineTo(W / 2, top + H); for (let i = 0; i <= 14; i++) g.lineTo(W / 2 - i * W / 14, top + H + (i % 2 ? 22 : 0)); g.closePath(); }, '#fbfaf5', 6);
  const L = (s, y, o = {}) => label(g, s, o.x ?? 0, top + y, { size: o.size || 36, color: o.color || '#333', stroke: 0, font: 'Nunito', weight: 800, align: o.align || 'center' });
  L('PADARIA DO NENÊ', 70, { size: 46 }); L('CUPOM FISCAL', 130, { size: 30, color: '#777' });
  g.strokeStyle = '#999'; g.setLineDash([10, 8]); g.lineWidth = 3; for (const y of [170, 480, 760]) { g.beginPath(); g.moveTo(-W / 2 + 30, top + y); g.lineTo(W / 2 - 30, top + y); g.stroke(); } g.setLineDash([]);
  [['PINGADO', '6,00'], ['PÃO NA CHAPA', '5,00'], ['CHICLETE', '1,50'], ['CPF NA NOTA', 'SIM']].forEach(([a, b], i) => { L(a, 240 + i * 60, { x: -W / 2 + 40, align: 'left' }); L(b, 240 + i * 60, { x: W / 2 - 40, align: 'right' }); });
  L('TOTAL', 560, { x: -W / 2 + 40, align: 'left', size: 48 }); L('R$ 12,50', 560, { x: W / 2 - 40, align: 'right', size: 48 });
  L('Valor aprox. dos tributos:', 860, { size: 34, color: '#555' });
  const wob = Math.sin(t * 9) * 0.05 * (t > SC ? 1 : 0);
  g.save(); g.translate(0, top + 940); g.rotate(wob); label(g, 'R$ ???', 0, 0, { size: 96, color: '#e53935', stroke: 0 }); g.restore();
  const RG = info.ring ?? 2.7; const ring = ease.out(prog(t, RG, RG + 0.6));
  if (ring > 0) { g.strokeStyle = '#e53935'; g.lineWidth = 10; g.beginPath(); g.ellipse(0, top + 940, 210, 90, -0.05, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); }
  g.restore();
}});

// engine/toon.js — flat "cartoon" look: thick black outlines, flat fills, big-headed characters with
// full faces (big white eyes, brows, nose, mouth), clothes and hair. Reuses rig2d poses (same 11 points),
// so posesAt / breathe / walkPose all work. Local space: feet on y=0, up is -y, facing +x.
import { E, clamp, lerp, key, ease } from './core.js';
import { POSES } from './rig2d.js';

export const INK = '#1b1b1f';
export const SKIN = { light: '#f6d2b0', tan: '#e2a874', brown: '#b9784a', dark: '#7a4a2c' };
const LW = 5;                      // outline width in local units

// ---------- outlined primitives ----------
export function tube(g, pts, w, fill, lw = LW) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); };
  path(); g.strokeStyle = INK; g.lineWidth = w + lw * 2; g.stroke();
  path(); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
}
export function blob(g, draw, fill, lw = LW) { g.beginPath(); draw(g); g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); }
export const oval = (g, x, y, rx, ry, fill, lw = LW, rot = 0) => blob(g, g => g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2), fill, lw);
export function box(g, x, y, w, h, fill, lw = LW, r = 0) {
  blob(g, g => { if (r) { const rr = Math.min(r, w / 2, h / 2); g.moveTo(x + rr, y); g.arcTo(x + w, y, x + w, y + h, rr); g.arcTo(x + w, y + h, x, y + h, rr); g.arcTo(x, y + h, x, y, rr); g.arcTo(x, y, x + w, y, rr); g.closePath(); } else g.rect(x, y, w, h); }, fill, lw);
}
export function polyO(g, pts, fill, lw = LW) { blob(g, g => { g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); g.closePath(); }, fill, lw); }
export function label(g, str, x, y, o = {}) {
  const { size = 60, color = '#fff', stroke = size * 0.14, strokeColor = INK, font = 'Fredoka', weight = 700, align = 'center', base = 'middle', rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `${weight} ${size}px "${font}"`; g.textAlign = align; g.textBaseline = base;
  if (stroke) { g.lineJoin = 'round'; g.lineWidth = stroke; g.strokeStyle = strokeColor; g.strokeText(str, 0, 0); }
  g.fillStyle = color; g.fillText(str, 0, 0); g.restore();
}

// ---------- faces ----------
export const TEXPR = {
  neutral:   { eye: 1.0, brow: 0, mouth: 'line' },
  smile:     { eye: 1.0, brow: 0, mouth: 'smile' },
  happy:     { eye: 0.9, brow: -0.15, mouth: 'grin' },
  surprised: { eye: 1.25, brow: -0.35, mouth: 'o' },
  shocked:   { eye: 1.45, brow: -0.5, mouth: 'O', pupil: 0.55 },
  confused:  { eye: 1.05, brow: 0, browTilt: 1, mouth: 'wavy' },
  worried:   { eye: 1.05, brow: -0.1, browWorry: 1, mouth: 'frown' },
  sad:       { eye: 0.9, brow: 0, browWorry: 1, mouth: 'frown', lids: 0.35 },
  angry:     { eye: 0.95, brow: 0.2, browAngry: 1, mouth: 'frown' },
  smug:      { eye: 0.85, brow: 0, mouth: 'smirk', lids: 0.4 },
  tired:     { eye: 0.95, brow: 0, mouth: 'line', lids: 0.5 },
};

// head(g, x, y, r, o) — x,y = head centre. o: {skin, hair, hairColor, expr, talk, blink, look:[x,y], facing, hat, mustache, glasses, beard}
export function head(g, x, y, r, o = {}) {
  const ex = { ...TEXPR.neutral, ...(TEXPR[o.expr] || {}) };
  const skin = o.skin || SKIN.tan, hc = o.hairColor || '#2a1d17', f = o.facing ?? 1, turn = (o.front ? 0 : 0.18) * f;
  const lw = Math.max(3, r * 0.075);
  g.save();
  // back hair (bun / long)
  if (o.hair === 'bun') oval(g, x - r * 0.15 * f, y - r * 1.02, r * 0.38, r * 0.32, hc, lw);
  if (o.hair === 'long') blob(g, g => { g.ellipse(x - r * 0.1 * f, y + r * 0.1, r * 1.05, r * 1.15, 0, Math.PI * 0.9, Math.PI * 2.1); g.closePath(); }, hc, lw);
  // ears
  oval(g, x - r * (0.98 - turn * 0.6), y + r * 0.08, r * 0.2, r * 0.26, skin, lw);
  if (Math.abs(turn) < 0.3) oval(g, x + r * (0.98 + turn * 0.6), y + r * 0.08, r * 0.2, r * 0.26, skin, lw);
  // head shape (slightly tall egg)
  blob(g, g => g.ellipse(x, y, r, r * 1.06, 0, 0, Math.PI * 2), skin, lw);
  // hair on top
  if (o.hair === 'short' || o.hair === 'bun' || o.hair === 'long') blob(g, g => { g.moveTo(x - r * 0.98, y - r * 0.05); g.bezierCurveTo(x - r * 1.05, y - r * 1.3, x + r * 1.05, y - r * 1.3, x + r * 0.98, y - r * 0.05); g.bezierCurveTo(x + r * 0.7, y - r * 0.55, x + r * 0.1 * f, y - r * 0.5, x - r * 0.35, y - r * 0.62); g.bezierCurveTo(x - r * 0.6, y - r * 0.4, x - r * 0.8, y - r * 0.3, x - r * 0.98, y - r * 0.05); g.closePath(); }, hc, lw);
  if (o.hair === 'buzz') blob(g, g => { g.ellipse(x, y - r * 0.12, r * 1.0, r * 0.95, 0, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); }, hc, lw);
  if (o.hair === 'puffs') { for (const d of [-1, 1]) oval(g, x + d * r * 1.0, y - r * 0.55, r * 0.42, r * 0.42, hc, lw); blob(g, g => { g.ellipse(x, y - r * 0.15, r * 1.02, r * 0.98, 0, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); }, hc, lw); }
  if (o.hair === 'spiky') blob(g, g => { g.moveTo(x - r * 0.98, y - r * 0.1); for (let i = 0; i <= 7; i++) { const u = i / 7, ax = x - r * 0.98 + u * r * 1.96, ay = y - r * (0.75 + 0.35 * Math.sin(u * Math.PI)); g.lineTo(ax - r * 0.08, ay); g.lineTo(ax + r * 0.12, ay - r * 0.38); } g.lineTo(x + r * 0.98, y - r * 0.1); g.quadraticCurveTo(x, y - r * 0.55, x - r * 0.98, y - r * 0.1); g.closePath(); }, hc, lw);
  if (o.hair === 'sides') for (const d of [-1, 1]) oval(g, x + d * r * 0.9, y - r * 0.25, r * 0.2, r * 0.32, hc, lw);
  if (o.halo) { g.strokeStyle = '#ffd23f'; g.lineWidth = r * 0.1; g.beginPath(); g.ellipse(x, y - r * 1.45, r * 0.6, r * 0.16, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = INK; g.lineWidth = lw * 0.5; g.beginPath(); g.ellipse(x, y - r * 1.45, r * 0.66, r * 0.2, 0, 0, Math.PI * 2); g.stroke(); }
  if (o.hair === 'curl') { g.strokeStyle = INK; g.lineWidth = lw; g.beginPath(); for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 5, rr = r * 0.05 + i * r * 0.004; g.lineTo(x + Math.cos(a) * rr * 2, y - r * 1.05 - i * r * 0.016 + Math.sin(a) * rr); } g.stroke(); }
  if (o.greyTemples && o.hair === 'buzz') { g.save(); g.beginPath(); g.ellipse(x, y - r * 0.12, r * 1.0, r * 0.95, 0, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); g.clip(); g.fillStyle = o.greyTemples; g.fillRect(x - r * 1.2, y - r * 1.2, r * 0.5, r * 1.3); g.fillRect(x + r * 0.7, y - r * 1.2, r * 0.5, r * 1.3); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = r * 0.03; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x - r * (0.55 + i * 0.07), y - r * 0.85 + i * r * 0.1); g.lineTo(x - r * (0.45 + i * 0.07), y - r * 0.92 + i * r * 0.1); g.stroke(); } g.restore(); g.lineWidth = lw; g.strokeStyle = INK; g.beginPath(); g.ellipse(x, y - r * 0.12, r * 1.0, r * 0.95, 0, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); g.stroke(); }
  // face features
  const fx = x + r * turn * 1.4, ey = y - r * 0.08, sep = r * 0.36, er = r * 0.27 * ex.eye;
  const look = o.look || [0.25 * f, 0];
  for (const s of [-1, 1]) {
    const exx = fx + s * sep * (1 - Math.abs(turn) * (s === f ? 0.4 : -0.1));
    if (o.blink) { g.strokeStyle = INK; g.lineWidth = lw * 1.2; g.lineCap = 'round'; g.beginPath(); g.arc(exx, ey - er * 0.2, er * 0.8, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); continue; }
    oval(g, exx, ey, er * 0.82, er, '#ffffff', lw);
    const pr = er * (ex.pupil || 0.42);
    g.fillStyle = INK; g.beginPath(); g.arc(exx + look[0] * er * 0.42, ey + look[1] * er * 0.4 + er * 0.08, pr, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(exx + look[0] * er * 0.42 - pr * 0.35, ey + look[1] * er * 0.4 - pr * 0.3, pr * 0.3, 0, Math.PI * 2); g.fill();
    if (ex.lids) { g.save(); g.beginPath(); g.ellipse(exx, ey, er * 0.82, er, 0, 0, Math.PI * 2); g.clip(); g.fillStyle = skin; g.fillRect(exx - er, ey - er * 1.1, er * 2, er * 2 * ex.lids); g.restore(); g.strokeStyle = INK; g.lineWidth = lw; g.beginPath(); g.moveTo(exx - er * 0.8, ey - er + er * 2 * ex.lids); g.lineTo(exx + er * 0.8, ey - er + er * 2 * ex.lids); g.stroke(); }
    // brows
    const by = ey - er - r * 0.12 + ex.brow * r * 0.25, bw = r * 0.2;
    let a = 0; if (ex.browWorry) a = s * 0.35; if (ex.browAngry) a = -s * 0.4; if (ex.browTilt && s === 1) a = -0.35;
    g.save(); g.translate(exx, by); g.rotate(a); g.fillStyle = o.browColor || hc; g.beginPath(); g.ellipse(0, 0, bw, r * 0.055, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }
  if (o.shades) { for (const s2 of [-1, 1]) blob(g, g => { g.ellipse(fx + s2 * sep, ey + r * 0.02, er * 1.1, er * 0.8, 0, 0, Math.PI * 2); }, '#151519', lw); g.strokeStyle = INK; g.lineWidth = lw * 1.2; g.beginPath(); g.moveTo(fx - sep + er, ey); g.lineTo(fx + sep - er, ey); g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; for (const s2 of [-1, 1]) { g.beginPath(); g.ellipse(fx + s2 * sep - er * 0.4, ey - er * 0.3, er * 0.25, er * 0.12, -0.5, 0, Math.PI * 2); g.fill(); } }
  if (o.glassesLow) { g.strokeStyle = INK; g.lineWidth = lw * 1.1; for (const s2 of [-1, 1]) { g.beginPath(); g.ellipse(fx + s2 * sep * 0.85, ey + r * 0.3, er * 0.75, er * 0.5, 0, 0, Math.PI * 2); g.stroke(); } g.beginPath(); g.moveTo(fx - sep * 0.85 + er * 0.75, ey + r * 0.3); g.lineTo(fx + sep * 0.85 - er * 0.75, ey + r * 0.3); g.stroke(); }
  if (o.glasses) { g.strokeStyle = INK; g.lineWidth = lw * 1.1; for (const s of [-1, 1]) { g.beginPath(); g.arc(fx + s * sep, ey + r * 0.02, er * 1.05, 0, Math.PI * 2); g.stroke(); } g.beginPath(); g.moveTo(fx - sep + er, ey); g.lineTo(fx + sep - er, ey); g.stroke(); }
  if (o.wrinkles) { g.strokeStyle = 'rgba(27,27,31,.55)'; g.lineWidth = lw * 0.7; g.lineCap = 'round';
    for (const k of [0, 1]) { g.beginPath(); g.moveTo(fx - r * 0.32, y - r * (0.62 + k * 0.12)); g.quadraticCurveTo(fx, y - r * (0.68 + k * 0.12), fx + r * 0.32, y - r * (0.62 + k * 0.12)); g.stroke(); }
    for (const s2 of [-1, 1]) { const exx = fx + s2 * sep; g.beginPath(); g.arc(exx, ey + er * 0.55, er * 0.6, Math.PI * 0.25, Math.PI * 0.75); g.stroke();
      g.beginPath(); g.moveTo(fx + s2 * r * 0.2, ey + r * 0.42); g.quadraticCurveTo(fx + s2 * r * 0.34, ey + r * 0.6, fx + s2 * r * 0.3, ey + r * 0.76); g.stroke(); } }
  // nose
  g.strokeStyle = INK; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.arc(fx + r * 0.06 * f, ey + r * 0.32, r * 0.11, -Math.PI * 0.35 * f + (f < 0 ? Math.PI : 0), Math.PI * 0.6 * f + (f < 0 ? Math.PI : 0), f < 0); g.stroke();
  // mustache
  if (o.mustache) { g.fillStyle = o.mustacheColor || hc; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(fx + s * r * 0.17, ey + r * 0.5, r * 0.22, r * 0.09, s * 0.25, 0, Math.PI * 2); g.fill(); } }
  // mouth
  const mx = fx + r * 0.02 * f, my = ey + r * (o.mustache ? 0.72 : 0.62), talk = clamp(o.talk || 0);
  g.lineWidth = lw; g.strokeStyle = INK;
  if (talk > 0.06 || ex.mouth === 'o' || ex.mouth === 'O') {
    const open = ex.mouth === 'O' ? 0.34 : ex.mouth === 'o' ? 0.18 : 0.06 + 0.22 * talk, wd = ex.mouth === 'O' ? 0.26 : ex.mouth === 'o' ? 0.14 : 0.22;
    blob(g, g => g.ellipse(mx, my, r * wd, r * open, 0, 0, Math.PI * 2), '#7a1f24', lw);
    g.save(); g.beginPath(); g.ellipse(mx, my, r * wd, r * open, 0, 0, Math.PI * 2); g.clip(); g.fillStyle = '#e8606a'; g.beginPath(); g.ellipse(mx, my + r * open * 0.9, r * wd * 0.8, r * open * 0.6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.fillRect(mx - r * wd, my - r * open, r * wd * 2, r * open * 0.35); g.restore();
    g.lineWidth = lw; g.strokeStyle = INK; g.beginPath(); g.ellipse(mx, my, r * wd, r * open, 0, 0, Math.PI * 2); g.stroke();
  } else {
    g.beginPath();
    switch (ex.mouth) {
      case 'smile': g.arc(mx, my - r * 0.14, r * 0.22, 0.25 * Math.PI, 0.75 * Math.PI); break;
      case 'grin': blob(g, g => { g.moveTo(mx - r * 0.28, my - r * 0.05); g.quadraticCurveTo(mx, my + r * 0.38, mx + r * 0.28, my - r * 0.05); g.closePath(); }, '#7a1f24', lw); g.beginPath(); break;
      case 'frown': g.arc(mx, my + r * 0.16, r * 0.17, 1.25 * Math.PI, 1.75 * Math.PI); break;
      case 'smirk': g.moveTo(mx - r * 0.18, my); g.quadraticCurveTo(mx + r * 0.05, my + r * 0.06, mx + r * 0.22, my - r * 0.1); break;
      case 'wavy': for (let i = 0; i <= 12; i++) { const u = i / 12; g.lineTo(mx - r * 0.2 + u * r * 0.4, my + Math.sin(u * Math.PI * 2) * r * 0.05); } break;
      default: g.moveTo(mx - r * 0.15, my); g.lineTo(mx + r * 0.15, my);
    }
    g.stroke();
  }
  // hats
  if (o.hat === 'chef') { blob(g, g => { g.moveTo(x - r * 0.75, y - r * 0.62); g.lineTo(x - r * 0.8, y - r * 1.2); g.bezierCurveTo(x - r * 1.35, y - r * 1.5, x - r * 0.9, y - r * 2.3, x - r * 0.35, y - r * 2.0); g.bezierCurveTo(x - r * 0.2, y - r * 2.6, x + r * 0.5, y - r * 2.6, x + r * 0.45, y - r * 2.0); g.bezierCurveTo(x + r * 1.0, y - r * 2.3, x + r * 1.35, y - r * 1.5, x + r * 0.8, y - r * 1.2); g.lineTo(x + r * 0.75, y - r * 0.62); g.closePath(); }, '#ffffff', lw); g.strokeStyle = INK; g.lineWidth = lw; g.beginPath(); g.moveTo(x - r * 0.78, y - r * 0.95); g.lineTo(x + r * 0.78, y - r * 0.95); g.stroke(); }
  if (o.hat === 'cap') { blob(g, g => { g.ellipse(x, y - r * 0.45, r * 1.02, r * 0.75, 0, Math.PI, Math.PI * 2); g.closePath(); }, o.hatColor || '#2f5fb3', lw); blob(g, g => g.ellipse(x + r * 0.75 * f, y - r * 0.48, r * 0.65, r * 0.16, 0, 0, Math.PI * 2), o.hatColor || '#2f5fb3', lw); }
  g.restore();
}

// ---------- full character ----------
// character(g, {x, y, s, facing, pose, c: castEntry, expr, talk, blink, look, prop, propColor})
// cast entry: {skin, hair, hairColor, shirt, shirt2, pants, shoes, hat, hatColor, mustache, glasses, apron, belly, logo}
export function character(g, o) {
  const c = o.c || {}, s = o.s ?? 1, f = o.facing ?? 1, p0 = o.pose || POSES.stand;
  const P = (k) => [p0[k][0], p0[k][1]];
  g.save(); g.translate(o.x, o.y); g.scale(s * f, s);
  const skin = c.skin || SKIN.tan, shirt = c.shirt || '#ffffff', pants = c.pants || '#3b4a6b', shoes = c.shoes || '#2a2a2e';
  // shadow
  g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(0, 4, 70, 12, 0, 0, Math.PI * 2); g.fill();
  const hip = P('hip'), sh = P('sh');
  const leg = (k, ft) => { const kn = P(k), fo = P(ft); tube(g, [[hip[0] + (k === 'kF' ? 8 : -8), hip[1]], kn, fo], 30, pants); oval(g, fo[0] + 12, fo[1] - 6, 24, 12, shoes); };
  const arm = (e, h, back) => { const el = P(e), ha = P(h); const s0 = [sh[0] + (back ? -18 : 18), sh[1] + 14];
    tube(g, [s0, el], 24, c.sleeve === 'short' ? shirt : (c.sleeveColor || shirt)); tube(g, [el, ha], c.sleeve === 'short' ? 18 : 22, c.sleeve === 'short' ? skin : (c.sleeveColor || shirt));
    if (c.sleeve === 'short') tube(g, [s0, [lerp(s0[0], el[0], 0.7), lerp(s0[1], el[1], 0.7)]], 28, shirt);
    oval(g, ha[0], ha[1], 13, 13, skin); };
  // back limbs
  leg('kB', 'fB'); arm('eB', 'hB', true);
  // torso
  const bw = c.belly ? 56 : 44, hw = c.belly ? 52 : 40;
  blob(g, g => { g.moveTo(sh[0] - 40, sh[1] + 8); g.quadraticCurveTo(sh[0], sh[1] - 10, sh[0] + 40, sh[1] + 8);
    g.quadraticCurveTo(hip[0] + bw + 4, (sh[1] + hip[1]) / 2, hip[0] + hw, hip[1] + 6); g.lineTo(hip[0] - hw, hip[1] + 6);
    g.quadraticCurveTo(hip[0] - bw, (sh[1] + hip[1]) / 2, sh[0] - 40, sh[1] + 8); g.closePath(); }, shirt);
  if (c.apron) blob(g, g => { g.moveTo(sh[0] - 22, sh[1] + 24); g.lineTo(sh[0] + 22, sh[1] + 24); g.lineTo(hip[0] + 36, hip[1] + 30); g.lineTo(hip[0] - 36, hip[1] + 30); g.closePath(); }, c.apron);
  if (c.stripe) { g.fillStyle = c.stripe; g.fillRect(sh[0] - 4, sh[1] + 14, 8, hip[1] - sh[1] - 10); }
  if (c.logo) { g.save(); g.translate((sh[0] + hip[0]) / 2 + 10, (sh[1] + hip[1]) / 2); g.font = '700 14px "Nunito"'; g.textAlign = 'center'; g.fillStyle = c.logoColor || '#fff'; g.fillText(c.logo, 0, 0); g.restore(); }
  // collar
  if (c.collar) { polyO(g, [[sh[0] - 26, sh[1] + 2], [sh[0], sh[1] + 22], [sh[0] - 6, sh[1] + 34], [sh[0] - 30, sh[1] + 14]], c.collar, 4); polyO(g, [[sh[0] + 26, sh[1] + 2], [sh[0], sh[1] + 22], [sh[0] + 6, sh[1] + 34], [sh[0] + 30, sh[1] + 14]], c.collar, 4); }
  else { g.strokeStyle = INK; g.lineWidth = LW; g.beginPath(); g.moveTo(sh[0] - 14, sh[1] + 2); g.lineTo(sh[0], sh[1] + 16); g.lineTo(sh[0] + 14, sh[1] + 2); g.stroke(); }
  if (c.tie) polyO(g, [[sh[0] - 7, sh[1] + 14], [sh[0] + 7, sh[1] + 14], [sh[0] + 11, sh[1] + 66], [sh[0], sh[1] + 80], [sh[0] - 11, sh[1] + 66]], c.tie, 3.5);
  if (c.chain) { g.strokeStyle = '#f5c431'; g.lineWidth = 6; g.beginPath(); g.moveTo(sh[0] - 22, sh[1] + 6); g.quadraticCurveTo(sh[0], sh[1] + 52, sh[0] + 22, sh[1] + 6); g.stroke(); oval(g, sh[0], sh[1] + 34, 7, 9, '#f5c431', 3); }
  if (c.epaulette) for (const d of [-1, 1]) tube(g, [[sh[0] + d * 38, sh[1] + 10], [sh[0] + d * 18, sh[1] + 2]], 9, c.epaulette, 3.5);
  if (c.badge) badge(g, sh[0] + 20, sh[1] + 44, 1, c);
  leg('kF', 'fF');
  if (c.skirt) blob(g, g => { g.moveTo(hip[0] - 42, hip[1] - 6); g.lineTo(hip[0] + 42, hip[1] - 6); g.lineTo(hip[0] + 58, hip[1] + 50); g.lineTo(hip[0] - 58, hip[1] + 50); g.closePath(); }, c.skirt);
  // neck + head
  tube(g, [[sh[0], sh[1] + 4], [sh[0], sh[1] - 14]], 22, skin);
  const hd = P('head'); const hr = 58;
  head(g, hd[0] + 2, hd[1] - 38, hr, { ...c, expr: o.expr, talk: o.talk, blink: o.blink, look: o.look ? [o.look[0] * f, o.look[1]] : undefined, facing: 1, front: o.front });
  // front arm on top
  arm('eF', 'hF', false);
  if (o.prop) o.prop(g, P('hF'));
  g.restore();
}
// talking helper: mouth flap between t0..t1 (local seconds) — deterministic
export const flap = (t, t0 = 0, t1 = 1e9) => (t < t0 || t > t1 ? 0 : clamp(0.3 + 0.7 * Math.abs(Math.sin(t * 15)) * (0.6 + 0.4 * Math.sin(t * 4.7))));
export const blinkAt = (t, seed = 0) => ((t + seed * 1.37) % 3.4) > 3.27;

// crachá da empresa (cordão + cartão)
export function badge(g, x, y, k = 1, c = {}) {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.strokeStyle = c.lanyard || '#d6332b'; g.lineWidth = 4; g.beginPath(); g.moveTo(-26, -40); g.lineTo(0, -2); g.lineTo(-6, -42); g.stroke();
  box(g, -15, -2, 30, 38, '#ffffff', 3.5, 4); g.fillStyle = c.badgeColor || '#1f6fd1'; g.fillRect(-13, 0, 26, 10);
  g.fillStyle = '#c9b8a8'; g.fillRect(-10, 14, 10, 12); g.fillStyle = '#9aa'; g.fillRect(3, 15, 9, 3); g.fillRect(3, 21, 9, 3);
  g.restore();
}
// ---------- props ----------
export function coin(g, x, y, r, rot = 0) {
  const sx = Math.max(0.12, Math.abs(Math.cos(rot)));
  g.save(); g.translate(x, y); g.scale(sx, 1);
  oval(g, 0, 0, r, r, '#f5c431', Math.max(2, r * 0.14)); g.strokeStyle = '#c99410'; g.lineWidth = r * 0.12; g.beginPath(); g.arc(0, 0, r * 0.66, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#b5820a'; g.font = `700 ${r * 0.9}px "Fredoka"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('R$', 0, r * 0.05);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-r * 0.4, -r * 0.45, r * 0.18, r * 0.1, -0.6, 0, Math.PI * 2); g.fill();
  g.restore();
}
// glass of pingado (coffee with milk). level 0..1
export function glassCup(g, x, y, s = 1, level = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const top = -110, bw = 34, tw = 44;
  // liquid
  g.save(); g.beginPath(); g.moveTo(-bw, 0); g.lineTo(-tw, top); g.lineTo(tw, top); g.lineTo(bw, 0); g.closePath(); g.clip();
  const ly = lerp(0, top + 8, level); g.fillStyle = 'rgba(240,250,255,.9)'; g.fillRect(-60, top, 120, ly - top); g.fillStyle = '#8a5530'; g.fillRect(-60, ly, 120, -ly + 2); g.fillStyle = '#e2b98a'; g.fillRect(-60, ly, 120, 9); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-60, ly); g.lineTo(60, ly); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-tw + 8, top, 10, -top);
  g.restore();
  g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(-tw, top); g.lineTo(-bw, 0); g.lineTo(bw, 0); g.lineTo(tw, top); g.stroke();
  g.fillStyle = 'rgba(210,235,245,.25)'; g.beginPath(); g.moveTo(-tw, top); g.lineTo(-bw, 0); g.lineTo(bw, 0); g.lineTo(tw, top); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(-tw + 10, top + 8, 7, -top - 20);
  g.restore();
}
// speech/thought helpers
export function sign(g, x, y, w, h, lines, o = {}) {
  box(g, x - w / 2 - 10, y - h / 2 - 10, w + 20, h + 20, o.frame || '#8a5a32', 6, 8);
  box(g, x - w / 2, y - h / 2, w, h, o.bg || '#24302a', 5, 4);
  lines.forEach((l, i) => label(g, l, x, y - h / 2 + (i + 0.5) * (h / lines.length), { size: o.size || 54, color: o.color || '#f4f1e6', stroke: 0, font: 'Fredoka' }));
}

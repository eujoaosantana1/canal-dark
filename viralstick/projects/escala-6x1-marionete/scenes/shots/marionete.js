// Cena 'marionete' — personagens em peças (engine/marionete.js) sobre cenário pintado ou cenário do projeto.
// Copiar para projects/<projeto>/scenes/shots/. Parâmetros no plano.json:
//   { kind:'marionete', fundo:'cenarios/mercado.jpg' | set:'mercado', plano:'close'|'medio'|'inteiro', zoom:[1,1.06], desfoque:3, texto:'...',
//     chars:[ { m:'josi', quem:'JOSI', x:0.35, escala:1, plano:'medio', andar:{de:0.2, ate:0.7},
//               poses:[[0,'neutro'],['@banco','aponta_e']], olhar:[[0,'R']], expr:'sorri' }, {...} ] }
//   Com um personagem só, dá para pôr m/quem/x/poses/... direto nos params (sem 'chars').
import { E, registerShot, wordTime } from '/engine/core.js';
import { carregar, desenhar, poseEm, passo } from '/engine/marionete.js';
import { talkWho, WHO, pill, drawSet } from '../lib.js';

const MS = {}, FUNDOS = {};
const lista = E.shots.filter(s => s.params?.kind === 'marionete');
const personagens = p => (p.chars && p.chars.length ? p.chars : [p]);
for (const s of lista) {
  const p = s.params;
  for (const c of personagens(p)) if (c.m && !MS[c.m]) MS[c.m] = await carregar(c.m);
  if (p.fundo && !FUNDOS[p.fundo]) { const i = new Image(); i.src = '/project/' + p.fundo; try { await i.decode(); FUNDOS[p.fundo] = i; } catch { FUNDOS[p.fundo] = null; } }
}

const PLANOS = { close: [0.70, 1.13], medio: [0.47, 1.0], inteiro: [0.19, 0.69] };   // [altura do tronco / H, cintura / H]
const pop = (t, t0, d = 0.3) => (t < t0 ? 0 : t > t0 + d ? 1 : 1 + 0.15 * Math.sin(((t - t0) / d) * Math.PI) - (1 - (t - t0) / d) * 0.9);

function resolver(lst, t0) {   // [['@palavra', x]] -> tempo local
  return (lst || []).map(([t, v]) => [typeof t === 'string' && t.startsWith('@') ? (wordTime(t.slice(1), t0) ?? 1e9) - t0 : t, v]).sort((a, b) => a[0] - b[0]);
}

function boneco(g, t, info, p, c, i) {
  const m = MS[c.m]; if (!m) return;
  const t0 = info.globalT - t, dur = info.dur;
  const plano = c.plano || p.plano || 'medio'; let [fa, fc] = PLANOS[plano]; const esc = c.escala || 1;
  if (esc !== 1) { const base = plano === 'inteiro' ? fc + fa * 1.05 : fc; fa *= esc; if (plano === 'inteiro') fc = base - fa * 1.05; }
  const anda = c.andar ? Math.min(1, t / dur) : null;
  const x = E.W * (c.andar ? c.andar.de + (c.andar.ate - c.andar.de) * anda : (c.x ?? 0.5));
  const quem = WHO[c.quem || c.m.toUpperCase()], fala = talkWho(quem, info.globalT);
  let cab = c.cab || 'F'; for (const [tt, v] of resolver(c.olhar, t0)) if (tt <= t) cab = v;
  desenhar(g, m, x, E.H * fc, E.H * fa, { t: t + i * 0.7, pose: poseEm(t, resolver(c.poses, t0)), cab, expr: c.expr || '', fala,
    pisca: ((t + (c.seed ?? i * 1.3)) % 3.3) < 0.12, inteiro: plano === 'inteiro', passo: c.andar ? passo(t) : null, incl: c.incl || 0 });
}

function cena(g, t, info, p) {
  const dur = info.dur;
  const [z0, z1] = p.zoom || [1.0, 1.06], z = z0 + (z1 - z0) * Math.min(1, t / Math.max(0.1, dur));
  if (p.fundo && FUNDOS[p.fundo]) {
    const im = FUNDOS[p.fundo], k = Math.max(E.W / im.width, E.H / im.height) * z;
    g.save(); if (p.desfoque) g.filter = `blur(${p.desfoque}px)`;
    g.drawImage(im, (E.W - im.width * k) / 2 + (p.pan || 0) * t, (E.H - im.height * k) / 2, im.width * k, im.height * k); g.restore();
  } else if (p.set) { g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); drawSet(g, p.set, t); g.restore(); }
  personagens(p).forEach((c, i) => boneco(g, t, info, p, c, i));
  if (p.texto) pill(g, E.W / 2, 110, p.texto, Math.max(0, pop(t, p.textoEm ?? 0.3)), p.texto.length > 16 ? { size: 58 } : {});
}

for (const s of lista) registerShot(s.id, { draw: (g, t, info) => cena(g, t, info, s.params) });

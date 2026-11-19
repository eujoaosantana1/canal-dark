// engine/marionete.js — personagens em PEÇAS (PNG) no traço das capas, animados por código.
// Peças e pivôs em /marionetes/<nome>/ (gerados por tools/marionete.py). Coordenadas locais = pixels da peça do tronco.
// Ângulos de braço/perna: positivo = para FORA do corpo (os dois lados); cotovelo/joelho somam ao ângulo de cima.

const CACHE = {};
const PECAS = ['tronco', 'umero', 'ante_solto', 'ante_aponta', 'ante_palma', 'cab_frente', 'cab_frente_meia', 'cab_frente_aberta',
  'cab_frente_pisca', 'cab_frente_sorri', 'cab_lado', 'cab_lado_aberta', 'quadril', 'coxa', 'canela'];

async function img(url) { const i = new Image(); i.src = url; try { await i.decode(); return i; } catch { return null; } }

export async function carregar(nome) {
  if (CACHE[nome]) return CACHE[nome];
  const base = `/marionetes/${nome}/`;
  const rig = await (await fetch(base + 'rig.json')).json();
  const p = {}; await Promise.all(PECAS.map(async k => { p[k] = await img(base + k + '.png'); }));
  if (!p.tronco) throw new Error(`marionete ${nome}: sem tronco.png`);
  return (CACHE[nome] = { nome, rig, p });
}

// [peça do antebraço, ombro, cotovelo]
export const POSES = {
  neutro: { e: ['solto', 10, -6], d: ['solto', 10, -6] },
  explica: { e: ['palma', 35, 90], d: ['solto', 10, -6] },
  explica_d: { e: ['solto', 10, -6], d: ['palma', 35, 90] },
  abre: { e: ['palma', 35, 90], d: ['palma', 35, 90] },
  encolhe: { e: ['palma', 22, 105], d: ['palma', 22, 105] },
  aponta_e: { e: ['aponta', 75, 10], d: ['solto', 10, -6] },
  aponta_d: { e: ['solto', 10, -6], d: ['aponta', 75, 10] },
  aponta_cima: { e: ['aponta', 150, 8], d: ['solto', 10, -6] },
  comemora: { e: ['palma', 70, 85], d: ['palma', 70, 85] },
  cintura: { e: ['solto', 32, -118], d: ['solto', 32, -118] },
  acena: { e: ['palma', 115, 40], d: ['solto', 10, -6], acena: 'e' },
};

const sm = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const lerp = (a, b, k) => a + (b - a) * k;

// interpola entre a pose anterior e a atual da lista [[t, nome], ...] (t local em s)
export function poseEm(t, lista, trans = 0.38) {
  if (!lista || !lista.length) return { ...POSES.neutro, k: 1 };
  let i = 0; for (let j = 0; j < lista.length; j++) if (lista[j][0] <= t) i = j;
  const cur = POSES[lista[i][1]] || POSES.neutro, ant = i > 0 ? POSES[lista[i - 1][1]] || POSES.neutro : cur;
  const u = i > 0 ? sm((t - lista[i][0]) / trans) : 1;
  const mix = l => [u > 0.5 ? cur[l][0] : ant[l][0], lerp(ant[l][1], cur[l][1], u), lerp(ant[l][2], cur[l][2], u)];
  return { e: mix('e'), d: mix('d'), acena: u > 0.5 ? cur.acena : ant.acena };
}

function peca(g, im, jx, jy, ang, k, espelho = false, cima = false) {
  if (!im) return;
  const w = im.width * k, h = im.height * k;
  g.save(); g.translate(jx, jy); g.rotate(ang * Math.PI / 180); if (espelho) g.scale(-1, 1);
  g.drawImage(im, -w / 2, cima ? -h : 0, w, h); g.restore();
}

// o: { pose:{e,d,acena}, cab:'F'|'L'|'R', expr:'sorri', fala:0..1, pisca, incl, inteiro:bool, passo: fase(rad) ou null, t }
export function desenhar(g, m, x, cintura, altTronco, o = {}) {
  const { p, rig } = m, T = p.tronco, s = altTronco / T.height, t = o.t || 0;
  g.save(); g.translate(x, cintura); g.scale(s, s); g.translate(-T.width / 2, -T.height);   // origem = canto do tronco
  const ombro = l => (l === 'e' ? rig.ombro_e : rig.ombro_d);
  const ku = rig.umero * T.height / p.umero.height;
  const anda = o.passo != null;
  const bob = anda ? -Math.abs(Math.sin(o.passo)) * T.height * 0.025 : Math.sin(t * 2.2) * T.height * 0.004;
  // ---- pernas (atrás do quadril)
  if (o.inteiro && p.quadril) {
    const kq = rig.quadril_larg * T.width / p.quadril.width, qx = T.width * 0.5, qy = T.height * rig.quadril[1];
    const kc = rig.coxa * T.height / p.coxa.height;
    for (const l of ['e', 'd']) {
      const sg = l === 'e' ? -1 : 1, fase = anda ? Math.sin(o.passo + (l === 'e' ? 0 : Math.PI)) : 0, lev = Math.max(0, fase);
      const hx = qx + sg * p.quadril.width * kq * rig.perna_dx * 1.0, hy = qy + p.quadril.height * kq * 0.28;
      const a1 = -sg * (4 + 6 * lev), a2 = sg * 38 * lev;      // coxa abre um pouco; joelho dobra pra dentro ao levantar o pé
      const L = p.coxa.height * kc * rig.joelho, jx = hx - L * Math.sin(a1 * Math.PI / 180), jy = hy + L * Math.cos(a1 * Math.PI / 180) - lev * T.height * 0.05;
      peca(g, p.canela, jx, jy, a1 + a2, kc, l === 'e');
      peca(g, p.coxa, hx, hy - lev * T.height * 0.05, a1, kc, l === 'e');
    }
    peca(g, p.quadril, qx, qy - T.height * 0.02, 0, kq);
  }
  g.translate(0, bob);
  // ---- braços (atrás do tronco: a manga cobre a junta)
  for (const l of ['e', 'd']) {
    const [ante, a, c] = o.pose[l]; const sg = l === 'e' ? 1 : -1;
    let ang = a, cot = c;
    if (anda && !o.pose.acena) { const bal = Math.sin(o.passo + (l === 'e' ? Math.PI : 0)) * 8; ang += bal; }
    if (o.pose.acena === l) cot += Math.sin(t * 9) * 22;
    ang += (o.fala || 0) * 5; cot += (o.fala || 0) * 9;
    const [ox, oy] = ombro(l), jx = T.width * ox, jy = T.height * oy;
    const L = p.umero.height * ku * rig.cotovelo, r = sg * ang * Math.PI / 180;
    const ex = jx - L * Math.sin(r), ey = jy + L * Math.cos(r);
    peca(g, p['ante_' + ante], ex, ey, sg * (ang + cot), ku, l === 'd');
    peca(g, p.umero, jx, jy, sg * ang, ku, l === 'd');
  }
  g.drawImage(T, 0, 0);
  // ---- cabeça (pivô no fim do pescoço)
  const fala = o.fala || 0, lado = o.cab === 'L' || o.cab === 'R';
  let ck;
  if (lado) ck = fala > 0.2 ? 'cab_lado_aberta' : 'cab_lado';
  else if (o.pisca && fala < 0.15) ck = 'cab_frente_pisca';
  else if (fala > 0.55) ck = 'cab_frente_aberta';
  else if (fala > 0.15) ck = 'cab_frente_meia';
  else ck = o.expr === 'sorri' ? 'cab_frente_sorri' : 'cab_frente';
  const C = p[ck] || p.cab_frente, kc = rig.cabeca * T.width / p.cab_frente.width;
  const incl = (o.incl || 0) + (fala ? Math.sin(t * 5.1) * 3 * fala : Math.sin(t * 1.1) * 0.8);
  peca(g, C, T.width * rig.pescoco[0], T.height * rig.pescoco[1], incl, kc, o.cab === 'R', true);
  g.restore();
}

// fase do passo para quem anda (passos por segundo)
export const passo = (t, pps = 1.8) => t * pps * Math.PI;

// lib.js — utilidades do projeto: elenco, boca sincronizada por personagem, closes, cenas genéricas, cartões.
import { E, registerShot, layer, blurLayer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { POSES, posesAt, breathe } from '/engine/rig2d.js';
import { character, head, label, box, blob, oval, polyO, tube, badge, blinkAt, INK } from '/engine/toon.js';
import * as C from './cast.js';
import * as M from './sets/mundo.js';
import { backWall, counter } from './sets/padaria.js';
import * as MJ from './sets/mercadinho.js';
import * as L from './sets/luz.js';
import * as F from './sets/feriado.js';
import * as PF from './sets/pao.js';
import * as NV from './sets/neve.js';
import * as SM from './sets/salario.js';

export const CAST = { VALDIR: C.VALDIR, VALDIR_CASA: C.VALDIR_CASA, NENE: C.NENE, BIA: C.BIA, BIA_OCULOS: C.BIA_OCULOS, MARQUINHOS: C.MARQUINHOS, CIDA: C.CIDA, CONTADOR: C.CONTADOR, FRENTISTA: C.FRENTISTA, CAIXA: C.CAIXA, ATENDENTE: C.ATENDENTE, VOCE: C.VOCE,
  JURA: C.JURA, DUDA: C.DUDA, THIAGO: C.THIAGO, TECNICO: C.TECNICO, LURDES: C.LURDES, MOTOBOY: C.MOTOBOY, MOTORISTA: C.MOTORISTA, CLIENTE: C.CLIENTE,
  NEIDE: C.NEIDE, GUI: C.GUI, MARCAO: C.MARCAO, ENERGIA: C.ENERGIA, DISTRIB: C.DISTRIB, TRANSM: C.TRANSM, ENCARGO: C.ENCARGO, IMPOSTO: C.IMPOSTO, GATO: C.GATO,
  ROSE: C.ROSE, ROSE_CASA: C.ROSE_CASA, LARA: C.LARA, FABIO: C.FABIO, FABIO_PRAIA: C.FABIO_PRAIA, ZE: C.ZE, GABRIEL: C.GABRIEL, LUC: C.LUC, CHIQUINHA: C.CHIQUINHA, CHIQUINHA_FRIO: C.CHIQUINHA_FRIO, ARLINDO: C.ARLINDO, ARLINDO_CALOR: C.ARLINDO_CALOR, TAINA: C.TAINA, TAINA_CASA: C.TAINA_CASA, DAVI: C.DAVI, ADEMIR: C.ADEMIR };
export const WHO = { VALDIR: 'valdir', VALDIR_CASA: 'valdir', NENE: 'seu_nene', BIA: 'bia', BIA_OCULOS: 'bia', MARQUINHOS: 'marquinhos', CIDA: 'dona_cida', CONTADOR: 'contador', FRENTISTA: 'frentista', CAIXA: 'caixa', ATENDENTE: 'atendente',
  JURA: 'seu_jura', DUDA: 'duda', THIAGO: 'thiago', TECNICO: 'tecnico', LURDES: 'dona_lurdes', MOTOBOY: 'motoboy', MOTORISTA: 'motorista', CLIENTE: 'cliente',
  NEIDE: 'dona_neide', GUI: 'gui', MARCAO: 'marcao', ENERGIA: 'energia', DISTRIB: 'distribuicao', TRANSM: 'transmissao', ENCARGO: 'encargo', IMPOSTO: 'imposto', GATO: 'gato',
  ROSE: 'rose', ROSE_CASA: 'rose', LARA: 'lara', FABIO: 'fabio', FABIO_PRAIA: 'fabio', ZE: 'seu_ze', GABRIEL: 'gabriel', LUC: 'luc', CHIQUINHA: 'chiquinha', CHIQUINHA_FRIO: 'chiquinha', ARLINDO: 'arlindo', ARLINDO_CALOR: 'arlindo', TAINA: 'taina', TAINA_CASA: 'taina', DAVI: 'davi', ADEMIR: 'seu_ademir' };
const SCALE = { LARA: 0.74, NEIDE: 0.93, BIA: 0.72, BIA_OCULOS: 0.72, CIDA: 0.92, DUDA: 0.76, DAVI: 0.66, LURDES: 0.92 };

// boca: mexe só se aquele personagem estiver falando agora
export function talkWho(who, gt) {
  if (!who) return 0;
  for (const w of E.words) { if (w.start > gt + 0.05) break; if (w.who === who && gt >= w.start - 0.03 && gt <= w.end + 0.03) return clamp(0.3 + 0.7 * Math.abs(Math.sin(gt * 15)) * (0.6 + 0.4 * Math.sin(gt * 4.7))); }
  return 0;
}
export const speaking = (who, gt) => E.words.some(w => w.who === who && gt >= w.start - 0.1 && gt <= w.end + 0.25);
const nrm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
// tempo local (s) da palavra dentro do plano; fallback se não achar
export function wl(info, match, fb = 0, nth = 0) {
  const m = nrm(match), s0 = info.shot.start - 0.2, s1 = info.shot.end + 0.2; let k = 0;
  for (const w of E.words) { if (w.start < s0) continue; if (w.start > s1) break; if (nrm(w.word).startsWith(m)) { if (k++ === nth) return w.start - info.shot.start; } }
  return fb;
}
export const pop = (t, t0, d = 0.35) => ease.outBack(prog(t, t0, t0 + d));
export const fadeIn = (t, t0, d = 0.3) => ease.out(prog(t, t0, t0 + d));
export function push(g, t, info, z0 = 1, z1 = 1.08, cx = 0, cy = 0) { const z = key(t, [[0, z0], [info.dur, z1]]); g.translate(E.W / 2 + cx, E.H / 2 + cy); g.scale(z, z); g.translate(-E.W / 2 - cx, -E.H / 2 - cy); }
export const bg = (g, c) => { g.fillStyle = c; g.fillRect(-200, -200, E.W + 400, E.H + 400); };
export function rays(g, t, c1 = '#ffcf3a', c2 = '#ffe07a', cx = E.W / 2, cy = E.H * 0.45) { bg(g, c1); g.save(); g.translate(cx, cy); g.rotate(t * 0.12); g.fillStyle = c2; for (let i = 0; i < 18; i++) { g.rotate(Math.PI / 9); g.beginPath(); g.moveTo(0, 0); g.lineTo(1700, -150); g.lineTo(1700, 150); g.closePath(); g.fill(); } g.restore(); }
export function pill(g, x, y, str, k = 1, o = {}) { if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(k, k); g.font = `700 ${o.size || 72}px "Fredoka"`; const w = g.measureText(str).width + (o.pad || 70); box(g, -w / 2, -(o.h || 62), w, (o.h || 62) * 2, o.bg || '#e53935', 8, 20); label(g, str, 0, 5, { size: o.size || 72, color: o.color || '#fff', stroke: 0 }); g.restore(); }
export function bigText(g, x, y, str, k = 1, o = {}) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); label(g, str, 0, 0, { size: o.size || 150, color: o.color || '#fff', stroke: o.stroke ?? (o.size || 150) * 0.15 }); g.restore(); }

// ---------- cenários por nome ----------
export function drawSet(g, name, t = 0, o = {}) {
  switch (name) {
    case 'padaria': backWall(g); break;
    case 'sala': M.sala(g, o); break;
    case 'sala_noite': M.sala(g, { ...o, night: true }); break;
    case 'quintal': M.quintal(g, t); break;
    case 'rua': M.rua(g, o); break;
    case 'rua_noite': M.rua(g, { ...o, night: true }); break;
    case 'ceu': M.ceu(g, t); break;
    case 'posto': M.posto(g); break;
    case 'mercado': M.mercado(g); break;
    case 'postoSaude': M.postoSaude(g); break;
    case 'escola': M.escola(g); break;
    case 'otica': M.otica(g); break;
    case 'mercadinho': MJ.interior(g, o); break;
    case 'mercadinho_fora': MJ.fachada(g, o); break;
    case 'mercadinho_qr': MJ.fachada(g, { ...o, qr: 1 }); break;
    case 'mercadinho_noite': MJ.fachada(g, { ...o, night: true }); break;
    case 'suporte': M.ceu(g, t); MJ.monitores(g, t, o); break;
    case 'reparticao': { const old = globalThis.PLACA_CEU; globalThis.PLACA_CEU = 'REPARTIÇÃO DO UNIVERSO'; M.ceu(g, t); globalThis.PLACA_CEU = old; break; }
    case 'casa': L.casa(g, t, o); break;
    case 'casa_noite': L.casa(g, t, { ...o, night: true, led: o.led ?? true }); break;
    case 'muro': L.muro(g, t, o); break;
    case 'muro_off': L.muro(g, t, { ...o, off: true, semGato: true }); break;
    case 'banheiro': L.banheiro(g, t, o); break;
    case 'loja': F.loja(g, t, o); break;
    case 'praca_sol': NV.praca(g, t, o); break;
    case 'praca_neve': NV.praca(g, t, { ...o, neve: true }); break;
    case 'urupema': NV.urupema(g, t, o); break;
    case 'urupema_vazia': NV.urupema(g, t, { ...o, vagas: true }); break;
    case 'urupema_lotada': NV.urupema(g, t, { ...o, lotado: true }); break;
    case 'casa_fria': M.sala(g, { box: false }); NV.frio(g, t); break;
    case 'cafezal': NV.cafezal(g, t, o); break;
    case 'cafezal_geada': NV.cafezal(g, t, { ...o, geada: true }); break;
    case 'rua_padarias': PF.ruaPadarias(g, t, o); break;
    case 'rua_padarias_fila': PF.ruaPadarias(g, t, { ...o, fila: 'maison' }); break;
    case 'paris': PF.paris(g, t, o); break;
    case 'paris_fila': PF.paris(g, t, { ...o, fila: true }); break;
    case 'padaria_noite': backWall(g); g.fillStyle = 'rgba(15,15,50,.45)'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); break;
    case 'comodo': SM.comodo(g, t, o); break;
    case 'comodo_noite': SM.comodo(g, t, { ...o, night: true }); break;
    case 'paulista': SM.paulista(g, t, o); break;
    case 'ponto': SM.ponto(g, t, o); break;
    case 'ponto_bus': SM.ponto(g, t, { ...o, bus: 2300 - (t * 700) % 3600 }); break;
    case 'mercearia': MJ.interior(g, o); break;
    case 'outdoor': F.outdoor(g, t, o); break;
    case 'casa_rose': F.casaRose(g, t, o); break;
    case 'casa_rose_noite': F.casaRose(g, t, { ...o, night: true }); break;
    case 'praia': F.praia(g, t, o); break;
    case 'praia_vazia': F.praia(g, t, { ...o, vazia: true }); break;
    case 'praia_cheia': F.praia(g, t, { ...o, cheia: true }); break;
    default: bg(g, '#f7e3a6');
  }
}
// ---------- personagem com boca/olhos automáticos ----------
export function person(g, ch, t, info) {
  const k = ch.casa && ch.k === 'VALDIR' ? 'VALDIR_CASA' : ch.k, c = ch.c || CAST[k];
  const s = (ch.s || 2.3) * (SCALE[k] || 1);
  let pose = ch.pose ? (typeof ch.pose === 'string' ? POSES[ch.pose] || POSES.stand : ch.pose) : POSES.relaxed;
  if (ch.poses) pose = posesAt(t, ch.poses);
  const who = WHO[k], gt = info.globalT;
  const talking = speaking(who, gt);
  if (!ch.pose && !ch.poses && talking) pose = posesAt(t, [[0, 'relaxed'], [0.2, 'talk']]);
  character(g, { x: ch.x, y: ch.y ?? 1000, s, facing: ch.facing ?? 1, c, pose: breathe(pose, t, 1, ch.x % 7), expr: ch.expr || (talking ? 'smile' : 'neutral'), talk: talkWho(who, gt), blink: blinkAt(t, ch.x % 5), look: ch.look, prop: ch.propFn });
}
// ---------- close (busto) ----------
export function bust(g, x, y, r, c, o = {}) {
  blob(g, g => { g.moveTo(x - r * 1.55, E.H + 400); g.bezierCurveTo(x - r * 1.5, y + r * 1.2, x - r * 0.8, y + r * 1.0, x, y + r * 1.0); g.bezierCurveTo(x + r * 0.8, y + r * 1.0, x + r * 1.5, y + r * 1.2, x + r * 1.55, E.H + 400); g.closePath(); }, c.shirt, r * 0.05);
  if (c.apron) blob(g, g => { g.moveTo(x - r * 0.6, y + r * 1.3); g.lineTo(x + r * 0.6, y + r * 1.3); g.lineTo(x + r * 0.8, E.H + 400); g.lineTo(x - r * 0.8, E.H + 400); g.closePath(); }, c.apron, r * 0.05);
  if (c.tie) polyO(g, [[x - r * 0.1, y + r * 1.05], [x + r * 0.1, y + r * 1.05], [x + r * 0.16, y + r * 1.9], [x, y + r * 2.1], [x - r * 0.16, y + r * 1.9]], c.tie, r * 0.04);
  if (c.chain) { g.strokeStyle = '#f5c431'; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(x - r * 0.4, y + r * 1.0); g.quadraticCurveTo(x, y + r * 1.7, x + r * 0.4, y + r * 1.0); g.stroke(); }
  if (c.collar) for (const d of [-1, 1]) blob(g, g => { g.moveTo(x + d * r * 0.3, y + r * 0.95); g.lineTo(x + d * r * 0.05, y + r * 1.45); g.lineTo(x + d * r * 0.62, y + r * 1.25); g.closePath(); }, c.collar, r * 0.04);
  if (c.badge) badge(g, x + r * 0.62, y + r * 1.75, r / 70, c);
  blob(g, g => g.rect(x - r * 0.28, y + r * 0.7, r * 0.56, r * 0.4), c.skin, r * 0.05);
  head(g, x, y, r, { ...c, ...o });
}
export function closeShot(g, t, info, p) {
  const k = p.casa && p.k === 'VALDIR' ? 'VALDIR_CASA' : p.k, c = CAST[k], who = WHO[k];
  const R = p.side === 'R' ? 1 : -1;
  blurLayer(g, 8, g => drawSet(g, p.set, t, { box: true }), { z: 1.6, x: 360 * -R, y: 60 }, 1);
  if (p.set === 'sala_noite' || p.set === 'rua_noite' || p.set === 'casa_noite') { g.fillStyle = 'rgba(10,10,40,.35)'; g.fillRect(0, 0, E.W, E.H); }
  const z = key(t, [[0, 1.0], [info.dur, 1.06]]);
  const r = p.k === 'LARA' ? 180 : p.k === 'NENE' || p.k === 'JURA' || p.k === 'ZE' || p.k === 'LUC' ? 190 : p.k === 'CONTADOR' || p.k === 'TECNICO' ? 200 : (k.startsWith('BIA') || k === 'DUDA' || k === 'DAVI' ? 185 : 220);
  g.save(); g.translate(E.W * (0.5 + 0.08 * R), E.H * (['NENE', 'CONTADOR', 'JURA', 'TECNICO', 'ZE', 'LUC'].includes(p.k) ? 0.56 : 0.47)); g.scale(z, z); g.rotate(Math.sin(t * 1.2) * 0.012);
  bust(g, 0, 0, r, c, { expr: p.expr, talk: talkWho(who, info.globalT), blink: blinkAt(t, 3), look: p.look || [-R * 0.55, 0.05] });
  if (p.fone || p.k === 'TECNICO') MJ.headset(g, 0, 0, r);
  g.restore();
  if (p.q) { const q = pop(t, info.dur * 0.45); if (q > 0) { g.save(); g.translate(E.W * (0.5 - 0.3 * R), E.H * 0.25); g.scale(q, q); label(g, '?', 0, 0, { size: 220, color: '#ffd23f', stroke: 22 }); g.restore(); } }
  if (p.texto) { const longo = p.texto.length > 13; pill(g, longo ? E.W / 2 : E.W * (0.5 - 0.28 * R), longo ? 110 : E.H * 0.2, p.texto, pop(t, 0.3), longo ? { size: 58 } : {}); }
}
// cena genérica: cenário + personagens + objeto da frente
export function cenaShot(g, t, info, p) {
  g.save(); push(g, t, info, ...(p.z || [1.0, 1.07]), p.x || 0, p.y || 0);
  drawSet(g, p.set, t, { lamps: p.lamps });
  if (p.hilux) M.hilux(g, 1650, 1000, 1.2, { facing: -1 });
  if (p.bomba) M.bomba(g, 900, 1000, 1.25, '254,80');
  const chars = p.chars || [];
  const back = chars.filter(c => c.back), front = chars.filter(c => !c.back);
  if (p.set === 'padaria') { back.concat(front.filter(c => c.k === 'NENE')).forEach(ch => person(g, { ...ch, y: ch.y ?? 960 }, t, info)); counter(g); front.filter(c => c.k !== 'NENE').forEach(ch => person(g, ch, t, info)); }
  else {
    if (p.balcao) { chars.filter(c => c.y).forEach(ch => person(g, ch, t, info)); M.balcaoSaude(g, 1000); chars.filter(c => !c.y).forEach(ch => person(g, ch, t, info)); }
    else if (p.caixa) { chars.filter(c => c.k === 'CAIXA').forEach(ch => person(g, { ...ch, y: 980 }, t, info)); M.caixaMercado(g, 1260, 1000); chars.filter(c => c.k !== 'CAIXA').forEach(ch => person(g, ch, t, info)); }
    else if (p.set === 'mercadinho') { chars.filter(c => c.back).forEach(ch => person(g, { ...ch, y: ch.y ?? 960 }, t, info)); MJ.balcao(g, t, p); chars.filter(c => !c.back).forEach(ch => person(g, ch, t, info)); }
    else { chars.forEach(ch => { person(g, ch, t, info); if (ch.prop === 'box') M.shoebox(g, ch.x + 150, 930, 0.9, { open: true }); }); if (p.mesa) M.mesaChurrasco(g, 960, 1080); }
  }
  g.restore();
  if (p.texto) pill(g, E.W / 2, 150, p.texto, pop(t, 0.3));
}
export { M, MJ, L, F, PF, NV, SM, POSES, posesAt, breathe };

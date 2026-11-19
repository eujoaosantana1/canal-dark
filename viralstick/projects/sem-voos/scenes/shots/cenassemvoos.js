// cenassemvoos.js — cenas do vídeo 12 ("E se todos os voos do Brasil fossem cancelados?")
// tela do Suporte fixa SÓ para este vídeo (outros arquivos de cenas tentam trocar; o setter ignora)
const TELA12 = ['PEDIDO 2026/1114', 'UMA SEMANA', 'SEM AVIÃO'];
Object.defineProperty(globalThis, 'TELA_SUPORTE', { get: () => TELA12, set: () => {}, configurable: true });
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng, shake } from '/engine/core.js';
import { character, head, label, box, oval, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, wl, pop, push, bg, rays, pill, bigText, drawSet, person, M, SV, POSES, posesAt, breathe } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);
const fmt = v => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const chars = (g, t, info, p) => (p.chars || []).forEach(ch => person(g, ch, t, info));
const txt = (g, t, info, p, y = 130, cor = '#e53935') => { if (p.texto) pill(g, E.W / 2, p.textoY || y, p.texto, pop(t, at(info, p.textoEm, 0.4)), { bg: p.textoCor || cor, size: p.textoTam || 58 }); };
function fundo(g, t, f) {
  if (!f || f === 'rays') return rays(g, t);
  if (f === 'rays_azul') return rays(g, t, '#1e88e5', '#42a5f5');
  if (f === 'rays_vermelho') return rays(g, t, '#c62828', '#e53935');
  if (f.startsWith('#')) return bg(g, f);
  blurLayer(g, 8, g => drawSet(g, f, t, {}), { z: 1.3 }, 1); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 0, E.W, E.H);
}

const K = {
  // painel de embarque: linhas viram CANCELADO a partir da palavra p.em. p.vermelho, p.chars (na frente), p.texto
  painel(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.07]));
    const t0 = at(info, p.em, 0.2), k = p.vermelho ? 1 : (p.de ?? 0) + (1 - (p.de ?? 0)) * clamp(prog(t, t0, t0 + Math.max(0.8, Math.min(2.2, info.dur * 0.5))));
    drawSet(g, 'painel_voos', t, { k, vermelho: p.vermelho, destinos: p.destinos });
    chars(g, t, info, p);
    g.restore(); txt(g, t, info, p, 1000);
  },
  // mapa com rotas que somem (modo brasil), cinzas (europa) ou aviões indo para Gander (atlantico). p.apagarEm, p.rotulos, p.texto, p.texto2
  rotas(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]));
    const t0 = at(info, p.apagarEm, p.modo === 'brasil' ? info.dur * 0.4 : 0.2);
    const k = p.modo === 'brasil' ? (p.apagado ? 1 : clamp(prog(t, t0, t0 + 1.6))) : clamp(prog(t, t0, t0 + Math.max(1.2, info.dur * 0.75)));
    drawSet(g, 'mapa', t, { modo: p.modo || 'brasil', k, rotulos: p.rotulos, cidades: p.cidades, rotas: p.rotas, x: p.mx, y: p.my, s: p.ms });
    g.restore();
    if (p.texto) pill(g, p.tx || 1500, p.ty || 160, p.texto, pop(t, at(info, p.textoEm, 0.4)), { bg: p.textoCor || '#e53935', size: 56 });
    if (p.texto2) pill(g, p.tx || 1500, (p.ty || 160) + 150, p.texto2, pop(t, at(info, p.texto2Em, 1.2)), { bg: '#212121', size: 50 });
  },
  // número que sobe com ícones. p.ate, p.de, p.pre, p.suf, p.rotulo, p.icone ('aviao'|'pessoa'|'caixa'), p.n (ícones), p.risca (X vermelho)
  contador_voos(g, t, info, p) {
    fundo(g, t, p.fundo || '#0d1b4c');
    const n = p.n ?? 0, q = ease.out(prog(t, 0.15, Math.min(1.8, info.dur * 0.6)));
    for (let i = 0; i < n; i++) { const c = i % 10, r = Math.floor(i / 10), x = 240 + c * 160, y = 640 + r * 110, k = pop(t, 0.2 + i * 0.04); if (k <= 0) continue;
      g.save(); g.translate(x, y); g.scale(k, k);
      if (p.icone === 'pessoa') { box(g, -34, -18, 68, 74, '#90caf9', 5, 30); oval(g, 0, -46, 28, 28, '#90caf9', 5); }
      else if (p.icone === 'caixa') SV.caixaOrgao(g, 0, 40, 0.28);
      else SV.aviao(g, 0, 0, 0.22);
      if (p.risca && t > at(info, p.riscaEm, info.dur * 0.6) + i * 0.02) { g.strokeStyle = '#e53935'; g.lineWidth = 10; g.beginPath(); g.moveTo(-50, -45); g.lineTo(50, 45); g.moveTo(50, -45); g.lineTo(-50, 45); g.stroke(); }
      g.restore(); }
    const v = lerp(p.de ?? 0, p.ate, q); const s = p.dec ? v.toFixed(p.dec).replace('.', ',') : fmt(v);
    bigText(g, E.W / 2, n ? 300 : E.H / 2 - 40, (p.pre || '') + s + (p.suf || ''), pop(t, 0.05), { size: p.tam || 170, color: p.cor || '#ffd23f' });
    if (p.rotulo) pill(g, E.W / 2, n ? 470 : E.H / 2 + 160, p.rotulo, pop(t, at(info, p.rotuloEm, 0.4)), { bg: '#212121', size: 54 });
  },
  // hospital: caixa de transplante + relógio correndo. p.h0, p.h1 (horas), p.chars, p.limite (horas que o coração aguenta), p.estrada (mostra comparação)
  relogio_orgao(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]));
    const h = lerp(p.h0 ?? 0, p.h1 ?? 4, ease.inOut(prog(t, 0.2, info.dur * 0.9)));
    drawSet(g, 'hospital', t, { horas: h, semRelogio: true });
    chars(g, t, info, p);
    // carrinho com a caixa
    box(g, 820, 820, 320, 30, '#90a4ae', 5, 6); tube(g, [[850, 850], [850, 960]], 12, '#607d8b'); tube(g, [[1110, 850], [1110, 960]], 12, '#607d8b'); oval(g, 850, 975, 18, 18, '#424242', 4); oval(g, 1110, 975, 18, 18, '#424242', 4);
    SV.caixaOrgao(g, 980, 820, 0.95);
    g.restore();
    // relógio grande
    const k = pop(t, 0.1); if (k > 0) { g.save(); g.translate(260, 270); g.scale(k, k); SV.relogio(g, 0, 0, 150, h, { fundo: '#fffdf3' }); g.restore();
      pill(g, 260, 480, (p.rotulo || '') + (p.rotulo ? '' : fmt(Math.floor(h)) + (Math.floor(h) === 1 ? ' HORA' : ' HORAS')), k, { bg: h > (p.limite ?? 99) ? '#e53935' : '#212121', size: 50 }); }
    if (p.estrada) { const q = pop(t, at(info, p.estradaEm, info.dur * 0.5)); if (q > 0) { g.save(); g.translate(960, 250); g.scale(q, q);
      box(g, -300, -150, 600, 300, '#fffdf3', 7, 16);
      SV.aviao(g, -170, -70, 0.2); label(g, 'AVIÃO: DÁ TEMPO', 80, -70, { size: 46, color: '#2e7d32', stroke: 0 });
      box(g, -230, 40, 120, 50, '#1e88e5', 4, 10); label(g, 'ESTRADA: NÃO DÁ', 80, 66, { size: 46, color: '#c62828', stroke: 0 }); g.restore(); } }
    txt(g, t, info, p, 1010);
  },
  // barco descendo o rio devagar; contador de dias. p.dias (último dia), p.chars
  barco_lento(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.05]));
    const q = clamp(prog(t, 0.1, info.dur * 0.95)), dia = Math.max(1, Math.round(lerp(1, p.dias || 14, q)));
    drawSet(g, 'rio_acre', t, { barcoX: lerp(p.bx0 ?? 300, p.bx1 ?? 1400, q), tarde: (dia % 2) === 0 && p.anoitece, pista: p.pista });
    chars(g, t, info, p);
    g.restore();
    const k = pop(t, 0.15); if (k > 0) { g.save(); g.translate(250, 170); g.scale(k, k); box(g, -170, -90, 340, 180, '#fffdf3', 7, 14); R(g, -170, -90, 340, 56, '#c62828');
      label(g, 'DE BARCO', 0, -60, { size: 32, color: '#fff', stroke: 0 }); label(g, 'DIA ' + dia, 0, 30, { size: 70, color: INK, stroke: 0 }); g.restore(); }
    txt(g, t, info, p, 130, '#212121');
  },
  // fila de táxis parados (sem passageiro) ou fila de gente querendo táxi (p.povo). p.chars, p.n (táxis)
  fila_taxi(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]), p.cx || 0, 0);
    drawSet(g, p.set || 'ponto_taxi_silencio', t, { taxis: 0 });
    const n = p.n ?? 6; for (let i = 0; i < n; i++) SV.taxi(g, 1800 - i * 340, 905 + (i % 2) * 6, 0.62, { luz: true });
    if (p.povo) { const pal = [CAST.CLIENTE, CAST.RAFA, CAST.LURDES, CAST.MOTOBOY, CAST.VOCE, CAST.APRESENTADORA, CAST.CAIXA];
      for (let i = 0; i < p.povo; i++) character(g, { x: 1500 - i * 150, y: 1010 + (i % 2) * 12, s: 1.7, facing: 1, c: pal[i % pal.length], pose: breathe(i % 3 ? POSES.relaxed : POSES.phone, t, 1, i), expr: i % 2 ? 'worried' : 'tired', blink: blinkAt(t, i) }); }
    chars(g, t, info, p);
    g.restore(); txt(g, t, info, p, 130, p.povo ? '#2e7d32' : '#e53935');
  },
  // avião decolando atrás do ponto de táxi; tremor de tela no final (p.tremorEm). p.chars
  decolagem(g, t, info, p) {
    const t0 = at(info, p.em, 0.2), q = clamp(prog(t, t0, t0 + Math.max(2.5, info.dur * 0.8))), tr = at(info, p.tremorEm, t0 + 1.0);
    const amp = t > tr ? 14 * Math.max(0, 1 - (t - tr) / 2.2) : 0, [sx, sy] = shake(t * 6, amp, 2.5, 4);
    g.save(); g.translate(sx, sy); push(g, t, info, ...(p.z || [1.0, 1.06]));
    drawSet(g, 'ponto_taxi', t, { semAviao: true, taxis: p.taxis ?? 2 });
    SV.aviao(g, lerp(-300, 2200, q), lerp(560, -250, ease.in(q)), lerp(0.7, 1.4, q), { rot: lerp(0, -0.32, clamp(q * 2)), trem: q < 0.25 });
    chars(g, t, info, p);
    g.restore(); txt(g, t, info, p, 130, '#2e7d32');
  },
  // galpão/porto com caixas paradas. p.itens [texto], p.texto, p.fundo ('porto'|'galpao')
  galpao(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]));
    bg(g, '#90a4ae'); R(g, -40, 0, 2000, 120, '#607d8b'); for (let i = 0; i < 9; i++) R(g, i * 240, 120, 14, 700, '#78909c'); R(g, -40, 780, 2000, 400, '#bcaaa4');
    if (p.lugar) { box(g, 660, 150, 600, 90, '#37474f', 6, 10); label(g, p.lugar, 960, 196, { size: 48, color: '#fff', stroke: 0 }); }
    (p.itens || []).forEach((it, i) => { const c = i % 4, r = Math.floor(i / 4), x = 300 + c * 440, y = 560 - r * 210, k = pop(t, at(info, (p.em || [])[i], 0.2 + i * 0.25)); if (k <= 0) return;
      g.save(); g.translate(x, y + 200); g.scale(k, k); box(g, -180, -190, 360, 200, '#d7a96a', 6, 6); R(g, -180, -120, 360, 14, '#a1887f');
      box(g, -150, -170, 300, 46, '#fffdf3', 4, 6); label(g, it, 0, -146, { size: it.length > 12 ? 26 : 32, color: INK, stroke: 0 });
      if (p.urgente) { box(g, -110, -90, 220, 56, '#e53935', 4, 6); label(g, 'URGENTE', 0, -60, { size: 32, color: '#fff', stroke: 0 }); } g.restore(); });
    g.restore();
    if (p.stamp && t > at(info, p.stampEm, info.dur * 0.6)) M.stamp(g, E.W / 2, 330, p.stamp, prog(t, at(info, p.stampEm, info.dur * 0.6), at(info, p.stampEm, info.dur * 0.6) + 0.3), { color: '#e53935', w: 640 });
    txt(g, t, info, p, 1010, '#212121');
  },
  // quadro de contas da Repartição: o Contador ao lado do quadro. p.linhas [texto], p.em [palavra], p.cores, p.k
  quadro(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.05);
    blurLayer(g, 6, g => drawSet(g, 'reparticao', t, {}), { z: 1.2 }, 1);
    box(g, 160, 120, 1120, 760, '#1b3a2b', 10, 12); box(g, 140, 100, 1160, 800, 'rgba(0,0,0,0)', 0, 0); R(g, 160, 880, 1120, 30, '#8d6e63');
    (p.linhas || []).forEach((l, i) => { const q = pop(t, at(info, (p.em || [])[i], 0.3 + i * 0.7)); if (q <= 0) return; const n = p.linhas.length, gap = Math.min(170, 640 / n);
      g.save(); g.translate(720, 500 - (n - 1) * gap / 2 + i * gap); g.scale(q, q); label(g, l, 0, 0, { size: p.tam || (l.length > 16 ? 70 : 88), color: (p.cores || [])[i] || '#f5f5f5', stroke: 0, font: 'Fredoka', weight: 700 }); g.restore(); });
    person(g, { k: p.k || 'CONTADOR', x: 1580, y: 1000, s: 2.3, facing: -1, expr: p.expr, pose: p.pose || 'explain' }, t, info);
    g.restore();
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

// cenasluz.js — cenas específicas de "Por que a conta de luz sobe mesmo quando você economiza?"
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, label, box, oval, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, wl, pop, push, bg, rays, pill, bigText, drawSet, person, M, L, POSES, posesAt, breathe } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);
const NOMES = { ENERGIA: 'ENERGIA', DISTRIB: 'DISTRIBUIÇÃO', TRANSM: 'TRANSMISSÃO', ENCARGO: 'ENCARGO', IMPOSTO: 'IMPOSTO', GATO: '???' };
const CORES = { ENERGIA: '#f9a825', DISTRIB: '#e65100', TRANSM: '#1565c0', ENCARGO: '#546e7a', IMPOSTO: '#b71c1c', GATO: '#212121' };

function envelope(g, x, y, s = 1, aberto = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); box(g, -150, -100, 300, 200, '#fff8e1', 6, 6);
  polyO(g, [[-150, -100], [0, lerp(20, -230, aberto)], [150, -100]], '#ffecb3', 5); label(g, 'CDE', 0, 50, { size: 50, color: '#546e7a', stroke: 0 }); g.restore();
}
function bandeira(g, x, y, s, cor, t) {
  g.save(); g.translate(x, y); g.scale(s, s); tube(g, [[0, 0], [0, 520]], 16, '#8d6e63', 5);
  g.beginPath(); g.moveTo(8, 10); for (let i = 0; i <= 10; i++) g.lineTo(8 + i * 34, 10 + Math.sin(t * 5 + i * 0.7) * 12); for (let i = 10; i >= 0; i--) g.lineTo(8 + i * 34, 230 + Math.sin(t * 5 + i * 0.7) * 12); g.closePath();
  g.fillStyle = cor; g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); g.restore();
}

const K = {
  // close da TV + tomada no escuro; a mão puxa o plugue na palavra p.em ('tirou')
  tomada(g, t, info, p) {
    const k = ease.inOut(prog(t, at(info, p.em || 'tirou', info.dur * 0.4), at(info, p.em || 'tirou', info.dur * 0.4) + 0.4));
    g.save(); push(g, t, info, 1.4, 1.5, 280, -20); L.casa(g, t, { night: true, escuro: true, led: true, plug: k, sofa: false }); g.restore();
    tube(g, [[1700, 1300], [lerp(1380, 1520, k), lerp(820, 860, k)]], 70, CAST.NEIDE.skin, 7);
    if (k > 0.9) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, E.W, E.H); }
    if (p.texto) pill(g, E.W / 2, 120, p.texto, pop(t, 0.2), { bg: '#212121', size: 56 });
  },
  // contas lado a lado. p.contas [{ano,kwh,valor,destaque}], p.em [palavra de entrada de cada uma], p.seta (texto entre elas)
  contas(g, t, info, p) {
    blurLayer(g, 8, g => drawSet(g, p.set || 'casa', t, {}), { z: 1.3 }, 1); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, E.W, E.H);
    const n = p.contas.length, xs = n === 1 ? [E.W / 2] : [600, 1320];
    p.contas.forEach((c, i) => { const q = pop(t, at(info, (p.em || [])[i], 0.15 + i * 0.6)); if (q <= 0) return; g.save(); g.translate(xs[i], 560); g.scale(q, q); L.conta(g, 0, 0, 1.15, { ...c, rot: i ? 0.03 : -0.03 }); g.restore(); });
    if (p.seta && n === 2) { const q = pop(t, at(info, p.setaEm, 1.2)); if (q > 0) { g.save(); g.translate(960, 560); g.scale(q, q); polyO(g, [[-60, -30], [20, -30], [20, -70], [80, 0], [20, 70], [20, 30], [-60, 30]], '#ffd23f', 6); g.restore(); } }
    if (p.texto) pill(g, E.W / 2, 1000, p.texto, pop(t, at(info, p.textoEm, info.dur * 0.6)), { bg: p.textoCor || '#c62828', size: 60 });
  },
  // banho de 5 min com ampulheta
  ampulheta(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.08); L.banheiro(g, t); L.ampulheta(g, 760, 520, 1.5, clamp(t / Math.max(1, info.dur)));
    g.restore(); pill(g, 760, 900, p.label || '5 MINUTOS', pop(t, 0.3), { bg: '#1565c0', size: 64 });
  },
  // relógio de luz + caderno de anotações
  medidor(g, t, info, p) {
    R(g, -100, -100, E.W + 200, E.H + 200, '#d7ccc8'); for (let x = 0; x < E.W; x += 140) R(g, x, 0, 4, E.H, 'rgba(0,0,0,.06)');
    g.save(); push(g, t, info, 1.0, 1.07); L.medidor(g, 560, 520, 1.2, p.num || '04512');
    const q = pop(t, 0.6); if (q > 0) { g.save(); g.translate(1300, 560); g.rotate(0.04); g.scale(q, q); box(g, -330, -330, 660, 660, '#fffdf3', 6, 8); R(g, -330, -330, 50, 660, '#ef9a9a');
      label(g, 'RELÓGIO DE LUZ', 20, -270, { size: 42, color: '#c62828', stroke: 0 });
      const L0 = p.linhas || [['04/11', '04471'], ['05/11', '04478'], ['06/11', '04484'], ['07/11', '04490'], ['08/11', '04497'], ['09/11', '04505'], ['10/11', '04512']];
      L0.forEach(([d, v], i) => { if (t < 0.9 + i * 0.25) return; label(g, d, -230, -190 + i * 66, { size: 40, color: '#1a237e', stroke: 0, align: 'left', font: 'Nunito', weight: 800 }); label(g, v, 260, -190 + i * 66, { size: 40, color: '#1a237e', stroke: 0, align: 'right', font: 'Nunito', weight: 800 }); });
      g.restore(); }
    g.restore(); if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, at(info, p.textoEm, 1.5)), { bg: '#212121', size: 58 });
  },
  // central de atendimento: celular com música de espera e cronômetro
  espera(g, t, info, p) {
    blurLayer(g, 8, g => drawSet(g, 'casa_noite', t, { led: false }), { z: 1.3 }, 1);
    g.save(); push(g, t, info, 1.0, 1.06);
    const mm = Math.floor(lerp(p.de ?? 38, p.ate ?? 40, clamp(t / info.dur))), ss = Math.floor((t * 7) % 60);
    M.phone(g, 960, 540, 2.1, g => { bg(g, '#1565c0'); label(g, 'CENTRAL DE', 0, -120, { size: 22, color: '#fff', stroke: 0 }); label(g, 'ATENDIMENTO', 0, -92, { size: 22, color: '#fff', stroke: 0 });
      label(g, `${mm}:${String(ss).padStart(2, '0')}`, 0, -10, { size: 44, color: '#ffd23f', stroke: 0, font: 'Nunito', weight: 900 }); label(g, 'AGUARDE...', 0, 60, { size: 20, color: '#bbdefb', stroke: 0 }); oval(g, 0, 140, 30, 30, '#e53935', 3); });
    for (let i = 0; i < 4; i++) { const u = ((t * 0.6 + i * 0.25) % 1); g.globalAlpha = 1 - u; label(g, i % 2 ? '♪' : '♫', 1300 + i * 60, 500 - u * 300, { size: 90, color: '#ffd23f', stroke: 10 }); g.globalAlpha = 1; }
    g.restore(); if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, 0.3), { bg: '#212121', size: 58 });
  },
  // a fila de cobradores na sala. p: chegam (palavra/tempo em que a fila aparece), n (quantos), dest (índice em destaque),
  // gato (mostra o 6º), sofa (imposto sentado), fora (índice removido com fumacinha), neide (mostra a Neide), conta (papel voando)
  conta_fila(g, t, info, p) {
    const ordem = ['ENERGIA', 'DISTRIB', 'TRANSM', 'ENCARGO', 'IMPOSTO', 'GATO'];
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.05]), p.cx || 0, p.cy || 0);
    L.casa(g, t, { led: false, sofa: true, plug: 1, fio: false });
    const t0 = at(info, p.chegam, 0), n = p.n ?? 5, tot = Math.min(n + (p.gato ? 1 : 0), 6);
    const X = p.sofa ? [470, 700, 930, 1160, 1330, 1640] : [470, 700, 930, 1160, 1390, 1640];
    const quem = [];
    for (let i = 0; i < tot; i++) quem.push(i);
    // imposto sentado vai atrás (desenhado primeiro)
    const ordemDesenho = p.sofa ? [4, ...quem.filter(i => i !== 4)] : quem;
    const labels = [];
    if (p.neide !== false) person(g, { k: 'NEIDE', x: p.neideX || 210, y: 1000, facing: 1, expr: p.neideExpr || 'surprised', pose: p.neidePose }, t, info);
    for (const i of ordemDesenho) {
      if (i >= tot) continue; const k = ordem[i];
      let alpha = 1; if (p.fora === i) { const fe = at(info, p.foraEm, info.dur * 0.5), u = prog(t, fe, fe + 0.5); if (u >= 1) continue; alpha = 1 - u; }
      const q = ease.outBack(prog(t, t0 + i * 0.18, t0 + i * 0.18 + 0.45)); if (q <= 0) continue;
      const dest = p.dest === i, sentado = k === 'IMPOSTO' && p.sofa;
      const x = X[i], y = sentado ? 880 : 1000, sc = k === 'GATO' ? 1.75 : 1.9;
      const pose = sentado ? 'sitBack' : k === 'GATO' ? 'crossArms' : k === 'ENCARGO' ? 'holdFront' : dest ? 'explain' : 'relaxed';
      g.save(); g.globalAlpha = alpha; g.translate(0, (1 - q) * 300);
      person(g, { k, x, y, facing: -1, s: sc, pose, expr: k === 'GATO' ? 'smug' : dest ? 'smile' : 'neutral' }, t, info);
      if (k === 'ENCARGO') envelope(g, x - 70, y - 300, 0.42, 0);
      g.restore();
      if (k !== 'GATO' || p.gatoNome) labels.push([x, sentado ? y - 470 : y - 560 - (i % 2) * 70, k === 'GATO' ? 'GATO' : NOMES[k], CORES[k], dest, alpha * clamp(q)]);
    }
    for (const [x, y, nm, c, d, a] of labels) { g.save(); g.globalAlpha = a; pill(g, x, y, nm, d ? 1.15 : 0.85, { bg: c, size: 34, h: 36, pad: 36 }); g.restore(); }
    g.restore();
    if (p.conta) { const u = prog(t, 0.1, 1.2); if (u < 1) { g.save(); g.translate(lerp(300, 960, ease.out(u)), lerp(800, 400, ease.out(u))); g.rotate(u * 6); L.conta(g, 0, 0, lerp(0.3, 0.9, u), {}); g.restore(); } }
    if (p.carimbo) M.stamp(g, E.W / 2, 260, p.carimbo, prog(t, at(info, p.carimboEm, info.dur * 0.5), at(info, p.carimboEm, info.dur * 0.5) + 0.3), { color: '#2e7d32', w: 640 });
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, at(info, p.textoEm, 0.3)), { bg: p.textoCor || '#212121', size: 58 });
  },
  // R$ 100 dividido em fatias. p.ate (quantas fatias aparecem), p.dest (índice), p.em[]
  fatias(g, t, info, p) {
    bg(g, '#263238');
    const F = [['IMPOSTO', 18, '#e53935'], ['ENERGIA', 34, '#fdd835'], ['DISTRIBUIÇÃO', 25, '#fb8c00'], ['ENCARGOS', 17, '#90a4ae'], ['TRANSM.', 6, '#42a5f5']];
    const W = 1600, x0 = 160, y = 470; let x = x0;
    bigText(g, E.W / 2, 190, p.titulo || 'DE CADA R$ 100 DA CONTA', pop(t, 0.05), { size: 90, color: '#fff' });
    F.forEach(([nm, v, c], i) => { const w = W * v / 100, q = ease.out(prog(t, at(info, (p.em || [])[i], 0.3 + i * 0.5), at(info, (p.em || [])[i], 0.3 + i * 0.5) + 0.4));
      if (i < (p.ate ?? 5) && q > 0) { const d = p.dest === i; box(g, x, y - (d ? 20 : 0), w * q, 220 + (d ? 40 : 0), c, 7, 10);
        if (q > 0.9) { label(g, 'R$ ' + v, x + w / 2, y + 95, { size: w > 200 ? 70 : 46, color: INK, stroke: 0 }); label(g, nm, x + w / 2, y + 330, { size: w > 200 ? 40 : 30, color: '#fff', stroke: 0 }); } }
      x += w; });
    if (p.texto) pill(g, E.W / 2, 960, p.texto, pop(t, at(info, p.textoEm, info.dur * 0.6)), { bg: '#ffd23f', color: INK, size: 56 });
  },
  // bandeira tarifária. modo 'cores' (verde/amarela/vermelha com valor), 'ano' (2026 mês a mês), 'chuva'
  bandeira(g, t, info, p) {
    const modo = p.modo || 'cores';
    if (modo === 'ano') {
      bg(g, '#fff8e1'); bigText(g, E.W / 2, 160, 'BANDEIRA EM 2026', pop(t, 0.05), { size: 90, color: '#5d4037' });
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV'], cor = i => (i >= 4 && i <= 8) ? '#fdd835' : '#43a047';
      meses.forEach((m, i) => { const q = pop(t, 0.3 + i * 0.12); if (q <= 0) return; g.save(); g.translate(220 + i * 150, 560); g.scale(q, q); bandeira(g, -40, -260, 0.5, cor(i), t + i); label(g, m, 30, 60, { size: 40, color: INK, stroke: 0 }); g.restore(); });
      pill(g, 960, 860, '+ R$ 1,88 A CADA 100 kWh', pop(t, at(info, p.em || 'amarela', 1.6)), { bg: '#f9a825', color: INK, size: 60 });
      return;
    }
    if (modo === 'chuva') {
      blurLayer(g, 6, g => drawSet(g, 'casa', t, {}), { z: 1.3 }, 1);
      const chove = t < at(info, p.em || 'nao', info.dur * 0.5); const cor = chove ? '#43a047' : '#e53935';
      g.save(); push(g, t, info, 1.0, 1.06); bandeira(g, 860, 250, 1.1, cor, t); g.restore();
      if (chove) { for (let i = 0; i < 40; i++) { const u = ((t * 1.3 + i * 0.13) % 1); tube(g, [[100 + (i * 97) % 1700, u * 1100 - 40], [90 + (i * 97) % 1700, u * 1100 + 10]], 5, '#4fc3f7', 0); } pill(g, 960, 960, 'CHOVEU: HIDRELÉTRICA', 1, { bg: '#2e7d32', size: 56 }); }
      else pill(g, 960, 960, 'NÃO CHOVEU: TÉRMICA (MAIS CARA)', 1, { bg: '#c62828', size: 56 });
      return;
    }
    bg(g, '#263238');
    const B = [['VERDE', '#43a047', 'R$ 0'], ['AMARELA', '#fdd835', 'R$ 1,88'], ['VERMELHA 1', '#e53935', 'R$ 4,46'], ['VERMELHA 2', '#b71c1c', 'R$ 7,87']];
    B.forEach(([n, c, v], i) => { const q = pop(t, at(info, (p.em || [])[i], 0.2 + i * 0.4)); if (q <= 0) return; g.save(); g.translate(250 + i * 440, 330); g.scale(q, q); bandeira(g, -120, -160, 0.75, c, t + i); label(g, n, 20, 300, { size: 46, color: '#fff', stroke: 8 }); label(g, v, 20, 380, { size: 64, color: c === '#b71c1c' ? '#ff8a80' : c, stroke: 10 }); g.restore(); });
    pill(g, E.W / 2, 1000, 'A CADA 100 kWh', pop(t, 0.6), { bg: '#212121', size: 52 });
  },
  // envelope do encargo abrindo: itens pagos pela conta de luz
  envelope(g, t, info, p) {
    bg(g, '#eceff1'); const a = ease.out(prog(t, 0.2, 0.9));
    g.save(); push(g, t, info, 1.0, 1.05); envelope(g, 960, 700, 1.8, a); g.restore();
    const itens = p.itens || ['TARIFA SOCIAL', 'LUZ PARA TODOS', 'PAINEL SOLAR', 'INCENTIVO A USINAS'];
    const pos = [[420, 260], [1500, 260], [380, 560], [1540, 560]];
    itens.forEach((it, i) => { const q = pop(t, at(info, (p.em || [])[i], 0.9 + i * 0.5)); if (q <= 0) return; g.save(); g.translate(...pos[i]); g.scale(q, q); box(g, -260, -70, 520, 140, '#fffdf3', 6, 18); label(g, it, 0, 6, { size: 46, color: '#37474f', stroke: 0 }); g.restore(); });
    if (p.texto) pill(g, E.W / 2, 1000, p.texto, pop(t, at(info, p.textoEm, info.dur * 0.6)), { bg: '#546e7a', size: 56 });
  },
  // duas barras comparando. p: a [rot, val], b [rot, val], suf, titulo
  barras(g, t, info, p) {
    bg(g, p.fundo || '#1a237e'); if (p.titulo) bigText(g, E.W / 2, 140, p.titulo, pop(t, 0.05), { size: 80, color: '#fff' });
    const mx = Math.max(p.a[1], p.b[1]);
    [p.a, p.b].forEach(([rot, v, c], i) => { const k = ease.out(prog(t, at(info, (p.em || [])[i], 0.3 + i * 0.8), at(info, (p.em || [])[i], 0.3 + i * 0.8) + 0.9)); const h = 620 * v / mx * k, x = 700 + i * 520;
      box(g, x - 150, 940 - h, 300, h, c || (i ? '#90caf9' : '#ffd23f'), 7, 12); if (k > 0.05) label(g, '+' + (Number.isInteger(v) ? Math.round(v * k) : (v * k).toFixed(1).replace('.', ',')) + (p.suf ?? '%'), x, 940 - h - 60, { size: 80, color: '#fff', stroke: 12 }); label(g, rot, x, 1010, { size: 46, color: '#fff', stroke: 8 }); });
  },
  // caminhão da distribuidora no poste: tira o gato
  poste_corte(g, t, info, p) {
    const tc = at(info, p.em ?? 99, info.dur * 0.7), corte = t > tc;
    g.save(); push(g, t, info, 1.0, 1.05, 0, 0);
    L.muro(g, t, { gato: !corte, off: corte });
    g.save(); g.translate(360, 1010); box(g, -330, -330, 470, 260, '#eceff1', 7, 10); label(g, 'DISTRIBUIDORA', -95, -200, { size: 40, color: '#1565c0', stroke: 0 }); box(g, 140, -260, 190, 190, '#ffb300', 7, 18); box(g, 170, -235, 110, 80, '#bbdefb', 5, 8); for (const wx of [-240, -80, 240]) { oval(g, wx, -60, 54, 54, '#212121', 8); oval(g, wx, -60, 20, 20, '#9e9e9e', 5); } g.restore();
    tube(g, [[560, 760], [870, 420]], 16, '#ffb300', 5); for (let i = 1; i < 6; i++) { const u = i / 6; tube(g, [[lerp(560, 870, u) - 22, lerp(760, 420, u)], [lerp(560, 870, u) + 22, lerp(760, 420, u)]], 7, '#ffb300', 3); }
    character(g, { x: 850, y: 560, s: 1.3, facing: 1, c: { ...CAST.DISTRIB, badge: false }, pose: breathe(POSES.reach, t), expr: corte ? 'smile' : 'neutral', blink: blinkAt(t, 1), look: [0.8, -0.6] });
    if (!corte && t > tc - 1.2) { const k = 0.5 + 0.5 * Math.sin(t * 10); g.strokeStyle = `rgba(255,214,0,${k})`; g.lineWidth = 10; g.beginPath(); g.arc(1300, 230, 120, 0, 7); g.stroke(); }
    g.restore(); if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, 0.3), { bg: '#212121', size: 58 });
  },
  // protocolo + carimbo DEFERIDO
  carimbo(g, t, info, p) {
    const old = globalThis.PLACA_CEU; globalThis.PLACA_CEU = 'REPARTIÇÃO DO UNIVERSO';
    blurLayer(g, 8, g => drawSet(g, 'reparticao', t, {}), { z: 1.3 }, 1); globalThis.PLACA_CEU = old;
    g.save(); push(g, t, info, 1.0, 1.08); box(g, 560, 180, 800, 760, '#fffdf3', 7, 8); label(g, 'PROTOCOLO Nº ' + (p.num || '2026-118.402'), 960, 260, { size: 44, color: '#5e35b1', stroke: 0 });
    (p.linhas || ['RECLAMANTE: NEIDE', 'ASSUNTO: ECONOMIZEI E', 'A CONTA SUBIU', 'PEDIDO: TIRAR O GATO']).forEach((l, i) => label(g, l, 610, 360 + i * 80, { size: 40, color: '#37474f', stroke: 0, align: 'left', font: 'Nunito', weight: 800 }));
    const te = at(info, p.em || 'deferido', info.dur * 0.5), k = prog(t, te - 0.15, te + 0.2);
    const hy = te > t ? lerp(-200, 600, ease.inOut(prog(t, 0, Math.max(0.1, te - 0.1)))) : 650 - Math.sin(clamp(k) * Math.PI) * 30;
    tube(g, [[1250, hy - 420], [1250, hy - 60]], 70, CAST.CONTADOR.skin, 7); box(g, 1150, hy - 70, 200, 70, '#8d6e63', 6, 10); box(g, 1130, hy, 240, 40, '#c62828', 6, 6);
    if (t > te) M.stamp(g, 960, 760, p.txt || 'DEFERIDO', prog(t, te, te + 0.3), { color: '#2e7d32', w: 620 });
    g.restore();
  },
  // aparelhos em stand-by com luzinha vermelha + até 12%
  standby(g, t, info, p) {
    bg(g, '#1c1f2b'); const A = ['TV', 'MICRO-ONDAS', 'CARREGADOR', 'ROTEADOR', 'VIDEOGAME'];
    A.forEach((a, i) => { const q = pop(t, 0.2 + i * 0.25); if (q <= 0) return; g.save(); g.translate(260 + i * 350, 520); g.scale(q, q); box(g, -130, -110, 260, 200, '#37474f', 6, 16); const l = 0.6 + 0.4 * Math.sin(t * 3 + i);
      g.fillStyle = `rgba(255,40,40,${l})`; g.beginPath(); g.arc(90, 60, 12, 0, 7); g.fill(); g.fillStyle = `rgba(255,40,40,${l * 0.25})`; g.beginPath(); g.arc(90, 60, 34, 0, 7); g.fill(); label(g, a, 0, 170, { size: 34, color: '#fff', stroke: 0 }); g.restore(); });
    bigText(g, E.W / 2, 200, 'MODO DE ESPERA', pop(t, 0.1), { size: 90, color: '#fff' });
    bigText(g, E.W / 2, 880, 'ATÉ 12% DO CONSUMO', pop(t, at(info, p.em || 'doze', info.dur * 0.5)), { size: 100, color: '#ff5252' });
  },
  // Marcão sem luz batendo na porta / com o celular na tomada
  marcao_tomada(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.06); L.casa(g, t, { led: false, plug: 0 });
    person(g, { k: 'NEIDE', x: 520, y: 1000, facing: 1, expr: p.neideExpr || 'smug', pose: p.neidePose }, t, info);
    person(g, { k: 'MARCAO', x: 1050, y: 1000, facing: -1, expr: p.marcaoExpr || 'worried', pose: p.marcaoPose || 'holdFront', propFn: (g, h) => M.phone(g, h[0] + 6, h[1] - 14, 0.11, g => bg(g, '#263238')) }, t, info);
    g.restore(); if (p.texto) pill(g, E.W / 2, 120, p.texto, pop(t, at(info, p.textoEm, 0.3)), { bg: p.textoCor || '#212121', size: 58 });
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

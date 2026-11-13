// cenasferiado.js — cenas de "E se o Brasil tivesse só um feriado por ano?"
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, label, box, oval, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, wl, pop, push, bg, rays, pill, bigText, drawSet, person, M, F, POSES, posesAt, breathe } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);
const FERIADOS = [['01/01', 'ANO-NOVO'], ['03/04', 'SEXTA-FEIRA SANTA'], ['21/04', 'TIRADENTES'], ['01/05', 'DIA DO TRABALHO'], ['07/09', 'INDEPENDÊNCIA'], ['12/10', 'N. SRA. APARECIDA'], ['02/11', 'FINADOS'], ['15/11', 'REPÚBLICA'], ['20/11', 'CONSCIÊNCIA NEGRA'], ['25/12', 'NATAL']];

const K = {
  // lista de feriados num papel de calendário; a caneta risca. p.riscar: [[índice, palavra|tempo], ...], p.salvo, p.todos (risca tudo menos salvo), p.destaque
  calendario(g, t, info, p) {
    bg(g, '#f3d6b3'); g.save(); push(g, t, info, ...(p.z || [1.0, 1.05]), p.cx || 0, p.cy || 0);
    box(g, 420, 40, 1080, 1000, '#fffdf3', 8, 10); box(g, 420, 40, 1080, 120, '#c62828', 8, 10); label(g, 'FERIADOS NACIONAIS 2026', 960, 100, { size: 56, color: '#fff', stroke: 0 });
    const riscos = {}; (p.riscar || []).forEach(([i, w]) => riscos[i] = at(info, w, 0.3));
    if (p.todos) FERIADOS.forEach((_, i) => { if (i !== p.salvo && riscos[i] == null) riscos[i] = 0.2 + i * 0.12; });
    FERIADOS.forEach(([d, n], i) => {
      const y = 215 + i * 82, dest = p.destaque === i || (p.salvo === i && p.todos);
      if (dest) box(g, 470, y - 36, 980, 72, '#fff59d', 0, 8);
      label(g, d, 520, y + 6, { size: 46, color: '#c62828', stroke: 0, align: 'left', font: 'Nunito', weight: 900 });
      label(g, n, 700, y + 6, { size: 46, color: INK, stroke: 0, align: 'left' });
      const r0 = riscos[i]; if (r0 != null && t > r0) { const k = ease.out(prog(t, r0, r0 + 0.3)); tube(g, [[500, y + 4], [lerp(500, 1420, k), y - 2]], 12, '#e53935', 0); }
    });
    // caneta segue o último risco
    const ult = Object.entries(riscos).filter(([, v]) => t > v).sort((a, b) => b[1] - a[1])[0];
    if (ult) { const i = +ult[0], k = ease.out(prog(t, ult[1], ult[1] + 0.3)), x = lerp(500, 1420, k), y = 215 + i * 82; g.save(); g.translate(x, y); g.rotate(0.6); box(g, -14, -200, 28, 200, '#c62828', 5, 8); polyO(g, [[-14, 0], [14, 0], [0, 34]], '#ffe0b2', 4); g.restore(); tube(g, [[x + 120, y - 120], [x + 400, y + 300]], 70, CAST.FABIO.skin, 7); }
    g.restore();
    if (p.texto) pill(g, E.W / 2, 1010, p.texto, pop(t, at(info, p.textoEm, 0.3)), { bg: p.textoCor || '#212121', size: 56 });
  },
  // pote PRAIA enchendo
  pote(g, t, info, p) {
    blurLayer(g, 6, g => drawSet(g, 'casa_rose', t, { pote: 0 }), { z: 1.4, x: -300 }, 1);
    g.save(); push(g, t, info, 1.0, 1.08); const k = p.quebrado ? 0 : lerp(p.de ?? 0.1, p.ate ?? 0.6, ease.out(prog(t, 0.3, info.dur * 0.8)));
    F.pote(g, 960, 820, 2.0, k, { quebrado: p.quebrado && t > at(info, p.em || 'quebrou', 0.4) });
    if (!p.quebrado) for (let i = 0; i < 3; i++) { const u = ((t * 0.8 + i * 0.33) % 1); oval(g, 960 + (i - 1) * 40, lerp(200, 560, u), 30, 14, '#ffd54f', 4); }
    g.restore(); if (p.texto) pill(g, E.W / 2, 130, p.texto, pop(t, at(info, p.textoEm, 0.4)), { bg: p.textoCor || '#1565c0', size: 60 });
  },
  // votação do feriado que sobrevive
  votacao(g, t, info, p) {
    bg(g, '#1a237e'); bigText(g, E.W / 2, 110, 'QUAL FERIADO SOBREVIVE?', pop(t, 0.05), { size: 80, color: '#fff' });
    const V = [['NATAL', 61, '#43a047'], ['ANO-NOVO', 17, '#ffd23f'], ['12 DE OUTUBRO', 9, '#ef5350'], ['TIRADENTES', 5, '#90caf9'], ['CONSCIÊNCIA NEGRA', 4, '#ce93d8'], ['OUTROS', 4, '#b0bec5']];
    const k = ease.out(prog(t, 0.3, Math.max(1.2, info.dur * 0.7)));
    V.forEach(([n, v, c], i) => { const y = 260 + i * 130, w = 1100 * v / 61 * k; label(g, n, 560, y + 8, { size: 44, color: '#fff', stroke: 0, align: 'right' }); box(g, 600, y - 40, Math.max(8, w), 80, c, 6, 10); label(g, Math.round(v * k) + '%', 620 + w, y + 8, { size: 44, color: '#fff', stroke: 0, align: 'left' }); });
    if (t > info.dur * 0.75) M.stamp(g, 1500, 300, 'VENCEDOR', prog(t, info.dur * 0.75, info.dur * 0.75 + 0.3), { color: '#ffd23f', w: 520, size: 70 });
    pill(g, E.W / 2, 1030, 'VOTAÇÃO DE MENTIRA, É FICÇÃO', 1, { bg: '#283593', size: 34, h: 34 });
  },
  // gráfico de vendas quase reto
  vendas(g, t, info, p) {
    bg(g, '#fafafa'); R(g, 300, 900, 1400, 6, INK); R(g, 300, 250, 6, 656, INK);
    label(g, 'VENDAS DA FÁBIO MÓVEIS', 960, 150, { size: 64, color: '#c62828', stroke: 0 });
    const pts = [[300, 640], [500, 630], [700, 640], [900, 625], [1100, 632], [1300, 620], [1500, 615], [1700, 612]], k = ease.out(prog(t, 0.2, Math.max(1, info.dur * 0.6)));
    g.strokeStyle = '#c62828'; g.lineWidth = 12; g.beginPath(); pts.forEach(([x, y], i) => { if (x <= lerp(300, 1700, k)) i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    tube(g, [[300, 640], [lerp(300, 1700, k), lerp(640, 300, k)]], 6, 'rgba(67,160,71,.5)', 0); label(g, 'O QUE ELE ESPERAVA', 1450, 290, { size: 34, color: '#43a047', stroke: 0 });
    if (t > at(info, p.em || 'quase', info.dur * 0.5)) bigText(g, 1300, 760, '+ QUASE NADA', pop(t, at(info, p.em || 'quase', info.dur * 0.5)), { size: 90, color: '#c62828' });
  },
  // balança varejo x turismo
  balanca(g, t, info, p) {
    bg(g, '#263238'); const tilt = lerp(0, -0.12, ease.inOut(prog(t, at(info, p.em || 'outro', info.dur * 0.5), at(info, p.em || 'outro', info.dur * 0.5) + 1)));
    tube(g, [[960, 900], [960, 380]], 30, '#b0bec5', 6); polyO(g, [[860, 920], [1060, 920], [960, 860]], '#90a4ae', 6);
    g.save(); g.translate(960, 380); g.rotate(tilt); tube(g, [[-560, 0], [560, 0]], 20, '#b0bec5', 6);
    for (const [d, lab, val, c] of [[-1, 'COMÉRCIO SP', '−R$ 17 BI', '#e53935'], [1, 'CARNAVAL', '+R$ 14,5 BI', '#43a047']]) { g.save(); g.translate(d * 520, 0); g.rotate(-tilt); tube(g, [[-140, 230], [0, 0], [140, 230]], 6, '#cfd8dc', 0); oval(g, 0, 240, 190, 36, '#90a4ae', 6);
      box(g, -170, 70, 340, 150, '#fffdf3', 6, 14); label(g, lab, 0, 120, { size: 38, color: '#37474f', stroke: 0 }); label(g, val, 0, 185, { size: 52, color: c, stroke: 0 }); g.restore(); }
    g.restore();
    pill(g, E.W / 2, 110, p.titulo || 'O FERIADO MUDA O DINHEIRO DE LUGAR', pop(t, at(info, p.tituloEm, 0.2)), { bg: '#ffd23f', color: INK, size: 54 });
    if (p.sub) pill(g, E.W / 2, 1010, p.sub, pop(t, 0.8), { bg: '#212121', size: 40 });
  },
  // ranking de feriados por país
  ranking(g, t, info, p) {
    bg(g, '#004d40'); bigText(g, E.W / 2, 120, 'FERIADOS NACIONAIS POR ANO', pop(t, 0.05), { size: 72, color: '#fff' });
    const V = [['NEPAL', 35, '#ffd23f'], ['MÉDIA DO MUNDO', 13, '#80cbc4'], ['BRASIL', 10, '#43a047'], ['MÉXICO', 8, '#80cbc4']];
    V.forEach(([n, v, c], i) => { const k = ease.out(prog(t, at(info, (p.em || [])[i], 0.3 + i * 0.4), at(info, (p.em || [])[i], 0.3 + i * 0.4) + 0.7)), y = 300 + i * 170, w = 1200 * v / 35 * k;
      label(g, n, 520, y + 10, { size: 50, color: '#fff', stroke: 0, align: 'right' }); box(g, 560, y - 50, Math.max(8, w), 100, c, 6, 12); if (k > 0.1) label(g, String(Math.round(v * k)), 590 + w, y + 10, { size: 56, color: '#fff', stroke: 8, align: 'left' }); });
  },
  // Lara vê o mar
  mar(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.06); F.praia(g, t, { sem_predios: true });
    const run = at(info, p.em || 'correu', info.dur * 0.7), k = ease.inOut(prog(t, run, run + 1.5));
    character(g, { x: lerp(760, 1200, k), y: lerp(1000, 820, k), s: 1.8, facing: 1, c: CAST.LARA, pose: breathe(t > run ? posesAt(t - run, [[0, 'cheer'], [0.3, 'jump'], [0.6, 'cheer']]) : POSES.relaxed, t), expr: t > run ? 'happy' : 'surprised', look: [0.6, -0.4], blink: blinkAt(t, 1) });
    person(g, { k: 'ROSE_CASA', x: 420, y: 1010, facing: 1, expr: 'smile', pose: p.rosePose }, t, info);
    g.restore(); if (p.texto) pill(g, E.W / 2, 120, p.texto, pop(t, at(info, p.textoEm, 0.3)), { bg: '#0277bd', size: 60 });
  },
  // Fábio na rede da pousada
  rede(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.85, 1.95]), p.cx ?? 380, p.cy ?? 230); F.praia(g, t, { cheia: true });
    g.save(); g.translate(1340, 772 + Math.sin(t * 1.5) * 4); g.rotate(-1.45 + Math.sin(t * 1.5) * 0.03);
    character(g, { x: 0, y: 0, s: 0.62, facing: 1, c: CAST.FABIO_PRAIA, pose: breathe(POSES.relaxed, t), expr: 'happy', talk: talkWho('fabio', info.globalT), blink: blinkAt(t, 2) });
    g.restore();
    g.fillStyle = '#ef5350'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(1265, 760); g.quadraticCurveTo(1350, 840, 1430, 760); g.quadraticCurveTo(1350, 800, 1265, 760); g.fill(); g.stroke();
    if (p.ze) person(g, { k: 'ZE', x: 1560, y: 1000, s: 1.25, facing: -1, expr: 'smile' }, t, info);
    g.restore();
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

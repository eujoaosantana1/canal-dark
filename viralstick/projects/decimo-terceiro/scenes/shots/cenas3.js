// cenas3.js — atos 7 a 10: a letra miúda, a outra metade da conta, a escolha, o final.
import { E, registerShot, layer, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, head, coin, glassCup, label, oval, box, blob, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, talkWho, wl, pop, fadeIn, push, bg, rays, pill, bigText, drawSet, person, bust, M, POSES, posesAt, breathe } from '../lib.js';
import { backWall, counter, CT } from '../sets/padaria.js';
import { VALDIR, VALDIR_CASA, NENE, CONTADOR, MARQUINHOS, BIA_OCULOS, CIDA, VOCE, POVO } from '../cast.js';

const icon = {
  rua: (g, s = 1) => { box(g, -80 * s, -40 * s, 160 * s, 80 * s, '#5f6672', 5, 8); g.fillStyle = '#fafafa'; g.fillRect(-50 * s, -6 * s, 40 * s, 12 * s); g.fillRect(15 * s, -6 * s, 40 * s, 12 * s); },
  poste: (g, s = 1) => { tube(g, [[0, 70 * s], [0, -60 * s], [40 * s, -70 * s]], 12 * s, '#5d6670'); oval(g, 46 * s, -66 * s, 22 * s, 10 * s, '#fff59d', 4); },
  remedio: (g, s = 1) => { box(g, -60 * s, -70 * s, 120 * s, 140 * s, '#fff', 5, 12); box(g, -60 * s, -70 * s, 120 * s, 36 * s, '#e53935', 5, 8); g.fillStyle = '#e53935'; g.fillRect(-8 * s, -10 * s, 16 * s, 56 * s); g.fillRect(-28 * s, 10 * s, 56 * s, 16 * s); },
  escola: (g, s = 1) => { box(g, -80 * s, -40 * s, 160 * s, 100 * s, '#ffcc80', 5, 4); polyO(g, [[-95 * s, -40 * s], [0, -100 * s], [95 * s, -40 * s]], '#e53935', 5); box(g, -18 * s, 10 * s, 36 * s, 50 * s, '#6d4c41', 4, 3); },
  saude: (g, s = 1) => { oval(g, 0, 0, 70 * s, 70 * s, '#fff', 5); g.fillStyle = '#e53935'; g.fillRect(-14 * s, -45 * s, 28 * s, 90 * s); g.fillRect(-45 * s, -14 * s, 90 * s, 28 * s); },
  aposentadoria: (g, s = 1) => { head(g, 0, 0, 60 * s, { ...CIDA, expr: 'smile' }); },
  juros: (g, s = 1) => { label(g, '%', 0, 0, { size: 140 * s, color: '#e53935', stroke: 14 * s }); },
};
function tag(g, x, y, k, name, ic) { if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(0.06); polyO(g, [[-170, -110], [130, -110], [200, 0], [130, 110], [-170, 110]], '#ffd23f', 7); oval(g, 150, 0, 16, 16, '#fff', 4); g.save(); g.translate(-80, -10); icon[ic](g, 0.8); g.restore(); label(g, name, 40, 70, { size: 38, color: '#1b1b1f', stroke: 0 }); g.restore(); }
function street(g, t, o) { M.rua(g, o); }

export const K = {
  rodape_universo(g, t, info) {
    rays(g, t, '#d1c4e9', '#ede7f6'); g.save(); push(g, t, info, 1, 1.15, 0, 260);
    box(g, 560, 120, 800, 900, '#fffdf3', 8, 8); label(g, 'RESTITUIÇÃO UNIVERSAL', 960, 200, { size: 46, color: '#5e35b1', stroke: 0 }); g.fillStyle = '#bdbdbd'; for (let r = 0; r < 8; r++) g.fillRect(640, 280 + r * 50, 640 - (r % 3) * 90, 14);
    label(g, '*por coerência, devolvemos também o que ele pagava.', 960, 820, { size: 22, color: '#757575', stroke: 0, font: 'Nunito', weight: 800 });
    g.restore(); const lx = lerp(1500, 1020, ease.inOut(prog(t, 0.8, 2.4))), ly = lerp(300, 900, ease.inOut(prog(t, 0.8, 2.4)));
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.arc(lx, ly, 120, 0, 7); g.stroke(); tube(g, [[lx + 90, ly + 90], [lx + 210, ly + 210]], 26, '#6d4c41');
    pill(g, 400, 160, 'O RODAPÉ DO UNIVERSO', pop(t, 0.2), { bg: '#5e35b1', size: 52 });
  },
  rua_terra(g, t, info) {
    const td = wl(info, 'asfalto', 2.6);
    g.save(); push(g, t, info, 1.0, 1.05); street(g, t, { dirt: t > td }); const x = lerp(-500, 2400, prog(t, 0, info.dur));
    M.bus(g, x, 1010, 1.15, { driver: g => head(g, 0, 0, 30, { ...VALDIR, expr: t > td ? 'worried' : 'smile' }) });
    if (t > td) for (let i = 0; i < 8; i++) { const k = ((t * 2 + i / 8) % 1); g.globalAlpha = (1 - k) * 0.7; oval(g, x - 330 - k * 300, 990 - k * 80, 40 + k * 60, 30 + k * 30, '#c8a27a', 0); g.globalAlpha = 1; }
    g.restore(); pill(g, 260, 150, 'DIA 3', pop(t, 0.1), { bg: '#5e35b1', size: 70 }); if (t > td) pill(g, E.W / 2, 290, 'O ASFALTO VIROU TERRA', pop(t, td), { bg: '#8d6e63', size: 58 });
  },
  poste_apagado(g, t, info) {
    const toff = wl(info, 'apaga', 0.8); const off = t > toff && !(t - toff < 0.4 && Math.sin(t * 60) > 0);
    g.save(); push(g, t, info, 1.0, 1.08, 0, 100); street(g, t, { night: true, darkHouse: 3, lamps: [[180, true], [620, true], [1060, !off], [1500, true], [1940, true]] });
    character(g, { x: 1110, y: 1000, s: 2.0, facing: 1, c: VALDIR_CASA, pose: breathe(t > wl(info, 'escuro', 3) ? POSES.sad : POSES.relaxed, t), expr: off ? 'sad' : 'neutral', look: [0.3, -0.8] });
    if (off) { g.fillStyle = 'rgba(0,0,20,.35)'; g.beginPath(); g.ellipse(1110, 800, 330, 500, 0, 0, 7); g.fill(); }
    g.restore(); pill(g, 260, 150, 'DIA 4', pop(t, 0.1), { bg: '#5e35b1', size: 70 }); if (t > wl(info, 'so', 2.0)) pill(g, E.W / 2, 290, 'SÓ O DELE', pop(t, wl(info, 'so', 2.0)), { bg: '#263238', size: 58 });
  },
  cida_caminha(g, t, info) {
    g.save(); push(g, t, info, 1.0, 1.04); street(g, t, {}); const x = lerp(300, 1300, prog(t, 0, info.dur));
    box(g, 1500, 360, 520, 400, '#fff', 6, 6); label(g, 'POSTO DE SAÚDE', 1760, 420, { size: 40, color: '#00897b', stroke: 0 }); box(g, 1740, 470, 50, 120, '#e53935', 0, 0); box(g, 1705, 505, 120, 50, '#e53935', 0, 0);
    character(g, { x, y: 1000, s: 2.1, facing: 1, c: CIDA, pose: breathe(M.POSES ? POSES.relaxed : POSES.relaxed, t), expr: 'smile', blink: blinkAt(t, 3) });
    g.restore(); pill(g, 260, 150, 'DIA 5', pop(t, 0.1), { bg: '#5e35b1', size: 70 }); pill(g, E.W / 2, 290, 'DONA CIDA, A MÃE', pop(t, wl(info, 'dona', 1)), { bg: '#7e57c2', size: 58 });
  },
  bilhete(g, t, info) {
    rays(g, t, '#fff59d', '#fffde7'); g.save(); push(g, t, info, 1, 1.06); g.save(); g.translate(960, 560); g.rotate(-0.04);
    box(g, -440, -300, 880, 600, '#fffdf3', 8, 6); g.strokeStyle = '#90caf9'; g.lineWidth = 3; for (let r = 0; r < 9; r++) { g.beginPath(); g.moveTo(-420, -200 + r * 56); g.lineTo(420, -200 + r * 56); g.stroke(); }
    label(g, 'ESCOLA DA BIA', 0, -240, { size: 48, color: '#1565c0', stroke: 0 }); label(g, 'Favor providenciar', 0, -60, { size: 70, color: '#263238', stroke: 0, font: 'Playfair Display', weight: 900 }); label(g, 'PROFESSORA.', 0, 60, { size: 90, color: '#e53935', stroke: 0 }); g.restore();
    g.restore(); pill(g, 260, 150, 'DIA 6', pop(t, 0.1), { bg: '#5e35b1', size: 70 });
  },
  carta_chega(g, t, info) {
    g.save(); push(g, t, info, 1, 1.05); M.sala(g, { night: true, box: false }); g.restore();
    const y = lerp(-200, 520, ease.outBack(prog(t, 0.2, 1.2))); M.letter(g, 960, y, 1.8, Math.sin(t * 2) * 0.05, { seal: '#7e57c2', mark: '★' });
    if (t > 1.2) label(g, 'RECEITA FEDERAL DO CÉU', 960, 860, { size: 64, color: '#fff', stroke: 12 });
  },
  guia_escura(g, t, info, p) {
    g.save(); push(g, t, info, p.z || 1.0, (p.z || 1.0) + 0.08, 0, 100); street(g, t, { night: true, darkHouse: 3, lamps: [[180, true], [620, true], [1060, false], [1500, true], [1940, true]] });
    g.fillStyle = 'rgba(0,0,20,.4)'; g.beginPath(); g.ellipse(1110, 800, 340, 500, 0, 0, 7); g.fill();
    character(g, { x: 1110, y: 980, s: 2.0, facing: 1, c: VALDIR_CASA, pose: breathe({ ...POSES.sit, hF: [30, -150], hB: [20, -150], eF: [40, -120] }, t), expr: 'sad', look: [0.2, 0.6], blink: blinkAt(t, 4) });
    g.restore(); if (p.texto) pill(g, E.W / 2, 160, p.texto, pop(t, 0.2), { bg: '#263238' });
  },
  valdir_entende(g, t, info) {
    blurLayer(g, 8, g => street(g, t, { night: true, lamps: [[620, true], [1500, true]] }), { z: 1.4 }, 1); g.fillStyle = 'rgba(0,0,30,.35)'; g.fillRect(0, 0, E.W, E.H);
    g.save(); push(g, t, info, 1, 1.05); bust(g, 620, 470, 220, VALDIR_CASA, { expr: 'sad', talk: talkWho('valdir', info.globalT), blink: blinkAt(t, 2), look: [0.7, -0.3] });
    [['rua', 'RUA', 'rua'], ['poste', 'POSTE', 'poste'], ['remedio', 'REMÉDIO', 'remedio']].forEach(([w, n, ic], i) => { const k = pop(t, wl(info, w, 1 + i)); if (k <= 0) return; g.save(); g.translate(1140 + i * 260, 420 + (i % 2) * 140); g.scale(k, k); oval(g, 0, 0, 120, 120, '#fffdf3', 6); icon[ic](g, 0.9); label(g, n, 0, 165, { size: 46, color: '#fff', stroke: 10 }); g.restore(); });
    g.restore();
  },
  escreve_carta(g, t, info) {
    g.save(); push(g, t, info, 1.2, 1.3, -100, 120); M.sala(g, {});
    character(g, { x: 760, y: 1000, s: 2.3, facing: 1, c: VALDIR_CASA, pose: breathe({ ...POSES.sit, hF: [52 + Math.sin(t * 12) * 6, -140], eF: [34, -116] }, t), expr: 'angry', look: [0.6, 0.6], blink: blinkAt(t, 1) });
    box(g, 820, 780, 520, 40, '#8d6e63', 6, 6); box(g, 900, 700, 260, 80, '#fffdf3', 4, 4); g.restore();
    pill(g, E.W / 2, 140, 'TEIMOSO', pop(t, wl(info, 'teimoso', 1)), { bg: '#e53935' });
  },
  carta_sobe(g, t, info) {
    const y = lerp(900, -300, ease.in(prog(t, 0.4, info.dur)));
    g.save(); g.translate(0, (900 - y) * 0.6); M.sala(g, { box: false }); g.restore(); g.save(); g.translate(0, (900 - y) * 0.6 - 1100); M.ceu(g, t); g.restore();
    M.letter(g, 960, y, 1.6, Math.sin(t * 3) * 0.15, { seal: '#1e88e5', mark: 'V' });
    const lines = ['PREZADO CONTADOR,', 'QUERO O EXTRATO.', 'PRA ONDE FOI', 'CADA REAL?']; lines.forEach((l, i) => { const k = pop(t, 0.3 + i * 0.6 * info.dur / 3); if (k > 0) label(g, l, 300 + i * 0, 200 + i * 90, { size: 54 * k, color: '#fff', stroke: 12, align: 'left' }); });
  },
  rolo_rua(g, t, info) {
    g.save(); push(g, t, info, 1, 1.05); street(g, t, {}); const L = lerp(0, 2400, ease.out(prog(t, 0.1, info.dur)));
    g.save(); g.beginPath(); g.rect(-200, 800, L, 160); g.clip(); box(g, -200, 830, 2600, 120, '#fffdf3', 6, 0); g.fillStyle = '#bdbdbd'; for (let i = 0; i < 40; i++) g.fillRect(-180 + i * 70, 850 + (i % 3) * 28, 50, 10); g.restore();
    oval(g, -200 + L, 890, 70, 70, '#fffdf3', 6); g.restore(); pill(g, E.W / 2, 150, 'UM ROLO DO TAMANHO DA RUA', pop(t, 0.2), { bg: '#5e35b1', size: 58 });
  },
  extrato(g, t, info) {
    bg(g, '#fffdf3'); g.strokeStyle = '#e0e0e0'; g.lineWidth = 3; for (let y = 120; y < E.H; y += 110) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
    const rows = [['posto', 'POSTO DE SAÚDE', 'saude'], ['escola', 'ESCOLA', 'escola'], ['asfalto', 'ASFALTO', 'rua'], ['poste', 'POSTE', 'poste'], ['aposent', 'APOSENTADORIA DA DONA CIDA', 'aposentadoria'], ['juros', 'JUROS DA DÍVIDA', 'juros']];
    const scrollY = key(t, [[0, 0], [info.dur, 120]]); g.save(); g.translate(0, -scrollY);
    rows.forEach(([w, n, ic], i) => { const k = pop(t, wl(info, w, 0.3 + i * 0.8)); if (k <= 0) return; g.save(); g.translate(400, 250 + i * 160); g.scale(k, k); oval(g, 0, 0, 75, 75, '#fff', 5); icon[ic](g, 0.6); label(g, n, 120, 0, { size: 60, color: '#263238', stroke: 0, align: 'left' }); label(g, '✓', 1220, 0, { size: 80, color: '#2e7d32', stroke: 0 }); g.restore(); });
    g.restore(); g.fillStyle = '#5e35b1'; g.fillRect(0, 0, E.W, 130); label(g, 'EXTRATO DO VALDIR — PRA ONDE FOI CADA REAL', E.W / 2, 66, { size: 54, color: '#fff', stroke: 0 });
  },
  extrato_confuso(g, t, info) {
    bg(g, '#fffdf3'); g.save(); push(g, t, info, 1, 1.15); label(g, 'OUTROS ............ R$ ???.???', 960, 420, { size: 70, color: '#263238', stroke: 0 });
    g.strokeStyle = '#e53935'; g.lineWidth = 8; g.beginPath(); for (let i = 0; i < 40; i++) g.lineTo(560 + i * 20, 580 + Math.sin(i * 1.7 + t * 4) * 50); g.stroke(); g.restore();
    bigText(g, 1500, 760, '?', pop(t, 0.5), { size: 260, color: '#ffd23f' });
  },
  lampada(g, t, info) {
    blurLayer(g, 8, g => M.sala(g, {}), { z: 1.3 }, 1); g.save(); push(g, t, info, 1, 1.06); bust(g, 760, 520, 220, VALDIR_CASA, { expr: 'surprised', blink: blinkAt(t, 2), look: [0.4, -0.8] });
    const k = pop(t, 0.3); if (k > 0) { g.save(); g.translate(1280, 260); g.scale(k, k); oval(g, 0, 0, 110, 120, '#fff59d', 7); box(g, -50, 100, 100, 70, '#9e9e9e', 6, 8); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; tube(g, [[Math.cos(a) * 150, Math.sin(a) * 150], [Math.cos(a) * 200, Math.sin(a) * 200]], 10, '#ffd23f', 4); } g.restore(); }
    g.restore();
  },
  roubo_favor_preco(g, t, info) {
    bg(g, '#eceff1'); const cards = [['roubo', 'ROUBO', '#e53935', false], ['favor', 'FAVOR', '#fb8c00', false], ['preco', 'PREÇO', '#2e7d32', true]];
    cards.forEach(([w, n, c, ok], i) => { const tk = wl(info, w, 0.5 + i * 1.2), k = pop(t, tk); if (k <= 0) return; g.save(); g.translate(400 + i * 560, 540); g.scale(k * (ok ? 1.12 : 1), k * (ok ? 1.12 : 1)); box(g, -230, -230, 460, 460, '#fff', 8, 24); label(g, n, 0, -60, { size: 96, color: c, stroke: 0 });
      if (ok) label(g, '✓', 0, 110, { size: 170, color: '#2e7d32', stroke: 0 }); else { g.strokeStyle = '#e53935'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(-90, 30); g.lineTo(90, 190); g.moveTo(90, 30); g.lineTo(-90, 190); g.stroke(); } g.restore(); });
    if (t > wl(info, 'preco', 9)) label(g, 'NÃO É', 400, 140, { size: 70, color: '#263238', stroke: 0 });
  },
  etiquetas(g, t, info) {
    g.save(); push(g, t, info, 1, 1.04); street(g, t, { lamps: [[1500, true]] });
    tag(g, 520, 700, pop(t, wl(info, 'rua', 0.4)), 'RUA', 'rua'); tag(g, 1450, 330, pop(t, wl(info, 'poste', 0.9)), 'POSTE', 'poste'); tag(g, 960, 420, pop(t, wl(info, 'posto', 1.4)), 'POSTO', 'saude');
    const lk = wl(info, 'confere', 3); if (t > lk - 0.3) { const lx = lerp(1700, 1000, ease.inOut(prog(t, lk - 0.3, lk + 0.6))); g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.arc(lx, 450, 110, 0, 7); g.stroke(); tube(g, [[lx + 80, 530], [lx + 200, 650]], 26, '#6d4c41'); }
    g.restore(); pill(g, E.W / 2, 140, 'PREÇO A GENTE CONFERE', pop(t, wl(info, 'confere', 3)), { bg: '#2e7d32', size: 60 });
  },
  paga_sem_ver(g, t, info) {
    blurLayer(g, 8, g => M.mercado(g), { z: 1.3 }, 1); g.save(); push(g, t, info, 1, 1.05);
    character(g, { x: 760, y: 1000, s: 2.5, facing: 1, c: VOCE, pose: breathe(POSES.reach, t), expr: 'neutral', blink: true });
    box(g, 700, 420, 160, 40, INK, 0, 14); for (let i = 0; i < 6; i++) { const tt = (t * 1.3 + i / 6) % 1; coin(g, 1000 + tt * 600, 640 - Math.sin(tt * Math.PI) * 150, 26, t * 8 + i); }
    g.restore(); pill(g, E.W / 2, 140, 'PAGAR SEM VER', pop(t, wl(info, 'ver', 1.5)), { bg: '#263238' });
  },
  dias_1986(g, t, info) {
    bg(g, '#fff3d6'); const base = 900, sc = 3.6, k1 = ease.out(prog(t, wl(info, 'mil', 0.3), wl(info, 'mil', 0.3) + 1)), k2 = ease.out(prog(t, wl(info, 'hoje', 3.5), wl(info, 'hoje', 3.5) + 1));
    const bar = (x, v, k, c, yr) => { box(g, x - 150, base - v * sc * k, 300, Math.max(6, v * sc * k), c, 7, 12); label(g, yr, x, base + 60, { size: 64, color: '#263238', stroke: 0 }); if (k > 0.05) label(g, `${Math.round(v * k)} DIAS`, x, base - v * sc * k - 60, { size: 70, color: c, stroke: 0 }); };
    g.fillStyle = INK; g.fillRect(420, base, 1080, 6); bar(700, 82, k1, '#78909c', '1986'); bar(1220, 150, k2, '#e53935', '2026');
    pill(g, E.W / 2, 120, 'QUASE O DOBRO', pop(t, wl(info, 'dobro', info.dur * 0.8)), { bg: '#1b1b1f', color: '#ffd23f' });
  },
  faixas(g, t, info) {
    bg(g, '#e8eaf6'); label(g, 'DIAS DE TRABALHO PRO IMPOSTO, POR RENDA', E.W / 2, 110, { size: 54, color: '#283593', stroke: 0 });
    const rows = [['tres', 'ATÉ R$ 3 MIL', 134, '#7986cb'], ['entre', 'R$ 3 MIL A R$ 10 MIL', 157, '#e53935']];
    rows.forEach(([w, n, v, c], i) => { const t0 = i === 0 ? wl(info, 'ate', 0.3) : wl(info, 'entre', info.dur * 0.55), k = ease.out(prog(t, t0, t0 + 1)); if (t < t0) return; const y = 330 + i * 300;
      label(g, n, 160, y - 80, { size: 54, color: '#263238', stroke: 0, align: 'left' }); box(g, 160, y - 40, 1500, 120, '#fff', 6, 18); box(g, 160, y - 40, Math.max(30, 1500 * v / 180 * k), 120, c, 6, 18); label(g, `${Math.round(v * k)} DIAS`, 160 + 1500 * v / 180 * k + 30, y + 22, { size: 70, color: c, stroke: 0, align: 'left' }); });
  },
  turma_valdir(g, t, info) {
    g.save(); push(g, t, info, 1, 1.05); street(g, t, {}); M.bus(g, 1100, 1010, 1.3, { driver: g => head(g, 0, 0, 32, { ...VALDIR, expr: 'smile' }) });
    for (let i = 0; i < 5; i++) character(g, { x: 120 + i * 150, y: 1000, s: 1.8, facing: 1, c: POVO[i], pose: breathe(POSES.relaxed, t, 1, i), expr: 'tired' });
    g.restore(); pill(g, E.W / 2, 140, 'A TURMA DO VALDIR', pop(t, 0.1), { bg: '#e53935' }); if (t > wl(info, 'mais', 1.6)) pill(g, E.W / 2, 290, 'A QUE MAIS TRABALHA PRO GOVERNO', pop(t, wl(info, 'mais', 1.6)), { bg: '#1b1b1f', color: '#ffd23f', size: 50, h: 50 });
  },
  calendario30(g, t, info) {
    bg(g, '#ede7f6'); g.save(); push(g, t, info, 1, 1.08); g.save(); g.translate(960, 540); g.rotate(-0.03); box(g, -360, -380, 720, 760, '#fff', 8, 20); box(g, -360, -380, 720, 160, '#5e35b1', 8, 20); label(g, 'DIA', 0, -300, { size: 70, color: '#fff', stroke: 0 });
    const d = Math.min(30, 24 + Math.floor(t * 6)); bigText(g, 0, 60, String(d), 1, { size: 360, color: d === 30 ? '#e53935' : '#263238', stroke: 0 }); g.restore(); g.restore();
    pill(g, E.W / 2, 980, 'ÚLTIMO DIA', pop(t, wl(info, 'ultimo', 1)), { bg: '#e53935' });
  },
  balanca(g, t, info) {
    rays(g, t, '#d1c4e9', '#ede7f6'); const tilt = Math.sin(t * 1.5) * 0.12;
    tube(g, [[960, 900], [960, 300]], 26, '#8d6e63'); g.save(); g.translate(960, 300); g.rotate(tilt); tube(g, [[-520, 0], [520, 0]], 22, '#8d6e63');
    for (const d of [-1, 1]) { g.save(); g.translate(d * 500, 0); g.rotate(-tilt); tube(g, [[0, 0], [-120, 220]], 5, INK, 1); tube(g, [[0, 0], [120, 220]], 5, INK, 1); oval(g, 0, 230, 190, 40, '#bcaaa4', 6);
      if (d < 0) { for (let i = 0; i < 9; i++) coin(g, -100 + (i % 5) * 50, 180 - Math.floor(i / 5) * 40, 30, 0.2); label(g, 'R$ 563 MIL', 0, 330, { size: 56, color: '#fff', stroke: 12 }); }
      else { [['escola', -110], ['remedio', 0], ['poste', 110]].forEach(([ic, x], i) => { g.save(); g.translate(x, 150); icon[ic](g, 0.55); g.restore(); }); label(g, 'TUDO COMO ERA', 0, 330, { size: 56, color: '#fff', stroke: 12 }); }
      g.restore(); } g.restore();
    oval(g, 960, 300, 30, 30, '#ffd23f', 6);
    const tou = wl(info, 'ou', info.dur * 0.6); label(g, t < tou ? 'FICA COM O DINHEIRO...' : '...OU DEVOLVE?', E.W / 2, 110, { size: 70, color: '#5e35b1', stroke: 0 });
  },
  telefone_toca(g, t, info) {
    blurLayer(g, 8, g => M.sala(g, {}), { z: 1.3 }, 1); const sh = Math.sin(t * 50) * 6 * (Math.sin(t * 6) > 0 ? 1 : 0);
    M.phone(g, 960 + sh, 560, 1.7, g => { bg(g, '#1b1b1f'); head(g, 0, -60, 60, { ...MARQUINHOS, expr: 'happy' }); label(g, 'MARQUINHOS', 0, 60, { size: 30, color: '#fff', stroke: 0 }); oval(g, -50, 140, 28, 28, '#e53935', 0); oval(g, 50, 140, 28, 28, '#43a047', 0); });
    for (let i = 0; i < 3; i++) { g.strokeStyle = '#ffd23f'; g.lineWidth = 10; g.beginPath(); g.arc(960, 560, 420 + i * 60 + (t * 80 % 60), -0.5, 0.5); g.stroke(); g.beginPath(); g.arc(960, 560, 420 + i * 60 + (t * 80 % 60), Math.PI - 0.5, Math.PI + 0.5); g.stroke(); }
  },
  telefone(g, t, info, p) {
    g.fillStyle = '#ffe0b2'; g.fillRect(0, 0, E.W / 2, E.H); g.fillStyle = '#c5cae9'; g.fillRect(E.W / 2, 0, E.W / 2, E.H); g.fillStyle = INK; g.fillRect(E.W / 2 - 4, 0, 8, E.H);
    const L = p.fala === 'MARQUINHOS';
    g.save(); g.translate(E.W * 0.25, E.H * 0.5); bust(g, 0, 0, L ? 210 : 180, MARQUINHOS, { expr: 'happy', talk: talkWho('marquinhos', info.globalT), blink: blinkAt(t, 1) }); g.restore();
    g.save(); g.translate(E.W * 0.75, E.H * 0.5); bust(g, 0, 0, L ? 180 : 210, VALDIR_CASA, { expr: L ? 'tired' : 'smug', talk: talkWho('valdir', info.globalT), blink: blinkAt(t, 2), look: [-0.5, 0] }); g.restore();
    if (!L) { const k = pop(t, wl(info, 'asfalto', 0.8)); if (k > 0) { g.save(); g.translate(E.W * 0.75, 160); g.scale(k, k); box(g, -230, -60, 460, 120, '#5f6672', 6, 12); g.fillStyle = '#fafafa'; g.fillRect(-150, -8, 80, 16); g.fillRect(-20, -8, 80, 16); g.fillRect(110, -8, 60, 16); g.restore(); } }
    else pill(g, E.W * 0.25, 150, 'COMPRA UMA HILUX!', pop(t, wl(info, 'hilux', 1.5)), { bg: '#ff7a1a', size: 54 });
  },
  conta_motorista(g, t, info) {
    bg(g, '#fff8e1'); label(g, 'CONTA DE MOTORISTA', E.W / 2, 120, { size: 70, color: '#1565c0', stroke: 0 });
    [['rua', 'rua'], ['escola', 'escola'], ['remedio', 'remedio'], ['aposent', 'aposentadoria'], ['poste', 'poste']].forEach(([w, ic], i) => { const k = pop(t, wl(info, w, 0.4 + i * 0.5)); if (k <= 0) return; g.save(); g.translate(260 + i * 350, 560); g.scale(k, k); oval(g, 0, 0, 140, 140, '#fff', 7); icon[ic](g, 1.0); if (i < 4) label(g, '+', 175, 0, { size: 100, color: '#1b1b1f', stroke: 0 }); g.restore(); });
  },
  nao_paga(g, t, info) {
    bg(g, '#ffebee'); const k = ease.out(prog(t, 0.3, 1.3)), k2 = ease.out(prog(t, 1.0, 2.5)); const base = 900;
    box(g, 520, base - 300 * k, 300, Math.max(6, 300 * k), '#ffd23f', 7, 12); label(g, 'R$ 563 MIL', 670, base - 300 * k - 60, { size: 60, color: '#f9a825', stroke: 0 });
    box(g, 1100, base - 760 * k2, 300, Math.max(6, 760 * k2), '#e53935', 7, 12); label(g, '26 ANOS DE', 1250, base - 760 * k2 - 110, { size: 50, color: '#e53935', stroke: 0 }); label(g, 'RUA, ESCOLA, REMÉDIO...', 1250, base - 760 * k2 - 50, { size: 44, color: '#e53935', stroke: 0 });
    g.fillStyle = INK; g.fillRect(420, base, 1080, 6); pill(g, E.W / 2, 1000, 'NEM PRA UMA FAMÍLIA SÓ', pop(t, wl(info, 'nem', info.dur * 0.7)), { bg: '#1b1b1f', color: '#ffd23f', size: 50, h: 46 });
  },
  devolve(g, t, info) {
    const up = ease.in(prog(t, 0.5, info.dur));
    g.save(); g.translate(0, up * 300); M.ceu(g, t); g.restore();
    character(g, { x: 960, y: 1040, s: 2.4, facing: 1, c: VALDIR_CASA, pose: breathe(POSES.cheer, t), expr: 'smile', front: true, blink: blinkAt(t, 1) });
    g.save(); g.translate(960, 200 - up * 700); box(g, -120, -120, 240, 240, '#c9a46a', 7, 60); label(g, 'R$', 0, 10, { size: 90, color: '#6d4c41', stroke: 0 }); g.restore();
    const tq = wl(info, 'quase', info.dur * 0.7); if (t > tq) { coin(g, 1060, 560, 40, t * 3); pill(g, E.W / 2, 140, 'QUASE TUDO', pop(t, tq), { bg: '#2e7d32' }); }
  },
  conversa_ceu(g, t, info, p) {
    g.fillStyle = '#b39ddb'; g.fillRect(0, 0, E.W, E.H / 2); g.fillStyle = '#6b4e3a'; g.fillRect(0, E.H / 2, E.W, E.H / 2); M.cloud(g, 1500, 360, 1.2, '#fffaff');
    M.cloud(g, 1480, 330, 1.3, '#fffaff'); head(g, 1480, 200, 110, { ...CONTADOR, expr: 'neutral', talk: talkWho('contador', info.globalT), blink: blinkAt(t, 3), look: [-0.6, 0.6] });
    g.save(); g.translate(620, 800); bust(g, 0, 0, 200, VALDIR_CASA, { expr: 'smile', talk: talkWho('valdir', info.globalT), blink: blinkAt(t, 1), look: [0.7, -0.8] }); g.restore();
    if (p.texto) { const k = pop(t, wl(info, 'quatrocentos', 1.5)); if (k > 0) { g.save(); g.translate(1100, 640); g.scale(k, k); box(g, -190, -80, 380, 160, '#ffd23f', 7, 16); label(g, 'R$ 480', 0, 6, { size: 90, color: '#1b1b1f', stroke: 0 }); g.restore(); } }
    if (p.cerveja) { const k = pop(t, wl(info, 'cerveja', 1.0)); if (k > 0) { g.save(); g.translate(1100, 640); g.scale(k, k); box(g, -60, -120, 120, 240, '#ffca28', 7, 20); box(g, -60, -30, 120, 70, '#e53935', 5, 0); g.restore(); } pill(g, 1100, 900, '= ÓCULOS DA BIA', pop(t, wl(info, 'deixa', info.dur * 0.8)), { bg: '#ec407a', size: 54 }); }
  },
  pastas(g, t, info) {
    g.save(); push(g, t, info, 1.25, 1.35, 0, -120); M.ceu(g, t); character(g, { x: 960, y: 900, s: 2.3, facing: 1, c: CONTADOR, pose: breathe(POSES.holdFront, t), expr: 'smile', front: true, blink: blinkAt(t, 1), look: [0, 0.6] }); M.mesaContador(g, 960, 1000);
    const k = ease.inOut(prog(t, 0.3, 1.2)); box(g, 760, 640 - k * 40, 300, 180, '#90caf9', 6, 6); label(g, 'VALDIR ✓', 910, 720 - k * 40, { size: 40, color: '#0d47a1', stroke: 0 });
    if (t > wl(info, 'abriu', 2)) { box(g, 1000, 640, 320, 190, '#ffb74d', 6, 6); label(g, 'PRÓXIMO', 1160, 735, { size: 40, color: '#4e342e', stroke: 0 }); }
    g.restore();
  },
  botao_malha(g, t, info) {
    bg(g, '#263238'); const press = wl(info, 'malha', info.dur * 0.8), dn = t > press ? Math.min(1, (t - press) * 6) : 0;
    g.save(); push(g, t, info, 1, 1.15); oval(g, 960, 700, 380, 120, '#455a64', 8); oval(g, 960, 640 + dn * 30, 300, 110, '#e53935', 8); oval(g, 960, 620 + dn * 30, 300, 100, '#ef5350', 0); label(g, 'MALHA FINA', 960, 625 + dn * 30, { size: 64, color: '#fff', stroke: 0 });
    const fy = lerp(-100, 470 + dn * 30, ease.out(prog(t, 0.2, 1.2))); tube(g, [[960, -300], [960, fy]], 70, CONTADOR.skin); g.restore();
    if (t > press) { g.fillStyle = `rgba(229,57,53,${0.3 * (Math.sin(t * 12) * 0.5 + 0.5)})`; g.fillRect(0, 0, E.W, E.H); }
  },
  rua_domingo(g, t, info) {
    g.save(); push(g, t, info, 1, 1.05); street(g, t, { lamps: [[1060, true]] }); for (let i = 0; i < 3; i++) M.cloud(g, (t * 30 + i * 700) % 2200 - 100, 120 + i * 40, 0.7);
    g.restore(); pill(g, 330, 150, 'DOMINGO, 10H', pop(t, 0.1), { bg: '#1e88e5', size: 62 });
    if (t > wl(info, 'poste', 1.2)) pill(g, E.W / 2, 290, 'POSTE ACESO ✓', pop(t, wl(info, 'poste', 1.2)), { bg: '#2e7d32', size: 54, h: 50 });
    if (t > wl(info, 'rua', 2.0, 0)) pill(g, E.W / 2 + 500, 290, 'RUA ASFALTADA ✓', pop(t, wl(info, 'rua', 2.0, 0)), { bg: '#2e7d32', size: 54, h: 50 });
  },
  padaria_inteiro(g, t, info) {
    const cam = { z: 1.3, x: 120, y: -40 }; layer(g, cam, 0.85, backWall);
    layer(g, cam, 1, g => { person(g, { k: 'NENE', x: 1400, y: 960, facing: -1, pose: 'holdFront', expr: 'smile' }, t, info); counter(g); glassCup(g, 1160, CT + 4, 1.7, 0.95); person(g, { k: 'VALDIR', x: 640, expr: 'happy' }, t, info); });
    pill(g, E.W / 2, 140, 'INTEIRO', pop(t, wl(info, 'inteiro', 1.2)), { bg: '#2e7d32' });
  },
  rua_noite_acesa(g, t, info) {
    g.save(); push(g, t, info, 1, 1.06); street(g, t, { night: true, lamps: [[180, true], [620, true], [1060, true], [1500, true], [1940, true]] });
    const x = lerp(400, 1300, prog(t, 0, info.dur)), ph = t * 1.6 * Math.PI * 2;
    character(g, { x, y: 1000, s: 2.0, facing: 1, c: VALDIR, pose: breathe(M.POSES ? POSES.relaxed : POSES.relaxed, t), expr: 'smile' });
    g.restore(); if (t > wl(info, 'sabe', 2, 1)) pill(g, E.W / 2, 150, 'E SABE O QUE PERGUNTAR', pop(t, wl(info, 'sabe', 2, 1)), { bg: '#283593', size: 58 });
  },
  cupom_carteira(g, t, info) {
    bg(g, '#ffe0b2'); g.save(); push(g, t, info, 1, 1.1);
    const out = ease.out(prog(t, 0.2, 1.0)); box(g, 560, 560, 800, 420, '#6d4c41', 8, 30); M.receipt(g, 960, lerp(700, 420, out), 6.5, -0.05);
    box(g, 520, 680, 880, 340, '#8d6e63', 8, 30); g.restore();
    const tr = wl(info, 'rodape', 1.5); if (t > tr) { g.strokeStyle = '#e53935'; g.lineWidth = 12; g.beginPath(); g.ellipse(960, 610, 200, 70, 0, 0, Math.PI * 2 * ease.out(prog(t, tr, tr + 0.5))); g.stroke(); }
    pill(g, E.W / 2, 140, 'OLHA O RODAPÉ', pop(t, tr), { bg: '#e53935' });
  },
  comenta(g, t, info) {
    rays(g, t); bigText(g, E.W / 2, 330, 'QUANTO FOI DE IMPOSTO?', pop(t, 0), { size: 100, color: '#fff' });
    const k = pop(t, 0.4); if (k > 0) { g.save(); g.translate(E.W / 2, 600); g.scale(k, k); box(g, -560, -100, 1120, 200, '#fff', 8, 30); label(g, 'CONTA AÍ EMBAIXO', 0, 6, { size: 96, color: '#e53935', stroke: 0 }); g.restore(); }
    for (let i = 0; i < 3; i++) M.arrowDown(g, 660 + i * 300, 860 + Math.sin(t * 6 + i) * 20, 1.3, '#e53935');
  },
};
for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

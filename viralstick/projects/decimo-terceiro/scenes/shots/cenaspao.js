// cenaspao.js — cenas de "Por que o pão francês não existe na França?"
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, label, box, oval, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, wl, pop, push, bg, rays, pill, bigText, drawSet, person, M, PF, POSES, posesAt, breathe } from '../lib.js';
import { counter } from '../sets/padaria.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);
const BR = [[300, 40], [420, 30], [520, 90], [640, 120], [760, 180], [800, 260], [770, 330], [700, 420], [660, 520], [600, 600], [520, 660], [450, 760], [380, 700], [390, 600], [320, 540], [250, 520], [180, 430], [120, 380], [80, 300], [140, 220], [220, 160], [250, 90]];

const K = {
  // pãozinho gigante; estala na palavra 'craque'
  pao_close(g, t, info, p) {
    const tc = at(info, p.em || 'craque', info.dur * 0.6), hit = t > tc;
    if (p.fundo === 'padaria') { blurLayer(g, 8, g => drawSet(g, 'padaria', t, {}), { z: 1.4 }, 1); } else rays(g, t, '#f9a825', '#ffd54f');
    const sh = hit ? Math.sin((t - tc) * 60) * 10 * Math.max(0, 1 - (t - tc) * 3) : 0;
    g.save(); g.translate(sh, 0); PF.pao(g, 960, 560, 5.2, -0.05, hit ? ease.out(prog(t, tc, tc + 0.2)) : 0);
    if (p.manteiga) { oval(g, 960, 470, 90, 26, '#fff59d', 4); }
    g.restore();
    if (hit && p.som !== false) bigText(g, 1450, 260, 'CRAQUE!', pop(t, tc), { size: 130, color: '#fff' });
    if (p.texto) pill(g, E.W / 2, 980, p.texto, pop(t, at(info, p.textoEm, 0.3)), { bg: '#5d4037', size: 58 });
  },
  // forno com a fornada saindo às 6h
  forno(g, t, info, p) {
    drawSet(g, p.noite ? 'padaria_noite' : 'padaria', t, {});
    g.save(); push(g, t, info, 1.0, 1.06);
    box(g, 360, 280, 900, 640, '#78909c', 8, 20); box(g, 420, 340, 780, 420, '#263238', 6, 10);
    const q = ease.out(prog(t, at(info, p.em, 0.4), at(info, p.em, 0.4) + 1.0));
    g.save(); g.translate(lerp(0, 700, p.sai ? q : 0), 0); box(g, 460, 600, 700, 26, '#b0bec5', 4, 4); for (let i = 0; i < 8; i++) PF.pao(g, 510 + i * 86, 580, 0.5, 0); g.restore();
    g.fillStyle = 'rgba(255,152,0,.25)'; g.fillRect(420, 340, 780, 420);
    for (let i = 0; i < 4; i++) { const u = ((t * 0.5 + i * 0.25) % 1); g.globalAlpha = 1 - u; oval(g, 600 + i * 150, 300 - u * 220, 40 + u * 30, 26, '#eeeeee', 0); g.globalAlpha = 1; }
    g.restore();
    if (p.hora) pill(g, 1550, 200, p.hora, pop(t, 0.2), { bg: '#212121', size: 80 });
    if (p.texto) pill(g, E.W / 2, 1010, p.texto, pop(t, at(info, p.textoEm, 0.5)), { bg: '#c62828', size: 56 });
  },
  // Nenê e Luc na esquina de Paris, com a cesta
  paris_cena(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]), p.cx || 0, p.cy || 0);
    drawSet(g, p.fila ? 'paris_fila' : 'paris', t, { placa: p.placa });
    if (p.luc !== false) person(g, { k: 'LUC', x: p.lucX || 980, y: 1000, facing: -1, expr: p.lucExpr || 'confused', pose: p.lucPose }, t, info);
    if (p.nene !== false) { person(g, { k: 'NENE', x: p.neneX || 560, y: 1000, facing: 1, expr: p.neneExpr || 'smile', pose: p.nenePose || 'holdFront' }, t, info); if (p.cesta !== false) PF.cesta(g, (p.neneX || 560) + 110, 760, 0.8, p.paes ?? 6); }
    g.restore();
    if (p.texto) pill(g, E.W / 2, 120, p.texto, pop(t, at(info, p.textoEm, 0.3)), { bg: p.textoCor || '#1a237e', size: 58 });
  },
  // baguete x pão francês
  versus(g, t, info, p) {
    bg(g, '#fff8e1');
    const a = pop(t, 0.2), b = pop(t, at(info, p.em, 1.0));
    if (a > 0) { g.save(); g.translate(500, 480); g.scale(a, a); PF.baguete(g, 0, 0, 1.2, -0.08); g.restore(); pill(g, 500, 760, 'BAGUETE (FRANÇA)', a, { bg: '#1a237e', size: 50 }); label(g, 'COMPRIDA • CASCA GROSSA', 500, 860, { size: 38, color: '#37474f', stroke: 0 }); }
    if (b > 0) { g.save(); g.translate(1450, 480); g.scale(b, b); PF.pao(g, 0, 0, 2.2, 0); g.restore(); pill(g, 1450, 760, 'PÃO FRANCÊS (BRASIL)', b, { bg: '#2e7d32', size: 50 }); label(g, 'PEQUENO • CASCA FINA • MIOLO MACIO', 1450, 860, { size: 34, color: '#37474f', stroke: 0 }); }
    bigText(g, 960, 470, 'X', pop(t, 0.6), { size: 120, color: '#c62828' });
  },
  // mapa dos nomes do pão pelo Brasil
  mapa_nomes(g, t, info, p) {
    bg(g, '#0d47a1'); g.save(); push(g, t, info, 1.0, 1.05, 100, -40);
    g.save(); g.translate(560, 120); g.scale(1.2, 1.2); polyO(g, BR, '#43a047', 7); g.restore();
    const N = [['CACETINHO', 'RS', 560 + 400 * 1.2, 120 + 720 * 1.2, 'cacetinho'], ['PÃO DE SAL', 'MG', 560 + 640 * 1.2, 120 + 500 * 1.2, 'minas'], ['CARIOQUINHA', 'CE', 560 + 720 * 1.2, 120 + 200 * 1.2, 'ceara'], ['PÃOZINHO', 'SP', 560 + 560 * 1.2, 120 + 600 * 1.2, 'paulo']];
    N.forEach(([n, uf, x, y, w], i) => { const q = pop(t, at(info, (p.em || [])[i] ?? w, 0.4 + i * 0.6)); if (q <= 0) return; oval(g, x, y, 16, 16, '#ffd23f', 5); g.save(); g.translate(x + (i % 2 ? 60 : -60), y - 70); g.scale(q, q); pill(g, 0, 0, n + ' (' + uf + ')', 1, { bg: '#212121', size: 40 }); g.restore(); });
    g.restore();
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, 0.2), { bg: '#ffd23f', color: INK, size: 56 });
  },
  // a padaria do Nenê com o balcão (wrap de cena com pães sobrando)
  balcao(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]), p.cx || 0, p.cy || 0);
    drawSet(g, 'padaria', t, {});
    (p.chars || []).filter(c => c.k === 'NENE').forEach(ch => person(g, { ...ch, y: ch.y ?? 960 }, t, info));
    counter(g);
    for (let i = 0; i < (p.sobra || 0); i++) PF.pao(g, 1020 + (i % 6) * 110, 640 - Math.floor(i / 6) * 40, 0.6, -0.1 + i * 0.05);
    (p.chars || []).filter(c => c.k !== 'NENE').forEach(ch => person(g, ch, t, info));
    g.restore();
    if (p.texto) pill(g, E.W / 2, 120, p.texto, pop(t, at(info, p.textoEm, 0.3)), { bg: p.textoCor || '#5d4037', size: 58 });
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

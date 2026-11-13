// cenasescala.js — cenas de "A última semana da escala 6x1"
// tela do Suporte: fixa para este vídeo (outros arquivos de cenas tentam trocar; o setter ignora)
globalThis.NOME_MERCADO = 'SUPERMERCADO BOM PREÇO';
const TELA6 = ['PEDIDO 2026/6x1', 'UM DIA A MAIS', 'DE FOLGA'];
Object.defineProperty(globalThis, 'TELA_SUPORTE', { get: () => TELA6, set: () => {}, configurable: true });
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { label, box, oval, head, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, wl, pop, push, bg, pill, bigText, drawSet, person, ES } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);
const DIAS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

const K = {
  // grade da semana. p.linhas = [[nome, 'TTTTTFT' (T trabalho, F folga), em]], p.titulo, p.rodape, p.rodapeEm, p.marca (índice do dia em destaque)
  semana(g, t, info, p) {
    bg(g, p.fundo || '#eceff1'); if (p.titulo) bigText(g, E.W / 2, 100, p.titulo, pop(t, 0.05), { size: 72, color: '#263238', stroke: 0 });
    const L = p.linhas || [], cw = 212, rh = Math.min(175, 620 / Math.max(1, L.length)), x0 = 365, y0 = 200;
    DIAS.forEach((d, j) => { box(g, x0 + j * cw + 6, y0, cw - 12, 76, j === p.marca ? '#ffd23f' : '#455a64', 5, 8); label(g, d, x0 + j * cw + cw / 2, y0 + 39, { size: 46, color: j === p.marca ? INK : '#fff', stroke: 0 }); });
    L.forEach(([nome, cod, em], i) => {
      const q = pop(t, at(info, em, 0.25 + i * 0.3)); if (q <= 0) return; const y = y0 + 96 + i * rh;
      g.save(); g.globalAlpha = clamp(q); label(g, nome, x0 - 30, y + rh / 2 - 6, { size: Math.min(50, rh * 0.4), color: INK, stroke: 0, align: 'right' }); g.restore();
      [...cod].forEach((c, j) => { const k = pop(t, at(info, em, 0.25 + i * 0.3) + j * 0.05); if (k <= 0) return; const folga = c === 'F';
        g.save(); g.translate(x0 + j * cw + cw / 2, y + rh / 2 - 6); g.scale(k, k);
        box(g, -cw / 2 + 8, -rh / 2 + 8, cw - 16, rh - 16, folga ? '#43a047' : '#cfd8dc', 5, 10);
        label(g, folga ? 'FOLGA' : 'TRAB.', 0, 2, { size: Math.min(42, rh * 0.3), color: folga ? '#fff' : '#546e7a', stroke: 0 }); g.restore(); });
    });
    if (p.rodape) pill(g, E.W / 2, 990, p.rodape, pop(t, at(info, p.rodapeEm, info.dur * 0.6)), { bg: p.rodapeCor || '#e53935', size: 54 });
  },
  // apresentação da árvore. p.set ('palco' ou 'casa_josi'), p.arvores = [{k, x, expr}], p.plateia = [chars], p.texto
  arvore(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]));
    drawSet(g, p.set || 'palco', t, {});
    const yA = p.set === 'palco' ? 640 : 1000;
    for (const a of p.arvores || []) {
      const c = CAST[a.k], who = WHO[a.k];
      ES.arvore(g, a.x, yA, a.s || 1, g => head(g, 0, 0, 78, { ...c, expr: a.expr || 'smile', talk: talkWho(who, info.globalT), blink: blinkAt(t, a.x % 5), front: true }), t);
    }
    (p.plateia || []).forEach(ch => person(g, ch, t, info));
    g.restore();
    if (p.texto) pill(g, E.W / 2, p.set === 'palco' ? 1000 : 150, p.texto, pop(t, at(info, p.textoEm, 0.3)), { size: 60 });
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

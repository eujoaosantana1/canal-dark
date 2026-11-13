// cenassal.js — cenas de "Um mês inteiro com R$ 1.621"
globalThis.TELA_SUPORTE = ['PEDIDO 2026/1621', 'SALÁRIO ATÉ O FIM', 'DO MÊS'];
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, label, box, oval, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, wl, pop, push, bg, rays, pill, bigText, drawSet, person, bust, M, SM, POSES, posesAt, breathe } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);
const brl = v => v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function item(g, nome, s = 1) {
  g.save(); g.scale(s, s);
  if (nome === 'onibus') M.bus(g, 0, 150, 0.75, { sign: 'GUAIANASES' });
  else if (nome === 'botijao') SM.botijao(g, 0, 160, 1.6);
  else if (nome === 'casa') { polyO(g, [[-200, -40], [0, -200], [200, -40]], '#e57373', 7); box(g, -170, -40, 340, 220, '#ffe0b2', 7, 6); box(g, -40, 60, 80, 120, '#8d6e63', 5, 4); box(g, 70, 10, 70, 60, '#90caf9', 5, 4); }
  else if (nome === 'cesta') { box(g, -200, -20, 400, 190, '#a1887f', 7, 20); for (const [x, y, w, h, c] of [[-150, -150, 70, 140, '#fff'], [-60, -110, 90, 100, '#fdd835'], [50, -170, 60, 160, '#e53935'], [120, -100, 60, 90, '#43a047']]) box(g, x, y, w, h, c, 5, 8); }
  else if (nome === 'lanche') { oval(g, 0, -40, 180, 70, '#ffb74d', 7); R(g, -170, -10, 340, 26, '#43a047'); R(g, -170, 14, 340, 26, '#6d4c41'); oval(g, 0, 70, 180, 50, '#ffb74d', 7); }
  else if (nome === 'relogio') { oval(g, 0, 0, 170, 170, '#ffffff', 8); tube(g, [[0, 0], [0, -110]], 12, INK, 0); tube(g, [[0, 0], [80, 30]], 12, INK, 0); }
  g.restore();
}

const K = {
  // preço convertido em horas de trabalho. p: item, preco, horas, emH (palavra), fundo
  horas(g, t, info, p) {
    bg(g, p.fundo || '#263238'); g.save(); push(g, t, info, 1.0, 1.05);
    const q = pop(t, 0.1); if (q > 0) { g.save(); g.translate(560, 520); g.scale(q, q); item(g, p.item); g.restore(); }
    pill(g, 560, 860, p.preco, pop(t, 0.35), { bg: '#e53935', size: 70 });
    const th = at(info, p.emH, Math.min(1.2, info.dur * 0.45)), k = pop(t, th);
    if (k > 0) { label(g, '=', 1060, 540, { size: 160 * k, color: '#ffd23f', stroke: 16 }); g.save(); g.translate(1460, 520); g.scale(k, k); label(g, p.horas, 0, 0, { size: p.horas.length > 7 ? 120 : 160, color: '#fff', stroke: 18 }); label(g, 'DE TRABALHO', 0, 120, { size: 52, color: '#ffd23f', stroke: 8 }); g.restore(); }
    g.restore();
  },
  // app do banco: salário e descontos. p.linhas = [[texto, valor, cor, em]]
  extrato(g, t, info, p) {
    blurLayer(g, 8, g => drawSet(g, p.fundo || 'comodo', t, {}), { z: 1.3 }, 1);
    g.save(); push(g, t, info, 1.0, 1.07);
    M.phone(g, 960, 560, 2.3, g => {
      bg(g, '#f5f5f5'); box(g, -95, -180, 190, 60, '#6a1b9a', 0, 0); label(g, 'MEU BANCO', 0, -150, { size: 24, color: '#fff', stroke: 0 });
      (p.linhas || []).forEach(([txt, val, cor, em], i) => { const q = pop(t, at(info, em, 0.3 + i * 0.6)); if (q <= 0) return; g.save(); g.globalAlpha = clamp(q);
        label(g, txt, -80, -95 + i * 62, { size: 15, color: '#616161', stroke: 0, align: 'left', font: 'Nunito', weight: 800 }); label(g, val, 82, -70 + i * 62, { size: 24, color: cor || INK, stroke: 0, align: 'right', font: 'Nunito', weight: 900 }); g.restore(); });
    });
    g.restore();
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, 0.2), { bg: '#212121', size: 56 });
  },
  // saldo caindo com a fila de contas. p.ini, p.itens=[[nome,valor,em]], p.ate (quantos mostrar), p.desde (já pagos antes)
  saldo(g, t, info, p) {
    bg(g, '#1b2631'); const its = (p.itens || []).slice(0, p.ate ?? 99); let s = p.ini;
    label(g, 'SOBRA', 1450, 210, { size: 60, color: '#90a4ae', stroke: 0 });
    its.forEach(([nome, v, em], i) => {
      const old = i < (p.desde || 0); const te = old ? -1 : at(info, em, 0.4 + (i - (p.desde || 0)) * 1.0); const q = old ? 1 : pop(t, te);
      if (q <= 0) return; if (t > te + 0.2) s -= v;
      const y = 200 + i * 125; g.save(); g.translate(130, y); g.globalAlpha = old ? 0.55 : 1; g.scale(1, clamp(q));
      box(g, 0, -45, 760, 100, '#ffffff', 6, 18); label(g, nome, 30, 6, { size: 48, color: INK, stroke: 0, align: 'left' }); label(g, '− ' + brl(v), 730, 6, { size: 48, color: '#e53935', stroke: 0, align: 'right', font: 'Nunito', weight: 900 }); g.restore();
    });
    const cor = s < 400 ? '#ff7043' : '#69f0ae';
    label(g, 'R$ ' + brl(Math.max(0, s)), 1450, 470, { size: 130, color: cor, stroke: 14 });
    if (p.texto) pill(g, 1450, 760, p.texto, pop(t, at(info, p.textoEm, info.dur * 0.6)), { bg: '#e53935', size: 54 });
  },
  // conta de dividir. p.passos = [[texto, em]]
  conta(g, t, info, p) {
    bg(g, p.fundo || '#fffde7'); g.save(); push(g, t, info, 1.0, 1.05);
    for (let y = 120; y < E.H; y += 70) R(g, 0, y, E.W, 3, '#bbdefb'); R(g, 220, 0, 4, E.H, '#ef9a9a');
    (p.passos || []).forEach(([tx, em], i) => { const q = pop(t, at(info, em, 0.3 + i * 1.1)); if (q <= 0) return; g.save(); g.translate(E.W / 2, 300 + i * 220); g.scale(q, q); label(g, tx, 0, 0, { size: i === p.passos.length - 1 ? 130 : 100, color: i === p.passos.length - 1 ? '#c62828' : '#263238', stroke: 0 }); g.restore(); });
    g.restore();
  },
  // calendário do mês. p.n (dias), p.marcas = {dia: [texto, cor]}, p.riscar (até que dia), p.destaque, p.titulo
  mes(g, t, info, p) {
    bg(g, p.fundo || '#eceff1'); g.save(); push(g, t, info, 1.0, 1.05);
    const n = p.n || 30, cols = 7, cw = 200, ch = n > 21 ? 150 : 190, x0 = E.W / 2 - cols * cw / 2, y0 = 230;
    box(g, x0 - 20, 120, cols * cw + 40, 100, p.n === 18 ? '#6a1b9a' : '#e53935', 7, 14); label(g, p.titulo || 'O MÊS DA TAINÁ', E.W / 2, 172, { size: 60, color: '#fff', stroke: 0 });
    const rr = p.riscar ? Math.round(lerp(p.riscarDe || 1, p.riscar, ease.inOut(prog(t, 0.3, Math.max(0.8, info.dur * 0.7))))) : 0;
    for (let d = 1; d <= n; d++) {
      const i = d - 1, x = x0 + (i % cols) * cw, y = y0 + Math.floor(i / cols) * ch, mk = (p.marcas || {})[d], dest = p.destaque === d;
      box(g, x + 6, y + 6, cw - 12, ch - 12, mk ? mk[1] : '#ffffff', 5, 10); label(g, String(d), x + 40, y + 42, { size: 40, color: mk ? '#fff' : INK, stroke: 0 });
      if (mk) label(g, mk[0], x + cw / 2, y + ch - 40, { size: 28, color: '#fff', stroke: 0 });
      if (d <= rr && !mk) { g.strokeStyle = 'rgba(198,40,40,.8)'; g.lineWidth = 10; g.beginPath(); g.moveTo(x + 30, y + 30); g.lineTo(x + cw - 30, y + ch - 30); g.moveTo(x + cw - 30, y + 30); g.lineTo(x + 30, y + ch - 30); g.stroke(); }
      if (dest) { const q = pop(t, at(info, p.destaqueEm, 0.4)); if (q > 0) { g.strokeStyle = '#ffd23f'; g.lineWidth = 14 * q; g.strokeRect(x + 2, y + 2, cw - 4, ch - 4); } }
    }
    g.restore();
    if (p.texto) pill(g, E.W / 2, E.H - 70, p.texto, pop(t, at(info, p.textoEm, 0.5)), { bg: '#212121', size: 52 });
  },
  // geladeira aberta, close
  geladeira2(g, t, info, p) {
    g.save(); const zz = key(t, [[0, 1.45], [info.dur, 1.55]]); g.translate(760, 600); g.scale(zz, zz); g.translate(-150, -560); drawSet(g, 'comodo_noite', t, { aberta: ease.out(prog(t, 0.3, 1.1)) }); g.restore();
    if (p.texto) pill(g, E.W / 2 + 250, 120, p.texto, pop(t, at(info, p.textoEm, 1.2)), { bg: '#212121', size: 54 });
  },
  // pedido subindo pro céu
  pedido(g, t, info, p) {
    const k = (p.voo ?? 0.55) >= 1 ? 0 : ease.inOut(prog(t, info.dur * (p.voo ?? 0.55), info.dur));
    drawSet(g, k > 0.5 ? 'reparticao' : 'comodo_noite', t, {});
    g.save(); g.translate(E.W / 2, lerp(560, -400, k)); g.rotate(Math.sin(t * 2) * 0.05); const s = 1.7;
    box(g, -330 * s / 1.7, -260, 660, 520, '#fffdf3', 7, 8);
    (p.linhas || []).forEach((l, i) => { const q = clamp(prog(t, 0.3 + i * 0.7, 0.9 + i * 0.7)); if (q <= 0) return; g.save(); g.globalAlpha = q; label(g, l, -290, -190 + i * 72, { size: 40, color: '#283593', stroke: 0, align: 'left', font: 'Nunito', weight: 800 }); g.restore(); });
    g.restore();
  },
  // Davi paga uma hora da mãe com o cofrinho
  moedas(g, t, info, p) {
    g.save(); push(g, t, info, 1.05, 1.15, 0, 60); drawSet(g, 'comodo_noite', t, { cofrinho: false });
    person(g, { k: 'TAINA_CASA', x: 1200, facing: -1, expr: p.exprT || 'smile', pose: 'relaxed' }, t, info);
    person(g, { k: 'DAVI', x: 780, facing: 1, pose: 'holdFront', expr: 'happy' }, t, info);
    SM.cofrinho(g, 600, 1000, 0.8, 1);
    const r = rng(3); for (let i = 0; i < 12; i++) oval(g, 520 + r() * 220, 990 - r() * 10, 16, 7, r() > 0.5 ? '#ffd54f' : '#bdbdbd', 3);
    g.restore();
    const v = Math.min(7.37, 7.37 * prog(t, 0.6, 2.2)); if (t > 0.5) pill(g, 960, 150, 'R$ ' + brl(v), pop(t, 0.5), { bg: '#2e7d32', size: 80 });
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

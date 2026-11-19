// cenas72.js — cenas específicas de "E se a internet parasse por 72 horas"
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, head, label, box, oval, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, wl, pop, push, bg, rays, pill, bigText, drawSet, person, M, MJ, POSES, posesAt, breathe } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);

function moto(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  oval(g, -150, -60, 62, 62, '#212121', 8); oval(g, -150, -60, 26, 26, '#9e9e9e', 5); oval(g, 170, -60, 62, 62, '#212121', 8); oval(g, 170, -60, 26, 26, '#9e9e9e', 5);
  polyO(g, [[-120, -110], [120, -120], [170, -60], [80, -60], [-60, -70]], '#e53935', 6); box(g, -170, -210, 150, 110, '#ffd23f', 6, 10); label(g, 'ENTREGA', -95, -155, { size: 26, color: '#c62828', stroke: 0 });
  tube(g, [[120, -120], [150, -200]], 10, '#424242', 4); g.restore();
}
function caminhao(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -420, -380, 560, 300, '#eceff1', 7, 10); label(g, 'DISTRIBUIDORA', -140, -230, { size: 44, color: '#1565c0', stroke: 0 });
  box(g, 150, -300, 220, 220, '#1565c0', 7, 18); box(g, 190, -270, 130, 90, '#bbdefb', 5, 8);
  for (const wx of [-300, -120, 260]) { oval(g, wx, -60, 62, 62, '#212121', 8); oval(g, wx, -60, 24, 24, '#9e9e9e', 5); }
  g.restore();
}
function geladeira(g, x, y, s = 1, folha = 0, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, -230, -760, 460, 760, '#eceff1', 7, 26); R(g, -226, -480, 452, 8, INK); box(g, 170, -700, 22, 160, '#b0bec5', 4, 8); box(g, 170, -440, 22, 200, '#b0bec5', 4, 8);
  if (folha > 0) { g.save(); g.translate(-30, -640 + (1 - folha) * -60); g.rotate(-0.04); g.globalAlpha = clamp(folha * 2);
    box(g, -150, -10, 300, 400, '#fffdf3', 5, 4); label(g, 'TELEFONES', 0, 30, { size: 34, color: '#c62828', stroke: 0 });
    const L = ['VÔ JURA', 'MÃE', 'PAI', 'TIA ROSE', 'DONA LURDES', 'ESCOLA']; L.forEach((n, i) => { label(g, n, -130, 90 + i * 50, { size: 24, color: '#1a237e', stroke: 0, align: 'left', font: 'Nunito', weight: 800 }); label(g, '9' + (8765 - i * 111) + '-' + (4321 + i * 7), 130, 90 + i * 50, { size: 22, color: '#1a237e', stroke: 0, align: 'right', font: 'Nunito', weight: 800 }); });
    oval(g, 0, -12, 18, 18, '#e53935', 4); g.restore(); }
  g.restore();
}
function nota(g, x, y, s, rot = 0, val = '50') {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); box(g, -170, -80, 340, 160, '#ffb74d', 6, 10); oval(g, -90, 0, 52, 52, '#ffe0b2', 4); label(g, 'R$ ' + val, 70, 6, { size: 52, color: '#5d4037', stroke: 0 }); g.restore();
}

const K = {
  // maquininha: "processando" -> "SEM CONEXÃO" na palavra 'conexão'
  maquininha(g, t, info, p) {
    blurLayer(g, 8, g => { M.mercado(g); }, { z: 1.4, x: -200 }, 1);
    const off = at(info, p.em || 'conexao', info.dur * 0.6);
    const pisca = Math.floor(t * 3) % 2;
    g.save(); push(g, t, info, 1.0, 1.12, 0, 0);
    tube(g, [[1500, 1200], [1260, 760]], 60, CAST.CLIENTE.skin, 6);
    MJ.maquininha(g, 960, 560, 1.45, t < off ? (p.antes || 'APROXIME\nO CARTÃO' + (pisca ? '.' : '..')) : 'SEM\nCONEXÃO', t < off ? '#69f0ae' : '#ff5252');
    g.restore();
    if (t > off) { g.fillStyle = `rgba(229,57,53,${0.18 * (Math.sin(t * 10) * 0.5 + 0.5)})`; g.fillRect(0, 0, E.W, E.H); }
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, 0.2), { bg: '#212121', size: 56 });
  },
  // técnico puxa o cabo da tomada "INTERNET"; tudo apaga
  puxa_cabo(g, t, info, p) {
    const pull = at(info, p.em || 'puxou', info.dur * 0.45), q = ease.inOut(prog(t, pull, pull + 0.5));
    M.ceu(g, t);
    box(g, 1160, 360, 360, 420, '#eceff1', 8, 30); oval(g, 1300, 520, 34, 60, INK, 0); oval(g, 1390, 520, 34, 60, INK, 0); label(g, 'INTERNET', 1340, 690, { size: 50, color: '#c62828', stroke: 0 });
    const px = lerp(1180, 520, q), py = lerp(570, 640, q);
    tube(g, [[-100, 900], [200, 820], [px - 160, py + 20]], 40, '#212121', 6);
    box(g, px - 180, py - 110, 190, 220, '#424242', 7, 22); box(g, px + 10, py - 50, 70, 26, '#bdbdbd', 4, 4); box(g, px + 10, py + 24, 70, 26, '#bdbdbd', 4, 4);
    tube(g, [[px - 120, py - 300], [px - 90, py - 110]], 90, CAST.TECNICO.skin, 7);
    if (q > 0 && q < 1) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 9; tube(g, [[1250, 520], [1250 + Math.cos(a) * 120, 520 + Math.sin(a) * 120]], 8, '#ffd23f', 0); }
    if (t > pull + 0.5) { g.fillStyle = `rgba(5,5,20,${clamp((t - pull - 0.5) * 1.2) * 0.85})`; g.fillRect(0, 0, E.W, E.H); }
    if (p.texto) pill(g, E.W / 2, 130, p.texto, pop(t, 0.3), { bg: '#c62828', size: 60 });
  },
  // gente sentada na calçada ouvindo o rádio do Jura
  radio_calcada(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.07); MJ.fachada(g, {});
    character(g, { x: 960, y: 1000, s: 2.3, facing: 1, c: CAST.JURA, pose: breathe(POSES.sit, t), expr: 'smile', blink: blinkAt(t, 1) });
    MJ.radio(g, 1110, 1000, 1.1, t, true);
    const pal = [CAST.LURDES, CAST.MOTOBOY, CAST.CLIENTE, CAST.MOTORISTA, CAST.CAIXA, CAST.DUDA];
    [[420, 1], [600, 1], [1350, -1], [1530, -1], [1700, -1], [250, 1]].forEach(([x, f], i) => character(g, { x, y: 1010, s: i === 5 ? 1.6 : 2.0, facing: f, c: pal[i], pose: breathe(POSES.sit, t, 1, i), expr: i % 2 ? 'surprised' : 'neutral', look: [f * 0.6, 0.1], blink: blinkAt(t, i + 2) }));
    g.restore(); if (p.texto) pill(g, E.W / 2, 120, p.texto, pop(t, 0.3), { bg: '#212121', size: 58 });
  },
  // nota de dinheiro virando ouro + 12% -> 100%
  nota_ouro(g, t, info, p) {
    rays(g, t, '#f9a825', '#ffd54f');
    const k = pop(t, 0.1); g.save(); g.translate(E.W / 2, 500); g.scale(k, k); g.rotate(Math.sin(t * 2) * 0.05);
    for (let i = 0; i < 3; i++) nota(g, -40 + i * 40, -20 + i * 20, 2.0, -0.1 + i * 0.08, ['20', '50', '10'][i]); g.restore();
    const t1 = at(info, p.em1 || 'doze', 0.8), t2 = at(info, p.em2 || 'cem', info.dur * 0.7);
    if (t > t1) { bigText(g, 520, 880, '12%', pop(t, t1), { size: 130, color: '#fff' }); if (t > t2) tube(g, [[400, 900], [640, 860]], 16, '#e53935', 0); }
    if (t > t2) bigText(g, 1400, 880, '100%', pop(t, t2), { size: 150, color: '#ffd23f' });
  },
  // lata de biscoito = caixa eletrônico do bairro
  lata_atm(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.1, 0, 100); MJ.interior(g, {});
    person(g, { k: 'JURA', x: 700, y: 980, expr: 'smile' }, t, info);
    MJ.balcao(g, t, { objetos: false });
    MJ.lata(g, 1250, 762, 2.0, { aberta: true });
    const k = pop(t, 0.4); if (k > 0) { g.save(); g.translate(1250, 380); g.rotate(-0.05); g.scale(k, k); box(g, -300, -60, 600, 120, '#fffdf3', 6, 6); label(g, 'CAIXA ELETRÔNICO', 0, 4, { size: 52, color: '#c62828', stroke: 0, font: 'Nunito', weight: 900 }); g.restore(); }
    g.restore();
  },
  // motoboy perdido sem mapa
  motoboy(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.06); M.rua(g, {});
    moto(g, 900, 1000, 1.3);
    character(g, { x: 880, y: 900, s: 2.2, facing: 1, c: CAST.MOTOBOY, pose: breathe(POSES.holdFront, t), expr: 'confused', look: [0.4, 0.6], talk: talkWho('motoboy', info.globalT), blink: blinkAt(t, 1) });
    g.restore();
    M.phone(g, 1460, 470, 1.15, g => { bg(g, '#eceff1'); for (let i = 0; i < 6; i++) { R(g, -95, -180 + i * 60, 190, 4, '#cfd8dc'); R(g, -95 + i * 36, -180, 4, 360, '#cfd8dc'); } oval(g, 0, 20, 70, 70, '#e53935', 0); label(g, '✕', 0, 22, { size: 80, color: '#fff', stroke: 0 }); label(g, 'SEM SINAL', 0, 130, { size: 30, color: '#c62828', stroke: 0 }); }, 0.08);
  },
  // caminhão cheio parado: nota eletrônica, rota no app, pedido no sistema
  caminhao(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.05); M.rua(g, {}); caminhao(g, 1000, 1000, 1.25);
    person(g, { k: 'MOTORISTA', x: 360, y: 1000, expr: 'worried', pose: 'shrug' }, t, info); g.restore();
    const itens = [['NOTA', 'nota'], ['ROTA', 'rota'], ['PEDIDO', 'pedido']];
    itens.forEach(([txt, w], i) => { const t0 = wl(info, w, 0.6 + i * 0.8), k = pop(t, t0); if (k <= 0) return; g.save(); g.translate(560 + i * 400, 220); g.scale(k, k); box(g, -170, -70, 340, 140, '#fffdf3', 6, 18); label(g, txt, 0, -10, { size: 50, color: INK, stroke: 0 }); label(g, 'SEM SISTEMA', 0, 38, { size: 26, color: '#c62828', stroke: 0 }); g.restore(); });
  },
  // apps de mensagem/foto/rede social cinzas + "6 HORAS"
  apps_fora(g, t, info, p) {
    bg(g, '#263238'); g.save(); push(g, t, info, 1.0, 1.06);
    M.phone(g, 760, 560, 2.1, g => { bg(g, '#37474f'); const ap = [['MENSAGENS', '#43a047'], ['FOTOS', '#d81b60'], ['REDE SOCIAL', '#1e88e5']];
      ap.forEach(([n, c], i) => { const off = t > 0.8 + i * 0.4; box(g, -55, -150 + i * 105, 110, 80, off ? '#78909c' : c, 4, 22); label(g, n, 0, -88 + i * 105 + 20, { size: 15, color: '#fff', stroke: 0, font: 'Nunito', weight: 900 }); if (off) label(g, '✕', 40, -150 + i * 105, { size: 40, color: '#ff5252', stroke: 6 }); }); });
    g.restore();
    bigText(g, 1400, 420, 'OUT/2021', pop(t, 0.3), { size: 90, color: '#fff' });
    bigText(g, 1400, 620, '~6 HORAS', pop(t, at(info, 'seis', 1.5)), { size: 130, color: '#ffd23f' });
  },
  // Duda cola a folha de telefones na geladeira
  geladeira(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.06); M.sala(g, { night: true, sofa: false, box: false });
    geladeira(g, 1100, 1000, 1.0, ease.out(prog(t, 0.6, 1.6)), t);
    character(g, { x: 760, y: 1000, s: 1.9, facing: 1, c: CAST.DUDA, pose: breathe(posesAt(t, [[0, 'relaxed'], [0.5, 'reach'], [1.7, 'relaxed']]), t), expr: 'smile', blink: blinkAt(t, 2) });
    g.restore();
  },
};

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

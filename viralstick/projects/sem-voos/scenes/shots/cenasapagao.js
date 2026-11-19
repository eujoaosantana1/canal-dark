// cenasapagao.js — cenas de "Jornal do Universo: a nuvem caiu" (vídeo 11, formato telejornal)
// tela do Suporte: a trava do vídeo 11 (['PEDIDO 2026/1211', 'UMA TARDE', 'SEM REUNIÃO']) foi retirada daqui.
// Neste projeto (vídeo 12) quem fixa a TELA_SUPORTE é o cenassemvoos.js.
import { E, registerShot, blurLayer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { character, head, label, box, oval, polyO, tube, blinkAt, INK } from '/engine/toon.js';
import { CAST, WHO, talkWho, speaking, wl, pop, fadeIn, push, bg, rays, pill, bigText, drawSet, person, bust, M, MJ, AP, SV, POSES, posesAt, breathe } from '../lib.js';

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const at = (info, v, fb) => typeof v === 'string' ? wl(info, v, fb) : (v ?? fb);

// ---------- peças de telejornal ----------
function aoVivo(g, x, y, t, txt = 'AO VIVO') {
  box(g, x, y, 190, 56, '#e53935', 0, 8); const on = Math.sin(t * 5) > -0.3;
  oval(g, x + 30, y + 28, 10, 10, on ? '#ffffff' : '#ffcdd2', 0); label(g, txt, x + 110, y + 31, { size: 30, color: '#fff', stroke: 0 });
}
// faixa de nome (GC). k = entrada
function gc(g, t, nome, cargo, k = 1, cor = '#1565c0') {
  if (k <= 0) return; const w = lerp(0, 1180, ease.out(clamp(k)));
  g.save(); g.beginPath(); g.rect(80, 880, w, 170); g.clip();
  box(g, 80, 880, 1180, 92, '#ffffff', 0, 0); R(g, 80, 880, 22, 170, '#ffd23f');
  label(g, nome, 130, 928, { size: 54, color: INK, stroke: 0, align: 'left' });
  if (cargo) { box(g, 80, 972, 1180, 70, cor, 0, 0); label(g, cargo, 130, 1009, { size: 36, color: '#fff', stroke: 0, align: 'left' }); }
  g.restore();
}
// ícones do telão
function icone(g, nome, t = 0) {
  if (nome === 'outlook') { box(g, -110, -80, 220, 160, '#1976d2', 6, 12); polyO(g, [[-110, -80], [0, 10], [110, -80]], '#64b5f6', 5); label(g, 'E-MAIL', 0, 120, { size: 40, color: '#fff', stroke: 0 }); }
  else if (nome === 'teams') { box(g, -100, -100, 200, 200, '#5c6bc0', 6, 30); label(g, 'REUNIÃO', 0, 4, { size: 40, color: '#fff', stroke: 0 }); }
  else if (nome === 'nuvem') { M.cloud(g, 0, 0, 1.3, '#e3f2fd'); tube(g, [[-20, 30], [20, 80], [-10, 90], [30, 160]], 16, '#ffd23f', 5); }
  else if (nome === 'servidor') { AP.rack(g, -60, 150, 0.8, t, { erro: true }); AP.rack(g, 70, 150, 0.8, t, { off: true }); }
  else if (nome === 'telaazul') { box(g, -150, -100, 300, 200, '#1565c0', 6, 6); label(g, ':(', -80, -30, { size: 70, color: '#fff', stroke: 0 }); }
  else if (nome === 'aws') { box(g, -120, -90, 240, 180, '#ff9800', 6, 12); label(g, 'AMAZON', 0, -10, { size: 46, color: INK, stroke: 0 }); label(g, '2025', 0, 50, { size: 40, color: INK, stroke: 0 }); }
  else if (nome === 'caderno') MJ.caderninho(g, 0, 60, 2.2, {});
  else if (nome === 'aviao') { SV.aviao(g, 0, 0, 0.55, { rot: -0.15 }); if (t >= 0) { g.strokeStyle = '#e53935'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 150, 0, Math.PI * 2); g.moveTo(-106, 106); g.lineTo(106, -106); g.stroke(); } }
  else if (nome === 'aviao_ok') SV.aviao(g, 0, 0, 0.55, { rot: -0.15 });
  else if (nome === 'painel') { box(g, -150, -100, 300, 200, '#11161c', 6, 10); for (let i = 0; i < 4; i++) { box(g, -10, -78 + i * 46, 140, 34, '#e53935', 0, 4); R(g, -130, -70 + i * 46, 100, 16, '#90a4ae'); } }
  else if (nome === 'plano_b') { box(g, -110, -110, 220, 220, '#2e7d32', 6, 20); label(g, 'B', 0, 6, { size: 150, color: '#fff', stroke: 0 }); }
}
// conteúdo do telão: p.tela = {icone, linhas, cores, fundo}
function telaFn(spec, t) {
  if (!spec) return null;
  return (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, spec.fundo || '#1565c0'); gr.addColorStop(1, '#0d47a1'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const L = spec.linhas || [];
    if (spec.icone) { g.save(); g.translate(L.length ? w * 0.22 : w / 2, h / 2); if (L.length) g.scale(0.8, 0.8); icone(g, spec.icone, t); g.restore(); }
    L.forEach((l, i) => label(g, l, spec.icone ? w * 0.66 : w / 2, h / 2 - (L.length - 1) * 38 + i * 76, { size: spec.icone ? (l.length > 9 ? 40 : 52) : (l.length > 11 ? 50 : 64), color: (spec.cores || [])[i] || '#fff', stroke: 0 }));
  };
}
// estúdio em miniatura (dentro da TV do mercadinho). coordenadas locais: -205..205 x -128..128
function estudioMini(g, t, info, p) {
  g.save(); g.translate(-205, -128); g.scale(410 / E.W, 256 / E.H);
  AP.estudio(g, t, { tela: telaFn(p.tela, t) });
  person(g, { k: p.ancora || 'APRESENTADORA', x: 760, y: 1000, s: 2.4 }, t, info);
  AP.bancada(g, 760, 760, 900);
  if (p.gc) gc(g, t, p.gc[0], p.gc[1], 1);
  aoVivo(g, 80, 60, t);
  g.restore();
}

const K = {
  // vinheta do jornal. p.plantao = true para a versão PLANTÃO
  vinheta(g, t, info, p) {
    if (p.plantao) { bg(g, Math.sin(t * 8) > 0 ? '#b71c1c' : '#c62828'); }
    else rays(g, t, '#0d1b4c', '#13286b');
    const k = ease.outBack(prog(t, 0.05, 0.7));
    if (k > 0) { g.save(); g.translate(E.W / 2 - 260, E.H / 2 - (p.plantao ? 120 : 0)); g.scale(2.2 * k, 2.2 * k); AP.logo(g, 0, 0, 1); g.restore(); }
    if (p.plantao) bigText(g, E.W / 2, 800, 'PLANTÃO', pop(t, 0.4), { size: 190, color: '#fff' });
    else if (p.sub) pill(g, E.W / 2, 900, p.sub, pop(t, 0.6), { bg: '#e53935', size: 56 });
  },
  // apresentadora (ou comentarista) na bancada. p.k, p.tela, p.gc=[nome, cargo], p.gcEm, p.vivo, p.texto
  estudio(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.05]), p.cx || 0, 0);
    AP.estudio(g, t, { tela: telaFn(p.tela, t), telao: p.telao });
    person(g, { k: p.k || 'APRESENTADORA', x: p.x || 760, y: 1000, s: 2.45, expr: p.expr, facing: p.facing ?? 1, look: p.look }, t, info);
    AP.bancada(g, p.x || 760, 760, 900);
    g.restore();
    if (p.vivo !== false) aoVivo(g, 80, 60, t);
    if (p.gc) gc(g, t, p.gc[0], p.gc[1], ease.out(prog(t, at(info, p.gcEm, 0.3), at(info, p.gcEm, 0.3) + 0.5)), p.gcCor);
    if (p.texto) pill(g, E.W / 2, 150, p.texto, pop(t, at(info, p.textoEm, 0.4)), { bg: p.textoCor || '#e53935', size: 58 });
  },
  // Seu Jura no balcão do mercadinho, à noite, assistindo a TV. p.expr, p.tela, p.gc, p.desligada, p.caderno
  tv_jura(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]), p.cx || 0, 0);
    drawSet(g, 'mercadinho_tv', t, {});
    person(g, { k: 'JURA', x: 1300, y: 960, facing: -1, expr: p.expr, look: p.look || [-0.8, -0.1], pose: p.pose }, t, info);
    MJ.balcao(g, t, { objetos: false });
    MJ.caderninho(g, 1050, 762, 1.1, {});
    // TV de tubo em cima do balcão
    g.save(); g.translate(560, 560); box(g, -250, -170, 500, 360, '#5d4037', 7, 26);
    M.tv(g, 0, 0, 1.0, g => { if (p.desligada && t > at(info, p.desligaEm, 0.5)) { bg(g, '#111'); oval(g, 0, 0, 30 * Math.max(0, 1 - (t - at(info, p.desligaEm, 0.5)) * 2), 3, '#fff', 0); } else estudioMini(g, t, info, p); });
    tube(g, [[-120, 190], [-150, 210]], 14, INK); tube(g, [[120, 190], [150, 210]], 14, INK); g.restore();
    // luz da TV no rosto
    g.fillStyle = 'rgba(100,181,246,.10)'; g.fillRect(0, 0, E.W, E.H);
    g.restore();
    if (p.texto) pill(g, E.W / 2, 110, p.texto, pop(t, at(info, p.textoEm, 0.4)), { bg: p.textoCor || '#212121', size: 56 });
  },
  // TV de perto, com o estúdio dentro (o Seu Jura é a nuca em primeiro plano)
  tv_close(g, t, info, p) {
    blurLayer(g, 10, g => drawSet(g, 'mercadinho_tv', t, {}), { z: 1.4 }, 1);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, E.W, E.H);
    const z = key(t, [[0, 2.55], [info.dur, 2.7]]);
    g.save(); g.translate(E.W / 2, E.H / 2 - 20); box(g, -250 * z, -170 * z, 500 * z, 360 * z, '#5d4037', 7, 30); M.tv(g, 0, 0, z, g => estudioMini(g, t, info, p)); g.restore();
    // nuca do Seu Jura
    const c = CAST.JURA; oval(g, 1580, 1030, 230, 250, c.skin, 7); oval(g, 1580, 1000, 235, 150, c.hairColor, 0);
    if (p.texto) pill(g, E.W / 2, 100, p.texto, pop(t, at(info, p.textoEm, 0.4)), { bg: p.textoCor || '#e53935', size: 56 });
  },
  // repórter ao vivo na "nuvem". p.apagados, p.erro, p.gc, p.texto
  aovivo(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]));
    drawSet(g, 'nuvem_dc', t, { apagados: p.apagados, erro: p.erro });
    person(g, { k: p.k || 'TECNICO', x: p.x || 960, y: 1010, s: 2.4, expr: p.expr, pose: p.pose }, t, info);
    // microfone
    tube(g, [[(p.x || 960) + 120, 620], [(p.x || 960) + 120, 520]], 18, '#212121'); oval(g, (p.x || 960) + 120, 505, 28, 32, '#424242', 5);
    g.restore();
    aoVivo(g, 80, 60, t);
    gc(g, t, ...(p.gc || ['TÉCNICO DO UNIVERSO', 'AO VIVO • DIRETO DA NUVEM']), ease.out(prog(t, 0.3, 0.8)), '#00897b');
    if (p.texto) pill(g, E.W / 2, 150, p.texto, pop(t, at(info, p.textoEm, 0.5)), { bg: p.textoCor || '#e53935', size: 58 });
  },
  // Rafa no home office. p.tela: 'reunioes' | 'branco' | 'erro' | 'feliz' | 'emails'; p.erros[] (cada um entra na palavra); p.expr; p.noite
  homeoffice(g, t, info, p) {
    g.save(); push(g, t, info, ...(p.z || [1.0, 1.06]));
    drawSet(g, p.noite ? 'home_office_noite' : 'home_office', t, {});
    person(g, { k: 'RAFA', x: 1270, y: 1000, s: 2.35, facing: -1, expr: p.expr, look: p.look || [-0.7, 0.1], pose: p.pose }, t, info);
    AP.mesaNotebook(g, 760, 760, 1.25, g => telaNote(g, t, info, p));
    g.restore();
    if (p.texto) pill(g, E.W / 2, 120, p.texto, pop(t, at(info, p.textoEm, 0.4)), { bg: p.textoCor || '#5c6bc0', size: 56 });
  },
  // gráfico estilo Downdetector. p.titulo, p.ate, p.local, p.hora, p.cor
  grafico(g, t, info, p) {
    bg(g, '#101828'); g.save(); push(g, t, info, 1.0, 1.04);
    label(g, p.titulo || 'RELATOS DE PROBLEMA', E.W / 2, 110, { size: 56, color: '#fff', stroke: 0 });
    if (p.local) pill(g, 230, 110, p.local, pop(t, 0.2), { bg: p.cor || '#e53935', size: 44 });
    R(g, 200, 860, 1520, 6, '#546e7a'); R(g, 200, 220, 6, 646, '#546e7a');
    const r = rng(5), pts = []; for (let i = 0; i <= 60; i++) { const x = 200 + i * 25; const base = 820 - r() * 30; const pk = i > 30 ? Math.max(0, 1 - Math.abs(i - 40) / 14) : 0; const rise = i >= 30 && i <= 40 ? (i - 30) / 10 : pk; pts.push([x, base - rise * 520]); }
    const prog1 = clamp(ease.inOut(prog(t, 0.2, Math.min(2.2, info.dur * 0.6)))), nn = Math.max(2, Math.round(prog1 * pts.length));
    g.strokeStyle = p.cor || '#ff5252'; g.lineWidth = 10; g.lineJoin = 'round'; g.beginPath(); pts.slice(0, nn).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    g.fillStyle = 'rgba(255,82,82,.15)'; g.beginPath(); g.moveTo(200, 860); pts.slice(0, nn).forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(pts[nn - 1][0], 860); g.closePath(); g.fill();
    if (nn > 40) { const v = Math.round(lerp(0, p.ate, clamp((prog1 - 0.66) / 0.3))); const s = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      oval(g, pts[40][0], pts[40][1], 16, 16, '#fff', 5); g.save(); g.translate(pts[40][0], pts[40][1] - 90); box(g, -220, -60, 440, 120, '#fff', 6, 16); label(g, s, 0, 4, { size: 78, color: p.cor || '#e53935', stroke: 0 }); g.restore(); }
    if (p.hora) label(g, p.hora, pts[40][0], 920, { size: 40, color: '#b0bec5', stroke: 0 });
    g.restore();
    if (p.rodape) pill(g, E.W / 2, 1010, p.rodape, pop(t, at(info, p.rodapeEm, 1.2)), { bg: '#212121', size: 46 });
  },
  // cartão "RELEMBRE". p.data, p.empresa, p.sub, p.cor
  relembre(g, t, info, p) {
    bg(g, '#1c1c24'); g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 30; i++) { const r = rng(i + Math.floor(t * 12)); g.fillRect(r() * E.W, r() * E.H, 3, 40 + r() * 100); }
    pill(g, E.W / 2, 220, 'RELEMBRE', pop(t, 0.05), { bg: '#ffd23f', color: INK, size: 70 });
    bigText(g, E.W / 2, 470, p.data, pop(t, 0.35), { size: 170, color: '#fff' });
    bigText(g, E.W / 2, 690, p.empresa, pop(t, 0.7), { size: 110, color: p.cor || '#ff9800' });
    if (p.sub) pill(g, E.W / 2, 900, p.sub, pop(t, at(info, p.subEm, 1.1)), { bg: '#424242', size: 50 });
  },
  // supermercado com 10 caixas; 5 quebram na palavra p.em. p.texto
  caixas(g, t, info, p) {
    bg(g, '#f5f5f5'); g.save(); push(g, t, info, 1.0, 1.05);
    label(g, p.titulo || '10 CAIXAS', E.W / 2, 110, { size: 64, color: INK, stroke: 0 });
    const tq = at(info, p.em, info.dur * 0.35);
    for (let i = 0; i < 10; i++) { const x = 190 + i * 170, que = i % 2 === 1 && t > tq; box(g, x - 70, 420, 140, 200, que ? '#9e9e9e' : '#546e7a', 6, 10); box(g, x - 50, 440, 100, 60, que ? '#424242' : '#69f0ae', 4, 6);
      label(g, String(i + 1), x, 570, { size: 48, color: '#fff', stroke: 0 });
      if (que) { const k = pop(t, tq + (i - 1) * 0.06); tube(g, [[x - 50 * k, 450], [x + 50 * k, 590]], 14, '#e53935', 4); tube(g, [[x + 50 * k, 450], [x - 50 * k, 590]], 14, '#e53935', 4); }
      for (let j = 0; j < 3; j++) { const sq = que ? 1 : 0; oval(g, x + (j - 1) * 0 , 700 + j * 70 + sq * 0, 26, 26, ['#ffb74d', '#a1887f', '#ffcc80'][j], 4); }
    }
    g.restore();
    if (p.texto) pill(g, E.W / 2, 980, p.texto, pop(t, at(info, p.textoEm, info.dur * 0.7)), { bg: '#e53935', size: 54 });
  },
  // porta "ENTRADA SEGURA" com porteiro sobrecarregado e fila. p.em (palavra em que trava)
  porteiro(g, t, info, p) {
    g.save(); push(g, t, info, 1.0, 1.06);
    drawSet(g, 'nuvem_dc', t, {});
    box(g, 1240, 330, 420, 600, '#455a64', 7, 10); box(g, 1290, 400, 320, 530, '#263238', 6, 6); label(g, 'ENTRADA SEGURA', 1450, 300, { size: 44, color: INK, stroke: 0 });
    oval(g, 1560, 680, 18, 18, '#ffd23f', 4);
    const tr = at(info, p.em, info.dur * 0.6);
    ['CLIENTE', 'MOTOBOY', 'CAIXA', 'MOTORISTA', 'CLIENTE'].forEach((k, i) => person(g, { k, x: 860 - i * 175, y: 1000, s: 1.7, facing: 1, expr: 'worried' }, t, info));
    person(g, { k: 'ATENDENTE', x: 1120, y: 1000, s: 2.1, facing: -1, expr: t > tr ? 'shocked' : 'nervous' }, t, info);
    g.restore();
    if (t > tr) M.stamp(g, E.W / 2, 220, 'TRAVOU', clamp((t - tr) * 3), { color: '#e53935', w: 560 });
  },
  // lista telefônica com um endereço em branco. p.linhas [[nome, endereço]], p.vazio (índice)
  lista_dns(g, t, info, p) {
    bg(g, '#5d4037'); g.save(); push(g, t, info, 1.0, 1.08);
    box(g, 360, 120, 1200, 860, '#fff8e1', 8, 10); label(g, 'LISTA DE ENDEREÇOS DA INTERNET', 960, 200, { size: 50, color: '#3e2723', stroke: 0 }); R(g, 400, 240, 1120, 5, '#3e2723');
    (p.linhas || []).forEach(([n, e], i) => { const y = 330 + i * 120, q = pop(t, 0.2 + i * 0.2); if (q <= 0) return; label(g, n, 430, y, { size: 46, color: INK, stroke: 0, align: 'left' });
      g.strokeStyle = '#bcaaa4'; g.setLineDash([8, 10]); g.lineWidth = 4; g.beginPath(); g.moveTo(980, y + 6); g.lineTo(1180, y + 6); g.stroke(); g.setLineDash([]);
      if (i === p.vazio) { const k = t > at(info, p.em, info.dur * 0.5); if (k) { box(g, 1200, y - 40, 320, 80, Math.sin(t * 8) > 0 ? '#ffcdd2' : '#ffebee', 4, 8); label(g, '(VAZIO)', 1360, y + 2, { size: 46, color: '#c62828', stroke: 0 }); } else label(g, e, 1500, y, { size: 44, color: '#1565c0', stroke: 0, align: 'right' }); }
      else label(g, e, 1500, y, { size: 44, color: '#1565c0', stroke: 0, align: 'right' }); });
    g.restore();
    if (p.texto) pill(g, E.W / 2, 1010, p.texto, pop(t, at(info, p.textoEm, info.dur * 0.6)), { bg: '#c62828', size: 50 });
  },
  // painel de aeroporto com telas azuis. p.texto
  telas_azuis(g, t, info, p) {
    bg(g, '#cfd8dc'); g.save(); push(g, t, info, 1.0, 1.06);
    R(g, 0, 860, E.W, 300, '#90a4ae'); box(g, 200, 120, 1520, 120, '#263238', 6, 10); label(g, 'PARTIDAS', 960, 182, { size: 70, color: '#ffd23f', stroke: 0 });
    for (let i = 0; i < 4; i++) { const x = 300 + i * 350, q = pop(t, 0.2 + i * 0.25); if (q <= 0) continue; g.save(); g.translate(x + 150, 470); g.scale(q, q);
      box(g, -160, -130, 320, 240, '#1565c0', 7, 8); label(g, ':(', -90, -50, { size: 80, color: '#fff', stroke: 0 }); for (let k = 0; k < 3; k++) R(g, -130, 10 + k * 26, 200 - k * 40, 10, 'rgba(255,255,255,.7)'); tube(g, [[0, 110], [0, 250]], 16, '#455a64'); g.restore(); }
    ['CLIENTE', 'CAIXA', 'MOTORISTA'].forEach((k, i) => person(g, { k, x: 300 + i * 650, y: 1070, s: 1.55, facing: i % 2 ? -1 : 1, expr: 'shocked', look: [0, -0.8] }, t, info));
    g.restore();
    if (p.texto) pill(g, E.W / 2, 1000, p.texto, pop(t, at(info, p.textoEm, 0.8)), { bg: '#e53935', size: 54 });
  },
  // cartão de embarque escrito à mão
  cartao(g, t, info, p) {
    bg(g, '#37474f'); const k = ease.outBack(prog(t, 0.1, 0.8)); g.save(); g.translate(960, 520); g.rotate(-0.05 + (1 - k) * 0.4); g.scale(k, k);
    box(g, -620, -260, 1240, 520, '#fffdf3', 8, 18); R(g, -620, -260, 1240, 100, '#1a237e'); label(g, 'CARTÃO DE EMBARQUE', 0, -208, { size: 52, color: '#fff', stroke: 0 });
    const hand = { size: 64, color: '#1565c0', stroke: 0, align: 'left', font: 'Nunito', weight: 700 };
    label(g, 'Nome:  passageiro', -560, -90, hand); label(g, 'Voo:  6E 2043', -560, 10, hand); label(g, 'Portão:  12', -560, 110, hand);
    label(g, '(feito à mão)', 400, 160, { size: 42, color: '#c62828', stroke: 0 });
    g.restore();
    if (p.texto) pill(g, E.W / 2, 970, p.texto, pop(t, at(info, p.textoEm, 0.8)), { bg: '#e53935', size: 54 });
  },
  // e-mails chegando todos de uma vez. p.n (total), p.chefe (mostra o último da chefe)
  emails(g, t, info, p) {
    bg(g, '#263238'); g.save(); push(g, t, info, 1.0, 1.06);
    box(g, 360, 90, 1200, 880, '#eceff1', 7, 14); R(g, 360, 90, 1200, 100, '#1976d2'); label(g, 'CAIXA DE ENTRADA', 960, 142, { size: 50, color: '#fff', stroke: 0 });
    const n = Math.round(lerp(0, p.n || 47, clamp(ease.out(prog(t, 0.1, Math.min(2.4, info.dur * 0.5))))));
    pill(g, 1400, 142, String(n), 1, { bg: '#e53935', size: 50 });
    const L = ['Re: alguém tá conseguindo acessar?', 'Re: Re: alguém tá conseguindo acessar?', 'Re: Re: Re: alguém tá...', 'Re: Re: Re: Re: ...', 'Re: urgente!!', 'Re: Re: urgente!!'];
    for (let i = 0; i < 6; i++) { const q = pop(t, 0.15 + i * 0.18); if (q <= 0) continue; const y = 260 + i * 105; box(g, 400, y - 40, 1120, 88, '#fff', 4, 8); label(g, L[i], 440, y + 4, { size: 40, color: INK, stroke: 0, align: 'left', font: 'Nunito', weight: 800 }); }
    const tc = at(info, p.chefeEm, 99); if (p.chefe && t > tc) { const q = pop(t, tc); g.save(); g.translate(960, 820); g.scale(q, q); box(g, -560, -70, 1120, 140, '#fff59d', 6, 10); label(g, 'CHEFE: Reunião amanhã às 8h', 0, 4, { size: 52, color: '#c62828', stroke: 0 }); g.restore(); }
    g.restore();
  },
};

// tela do notebook do Rafa
function telaNote(g, t, info, p) {
  const w = 300, h = 190, tipo = p.tela || 'reunioes';
  if (tipo === 'reunioes') { R(g, 0, 0, w, h, '#ffffff'); R(g, 0, 0, w, 26, '#5c6bc0'); label(g, 'AGENDA', w / 2, 14, { size: 14, color: '#fff', stroke: 0 });
    for (let i = 0; i < 11; i++) { const q = pop(t, at(info, p.em, 0.1) + i * 0.08); if (q <= 0) continue; box(g, 10 + (i % 2) * 145, 32 + Math.floor(i / 2) * 26, 135 * q, 22, '#7986cb', 2, 4); label(g, 'REUNIÃO', 10 + (i % 2) * 145 + 67, 43 + Math.floor(i / 2) * 26, { size: 12, color: '#fff', stroke: 0 }); } }
  else if (tipo === 'branco') { R(g, 0, 0, w, h, '#ffffff'); g.strokeStyle = '#5c6bc0'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, h / 2, 30, t * 6, t * 6 + 4.2); g.stroke(); }
  else if (tipo === 'erro') { R(g, 0, 0, w, h, '#ffffff'); const L = p.erros || [['PLANILHA', 'onedrive'], ['E-MAIL', 'outlook'], ['AGENDA', 'agenda']];
    L.forEach(([n, em], i) => { const q = pop(t, at(info, em, 0.3 + i * 0.6)); if (q <= 0) return; box(g, 14, 14 + i * 58, 272, 48, '#ffebee', 3, 6); label(g, n + ': NÃO ABRIU', w / 2, 38 + i * 58, { size: 20, color: '#c62828', stroke: 0 }); }); }
  else if (tipo === 'emails') { R(g, 0, 0, w, h, '#eceff1'); for (let i = 0; i < 6; i++) box(g, 10, 10 + i * 29, 280, 24, '#fff', 2, 3); }
  else if (tipo === 'carta') { R(g, 0, 0, w, h, '#fffde7'); label(g, 'Querido Universo,', 20, 40, { size: 20, color: '#1565c0', stroke: 0, align: 'left' }); }
}

for (const s of E.shots) if (K[s.params?.kind]) registerShot(s.id, { draw: (g, t, info) => K[s.params.kind](g, t, info, s.params) });

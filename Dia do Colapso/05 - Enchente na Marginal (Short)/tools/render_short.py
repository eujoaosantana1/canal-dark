"""Render do Short "Enchente na Marginal" (1080x1920, 30 fps, H.264 + AAC) a partir de cenas.json.
Uso (de qualquer pasta):
  python tools\\render_short.py previa   -> previa\\cena_01.jpg, cena_13.jpg, cena_28.jpg (+ --todas: 1 quadro por cena)
  python tools\\render_short.py audio    -> build\\mix.wav (voz + chuva + efeitos + drone)
  python tools\\render_short.py video    -> build\\seg_*.mp4 (um por cena, em paralelo)
  python tools\\render_short.py tudo     -> audio + video + video_enchente_marginal.mp4
Sons gerados aqui mesmo (viralstick\\audio\\sfx.py + sintetizados), nada baixado."""
import os, sys, json, math, subprocess, unicodedata, re
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

AQUI = os.path.dirname(os.path.abspath(__file__)); EP = os.path.dirname(AQUI); os.chdir(EP)
RAIZ = os.path.abspath(os.path.join(EP, '..', '..'))
ANTON = os.path.join(RAIZ, 'tools', 'Anton-Regular.ttf'); RUBIK = os.path.join(RAIZ, 'tools', 'Rubik.ttf')
W, H, FPS = 1080, 1920, 30
VERM, AMAR, BRANCO, AZUL, VERDE, CINZA = (255, 77, 77), (255, 200, 61), (255, 255, 255), (70, 165, 255), (90, 220, 120), (170, 178, 190)
PAINEL = (8, 12, 18, 178)
CORES = {'vermelho': VERM, 'amarelo': AMAR}

C = json.load(open('cenas.json', encoding='utf8'))['cenas']
NC = len(C)
FIM_28 = C[-1]['end'] + 0.8
PRETO, CARTAO = 0.5, 2.6
T_TOTAL = FIM_28 + PRETO + CARTAO
INICIO = [0.0] + [c['start'] for c in C[1:]]
FIM = INICIO[1:] + [FIM_28]
EXTERNAS = {1, 2, 3, 5, 6, 9} | set(range(15, 29))
IW, IH = 1536, 2752
S0 = max(W / IW, H / IH)


# ---------------------------------------------------------------- utilidades
_fontes = {}
def anton(t):
    k = ('a', t)
    if k not in _fontes: _fontes[k] = ImageFont.truetype(ANTON, t)
    return _fontes[k]

def rubik(t, p='Bold'):
    k = ('r', t, p)
    if k not in _fontes:
        f = ImageFont.truetype(RUBIK, t); f.set_variation_by_name(p); _fontes[k] = f
    return _fontes[k]

def ease(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def eout(x): x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def lerp(a, b, u): return a + (b - a) * u

def norm(s):
    s = unicodedata.normalize('NFD', s.upper()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^A-Z0-9 ]', ' ', s)

NUM = {'15': 'QUINZE', '30': 'TRINTA', '193': 'UM', 'CM': 'CENTIMETROS'}

def instante_palavra(n, palavra, depois=0):
    """tempo (s, global) em que a palavra aparece na fala da cena n (proporcional aos caracteres)."""
    c = C[n - 1]; fala = ' ' + norm(c['fala']) + ' '; p = norm(palavra).split()
    if not p: return None, depois
    alvo = ' ' + NUM.get(p[0], p[0]); i = fala.find(alvo, depois)
    if i < 0: return None, depois
    return c['start'] + (c['end'] - c['start']) * (i / len(fala)), i + 1


# ---------------------------------------------------------------- legendas
PEQ = {'A', 'O', 'E', 'DA', 'DO', 'NA', 'NO', 'UM', 'UMA', 'DE', 'EM', 'AS', 'OS'}

def blocos(leg):
    ws = leg.split(); n = len(ws)
    if n <= 4: return [ws]
    k = math.ceil(n / 4); out = []; resto = ws
    while k > 1:
        m = len(resto); melhor = None
        for s in range(1, m):
            esq = ' '.join(resto[:s]); dir_ = ' '.join(resto[s:])
            custo = abs(len(esq) * (k - 1) - len(dir_)) + (25 if norm(resto[s - 1]).strip() in PEQ else 0) \
                - (12 if resto[s - 1].endswith(',') else 0) + (40 if s > 4 or m - s > 4 * (k - 1) else 0)
            if melhor is None or custo < melhor[0]: melhor = (custo, s)
        out.append(resto[:melhor[1]]); resto = resto[melhor[1]:]; k -= 1
    out.append(resto); return out

def marcar(leg, destaque):
    ws = leg.split(); alvo = norm(destaque or '').split(); cor = [None] * len(ws)
    nw = [norm(w).strip() for w in ws]
    for i in range(len(ws) - len(alvo) + 1):
        if alvo and nw[i:i + len(alvo)] == alvo:
            for j in range(i, i + len(alvo)): cor[j] = True
            break
    return cor

_cache_leg = {}
def img_bloco(palavras):
    """palavras: lista de (texto, cor). Devolve RGBA com contorno fino e sombra suave."""
    k = tuple(palavras)
    if k in _cache_leg: return _cache_leg[k]
    tam = 112
    while True:
        f = anton(tam); d0 = ImageDraw.Draw(Image.new('L', (1, 1)))
        esp = d0.textlength(' ', font=f); larg = [d0.textlength(p, font=f) for p, _ in palavras]
        total = sum(larg) + esp * (len(palavras) - 1)
        linhas = [list(range(len(palavras)))]
        if total > 840 and len(palavras) > 1:
            melhor = min(range(1, len(palavras)), key=lambda s: max(sum(larg[:s]) + esp * (s - 1), sum(larg[s:]) + esp * (len(larg) - s - 1)))
            linhas = [list(range(melhor)), list(range(melhor, len(palavras)))]
        lw = [sum(larg[i] for i in L) + esp * (len(L) - 1) for L in linhas]
        if max(lw) <= 860 or tam <= 70: break
        tam -= 6
    alt = int(tam * 1.18); pad = 40
    cw, ch = int(max(lw)) + 2 * pad, alt * len(linhas) + 2 * pad
    sombra = Image.new('L', (cw, ch), 0); ds = ImageDraw.Draw(sombra)
    im = Image.new('RGBA', (cw, ch), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for li, L in enumerate(linhas):
        x = (cw - lw[li]) / 2; y = pad + li * alt
        for i in L:
            p, cor = palavras[i]
            ds.text((x, y + 8), p, font=f, fill=200, stroke_width=6, stroke_fill=200)
            d.text((x, y), p, font=f, fill=cor, stroke_width=5, stroke_fill=(0, 0, 0))
            x += larg[i] + esp
    base = Image.new('RGBA', (cw, ch), (0, 0, 0, 0)); base.putalpha(sombra.filter(ImageFilter.GaussianBlur(9)))
    out = Image.alpha_composite(base, im); _cache_leg[k] = out
    return out

def legendas_da_cena(n):
    c = C[n - 1]; ws = c['legenda'].split(); cor = marcar(c['legenda'], c.get('destaque'))
    hl = CORES.get(c.get('cor_destaque') or '', AMAR)
    grupos = blocos(c['legenda']); out = []; i = 0; pos = 0
    for gi, g in enumerate(grupos):
        pal = []
        for j, w in enumerate(g):
            txt = w.rstrip('.,') if j == len(g) - 1 else w
            pal.append((txt, hl if cor[i + j] else BRANCO))
        t, pos2 = instante_palavra(n, g[0], pos)
        if t is None: t = c['start'] + (c['end'] - c['start']) * gi / len(grupos)
        else: pos = pos2
        if gi == 0: t = c['start']
        out.append([t, pal]); i += len(g)
    for k in range(len(out)):
        out[k].append(out[k + 1][0] if k + 1 < len(out) else FIM[n - 1])
        if k and out[k][0] <= out[k - 1][0] + 0.35:   # garante tempo mínimo de leitura
            out[k][0] = out[k - 1][0] + (out[k][2] - out[k - 1][0]) / 2; out[k - 1][2] = out[k][0]
    return out

def desenhar_legenda(im, n, tg):
    for t0, pal, t1 in LEG[n]:
        if t0 <= tg < t1:
            b = img_bloco(tuple(pal)); u = (tg - t0) / 0.13
            if u < 1:
                s = 1.14 - 0.14 * eout(u); b = b.resize((int(b.width * s), int(b.height * s)), Image.BILINEAR)
            im.alpha_composite(b, (int(W / 2 - b.width / 2), int(1425 - b.height / 2)))
            return

LEG = {}


# ---------------------------------------------------------------- telas dos celulares
TELAS = {7: [(950, 1158), (1186, 1157), (1115, 1833), (873, 1795)],
         8: [(950, 1158), (1186, 1157), (1115, 1833), (873, 1795)],
         23: [(553, 722), (940, 691), (1104, 1567), (700, 1635)]}

def coefs(quad, w, h):
    src = [(0, 0), (w, 0), (w, h), (0, h)]; A = []; B = []
    for (x, y), (u, v) in zip(quad, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return tuple(np.linalg.solve(np.array(A, float), np.array(B, float)))

def colar_tela(base, n, tela):
    quad = TELAS[n]; xs = [p[0] for p in quad]; ys = [p[1] for p in quad]
    box = (min(xs) - 6, min(ys) - 6, max(xs) + 6, max(ys) + 6); bw, bh = box[2] - box[0], box[3] - box[1]
    q = [(x - box[0], y - box[1]) for x, y in quad]
    warped = tela.transform((bw, bh), Image.PERSPECTIVE, coefs(q, tela.width, tela.height), Image.BICUBIC)
    a = np.asarray(base.crop(box).convert('RGB')).astype(np.float32)
    lum = a.mean(2); sat = a.max(2) - a.min(2)
    m = np.clip((lum - 185) / 40, 0, 1) * np.clip((45 - sat) / 25, 0, 1)
    poly = Image.new('L', (bw, bh), 0); ImageDraw.Draw(poly).polygon(q, fill=255)
    m = m * np.asarray(poly.filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
    base.paste(warped, box[:2], Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0)))

def tela_alerta(texto):
    tw, th = 540, 1180; im = Image.new('RGB', (tw, th), (226, 230, 236)); d = ImageDraw.Draw(im)
    d.text((tw / 2, 60), '18:41', font=rubik(44, 'Bold'), fill=(40, 44, 52), anchor='mm')
    d.rounded_rectangle((30, 250, tw - 30, 930), 36, fill=(255, 255, 255))
    d.rounded_rectangle((30, 250, tw - 30, 420), 36, fill=(214, 40, 40)); d.rectangle((30, 380, tw - 30, 420), fill=(214, 40, 40))
    icone_alerta(d, tw / 2, 300, 70)
    d.text((tw / 2, 385), 'ALERTA SEVERO', font=rubik(46, 'Black'), fill=(255, 255, 255), anchor='mm')
    corpo = partes(texto)[-1]
    y = 470
    for linha in quebrar(corpo, rubik(40, 'Bold'), tw - 110):
        d.text((tw / 2, y), linha, font=rubik(40, 'Bold'), fill=(30, 32, 38), anchor='mm'); y += 56
    d.rounded_rectangle((70, 820, tw - 70, 900), 40, fill=(214, 40, 40))
    d.text((tw / 2, 860), 'OK', font=rubik(40, 'Black'), fill=(255, 255, 255), anchor='mm')
    return im

def tela_chamada(itens, feitos, pontos):
    tw, th = 540, 1170; im = Image.new('RGB', (tw, th), (16, 24, 30)); d = ImageDraw.Draw(im)
    for y in range(th):
        v = y / th; d.line([(0, y), (tw, y)], fill=(int(14 + 10 * v), int(40 - 16 * v), int(36 - 10 * v)))
    d.text((tw / 2, 120), 'CHAMANDO' + '.' * pontos, font=rubik(40, 'Bold'), fill=(190, 230, 205), anchor='mm')
    d.text((tw / 2, 280), '193', font=anton(210), fill=(255, 255, 255), anchor='mm')
    d.text((tw / 2, 430), 'DIGA:', font=rubik(34, 'Black'), fill=(255, 200, 61), anchor='mm')
    for i, it in enumerate(itens):
        y = 520 + i * 105; ok = i < feitos
        d.rounded_rectangle((60, y - 38, 136, y + 38), 14, fill=(90, 220, 120) if ok else None, outline=(220, 230, 225), width=5)
        if ok: d.line([(76, y), (94, y + 20), (122, y - 22)], fill=(10, 30, 15), width=10, joint='curve')
        d.text((165, y), it.upper(), font=rubik(48, 'Black'), fill=(255, 255, 255) if ok else (175, 190, 185), anchor='lm')
    d.ellipse((tw / 2 - 70, 960, tw / 2 + 70, 1100), fill=(222, 50, 50))
    d.rounded_rectangle((tw / 2 - 42, 1020, tw / 2 + 42, 1042), 10, fill=(255, 255, 255))
    return im

def partes(s):
    return [p.strip() for p in re.split(r'\s[·—–-]\s', s, maxsplit=1)]

def quebrar(s, f, larg):
    d = ImageDraw.Draw(Image.new('L', (1, 1))); out = []; atual = ''
    for w in s.split():
        t = (atual + ' ' + w).strip()
        if d.textlength(t, font=f) > larg and atual: out.append(atual); atual = w
        else: atual = t
    if atual: out.append(atual)
    return out

def icone_alerta(d, cx, cy, r, cor=(255, 200, 61)):
    d.polygon([(cx, cy - r * 0.62), (cx + r * 0.62, cy + r * 0.48), (cx - r * 0.62, cy + r * 0.48)], fill=cor, outline=(0, 0, 0), width=3)
    d.rectangle((cx - r * 0.06, cy - r * 0.25, cx + r * 0.06, cy + r * 0.15), fill=(0, 0, 0))
    d.ellipse((cx - r * 0.07, cy + r * 0.23, cx + r * 0.07, cy + r * 0.37), fill=(0, 0, 0))


# ---------------------------------------------------------------- câmera
MOV = {   # z0, z1, (fx0, fy0), (fx1, fy1), tremida (px), curva
    'zoom_in': (1.0, 1.10), 'zoom_out': (1.12, 1.0), 'push_in': (1.0, 1.16), 'zoom_in_tremida': (1.04, 1.14),
    'pan_lateral': (1.16, 1.18), 'pan': (1.2, 1.22), 'balanco': (1.08, 1.12), 'flash_branco': (1.04, 1.12),
    'tremida_vibracao': (1.05, 1.12), 'estatico': (1.02, 1.07), 'corte_seco_escurece': (1.06, 1.13),
    'congela': (1.10, 1.17), 'tilt_down': (1.16, 1.18), 'tremida': (1.07, 1.13), 'tremida_forte_corte_preto': (1.05, 1.2)}
FOCO = {   # foco (x, y) inicial e final em fração da imagem; sobrescreve z quando tem 'z'
    3: dict(f0=(0.40, 0.5), f1=(0.60, 0.5)),
    13: dict(f0=(0.5, 0.45), f1=(0.5, 0.52)),
    14: dict(f0=(0.5, 0.35), f1=(0.5, 0.62)),
    19: dict(f0=(0.5, 0.42), f1=(0.5, 0.42)),
    20: dict(z=(1.28, 1.02), f0=(0.5, 0.36), f1=(0.5, 0.48)),
    21: dict(f0=(0.36, 0.45), f1=(0.62, 0.45)),
    22: dict(z=(1.18, 1.42), f0=(0.5, 0.34), f1=(0.49, 0.32)),
    23: dict(f0=(0.55, 0.44), f1=(0.55, 0.42)),
    25: dict(z=(1.32, 1.36), f0=(0.47, 0.42), f1=(0.40, 0.44)),
    26: dict(f0=(0.5, 0.5), f1=(0.5, 0.5)),
    27: dict(z=(1.0, 1.16), f0=(0.5, 0.45), f1=(0.5, 0.62)),
    28: dict(f0=(0.5, 0.45), f1=(0.48, 0.42)),
}

def tremor(t, amp, seed=0):
    return (amp * (math.sin(2 * math.pi * 13.1 * t + seed) + 0.6 * math.sin(2 * math.pi * 21.7 * t + 1 + seed)) / 1.6,
            amp * (math.sin(2 * math.pi * 11.3 * t + 2 + seed) + 0.6 * math.sin(2 * math.pi * 17.9 * t + seed)) / 1.6)

def camera(n, t, D):
    mv = C[n - 1]['movimento']; z0, z1 = MOV.get(mv, (1.02, 1.08)); fo = FOCO.get(n, {})
    if 'z' in fo: z0, z1 = fo['z']
    f0 = fo.get('f0', (0.5, 0.5)); f1 = fo.get('f1', f0)
    if mv == 'pan_lateral' and 'f0' not in fo: f0, f1 = (0.38, 0.5), (0.62, 0.5)
    if mv == 'tilt_down' and 'f0' not in fo: f0, f1 = (0.5, 0.35), (0.5, 0.65)
    u = t / D; e = ease(u) if mv not in ('push_in',) else eout(u)
    rot = 0.0; dx = dy = 0.0; ef = {}
    if mv == 'congela':
        e = 0 if t < 0.3 else eout((t - 0.3) / (D - 0.3)); ef['desat'] = 0.65 if t < 0.3 else 0
        if t < 0.3: ef['brilho'] = 1.15
    z = lerp(z0, z1, e); fx = lerp(f0[0], f1[0], e); fy = lerp(f0[1], f1[1], e)
    if mv == 'zoom_in_tremida': dx, dy = tremor(t, 7 * max(0.35, 1 - t / D))
    if mv == 'tremida': dx, dy = tremor(t, 8, n)
    if mv == 'tremida_vibracao' and t < 0.9: dx, dy = 5 * math.sin(t * 2 * math.pi * 31), 3 * math.sin(t * 2 * math.pi * 27)
    if mv == 'tremida_forte_corte_preto': dx, dy = tremor(t, 3 + 22 * (u ** 1.6), 5)
    if mv == 'balanco': rot = math.radians(0.7) * math.sin(2 * math.pi * 0.45 * t); dy = 7 * math.sin(2 * math.pi * 0.9 * t)
    if mv == 'corte_seco_escurece': ef['brilho'] = 1 - 0.5 * ease(t / D)
    if mv == 'flash_branco':
        fl = max(0.0, 0.92 - t / 0.32) if t < 0.32 else 0.0
        if 0.48 < t < 0.7: fl = max(fl, 0.55 * (1 - (t - 0.48) / 0.22))
        ef['flash'] = fl
    if n == 28 and t > D - 0.25: ef['brilho'] = 1 - (t - (D - 0.25)) / 0.25 * 0.6
    return z, fx, fy, dx, dy, rot, ef

def enquadrar(base, n, t, D):
    z, fx, fy, dx, dy, rot, ef = camera(n, t, D)
    k = 1 / (S0 * z); vw, vh = W * k, H * k
    cx = min(max(fx * IW + dx * k, vw / 2 + 2), IW - vw / 2 - 2)
    cy = min(max(fy * IH + dy * k, vh / 2 + 2), IH - vh / 2 - 2)
    a, b, d_, e = k * math.cos(rot), -k * math.sin(rot), k * math.sin(rot), k * math.cos(rot)
    im = base.transform((W, H), Image.AFFINE, (a, b, cx - a * W / 2 - b * H / 2, d_, e, cy - d_ * W / 2 - e * H / 2), Image.BICUBIC)
    mapa = lambda x, y: (W / 2 + (x - cx) / k, H / 2 + (y - cy) / k)
    return im, ef, mapa, z


# ---------------------------------------------------------------- camadas fixas: vinheta e chuva
_fixas = {}
def vinheta():
    if 'v' not in _fixas:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.6)) ** 2)
        a = np.clip((r - 0.62) / 0.6, 0, 1) ** 1.5 * 0.85
        g = np.clip((yy - 1150) / 770, 0, 1) ** 1.25 * 0.82
        a = 1 - (1 - a) * (1 - g)
        im = np.zeros((H, W, 4), np.uint8); im[..., 3] = (a * 255).astype(np.uint8)
        _fixas['v'] = Image.fromarray(im, 'RGBA')
    return _fixas['v']

def chuva():
    if 'c' not in _fixas:
        r = np.random.default_rng(7); camadas = []
        for qtd, l0, l1, larg, a0, a1, blur in ((900, 26, 55, 1, 40, 75, 0), (170, 80, 150, 2, 45, 85, 1.2)):
            im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
            for _ in range(qtd):
                x, y = r.uniform(-60, W), r.uniform(0, H); L = r.uniform(l0, l1); a = int(r.uniform(a0, a1))
                for oy in (0, -H, H):
                    d.line([(x, y + oy), (x + L * 0.2, y + L + oy)], fill=(210, 225, 240, a), width=larg)
            if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
            dup = Image.new('RGBA', (W, 2 * H)); dup.paste(im, (0, 0)); dup.paste(im, (0, H)); camadas.append(dup)
        _fixas['c'] = camadas
    return _fixas['c']

def aplicar_chuva(im, tg):
    for camada, vel, dxv in zip(chuva(), (1500, 2300), (300, 460)):
        off = int((tg * vel) % H)
        im.alpha_composite(camada.crop((0, H - off, W, 2 * H - off)))


# ---------------------------------------------------------------- HUDs
def painel(d, box, raio=18, borda=None):
    d.rounded_rectangle(box, raio, fill=PAINEL, outline=borda, width=3 if borda else 0)

def hud_regra(im, d, num, titulo, t, y=190):
    f1, f2 = rubik(30, 'Black'), anton(66)
    w = max(d.textlength(titulo, font=f2), 220) + 78
    if w > 1000: f2 = anton(56); w = d.textlength(titulo, font=f2) + 78
    x = 46 - (1 - eout(t / 0.22)) * (w + 60); h = 150
    painel(d, (x, y, x + w, y + h)); d.rectangle((x, y + 12, x + 8, y + h - 12), fill=VERM)
    d.text((x + 34, y + 24), f'REGRA {num}', font=f1, fill=VERM)
    d.line([(x + 34, y + 64), (x + 34 + 150 * eout((t - 0.1) / 0.3), y + 64)], fill=VERM, width=3)
    nchar = int(max(0, t - 0.18) * 30); s = titulo[:nchar]
    d.text((x + 34, y + 72), s, font=f2, fill=BRANCO)
    if nchar < len(titulo) + 18 and int(t * 4) % 2 == 0:
        cx = x + 34 + d.textlength(s, font=f2) + 6; d.rectangle((cx, y + 84, cx + 14, y + 138), fill=BRANCO)
    return y + h

def hud_status(d, txt, t, y=190):
    rot, val = partes(txt)
    if t < 0.6 and int(t / 0.15) % 2 == 1: return
    cor = VERDE if val.upper() in ('OK', 'LIGADO') else VERM
    f = rubik(34, 'Black'); w = d.textlength(rot + '  ' + val, font=f) + 100
    painel(d, (46, y, 46 + w, y + 70), 35, borda=cor + (200,))
    d.ellipse((70, y + 24, 92, y + 46), fill=cor)
    d.text((108, y + 35), rot, font=f, fill=BRANCO, anchor='lm')
    d.text((108 + d.textlength(rot + '  ', font=f), y + 35), val, font=f, fill=cor, anchor='lm')

def hud_relogio(d, hora, t):
    x = 46 - (1 - eout(t / 0.22)) * 400; y = 190
    painel(d, (x, y, x + 300, y + 120)); cx, cy = x + 62, y + 60
    d.ellipse((cx - 34, cy - 34, cx + 34, cy + 34), outline=AMAR, width=6)
    ang = t * 1.5
    d.line([(cx, cy), (cx + 22 * math.sin(ang), cy - 22 * math.cos(ang))], fill=AMAR, width=5)
    d.line([(cx, cy), (cx, cy - 16)], fill=AMAR, width=5)
    hh, mm = hora.split(':'); f = anton(78)
    d.text((x + 112, cy), hh, font=f, fill=BRANCO, anchor='lm')
    xc = x + 112 + d.textlength(hh, font=f)
    if int(t * 2) % 2 == 0: d.text((xc, cy - 4), ':', font=f, fill=BRANCO, anchor='lm')
    d.text((xc + d.textlength(':', font=f), cy), mm, font=f, fill=BRANCO, anchor='lm')

def hud_mapa(d, txt, t):
    w, h = 400, 400; x = 1034 - w + (1 - eout(t / 0.25)) * (w + 60); y = 190
    painel(d, (x, y, x + w, y + h), 22, borda=(255, 255, 255, 60))
    via, sentido = partes(txt)
    d.text((x + 24, y + 22), via.upper(), font=rubik(30, 'Black'), fill=BRANCO)
    pts = lambda off: [(x + 20 + i * (w - 40) / 30, y + 215 + off + 26 * math.sin(i / 30 * 5.5 + 0.6)) for i in range(31)]
    d.line(pts(-58), fill=(40, 120, 200), width=34, joint='curve')            # rio
    d.line(pts(0), fill=(85, 90, 100), width=26, joint='curve')              # pista
    p = pts(0)
    for i in range(0, 30, 2):
        a = (i + (t * 6) % 2) / 30; j = int(a * 30)
        if j < 30: d.line([p[j], p[min(j + 1, 30)]], fill=AMAR, width=3)
    d.text((x + 30, y + 112), 'RIO', font=rubik(22, 'Bold'), fill=(150, 200, 255))
    ex, ey = p[27]; d.polygon([(ex + 26, ey), (ex - 4, ey - 20), (ex - 4, ey + 20)], fill=AMAR)
    vx, vy = p[12]; r = 13 + 5 * (0.5 + 0.5 * math.sin(t * 8))
    d.ellipse((vx - r - 10, vy - r - 10, vx + r + 10, vy + r + 10), outline=VERM + (120,), width=4)
    d.ellipse((vx - 12, vy - 12, vx + 12, vy + 12), fill=VERM, outline=BRANCO, width=3)
    d.text((vx, vy + 44), 'VOCÊ', font=rubik(24, 'Black'), fill=BRANCO, anchor='mm')
    d.text((x + w - 24, y + h - 34), sentido.upper(), font=rubik(30, 'Black'), fill=AMAR, anchor='rm')

NIVEL_ANTES = {9: 0, 15: 20, 27: 45}
def hud_nivel(d, n, alvo, t):
    x0, y0, w, h = 770, 190, 266, 660
    x0 += (1 - eout(t / 0.25)) * 320
    v = lerp(NIVEL_ANTES.get(n, 0), alvo, ease((t - 0.2) / 0.9))
    perigo = v >= 45
    borda = VERM + (230,) if perigo and int(t * 3) % 2 == 0 else (255, 255, 255, 60)
    painel(d, (x0, y0, x0 + w, y0 + h), 20, borda=borda)
    d.text((x0 + w / 2, y0 + 34), 'NÍVEL DA ÁGUA', font=rubik(28, 'Black'), fill=BRANCO, anchor='mm')
    tx0, tx1, ty0, ty1 = x0 + w - 78, x0 + w - 34, y0 + 80, y0 + h - 100
    d.rounded_rectangle((tx0, ty0, tx1, ty1), 12, fill=(255, 255, 255, 30), outline=(255, 255, 255, 140), width=3)
    yv = ty1 - (ty1 - ty0) * v / 100
    if yv < ty1 - 12:
        d.rounded_rectangle((tx0 + 4, yv, tx1 - 4, ty1 - 4), 9, fill=(VERM if perigo else AZUL) + (235,))
    for pct, nome in ((20, 'RODA'), (45, 'PÉ DA PORTA'), (60, 'JANELA')):
        ym = ty1 - (ty1 - ty0) * pct / 100; ating = v >= pct - 0.5
        d.line([(tx0 - 22, ym), (tx1 + 6, ym)], fill=BRANCO if ating else CINZA, width=3)
        d.text((tx0 - 30, ym), nome, font=rubik(24, 'Black'), fill=(VERM if pct >= 45 else AMAR) if ating else CINZA, anchor='rm')
    d.text((x0 + w / 2, y0 + h - 50), f'{int(round(v))}%', font=anton(70), fill=VERM if perigo else BRANCO, anchor='mm')

def hud_regua(d, txt, t):
    cm = int(re.findall(r'\d+', txt)[0]); px_cm = 12; yb = 1290; yt = yb - cm * px_cm
    x = 96 - (1 - eout(t / 0.3)) * 260
    d.rounded_rectangle((x - 30, yt - 96, x + 170, yb + 20), 16, fill=(8, 12, 18, 120))
    d.line([(x, yt), (x, yb)], fill=AMAR, width=7)
    for c in range(0, cm + 1, 5):
        y = yb - c * px_cm; L = 34 if c % 10 == 0 else 20
        d.line([(x, y), (x + L, y)], fill=AMAR, width=5)
    for xx in range(int(x) + 50, int(x) + 360, 26):
        d.line([(xx, yt), (xx + 13, yt)], fill=AMAR + (170,), width=3)
    f = anton(60); d.text((x - 8, yt - 50), txt.upper(), font=f, fill=AMAR, anchor='lm', stroke_width=3, stroke_fill=(0, 0, 0))

def hud_x(d, t):
    if t > 1.4: return
    s = 1.7 - 0.7 * eout(t / 0.14); r = 170 * s; cx, cy = 540, 820
    if t < 0.2: cx += 10 * math.sin(t * 90); cy += 8 * math.cos(t * 70)
    for (a, b) in (((-1, -1), (1, 1)), ((-1, 1), (1, -1))):
        p = [(cx + a[0] * r, cy + a[1] * r), (cx + b[0] * r, cy + b[1] * r)]
        d.line(p, fill=(0, 0, 0), width=int(64 * s)); d.line(p, fill=VERM, width=int(46 * s))

def hud_circulo(d, mapa, z, t):
    cx, cy = mapa(768, 1135); r0 = 300 * S0 * z
    r = r0 * (1 + 0.07 * math.sin(2 * math.pi * 1.8 * t))
    for k in range(2):
        fase = ((t * 0.9) + k * 0.5) % 1; rr = r * (1 + 0.5 * fase); a = int(200 * (1 - fase))
        d.ellipse((cx - rr, cy - rr * 0.62, cx + rr, cy + rr * 0.62), outline=VERM + (a,), width=6)
    d.ellipse((cx - r, cy - r * 0.62, cx + r, cy + r * 0.62), outline=VERM, width=12)
    f = rubik(36, 'Black'); w = d.textlength('PERIGO', font=f) + 70; yy = cy - r * 0.62 - 60
    d.rounded_rectangle((cx - w / 2, yy - 32, cx + w / 2, yy + 32), 32, fill=VERM)
    icone_alerta(d, cx - w / 2 + 32, yy + 2, 40, BRANCO)
    d.text((cx + 18, yy), 'PERIGO', font=f, fill=BRANCO, anchor='mm')

def hud_alerta(d, texto, t):
    if t < 0.2: return
    y = 170 - (1 - eout((t - 0.2) / 0.25)) * 330; x0, x1 = 40, 1040
    corpo = partes(texto)[-1]; f = rubik(36, 'Bold'); linhas = quebrar(corpo, f, x1 - x0 - 170)
    h = 112 + 48 * len(linhas)
    painel(d, (x0, y, x1, y + h), 26, borda=VERM + (220,)); d.rectangle((x0, y + 16, x0 + 10, y + h - 16), fill=VERM)
    icone_alerta(d, x0 + 78, y + 70, 92)
    d.text((x0 + 140, y + 46), 'ALERTA SEVERO', font=rubik(44, 'Black'), fill=AMAR, anchor='lm')
    d.text((x1 - 28, y + 46), 'agora', font=rubik(26, 'Bold'), fill=CINZA, anchor='rm')
    for i, l in enumerate(linhas): d.text((x0 + 140, y + 104 + 48 * i), l, font=f, fill=BRANCO, anchor='lm')

def cartao_final(t):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 255)); d = ImageDraw.Draw(im)
    s = 1.25 - 0.25 * eout(t / 0.18); f = anton(int(250 * s))
    dx = 8 * math.sin(t * 80) if t < 0.25 else 0
    if t > 0.25 and int(t * 10) % 13 == 0: dx = -10
    d.text((W / 2 + dx + 6, 860), 'REGRA 6?', font=f, fill=(90, 0, 0), anchor='mm')
    d.text((W / 2 + dx, 860), 'REGRA 6?', font=f, fill=VERM, anchor='mm')
    if t > 0.55:
        u = eout((t - 0.55) / 0.2); f2 = anton(110); w = d.textlength('PARTE 2', font=f2) + 90
        a = int(255 * u)
        d.rounded_rectangle((W / 2 - w / 2, 1060, W / 2 + w / 2, 1210), 20, outline=(255, 255, 255, a), width=6)
        d.text((W / 2, 1135), 'PARTE 2', font=f2, fill=(255, 255, 255, a), anchor='mm')
    return im.convert('RGB')


# ---------------------------------------------------------------- quadro
_bases = {}
def base_da_cena(n, tg=None):
    if n not in _bases:
        im = Image.open(C[n - 1]['imagem']).convert('RGB')
        if (im.width, im.height) != (IW, IH): im = im.resize((IW, IH), Image.LANCZOS)
        if n in (7, 8): colar_tela(im, n, tela_alerta(C[6]['hud']['tela_alerta']))
        _bases[n] = im
    if n == 23:
        itens = C[22]['hud']['tela_chamada']; feitos = sum(1 for t in CHECK if tg >= t); pontos = int(tg * 2.5) % 4
        k = (23, feitos, pontos)
        if k not in _bases:
            im = _bases[23].copy(); colar_tela(im, 23, tela_chamada(itens, feitos, pontos)); _bases[k] = im
        return _bases[k]
    return _bases[n]

CHECK = []

def preparar():
    for n in range(1, NC + 1): LEG[n] = legendas_da_cena(n)
    pos = 0
    for p in ('VIA', 'SENTIDO', 'REFERENCIA', 'PESSOAS'):
        t, pos = instante_palavra(23, p, pos); CHECK.append(t + 0.25)

def quadro(tg):
    if tg >= FIM_28 + PRETO: return cartao_final(tg - FIM_28 - PRETO)
    if tg >= FIM_28: return Image.new('RGB', (W, H))
    n = max(i for i in range(1, NC + 1) if INICIO[i - 1] <= tg + 1e-6)
    t = tg - INICIO[n - 1]; D = FIM[n - 1] - INICIO[n - 1]; c = C[n - 1]; hud = c.get('hud') or {}
    im, ef, mapa, z = enquadrar(base_da_cena(n, tg), n, t, D)
    if ef.get('desat'): im = ImageEnhance.Color(im).enhance(1 - ef['desat'])
    if ef.get('brilho', 1) != 1: im = ImageEnhance.Brightness(im).enhance(ef['brilho'])
    im = im.convert('RGBA')
    if n in EXTERNAS: aplicar_chuva(im, tg)
    im.alpha_composite(vinheta())
    if ef.get('flash'): im.alpha_composite(Image.new('RGBA', (W, H), (255, 255, 255, int(255 * ef['flash']))))
    d = ImageDraw.Draw(im, 'RGBA')
    y = 190
    if 'regra' in hud: y = hud_regra(im, d, hud['regra'][0], hud['regra'][1], t) + 22
    if 'status' in hud: hud_status(d, hud['status'], t, y)
    if 'relogio' in hud: hud_relogio(d, hud['relogio'], t)
    if 'mini_mapa' in hud: hud_mapa(d, hud['mini_mapa'], t)
    if 'nivel_agua' in hud: hud_nivel(d, n, hud['nivel_agua'], t)
    if 'regua' in hud: hud_regua(d, hud['regua'], t)
    if 'circulo_perigo' in hud: hud_circulo(d, mapa, z, t)
    if 'tela_alerta' in hud: hud_alerta(d, hud['tela_alerta'], t)
    if hud.get('x_vermelho'): hud_x(d, t)
    desenhar_legenda(im, n, tg)
    return im.convert('RGB')


# ---------------------------------------------------------------- vídeo
def segmentos():
    cortes = [round(t * FPS) for t in INICIO] + [round(FIM_28 * FPS), round((FIM_28 + PRETO) * FPS), round(T_TOTAL * FPS)]
    return [(i, cortes[i], cortes[i + 1]) for i in range(len(cortes) - 1)]

def render_seg(arg):
    i, f0, f1 = arg; preparar()
    out = f'build/seg_{i:02d}.mp4'
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-threads', '2', out],
                         stdin=subprocess.PIPE)
    for f in range(f0, f1): p.stdin.write(quadro(f / FPS).tobytes())
    p.stdin.close(); p.wait()
    return i, f1 - f0

def video():
    from multiprocessing import Pool
    os.makedirs('build', exist_ok=True); segs = segmentos()
    segs_ord = sorted(segs, key=lambda s: -(s[2] - s[1]))
    with Pool(6) as pool:
        for i, nf in pool.imap_unordered(render_seg, segs_ord): print('seg', i, nf, 'quadros', flush=True)
    with open('build/lista.txt', 'w') as f:
        for i, _, _ in segs: f.write(f"file 'seg_{i:02d}.mp4'\n")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'build/lista.txt', '-c', 'copy', 'build/video.mp4'], check=True)


# ---------------------------------------------------------------- áudio
def audio():
    sys.path.insert(0, os.path.join(RAIZ, 'viralstick', 'audio'))
    from sfx import make
    from dsp import SR, secs, t_axis, noise, lp, hp, bp, sine, stereo, reverb, fade, normalize, rms_db, place, db, write_wav, expdec
    from scipy.io import wavfile
    from scipy import signal
    sr, v = wavfile.read('narracao/voiceover.wav'); v = v.astype(np.float32) / (32768 if v.dtype == np.int16 else 1)
    if v.ndim == 2: v = v.mean(1)
    if sr != SR: v = signal.resample_poly(v, SR, sr).astype(np.float32)
    N = secs(T_TOTAL); mix = np.zeros((N, 2), np.float32); place(mix, stereo(v) / np.sqrt(2), 0)
    vref = rms_db(v[np.abs(v) > 0.02])
    def nivel(x, rel):   # ajusta o RMS (só a parte com som) para 'rel' dB em relação à voz
        ativo = x[np.abs(x).reshape(len(x), -1).max(1) > 1e-3]
        return (x * db(vref + rel - rms_db(ativo))).astype(np.float32)
    def por(x, at, rel): place(mix, nivel(stereo(x) if x.ndim == 1 else x, rel), secs(at))
    def saw(f, n):
        ph = np.cumsum(np.broadcast_to(f, (n,)) / SR); return (2 * (ph % 1) - 1).astype(np.float32)
    tt = t_axis(N)

    # chuva: aberta nas cenas externas, abafada dentro do carro
    ch = make('rain', dur=T_TOTAL, seed=26, heavy=0.9)
    ext = np.zeros(N, np.float32)
    for n in range(1, NC + 1):
        ext[secs(INICIO[n - 1]):secs(FIM[n - 1])] = 1.0 if n in EXTERNAS else 0.0
    ext = np.convolve(ext, np.ones(secs(0.12)) / secs(0.12), mode='same').astype(np.float32)[:, None]
    dentro = lp(ch, 700) * 1.6 + lp(noise(N, 3, 'brown'), 160)[:, None] * 0.25
    chuva_mix = nivel(ch, -17) * ext + nivel(dentro, -20) * (1 - ext)
    mix += chuva_mix

    # drone grave e tenso, crescendo
    dr = sine(55, N) * 0.5 + sine(55.35, N) * 0.42 + sine(82.4, N) * 0.22 + sine(110.6, N) * 0.12 + lp(noise(N, 11, 'brown'), 120) * 0.6
    dr = lp(dr, 380) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.08 * tt))
    pulso = sine(41, N) * np.clip(np.sin(2 * np.pi * 1.15 * tt), 0, 1) ** 6 * (tt > C[14]['start'])
    dr = (dr + pulso * 0.9) * db(np.interp(tt, [0, 30, 70, FIM_28], [-27, -24, -20, -17]) - (-24))
    mix += nivel(stereo(dr.astype(np.float32), 0, 0.6), -24)

    # água forte a partir da cena 15
    ag = make('river', dur=T_TOTAL, seed=60)[:, :] + stereo(lp(noise(N, 61, 'pink'), 600) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.21 * tt)), 0, 0.8)
    env = np.clip((tt - C[14]['start']) / 1.5, 0, 1) * np.interp(tt, [C[14]['start'], FIM_28], [1.0, 1.35])
    mix += nivel(ag, -19) * env[:, None]

    # efeitos pontuais
    por(make('thunder', dur=5.0, seed=27), C[5]['start'] - 0.05, -4)
    bip = np.zeros(secs(1.6), np.float32)
    for k in range(3):
        n = secs(0.32); x = (sine(853, n) + sine(960, n)) * 0.5 * np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / 200)
        place(bip, x, secs(k * 0.45))
    por(bip, C[6]['start'] + 0.05, -9)
    por(make('phonebuzz', seed=21), C[6]['start'] + 0.05, -16)
    n = secs(1.7); u = np.linspace(0, 1, n); f = 52 * (1 - 0.72 * u ** 1.2)
    eng = saw(f, n) * 0.6 + np.sin(2 * np.pi * np.cumsum(2 * f) / SR) * 0.3
    eng = lp(eng * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * np.cumsum(10 - 7 * u) / SR))) * (1 - u) ** 1.4, 800)
    por(eng, C[9]['start'] - 0.1, -9)
    por(make('hit', seed=4), C[9]['start'], -15)
    por(make('hit', seed=5, pitch=0.8), C[11]['start'], -12)
    for n_ in (13, 14, 17, 20, 23): por(make('blip', seed=12, pitch=0.9), C[n_ - 1]['start'] + 0.15, -20)
    por(make('glitch', seed=33), C[9]['start'] + 0.05, -26)
    # bote dos bombeiros chegando
    t0b, t1b = C[23]['start'], C[26]['start'] + 0.4; n = secs(t1b - t0b); tb = t_axis(n)
    fb = 92 + 5 * np.sin(2 * np.pi * 0.6 * tb); bote = lp(saw(fb, n) * (0.8 + 0.2 * np.sin(2 * np.pi * 12 * tb)), 1500) + sine(2 * fb, n) * 0.2
    bote *= np.clip(tb / 2.5, 0, 1) ** 1.5 * np.clip((tb[-1] - tb) / 1.2, 0, 1)
    pan = np.clip(0.8 - tb / 4, 0, 0.8); bote_st = np.stack([bote * np.cos((pan + 1) * np.pi / 4), bote * np.sin((pan + 1) * np.pi / 4)], 1) * np.sqrt(2)
    por(bote_st.astype(np.float32), t0b, -14)
    # rangido metálico (o ônibus), na palavra "barulho"
    tbar, _ = instante_palavra(28, 'BARULHO'); n = secs(2.2); u = np.linspace(0, 1, n)
    fr = 140 + 60 * lp(noise(n, 71), 3) * 8 + 40 * u
    trem = (np.diff(np.floor(np.cumsum(fr) / SR), prepend=0) > 0).astype(np.float32)
    cre = sum(bp(trem, r * 0.92, r * 1.08) * g for r, g in ((420, 1.0), (980, 0.7), (1850, 0.45), (3100, 0.25)))
    cre = cre * np.sin(np.pi * u) ** 0.6 + sine(70 - 15 * u, n) * 0.25 * np.sin(np.pi * u)
    por(reverb(stereo(cre.astype(np.float32), -0.3, 0.5), 1.8, 0.35, 9), tbar + 0.15, -8)

    # corte seco: silêncio de 0,5 s; depois o cartão com um impacto
    a, b = secs(FIM_28) - secs(0.012), secs(FIM_28 + PRETO)
    mix[a:secs(FIM_28)] *= np.linspace(1, 0, secs(FIM_28) - a)[:, None]; mix[secs(FIM_28):b] = 0
    tail = np.zeros((N - b, 2), np.float32)
    place(tail, nivel(make('impact', seed=3), -2), 0)
    nt = N - b; dt = (sine(55, nt) * 0.5 + sine(55.35, nt) * 0.4) * np.linspace(1, 0, nt) ** 1.5
    place(tail, nivel(stereo(lp(dt, 300).astype(np.float32)), -20), 0)
    mix[b:] = tail
    pico = np.abs(mix).max(); print('pico', round(float(pico), 3))
    if pico > 0.97: mix *= 0.97 / pico
    os.makedirs('build', exist_ok=True); write_wav('build/mix.wav', mix); print('build/mix.wav', round(N / SR, 2), 's')


def juntar():
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'build/video.mp4', '-i', 'build/mix.wav',
                    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', '-shortest', 'video_enchente_marginal.mp4'], check=True)
    print('video_enchente_marginal.mp4', os.path.getsize('video_enchente_marginal.mp4') // 2 ** 20, 'MB')


def previa(todas=False):
    preparar(); os.makedirs('previa', exist_ok=True)
    alvos = range(1, NC + 1) if todas else (1, 13, 28)
    for n in alvos:
        tg = INICIO[n - 1] + (FIM[n - 1] - INICIO[n - 1]) * (0.75 if n != 28 else 0.55)
        quadro(tg).save(f'previa/cena_{n:02d}.jpg', quality=90); print('previa', n, round(tg, 2))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'previa'
    if cmd == 'previa': previa('--todas' in sys.argv)
    elif cmd == 'quadro':
        preparar(); [quadro(float(t)).save(f'previa/t_{float(t):05.2f}.jpg', quality=90) for t in sys.argv[2:]]
    elif cmd == 'audio': audio()
    elif cmd == 'video': video()
    elif cmd == 'juntar': juntar()
    elif cmd == 'tudo': audio(); video(); juntar()

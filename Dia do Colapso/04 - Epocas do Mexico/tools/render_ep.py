"""Dia do Colapso (ES) — '¿Cuánto tiempo sobrevivirías en cada época de México?'. Uma cena por fala (narracao/timeline.json).
Uso: python tools/render_ep.py quadros 5@3.0 34@2 ...  |  python tools/render_ep.py cenas 0-63  |  python tools/render_ep.py juntar
Base: render_ep.py do Ep. 03 (Brasil). Imagem de cada fala = última [CENA: imagen — x] antes dela no roteiro;
painel = última [TELA: AGUA ...] da seção; veredito = fala depois de [TELA: TIEMPO DE SUPERVIVENCIA: ...].
Rode com PYTHONUTF8=1.
"""
import sys, json, math, subprocess, os, re
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1920, 1080, 30
AQUI = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(AQUI)
FONTE = os.path.join(AQUI, '..', '..', '..', 'tools', 'Rubik.ttf')
VERM, AMAR, BRANCO, CINZA, VERDE = (255, 64, 64), (255, 205, 110), (245, 245, 245), (160, 166, 182), (80, 200, 120)
AMARELO = (255, 196, 60)
AGUA_COR = (40, 96, 150)
FUNDO = (8, 10, 16)
os.chdir(EP)
TL = json.load(open('narracao/timeline.json', encoding='utf-8'))
FALAS = TL['falas']
N = len(FALAS)

_f = {}
def fonte(t, p='Black'):
    k = (t, p)
    if k not in _f:
        f = ImageFont.truetype(FONTE, t); f.set_variation_by_name(p); _f[k] = f
    return _f[k]

def ease(x):
    x = min(max(x, 0), 1); return x * x * (3 - 2 * x)

def duracao(i):
    if i < N - 1: return FALAS[i + 1]['start'] - FALAS[i]['start']
    return FALAS[i]['end'] - FALAS[i]['start'] + 3.5

# ---------------- roteiro ----------------
def ler_roteiro():
    out, img, painel, tempo, sec = [], None, None, None, 0
    for l in open('roteiro_epocas_mexico.txt', encoding='utf-8').read().splitlines():
        l = l.strip()
        m = re.match(r'\[(\d+)\. (.+)\]$', l)
        if m:
            sec = int(m.group(1)); painel = None; continue
        if l.startswith('[CENA: imagen — '):
            img = re.match(r'\[CENA: imagen — ([a-z0-9_]+)', l).group(1)
            if 'PELIGRO pasa a rojo' in l and painel: painel = painel[:3] + ('rojo',)
        elif l.startswith('[TELA: AGUA '):
            painel = tuple(c for _, c in re.findall(r'(AGUA|COMIDA|REFUGIO|PELIGRO) (verde|amarillo|rojo)', l))
        elif l.startswith('[TELA: TIEMPO DE SUPERVIVENCIA:'):
            tempo = l[len('[TELA: TIEMPO DE SUPERVIVENCIA:'):-1].strip()
        elif l.startswith('NARRADOR:'):
            out.append(dict(sec=sec, img=img, painel=painel, tempo=tempo, texto=l[9:].strip())); tempo = None
    return out
R = ler_roteiro()
assert len(R) == N, (len(R), N)
R[24]['img'] = 'llegada_calzada'   # "entran por la calzada unos extranjeros": a imagem vem logo depois da fala no roteiro
R[26]['img'] = 'viruela_casa'      # a fala da viruela vem antes da linha da imagem

# ---------------- épocas ----------------
SEC_NOME = {}
for f_ in FALAS:
    s = f_['secao']; n = int(s.split('.')[0])
    SEC_NOME[n] = s.split('. ', 1)[1]
ERAS = []
NOMES = ['66 M', '15 MIL', '1519', '1521', '1629', '1915', '1985', 'HOY']
for k in range(8):
    sec = k + 2
    idx = [i for i, r in enumerate(R) if r['sec'] == sec]
    nome_sec = SEC_NOME[sec]
    tit, ano = (nome_sec.split(' — ') + ['HOY'])[:2]
    ver = [i for i in idx if R[i]['tempo']][0]
    ERAS.append(dict(nome=NOMES[k], tit=tit, ano=ano, ini=idx[0], fim=idx[-1], ver=ver, tempo=R[ver]['tempo'],
                     img=R[idx[0]]['img']))

def era_de(i):
    for k, e in enumerate(ERAS):
        if e['ini'] <= i <= e['fim']: return k, e
    return None, None

# ---------------- mapa ----------------
LAT0 = 19.4
KX = math.cos(math.radians(LAT0))
def aneis(geo_, passo=700):
    polys = geo_['coordinates'] if geo_['type'] == 'MultiPolygon' else [geo_['coordinates']]
    rs = []
    for p in polys:
        r = np.array(p[0], float); r = r[::max(1, len(r) // passo)]
        if len(r) >= 4: rs.append(np.c_[r[:, 0] * KX, -r[:, 1]])
    return rs
ESTADOS = [r for ft in json.load(open('dados/mexicoHigh.json', encoding='utf-8'))['features'] for r in aneis(ft['geometry'])]
ALC = {ft['properties']['NOMGEO']: aneis(ft['geometry'], 500)
       for ft in json.load(open('dados/cdmx_alcaldias.json', encoding='utf-8'))['features']}

def cam_box(lon0, lon1, lat0, lat1):
    return ((lon0 + lon1) / 2 * KX, -(lat0 + lat1) / 2, (lon1 - lon0) * KX, lat1 - lat0)
def cam_ponto(lon, lat, larg):
    return (lon * KX, -lat, larg, larg)
CAM_MEXICO = cam_box(-117.5, -86.5, 14.3, 32.8)
CAM_VALLE = cam_box(-99.42, -98.78, 19.12, 19.90)
CAM_LAGO = cam_box(-99.26, -98.88, 19.24, 19.62)
CAM_CIUDAD = cam_box(-99.20, -99.06, 19.37, 19.49)
CAM_CDMX = cam_box(-99.37, -98.94, 19.04, 19.60)
CAM_YUCATAN = cam_box(-92.6, -86.4, 17.6, 22.6)
CAM_SISMO = cam_box(-103.6, -98.4, 17.4, 20.6)
AREA = (60, 40, 1180, 1040)

def cam_transform(cam):
    cx, cy, w, h = cam
    aw, ah = AREA[2] - AREA[0], AREA[3] - AREA[1]
    s = min(aw / w, ah / h)
    return s, (AREA[0] + AREA[2]) / 2 - cx * s, (AREA[1] + AREA[3]) / 2 - cy * s

def lerp_cam(a, b, u):
    u = ease(u)
    return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u,
            math.exp(math.log(a[2]) + (math.log(b[2]) - math.log(a[2])) * u),
            math.exp(math.log(a[3]) + (math.log(b[3]) - math.log(a[3])) * u))

def geo(lon, lat, tr):
    s, ox, oy = tr
    return lon * KX * s + ox, -lat * s + oy

def desenhar_mapa(cam, alc=True, cores_alc=None, contorno=(52, 60, 82)):
    cores_alc = cores_alc or {}
    s, ox, oy = tr = cam_transform(cam)
    im = Image.new('RGB', (W, H), FUNDO); d = ImageDraw.Draw(im)
    for r in ESTADOS:
        d.polygon([tuple(v) for v in (r * s + [ox, oy])], fill=(26, 30, 42), outline=contorno)
    if alc:
        for nome, rs in ALC.items():
            for r in rs:
                d.polygon([tuple(v) for v in (r * s + [ox, oy])], fill=cores_alc.get(nome, (32, 37, 52)), outline=(62, 72, 98))
    return im, tr

# lagos da Cuenca de México (polígonos aproximados, lon/lat)
LAGOS = {
    'texcoco': [(-99.19, 19.47), (-99.17, 19.52), (-99.12, 19.60), (-99.05, 19.64), (-98.98, 19.62), (-98.94, 19.55), (-98.93, 19.47),
                (-98.95, 19.40), (-99.00, 19.36), (-99.05, 19.35), (-99.09, 19.37), (-99.14, 19.39), (-99.18, 19.42)],
    'xochimilco_chalco': [(-99.17, 19.28), (-99.13, 19.30), (-99.08, 19.32), (-99.02, 19.31), (-98.95, 19.30), (-98.88, 19.27),
                          (-98.89, 19.23), (-98.97, 19.235), (-99.05, 19.25), (-99.12, 19.255), (-99.16, 19.26)],
    'xaltocan_zumpango': [(-99.20, 19.80), (-99.12, 19.84), (-99.04, 19.82), (-98.99, 19.74), (-99.02, 19.68), (-99.08, 19.665),
                          (-99.14, 19.70), (-99.18, 19.75)],
}
def chaikin(pts, n=3):
    for _ in range(n):
        q = []
        for j in range(len(pts)):
            a, b = pts[j], pts[(j + 1) % len(pts)]
            q += [(0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]), (0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1])]
        pts = q
    return pts
LAGOS = {k: chaikin(v) for k, v in LAGOS.items()}
ISLA = (-99.133, 19.435)
CALZADAS = [((-99.133, 19.435), (-99.118, 19.487)),   # Tepeyac
            ((-99.133, 19.435), (-99.182, 19.452)),   # Tlacopan
            ((-99.133, 19.435), (-99.100, 19.360))]   # Iztapalapa
ACUEDUCTO = [(-99.190, 19.421), (-99.165, 19.428), (-99.140, 19.433)]
CHICXULUB = (-89.66, 21.29)
TULTEPEC = (-99.128, 19.685)
EPICENTRO = (-102.53, 18.19)
ZOCALO = (-99.133, 19.4326)

def poly(d, pts, tr, fill, outline=None, esc=1.0):
    if esc != 1.0:
        cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
        pts = [(cx + (x - cx) * esc, cy + (y - cy) * esc) for x, y in pts]
    d.polygon([geo(*p, tr) for p in pts], fill=fill, outline=outline)

def lagos(d, tr, a=1.0, esc=1.0):
    for pts in LAGOS.values():
        poly(d, pts, tr, AGUA_COR + (int(215 * a),), (90, 150, 210, int(255 * a)), esc)

def isla(d, tr, a=1.0, calz=True, acu=True, cor_acu=None):
    s = tr[0]
    x, y = geo(*ISLA, tr); r = 0.016 * s
    if calz:
        for p0, p1 in CALZADAS:
            d.line([geo(*p0, tr), geo(*p1, tr)], fill=(200, 190, 160, int(255 * a)), width=max(3, int(s * 0.0022)))
    if acu:
        d.line([geo(*p, tr) for p in ACUEDUCTO], fill=(cor_acu or (140, 200, 255)) + (int(255 * a),), width=max(3, int(s * 0.0025)))
    d.ellipse((x - r * KX * 1.1, y - r, x + r * KX * 1.1, y + r), fill=(205, 190, 150, int(255 * a)), outline=(0, 0, 0, int(200 * a)))

def marcador(d, x, y, t, cor=AMAR, base=14):
    r = base + 8 * (0.5 + 0.5 * math.sin(t * 5))
    d.ellipse((x - r * 2, y - r * 2, x + r * 2, y + r * 2), fill=cor + (50,))
    d.ellipse((x - r, y - r, x + r, y + r), fill=cor)

def rotulo(d, xy, s, tam=40, cor=BRANCO, anchor='lm'):
    txt(d, xy, s, fonte(tam), cor, anchor, 4, 4)

# luzes da cidade (abertura)
_rng = np.random.default_rng(7)
_n = 1500
LUZES = np.c_[_rng.normal(-99.13, 0.075, _n), _rng.normal(19.43, 0.085, _n)]
LUZES = LUZES[(LUZES[:, 0] > -99.30) & (LUZES[:, 0] < -98.92) & (LUZES[:, 1] > 19.18) & (LUZES[:, 1] < 19.70)]
LUZ_T = _rng.uniform(0.6, 2.6, len(LUZES)); LUZ_R = _rng.uniform(1.5, 4.0, len(LUZES))

# ---------------- imagens ----------------
_img = {}
def ken_burns(k, p, zoom=(1.0, 1.1), pan=(0.3, 0.1)):
    if k not in _img:
        _img[k] = Image.open(f'imagens/img_{k}.png').convert('RGB').resize((int(W * 1.25), int(H * 1.25)), Image.LANCZOS)
    im = _img[k]; bw, bh = im.size
    z = zoom[0] + (zoom[1] - zoom[0]) * p
    cw = bw / z * 0.8; ch = cw * H / W
    cx = bw / 2 + pan[0] * (bw - cw) / 2 * p; cy = bh / 2 + pan[1] * (bh - ch) / 2 * p
    return im.transform((W, H), Image.EXTENT, (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2), Image.BILINEAR)

_vin = None
def vinheta(im, forca=0.75):
    global _vin
    if _vin is None:
        y, x = np.mgrid[0:H, 0:W]
        dd = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
        _vin = Image.fromarray((np.clip((dd - 0.5) / 0.9, 0, 1) * 255 * forca).astype(np.uint8), 'L')
    return Image.composite(Image.new('RGB', (W, H)), im, _vin)

def escurecer(im, a):
    return Image.blend(im, Image.new('RGB', (W, H)), a)

MOV = [((1.0, 1.1), (0.3, 0.1)), ((1.1, 1.0), (-0.3, 0)), ((1.0, 1.12), (-0.2, 0.1)), ((1.12, 1.02), (0.25, -0.05)), ((1.0, 1.1), (0, 0.2))]

# ---------------- textos ----------------
def txt(d, xy, s, f, cor=BRANCO, anchor='la', sombra=5, borda=4):
    x, y = xy
    d.text((x + sombra * 0.6, y + sombra), s, font=f, fill=(0, 0, 0), anchor=anchor)
    d.text((x, y), s, font=f, fill=cor, anchor=anchor, stroke_width=borda, stroke_fill=(0, 0, 0))

def caber(d, s, tam, larg, peso='Black'):
    while tam > 22 and d.textlength(s, font=fonte(tam, peso)) > larg: tam -= 2
    return fonte(tam, peso)

def selo(im, linhas, x=60, y=54, cor=AMAR):
    d = ImageDraw.Draw(im, 'RGBA')
    f1 = caber(d, linhas[0], 54, 1000); f2 = caber(d, linhas[1], 28, 1000, 'Bold') if len(linhas) > 1 else None
    larg = max(d.textlength(linhas[0], font=f1), d.textlength(linhas[1], font=f2) if f2 else 0) + 52
    alt = 92 if len(linhas) == 1 else 132
    d.rounded_rectangle((x, y, x + larg, y + alt), 16, fill=(0, 0, 0, 175))
    d.text((x + 26, y + 14), linhas[0], font=f1, fill=cor)
    if f2: d.text((x + 28, y + 88), linhas[1], font=f2, fill=BRANCO)

def legenda_central(im, l1, l2=None, t=0, cor2=VERM, y=None, cor1=BRANCO):
    d = ImageDraw.Draw(im)
    s = 0.9 + 0.1 * ease(t / 0.35)
    y = y or H / 2
    f1 = caber(d, l1, int(92 * s), W - 160)
    txt(d, (W / 2, y - (60 if l2 else 0)), l1, f1, cor1, 'mm', 7, 6)
    if l2: txt(d, (W / 2, y + 70), l2, caber(d, l2, int(116 * s), W - 160), cor2, 'mm', 8, 7)

def faixa_baixo(im, s, cor=BRANCO, t=1, t0=0):
    if t < t0: return
    a = ease((t - t0) / 0.35)
    d = ImageDraw.Draw(im, 'RGBA')
    f = caber(d, s, 44, W - 260)
    lw = d.textlength(s, font=f) + 70
    x0 = (W - lw) / 2; yo = int((1 - a) * 30)
    d.rounded_rectangle((x0, H - 170 + yo, x0 + lw, H - 80 + yo), 18, fill=(0, 0, 0, int(200 * a)))
    d.text((W / 2, H - 125 + yo), s, font=f, fill=cor + (int(255 * a),), anchor='mm')

def tela_numero(im, l1, l2, t, cor=VERM, fonte_txt=None):
    im2 = escurecer(im, 0.55)
    legenda_central(im2, l1, l2, t, cor)
    if fonte_txt:
        d = ImageDraw.Draw(im2); d.text((W / 2, H - 120), fonte_txt, font=fonte(28, 'Bold'), fill=CINZA, anchor='mm')
    return im2

# ---------------- painel AGUA / COMIDA / REFUGIO / PELIGRO ----------------
NOMES_P = ['AGUA', 'COMIDA', 'REFUGIO', 'PELIGRO']
COR_P = {'verde': VERDE, 'amarillo': AMARELO, 'rojo': VERM}
NIVEL = {'verde': 0.88, 'amarillo': 0.52, 'rojo': 0.18}
NIVEL_PEL = {'verde': 0.15, 'amarillo': 0.52, 'rojo': 0.92}
PALAVRA = {'verde': 'BIEN', 'amarillo': 'REGULAR', 'rojo': 'CRÍTICO'}
PALAVRA_PEL = {'verde': 'BAJO', 'amarillo': 'MEDIO', 'rojo': 'ALTO'}

def mistura(a, b, u):
    return tuple(int(a[j] + (b[j] - a[j]) * u) for j in range(3))

def painel(im, cur, ant, t, x0=1450, y0=330, bw=390, esc=1.0, dur=1.2):
    d = ImageDraw.Draw(im, 'RGBA')
    passo = int(92 * esc)
    d.rounded_rectangle((x0 - 30 * esc, y0 - 30 * esc, x0 + bw + 30 * esc, y0 + 4 * passo + 4), int(18 * esc), fill=(0, 0, 0, 175))
    u = ease((t - 0.3) / dur)
    for j, n in enumerate(NOMES_P):
        niv = NIVEL_PEL if j == 3 else NIVEL
        c1 = cur[j]; c0 = ant[j] if ant else None
        v1 = niv[c1]; v0 = niv[c0] if c0 else 0.0
        v = v0 + (v1 - v0) * u
        cor = mistura(COR_P[c0], COR_P[c1], u) if c0 else COR_P[c1]
        y = y0 + j * passo
        f = fonte(int(30 * esc), 'Bold')
        d.text((x0, y), n, font=f, fill=BRANCO)
        pal = (PALAVRA_PEL if j == 3 else PALAVRA)[c1 if u > 0.5 or not c0 else c0]
        d.text((x0 + bw, y), pal, font=fonte(int(26 * esc)), fill=cor, anchor='ra')
        by = y + int(44 * esc); bh = int(18 * esc)
        d.rounded_rectangle((x0, by, x0 + bw, by + bh), bh // 2, fill=(255, 255, 255, 45))
        if v > 0.01: d.rounded_rectangle((x0, by, x0 + max(bh, bw * v), by + bh), bh // 2, fill=cor + (255,))
        if c0 and c0 != c1 and 0 < t < 2.5:   # destaque de mudança
            a = int(200 * (1 - ease((t - 1.0) / 1.5)))
            d.rounded_rectangle((x0 - 10, y - 8, x0 + bw + 10, by + bh + 10), 10, outline=cor + (a,), width=3)

def painel_fala(im, i, t):
    cur = R[i]['painel']
    if not cur: return
    ant = R[i - 1]['painel'] if i > 0 and R[i - 1]['sec'] == R[i]['sec'] else None
    painel(im, cur, ant if ant != cur else cur, t)

def contador(im, i, t, revelado=False):
    k, e = era_de(i)
    if e is None: return
    d = ImageDraw.Draw(im, 'RGBA')
    s1 = 'TIEMPO DE SUPERVIVENCIA'
    s2 = e['tempo'] if revelado else '?'
    f1 = fonte(24, 'Bold')
    f2 = caber(d, s2, 42, 700)
    larg = max(d.textlength(s1, font=f1), d.textlength(s2, font=f2)) + 56
    x1 = W - 60; x0 = x1 - larg
    d.rounded_rectangle((x0, 54, x1, 54 + 116), 16, fill=(0, 0, 0, 180), outline=AMAR if revelado else (90, 90, 100), width=3)
    d.text((x0 + 28, 70), s1, font=f1, fill=CINZA)
    d.text((x0 + 28, 104), s2, font=f2, fill=AMAR if revelado else BRANCO)

def selo_era(im, i, sub=None):
    k, e = era_de(i)
    selo(im, [f"ÉPOCA {k + 1} · {e['ano']}", sub or e['tit']])

# ---------------- mapas de cada época ----------------
def camadas_era(k, d, tr, t, D):
    """desenha o que é próprio de cada época sobre o mapa e devolve (x, y, rótulo) do marcador."""
    if k == 0:
        x, y = geo(*CHICXULUB, tr)
        if t > 1.6:   # cratera de ~200 km
            a = ease((t - 1.6) / 1.0); r = 0.9 * tr[0] * a
            d.ellipse((x - r, y - r, x + r, y + r), outline=VERM + (int(200 * a),), width=4)
        rotulo(d, geo(-90.6, 19.6, tr), 'PENÍNSULA DE YUCATÁN', 34, CINZA, 'mm')
        return x, y, 'TÚ ESTÁS AQUÍ'
    if k == 1:
        lagos(d, tr, 1.0, 1.12)
        rotulo(d, geo(-99.02, 19.50, tr), 'LAGO', 30, (150, 200, 240), 'mm')
        x, y = geo(*TULTEPEC, tr)
        return x, y, 'TULTEPEC'
    if k == 2:
        lagos(d, tr)
        isla(d, tr)
        rotulo(d, geo(-98.99, 19.52, tr), 'LAGO DE TEXCOCO', 30, (150, 200, 240), 'mm')
        rotulo(d, geo(-99.200, 19.405, tr), 'CHAPULTEPEC', 26, CINZA, 'rm')
        x, y = geo(*ISLA, tr)
        return x, y, 'TENOCHTITLAN'
    if k == 3:
        lagos(d, tr)
        isla(d, tr, cor_acu=VERM if int(t * 3) % 2 == 0 else (120, 30, 30))
        s = tr[0]
        for p0, p1 in CALZADAS:   # flechas de fora para a ilha
            x0, y0 = geo(*p1, tr); x1, y1 = geo(*p0, tr)
            u = ease((t - 0.8) / 1.5)
            xm, ym = x0 + (x1 - x0) * 0.7 * u, y0 + (y1 - y0) * 0.7 * u
            d.line([(x0, y0), (xm, ym)], fill=VERM + (255,), width=8)
            ang = math.atan2(ym - y0, xm - x0)
            d.polygon([(xm + 22 * math.cos(ang), ym + 22 * math.sin(ang)), (xm + 14 * math.cos(ang + 2.3), ym + 14 * math.sin(ang + 2.3)),
                       (xm + 14 * math.cos(ang - 2.3), ym + 14 * math.sin(ang - 2.3))], fill=VERM)
        rng = np.random.default_rng(3)
        for b in range(13):   # bergantines
            lon = -99.09 + rng.uniform(-0.03, 0.05) + 0.004 * math.sin(t + b); lat = 19.44 + rng.uniform(-0.05, 0.05)
            bx, by = geo(lon, lat, tr)
            d.rectangle((bx - 6, by - 3, bx + 6, by + 3), fill=(230, 230, 230))
        rotulo(d, geo(-99.195, 19.405, tr), 'ACUEDUCTO CORTADO', 26, VERM, 'rm')
        x, y = geo(*ISLA, tr)
        return x, y, None
    if k == 4:
        lagos(d, tr, 0.8)
        cx, cy = geo(*ISLA, tr)
        rx = 0.026 * KX * tr[0]; ry = 0.022 * tr[0]
        d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(150, 140, 120), outline=(0, 0, 0))
        for gx in range(-3, 4):   # traza de calles rectas
            d.line([(cx + gx * rx / 4, cy - ry * 0.85), (cx + gx * rx / 4, cy + ry * 0.85)], fill=(110, 100, 85), width=2)
            d.line([(cx - rx * 0.85, cy + gx * ry / 4), (cx + rx * 0.85, cy + gx * ry / 4)], fill=(110, 100, 85), width=2)
        a = ease((t - 0.8) / 2.5)   # o agua sube
        if a > 0:
            r2 = 1.15 * a
            d.ellipse((cx - rx * r2, cy - ry * r2, cx + rx * r2, cy + ry * r2), fill=AGUA_COR + (int(190 * a),))
        rotulo(d, (cx + rx + 20, cy - ry - 10), 'CIUDAD DE MÉXICO', 30, BRANCO, 'lm')
        return None
    if k == 5:
        cx, cy = geo(*ZOCALO, tr)
        bandos = [('CARRANCISTAS', (230, 120, 60)), ('VILLISTAS', (90, 160, 240)), ('ZAPATISTAS', (240, 200, 70)), ('CARRANCISTAS', (230, 120, 60))]
        j = min(3, int(max(0, t - 0.6) / 1.1))
        nome, cor = bandos[j]
        f = fonte(34)
        lw = d.textlength(nome, font=f) + 40
        d.rounded_rectangle((cx + 40, cy - 90, cx + 40 + lw, cy - 40), 12, fill=cor + (235,))
        d.text((cx + 60, cy - 65), nome, font=f, fill=(15, 15, 15), anchor='lm')
        d.line([(cx, cy), (cx + 40, cy - 40)], fill=cor, width=4)
        return cx, cy, None
    if k == 6:
        ex, ey = geo(*EPICENTRO, tr); cx, cy = geo(*ZOCALO, tr)
        dist = math.hypot(cx - ex, cy - ey)
        for w_ in range(4):   # ondas que viajam até a CDMX
            fase = ((t - 0.6) * 0.45 - w_ * 0.25)
            if fase <= 0: continue
            r = (fase % 1.0) * dist * 1.05
            a = int(220 * (1 - (fase % 1.0)))
            d.ellipse((ex - r, ey - r, ex + r, ey + r), outline=VERM + (a,), width=5)
        marcador(d, ex, ey, t, VERM, 12)
        rotulo(d, (ex - 10, ey + 50), 'COSTA DE MICHOACÁN', 32, BRANCO, 'mm')
        rotulo(d, (cx + 40, cy - 30), 'CDMX', 40, BRANCO, 'lm')
        return cx, cy, None
    if k == 7:
        return None
    return None

CAM_ERA = [(CAM_MEXICO, CAM_YUCATAN), (CAM_MEXICO, CAM_VALLE), (CAM_VALLE, CAM_LAGO), (CAM_VALLE, CAM_LAGO),
           (CAM_LAGO, CAM_CIUDAD), (CAM_LAGO, CAM_CIUDAD), (CAM_MEXICO, CAM_SISMO), (CAM_VALLE, CAM_CDMX)]
HUNDE = {'Iztapalapa': (170, 50, 50), 'Gustavo A. Madero': (170, 50, 50), 'Cuauhtémoc': (170, 50, 50)}

def mapa_era(k, t, D):
    e = ERAS[k]
    a, b = CAM_ERA[k]
    cam = lerp_cam(a, b, (t - 0.3) / 2.2)
    alc = k >= 4 or k == 7
    cores = {n: mistura((32, 37, 52), c, ease((t - 1.5) / 1.2)) for n, c in HUNDE.items()} if k == 7 else None
    im, tr = desenhar_mapa(cam, alc=alc, cores_alc=cores)
    d = ImageDraw.Draw(im, 'RGBA')
    m = camadas_era(k, d, tr, t, D)
    if m:
        x, y, lab = m
        marcador(d, x, y, t)
        if lab and t > 1.2: rotulo(d, (x + 50, y), lab, 44)
    if k == 7 and t > 1.5:
        for n, (lon, lat) in {'IZTAPALAPA': (-99.06, 19.35), 'GUSTAVO A. MADERO': (-99.11, 19.50), 'CENTRO': (-99.15, 19.43)}.items():
            rotulo(d, geo(lon, lat, tr), n, 28, BRANCO, 'mm')
    d.text((1260, 330), f"ÉPOCA {k + 1} DE 8", font=fonte(40, 'Bold'), fill=CINZA)
    d.text((1260, 390), e['nome'], font=fonte(150), fill=AMAR)
    d.text((1260, 570), e['tit'], font=caber(d, e['tit'], 46, 620), fill=BRANCO)
    if e['ano'] not in (e['nome'], 'HOY'):
        d.text((1260, 635), e['ano'], font=caber(d, e['ano'], 30, 620, 'Bold'), fill=CINZA)
    if k == 6:
        d.text((1260, 700), '7:17', font=fonte(110), fill=VERM)
        d.text((1265, 830), 'DE LA MAÑANA', font=fonte(30, 'Bold'), fill=CINZA)
    if k == 7 and t > 1.5:
        d.rounded_rectangle((1260, 720, 1290, 750), 6, fill=(170, 50, 50))
        d.text((1306, 735), 'ZONAS QUE MÁS SE HUNDEN', font=fonte(28, 'Bold'), fill=BRANCO, anchor='lm')
    return im

# ---------------- cenas-base ----------------
def foto(i, k_img, t, D, zoom=None, pan=None, sub=None, painel_=True, escuro=0, revelado=False):
    mz, mp = MOV[i % len(MOV)]
    im = vinheta(ken_burns(k_img, t / D, zoom or mz, pan or mp))
    if escuro: im = escurecer(im, escuro)
    selo_era(im, i, sub)
    contador(im, i, t, revelado)
    if painel_: painel_fala(im, i, t)
    return im

def intro_era(i, t, D):
    k, e = era_de(i)
    corte = min(5.0, D * 0.4)
    ft = foto(i, R[i]['img'], t, D)
    if t >= corte + 0.7: return ft
    m = mapa_era(k, t, D)
    if t < corte: return m
    return Image.blend(m, ft, ease((t - corte) / 0.7))

def veredito(i, t, D):
    k, e = era_de(i)
    im = escurecer(vinheta(ken_burns(R[i]['img'], t / D, (1.08, 1.0), (0, 0))), 0.62)
    d = ImageDraw.Draw(im)
    txt(d, (W / 2, 250), f"{e['nome']} · VEREDICTO", fonte(40, 'Bold'), CINZA, 'mm', 3, 3)
    a = ease((t - 0.3) / 0.4)
    if a > 0:
        txt(d, (W / 2, 360), 'TIEMPO DE SUPERVIVENCIA:', fonte(int(76 * (0.9 + 0.1 * a))), AMAR, 'mm', 6, 5)
    partes = e['tempo'].split(' — ')
    for j, l in enumerate(partes):
        if t > 0.9 + j * 1.0:
            f = caber(d, l, 96 if j == 0 else 76, W - 200)
            cor = VERM if (k == 0 or l == 'UNAS SEMANAS') and j == 0 else (BRANCO if j == 0 else AMAR)
            txt(d, (W / 2, 520 + j * 130), l, f, cor, 'mm', 6, 5)
    selo_era(im, i)
    contador(im, i, t, revelado=t > 1.0)
    return im

# ---------------- legendas por fala ----------------
# índice da fala -> lista de (texto, cor, início em fração da fala, fim em fração ou None)
FAIXAS = {
    6: [('ROCA DE ~10 KM · CRÁTER DE CASI 200 KM', AMAR, 0.25, None)],
    7: [('EL CALOR Y LA ONDA EXPANSIVA LLEGAN ANTES QUE EL SONIDO', VERM, 0.1, 0.5),
        ('LEJOS: ROCA ARDIENTE, INCENDIOS, MESES DE FRÍO', AMAR, 0.5, None)],
    12: [('AGUA: DE SOBRA · COMIDA: DEPENDE DE TI', BRANCO, 0.1, 0.6), ('DE NOCHE: DEPREDADORES. Y NO TIENES FUEGO', VERM, 0.6, None)],
    14: [('TULTEPEC, 2019 · INAH', AMAR, 0.05, 0.45), ('+800 HUESOS · AL MENOS 14 MAMUTS · ERAN TRAMPAS', BRANCO, 0.45, None)],
    15: [('EN GRUPO: FUEGO, ROPA DE PIEL Y CARNE', VERDE, 0.1, 0.55), ('SOLO: EN UNA CUENCA LLENA DE ANIMALES MÁS GRANDES QUE TÚ', VERM, 0.55, None)],
    17: [('UNA DE LAS CIUDADES MÁS GRANDES DEL MUNDO', AMAR, 0.6, None)],
    18: [('AGUA: ACUEDUCTO DE CHAPULTEPEC', BRANCO, 0.05, 0.5), ('COMIDA: CHINAMPAS, COSECHA CASI TODO EL AÑO', VERDE, 0.5, None)],
    19: [('MERCADO DE TLATELOLCO · DECENAS DE MILES DE PERSONAS', AMAR, 0.1, None)],
    21: [('CALPULLI: EL BARRIO QUE TE DA TIERRA Y PROTECCIÓN', BRANCO, 0.15, 0.6), ('FORASTERO SIN LUGAR: ESCLAVO O CAUTIVO', VERM, 0.6, None)],
    22: [('APRENDER · TRABAJAR · QUE ALGUIEN RESPONDA POR TI', VERDE, 0.1, None)],
    24: [('NOVIEMBRE DE 1519', AMAR, 0.1, None)],
    26: [('1520 · LLEGA LA VIRUELA', VERM, 0.05, 0.6), ('MUERE EL HUEY TLATOANI CUITLÁHUAC', AMAR, 0.6, None)],
    27: [('MAYO DE 1521 · LO PRIMERO: CORTAR EL ACUEDUCTO', VERM, 0.15, None)],
    28: [('SIN CANOAS CON COMIDA · RAÍCES, LAGARTIJAS, HIERBAS', BRANCO, 0.1, None)],
    29: [('13 DE AGOSTO DE 1521 · CAE TENOCHTITLAN', VERM, 0.4, None)],
    30: [('TU MEJOR CARTA: SALIR ANTES DE QUE CIERREN LAS CALZADAS', AMAR, 0.1, None)],
    33: [('21 DE SEPTIEMBRE DE 1629 · DÍA DE SAN MATEO', AMAR, 0.05, 0.55), ('UNAS 36 HORAS DE LLUVIA SIN PARAR', BRANCO, 0.55, None)],
    34: [('MÁS DE 2 METROS DE AGUA EN MUCHAS CALLES', AMAR, 0.1, None)],
    35: [('AGUA SUCIA: HIÉRVELA ANTES DE BEBERLA', VERM, 0.3, None)],
    36: [('MISAS EN LOS BALCONES', BRANCO, 0.1, 0.5), ('INUNDADA CERCA DE 5 AÑOS · HASTA 1634', AMAR, 0.5, None)],
    38: [('CANOA · AZOTEA · FUEGO PARA HERVIR AGUA', VERDE, 0.1, 0.6), ('SI NO: IRTE EN LA PRIMERA SEMANA', AMAR, 0.6, None)],
    40: [('EN PLENA REVOLUCIÓN', AMAR, 0.1, 0.5), ('TRANVÍAS · LUZ ELÉCTRICA EN EL CENTRO', BRANCO, 0.5, None)],
    42: [('LA CAPITAL CAMBIA DE MANOS VARIAS VECES', BRANCO, 0.05, 0.5), ('CADA BANDO IMPRIME SU PROPIO DINERO', AMAR, 0.5, None)],
    43: [('LOS TRENES DEL MAÍZ AHORA MUEVEN TROPAS', BRANCO, 0.05, 0.6), ('FILAS ENORMES PARA RECIBIR COMIDA', AMAR, 0.6, None)],
    44: [('AGOSTO A DICIEMBRE DE 1915 · MÁS DE 6 MIL ENFERMOS DE TIFO', VERM, 0.3, None)],
    45: [('EL ENEMIGO: DESNUTRICIÓN LENTA Y ENFERMEDAD', AMAR, 0.1, None)],
    49: [('SIN ALERTA SÍSMICA · LAS ONDAS TARDAN UNOS 2 MINUTOS', AMAR, 0.1, None)],
    50: [('ARCILLA BLANDA DEL ANTIGUO LAGO: AMPLIFICA EL MOVIMIENTO', AMAR, 0.1, 0.6), ('EDIFICIOS DE 6 A 15 PISOS', VERM, 0.6, None)],
    51: [('LO QUE IMPORTA: LOS PRIMEROS 2 MINUTOS', AMAR, 0.05, 0.6), ('MUERTOS: DE MILES (OFICIAL) A MÁS DE 10 MIL (OTRAS ESTIMACIONES)', BRANCO, 0.6, None)],
    52: [('MILES DE VECINOS RESCATARON CON SUS MANOS · NACEN LOS TOPOS', AMAR, 0.3, None)],
    55: [('MIRA LA BARRA DEL AGUA', AMARELO, 0.35, None)],
    56: [('CERCA DEL 70% DEL AGUA SALE DE POZOS', AMAR, 0.05, 0.6), ('LA ARCILLA SE COMPACTA. LA CIUDAD SE HUNDE.', VERM, 0.6, None)],
    57: [('HASTA 40 O 50 CM POR AÑO EN ALGUNAS ZONAS', VERM, 0.05, 0.5), ('EL ÁNGEL DE LA INDEPENDENCIA YA TIENE ESCALONES DE MÁS', AMAR, 0.5, None)],
    58: [('EL MISMO LAGO DE SIEMPRE, COBRANDO LA FACTURA', AMAR, 0.3, None)],
}
def faixas(im, i, t, D):
    for s_, cor, a, b in FAIXAS.get(i, []):
        if t >= a * D and (b is None or t < b * D): faixa_baixo(im, s_, cor, t, a * D)

# ---------------- cenas ----------------
def mapa_abertura(t, D):
    im, tr = desenhar_mapa(CAM_VALLE)
    d = ImageDraw.Draw(im, 'RGBA')
    a_lago = ease((t - 2.0) / 1.5)
    if a_lago > 0: lagos(d, tr, a_lago)
    if t > 4.2: isla(d, tr, ease((t - 4.2) / 0.8))
    s = tr[0]
    for (lon, lat), t1, r in zip(LUZES, LUZ_T, LUZ_R):
        a = 1 - ease((t - t1) / 0.5)
        if a <= 0: continue
        x, y = geo(lon, lat, tr)
        d.ellipse((x - r * 2.2, y - r * 2.2, x + r * 2.2, y + r * 2.2), fill=(255, 200, 110, int(40 * a)))
        d.ellipse((x - r * 0.7, y - r * 0.7, x + r * 0.7, y + r * 0.7), fill=(255, 225, 160, int(230 * a)))
    itens = [(1.9, 'UN LAGO', (150, 200, 240)), (4.2, 'UN IMPERIO', AMAR), (5.9, 'MAMUTS', BRANCO), (7.4, 'UN ASTEROIDE', VERM)]
    for j, (t0, s_, cor) in enumerate(itens):
        if t > t0:
            a = ease((t - t0) / 0.4)
            d.text((1300, 300 + j * 120), s_, font=fonte(76), fill=cor + (int(255 * a),))
    if t < 2.2: rotulo(d, (1300, 200), 'VALLE DE MÉXICO', 44, CINZA, 'lm')
    return im

def cena(i, t, D):
    p = t / D
    k, e = era_de(i)
    if e and i == e['ini']:
        im = intro_era(i, t, D)
        if k == 6 and t > min(5.0, D * 0.4) + 0.7:
            dd = ImageDraw.Draw(im)
            txt(dd, (1640, 860), '7:17', fonte(130), VERM, 'mm', 6, 5)
            txt(dd, (1640, 950), 'JUEVES · 19/9/1985', fonte(30, 'Bold'), BRANCO, 'mm', 3, 3)
        if k == 0 and t > D * 0.7: faixa_baixo(im, 'HELECHOS GIGANTES · INSECTOS ENORMES · ALGO QUE CAMINA EN DOS PATAS', BRANCO, t, D * 0.7)
        if k == 1 and t > D * 0.6: faixa_baixo(im, 'DONDE HOY ESTÁ EL ESTADO DE MÉXICO', AMAR, t, D * 0.6)
        if k == 7 and t > D * 0.6: faixa_baixo(im, 'AGUA EN LA LLAVE · COMIDA EN CADA ESQUINA · ALERTA SÍSMICA', BRANCO, t, D * 0.6)
        return im
    if e and i == e['ver']:
        return veredito(i, t, D)

    # ---- abertura
    if i == 0:
        return mapa_abertura(t, D)
    if i == 1:
        im, tr = desenhar_mapa(CAM_MEXICO, alc=False)
        im = escurecer(im, 0.25)
        d = ImageDraw.Draw(im, 'RGBA')
        for j, er in enumerate(ERAS):
            tj = 0.6 + j * 0.55
            if t < tj: continue
            a = ease((t - tj) / 0.3)
            d.text((1180, 150 + j * 92), f"{j + 1}. {er['nome']}", font=fonte(52), fill=AMAR + (int(255 * a),))
            d.text((1460, 166 + j * 92), er['tit'].capitalize(), font=caber(d, er['tit'].capitalize(), 30, 420, 'Bold'), fill=CINZA + (int(255 * a),))
        for lon, lat in (CHICXULUB, ISLA, EPICENTRO):
            if t > 1.0:
                x, y = geo(lon, lat, tr); d.ellipse((x - 10, y - 10, x + 10, y + 10), fill=AMAR)
        if t > D * 0.5: faixa_baixo(im, 'SIN TELÉFONO · SIN DINERO DE LA ÉPOCA · SIN CONOCER A NADIE', AMAR, t, D * 0.5)
        return im
    if i == 2:
        im, _ = desenhar_mapa(CAM_VALLE)
        im = escurecer(im, 0.55)
        estados = [('verde',) * 4, ('amarillo', 'verde', 'rojo', 'amarillo'), ('rojo', 'amarillo', 'amarillo', 'rojo')]
        j = min(2, int(t / max(1.0, D * 0.33)))
        cur = estados[j]; ant = estados[j - 1] if j else None
        painel(im, cur, ant, t - j * max(1.0, D * 0.33), x0=440, y0=300, bw=620, esc=1.35)
        d = ImageDraw.Draw(im, 'RGBA')
        if t > D * 0.55:
            a = ease((t - D * 0.55) / 0.4)
            d.rounded_rectangle((1220, 380, 1720, 560), 18, fill=(0, 0, 0, int(180 * a)), outline=AMAR + (int(255 * a),), width=3)
            d.text((1250, 405), 'TIEMPO DE SUPERVIVENCIA', font=fonte(28, 'Bold'), fill=CINZA + (int(255 * a),))
            d.text((1470, 500), '?', font=fonte(80), fill=AMAR + (int(255 * a),), anchor='mm')
        return im
    if i == 3:
        cam = lerp_cam(CAM_VALLE, CAM_MEXICO, p / 0.8)
        im, _ = desenhar_mapa(cam, contorno=(80, 90, 120))
        im = escurecer(im, 0.3)
        legenda_central(im, '¿CUÁNTO TIEMPO', 'SOBREVIVIRÍAS?', t, AMAR)
        return im

    # ---- cenas com mapa no meio da época
    if i == 48:   # sismo em Michoacán
        im = mapa_era(6, t + 3.0, D)
        faixa_baixo(im, 'MAGNITUD 8.1 · FRENTE A LA COSTA DE MICHOACÁN', VERM, t, 0.8)
        return im
    if i == 8:
        im = foto(i, R[i]['img'], t, D, escuro=0.4)
        legenda_central(im, 'NINGÚN SER HUMANO', 'VIO ESTO', t, AMAR)
        return im
    if i == 20:
        im = foto(i, R[i]['img'], t, D)
        legenda_central(im, 'EL PROBLEMA', 'ERES TÚ', t, VERM, y=H / 2 + 200)
        return im
    if i == 37:
        im = foto(i, R[i]['img'], t, D, painel_=False)
        im = tela_numero(im, 'DE UNAS 20 MIL FAMILIAS ESPAÑOLAS', 'QUEDARON UNAS 400', t, VERM, 'según el arzobispo de la época · murieron miles de personas')
        return im
    if i == 41:
        im = foto(i, R[i]['img'], t, D, escuro=0.45, painel_=False)
        legenda_central(im, 'NO LO ES.', None, t)
        return im
    if i == 24:
        im = foto(i, R[i]['img'], t, D, revelado=True)
        faixas(im, i, t, D)
        return im

    # ---- cierre
    if i == 60:
        im = Image.new('RGB', (W, H), FUNDO)
        d = ImageDraw.Draw(im, 'RGBA')
        txt(d, (W / 2, 120), 'OCHO ÉPOCAS, OCHO VEREDICTOS', fonte(60), BRANCO, 'mm', 4, 4)
        cw, ch, gx, gy = 410, 330, 40, 30
        x0 = (W - (4 * cw + 3 * gx)) / 2
        for j, er in enumerate(ERAS):
            if t < 0.8 + j * (D - 2.5) / 8: continue
            cx = x0 + (j % 4) * (cw + gx); cy = 190 + (j // 4) * (ch + gy)
            cor = VERM if j == 0 else (AMAR if j == 7 else (90, 96, 112))
            d.rounded_rectangle((cx, cy, cx + cw, cy + ch), 20, fill=(20, 24, 34), outline=cor, width=4)
            th = Image.open(f"imagens/img_{er['img']}.png").convert('RGB').resize((cw - 24, 150))
            im.paste(th, (int(cx + 12), int(cy + 12)))
            d.text((cx + 22, cy + 172), er['nome'], font=fonte(50), fill=cor if cor != (90, 96, 112) else BRANCO)
            partes = er['tempo'].split(' — ')
            d.text((cx + 22, cy + 240), partes[0], font=caber(d, partes[0], 34, cw - 44), fill=AMAR)
            if len(partes) > 1: d.text((cx + 22, cy + 285), partes[1], font=caber(d, partes[1], 26, cw - 44, 'Bold'), fill=CINZA)
        return im
    if i == 61:
        im = escurecer(vinheta(ken_burns('capas_valle', p, (1.0, 1.08), (0, 0.1))), 0.35)
        if t > 0.8: legenda_central(im, 'EL PROTAGONISTA', 'EL LAGO', t - 0.8, (120, 190, 250))
        return im
    if i == 62:
        im, tr = desenhar_mapa(CAM_VALLE)
        d = ImageDraw.Draw(im, 'RGBA'); lagos(d, tr, 0.6); isla(d, tr, 0.6)
        im = escurecer(im, 0.35)
        legenda_central(im, '¿EN CUÁL DURARÍAS MÁS?', 'DÉJALO EN LOS COMENTARIOS', t, AMAR)
        return im
    if i == 63:
        im = escurecer(vinheta(ken_burns('pozo_agua', p, (1.0, 1.06), (0, 0))), 0.55)
        d = ImageDraw.Draw(im)
        if t < D - 3.5:
            txt(d, (W / 2, 300), 'PRÓXIMO VIDEO', fonte(48, 'Bold'), CINZA, 'mm', 3, 3)
            legenda_central(im, 'LO QUE HAY DEBAJO', 'DE LA CIUDAD DE MÉXICO', t, AMAR)
        else:
            legenda_central(im, '¿Y SI PASARA AQUÍ?', None, t - (D - 3.5), cor1=AMAR)
        return im

    # ---- padrão: foto da fala + painel + legendas
    if e:
        im = foto(i, R[i]['img'], t, D)
        faixas(im, i, t, D)
        return im
    return Image.new('RGB', (W, H), FUNDO)

def fade(im, t, D, i):
    a = 1.0
    if i == 0 and t < 0.6: a = t / 0.6
    if i == N - 1 and t > D - 1.0: a = min(a, (D - t) / 1.0)
    if a >= 1: return im
    return Image.blend(Image.new('RGB', (W, H)), im, max(a, 0))

def render(i):
    D = duracao(i)
    n = int(round(D * FPS))
    tmp = f'clipes/c{i:02d}.tmp.mp4'
    pr = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                           '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', tmp], stdin=subprocess.PIPE)
    for k in range(n):
        t = k / FPS
        pr.stdin.write(fade(cena(i, t, D), t, D, i).tobytes())
    pr.stdin.close()
    if pr.wait() == 0:
        os.replace(tmp, f'clipes/c{i:02d}.mp4'); print('ok', i, round(D, 2), flush=True)

def juntar():
    with open('lista.txt', 'w') as f:
        for i in range(N): f.write(f"file 'clipes/c{i:02d}.mp4'\n")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'lista.txt', '-c', 'copy', 'video.mp4'], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'video.mp4', '-i', 'mix.m4a', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy',
                    '-shortest', 'ep_mx_epocas.mp4'], check=True)
    os.remove('video.mp4')
    print('pronto: ep_mx_epocas.mp4')

if __name__ == '__main__':
    os.makedirs('clipes', exist_ok=True)
    if sys.argv[1] == 'quadros':
        os.makedirs('quadros', exist_ok=True)
        for a in sys.argv[2:]:
            i, t = a.split('@'); i = int(i); t = float(t)
            fade(cena(i, t, duracao(i)), t, duracao(i), i).save(f'quadros/q_{i:02d}_{t:.1f}.jpg', quality=85)
    elif sys.argv[1] == 'info':
        for k, e in enumerate(ERAS): print(k + 1, e['nome'], e['tit'], '|', e['ano'], e['ini'], e['fim'], e['ver'], e['tempo'], e['img'])
        for i, r in enumerate(R): print(i, r['sec'], r['img'], r['painel'], r['tempo'] or '', round(duracao(i), 1))
    elif sys.argv[1] == 'juntar':
        juntar()
    else:
        a, b = map(int, sys.argv[2].split('-'))
        for i in range(a, b + 1):
            if not os.path.exists(f'clipes/c{i:02d}.mp4'): render(i)

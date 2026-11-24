"""Dia do Colapso — Ep. 03 'Quanto tempo você duraria em cada época do Brasil?'. Uma cena por fala (narracao/timeline.json).
Uso: python render_ep.py quadros 5@3.0 34@2 ...  |  python render_ep.py cenas 0-58  |  python render_ep.py juntar
Base: o render_ep.py do episódio 02 (mapa, Ken Burns, selos, painel de recursos).
"""
import sys, json, math, subprocess, os, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 30
AQUI = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(AQUI)
FONTE = os.path.join(AQUI, '..', '..', '..', 'tools', 'Rubik.ttf')
VERM, AMAR, BRANCO, CINZA, VERDE = (255, 64, 64), (255, 205, 110), (245, 245, 245), (160, 166, 182), (80, 200, 120)
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

# ---------------- mapa ----------------
G = json.load(open('dados/br.geojson', encoding='utf-8'))
LAT0 = -14
KX = math.cos(math.radians(LAT0))
ESTADOS = {}
for ft in G['features']:
    uf = ft['properties']['sigla']; geo_ = ft['geometry']
    polys = geo_['coordinates'] if geo_['type'] == 'MultiPolygon' else [geo_['coordinates']]
    rings = []
    for p in polys:
        r = np.array(p[0], float); r = r[::max(1, len(r) // 900)]
        if len(r) >= 4: rings.append(np.c_[r[:, 0] * KX, -r[:, 1]])
    ESTADOS[uf] = rings
TODOS = np.vstack([r for rs in ESTADOS.values() for r in rs])
BX0, BY0 = TODOS.min(0); BX1, BY1 = TODOS.max(0)
CAM_BRASIL = ((BX0 + BX1) / 2, (BY0 + BY1) / 2, (BX1 - BX0) * 1.08, (BY1 - BY0) * 1.08)
AREA = (60, 40, 1180, 1040)

def cam_ponto(lon, lat, larg=14):
    return (lon * KX, -lat, larg, larg)

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

def desenhar_mapa(cam, cores=None, contorno=(52, 60, 82)):
    cores = cores or {}
    s, ox, oy = tr = cam_transform(cam)
    im = Image.new('RGB', (W, H), FUNDO); d = ImageDraw.Draw(im)
    for uf, rings in ESTADOS.items():
        for r in rings:
            d.polygon([tuple(v) for v in (r * s + [ox, oy])], fill=cores.get(uf, (26, 30, 42)), outline=contorno)
    return im, tr

def geo(lon, lat, tr):
    s, ox, oy = tr
    return lon * KX * s + ox, -lat * s + oy

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
    f1 = caber(d, linhas[0], 54, 1100); f2 = fonte(28, 'Bold')
    larg = max(d.textlength(linhas[0], font=f1), d.textlength(linhas[1], font=f2) if len(linhas) > 1 else 0) + 52
    alt = 92 if len(linhas) == 1 else 132
    d.rounded_rectangle((x, y, x + larg, y + alt), 16, fill=(0, 0, 0, 175))
    d.text((x + 26, y + 14), linhas[0], font=f1, fill=cor)
    if len(linhas) > 1: d.text((x + 28, y + 88), linhas[1], font=f2, fill=BRANCO)

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

# ---------------- épocas ----------------
# falas (índice 0-based) de cada época: intro, ..., veredito
ERAS = [
    dict(nome='1500', ano='ABRIL DE 1500', tit='A FROTA DE CABRAL', rec='BISCOITO', ini=4, fim=10, pt=(-39.06, -16.45), lug='PORTO SEGURO',
         curto='ATÉ O BRASIL', ver=['A VIAGEM ATÉ O BRASIL, COM QUASE CERTEZA.', 'A VOLTA, PROVAVELMENTE NÃO.'], img='nau_porao'),
    dict(nome='1700', ano='1700', tit='A FOME NAS MINAS DE OURO', rec='OURO', ini=11, fim=16, pt=(-43.50, -20.39), lug='MINAS GERAIS',
         curto='SEMANAS', ver=['SEMANAS, SE CHEGASSE NUM ANO DE FOME.', 'COM UMA ROÇA, ANOS.'], img='arraial'),
    dict(nome='1808', ano='MARÇO DE 1808', tit='O RIO NA CHEGADA DA CORTE', rec='CASA', ini=17, fim=22, pt=(-43.18, -22.90), lug='RIO DE JANEIRO',
         curto='ANOS (SE LIVRE)', ver=['ANOS, SE ACORDASSE LIVRE.', 'MAS SEM A SUA CASA.'], img='corte_baia'),
    dict(nome='1865', ano='JANEIRO DE 1865', tit='VOLUNTÁRIO DA PÁTRIA', rec='SORTE', ini=23, fim=28, pt=(-58.30, -27.10), lug='FRONTEIRA COM O PARAGUAI',
         curto='A GUERRA (COM SORTE)', ver=['PROVAVELMENTE A GUERRA INTEIRA.', 'MAS COM CHANCE REAL DE NÃO VOLTAR.'], img='alistamento'),
    dict(nome='1877', ano='1877', tit='A GRANDE SECA NO CEARÁ', rec='CHUVA', ini=29, fim=36, pt=(-39.50, -5.20), lug='SERTÃO DO CEARÁ',
         curto='ALGUNS MESES', ver=['ALGUNS MESES.', 'NO SERTÃO, A FOME. NA CIDADE, A VARÍOLA.'], img='sertao_seco'),
    dict(nome='1918', ano='OUTUBRO DE 1918', tit='A GRIPE ESPANHOLA', rec='LEITO', ini=37, fim=42, pt=(-46.63, -23.55), lug='SÃO PAULO',
         curto='A EPIDEMIA', ver=['A EPIDEMIA INTEIRA, COM 99 CHANCES EM 100.', 'MAS SEMANAS DE CAMA.'], img='sp_1918'),
    dict(nome='1957', ano='1957', tit='CANDANGO EM BRASÍLIA', rec='SALÁRIO', ini=43, fim=48, pt=(-47.88, -15.79), lug='PLANALTO CENTRAL',
         curto='A OBRA', ver=['A OBRA INTEIRA, MUITO PROVAVELMENTE.', 'COM SORTE, SEM ACIDENTE.'], img='cerrado_obra'),
    dict(nome='HOJE', ano='HOJE', tit='30 DIAS SEM ENERGIA', rec='BATERIA', ini=49, fim=55, pt=(-46.63, -23.55), lug='SÃO PAULO',
         curto='DEPENDE DE VOCÊ', ver=['DEPENDE DO QUE TEM', 'NA SUA CASA AGORA.'], img='sp_apagao'),
]
def era_de(i):
    for k, e in enumerate(ERAS):
        if e['ini'] <= i <= e['fim']: return k, e
    return None, None

# painel: valores [ÁGUA, COMIDA, SAÚDE, RECURSO] ao fim de cada fala da época
PAINEL = {
    4: (90, 80, 95, 100), 5: (60, 45, 55, 40), 6: (55, 40, 50, 35), 7: (50, 35, 45, 30), 8: (45, 30, 40, 25), 9: (40, 25, 35, 20),
    11: (80, 60, 85, 10), 12: (80, 50, 80, 60), 13: (70, 10, 40, 70), 14: (65, 8, 35, 30), 15: (60, 25, 35, 15),
    17: (70, 75, 80, 100), 18: (65, 70, 75, 60), 19: (60, 70, 70, 5), 20: (40, 65, 45, 5), 21: (40, 60, 45, 5),
    23: (70, 70, 90, 80), 24: (45, 50, 70, 60), 25: (40, 45, 55, 40), 26: (10, 40, 20, 25), 27: (10, 35, 15, 20),
    29: (20, 30, 70, 0), 30: (8, 15, 60, 0), 31: (5, 5, 45, 0), 32: (10, 10, 30, 0), 33: (8, 8, 10, 0), 34: (5, 5, 5, 0), 35: (5, 5, 5, 0),
    37: (85, 75, 90, 60), 38: (80, 65, 40, 15), 39: (75, 55, 30, 10), 40: (75, 55, 20, 10), 41: (75, 60, 55, 30),
    43: (75, 80, 80, 40), 44: (75, 80, 75, 55), 45: (70, 75, 50, 60), 46: (70, 75, 35, 60), 47: (70, 60, 30, 55),
    49: (90, 90, 95, 60), 50: (70, 85, 90, 35), 51: (20, 80, 85, 25), 52: (15, 40, 75, 15), 53: (12, 35, 50, 8), 54: (12, 35, 50, 8),
}
def painel_recursos(im, i, t):
    k, e = era_de(i)
    if e is None or i not in PAINEL: return
    ant = PAINEL.get(i - 1, (100, 100, 100, 100) if i != 29 else (40, 40, 80, 10))
    cur = PAINEL[i]
    nomes = ['ÁGUA', 'COMIDA', 'SAÚDE', e['rec']]
    d = ImageDraw.Draw(im, 'RGBA')
    x0, y0, bw = 1450, 330, 390
    d.rounded_rectangle((x0 - 30, y0 - 30, x0 + bw + 30, y0 + 4 * 92 + 4), 18, fill=(0, 0, 0, 170))
    u = ease((t - 0.5) / 4.0)
    for j, n in enumerate(nomes):
        v = ant[j] + (cur[j] - ant[j]) * u
        y = y0 + j * 92
        cor = VERM if v < 25 else (AMAR if j == 3 else BRANCO)
        d.text((x0, y), n, font=fonte(30, 'Bold'), fill=cor)
        d.text((x0 + bw, y), f'{int(round(v))}%', font=fonte(30), fill=cor, anchor='ra')
        d.rounded_rectangle((x0, y + 44, x0 + bw, y + 62), 9, fill=(255, 255, 255, 45))
        if v > 0.5: d.rounded_rectangle((x0, y + 44, x0 + max(18, bw * v / 100), y + 62), 9, fill=cor + (255,))

def contador(im, i, t, revelado=False):
    k, e = era_de(i)
    if e is None: return
    d = ImageDraw.Draw(im, 'RGBA')
    s1 = 'VOCÊ DURARIA'
    s2 = e['curto'] if revelado else '?'
    f2 = caber(d, s2, 46, 520)
    larg = max(d.textlength(s1, font=fonte(26, 'Bold')), d.textlength(s2, font=f2)) + 56
    x1 = W - 60; x0 = x1 - larg
    d.rounded_rectangle((x0, 54, x1, 54 + 120), 16, fill=(0, 0, 0, 180), outline=AMAR if revelado else (90, 90, 100), width=3)
    d.text((x0 + 28, 70), s1, font=fonte(26, 'Bold'), fill=CINZA)
    d.text((x0 + 28, 106), s2, font=f2, fill=AMAR if revelado else BRANCO)

def selo_era(im, i, sub=None):
    k, e = era_de(i)
    selo(im, [f"ÉPOCA {k + 1} · {e['ano']}", sub or e['tit']])

# ---------------- cenas especiais ----------------
def mapa_era(k, t, D):
    """mapa do Brasil com as épocas já visitadas e a atual pulsando; zoom no lugar."""
    e = ERAS[k]
    cam = lerp_cam(CAM_BRASIL, cam_ponto(*e['pt'], 22), (t - 0.4) / 2.2)
    im, tr = desenhar_mapa(cam)
    d = ImageDraw.Draw(im, 'RGBA')
    for j in range(k):
        x, y = geo(*ERAS[j]['pt'], tr)
        d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=(120, 120, 130))
    x, y = geo(*e['pt'], tr)
    r = 16 + 10 * (0.5 + 0.5 * math.sin(t * 5))
    d.ellipse((x - r * 2, y - r * 2, x + r * 2, y + r * 2), fill=AMAR + (50,))
    d.ellipse((x - r, y - r, x + r, y + r), fill=AMAR)
    if t > 1.2:
        txt(d, (x + 50, y), e['lug'], fonte(44), BRANCO, 'lm', 4, 4)
    d.text((1260, 360), f"ÉPOCA {k + 1} DE 8", font=fonte(40, 'Bold'), fill=CINZA)
    d.text((1260, 420), e['nome'], font=fonte(150), fill=AMAR)
    d.text((1260, 600), e['tit'], font=caber(d, e['tit'], 46, 620), fill=BRANCO)
    return im

def intro_era(i, t, D):
    k, e = era_de(i)
    corte = min(5.0, D * 0.4)
    foto = vinheta(ken_burns(e['img'], t / D, (1.0, 1.1), (0.25, 0.05)))
    selo_era(foto, i); contador(foto, i, t)
    if t >= corte + 0.7: return foto
    m = mapa_era(k, t, D)
    if t < corte: return m
    return Image.blend(m, foto, ease((t - corte) / 0.7))

def veredito(i, t, D):
    k, e = era_de(i)
    im = escurecer(vinheta(ken_burns(e['img'], t / D, (1.08, 1.0), (0, 0))), 0.62)
    d = ImageDraw.Draw(im)
    txt(d, (W / 2, 250), f"{e['nome']} · VEREDITO", fonte(40, 'Bold'), CINZA, 'mm', 3, 3)
    a = ease((t - 0.3) / 0.4)
    if a > 0:
        txt(d, (W / 2, 360), 'VOCÊ DURARIA:', fonte(int(80 * (0.9 + 0.1 * a))), AMAR, 'mm', 6, 5)
    for j, l in enumerate(e['ver']):
        if t > 0.9 + j * 1.2:
            f = caber(d, l, 76, W - 200)
            txt(d, (W / 2, 520 + j * 120), l, f, BRANCO if j == 0 else (VERM if k == 4 else BRANCO), 'mm', 6, 5)
    contador(im, i, t, revelado=t > 1.0)
    return im

def foto(i, k_img, t, D, zoom=(1.0, 1.1), pan=(0.3, 0.1), sub=None, painel=True, escuro=0):
    im = vinheta(ken_burns(k_img, t / D, zoom, pan))
    if escuro: im = escurecer(im, escuro)
    selo_era(im, i, sub)
    contador(im, i, t)
    if painel: painel_recursos(im, i, t)
    return im

# ---------------- cenas ----------------
def cena(i, t, D):
    p = t / D
    k, e = era_de(i)
    if e and i == e['ini']:
        im = intro_era(i, t, D)
        if i == 4 and t > D * 0.6: faixa_baixo(im, 'FROTA DE PEDRO ÁLVARES CABRAL · ~1.500 HOMENS', AMAR, t, D * 0.6)
        if i == 23 and t > D * 0.45:
            faixa_baixo(im, 'DECRETO 3.371 · 7/1/1865 · VOLUNTÁRIOS DA PÁTRIA', AMAR, t, D * 0.45)
        if i == 29 and t > D * 0.6: faixa_baixo(im, 'E NÃO CHOVE', VERM, t, D * 0.6)
        if i == 49 and t > D * 0.55: faixa_baixo(im, 'E A LUZ NÃO ACENDE', AMAR, t, D * 0.55)
        return im
    if e and i == e['fim'] and i != 55:
        return veredito(i, t, D)

    # ---- abertura
    if i == 0:
        im = vinheta(ken_burns('despertar', p, (1.0, 1.15), (0, 0.2)))
        if t > 3: legenda_central(im, 'DE 1500', 'ATÉ HOJE', t - 3, AMAR, y=H / 2 + 260)
        return im
    if i == 1:
        im, tr = desenhar_mapa(CAM_BRASIL)
        d = ImageDraw.Draw(im, 'RGBA')
        for j, er in enumerate(ERAS):
            tj = 1.0 + j * 1.0
            if t < tj: continue
            x, y = geo(*er['pt'], tr)
            a = ease((t - tj) / 0.3)
            d.ellipse((x - 12, y - 12, x + 12, y + 12), fill=AMAR + (int(255 * a),))
            d.text((1260, 200 + j * 90), f"{j + 1}. {er['nome']}", font=fonte(52), fill=AMAR + (int(255 * a),))
            d.text((1500, 214 + j * 90), er['tit'].lower(), font=fonte(28, 'Bold'), fill=CINZA + (int(255 * a),))
        return im
    if i == 2:
        im = escurecer(vinheta(ken_burns('despertar', p, (1.15, 1.2), (0, 0))), 0.7)
        d = ImageDraw.Draw(im)
        txt(d, (180, 200), 'O VEREDITO É UMA ESTIMATIVA', fonte(68), AMAR, 'la', 5, 5)
        itens = ['· números registrados em cada época', '· mortes, doenças, fome: de quê e quando', '· você chega como uma pessoa comum',
                 '· sem dinheiro, sem sobrenome, sem saber o futuro']
        for j, s_ in enumerate(itens):
            if t > 2.0 + j * 2.6: d.text((200, 360 + j * 95), s_, font=fonte(48, 'Bold'), fill=BRANCO)
        return im
    if i == 3:
        im, _ = desenhar_mapa(CAM_BRASIL, contorno=(80, 90, 120))
        im = escurecer(im, 0.3)
        legenda_central(im, 'QUANTO TEMPO', 'VOCÊ DURARIA?', t, AMAR)
        if t > D - 3.0:
            logo = Image.open(os.path.join(EP, '..', 'marca', 'logo_B_nome.png')).convert('RGB').resize((240, 240))
            a = ease((t - D + 3.0) / 0.6)
            base = im.crop((W // 2 - 120, 800, W // 2 + 120, 1040))
            im.paste(Image.blend(base, logo, a), (W // 2 - 120, 800))
        return im

    # ---- 1500
    if i == 5:
        im = foto(i, 'nau_comida', t, D, (1.0, 1.12), (0.2, 0.1))
        if t < D * 0.55: faixa_baixo(im, 'BISCOITO · CARNE SALGADA · VINHO · ÁGUA DE BARRIL', BRANCO, t, 1.5)
        if t > D * 0.55: faixa_baixo(im, 'SEM VITAMINA C, VEM O ESCORBUTO', VERM, t, D * 0.55)
        return im
    if i == 6:
        im = foto(i, 'nau_neblina', t, D, (1.0, 1.15), (0, 0))
        dd = ImageDraw.Draw(im)
        n = 13 if t < D * 0.5 else 12
        txt(dd, (1640, 860), f'{n}', fonte(150), VERM if n == 12 else BRANCO, 'mm', 6, 5)
        txt(dd, (1640, 950), 'NAVIOS', fonte(34, 'Bold'), CINZA, 'mm', 3, 3)
        faixa_baixo(im, '23/3/1500 · UMA NAU SOME COM ~150 HOMENS', BRANCO, t, 2.0)
        return im
    if i == 7:
        im = foto(i, 'terra_vista', t, D, (1.0, 1.1), (-0.3, 0))
        faixa_baixo(im, '22 DE ABRIL DE 1500 · 44 DIAS DE VIAGEM', AMAR, t, 3.0)
        return im
    if i == 8:
        im = foto(i, 'nau_tempestade', t, D, (1.0, 1.12), (0.2, 0.1))
        faixa_baixo(im, 'MAIO DE 1500 · 4 NAVIOS AFUNDAM · ~400 HOMENS', VERM, t, 4.0)
        return im
    if i == 9:
        im = foto(i, 'nau_conves', t, D, (1.05, 1.12), (0, 0), escuro=0.35)
        legenda_central(im, 'A MAIOR PARTE', 'NÃO VOLTOU PARA CASA', t, VERM)
        return im
    # ---- 1700
    if i == 12:
        im = foto(i, 'bateia', t, D, (1.0, 1.15), (0.1, 0.2))
        if t > 1.5: legenda_central(im, 'OURO', 'NÃO SE COME', t - 1.5, VERM, y=H / 2 + 120)
        return im
    if i == 13:
        im = foto(i, 'fome_minas', t, D, (1.0, 1.1), (0.2, 0))
        if t < D * 0.6: faixa_baixo(im, '1697–1701: AS PIORES FOMES DA CORRIDA DO OURO', BRANCO, t, 2.0)
        if t > D * 0.6: faixa_baixo(im, '"MORTOS COM UMA ESPIGA DE MILHO NA MÃO" — ANTONIL', AMAR, t, D * 0.6)
        return im
    if i == 14:
        im = foto(i, 'farinha_ouro', t, D, (1.0, 1.1), (-0.2, 0), painel=t < D * 0.4)
        if t > D * 0.4:
            im = tela_numero(im, '1 ALQUEIRE DE FARINHA', '= 40 OITAVAS DE OURO', t - D * 0.4, AMAR, 'Antonil, Cultura e Opulência do Brasil (1711) · preços de 1703')
            if t > D * 0.6: ImageDraw.Draw(im).text((W / 2, 760), '≈ 140 GRAMAS DE OURO', font=fonte(56), fill=BRANCO, anchor='mm')
        return im
    if i == 15:
        im = foto(i, 'vila_rica', t, D, (1.0, 1.1), (0.2, 0), sub='1720 · REVOLTA DE VILA RICA' if t > D * 0.5 else None)
        if t < D * 0.7: faixa_baixo(im, 'A COROA QUER 1/5 DE TODO O OURO', AMAR, t, 4.0)
        if t > D * 0.7: faixa_baixo(im, 'FILIPE DOS SANTOS É EXECUTADO', VERM, t, D * 0.7)
        return im
    # ---- 1808
    if i == 18:
        im = foto(i, 'rio_rua', t, D, (1.0, 1.1), (0.3, 0))
        faixa_baixo(im, '~10 MIL CHEGAM COM A CORTE · A CIDADE TINHA 50 A 60 MIL', BRANCO, t, 4.0)
        return im
    if i == 19:
        im = foto(i, 'porta_pr', t, D, (1.0, 1.15), (0.1, 0))
        if t < D * 0.65: faixa_baixo(im, 'P.R. = PRÍNCIPE REGENTE', BRANCO, t, 3.0)
        if t > D * 0.65: faixa_baixo(im, 'O POVO LIA: "PONHA-SE NA RUA"', AMAR, t, D * 0.65)
        return im
    if i == 20:
        im = foto(i, 'rio_noite', t, D, (1.0, 1.1), (0, 0.1))
        faixa_baixo(im, 'SEM ESGOTO · BARRIS LEVADOS AO MAR TODA NOITE', BRANCO, t, 3.0)
        return im
    if i == 21:
        im = foto(i, 'rio_rua', t, D, (1.12, 1.2), (-0.4, 0.1))
        faixa_baixo(im, '~60 MIL MORADORES · ~40 MIL NEGROS · METADE ESCRAVIZADA', AMAR, t, 4.0)
        return im
    # ---- 1865
    if i == 24:
        im = foto(i, 'acampamento', t, D, (1.0, 1.1), (0.3, 0))
        faixa_baixo(im, 'SEMANAS DE NAVIO E DE MARCHA · MESES DE ESPERA', BRANCO, t, 2.5)
        return im
    if i == 25:
        im = foto(i, 'batalha', t, D, (1.0, 1.12), (0.2, 0), sub='24/5/1866 · BATALHA DE TUIUTI')
        faixa_baixo(im, 'MAS NÃO É ELA QUE MAIS MATA', AMAR, t, D * 0.6)
        return im
    if i == 26:
        im = foto(i, 'hospital_campanha', t, D, (1.0, 1.12), (0.1, 0.1))
        if t < D * 0.5: faixa_baixo(im, 'DISENTERIA · VARÍOLA · MALÁRIA · CÓLERA', BRANCO, t, 2.0)
        if t > D * 0.5: faixa_baixo(im, 'SÓ O CÓLERA: AO MENOS 4.535 SOLDADOS BRASILEIROS', VERM, t, D * 0.5)
        return im
    if i == 27:
        im = foto(i, 'acampamento', t, D, (1.12, 1.2), (-0.3, 0), painel=False)
        return tela_numero(im, 'PELO MENOS 50 MIL', 'BRASILEIROS MORTOS', t, VERM, 'a maioria por doença, não por bala · estimativa mais aceita')
    # ---- 1877
    if i == 30:
        im = foto(i, 'sertao_seco', t, D, (1.0, 1.1), (0.3, 0))
        if t > 1.0: legenda_central(im, '77 · 78 · 79', 'A SECA DOS TRÊS SETES', t - 1.0, AMAR, y=H / 2 + 250)
        return im
    if i == 31:
        im = foto(i, 'retirantes', t, D, (1.0, 1.12), (0, 0.1))
        faixa_baixo(im, 'OS RETIRANTES: DESTINO, FORTALEZA', AMAR, t, D * 0.55)
        return im
    if i == 32:
        im = foto(i, 'abarracamento', t, D, (1.0, 1.1), (0.3, 0))
        faixa_baixo(im, '+100 MIL RETIRANTES NOS "CURRAIS DO GOVERNO"', BRANCO, t, 3.0)
        return im
    if i == 33:
        im = foto(i, 'abarracamento', t, D, (1.12, 1.22), (-0.3, 0.1))
        if t < D * 0.6: faixa_baixo(im, 'VARÍOLA · OUT/1877: ~480 MORTOS NA CAPITAL', BRANCO, t, 3.0)
        if t > D * 0.6: faixa_baixo(im, 'DEZ/1878: MAIS DE 14 MIL MORTOS NUM SÓ MÊS', VERM, t, D * 0.6)
        return im
    if i == 34:
        im = vinheta(ken_burns('cemiterio', p, (1.0, 1.08), (0, 0)))
        im = tela_numero(im, '10 DE DEZEMBRO DE 1878', '1.004 MORTOS EM UM DIA', t, VERM, 'o Dia dos Mil Mortos · Fortaleza · Rodolfo Teófilo')
        return im
    if i == 35:
        im = foto(i, 'sertao_seco', t, D, (1.1, 1.2), (0, 0), painel=False)
        return tela_numero(im, 'A SECA MATOU PERTO DE', '180 MIL NO CEARÁ', t, VERM, 'pelas contas da época')
    # ---- 1918
    if i == 38:
        im = foto(i, 'hospital_1918', t, D, (1.0, 1.1), (0.3, 0))
        faixa_baixo(im, '116.777 CASOS REGISTRADOS EM 6 A 8 SEMANAS', BRANCO, t, 3.0)
        return im
    if i == 39:
        im = foto(i, 'sp_1918', t, D, (1.08, 1.18), (-0.2, 0))
        if t < D * 0.6: faixa_baixo(im, 'ESCOLAS E FÁBRICAS FECHADAS', BRANCO, t, 1.5)
        if t > D * 0.6: faixa_baixo(im, '14/11/1918: QUASE 300 MORTOS NUM DIA', VERM, t, D * 0.6)
        return im
    if i == 40:
        im = foto(i, 'casa_1918', t, D, (1.0, 1.1), (0.2, 0))
        if t < D * 0.6: faixa_baixo(im, 'PNEUMONIA SEM ANTIBIÓTICO', BRANCO, t, 2.5)
        if t > D * 0.6: faixa_baixo(im, 'RODRIGUES ALVES, PRESIDENTE ELEITO, MORRE EM 1919', AMAR, t, D * 0.6)
        return im
    if i == 41:
        im = foto(i, 'hospital_1918', t, D, (1.12, 1.2), (-0.3, 0), painel=False)
        return tela_numero(im, '5.331 MORTES', '≈ 1% DA CIDADE', t, AMAR, 'cidade de São Paulo, out–dez de 1918')
    # ---- 1957
    if i == 44:
        im = foto(i, 'acampamento_obra', t, D, (1.0, 1.1), (0.2, 0))
        legenda_central(im, 'VOCÊ É UM', 'CANDANGO', t, AMAR, y=H / 2 + 230)
        return im
    if i == 45:
        im = foto(i, 'andaime', t, D, (1.0, 1.12), (0.2, 0.1))
        faixa_baixo(im, 'TURNOS DE 14 A 16 HORAS · +40 MIL OPERÁRIOS', BRANCO, t, 3.0)
        return im
    if i == 46:
        im = foto(i, 'cerrado_obra', t, D, (1.1, 1.2), (-0.3, 0))
        faixa_baixo(im, 'ATÉ HOJE NINGUÉM SABE QUANTOS MORRERAM NA OBRA', VERM, t, D * 0.5)
        return im
    if i == 47:
        im = foto(i, 'acampamento_obra', t, D, (1.12, 1.2), (-0.3, 0.1), sub='8/2/1959 · MASSACRE DA GEB' if t > D * 0.3 else None)
        if t > D * 0.6: faixa_baixo(im, 'NÚMERO DE MORTOS NUNCA ESCLARECIDO', VERM, t, D * 0.6)
        return im
    # ---- hoje
    if i == 50:
        im = foto(i, 'sp_apagao', t, D, (1.0, 1.1), (0.2, 0), sub='11/10/2024 · GRANDE SÃO PAULO')
        faixa_baixo(im, '+2,1 MILHÕES DE IMÓVEIS SEM ENERGIA', AMAR, t, 3.0)
        return im
    if i == 51:
        im = foto(i, 'agua_galoes', t, D, (1.0, 1.1), (0.1, 0))
        faixa_baixo(im, 'SEM ENERGIA, A BOMBA PARA. A TORNEIRA SECA.', VERM, t, D * 0.45)
        return im
    if i == 52:
        im = foto(i, 'geladeira', t, D, (1.0, 1.1), (0.2, 0))
        faixa_baixo(im, 'GELADEIRA · CARTÃO · BOMBA DE COMBUSTÍVEL', BRANCO, t, 2.0)
        return im
    if i == 53:
        im = foto(i, 'sp_apagao', t, D, (1.12, 1.2), (-0.3, 0))
        faixa_baixo(im, 'GERADOR DE HOSPITAL DEPENDE DE DIESEL CHEGANDO', AMAR, t, 2.5)
        return im
    if i == 54:
        im = foto(i, 'sp_apagao', t, D, (1.2, 1.25), (0, 0), escuro=0.45, painel=False)
        legenda_central(im, 'NESTA ÉPOCA, O VEREDITO', 'DEPENDE DE VOCÊ', t, AMAR)
        return im
    if i == 55:
        im = vinheta(ken_burns('kit_72h', p, (1.0, 1.08), (0.2, 0)))
        selo(im, ['KIT 72 HORAS', 'RECOMENDAÇÃO DA DEFESA CIVIL'])
        d = ImageDraw.Draw(im, 'RGBA')
        itens = ['ÁGUA', 'COMIDA SEM GELADEIRA', 'LANTERNA E PILHAS', 'RÁDIO', 'REMÉDIOS', 'DINHEIRO EM ESPÉCIE']
        fim_lista = D - 6.0
        if t < fim_lista:
            d.rounded_rectangle((1240, 230, 1860, 230 + len(itens) * 88 + 40), 18, fill=(0, 0, 0, 170))
            for j, s_ in enumerate(itens):
                if t > 1.5 + j * 1.4: d.text((1280, 260 + j * 88), '✓ ' + s_ if False else '· ' + s_, font=fonte(42), fill=AMAR if j == 0 else BRANCO)
        else:
            im = escurecer(im, 0.55 * ease((t - fim_lista) / 0.5))
            d = ImageDraw.Draw(im)
            txt(d, (W / 2, 330), 'VOCÊ DURARIA:', fonte(80), AMAR, 'mm', 6, 5)
            txt(d, (W / 2, 480), 'DEPENDE DO QUE TEM', fonte(80), BRANCO, 'mm', 6, 5)
            txt(d, (W / 2, 600), 'NA SUA CASA AGORA.', fonte(80), BRANCO, 'mm', 6, 5)
            contador(im, i, t, revelado=True)
        return im
    # ---- fechamento
    if i == 56:
        im = Image.new('RGB', (W, H), FUNDO)
        d = ImageDraw.Draw(im, 'RGBA')
        txt(d, (W / 2, 120), 'OITO ÉPOCAS, OITO VEREDITOS', fonte(60), BRANCO, 'mm', 4, 4)
        cw, ch, gx, gy = 410, 310, 40, 36
        x0 = (W - (4 * cw + 3 * gx)) / 2
        for j, er in enumerate(ERAS):
            if t < 0.6 + j * 0.5: continue
            cx = x0 + (j % 4) * (cw + gx); cy = 200 + (j // 4) * (ch + gy)
            cor = VERM if er['nome'] == '1877' else (AMAR if er['nome'] == 'HOJE' else (90, 96, 112))
            d.rounded_rectangle((cx, cy, cx + cw, cy + ch), 20, fill=(20, 24, 34), outline=cor, width=4)
            th = Image.open(f"imagens/img_{er['img']}.png").convert('RGB').resize((cw - 24, 150))
            im.paste(th, (int(cx + 12), int(cy + 12)))
            d.text((cx + 22, cy + 175), er['nome'], font=fonte(54), fill=cor if cor != (90, 96, 112) else BRANCO)
            d.text((cx + 22, cy + 250), er['curto'], font=caber(d, er['curto'], 36, cw - 44), fill=AMAR)
        if t > D * 0.6: faixa_baixo(im, 'QUASE SEMPRE: ÁGUA, COMIDA E SAÚDE', AMAR, t, D * 0.6)
        return im
    if i == 57:
        im, _ = desenhar_mapa(CAM_BRASIL)
        im = escurecer(im, 0.35)
        legenda_central(im, 'EM QUAL ÉPOCA VOCÊ DURARIA MAIS?', 'COMENTA AÍ', t, AMAR)
        return im
    if i == 58:
        im = escurecer(vinheta(ken_burns('sp_apagao', p, (1.0, 1.06), (0, 0))), 0.5)
        d = ImageDraw.Draw(im)
        txt(d, (W / 2, 300), 'PRÓXIMO EPISÓDIO', fonte(48, 'Bold'), CINZA, 'mm', 3, 3)
        legenda_central(im, 'APAGÃO TOTAL', '30 DIAS SEM ENERGIA', t, AMAR)
        if t > D - 3.5:
            logo = Image.open(os.path.join(EP, '..', 'marca', 'logo_B_nome.png')).convert('RGB').resize((300, 300))
            a = ease((t - D + 3.5) / 0.6)
            base = im.crop((W // 2 - 150, 740, W // 2 + 150, 1040))
            im.paste(Image.blend(base, logo, a), (W // 2 - 150, 740))
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
                    '-shortest', 'ep03_epocas_do_brasil.mp4'], check=True)
    print('pronto: ep03_epocas_do_brasil.mp4')

if __name__ == '__main__':
    os.makedirs('clipes', exist_ok=True)
    if sys.argv[1] == 'quadros':
        os.makedirs('quadros', exist_ok=True)
        for a in sys.argv[2:]:
            i, t = a.split('@'); i = int(i); t = float(t)
            fade(cena(i, t, duracao(i)), t, duracao(i), i).save(f'quadros/q_{i:02d}_{t:.1f}.jpg', quality=85)
    elif sys.argv[1] == 'juntar':
        juntar()
    else:
        a, b = map(int, sys.argv[2].split('-'))
        for i in range(a, b + 1):
            if not os.path.exists(f'clipes/c{i:02d}.mp4'): render(i)

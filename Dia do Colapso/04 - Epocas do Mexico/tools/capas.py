"""Capas A/B/C (1280x720) do episódio do México — v2, com a marca nova do canal (ampulheta).
Regras: título "¿CUÁNTO DURARÍAS?" grande em 2 linhas, placas "66 M", "1521", "HOY", poucas peças, legível em 168x94.
  A — três épocas lado a lado (asteroide · Tenochtitlan caindo · CDMX hoje) com a ampulheta no centro.
  B — Tenochtitlan na canoa + o painel de sobrevivência do vídeo (AGUA/COMIDA/REFUGIO/PELIGRO) e "TIEMPO: ?".
  C — o impacto do asteroide em tela cheia, ampulheta grande e a linha do tempo 66 M · 1521 · HOY.
Uso (da pasta do episódio): python tools\\capas.py   (a v1 está em publicacao\\capas_v1\\)"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

AQUI = os.path.dirname(os.path.abspath(__file__)); EP = os.path.dirname(AQUI); os.chdir(EP)
sys.path.insert(0, os.path.join(EP, '..', 'tools'))
from marca_es_final import ampulheta   # mesma ampulheta da foto de perfil e do banner
FONTE = os.path.join(EP, '..', '..', 'tools', 'Rubik.ttf')
W, H = 1280, 720
BRANCO, VERM, AMAR, AMARELO, VERDE = (245, 245, 245), (255, 64, 64), (255, 205, 110), (255, 196, 60), (80, 200, 120)


def fonte(t, p='Black'):
    f = ImageFont.truetype(FONTE, t); f.set_variation_by_name(p); return f


def img(k, w, h, brilho=0.9, cx=0.5, cy=0.5, cor=1.15, contraste=1.12):
    im = Image.open(f'imagens/img_{k}.png').convert('RGB')
    s = max(w / im.width, h / im.height); im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.LANCZOS)
    x = int((im.width - w) * cx); y = int((im.height - h) * cy)
    im = im.crop((x, y, x + w, y + h))
    im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(cor)).enhance(contraste)
    return ImageEnhance.Brightness(im).enhance(brilho)


def degrade(im, lado, forca=0.9, alcance=0.5):
    """escurece a partir de um lado ('cima', 'baixo', 'esq', 'dir')."""
    a = np.zeros((H, W), np.float32)
    if lado in ('cima', 'baixo'):
        n = int(H * alcance); r = np.linspace(forca, 0, n)
        if lado == 'cima': a[:n] = r[:, None]
        else: a[H - n:] = r[::-1][:, None]
    else:
        n = int(W * alcance); r = np.linspace(forca, 0, n)
        if lado == 'esq': a[:, :n] = r[None, :]
        else: a[:, W - n:] = r[::-1][None, :]
    return Image.composite(Image.new('RGB', (W, H)), im, Image.fromarray((a * 255).astype(np.uint8), 'L'))


def texto(d, xy, s, f, cor, anchor='mm', borda=7, sombra=8):
    x, y = xy
    d.text((x + 3, y + sombra), s, font=f, fill=(0, 0, 0), anchor=anchor, stroke_width=borda, stroke_fill=(0, 0, 0))
    d.text((x, y), s, font=f, fill=cor, anchor=anchor, stroke_width=borda, stroke_fill=(0, 0, 0))


def placa(d, xy, s, tam=50, fundo=AMARELO, cor=(18, 18, 18)):
    f = fonte(tam); x, y = xy; w = d.textlength(s, font=f) + 44
    d.rounded_rectangle((x - w / 2 + 5, y - tam * 0.78 + 7, x + w / 2 + 5, y + tam * 0.78 + 7), 14, fill=(0, 0, 0))
    d.rounded_rectangle((x - w / 2, y - tam * 0.78, x + w / 2, y + tam * 0.78), 14, fill=fundo, outline=(0, 0, 0), width=4)
    d.text((x, y + 2), s, font=f, fill=cor, anchor='mm')
    return w


def colar(base, ic, cx, cy):
    base.paste(ic, (int(cx - ic.width / 2), int(cy - ic.height / 2)), ic)


def titulo(d, x, y, anchor='mm', t1=104, t2=118, gap=108):
    texto(d, (x, y), '¿CUÁNTO', fonte(t1), BRANCO, anchor)
    texto(d, (x, y + gap), 'DURARÍAS?', fonte(t2), AMARELO, anchor)


# A — três épocas com a ampulheta no centro
def capa_a():
    im = Image.new('RGB', (W, H))
    fx = [('impacto', '66 M', VERM, BRANCO, 0.5), ('caida_ciudad', '1521', AMARELO, (18, 18, 18), 0.55), ('cdmx_hoy', 'HOY', AMARELO, (18, 18, 18), 0.5)]
    lw = W // 3
    for j, (k, *_ , cx) in enumerate(fx):
        im.paste(img(k, lw, H, 0.95, cx), (j * lw, 0))
    im = degrade(im, 'cima', 0.92, 0.5); im = degrade(im, 'baixo', 0.75, 0.3)
    d = ImageDraw.Draw(im)
    for j in (1, 2): d.line([(j * lw, 0), (j * lw, H)], fill=(0, 0, 0), width=8)
    texto(d, (W / 2, 92), '¿CUÁNTO DURARÍAS?', fonte(100), BRANCO)
    d2 = ImageDraw.Draw(im); f = fonte(100); lw1 = d2.textlength('¿CUÁNTO ', font=f); lt = d2.textlength('¿CUÁNTO DURARÍAS?', font=f)
    texto(d2, (W / 2 - lt / 2 + lw1, 92), 'DURARÍAS?', f, AMARELO, 'lm')
    colar(im, ampulheta(330), W / 2, 420)
    d = ImageDraw.Draw(im)
    for j, (k, s, fundo, cor, _) in enumerate(fx):
        placa(d, (j * lw + lw / 2, 650), s, 54, fundo, cor)
    return im


# B — Tenochtitlan + painel de sobrevivência
def painel(d, x0, y0, bw=330):
    linhas = [('AGUA', 0.85, VERDE), ('COMIDA', 0.80, VERDE), ('REFUGIO', 0.50, AMARELO), ('PELIGRO', 0.55, AMARELO)]
    d.rounded_rectangle((x0 - 26, y0 - 26, x0 + bw + 26, y0 + 4 * 70 + 6), 18, fill=(0, 0, 0, 190))
    for j, (n, v, cor) in enumerate(linhas):
        y = y0 + j * 70
        d.text((x0, y), n, font=fonte(30, 'Bold'), fill=BRANCO)
        d.rounded_rectangle((x0, y + 40, x0 + bw, y + 56), 8, fill=(255, 255, 255, 50))
        d.rounded_rectangle((x0, y + 40, x0 + bw * v, y + 56), 8, fill=cor)


def capa_b():
    im = img('tenochtitlan_canoa', W, H, 0.95, 0.5, 0.55)
    im = degrade(im, 'esq', 0.85, 0.55); im = degrade(im, 'cima', 0.4, 0.3)
    d = ImageDraw.Draw(im, 'RGBA')
    titulo(d, 40, 110, 'lm', 110, 124, 118)
    painel(d, 900, 300)
    # contador "TIEMPO: ?" acima do painel
    d.rounded_rectangle((874, 150, 1256, 250), 18, fill=(0, 0, 0, 200), outline=AMAR, width=4)
    d.text((900, 172), 'TIEMPO DE SUPERVIVENCIA', font=fonte(22, 'Bold'), fill=(190, 195, 210))
    d.text((1065, 222), '?', font=fonte(56), fill=AMARELO, anchor='mm')
    x = 120
    for s, fundo, cor in (('66 M', VERM, BRANCO), ('1521', AMARELO, (18, 18, 18)), ('HOY', AMARELO, (18, 18, 18))):
        w = placa(d, (x, 640), s, 46, fundo, cor); x += w + 26
    return im


# C — o impacto em tela cheia + ampulheta grande
def capa_c():
    im = img('impacto', W, H, 1.0, 0.45, 0.5, 1.25, 1.15)
    im = degrade(im, 'dir', 0.88, 0.5); im = degrade(im, 'baixo', 0.6, 0.3)
    colar(im, ampulheta(470), 1060, 330)
    d = ImageDraw.Draw(im)
    titulo(d, 40, 100, 'lm', 108, 122, 116)
    d.text((44, 300), 'HACE 66 MILLONES DE AÑOS', font=fonte(34, 'Bold'), fill=BRANCO, stroke_width=4, stroke_fill=(0, 0, 0))
    itens = (('66 M', VERM, BRANCO), ('1521', AMARELO, (18, 18, 18)), ('HOY', AMARELO, (18, 18, 18)))
    f = fonte(40); ws = [d.textlength(s_, font=f) + 44 for s_, _, _ in itens]; gap = 40
    x = W - 30 - (sum(ws) + gap * 2)
    d.line([(x + ws[0] / 2, 650), (W - 30 - ws[2] / 2, 650)], fill=AMARELO, width=6)
    for (s_, fundo, cor), w in zip(itens, ws):
        placa(d, (x + w / 2, 650), s_, 40, fundo, cor); x += w + gap
    return im


if __name__ == '__main__':
    os.makedirs('publicacao', exist_ok=True)
    capas = {'A': capa_a(), 'B': capa_b(), 'C': capa_c()}
    for l, im in capas.items():
        im.save(f'publicacao/capa_{l}.jpg', quality=92); print(l, os.path.getsize(f'publicacao/capa_{l}.jpg') // 1024, 'KB')
    # comparação: as 3 em tamanho médio + as 3 no tamanho da busca do celular (168x94)
    comp = Image.new('RGB', (3 * 430 + 40, 242 + 130 + 30), (255, 255, 255))
    for j, im in enumerate(capas.values()):
        comp.paste(im.resize((420, 236), Image.LANCZOS), (10 + j * 430, 10))
        comp.paste(im.resize((168, 94), Image.LANCZOS), (10 + j * 430, 270))
    comp.save('publicacao/comparacao_capas.jpg', quality=88)

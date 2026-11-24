"""Capas A/B/C (1280x720) do episódio do México, no estilo das capas do Ep. 03: fundo escuro, Rubik Black, branco + vermelho, placas amarelas.
Uso (da pasta do episódio): python tools\\capas.py"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

AQUI = os.path.dirname(os.path.abspath(__file__)); EP = os.path.dirname(AQUI); os.chdir(EP)
FONTE = os.path.join(AQUI, '..', '..', '..', 'tools', 'Rubik.ttf')
W, H = 1280, 720
BRANCO, VERM, AMAR, ESCURO = (245, 245, 245), (255, 64, 64), (255, 205, 110), (12, 13, 18)
TITULO = '¿CUÁNTO DURARÍAS?'

def fonte(t, p='Black'):
    f = ImageFont.truetype(FONTE, t); f.set_variation_by_name(p); return f

def img(k, w, h, brilho=0.85, cx=0.5, cy=0.5):
    im = Image.open(f'imagens/img_{k}.png').convert('RGB')
    s = max(w / im.width, h / im.height); im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.LANCZOS)
    x = int((im.width - w) * cx); y = int((im.height - h) * cy)
    im = im.crop((x, y, x + w, y + h))
    im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.15)).enhance(1.1)
    return ImageEnhance.Brightness(im).enhance(brilho)

def texto(d, xy, s, f, cor, anchor='mm', sombra=7, borda=6):
    x, y = xy
    d.text((x + 3, y + sombra), s, font=f, fill=(0, 0, 0), anchor=anchor, stroke_width=borda, stroke_fill=(0, 0, 0))
    d.text((x, y), s, font=f, fill=cor, anchor=anchor, stroke_width=borda, stroke_fill=(0, 0, 0))

def placa(d, xy, s, tam=52, fundo=AMAR, cor=(20, 20, 20)):
    f = fonte(tam); x, y = xy
    w = d.textlength(s, font=f) + 50
    d.rounded_rectangle((x - w / 2 + 4, y - tam * 0.8 + 6, x + w / 2 + 4, y + tam * 0.8 + 6), 16, fill=(0, 0, 0))
    d.rounded_rectangle((x - w / 2, y - tam * 0.8, x + w / 2, y + tam * 0.8), 16, fill=fundo, outline=(0, 0, 0), width=4)
    d.text((x, y + 2), s, font=f, fill=cor, anchor='mm')

def gradiente(im, de_cima=True, forca=0.85, alt=0.55):
    a = np.zeros((H, W), np.float32); n = int(H * alt)
    rampa = np.linspace(forca, 0, n)
    if de_cima: a[:n] = rampa[:, None]
    else: a[H - n:] = rampa[::-1][:, None]
    return Image.composite(Image.new('RGB', (W, H)), im, Image.fromarray((a * 255).astype(np.uint8), 'L'))

# A — três faixas verticais: asteroide, cerco de 1521, CDMX hoje
def capa_a():
    im = Image.new('RGB', (W, H), ESCURO)
    fx = [('impacto', '66 M', VERM, 0.5), ('bergantines', '1521', AMAR, 0.5), ('cdmx_hoy', 'HOY', AMAR, 0.5)]
    lw = W // 3
    for j, (k, _, _, cx) in enumerate(fx):
        im.paste(img(k, lw - 6, H, 0.9, cx), (j * lw + 3, 0))
    im = gradiente(im, True, 0.9, 0.55); im = gradiente(im, False, 0.6, 0.3)
    d = ImageDraw.Draw(im)
    texto(d, (W / 2, 120), TITULO, fonte(104), BRANCO)
    for j, (k, s, cor, _) in enumerate(fx):
        placa(d, (j * lw + lw / 2, 630), s, 60, cor)
    return im

# B — diagonal: impacto do asteroide x Cidade do México hoje, 1521 no meio
def capa_b():
    esq = img('impacto', W, H, 0.95, 0.5)
    dir_ = img('cdmx_hoy', W, H, 1.0, 0.5)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(W * 0.6, 0), (W, 0), (W, H), (W * 0.4, H)], fill=255)
    im = Image.composite(dir_, esq, m)
    ImageDraw.Draw(im).line([(W * 0.6, 0), (W * 0.4, H)], fill=AMAR, width=8)
    im = gradiente(im, True, 0.85, 0.45)
    d = ImageDraw.Draw(im)
    texto(d, (W / 2, 110), TITULO, fonte(104), BRANCO)
    placa(d, (210, 620), '66 M', 64, VERM, BRANCO)
    placa(d, (W / 2, 470), '1521', 56)
    placa(d, (1080, 620), 'HOY', 64)
    return im

# C — Tenochtitlan na água + linha do tempo com as três placas
def capa_c():
    im = img('tenochtitlan_canoa', W, H, 0.9, 0.5, 0.6)
    a = np.zeros((H, W), np.float32); a[:, :] = np.clip((np.arange(W) - 520) / 330, 0, 0.82)[None, :]
    im = Image.composite(Image.new('RGB', (W, H)), im, Image.fromarray((a * 255).astype(np.uint8), 'L'))
    im = gradiente(im, True, 0.6, 0.35)
    d = ImageDraw.Draw(im)
    texto(d, (1000, 120), '¿CUÁNTO', fonte(96), BRANCO)
    texto(d, (1000, 225), 'DURARÍAS?', fonte(96), VERM)
    xs = 1000
    d.line([(xs, 330), (xs, 660)], fill=AMAR, width=6)
    for y, s, cor, tc in [(350, '66 M', VERM, BRANCO), (490, '1521', AMAR, (20, 20, 20)), (630, 'HOY', AMAR, (20, 20, 20))]:
        placa(d, (xs, y), s, 54, cor, tc)
    return im

if __name__ == '__main__':
    os.makedirs('publicacao', exist_ok=True)
    capas = {'A': capa_a(), 'B': capa_b(), 'C': capa_c()}
    for l, im in capas.items():
        im.save(f'publicacao/capa_{l}.jpg', quality=90); print(l, os.path.getsize(f'publicacao/capa_{l}.jpg') // 1024, 'KB')
    comp = Image.new('RGB', (W + 10, H + 10), (30, 30, 30))
    for im, p in zip(capas.values(), [(0, 0), (W // 2 + 10, 0), (W // 4 + 5, H // 2 + 10)]):
        comp.paste(im.resize((W // 2, H // 2)), p)
    comp.save('publicacao/comparacao_capas.jpg', quality=85)

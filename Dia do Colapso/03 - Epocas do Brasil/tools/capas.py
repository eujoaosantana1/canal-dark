"""Capas A/B/C do episódio 03 (1280x720), no estilo da capa do 02: fundo escuro, Rubik Black, branco + vermelho, selo amarelo.
Uso (da pasta do episódio): python tools\\capas.py"""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

AQUI = os.path.dirname(os.path.abspath(__file__)); EP = os.path.dirname(AQUI); os.chdir(EP)
sys.path.insert(0, AQUI)
FONTE = os.path.join(AQUI, '..', '..', '..', 'tools', 'Rubik.ttf')
W, H = 1280, 720
BRANCO, VERM, AMAR, ESCURO = (245, 245, 245), (255, 64, 64), (255, 205, 110), (12, 13, 18)

def fonte(t, p='Black'):
    f = ImageFont.truetype(FONTE, t); f.set_variation_by_name(p); return f

def img(k, w, h, brilho=0.8, cx=0.5, cy=0.5):
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

def pill(d, xy, s, tam=40, fundo=AMAR, cor=(20, 20, 20)):
    f = fonte(tam); x, y = xy
    w = d.textlength(s, font=f) + 56
    d.rounded_rectangle((x - w / 2, y - tam * 0.85, x + w / 2, y + tam * 0.85), 18, fill=fundo)
    d.text((x, y + 2), s, font=f, fill=cor, anchor='mm')

def gradiente(im, de_cima=True, forca=0.85, alt=0.55):
    a = np.zeros((H, W), np.float32)
    n = int(H * alt)
    rampa = np.linspace(forca, 0, n)
    if de_cima: a[:n] = rampa[:, None]
    else: a[H - n:] = rampa[::-1][:, None]
    m = Image.fromarray((a * 255).astype(np.uint8), 'L')
    return Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), im, m)

# A — quatro faixas verticais (1500, 1877, 1918, hoje) + título no topo
def capa_a():
    im = Image.new('RGB', (W, H), ESCURO)
    fx = [('nau_tempestade', '1500', 0.45), ('sertao_seco', '1877', 0.5), ('hospital_1918', '1918', 0.5), ('sp_apagao', 'HOJE', 0.5)]
    lw = W // 4
    for j, (k, ano, cx) in enumerate(fx):
        im.paste(img(k, lw - 6, H, 0.85, cx), (j * lw + 3, 0))
    im = gradiente(im, True, 0.92, 0.6)
    im = gradiente(im, False, 0.75, 0.3)
    d = ImageDraw.Draw(im)
    texto(d, (W / 2, 95), 'QUANTO TEMPO', fonte(96), BRANCO)
    texto(d, (W / 2, 205), 'VOCÊ DURARIA?', fonte(110), VERM)
    for j, (k, ano, cx) in enumerate(fx):
        texto(d, (j * lw + lw / 2, 650), ano, fonte(70), AMAR if ano != '1877' else VERM, sombra=5, borda=5)
    return im

# B — diagonal: caravela na tempestade x São Paulo apagada
def capa_b():
    esq = img('nau_tempestade', W, H, 0.9, 0.35)
    dir_ = img('sp_apagao', W, H, 1.1, 0.6)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(W * 0.58, 0), (W, 0), (W, H), (W * 0.42, H)], fill=255)
    im = Image.composite(dir_, esq, m)
    d = ImageDraw.Draw(im)
    d.line([(W * 0.58, 0), (W * 0.42, H)], fill=AMAR, width=8)
    im = gradiente(im, True, 0.85, 0.5)
    d = ImageDraw.Draw(im)
    texto(d, (W / 2, 95), 'VOCÊ ACORDA EM 1500', fonte(84), BRANCO)
    texto(d, (W / 2, 200), 'QUANTO DURA?', fonte(110), VERM)
    texto(d, (200, 640), '1500', fonte(80), AMAR, sombra=5, borda=5)
    texto(d, (1090, 640), 'HOJE', fonte(80), AMAR, sombra=5, borda=5)
    return im

# C — mapa do Brasil com as 8 épocas (estilo da capa do 02)
def capa_c():
    import render_ep as R
    m, tr = R.desenhar_mapa(R.CAM_BRASIL)
    k = 0.6; dx, dy = -30, 40
    im = Image.new('RGB', (W, H), R.FUNDO); im.paste(m.resize((int(1920 * k), int(1080 * k)), Image.LANCZOS), (dx, dy))
    d = ImageDraw.Draw(im, 'RGBA')
    anos = {'1500': (70, -30), '1700': (-150, 20), '1808': (40, 40), '1865': (-150, 10), '1877': (40, -40), '1918': (-150, 40), '1957': (-160, -30), 'HOJE': (-140, 80)}
    for e in R.ERAS:
        x, y = R.geo(*e['pt'], tr); x = x * k + dx; y = y * k + dy
        cor = VERM if e['nome'] == '1877' else AMAR
        d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=cor + (60,))
        d.ellipse((x - 13, y - 13, x + 13, y + 13), fill=cor)
        if e['nome'] in ('1500', '1877', '1957', '1865'):
            ox, oy = {'1500': (24, 30), '1877': (22, -36), '1957': (-28, -34), '1865': (-30, 26)}[e['nome']]
            texto(d, (x + ox, y + oy), e['nome'], fonte(40), BRANCO, 'lm' if ox > 0 else 'rm', 4, 4)
    texto(d, (965, 250), 'QUANTO VOCÊ', fonte(80), BRANCO)
    texto(d, (965, 360), 'DURARIA?', fonte(112), VERM)
    pill(d, (965, 490), '8 ÉPOCAS DO BRASIL', 38)
    return im

if __name__ == '__main__':
    os.makedirs('publicacao', exist_ok=True)
    capas = {'A': capa_a(), 'B': capa_b(), 'C': capa_c()}
    for l, im in capas.items():
        im.save(f'publicacao/capa_{l}.jpg', quality=90); print(l, os.path.getsize(f'publicacao/capa_{l}.jpg') // 1024, 'KB')
    comp = Image.new('RGB', (W * 3 // 2 + 20, H * 2 // 2 + 10 + H // 2), (30, 30, 30))
    ims = list(capas.values())
    comp = Image.new('RGB', (W + 10, H + 10), (30, 30, 30))
    pos = [(0, 0), (W // 2 + 10, 0), (W // 4 + 5, H // 2 + 10)]
    for im, p in zip(ims, pos): comp.paste(im.resize((W // 2, H // 2)), p)
    comp.save('publicacao/comparacao_capas.jpg', quality=85)

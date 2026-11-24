"""Marca do canal em espanhol (Día del Colapso): foto de perfil 2048x2048 e banner 2560x1440 (área segura 1546x423 no centro).
Uso: python "Dia do Colapso\\tools\\marca_es.py"  -> Dia do Colapso\\marca_es\\"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

AQUI = os.path.dirname(os.path.abspath(__file__)); DC = os.path.dirname(AQUI)
FONTE = os.path.join(DC, '..', 'tools', 'Rubik.ttf')
IMG = os.path.join(DC, '04 - Epocas do Mexico', 'imagens')
OUT = os.path.join(DC, 'marca_es'); os.makedirs(OUT, exist_ok=True)
BRANCO, VERM, AMAR = (245, 245, 245), (255, 64, 64), (255, 205, 110)

def fonte(t, p='Black'):
    f = ImageFont.truetype(FONTE, t); f.set_variation_by_name(p); return f

def texto(d, xy, s, f, cor, borda, sombra):
    x, y = xy
    d.text((x + sombra * 0.4, y + sombra), s, font=f, fill=(0, 0, 0), anchor='mm', stroke_width=borda, stroke_fill=(0, 0, 0))
    d.text((x, y), s, font=f, fill=cor, anchor='mm', stroke_width=borda, stroke_fill=(0, 0, 0))

def ceu(w, h):
    y = np.linspace(0, 1, h)[:, None, None]
    top, bot = np.array([6, 8, 16]), np.array([10, 22, 60])
    a = top + (bot - top) * y
    return Image.fromarray(np.broadcast_to(a, (h, w, 3)).astype(np.uint8))

def predio(d, x0, y0, x1, y1, cor, jan, acesa=None, s=1.0):
    d.rectangle((x0, y0, x1, y1), fill=cor)
    jw, jh, gx, gy = int(26 * s), int(34 * s), int(22 * s), int(32 * s)
    cols = int((x1 - x0 - gx) // (jw + gx)); off = (x1 - x0 - (cols * jw + (cols - 1) * gx)) / 2
    r = 0
    y = y0 + gy
    while y + jh < y1:
        for c in range(cols):
            x = x0 + off + c * (jw + gx)
            d.rectangle((x, y, x + jw, y + jh), fill=jan)
        y += jh + gy; r += 1
    return off, jw, jh, gx, gy

def perfil(S=2048, nome=True):
    k = S / 800
    im = ceu(S, S); d = ImageDraw.Draw(im)
    x0, y0, x1 = int(240 * k), int(55 * k), int(485 * k)
    off, jw, jh, gx, gy = predio(d, x0, y0, x1, S, (34, 38, 66), (18, 20, 36), s=k)
    predio(d, int(670 * k), int(350 * k), int(830 * k), S, (24, 28, 52), (14, 16, 30), s=k)
    predio(d, int(-40 * k), int(560 * k), int(160 * k), S, (20, 24, 44), (12, 14, 26), s=k)
    # janela acesa com brilho
    wx, wy = x0 + off + 1 * (jw + gx), y0 + gy + 2 * (jh + gy)
    glow = Image.new('L', (S, S), 0); ImageDraw.Draw(glow).ellipse((wx - 260 * k, wy - 260 * k, wx + jw + 260 * k, wy + jh + 260 * k), fill=150)
    glow = glow.filter(ImageFilter.GaussianBlur(110 * k))
    im = Image.composite(Image.new('RGB', (S, S), (255, 200, 120)), im, glow.point(lambda v: v * 0.4))
    d = ImageDraw.Draw(im)
    d.rectangle((wx - 3 * k, wy - 3 * k, wx + jw + 3 * k, wy + jh + 3 * k), fill=(255, 236, 190))
    if not nome: return im
    # escurece embaixo para o nome
    a = np.zeros((S, S), np.float32); n = int(S * 0.45); a[S - n:] = np.linspace(0, 0.8, n)[:, None]
    im = Image.composite(Image.new('RGB', (S, S)), im, Image.fromarray((a * 255).astype(np.uint8), 'L'))
    d = ImageDraw.Draw(im)
    texto(d, (S / 2, int(590 * k)), 'DÍA DEL', fonte(int(118 * k)), BRANCO, int(9 * k), int(10 * k))
    texto(d, (S / 2, int(690 * k)), 'COLAPSO', fonte(int(128 * k)), VERM, int(9 * k), int(10 * k))
    return im

def banner(W=2560, H=1440):
    fx = ['impacto', 'tenochtitlan_canoa', 'cdmx_hoy']
    im = Image.new('RGB', (W, H))
    lw = W // 3
    for j, k in enumerate(fx):
        p = Image.open(os.path.join(IMG, f'img_{k}.png')).convert('RGB')
        s = max(lw / p.width, H / p.height); p = p.resize((int(p.width * s) + 1, int(p.height * s) + 1), Image.LANCZOS)
        x = (p.width - lw) // 2; p = p.crop((x, 0, x + lw, H))
        p = ImageEnhance.Brightness(ImageEnhance.Color(p).enhance(1.1)).enhance(0.6)
        im.paste(p, (j * lw, 0))
    # faixa escura no meio (área segura: 1546x423 centrada)
    y = np.abs(np.linspace(-1, 1, H))[:, None]
    a = np.clip(1.0 - (y - 0.18) / 0.5, 0, 1) * 0.78
    im = Image.composite(Image.new('RGB', (W, H), (6, 8, 16)), im, Image.fromarray((np.broadcast_to(a, (H, W)) * 255).astype(np.uint8), 'L'))
    d = ImageDraw.Draw(im)
    for j in (1, 2):
        d.line([(j * lw, 0), (j * lw, H)], fill=(0, 0, 0), width=6)
    cy = H / 2
    # ícone pequeno à esquerda do nome
    ic = perfil(320, nome=False)
    m = Image.new('L', (320, 320), 0); ImageDraw.Draw(m).ellipse((0, 0, 319, 319), fill=255)
    tit1, tit2 = 'DÍA DEL ', 'COLAPSO'
    f = fonte(150)
    l1 = d.textlength(tit1, font=f); l2 = d.textlength(tit2, font=f)
    total = 320 + 50 + l1 + l2
    x0 = (W - total) / 2
    im.paste(ic, (int(x0), int(cy - 160 - 40)), m)
    d.ellipse((x0 - 4, cy - 204, x0 + 324, cy + 124), outline=AMAR, width=6)
    xt = x0 + 370
    for s, cor, dx in ((tit1, BRANCO, 0), (tit2, VERM, l1)):
        d.text((xt + dx + 6, cy - 40 + 12), s, font=f, fill=(0, 0, 0), anchor='lm', stroke_width=10, stroke_fill=(0, 0, 0))
        d.text((xt + dx, cy - 40), s, font=f, fill=cor, anchor='lm', stroke_width=10, stroke_fill=(0, 0, 0))
    lema = 'HISTORIA · DESASTRES · SUPERVIVENCIA'
    d.text((xt + 4, cy + 85), lema, font=fonte(52, 'Bold'), fill=AMAR, anchor='lm')
    return im

if __name__ == '__main__':
    p = perfil(); p.save(os.path.join(OUT, 'perfil_2048.png')); p.resize((800, 800), Image.LANCZOS).save(os.path.join(OUT, 'perfil_800.png'))
    b = banner(); b.save(os.path.join(OUT, 'banner_2560x1440.png')); b.save(os.path.join(OUT, 'banner_2560x1440.jpg'), quality=95)
    # prévia com as áreas: TV (tudo), desktop (2560x423), celular/área segura (1546x423)
    pv = b.copy(); d = ImageDraw.Draw(pv)
    d.rectangle((0, 1440 / 2 - 211, 2559, 1440 / 2 + 211), outline=(0, 255, 255), width=6)
    d.rectangle((1280 - 773, 720 - 211, 1280 + 773, 720 + 211), outline=(255, 0, 255), width=6)
    pv.resize((1280, 720)).save(os.path.join(OUT, '_previa_banner_areas.jpg'), quality=85)
    for f in os.listdir(OUT): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')

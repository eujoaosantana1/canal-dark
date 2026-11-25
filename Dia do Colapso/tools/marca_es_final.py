"""Marca final do canal em espanhol (Día del Colapso) — conceito A, "reloj de arena": ampulheta de vidro rachado,
areia amarela em cima (o tempo que resta) e vermelha embaixo (o que já passou). Sem ligação com nenhum episódio.
Gera em Dia do Colapso\\marca_es\\final\\:
  perfil_icone_2048.png / _800.png  (só a ampulheta — recomendada, lê bem em 98 px)
  perfil_nome_2048.png / _800.png   (ampulheta + nome)
  banner_2560x1440.png / .jpg       (área segura 1546x423 no centro)
  _previa.jpg
Uso: python "Dia do Colapso\\tools\\marca_es_final.py\""""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__)); DC = os.path.dirname(AQUI)
FONTE = os.path.join(DC, '..', 'tools', 'Rubik.ttf')
OUT = os.path.join(DC, 'marca_es', 'final'); os.makedirs(OUT, exist_ok=True)
BRANCO, VERM, AMAR, AREIA = (245, 245, 245), (255, 64, 64), (255, 205, 110), (255, 196, 60)
FUNDO = (10, 10, 18)
LEMA = 'HISTORIA  ·  DESASTRES  ·  SUPERVIVENCIA'


def fonte(t, p='Black'):
    f = ImageFont.truetype(FONTE, t); f.set_variation_by_name(p); return f


def radial(w, h, centro=(0.5, 0.5), c0=(46, 28, 40), c1=FUNDO, raio=0.7):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32); m = max(w, h)
    d = np.sqrt(((x - centro[0] * w) / m) ** 2 + ((y - centro[1] * h) / m) ** 2) / raio
    u = np.clip(d, 0, 1)[..., None] ** 1.2
    return Image.fromarray((np.array(c0) * (1 - u) + np.array(c1) * u).astype(np.uint8))


def grao(im, forca=5, seed=1):
    rng = np.random.default_rng(seed)
    a = np.asarray(im).astype(np.int16) + rng.integers(-forca, forca + 1, (im.height, im.width, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def ampulheta(h):
    """Ampulheta em RGBA, altura h (largura 0.66 h). Desenhada em 2x e reduzida para bordas lisas."""
    S = 2; H = int(h * S); W = int(H * 0.66); k = H / 1000; cx = W / 2
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    def meia(y):   # meia-largura interna do vidro (y em 0..1000, pescoço em 500)
        t = min(1, abs(y - 500) / 330)
        return (20 + 225 * t ** 0.72) * k
    ys = np.linspace(150, 850, 160)
    esq = [(cx - meia(y), y * k) for y in ys]; dir_ = [(cx + meia(y), y * k) for y in ys[::-1]]
    vidro = esq + dir_
    # brilho vermelho atrás da areia de baixo
    g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).ellipse((cx - 230 * k, 700 * k, cx + 230 * k, 900 * k), fill=150)
    g = g.filter(ImageFilter.GaussianBlur(60 * k))
    im = Image.composite(Image.new('RGBA', (W, H), (255, 70, 50, 255)), im, g.point(lambda v: int(v * 0.55)))
    d = ImageDraw.Draw(im)
    # vidro: interior levemente azulado e transparente
    d.polygon(vidro, fill=(150, 180, 230, 38))
    # areia de cima (amarela) com a superfície levemente côncava
    sup = 330; topo_esq = [(x, y) for x, y in esq if sup * k <= y <= 488 * k]
    topo_dir = [(x, y) for x, y in dir_ if sup * k <= y <= 488 * k]
    curva = [(cx - meia(sup) + t * 2 * meia(sup), sup * k + 26 * k * np.sin(np.pi * t)) for t in np.linspace(0, 1, 30)]
    d.polygon(curva + topo_dir + topo_esq[::-1], fill=AREIA)
    d.polygon(curva[:15] + [(cx, 470 * k)] + topo_esq[::-1][-3:], fill=(255, 214, 110))   # luz na areia
    # fio de areia
    d.line([(cx, 488 * k), (cx, 742 * k)], fill=AREIA, width=max(2, int(7 * k)))
    # monte de baixo (vermelho)
    base = 842 * k
    pts = [(cx - meia(838) + 4 * k, base)]
    for t in np.linspace(-1, 1, 41):
        pts.append((cx + t * (meia(838) - 4 * k), base - (100 * k) * (1 - abs(t)) ** 1.6 - 8 * k))
    pts.append((cx + meia(838) - 4 * k, base))
    d.polygon(pts, fill=VERM)
    d.polygon([(cx - 90 * k, 790 * k), (cx, 744 * k), (cx + 20 * k, 760 * k), (cx - 60 * k, 812 * k)], fill=(255, 110, 90))
    # contorno do vidro
    d.line(vidro + [vidro[0]], fill=(230, 236, 248, 255), width=max(3, int(14 * k)), joint='curve')
    # reflexo no vidro (lado esquerdo)
    ref = [(cx - meia(y) + 34 * k, y * k) for y in np.linspace(200, 420, 30)]
    d.line(ref, fill=(255, 255, 255, 150), width=max(2, int(9 * k)), joint='curve')
    ref2 = [(cx - meia(y) + 34 * k, y * k) for y in np.linspace(600, 760, 20)]
    d.line(ref2, fill=(255, 255, 255, 90), width=max(2, int(7 * k)), joint='curve')
    # rachadura no vidro de cima (direita)
    cr = [(0.70, 0.215), (0.665, 0.265), (0.705, 0.30), (0.672, 0.345), (0.69, 0.37)]
    d.line([(x * W, y * H) for x, y in cr], fill=(255, 255, 255, 235), width=max(2, int(6 * k)), joint='curve')
    d.line([(0.665 * W, 0.265 * H), (0.625 * W, 0.255 * H)], fill=(255, 255, 255, 200), width=max(2, int(4 * k)))
    # colunas laterais
    for sx in (-1, 1):
        x = cx + sx * 285 * k
        d.rounded_rectangle((x - 13 * k, 120 * k, x + 13 * k, 880 * k), int(10 * k), fill=(112, 120, 142, 255))
        d.rounded_rectangle((x - 13 * k, 120 * k, x - 4 * k, 880 * k), int(5 * k), fill=(160, 168, 190, 255))
    # tampas (com volume: faixa clara em cima)
    for yy in (88 * k, 862 * k):
        d.rounded_rectangle((cx - 318 * k, yy, cx + 318 * k, yy + 50 * k), int(16 * k), fill=(200, 206, 222, 255))
        d.rounded_rectangle((cx - 318 * k, yy, cx + 318 * k, yy + 16 * k), int(8 * k), fill=(240, 244, 252, 255))
        d.rounded_rectangle((cx - 318 * k, yy + 38 * k, cx + 318 * k, yy + 50 * k), int(6 * k), fill=(150, 156, 176, 255))
    return im.resize((W // S, H // S), Image.LANCZOS)


def colar(base, ic, cx, cy):
    base.paste(ic, (int(cx - ic.width / 2), int(cy - ic.height / 2)), ic)


def texto(d, xy, s, f, cor, borda, sombra, anchor='mm'):
    x, y = xy
    d.text((x + sombra * 0.4, y + sombra), s, font=f, fill=(0, 0, 0), anchor=anchor, stroke_width=borda, stroke_fill=(0, 0, 0))
    d.text((x, y), s, font=f, fill=cor, anchor=anchor, stroke_width=borda, stroke_fill=(0, 0, 0))


def perfil(S=2048, nome=False):
    im = radial(S, S, c0=(58, 32, 44), raio=0.62)
    if nome:
        colar(im, ampulheta(int(S * 0.58)), S / 2, S * 0.36)
        d = ImageDraw.Draw(im); k = S / 1000
        texto(d, (S / 2, 735 * k), 'DÍA DEL', fonte(int(118 * k)), BRANCO, int(9 * k), int(10 * k))
        texto(d, (S / 2, 850 * k), 'COLAPSO', fonte(int(128 * k)), VERM, int(9 * k), int(10 * k))
    else:
        colar(im, ampulheta(int(S * 0.80)), S / 2, S / 2)
    return grao(im, 4)


def banner(W=2560, H=1440):
    im = radial(W, H, centro=(0.5, 0.5), c0=(52, 30, 44), raio=0.55)
    d = ImageDraw.Draw(im)
    # grãos de areia flutuando (amarelos em cima, vermelhos embaixo), mais densos perto do centro
    rng = np.random.default_rng(9)
    for _ in range(2600):
        x = rng.normal(W / 2, W * 0.32); y = rng.uniform(0, H); r = rng.uniform(1.2, 3.6)
        c = AREIA if y < H / 2 else VERM; a = rng.uniform(0.12, 0.5)
        cc = tuple(int(FUNDO[i] + (c[i] - FUNDO[i]) * a) for i in range(3))
        d.ellipse((x - r, y - r, x + r, y + r), fill=cc)
    cy = H / 2
    f = fonte(120); t1, t2 = 'DÍA DEL ', 'COLAPSO'
    l1, l2 = d.textlength(t1, font=f), d.textlength(t2, font=f)
    fl = fonte(40, 'Bold'); ll = d.textlength(LEMA, font=fl)
    ah = 360; aw = int(ah * 0.66); gap = 54
    total = aw + gap + max(l1 + l2, ll); x0 = (W - total) / 2
    colar(im, ampulheta(ah), x0 + aw / 2, cy)
    d = ImageDraw.Draw(im)
    xt = x0 + aw + gap
    for s, cor, dx in ((t1, BRANCO, 0), (t2, VERM, l1)):
        d.text((xt + dx + 6, cy - 44 + 12), s, font=f, fill=(0, 0, 0), anchor='lm', stroke_width=11, stroke_fill=(0, 0, 0))
        d.text((xt + dx, cy - 44), s, font=f, fill=cor, anchor='lm', stroke_width=11, stroke_fill=(0, 0, 0))
    d.text((xt + 4, cy + 82), LEMA, font=fl, fill=AMAR, anchor='lm')
    return grao(im, 4)


if __name__ == '__main__':
    pi = perfil(); pn = perfil(nome=True); b = banner()
    pi.save(os.path.join(OUT, 'perfil_icone_2048.png')); pi.resize((800, 800), Image.LANCZOS).save(os.path.join(OUT, 'perfil_icone_800.png'))
    pn.save(os.path.join(OUT, 'perfil_nome_2048.png')); pn.resize((800, 800), Image.LANCZOS).save(os.path.join(OUT, 'perfil_nome_800.png'))
    b.save(os.path.join(OUT, 'banner_2560x1440.png')); b.save(os.path.join(OUT, 'banner_2560x1440.jpg'), quality=95)
    # prévia: banner com as áreas + os dois perfis em círculo (300 px e 98 px)
    pv = b.copy(); d = ImageDraw.Draw(pv)
    d.rectangle((0, 720 - 211, 2559, 720 + 211), outline=(0, 255, 255), width=6)
    d.rectangle((1280 - 773, 720 - 211, 1280 + 773, 720 + 211), outline=(255, 0, 255), width=6)
    tela = Image.new('RGB', (1280, 720 + 340), (24, 24, 28)); tela.paste(pv.resize((1280, 720), Image.LANCZOS), (0, 0))
    m = Image.new('L', (300, 300), 0); ImageDraw.Draw(m).ellipse((0, 0, 299, 299), fill=255)
    mm = Image.new('L', (98, 98), 0); ImageDraw.Draw(mm).ellipse((0, 0, 97, 97), fill=255)
    for j, p in enumerate((pi, pn)):
        tela.paste(p.resize((300, 300), Image.LANCZOS), (40 + j * 340, 740), m)
        tela.paste(p.resize((98, 98), Image.LANCZOS), (760 + j * 150, 840), mm)
    tela.save(os.path.join(OUT, '_previa.jpg'), quality=90)
    for f in sorted(os.listdir(OUT)): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')

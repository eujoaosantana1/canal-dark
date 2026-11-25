"""Marca v3 do canal em espanhol (Día del Colapso): três direções de identidade, independentes de qualquer episódio.
  A — RELOJ DE ARENA: ampulheta rachada, areia amarela em cima e vermelha embaixo ("¿cuánto durarías?").
  B — BARRAS: as 4 barras de recursos do canal caindo do verde ao vermelho (o painel que aparece em todo vídeo).
  C — ESTRATOS: camadas do tempo (eras empilhadas) cortadas por uma rachadura vermelha.
Gera em Dia do Colapso\\marca_es\\v3\\: perfil_<X>_2048.png, banner_<X>_2560x1440.png e _conceitos_v3.jpg (comparação).
Uso: python "Dia do Colapso\\tools\\marca_es_v3.py" [A B C]"""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__)); DC = os.path.dirname(AQUI)
FONTE = os.path.join(DC, '..', 'tools', 'Rubik.ttf')
OUT = os.path.join(DC, 'marca_es', 'v3'); os.makedirs(OUT, exist_ok=True)
BRANCO, VERM, AMAR, VERDE, AMARELO = (245, 245, 245), (255, 64, 64), (255, 205, 110), (80, 200, 120), (255, 196, 60)
FUNDO = (10, 12, 20)
LEMA = 'HISTORIA  ·  DESASTRES  ·  SUPERVIVENCIA'


def fonte(t, p='Black'):
    f = ImageFont.truetype(FONTE, t); f.set_variation_by_name(p); return f


def radial(w, h, centro=(0.5, 0.5), c0=(28, 32, 52), c1=FUNDO, raio=0.75):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((x / w - centro[0]) * (w / max(w, h))) ** 2 + ((y / h - centro[1]) * (h / max(w, h))) ** 2) / raio
    u = np.clip(d, 0, 1)[..., None]
    a = np.array(c0) * (1 - u) + np.array(c1) * u
    return Image.fromarray(a.astype(np.uint8))


def ruido(im, forca=6, seed=1):
    rng = np.random.default_rng(seed)
    a = np.asarray(im).astype(np.int16) + rng.integers(-forca, forca + 1, (im.height, im.width, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


# ---------------- A: reloj de arena ----------------
def ampulheta(d, cx, cy, h, quebra=True):
    """desenha a ampulheta centrada em (cx, cy) com altura total h."""
    k = h / 1000
    def meia(y):   # meia-largura do vidro em função de y (0..1000, 500 = pescoço)
        t = abs(y - 500) / 330
        return (22 + 210 * min(1, t) ** 0.75) * k
    ys = np.linspace(170, 830, 120)
    esq = [(cx - meia(y), cy + (y - 500) * k) for y in ys]; dir_ = [(cx + meia(y), cy + (y - 500) * k) for y in ys[::-1]]
    # areia de cima (amarela): de y=330 até o pescoço
    topo = [p for p, y in zip(esq, ys) if 330 <= y <= 492] + [p for p, y in zip(dir_, ys[::-1]) if 330 <= y <= 492]
    d.polygon(topo, fill=AMARELO)
    # filete caindo
    d.line([(cx, cy - 8 * k), (cx, cy + 250 * k)], fill=AMARELO, width=max(2, int(7 * k)))
    # areia de baixo (vermelha): monte
    base_y = cy + 330 * k
    monte = [(cx - meia(820) * 0.98, base_y), (cx - 120 * k, cy + 255 * k), (cx, cy + 238 * k), (cx + 120 * k, cy + 255 * k), (cx + meia(820) * 0.98, base_y)]
    d.polygon(monte, fill=VERM)
    # vidro
    d.line(esq + dir_ + [esq[0]], fill=(225, 232, 245), width=max(3, int(16 * k)), joint='curve')
    # tampas
    for yy in (cy - 365 * k, cy + 335 * k):
        d.rounded_rectangle((cx - 290 * k, yy, cx + 290 * k, yy + 30 * k), int(12 * k), fill=(225, 232, 245))
    for sx in (-1, 1):   # colunas laterais
        d.rounded_rectangle((cx + sx * 270 * k - 12 * k, cy - 340 * k, cx + sx * 270 * k + 12 * k, cy + 340 * k), int(10 * k), fill=(150, 158, 178))
    if quebra:   # rachadura no vidro de cima
        pts = [(0.62, 0.30), (0.585, 0.36), (0.63, 0.40), (0.59, 0.455)]
        d.line([(cx + (x - 0.5) * 1000 * k, cy + (y - 0.5) * 1000 * k) for x, y in pts], fill=BRANCO, width=max(2, int(6 * k)))


def perfil_a(S=2048):
    im = radial(S, S, c0=(40, 30, 46), c1=FUNDO); d = ImageDraw.Draw(im)
    ampulheta(d, S / 2, S / 2, S * 0.82)
    return ruido(im)


# ---------------- B: barras ----------------
BARRAS = [(0.86, VERDE), (0.64, AMARELO), (0.42, (255, 140, 60)), (0.20, VERM)]


def barras(d, x0, y0, w, h, gap=0.28, raio=0.35):
    n = len(BARRAS); bw = w / (n + (n - 1) * gap)
    for j, (v, cor) in enumerate(BARRAS):
        x = x0 + j * bw * (1 + gap)
        d.rounded_rectangle((x, y0, x + bw, y0 + h), int(bw * raio), fill=(255, 255, 255, 28) if d.mode == 'RGBA' else (34, 38, 56))
        d.rounded_rectangle((x, y0 + h * (1 - v), x + bw, y0 + h), int(bw * raio), fill=cor)


def perfil_b(S=2048):
    im = radial(S, S, c0=(30, 34, 56), c1=FUNDO); d = ImageDraw.Draw(im)
    barras(d, S * 0.24, S * 0.22, S * 0.52, S * 0.56)
    return ruido(im)


# ---------------- C: estratos ----------------
CAMADAS = [(70, 62, 58), (122, 92, 64), (176, 132, 82), (210, 170, 110), (150, 110, 80), (96, 78, 70), (60, 58, 66), (40, 42, 54)]


def estratos(w, h, y0, seed=4, amp=0.035, esp=None):
    """corte de camadas onduladas da linha y0 até o fim; devolve imagem RGB w x h (acima de y0 fica preto)."""
    rng = np.random.default_rng(seed)
    im = Image.new('RGB', (w, h), FUNDO); d = ImageDraw.Draw(im)
    n = len(CAMADAS); esp = esp or (h - y0) / n
    xs = np.linspace(0, w, 200)
    fases = rng.uniform(0, 6.28, (n + 1, 2))
    for j in range(n):
        base = y0 + j * esp
        topo = [(x, base + amp * h * (math.sin(x / w * 6.28 * 1.3 + fases[j, 0]) * 0.6 + math.sin(x / w * 6.28 * 3.1 + fases[j, 1]) * 0.4)) for x in xs]
        d.polygon(topo + [(w, h), (0, h)], fill=CAMADAS[j])
    return im


def rachadura(d, x, y0, y1, larg, seed=2, cor=VERM, amp=0.06):
    rng = np.random.default_rng(seed)
    n = 14; ys = np.linspace(y0, y1, n); xs = x + rng.uniform(-1, 1, n) * (y1 - y0) * amp; xs[0] = x
    pts = list(zip(xs, ys))
    d.line(pts, fill=(0, 0, 0), width=int(larg * 1.9), joint='curve')
    d.line(pts, fill=cor, width=int(larg), joint='curve')


def perfil_c(S=2048):
    im = estratos(S, S, int(S * 0.10), amp=0.03, esp=S * 0.112)
    d = ImageDraw.Draw(im)
    rachadura(d, S * 0.52, -10, S + 10, S * 0.035)
    return ruido(im, 5)


# ---------------- banners ----------------
def nome(d, W, cy, tam=158):
    f = fonte(tam); t1, t2 = 'DÍA DEL ', 'COLAPSO'
    l1, l2 = d.textlength(t1, font=f), d.textlength(t2, font=f); x0 = (W - (l1 + l2)) / 2
    for s, cor, dx in ((t1, BRANCO, 0), (t2, VERM, l1)):
        d.text((x0 + dx + 7, cy + 14), s, font=f, fill=(0, 0, 0), anchor='lm', stroke_width=12, stroke_fill=(0, 0, 0))
        d.text((x0 + dx, cy), s, font=f, fill=cor, anchor='lm', stroke_width=12, stroke_fill=(0, 0, 0))
    return x0, x0 + l1 + l2


def lema(d, W, y, cor=AMAR):
    fl = fonte(52, 'Bold'); d.text((W / 2, y), LEMA, font=fl, fill=cor, anchor='mm')
    lw = d.textlength(LEMA, font=fl)
    for sx in (-1, 1):
        xa = W / 2 + sx * (lw / 2 + 30); d.line([(xa, y), (xa + sx * 120, y)], fill=cor, width=4)


def banner_a(W=2560, H=1440):
    im = radial(W, H, c0=(40, 28, 40), c1=FUNDO, raio=0.6); d = ImageDraw.Draw(im)
    # areia caindo em grãos pelo fundo (textura discreta)
    rng = np.random.default_rng(9)
    for _ in range(1400):
        x, y = rng.uniform(0, W), rng.uniform(0, H); r = rng.uniform(1, 3)
        c = AMARELO if y < H / 2 else VERM; a = rng.uniform(0.15, 0.45)
        cc = tuple(int(FUNDO[i] + (c[i] - FUNDO[i]) * a) for i in range(3))
        d.ellipse((x - r, y - r, x + r, y + r), fill=cc)
    cy = H / 2
    # ampulheta à esquerda do nome, dentro da área segura
    f = fonte(124); larg_nome = d.textlength('DÍA DEL COLAPSO', font=f)
    total = 260 + 40 + larg_nome; x0 = (W - total) / 2
    ampulheta(d, x0 + 130, cy, 350)
    f1 = f; t1, t2 = 'DÍA DEL ', 'COLAPSO'; l1 = d.textlength(t1, font=f1); xt = x0 + 300
    for s, cor, dx in ((t1, BRANCO, 0), (t2, VERM, l1)):
        d.text((xt + dx + 7, cy - 45 + 14), s, font=f1, fill=(0, 0, 0), anchor='lm', stroke_width=12, stroke_fill=(0, 0, 0))
        d.text((xt + dx, cy - 45), s, font=f1, fill=cor, anchor='lm', stroke_width=12, stroke_fill=(0, 0, 0))
    d.text((xt + 4, cy + 75), LEMA.replace('  ', ' '), font=fonte(42, 'Bold'), fill=AMAR, anchor='lm')
    return ruido(im)


def banner_b(W=2560, H=1440):
    im = radial(W, H, c0=(26, 32, 54), c1=FUNDO, raio=0.7); d = ImageDraw.Draw(im, 'RGBA')
    for x in range(0, W, 80): d.line([(x, 0), (x, H)], fill=(255, 255, 255, 10), width=1)
    for y in range(0, H, 80): d.line([(0, y), (W, y)], fill=(255, 255, 255, 10), width=1)
    # barras grandes nas laterais (decoração para computador/TV)
    for xs, esp in ((90, 1), (W - 90 - 520, -1)):
        barras(d, xs, H * 0.18, 520, H * 0.64)
    # escurece as barras para não competir com o nome
    im = Image.blend(im, Image.new('RGB', (W, H), FUNDO), 0.35); d = ImageDraw.Draw(im, 'RGBA')
    cy = H / 2
    nome(d, W, cy - 50)
    lema(d, W, cy + 95)
    return ruido(im)


def banner_c(W=2560, H=1440):
    im = estratos(W, H, int(H * 0.55), seed=6, amp=0.02, esp=H * 0.07)
    # céu escuro em cima com leve brilho no horizonte
    d = ImageDraw.Draw(im, 'RGBA')
    rachadura(d, W * 0.5, H * 0.55 - 60, H + 10, 26, seed=5, amp=0.05)
    # faixa escura atrás do texto
    y = np.abs(np.linspace(-1, 1, H))[:, None]
    a = np.clip(1.0 - (y - 0.10) / 0.35, 0, 1) * 0.75
    im = Image.composite(Image.new('RGB', (W, H), (6, 7, 12)), im, Image.fromarray((np.broadcast_to(a, (H, W)) * 255).astype(np.uint8), 'L'))
    d = ImageDraw.Draw(im)
    cy = H / 2
    nome(d, W, cy - 50)
    lema(d, W, cy + 95)
    return ruido(im, 5)


CONCEITOS = {'A': ('RELOJ DE ARENA', perfil_a, banner_a), 'B': ('BARRAS DE SUPERVIVENCIA', perfil_b, banner_b), 'C': ('ESTRATOS DEL TIEMPO', perfil_c, banner_c)}

if __name__ == '__main__':
    ks = sys.argv[1:] or list(CONCEITOS)
    linhas = []
    for k in ks:
        tit, fp, fb = CONCEITOS[k]
        p = fp(); b = fb()
        p.save(os.path.join(OUT, f'perfil_{k}_2048.png')); b.save(os.path.join(OUT, f'banner_{k}_2560x1440.png'))
        linhas.append((k, tit, p, b)); print(k, 'ok', flush=True)
    # comparação: banner (com a área do celular) + ícone em círculo grande e em 98 px
    lh = 540 + 60
    sheet = Image.new('RGB', (960 + 520, lh * len(linhas)), (24, 24, 28)); d = ImageDraw.Draw(sheet)
    m = Image.new('L', (300, 300), 0); ImageDraw.Draw(m).ellipse((0, 0, 299, 299), fill=255)
    mm = Image.new('L', (98, 98), 0); ImageDraw.Draw(mm).ellipse((0, 0, 97, 97), fill=255)
    for j, (k, tit, p, b) in enumerate(linhas):
        y = j * lh
        bb = b.resize((960, 540), Image.LANCZOS); db = ImageDraw.Draw(bb)
        db.rectangle((480 - 290, 270 - 79, 480 + 290, 270 + 79), outline=(255, 0, 255), width=2)
        sheet.paste(bb, (0, y + 40))
        d.text((10, y + 8), f'{k} — {tit}', font=fonte(30), fill=AMAR)
        sheet.paste(p.resize((300, 300), Image.LANCZOS), (1010, y + 80), m)
        sheet.paste(p.resize((98, 98), Image.LANCZOS), (1350, y + 180), mm)
    sheet.save(os.path.join(OUT, '_conceitos_v3.jpg'), quality=88)

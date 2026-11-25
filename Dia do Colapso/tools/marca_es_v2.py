"""Marca v2 do canal em espanhol (Día del Colapso), sem ligação com um episódio: cidade à noite desenhada em camadas,
quase todas as janelas apagadas, brilho vermelho no horizonte. Gera em Dia do Colapso\\marca_es\\:
  banner_v2_2560x1440.png/.jpg (área segura 1546x423 no centro), perfil_v2_2048.png / perfil_v2_800.png (com nome)
  e perfil_v2_icone_2048.png (só o ícone, para ler bem em tamanho pequeno), _previa_v2.jpg.
Uso: python "Dia do Colapso\\tools\\marca_es_v2.py\""""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__)); DC = os.path.dirname(AQUI)
FONTE = os.path.join(DC, '..', 'tools', 'Rubik.ttf')
OUT = os.path.join(DC, 'marca_es'); os.makedirs(OUT, exist_ok=True)
BRANCO, VERM, AMAR = (245, 245, 245), (255, 64, 64), (255, 205, 110)
JANELA_ACESA = (255, 214, 140)


def fonte(t, p='Black'):
    f = ImageFont.truetype(FONTE, t); f.set_variation_by_name(p); return f


def ceu(w, h, horizonte):
    """noite azul em cima, brilho vermelho-alaranjado perto do horizonte."""
    y = np.arange(h)[:, None].astype(np.float32)
    topo, meio, baixo = np.array([4, 6, 14]), np.array([14, 18, 44]), np.array([150, 40, 30])
    u = np.clip(y / horizonte, 0, 1)
    c = topo + (meio - topo) * np.clip(u / 0.7, 0, 1)[..., None]
    brilho = np.clip((u - 0.3) / 0.7, 0, 1) ** 1.6
    c = c * (1 - brilho[..., None]) + baixo * brilho[..., None]
    abaixo = (y[:, 0] > horizonte)
    c = np.broadcast_to(c, (h, 1, 3)).copy(); c[abaixo] = np.array([10, 10, 20])
    return Image.fromarray(np.broadcast_to(c, (h, w, 3)).astype(np.uint8).copy())


def estrelas(im, n, rng, ymax):
    d = ImageDraw.Draw(im)
    for _ in range(n):
        x, y = rng.uniform(0, im.width), rng.uniform(0, ymax) ** 1.0
        a = int(rng.uniform(60, 200)); r = rng.choice([0.8, 1.2, 1.8])
        d.ellipse((x - r, y - r, x + r, y + r), fill=(a, a, min(255, a + 30)))


def skyline(im, rng, base, alt_min, alt_max, larg, cor, janela, acesas, esc, x0=0, x1=None):
    """uma camada de prédios; devolve lista de janelas acesas (para o brilho)."""
    d = ImageDraw.Draw(im); x = x0 - rng.uniform(0, larg[1]); x1 = x1 or im.width
    luzes = []
    while x < x1:
        w = rng.uniform(*larg); h = rng.uniform(alt_min, alt_max)
        top = base - h
        d.rectangle((x, top, x + w, base + 2), fill=cor)
        if rng.random() < 0.25:   # antena / caixa d'água
            aw = max(2, w * 0.06); d.rectangle((x + w * 0.45, top - h * 0.12, x + w * 0.45 + aw, top), fill=cor)
        jw, jh, gx, gy = 9 * esc, 13 * esc, 8 * esc, 12 * esc
        cols = int((w - gx) // (jw + gx))
        if cols >= 1:
            off = (w - (cols * jw + (cols - 1) * gx)) / 2
            yy = top + gy * 1.5
            while yy + jh < base - gy:
                for c in range(cols):
                    xx = x + off + c * (jw + gx)
                    if rng.random() < acesas:
                        d.rectangle((xx, yy, xx + jw, yy + jh), fill=JANELA_ACESA); luzes.append((xx + jw / 2, yy + jh / 2, jw))
                    else:
                        d.rectangle((xx, yy, xx + jw, yy + jh), fill=janela)
                yy += jh + gy
        x += w + rng.uniform(2, 14) * esc
    return luzes


def brilhos(im, luzes, raio=2.6, forca=0.5):
    g = Image.new('L', im.size, 0); d = ImageDraw.Draw(g)
    for x, y, w in luzes:
        r = w * raio; d.ellipse((x - r, y - r, x + r, y + r), fill=255)
    g = g.filter(ImageFilter.GaussianBlur(max(6, luzes[0][2] * 3) if luzes else 6))
    return Image.composite(Image.new('RGB', im.size, (255, 190, 110)), im, g.point(lambda v: int(v * forca)))


def cidade(W, H, horizonte, seed=5, esc=1.0, acesas_frente=0.012):
    rng = np.random.default_rng(seed)
    im = ceu(W, H, horizonte)
    estrelas(im, int(W * H / 9000), rng, horizonte * 0.65)
    skyline(im, rng, horizonte, 120 * esc, 380 * esc, (50 * esc, 130 * esc), (30, 26, 44), (24, 21, 36), 0.004, esc * 0.7)
    skyline(im, rng, horizonte + 60 * esc, 160 * esc, 520 * esc, (70 * esc, 170 * esc), (20, 20, 34), (15, 15, 26), 0.006, esc * 0.85)
    luzes = skyline(im, rng, H + 4, 0.16 * H, 0.34 * H, (110 * esc, 260 * esc), (11, 12, 22), (8, 9, 17), acesas_frente, esc)
    im = brilhos(im, luzes)
    return im


def texto(d, xy, s, f, cor, borda, sombra, anchor='mm'):
    x, y = xy
    d.text((x + sombra * 0.4, y + sombra), s, font=f, fill=(0, 0, 0), anchor=anchor, stroke_width=borda, stroke_fill=(0, 0, 0))
    d.text((x, y), s, font=f, fill=cor, anchor=anchor, stroke_width=borda, stroke_fill=(0, 0, 0))


def icone(S):
    """ícone: um prédio escuro, uma única janela acesa, linha vermelha no horizonte (a luz que caiu)."""
    k = S / 1000
    im = ceu(S, S, int(S * 0.86))
    rng = np.random.default_rng(3); estrelas(im, 90, rng, S * 0.5)
    d = ImageDraw.Draw(im)
    # prédios de fundo
    for x0, x1, top, cor in [(60, 250, 560, (24, 22, 40)), (720, 930, 470, (24, 22, 40)), (180, 330, 690, (18, 18, 32)), (650, 800, 640, (18, 18, 32))]:
        d.rectangle((x0 * k, top * k, x1 * k, S), fill=cor)
    # prédio principal
    bx0, bx1, btop = 330 * k, 670 * k, 170 * k
    d.rectangle((bx0, btop, bx1, S), fill=(34, 38, 66))
    d.rectangle((bx0 + 150 * k, btop - 70 * k, bx0 + 162 * k, btop), fill=(34, 38, 66))   # antena
    jw, jh, gx, gy = 46 * k, 58 * k, 30 * k, 44 * k
    cols = 4; off = (bx1 - bx0 - (cols * jw + (cols - 1) * gx)) / 2
    acesa = (2, 2)   # coluna, linha
    y = btop + gy; r = 0
    while y + jh < S:
        for c in range(cols):
            xx = bx0 + off + c * (jw + gx)
            d.rectangle((xx, y, xx + jw, y + jh), fill=(18, 20, 36))
            if (c, r) == acesa: ax, ay = xx, y
        y += jh + gy; r += 1
    g = Image.new('L', (S, S), 0)
    ImageDraw.Draw(g).ellipse((ax - 240 * k, ay - 240 * k, ax + jw + 240 * k, ay + jh + 240 * k), fill=255)
    g = g.filter(ImageFilter.GaussianBlur(90 * k))
    im = Image.composite(Image.new('RGB', (S, S), (255, 196, 120)), im, g.point(lambda v: int(v * 0.42)))
    d = ImageDraw.Draw(im)
    d.rectangle((ax, ay, ax + jw, ay + jh), fill=(255, 238, 196))
    return im


def perfil(S=2048, nome=True):
    im = icone(S)
    if not nome: return im
    a = np.zeros((S, S), np.float32); n = int(S * 0.5); a[S - n:] = np.linspace(0, 0.85, n)[:, None]
    im = Image.composite(Image.new('RGB', (S, S)), im, Image.fromarray((a * 255).astype(np.uint8), 'L'))
    d = ImageDraw.Draw(im); k = S / 1000
    texto(d, (S / 2, 655 * k), 'DÍA DEL', fonte(int(128 * k)), BRANCO, int(11 * k), int(12 * k))
    texto(d, (S / 2, 775 * k), 'COLAPSO', fonte(int(138 * k)), VERM, int(11 * k), int(12 * k))
    return im


def banner(W=2560, H=1440):
    horizonte = int(H * 0.80)
    im = cidade(W, H, horizonte, seed=11, esc=1.4)
    # faixa escura no centro para o texto (área segura 1546x423)
    y = np.abs(np.linspace(-1, 1, H))[:, None]
    a = np.clip(1.0 - (y - 0.12) / 0.45, 0, 1) * 0.55
    im = Image.composite(Image.new('RGB', (W, H), (4, 5, 12)), im, Image.fromarray((np.broadcast_to(a, (H, W)) * 255).astype(np.uint8), 'L'))
    d = ImageDraw.Draw(im)
    cy = H / 2
    f = fonte(158)
    t1, t2 = 'DÍA DEL ', 'COLAPSO'
    l1, l2 = d.textlength(t1, font=f), d.textlength(t2, font=f)
    x0 = (W - (l1 + l2)) / 2
    for s, cor, dx in ((t1, BRANCO, 0), (t2, VERM, l1)):
        d.text((x0 + dx + 7, cy - 50 + 14), s, font=f, fill=(0, 0, 0), anchor='lm', stroke_width=12, stroke_fill=(0, 0, 0))
        d.text((x0 + dx, cy - 50), s, font=f, fill=cor, anchor='lm', stroke_width=12, stroke_fill=(0, 0, 0))
    lema = 'HISTORIA  ·  DESASTRES  ·  SUPERVIVENCIA'
    fl = fonte(54, 'Bold')
    d.text((W / 2, cy + 95), lema, font=fl, fill=AMAR, anchor='mm')
    lw = d.textlength(lema, font=fl)
    for sx in (-1, 1):   # filetes ao lado do lema
        xa = W / 2 + sx * (lw / 2 + 30); xb = xa + sx * 120
        d.line([(xa, cy + 95), (xb, cy + 95)], fill=AMAR, width=4)
    return im


if __name__ == '__main__':
    b = banner(); b.save(os.path.join(OUT, 'banner_v2_2560x1440.png')); b.save(os.path.join(OUT, 'banner_v2_2560x1440.jpg'), quality=95)
    p = perfil(); p.save(os.path.join(OUT, 'perfil_v2_2048.png')); p.resize((800, 800), Image.LANCZOS).save(os.path.join(OUT, 'perfil_v2_800.png'))
    ic = perfil(nome=False); ic.save(os.path.join(OUT, 'perfil_v2_icone_2048.png'))
    # prévia: banner com as áreas (TV = tudo; computador = faixa 2560x423; celular = 1546x423) + perfis em círculo e em 98 px
    pv = b.copy(); d = ImageDraw.Draw(pv)
    d.rectangle((0, 720 - 211, 2559, 720 + 211), outline=(0, 255, 255), width=6)
    d.rectangle((1280 - 773, 720 - 211, 1280 + 773, 720 + 211), outline=(255, 0, 255), width=6)
    pv = pv.resize((1280, 720))
    tela = Image.new('RGB', (1280, 720 + 300), (24, 24, 28)); tela.paste(pv, (0, 0))
    m = Image.new('L', (260, 260), 0); ImageDraw.Draw(m).ellipse((0, 0, 259, 259), fill=255)
    for j, im in enumerate((p, ic)):
        tela.paste(im.resize((260, 260), Image.LANCZOS), (40 + j * 300, 740), m)
        mm = Image.new('L', (98, 98), 0); ImageDraw.Draw(mm).ellipse((0, 0, 97, 97), fill=255)
        tela.paste(im.resize((98, 98), Image.LANCZOS), (700 + j * 140, 820), mm)
    tela.save(os.path.join(OUT, '_previa_v2.jpg'), quality=88)
    for f in sorted(os.listdir(OUT)):
        if 'v2' in f: print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')

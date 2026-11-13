"""Capas no estilo refinado do canal (mesmo layout montado no Figma), geradas com Pillow.
Uso: python capas_estilo.py 08   |   python capas_estilo.py 09
Lê os recortes de <pasta>\\publicacao\\capa_assets e grava capa_A/B/C.jpg (1280x720) + comparacao_capas.jpg.
Coordenadas em pixels de 1280x720; desenha em 2x e reduz no fim."""
import os, sys, math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__)); BASE = os.path.dirname(AQUI)
S = 2; W, H = 1280 * S, 720 * S
FONTES = {'lg': os.path.join(AQUI, 'LuckiestGuy-Regular.ttf'), 'rubik': os.path.join(AQUI, 'Rubik.ttf'), 'fredoka': os.path.join(AQUI, 'Fredoka.ttf')}


def fonte(nome, tam):
    f = ImageFont.truetype(FONTES[nome], int(tam * S))
    if nome == 'rubik': f.set_variation_by_name('Black')
    if nome == 'fredoka': f.set_variation_by_name('Bold')
    return f


def hexrgb(h, a=255): h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def colar(base, layer, x, y, rot=0, sombra=None):
    """Cola um layer RGBA com o canto superior esquerdo em (x, y) (px 1x), girando em volta desse canto como no Figma."""
    if rot:
        w, h = layer.size; t = math.radians(rot)
        cs = [(px * math.cos(t) + py * math.sin(t), -px * math.sin(t) + py * math.cos(t)) for px, py in ((0, 0), (w, 0), (0, h), (w, h))]
        mx, my = min(c[0] for c in cs), min(c[1] for c in cs)
        layer = layer.rotate(rot, resample=Image.BICUBIC, expand=True)
        px, py = int(x * S + mx), int(y * S + my)
    else:
        px, py = int(x * S), int(y * S)
    if sombra:
        a, dy, r = sombra
        sh = Image.new('RGBA', layer.size, (0, 0, 0, 0)); alpha = layer.getchannel('A').point(lambda v: int(v * a))
        sh.putalpha(alpha)
        if r: sh = sh.filter(ImageFilter.GaussianBlur(r * S / 2))
        base.alpha_composite(sh, (px, py + int(dy * S)))
    base.alpha_composite(layer, (px, py))


def img(base, path, x, y, w, rot=0, sombra=(0.5, 18, 30)):
    im = Image.open(path).convert('RGBA'); h = w * im.height / im.width
    im = im.resize((int(w * S), int(h * S)), Image.LANCZOS)
    colar(base, im, x, y, rot, sombra)


def fundo(base, path, escuro=0.6, vw=820, v0=0.95):
    im = Image.open(path).convert('RGBA').resize((1440 * S, 810 * S), Image.LANCZOS)
    base.alpha_composite(im, (-80 * S, -40 * S))
    base.alpha_composite(Image.new('RGBA', (W, H), hexrgb('#0b1026', int(255 * escuro))))
    g = Image.new('RGBA', (vw * S, H), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    for i in range(vw * S): d.line([(i, 0), (i, H)], fill=(10, 13, 31, int(255 * v0 * (1 - i / (vw * S)))))
    base.alpha_composite(g, (0, 0))


def rect(base, x, y, w, h, cor, r=0, borda=None, bw=0, rot=0, sombra=None, op=1):
    lay = Image.new('RGBA', (int(w * S), int(h * S)), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.rounded_rectangle([0, 0, w * S - 1, h * S - 1], radius=r * S, fill=hexrgb(cor, int(255 * op)), outline=hexrgb(borda) if borda else None, width=int(bw * S))
    colar(base, lay, x, y, rot, sombra)


def texto(base, s, x, y, tam, cor='#FFFFFF', f='lg', borda='#111111', bw=12, rot=0, w=None, sombra=(0.6, 10, 0)):
    ft = fonte(f, tam); bwS = int(bw * S) if borda else 0
    l, t, r, b = ft.getbbox(s, stroke_width=bwS, anchor='la')
    lw, lh = r - l + 4, b - t + 4
    lay = Image.new('RGBA', (lw, lh), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.text((-l + 2, -t + 2), s, font=ft, fill=hexrgb(cor), stroke_width=bwS, stroke_fill=hexrgb(borda) if borda else None, anchor='la')
    ox = x + ((w - lw / S) / 2 if w else 0) + (l - 2) / S
    colar(base, lay, ox, y + (t - 2) / S, rot, sombra)
    return lw / S


def selo(base, s, x, y, cor):
    w = len(s) * 22 + 70
    rect(base, x, y, w, 60, cor, r=30, sombra=(0.4, 6, 10))
    texto(base, s, x, y + 12, 34, f='rubik', borda=None, w=w, sombra=None)


def capas_08(A):
    out = {}
    # A — UM ANO SEM 13º
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_loja13.jpg'), 0.62)
    img(c, A('cris_choque.png'), 990, 250, 330, sombra=(0.5, 14, 24)); img(c, A('nonato_smug.png'), 690, 150, 470)
    selo(c, 'PEDIDO AO UNIVERSO', 56, 40, '#6a1b9a')
    texto(c, 'UM ANO', 52, 132, 132, bw=14); texto(c, 'SEM 13º', 48, 268, 156, '#FFD23F', bw=16)
    rect(c, 58, 470, 470, 100, '#e53935', r=18, borda='#111111', bw=5, rot=-2, sombra=(0.45, 8, 12))
    texto(c, '- R$ 399 BI', 70, 486, 76, bw=8, rot=-2, w=450)
    texto(c, 'NO BOLSO DOS BRASILEIROS', 62, 596, 26, f='rubik', borda=None, sombra=None)
    out['A'] = c
    # B — SEM 13º, SEM NATAL
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_rua25_vazia.jpg'), 0.62, 760)
    img(c, A('noel_suspenso.png'), 700, 40, 345, sombra=(0.55, 18, 30)); img(c, A('nonato_triste.png'), 1000, 400, 290, sombra=(0.5, 14, 24))
    selo(c, 'DEZEMBRO', 56, 40, '#c62828')
    texto(c, 'SEM 13º,', 52, 132, 136, bw=14); texto(c, 'SEM', 52, 272, 150, '#FFD23F', bw=16); texto(c, 'NATAL', 52, 414, 150, '#FFD23F', bw=16)
    out['B'] = c
    # C — ACABOU O 13º?!
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_loja13_noite.jpg'), 0.5, 760)
    img(c, A('cris_choque.png'), 720, 110, 540)
    selo(c, 'R$ 399 BILHÕES', 56, 40, '#2e7d32')
    texto(c, 'ACABOU', 52, 132, 140, bw=14); texto(c, 'O 13º?!', 48, 272, 160, '#FFD23F', bw=16)
    rect(c, 62, 478, 520, 170, '#fffdf5', r=12, borda='#111111', bw=5, rot=-3, sombra=(0.45, 8, 12))
    rect(c, 62, 478, 520, 46, '#c62828', rot=-3)
    texto(c, 'HOLERITE', 80, 488, 28, f='rubik', borda=None, rot=-3, sombra=None)
    texto(c, '13º SALÁRIO', 86, 556, 40, '#263238', f='rubik', borda=None, rot=-3, sombra=None)
    texto(c, 'R$ 0,00', 390, 542, 44, '#e53935', f='rubik', borda=None, rot=-3, sombra=None)
    rect(c, 80, 588, 480, 12, '#e53935', r=6, rot=-5)
    out['C'] = c
    return out


def capas_09(A):
    out = {}
    # A — 382 PARCELAS
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_corredor.jpg'), 0.55, 780)
    rect(c, -60, 560, 900, 120, '#fffdf5', r=8, borda='#111111', bw=5, rot=6, sombra=(0.4, 8, 12))
    for i in range(10):
        rect(c, -20 + i * 86, 600 - i * 9, 56, 10, '#9e9e9e', r=5, rot=6); rect(c, -20 + i * 86, 628 - i * 9, 40, 10, '#e57373', r=5, rot=6)
    img(c, A('kaua_choque.png'), 720, 90, 520)
    selo(c, '12x SEM JUROS', 56, 40, '#7e57c2')
    texto(c, '382', 44, 122, 210, '#FFD23F', bw=18); texto(c, 'PARCELAS', 52, 340, 118, bw=13)
    out['A'] = c
    # B — SALÁRIO EM 12x
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_call.jpg'), 0.6)
    img(c, A('kaua_call_choque.png'), 730, 90, 520)
    selo(c, 'PEDIDO AO UNIVERSO', 56, 40, '#6a1b9a')
    texto(c, 'SALÁRIO', 52, 132, 136, bw=14); texto(c, 'EM 12X', 48, 268, 168, '#FFD23F', bw=16)
    rect(c, 62, 476, 470, 180, '#ffffff', r=24, borda='#111111', bw=5, rot=-2, sombra=(0.45, 8, 12))
    rect(c, 62, 476, 470, 50, '#6a1b9a', rot=-2)
    texto(c, 'MEU BANCO', 62, 488, 28, f='rubik', borda=None, rot=-2, w=470, sombra=None)
    texto(c, 'DEPÓSITO: SALÁRIO (1/12)', 84, 544, 28, '#546e7a', f='fredoka', borda=None, rot=-2, sombra=None)
    texto(c, '+ R$ 183,33', 84, 586, 66, '#2e7d32', borda=None, rot=-2, sombra=None)
    out['B'] = c
    # C — ATÉ A COXINHA
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_loja_cel.jpg'), 0.55, 700)
    img(c, A('kaua_feliz.png'), 900, 170, 420, sombra=(0.5, 16, 26)); img(c, A('coxinha.png'), 650, 150, 330, rot=-10, sombra=(0.55, 18, 30))
    selo(c, '12x SEM JUROS', 56, 40, '#c62828')
    texto(c, 'ATÉ A', 52, 132, 140, bw=14); texto(c, 'COXINHA', 48, 272, 150, '#FFD23F', bw=16)
    rect(c, 70, 470, 430, 150, '#e53935', r=20, borda='#111111', bw=6, rot=-4, sombra=(0.45, 8, 12))
    texto(c, '12X R$ 0,50', 80, 496, 74, bw=8, rot=-4, w=420)
    texto(c, 'SEM JUROS', 84, 572, 32, '#ffe082', f='rubik', borda=None, rot=-4, w=420, sombra=None)
    out['C'] = c
    return out


if __name__ == '__main__':
    pastas = {'08': ('08 - Decimo Terceiro', capas_08), '09': ('09 - Doze Vezes', capas_09)}
    nome, fn = pastas[sys.argv[1]]
    pub = os.path.join(BASE, nome, 'publicacao'); A = lambda f: os.path.join(pub, 'capa_assets', f)
    capas = fn(A)
    folha = Image.new('RGB', (3 * 400 + 40, 245), (24, 24, 24))
    for i, (k, c) in enumerate(capas.items()):
        im = c.convert('RGB').resize((1280, 720), Image.LANCZOS); im.save(os.path.join(pub, f'capa_{k}.jpg'), quality=93, optimize=True)
        folha.paste(im.resize((400, 225), Image.LANCZOS), (10 + i * 410, 10))
    folha.save(os.path.join(pub, 'comparacao_capas.jpg'), quality=90)
    print('ok', pub)

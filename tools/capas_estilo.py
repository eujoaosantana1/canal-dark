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


def cartao(base, x, y, w, h, topo, cor_topo, rot=-3, fundo_c='#fffdf5'):
    """Cartão branco com faixa colorida no alto (conta, holerite, etiqueta)."""
    rect(base, x, y, w, h, fundo_c, r=14, borda='#111111', bw=5, rot=rot, sombra=(0.45, 8, 12))
    rect(base, x, y, w, 48, cor_topo, rot=rot)
    texto(base, topo, x, y + 10, 28, f='rubik', borda=None, rot=rot, w=w, sombra=None)


def linhas(base, x, y, rows, dx, dy, rot=-3):
    """Linhas de cartão girado: rótulo à esquerda e valor em dx, acompanhando a inclinação."""
    k = math.tan(math.radians(-rot))
    for i, (rot_txt, val, c1, c2, tam) in enumerate(rows):
        yy = y + i * dy  # rot negativa gira no sentido horário: à direita desce, para baixo recua
        texto(base, rot_txt, x - i * dy * k, yy, tam, c1, f='rubik', borda=None, rot=rot, sombra=None)
        texto(base, val, x + dx - i * dy * k, yy + dx * k, tam, c2, f='rubik', borda=None, rot=rot, sombra=None)


def capas_03(A):
    out = {}
    # A — título: Ela economizou luz o ano todo… e a conta subiu
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_casa.jpg'), 0.55)
    img(c, A('neide_choque.png'), 740, 110, 520)
    selo(c, 'CONTA DE LUZ', 56, 40, '#ef6c00')
    texto(c, 'GASTOU', 52, 132, 140, bw=14); texto(c, '10% MENOS', 48, 274, 116, '#FFD23F', bw=14)
    cartao(c, 62, 452, 560, 200, 'CONTA DE LUZ', '#ef6c00')
    linhas(c, 86, 520, [('ANTES   200 kWh', 'R$ 182', '#78909c', '#78909c', 32), ('AGORA   180 kWh', 'R$ 186', '#263238', '#e53935', 38)], 345, 60)
    out['A'] = c
    # B — título: Por que a conta de luz sobe mesmo quando você economiza?
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_casa_noite.jpg'), 0.5)
    img(c, A('neide_confusa.png'), 740, 110, 520)
    selo(c, 'PEDIDO AO UNIVERSO', 56, 40, '#6a1b9a')
    texto(c, 'ENERGIA?', 52, 132, 132, bw=14); texto(c, 'SÓ R$ 34', 48, 268, 150, '#FFD23F', bw=16)
    cartao(c, 62, 462, 560, 190, 'DE CADA R$ 100 DA CONTA', '#c62828', rot=-2)
    bar = Image.new('RGBA', (int(510 * S), int(90 * S)), (0, 0, 0, 0)); d = ImageDraw.Draw(bar); x = 0
    for v, cor in ((34, '#43a047'), (25, '#1e88e5'), (18, '#e53935'), (17, '#8e24aa'), (6, '#fb8c00')):
        w = v * 5.1 * S; d.rectangle([x, 0, x + w, 90 * S - 1], fill=hexrgb(cor), outline=hexrgb('#111111'), width=int(3 * S))
        d.text((x + w / 2, 45 * S), str(v), font=fonte('lg', 48 if v > 6 else 26), fill=hexrgb('#ffffff'), anchor='mm', stroke_width=int((6 if v > 6 else 3) * S), stroke_fill=hexrgb('#111111'))
        x += w
    colar(c, bar, 86, 536, -2)
    out['B'] = c
    # C — título: Quem mais come a sua conta de luz? Ela descobriu
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_muro.jpg'), 0.55, 760)
    img(c, A('neide_choque.png'), 960, 400, 290, sombra=(0.5, 14, 24)); img(c, A('gato_smug.png'), 690, 110, 470)
    selo(c, 'O 6º DA FILA', 56, 40, '#c62828')
    texto(c, 'TEM UM', 52, 132, 140, bw=14); texto(c, 'GATO', 48, 272, 190, '#FFD23F', bw=18)
    cartao(c, 62, 500, 420, 150, 'CRACHÁ: GATO', '#37474f')
    texto(c, 'PERDAS 14,3%', 84, 566, 50, '#c62828', f='rubik', borda=None, rot=-3, sombra=None)
    out['C'] = c
    return out


def capas_04(A):
    out = {}
    # A — título: E se o Brasil tivesse só um feriado por ano?
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_casa_rose.jpg'), 0.55)
    img(c, A('rose_choque.png'), 740, 110, 520)
    selo(c, 'PEDIDO AO UNIVERSO', 56, 40, '#6a1b9a')
    texto(c, 'DE 10', 52, 132, 140, bw=14); texto(c, 'PRA 1', 48, 272, 170, '#FFD23F', bw=16)
    img(c, A('calendario.png'), 80, 470, 210, rot=-6, sombra=(0.5, 10, 16))
    rect(c, 300, 520, 300, 110, '#e53935', r=18, borda='#111111', bw=5, rot=-3, sombra=(0.45, 8, 12))
    texto(c, '-9 FERIADOS', 300, 548, 46, bw=6, rot=-3, w=300, sombra=None)
    out['A'] = c
    # B — título: O dono da loja cancelou os feriados. Deu errado
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_loja.jpg'), 0.55)
    img(c, A('fabio_smug.png'), 740, 110, 520)
    selo(c, 'FÁBIO MÓVEIS', 56, 40, '#c62828')
    texto(c, 'FERIADO?', 52, 132, 132, bw=14); texto(c, 'CANCELADO', 48, 268, 118, '#FFD23F', bw=14)
    rect(c, 58, 440, 470, 110, '#e53935', r=18, borda='#111111', bw=5, rot=-2, sombra=(0.45, 8, 12))
    texto(c, 'R$ 17 BI', 70, 456, 78, bw=8, rot=-2, w=450)
    texto(c, 'QUE O COMÉRCIO DE SP DEIXA', 62, 576, 28, f='rubik', borda=None, sombra=None)
    texto(c, 'DE FATURAR COM FERIADOS', 62, 612, 28, f='rubik', borda=None, sombra=None)
    out['B'] = c
    # C — título: Ela juntou dinheiro o ano todo pra ver o mar
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_praia.jpg'), 0.5, 760)
    img(c, A('lara_feliz.png'), 960, 380, 300, sombra=(0.5, 14, 24)); img(c, A('rose_feliz.png'), 730, 130, 450)
    selo(c, '1 FERIADO POR ANO', 56, 40, '#1565c0')
    texto(c, 'A FILHA', 52, 132, 120, bw=13); texto(c, 'NUNCA VIU', 48, 250, 112, '#FFD23F', bw=13); texto(c, 'O MAR', 48, 362, 130, '#FFD23F', bw=14)
    img(c, A('pote.png'), 90, 500, 260, rot=-5, sombra=(0.5, 10, 16))
    rect(c, 330, 560, 250, 90, '#ffffff', r=16, borda='#111111', bw=5, rot=4, sombra=(0.45, 8, 12))
    texto(c, '12 MESES', 330, 578, 44, '#1565c0', f='rubik', borda=None, rot=4, w=250, sombra=None)
    out['C'] = c
    return out


def capas_05(A):
    out = {}
    # A — título: Por que o pão francês não existe na França?
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_padaria.jpg'), 0.55)
    img(c, A('nene_smug.png'), 740, 110, 520)
    selo(c, 'PÃO FRANCÊS', 56, 40, '#ef6c00')
    texto(c, 'FRANCÊS?', 52, 132, 132, bw=14); texto(c, 'SÓ AQUI', 48, 268, 160, '#FFD23F', bw=16)
    rect(c, 62, 470, 470, 180, '#263238', r=14, borda='#8d6e63', bw=10, rot=-3, sombra=(0.45, 8, 12))
    texto(c, 'PÃO FRANCÊS', 62, 494, 34, f='rubik', borda=None, rot=-3, w=470, sombra=None)
    texto(c, 'R$ 24,69 O KG', 62, 548, 62, '#FFD23F', bw=0, borda=None, rot=-3, w=470, sombra=None)
    out['A'] = c
    # B — título: Ele levou o pão francês pra Paris. O francês não conhecia
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_paris.jpg'), 0.5)
    img(c, A('luc_confuso.png'), 740, 110, 520)
    selo(c, 'BOULANGERIE', 56, 40, '#1565c0')
    texto(c, 'QUE PÃO', 52, 132, 140, bw=14); texto(c, 'É ESSE?', 48, 272, 160, '#FFD23F', bw=16)
    img(c, A('pao.png'), 90, 480, 300, rot=-8, sombra=(0.5, 10, 16))
    rect(c, 400, 520, 230, 110, '#e53935', r=18, borda='#111111', bw=5, rot=4, sombra=(0.45, 8, 12))
    texto(c, '2 EUROS', 400, 546, 56, bw=7, rot=4, w=230, sombra=None)
    out['B'] = c
    # C — título: O padeiro de Guarulhos que provou o pão em Paris
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_rua_padarias.jpg'), 0.55)
    img(c, A('nene_choque.png'), 740, 110, 520)
    selo(c, 'GUARULHOS x PARIS', 56, 40, '#c62828')
    texto(c, '45 ANOS', 52, 132, 140, bw=14); texto(c, 'DE FORNO', 48, 272, 140, '#FFD23F', bw=15)
    img(c, A('baguete.png'), 60, 470, 520, rot=-6, sombra=(0.5, 10, 16))
    rect(c, 120, 560, 380, 90, '#ffffff', r=16, borda='#111111', bw=5, rot=-3, sombra=(0.45, 8, 12))
    texto(c, 'PADARIA DO NENÊ', 120, 584, 30, '#c62828', f='rubik', borda=None, rot=-3, w=380, sombra=None)
    out['C'] = c
    return out


def termometro(base, x, y, txt, cor, rot=-4):
    rect(base, x, y, 250, 120, '#263238', r=18, borda='#111111', bw=6, rot=rot, sombra=(0.45, 8, 12))
    texto(base, txt, x, y + 22, 72, cor, f='rubik', borda=None, rot=rot, w=250, sombra=None)


def capas_06(A):
    out = {}
    # A — título: E se nevasse no Brasil inteiro?
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_praca_neve.jpg'), 0.5)
    img(c, A('chiquinha_frio_choque.png'), 740, 110, 520)
    selo(c, 'PEDIDO AO UNIVERSO', 56, 40, '#6a1b9a')
    texto(c, 'DE 41°C', 52, 132, 140, bw=14); texto(c, 'PRA NEVE', 48, 272, 140, '#FFD23F', bw=15)
    termometro(c, 62, 480, '41°C', '#ff7043'); termometro(c, 340, 500, '-8°C', '#64b5f6', rot=3)
    out['A'] = c
    # B — título: Ela pediu pra ver neve uma vez. Nevou no Brasil todo
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_praca_neve.jpg'), 0.62, 760)
    img(c, A('chiquinha_choque.png'), 740, 110, 520)
    selo(c, 'PEDIDO AO UNIVERSO', 56, 40, '#c62828')
    texto(c, 'DINDIN', 52, 132, 140, bw=14); texto(c, 'NA NEVE', 48, 272, 156, '#FFD23F', bw=16)
    img(c, A('carrinho_neve.png'), 70, 450, 360, rot=-4, sombra=(0.5, 10, 16))
    out['B'] = c
    # C — título: O que acontece se nevar em Teresina?
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_praca_sol.jpg'), 0.55)
    img(c, A('chiquinha_frio_choque.png'), 960, 400, 290, sombra=(0.5, 14, 24)); img(c, A('arlindo_smug.png'), 700, 110, 470)
    selo(c, 'TERESINA (PI)', 56, 40, '#ef6c00')
    texto(c, 'NO PIAUÍ,', 52, 132, 132, bw=14); texto(c, '-3°C', 48, 268, 190, '#FFD23F', bw=18)
    termometro(c, 62, 490, '38°C', '#ff7043'); termometro(c, 340, 510, '-3°C', '#64b5f6', rot=3)
    out['C'] = c
    return out


def capas_07(A):
    out = {}
    # A — título: Um mês inteiro com R$ 1.621
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_paulista.jpg'), 0.55)
    img(c, A('taina_cansada.png'), 740, 110, 520)
    selo(c, 'SALÁRIO MÍNIMO', 56, 40, '#2e7d32')
    texto(c, 'A HORA', 52, 132, 140, bw=14); texto(c, 'R$ 7,37', 48, 272, 166, '#FFD23F', bw=16)
    cartao(c, 62, 470, 520, 190, 'HOLERITE', '#2e7d32')
    linhas(c, 86, 528, [('SALÁRIO', 'R$ 1.621,00', '#263238', '#2e7d32', 30), ('INSS', '- R$ 121,58', '#263238', '#e53935', 30),
                        ('VALE-TRANSP.', '- R$ 97,26', '#263238', '#e53935', 30)], 262, 42)
    out['A'] = c
    # B — título: Até que dia do mês dura um salário mínimo?
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_comodo.jpg'), 0.55)
    img(c, A('taina_choque.png'), 740, 110, 520)
    selo(c, 'PEDIDO AO UNIVERSO', 56, 40, '#6a1b9a')
    texto(c, 'DIA 22:', 52, 132, 140, bw=14); texto(c, 'ACABOU', 48, 272, 166, '#FFD23F', bw=16)
    rect(c, 62, 462, 460, 210, '#fffdf5', r=10, borda='#111111', bw=5, rot=-3, sombra=(0.45, 8, 12))
    rect(c, 62, 462, 460, 40, '#c62828', rot=-3)
    texto(c, 'MÊS', 62, 468, 26, f='rubik', borda=None, rot=-3, w=460, sombra=None)
    cal = Image.new('RGBA', (int(440 * S), int(160 * S)), (0, 0, 0, 0)); d = ImageDraw.Draw(cal)
    for i in range(30):
        cx, cy = (i % 10) * 44 * S, (i // 10) * 54 * S
        d.rounded_rectangle([cx + 4 * S, cy + 4 * S, cx + 38 * S, cy + 46 * S], radius=5 * S, fill=hexrgb('#e53935') if i >= 21 else hexrgb('#cfd8dc'))
        if i < 21: d.line([cx + 8 * S, cy + 8 * S, cx + 34 * S, cy + 42 * S], fill=hexrgb('#455a64'), width=int(4 * S))
        else: d.text((cx + 21 * S, cy + 25 * S), str(i + 1), font=fonte('rubik', 20), fill=hexrgb('#ffffff'), anchor='mm')
    colar(c, cal, 74, 510, -3)
    out['B'] = c
    # C — título: Ela pediu pro salário durar até o fim do mês
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_ponto.jpg'), 0.55)
    img(c, A('taina_triste.png'), 960, 400, 290, sombra=(0.5, 14, 24)); img(c, A('contador_smug.png'), 700, 100, 470)
    selo(c, 'REPARTIÇÃO DO UNIVERSO', 56, 40, '#1565c0')
    texto(c, 'PRECISAVA', 52, 132, 120, bw=13); texto(c, 'R$ 7.750', 48, 256, 156, '#FFD23F', bw=16)
    rect(c, 58, 450, 480, 110, '#e53935', r=18, borda='#111111', bw=5, rot=-2, sombra=(0.45, 8, 12))
    texto(c, '4,78 x O MÍNIMO', 70, 474, 56, bw=7, rot=-2, w=460)
    texto(c, 'SALÁRIO NECESSÁRIO (DIEESE)', 62, 586, 26, f='rubik', borda=None, sombra=None)
    out['C'] = c
    return out


def painel_mini(base, x, y, rot=-3, linhas=(('RIO DE JANEIRO', '06:10'), ('BRASÍLIA', '06:25'), ('MANAUS', '07:20'))):
    """Cartão de painel de embarque com as linhas CANCELADO."""
    rect(base, x, y, 540, 64 + 62 * len(linhas), '#11161c', r=14, borda='#111111', bw=5, rot=rot, sombra=(0.45, 8, 12))
    rect(base, x, y, 540, 52, '#0d47a1', rot=rot)
    texto(base, 'PARTIDAS', x + 22, y + 12, 30, '#FFD23F', f='rubik', borda=None, rot=rot, sombra=None)
    k = math.tan(math.radians(-rot))
    for i, (d, h) in enumerate(linhas):
        yy = y + 74 + i * 62
        texto(base, d, x + 22 - i * 62 * k, yy, 26, '#ffffff', f='rubik', borda=None, rot=rot, sombra=None)
        rect(base, x + 318 - i * 62 * k, yy - 6 + 318 * k, 200, 44, '#e53935', r=6, rot=rot)
        texto(base, 'CANCELADO', x + 318 - i * 62 * k, yy + 2 + 318 * k, 26, '#ffffff', f='rubik', borda=None, rot=rot, w=200, sombra=None)


def capas_12(A):
    out = {}
    # A — título: E se todos os voos do Brasil fossem cancelados?
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_ponto_taxi.jpg'), 0.55)
    img(c, A('valdemar_choque.png'), 740, 110, 520)
    selo(c, 'PEDIDO AO UNIVERSO', 56, 40, '#6a1b9a')
    texto(c, 'NENHUM', 52, 132, 140, bw=14); texto(c, 'AVIÃO', 48, 272, 170, '#FFD23F', bw=16)
    painel_mini(c, 62, 430)
    out['A'] = c
    # B — título: Uma semana sem aviões no Brasil: o que acontece?
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_painel_vermelho.jpg'), 0.35, 760, 0.85)
    img(c, A('valdemar_triste.png'), 760, 120, 500)
    selo(c, 'BRASIL PARADO', 56, 40, '#c62828')
    texto(c, '7 DIAS', 52, 132, 150, bw=15); texto(c, 'NO CHÃO', 48, 284, 150, '#FFD23F', bw=16)
    rect(c, 58, 480, 500, 120, '#e53935', r=18, borda='#111111', bw=5, rot=-2, sombra=(0.45, 8, 12))
    texto(c, '15 MIL VOOS', 70, 500, 74, bw=8, rot=-2, w=480)
    texto(c, 'CANCELADOS EM UMA SEMANA', 62, 622, 28, f='rubik', borda=None, sombra=None)
    out['B'] = c
    # C — título: O taxista que pediu o céu em silêncio (curiosidade, sem entregar o final)
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_hospital.jpg'), 0.55)
    img(c, A('lucia_preocupada.png'), 760, 110, 500)
    selo(c, 'TRANSPLANTE', 56, 40, '#1565c0')
    texto(c, 'SEM', 52, 132, 150, bw=15); texto(c, 'TEMPO', 48, 284, 170, '#FFD23F', bw=16)
    img(c, A('caixa_orgao.png'), 70, 470, 300, rot=-4, sombra=(0.5, 10, 16))
    img(c, A('relogio.png'), 390, 470, 190, rot=6, sombra=(0.5, 10, 16))
    out['C'] = c
    return out


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


def capas_11(A):
    out = {}
    # A — TEAMS CAIU (título: Teams caiu e ninguém trabalhou)
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_home_office.jpg'), 0.55)
    img(c, A('rafa_choque.png'), 760, 120, 480)
    selo(c, 'APAGÃO DA MICROSOFT', 56, 40, '#c62828')
    texto(c, 'TEAMS', 52, 132, 150, bw=15); texto(c, 'CAIU', 48, 284, 170, '#FFD23F', bw=16)
    rect(c, 62, 486, 470, 150, '#ffffff', r=20, borda='#111111', bw=5, rot=-3, sombra=(0.45, 8, 12))
    rect(c, 62, 486, 470, 48, '#5c6bc0', rot=-3)
    texto(c, 'REUNIÃO', 62, 496, 28, f='rubik', borda=None, rot=-3, w=470, sombra=None)
    texto(c, 'CONECTANDO...', 92, 560, 46, '#c62828', f='rubik', borda=None, rot=-3, sombra=None)
    out['A'] = c
    # B — A NUVEM CAIU (título: Outlook e Teams caíram. Quem segura o trabalho do mundo?)
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_nuvem.jpg'), 0.5, 760)
    img(c, A('tecnico_choque.png'), 780, 70, 460)
    selo(c, 'AO VIVO DA NUVEM', 56, 40, '#6a1b9a')
    texto(c, 'A NUVEM', 52, 132, 136, bw=14); texto(c, 'CAIU', 48, 272, 170, '#FFD23F', bw=16)
    rect(c, 58, 480, 500, 110, '#e53935', r=18, borda='#111111', bw=5, rot=-2, sombra=(0.45, 8, 12))
    texto(c, '138.058', 70, 494, 78, bw=8, rot=-2, w=480)
    texto(c, 'RELATOS DE PROBLEMA NO PICO', 62, 610, 26, f='rubik', borda=None, sombra=None)
    out['B'] = c
    # C — 8,5 MILHÕES DE TELAS AZUIS
    c = Image.new('RGBA', (W, H)); fundo(c, A('bg_mercadinho.jpg'), 0.6, 760)
    img(c, A('jura_choque.png'), 790, 140, 450)
    selo(c, 'RELEMBRE 2024', 56, 40, '#1565c0')
    texto(c, '8,5 MILHÕES', 52, 132, 120, '#FFD23F', bw=13); texto(c, 'DE TELAS', 52, 262, 120, bw=13); texto(c, 'AZUIS', 52, 392, 130, '#64B5F6', bw=14)
    rect(c, 80, 560, 300, 130, '#1565c0', r=10, borda='#111111', bw=6, rot=-4, sombra=(0.45, 8, 12))
    texto(c, ':(', 100, 572, 70, bw=0, borda=None, rot=-4, sombra=None)
    out['C'] = c
    return out


if __name__ == '__main__':
    pastas = {'03': ('03 - Conta de Luz', capas_03), '04': ('04 - Um Feriado por Ano', capas_04), '05': ('05 - Pao Frances', capas_05),
              '06': ('06 - Neve no Brasil', capas_06), '07': ('07 - Salario Minimo', capas_07), '12': ('12 - Sem Voos', capas_12),
              '08':('08 - Decimo Terceiro', capas_08), '09': ('09 - Doze Vezes', capas_09), '11': ('11 - Apagao Nuvem', capas_11)}
    nome, fn = pastas[sys.argv[1]]
    pub = os.path.join(BASE, nome, 'publicacao'); A = lambda f: os.path.join(pub, 'capa_assets', f)
    capas = fn(A)
    folha = Image.new('RGB', (3 * 400 + 40, 245), (24, 24, 24))
    for i, (k, c) in enumerate(capas.items()):
        im = c.convert('RGB').resize((1280, 720), Image.LANCZOS); im.save(os.path.join(pub, f'capa_{k}.jpg'), quality=93, optimize=True)
        folha.paste(im.resize((400, 225), Image.LANCZOS), (10 + i * 410, 10))
    folha.save(os.path.join(pub, 'comparacao_capas.jpg'), quality=90)
    print('ok', pub)

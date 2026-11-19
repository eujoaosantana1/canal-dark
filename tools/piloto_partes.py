"""PILOTO (caminho 1): Josi em PARTES (tronco, braços, cabeças) desenhadas pelo Gemini no traço das capas
e animadas por código (boca pela voz, piscada, cabeça que vira e inclina, braços que apontam e gesticulam).

Uso:  python tools/piloto_partes.py assets    -> pilotos/10_partes/assets (gera o que faltar)
      python tools/piloto_partes.py pecas     -> recorta as peças (chroma) e mostra a folha de conferência
      python tools/piloto_partes.py render    -> pilotos/10_partes/PILOTO_PARTES_10.mp4
"""
import io, json, math, os, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemini_chave import ler_chave
from capas_ia import titulo

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = os.path.join(BASE, '10 - Escala 6x1')
OUT = os.path.join(BASE, 'pilotos', '10_partes'); AS = os.path.join(OUT, 'assets'); PC = os.path.join(OUT, 'pecas')
JOSI_REF = os.path.join(BASE, 'pilotos', '10_ia', 'assets', 'josi_base.png')   # Josi já no traço novo
ESTILO_REF = os.path.join(VID, 'publicacao', 'capa_ia', 'ilustra_A_1.png')
BG = os.path.join(BASE, 'pilotos', '10_ia', 'assets', 'bg_mercado.png')
MODELO = 'gemini-3-pro-image'
W, H, FPS = 1280, 720, 30

VERDE = ("on a perfectly flat pure green (#00FF00) background, no shadows, no outlines of the background, "
         "in EXACTLY the same cartoon style and colors as the character in the reference image (thick black outlines, flat colors). ")

PEDIDOS = {
    'corpo': ("Cutout-animation parts sheet for the character in the reference image (Josi, red cashier polo with white collar and ID badge), "
              + VERDE +
              "Draw ONLY these separate pieces, spread out with LARGE green gaps between them, nothing touching or overlapping: "
              "(1) on the LEFT half: her TORSO seen from the front, from the waist up, WITHOUT head and WITHOUT arms: neck stump on top, shoulders "
              "with the short red sleeves, the sleeves end in open holes (no arms coming out), polo with white collar and ID badge, cut flat at the waist. "
              "(2) on the RIGHT half, in a row, three separate bare ARMS (brown skin, from just below the sleeve down to the hand, each arm is one "
              "straight piece drawn vertically with the shoulder end at the TOP): arm A relaxed hanging down with a relaxed hand; arm B with the hand "
              "making a POINTING gesture (index finger extended downward along the arm direction); arm C with an OPEN PALM hand facing the viewer, "
              "fingers spread. No head anywhere."),
    'cab_frente': ("Only the HEAD of the character in the reference image (Josi), no neck below the chin, facing the viewer straight from the front, "
                   + VERDE + "Centered, large. Neutral calm expression, mouth CLOSED, eyes open. Same hair bun, earrings."),
    'bracos2': ("Cutout-animation ARM parts for the character in the reference image (Josi, brown skin), " + VERDE +
                "Draw ONLY these 4 separate bare-arm pieces in a single row from left to right, each drawn VERTICALLY (joint end at the TOP), "
                "with LARGE green gaps between them, nothing touching: "
                "(1) an UPPER ARM only (from shoulder to elbow, rounded ends, no hand); "
                "(2) a FOREARM with a RELAXED hand (from elbow to fingertips, hand hanging down); "
                "(3) a FOREARM with a POINTING hand (index finger extended straight down in line with the forearm, other fingers closed); "
                "(4) a FOREARM with an OPEN PALM facing the viewer, fingers spread and pointing down in line with the forearm. "
                "Same thickness for all pieces, same skin color and outline as the reference."),
}
EDICOES = {  # (base, nome, instrução)
    'cab_lado': ('cab_frente', "Edit: keep the SAME head, same hair color and bun, same earrings, same colors, same green background and same size, but turn the head THREE-QUARTERS to the viewer's LEFT (looking toward the left side), mouth closed with a slight smile."),
    'cab_frente_meia': ('cab_frente', "Edit: keep EVERYTHING identical (head shape, hair, eyes, colors, green background, framing, size) and only make the mouth SLIGHTLY OPEN, talking."),
    'cab_frente_aberta': ('cab_frente', "Edit: keep EVERYTHING identical (head shape, hair, eyes, colors, green background, framing, size) and only make the mouth WIDE OPEN, talking ('ah')."),
    'cab_frente_pisca': ('cab_frente', "Edit: keep EVERYTHING identical (head shape, hair, mouth, colors, green background, framing, size) and only CLOSE the eyes (blink)."),
    'cab_frente_sorri': ('cab_frente', "Edit: keep EVERYTHING identical (head shape, hair, colors, green background, framing, size) and change the expression to a big happy smile with the mouth closed, eyes squinting happily."),
    'cab_lado_aberta': ('cab_lado', "Edit: keep EVERYTHING identical (head angle, hair, eyes, colors, green background, framing, size) and only make the mouth OPEN, talking."),
}


def pedir(cli, partes, aspect='1:1'):
    from google.genai import types
    r = cli.models.generate_content(model=MODELO, contents=partes, config=types.GenerateContentConfig(
        response_modalities=['IMAGE'], image_config=types.ImageConfig(aspect_ratio=aspect, image_size='2K')))
    for p in r.candidates[0].content.parts:
        if p.inline_data and p.inline_data.data:
            return Image.open(io.BytesIO(p.inline_data.data)).convert('RGB')
    raise RuntimeError('sem imagem')


def assets():
    from google import genai
    os.makedirs(AS, exist_ok=True); cli = genai.Client(api_key=ler_chave()); ref = Image.open(JOSI_REF)
    for nome, txt in PEDIDOS.items():
        f = os.path.join(AS, nome + '.png')
        if os.path.exists(f): continue
        refs = [ref, Image.open(os.path.join(AS, 'corpo.png'))] if nome == 'bracos2' else [ref]
        pedir(cli, refs + [txt], '16:9' if nome in ('corpo', 'bracos2') else '1:1').save(f); print('ok', nome)
    for nome, (base, txt) in EDICOES.items():
        f = os.path.join(AS, nome + '.png')
        if os.path.exists(f): continue
        pedir(cli, [Image.open(os.path.join(AS, base + '.png')), txt]).save(f); print('ok', nome)


# ------------------------------------------------------------------ recorte
def alfa(im):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    verde = g - np.maximum(r, b)
    al = np.clip(255 - (verde - 30) * 5, 0, 255).astype(np.uint8)
    rgb = a.copy(); sp = g > np.maximum(r, b); rgb[..., 1] = np.where(sp, np.maximum(r, b), g)
    return Image.fromarray(np.dstack([rgb.astype(np.uint8), al]), 'RGBA')


def componentes(rgba, minimo=4000):
    """peças separadas (componentes conexos do alfa), da esquerda pra direita."""
    from scipy import ndimage
    m = np.asarray(rgba)[..., 3] > 128
    m = ndimage.binary_closing(m, iterations=3)
    lab, n = ndimage.label(m)
    out = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        area = (lab[sl] == i).sum()
        if area < minimo: continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        msk = Image.fromarray(((lab[sl] == i) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
        peca = rgba.crop((x0, y0, x1, y1)); a = Image.fromarray(np.minimum(np.asarray(peca)[..., 3], np.asarray(msk)))
        peca.putalpha(a); out.append((x0, peca))
    return [p for _, p in sorted(out, key=lambda t: t[0])]


def cortar_gola(im):
    """mantém cabeça + pescoço: corta na primeira linha (abaixo de 55%) com gola branca ou camisa vermelha no centro."""
    a = np.asarray(im).astype(np.int16); h, w = a.shape[:2]
    x0, x1 = int(w * .3), int(w * .7)
    for y in range(int(h * .55), h):
        r, g, b, al = a[y, x0:x1, 0], a[y, x0:x1, 1], a[y, x0:x1, 2], a[y, x0:x1, 3]
        branco = ((r > 225) & (g > 225) & (b > 225) & (al > 200)).mean()
        verm = ((r > 170) & (g < 90) & (b < 90) & (al > 200)).mean()
        if branco > .08 or verm > .08:
            corte = y - int(h * .03)   # acima da gola: o pescoço da cabeça assenta sobre o pescoço do tronco
            out = im.crop((0, 0, w, corte)); bb = out.getbbox(); return out.crop(bb)
    return im


def pecas():
    os.makedirs(PC, exist_ok=True)
    corpo = componentes(alfa(Image.open(os.path.join(AS, 'corpo.png'))))
    print('peças no corpo:', len(corpo), [p.size for p in corpo])
    nomes = ['tronco', 'braco_solto', 'braco_aponta', 'braco_palma']
    for n, p in zip(nomes, corpo): p.save(os.path.join(PC, n + '.png'))
    b2 = componentes(alfa(Image.open(os.path.join(AS, 'bracos2.png'))))
    print('peças do braço:', len(b2), [p.size for p in b2])
    for n, p in zip(['umero', 'ante_solto', 'ante_aponta', 'ante_palma'], b2):
        if n.startswith('ante'):   # o modelo desenhou o braço inteiro: fica só do cotovelo pra baixo
            p = p.crop((0, int(p.height * .38), p.width, p.height)); p = p.crop(p.getbbox())
        p.save(os.path.join(PC, n + '.png'))
    for k in ['cab_frente', 'cab_lado'] + list(EDICOES):
        c = componentes(alfa(Image.open(os.path.join(AS, k + '.png'))))
        c = max(c, key=lambda p: p.size[0] * p.size[1]); c = cortar_gola(c); c.save(os.path.join(PC, k + '.png'))
    fs = sorted(os.listdir(PC)); fol = Image.new('RGB', (230 * len(fs), 300), (90, 90, 120))
    for i, f in enumerate(fs):
        im = Image.open(os.path.join(PC, f)); im.thumbnail((220, 260)); fol.paste(im, (i * 230 + 5, 5), im)
        ImageDraw.Draw(fol).text((i * 230 + 5, 280), f[:-4], fill=(255, 255, 255))
    fol.save(os.path.join(OUT, 'folha_pecas.jpg')); print(fs)


# ------------------------------------------------------------------ rig
class Rig:
    """Josi de cintura pra cima. Coordenadas em px da peça do tronco (escala 1)."""
    def __init__(s, cfg):
        s.c = cfg; L = lambda n: Image.open(os.path.join(PC, n + '.png')).convert('RGBA')
        s.tronco = L('tronco')
        s.umero = L('umero'); s.ante = {k: L('ante_' + k) for k in ['solto', 'aponta', 'palma']}
        s.cab = {k: L(k) for k in ['cab_frente', 'cab_frente_meia', 'cab_frente_aberta', 'cab_frente_pisca',
                                   'cab_frente_sorri', 'cab_lado', 'cab_lado_aberta']}

    @staticmethod
    def _peca(lay, im, topo, ang):
        """cola 'im' (vertical, junta no centro da borda de cima) girada em volta da junta, com a junta em 'topo'."""
        lado = 2 * (im.width + im.height); pad = Image.new('RGBA', (lado, lado)); px = py = lado // 2   # cabe a peça girada em qualquer ângulo
        pad.alpha_composite(im, (px - im.width // 2, py))
        r = pad.rotate(-ang, resample=Image.BICUBIC, center=(px, py))
        lay.alpha_composite(r, (int(topo[0] - px), int(topo[1] - py)))

    def braco(s, lay, nome, ombro, ang, cot, espelho, T):
        """ang: abertura do ombro (+ = para fora no lado esquerdo da tela; o direito usa negativo). cot: dobra do cotovelo, mesmo sinal."""
        c = s.c; u = s.umero; f = s.ante[nome]
        if espelho: u = u.transpose(Image.FLIP_LEFT_RIGHT); f = f.transpose(Image.FLIP_LEFT_RIGHT)
        k = c['umero'] * T.height / s.umero.height   # mesma escala nas duas peças (espessura igual)
        u = u.resize((max(1, int(u.width * k)), int(u.height * k)), Image.LANCZOS)
        f = f.resize((max(1, int(f.width * k)), int(f.height * k)), Image.LANCZOS)
        L = u.height * 0.84; a = math.radians(ang)
        cotovelo = (ombro[0] - L * math.sin(a), ombro[1] + L * math.cos(a))
        s._peca(lay, f, cotovelo, ang + cot)      # antebraço por baixo
        s._peca(lay, u, ombro, ang)               # úmero por cima (cobre a junta)

    def desenhar(s, pose, escala):
        c = s.c; T = s.tronco; lay = Image.new('RGBA', (T.width * 3, T.height * 3)); ox, oy = T.width, T.height
        ob = (ox + T.width * c['ombro_e'][0], oy + T.height * c['ombro_e'][1])   # ombro do lado esquerdo da TELA (braço direito dela)
        od = (ox + T.width * c['ombro_d'][0], oy + T.height * c['ombro_d'][1])
        # braços ATRÁS do tronco (a manga cobre a junta)
        be, bd = pose['be'], pose['bd']
        s.braco(lay, be[0], ob, be[1], be[2] if len(be) > 2 else 0, False, T)
        s.braco(lay, bd[0], od, bd[1], bd[2] if len(bd) > 2 else 0, True, T)
        lay.alpha_composite(T, (ox, oy))
        # cabeça: pivô no pescoço
        cb = s.cab[pose['cab']]
        if pose.get('espelha_cab'): cb = cb.transpose(Image.FLIP_LEFT_RIGHT)
        ec = c['esc_cab'] * T.width / cb.width
        cb = cb.resize((int(cb.width * ec), int(cb.height * ec)), Image.LANCZOS)
        pesc = (ox + T.width * c['pescoco'][0] + pose.get('cab_dx', 0), oy + T.height * c['pescoco'][1] + pose.get('cab_dy', 0))
        pad = Image.new('RGBA', (cb.width * 2, cb.height * 2)); px, py = cb.width, cb.height
        pad.alpha_composite(cb, (px - cb.width // 2, py - cb.height))
        r = pad.rotate(pose.get('incl', 0), resample=Image.BICUBIC, center=(px, py))
        lay.alpha_composite(r, (int(pesc[0] - px), int(pesc[1] - py)))
        bb = lay.getbbox(); lay = lay.crop(bb)
        return lay.resize((int(lay.width * escala), int(lay.height * escala)), Image.LANCZOS), (ox - bb[0], oy - bb[1])


CFG = {'ombro_e': (0.22, 0.36), 'ombro_d': (0.80, 0.34), 'pescoco': (0.5, 0.15), 'umero': 0.36, 'ante': 0.50,
       'esc_cab': 0.66, 'queixo': 0.0}


def envelope():
    wv = wave.open(os.path.join(VID, 'voiceover.wav')); sr = wv.getframerate(); n = wv.getnframes()
    x = np.frombuffer(wv.readframes(n), dtype=np.int16).astype(np.float32)
    if wv.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    hop = sr // FPS; m = len(x) // hop
    rms = np.sqrt((x[:m * hop].reshape(m, hop) ** 2).mean(1)); return rms / (np.percentile(rms, 98) + 1e-6)


def suave(t, a, b):
    if t <= a: return 0.0
    if t >= b: return 1.0
    u = (t - a) / (b - a); return u * u * (3 - 2 * u)


def lerp(a, b, k): return a + (b - a) * k


def teste_pose():
    rig = Rig(CFG); os.makedirs(OUT, exist_ok=True)
    poses = [{'be': ('solto', 10, -6), 'bd': ('solto', -10, 6), 'cab': 'cab_frente'},
             {'be': ('aponta', 70, 10), 'bd': ('solto', -10, 6), 'cab': 'cab_lado', 'incl': 4},
             {'be': ('solto', 10, -6), 'bd': ('palma', -70, -85), 'cab': 'cab_frente_aberta', 'incl': -5},
             {'be': ('palma', 55, 80), 'bd': ('palma', -55, -80), 'cab': 'cab_frente_sorri'}]
    fol = Image.new('RGB', (1600, 520), (60, 60, 80))
    for i, p in enumerate(poses):
        im, _ = rig.desenhar(p, 1.0); im.thumbnail((390, 500)); fol.paste(im, (i * 400 + 5, 10), im)
    fol.save(os.path.join(OUT, 'teste_poses.jpg'))


def render():
    tl = {l['clip']: l for l in json.load(open(os.path.join(VID, 'timeline_vozes.json'), encoding='utf8'))['lines']}
    rig = Rig(CFG); env = envelope()
    bg = Image.open(BG).convert('RGB')
    src = os.path.join(VID, 'VIDEO_FINAL_escala.mp4')
    # trechos do vídeo final: (início, fim) — Josi pergunta + apresentação; e a rotina + a fala da terça
    trechos = [(20.25, 30.3), (48.3, 66.0)]
    falas_josi = [tl['004'], tl['010']]

    # roteiro de poses (tempo do vídeo original) -> pose alvo; interpola entre chaves
    K = [
        (20.25, {'be': ('solto', 10, -6), 'bd': ('solto', -10, 6), 'cab': 'F', 'incl': 0, 'esc': 1.0, 'cx': .5}),
        (20.6, {'be': ('palma', 35, 90), 'bd': ('solto', -10, 6), 'cab': 'F', 'incl': -6, 'esc': 1.0, 'cx': .5}),   # "muda pra mim também?"
        (22.0, {'be': ('palma', 35, 90), 'bd': ('palma', -35, -90), 'cab': 'F', 'incl': 5, 'esc': 1.0, 'cx': .5}),  # "ou só pra quem..."
        (23.5, {'be': ('solto', 10, -6), 'bd': ('solto', -10, 6), 'cab': 'S', 'incl': 0, 'esc': .78, 'cx': .62}),     # "Essa é a Josi" (sorri)
        (25.2, {'be': ('aponta', 70, 10), 'bd': ('solto', -10, 6), 'cab': 'L', 'incl': 3, 'esc': .78, 'cx': .62}),    # aponta o caixa
        (27.6, {'be': ('solto', 10, -6), 'bd': ('solto', -10, 6), 'cab': 'F', 'incl': -3, 'esc': .78, 'cx': .62}),     # "seis por um há onze anos"
        (48.3, {'be': ('solto', 10, -6), 'bd': ('solto', -10, 6), 'cab': 'S', 'incl': 0, 'esc': .9, 'cx': .38}),      # trinta e um anos, Recife
        (50.6, {'be': ('solto', 10, -6), 'bd': ('palma', -25, -100), 'cab': 'S', 'incl': 4, 'esc': .9, 'cx': .38}),     # "com a filha"
        (53.5, {'be': ('solto', 10, -6), 'bd': ('solto', -10, 6), 'cab': 'L', 'incl': 0, 'esc': .9, 'cx': .38}),      # rotina, olha pro lado
        (58.0, {'be': ('aponta', 100, 15), 'bd': ('solto', -10, 6), 'cab': 'L', 'incl': -4, 'esc': .9, 'cx': .38}),  # "Folga: terça"
        (60.4, {'be': ('palma', 40, 85), 'bd': ('solto', -10, 6), 'cab': 'F', 'incl': -4, 'esc': 1.05, 'cx': .5}),  # "Terça é ótima"
        (61.9, {'be': ('aponta', 75, 10), 'bd': ('solto', -10, 6), 'cab': 'F', 'incl': 4, 'esc': 1.05, 'cx': .5}),  # "o banco..."
        (63.2, {'be': ('solto', 10, -6), 'bd': ('aponta', -75, -10), 'cab': 'F', 'incl': -4, 'esc': 1.05, 'cx': .5}),  # "o posto de saúde..."
        (64.4, {'be': ('palma', 70, 85), 'bd': ('palma', -70, -85), 'cab': 'F', 'incl': 0, 'esc': 1.05, 'cx': .5}),  # "só a minha filha..."
    ]
    textos = [(20.6, 23.4, [[('MUDA PRA ', 0), ('MIM?', 1)]], (520, 14, 1265, 150)),
              (24.0, 30.3, [[('JOSI', 1), (', 31', 0)], [('CAIXA HÁ 11 ANOS', 0)]], (560, 14, 1265, 230)),
              (55.0, 60.3, [[('SEG A SÁB', 0)], [('FOLGA: ', 0), ('TERÇA', 1)]], (640, 14, 1265, 230))]

    def pose_em(t):
        a = K[0]
        for k in K:
            if k[0] <= t: a = k
        i = K.index(a); b = K[i + 1] if i + 1 < len(K) else a
        u = suave(t, a[0], a[0] + 0.45)          # transição de 0,45 s para a nova chave
        pa = K[i - 1][1] if i > 0 else a[1]; pb = a[1]
        p = {}
        for lado in ['be', 'bd']:
            nome = pb[lado][0] if u > .5 else pa[lado][0]
            ca = pa[lado][2] if len(pa[lado]) > 2 else 0; cb_ = pb[lado][2] if len(pb[lado]) > 2 else 0
            p[lado] = (nome, lerp(pa[lado][1], pb[lado][1], u), lerp(ca, cb_, u))
        p['incl'] = lerp(pa['incl'], pb['incl'], u); p['esc'] = lerp(pa['esc'], pb['esc'], u); p['cx'] = lerp(pa['cx'], pb['cx'], u)
        p['cabk'] = pb['cab']
        return p

    def quadro(t):
        p = pose_em(t)
        i = int(t * FPS); a = env[i] if i < len(env) else 0
        falando = any(f['start'] <= t <= f['end'] for f in falas_josi)
        ck = p['cabk']
        if ck == 'S': cab = 'cab_frente_sorri'
        elif ck == 'L': cab = 'cab_lado_aberta' if (falando and a > .2) else 'cab_lado'
        else:
            cab = 'cab_frente'
            if falando and a > .45: cab = 'cab_frente_aberta'
            elif falando and a > .15: cab = 'cab_frente_meia'
            elif (t % 3.3) < .13: cab = 'cab_frente_pisca'
        # vida: respiração, balanço de cabeça na fala, braço que acompanha a ênfase
        resp = math.sin(t * 2.2)
        incl = p['incl'] + (2.5 * math.sin(t * 5.1) * a if falando else 0.8 * math.sin(t * 1.1))
        be = (p['be'][0], p['be'][1] + (6 * a if falando else 1.5 * resp), p['be'][2] + (10 * a if falando else 0))
        bd = (p['bd'][0], p['bd'][1] - (6 * a if falando else 1.5 * resp), p['bd'][2] - (10 * a if falando else 0))
        im, _ = rig.desenhar({'be': be, 'bd': bd, 'cab': cab, 'incl': incl, 'cab_dy': -2 * resp}, 1.0)
        # câmera e cenário
        z = 1.04 + 0.03 * suave(t % 10, 0, 10)
        fr = bg.resize((int(W * z), int(H * z)), Image.LANCZOS).crop((0, 0, W, H)).filter(ImageFilter.GaussianBlur(3)).convert('RGBA')
        alt = H * 0.98 * p['esc']; e = alt / im.height
        im = im.resize((int(im.width * e), int(alt)), Image.LANCZOS)
        fr.alpha_composite(im, (int(W * p['cx'] - im.width / 2), int(H - im.height + H * 0.06 + 3 * resp)))
        fr = fr.convert('RGB')
        for a0, a1, ln, area in textos:
            if a0 <= t <= a1:
                lay = titulo(ln, area=area); k = suave(t, a0, a0 + .25)
                if k < 1: lay.putalpha(lay.split()[3].point(lambda v: int(v * k)))
                fr = fr.convert('RGBA'); fr.alpha_composite(lay); fr = fr.convert('RGB')
        return fr

    os.makedirs(OUT, exist_ok=True); partes = []
    for j, (a, b) in enumerate(trechos):
        dst = os.path.join(OUT, f'_parte{j}.mp4'); partes.append(dst)
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-ss', str(a), '-t', str(b - a), '-i', src, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                               '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-shortest', dst], stdin=subprocess.PIPE)
        n = int((b - a) * FPS)
        for f in range(n):
            ff.stdin.write(quadro(a + f / FPS).tobytes())
            if f % 150 == 0: print('trecho', j, 'quadro', f, '/', n, flush=True)
        ff.stdin.close(); ff.wait()
    lst = os.path.join(OUT, '_lista.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in partes))
    fim = os.path.join(OUT, 'PILOTO_PARTES_10.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', fim], check=True)
    for p in partes + [lst]: os.remove(p)
    print('ok', fim)


if __name__ == '__main__':
    {'assets': assets, 'pecas': pecas, 'teste': teste_pose, 'render': render}[sys.argv[1]]()

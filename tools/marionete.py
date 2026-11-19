"""Marionetes: personagens no traço das capas, em PEÇAS, para o motor animar (engine/marionete.js).

Cada marionete fica em viralstick/marionetes/<nome>/ :
  peças PNG (tronco, umero, ante_solto/aponta/palma, quadril, coxa, canela, cab_*) + rig.json (pivôs e escalas)
  _fonte/  -> folhas brutas do Gemini (não vão pro git)

Uso:
  python tools/marionete.py gerar NOME --ref imagem.png --desc "descrição curta da roupa/aparência"
        gera só o que faltar em _fonte (tronco, braços, pernas, cabeça de frente + 6 variações). ~10 imagens, ~US$ 1,30.
  python tools/marionete.py pecas NOME     recorta as peças, escreve rig.json (se não existir) e a folha de conferência
  python tools/marionete.py cenario PROJETO NOME "descrição"   gera um cenário pintado (sem texto) em viralstick/projects/PROJETO/cenarios/NOME.png
"""
import argparse, io, json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemini_chave import ler_chave

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VS = os.path.join(BASE, 'viralstick')
MODELO = 'gemini-3-pro-image'
ESTILO_REF = os.path.join(BASE, '10 - Escala 6x1', 'publicacao', 'capa_ia', 'ilustra_A_1.png')   # traço das capas, sem texto
ALT_MAX = 1000   # altura máxima de cada peça salva (px)

VERDE = ("on a perfectly flat pure green (#00FF00) background, no shadows, "
         "in EXACTLY the same cartoon style and colors as the character in the reference image (thick black outlines, flat colors). ")


def pedidos(desc):
    return {
        'base': ("Single character on a perfectly flat pure green (#00FF00) background, nothing else, chest-up portrait facing the viewer, "
                 "centered, occupying 85% of the image height, in EXACTLY the art style of the reference illustration (thick black outlines, "
                 "flat saturated colors, round cartoon head with big expressive eyes). Character: " + desc + " Neutral expression, mouth closed."),
        'corpo': ("Cutout-animation parts sheet for the character in the reference image, " + VERDE +
                  "Draw ONLY: on the LEFT half, the TORSO from the front, from the waist up, WITHOUT head and WITHOUT arms (neck stump on top, "
                  "shoulders with short sleeves ending in open holes, cut flat at the waist); on the RIGHT half, nothing. No head anywhere."),
        'bracos': ("Cutout-animation ARM parts for the character in the reference image, " + VERDE +
                   "Draw ONLY these 4 separate bare-arm pieces in a single row from left to right, each drawn VERTICALLY (joint end at the TOP), "
                   "with LARGE green gaps, nothing touching: (1) an UPPER ARM only (shoulder to elbow, rounded ends, no hand); "
                   "(2) a FOREARM with a RELAXED hand; (3) a FOREARM with a POINTING hand (index finger straight down in line with the forearm); "
                   "(4) a FOREARM with an OPEN PALM facing the viewer, fingers spread pointing down. Same thickness and skin color for all."),
        'pernas': ("Cutout-animation LEG parts for the character in the reference image, " + VERDE +
                   "Use the pants and shoes that fit the character (" + desc + "). Draw ONLY these 3 separate pieces in a single row from left to "
                   "right, front view, with LARGE green gaps, nothing touching: (1) the HIPS: pants from the waist down to the crotch only, like "
                   "shorts with no legs, flat top edge, about as wide as the waist of the torso; (2) a THIGH: one pants leg from hip to knee, "
                   "drawn vertically, rounded ends; (3) a LOWER LEG: one pants leg from knee down to the shoe, the shoe seen from the front, drawn "
                   "vertically with the knee at the TOP. Same pants color in all pieces."),
        'cab_frente': ("Only the HEAD of the character in the reference image, with the neck, facing the viewer straight from the front, " + VERDE +
                       "Centered, large. Neutral calm expression, mouth CLOSED, eyes open."),
    }


EDICOES = {
    'cab_frente_meia': ('cab_frente', "Edit: keep EVERYTHING identical (head, hair, eyes, colors, green background, framing, size) and only make the mouth SLIGHTLY OPEN, talking."),
    'cab_frente_aberta': ('cab_frente', "Edit: keep EVERYTHING identical (head, hair, eyes, colors, green background, framing, size) and only make the mouth WIDE OPEN, talking ('ah')."),
    'cab_frente_pisca': ('cab_frente', "Edit: keep EVERYTHING identical (head, hair, mouth, colors, green background, framing, size) and only CLOSE the eyes (blink)."),
    'cab_frente_sorri': ('cab_frente', "Edit: keep EVERYTHING identical (head, hair, colors, green background, framing, size) and change the expression to a big happy smile, mouth closed, eyes squinting happily."),
    'cab_lado': ('cab_frente', "Edit: keep the SAME head, same hair color and style, same accessories, same colors, same green background and same size, but turn the head THREE-QUARTERS to the viewer's LEFT (looking toward the left side), mouth closed with a slight smile."),
    'cab_lado_aberta': ('cab_lado', "Edit: keep EVERYTHING identical (head angle, hair, eyes, colors, green background, framing, size) and only make the mouth OPEN, talking."),
}


def cli():
    from google import genai
    return genai.Client(api_key=ler_chave())


def pedir(c, partes, aspect='1:1'):
    from google.genai import types
    r = c.models.generate_content(model=MODELO, contents=partes, config=types.GenerateContentConfig(
        response_modalities=['IMAGE'], image_config=types.ImageConfig(aspect_ratio=aspect, image_size='2K')))
    for p in r.candidates[0].content.parts:
        if p.inline_data and p.inline_data.data:
            return Image.open(io.BytesIO(p.inline_data.data)).convert('RGB')
    raise RuntimeError('sem imagem')


def gerar(nome, ref, desc):
    fonte = os.path.join(VS, 'marionetes', nome, '_fonte'); os.makedirs(fonte, exist_ok=True)
    c = cli(); estilo = Image.open(ESTILO_REF)
    P = pedidos(desc); f = lambda n: os.path.join(fonte, n + '.png')
    if not os.path.exists(f('base')):
        r = Image.open(ref).convert('RGBA'); fundo = Image.new('RGBA', r.size, (255, 255, 255, 255)); r = Image.alpha_composite(fundo, r).convert('RGB')
        pedir(c, [estilo, r, P['base']]).save(f('base')); print('ok base')
    base = Image.open(f('base'))
    for n in ['corpo', 'bracos', 'pernas', 'cab_frente']:
        if os.path.exists(f(n)): continue
        refs = [base] + ([Image.open(f('corpo'))] if n in ('bracos', 'pernas') and os.path.exists(f('corpo')) else [])
        pedir(c, refs + [P[n]], '16:9' if n in ('corpo', 'bracos', 'pernas') else '1:1').save(f(n)); print('ok', n)
    for n, (b, txt) in EDICOES.items():
        if os.path.exists(f(n)): continue
        pedir(c, [Image.open(f(b)), txt]).save(f(n)); print('ok', n)


# ------------------------------------------------------------------ recorte
def alfa(im):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    al = np.clip(255 - ((g - np.maximum(r, b)) - 30) * 5, 0, 255).astype(np.uint8)
    rgb = a.copy(); sp = g > np.maximum(r, b); rgb[..., 1] = np.where(sp, np.maximum(r, b), g)
    return Image.fromarray(np.dstack([rgb.astype(np.uint8), al]), 'RGBA')


def componentes(rgba, minimo=4000):
    from scipy import ndimage
    m = ndimage.binary_closing(np.asarray(rgba)[..., 3] > 128, iterations=3)
    lab, n = ndimage.label(m); out = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        if (lab[sl] == i).sum() < minimo: continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        msk = Image.fromarray(((lab[sl] == i) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
        p = rgba.crop((x0, y0, x1, y1)); p.putalpha(Image.fromarray(np.minimum(np.asarray(p)[..., 3], np.asarray(msk)))); out.append((x0, p))
    return [p for _, p in sorted(out, key=lambda t: t[0])]


def cortar_gola(im):
    """cabeça + pescoço: corta acima da primeira linha (abaixo de 55%) com roupa no centro (cor diferente da pele)."""
    a = np.asarray(im).astype(np.int16); h, w = a.shape[:2]; x0, x1 = int(w * .3), int(w * .7)
    pele = np.median(a[int(h * .5):int(h * .6), int(w * .45):int(w * .55), :3].reshape(-1, 3), axis=0)
    for y in range(int(h * .6), h):
        lin = a[y, x0:x1]; ok = lin[:, 3] > 200
        dif = np.abs(lin[:, :3] - pele).sum(1) > 120
        escuro = lin[:, :3].sum(1) < 120   # contorno preto não conta
        if ((dif & ~escuro & ok).mean()) > .25:
            out = im.crop((0, 0, w, y - int(h * .03))); return out.crop(out.getbbox())
    return im


def salvar(p, dst):
    if p.height > ALT_MAX: p = p.resize((int(p.width * ALT_MAX / p.height), ALT_MAX), Image.LANCZOS)
    p.save(dst, optimize=True)


RIG_PADRAO = {   # pivôs relativos à peça do tronco (0..1); ajuste no rig.json de cada marionete se precisar
    'ombro_e': [0.22, 0.36], 'ombro_d': [0.80, 0.34], 'pescoco': [0.5, 0.15], 'quadril': [0.5, 0.97],
    'umero': 0.36, 'cotovelo': 0.84, 'cabeca': 0.66, 'quadril_larg': 0.80, 'coxa': 0.42, 'joelho': 0.86, 'perna_dx': 0.17,
}


def pecas(nome):
    pasta = os.path.join(VS, 'marionetes', nome); fonte = os.path.join(pasta, '_fonte')
    f = lambda n: Image.open(os.path.join(fonte, n + '.png'))
    corpo = componentes(alfa(f('corpo'))); salvar(max(corpo, key=lambda p: p.width * p.height), os.path.join(pasta, 'tronco.png'))
    b = componentes(alfa(f('bracos'))); print('braço:', [p.size for p in b])
    for n, p in zip(['umero', 'ante_solto', 'ante_aponta', 'ante_palma'], b):
        if n.startswith('ante') and p.height > b[0].height * 1.5:   # veio o braço inteiro: fica do cotovelo pra baixo
            p = p.crop((0, int(p.height * .38), p.width, p.height)); p = p.crop(p.getbbox())
        salvar(p, os.path.join(pasta, n + '.png'))
    if os.path.exists(os.path.join(fonte, 'pernas.png')):
        pe = componentes(alfa(f('pernas'))); print('pernas:', [p.size for p in pe])
        for n, p in zip(['quadril', 'coxa', 'canela'], pe): salvar(p, os.path.join(pasta, n + '.png'))
    for n in ['cab_frente'] + list(EDICOES):
        c = max(componentes(alfa(f(n))), key=lambda p: p.width * p.height); salvar(cortar_gola(c), os.path.join(pasta, n + '.png'))
    rj = os.path.join(pasta, 'rig.json')
    if not os.path.exists(rj): json.dump(RIG_PADRAO, open(rj, 'w'), indent=1)
    fs = sorted(x for x in os.listdir(pasta) if x.endswith('.png'))
    fol = Image.new('RGB', (200 * len(fs), 290), (90, 90, 120)); d = ImageDraw.Draw(fol)
    for i, x in enumerate(fs):
        im = Image.open(os.path.join(pasta, x)); im.thumbnail((190, 250)); fol.paste(im, (i * 200 + 5, 5), im); d.text((i * 200 + 5, 270), x[:-4], fill=(255, 255, 255))
    fol.save(os.path.join(fonte, 'folha_pecas.jpg')); print('peças:', fs)


def cenario(projeto, nome, desc):
    pasta = os.path.join(VS, 'projects', projeto, 'cenarios'); os.makedirs(pasta, exist_ok=True)
    txt = ("16:9 wide background illustration in EXACTLY the art style of the reference image (bright saturated cartoon colors, thick black "
           "outlines, soft warm light). Do NOT write any text or letters. No logos of real brands. No main characters in the foreground "
           "(the main character will be added later): " + desc)
    im = pedir(cli(), [Image.open(ESTILO_REF), txt], '16:9')
    im = im.resize((1920, int(1920 * im.height / im.width)), Image.LANCZOS)
    dst = os.path.join(pasta, nome + '.jpg'); im.save(dst, quality=90); print('ok', dst)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('acao'); ap.add_argument('args', nargs='*')
    ap.add_argument('--ref'); ap.add_argument('--desc', default='')
    a = ap.parse_args()
    if a.acao == 'gerar': gerar(a.args[0], a.ref, a.desc)
    elif a.acao == 'pecas': pecas(a.args[0])
    elif a.acao == 'cenario': cenario(*a.args)

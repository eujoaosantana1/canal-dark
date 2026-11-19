"""PILOTO (opção 2): abertura do vídeo 10 (0 a 30,4 s) no estilo das capas novas.

Cenários pintados pelo Gemini (sem texto) + Josi desenhada no mesmo traço em fundo verde,
com variações de boca e olho geradas por edição da mesma imagem. A animação é feita aqui:
câmera (zoom/pan), boca pela amplitude da voz, piscada, respiração, textos com pop.
Áudio: o mix final do VIDEO_FINAL_escala.mp4 (mesmo trecho).

Uso:  python tools/piloto_animacao_ia.py assets   (gera o que faltar em pilotos/10_ia/assets)
      python tools/piloto_animacao_ia.py render   (gera pilotos/10_ia/PILOTO_IA_10.mp4)
"""
import io, json, math, os, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemini_chave import ler_chave
from capas_ia import titulo, REF

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VID = os.path.join(BASE, '10 - Escala 6x1')
OUT = os.path.join(BASE, 'pilotos', '10_ia'); AS = os.path.join(OUT, 'assets')
MODELO = 'gemini-3-pro-image'
W, H, FPS = 1280, 720, 30
T0, T1 = 0.0, 30.45

ESTILO = ("Bright, saturated cartoon illustration in EXACTLY the art style of the first reference image: thick black outlines, "
          "simple round-headed cartoon people with big expressive eyes, warm colors, soft gradients. No photorealism. "
          "Do NOT write any text, captions or letters anywhere unless explicitly asked. No logos of real brands. ")

JOSI_DESC = ("Josi: 31-year-old Brazilian supermarket cashier, brown skin, black hair tied in a round bun, small earrings, "
             "red cashier uniform polo with white collar and a small ID badge (like the second reference, but drawn in the art style of the first).")

CENARIOS = {
    'bg_rua': ("16:9 wide background. A Brazilian city street in Recife at dawn (6 a.m.), pink-orange sky, a crowded bus stop, a long queue of "
               "sleepy workers in uniforms (cashier, security guard, cook, cleaner, mechanic) waiting for a bus that is arriving, street vendor "
               "with coffee thermos, colorful low buildings, power lines. Rich detail, wide composition."),
    'bg_multidao': ("16:9 wide background, seen from slightly above: a HUGE crowd of hundreds of Brazilian workers in many different uniforms "
                    "(supermarket cashiers, waiters, cooks, security guards, pharmacy clerks, nurses) filling a wide avenue toward the horizon, "
                    "late-afternoon golden light. Keep the upper 35% of the image as sky with a few clouds (a big number will be placed there)."),
    'bg_congresso': ("16:9 wide background. A modernist government building complex in Brasília at sunset: two tall twin towers between two "
                     "large bowl-shaped domes (one facing up, one facing down), reflecting pool, purple-orange sky, confetti and paper "
                     "documents flying in the air as if celebrating. Keep the upper 40% of the image as sky (text will go there)."),
    'bg_mercado': ("16:9 wide background. Inside a bright neighborhood supermarket in Recife: aisles with colorful shelves of products "
                   "(generic packages without brand names), a row of checkout counters with conveyor belts in the foreground, the nearest "
                   "checkout counter in the LEFT-CENTER is EMPTY (no cashier), a few customers with shopping baskets in the back, a clock on the wall."),
    'bg_mercado_josi': ("16:9 wide shot. Inside a bright neighborhood supermarket in Recife: aisles with colorful shelves of generic products, a row of "
                        "checkout counters. At the nearest checkout counter, on the RIGHT third, " + JOSI_DESC + " She scans a product with a polite, "
                        "tired smile, a line of 5 customers with baskets waiting. Leave the upper-left area as the plain upper wall (text goes there)."),
}

JOSI_BASE = ("Single character on a perfectly flat pure green (#00FF00) background, nothing else in the image, no shadow on the background. "
             "Chest-up portrait, facing the viewer at three-quarter angle, centered, occupying about 85% of the image height: " + JOSI_DESC +
             " Expression: slightly worried, eyebrows raised, asking a question. Mouth CLOSED. Eyes open.")
JOSI_EDITS = {
    'josi_boca_meia': "Edit this image: keep EVERYTHING identical (pose, hair, clothes, eyes, colors, background, framing) and only change the mouth to SLIGHTLY OPEN, talking.",
    'josi_boca_aberta': "Edit this image: keep EVERYTHING identical (pose, hair, clothes, eyes, colors, background, framing) and only change the mouth to WIDE OPEN, talking (saying 'ah').",
    'josi_pisca': "Edit this image: keep EVERYTHING identical (pose, hair, clothes, mouth, colors, background, framing) and only CLOSE the eyes (a blink, eyelids down).",
}


def cliente():
    from google import genai
    return genai.Client(api_key=ler_chave())


def pedir(cli, partes, aspect):
    from google.genai import types
    r = cli.models.generate_content(model=MODELO, contents=partes, config=types.GenerateContentConfig(
        response_modalities=['IMAGE'], image_config=types.ImageConfig(aspect_ratio=aspect, image_size='2K')))
    for p in r.candidates[0].content.parts:
        if p.inline_data and p.inline_data.data:
            return Image.open(io.BytesIO(p.inline_data.data)).convert('RGB')
    raise RuntimeError('sem imagem')


# referência de estilo SEM texto (ilustração da capa A do 10), para o modelo não copiar o título da capa modelo
REF_SEM_TEXTO = os.path.join(VID, 'publicacao', 'capa_ia', 'ilustra_A_1.png')


def assets():
    os.makedirs(AS, exist_ok=True); cli = cliente(); ref = Image.open(REF_SEM_TEXTO)
    josi_ref = Image.open(os.path.join(VID, 'publicacao', 'capa_assets', 'josi_cansada.png')).convert('RGBA')
    fundo = Image.new('RGBA', josi_ref.size, (255, 255, 255, 255)); josi_ref = Image.alpha_composite(fundo, josi_ref).convert('RGB')
    for nome, cena in CENARIOS.items():
        f = os.path.join(AS, nome + '.png')
        if os.path.exists(f): continue
        partes = [ref] + ([josi_ref] if 'josi' in nome else []) + [ESTILO + cena]
        pedir(cli, partes, '16:9').save(f); print('ok', nome)
    fb = os.path.join(AS, 'josi_base.png')
    if not os.path.exists(fb):
        pedir(cli, [ref, josi_ref, ESTILO + JOSI_BASE], '1:1').save(fb); print('ok josi_base')
    base = Image.open(fb)
    for nome, ed in JOSI_EDITS.items():
        f = os.path.join(AS, nome + '.png')
        if os.path.exists(f): continue
        pedir(cli, [base, ed], '1:1').save(f); print('ok', nome)


# ------------------------------------------------------------------ render
def chroma(im):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    verde = (g - np.maximum(r, b))
    alpha = np.clip(255 - (verde - 40) * 4, 0, 255).astype(np.uint8)
    a2 = a.copy(); spill = g > np.maximum(r, b); a2[..., 1] = np.where(spill, np.maximum(r, b), g)
    out = np.dstack([a2.astype(np.uint8), alpha])
    o = Image.fromarray(out, 'RGBA')
    bb = o.getbbox(); return o.crop(bb) if bb else o


def carregar_bg(n):
    return Image.open(os.path.join(AS, n + '.png')).convert('RGB')


def camera(bg, t, d, z0, z1, cx0=.5, cy0=.5, cx1=.5, cy1=.5):
    """recorte animado (zoom/pan) suave."""
    e = 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, t / d)))
    z = z0 + (z1 - z0) * e; cx = cx0 + (cx1 - cx0) * e; cy = cy0 + (cy1 - cy0) * e
    w, h = bg.size; cw, ch = w / z, h / z
    x = min(max(0, cx * w - cw / 2), w - cw); y = min(max(0, cy * h - ch / 2), h - ch)
    return bg.resize((W, H), Image.LANCZOS, box=(x, y, x + cw, y + ch))


def pop(t, t_in, dur=.35):
    """escala do 'pop' de entrada (overshoot)."""
    if t < t_in: return 0
    u = min(1, (t - t_in) / dur)
    return 1 + 0.25 * math.sin(u * math.pi) * (1 - u) if u >= 0.6 else u / 0.6 * 1.1


def colar_texto(fr, linhas, t, t_in, area):
    s = pop(t, t_in)
    if s <= 0: return fr
    lay = titulo(linhas, area=area)
    if abs(s - 1) > .01:
        x0, y0, x1, y1 = area; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        lw, lh = int(W * s), int(H * s)
        big = lay.resize((max(1, lw), max(1, lh)), Image.LANCZOS)
        lay = Image.new('RGBA', (W, H)); lay.alpha_composite(big, (int(cx - cx * s), int(cy - cy * s)))
    fr = fr.convert('RGBA'); fr.alpha_composite(lay); return fr.convert('RGB')


def envelope():
    """amplitude da voz (voiceover.wav, sem música) por quadro."""
    wv = wave.open(os.path.join(VID, 'voiceover.wav')); sr = wv.getframerate(); n = wv.getnframes()
    x = np.frombuffer(wv.readframes(n), dtype=np.int16).astype(np.float32)
    if wv.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    hop = sr // FPS; m = len(x) // hop
    rms = np.sqrt((x[:m * hop].reshape(m, hop) ** 2).mean(1)); rms /= (np.percentile(rms, 98) + 1e-6)
    return rms


def render():
    tl = {l['clip']: l for l in json.load(open(os.path.join(VID, 'timeline_vozes.json'), encoding='utf8'))['lines']}
    bgs = {n: carregar_bg(n) for n in CENARIOS}
    josi = {k: chroma(Image.open(os.path.join(AS, k + '.png'))) for k in ['josi_base', 'josi_boca_meia', 'josi_boca_aberta', 'josi_pisca']}
    alt = 640; js = {k: v.resize((int(v.width * alt / v.height), alt), Image.LANCZOS) for k, v in josi.items()}
    mercado_blur = bgs['bg_mercado'].resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(6))
    env = envelope()
    c004 = tl['004']

    # (início, fim, função) em segundos do vídeo
    def c1(t):  # rua de madrugada
        return camera(bgs['bg_rua'], t, 7.1, 1.0, 1.18, .5, .55, .6, .5)

    def c2(t):  # multidão + contador
        fr = camera(bgs['bg_multidao'], t - 7.1, 7.5, 1.15, 1.0, .5, .6, .5, .5)
        u = min(1, max(0, (t - 7.6) / 3.0)); v = 14.8 * (1 - (1 - u) ** 3)
        fr = colar_texto(fr, [[(f'{v:,.1f}'.replace('.', ','), 1)], [('MILHÕES NA 6x1', 0)]], t, 7.6, (200, 14, 1080, 260))
        return fr

    def c3(t):  # congresso
        fr = camera(bgs['bg_congresso'], t - 14.6, 5.8, 1.0, 1.12, .5, .5, .5, .45)
        fr = colar_texto(fr, [[('CONGRESSO', 0)], [('APROVA O ', 0), ('FIM DA 6x1', 1)]], t, 15.2, (120, 14, 1160, 250))
        return fr

    def c4(t):  # Josi fala (close com boca)
        fr = Image.new('RGB', (W, H)); z = 1 + 0.04 * (t - 20.4) / 3.4
        fr.paste(mercado_blur.resize((int(W * z), int(H * z))).crop((0, 0, W, H)))
        i = int(t * FPS); a = env[i] if i < len(env) else 0
        falando = c004['start'] <= t <= c004['end']
        k = 'josi_base'
        if falando and a > .45: k = 'josi_boca_aberta'
        elif falando and a > .15: k = 'josi_boca_meia'
        if (t % 3.1) < .12 and not (falando and a > .15): k = 'josi_pisca'
        sp = js[k]
        resp = 1 + 0.012 * math.sin(t * 2.4); ang = 1.5 * math.sin(t * 1.3)
        sp2 = sp.resize((int(sp.width * resp), int(sp.height * resp)), Image.LANCZOS).rotate(ang, resample=Image.BICUBIC, expand=True)
        fr = fr.convert('RGBA'); fr.alpha_composite(sp2, (int(W * .5 - sp2.width / 2), H - sp2.height + 30))
        fr = colar_texto(fr.convert('RGB'), [[('MUDA PRA ', 0), ('MIM?', 1)]], t, c004['start'] + .2, (60, 14, 1220, 150))
        return fr

    def c5(t):  # Josi no caixa (plano aberto)
        fr = camera(bgs['bg_mercado_josi'], t - 23.6, 6.9, 1.0, 1.25, .5, .5, .68, .55)
        fr = colar_texto(fr, [[('JOSI', 1)], [('CAIXA HÁ 11 ANOS', 0)]], t, 24.2, (40, 14, 700, 230))
        return fr

    cenas = [(0, 7.1, c1), (7.1, 14.6, c2), (14.6, 20.2, c3), (20.2, 23.6, c4), (23.6, T1, c5)]
    os.makedirs(OUT, exist_ok=True); dst = os.path.join(OUT, 'PILOTO_IA_10.mp4')
    src = os.path.join(VID, 'VIDEO_FINAL_escala.mp4')
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-ss', str(T0), '-t', str(T1 - T0), '-i', src, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                           '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-shortest', dst], stdin=subprocess.PIPE)
    n = int((T1 - T0) * FPS); ant = None
    for f in range(n):
        t = T0 + f / FPS
        for a, b, fn in cenas:
            if a <= t < b: fr = fn(t); break
        # corte com flash curto entre cenas
        for a, b, fn in cenas[1:]:
            if 0 <= t - a < .12: fr = Image.blend(fr, Image.new('RGB', (W, H), (255, 255, 255)), .5 * (1 - (t - a) / .12))
        ff.stdin.write(fr.tobytes())
        if f % 150 == 0: print('quadro', f, '/', n, flush=True)
    ff.stdin.close(); ff.wait(); print('ok', dst)


if __name__ == '__main__':
    {'assets': assets, 'render': render}[sys.argv[1]]()

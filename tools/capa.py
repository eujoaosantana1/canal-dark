"""Agente Designer - gera capas 1280x720 a partir de quadros do proprio video.

Uso: python capa.py spec.json video.mp4 pasta_saida fonte.ttf
spec.json: lista de capas:
  {"nome": "A", "t": 20.0,  (ou "img": "quadro.png" no lugar de "t", para cenas renderizadas antes do video final)
   "zoom": 1.0, "foco": [0.5, 0.5],
   "textos": [{"txt": "SO DE IMPOSTO", "x": 0.5, "y": 0.85, "tam": 120,
               "cor": "#FFE14D", "borda": "#000000", "fundo": null, "ancora": "mm", "giro": 0}],
   "seta": [x1, y1, x2, y2]  (opcional, em fracao da tela),
   "escurecer": 0.0}
"""
import json, subprocess, sys, os, math
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

W, H = 1280, 720


def quadro(video, t):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", video, "-frames:v", "1",
                          "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
    from io import BytesIO
    return Image.open(BytesIO(raw)).convert("RGB")


def fonte(path, tam):
    f = ImageFont.truetype(path, tam)
    try:
        f.set_variation_by_name("Bold")
    except Exception:
        pass
    return f


def seta(d, x1, y1, x2, y2, cor="#FF2D2D", larg=22):
    d.line([(x1, y1), (x2, y2)], fill="black", width=larg + 12)
    d.line([(x1, y1), (x2, y2)], fill=cor, width=larg)
    ang = math.atan2(y2 - y1, x2 - x1)
    L = larg * 3.2
    pts = [(x2 + math.cos(ang) * larg, y2 + math.sin(ang) * larg),
           (x2 - L * math.cos(ang - 0.55), y2 - L * math.sin(ang - 0.55)),
           (x2 - L * math.cos(ang + 0.55), y2 - L * math.sin(ang + 0.55))]
    d.polygon(pts, fill=cor, outline="black", width=6)


def gerar(spec, video, saida, font):
    os.makedirs(saida, exist_ok=True)
    feitos = []
    for c in spec:
        im = Image.open(c["img"]).convert("RGB") if c.get("img") else quadro(video, c["t"])
        z = c.get("zoom", 1.0)
        if z > 1:
            fx, fy = c.get("foco", [0.5, 0.5])
            w, h = im.width / z, im.height / z
            x0 = min(max(fx * im.width - w / 2, 0), im.width - w)
            y0 = min(max(fy * im.height - h / 2, 0), im.height - h)
            im = im.crop((int(x0), int(y0), int(x0 + w), int(y0 + h)))
        im = im.resize((W, H), Image.LANCZOS)
        im = ImageEnhance.Color(im).enhance(c.get("saturacao", 1.25))
        im = ImageEnhance.Contrast(im).enhance(1.08)
        if c.get("escurecer"):
            im = Image.blend(im, Image.new("RGB", im.size, "black"), c["escurecer"])
        d = ImageDraw.Draw(im)
        if c.get("seta"):
            x1, y1, x2, y2 = c["seta"]
            seta(d, x1 * W, y1 * H, x2 * W, y2 * H)
        for t in c.get("textos", []):
            f = fonte(font, t.get("tam", 110))
            camada = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            dl = ImageDraw.Draw(camada)
            x, y = t["x"] * W, t["y"] * H
            anc = t.get("ancora", "mm")
            if t.get("fundo"):
                bb = dl.textbbox((x, y), t["txt"], font=f, anchor=anc, stroke_width=0)
                p = int(t.get("tam", 110) * 0.18)
                dl.rounded_rectangle([bb[0] - p, bb[1] - p, bb[2] + p, bb[3] + p], radius=p, fill=t["fundo"],
                                     outline="black", width=6)
            dl.text((x, y), t["txt"], font=f, anchor=anc, fill=t.get("cor", "#FFFFFF"),
                    stroke_width=t.get("esp", max(6, t.get("tam", 110) // 11)), stroke_fill=t.get("borda", "black"))
            if t.get("giro"):
                camada = camada.rotate(t["giro"], center=(x, y), resample=Image.BICUBIC)
            im.paste(camada, (0, 0), camada)
        out = os.path.join(saida, f"capa_{c['nome']}.jpg")
        im.save(out, quality=92)
        feitos.append(out)
    # folha de comparacao, como aparece no YouTube (pequena)
    folha = Image.new("RGB", (3 * 400 + 40, 260), "white")
    for i, f in enumerate(feitos[:3]):
        folha.paste(Image.open(f).resize((384, 216)), (10 + i * 405, 22))
    folha.save(os.path.join(saida, "comparacao_capas.jpg"), quality=90)
    return feitos


if __name__ == "__main__":
    spec = json.load(open(sys.argv[1], encoding="utf-8"))
    print(gerar(spec, sys.argv[2], sys.argv[3], sys.argv[4]))

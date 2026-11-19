"""Agente Estrategista - Repartição do Universo
Pesquisa no YouTube (API de dados v3) quais temas e canais estão rendendo
visualizações, e destaca os "fora da curva": vídeos com muito mais views do
que o tamanho do canal faria esperar.

Uso (na pasta Canal Dark):
  python tools\\estrategista.py temas  "conta de luz" "salário mínimo" ...
  python tools\\estrategista.py canais                       (usa a lista NICHO abaixo)
  python tools\\estrategista.py canais "história animada" "e se o brasil"
  python tools\\estrategista.py radar US BR      (canais NOVOS que já bombam: nichos pouco explorados)
  python tools\\estrategista.py radar US BR --sem-buscas   (só "Em alta", gasta quase nada de cota)
  (o radar ignora Shorts; para incluir, acrescente --shorts)
Opções:
  --dias 90        só vídeos publicados nos últimos N dias (padrão 120)
  --max 25         vídeos por busca (máx. 50; padrão 25)
  --duracao any|short|medium|long   (padrão medium = 4 a 20 min)
  --regiao US --idioma en     outro mercado (ex.: MX/es, ES/es, US/en); padrão BR/pt

Saída: pasta estrategia\\ com relatorio_<modo>_<data>.html e .csv
Chave: arquivo chave_youtube.txt na raiz do canal (NUNCA vai para o GitHub).
Custo de cota: cada busca = 100 unidades; limite grátis = 10.000/dia (~90 buscas).
Só usa a biblioteca padrão do Python.
"""
import sys, os, json, csv, math, statistics, datetime as dt, urllib.parse, urllib.request, html

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://www.googleapis.com/youtube/v3/"
REGIAO, IDIOMA = "BR", "pt"   # mude com --regiao US --idioma en

# Termos padrão para descobrir canais parecidos com o nosso
NICHO = [
    "história animada", "desenho animado brasileiro", "animação boneco palito",
    "e se o brasil", "e se acontecesse", "animação curiosidades brasil",
    "quanto custa viver no brasil animação", "história do trabalhador animação",
    "stickman animação", "meu brasil animado",
]


def ler_chave():
    for nome in ("chave_youtube.txt", os.path.join("chave_youtube.txt", "chave_youtube.txt.txt")):
        p = os.path.join(RAIZ, nome)
        if os.path.isfile(p):
            return open(p, encoding="utf-8").read().strip()
    sys.exit("Falta a chave: crie chave_youtube.txt na pasta Canal Dark (veja LEIA-ME_ESTRATEGISTA.txt).")


def get(endpoint, **params):
    params["key"] = CHAVE
    url = API + endpoint + "?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        corpo = e.read().decode("utf-8", "ignore")
        if "quotaExceeded" in corpo:
            sys.exit("Cota diária da API do YouTube esgotada. Tente amanhã (renova à meia-noite do Pacífico, ~5h em Brasília).")
        sys.exit(f"Erro da API do YouTube ({e.code}): {corpo[:400]}")


def lotes(xs, n=50):
    for i in range(0, len(xs), n):
        yield xs[i:i + n]


def iso_dur(s):
    # PT1H2M3S -> segundos
    import re
    m = re.match(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    if not m:
        return 0
    d, h, mi, se = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + se


def buscar(termo, dias, maximo, duracao):
    depois = (dt.datetime.now(dt.timezone.utc).replace(tzinfo=None) - dt.timedelta(days=dias)).strftime("%Y-%m-%dT%H:%M:%SZ")
    p = dict(part="snippet", q=termo, type="video", maxResults=min(maximo, 50), order="viewCount",
             regionCode=REGIAO, relevanceLanguage=IDIOMA, publishedAfter=depois)
    if duracao != "any":
        p["videoDuration"] = duracao
    return [it["id"]["videoId"] for it in get("search", **p).get("items", [])]


def detalhes(ids_videos):
    vids = {}
    for lote in lotes(list(dict.fromkeys(ids_videos))):
        for it in get("videos", part="snippet,statistics,contentDetails", id=",".join(lote)).get("items", []):
            vids[it["id"]] = it
    canais = {}
    ids_c = list({v["snippet"]["channelId"] for v in vids.values()})
    for lote in lotes(ids_c):
        for it in get("channels", part="snippet,statistics", id=",".join(lote)).get("items", []):
            canais[it["id"]] = it
    return vids, canais


def linha(v, canais, termo):
    s, st = v["snippet"], v.get("statistics", {})
    c = canais.get(s["channelId"], {})
    cst = c.get("statistics", {})
    views = int(st.get("viewCount", 0))
    subs = int(cst.get("subscriberCount", 0)) if not cst.get("hiddenSubscriberCount") else 0
    pub = dt.datetime.strptime(s["publishedAt"][:19], "%Y-%m-%dT%H:%M:%S")
    dias = max((dt.datetime.now(dt.timezone.utc).replace(tzinfo=None) - pub).days, 1)
    return {
        "termo": termo, "titulo": s["title"], "canal": s["channelTitle"], "canal_id": s["channelId"],
        "video_id": v["id"], "publicado": pub.strftime("%d/%m/%Y"), "dias": dias,
        "duracao_min": round(iso_dur(v.get("contentDetails", {}).get("duration")) / 60, 1),
        "views": views, "views_dia": round(views / dias), "likes": int(st.get("likes", st.get("likeCount", 0)) or 0),
        "comentarios": int(st.get("commentCount", 0) or 0), "inscritos": subs,
        "videos_canal": int(cst.get("videoCount", 0) or 0),
        # quanto o vídeo rendeu em relação ao tamanho do canal (mín. 1.000 inscritos para não explodir)
        "fora_da_curva": round(views / max(subs, 1000), 1),
        "url": f"https://youtu.be/{v['id']}",
        "thumb": s.get("thumbnails", {}).get("medium", {}).get("url", ""),
    }


def fmt(n):
    n = float(n)
    for lim, suf in ((1e9, " bi"), (1e6, " mi"), (1e3, " mil")):
        if n >= lim:
            return f"{n / lim:.1f}".replace(".", ",").replace(",0", "") + suf
    return str(int(n))


def resumo_temas(linhas):
    por = {}
    for l in linhas:
        por.setdefault(l["termo"], []).append(l)
    out = []
    for termo, ls in por.items():
        views = [l["views"] for l in ls]
        pequenos = [l for l in ls if l["inscritos"] < 50000 and l["views"] >= 50000]
        out.append({
            "termo": termo, "videos": len(ls), "mediana_views": int(statistics.median(views)) if views else 0,
            "top_views": max(views) if views else 0,
            "canais_pequenos_bombando": len(pequenos),
            "nota": round(math.log10(max(statistics.median(views), 1)) * 10 + len(pequenos) * 5, 1),
        })
    return sorted(out, key=lambda r: -r["nota"])


def resumo_canais(linhas):
    por = {}
    for l in linhas:
        por.setdefault(l["canal_id"], []).append(l)
    out = []
    for cid, ls in por.items():
        views = [l["views"] for l in ls]
        out.append({
            "canal": ls[0]["canal"], "url": f"https://www.youtube.com/channel/{cid}", "inscritos": ls[0]["inscritos"],
            "videos_canal": ls[0]["videos_canal"], "videos_achados": len(ls),
            "mediana_views": int(statistics.median(views)), "melhor_video": max(ls, key=lambda x: x["views"])["titulo"],
            "melhor_views": max(views), "fora_da_curva": round(statistics.median(views) / max(ls[0]["inscritos"], 1000), 1),
        })
    return sorted(out, key=lambda r: (-r["fora_da_curva"], -r["mediana_views"]))


def html_relatorio(modo, termos, linhas, resumo, destino):
    e = html.escape
    hoje = dt.datetime.now().strftime("%d/%m/%Y %H:%M")
    css = ("body{font-family:Segoe UI,Arial,sans-serif;margin:24px;color:#222;max-width:1200px}"
           "h1{color:#5e35b1}table{border-collapse:collapse;width:100%;margin:12px 0 28px}"
           "th,td{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left;font-size:14px;vertical-align:top}"
           "th{background:#ede7f6}td.n{text-align:right;white-space:nowrap}.hot{background:#fff3cd}"
           "img{width:160px;border-radius:6px}.tag{font-size:12px;color:#666}")
    p = [f"<html><head><meta charset='utf-8'><title>Estrategista - {modo}</title><style>{css}</style></head><body>",
         f"<h1>Estrategista — {'temas' if modo == 'temas' else 'canais parecidos'}</h1>",
         f"<p class=tag>Gerado em {hoje}. Buscas: {e(', '.join(termos))}. "
         "\"Fora da curva\" = views ÷ inscritos do canal (quanto maior, mais o vídeo rendeu além do tamanho do canal).</p>"]
    if modo == "temas":
        p.append("<h2>Ranking de temas</h2><table><tr><th>Tema</th><th>Mediana de views</th><th>Maior</th>"
                 "<th>Canais pequenos (&lt;50 mil) com +50 mil views</th><th>Nota</th></tr>")
        for r in resumo:
            p.append(f"<tr><td>{e(r['termo'])}</td><td class=n>{fmt(r['mediana_views'])}</td><td class=n>{fmt(r['top_views'])}</td>"
                     f"<td class=n>{r['canais_pequenos_bombando']}</td><td class=n>{r['nota']}</td></tr>")
    else:
        p.append("<h2>Canais encontrados</h2><table><tr><th>Canal</th><th>Inscritos</th><th>Vídeos achados</th>"
                 "<th>Mediana de views</th><th>Fora da curva</th><th>Melhor vídeo</th></tr>")
        for r in resumo[:60]:
            hot = " class=hot" if r["fora_da_curva"] >= 3 else ""
            p.append(f"<tr{hot}><td><a href='{r['url']}'>{e(r['canal'])}</a></td><td class=n>{fmt(r['inscritos'])}</td>"
                     f"<td class=n>{r['videos_achados']}</td><td class=n>{fmt(r['mediana_views'])}</td><td class=n>{r['fora_da_curva']}x</td>"
                     f"<td>{e(r['melhor_video'])} <span class=tag>({fmt(r['melhor_views'])})</span></td></tr>")
    p.append("</table><h2>Vídeos fora da curva (os 40 maiores)</h2><table><tr><th></th><th>Vídeo</th><th>Views</th>"
             "<th>Views/dia</th><th>Inscritos do canal</th><th>Fora da curva</th><th>Duração</th></tr>")
    for l in sorted(linhas, key=lambda x: -x["fora_da_curva"])[:40]:
        hot = " class=hot" if l["fora_da_curva"] >= 5 else ""
        p.append(f"<tr{hot}><td><img src='{l['thumb']}'></td><td><a href='{l['url']}'>{e(l['titulo'])}</a><br>"
                 f"<span class=tag>{e(l['canal'])} · {l['publicado']} · busca: {e(l['termo'])}</span></td>"
                 f"<td class=n>{fmt(l['views'])}</td><td class=n>{fmt(l['views_dia'])}</td><td class=n>{fmt(l['inscritos'])}</td>"
                 f"<td class=n>{l['fora_da_curva']}x</td><td class=n>{l['duracao_min']} min</td></tr>")
    p.append("</table></body></html>")
    open(destino, "w", encoding="utf-8").write("\n".join(p))


def salvar_csv(linhas, destino):
    if not linhas:
        return
    with open(destino, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=[k for k in linhas[0] if k != "thumb"], delimiter=";", extrasaction="ignore")
        w.writeheader()
        w.writerows(linhas)


def rodar(modo, termos, dias=120, maximo=25, duracao="medium", busca=None, det=None):
    busca, det = busca or buscar, det or detalhes
    pares = []
    for t in termos:
        print(f"  buscando: {t}")
        pares += [(t, i) for i in busca(t, dias, maximo, duracao)]
    vids, canais = det([i for _, i in pares])
    linhas, vistos = [], set()
    for t, i in pares:
        if i in vids and (t, i) not in vistos:
            vistos.add((t, i))
            linhas.append(linha(vids[i], canais, t))
    resumo = resumo_temas(linhas) if modo == "temas" else resumo_canais(linhas)
    pasta = os.path.join(RAIZ, "estrategia")
    os.makedirs(pasta, exist_ok=True)
    carimbo = dt.datetime.now().strftime("%Y-%m-%d_%Hh%M")
    base = os.path.join(pasta, f"relatorio_{modo}_{carimbo}")
    html_relatorio(modo, termos, linhas, resumo, base + ".html")
    salvar_csv(linhas, base + ".csv")
    json.dump({"modo": modo, "termos": termos, "resumo": resumo, "videos": linhas},
              open(base + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Pronto: {base}.html  ({len(linhas)} vídeos, cota usada ~{len(termos) * 100 + 10} unidades)")
    return base, resumo, linhas


# ---------------- MODO RADAR: nichos novos, sem tema definido ----------------
# Ideia: em vez de buscar um tema, olhar o que está subindo AGORA e filtrar
# canais NOVOS (criados há menos de ~1 ano) e PEQUENOS que já fazem muitas views.
# Canal novo bombando = nicho com demanda e pouca oferta.
CATEGORIAS = {"1": "Filmes e animação", "22": "Pessoas e blogs", "23": "Comédia", "24": "Entretenimento",
              "27": "Educação", "28": "Ciência e tecnologia"}
TERMOS_RADAR = {
    "en": ["explained", "animated story", "what if", "documentary", "day 1 to day 100", "full movie animation",
           "ranked", "facts you didn't know", "for sleep", "simulation"],
    "pt": ["explicado", "história animada", "e se", "documentário", "do dia 1 ao dia 100", "animação completa",
           "curiosidades que você não sabia", "para dormir", "simulação", "você sabia"],
}


def canais_info(ids):
    out = {}
    for lote in lotes(list(set(ids))):
        for it in get("channels", part="snippet,statistics", id=",".join(lote)).get("items", []):
            out[it["id"]] = it
    return out


def radar(regioes=("US", "BR"), dias=45, idade_max=365, buscas=True, shorts=False):
    hoje = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
    achados = {}
    global REGIAO, IDIOMA
    for reg in regioes:
        idi = "pt" if reg == "BR" else ("es" if reg in ("MX", "ES", "AR", "CO") else "en")
        REGIAO, IDIOMA = reg, idi
        ids = []
        # 1) "Em alta" por categoria (barato: 1 unidade por página)
        for cat in CATEGORIAS:
            tok = None
            for _ in range(4):
                p = dict(part="id", chart="mostPopular", regionCode=reg, videoCategoryId=cat, maxResults=50)
                if tok: p["pageToken"] = tok
                try:
                    r = get("videos", **p)
                except SystemExit:
                    break
                ids += [(f"em alta/{CATEGORIAS[cat]}", it["id"]) for it in r.get("items", [])]
                tok = r.get("nextPageToken")
                if not tok: break
        # 2) buscas amplas recentes (100 unidades cada)
        if buscas:
            for t in TERMOS_RADAR.get(idi, TERMOS_RADAR["en"]):
                print(f"  [{reg}] buscando: {t}")
                try:
                    ids += [(f"busca/{t}", i) for i in buscar(t, dias, 50, "any")]
                except SystemExit as ex:
                    print("  parou as buscas:", ex); break
        vids, canais = detalhes([i for _, i in ids])
        info = canais_info([v["snippet"]["channelId"] for v in vids.values()])
        for origem, i in ids:
            if i not in vids or i in achados: continue
            l = linha(vids[i], canais, origem)
            ci = info.get(l["canal_id"], {})
            criado = ci.get("snippet", {}).get("publishedAt", "2000-01-01T00:00:00Z")[:19]
            idade = (hoje - dt.datetime.strptime(criado, "%Y-%m-%dT%H:%M:%S")).days
            l.update(mercado=reg, idade_canal_dias=idade)
            if idade <= idade_max and l["views"] >= 50000 and l["inscritos"] < 200000 and (shorts or l["duracao_min"] >= 3):
                achados[i] = l
    linhas = sorted(achados.values(), key=lambda x: -x["views_dia"])
    pasta = os.path.join(RAIZ, "estrategia"); os.makedirs(pasta, exist_ok=True)
    base = os.path.join(pasta, "relatorio_radar_" + dt.datetime.now().strftime("%Y-%m-%d_%Hh%M"))
    json.dump(linhas, open(base + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    salvar_csv(linhas, base + ".csv")
    e = html.escape
    h = ["<html><head><meta charset='utf-8'><title>Radar de nichos</title><style>body{font-family:Segoe UI,Arial;margin:20px;max-width:1150px}"
         "h1{color:#5e35b1}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:6px;font-size:14px;text-align:left;vertical-align:top}"
         "th{background:#ede7f6}.n{text-align:right;white-space:nowrap}img{width:150px;border-radius:6px}.tag{color:#666;font-size:12px}</style></head><body>",
         f"<h1>Radar de nichos — canais novos que já bombam</h1><p class=tag>{dt.datetime.now():%d/%m/%Y %H:%M}. Canais criados há até {idade_max} dias, "
         "menos de 200 mil inscritos, vídeo com 50 mil+ views. Ordenado por views por dia.</p><table><tr><th></th><th>Vídeo</th><th>Mercado</th>"
         "<th>Views</th><th>Views/dia</th><th>Inscritos</th><th>Idade do canal</th><th>Duração</th></tr>"]
    for l in linhas[:150]:
        h.append(f"<tr><td><img src='{l['thumb']}'></td><td><a href='{l['url']}'>{e(l['titulo'])}</a><br><span class=tag>{e(l['canal'])} · {e(l['termo'])}</span></td>"
                 f"<td>{l['mercado']}</td><td class=n>{fmt(l['views'])}</td><td class=n>{fmt(l['views_dia'])}</td><td class=n>{fmt(l['inscritos'])}</td>"
                 f"<td class=n>{l['idade_canal_dias']} dias</td><td class=n>{l['duracao_min']} min</td></tr>")
    h.append("</table></body></html>")
    open(base + ".html", "w", encoding="utf-8").write("\n".join(h))
    print(f"Pronto: {base}.html ({len(linhas)} vídeos de canais novos)")
    return base, linhas


if __name__ == "__main__":
    a = sys.argv[1:]
    if a and a[0] == "radar":
        CHAVE = ler_chave()
        regs = [x for x in a[1:] if not x.startswith("--")] or ["US", "BR"]
        radar(tuple(r.upper() for r in regs), buscas="--sem-buscas" not in a, shorts="--shorts" in a)
        sys.exit(0)
    if not a or a[0] not in ("temas", "canais"):
        sys.exit(__doc__)
    modo, resto = a[0], a[1:]
    opts = {"dias": 120, "max": 25, "duracao": "medium", "regiao": "BR", "idioma": "pt"}
    termos = []
    i = 0
    while i < len(resto):
        if resto[i].startswith("--"):
            opts[resto[i][2:]] = resto[i + 1]
            i += 2
        else:
            termos.append(resto[i])
            i += 1
    if not termos:
        if modo == "canais":
            termos = NICHO
        else:
            sys.exit("Informe ao menos um tema. Ex.: python tools\\estrategista.py temas \"conta de luz\"")
    REGIAO, IDIOMA = opts["regiao"].upper(), opts["idioma"].lower()
    CHAVE = ler_chave()
    rodar(modo, termos, int(opts["dias"]), int(opts["max"]), opts["duracao"])

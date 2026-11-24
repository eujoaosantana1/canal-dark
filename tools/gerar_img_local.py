r"""Imagens 16:9 pelo ComfyUI local (SDXL na RX 7600): reserva do Gemini, sem gastar créditos.
Mesma interface dos gerar_img.py dos episódios: lê o dicionário P e o ESTILO do script do episódio (sem executá-lo,
então a chave do Gemini nunca é aberta), gera img_<chave>.png na pasta atual e pula as que já existem.
Prompts próprios para o SDXL (opcionais, no mesmo gerar_img.py do episódio):
   P_LOCAL      = {chave: prompt curto por palavras-chave}  -> usado no lugar de P[chave]
   ESTILO_LOCAL = ", cinematic documentary photograph, ..."   -> usado com P_LOCAL (padrão: ESTILO)
   NEG_LOCAL    = {chave: "termos extras no negativo"}

Uso (de dentro da pasta imagens do episódio, com o ComfyUI aberto: C:\AI\ComfyUI_windows_portable\run_amd_canal.bat):
   python ..\..\..\tools\gerar_img_local.py ..\tools\gerar_img.py [chaves]  [--passos 28] [--cfg 5] [--seed 1] [--saida pasta] [--neg "termos extras no negativo"]
Sem chaves = todas que ainda não existem. Com chaves = gera (ou refaz) só essas.
"""
import ast, json, os, sys, time, random, urllib.request, urllib.parse, io
from PIL import Image, ImageStat

SERVIDOR = 'http://127.0.0.1:8188'
AQUI = os.path.dirname(os.path.abspath(__file__))
WORKFLOW = os.path.join(AQUI, 'comfy_sdxl.json')
NEGATIVO = ('text, letters, words, caption, watermark, logo, signature, brand name, blood, gore, wound, corpse, dead body, '
            'cartoon, illustration, painting, anime, 3d render, deformed hands, extra fingers, blurry, lowres, jpeg artifacts')
LARG, ALT = 1344, 768          # 16:9 nativo do SDXL
FINAL = (1920, 1080)


def ler_prompts(script):
    """Extrai P, ESTILO e os opcionais P_LOCAL, ESTILO_LOCAL, NEG_LOCAL do gerar_img.py do episódio via AST (não roda o arquivo).
    Devolve {chave: (prompt positivo, negativo extra)}."""
    arv = ast.parse(open(script, encoding='utf-8').read())
    achados = {}
    for no in arv.body:
        if isinstance(no, ast.Assign) and len(no.targets) == 1 and isinstance(no.targets[0], ast.Name):
            nome = no.targets[0].id
            if nome in ('P', 'ESTILO', 'P_LOCAL', 'ESTILO_LOCAL', 'NEG_LOCAL'):
                achados[nome] = ast.literal_eval(no.value)
    if 'P' not in achados:
        sys.exit(f'Não achei o dicionário P em {script}')
    estilo = achados.get('ESTILO', ''); local = achados.get('P_LOCAL', {})
    estilo_local = achados.get('ESTILO_LOCAL', estilo); neg = achados.get('NEG_LOCAL', {})
    return {k: ((local[k] + estilo_local) if k in local else (v + estilo), neg.get(k, ''))
            for k, v in {**achados['P'], **local}.items()}


def pedir(caminho, dados=None):
    req = urllib.request.Request(SERVIDOR + caminho, data=json.dumps(dados).encode() if dados is not None else None,
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def gerar(texto, semente, passos, cfg, neg_extra=''):
    wf = json.load(open(WORKFLOW, encoding='utf-8'))
    wf['6']['inputs']['text'] = texto
    wf['7']['inputs']['text'] = NEGATIVO + (', ' + neg_extra if neg_extra else '')
    wf['5']['inputs'].update(width=LARG, height=ALT)
    wf['3']['inputs'].update(seed=semente, steps=passos, cfg=cfg)
    pid = json.loads(pedir('/prompt', {'prompt': wf, 'client_id': 'canal-dark'}))['prompt_id']
    while True:
        time.sleep(1.0)
        h = json.loads(pedir(f'/history/{pid}'))
        if pid in h:
            st = h[pid].get('status', {})
            if st.get('status_str') == 'error':
                raise RuntimeError(json.dumps(st.get('messages', ''))[:400])
            for saida in h[pid]['outputs'].values():
                for im in saida.get('images', []):
                    q = urllib.parse.urlencode({'filename': im['filename'], 'subfolder': im['subfolder'], 'type': im['type']})
                    return Image.open(io.BytesIO(pedir('/view?' + q))).convert('RGB')
            if st.get('completed'):
                raise RuntimeError('terminou sem imagem')


def main():
    a = sys.argv[1:]
    opc = {'--passos': 28, '--cfg': 5.0, '--seed': None, '--saida': '.', '--neg': ''}
    for k in list(opc):
        if k in a:
            i = a.index(k); v = a[i + 1]; del a[i:i + 2]
            opc[k] = v if k in ('--saida', '--neg') else (float(v) if k == '--cfg' else int(v))
    global NEGATIVO
    if opc['--neg']: NEGATIVO = NEGATIVO + ', ' + opc['--neg']
    if not a:
        sys.exit(__doc__)
    P = ler_prompts(a[0])
    chaves = a[1:] or list(P)
    refazer = bool(a[1:])
    faltam = [k for k in chaves if k not in P]
    if faltam:
        sys.exit(f'Chaves que não estão no P: {faltam}')
    try:
        pedir('/system_stats')
    except Exception:
        sys.exit('ComfyUI não está aberto em 127.0.0.1:8188. Rode C:\\AI\\ComfyUI_windows_portable\\run_amd_canal.bat')
    os.makedirs(opc['--saida'], exist_ok=True)
    for k in chaves:
        dest = os.path.join(opc['--saida'], f'img_{k}.png')
        if os.path.exists(dest) and not refazer:
            print(k, 'já existe', flush=True); continue
        semente = opc['--seed'] if opc['--seed'] is not None else random.randint(1, 2 ** 31)
        t0 = time.time()
        im = None
        for tentativa in range(3):   # na RX 7600 às vezes sai uma imagem lisa e cinza: confere e refaz
            try:
                im = gerar(P[k][0], semente + tentativa, opc['--passos'], opc['--cfg'], P[k][1])
            except Exception as e:
                print(k, 'ERRO', e, flush=True); im = None; break
            if sum(ImageStat.Stat(im).stddev) / 3 > 10: break
            print(k, f'saiu cinza (tentativa {tentativa + 1}), refazendo', flush=True); im = None
        if im is None:
            print(k, 'FALHOU', flush=True); continue
        im.resize(FINAL, Image.LANCZOS).save(dest)
        print(k, f'ok {time.time() - t0:.1f}s seed={semente}', flush=True)


if __name__ == '__main__':
    main()

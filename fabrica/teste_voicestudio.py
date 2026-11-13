"""Teste do VoiceStudio (API local em http://localhost:3900): clona as vozes do Gemini e gera falas novas.
Uso: python teste_voicestudio.py --pasta "...\\02 - Internet 72 Horas"
Saída: <pasta>\\teste_voicestudio\\ (wavs + relatorio.json)
"""
import argparse, json, os, sys, time
import requests

API = os.environ.get('VS_API', 'http://127.0.0.1:3900')
AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, AQUI)

REFS = {  # personagem: (clipe de referência do Gemini, clipe de teste)
    'NARRADOR': ('003', '006'),
    'SEU JURA': ('013', '019'),
    'THIAGO': ('018', '020'),
    'TÉCNICO': ('029', '031'),
    'DUDA': ('012', '014'),
}
CANDIDATOS = ['omnivoice', 'voxcpm2', 'cosyvoice', 'moss-tts-nano', 'moss-tts', 'dots-tts', 'pockettts']


def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)


def get(path):
    try:
        r = requests.get(API + path, timeout=30); return r.status_code, (r.json() if 'json' in r.headers.get('content-type', '') else r.text[:2000])
    except Exception as e: return 0, str(e)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--pasta', required=True); ap.add_argument('--motores', nargs='*'); ap.add_argument('--instalar', nargs='*', default=[]); ap.add_argument('--pesos', nargs='*', default=[]); ap.add_argument('--esperar', type=int, default=0)
    ap.add_argument('--refs', nargs='*', help='PERSONAGEM=ref,alvo (padrão: os do vídeo 2)'); ap.add_argument('--prefixo', default='72h'); a = ap.parse_args()
    global REFS
    if a.refs: REFS = {x.split('=')[0]: tuple(x.split('=')[1].split(',')) for x in a.refs}
    if a.esperar:
        log('Esperando o VoiceStudio abrir...')
        for _ in range(a.esperar // 5):
            if get('/engines/tts')[0] == 200: log('VoiceStudio pronto'); break
            time.sleep(5)
    for eng in a.instalar:  # instala motor (sidecar) + pesos e espera terminar
        log('Instalando motor', eng, '...')
        r = requests.post(API + f'/engines/sidecar/{eng}/install', timeout=60); log('install', r.status_code, r.text[:400])
        for _ in range(240):
            time.sleep(15); c, st = get(f'/engines/sidecar/{eng}/install/status'); log('status', str(st)[:300])
            job = (st.get('job') or {}) if isinstance(st, dict) else {}
            if isinstance(st, dict) and (st.get('installed') or str(job.get('state', '')).lower() in ('succeeded', 'failed', 'error', 'cancelled')): break
        c, eng_list = get('/engines/tts'); log('engines', str([(b['id'], b['available'], b.get('reason')) for b in eng_list.get('backends', []) if b['id'] == eng])[:500])
    for repo in [x for x in (a.pesos or [])]:
        log('Baixando pesos', repo, '...'); r = requests.post(API + '/models/install', json={'repo_id': repo}, timeout=60); log('models/install', r.status_code, r.text[:300])
        for _ in range(120):
            time.sleep(10); c, ms = get('/models')
            m = [x for x in (ms.get('models', []) if isinstance(ms, dict) else []) if x.get('repo_id') == repo]
            if m and m[0].get('installed') and not m[0].get('incomplete'): log('pesos instalados', repo); break
        else: log('pesos ainda não terminaram', repo)
    pasta = os.path.abspath(a.pasta); out = os.path.join(pasta, 'teste_voicestudio'); os.makedirs(out, exist_ok=True)
    falas = {f['n']: f for f in json.load(open(os.path.join(pasta, 'falas.json'), encoding='utf-8'))}
    rel = {'api': API}
    for p in ['/.well-known/voicestudio-speech', '/engines/tts', '/models', '/model/loaded', '/profiles']:
        rel[p] = get(p); log('GET', p, str(rel[p])[:600])
    if rel['/engines/tts'][0] == 0:
        log('ERRO: VoiceStudio não respondeu em', API, '- o app está aberto?'); json.dump(rel, open(os.path.join(out, 'relatorio.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1); return
    # motores instalados
    eng_txt = json.dumps(rel['/engines/tts'][1], ensure_ascii=False).lower()
    disp = {b['id']: b['available'] for b in rel['/engines/tts'][1].get('backends', [])}
    motores = a.motores or [m for m in CANDIDATOS if disp.get(m)] or ['omnivoice']
    log('Motores a testar:', motores)
    # 1) clonar vozes a partir das falas do Gemini
    perfis = {}
    existentes = {p.get('name'): p.get('id') for p in (rel['/profiles'][1] if isinstance(rel['/profiles'][1], list) else [])}
    for spk in REFS:
        if existentes.get(f'{a.prefixo} {spk}'): perfis[spk] = existentes[f'{a.prefixo} {spk}']
    for spk, (ref, _) in REFS.items():
        if spk in perfis: continue
        wav = os.path.join(pasta, 'vozes', ref + '.wav')
        if not os.path.exists(wav): log('sem referência para', spk); continue
        try:
            with open(wav, 'rb') as fh:
                r = requests.post(API + '/profiles', data={'name': f'{a.prefixo} {spk}', 'ref_text': falas[ref]['txt'], 'language': 'pt', 'kind': 'clone'},
                                  files={'ref_audio': (os.path.basename(wav), fh, 'audio/wav')}, timeout=300)
            d = r.json() if 'json' in r.headers.get('content-type', '') else {'raw': r.text[:500]}
            pid = d.get('id') or d.get('profile_id') or (d.get('profile') or {}).get('id')
            perfis[spk] = pid; log('perfil', spk, r.status_code, pid, str(d)[:300])
        except Exception as e:
            log('falhou perfil', spk, e)
    rel['perfis'] = perfis
    # 2) gerar falas novas com cada motor
    from gerar_vozes import Conferente
    conf = Conferente(); res = []
    for m in motores:
        for spk, (_, alvo) in REFS.items():
            if not perfis.get(spk): continue
            txt = falas[alvo]['txt']; arq = os.path.join(out, f'{m}_{alvo}.wav'); t0 = time.time()
            try:
                r = requests.post(API + '/v1/audio/speech', json={'model': m, 'input': txt, 'voice': perfis[spk], 'language': 'pt', 'response_format': 'wav'}, timeout=900)
                seg = time.time() - t0
                if r.status_code != 200 or len(r.content) < 2000:
                    log('ERRO', m, spk, r.status_code, r.text[:300]); res.append(dict(motor=m, spk=spk, clip=alvo, erro=f'{r.status_code} {r.text[:1500]}'));
                    if r.status_code in (400, 404, 422, 503) and spk == list(REFS)[0]: break
                    continue
                open(arq, 'wb').write(r.content)
                st, probs, ouvido, d = conf.conferir(txt, arq)
                log(f'{m:<12} {spk:<9} {seg:5.1f}s para {d:4.1f}s de áudio  {st} {"; ".join(probs)}')
                res.append(dict(motor=m, spk=spk, clip=alvo, seg=round(seg, 1), dur=round(d, 2), status=st, problemas=probs, ouvido=ouvido))
            except Exception as e:
                log('ERRO', m, spk, e); res.append(dict(motor=m, spk=spk, clip=alvo, erro=str(e)[:200]))
    rel['resultados'] = res
    json.dump(rel, open(os.path.join(out, 'relatorio.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    log('FIM')


if __name__ == '__main__':
    main()

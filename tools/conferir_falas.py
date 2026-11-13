"""Conferência automática: cada clipe de voz x texto do roteiro.
Uso: python3 conferir.py <lines.json> <pasta_clipes> <saida.json> [clipes...]
Saída: relatório com status OK / AVISO / ERRO por clipe.
"""
import json, re, sys, os, subprocess, unicodedata, difflib
import numpy as np
from num2words import num2words
from faster_whisper import WhisperModel

FILLERS = {'ai','ah','ahn','hum','hm','uai','ue','eh','e','oh','ui','uh','ha','opa','ne','tipo','olha','bom','ei','u','o','a'}
SUBS = {'pra':'para','pro':'para o','pros':'para os','pras':'para as','to':'estou','ta':'esta','tava':'estava',
        'ce':'voce','cade':'cade','num':'nao','vo':'vou','le':'ler','ce':'voce'}

def strip_acc(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def nums(s):
    s = re.sub(r'(\d)\.(\d{3})', r'\1\2', s)
    s = re.sub(r'(\d+)\s*%', lambda m: num2words(int(m.group(1)), lang='pt_BR') + ' por cento', s)
    s = re.sub(r'r\$\s*(\d+)', r'\1 reais', s)
    return re.sub(r'\d+', lambda m: num2words(int(m.group(0)), lang='pt_BR'), s)

def norm(s):
    s = re.sub(r'\[[^\]]*\]', ' ', s)          # tags de emoção
    s = nums(s.lower())
    s = strip_acc(s)
    s = s.replace('-', ' ')
    s = re.sub(r"[^a-z0-9 ]", ' ', s)
    out = []
    for w in s.split():
        if re.fullmatch(r'(h[aeiu])+h?', w): continue   # risadas
        out += SUBS.get(w, w).split()
    return out

EQUIV = [{'por', 'para', 'pro'}, {'e', 'eh'}]
def sim(a, b):
    if a == b or any(a in q and b in q for q in EQUIV): return 1.0
    if len(a) >= 4 and len(b) >= 4 and (a in b or b in a): return 0.9
    return difflib.SequenceMatcher(None, a, b).ratio()

def compare(exp, got):
    sm = difflib.SequenceMatcher(None, exp, got, autojunk=False)
    missing, extra = [], []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            continue
        E, G = exp[i1:i2], got[j1:j2]
        if E and G and sim(''.join(E), ''.join(G)) >= 0.8:   # hífen/junção: meio-guarulhos, roda-pé
            continue
        # pareia palavras parecidas (erros de reconhecimento, ex.: nene/nani)
        used = set()
        for e in E:
            best = max(((sim(e, g), k) for k, g in enumerate(G) if k not in used), default=(0, None))
            if best[0] >= 0.6 or (best[1] is not None and (e in G[best[1]] or G[best[1]] in e)):
                used.add(best[1])
            else:
                missing.append(e)
        extra += [g for k, g in enumerate(G) if k not in used]
    return missing, extra

def main():
    lines = {l['n']: l for l in json.load(open(sys.argv[1]))}
    folder, outp = sys.argv[2], sys.argv[3]
    only = set(sys.argv[4:])
    files = {f[:3]: f for f in os.listdir(folder) if f.endswith('.mp3') or f.endswith('.wav')}
    m = WhisperModel(os.environ.get('WMODEL', 'small'), compute_type='int8', cpu_threads=os.cpu_count())
    m2 = None
    rep = []
    for n in sorted(lines):
        if only and n not in only: continue
        l = lines[n]
        raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', os.path.join(folder, files[n]), '-ar', '16000', '-ac', '1', '-f', 's16le', '-'],
                             capture_output=True).stdout
        a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
        exp = norm(l['txt'])
        def check(model):
            segs, _ = model.transcribe(a, language='pt', beam_size=5, condition_on_previous_text=False, vad_filter=False)
            txt = ' '.join(s.text.strip() for s in segs)
            return txt, norm(txt)
        def issues(got):
            missing, extra = compare(exp, got)
            miss_c = [w for w in missing if w not in FILLERS]
            extra_c = [w for w in extra if w not in FILLERS]
            ec = [w for w in exp if w not in FILLERS] or exp
            gc = [w for w in got if w not in FILLERS] or got
            p = []
            if miss_c: p.append('faltando: ' + ' '.join(miss_c))
            if ec and gc and not (sim(ec[0], gc[0]) >= 0.6 or ec[0] in gc[:3]): p.append('início diferente')
            if ec and gc and not (sim(ec[-1], gc[-1]) >= 0.6 or ec[-1] in gc[-3:]): p.append('final diferente')
            if extra_c: p.append('sobrando: ' + ' '.join(extra_c))
            return p, extra
        txt, got = check(m)
        p1, extra = issues(got)
        if p1:   # segunda opinião com modelo maior; vale a leitura com menos problemas
            if m2 is None: m2 = WhisperModel(os.environ.get('WMODEL2', 'medium'), compute_type='int8', cpu_threads=os.cpu_count())
            txt2, got2 = check(m2)
            p2, extra2 = issues(got2)
            if len(p2) < len(p1) or (len(p2) == len(p1) and len(extra2) < len(extra)):
                txt, got, p1, extra = txt2, got2, p2, extra2
        dur = len(a) / 16000
        cps = len(' '.join(exp)) / max(dur, 0.01)          # caracteres por segundo
        prob = list(p1)
        if cps > 22: prob.append(f'rápido demais ({cps:.0f} car/s)')
        aviso = []
        if cps < 5 and dur > 2: aviso.append(f'pausa longa ({cps:.0f} car/s)')
        if extra and not prob and not aviso: aviso.append('palavras extras: ' + ' '.join(extra))
        status = 'ERRO' if prob else ('AVISO' if aviso else 'OK')
        rep.append(dict(clip=n, quem=l['spk'], status=status, problemas=prob + aviso, esperado=re.sub(r'\[[^\]]*\]\s*', '', l['txt']),
                        ouvido=txt, dur=round(dur, 2)))
        print(f"{n} {l['spk']:<10} {status:<5} {'; '.join(prob + aviso)}", flush=True)
    json.dump(rep, open(outp, 'w'), ensure_ascii=False, indent=1)
    print('RESUMO', {s: sum(r['status'] == s for r in rep) for s in ('OK', 'AVISO', 'ERRO')})

if __name__ == '__main__':
    main()

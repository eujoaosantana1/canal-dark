"""Fábrica Canal Dark — gera, confere e monta as vozes de um vídeo (v2: em lote, econômica).

Uso (pelo .bat):
  python gerar_vozes.py --pasta "...\\02 - Internet 72 Horas" [--teste] [--so 017 041]

Como economiza a cota do Google (10 pedidos/min, 100/dia):
- Junta várias falas do MESMO personagem num pedido só (lote) e corta depois pelo silêncio.
- Cada pedaço passa pela conferência rígida (palavra faltando/sobrando/trocada).
- Só a fala que falhar é gerada de novo, sozinha (até 2 vezes).
- Se a cota do dia acabar, salva o progresso e para. Rodar de novo continua de onde parou.
Saídas na pasta do vídeo: vozes/NNN.wav, conferencia.csv, voiceover.wav, timeline_vozes.json
"""
import argparse, base64, csv, difflib, glob, json, os, re, shutil, subprocess, sys, threading, time, wave
import urllib.request, urllib.error
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
from conferir_falas import norm, compare, sim, FILLERS

MODEL = os.environ.get('TTS_MODEL', 'gemini-3.8-flash-tts')
INTERVALO = 6.5            # segundos entre pedidos (10/min)
LOTE_MAX_FALAS = 6
LOTE_MAX_CHARS = 650
API_OK_P = os.path.join(AQUI, 'api_ok.json')


def api_ok_path():
    if MODEL == 'gemini-3.8-flash-tts':
        return API_OK_P
    return os.path.join(AQUI, f'api_ok_{MODEL}.json')


def log(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


class CotaDiaria(Exception):
    pass


def ler_chave():
    p = os.path.join(BASE, 'chave_gemini.txt')
    if os.path.isdir(p):
        fs = sorted(glob.glob(os.path.join(p, '*.txt')))
        if not fs:
            sys.exit('ERRO: nenhuma chave dentro da pasta chave_gemini.txt')
        p = fs[0]
    if not os.path.exists(p):
        sys.exit('ERRO: crie chave_gemini.txt em Canal Dark com a chave da API')
    t = open(p, encoding='utf-8-sig').read()
    m = re.search(r'AIza[0-9A-Za-z_\-]{30,}', t)
    return m.group(0) if m else t.strip().split()[0]


def ff(*a):
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', *a], check=True, stdin=subprocess.DEVNULL)


def dur(p):
    with wave.open(p) as w:
        return w.getnframes() / w.getframerate()


def ler_pcm(p):
    with wave.open(p) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16), w.getframerate()


def salvar_pcm(p, a, sr):
    with wave.open(p, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(a.astype(np.int16).tobytes())


# ---------------------------------------------------------------- API
class API:
    def __init__(self, chave):
        self.chave = chave
        self.ok = json.load(open(api_ok_path())) if os.path.exists(api_ok_path()) else {}
        self.ult = 0.0
        self.lock = threading.Lock()
        self.pedidos = 0

    def _salvar_ok(self):
        json.dump(self.ok, open(api_ok_path(), 'w'), indent=1)

    def _post(self, versao, voice_config, texto):
        with self.lock:
            esp = INTERVALO - (time.time() - self.ult)
            if esp > 0: time.sleep(esp)
            self.ult = time.time()
        self.pedidos += 1
        corpo = json.dumps({'contents': [{'role': 'user', 'parts': [{'text': f'## Transcript:\n{texto}'}]}],
                            'generationConfig': {'responseModalities': ['AUDIO'],
                                                 'speechConfig': {'voiceConfig': voice_config}}}).encode('utf-8')
        url = f'https://generativelanguage.googleapis.com/{versao}/models/{MODEL}:generateContent'
        req = urllib.request.Request(url, data=corpo, method='POST',
                                     headers={'Content-Type': 'application/json', 'x-goog-api-key': self.chave})
        with urllib.request.urlopen(req, timeout=240) as r:
            return json.loads(r.read().decode('utf-8'))

    def falar(self, voz, texto, path):
        if voz.startswith('voice_'):
            fmts = {'custom': {'customVoiceConfig': {'voiceId': voz}},
                    'custom_name': {'customVoiceConfig': {'voice': voz}},
                    'prebuilt': {'prebuiltVoiceConfig': {'voiceName': voz}},
                    'direct': {'voiceId': voz}}
            ordem = [self.ok['fmt_custom']] if 'fmt_custom' in self.ok else list(fmts)
        else:
            fmts = {'prebuilt': {'prebuiltVoiceConfig': {'voiceName': voz}}}
            ordem = ['prebuilt']
        versoes = [self.ok['versao']] if 'versao' in self.ok else ['v1beta', 'v1alpha']
        erro = ''
        for fmt in ordem:
            for v in versoes:
                for tent in range(4):
                    try:
                        d = self._post(v, fmts[fmt], texto)
                        for part in d['candidates'][0]['content']['parts']:
                            inl = part.get('inlineData') or part.get('inline_data')
                            if inl and inl.get('data'):
                                raw = base64.b64decode(inl['data'])
                                rate = int((re.search(r'rate=(\d+)', inl.get('mimeType', '')) or [0, 24000])[1])
                                if raw[:4] == b'RIFF':
                                    open(path, 'wb').write(raw)
                                else:
                                    salvar_pcm(path, np.frombuffer(raw, np.int16), rate)
                                self.ok['versao'] = v
                                if voz.startswith('voice_'): self.ok['fmt_custom'] = fmt
                                self._salvar_ok()
                                return True, ''
                        erro = 'resposta sem áudio'; break
                    except urllib.error.HTTPError as e:
                        corpo = e.read().decode('utf-8', 'replace')
                        erro = f'HTTP {e.code} {corpo[:300]}'
                        if e.code == 429:
                            if 'per_day' in corpo or 'PerDay' in corpo:
                                raise CotaDiaria(corpo[:300])
                            time.sleep(20); continue
                        if e.code in (500, 503):
                            time.sleep(10); continue
                        break
                    except Exception as e:
                        erro = str(e)[:300]; time.sleep(5); continue
        return False, erro


# ---------------------------------------------------------------- áudio
def tratar(src, dst, ritmo):
    af = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,'
          'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,'
          'silenceremove=stop_periods=-1:stop_duration=0.3:stop_threshold=-42dB:stop_silence=0.22')
    if ritmo and abs(ritmo - 1) > 0.01:
        af += f',atempo={ritmo}'
    tmp = dst + '.tmp.wav'
    ff('-i', src, '-af', af, '-ar', '48000', '-ac', '1', tmp)
    ff('-i', tmp, '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', '48000', '-ac', '1', dst)
    os.remove(tmp)


def ponto_quieto(a, sr, t0, t1):
    i0, i1 = max(0, int(t0 * sr)), min(len(a), int(t1 * sr))
    w = int(0.02 * sr)
    if i1 - i0 <= w: return (t0 + t1) / 2
    best, bi = None, i0
    for i in range(i0, i1 - w, w // 2):
        e = float(np.mean(np.abs(a[i:i + w].astype(np.float32))))
        if best is None or e < best: best, bi = e, i
    return (bi + w / 2) / sr


# ---------------------------------------------------------------- conferência
class Conferente:
    def __init__(self):
        from faster_whisper import WhisperModel
        self.WM = WhisperModel
        self.m1 = WhisperModel('small', compute_type='int8')
        self.m2 = None

    def pcm16k(self, path):
        raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', path, '-ar', '16000', '-ac', '1', '-f', 's16le', '-'],
                             capture_output=True).stdout
        return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

    def palavras(self, path):
        a = self.pcm16k(path)
        segs, _ = self.m1.transcribe(a, language='pt', word_timestamps=True, condition_on_previous_text=False)
        return [(w.start, w.end, w.word) for s in segs for w in s.words]

    def ouvir(self, model, path):
        a = self.pcm16k(path)
        segs, _ = model.transcribe(a, language='pt', beam_size=5, condition_on_previous_text=False, vad_filter=False)
        txt = ' '.join(s.text.strip() for s in segs)
        return txt, norm(txt), len(a) / 16000

    def problemas(self, exp, got):
        missing, extra = compare(exp, got)
        mc = [w for w in missing if w not in FILLERS]
        xc = [w for w in extra if w not in FILLERS]
        ec = [w for w in exp if w not in FILLERS] or exp
        gc = [w for w in got if w not in FILLERS] or got
        p = []
        if mc: p.append('faltando: ' + ' '.join(mc))
        if ec and gc and not (sim(ec[0], gc[0]) >= 0.6 or ec[0] in gc[:3]): p.append('início diferente')
        if ec and gc and not (sim(ec[-1], gc[-1]) >= 0.6 or ec[-1] in gc[-3:]): p.append('final diferente')
        if xc: p.append('sobrando: ' + ' '.join(xc))
        if ec and not gc: p.append('áudio vazio')
        return p

    def conferir(self, texto, path):
        exp = norm(texto)
        txt, got, d = self.ouvir(self.m1, path)
        p = self.problemas(exp, got)
        if p:
            if self.m2 is None:
                self.m2 = self.WM('medium', compute_type='int8')
            txt2, got2, _ = self.ouvir(self.m2, path)
            p2 = self.problemas(exp, got2)
            if len(p2) < len(p): txt, p = txt2, p2
        cps = len(' '.join(exp)) / max(d, 0.01)
        aviso = []
        if cps > 24: p.append(f'rápido demais ({cps:.0f} car/s)')
        if cps < 5 and d > 2: aviso.append(f'pausa longa ({cps:.0f} car/s)')
        return ('ERRO' if p else ('AVISO' if aviso else 'OK')), p + aviso, txt, d


def cortar_lote(conf, wav, falas, destino_fmt):
    """corta o áudio de um lote em uma fala por arquivo, usando as palavras ouvidas + ponto mais quieto"""
    a, sr = ler_pcm(wav)
    ws = conf.palavras(wav)
    rec_tok, rec_w = [], []
    for i, (s, e, w) in enumerate(ws):
        for t in norm(w):
            rec_tok.append(t); rec_w.append(i)
    exp_tok, exp_line = [], []
    for k, f in enumerate(falas):
        for t in norm(f['txt']):
            exp_tok.append(t); exp_line.append(k)
    mapa = {}
    sm = difflib.SequenceMatcher(None, exp_tok, rec_tok, autojunk=False)
    for bA, bB, n in sm.get_matching_blocks():
        for j in range(n): mapa[bA + j] = rec_w[bB + j]
    total = len(a) / sr
    cortes = [0.0]
    chars = [len(f['txt']) for f in falas]
    for k in range(len(falas) - 1):
        idx_k = [i for i, l in enumerate(exp_line) if l == k and i in mapa]
        idx_n = [i for i, l in enumerate(exp_line) if l == k + 1 and i in mapa]
        if idx_k and idx_n:
            ta = ws[mapa[idx_k[-1]]][1]; tb = ws[mapa[idx_n[0]]][0]
            if tb < ta: ta, tb = tb - 0.15, tb + 0.15
        else:
            m = total * sum(chars[:k + 1]) / sum(chars); ta, tb = m - 0.4, m + 0.4
        cortes.append(ponto_quieto(a, sr, ta - 0.03, tb + 0.03))
    cortes.append(total)
    saidas = []
    for k, f in enumerate(falas):
        i0, i1 = int(cortes[k] * sr), int(cortes[k + 1] * sr)
        p = destino_fmt.format(n=f['n'])
        salvar_pcm(p, a[i0:i1], sr)
        saidas.append(p)
    return saidas


def lotes_de(falas):
    por = {}
    for f in falas: por.setdefault(f['spk'], []).append(f)
    out = []
    for spk, fs in por.items():
        cur, n = [], 0
        for f in fs:
            if cur and (len(cur) >= LOTE_MAX_FALAS or n + len(f['txt']) > LOTE_MAX_CHARS):
                out.append(cur); cur, n = [], 0
            cur.append(f); n += len(f['txt'])
        if cur: out.append(cur)
    return out


# ---------------------------------------------------------------- montagem
def montar(pasta, falas):
    vozes = os.path.join(pasta, 'vozes')
    t, tl, prev = 0.4, [], None
    for f in falas:
        d = dur(os.path.join(vozes, f['n'] + '.wav'))
        if prev is not None:
            t += 0.9 if f.get('sec') != prev.get('sec') else (0.45 if f['spk'] != prev['spk'] else 0.35)
        tl.append(dict(clip=f['n'], who=f['spk'], sec=f.get('sec'), start=round(t, 3), end=round(t + d, 3), text=f['txt']))
        t += d; prev = f
    total = round(t + 1.2, 3); sr = 48000
    out = np.zeros(int(total * sr) + sr, np.int16)
    for l in tl:
        a, _ = ler_pcm(os.path.join(vozes, l['clip'] + '.wav'))
        i = int(l['start'] * sr); out[i:i + len(a)] = a[:len(out) - i]
    salvar_pcm(os.path.join(pasta, 'voiceover.wav'), out[:int(total * sr)], sr)
    json.dump(dict(total=total, lines=tl), open(os.path.join(pasta, 'timeline_vozes.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    return total


# ---------------------------------------------------------------- principal
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pasta', required=True)
    ap.add_argument('--falas', default='falas.json')
    ap.add_argument('--elenco', default='elenco.json')
    ap.add_argument('--teste', action='store_true')
    ap.add_argument('--so', nargs='*')
    ap.add_argument('--modelo', help='modelo de TTS (ex.: gemini-3.1-flash-tts)')
    a = ap.parse_args()
    global MODEL
    if a.modelo:
        MODEL = a.modelo
    log(f'Modelo de voz: {MODEL}')
    pasta = os.path.abspath(a.pasta)
    falas = json.load(open(os.path.join(pasta, a.falas), encoding='utf-8'))
    elenco = json.load(open(os.path.join(pasta, a.elenco), encoding='utf-8'))
    for f in falas:
        if f['spk'] not in elenco: sys.exit(f"ERRO: personagem sem voz no elenco: {f['spk']}")
    bruto = os.path.join(pasta, 'vozes_brutas'); os.makedirs(bruto, exist_ok=True)
    vozes = os.path.join(pasta, 'vozes'); os.makedirs(vozes, exist_ok=True)
    estado_p = os.path.join(pasta, 'estado_vozes.json')
    estado = json.load(open(estado_p, encoding='utf-8')) if os.path.exists(estado_p) else {}
    if a.so:
        for n in a.so: estado.pop(n, None)
    if a.teste:
        vistos, alvo = set(), []
        for f in falas:
            if f['spk'] not in vistos: vistos.add(f['spk']); alvo.append(f)
    else:
        alvo = [f for f in falas if not a.so or f['n'] in a.so]
    pend = [f for f in alvo if estado.get(f['n'], {}).get('status') not in ('OK', 'AVISO')]
    api = API(ler_chave())
    conf = Conferente()
    log(f'{len(alvo)} falas no alvo, {len(pend)} pendentes.')

    def salvar():
        json.dump(estado, open(estado_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    def registrar(f, proc, tentativa):
        st, probs, ouvido, d = conf.conferir(f['txt'], proc)
        ant = estado.get(f['n'])
        log(f"  {f['n']} {f['spk']:<11} {st:<5} {'; '.join(probs)}")
        melhor = ant is None or (ant.get('status') == 'ERRO' and (st != 'ERRO' or len(probs) < len(ant.get('problemas', []))))
        if melhor:
            shutil.copy(proc, os.path.join(vozes, f['n'] + '.wav'))
            estado[f['n']] = dict(status=st, problemas=probs, ouvido=ouvido, dur=round(d, 2), tent=tentativa)
        else:
            estado[f['n']]['tent'] = tentativa
        salvar()

    cota = False
    try:
        lotes = lotes_de(pend) if not a.teste else [[f] for f in pend]
        log(f'{len(lotes)} pedidos em lote para {len(pend)} falas.')
        for i, lote in enumerate(lotes, 1):
            spk = lote[0]['spk']; voz = elenco[spk]['voz']
            p = os.path.join(bruto, f"lote_{lote[0]['n']}_{len(lote)}.wav")
            log(f"Lote {i}/{len(lotes)}: {spk} ({len(lote)} falas)")
            ok, err = api.falar(voz, '\n\n'.join(f['txt'] for f in lote), p)
            if not ok:
                log(f'  FALHOU NA API: {err}'); continue
            pedacos = [p] if len(lote) == 1 else cortar_lote(conf, p, lote, os.path.join(bruto, '{n}_l.wav'))
            for f, pc in zip(lote, pedacos):
                proc = pc.replace('.wav', '_ok.wav')
                tratar(pc, proc, elenco[spk].get('ritmo', 1.0))
                registrar(f, proc, 1)
        for rodada in (2, 3):
            ruins = [f for f in alvo if estado.get(f['n'], {}).get('status') in (None, 'ERRO')]
            if not ruins: break
            log(f'Refazendo {len(ruins)} falas uma a uma (tentativa {rodada})...')
            for f in ruins:
                p = os.path.join(bruto, f"{f['n']}_t{rodada}.wav")
                ok, err = api.falar(elenco[f['spk']]['voz'], f['txt'], p)
                if not ok:
                    log(f"  {f['n']} FALHOU NA API: {err}"); continue
                proc = p.replace('.wav', '_ok.wav')
                tratar(p, proc, elenco[f['spk']].get('ritmo', 1.0))
                registrar(f, proc, rodada)
    except CotaDiaria:
        cota = True
        log('COTA DIÁRIA DO GOOGLE ESGOTADA. Progresso salvo; rode de novo depois das 5h (horário de Brasília).')

    with open(os.path.join(pasta, 'conferencia_teste.csv' if a.teste else 'conferencia.csv'), 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.writer(fh, delimiter=';')
        w.writerow(['clipe', 'personagem', 'status', 'problemas', 'texto do roteiro', 'o que foi ouvido', 'duração (s)', 'tentativas'])
        for f in (alvo if a.teste else falas):
            e = estado.get(f['n'], {})
            w.writerow([f['n'], f['spk'], e.get('status', 'PENDENTE'), '; '.join(e.get('problemas', [])), f['txt'],
                        e.get('ouvido', ''), e.get('dur', ''), e.get('tent', '')])
    tot = {s: sum(1 for f in alvo if estado.get(f['n'], {}).get('status') == s) for s in ('OK', 'AVISO', 'ERRO')}
    pendentes = [f['n'] for f in alvo if f['n'] not in estado]
    log('RESUMO', tot, 'pendentes:', len(pendentes), '| pedidos à API nesta rodada:', api.pedidos)
    if not a.teste and not pendentes and all(os.path.exists(os.path.join(vozes, f['n'] + '.wav')) for f in falas):
        log(f'TRILHA PRONTA: voiceover.wav ({montar(pasta, falas):.1f} s)')
    log('FIM' + (' (parou na cota)' if cota else ''))


if __name__ == '__main__':
    main()

"""Fábrica Canal Dark — transforma vozes + plano de cenas no projeto do ViralStick (shots, palavras, música).

Uso: python montar_video.py --pasta "...\\02 - Internet 72 Horas" --projeto internet-72h [--fake]
Lê da pasta do vídeo: timeline_vozes.json, voiceover.wav, vozes/NNN.wav, plano.json, musica.json, titulo.txt (opcional)
Escreve em viralstick/projects/<projeto>/: story/shots.json, timeline/words.json, input/voiceover.wav, config.json
--fake: sem vozes (teste visual) — inventa tempos pelo tamanho do texto.
"""
import argparse, difflib, json, os, re, shutil, subprocess, sys, unicodedata
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)


def slug(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '_', s).strip('_')


def nw(x):
    x = unicodedata.normalize('NFD', x.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in x if unicodedata.category(c) != 'Mn'))


def sents(t):
    return [s for s in re.split(r'(?<=[.!?:])\s+(?=["“A-ZÀÁÉÍÓÚÂÊÔÃÕÇ0-9.])', t.strip()) if s]


def palavras(tl, pasta, fake):
    W = []
    if fake:
        for l in tl['lines']:
            ws = l['text'].split(); d = (l['end'] - l['start']) / max(1, len(ws))
            for i, w in enumerate(ws):
                W.append(dict(word=w, start=round(l['start'] + i * d, 3), end=round(l['start'] + (i + 0.9) * d, 3), who=slug(l['who']), clip=l['clip']))
        return W
    from faster_whisper import WhisperModel
    m = WhisperModel('small', compute_type='int8')
    for l in tl['lines']:
        raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', os.path.join(pasta, 'vozes', l['clip'] + '.wav'), '-ar', '16000', '-ac', '1', '-f', 's16le', '-'],
                             capture_output=True).stdout
        a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
        segs, _ = m.transcribe(a, language='pt', word_timestamps=True, initial_prompt=l['text'], condition_on_previous_text=False)
        ws = [w for s in segs for w in s.words]
        if not ws:  # garante boca mexendo mesmo sem palavras reconhecidas
            ws_txt = l['text'].split(); d = (l['end'] - l['start']) / max(1, len(ws_txt))
            for i, w in enumerate(ws_txt):
                W.append(dict(word=w, start=round(l['start'] + i * d, 3), end=round(l['start'] + (i + 0.9) * d, 3), who=slug(l['who']), clip=l['clip']))
            continue
        for w in ws:
            W.append(dict(word=w.word.strip(), start=round(l['start'] + w.start, 3), end=round(l['start'] + w.end, 3), who=slug(l['who']), clip=l['clip']))
        print('palavras', l['clip'], len(ws), flush=True)
    return W


def inicio_frase(ss, i0, cw):
    toks = [nw(t) for s in ss for t in s.split()]; idx = sum(len(s.split()) for s in ss[:i0])
    wt = [nw(w['word']) for w in cw]
    sm = difflib.SequenceMatcher(None, toks, wt, autojunk=False); best = None
    for a, b, n in sm.get_matching_blocks():
        if n == 0: continue
        if a <= idx < a + n: return cw[b + idx - a]['start']
        if a > idx and (best is None or a < best[0]): best = (a, b)
    if best: return cw[best[1]]['start'] - 0.05 * (best[0] - idx)
    return cw[min(len(cw) - 1, round(idx * len(cw) / max(1, len(toks))))]['start']


# ---------------------------------------------------------------- efeitos sonoros automáticos
# som próprio de cada tipo de cena: (nome, ganho dB, segundos após o início da cena, extras)
SFX_KIND = {
    'cartela': [('pop', -12, 0.05, {})],
    'ficha2': [('pop', -13, 0.05, {}), ('pop', -15, 0.6, {'pitch': 1.2})],
    'fica2': [('pop', -13, 0.05, {})], 'comenta2': [('pop', -13, 0.05, {}), ('blip', -16, 0.5, {})],
    'voce2': [('pop', -13, 0.05, {})],
    'numero': [('counter', -15, 0.15, {}), ('ding', -14, 1.6, {})],
    'pct': [('counter', -15, 0.15, {}), ('ding', -15, 1.5, {})],
    'hora': [('tick', -12, 0.0, {}), ('clock', -20, 0.1, {'dur': 2.5})],
    'relogio3': [('clock', -18, 0.0, {'dur': 3.0})],
    'celular': [('phonebuzz', -15, 0.2, {})],
    'telefone_fixo': [('phonering', -14, 0.1, {})],
    'cadeia': [('hit', -12, 0.1, {})],
    'maquininha': [('blip', -12, 0.2, {}), ('kaching', -15, 0.9, {})],
    'puxa_cabo': [('glitch', -12, 0.6, {})],
    'apps_fora': [('glitch', -12, 0.1, {}), ('glitch', -15, 0.9, {'seed': 41})],
    'mapa_br': [('whoosh', -13, 0.0, {}), ('shimmer', -20, 0.3, {})],
    'botao': [('blip', -12, 0.4, {}), ('ding', -16, 0.7, {})],
    'caminhao': [('carpass', -15, 0.0, {})],
    'motoboy': [('carpass', -15, 0.0, {'pitch': 1.4})],
    'nota_ouro': [('shimmer', -15, 0.1, {}), ('ding', -15, 0.5, {})],
    'lata_atm': [('coins', -11, 0.2, {}), ('ding', -16, 0.5, {})],
    'mesa_ceu': [('shimmer', -18, 0.0, {})], 'sobe_ceu': [('riser', -16, 0.0, {})],
    'geladeira': [('hum', -20, 0.0, {})],
    'caderno': [('paper', -13, 0.05, {}), ('swish', -16, 0.1, {'pitch': 1.3})],
    'radio_calcada': [('buzz', -20, 0.1, {})],
    'tomada': [('click', -8, 0.0, {})],
    'contas': [('paper', -12, 0.05, {}), ('ding', -18, 0.9, {})],
    'conta_fila': [('whoosh', -16, 0.0, {})],
    'fatias': [('pop', -14, 0.3, {}), ('pop', -16, 0.8, {'pitch': 1.2})],
    'bandeira': [('swish', -15, 0.1, {}), ('wind', -24, 0.0, {'dur': 3.0})],
    'envelope': [('paper', -12, 0.2, {}), ('pop', -15, 0.9, {})],
    'barras': [('riser', -18, 0.2, {'dur': 1.5}), ('ding', -16, 1.7, {})],
    'poste_corte': [('buzz', -18, 0.3, {}), ('glitch', -16, 1.2, {})],
    'carimbo': [('paper', -15, 0.1, {}), ('stamp', -8, 0.6, {})],
    'standby': [('hum', -20, 0.0, {}), ('blip', -16, 0.3, {})],
    'espera': [('phonebuzz', -18, 0.1, {})],
    'medidor': [('tick', -14, 0.2, {}), ('tick', -16, 0.9, {})],
    'ampulheta': [('tick', -14, 0.1, {})],
    'marcao_tomada': [('blip', -16, 0.3, {})],
    'calendario': [('swish', -16, 0.3, {'pitch': 1.4})],
    'pote': [('pop', -15, 0.4, {'pitch': 1.3}), ('ding', -18, 1.0, {'pitch': 1.4})],
    'votacao': [('counter', -15, 0.3, {}), ('ding', -14, 2.0, {})],
    'vendas': [('riser', -18, 0.2, {'dur': 1.2}), ('buzz', -16, 1.5, {})],
    'balanca': [('swish', -15, 0.2, {}), ('hit', -16, 1.4, {})],
    'ranking': [('counter', -15, 0.3, {})],
    'mar': [('cheer', -24, 1.5, {'dur': 2.5})],
    'rede': [],
    'pao_close': [('crunch', -8, 0.25, {}), ('crunch', -12, 0.9, {'seed': 41})],
    'forno': [('sizzle', -16, 0.0, {'dur': 2.0}), ('ding', -18, 0.6, {'pitch': 0.8})],
    'paris_cena': [],
    'versus': [('pop', -15, 0.2, {}), ('pop', -15, 1.0, {'pitch': 1.2})],
    'mapa_nomes': [('pop', -16, 0.4, {}), ('pop', -16, 1.0, {'pitch': 1.2})],
    'balcao': [('kaching', -16, 0.8, {})],
    'videochamada': [('phonering', -18, 0.0, {}), ('blip', -16, 0.6, {})],
    'chuveiro': [('splash', -14, 0.0, {'dur': 3.0}), ('click', -10, 1.4, {}), ('glitch', -16, 1.45, {})],
    'mapa_neve': [('whoosh', -13, 0.0, {}), ('shimmer', -18, 0.3, {})],
    'isopor': [('pop', -15, 0.2, {'pitch': 0.8}), ('paper', -18, 0.25, {})],
    'horas': [('pop', -14, 0.1, {}), ('tick', -14, 1.0, {}), ('ding', -16, 1.2, {})],
    'extrato': [('phonebuzz', -18, 0.1, {}), ('kaching', -16, 0.5, {})],
    'saldo': [('swish', -15, 0.3, {'pitch': 1.2}), ('buzz', -20, 1.0, {})],
    'conta': [('tick', -14, 0.3, {}), ('tick', -15, 1.4, {})],
    'mes': [('swish', -15, 0.1, {'pitch': 1.4})],
    'geladeira2': [('hum', -20, 0.0, {}), ('click', -12, 0.25, {}), ('swish', -16, 0.3, {'pitch': 0.8})],
    'pedido': [('paper', -13, 0.2, {}), ('shimmer', -18, 0.6, {})],
    'moedas': [('coins', -9, 0.3, {}), ('coins', -12, 1.1, {'seed': 44}), ('ding', -18, 2.0, {'pitch': 1.8})],
    # vídeo 8 (13º salário)
    'noel_close': [('shimmer', -20, 0.1, {})],
    'holerite': [('paper', -12, 0.1, {}), ('swish', -16, 0.3, {'pitch': 1.2})],
    'balanco': [('riser', -18, 0.2, {'dur': 1.2}), ('buzz', -16, 1.6, {})],
    'paises': [('pop', -15, 0.3, {}), ('pop', -15, 0.9, {'pitch': 1.2})],
    'jornal': [('swish', -13, 0.0, {}), ('paper', -12, 0.8, {})],
    # vídeo 9 (12 vezes)
    'parcelas': [('pop', -14, 0.25, {}), ('counter', -17, 0.6, {})],
    'preco2': [('pop', -14, 0.15, {}), ('pop', -15, 0.9, {'pitch': 1.2})],
    'em12': [('pop', -14, 0.1, {}), ('swish', -15, 0.6, {'pitch': 1.3})],
    'rolo': [('paper', -11, 0.2, {}), ('swish', -14, 0.3, {'dur': 1.5}), ('paper', -13, 1.4, {'seed': 45})],
    # vídeo 10 (escala 6x1)
    'semana': [('pop', -14, 0.2, {}), ('tick', -16, 0.6, {})],
    'arvore': [('shimmer', -18, 0.1, {}), ('applause', -22, 0.6, {'dur': 2.0})],
    # vídeo 11 (Jornal do Universo: a nuvem caiu)
    'vinheta': [('whoosh', -12, 0.0, {}), ('ding', -13, 0.5, {}), ('shimmer', -18, 0.6, {})],
    'tv_close': [('whoosh', -16, 0.0, {})],
    'aovivo': [('blip', -18, 0.2, {})],
    'grafico': [('riser', -18, 0.2, {'dur': 1.5}), ('ding', -15, 1.8, {})],
    'relembre': [('whoosh', -13, 0.0, {}), ('hit', -15, 0.4, {})],
    'caixas': [('glitch', -16, 1.0, {})],
    'porteiro': [('buzz', -18, 0.3, {}), ('glitch', -14, 1.6, {})],
    'lista_dns': [('paper', -13, 0.1, {}), ('glitch', -15, 1.2, {})],
    'telas_azuis': [('glitch', -12, 0.2, {}), ('glitch', -15, 0.9, {'seed': 41})],
    'cartao': [('paper', -12, 0.2, {})],
    'emails': [('ding', -14, 0.3, {}), ('ding', -15, 0.6, {'pitch': 1.2}), ('ding', -15, 0.9, {'pitch': 1.4}), ('ding', -16, 1.2, {'pitch': 1.1})],
    # vídeo 12 (Sem Voos)
    'painel': [('airport', -12, 0.1, {}), ('blip', -18, 0.9, {}), ('blip', -18, 1.5, {'pitch': 1.2})],
    'rotas': [('whoosh', -14, 0.0, {}), ('glitch', -20, 1.2, {})],
    'contador_voos': [('counter', -15, 0.15, {}), ('ding', -15, 1.7, {})],
    'relogio_orgao': [('clock', -14, 0.0, {'dur': 4.0}), ('heartbeat', -20, 0.2, {'dur': 3.0})],
    'barco_lento': [('waves', -24, 0.2, {'dur': 2.5})],
    'fila_taxi': [('carpass', -24, 0.3, {'dur': 2.5})],
    'decolagem': [('turbine', -5, 0.1, {'dur': 4.5}), ('impact', -16, 2.2, {})],
}
# som ambiente por cenário
AMB_SET = {'mercado': ('murmur', -26), 'mercadinho': ('roomtone', -27), 'mercadinho_qr': ('roomtone', -27),
           'mercadinho_noite': ('roomtone', -28), 'mercadinho_fora': ('city', -26), 'rua': ('city', -24),
           'postoSaude': ('murmur', -28), 'suporte': ('hum', -30), 'sala': ('roomtone', -30),
           'casa': ('roomtone', -29), 'casa_noite': ('roomtone', -31), 'muro': ('city', -27), 'muro_off': ('wind', -28), 'reparticao': ('hum', -30), 'banheiro': ('rain', -22),
           'loja': ('murmur', -30), 'outdoor': ('city', -26), 'casa_rose': ('roomtone', -29), 'casa_rose_noite': ('roomtone', -31), 'praia': ('wind', -25), 'praia_vazia': ('wind', -24), 'praia_cheia': ('murmur', -26),
           'padaria': ('murmur', -30), 'padaria_noite': ('roomtone', -31), 'rua_padarias': ('city', -27), 'rua_padarias_fila': ('murmur', -27), 'paris': ('city', -28), 'paris_fila': ('murmur', -26),
           'praca_sol': ('city', -28), 'praca_neve': ('wind', -24), 'urupema': ('wind', -25), 'urupema_vazia': ('wind', -23), 'urupema_lotada': ('murmur', -26), 'casa_fria': ('wind', -27), 'cafezal': ('wind', -30), 'cafezal_geada': ('wind', -25),
           'comodo': ('roomtone', -30), 'comodo_noite': ('roomtone', -31), 'paulista': ('city', -26), 'ponto': ('city', -27), 'ponto_bus': ('city', -25), 'mercearia': ('murmur', -29),
           'loja13': ('murmur', -30), 'loja13_vazia': ('roomtone', -29), 'loja13_noite': ('roomtone', -31), 'rua25': ('murmur', -24), 'rua25_vazia': ('wind', -26),
           'casa_lurdes': ('roomtone', -30), 'greve': ('murmur', -22),
           'quarto': ('roomtone', -30), 'quarto_noite': ('roomtone', -31), 'loja_cel': ('murmur', -30), 'corredor': ('roomtone', -31), 'call': ('murmur', -28),
           'super_fora': ('city', -26), 'super_fechado': ('wind', -26), 'escola_fora': ('city', -27), 'escola_fechada': ('wind', -26), 'rua_fechada': ('wind', -24),
           'palco': ('murmur', -27), 'casa_josi': ('roomtone', -30), 'casa_josi_noite': ('roomtone', -31),
           'estudio': ('hum', -33), 'nuvem_dc': ('hum', -28), 'home_office': ('roomtone', -30), 'home_office_noite': ('roomtone', -31), 'mercadinho_tv': ('roomtone', -29),
           # vídeo 12 (Sem Voos): ponto_taxi = dia normal (turbina distante); ponto_taxi_silencio = dia sem voos (passarinho)
           'ponto_taxi': ('turbine_far', -22), 'ponto_taxi_silencio': ('birds', -24), 'ponto_taxi_noite': ('birds', -30), 'saguao_vazio': ('hall', -22),
           'painel_voos': ('hall', -24), 'rio_acre': ('river', -22), 'floresta_acre': ('forest', -22), 'hospital': ('hospital', -26), 'gander': ('murmur', -26),
           'casa_valdemar': ('roomtone', -30), 'casa_valdemar_noite': ('roomtone', -31), 'rodoviaria': ('murmur', -24), 'pousada': ('roomtone', -29)}
AMB_KIND = {'fila': ('murmur', -24), 'pessoas': ('murmur', -24), 'conta_fila': ('roomtone', -29), 'ampulheta': ('rain', -22), 'poste_corte': ('city', -26), 'marcao_tomada': ('roomtone', -29), 'tomada': ('roomtone', -31), 'mesa_ceu': ('hum', -30), 'mar': ('wind', -24), 'rede': ('murmur', -28), 'pote': ('roomtone', -30), 'forno': ('hum', -28), 'balcao': ('murmur', -30), 'paris_cena': ('city', -28), 'pao_close': ('roomtone', -31), 'mapa_neve': ('wind', -24), 'isopor': ('city', -30), 'geladeira2': ('hum', -28), 'moedas': ('roomtone', -31), 'tv_jura': ('roomtone', -29), 'tv_close': ('roomtone', -30), 'aovivo': ('hum', -28), 'homeoffice': ('roomtone', -30), 'estudio': ('hum', -33), 'porteiro': ('hum', -29)}


def efeitos(shots, lines):
    n_sfx = n_amb = 0
    for i, s in enumerate(shots):
        p = s['params']; kind = s['scene']; sx = []
        sec = lines[s['clip']].get('sec')
        if i > 0:
            ant = shots[i - 1]; sec_ant = lines[ant['clip']].get('sec')
            mesmo_set = p.get('set') and p.get('set') == ant['params'].get('set')
            if sec != sec_ant:            # troca de bloco do roteiro: transição marcada
                sx.append({'at': -0.25, 'name': 'whoosh', 'gain': -9, 'seed': 3 + i % 5})
            elif kind == 'close' and ant['scene'] == 'close' and mesmo_set:
                if i % 2 == 0:            # corte seco entre closes: swish leve só em metade deles
                    sx.append({'at': -0.08, 'name': 'swish', 'gain': -19, 'seed': i % 7})
            elif kind == 'close':         # zoom para o rosto
                sx.append({'at': -0.12, 'name': 'swish', 'gain': -15, 'seed': i % 7})
            elif kind == 'cena' and not mesmo_set:
                sx.append({'at': -0.2, 'name': 'whoosh', 'gain': -14, 'seed': 2 + i % 5})
            elif kind not in SFX_KIND:
                sx.append({'at': -0.1, 'name': 'swish', 'gain': -16, 'seed': i % 7})
        for nome, g, at, extra in SFX_KIND.get(kind, []):
            if at < s['end'] - s['start']:
                sx.append({'at': at, 'name': nome, 'gain': g, **extra})
        sx += p.get('sfx', [])            # sons extras escritos à mão no plano.json
        if sx:
            s['sfx'] = sx; n_sfx += len(sx)
        amb = AMB_KIND.get(kind) or AMB_SET.get(p.get('set') or p.get('fundo'))
        if amb and kind not in ('cartela', 'numero', 'pct', 'mapa_br'):
            s['amb'] = {'name': amb[0], 'gain': amb[1], 'seed': 1}; n_amb += 1
    print(f'Efeitos sonoros: {n_sfx} sons em {len(shots)} cenas, ambiente em {n_amb} cenas')


# ---------- sons ligados a palavras da fala (padrão do canal) ----------
# radical da palavra (sem acento, minúsculo) -> (som, ganho dB, params). Vale pra narrador e personagens.
PALAVRAS = [
    (('craque', 'crac', 'croc', 'crocante', 'casquinha', 'estal', 'mordeu', 'mordida'), ('crunch', -9, {})),
    (('moeda', 'cofrinho', 'troco', 'trocado'), ('coins', -11, {})),
    (('carimb', 'deferido', 'indeferido'), ('stamp', -9, {})),
    (('toctoc',), ('knock', -13, {})),
    (('campainha', 'interfone'), ('doorbell', -13, {})),
    (('papel', 'protocolo', 'carta', 'bilhete', 'formulario', 'boleto', 'extrato'), ('paper', -14, {})),
    (('pix', 'pagou', 'pagamento', 'cobrou', 'comprou'), ('kaching', -15, {})),
    (('tomada', 'interruptor', 'disjuntor', 'desligou', 'apagou', 'clec', 'clique'), ('click', -10, {})),
    (('chuveiro', 'banho', 'agua', 'torneira'), ('splash', -18, {'dur': 1.2})),
    (('forno', 'fritura', 'chapa'), ('sizzle', -17, {'dur': 1.2})),
    (('cafe', 'cafezinho', 'pingado'), ('pour', -17, {'dur': 1.0})),
    (('telefone', 'ligacao', 'videochamada', 'celular'), ('phonebuzz', -17, {})),
    (('onibus', 'trem', 'caminhao'), ('carpass', -19, {'dur': 2.0})),
    (('relogio', 'despertador', 'madrugada'), ('tick', -12, {})),
    (('trovao', 'tempestade'), ('thunder', -16, {'dur': 2.5})),
    (('nevou', 'nevando', 'geada'), ('shimmer', -20, {})),
    # Natal, compras, praia, trânsito, dinheiro vivo  ( '=' no fim = palavra exata, não radical )
    (('natal', 'papai', 'presente', 'sino', 'pisca', 'noel'), ('jingle', -17, {})),
    (('sacola', 'compras', 'shopping', 'embrulh'), ('bag', -14, {})),
    (('praia', 'mar=', 'onda', 'litoral', 'ubatuba'), ('waves', -20, {'dur': 2.5})),
    (('buzina', 'transito', 'engarrafa', 'congestionamento'), ('horn', -16, {})),
    (('nota=', 'notas', 'dinheiro', 'cedula', 'grana', 'salario', 'decimo', 'bonus'), ('cash', -15, {})),
    (('aplaus', 'palmas'), ('applause', -18, {'dur': 2.0})),
    (('gol=', 'torcida', 'comemor'), ('cheer', -20, {'dur': 2.0})),
    # vídeo 12 (Sem Voos)
    (('turbina',), ('turbine', -17, {'dur': 2.0})),
    (('cancelad',), ('airport', -17, {})),
    (('decolou',), ('turbine', -14, {'dur': 2.5})),
]
# palavra que corta o som (música, ambiente e efeitos) por alguns segundos, a voz continua: radical -> duração (s)
CORTES_PALAVRA = {'silencio': 0.5}

# sons de palavras muito comuns esperam mais antes de repetir (segundos)
RECARGA = {'cash': 20, 'jingle': 15, 'waves': 15, 'kaching': 10, 'paper': 8, 'airport': 20, 'turbine': 12}


def _nrm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', w)


def efeitos_palavras(shots, W, max_por_cena=2, espaco=1.2, recarga=5.0):
    """Coloca um som no instante em que a palavra é dita. Limites: até 2 por cena, 1,2 s entre sons
    da mesma cena e 5 s antes de repetir o mesmo som (pra não virar barulho)."""
    ultimo = {}; total = 0
    for s in shots:
        ja = [c for c in s.get('sfx', [])]; usados = []
        if s['params'].get('semPalavras'): continue      # cena marcada no plano.json para não ganhar som por palavra
        for w in W:
            if w['start'] < s['start'] or w['start'] >= s['end']: continue
            n = _nrm(w['word'])
            if len(n) < 3: continue
            for radicais, (nome, g, extra) in PALAVRAS:
                if not any((n == r[:-1]) if r.endswith('=') else n.startswith(r) for r in radicais): continue
                at = round(w['start'] - s['start'] - 0.03, 3)
                if len(usados) >= max_por_cena or any(abs(at - u) < espaco for u in usados): break
                if w['start'] - ultimo.get(nome, -99) < RECARGA.get(nome, recarga): break
                if any(c.get('name') == nome and abs(c.get('at', 0) - at) < 1.0 for c in ja): break
                ja.append({'at': max(0, at), 'name': nome, 'gain': g, **extra}); usados.append(at); ultimo[nome] = w['start']; total += 1
                break
        if ja: s['sfx'] = ja
    print(f'Sons por palavra: {total}')


def cortes_e_pausas(shots, W):
    """story['silences'] (palavras de CORTES_PALAVRA) e story['music_gaps'] (param do plano 'pausaMusica': {em, dur, nth})."""
    sil, gaps = [], []
    for w in W:
        n = _nrm(w['word'])
        for r, d in CORTES_PALAVRA.items():
            if n.startswith(r) and (not sil or w['start'] - sil[-1]['t'] > 3): sil.append({'t': round(w['start'], 3), 'dur': d})
    for s in shots:
        pm = s['params'].get('pausaMusica')
        if not pm: continue
        alvo = _nrm(pm.get('em', '')); k = 0; t0 = None
        for w in W:
            if w['start'] < s['start'] or w['start'] >= s['end']: continue
            if alvo and _nrm(w['word']).startswith(alvo):
                if k == pm.get('nth', 0): t0 = w['start']; break
                k += 1
        if t0 is None: t0 = s['start'] + float(pm.get('at', 0))
        gaps.append({'t': round(t0 - 0.1, 3), 'dur': pm.get('dur', 2.0)})
    if sil or gaps: print(f'Cortes de silêncio: {len(sil)}; pausas de música: {len(gaps)}')
    return sil, gaps


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pasta', required=True); ap.add_argument('--projeto', required=True); ap.add_argument('--fake', action='store_true')
    ap.add_argument('--falas', default='falas.json')
    a = ap.parse_args()
    pasta = os.path.abspath(a.pasta)
    proj = os.path.join(BASE, 'viralstick', 'projects', a.projeto) if not os.environ.get('VS_PROJ') else os.environ['VS_PROJ']
    plano = json.load(open(os.path.join(pasta, 'plano.json'), encoding='utf-8'))
    if a.fake:
        falas = json.load(open(os.path.join(pasta, a.falas), encoding='utf-8')); t = 0.4; L = []; prev = None
        for f in falas:
            if prev: t += 0.9 if f.get('sec') != prev.get('sec') else (0.45 if f['spk'] != prev['spk'] else 0.35)
            d = max(0.8, len(f['txt']) / 14.5); L.append(dict(clip=f['n'], who=f['spk'], sec=f.get('sec'), start=round(t, 3), end=round(t + d, 3), text=f['txt'])); t += d; prev = f
        tl = dict(total=round(t + 1.2, 3), lines=L)
    else:
        tl = json.load(open(os.path.join(pasta, 'timeline_vozes.json'), encoding='utf-8'))
    W = palavras(tl, pasta, a.fake)
    lines = {l['clip']: l for l in tl['lines']}
    starts = []
    for clip, rng, kind, params in plano:
        l = lines[clip]; ss = sents(l['text']); cw = [w for w in W if w['clip'] == clip]
        st = l['start'] if (rng is None or rng[0] == 0 or not cw) else inicio_frase(ss, rng[0], cw)
        i0, i1 = (0, len(ss) - 1) if rng is None else rng
        if i1 >= len(ss): print('AVISO: frase fora do intervalo', clip, rng, len(ss))
        starts.append((max(0, st - 0.15), clip, kind, params, ' '.join(ss[i0:i1 + 1])))
    # garante ordem crescente: uma sub-cena que começaria antes (ou quase junto) da anterior é descartada
    ok = []
    for it in starts:
        if ok and it[0] < ok[-1][0] + 0.4 and ok[-1][1] == it[1]:   # mesma fala: estima pela proporção de palavras
            l = lines[it[1]]; ss = sents(l['text']); rr = next(p[1] for p in plano if p[0] == it[1] and p[2] == it[2])
            if rr:
                ntok = sum(len(x.split()) for x in ss); bef = sum(len(x.split()) for x in ss[:rr[0]])
                it = (max(0, l['start'] + (l['end'] - l['start']) * bef / max(1, ntok) - 0.15),) + tuple(it[1:])
        if ok and it[0] < ok[-1][0] + 0.4:
            print('AVISO: sub-cena descartada (tempo fora de ordem)', it[1], it[2]); continue
        ok.append(it)
    starts = ok
    shots = []
    for i, (st, clip, kind, params, line) in enumerate(starts):
        s0 = 0 if i == 0 else st; s1 = starts[i + 1][0] if i + 1 < len(starts) else tl['total']
        shots.append(dict(id=f'c{i + 1:03d}', start=round(s0, 3), end=round(s1, 3), line=line, scene=kind, clip=clip, vignette=False, bars='none', params=dict(kind=kind, **params)))
    sil, gaps = [], []
    if not os.environ.get('SEM_EFEITOS'): efeitos(shots, lines); efeitos_palavras(shots, W); sil, gaps = cortes_e_pausas(shots, W)
    curtos = [(s['id'], round(s['end'] - s['start'], 2)) for s in shots if s['end'] - s['start'] < 0.6]
    if curtos: print('AVISO cenas muito curtas:', curtos)
    # música por seção
    mus = []
    mp = os.path.join(pasta, 'musica.json')
    if os.path.exists(mp):
        secs = {}
        for l in tl['lines']: secs.setdefault(l.get('sec'), [l['start'], l['end']]); secs[l.get('sec')][1] = l['end']
        for sec, mood, inten in json.load(open(mp)):
            if sec in secs: mus.append(dict(start=round(secs[sec][0] - (0.4 if not mus else 0.45), 3), end=round(secs[sec][1] + 0.45, 3), mood=mood, intensity=inten))
        for x, y in zip(mus, mus[1:]): x['end'] = y['start']
        if mus: mus[0]['start'] = max(0, mus[0]['start']); mus[-1]['end'] = tl['total']
    titulo = open(os.path.join(pasta, 'titulo.txt'), encoding='utf-8').read().strip() if os.path.exists(os.path.join(pasta, 'titulo.txt')) else a.projeto
    for d in ('story', 'timeline', 'input', 'build', 'out'): os.makedirs(os.path.join(proj, d), exist_ok=True)
    json.dump(dict(title=titulo, duration=tl['total'], shots=shots, music=mus, sfx=[], silences=sil, music_gaps=gaps), open(os.path.join(proj, 'story', 'shots.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(W, open(os.path.join(proj, 'timeline', 'words.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    cp = os.path.join(proj, 'config.json'); c = json.load(open(cp, encoding='utf-8')) if os.path.exists(cp) else {}
    c.update(title=titulo, duration=tl['total'], voiceover='input/voiceover.wav'); c.setdefault('aspect', '16:9'); c.setdefault('resolution', '1080p'); c.setdefault('fps', 24)
    c.setdefault('style', 'toon'); c.setdefault('music', {'enabled': True, 'gainDb': -19}); c.setdefault('sfx', {'enabled': True, 'gainDb': -8}); c.setdefault('loudness', -14)
    json.dump(c, open(cp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if not a.fake: shutil.copy(os.path.join(pasta, 'voiceover.wav'), os.path.join(proj, 'input', 'voiceover.wav'))
    d = [s['end'] - s['start'] for s in shots]
    print(f'{len(shots)} cenas, {tl["total"]:.1f} s; mediana {sorted(d)[len(d) // 2]:.1f}s, menor {min(d):.1f}s, maior {max(d):.1f}s')


if __name__ == '__main__':
    main()

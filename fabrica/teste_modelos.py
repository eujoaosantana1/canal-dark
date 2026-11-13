# -*- coding: utf-8 -*-
"""Testa as vozes personalizadas (voice_...) em outros modelos de TTS do Gemini,
que têm cota diária própria. Gera um MP3 de comparação na pasta do vídeo."""
import argparse, json, os, subprocess, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import gerar_vozes as gv

FRASES = [('SEU JURA', 'Aqui é no dinheiro ou no caderninho.'),
          ('DUDA', 'Vô! O senhor colocou Pix!')]


def listar_tts(chave):
    nomes = []
    url = 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200'
    while url:
        req = urllib.request.Request(url, headers={'x-goog-api-key': chave})
        d = json.loads(urllib.request.urlopen(req, timeout=60).read().decode('utf-8'))
        nomes += [m['name'].split('/', 1)[1] for m in d.get('models', []) if 'tts' in m['name'].lower()]
        tok = d.get('nextPageToken')
        url = (f'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&pageToken={tok}'
               if tok else None)
    return nomes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pasta', required=True)
    a = ap.parse_args()
    pasta = os.path.abspath(a.pasta)
    elenco = json.load(open(os.path.join(pasta, 'elenco.json'), encoding='utf-8'))
    saida = os.path.join(pasta, 'teste_modelos'); os.makedirs(saida, exist_ok=True)
    chave = gv.ler_chave()
    modelos = listar_tts(chave)
    gv.log('Modelos de TTS na sua conta:', modelos)
    candidatos = [m for m in modelos if m != 'gemini-3.8-flash-tts']
    resultado, arquivos = {}, []
    for m in candidatos:
        gv.MODEL = m
        api = gv.API(chave)
        api.ok = {}
        api._salvar_ok = lambda: None
        resultado[m] = {}
        for spk, txt in FRASES:
            p = os.path.join(saida, f'{m}__{spk.replace(" ", "_")}.wav')
            try:
                ok, err = api.falar(elenco[spk]['voz'], txt, p)
            except gv.CotaDiaria as e:
                ok, err = False, 'COTA DIÁRIA ESGOTADA'
            resultado[m][spk] = 'OK' if ok else err[:200]
            gv.log(f'{m:<40} {spk:<9} {"OK" if ok else "FALHOU: " + err[:200]}')
            if ok:
                arquivos.append(p)
            else:
                break   # se a 1a voz falhou neste modelo, não gasta outro pedido
    json.dump(resultado, open(os.path.join(saida, 'resultado.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    if arquivos:
        lista = os.path.join(saida, 'lista.txt')
        with open(lista, 'w', encoding='utf-8') as f:
            for p in arquivos:
                f.write(f"file '{p.replace(chr(92), '/')}'\n")
        mp3 = os.path.join(pasta, 'comparacao_modelos_gemini.mp3')
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista,
                        '-af', 'apad=pad_dur=0.8', '-ar', '24000', '-ac', '1', '-b:a', '128k', mp3],
                       stdin=subprocess.DEVNULL)
        gv.log('Comparação salva em', mp3)
    gv.log('ORDEM NO MP3:', [os.path.basename(p) for p in arquivos])


if __name__ == '__main__':
    main()

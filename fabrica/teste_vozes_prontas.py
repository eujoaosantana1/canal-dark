# -*- coding: utf-8 -*-
"""Testa se os outros modelos de TTS do Gemini (cada um com cota diária própria)
aceitam as vozes prontas que o canal usa (Bodi, Nika, Ludo...).
Gera um MP3 por modelo e um resultado.json na pasta do vídeo."""
import argparse, json, os, subprocess, sys, time

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import gerar_vozes as gv
from teste_modelos import listar_tts

PRINCIPAIS = {'gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'}
VOZES = ['Bodi', 'Mako', 'Ludo', 'Koda', 'Nika', 'Kira', 'Lumi', 'Sola', 'Fola']
FRASE = 'E se, de uma hora pra outra, nevasse no Brasil inteiro? Eu sou a voz {v}.'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pasta', required=True)
    a = ap.parse_args()
    pasta = os.path.abspath(a.pasta)
    saida = os.path.join(pasta, 'teste_vozes_prontas'); os.makedirs(saida, exist_ok=True)
    chave = gv.ler_chave()
    modelos = [m for m in listar_tts(chave) if m not in PRINCIPAIS]
    gv.log('Modelos extras de TTS na sua conta:', modelos)
    resultado = {}
    for m in modelos:
        gv.MODEL = m
        api = gv.API(chave); api.ok = {}; api._salvar_ok = lambda: None
        resultado[m] = {}; arquivos = []
        for v in VOZES:
            p = os.path.join(saida, f'{m}__{v}.wav')
            try:
                ok, err = api.falar(v, FRASE.format(v=v), p)
            except gv.CotaDiaria:
                ok, err = False, 'COTA DIÁRIA ESGOTADA'
            resultado[m][v] = 'OK' if ok else err[:200]
            gv.log(f'{m:<40} {v:<6} {"OK" if ok else "FALHOU: " + err[:160]}')
            if ok: arquivos.append(p)
            elif v == 'Bodi' and 'COTA' not in err:
                break   # se nem o narrador funciona neste modelo, não gasta mais pedidos
            time.sleep(7)   # limite de 10 pedidos por minuto
        if arquivos:
            lista = os.path.join(saida, f'lista_{m}.txt')
            with open(lista, 'w', encoding='utf-8') as f:
                for p in arquivos: f.write(f"file '{p.replace(chr(92), '/')}'\n")
            mp3 = os.path.join(pasta, f'vozes_prontas__{m}.mp3')
            subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista,
                            '-af', 'apad=pad_dur=0.8', '-ar', '24000', '-ac', '1', '-b:a', '128k', mp3],
                           stdin=subprocess.DEVNULL)
            gv.log('Amostra salva em', mp3)
    json.dump(resultado, open(os.path.join(saida, 'resultado.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    gv.log('RESUMO:')
    for m, r in resultado.items():
        oks = [v for v, s in r.items() if s == 'OK']
        gv.log(f'  {m:<40} {len(oks)}/{len(VOZES)} vozes OK: {", ".join(oks) or "nenhuma"}')


if __name__ == '__main__':
    main()

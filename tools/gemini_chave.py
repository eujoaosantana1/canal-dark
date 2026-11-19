"""LÃª a chave do Gemini sem mostrÃ¡-la (mesma lÃ³gica do fabrica/gerar_vozes.py)."""
import glob, os, re, sys
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

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


"""Gera os recortes das capas (personagens/objetos em PNG transparente + cenários bg_*.jpg) com o motor do ViralStick.
Uso: python tools\\recortes_capa.py 03      (vídeos com lista abaixo: 03, 04, 05, 06, 07)
Usa o projeto viralstick\\projects\\capas-escala (cena scenes\\shots\\capas.js): 1 quadro por segundo, foto em 4K (--scale 2),
fundo chroma verde (ou magenta para quem veste verde) removido aqui. Grava em <pasta>\\publicacao\\capa_assets."""
import json, os, subprocess, sys
import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__)); BASE = os.path.dirname(AQUI)
VS = os.path.join(BASE, 'viralstick'); PROJ = os.path.join(VS, 'projects', 'capas-escala')
os.environ.setdefault('VS_CHANNEL', 'msedge')  # mesmo navegador dos .bat
MAG = '#ff00ff'
E = [-0.3, 0.05]  # olhar para a esquerda (para o texto)


def r(k, expr, look=E, bg=None, boca=0):
    p = {'kind': 'retrato', 'k': k, 'expr': expr, 'look': look}
    if bg: p['bg'] = bg
    if boca: p['boca'] = boca
    return p


def obj(fn, s=3, args=(), bg=None, y=0.5):
    p = {'kind': 'objeto', 'fn': fn, 's': s, 'args': list(args), 'y': y}
    if bg: p['bg'] = bg
    return p


def bg(nome, o=None): return {'kind': 'fundo', 'set': nome, 'o': o or {}}


LISTAS = {
    '03': ('03 - Conta de Luz', [
        ('neide_choque', r('NEIDE', 'shocked')), ('neide_brava', r('NEIDE', 'angry')), ('neide_confusa', r('NEIDE', 'confused')),
        ('gato_smug', r('GATO', 'smug')),
        ('bg_casa', bg('casa')), ('bg_casa_noite', bg('casa_noite')), ('bg_muro', bg('muro', {'semGato': True}))]),
    '04': ('04 - Um Feriado por Ano', [
        ('rose_choque', r('ROSE', 'shocked')), ('rose_feliz', r('ROSE', 'happy', boca=0.5)), ('fabio_smug', r('FABIO', 'smug')),
        ('lara_feliz', r('LARA', 'happy', boca=0.5)), ('pote', obj('F.pote', 3.2)), ('calendario', obj('F.calendarioParede', 3)),
        ('bg_loja', bg('loja')), ('bg_casa_rose', bg('casa_rose')), ('bg_praia', bg('praia_vazia')), ('bg_outdoor', bg('outdoor'))]),
    '05': ('05 - Pao Frances', [
        ('nene_choque', r('NENE', 'shocked')), ('nene_smug', r('NENE', 'smug')), ('luc_confuso', r('LUC', 'confused')),
        ('luc_choque', r('LUC', 'shocked')), ('pao', obj('PF.pao', 5)), ('baguete', obj('PF.baguete', 3)),
        ('bg_padaria', bg('padaria')), ('bg_rua_padarias', bg('rua_padarias')), ('bg_paris', bg('paris'))]),
    '06': ('06 - Neve no Brasil', [
        ('chiquinha_frio_choque', r('CHIQUINHA_FRIO', 'shocked', bg=MAG)), ('chiquinha_feliz', r('CHIQUINHA', 'happy', boca=0.5, bg=MAG)),
        ('chiquinha_choque', r('CHIQUINHA', 'shocked', bg=MAG)), ('arlindo_smug', r('ARLINDO', 'smug')),
        ('carrinho_neve', obj('NV.carrinho', 1.5, [True], bg=MAG, y=0.8)),
        ('bg_praca_neve', bg('praca_neve')), ('bg_praca_sol', bg('praca_sol')), ('bg_urupema', bg('urupema_vazia'))]),
    '07': ('07 - Salario Minimo', [
        ('taina_cansada', r('TAINA', 'tired', bg=MAG)), ('taina_choque', r('TAINA', 'shocked', bg=MAG)), ('taina_triste', r('TAINA', 'sad', bg=MAG)),
        ('contador_smug', r('CONTADOR', 'smug')),
        ('bg_comodo', bg('comodo')), ('bg_paulista', bg('paulista')), ('bg_ponto', bg('ponto'))]),
    # vídeo 12 usa o projeto capas-semvoos (tem o elenco e os cenários do Sem Voos)
    '12': ('12 - Sem Voos', [
        ('valdemar_choque', r('VALDEMAR', 'shocked')), ('valdemar_triste', r('VALDEMAR', 'sad')), ('valdemar_feliz', r('VALDEMAR', 'happy', boca=0.5)),
        ('nene_choque', r('NENE_TAXI', 'shocked', bg=MAG)), ('lucia_preocupada', r('LUCIA', 'worried')),
        ('caixa_orgao', obj('SV.caixaOrgao', 3, y=0.72)), ('relogio', obj('SV.relogio', 380, [3.6])), ('aviao', obj('SV.aviao', 2.6, [{'rot': -0.15}])),
        ('bg_ponto_taxi', bg('ponto_taxi_silencio')), ('bg_painel', bg('painel_voos', {'k': 1})), ('bg_painel_vermelho', bg('painel_voos', {'vermelho': True})),
        ('bg_hospital', bg('hospital', {'semRelogio': True}))], 'capas-semvoos'),
}


def chave(im, cor):
    """Remove o fundo chroma (diferença de canais) e desfaz a mistura nas bordas."""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    if cor == MAG: d = np.minimum(R, B) - G; K = np.array([255, 0, 255], np.float32)
    else: d = G - np.maximum(R, B); K = np.array([0, 255, 0], np.float32)
    al = np.clip(1 - d / 255.0, 0, 1)
    al[al > 0.88] = 1; al[al < 0.06] = 0
    rgb = (a - (1 - al[..., None]) * K) / np.maximum(al[..., None], 1e-3)
    out = np.dstack([np.clip(rgb, 0, 255), al * 255]).astype(np.uint8)
    res = Image.fromarray(out, 'RGBA')
    bb = res.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    if bb:
        m = 12; bb = (max(0, bb[0] - m), max(0, bb[1] - m), min(res.width, bb[2] + m), min(res.height, bb[3] + m)); res = res.crop(bb)
    return res


def main(nn):
    pasta, itens, *resto = LISTAS[nn]
    nome_proj = resto[0] if resto else 'capas-escala'; PROJ = os.path.join(VS, 'projects', nome_proj)
    shots = []
    for i, (nome, p) in enumerate(itens):
        shots.append({'id': f'c{i + 1:03d}', 'start': float(i), 'end': float(i + 1), 'line': '', 'scene': p['kind'], 'clip': '001',
                      'vignette': False, 'bars': 'none', 'params': p})
    dur = float(len(itens))
    json.dump({'title': 'capas', 'duration': dur, 'shots': shots}, open(os.path.join(PROJ, 'story', 'shots.json'), 'w', encoding='utf8'), ensure_ascii=False)
    json.dump([n for n, _ in itens], open(os.path.join(PROJ, 'build', 'nomes.json'), 'w', encoding='utf8'))
    cfgp = os.path.join(PROJ, 'config.json'); cfg = json.load(open(cfgp, encoding='utf8')); cfg['duration'] = dur
    json.dump(cfg, open(cfgp, 'w', encoding='utf8'), indent=1)
    st = os.path.join(PROJ, 'build', 'stills')
    for f in os.listdir(st) if os.path.isdir(st) else []: os.remove(os.path.join(st, f))
    ts = [i + 0.5 for i in range(len(itens))]
    subprocess.run(['node', 'render.mjs', '--project', 'projects/' + nome_proj, '--stills', ','.join(str(t) for t in ts), '--scale', '2'], cwd=VS, check=True, shell=(os.name == 'nt'))
    dest = os.path.join(BASE, pasta, 'publicacao', 'capa_assets'); os.makedirs(dest, exist_ok=True)
    for t, (nome, p) in zip(ts, itens):
        im = Image.open(os.path.join(st, f'{t}s_{t:.2f}.png'))
        if p['kind'] == 'fundo': im.convert('RGB').save(os.path.join(dest, nome + '.jpg'), quality=92)
        else: chave(im, p.get('bg', '#00ff00')).save(os.path.join(dest, nome + '.png'))
        print('ok', nome)


if __name__ == '__main__':
    main(sys.argv[1])

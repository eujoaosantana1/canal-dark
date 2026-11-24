"""Narração com uma voz única do Google Cloud TTS (Chirp 3 HD) a partir do roteiro — versão com idioma.

Uso: python narrar_chirp.py roteiro.txt pasta_saida [Voz] [--idioma es-US] [--so 012,045]
- Igual ao tools\\narrar_chirp.py do Dia do Colapso, mas o idioma é configurável (padrão es-US, para o canal do México).
- Lê as linhas "NARRADOR: ..." do roteiro, gera um WAV por fala (clips/NNN.wav),
  monta voiceover.wav com pausas (curta entre falas, longa na troca de seção) e timeline.json.
- --so: regera só as falas indicadas e remonta a trilha.
Chave: chave_tts.txt ou chave_youtube.txt na pasta do script, nas pastas acima, ou em CHAVE_TTS.
"""
import sys, os, json, base64, re, wave, urllib.request, urllib.parse, time

PAUSA_FALA, PAUSA_SECAO, TAXA = 0.45, 1.3, 24000


def achar_chave():
    if os.environ.get("CHAVE_TTS"):
        return os.environ["CHAVE_TTS"].strip()
    aqui = os.path.dirname(os.path.abspath(__file__))
    dirs = [aqui]
    d = aqui
    for _ in range(4):
        d = os.path.dirname(d); dirs.append(d)
    dirs.append(os.getcwd())
    for d in dirs:
        for n in ("chave_tts.txt", "chave_youtube.txt"):
            p = os.path.join(d, n)
            if os.path.isfile(p):
                return open(p, encoding="utf-8-sig").read().strip()
    sys.exit("Chave não encontrada.")


def ler_roteiro(caminho):
    falas, secao = [], ""
    for linha in open(caminho, encoding="utf-8"):
        linha = linha.strip()
        m = re.match(r"^\[(\d+)\. (.+)\]$", linha)
        if m:
            secao = m.group(1) + ". " + m.group(2)
        elif linha.startswith("NARRADOR:"):
            falas.append({"n": f"{len(falas) + 1:03d}", "secao": secao, "texto": linha.split(":", 1)[1].strip()})
    return falas


def sintetizar(chave, voz, idioma, texto, destino):
    corpo = {"input": {"text": texto},
             "voice": {"languageCode": idioma, "name": f"{idioma}-Chirp3-HD-{voz}"},
             "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": TAXA}}
    url = "https://texttospeech.googleapis.com/v1/text:synthesize?" + urllib.parse.urlencode({"key": chave})
    for tentativa in range(4):
        try:
            req = urllib.request.Request(url, json.dumps(corpo).encode(), {"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=120) as r:
                audio = base64.b64decode(json.load(r)["audioContent"])
            open(destino, "wb").write(audio)  # LINEAR16 já vem com cabeçalho WAV
            return
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "ignore")
            if e.code in (429, 500, 503) and tentativa < 3:
                time.sleep(5 * (tentativa + 1)); continue
            sys.exit(f"Erro {e.code} na fala: {msg[:300]}")


def montar(falas, pasta):
    saida = wave.open(os.path.join(pasta, "voiceover.wav"), "wb")
    saida.setnchannels(1); saida.setsampwidth(2); saida.setframerate(TAXA)
    t, linhas, anterior = 0.0, [], None
    for f in falas:
        if anterior is not None:
            pausa = PAUSA_SECAO if f["secao"] != anterior else PAUSA_FALA
            saida.writeframes(b"\x00\x00" * int(pausa * TAXA)); t += pausa
        w = wave.open(os.path.join(pasta, "clips", f["n"] + ".wav"), "rb")
        quadros = w.readframes(w.getnframes()); dur = w.getnframes() / w.getframerate(); w.close()
        saida.writeframes(quadros)
        linhas.append({**f, "start": round(t, 3), "end": round(t + dur, 3)}); t += dur
        anterior = f["secao"]
    saida.close()
    json.dump({"duracao": round(t, 3), "falas": linhas}, open(os.path.join(pasta, "timeline.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    return t


if __name__ == "__main__":
    a = sys.argv[1:]
    so, idioma = None, "es-US"
    if "--so" in a:
        i = a.index("--so"); so = set(a[i + 1].split(",")); del a[i:i + 2]
    if "--idioma" in a:
        i = a.index("--idioma"); idioma = a[i + 1]; del a[i:i + 2]
    roteiro, pasta = a[0], a[1]
    voz = a[2] if len(a) > 2 else "Algenib"
    chave = achar_chave()
    falas = ler_roteiro(roteiro)
    os.makedirs(os.path.join(pasta, "clips"), exist_ok=True)
    for f in falas:
        dest = os.path.join(pasta, "clips", f["n"] + ".wav")
        if (so and f["n"] in so) or (not so and not os.path.exists(dest)):
            sintetizar(chave, voz, idioma, f["texto"], dest)
            print("ok", f["n"], flush=True)
    dur = montar(falas, pasta)
    print(f"Pronto: {len(falas)} falas, {dur / 60:.1f} min -> {pasta}/voiceover.wav")

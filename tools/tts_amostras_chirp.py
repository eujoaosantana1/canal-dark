"""Amostras das vozes Chirp 3 HD (Google Cloud Text-to-Speech) em português do Brasil.

Uso (na pasta Canal Dark):
  python tools\\tts_amostras_chirp.py            -> todas as vozes Chirp 3 HD pt-BR, 2 trechos cada
  python tools\\tts_amostras_chirp.py Charon Kore -> só as vozes escolhidas

Chave: chave_tts.txt ou, se não existir, chave_youtube.txt (a chave precisa ter a
"Cloud Text-to-Speech API" liberada nas restrições).
Saída: pasta amostras_chirp\\ com um MP3 por voz e trecho, e um resumo.txt.
Custo: cerca de 1.000 caracteres por voz; a cota grátis do Chirp 3 HD é de 1 milhão por mês.
Só usa a biblioteca padrão do Python.
"""
import sys, os, json, base64, urllib.request, urllib.parse

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://texttospeech.googleapis.com/v1/"

TRECHOS = {
    "sobrevivencia": ("Dia um. A energia caiu às três e quarenta da tarde, no meio de uma terça-feira comum. "
                      "Primeiro foi o semáforo. Depois o metrô. Depois o celular, que ficou mostrando sem sinal, "
                      "como se alguém tivesse desligado o mundo da tomada. Eu achei que voltava em uma hora. "
                      "Ninguém ali sabia, mas a cidade de São Paulo ia passar os próximos trinta dias no escuro."),
    "valdir": ("Valdir, quarenta e oito anos. Motorista da linha Pimentas Centro, em Guarulhos. "
               "Vinte e seis anos de carteira assinada. Nunca atrasou um boleto. "
               "Pede CPF na nota até no chiclete. E guarda todos os cupons fiscais numa caixa de sapato. Desde mil novecentos e noventa e nove."),
}


def chave():
    for nome in ("chave_tts.txt", "chave_youtube.txt"):
        p = os.path.join(RAIZ, nome)
        if os.path.isfile(p):
            return open(p, encoding="utf-8").read().strip()
    sys.exit("Falta a chave (chave_tts.txt ou chave_youtube.txt na pasta Canal Dark).")


def chamar(metodo, caminho, corpo=None, **params):
    params["key"] = K
    url = API + caminho + "?" + urllib.parse.urlencode(params)
    dados = json.dumps(corpo).encode("utf-8") if corpo is not None else None
    req = urllib.request.Request(url, data=dados, method=metodo, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "ignore")
        if "SERVICE_DISABLED" in msg or "has not been used" in msg:
            sys.exit("A Cloud Text-to-Speech API não está ativada neste projeto.")
        if "API_KEY_SERVICE_BLOCKED" in msg or "are blocked" in msg:
            sys.exit("A chave não tem permissão para a Cloud Text-to-Speech API (ajuste as restrições da chave).")
        sys.exit(f"Erro {e.code}: {msg[:400]}")


if __name__ == "__main__":
    K = chave()
    vozes = [v for v in chamar("GET", "voices", languageCode="pt-BR")["voices"] if "Chirp3-HD" in v["name"]]
    filtro = [a.lower() for a in sys.argv[1:]]
    if filtro:
        vozes = [v for v in vozes if v["name"].split("-")[-1].lower() in filtro]
    if not vozes:
        sys.exit("Nenhuma voz Chirp 3 HD pt-BR encontrada (ou nenhuma bate com os nomes pedidos).")
    pasta = os.path.join(RAIZ, "amostras_chirp")
    os.makedirs(pasta, exist_ok=True)
    resumo = []
    for v in vozes:
        nome = v["name"].split("-")[-1]
        genero = {"MALE": "masculina", "FEMALE": "feminina"}.get(v.get("ssmlGender"), "?")
        for chave_t, texto in TRECHOS.items():
            r = chamar("POST", "text:synthesize", {
                "input": {"text": texto},
                "voice": {"languageCode": "pt-BR", "name": v["name"]},
                "audioConfig": {"audioEncoding": "MP3"},
            })
            arq = os.path.join(pasta, f"{nome}_{genero}_{chave_t}.mp3")
            open(arq, "wb").write(base64.b64decode(r["audioContent"]))
        resumo.append(f"{nome} ({genero})")
        print("ok", nome, genero)
    open(os.path.join(pasta, "resumo.txt"), "w", encoding="utf-8").write(
        "Vozes geradas:\n" + "\n".join(resumo) + "\n\nTrechos:\n" + "\n\n".join(f"[{k}] {t}" for k, t in TRECHOS.items()))
    total = len(vozes) * sum(len(t) for t in TRECHOS.values())
    print(f"Pronto: {len(vozes)} vozes em {pasta} (~{total} caracteres usados da cota grátis)")

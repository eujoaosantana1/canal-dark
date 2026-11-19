# Canal Dark — Repartição do Universo (instruções para o Claude Code)

Esta pasta (`Downloads\Canal Dark`) produz os vídeos do canal "Repartição do Universo" (@reparticaodouniverso):
histórias de bonecos palito animadas com o kit ViralStick, narradas com o Gemini TTS.
Responda sempre em português do Brasil.

## Regras
- NUNCA abra, leia, mostre ou copie `chave_gemini.txt`. Os scripts leem a chave sozinhos.
- Não apague arquivos dos vídeos (`vozes/`, `voiceover.wav`, `estado_vozes.json`, `VIDEO_FINAL_*.mp4`) sem o usuário pedir.
- Os `.bat` terminam com `pause`. Para rodar sem travar, entre na pasta do vídeo e use: `cmd /c "echo.| .\4_video_final.bat"`
  (o `.\` antes do nome é obrigatório no PowerShell; sem ele o comando não roda). Rode em segundo plano e confira os logs no fim.
- Rode um render por vez (a placa de vídeo é uma só). Geração de vozes de modelos diferentes pode rodar em paralelo.

## Estrutura
- `fabrica\gerar_vozes.py` — gera as vozes (lotes por personagem, confere com faster-whisper). Cota: 100 pedidos/dia por modelo,
  renova às 5h (Brasília). Modelos: `gemini-3.8-flash-tts` (principal) e `gemini-3.8-flash-lite-tts` (Lite, `--modelo`).
  Só esses dois aceitam vozes `voice_...` do Voice Design.
- `fabrica\montar_video.py` — monta as cenas a partir de `plano.json`, coloca música e efeitos sonoros
  (por tipo de cena e por PALAVRA da fala: craque→crocância, moeda→moedas, carimbo, papel, Pix→caixa registradora, etc.).
- `viralstick\` — motor de render (`render.mjs`) e áudio (`audio\mix.py`, `audio\sfx.py`).
- `logs\` — logs de cada etapa (`<apelido>_montar.log`, `_render.log`, `_mix.log`, `vozes_<apelido>.log`).

## Pasta de cada vídeo (`NN - Nome`)
`roteiro_*.txt`, `falas.json`, `elenco.json` (voz de cada personagem), `plano.json` (cenas), `musica.json`, `titulo.txt`,
`cenas_<apelido>.zip` (código das cenas) e os `.bat`:
1. `1_testar_vozes.bat` — 1 fala por personagem.
2. `2_gerar_vozes.bat` (modelo principal) ou `2b_gerar_vozes_lite.bat` (Lite) — gera `vozes\`, `voiceover.wav`, `timeline_vozes.json`.
3. `3_previa_30s.bat` — `PREVIA_30s.mp4`.
4. `4_video_final.bat` — `VIDEO_FINAL_<apelido>.mp4` (monta + render GPU ~4 min + mix). Leva ~10 min no total.

| Pasta | Projeto | Apelido |
|---|---|---|
| 01 - Imposto Vida Inteira | (primeiro vídeo, já postado) | final |
| 02 - Internet 72 Horas | internet-72h | 72h |
| 03 - Conta de Luz | conta-de-luz | luz |
| 04 - Um Feriado por Ano | um-feriado | feriado |
| 05 - Pao Frances | pao-frances | pao |
| 06 - Neve no Brasil | neve-brasil | neve |
| 07 - Salario Minimo | salario-minimo | salario |
| 08 - Decimo Terceiro | decimo-terceiro | decimo |
| 09 - Doze Vezes | doze-vezes | doze |
| 10 - Escala 6x1 | escala-6x1 | escala |
| 11 - Apagao Nuvem | apagao-nuvem | apagao |
| 12 - Sem Voos | sem-voos | semvoos |

## Como conferir que deu certo
- Vozes: fim do `logs\vozes_<apelido>.log` traz `RESUMO {'OK': N, 'ERRO': M}` e `TRILHA PRONTA`. Erros com "virgula", "centavos"
  ou nomes estrangeiros costumam ser só a transcrição da conferência.
- Vídeo: `logs\<apelido>_montar.log` mostra "Efeitos sonoros" e "Sons por palavra"; `logs\<apelido>_mix.log` termina com
  `FINAL VIDEO`; o arquivo `VIDEO_FINAL_<apelido>.mp4` aparece na pasta do vídeo com data de agora.

## Decisões em vigor (19/11/2026)
- Publicação: 1 vídeo por dia. Publicados: 01 (11/11), 02 (12/11), 11 (13/11, assunto do dia). Fila: 12 (Sem Voos, gancho de notícia, antes do 03), depois 03 a 10, nessa ordem.
- Capas (padrão desde 19/11/2026): modelo da capa do 02 (`referencias\capa_modelo_72h.jpg`), feito com `tools\capas_ia.py`.
  `python tools\capas_ia.py gerar NN A B C` gera a ilustração SEM texto pelo Gemini (`gemini-3-pro-image`, ~US$ 0,13/imagem, cota separada
  das vozes) com a capa modelo + os recortes de `publicacao\capa_assets` como referência; guarda todas as tentativas em `publicacao\capa_ia\`.
  `python tools\capas_ia.py montar NN` aplica o título (Luckiest Guy, destaque #FFD23F, resto branco, borda preta, sombra) e grava
  capa_A/B/C.jpg + comparacao_capas.jpg. A cena de cada capa fica no dicionário `VIDEOS` do script; `ESCOLHA` fixa a tentativa usada.
  Regras: cena clara e saturada, contorno grosso, título de 2 a 4 palavras no topo direito, informação em placas dentro da cena, sem selo e
  sem caixa solta. O anjo + diagonal Universo x Terra (`'divisao': True`) é só uma opção: variar a composição entre A/B/C e entre vídeos.
  Sem logos de marcas reais. Mostrar o comparacao_capas.jpg e esperar aprovação antes do próximo vídeo.
  Já no padrão novo: 03 a 12. Capas anteriores (estilo `tools\capas_estilo.py`) ficam em `publicacao\capas_antigas\` com final `_estilo`.
  Cada capa A/B/C combina com o título do `seo_<apelido>.txt` indicado nele (no 09: A=título 2, B=título 3, C=título 1).
- Marionetes (em teste desde 19/11/2026, ainda não é o padrão dos vídeos): personagens no traço das capas, em peças, animados pelo motor.
  `python tools\marionete.py gerar NOME --ref recorte.png --desc "..."` (Gemini, ~10 imagens, ~US$ 1,30 por personagem, uma vez só) e
  `python tools\marionete.py pecas NOME` -> `viralstick\marionetes\NOME\` (peças PNG + `rig.json` com pivôs; folhas brutas em `_fonte\`).
  Cenário pintado: `python tools\marionete.py cenario PROJETO NOME "descrição"` -> `projects\PROJETO\cenarios\NOME.jpg`.
  Cena: copiar `viralstick\modelos\shots\marionete.js` para `scenes\shots\` do projeto; no plano, kind `marionete` com
  m, quem, fundo|set, plano (close|medio|inteiro), x, andar, poses ([t ou '@palavra', nome]), olhar (F|L|R), expr, texto.
  Poses prontas em `engine\marionete.js` (neutro, explica, explica_d, abre, encolhe, aponta_e, aponta_d, aponta_cima, comemora, cintura, acena).
  Piloto: projeto `escala-6x1-marionete` (trechos 20-30 s e 48-66 s do vídeo 10); vídeos de comparação em `pilotos\`.
- Formato extra "Jornal do Universo" (telejornal) para assuntos do dia: cenas em `cenasapagao.js` (vinheta, estudio, tv_jura, tv_close, aovivo, homeoffice, grafico, relembre, caixas, porteiro, lista_dns, telas_azuis, cartao, emails); cenários em `sets\apagao.js`.
- Títulos: não repetir a palavra central de um vídeo recente.
- Cota de voz: se a cota acabar, o `11 - Apagao Nuvem\5_rodar_as_5h.bat` serve de modelo para gerar vozes + vídeo sozinho depois de um horário (hoje 7h05).

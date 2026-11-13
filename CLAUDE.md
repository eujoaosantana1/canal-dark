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

## Como conferir que deu certo
- Vozes: fim do `logs\vozes_<apelido>.log` traz `RESUMO {'OK': N, 'ERRO': M}` e `TRILHA PRONTA`. Erros com "virgula", "centavos"
  ou nomes estrangeiros costumam ser só a transcrição da conferência.
- Vídeo: `logs\<apelido>_montar.log` mostra "Efeitos sonoros" e "Sons por palavra"; `logs\<apelido>_mix.log` termina com
  `FINAL VIDEO`; o arquivo `VIDEO_FINAL_<apelido>.mp4` aparece na pasta do vídeo com data de agora.

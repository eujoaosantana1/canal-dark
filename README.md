# Guia do Canal Dark — Repartição do Universo

Guia para quem entra no projeto. Reúne o que já foi decidido, como a produção funciona e como montar o ambiente no próprio PC.
Atualizado em 12/11/2026.

---

## 1. O canal

- **Nome:** Repartição do Universo (@reparticaodouniverso), canal "dark" no YouTube.
- **Formato:** histórias animadas com bonecos palito. Um brasileiro comum vive uma situação do dia a dia com números reais (contas, preços, trabalho, costumes), e a "Repartição / Suporte Técnico do Universo" atende um pedido dele de um jeito absurdo.
- **Duração:** cerca de 8 minutos, com 85 a 90 falas por vídeo.
- **Meta:** postar 3 vídeos por dia. Com pelo menos 6 vídeos prontos, deixar rodando e ver se o YouTube entrega e o público aceita. Depois, escalar para vídeos de 15, 20, 30 minutos ou 1 hora.
- **Organização:** modelo de 7 agentes (estrategista, roteirista, designer de capas, SEO, produtor, publicador, analista). Os primeiros criados foram o Designer e o SEO.

## 2. Vídeos produzidos

| Pasta | Tema | Apelido |
|---|---|---|
| 01 - Imposto Vida Inteira | Valdir descobre quanto pagou de imposto na vida | final |
| 02 - Internet 72 Horas | E se a internet parasse por 72 horas | 72h |
| 03 - Conta de Luz | Conta de luz | luz |
| 04 - Um Feriado por Ano | Um feriado por ano | feriado |
| 05 - Pao Frances | Pão francês | pao |
| 06 - Neve no Brasil | Neve no Brasil | neve |
| 07 - Salario Minimo | Salário mínimo | salario |
| 08 - Decimo Terceiro | Décimo terceiro | decimo |
| 09 - Doze Vezes | Doze vezes | doze |
| 10 - Escala 6x1 | Escala 6x1 | escala |

Os 10 já têm `VIDEO_FINAL_*.mp4` gerado. O vídeo 1 foi publicado em 11/11/2026.
Ideias guardadas para os próximos: cafezinho de verdade (do pé até o balcão), gasolina a R$ 2, ônibus de graça.

## 3. Padrões editoriais (valem para todo vídeo)

- **Dados reais com fonte**, de preferência oficiais (IBGE, DIEESE, Aneel, ANP, Procon). O roteiro traz a lista "DADOS REAIS USADOS".
- **Tema político:** mostrar os dois lados, sem opinar.
- **Números por extenso** nas falas, para a voz não errar.
- **Estrutura do roteiro:** personagens, 10 seções `[N. TÍTULO]`, falas no formato `PERSONAGEM: texto`, e final com uma pergunta para os comentários.
- **Efeitos sonoros:** em todas as cenas que comportem som, incluindo sons disparados por palavra da fala (craque → crocância, moeda → moedas, Pix → caixa registradora, carimbo, papel etc.) e nas transições de câmera e zoom.
- **Vozes:** uma voz diferente para cada personagem, além do narrador. As falas narradas precisam bater exatamente com o roteiro, e a conferência é automática.
- **Capas (1280x720):** fidelidade máxima ao padrão visual do canal. São 3 versões por vídeo, feitas a partir de quadros do vídeo final (`tools\capas_estilo.py`). A tentativa pelo Canva ficou fora do padrão; o Figma ficou como opção para comparar.

## 4. Como a produção funciona

Tudo roda no PC (Windows), pelo **Claude Code**, aberto dentro da pasta `Downloads\Canal Dark`. O Claude Code lê sozinho o `CLAUDE.md` dessa pasta, que tem as regras e a estrutura completas.

**Estrutura da pasta:**
- `fabrica\gerar_vozes.py`: gera as vozes em lotes por personagem e confere cada fala com transcrição (faster-whisper).
- `fabrica\montar_video.py`: monta as cenas a partir do `plano.json` e coloca música e efeitos sonoros.
- `viralstick\`: motor de animação e render (kit ViralStick) e mixagem de áudio.
- `tools\`: capas e conferência de falas.
- `logs\`: um log por etapa de cada vídeo.
- Uma pasta por vídeo (`NN - Nome`), com o roteiro, `falas.json`, `elenco.json`, `plano.json`, `musica.json`, `titulo.txt`, `cenas_<apelido>.zip` e os scripts de cada etapa.

**Etapas de cada vídeo** (scripts `.bat` dentro da pasta do vídeo):
1. `1_testar_vozes.bat`: uma fala por personagem, para conferir as vozes.
2. `2_gerar_vozes.bat` (modelo principal) ou `2b_gerar_vozes_lite.bat` (modelo Lite): gera todas as vozes e a trilha de narração.
3. `3_previa_30s.bat`: prévia de 30 segundos, para aprovar antes do render.
4. `4_video_final.bat`: monta, renderiza e mixa o vídeo final. Leva uns 10 minutos.

**Vídeo novo:** o arquivo `PEDIDO_NOVO_TEMA.txt` tem o texto pronto para colar no Claude Code. Ele conduz o processo de tema → pesquisa → roteiro (com aprovação) → montagem → narração → vídeo.

## 5. Vozes

- **Usado hoje:** Gemini TTS pela API do Google (nível pago, faturamento no Google Cloud).
  - Modelo principal: `gemini-3.8-flash-tts`. Reserva quando a cota acaba: `gemini-3.8-flash-lite-tts`, cuja qualidade foi aprovada.
  - Cota: 100 pedidos por dia por modelo, renovada às 5h (horário de Brasília).
  - Vozes personalizadas criadas no Voice Design (`voice_...`) só funcionam nesses dois modelos. Personagens com sotaque ficam para depois.
- **Testados e descartados:**
  - VoiceStudio com OmniVoice: funciona, mas a licença não permite uso comercial.
  - MOSS-TTS: não funcionou no PC.
  - Kokoro TTS: sotaque de Portugal nas vozes em português.
- **Em aberto:**
  - Estudar outras opções de voz em português do Brasil com licença comercial.
  - Confirmar se as vozes do Voice Design (`voice_...`) funcionam com a chave de outra conta Google. Se estiverem presas à conta de quem criou, o parceiro vai precisar recriá-las ou usar outras vozes.

## 6. Montar o ambiente no seu PC

**Pré-requisitos:** Windows, conta do Claude com acesso ao Claude Code (plano Pro ou superior) e placa de vídeo, recomendada para o render.

1. **Pasta do canal:** baixe o repositório do GitHub (código, roteiros e configurações) para `Downloads\Canal Dark`. Os arquivos pesados (vozes, vídeos, capas) ficam no Google Drive compartilhado.
2. **Programas da esteira:** rode `1_instalar_tudo.bat`. Ele instala ffmpeg, Python 3.12, Node.js portátil, o renderizador e os pacotes Python, e no fim roda um teste de velocidade.
3. **Claude Code:** `winget install Anthropic.ClaudeCode` e depois `claude` para entrar na conta.
4. **Chave da API do Gemini:** cada pessoa usa a **sua própria** chave, criada no Google AI Studio. Salve-a dentro da pasta `chave_gemini.txt` na raiz do canal. Essa chave **nunca** vai para o GitHub nem para o Drive.
5. **Opcional, para economizar tokens no Claude Code:** RTK (`winget install rtk-ai.rtk` e depois `rtk init -g`), context-mode (plugin do Claude Code) e Headroom (`uv tool install --python 3.13 "headroom-ai[all]"`).

## 7. O que fica onde

| Onde | O quê |
|---|---|
| **GitHub (repositório privado)** | `CLAUDE.md`, `fabrica\`, `tools\`, os `.bat`, roteiros, `falas.json`, `elenco.json`, `plano.json`, `musica.json`, `cenas_*.zip`, `PEDIDO_*.txt` e este guia |
| **Google Drive compartilhado** | Vídeos finais, prévias, vozes (`vozes\`, `voiceover.wav`), capas, marca (logo e capa do canal) e amostras de áudio |
| **Nunca compartilhar** | `chave_gemini.txt`, logins e senhas |

## 8. Regras de trabalho em dupla

- Antes de começar um vídeo, combinem quem faz qual tema, para ninguém gastar cota de voz no mesmo vídeo.
- Ao terminar uma etapa, envie as mudanças de código e roteiro para o GitHub e os arquivos pesados para o Drive.
- Decisões novas (padrões, vozes, temas) entram neste guia, para os dois ficarem com a mesma informação.
- Cada um usa o próprio Claude. As conversas e a memória do Claude não são compartilhadas; o que precisa ser comum entra aqui, no `CLAUDE.md` e no GitHub.

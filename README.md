# Guia do Canal Dark — Repartição do Universo

Guia para quem entra no projeto. Reúne o que já foi decidido, como a produção funciona e como montar o ambiente no próprio PC.
Atualizado em 15/11/2026.

---

## 1. O canal

- **Nome:** Repartição do Universo (@reparticaodouniverso), canal "dark" no YouTube.
- **Formato:** histórias animadas com bonecos palito. Um brasileiro comum vive uma situação do dia a dia com números reais (contas, preços, trabalho, costumes), e a "Repartição / Suporte Técnico do Universo" atende um pedido dele de um jeito absurdo.
- **Formato extra, para assuntos do dia: "Jornal do Universo".** Um telejornal com apresentadora, o Técnico como repórter e o Contador como comentarista; um personagem do canal assiste em casa e comenta. Com 8 a 9 minutos, porque em notícia a velocidade vale mais que a duração. O primeiro é o vídeo 11.
- **Duração:** cerca de 8 minutos, com 85 a 90 falas por vídeo.
- **Meta: 1 vídeo por dia** (decidido em 12/11/2026; antes eram 3). Motivos:
  - cada vídeo ganha um dia inteiro de teste do YouTube;
  - os vídeos não competem entre si pelo público;
  - o volume fica longe do filtro de "conteúdo produzido em massa";
  - sobra tempo para ler as métricas.
  Os vídeos prontos formam uma fila de publicação. Depois, avaliar vídeos de 15, 20, 30 minutos ou 1 hora.
- **Organização:** modelo de 7 agentes (estrategista, roteirista, designer de capas, SEO, produtor, publicador, analista). Já criados: Designer, SEO e Estrategista (15/11/2026).

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
| 11 - Apagao Nuvem | Jornal do Universo: apagão da Microsoft (12/11/2026) e os grandes apagões da nuvem | apagao (em produção) |

Os vídeos de 1 a 10 já têm `VIDEO_FINAL_*.mp4` gerado. Publicados: vídeo 1 em 11/11/2026 e vídeo 2 em 12/11/2026 (com a capa do Figma).
O vídeo 11 traz de volta o Seu Jura e o Thiago, do vídeo 2. O título não usa a palavra "internet", para não repetir o vídeo 2, e o vídeo 2 entra como "vídeo relacionado".
A ordem de publicação da fila está em `estrategia\CALENDARIO.md` (seção 3.1).
Ideias guardadas para os próximos: cafezinho de verdade (do pé até o balcão), gasolina a R$ 2, ônibus de graça.

## 3. Padrões editoriais (valem para todo vídeo)

- **Dados reais com fonte**, de preferência oficiais (IBGE, DIEESE, Aneel, ANP, Procon). O roteiro traz a lista "DADOS REAIS USADOS".
- **Tema político:** mostrar os dois lados, sem opinar.
- **Números por extenso** nas falas, para a voz não errar.
- **Estrutura do roteiro:** personagens, 10 seções `[N. TÍTULO]`, falas no formato `PERSONAGEM: texto`, e final com uma pergunta para os comentários.
- **Efeitos sonoros:** em todas as cenas que comportem som, incluindo sons disparados por palavra da fala (craque → crocância, moeda → moedas, Pix → caixa registradora, carimbo, papel etc.) e nas transições de câmera e zoom.
- **Vozes:** uma voz diferente para cada personagem, além do narrador. As falas narradas precisam bater exatamente com o roteiro, e a conferência é automática.
- **Títulos:** não repetir a palavra central de um vídeo recente; cada vídeo precisa de um gancho próprio.

### 3.1 Estratégia e variedade (Agente Estrategista, 15/11/2026)

- **Validar o tema antes de roteirizar:** `python tools\estrategista.py temas "tema 1" "tema 2" ...` busca no YouTube Brasil os vídeos mais vistos dos últimos 120 dias e mostra a mediana de views e quantos **canais pequenos** (menos de 50 mil inscritos) passaram de 50 mil views com o tema.
- **Achar canais parecidos que estão bombando:** `python tools\estrategista.py canais`. Ordena pelos "fora da curva" (views ÷ inscritos).
- Relatórios em `estrategia\` (HTML, CSV e JSON). Instruções completas em `LEIA-ME_ESTRATEGISTA.txt`.
- **Chave:** `chave_youtube.txt` na raiz (YouTube Data API v3, grátis, ~90 buscas por dia). Cada pessoa usa a sua; nunca vai para o GitHub.
- **Regras de variedade** (para não cair no filtro de conteúdo repetitivo):
  1. alternar tipo de tema: dinheiro → curiosidade → trabalho → cotidiano;
  2. nunca a mesma palavra central em títulos de dias seguidos;
  3. 4 estruturas de roteiro, a mesma no máximo 2 dias seguidos: **A** Pedido ao Universo (padrão atual), **B** Jornal do Universo, **C** A Conta Completa (seguir um produto do começo ao fim), **D** Antes e Agora (o mesmo personagem em duas épocas);
  4. o protagonista só volta a protagonizar depois de 3 outros vídeos;
  5. notícia fura a fila.
- **Calendário vivo:** `estrategia\CALENDARIO.md`, com a fila dos vídeos prontos e as datas sazonais (13º até 30/11 e 18/12, Black Friday 27/11, Natal, IPVA/IPTU/material escolar em janeiro, IR em março).

### Capas (padrão definido em 12/11/2026)

- **Estilo oficial: o ilustrado "estilo Figma", gerado em Python** por `tools\capas_estilo.py` (Pillow), sem depender do Figma. Exemplos prontos: vídeos 08, 09 e 10.
- **Como é a capa (1280x720):**
  - fundo = cenário do próprio vídeo escurecido, com degradê escuro do lado esquerdo;
  - personagens recortados grandes à direita, com contorno branco e sombra;
  - selo arredondado colorido no alto à esquerda ("PEDIDO AO UNIVERSO", "DEZEMBRO", o número-chave);
  - texto principal em 2 ou 3 linhas na fonte Luckiest Guy: primeira linha branca, destaque em amarelo #FFD23F, borda preta grossa;
  - um elemento de apoio embaixo à esquerda: caixa vermelha com o número, holerite, extrato, placa etc.
- **Insumos:** recortes em `NN - Nome\publicacao\capa_assets\` (personagens em PNG com fundo transparente e cenários `bg_*.jpg`, tirados do próprio vídeo). As capas antigas ficam em `capas_antigas\`.
- **Uso:** `python tools\capas_estilo.py NN`. Cada vídeo tem a sua função `capas_NN()` com o layout das 3 capas (A, B, C).
- **Sempre 3 versões por vídeo** para o teste A/B, cada uma pareada com um título do pacote SEO.
- O Canva ficou fora do padrão. O Figma deixou de ser necessário: o script reproduz o mesmo layout.

## 4. Como a produção funciona

Tudo roda no PC (Windows), pelo **Claude Code** (ou pelo **Gemini CLI**, ver seção 9), aberto dentro da pasta `Downloads\Canal Dark`. O Claude Code lê sozinho o `CLAUDE.md` dessa pasta, que tem as regras e a estrutura completas.

**Estrutura da pasta:**
- `fabrica\gerar_vozes.py`: gera as vozes em lotes por personagem e confere cada fala com transcrição (faster-whisper).
- `fabrica\montar_video.py`: monta as cenas a partir do `plano.json` e coloca música e efeitos sonoros.
- `viralstick\`: motor de animação e render (kit ViralStick) e mixagem de áudio.
- `tools\`: capas (`capas_estilo.py`), conferência de falas e Estrategista (`estrategista.py`).
- `agentes\`: instruções dos agentes Designer, SEO e Estrategista (`SKILL.md`), lidas pelo Gemini CLI.
- `estrategia\`: calendário editorial e relatórios do Estrategista.
- `logs\`: um log por etapa de cada vídeo.
- Uma pasta por vídeo (`NN - Nome`), com o roteiro, `falas.json`, `elenco.json`, `plano.json`, `musica.json`, `titulo.txt`, `cenas_<apelido>.zip` e os scripts de cada etapa.

**Etapas de cada vídeo** (scripts `.bat` dentro da pasta do vídeo):
0. **Estrategista:** validar o tema e escolher a estrutura (A/B/C/D) e o protagonista pelo calendário.
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
  - Confirmar se as vozes do Voice Design (`voice_...`) funcionam com a chave de outra conta Google, ou com uma chave gratuita do AI Studio. Se estiverem presas à conta de quem criou, o parceiro vai precisar recriá-las ou usar outras vozes.

## 6. Montar o ambiente no seu PC

**Pré-requisitos:** Windows, conta do Claude com acesso ao Claude Code (plano Pro ou superior) **ou** conta Google para o Gemini CLI, e placa de vídeo, recomendada para o render.

1. **Pasta do canal:** baixe o repositório do GitHub (código, roteiros e configurações) para `Downloads\Canal Dark`. Os arquivos pesados (vozes, vídeos, capas) ficam no Google Drive compartilhado.
2. **Programas da esteira:** rode `1_instalar_tudo.bat`. Ele instala ffmpeg, Python 3.12, Node.js portátil, o renderizador e os pacotes Python, e no fim roda um teste de velocidade.
3. **Assistente:** Claude Code (`winget install Anthropic.ClaudeCode` e depois `claude` para entrar na conta) e/ou Gemini CLI (`INSTALAR-GEMINI-CLI.cmd`, ver seção 9).
4. **Chave da API do Gemini:** cada pessoa usa a **sua própria** chave, criada no Google AI Studio. Salve-a dentro da pasta `chave_gemini.txt` na raiz do canal. Essa chave **nunca** vai para o GitHub nem para o Drive.
5. **Chave da API do YouTube (Estrategista):** no mesmo projeto do Google Cloud, ativar a "YouTube Data API v3", criar uma chave de API restrita a ela e salvar em `chave_youtube.txt` na raiz. Também **nunca** vai para o GitHub.
6. **Opcional, para economizar tokens no Claude Code:** RTK (`winget install rtk-ai.rtk` e depois `rtk init -g`), context-mode (plugin do Claude Code) e Headroom (`uv tool install --python 3.13 "headroom-ai[all]"`).

## 7. O que fica onde

| Onde | O quê |
|---|---|
| **GitHub (repositório privado)** | `CLAUDE.md`, `GEMINI.md`, `agentes\`, `fabrica\`, `tools\` (incluindo `capas_estilo.py`, `estrategista.py` e as fontes), os `.bat`, roteiros, `falas.json`, `elenco.json`, `plano.json`, `musica.json`, `cenas_*.zip`, `PEDIDO_*.txt`, `estrategia\CALENDARIO.md` e este guia |
| **Google Drive compartilhado** | Vídeos finais, prévias, vozes (`vozes\`, `voiceover.wav`), capas e `capa_assets\`, marca (logo e capa do canal), amostras de áudio e relatórios do Estrategista |
| **Nunca compartilhar** | `chave_gemini.txt`, `chave_youtube.txt`, logins e senhas |

## 8. Regras de trabalho em dupla

- Antes de começar um vídeo, combinem quem faz qual tema, para ninguém gastar cota de voz no mesmo vídeo.
- Ao terminar uma etapa, envie as mudanças de código e roteiro para o GitHub e os arquivos pesados para o Drive.
- Decisões novas (padrões, vozes, temas) entram neste guia, para os dois ficarem com a mesma informação.
- Cada um usa o próprio assistente (Claude ou Gemini). As conversas e a memória não são compartilhadas; o que precisa ser comum entra aqui, no `CLAUDE.md` e no GitHub.

## 9. Usar com o Gemini (alternativa ao Claude)

A mesma base roda também com o Gemini, usando a cota do Google AI Pro. As regras continuam num lugar só: o `CLAUDE.md`. O `GEMINI.md` apenas importa o `CLAUDE.md` e lista as poucas diferenças.

**Gemini CLI: roda a esteira no PC, como o Claude Code**
1. Instalar: rode `INSTALAR-GEMINI-CLI.cmd` na pasta do canal, que executa `npm install -g @google/gemini-cli`.
2. Usar: no PowerShell, `cd "$env:USERPROFILE\Downloads\Canal Dark"`, depois `gemini`, e escolha "Sign in with Google".
3. O Gemini CLI lê sozinho o `GEMINI.md`. Os pedidos prontos (`PEDIDO_*.txt`) servem igual: é só colar.
4. Os agentes Designer, SEO e Estrategista ficam em `agentes\<nome>\SKILL.md`. O `GEMINI.md` manda o Gemini CLI seguir esses arquivos.

**Chat do Gemini (gemini.google.com): só os agentes de texto**
- Os Gems estão sendo encerrados (somente leitura em 17/11/2026 e removidos em 17/12/2026, em contas pessoais). O substituto são as **Skills**, que aceitam arquivos SKILL.md.
- Versões prontas para o chat: `Downloads\skills-gemini\canal-dark-seo` e `Downloads\skills-gemini\canal-dark-estrategista`. Envie pelo gemini.google.com, em Customize > Skills. O nome da pasta precisa ser igual ao nome da skill.
- No chat, o Gemini não acessa o PC. O SEO pede o roteiro e a timeline colados na conversa, e o Estrategista usa a busca do Google, sem os números exatos da API do YouTube.
- O Designer de capas não vai para o chat, porque depende do `capas_estilo.py` rodando no PC.

**Regra de convivência:** escolham um assistente principal e usem o outro como reserva quando a cota acabar. Um vídeo nunca é mexido pelo Claude e pelo Gemini ao mesmo tempo. Qualquer mudança de regra entra no `CLAUDE.md`, que os dois leem.

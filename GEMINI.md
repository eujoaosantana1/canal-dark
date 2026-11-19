# Canal Dark — instruções para o Gemini CLI

As regras do projeto são as mesmas do Claude Code e ficam num lugar só: o CLAUDE.md abaixo.
Onde ele disser "Claude" ou "Claude Code", entenda "Gemini CLI".

@./CLAUDE.md

## Diferenças ao usar o Gemini CLI
- Responda sempre em português do Brasil.
- Segredos: nunca abra, leia, mostre ou copie `chave_gemini.txt` nem `chave_youtube.txt`. Os scripts leem as chaves sozinhos.
- Agentes: quando o pedido for de capas, SEO/publicação ou estratégia/temas/calendário, leia e siga o arquivo correspondente
  em `agentes\canal-dark-designer\SKILL.md`, `agentes\canal-dark-seo\SKILL.md` ou `agentes\canal-dark-estrategista\SKILL.md`.
  Onde esses arquivos citarem ferramentas do Claude (device_bash, device_request_folder_access, WebSearch),
  use as ferramentas equivalentes do Gemini CLI (terminal, leitura de arquivos, busca do Google).
- RTK, context-mode e Headroom são do Claude Code e não se aplicam aqui.
- Trabalho em dupla (GitHub `eujoaosantana1/canal-dark`): antes de começar, `git pull`. Ao terminar uma etapa,
  mostre o que mudou (`git --no-pager status`) e só faça commit e push depois que o usuário confirmar.
  Vídeos, vozes e capas não vão para o GitHub (ver `.gitignore`); ficam no Google Drive compartilhado.
- Um vídeo nunca deve ser mexido pelo Claude e pelo Gemini ao mesmo tempo. Se a pasta do vídeo tiver alterações
  recentes que você não fez, pergunte antes de continuar.

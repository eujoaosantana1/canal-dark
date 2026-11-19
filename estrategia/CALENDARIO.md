# Calendário editorial — Repartição do Universo

Ritmo: **1 vídeo por dia**. Atualizado em 15/11/2026 pelo Agente Estrategista, com a primeira pesquisa na API do YouTube.

## Regras de variedade (para não virar "conteúdo repetitivo")

1. **Nunca dois vídeos seguidos com o mesmo tipo de tema**: alternar
   *dinheiro/conta* → *curiosidade/"e se"* → *trabalho* → *cotidiano*.
2. **Nunca a mesma palavra central em títulos de dois dias seguidos**
   (já é regra do SEO: imposto, internet, salário...).
3. **Alternar a estrutura do roteiro**. São 4 modelos; o mesmo modelo no máximo 2 dias seguidos:
   - **A. Pedido ao Universo** (o padrão atual): humilhação → burocrata cósmico → milagre → custo → escolha.
   - **B. Jornal do Universo**: telejornal sobre o assunto do dia (vídeo 11).
   - **C. A Conta Completa**: seguir um produto do começo ao fim e mostrar quem leva cada centavo
     (ex.: cafezinho do pé até o balcão, gasolina da refinaria à bomba).
   - **D. Antes e Agora**: o mesmo personagem em duas épocas, comparando preços, salário e costumes
     (ex.: o Valdir em 1994 e hoje).
4. **Rodízio de personagens**: o protagonista de um vídeo só volta a protagonizar depois de 3 outros vídeos.
5. **Notícia fura a fila**: tema do dia (formato B) entra no próximo horário livre, porque perde valor rápido.

## Fila dos vídeos prontos (ordem sugerida)

Publicados: 1 (imposto, 11/11) e 2 (internet 72h, 12/11).
*Se já publicaram outros desde 13/11, risquem aqui e sigam a ordem.*

| Ordem | Vídeo | Tipo | Por que nessa posição (pesquisa de 15/11) |
|---|---|---|---|
| 1º | **11 - Apagão Nuvem** (Jornal) | notícia | Notícia perde valor rápido. A busca "apagão microsoft" já está morna (mediana 33 mil views, nenhum canal pequeno se destacando): publicar assim que ficar pronto e não investir mais nele. |
| 2º | **10 - Escala 6x1** | trabalho | **O tema mais quente da fila**: mediana de 354 mil views por vídeo. Subiu de 4º para 2º. Mostrar os dois lados. |
| 3º | 03 - Conta de Luz | dinheiro | Mediana baixa (19 mil), mas 3 canais pequenos com bons resultados: dá para competir. |
| 4º | 05 - Pão Francês | cotidiano | Busca forte (mediana 199 mil), mas puxada por receitas; o nosso ângulo é outro, então a expectativa é moderada. |
| 5º | 07 - Salário Mínimo | dinheiro | Mediana de 128 mil, puxada pelo reajuste de 2027, que está em alta agora. |
| 6º | 04 - Um Feriado por Ano | curiosidade | Respiro entre temas de dinheiro. |
| 7º | **08 - Décimo Terceiro** | dinheiro | **Sair perto de 25 a 28/11** (1ª parcela até 30/11). Mediana de 86 mil. |
| 8º | 06 - Neve no Brasil | curiosidade | Desceu para o fim: a busca é fraca (mediana de 5 mil). Separa o 13º do "Doze vezes". |
| 9º | 09 - Doze Vezes | dinheiro | Casa com a Black Friday (27/11). Busca "compras parceladas" é fraca: o título deve puxar a Black Friday, não o parcelamento. |

## Datas que valem um vídeo (próximos meses)

- **27/11 – Black Friday**: "Doze vezes" (já pronto) ou "o desconto que era aumento".
- **até 30/11 e 18/12 – 13º salário** (1ª e 2ª parcela).
- **Dezembro – ceia de Natal**: a Conta Completa do peru/chester, ou "Antes e Agora" da ceia.
- **31/12 – Réveillon**: "E se o ano virasse duas vezes".
- **Janeiro – IPVA, IPTU, material escolar**: três "contas" de começo de ano.
- **Março – Imposto de Renda 2027**: volta do Valdir (callback do vídeo 1).

## Ideias guardadas (validar no Estrategista antes de roteirizar)

- Cafezinho de verdade, do pé até o balcão (estrutura C) — busca "preço do café" tem um vídeo de 2,3 mi; tema forte se o ângulo for "o que você paga sem saber".
- Gasolina a R$ 2 (estrutura A) — mediana de 29 mil, 2 canais pequenos bem: tema médio.
- Ônibus de graça (estrutura A) — busca "tarifa zero" fraca (mediana de 6 mil): só com título que não dependa da palavra "tarifa zero".

## Formatos que estão funcionando em canais parecidos (pesquisa de 15/11)

- **"E se..." sobre o Brasil**, em canais minúsculos: "E Se o Brasil Inteiro Se Revoltasse Amanhã?" (74 mil views com 1 mil inscritos), "O Brasil se cada estado tivesse o tamanho do seu PIB" (173 mil com 1 mil inscritos).
- **"Hora a hora" / "do dia 1 ao dia 30"**: "O que acontece com o Brasil depois de uma guerra nuclear? Hora a hora" (45 mil com 1 mil inscritos); em inglês, "Zombie Outbreak: Day 1 to Day 30" passa de 4 milhões. Combina com o nosso "Dia 3, Dia 4..." e com a estrutura A.
- **Economia desenhada**: Finanças Ilustradas, "O Que Acontece Se a Taxa de Juros Cair na Canetada" (166 mil com 11 mil inscritos). É o vizinho mais próximo do nosso nicho.
- **Meu Brasil Animado** (nossa referência): "Ele tomou um susto quando recebeu seu FGTS" com 508 mil.
- **Ember & Shadow** (gringo, primeiro vídeo em 14/10/2026): 14 vídeos, 11 mil inscritos e 1,1 milhão de views em um mês. Vídeos de 2 a 3 minutos, a cada 2 dias, com títulos que são uma frase que o espectador diz para si mesmo ("I'll Start Tomorrow", 619 mil). Os mais recentes caíram para 7 a 25 mil: o pico foi um vídeo só.

Rodar: `python tools\estrategista.py temas "preço do café" "gasolina" "tarifa zero ônibus" "ipva" "material escolar"`

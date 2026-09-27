---
name: nao-feche-esta-aba
typography:
  display:
    fontFamily: Bodoni Moda
  body:
    fontFamily: Atkinson Hyperlegible Next
colors:
  papel: "#FFFFFF"
  tinta: "#000000"
  link: "#0000EE"
  visitado: "#551A8B"
  selecao: "#B4D5FE"
  achado: "#FFFF00"
  achado-ativo: "#FF9632"
  noite: "#15174A"
---

# Design: não feche esta aba

## O assunto

Um jogo em que o navegador é o controle. O protagonista é o **Pé**, um pé-de-mosca (¶),
o caractere invisível que marca o fim de cada parágrafo. Ele mora dentro da aba e quer sair.

## A paleta vem do próprio navegador

Nenhuma cor foi inventada. Todas já existem em qualquer navegador desde os anos 90:

| Token | Hex | De onde vem |
|---|---|---|
| papel | `#FFFFFF` | fundo padrão de uma página sem CSS |
| tinta | `#000000` | texto padrão |
| link | `#0000EE` | `a:link` padrão |
| visitado | `#551A8B` | `a:visited` padrão |
| selecao | `#B4D5FE` | cor de seleção de texto |
| achado | `#FFFF00` | destaque do Ctrl+F |
| achado-ativo | `#FF9632` | resultado atual do Ctrl+F no Chrome |
| noite | `#15174A` | tinta azul de caneta, usada no modo escuro |

Quem joga reconhece essas cores sem saber de onde. É esse o efeito.

## Tipografia

- **Bodoni Moda** para o Pé, os títulos de seção (§) e o título do jogo. Alto contraste, fios finos,
  o ¶ mais bonito do Google Fonts.
- **Atkinson Hyperlegible Next** para tudo que precisa ser lido rápido: falas, dicas, botões.
- Sem monoespaçada. O console do navegador já é monoespaçado; o jogo não precisa imitar.

## Layout

Uma coluna de leitura alinhada à esquerda, até 34rem, com uma margem larga onde o Pé vive.

```
┌──────────────────────────────────────────────┐
│ margem       │ § 4                           │
│              │ Letra miúda                   │
│    ¶  (Pé)   │                               │
│   olhos      │ fala do Pé, digitada          │
│              │                               │
│              │ [ área do puzzle ]            │
│              │                               │
│              │ ¹ dica   ² dica   pular       │
└──────────────────────────────────────────────┘
```

No celular a margem vira uma faixa no topo e o Pé fica menor.

## Estruturas que carregam informação

- **§ numerado**: as fases são uma sequência de verdade, então o número fica.
- **Notas de rodapé** (¹ ² ³) são as dicas. Um livro usa rodapé para o que não cabe no texto.
- **Sumário** no fim da página: fase resolvida fica na cor `visitado`, fase atual na cor `link`.
  O jogo usa a gramática de links que todo mundo já conhece.

## O momento memorável

O Pé. Um ¶ desenhado em SVG com dois olhos brancos dentro da barriga preta. Os olhos seguem o
cursor, piscam e fecham quando a aba some. Todo o resto da página fica quieto e disciplinado.

## Movimento

- O Pé reage a ações (pula ao resolver, encolhe ao pular fase).
- As falas aparecem letra por letra. Com `prefers-reduced-motion`, aparecem inteiras.
- Nada entra deslizando, nada tem hover animado.

## Revisão contra o padrão genérico

Primeiro rascunho: fundo creme, serifada alta e destaque terracota. Isso é o padrão nº 1 de
página gerada. Troquei por branco puro e as cores de fábrica do navegador, que têm tudo a ver
com um jogo sobre o navegador.

Segundo ponto revisto: numerar fases com 01/02/03. Troquei por §, que é o sinal tipográfico
de seção e primo do ¶.

## Decisões

| Data | Decisão | Motivo |
|---|---|---|
| 2026-09-27 | Paleta = cores padrão do navegador | O assunto do jogo é o navegador |
| 2026-09-27 | Fontes hospedadas no repo | A fase offline precisa funcionar sem rede |
| 2026-09-27 | Dicas como notas de rodapé | Estrutura tipográfica que o jogador já entende |

# Ato II: o avesso

## A passagem

No fim do Ato I, o título diz "a aba está vazia." e o ponto final começa a tremer. É o ponto que o Pé
perdeu no § 7. Quem clica nele derruba a página inteira: cada palavra cai com gravidade, o ponto vira um
buraco e o azul de link (`#0000EE`) toma a tela a partir dele. O Pé sai do buraco de ponta-cabeça.

## O avesso tem outra paleta

O Ato I é a página. O Ato II é o que fica atrás dela, pintado com a cor de um link não visitado.

| Token | Ato I | Ato II |
|---|---|---|
| papel | `#FFFFFF` | `#0000EE` |
| tinta | `#000000` | `#FFFFFF` |
| link | `#0000EE` | `#FFFF00` |
| seleção | `#B4D5FE` | `#FFFF00` com texto azul |

## O Asterisco

Um * amarelo de um olho só, com sobrancelha. Mora nas notas de rodapé e cuida das letras miúdas.
Fala sempre com um * na frente, como nota de rodapé. No Ato II as dicas são dele: `*`, `**`, `***`,
no lugar de ¹ ² ³. Ele é o vilão, mas só quer que alguém leia as notas de rodapé.

## As 16 páginas

| § | Nome | Recurso |
|---|---|---|
| 17 | Nome verdadeiro | digitar o caractere ¶ (Alt+0182, Option+7) |
| 18 | Estátua | não tocar em nada por 40 s enquanto o Asterisco provoca |
| 19 | A parede | apagar um `<div>` pelo DevTools |
| 20 | Código de trapaça | código Konami (ou deslizes no celular) |
| 21 | O poço | uma página de 300 mil pixels, tecla End |
| 22 | Voz | `speechSynthesis`: o Pé fala a senha em voz alta |
| 23 | Pichação | editar o texto da página (`document.designMode`) |
| 24 | Fome | arrastar um arquivo para dentro da página |
| 25 | Medo de seta | tirar o mouse da janela |
| 26 | Dia da marmota | recarregar a página (F5) várias vezes |
| 27 | Pequenininho | ler um código no favicon |
| 28 | Porão do código | comentário escondido no código-fonte (Ctrl+U) |
| 29 | Lugar nenhum | visitar uma URL que não existe: o `404.html` é parte do jogo |
| 30 | Janela flutuante | Picture-in-Picture de um vídeo desenhado em canvas |
| 31 | Mudança | levar a janela para o canto da tela (`screenX`, `screenY`) |
| 32 | O chefão | seis truques do Ato I em 100 segundos, contra o relógio |

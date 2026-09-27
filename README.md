# não feche esta aba

Um jogo de quebra-cabeça em que o controle é o navegador.

O Pé é um pé-de-mosca (¶), aquele símbolo que aparece no fim dos parágrafos quando alguém liga "mostrar formatação". Ele ficou preso dentro de uma aba. Cada uma das 16 páginas só se resolve com um recurso do navegador que quase ninguém usa: Ctrl+F, zoom, o botão Voltar, a barra de endereço, o console, o modo escuro do sistema, a prévia de impressão.

O jogo é HTML, CSS e JavaScript puro. Não tem build, dependência nem servidor. Salva o progresso no `localStorage` e funciona offline depois da primeira visita.

## Jogar

Abra o endereço do GitHub Pages do repositório. No computador dá para jogar tudo. No celular, umas 12 das 16 páginas funcionam, e as outras têm um botão de pular.

## Rodar localmente

```sh
python3 -m http.server 8000
# abra http://localhost:8000
```

Precisa de um servidor. Abrir o `index.html` direto do disco quebra os módulos JavaScript e o service worker.

## Publicar

O workflow `.github/workflows/pages.yml` publica a cada push na `main`. Na primeira vez, vá em **Settings → Pages** e escolha **GitHub Actions** como fonte.

## O que cada página usa

<details>
<summary>Spoilers</summary>

| § | Página | Recurso do navegador |
|---|---|---|
| 1 | Tinta branca | seleção de texto, `selectionchange` |
| 2 | Esconde-esconde | tecla Tab, `:focus-visible` |
| 3 | O palheiro | Ctrl+F com `hidden="until-found"` e o evento `beforematch` |
| 4 | Letra miúda | zoom, `devicePixelRatio`, media query `resolution`, `visualViewport` |
| 5 | Um quarto quadrado | redimensionar a janela, `screen.orientation` no celular |
| 6 | A porta no endereço | editar o `#` da URL, `hashchange` |
| 7 | Duas páginas atrás | botão Voltar, `history.pushState` e `popstate` |
| 8 | Não olhe | Page Visibility API, título da aba como canal de conversa |
| 9 | Visita | segunda aba, `BroadcastChannel` |
| 10 | Nada | copiar e colar, evento `copy` que troca o conteúdo |
| 11 | O interruptor | tema do sistema, `prefers-color-scheme` |
| 12 | Bilhete no porão | console do DevTools, função global |
| 13 | Trapaça permitida | editar o `localStorage` à mão |
| 14 | Silêncio | ficar offline, service worker, eventos `online`/`offline` |
| 15 | Virar papel | prévia de impressão, `beforeprint`, folha de estilo `print` que vira pôster |
| 16 | Não feche esta aba | fechar a aba, `pagehide`; na volta, a página mostra o fim |

Além das fases: o favicon é desenhado em SVG e fecha os olhos quando você sai da aba, os sons são sintetizados com Web Audio, o celular vibra quando uma página é resolvida e o console cumprimenta quem abrir cedo demais.

</details>

## Estrutura

```
index.html            página única
css/style.css         tela
css/print.css         pôster impresso
js/main.js            telas, dicas, abas, salvamento
js/pe.js              o Pé em SVG, olhos que seguem o cursor
js/fx.js              som, favicon, título da aba, console
js/store.js           localStorage
js/fases/             uma página do jogo por arquivo
sw.js                 cache offline
DESIGN.md             paleta, tipografia e decisões de design
```

## Criar uma página nova

Crie um arquivo em `js/fases/`, adicione na lista de `js/fases/index.js` e no array `ARQUIVOS` do `sw.js`. O formato:

```js
export default {
  id: "minha-fase",
  nome: "Nome que aparece no sumário",
  celular: true,            // false mostra aviso e libera o pular no celular
  falas: ["o que o Pé diz antes"],
  dicas: ["nota ¹", "nota ²", "nota ³"],
  vitoria: ["o que o Pé diz depois"],
  montar(ctx) {
    // ctx.palco: onde desenhar o puzzle
    // ctx.on(alvo, evento, fn): ouvinte removido sozinho ao sair da página
    // ctx.dizer(html), ctx.resolver(), ctx.pe, ctx.som, ctx.titulo, ctx.depois(ms, fn)
  },
};
```

## Créditos

Fontes: [Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda) e [Atkinson Hyperlegible Next](https://fonts.google.com/specimen/Atkinson+Hyperlegible+Next), ambas sob a SIL Open Font License 1.1, hospedadas em `assets/fonts/`.

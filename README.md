# não feche esta aba

Um jogo de quebra-cabeça em que o controle é o navegador.

O Pé é um pé-de-mosca (¶), aquele símbolo que aparece no fim dos parágrafos quando alguém liga "mostrar formatação". Ele ficou preso dentro de uma aba. Cada página só se resolve com um recurso do navegador que quase ninguém usa: Ctrl+F, zoom, o botão Voltar, a barra de endereço, o console, o modo escuro do sistema, a prévia de impressão.

São dois atos de 16 páginas. O Ato II só aparece para quem termina o primeiro, e fica mais difícil: tem um vilão, o Asterisco, e pede coisas como apagar HTML pelo DevTools, ler um código no favicon e visitar uma página que não existe.

O jogo é HTML, CSS e JavaScript puro. Não tem build, dependência nem servidor. Salva o progresso no `localStorage` e funciona offline depois da primeira visita.

## Jogar

Abra o endereço do GitHub Pages do repositório. No computador dá para jogar tudo. No celular, umas 12 das 16 páginas funcionam, e as outras têm um botão de pular.

## Rodar localmente

```sh
python3 -m http.server 8000
# abra http://localhost:8000
```

O servidor do Python não usa o `404.html`, então o § 29 só funciona de verdade no GitHub Pages.

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

No fim do Ato I, o ponto final do título treme. Clicar nele derruba cada palavra da página com gravidade e abre um buraco azul para o Ato II.

| § | Página | Recurso do navegador |
|---|---|---|
| 17 | Nome verdadeiro | digitar o caractere ¶ pelo teclado (Alt+0182, Option+7) |
| 18 | Estátua | 40 s sem mouse, teclado, rolagem ou troca de aba, com provocações na tela |
| 19 | A parede | apagar um `<div>` pelo DevTools |
| 20 | Código de trapaça | código Konami, ou deslizes do dedo no celular |
| 21 | O poço | página de 300 mil pixels, tecla End |
| 22 | Voz | `speechSynthesis`, a senha falada em voz alta |
| 23 | Pichação | editar o texto da página com `document.designMode` |
| 24 | Fome | arrastar um arquivo para a página, File API |
| 25 | Medo de seta | tirar o mouse da janela, `mouseleave` |
| 26 | Dia da marmota | recarregar seis vezes, `sessionStorage` e o tipo de navegação |
| 27 | Pequenininho | código de quatro dígitos animado no favicon |
| 28 | Porão do código | comentário HTML no código-fonte, Ctrl+U |
| 29 | Lugar nenhum | visitar uma URL que não existe; o `404.html` avisa o jogo |
| 30 | Janela flutuante | Picture-in-Picture de um vídeo gerado por `canvas.captureStream` |
| 31 | Mudança | levar a janela para o canto da tela, `screenX` e `screenY` |
| 32 | O chefão | seis tarefas do Ato I sorteadas, em 100 segundos |

O § 14 não confia só em `navigator.onLine`, que continua `true` com o Wi-Fi ligado num roteador sem internet. A cada 2,5 s o jogo busca `sonda.txt` sem cache, e o service worker deixa essa busca passar direto para a rede.

Além das fases: o favicon é desenhado em SVG e fecha os olhos quando você sai da aba, os sons são sintetizados com Web Audio, o celular vibra quando uma página é resolvida e o console cumprimenta quem abrir cedo demais.

</details>

## Estrutura

```
index.html            página única (com um comentário que interessa ao § 28)
404.html              página de erro que também é fase (§ 29)
sonda.txt             arquivo que o § 14 busca para saber se há internet
css/style.css         tela dos dois atos
css/print.css         pôster impresso
js/main.js            telas, dicas, abas, salvamento
js/pe.js              o Pé em SVG, olhos que seguem o cursor
js/asterisco.js       o Asterisco, vilão do Ato II
js/fx.js              som, favicon, título da aba, console
js/store.js           localStorage
js/fases/             uma página do jogo por arquivo
sw.js                 cache offline
DESIGN.md             paleta, tipografia e decisões de design
```

## Criar uma página nova

Crie um arquivo em `js/fases/`, adicione na lista de `js/fases/index.js` e no array `ARQUIVOS` do `sw.js`. Suba a `VERSAO` do `sw.js` para quem já jogou receber os arquivos novos. O formato:

```js
export default {
  id: "minha-fase",
  nome: "Nome que aparece no sumário",
  celular: true,            // false mostra aviso e libera o pular no celular
  falas: ["o que o Pé diz antes", "*fala que começa com asterisco é do Asterisco"],
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

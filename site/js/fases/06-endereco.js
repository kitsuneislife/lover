// § 6: a barra de endereço. A porta está no fragmento (#) da URL.

const ABERTA = /porta=(aberta|aberto|destrancada|destrancado|escancarada)/i;

export default {
  id: "endereco",
  nome: "A porta no endereço",
  celular: true,
  falas: [
    "achei a porta desta página. ela fica lá em cima, na barra de endereço.",
    "está escrito trancada. mas quem escreve no endereço é você.",
  ],
  dicas: [
    "Clique na barra de endereço, lá no topo do navegador, e vá até o fim do texto.",
    "Troque <em>trancada</em> por <em>aberta</em>.",
    "Aperte <kbd>Enter</kbd>. A página não recarrega, só a porta muda.",
  ],
  vitoria: [
    "rangeu, mas abriu.",
    "o pedaço depois do # nunca vai para o servidor. é um bilhete que a página deixa para ela mesma.",
  ],
  montar(ctx) {
    history.replaceState(history.state, "", location.pathname + location.search + "#porta=trancada");
    ctx.palco.innerHTML = `<p class="endereco" translate="no"><span class="nao-achavel" data-t="…/#porta=trancada"></span></p>`;
    const alvo = ctx.palco.querySelector(".nao-achavel");

    ctx.on(window, "hashchange", () => {
      const h = decodeURIComponent(location.hash);
      alvo.dataset.t = "…/" + h;
      if (ABERTA.test(h)) return ctx.resolver();
      if (/porta=/i.test(h)) ctx.dizer(`“${h.replace(/^#porta=/i, "")}”? essa palavra eu não conheço. porta abre com outra.`, { humor: "triste" });
      else ctx.dizer("sumiu a porta! escreve porta= de novo.");
    });
    ctx.aoSair(() => {
      if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
    });
  },
};

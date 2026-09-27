// § 7: o botão Voltar. O Pé anda três páginas pela History API e deixa o ponto final para trás.

export default {
  id: "para-tras",
  nome: "Duas páginas atrás",
  celular: true,
  falas: [
    "vou dar uma volta. já volto.",
  ],
  dicas: [
    "Use o botão Voltar do navegador, a seta para a esquerda ao lado da barra de endereço.",
    "Atalho: <kbd>Alt</kbd> + <kbd>←</kbd>. No Mac, <kbd>Cmd</kbd> + <kbd>[</kbd>. No celular, o gesto ou botão de voltar.",
    "São duas páginas. Se passar, o botão Avançar desfaz.",
  ],
  vitoria: [
    "meu ponto final! sem ele eu não consigo terminar nenhuma frase direito",
    ".",
    "pronto, agora sim. o botão Voltar não precisa sair do site. esta página inteira é uma só, e mesmo assim tinha três lugares no histórico.",
  ],
  montar(ctx) {
    const base = location.pathname + location.search;
    ctx.palco.innerHTML = `<div class="paginas" aria-live="polite"></div>`;
    const trilha = ctx.palco.firstElementChild;

    const desenhar = (aqui, comPonto) => {
      trilha.innerHTML = [1, 2, 3]
        .map((n) => `
          <div class="pagina${n === aqui ? " aqui" : ""}" aria-label="Página ${n}${n === aqui ? ", você está aqui" : ""}">
            ${n === 1 && comPonto ? '<span class="ponto" aria-label="um ponto final">.</span>' : ""}
            ${n}
          </div>`)
        .join("");
    };

    let passo = 0;
    const andar = () => {
      passo++;
      history.pushState({ nfeaPasso: passo }, "", `${base}#pagina-${passo}`);
      desenhar(passo, true);
      ctx.pe.pular();
      ctx.som.pulo();
      if (passo < 3) ctx.depois(900, andar);
      else ctx.dizer("voltei. ops, deixei cair meu ponto final duas páginas atrás. busca pra mim?", { humor: "triste" });
    };
    history.replaceState({ nfeaPasso: 0 }, "", base);
    ctx.depois(400, andar);

    ctx.on(window, "popstate", (e) => {
      const p = e.state?.nfeaPasso;
      if (passo < 3) return;
      if (p === 1) {
        desenhar(1, false);
        ctx.resolver();
      } else if (p === 2) {
        desenhar(2, true);
        ctx.dizer("mais uma.");
      } else if (p === 3) {
        desenhar(3, true);
        ctx.dizer("essa é a página onde eu estou. volta duas.");
      } else {
        desenhar(0, true);
        ctx.dizer("passou! aperta Avançar uma vez.");
      }
    });
    ctx.aoSair(() => history.replaceState(null, "", base));
  },
};

// § 21: um poço de 300 mil pixels. Rolando com a rodinha demora; a tecla End chega em um segundo.

const FUNDO = 300000;
const METROS_POR_PX = 0.01;

export default {
  id: "poco",
  nome: "O poço",
  celular: true,
  dicasAntes: true,
  falas: [
    "o Asterisco jogou meu chapéu num poço. o poço começa logo aqui embaixo.",
    "*trezentos mil pixels de profundidade. rolando com a rodinha, dá uns quinze minutos. eu cronometrei.",
  ],
  dicas: [
    "a tecla <kbd>End</kbd> leva direto para o fim da página. no Mac, <kbd>Cmd</kbd> + <kbd>↓</kbd>.",
    "também dá para arrastar a barra de rolagem, lá na beirada da janela.",
    "no celular, deslize rápido várias vezes. ou peça para alguém com teclado.",
  ],
  montar(ctx) {
    const tinhaChapeu = ctx.estado.chapeu;
    const marcas = [];
    for (let px = 5000; px < FUNDO; px += 5000) {
      marcas.push(`<span class="marca-poco" style="top:${px}px">${new Intl.NumberFormat("pt-BR").format(Math.round(px * METROS_POR_PX))} m</span>`);
    }
    ctx.palco.innerHTML = `
      <div class="poco" style="height:${FUNDO}px">
        ${marcas.join("")}
        <div class="fundo-poco">
          <svg class="chapeu-solto" viewBox="30 -36 66 44" aria-hidden="true"><path fill="currentColor" d="M34 1h58v5H34Z M44 -32h38v34H44Z"/><path d="M44 -8h38v5H44Z" fill="var(--link)"/></svg>
          <p>o chapéu está aqui.</p>
        </div>
      </div>
      <p class="profundimetro" aria-live="off">0 m</p>`;
    const poco = ctx.palco.querySelector(".poco");
    const medidor = ctx.palco.querySelector(".profundimetro");
    const falas = [
      [0.04, "*isso, continua rolando. só faltam uns 96%."],
      [0.15, "*tem um jeito mais rápido. não vou contar qual."],
      [0.35, "tá escuro aqui. você ainda tá aí?"],
      [0.6, "*parabéns pela persistência. é inútil, mas é bonita."],
      [0.85, "tô vendo o fundo!"],
    ];
    let proxima = 0;
    let quadro = 0;

    const medir = () => {
      quadro = 0;
      const r = poco.getBoundingClientRect();
      const descido = Math.min(FUNDO, Math.max(0, -r.top + innerHeight * 0.5));
      medidor.textContent = new Intl.NumberFormat("pt-BR").format(Math.round(descido * METROS_POR_PX)) + " m";
      const fracao = descido / FUNDO;
      if (proxima < falas.length && fracao >= falas[proxima][0]) {
        medidor.dataset.fala = falas[proxima][1].replace(/^\*/, "* ");
        proxima++;
      }
      if (r.bottom <= innerHeight + 40) {
        ctx.estado.chapeu = true;
        ctx.salvar();
        ctx.pe.chapeu(true);
        poco.remove();
        medidor.remove();
        scrollTo({ top: 0, behavior: "auto" });
        ctx.resolver(tinhaChapeu
          ? ["meu chapéu! com um pouco de lodo, mas é ele.", "*a tecla Home faz o caminho de volta. já te trouxe pra cima, de nada."]
          : ["um chapéu! eu nem tinha um. agora tenho.", "*a tecla Home faz o caminho de volta. já te trouxe pra cima, de nada."]);
      }
    };
    ctx.on(window, "scroll", () => { if (!quadro) quadro = requestAnimationFrame(medir); }, { passive: true });
    ctx.aoSair(() => cancelAnimationFrame(quadro));
  },
};

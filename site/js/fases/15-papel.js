// § 15: impressão. A folha de estilo de impressão transforma a página num pôster do Pé.

export default {
  id: "papel",
  nome: "Virar papel",
  celular: true,
  falas: [
    "sempre quis saber como é ser papel.",
    "manda imprimir? não precisa gastar tinta, só abrir a prévia de impressão já me transforma.",
  ],
  dicas: [
    "<kbd>Ctrl</kbd> + <kbd>P</kbd>. No Mac, <kbd>Cmd</kbd> + <kbd>P</kbd>.",
    "Olhe a prévia. Pode cancelar depois, ou salvar como PDF.",
    "No celular: menu do navegador, Compartilhar, Imprimir.",
  ],
  vitoria: [
    "viu a prévia? aquele sou eu em papel. a página inteira tem um segundo figurino que só aparece na impressão.",
    "se salvou como PDF, pode pendurar na parede.",
  ],
  montar(ctx) {
    const impressao = matchMedia("print");
    ctx.on(window, "beforeprint", () => ctx.resolver());
    ctx.on(impressao, "change", () => { if (impressao.matches) ctx.resolver(); });
  },
};

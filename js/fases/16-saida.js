// § 16: fechar a aba. O evento pagehide grava a saída; na volta, a página está vazia.

export default {
  id: "saida",
  nome: "Não feche esta aba",
  celular: true,
  falas: [
    "o nome deste jogo é um pedido. eu fiz esse pedido lá no começo, quando tinha medo.",
    "agora eu retiro. fecha esta aba e eu saio junto.",
    "se você abrir a página de novo depois, vai ter um bilhete meu.",
  ],
  dicas: [
    "Feche a aba: <kbd>Ctrl</kbd> + <kbd>W</kbd>, <kbd>Cmd</kbd> + <kbd>W</kbd> no Mac, ou o × da aba.",
    "Depois abra o mesmo endereço de novo.",
  ],
  montar(ctx) {
    ctx.titulo.forcar("¶ pode fechar");
    ctx.depois(1200, () => {
      ctx.on(window, "pagehide", () => {
        ctx.estado.fechouEm = Date.now();
        ctx.estado.terminouEm = ctx.estado.fechouEm;
        ctx.estado.feitas["saida"] = true;
        ctx.estado.fase = 16;
        ctx.salvar();
      });
    });
  },
};

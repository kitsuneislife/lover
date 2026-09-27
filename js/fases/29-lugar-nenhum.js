// § 29: visitar uma URL que não existe. O 404.html do site é parte do jogo:
// quando ele abre em ".../pe", avisa o jogo pelo localStorage e pelo BroadcastChannel.

import { ler, gravar } from "../store.js";

export default {
  id: "lugar-nenhum",
  nome: "Lugar nenhum",
  celular: true,
  falas: [
    "o Asterisco me mandou para um endereço que não existe.",
    "*a página se chama pe. fica bem do lado desta, no endereço. só que ela não existe. boa visita.",
  ],
  dicas: [
    "mexa na barra de endereço: troque o fim do endereço desta página por <code>pe</code>.",
    "fica assim: o endereço de agora, com <code>pe</code> depois da última barra. sem acento.",
    "quando a página que não existe abrir, use o link de lá para voltar.",
  ],
  vitoria: [
    "você me achou no lugar nenhum!",
    "*quando um endereço não existe, o GitHub Pages mostra o arquivo 404.html do site. eu decorei o meu.",
  ],
  montar(ctx) {
    const base = new URL(".", location.href);
    ctx.palco.innerHTML = `<p class="endereco" translate="no"><span class="nao-achavel" data-t="${base.host}${base.pathname}pe"></span></p>`;

    let pedido = ler("pedido404", 0);
    if (!pedido) {
      pedido = Date.now();
      gravar("pedido404", pedido);
    }
    const conferir = () => {
      if (ler("achou404", 0) > pedido) {
        gravar("pedido404", 0);
        ctx.resolver();
      }
    };
    conferir();
    ctx.cada(800, conferir);
    ctx.canal?.ouvir((m) => { if (m?.t === "achou-404") conferir(); });
  },
};

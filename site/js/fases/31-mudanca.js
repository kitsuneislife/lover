// § 31: levar a janela, pequena, para o canto de baixo à direita da tela.
// Não existe evento de "janela moveu", então o jogo confere screenX/screenY a cada 200 ms.

export default {
  id: "mudanca",
  nome: "Mudança",
  celular: false,
  falas: [
    "vou me mudar. quero morar no cantinho de baixo, do lado direito da sua tela.",
    "*numa janela pequena. apartamento de canto, sabe como é.",
  ],
  dicas: [
    "primeiro tire a janela do modo maximizado ou de tela cheia. depois arraste pela barra de título.",
    "no Windows, <kbd>Win</kbd> + <kbd>→</kbd> e depois <kbd>Win</kbd> + <kbd>↓</kbd> encaixa a janela bem no canto.",
    "o mapinha mostra onde a janela está agora. o retângulo tracejado é a casa nova.",
  ],
  vitoria: [
    "casa nova! a vista dá pro relógio do sistema.",
    "*a página sabe em que ponto da tela a janela está. screenX e screenY. só não conta pra ninguém.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <div class="mapa-tela" aria-hidden="true">
        <div class="mapa-casa"></div>
        <div class="mapa-janela"></div>
      </div>
      <p class="mapa-status" aria-live="polite"></p>`;
    const mapa = ctx.palco.querySelector(".mapa-tela");
    const janela = ctx.palco.querySelector(".mapa-janela");
    const status = ctx.palco.querySelector(".mapa-status");
    let certoDesde = 0;
    let ultimoStatus = "";

    const medir = () => {
      const W = screen.availWidth || screen.width;
      const H = screen.availHeight || screen.height;
      const x = screenX - (screen.availLeft || 0);
      const y = screenY - (screen.availTop || 0);
      const w = outerWidth;
      const h = outerHeight;
      mapa.style.aspectRatio = `${W} / ${H}`;
      janela.style.left = (x / W) * 100 + "%";
      janela.style.top = (y / H) * 100 + "%";
      janela.style.width = (w / W) * 100 + "%";
      janela.style.height = (h / H) * 100 + "%";

      const pequena = w <= W * 0.6 && h <= H * 0.75;
      const direita = x + w >= W - 48;
      const embaixo = y + h >= H - 48;
      let s;
      if (!pequena) s = "falta diminuir a janela.";
      else if (!direita && !embaixo) s = "falta levar para baixo e para a direita.";
      else if (!direita) s = "falta levar mais para a direita.";
      else if (!embaixo) s = "falta levar mais para baixo.";
      else s = "é aqui!";
      if (s !== ultimoStatus) { status.textContent = s; ultimoStatus = s; }

      const certo = pequena && direita && embaixo;
      janela.classList.toggle("certo", certo);
      if (!certo) { certoDesde = 0; return; }
      certoDesde ||= performance.now();
      if (performance.now() - certoDesde > 700) ctx.resolver();
    };
    medir();
    ctx.cada(200, medir);
  },
};

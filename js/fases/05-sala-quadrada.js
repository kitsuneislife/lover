// § 5: redimensionar a janela até ela ficar quadrada.
// No celular não dá para redimensionar, então vale girar o aparelho duas vezes.

export default {
  id: "sala-quadrada",
  nome: "Um quarto quadrado",
  celular: true,
  falas: [
    "sempre sonhei com um quarto quadrado. esta janela é um retângulo deitado.",
    "a janela é sua, a reforma também.",
  ],
  dicas: [
    "Arraste a borda ou o canto da janela do navegador. Se ela estiver maximizada, desmaximize primeiro.",
    "Olhe os números: quando largura e altura ficarem iguais, a sala fica pronta. Tem uma folga pequena.",
    "No celular: gire o aparelho para deitado e depois de volta.",
  ],
  vitoria: [
    "perfeito. quatro paredes iguais. vou pendurar um quadro. quadrado, claro.",
    "pode desfazer a reforma. eu guardei uma foto.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <p class="medida" aria-live="off"><span id="medida-l"></span> × <span id="medida-a"></span></p>
      <div class="planta" aria-hidden="true"><div class="alvo"></div><div class="atual"></div></div>`;
    const l = ctx.palco.querySelector("#medida-l");
    const a = ctx.palco.querySelector("#medida-a");
    const atual = ctx.palco.querySelector(".atual");
    let certoDesde = 0;
    let giros = 0;

    const medir = () => {
      const w = innerWidth;
      const h = innerHeight;
      l.textContent = w;
      a.textContent = h;
      const maior = Math.max(w, h);
      atual.style.width = (w / maior) * 100 + "%";
      atual.style.height = (h / maior) * 100 + "%";
      const certo = Math.abs(w / h - 1) < 0.035;
      atual.classList.toggle("certo", certo);
      if (certo) {
        certoDesde ||= performance.now();
        ctx.depois(600, () => {
          if (certoDesde && performance.now() - certoDesde >= 550) ctx.resolver();
        });
      } else {
        certoDesde = 0;
      }
    };
    medir();
    ctx.on(window, "resize", medir);

    const orientacao = screen.orientation;
    const girou = () => {
      giros++;
      if (giros >= 2) ctx.resolver();
      else ctx.dizer("isso! agora gira de volta.");
    };
    if (orientacao) ctx.on(orientacao, "change", girou);
    else ctx.on(window, "orientationchange", girou);
  },
};

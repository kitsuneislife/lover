// § 19: apagar um elemento pelo DevTools. A parede é um <div id="parede"> por cima do Pé.

import { desenharPe } from "../pe.js";

export default {
  id: "parede",
  nome: "A parede",
  celular: false,
  falas: [
    "o Asterisco me trancou atrás de uma parede. dá pra me ver pela fresta?",
    "*a parede é minha. HTML legítimo. pode bater quanto quiser.",
  ],
  dicas: [
    "clique com o botão direito na parede e escolha “Inspecionar”. se eu fosse você, não faria isso.",
    "no painel que abre, a linha <code>&lt;div id=\"parede\"&gt;</code> fica marcada. aperte <kbd>Delete</kbd>.",
    "ou, no console: <code>document.querySelector(\"#parede\").remove()</code>",
  ],
  vitoria: [
    "livre! e com vista.",
    "*a parede volta se recarregar a página, viu? o HTML de verdade mora no servidor. você só apagou a cópia do seu navegador.",
  ],
  montar(ctx) {
    ctx.pe.sumir(true);
    ctx.palco.innerHTML = `
      <div class="cela">
        <div class="cela-pe"></div>
        <div id="parede" class="parede" role="img" aria-label="Uma parede de tijolos com a placa: propriedade do Asterisco">
          <span class="placa-parede">propriedade do *</span>
        </div>
      </div>`;
    const mini = desenharPe();
    if (ctx.estado.chapeu) mini.setAttribute("data-chapeu", "");
    ctx.palco.querySelector(".cela-pe").append(mini);

    const batidas = [
      "*toc toc.",
      "*não adianta bater.",
      "*é HTML. só cai por dentro do código.",
      "tô ouvindo as batidas daqui. obrigado pelo esforço.",
    ];
    let n = 0;
    ctx.on(ctx.palco, "click", (e) => {
      if (e.target.closest("#parede")) ctx.dizer(batidas[Math.min(n++, batidas.length - 1)]);
    });

    ctx.cada(400, () => {
      const p = document.getElementById("parede");
      let caiu = !p || !ctx.palco.contains(p);
      if (!caiu) {
        const cs = getComputedStyle(p);
        const r = p.getBoundingClientRect();
        caiu = cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.1 || r.width < 20 || r.height < 20;
      }
      if (caiu) {
        ctx.pe.sumir(false);
        ctx.resolver();
      }
    });
  },
};

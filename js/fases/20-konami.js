// § 20: o código Konami. No celular, deslizar o dedo vale como seta.

const CODIGO = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const DESENHO = { ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", b: "B", a: "A" };

export default {
  id: "konami",
  nome: "Código de trapaça",
  celular: true,
  falas: [
    "achei uma fechadura com dez buracos. o Asterisco trancou com um código de trapaça.",
    "*é um código de videogame de 1986, mais velho que muita gente que está lendo isto.",
  ],
  dicas: [
    "o código se chama Konami. o resto é com você.",
    "começa com ↑ ↑ ↓ ↓, as setas do teclado.",
    "↑ ↑ ↓ ↓ ← → ← → B A. no celular, deslize o dedo nas direções e toque nos botões B e A.",
  ],
  vitoria: [
    "abriu! e ganhei trinta vidas.",
    "*vidas não valem nada aqui. mas foi bonito de ver.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <div class="fechadura" aria-live="polite" aria-label="Fechadura com 10 buracos">
        ${CODIGO.map(() => '<span class="buraco-tecla"></span>').join("")}
      </div>
      <div class="botoes-ba" ${ctx.toque ? "" : "hidden"}>
        <button type="button" class="acao" data-tecla="b">B</button>
        <button type="button" class="acao" data-tecla="a">A</button>
      </div>`;
    const buracos = [...ctx.palco.querySelectorAll(".buraco-tecla")];
    const fechadura = ctx.palco.querySelector(".fechadura");
    let pos = 0;
    let erros = 0;

    const entrada = (tecla) => {
      if (ctx.resolvida) return;
      if (tecla === CODIGO[pos]) {
        buracos[pos].textContent = DESENHO[tecla];
        buracos[pos].classList.add("cheio");
        ctx.som.tecla();
        pos++;
        if (pos === CODIGO.length) ctx.resolver();
        return;
      }
      if (pos === 0 && !(tecla in DESENHO)) return;
      erros++;
      pos = tecla === CODIGO[0] ? 1 : 0;
      buracos.forEach((b, i) => {
        b.textContent = i < pos ? DESENHO[CODIGO[i]] : "";
        b.classList.toggle("cheio", i < pos);
      });
      fechadura.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }],
        { duration: 240 }
      );
      ctx.som.erro();
      if (erros === 3) ctx.dizer("*errou. do começo.");
      if (erros === 8) ctx.dizer("dica minha: começa olhando pra cima.");
    };

    ctx.on(window, "keydown", (e) => {
      if (e.target.closest?.("input, textarea")) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k.startsWith("Arrow")) e.preventDefault();
      entrada(k);
    });

    let toqueInicio = null;
    ctx.on(window, "touchstart", (e) => {
      const t = e.touches[0];
      toqueInicio = { x: t.clientX, y: t.clientY };
    }, { passive: true });
    ctx.on(window, "touchend", (e) => {
      if (!toqueInicio) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - toqueInicio.x;
      const dy = t.clientY - toqueInicio.y;
      toqueInicio = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
      entrada(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "ArrowRight" : "ArrowLeft") : (dy > 0 ? "ArrowDown" : "ArrowUp"));
    }, { passive: true });

    ctx.palco.querySelectorAll("[data-tecla]").forEach((b) => {
      ctx.on(b, "click", () => entrada(b.dataset.tecla));
    });
  },
};

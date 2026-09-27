// § 2: a tecla Tab. O Pé se esconde num dos espaços em branco da página.

export default {
  id: "esconderijo",
  nome: "Esconde-esconde",
  celular: false,
  falas: [
    "agora eu me escondo e você me acha.",
    "com o mouse é fácil demais, então vale uma regra: só a tecla Tab me encontra. ela pula de um lugar clicável para o próximo, na ordem da página.",
  ],
  dicas: [
    "Aperte <kbd>Tab</kbd> várias vezes e olhe os pontinhos. O destaque laranja anda com você.",
    "<kbd>Shift</kbd> + <kbd>Tab</kbd> volta uma casa.",
    "Quando o ¶ aparecer dentro do destaque, aperte <kbd>Enter</kbd>.",
  ],
  vitoria: [
    "achou. pouca gente navega pelo teclado, e tem gente que só consegue navegar assim.",
  ],
  montar(ctx) {
    const total = 7;
    const casa = 2 + Math.floor(Math.random() * (total - 2));
    ctx.pe.sumir(true);
    ctx.palco.innerHTML = `<div class="esconderijos" role="group" aria-label="Espaços em branco"></div>`;
    const grupo = ctx.palco.firstElementChild;
    let tentativasMouse = 0;

    for (let i = 0; i < total; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "esconderijo";
      b.setAttribute("aria-label", `Espaço ${i + 1}`);
      if (i === casa) b.classList.add("tem-pe");
      b.addEventListener("focus", () => {
        if (!b.matches(":focus-visible")) return;
        if (i === casa) {
          b.setAttribute("aria-label", `Espaço ${i + 1}: o Pé está aqui. Aperte Enter.`);
          ctx.som.tecla();
        }
      });
      b.addEventListener("click", (e) => {
        // e.detail === 0 quando o clique veio do teclado (Enter ou espaço)
        const peloTeclado = e.detail === 0;
        if (i === casa && peloTeclado) {
          ctx.pe.sumir(false);
          ctx.resolver();
          return;
        }
        if (!peloTeclado) {
          tentativasMouse++;
          ctx.dizer(
            tentativasMouse < 3
              ? "mouse não vale. aperta Tab."
              : "o mouse chuta, o Tab procura. tenta o teclado.",
            { humor: "triste" }
          );
          b.blur();
          return;
        }
        b.classList.add("vazio-visto");
        ctx.dizer("aí não. continua apertando Tab.");
      });
      grupo.append(b);
    }
  },
};

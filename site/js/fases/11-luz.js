// § 11: prefers-color-scheme. O interruptor de verdade fica no sistema operacional.

export default {
  id: "luz",
  nome: "O interruptor",
  celular: true,
  falas: [
    "tá claro demais aqui. ou escuro demais. depende de você.",
    "o interruptor desta página é de enfeite. o de verdade fica nas configurações do seu sistema.",
  ],
  dicas: [
    "Troque o tema do sistema: modo escuro se estiver claro, modo claro se estiver escuro. A página segue o sistema.",
    "No Chrome sem mexer no sistema: <kbd>F12</kbd>, menu ⋮, More tools, Rendering, “Emulate CSS prefers-color-scheme”.",
    "No celular: painel rápido ou central de controle, botão de modo escuro.",
  ],
  montar(ctx) {
    const escuro = matchMedia("(prefers-color-scheme: dark)");
    const comecouEscuro = escuro.matches;
    ctx.palco.innerHTML = `
      <button type="button" class="interruptor"><span class="tecla" aria-hidden="true"></span>Interruptor de enfeite</button>
      <p class="estrelas" aria-hidden="true" hidden>·  ·   ·  ·    ·   · ·   ·  ·</p>`;
    ctx.dizer(comecouEscuro
      ? "aqui está escuro. acende a luz?"
      : "aqui está claro. apaga a luz? eu durmo melhor no escuro.");

    ctx.on(ctx.palco.querySelector(".interruptor"), "click", () => {
      ctx.dizer("eu avisei que era de enfeite.");
    });

    ctx.on(escuro, "change", () => {
      if (escuro.matches === comecouEscuro) return;
      ctx.palco.querySelector(".estrelas").hidden = !escuro.matches;
      ctx.resolver(escuro.matches
        ? ["ahh. no escuro meus olhos brilham, sabia?", "aqueles pontinhos são os espaços em branco da página. à noite eles viram estrelas."]
        : ["obrigado. no escuro eu vivia tropeçando nos espaços em branco.", "os sites também leem essa preferência. é por isso que esta página mudou de cor sozinha."]);
    });
  },
};

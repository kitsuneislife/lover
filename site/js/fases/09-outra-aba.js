// § 9: BroadcastChannel. O Pé atravessa de uma aba para a outra.

export default {
  id: "outra-aba",
  nome: "Visita",
  celular: true,
  falas: [
    "nunca vi outra aba por dentro. dizem que é igual a esta.",
    "abre esta mesma página numa aba nova? eu dou um jeito de pular pra lá.",
  ],
  dicas: [
    "O link abaixo abre a página numa aba nova. Também dá para copiar o endereço e colar numa aba nova.",
    "As duas abas precisam ficar abertas ao mesmo tempo, no mesmo navegador.",
    "Janela anônima não conta: ela é outro navegador para o Pé.",
  ],
  montar(ctx) {
    if (!ctx.canal) {
      ctx.dizer("este navegador não deixa as abas conversarem. pode pular esta página.", { humor: "triste" });
      return;
    }
    const url = location.pathname + location.search;
    ctx.palco.innerHTML = `<p><a href="${url}" target="_blank" rel="noopener">Abrir esta página em outra aba</a></p>`;

    let longe = false;
    ctx.canal.ouvir((msg) => {
      if (msg?.t === "quem" && !ctx.resolvida) {
        // a aba nova ainda está carregando; espera ela ficar pronta para receber o Pé
        ctx.depois(900, () => {
          ctx.canal.enviar({ t: "pe-vai" });
          ctx.pe.sumir(true);
          longe = true;
          ctx.resolver([
            "fui! olha a outra aba.",
            "quando fechar a aba nova, eu volto. ou pode virar a página daqui mesmo.",
          ]);
        });
      }
      if (msg?.t === "convidada-saiu" && longe) {
        longe = false;
        ctx.pe.sumir(false);
        ctx.pe.pular();
        ctx.som.pulo();
      }
    });
    ctx.aoSair(() => ctx.pe.sumir(false));
  },
};

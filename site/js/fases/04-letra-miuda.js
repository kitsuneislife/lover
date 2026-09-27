// § 4: zoom. A cláusula do contrato tem 4 pixels de altura.

export default {
  id: "letra-miuda",
  nome: "Letra miúda",
  celular: true,
  falas: [
    "o contrato de aluguel desta aba tem uma cláusula em letra miúda. eu não enxergo nada.",
    "você consegue deixar a página maior?",
  ],
  dicas: [
    "Zoom do navegador: <kbd>Ctrl</kbd> e <kbd>+</kbd> algumas vezes. No Mac, <kbd>Cmd</kbd> e <kbd>+</kbd>.",
    "Também dá com <kbd>Ctrl</kbd> segurado e a rodinha do mouse. No celular, faça pinça com dois dedos.",
    "Precisa passar de uns 175%.",
  ],
  vitoria: [
    "“cláusula 7: o inquilino pode sair quando quiser, desde que alguém leia esta cláusula.” ótimo. alguém leu.",
    "pode voltar o zoom ao normal com <kbd>Ctrl</kbd> + <kbd>0</kbd>. vai ficar tudo gigante até lá.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <div class="contrato">
        <p><strong>Contrato de aluguel de aba.</strong> Inquilino: Pé. Proprietário: você.</p>
        <p class="miuda">Cláusula 7. O inquilino pode sair quando quiser, desde que alguém leia esta cláusula. Parabéns, você leu. Pode desfazer o zoom agora. Cláusula 8. O proprietário não pode fechar a aba antes do fim. Cláusula 9. Biscoitos são permitidos, cookies não.</p>
      </div>`;

    // devicePixelRatio cresce com o zoom do navegador; visualViewport.scale, com a pinça
    const base = devicePixelRatio || 1;
    const vv = window.visualViewport;

    const conferir = () => {
      const porPinca = vv ? vv.scale : 1;
      const zoom = Math.max((devicePixelRatio || 1) / base, porPinca);
      if (zoom >= 1.7) ctx.resolver();
      else if (zoom >= 1.2 && !ctx.resolvida) ctx.dizer("tá melhorando. mais um pouco.");
    };
    ctx.on(window, "resize", conferir);
    if (vv) ctx.on(vv, "resize", conferir);

    // mudança de devicePixelRatio nem sempre dispara resize; a media query de resolução sempre avisa
    let mq = null;
    const vigiarResolucao = () => {
      if (mq) mq.removeEventListener("change", aoMudar);
      mq = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
      mq.addEventListener("change", aoMudar, { once: true });
    };
    function aoMudar() { conferir(); vigiarResolucao(); }
    vigiarResolucao();
    ctx.aoSair(() => mq?.removeEventListener("change", aoMudar));
  },
};

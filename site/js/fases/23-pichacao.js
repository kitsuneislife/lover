// § 23: editar o texto da própria página, com document.designMode ou pelo Inspecionar.

const BONITO = /(lind|bonit|maravilh|incr[ií]vel|fof|elegante|charmos|perfeit|legal|demais|gat[oa]|chique|estilos|incr|belo|bela)/i;

export default {
  id: "pichacao",
  nome: "Pichação",
  celular: false,
  falas: [
    "alguém pichou a parede do avesso.",
    "*fui eu. e é verdade.",
  ],
  dicas: [
    "o navegador deixa editar o texto de qualquer página, se você souber pedir.",
    "no console, digite <code>document.designMode = \"on\"</code>. depois clique na pichação e escreva por cima.",
    "também dá pelo Inspecionar: dois cliques no texto, dentro do HTML, e edite.",
  ],
  vitoria: [
    "bem melhor. e mais verdadeiro.",
    "*designMode transforma qualquer site num editor. dá pra fazer print falso de qualquer página assim. não confie em print.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `<p class="pichacao" id="pichacao">o Pé é feio</p>`;
    ctx.pe.humor("triste");
    let ultimo = "o Pé é feio";

    // com designMode ligado, uma seleção grande pode apagar até o contêiner da fase;
    // por isso o jogo olha o palco inteiro, sem as falas e as notas
    const palco = document.getElementById("palco");
    const lerParede = () => {
      const el = palco.querySelector(".pichacao, #pichacao");
      if (el) return el.textContent;
      const copia = palco.cloneNode(true);
      copia.querySelectorAll(".falas, .rodape, .secao, .secao-nome, .depois").forEach((n) => n.remove());
      return copia.textContent;
    };

    const conferir = () => {
      const texto = lerParede().replace(/\s+/g, " ").trim();
      if (texto === ultimo) return;
      ultimo = texto;
      const temFeio = /feio/i.test(texto);
      if (!temFeio && BONITO.test(texto)) {
        document.designMode = "off";
        ctx.pe.humor(null);
        return ctx.resolver();
      }
      if (!texto) ctx.dizer("apagar tudo deixa a parede em branco. escreve alguma coisa boa?");
      else if (!temFeio) ctx.dizer("hmm. e se tivesse um elogio aí?");
      else if (texto.length > 12) ctx.dizer("*ficou ainda melhor. obrigado.");
    };

    const obs = new MutationObserver(conferir);
    obs.observe(palco, { subtree: true, childList: true, characterData: true });
    ctx.on(document, "input", conferir);
    ctx.aoSair(() => {
      obs.disconnect();
      if (document.designMode === "on") document.designMode = "off";
    });
  },
};

// § 1: seleção de texto. O recado foi escrito na cor do papel.

export default {
  id: "tinta-branca",
  nome: "Tinta branca",
  celular: true,
  falas: [
    "escrevi um recado pra você aqui embaixo, mas usei tinta branca. em papel branco.",
    "foi burrice, eu sei. passa o cursor por cima segurando o botão, que nem quem vai sublinhar.",
  ],
  dicas: [
    "Clique antes da primeira palavra, segure e arraste até o fim do parágrafo.",
    "Atalho: <kbd>Ctrl</kbd> + <kbd>A</kbd> seleciona tudo. No Mac é <kbd>Cmd</kbd> + <kbd>A</kbd>.",
    "No celular: segure o dedo numa palavra e estique a seleção.",
  ],
  vitoria: [
    "leu? então já sabe mais sobre navegador do que muita gente.",
    "cada página daqui pra frente vai pedir um botão diferente. alguns você nunca apertou.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <p class="carta">
        Querida pessoa do outro lado da tela,
        <span class="tinta-branca" id="recado">a porta desta página abre quando alguém lê o que ninguém vê. você acabou de ler.</span>
        Com carinho, o Pé.
      </p>`;
    const recado = ctx.palco.querySelector("#recado");

    const conferir = () => {
      const sel = getSelection();
      if (!sel || sel.isCollapsed) return;
      if (sel.containsNode(recado, false) || sel.toString().includes("você acabou de ler")) {
        recado.classList.add("revelada");
        ctx.resolver();
      }
    };
    ctx.on(document, "selectionchange", conferir);
  },
};

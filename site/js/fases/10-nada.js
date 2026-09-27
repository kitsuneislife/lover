// § 10: área de transferência. O evento "copy" troca o que foi copiado no caminho.

const SEGREDO = "tudo que eu tenho";

export default {
  id: "nada",
  nome: "Nada",
  celular: true,
  falas: [
    "copia a palavra aí embaixo e cola na caixa. só isso.",
    "é uma palavra só. confia.",
  ],
  dicas: [
    "Selecione a palavra grande e copie com <kbd>Ctrl</kbd> + <kbd>C</kbd> (<kbd>Cmd</kbd> + <kbd>C</kbd> no Mac).",
    "Depois clique na caixa e cole com <kbd>Ctrl</kbd> + <kbd>V</kbd>.",
    "No celular: segure o dedo na palavra, toque em Copiar, depois segure na caixa e toque em Colar.",
  ],
  vitoria: [
    "surpresa. eu troquei a palavra no caminho entre o copiar e o colar.",
    "qualquer site pode fazer isso, aliás. vale olhar o que você cola antes de apertar Enter num terminal.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <p class="nada" id="palavra-nada">nada</p>
      <div class="campo">
        <label for="cola">Cole aqui</label>
        <input id="cola" name="cola" autocomplete="off" spellcheck="false" placeholder="Ctrl+V…">
      </div>`;
    const campo = ctx.palco.querySelector("#cola");
    let copiou = false;

    ctx.on(document, "copy", (e) => {
      const sel = String(getSelection() || "");
      if (!/nada/i.test(sel) || !e.clipboardData) return;
      e.clipboardData.setData("text/plain", SEGREDO);
      e.preventDefault();
      copiou = true;
      ctx.pe.humor("feliz", 900);
    });

    let colou = false;
    ctx.on(campo, "paste", () => { colou = true; });
    ctx.on(campo, "input", () => {
      const v = campo.value.trim().toLowerCase();
      if (v.includes(SEGREDO)) return ctx.resolver();
      if (v === "nada" && !colou) ctx.dizer("você digitou. eu pedi para copiar e colar.");
      else if (colou && !copiou && v) ctx.dizer("isso não veio daqui. copia a palavra grande.");
    });
  },
};

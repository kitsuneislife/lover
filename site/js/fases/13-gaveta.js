// § 13: localStorage. Trapaça permitida: editar o armazenamento à mão.

import { lerCru, gravarCru, apagar } from "../store.js";

export default {
  id: "gaveta",
  nome: "Trapaça permitida",
  celular: false,
  falas: [
    "esta aba guarda as coisas numa gaveta chamada localStorage. tem uma chave de verdade lá, chamada nfea.chaves.",
    "ela vale zero. eu precisava de uma. normalmente isso seria trapaça, mas hoje eu deixo.",
  ],
  dicas: [
    "Nas ferramentas de desenvolvedor (<kbd>F12</kbd>): aba Application no Chrome, Armazenamento no Firefox, depois Local Storage.",
    "Edite o valor de <code>nfea.chaves</code> de 0 para 1.",
    "Ou no console: <code>localStorage.setItem(\"nfea.chaves\", 1)</code>",
  ],
  montar(ctx) {
    gravarCru("chaves", "0");
    ctx.palco.innerHTML = `<p class="gaveta">chaves na gaveta: <output id="chaves">0</output></p>`;
    const saida = ctx.palco.querySelector("#chaves");
    let ultimo = "0";

    ctx.cada(400, () => {
      const v = lerCru("chaves");
      if (v === ultimo) return;
      ultimo = v;
      saida.textContent = v ?? "nada";
      if (v === null) return ctx.dizer("você jogou a gaveta fora! tudo bem, eu faço outra.", { humor: "espanto" }), gravarCru("chaves", "0");
      const n = Number(v);
      if (!Number.isFinite(n)) return ctx.dizer(`“${v}” não é chave. é um número que eu preciso.`, { humor: "triste" });
      if (n < 1) return ctx.dizer(n < 0 ? "chaves negativas? agora eu devo chaves." : "continua zero.", { humor: "triste" });
      const fala = n === 1
        ? "uma chave. exatamente o que eu pedi."
        : `${new Intl.NumberFormat("pt-BR").format(n)} chaves. eu pedi uma. vou fingir que não vi as outras.`;
      ctx.resolver([fala, "tudo que um site guarda no seu navegador, você pode ler e mudar. o site confia, mas não devia."]);
    });
    ctx.aoSair(() => apagar("chaves"));
  },
};

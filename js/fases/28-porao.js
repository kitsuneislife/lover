// § 28: a senha está num comentário HTML, visível só no código-fonte (Ctrl+U).

import { normalizar } from "../util.js";

export default {
  id: "porao",
  nome: "Porão do código",
  celular: true,
  falas: [
    "o Asterisco escondeu a senha no lugar da página que ninguém lê.",
    "*o código-fonte. lá eu escrevo o que quiser e a página nem mostra.",
  ],
  dicas: [
    "<kbd>Ctrl</kbd> + <kbd>U</kbd> abre o código-fonte. no Mac, <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>U</kbd>.",
    "o que eu escrevo fica entre <code>&lt;!--</code> e <code>--&gt;</code>. o navegador pula essas partes.",
    "no celular, escreva <code>view-source:</code> antes do endereço.",
  ],
  vitoria: [
    "marmelada! bem a cara dele.",
    "*todo site entrega o próprio código para quem pedir. senha em comentário de HTML é a pior ideia do mundo. não façam isso em casa.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <div class="campo campo-grande">
        <label for="senha-porao">Senha do porão</label>
        <input id="senha-porao" name="senha-porao" autocomplete="off" spellcheck="false" placeholder="a senha…">
      </div>`;
    const campo = ctx.palco.querySelector("input");
    ctx.on(campo, "input", () => {
      const v = normalizar(campo.value);
      if (v === "marmelada") ctx.resolver();
      else if (v === "senha") ctx.dizer("*essa foi boa. não.");
      else if (v === "goiabada") ctx.dizer("*perto. é da mesma família.");
    });
  },
};

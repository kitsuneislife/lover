// § 17: digitar o caractere ¶ sem copiar da página (Alt+0182, Option+7, Ctrl+Shift+U b6).

export default {
  id: "nome",
  nome: "Nome verdadeiro",
  celular: true,
  falas: [
    "aqui no avesso eu não atendo por apelido. só pelo meu nome verdadeiro.",
    "*o nome dele é um símbolo. escreve o símbolo aí.",
  ],
  dicas: [
    "no Windows, segure <kbd>Alt</kbd> e digite 0182 no teclado numérico. solte o Alt. pronto.",
    "no Mac é <kbd>Option</kbd> + <kbd>7</kbd>. no Linux, <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>U</kbd>, depois b6 e espaço.",
    "no celular, procure na página de símbolos do teclado. ou copie de algum site. eu não vi nada.",
  ],
  vitoria: [
    "isso! fazia tempo que ninguém me chamava pelo nome.",
    "*Alt+0182. anota, que cai na prova.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <div class="campo campo-grande">
        <label for="nome-verdadeiro">Nome verdadeiro</label>
        <input id="nome-verdadeiro" name="nome-verdadeiro" autocomplete="off" spellcheck="false" placeholder="o símbolo…">
      </div>`;
    const campo = ctx.palco.querySelector("input");
    ctx.on(campo, "input", () => {
      const v = campo.value.trim();
      if (v.includes("¶")) return ctx.resolver();
      const baixo = v.toLowerCase();
      if (baixo === "pe" || baixo === "pé") ctx.dizer("*isso é apelido.");
      else if (baixo === "pé-de-mosca" || baixo === "pe-de-mosca" || baixo === "pé de mosca") ctx.dizer("esse é o nome de gente. eu quero o nome de símbolo.");
      else if (v === "§") ctx.dizer("esse é meu primo, o Parágrafo. ele manda lembranças.");
      else if (v === "*") ctx.dizer("*oi. mas não é comigo.");
      else if (baixo === "p" || baixo === "q") ctx.dizer("parecido, mas eu tenho duas pernas.");
    });
  },
};

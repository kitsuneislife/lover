// § 3: Ctrl+F. Uma palavra escondida com hidden="until-found" num palheiro de texto.
// Onde o navegador não conhece until-found, a palavra fica visível e vem com uma senha ao lado.

const PALHA = (
  "palha feno capim sapê colmo talo espiga fardo broto ramo junco caule restolho " +
  "folha seca fibra fio caniço vime sisal juta palhiço gravetos cascas grama trigo " +
  "centeio aveia cevada milho arroz painço fenacho restos poeira sol vento tarde"
).split(" ");
const LIGA = "de e o a um no na com do da ao em por".split(" ");

function semente(n) {
  let x = n;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

function palheiro(qtd, rnd) {
  const out = [];
  for (let i = 0; i < qtd; i++) {
    out.push(rnd() < 0.3 ? LIGA[Math.floor(rnd() * LIGA.length)] : PALHA[Math.floor(rnd() * PALHA.length)]);
  }
  return out.join(" ");
}

export default {
  id: "agulha",
  nome: "O palheiro",
  celular: true,
  falas: [
    "perdi uma coisa pontuda no meio do palheiro aí embaixo. são duas mil palavras de mato.",
    "eu leio devagar. o seu navegador lê a página inteira de uma vez, se você pedir.",
  ],
  dicas: [
    "Procure a palavra na página: <kbd>Ctrl</kbd> + <kbd>F</kbd>. No Mac, <kbd>Cmd</kbd> + <kbd>F</kbd>.",
    "No celular: menu do navegador, depois “Localizar na página”.",
    "A palavra é <span class=\"nao-achavel\" data-t=\"agulha\"></span>. Se ela aparecer com uma senha do lado, digite a senha no campo.",
  ],
  vitoria: [
    "achou! e eu revirando o feno com as mãos.",
    "o nome disso é hidden until found: o texto fica escondido até alguém procurar por ele. quase ninguém usa.",
  ],
  montar(ctx) {
    const rnd = semente(1987);
    const suportaAteAchar = "onbeforematch" in document.body;
    const antes = palheiro(1100, rnd);
    const depois = palheiro(900, rnd);

    ctx.palco.innerHTML = `
      <p class="procure">procure: <span class="nao-achavel" data-t="a agulha"></span></p>
      <div class="palheiro" tabindex="0" aria-label="Palheiro de texto"></div>
      <div class="campo" style="margin-top:1.5rem">
        <label for="senha-agulha">Achou uma senha? Digite aqui</label>
        <input id="senha-agulha" name="senha-agulha" autocomplete="off" spellcheck="false" placeholder="a palavra ao lado…">
      </div>`;
    const monte = ctx.palco.querySelector(".palheiro");
    monte.append(antes + " ");

    const agulha = document.createElement("span");
    agulha.className = "agulha";
    if (suportaAteAchar) {
      agulha.setAttribute("hidden", "until-found");
      agulha.textContent = "agulha";
      ctx.on(agulha, "beforematch", () => {
        agulha.classList.add("achada");
        ctx.resolver();
      });
    } else {
      agulha.classList.add("agulha-visivel");
      agulha.textContent = "agulha (senha: ferrugem)";
    }
    monte.append(agulha, " " + depois);

    const campo = ctx.palco.querySelector("#senha-agulha");
    if (suportaAteAchar) ctx.palco.querySelector(".campo").hidden = true;
    ctx.on(campo, "input", () => {
      const v = campo.value.trim().toLowerCase();
      if (v === "ferrugem") ctx.resolver();
      else if (v === "agulha") ctx.dizer("essa é a agulha. a senha está do lado dela.");
    });
  },
};

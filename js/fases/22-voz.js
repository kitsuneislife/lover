// § 22: speechSynthesis. O Pé diz a senha em voz alta, cada vez com uma voz pior.

import { normalizar, sortear } from "../util.js";

const PALAVRAS = ["paralelepípedo", "otorrinolaringologista", "jabuticabeira", "pindamonhangaba", "anticonstitucional"];

const JEITOS = [
  { rate: 1.05, pitch: 1.9, antes: "a senha é" },
  { rate: 0.7, pitch: 0.1, antes: "aqui é o Asterisco. a senha é" },
  { rate: 1.6, pitch: 1.2, antes: "rapidinho, a senha é" },
  { rate: 0.45, pitch: 1, antes: "bem devagar. a senha é" },
];

export default {
  id: "voz",
  nome: "Voz",
  celular: true,
  falas: [
    "aprendi a falar! em voz alta mesmo, pelo alto-falante.",
    "*ele diz a senha em voz alta, cada vez de um jeito diferente, e nenhum deles é bom.",
  ],
  dicas: [
    "o som que precisa estar ligado é o do seu computador. o botão de som do jogo não interfere.",
    "clicar de novo repete, cada vez com uma voz.",
    "é uma palavra só, comprida. acento não importa na resposta.",
  ],
  vitoria: [
    "essa palavra é difícil até pra mim, que sou feito de tinta.",
    "*o navegador tem uma voz embutida desde 2014. quase ninguém usa. dá pra entender o motivo.",
  ],
  montar(ctx) {
    const senha = sortear(PALAVRAS);
    const fala = window.speechSynthesis;
    ctx.palco.innerHTML = `
      <p><button type="button" class="acao" id="ouvir">Ouvir o Pé</button></p>
      <div class="campo" style="margin-top:1.5rem">
        <label for="senha-voz">O que ele disse?</label>
        <input id="senha-voz" name="senha-voz" autocomplete="off" spellcheck="false" placeholder="uma palavra…">
      </div>`;
    const botao = ctx.palco.querySelector("#ouvir");
    const campo = ctx.palco.querySelector("#senha-voz");

    if (!fala || typeof SpeechSynthesisUtterance === "undefined") {
      ctx.dizer(`este navegador não fala. então eu escrevo: ${senha}.`);
    }

    let vez = 0;
    ctx.on(botao, "click", () => {
      if (!fala) return;
      const jeito = JEITOS[vez % JEITOS.length];
      vez++;
      fala.cancel();
      const u = new SpeechSynthesisUtterance(`${jeito.antes}: ${senha}.`);
      u.lang = "pt-BR";
      const voz = fala.getVoices().find((v) => v.lang?.toLowerCase().startsWith("pt"));
      if (voz) u.voice = voz;
      u.rate = jeito.rate;
      u.pitch = jeito.pitch;
      fala.speak(u);
      ctx.pe.humor("feliz", 1500);
      botao.textContent = ["Ouvir de novo", "Ouvir mais uma vez", "Ouvir, por favor", "Ouvir o Pé"][vez % 4];
    });

    ctx.on(campo, "input", () => {
      const v = normalizar(campo.value);
      if (v === normalizar(senha)) ctx.resolver();
      else if (v.length >= normalizar(senha).length) ctx.dizer("*quase. ele fala enrolado, eu sei.");
    });
    ctx.aoSair(() => fala?.cancel());
  },
};

// § 25: o Pé só aparece quando o mouse sai da janela. A senha fica na plaquinha dele.

import { desenharPe } from "../pe.js";
import { normalizar, sortear } from "../util.js";

const PALAVRAS = ["ornitorrinco", "pamonha", "bumerangue", "chuchu", "sabiá"];

export default {
  id: "medo-de-seta",
  nome: "Medo de seta",
  celular: true,
  falas: [
    "tenho medo da setinha do mouse. ela aponta pra tudo.",
    "*ele guardou a senha numa plaquinha. só mostra quando a seta vai embora.",
  ],
  dicas: [
    "ele só aparece quando a seta sai da janela do navegador.",
    "leve o mouse para fora da janela do navegador: outra tela, a barra de tarefas, qualquer lugar.",
    "digitar não precisa de mouse. a caixa continua funcionando com a seta lá fora.",
  ],
  vitoria: [
    "obrigado por esconder a seta. pode trazer de volta, mas devagar.",
    "*o navegador sabe quando o mouse sai da página. para onde ele vai, ainda não.",
  ],
  montar(ctx) {
    const senha = sortear(PALAVRAS);
    ctx.pe.sumir(true);
    ctx.palco.innerHTML = `
      <div class="toca" aria-live="polite">
        <div class="toca-pe" hidden><div class="placa-senha"></div></div>
        <p class="toca-vazia">a toca está vazia.</p>
      </div>
      <div class="campo" style="margin-top:1.5rem">
        <label for="senha-seta">O que a plaquinha diz?</label>
        <input id="senha-seta" name="senha-seta" autocomplete="off" spellcheck="false" placeholder="a palavra…">
      </div>`;
    const pe = ctx.palco.querySelector(".toca-pe");
    const vazia = ctx.palco.querySelector(".toca-vazia");
    const placa = ctx.palco.querySelector(".placa-senha");
    const mini = desenharPe();
    if (ctx.estado.chapeu) mini.setAttribute("data-chapeu", "");
    pe.prepend(mini);
    const campo = ctx.palco.querySelector("#senha-seta");

    let timer = 0;
    let sustos = 0;
    const aparecer = () => {
      placa.textContent = senha;
      pe.hidden = false;
      vazia.hidden = true;
    };
    const esconder = () => {
      clearTimeout(timer);
      if (!pe.hidden) {
        sustos++;
        if (sustos <= 3) ctx.dizer(["AH! a seta!", "voltou! tchau!", "*ele sempre foge. é um dom."][sustos - 1]);
      }
      pe.hidden = true;
      vazia.hidden = false;
    };
    const saiu = () => {
      clearTimeout(timer);
      timer = setTimeout(aparecer, 700);
    };

    ctx.on(document.documentElement, "mouseleave", saiu);
    ctx.on(window, "blur", saiu);
    ctx.on(window, "pointermove", (e) => { if (e.pointerType === "mouse") esconder(); });
    if (ctx.toque) {
      // no celular a "seta" é o dedo: ele aparece quando ninguém encosta na tela
      ctx.on(window, "touchstart", esconder, { passive: true });
      ctx.on(window, "touchend", () => { clearTimeout(timer); timer = setTimeout(aparecer, 1500); }, { passive: true });
      timer = setTimeout(aparecer, 2500);
    }
    ctx.aoSair(() => clearTimeout(timer));

    ctx.on(campo, "input", () => {
      if (normalizar(campo.value) === normalizar(senha)) ctx.resolver();
    });
  },
};

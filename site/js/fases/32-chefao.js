// § 32: o chefão. Seis truques sorteados do Ato I, em qualquer ordem, em 100 segundos.
// Se o tempo acabar, o Asterisco sorteia outros seis.

import { sortear } from "../util.js";

const TEMPO = 100;
const PONTUACAO = ["¶", "*", "§", ".", ",", ";", "‽", "&", "!", "?", "“", "”", "@", "#"];

// Cada tarefa arma os próprios ouvintes e devolve a função que os desarma.
const TAREFAS = [
  {
    id: "selecionar",
    celular: true,
    html: '<span class="frase-alvo">selecione esta frase inteira</span>',
    armar(li, feito) {
      const alvo = li.querySelector(".frase-alvo");
      // arrastar o mouse seleciona o texto de dentro do span, não o span; por isso compara o texto
      const f = () => { if (String(getSelection() || "").replace(/\s+/g, " ").includes(alvo.textContent)) feito(); };
      document.addEventListener("selectionchange", f);
      return () => document.removeEventListener("selectionchange", f);
    },
  },
  {
    id: "aba",
    celular: true,
    html: "vá para outra aba e volte",
    armar(li, feito) {
      let saiu = false;
      const f = () => { if (document.hidden) saiu = true; else if (saiu) feito(); };
      document.addEventListener("visibilitychange", f);
      return () => document.removeEventListener("visibilitychange", f);
    },
  },
  {
    id: "copiar",
    celular: true,
    html: "copie qualquer coisa desta página",
    armar(li, feito) {
      document.addEventListener("copy", feito);
      return () => document.removeEventListener("copy", feito);
    },
  },
  {
    id: "voltar",
    celular: true,
    html: "aperte o botão Voltar do navegador",
    armar(li, feito) {
      const base = location.pathname + location.search;
      history.pushState({ chefao: 1 }, "", base + "#golpe");
      const f = () => { history.replaceState(null, "", base); feito(); };
      addEventListener("popstate", f, { once: true });
      return () => {
        removeEventListener("popstate", f);
        if (location.hash === "#golpe") history.replaceState(null, "", base);
      };
    },
  },
  {
    id: "simbolo",
    celular: true,
    html: '<label>escreva o nome verdadeiro do Pé <input class="mini-campo" autocomplete="off" spellcheck="false" aria-label="Nome verdadeiro do Pé"></label>',
    armar(li, feito) {
      const campo = li.querySelector("input");
      const f = () => { if (campo.value.includes("¶")) feito(); };
      campo.addEventListener("input", f);
      return () => campo.removeEventListener("input", f);
    },
  },
  {
    id: "janela",
    celular: true,
    html: "mude o tamanho da janela (no celular, gire o aparelho)",
    armar(li, feito) {
      const w0 = innerWidth;
      const h0 = innerHeight;
      const f = () => { if (Math.abs(innerWidth - w0) > 60 || Math.abs(innerHeight - h0) > 60) feito(); };
      addEventListener("resize", f);
      return () => removeEventListener("resize", f);
    },
  },
  {
    id: "zoom",
    celular: false,
    html: "mude o zoom da página, para mais ou para menos",
    armar(li, feito) {
      const mq = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
      mq.addEventListener("change", feito, { once: true });
      return () => mq.removeEventListener("change", feito);
    },
  },
  {
    id: "tab",
    celular: false,
    html: 'leve o foco até este botão só com a tecla Tab: <button type="button" class="alvo-tab">alvo</button>',
    armar(li, feito) {
      const b = li.querySelector(".alvo-tab");
      const f = () => { if (b.matches(":focus-visible")) feito(); };
      b.addEventListener("focus", f);
      return () => b.removeEventListener("focus", f);
    },
  },
  {
    id: "console",
    celular: false,
    html: "digite <code>golpe()</code> no console",
    armar(li, feito) {
      window.golpe = () => { feito(); return "*ai."; };
      return () => { delete window.golpe; };
    },
  },
];

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function chuvaDePontuacao(n = 90) {
  const camada = document.createElement("div");
  camada.className = "chuva";
  camada.setAttribute("aria-hidden", "true");
  document.body.append(camada);
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.textContent = sortear(PONTUACAO);
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 1 + Math.random() * 3 + "rem";
    camada.append(s);
    s.animate(
      [
        { transform: `translateY(-10vh) rotate(0deg)` },
        { transform: `translateY(110vh) rotate(${(Math.random() - 0.5) * 720}deg)` },
      ],
      { duration: 2200 + Math.random() * 2600, delay: Math.random() * 1800, easing: "cubic-bezier(.3,0,.8,1)", fill: "both" }
    );
  }
  setTimeout(() => camada.remove(), 7000);
}

export default {
  id: "chefao",
  nome: "O chefão",
  celular: true,
  falas: [
    "*última página. sou eu contra vocês dois.",
    "*seis tarefas, cem segundos. tudo coisa que vocês aprenderam lá no começo, na ordem que quiserem.",
    "eu ajudo torcendo.",
  ],
  dicas: [
    "as tarefas podem ser feitas em qualquer ordem.",
    "se o tempo acabar, eu sorteio outras seis. azar.",
    "não ajudo mais que isso. eu sou o chefão.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <p><button type="button" class="acao" id="lutar">Começar a luta</button></p>
      <div class="arena" hidden>
        <p class="relogio"><span id="tempo">${TEMPO}</span></p>
        <ol class="tarefas"></ol>
      </div>`;
    const botao = ctx.palco.querySelector("#lutar");
    const arena = ctx.palco.querySelector(".arena");
    const lista = ctx.palco.querySelector(".tarefas");
    const tempo = ctx.palco.querySelector("#tempo");
    let desarmes = [];
    let relogio = 0;
    let rodada = 0;

    const encerrar = () => {
      clearInterval(relogio);
      desarmes.forEach((d) => d());
      desarmes = [];
    };

    const lutar = () => {
      encerrar();
      rodada++;
      botao.parentElement.hidden = true;
      arena.hidden = false;
      const pool = TAREFAS.filter((t) => !ctx.toque || t.celular);
      const escolhidas = embaralhar(pool).slice(0, 6);
      let faltam = escolhidas.length;
      lista.replaceChildren();

      escolhidas.forEach((t) => {
        const li = document.createElement("li");
        li.className = "tarefa";
        li.innerHTML = t.html;
        lista.append(li);
        let pronto = false;
        const desarmar = t.armar(li, () => {
          if (pronto) return;
          pronto = true;
          li.classList.add("feita");
          ctx.som.acerto();
          ctx.ast?.rir();
          faltam--;
          if (faltam === 0) vencer();
          else if (faltam === 3) ctx.dizer("*isso doeu.");
          else if (faltam === 1) ctx.dizer("só mais uma!");
        });
        desarmes.push(desarmar);
      });

      const inicio = performance.now();
      const provocacoes = { 70: "*tic tac.", 45: "*o Pé tá suando.", 20: "*vinte.", 10: "vai, vai, vai!" };
      relogio = setInterval(() => {
        const resta = Math.max(0, Math.ceil(TEMPO - (performance.now() - inicio) / 1000));
        if (String(resta) !== tempo.textContent) {
          tempo.textContent = resta;
          if (provocacoes[resta]) ctx.dizer(provocacoes[resta]);
        }
        if (resta <= 0) perder();
      }, 200);
    };

    const perder = () => {
      encerrar();
      ctx.pe.humor("triste", 2000);
      ctx.som.erro();
      ctx.dizer(rodada >= 3
        ? "*acabou o tempo. de novo. eu poderia fazer isso o dia inteiro."
        : "*acabou o tempo. quer outra rodada? eu sorteio tarefas novas.");
      botao.textContent = "Tentar de novo";
      botao.parentElement.hidden = false;
      arena.hidden = true;
    };

    const vencer = () => {
      encerrar();
      arena.hidden = true;
      ctx.estado.estrela = true;
      ctx.salvar();
      if (!ctx.reduzido) chuvaDePontuacao();
      ctx.ast?.humor("derrotado");
      ctx.titulo.definir("¶* fim.");
      ctx.resolver([
        "*tá. tá bom. vocês ganharam.",
        "*eu só queria que alguém lesse as notas de rodapé.",
        "a gente leu todas. até as que você escreveu de propósito pra irritar.",
        "*… posso ir junto?",
        "pode. senta aí no chapéu.",
        "fim. obrigado por jogar as trinta e duas páginas. o Asterisco também agradece, mas ele nunca vai admitir.",
        "*condições se aplicam.",
      ]);
      setTimeout(() => document.querySelector("#ast-casa")?.classList.add("no-chapeu"), 2500);
    };

    ctx.on(botao, "click", lutar);
    ctx.aoSair(encerrar);
    if (ctx.estado.estrela) document.querySelector("#ast-casa")?.classList.add("no-chapeu");
  },
};

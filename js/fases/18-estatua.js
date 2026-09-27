// § 18: ficar 40 segundos sem mexer em nada enquanto o Asterisco provoca.
// Mouse, teclado, rodinha, toque ou sair da aba: tudo zera o relógio.

const TOTAL = 40;

export default {
  id: "estatua",
  nome: "Estátua",
  celular: true,
  falas: [
    "o Asterisco só abre a próxima página se a gente ficar parado.",
    "*quarenta segundos. sem mexer o mouse, sem apertar tecla, sem rolar a página. sair da aba também não vale, que eu vejo.",
  ],
  dicas: [
    "solte o mouse. tire a mão da mesa. se quiser, vá buscar um café, mas não feche a aba.",
    "tudo que aparece na tela durante a contagem fui eu que coloquei.",
    "a mosca também não é de verdade. desculpa, Pé.",
  ],
  vitoria: [
    "quarenta segundos parado! eu nem sabia que dava.",
    "*a maioria clica no botão de não clicar. anotado.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <p class="relogio" aria-live="off"><span id="relogio">${TOTAL}</span></p>
      <div class="tentacoes" aria-hidden="true"></div>`;
    const relogio = ctx.palco.querySelector("#relogio");
    const tentacoes = ctx.palco.querySelector(".tentacoes");
    let inicio = 0;
    let timers = [];
    let movido = 0;
    let rodando = false;
    let zeradas = 0;

    const limparTentacoes = () => {
      timers.forEach(clearTimeout);
      timers = [];
      tentacoes.replaceChildren();
      document.querySelectorAll(".tentacao-fixa").forEach((n) => n.remove());
      ctx.titulo.forcar(null);
    };

    const em = (s, fn) => timers.push(setTimeout(() => rodando && fn(), s * 1000));

    const agendar = () => {
      em(3, () => {
        const b = document.createElement("div");
        b.className = "tentacao-fixa cookies";
        b.innerHTML = `<p>Este site usa cookies para melhorar sua experiência.</p><button type="button">Aceitar todos</button><button type="button">Rejeitar</button>`;
        document.body.append(b);
      });
      em(9, () => {
        const m = document.createElement("span");
        m.className = "mosca";
        m.innerHTML = `<svg viewBox="0 0 40 30" aria-hidden="true"><ellipse cx="14" cy="9" rx="9" ry="6" fill="currentColor" opacity=".45" transform="rotate(-25 14 9)"/><ellipse cx="26" cy="9" rx="9" ry="6" fill="currentColor" opacity=".45" transform="rotate(25 26 9)"/><ellipse cx="20" cy="19" rx="6" ry="8" fill="#000"/><circle cx="20" cy="10" r="4.5" fill="#000"/><circle cx="18" cy="9" r="1.6" fill="#c0392b"/><circle cx="22" cy="9" r="1.6" fill="#c0392b"/></svg>`;
        tentacoes.append(m);
        ctx.dizer("MÃE?", { humor: "espanto" });
      });
      em(14, () => ctx.dizer("*não era sua mãe."));
      em(18, () => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "nao-clique";
        b.textContent = "NÃO CLIQUE AQUI";
        tentacoes.append(b);
      });
      em(25, () => {
        const t = document.createElement("div");
        t.className = "tentacao-fixa aviso-falso";
        t.innerHTML = `<strong>1 mensagem nova</strong><span>Pé: me responde rapidinho?</span>`;
        document.body.append(t);
        ctx.titulo.forcar("(1) ¶ mensagem nova");
      });
      em(31, () => ctx.dizer("*seu cadarço tá desamarrado."));
      em(35, () => ctx.dizer("tá quase! não respira."));
    };

    const comecar = () => {
      limparTentacoes();
      inicio = performance.now();
      movido = 0;
      rodando = true;
      agendar();
    };

    const zerar = (motivo) => {
      if (!rodando || ctx.resolvida) return;
      rodando = false;
      zeradas++;
      limparTentacoes();
      relogio.textContent = TOTAL;
      ctx.ast?.rir();
      ctx.dizer(zeradas > 4
        ? `*${motivo}. ${zeradas} tentativas. eu tenho a eternidade.`
        : `*${motivo}! volta pro zero.`, { humor: "triste" });
      timers.push(setTimeout(comecar, 1800));
    };

    ctx.cada(100, () => {
      if (!rodando) return;
      const resta = Math.max(0, TOTAL - (performance.now() - inicio) / 1000);
      relogio.textContent = Math.ceil(resta);
      if (resta <= 0) {
        rodando = false;
        limparTentacoes();
        ctx.resolver();
      }
    });

    ctx.on(window, "pointermove", (e) => {
      movido += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
      if (movido > 12) zerar("mexeu o mouse");
    });
    ctx.on(window, "pointerdown", () => zerar("clicou"), true);
    ctx.on(window, "keydown", () => zerar("apertou tecla"), true);
    ctx.on(window, "wheel", () => zerar("rolou a página"), { passive: true });
    ctx.on(window, "touchstart", () => zerar("encostou na tela"), { passive: true });
    ctx.on(document, "visibilitychange", () => { if (document.hidden) zerar("saiu da aba"); });

    timers.push(setTimeout(comecar, 1500));
    ctx.aoSair(() => { rodando = false; limparTentacoes(); });
  },
};

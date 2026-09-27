// Motor do jogo: telas, fases, dicas, abas, os dois atos e o salvamento.

import { criarPe, desenharPe } from "./pe.js";
import { criarAsterisco, desenharAsterisco } from "./asterisco.js";
import { som, vibrar, desenharFavicon, faviconBruto, titulo, cumprimentarConsole } from "./fx.js";
import { carregarEstado, salvarEstado, zerarEstado } from "./store.js";
import { FASES, ATO2 } from "./fases/index.js";

const $ = (sel, raiz = document) => raiz.querySelector(sel);

const palco = $("#palco");
const anuncio = $("#anuncio");
const sumario = $("#sumario");
const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
const toque = matchMedia("(pointer: coarse)").matches;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

let estado = carregarEstado();
let pe = null;
let ast = null;
let faseAtual = null; // { indice, limpezas, token }
let faviconOcupado = false;

function salvar() { salvarEstado(estado); }

function lembrarVendo(i) {
  try { sessionStorage.setItem("nfea.vendo", String(i)); } catch { /* sem sessão */ }
}
function lerVendo() {
  try { return Number(sessionStorage.getItem("nfea.vendo") ?? NaN); } catch { return NaN; }
}

// ---------- tema e favicon ----------

function coresTema() {
  const s = getComputedStyle(document.documentElement);
  return { cor: s.getPropertyValue("--tinta").trim() || "#000", fundo: s.getPropertyValue("--papel").trim() || "#fff" };
}
function favicon(olhos = "abertos") {
  if (faviconOcupado) return;
  desenharFavicon({ olhos, ...coresTema() });
}

function aplicarAto(n) {
  const raiz = document.documentElement;
  raiz.classList.toggle("ato-2", n === 2);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.content = n === 2 ? "#0000EE" : m.media.includes("dark") ? "#15174A" : "#FFFFFF";
  });
  ast?.mostrar(n === 2);
  favicon();
}

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => favicon());
document.addEventListener("visibilitychange", () => {
  if (estado.fechouEm && !estado.ato2) return;
  favicon(document.hidden ? "fechados" : "abertos");
  pe?.humor(document.hidden ? "dormindo" : null);
});

// ---------- falas digitadas ----------
// Uma fala que começa com "*" é do Asterisco.

function textoPuro(html) {
  const t = document.createElement("template");
  t.innerHTML = html;
  return t.content.textContent;
}

function anunciar(html) {
  anuncio.textContent = textoPuro(html);
}

function prepararFala(html) {
  const doAst = html.startsWith("*");
  const corpo = doAst ? html.slice(1) : html;
  const final = doAst ? `<span class="ast-marca" aria-hidden="true">*</span>${corpo}` : corpo;
  return { doAst, corpo, final };
}

function digitar(container, falas, token) {
  return new Promise((resolve) => {
    let pressa = reduzido.matches;
    const apressar = () => { pressa = true; };
    container.addEventListener("click", apressar);

    const fim = () => {
      container.removeEventListener("click", apressar);
      resolve();
    };

    let i = 0;
    const proxima = () => {
      if (token.cancelado) return fim();
      if (i >= falas.length) return fim();
      const { doAst, corpo, final } = prepararFala(falas[i++]);
      const p = document.createElement("p");
      p.className = doAst ? "fala fala-ast" : "fala";
      p.setAttribute("aria-hidden", "true");
      container.append(p);
      anunciar((doAst ? "Asterisco: " : "") + corpo);
      if (doAst) ast?.falar();
      const texto = textoPuro(corpo);
      if (pressa) {
        p.innerHTML = final;
        p.removeAttribute("aria-hidden");
        return proxima();
      }
      p.classList.add("digitando");
      let n = 0;
      const passo = () => {
        if (token.cancelado) return fim();
        if (pressa || n >= texto.length) {
          p.classList.remove("digitando");
          p.innerHTML = final;
          p.removeAttribute("aria-hidden");
          return setTimeout(proxima, pressa ? 0 : 380);
        }
        const c = texto[n++];
        p.textContent = (doAst ? "*" : "") + texto.slice(0, n);
        if (n % 3 === 0 && c !== " ") som.tecla();
        const pausa = ".?!".includes(c) ? 260 : ",:".includes(c) ? 120 : 22;
        setTimeout(passo, pausa);
      };
      passo();
    };
    proxima();
  });
}

// ---------- abas: quem chegou primeiro é a anfitriã ----------

const canal = "BroadcastChannel" in window ? new BroadcastChannel("nfea") : null;
const ouvintesCanal = new Set();

function perguntarSeHaAnfitria() {
  if (!canal) return Promise.resolve(false);
  return new Promise((resolve) => {
    const t = setTimeout(() => { canal.removeEventListener("message", ouvir); resolve(false); }, 350);
    function ouvir(e) {
      if (e.data?.t === "eu") {
        clearTimeout(t);
        canal.removeEventListener("message", ouvir);
        resolve(true);
      }
    }
    canal.addEventListener("message", ouvir);
    canal.postMessage({ t: "quem" });
  });
}

function virarAnfitria() {
  if (!canal) return;
  canal.addEventListener("message", (e) => {
    if (e.data?.t === "quem") canal.postMessage({ t: "eu" });
    ouvintesCanal.forEach((fn) => fn(e.data));
  });
  addEventListener("pagehide", () => canal.postMessage({ t: "anfitria-saiu" }));
}

// ---------- contexto entregue a cada fase ----------

function criarContexto(indice, area, falasEl, token) {
  const limpezas = [];
  let resolvida = false;

  const ctx = {
    palco: area,
    pe,
    ast,
    som,
    titulo,
    toque,
    estado,
    salvar,
    reduzido: reduzido.matches,
    canal: canal && {
      enviar: (msg) => canal.postMessage(msg),
      ouvir(fn) { ouvintesCanal.add(fn); limpezas.push(() => ouvintesCanal.delete(fn)); },
    },
    on(alvo, evento, fn, opcoes) {
      alvo.addEventListener(evento, fn, opcoes);
      limpezas.push(() => alvo.removeEventListener(evento, fn, opcoes));
    },
    depois(ms, fn) {
      const t = setTimeout(fn, ms);
      limpezas.push(() => clearTimeout(t));
      return t;
    },
    cada(ms, fn) {
      const t = setInterval(fn, ms);
      limpezas.push(() => clearInterval(t));
      return t;
    },
    aoSair(fn) { limpezas.push(fn); },
    // a fase assume o favicon; ao sair, o Pé volta para lá
    favicon(svg) {
      faviconOcupado = true;
      faviconBruto(svg);
      if (!limpezas.includes(liberarFavicon)) limpezas.push(liberarFavicon);
    },
    // reação no meio da fase; começa com "*" quando é o Asterisco falando
    dizer(html, { humor } = {}) {
      if (token.cancelado) return;
      falasEl.querySelector(".fala.reacao")?.remove();
      const { doAst, final, corpo } = prepararFala(html);
      const p = document.createElement("p");
      p.className = "fala reacao" + (doAst ? " fala-ast" : "");
      p.innerHTML = final;
      falasEl.append(p);
      anunciar((doAst ? "Asterisco: " : "") + corpo);
      if (doAst) ast?.rir();
      if (humor) pe.humor(humor, 1800);
      if (humor === "triste") som.erro();
    },
    get resolvida() { return resolvida; },
    resolver(falas) {
      if (resolvida || token.cancelado) return;
      resolvida = true;
      concluirFase(indice, falas, falasEl, token);
    },
  };
  return { ctx, limpezas };
}

function liberarFavicon() {
  faviconOcupado = false;
  favicon();
}

// ---------- telas ----------

function limparFase() {
  getSelection()?.removeAllRanges();
  if (!faseAtual) return;
  faseAtual.token.cancelado = true;
  faseAtual.limpezas.forEach((fn) => { try { fn(); } catch (e) { console.warn(e); } });
  clearTimeout(faseAtual.timerDicas);
  faseAtual = null;
  titulo.forcar(null);
  pe?.sumir(false);
  ast?.humor(null);
}

function telaAbertura() {
  limparFase();
  aplicarAto(1);
  sumario.hidden = true;
  titulo.definir(titulo.base);
  palco.innerHTML = `
    <h1 class="titulo-jogo">não feche esta aba.</h1>
    <div class="falas"></div>
    <div class="depois" hidden>
      <button type="button" class="acao" id="comecar">Abrir o § 1</button>
      <span class="aviso-celular">${toque
        ? "No celular metade das fases funciona. As outras dá para pular."
        : "O progresso fica salvo neste navegador."}</span>
    </div>`;
  const token = { cancelado: false };
  faseAtual = { indice: -1, limpezas: [], token };
  digitar($(".falas", palco), [
    "oi. eu sou o Pé, o pé-de-mosca.",
    "sabe aquele ¶ que aparece quando alguém liga “mostrar formatação” no editor de texto? sou eu. eu moro no fim dos parágrafos.",
    "só que desta vez fiquei preso dentro desta aba. a saída passa por aqueles botões do navegador que ninguém aperta.",
    "me ajuda?",
  ], token).then(() => {
    $(".depois", palco).hidden = false;
    $("#comecar").addEventListener("click", () => {
      som.pulo();
      estado.comecou = estado.comecou || Date.now();
      salvar();
      irPara(0);
    });
  });
}

function itemSumario(f, i) {
  const li = document.createElement("li");
  const num = `<span class="num">§ ${i + 1}</span>`;
  if (i > estado.fase) {
    li.innerHTML = `<span class="trancado">${num}${"·".repeat(3)}</span>`;
    return li;
  }
  const a = document.createElement("a");
  a.href = "#palco";
  a.innerHTML = `${num}${f.nome}`;
  if (estado.feitas[f.id]) a.classList.add("feito");
  if (estado.puladas[f.id]) a.classList.add("pulado");
  if (faseAtual?.indice === i) a.setAttribute("aria-current", "page");
  a.addEventListener("click", (e) => {
    e.preventDefault();
    irPara(i);
  });
  li.append(a);
  return li;
}

function marcarSumario() {
  const grupos = [["Ato I", 0, ATO2]];
  if (estado.ato2) grupos.push(["Ato II", ATO2, FASES.length]);
  $("#sumario-lista").replaceChildren(
    ...grupos.map(([nome, de, ate]) => {
      const g = document.createElement("section");
      g.className = "sumario-grupo";
      const h = document.createElement("h3");
      h.textContent = nome;
      const ol = document.createElement("ol");
      ol.append(...FASES.slice(de, ate).map((f, k) => itemSumario(f, de + k)));
      g.append(h, ol);
      return g;
    })
  );
  sumario.hidden = false;
}

async function irPara(indice) {
  limparFase();
  indice = Math.max(0, Math.min(indice, FASES.length - 1));
  if (indice >= ATO2 && !estado.ato2) indice = ATO2 - 1;
  const fase = FASES[indice];
  const token = { cancelado: false };
  faseAtual = { indice, limpezas: [], token, timerDicas: 0 };
  lembrarVendo(indice);
  aplicarAto(indice >= ATO2 ? 2 : 1);

  titulo.definir(`¶ § ${indice + 1}: ${fase.nome}`);
  pe.chapeu(estado.chapeu);
  pe.humor(null);
  palco.classList.remove("fim");
  palco.innerHTML = `
    <h1 class="secao">§ ${indice + 1}</h1>
    <p class="secao-nome">${fase.nome}</p>
    <div class="falas"></div>
    ${fase.dicasAntes ? '<footer class="rodape rodape-antes" hidden><div class="rodape-linha"></div><ol class="notas"></ol></footer>' : ""}
    <div class="puzzle"></div>
    <div class="depois"></div>
    ${fase.dicasAntes ? "" : '<footer class="rodape" hidden><div class="rodape-linha"></div><ol class="notas"></ol></footer>'}`;
  palco.focus({ preventScroll: true });
  scrollTo({ top: 0, behavior: "auto" });
  marcarSumario();

  const falasEl = $(".falas", palco);
  const falas = typeof fase.falas === "function" ? fase.falas(estado) : fase.falas;
  await digitar(falasEl, falas, token);
  if (token.cancelado) return;

  const area = $(".puzzle", palco);
  const { ctx, limpezas } = criarContexto(indice, area, falasEl, token);
  faseAtual.limpezas = limpezas;
  try {
    const volta = fase.montar(ctx);
    if (typeof volta === "function") limpezas.push(volta);
  } catch (e) {
    console.error(e);
    ctx.dizer("alguma coisa quebrou aqui dentro. pode pular esta página sem culpa.", { humor: "triste" });
  }
  montarDicas(fase, indice, token);
}

function podePular(indice) {
  return indice !== ATO2 - 1 && indice !== FASES.length - 1;
}

function montarDicas(fase, indice, token) {
  const rodape = $(".rodape", palco);
  const linha = $(".rodape-linha", rodape);
  const notas = $(".notas", rodape);
  const doAst = indice >= ATO2;
  const marcas = doAst ? ["*", "**", "***", "****"] : ["¹", "²", "³", "⁴"];
  const dicas = fase.dicas || [];
  const semCelular = toque && fase.celular === false;
  let proxima = 0;

  const pular = document.createElement("button");
  pular.type = "button";
  pular.className = "nota-botao";
  pular.textContent = "Pular esta página";
  pular.disabled = !semCelular;
  pular.addEventListener("click", () => pularFase(indice));

  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "nota-botao";
  botao.disabled = true;

  const atualizar = () => {
    if (proxima >= dicas.length) {
      botao.remove();
      pular.disabled = false;
      return;
    }
    botao.innerHTML = doAst
      ? `Perguntar ao Asterisco <sup>${marcas[proxima]}</sup>`
      : `Ver nota <sup>${marcas[proxima]}</sup>`;
  };

  botao.addEventListener("click", () => {
    const li = document.createElement("li");
    li.className = "nota" + (doAst ? " nota-ast" : "");
    li.innerHTML = `<sup>${marcas[proxima]}</sup> ${dicas[proxima]}`;
    notas.append(li);
    anunciar(dicas[proxima]);
    if (doAst) ast?.falar();
    proxima++;
    botao.disabled = true;
    atualizar();
    if (proxima < dicas.length) liberarEm(12000);
  });

  const liberarEm = (ms) => {
    faseAtual.timerDicas = setTimeout(() => {
      if (!token.cancelado) botao.disabled = false;
    }, ms);
  };

  linha.append(botao);
  if (podePular(indice)) linha.append(pular);
  if (semCelular) {
    const aviso = document.createElement("p");
    aviso.className = "aviso-celular";
    aviso.textContent = "Esta página precisa de teclado ou de um navegador de computador.";
    rodape.prepend(aviso);
  }
  atualizar();
  if (dicas.length) liberarEm(estado.feitas[fase.id] ? 0 : doAst ? 20000 : 15000);
  setTimeout(() => { if (!token.cancelado) pular.disabled = false; }, doAst ? 240000 : 150000);
  rodape.hidden = false;
}

async function concluirFase(indice, falas, falasEl, token) {
  const fase = FASES[indice];
  const primeiraVez = !estado.feitas[fase.id];
  estado.feitas[fase.id] = true;
  delete estado.puladas[fase.id];
  estado.fase = Math.max(estado.fase, indice + 1);
  salvar();

  som.acerto();
  vibrar([20, 40, 30]);
  pe.pular();
  pe.humor("feliz", 2600);
  marcarSumario();

  const rodape = $(".rodape", palco);
  if (rodape) rodape.hidden = true;
  falasEl.querySelector(".fala.reacao")?.remove();

  const vitoria = falas || fase.vitoria || ["pronto."];
  await digitar(falasEl, vitoria, token);
  if (token.cancelado) return;

  const depois = $(".depois", palco);
  if (indice >= FASES.length - 1) return botoesDoFim(depois);

  const b = document.createElement("button");
  b.type = "button";
  b.className = "acao";
  b.textContent = `Virar para o § ${indice + 2}`;
  b.addEventListener("click", () => { som.pulo(); irPara(indice + 1); });
  depois.replaceChildren(b);
  if (primeiraVez) b.focus({ preventScroll: true });
}

function pularFase(indice) {
  const fase = FASES[indice];
  if (!estado.feitas[fase.id]) estado.puladas[fase.id] = true;
  estado.fase = Math.max(estado.fase, indice + 1);
  salvar();
  pe.encolher();
  pe.humor("triste", 1600);
  som.erro();
  if (indice >= ATO2) ast?.rir();
  irPara(indice + 1);
}

function botoesDoFim(depois) {
  const imprimir = document.createElement("button");
  imprimir.type = "button";
  imprimir.className = "acao";
  imprimir.textContent = "Imprimir o pôster";
  imprimir.addEventListener("click", () => print());

  const deNovo = document.createElement("button");
  deNovo.type = "button";
  deNovo.className = "texto-botao";
  deNovo.textContent = "Jogar de novo";
  let armado = false;
  deNovo.addEventListener("click", () => {
    if (!armado) {
      armado = true;
      deNovo.textContent = "Clique de novo para apagar o progresso";
      setTimeout(() => { armado = false; deNovo.textContent = "Jogar de novo"; }, 5000);
      return;
    }
    estado = zerarEstado();
    try { sessionStorage.clear(); } catch { /* idem */ }
    location.reload();
  });
  depois.replaceChildren(imprimir, deNovo);
}

// ---------- aba convidada ----------

function telaConvidada() {
  sumario.hidden = true;
  aplicarAto(estado.ato2 ? 2 : 1);
  titulo.definir("¶ a outra aba");
  pe.sumir(true);
  palco.innerHTML = `
    <h1 class="titulo-jogo">a outra aba.</h1>
    <div class="falas"></div>`;
  const token = { cancelado: false };
  const falasEl = $(".falas", palco);
  digitar(falasEl, ["o Pé mora na primeira aba que você abriu. esta aqui é visita."], token);

  canal.addEventListener("message", (e) => {
    if (e.data?.t === "pe-vai") {
      pe.sumir(false);
      pe.pular();
      pe.humor("feliz", 2000);
      som.pulo();
      falasEl.replaceChildren();
      digitar(falasEl, [
        "cheguei! é igualzinho lá, só que tudo mais novo.",
        "pode fechar esta aba quando quiser. eu volto pra lá sozinho.",
      ], token);
    }
    if (e.data?.t === "anfitria-saiu") location.reload();
  });
  addEventListener("pagehide", () => canal.postMessage({ t: "convidada-saiu" }));
}

// ---------- fim do Ato I e a passagem para o avesso ----------

function formatarDuracao(ms) {
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return new Intl.NumberFormat("pt-BR", { style: "unit", unit: "minute", unitDisplay: "long" }).format(min);
  const h = Math.floor(min / 60);
  const resto = min % 60;
  const fh = new Intl.NumberFormat("pt-BR", { style: "unit", unit: "hour", unitDisplay: "long" }).format(h);
  return resto ? `${fh} e ${resto} min` : fh;
}

function telaFim() {
  limparFase();
  aplicarAto(1);
  pe.sumir(true);
  faviconOcupado = false;
  desenharFavicon({ olhos: "vazio", ...coresTema() });
  faviconOcupado = true;
  titulo.definir(" ");
  const feitas = FASES.slice(0, ATO2).filter((f) => estado.feitas[f.id]).length;
  const puladas = FASES.slice(0, ATO2).filter((f) => estado.puladas[f.id]).length;
  const quando = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(estado.fechouEm);
  const tempo = formatarDuracao(estado.fechouEm - (estado.comecou || estado.fechouEm));
  palco.classList.add("fim");
  palco.innerHTML = `
    <h1 class="titulo-jogo">a aba está vazia<button type="button" class="ponto-final" aria-label="Ponto final">.</button></h1>
    <div class="falas"></div>
    <dl class="estatisticas" hidden>
      <dt>Saiu em</dt><dd>${quando}</dd>
      <dt>Tempo junto</dt><dd>${tempo}</dd>
      <dt>Páginas resolvidas</dt><dd>${feitas} de ${ATO2}</dd>
      <dt>Páginas puladas</dt><dd>${puladas}</dd>
    </dl>
    <div class="depois" hidden>
      <button type="button" class="acao" id="imprimir">Imprimir o pôster</button>
    </div>`;
  sumario.hidden = true;
  const token = { cancelado: false };
  faseAtual = { indice: -1, limpezas: [], token };
  const ponto = $(".ponto-final", palco);
  ponto.addEventListener("click", () => atravessar(ponto), { once: true });

  digitar($(".falas", palco), [
    "o Pé saiu quando você fechou a aba. ele deixou um bilhete no fim do parágrafo:",
    "“obrigado por ler letra miúda, por olhar para outro lado quando eu pedi e por voltar. agora eu moro em qualquer texto que você escrever. confere o fim dos seus parágrafos de vez em quando.”",
  ], token).then(() => {
    if (token.cancelado) return;
    $(".estatisticas", palco).hidden = false;
    $(".depois", palco).hidden = false;
    $("#imprimir").addEventListener("click", () => print());
    setTimeout(() => { if (!token.cancelado) ponto.classList.add("tremendo"); }, 4000);
    setTimeout(() => {
      if (token.cancelado) return;
      const p = document.createElement("p");
      p.className = "aviso-celular sussurro";
      p.textContent = "O ponto final do título está tremendo.";
      $(".depois", palco).after(p);
    }, 15000);
  });
}

// Troca cada palavra por um <span> para ela poder cair sozinha.
function quebrarEmPalavras(raiz) {
  const nos = [];
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) if (w.currentNode.textContent.trim()) nos.push(w.currentNode);
  const spans = [];
  for (const no of nos) {
    const frag = document.createDocumentFragment();
    for (const parte of no.textContent.split(/(\s+)/)) {
      if (!parte) continue;
      if (/^\s+$/.test(parte)) { frag.append(parte); continue; }
      const s = document.createElement("span");
      s.className = "caindo";
      s.textContent = parte;
      frag.append(s);
      spans.push(s);
    }
    no.replaceWith(frag);
  }
  return spans;
}

async function atravessar(ponto) {
  faseAtual.token.cancelado = true;
  const r = ponto.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height * 0.75;
  som.portal();
  vibrar([30, 60, 30, 60, 160]);

  if (!reduzido.matches) {
    ponto.style.visibility = "hidden";
    const pedacos = [
      ...quebrarEmPalavras(palco),
      ...palco.querySelectorAll(".acao, .texto-botao"),
    ];
    pedacos.forEach((s) => {
      const q = s.getBoundingClientRect();
      const dx = (x - q.left) * (0.3 + Math.random() * 0.4);
      const cair = innerHeight - q.top + 200 + Math.random() * 300;
      s.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)" },
          { transform: `translate(${dx * 0.2}px, -${20 + Math.random() * 40}px) rotate(${(Math.random() - 0.5) * 20}deg)`, offset: 0.18 },
          { transform: `translate(${dx}px, ${cair}px) rotate(${(Math.random() - 0.5) * 540}deg)` },
        ],
        { duration: 900 + Math.random() * 700, delay: Math.random() * 350, easing: "cubic-bezier(.5,0,.9,.5)", fill: "forwards" }
      );
    });
    await espera(1300);
  }

  const buraco = document.createElement("div");
  buraco.className = "buraco";
  document.body.append(buraco);
  const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;
  await buraco.animate(
    [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${raio}px at ${x}px ${y}px)` }],
    { duration: reduzido.matches ? 1 : 950, easing: "cubic-bezier(.75,0,.25,1)", fill: "forwards" }
  ).finished;

  estado.ato2 = true;
  estado.fase = Math.max(estado.fase, ATO2);
  estado.entrouAto2 = Date.now();
  salvar();
  faviconOcupado = false;
  telaAvesso();
  await espera(60);
  await buraco.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduzido.matches ? 1 : 500, fill: "forwards" }).finished;
  buraco.remove();
}

function telaAvesso() {
  limparFase();
  palco.classList.remove("fim");
  aplicarAto(2);
  sumario.hidden = true;
  titulo.definir("¶ o avesso");
  pe.sumir(false);
  pe.cambalhota();
  palco.innerHTML = `
    <h1 class="titulo-jogo">o avesso.</h1>
    <div class="falas"></div>
    <div class="depois" hidden>
      <button type="button" class="acao" id="entrar">Abrir o § ${ATO2 + 1}</button>
    </div>`;
  const token = { cancelado: false };
  faseAtual = { indice: -1, limpezas: [], token };
  ast.mostrar(false);
  digitar($(".falas", palco), [
    "caí pelo ponto final. achei que do outro lado ia ter o resto da internet.",
    "mas do outro lado fica o avesso da aba, onde a página guarda o que esconde de você: o código, os endereços que não existem.",
  ], token).then(async () => {
    if (token.cancelado) return;
    ast.mostrar(true);
    ast.rir();
    som.erro();
    await digitar($(".falas", palco), [
      "*com licença.",
      "ah, não. esse é o Asterisco. ele mora nas notas de rodapé.",
      "*e cuido das letras miúdas. vocês leram as do contrato lá atrás, eu vi.",
      "*aqui são dezesseis páginas, mais difíceis que as de lá. se vocês passarem de todas, eu deixo o Pé ir embora.*",
      "*condições se aplicam.",
      "ele fala assim mesmo. vamos?",
    ], token);
    if (token.cancelado) return;
    $(".depois", palco).hidden = false;
    $("#entrar").addEventListener("click", () => { som.pulo(); irPara(ATO2); });
  });
}

// ---------- pôster (impressão) ----------

function prepararPoster() {
  const casa = $("#poster-pe");
  const svg = desenharPe();
  if (estado.chapeu) svg.setAttribute("data-chapeu", "");
  const zerou = estado.feitas[FASES[FASES.length - 1].id];
  casa.replaceChildren(svg);
  if (zerou) casa.append(desenharAsterisco());
  const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(Date.now());
  const feitas = FASES.filter((f) => estado.feitas[f.id]).length;
  $(".poster-titulo").textContent = zerou ? "¶ e * estiveram aqui." : "¶ esteve aqui.";
  $("#poster-linha").textContent = `Impresso em ${data}. Páginas resolvidas até aqui: ${feitas} de ${estado.ato2 ? FASES.length : ATO2}.`;
}
addEventListener("beforeprint", prepararPoster);

// ---------- botões do topo ----------

function ligarTopo() {
  const b = $("#som");
  const pintar = () => {
    b.setAttribute("aria-pressed", String(som.ligado));
    b.textContent = som.ligado ? "Som ligado" : "Som desligado";
  };
  pintar();
  b.addEventListener("click", () => { som.alternar(); pintar(); if (som.ligado) som.pulo(); });
  // botão, não link: um #sumario na URL entraria no histórico e atrapalharia o § 7
  $("#ir-sumario").addEventListener("click", () => {
    if (!estado.comecou) return;
    marcarSumario();
    sumario.scrollIntoView({ behavior: reduzido.matches ? "auto" : "smooth" });
    $("#sumario-lista a")?.focus({ preventScroll: true });
  });
}

// ---------- partida ----------

async function iniciar() {
  pe = criarPe($("#pe-casa"));
  ast = criarAsterisco($("#ast-casa"));
  ast.mostrar(false);
  favicon();
  ligarTopo();
  prepararPoster();
  cumprimentarConsole();
  try { localStorage.setItem("nfea.base", new URL(".", location.href).pathname); } catch { /* idem */ }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  if (estado.fechouEm && !estado.ato2) return telaFim();

  if (await perguntarSeHaAnfitria()) return telaConvidada();
  virarAnfitria();

  if (!estado.comecou) return telaAbertura();
  const vendo = lerVendo();
  irPara(Number.isInteger(vendo) && vendo <= estado.fase ? vendo : estado.fase);
}

// para os testes automatizados e para quem gosta de fuçar
window.__nfea = {
  get estado() { return estado; },
  irPara: (i) => irPara(i),
  get fase() { return faseAtual?.indice; },
  salvar,
};

iniciar();

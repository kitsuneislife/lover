// Motor do jogo: telas, fases, dicas, abas e salvamento.

import { criarPe, desenharPe } from "./pe.js";
import { som, vibrar, desenharFavicon, titulo, cumprimentarConsole } from "./fx.js";
import { carregarEstado, salvarEstado, zerarEstado } from "./store.js";
import { FASES } from "./fases/index.js";

const $ = (sel, raiz = document) => raiz.querySelector(sel);

const palco = $("#palco");
const anuncio = $("#anuncio");
const sumario = $("#sumario");
const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
const toque = matchMedia("(pointer: coarse)").matches;

let estado = carregarEstado();
let pe = null;
let faseAtual = null; // { indice, limpezas, token }

function salvar() { salvarEstado(estado); }

// ---------- cores do favicon acompanham o tema ----------

function coresTema() {
  const s = getComputedStyle(document.documentElement);
  return { cor: s.getPropertyValue("--tinta").trim() || "#000", fundo: s.getPropertyValue("--papel").trim() || "#fff" };
}
function favicon(olhos = "abertos") {
  desenharFavicon({ olhos, ...coresTema() });
}
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => favicon());
document.addEventListener("visibilitychange", () => {
  if (estado.fechouEm) return;
  favicon(document.hidden ? "fechados" : "abertos");
  pe?.humor(document.hidden ? "dormindo" : null);
});

// ---------- falas digitadas ----------

function textoPuro(html) {
  const t = document.createElement("template");
  t.innerHTML = html;
  return t.content.textContent;
}

function anunciar(html) {
  anuncio.textContent = textoPuro(html);
}

// Digita cada fala letra por letra. Clique na área das falas mostra tudo de uma vez.
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
      const html = falas[i++];
      const p = document.createElement("p");
      p.className = "fala";
      p.setAttribute("aria-hidden", "true");
      container.append(p);
      anunciar(html);
      const texto = textoPuro(html);
      if (pressa) {
        p.innerHTML = html;
        p.removeAttribute("aria-hidden");
        return proxima();
      }
      p.classList.add("digitando");
      let n = 0;
      const passo = () => {
        if (token.cancelado) return fim();
        if (pressa || n >= texto.length) {
          p.classList.remove("digitando");
          p.innerHTML = html;
          p.removeAttribute("aria-hidden");
          return setTimeout(proxima, pressa ? 0 : 380);
        }
        const c = texto[n++];
        p.textContent = texto.slice(0, n);
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

const canalOk = "BroadcastChannel" in window;
const canal = canalOk ? new BroadcastChannel("nfea") : null;
const ouvintesCanal = new Set();
let souConvidada = false;

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
    som,
    titulo,
    toque,
    estado,
    salvar,
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
    // fala nova do Pé no meio da fase (reações)
    dizer(html, { humor } = {}) {
      if (token.cancelado) return;
      const antigo = falasEl.querySelector(".fala.reacao");
      antigo?.remove();
      const p = document.createElement("p");
      p.className = "fala reacao";
      p.innerHTML = html;
      falasEl.append(p);
      anunciar(html);
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
}

function telaAbertura() {
  limparFase();
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
    const depois = $(".depois", palco);
    depois.hidden = false;
    $("#comecar").addEventListener("click", () => {
      som.pulo();
      estado.comecou = estado.comecou || Date.now();
      salvar();
      irPara(0);
    });
  });
}

function marcarSumario() {
  const ol = $("#sumario-lista");
  ol.replaceChildren(
    ...FASES.map((f, i) => {
      const li = document.createElement("li");
      const num = `<span class="num">§ ${i + 1}</span>`;
      const liberada = i <= estado.fase;
      if (!liberada) {
        li.innerHTML = `<span class="trancado">${num}${"·".repeat(3)}</span>`;
        return li;
      }
      const b = document.createElement("a");
      b.href = "#palco";
      b.innerHTML = `${num}${f.nome}`;
      if (estado.feitas[f.id]) b.classList.add("feito");
      if (estado.puladas[f.id]) b.classList.add("pulado");
      if (faseAtual?.indice === i) b.setAttribute("aria-current", "page");
      b.addEventListener("click", (e) => {
        e.preventDefault();
        irPara(i);
      });
      li.append(b);
      return li;
    })
  );
  sumario.hidden = false;
}

async function irPara(indice) {
  limparFase();
  if (indice >= FASES.length) indice = FASES.length - 1;
  const fase = FASES[indice];
  const token = { cancelado: false };
  faseAtual = { indice, limpezas: [], token, timerDicas: 0 };

  titulo.definir(`¶ § ${indice + 1}: ${fase.nome}`);
  pe.chapeu(estado.chapeu);
  pe.humor(null);
  palco.innerHTML = `
    <h1 class="secao">§ ${indice + 1}</h1>
    <p class="secao-nome">${fase.nome}</p>
    <div class="falas"></div>
    <div class="puzzle"></div>
    <div class="depois"></div>
    <footer class="rodape" hidden>
      <div class="rodape-linha"></div>
      <ol class="notas"></ol>
    </footer>`;
  palco.focus({ preventScroll: true });
  scrollTo({ top: 0, behavior: reduzido.matches ? "auto" : "smooth" });
  marcarSumario();

  const falasEl = $(".falas", palco);
  await digitar(falasEl, fase.falas, token);
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

function montarDicas(fase, indice, token) {
  const rodape = $(".rodape", palco);
  const linha = $(".rodape-linha", rodape);
  const notas = $(".notas", rodape);
  const sup = ["¹", "²", "³", "⁴"];
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
    botao.innerHTML = `Ver nota <sup>${sup[proxima]}</sup>`;
  };

  botao.addEventListener("click", () => {
    const li = document.createElement("li");
    li.className = "nota";
    li.innerHTML = `<sup>${sup[proxima]}</sup> ${dicas[proxima]}`;
    notas.append(li);
    anunciar(dicas[proxima]);
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
  if (indice < FASES.length - 1) linha.append(pular);
  if (semCelular) {
    const aviso = document.createElement("p");
    aviso.className = "aviso-celular";
    aviso.textContent = "Esta página precisa de teclado ou de um navegador de computador.";
    rodape.prepend(aviso);
  }
  atualizar();
  if (dicas.length) liberarEm(estado.feitas[fase.id] ? 0 : 15000);
  setTimeout(() => { if (!token.cancelado) pular.disabled = false; }, 150000);
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
  if (indice >= FASES.length - 1) return;

  const depois = $(".depois", palco);
  const b = document.createElement("button");
  b.type = "button";
  b.className = "acao";
  b.textContent = `Virar para o § ${indice + 2}`;
  b.addEventListener("click", () => { som.pulo(); irPara(indice + 1); });
  depois.replaceChildren(b);
  if (!primeiraVez) return;
  b.focus({ preventScroll: true });
}

function pularFase(indice) {
  const fase = FASES[indice];
  if (!estado.feitas[fase.id]) estado.puladas[fase.id] = true;
  estado.fase = Math.max(estado.fase, indice + 1);
  salvar();
  pe.encolher();
  pe.humor("triste", 1600);
  som.erro();
  irPara(Math.min(indice + 1, FASES.length - 1));
}

// ---------- aba convidada ----------

function telaConvidada() {
  sumario.hidden = true;
  titulo.definir("¶ a outra aba");
  pe.sumir(true);
  palco.innerHTML = `
    <h1 class="titulo-jogo">a outra aba.</h1>
    <div class="falas"></div>`;
  const token = { cancelado: false };
  const falasEl = $(".falas", palco);
  digitar(falasEl, [
    "o Pé mora na primeira aba que você abriu. esta aqui é visita.",
  ], token);

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

// ---------- o fim ----------

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
  pe.sumir(true);
  favicon("vazio");
  titulo.definir(" ");
  document.title = " ";
  const feitas = Object.keys(estado.feitas).length;
  const puladas = Object.keys(estado.puladas).length;
  const quando = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(estado.fechouEm);
  const tempo = formatarDuracao(estado.fechouEm - (estado.comecou || estado.fechouEm));
  palco.classList.add("fim");
  palco.innerHTML = `
    <h1 class="titulo-jogo">a aba está vazia.</h1>
    <div class="falas"></div>
    <dl class="estatisticas" hidden>
      <dt>Saiu em</dt><dd>${quando}</dd>
      <dt>Tempo junto</dt><dd>${tempo}</dd>
      <dt>Páginas resolvidas</dt><dd>${feitas} de ${FASES.length}</dd>
      <dt>Páginas puladas</dt><dd>${puladas}</dd>
    </dl>
    <div class="depois" hidden>
      <button type="button" class="acao" id="imprimir">Imprimir o pôster</button>
      <button type="button" class="texto-botao" id="de-novo">Jogar de novo</button>
    </div>`;
  marcarSumario();
  sumario.hidden = true;
  const token = { cancelado: false };
  digitar($(".falas", palco), [
    "o Pé saiu quando você fechou a aba. ele deixou um bilhete no fim do parágrafo:",
    "“obrigado por ler letra miúda, por olhar para outro lado quando eu pedi e por voltar. agora eu moro em qualquer texto que você escrever. confere o fim dos seus parágrafos de vez em quando.”",
  ], token).then(() => {
    $(".estatisticas", palco).hidden = false;
    $(".depois", palco).hidden = false;
    $("#imprimir").addEventListener("click", () => print());
    const deNovo = $("#de-novo");
    let armado = false;
    deNovo.addEventListener("click", () => {
      if (!armado) {
        armado = true;
        deNovo.textContent = "Clique de novo para apagar o progresso";
        setTimeout(() => { armado = false; deNovo.textContent = "Jogar de novo"; }, 5000);
        return;
      }
      estado = zerarEstado();
      palco.classList.remove("fim");
      pe.sumir(false);
      favicon();
      telaAbertura();
    });
  });
}

// ---------- pôster (impressão) ----------

function prepararPoster() {
  const casa = $("#poster-pe");
  const svg = desenharPe();
  if (estado.chapeu) svg.setAttribute("data-chapeu", "");
  casa.replaceChildren(svg);
  const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(Date.now());
  const feitas = Object.keys(estado.feitas).length;
  $("#poster-linha").textContent = `Impresso em ${data}. Páginas resolvidas até aqui: ${feitas} de ${FASES.length}.`;
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
    if (sumario.hidden) marcarSumario();
    sumario.scrollIntoView({ behavior: reduzido.matches ? "auto" : "smooth" });
    $("#sumario-lista a")?.focus({ preventScroll: true });
  });
}

// ---------- partida ----------

async function iniciar() {
  pe = criarPe($("#pe-casa"));
  favicon();
  ligarTopo();
  prepararPoster();
  cumprimentarConsole();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  if (estado.fechouEm) return telaFim();

  souConvidada = await perguntarSeHaAnfitria();
  if (souConvidada) return telaConvidada();
  virarAnfitria();

  if (!estado.comecou) return telaAbertura();
  irPara(Math.min(estado.fase, FASES.length - 1));
}

// para os testes automatizados e para quem gosta de fuçar
window.__nfea = {
  get estado() { return estado; },
  irPara: (i) => irPara(i),
  get fase() { return faseAtual?.indice; },
};

iniciar();

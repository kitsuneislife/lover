// Gera as imagens do README a partir do HTML em docs/readme/fonte/.
// PNGs em 2x com fundo transparente; variantes clara e escura para o <picture> do GitHub;
// GIFs gravados do jogo de verdade.
//
//   npm run readme            gera tudo
//   npm run readme -- hero    gera só as imagens cujo nome contém "hero"

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import gifenc from "gifenc";
const { GIFEncoder, quantize, applyPalette } = gifenc;
import { servir } from "./servidor.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = path.join(RAIZ, "docs", "readme");
const PORTA = 9700 + Math.floor(Math.random() * 200);
const BASE = `http://localhost:${PORTA}`;
const filtro = process.argv[2] || "";

// [arquivo-fonte, nome-da-saída, temas]
const ESTATICAS = [
  ["hero.html", "hero", ["claro", "escuro"]],
  ["jogar.html", "jogar", ["claro"]],
  ["personagens.html", "personagens", ["claro"]],
  ["ato-1.html", "ato-1", ["claro"]],
  ["ato-2.html", "ato-2", ["claro"]],
  ["paleta.html", "paleta", ["claro"]],
  ["capturas.html", "capturas", ["claro"]],
  ["social.html", "social", ["claro"]],
];

const servidor = await servir(RAIZ, PORTA);
const browser = await chromium.launch();
const quer = (nome) => !filtro || nome.includes(filtro);

async function novaPagina(opcoes = {}) {
  const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1000, height: 800 }, ...opcoes });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error("  erro na página:", e.message));
  return { ctx, page };
}

// ---------- capturas do jogo, usadas na colagem ----------

const ATO1 = ["tinta-branca", "esconderijo", "agulha", "letra-miuda", "sala-quadrada", "endereco", "para-tras", "nao-olhe",
  "outra-aba", "nada", "luz", "bilhete", "gaveta", "sem-rede", "papel", "saida"];

async function jogoEm(page, estado, vendo) {
  await page.goto(`${BASE}/site/`);
  await page.evaluate(([e, v]) => {
    localStorage.clear();
    if (e) localStorage.setItem("nfea.estado", JSON.stringify(e));
    if (v !== undefined) sessionStorage.setItem("nfea.vendo", String(v));
  }, [estado, vendo]);
  await page.reload();
}

async function capturarJogo() {
  const pasta = path.join(SAIDA, "fonte", "capturas");
  fs.mkdirSync(pasta, { recursive: true });
  const cenas = [
    ["abertura", null, undefined, "claro", async (p) => p.waitForSelector("#comecar", { timeout: 20000 })],
    ["palheiro", { versao: 1, comecou: 1, fase: 2, feitas: {}, puladas: {} }, 2, "claro", async (p) => p.waitForSelector(".palheiro", { timeout: 20000 })],
    ["escuro", { versao: 1, comecou: 1, fase: 10, feitas: {}, puladas: {}, chapeu: true }, 10, "dark", async (p) => p.waitForSelector(".interruptor", { timeout: 20000 })],
    ["avesso", { versao: 1, comecou: 1, fase: 19, feitas: {}, puladas: {}, chapeu: true, ato2: true }, 18, "claro", async (p) => p.waitForSelector(".parede", { timeout: 20000 })],
  ];
  for (const [nome, estado, vendo, esquema, esperar] of cenas) {
    const { ctx, page } = await novaPagina({ viewport: { width: 1180, height: 760 }, deviceScaleFactor: 1, colorScheme: esquema === "dark" ? "dark" : "light", reducedMotion: "reduce" });
    await jogoEm(page, estado, vendo);
    await esperar(page);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(pasta, nome + ".png") });
    await ctx.close();
    console.log("  captura", nome);
  }
}

// ---------- PNGs a partir do HTML ----------

async function renderizar(arquivo, nome, tema) {
  const { ctx, page } = await novaPagina();
  await page.goto(`${BASE}/docs/readme/fonte/${arquivo}?tema=${tema}`);
  await page.waitForFunction(() => window.__pronto === true, null, { timeout: 20000 });
  const alvo = await page.$("#cartaz");
  const saida = path.join(SAIDA, `${nome}${tema === "escuro" ? "-escuro" : ""}.png`);
  await alvo.screenshot({ path: saida, omitBackground: true });
  await ctx.close();
  console.log("  png", path.relative(RAIZ, saida));
}

// ---------- GIFs ----------

function gravarGif(quadros, saida, { cores = 128 } = {}) {
  const gif = GIFEncoder();
  for (const { png, atraso } of quadros) {
    const img = PNG.sync.read(png);
    const paleta = quantize(img.data, cores, { format: "rgb444" });
    const indice = applyPalette(img.data, paleta, "rgb444");
    gif.writeFrame(indice, img.width, img.height, { palette: paleta, delay: atraso });
  }
  gif.finish();
  fs.writeFileSync(saida, gif.bytes());
  console.log("  gif", path.relative(RAIZ, saida), `${quadros.length} quadros, ${(fs.statSync(saida).size / 1e6).toFixed(2)} MB`);
}

// A passagem do Ato I para o Ato II, gravada do jogo com um cursor desenhado por cima.
async function gifPassagem() {
  const { ctx, page } = await novaPagina({ viewport: { width: 760, height: 470 }, deviceScaleFactor: 1 });
  const feitas = Object.fromEntries(ATO1.map((i) => [i, true]));
  await jogoEm(page, { versao: 1, comecou: Date.now() - 42 * 60e3, fase: 16, feitas, puladas: {}, chapeu: true, fechouEm: Date.now() - 5e3 });
  await page.waitForSelector(".estatisticas:not([hidden])", { timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const alvo = await page.$eval(".ponto-final", (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.72 }; });

  await page.evaluate(({ x, y }) => {
    const c = document.createElement("div");
    c.id = "cursor-falso";
    c.innerHTML = `<svg viewBox="0 0 24 36" width="26"><path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L23 19 Z" fill="#fff" stroke="#000" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
    Object.assign(c.style, { position: "fixed", left: "560px", top: "400px", zIndex: 99, pointerEvents: "none", transition: "left 900ms cubic-bezier(.4,0,.2,1), top 900ms cubic-bezier(.4,0,.2,1)" });
    document.body.append(c);
    requestAnimationFrame(() => { c.style.left = x - 3 + "px"; c.style.top = y - 3 + "px"; });
  }, alvo);

  const quadros = [];
  const gravar = async (ms, passo = 70) => {
    const fim = Date.now() + ms;
    let antes = Date.now();
    while (Date.now() < fim) {
      const png = await page.screenshot();
      const agora = Date.now();
      quadros.push({ png, atraso: Math.max(passo, agora - antes) });
      antes = agora;
      const falta = passo - (Date.now() - agora);
      if (falta > 0) await page.waitForTimeout(falta);
    }
  };
  await gravar(1300, 90);
  await page.evaluate(() => document.getElementById("cursor-falso").remove());
  await page.click(".ponto-final");
  await gravar(4200, 60);
  await page.waitForSelector("#entrar", { timeout: 40000 }).catch(() => {});
  await gravar(900, 150);
  quadros[quadros.length - 1].atraso = 2600;
  gravarGif(quadros, path.join(SAIDA, "passagem.gif"), { cores: 96 });
  await ctx.close();
}

// O Pé e o Asterisco acenando no rodapé do README: quadros montados à mão no HTML.
async function gifRodape(tema) {
  const { ctx, page } = await novaPagina();
  await page.goto(`${BASE}/docs/readme/fonte/rodape.html?tema=${tema}`);
  await page.waitForFunction(() => window.__pronto === true, null, { timeout: 20000 });
  const total = await page.evaluate(() => window.QUADROS);
  const alvo = await page.$("#cartaz");
  const quadros = [];
  for (let i = 0; i < total; i++) {
    await page.evaluate((i) => window.quadro(i), i);
    const atraso = await page.evaluate((i) => window.atraso(i), i);
    quadros.push({ png: await alvo.screenshot(), atraso });
  }
  gravarGif(quadros, path.join(SAIDA, `rodape${tema === "escuro" ? "-escuro" : ""}.gif`), { cores: 64 });
  await ctx.close();
}

// ---------- ordem de produção ----------

if (quer("capturas")) await capturarJogo();
for (const [arquivo, nome, temas] of ESTATICAS) {
  if (!quer(nome)) continue;
  for (const tema of temas) await renderizar(arquivo, nome, tema);
}
if (quer("social")) fs.copyFileSync(path.join(SAIDA, "social.png"), path.join(RAIZ, "site", "assets", "social.png"));
if (quer("passagem")) await gifPassagem();
if (quer("rodape")) for (const tema of ["claro", "escuro"]) await gifRodape(tema);

await browser.close();
servidor.close();

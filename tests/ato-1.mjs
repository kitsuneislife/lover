// Joga as 16 páginas do Ato I no Chromium headless, com ações de verdade do navegador
// onde o Playwright permite e simulação onde não dá (aba escondida, Picture-in-Picture, posição da janela).
// Uso: npm run test:ato1

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { servir } from "../tools/servidor.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PORTA = 8765 + Math.floor(Math.random() * 1000);
const servidor = await servir(path.join(AQUI, "..", "site"), PORTA);
const URL = `http://localhost:${PORTA}/`;
const OUT = path.join(AQUI, "capturas", "ato-1") + "/";
fs.mkdirSync(OUT, { recursive: true });


const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 820 }, reducedMotion: "reduce" });
await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: URL });
const page = await context.newPage();
const erros = [];
page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") erros.push("console: " + m.text()); });

const shot = (n) => page.screenshot({ path: OUT + n + ".png", fullPage: true });
const fase = () => page.evaluate(() => window.__nfea.fase);
const feita = (id) => page.evaluate((id) => !!window.__nfea.estado.feitas[id], id);
async function esperarPuzzle() {
  await page.waitForFunction(() => document.querySelector(".rodape") && !document.querySelector(".rodape").hidden, null, { timeout: 15000 });
}
async function ir(i) {
  await page.evaluate((i) => window.__nfea.irPara(i), i);
  await esperarPuzzle();
}
const resultados = [];
async function conferir(id) {
  const ok = await page.waitForFunction((id) => !!window.__nfea.estado.feitas[id], id, { timeout: 8000 }).then(() => true, () => false);
  resultados.push(`${ok ? "OK  " : "FALHOU"} ${id}`);
  return ok;
}

await page.goto(URL);
await page.waitForSelector("#comecar");
await shot("00-abertura");
await page.click("#comecar");
await esperarPuzzle();
await shot("01-tinta-branca");

// 1 seleção
await page.keyboard.press("Control+a");
await conferir("tinta-branca");
await page.waitForSelector(".depois .acao");
await shot("01b-resolvida");

// 2 Tab
await ir(1);
for (let i = 0; i < 30; i++) {
  await page.keyboard.press("Tab");
  const achou = await page.evaluate(() => document.activeElement?.classList.contains("tem-pe"));
  if (achou) { await shot("02-esconderijo-foco"); await page.keyboard.press("Enter"); break; }
}
await conferir("esconderijo");

// 3 Ctrl+F (simula o beforematch que o Chrome dispara)
await ir(2);
await shot("03-palheiro");
const suporta = await page.evaluate(() => "onbeforematch" in document.body);
await page.evaluate(() => document.querySelector(".agulha").dispatchEvent(new Event("beforematch")));
await conferir("agulha");
resultados.push("     (until-found suportado: " + suporta + ")");

// 4 zoom: device scale factor via CDP
await ir(3);
await shot("04-letra-miuda");
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 820, deviceScaleFactor: 2, mobile: false });
await conferir("letra-miuda");
await cdp.send("Emulation.clearDeviceMetricsOverride");

// 5 janela quadrada
await ir(4);
await shot("05-sala");
await page.setViewportSize({ width: 800, height: 800 });
await conferir("sala-quadrada");
await page.setViewportSize({ width: 1280, height: 820 });

// 6 endereço
await ir(5);
const hash1 = await page.evaluate(() => location.hash);
await page.evaluate(() => { location.hash = "porta=aberta"; });
await conferir("endereco");
resultados.push("     (hash inicial: " + hash1 + ")");

// 7 voltar
await ir(6);
await page.waitForFunction(() => location.hash === "#pagina-3", null, { timeout: 8000 });
await shot("07-para-tras");
await page.goBack();
await page.goBack();
await conferir("para-tras");

// 8 visibilidade (simulada: headless não esconde abas)
await ir(7);
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
  document.dispatchEvent(new Event("visibilitychange"));
});
await page.waitForTimeout(3800);
const tituloFora = await page.title();
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
  document.dispatchEvent(new Event("visibilitychange"));
});
await conferir("nao-olhe");
resultados.push("     (título enquanto fora: " + tituloFora + ")");
await shot("08-chapeu");

// 9 outra aba
await ir(8);
const outra = await context.newPage();
await outra.goto(URL);
await outra.waitForTimeout(2500);
await conferir("outra-aba");
await outra.screenshot({ path: OUT + "09-convidada.png" });
await outra.close();
await page.waitForTimeout(400);

// 10 copiar e colar
await ir(9);
await page.evaluate(() => {
  const r = document.createRange();
  r.selectNodeContents(document.querySelector("#palavra-nada"));
  getSelection().removeAllRanges();
  getSelection().addRange(r);
});
await page.keyboard.press("Control+c");
await page.click("#cola");
await page.keyboard.press("Control+v");
await conferir("nada");
resultados.push("     (colado: " + (await page.inputValue("#cola").catch(() => "?")) + ")");

// 11 modo escuro
await ir(10);
await page.emulateMedia({ colorScheme: "dark" });
await conferir("luz");
await shot("11-escuro");

// 12 console
await ir(11);
await page.evaluate(() => ola());
await conferir("bilhete");

// 13 localStorage
await ir(12);
await page.evaluate(() => localStorage.setItem("nfea.chaves", "999"));
await conferir("gaveta");
await shot("13-gaveta");
await page.emulateMedia({ colorScheme: "light" });

// 14 offline
await ir(13);
await context.setOffline(true);
await conferir("sem-rede");
// recarregar sem rede tem que funcionar pelo service worker
await page.reload();
await page.waitForSelector(".secao", { timeout: 8000 }).then(() => resultados.push("OK   recarregou offline"), () => resultados.push("FALHOU recarregou offline"));
await context.setOffline(false);

// 15 impressão
await ir(14);
await page.emulateMedia({ media: "print" });
await conferir("papel");
await page.emulateMedia({ media: "screen" });
await page.pdf({ path: OUT + "15-poster.pdf", format: "A4" });

// 16 fechar a aba
await ir(15);
await shot("16-saida");
await page.waitForTimeout(1500);
await page.reload();
await page.waitForSelector(".fim", { timeout: 8000 }).then(() => resultados.push("OK   tela do fim depois de recarregar"), () => resultados.push("FALHOU tela do fim"));
await page.waitForSelector(".fim .depois:not([hidden])", { timeout: 15000 }).catch(() => {});
await shot("17-fim");

// celular
const cel = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "reduce" });
const p2 = await cel.newPage();
await p2.goto(URL);
await p2.waitForSelector("#comecar");
await p2.screenshot({ path: OUT + "20-celular-abertura.png", fullPage: true });
await p2.click("#comecar");
await p2.waitForSelector(".rodape:not([hidden])");
await p2.screenshot({ path: OUT + "21-celular-fase.png", fullPage: true });
const larguraExtra = await p2.evaluate(() => document.documentElement.scrollWidth - innerWidth);
resultados.push(`     (celular: rolagem horizontal extra = ${larguraExtra}px)`);

console.log(resultados.join("\n"));
console.log(erros.length ? "ERROS:\n" + erros.join("\n") : "sem erros de página");
await browser.close();

const falhas = resultados.filter((r) => r.startsWith("FALHOU")).length;
servidor.close();
process.exit(falhas || erros.some((e) => e.startsWith("pageerror")) ? 1 : 0);

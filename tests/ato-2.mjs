// Joga a passagem e as 16 páginas do Ato II no Chromium headless, com ações de verdade do navegador
// onde o Playwright permite e simulação onde não dá (aba escondida, Picture-in-Picture, posição da janela).
// Uso: npm run test:ato2

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { servir } from "../tools/servidor.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PORTA = 8765 + Math.floor(Math.random() * 1000);
const servidor = await servir(path.join(AQUI, "..", "site"), PORTA);
const URL = `http://localhost:${PORTA}/`;
const OUT = path.join(AQUI, "capturas", "ato-2") + "/";
fs.mkdirSync(OUT, { recursive: true });

const so = process.argv[2] ? Number(process.argv[2]) : null; // rodar só uma fase

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 820 }, reducedMotion: "no-preference" });
await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: URL });
const page = await context.newPage();
const erros = [];
page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
// o 404 do § 29 é esperado: a fase visita de propósito um endereço que não existe
page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("404")) erros.push("console: " + m.text()); });

const shot = (n, full = false) => page.screenshot({ path: OUT + n + ".png", fullPage: full });
const resultados = [];
async function esperarPuzzle() {
  await page.waitForFunction(() => document.querySelector(".rodape") && !document.querySelector(".rodape").hidden, null, { timeout: 30000 });
}
async function ir(i) {
  await page.waitForFunction(() => !!window.__nfea, null, { timeout: 15000 }).catch(async () => console.log("sem __nfea em", page.url()));
  await page.evaluate((i) => window.__nfea.irPara(i), i);
  await esperarPuzzle();
}
async function conferir(id, timeout = 10000) {
  const ok = await page.waitForFunction((id) => !!window.__nfea.estado.feitas[id], id, { timeout }).then(() => true, () => false);
  resultados.push(`${ok ? "OK  " : "FALHOU"} ${id}`);
  return ok;
}
const ATO1 = ["tinta-branca","esconderijo","agulha","letra-miuda","sala-quadrada","endereco","para-tras","nao-olhe","outra-aba","nada","luz","bilhete","gaveta","sem-rede","papel","saida"];

// estado de quem acabou de fechar a aba no fim do Ato I
await page.goto(URL);
await page.evaluate((ids) => {
  const feitas = Object.fromEntries(ids.map((i) => [i, true]));
  localStorage.setItem("nfea.estado", JSON.stringify({ versao: 1, comecou: Date.now() - 3600e3, fase: 16, feitas, puladas: {}, chapeu: true, fechouEm: Date.now() - 60e3 }));
}, ATO1);
await page.reload();

if (so === null) {
  await page.waitForSelector(".ponto-final.tremendo", { timeout: 30000 });
  await shot("00-fim-ato1");
  await page.click(".ponto-final");
  await page.waitForTimeout(700);
  await shot("01-caindo");
  await page.waitForSelector("#entrar", { timeout: 40000 });
  await shot("02-avesso");
  resultados.push("OK   passagem para o avesso");
  await page.click("#entrar");
  await esperarPuzzle();
} else {
  await page.waitForSelector(".ponto-final");
  await page.evaluate(() => { const e = window.__nfea.estado; e.ato2 = true; e.fase = 31; window.__nfea.salvar(); });
  await page.reload();
  await page.waitForTimeout(500);
}

const fases = {
  16: async () => { await page.fill("#nome-verdadeiro", "pe"); await page.fill("#nome-verdadeiro", "¶"); await shot("17-nome"); },
  17: async () => {
    await page.waitForTimeout(12000);
    await shot("18-estatua-meio");
    await page.waitForTimeout(32000);
  },
  18: async () => { await shot("19-parede"); await page.evaluate(() => document.querySelector("#parede").remove()); },
  19: async () => { for (const k of ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]) await page.keyboard.press(k); },
  20: async () => { await page.mouse.wheel(0, 3000); await page.waitForTimeout(300); await shot("21-poco"); await page.keyboard.press("End"); },
  21: async () => {
    await page.evaluate(() => { window.__falado = []; speechSynthesis.speak = (u) => window.__falado.push(u.text); });
    await page.click("#ouvir");
    const t = await page.evaluate(() => window.__falado[0]);
    await page.fill("#senha-voz", t.split(": ")[1].replace(".", ""));
  },
  22: async () => {
    await shot("23-pichacao");
    await page.evaluate(() => { document.designMode = "on"; });
    const caixa = await page.evaluate(() => {
      const el = document.querySelector(".pichacao");
      const t = el.firstChild; const r = document.createRange();
      const i = t.textContent.indexOf("feio"); r.setStart(t, i); r.setEnd(t, i + 4);
      const b = r.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    });
    await page.mouse.dblclick(caixa.x, caixa.y);
    await page.keyboard.type("lindo");
  },
  23: async () => { await page.setInputFiles("#comida", { name: "receita.txt", mimeType: "text/plain", buffer: Buffer.from("bolo de fubá da vó\nfarinha, ovo") }); },
  24: async () => {
    await page.evaluate(() => document.documentElement.dispatchEvent(new MouseEvent("mouseleave")));
    await page.waitForTimeout(1000);
    await shot("25-medo");
    const palavra = await page.textContent(".placa-senha");
    await page.fill("#senha-seta", palavra);
  },
  25: async () => {
    for (let i = 0; i < 6; i++) {
      await page.reload();
      await page.waitForSelector(".manhas", { timeout: 30000 });
    }
    await shot("26-marmota");
  },
  26: async () => {
    const quadros = [];
    for (let i = 0; i < 30; i++) {
      const href = await page.evaluate(() => document.getElementById("favicon").href);
      const m = decodeURIComponent(href).match(/<text[^>]*>([^<]*)<\/text>/);
      quadros.push(m ? m[1] : "");
      await page.waitForTimeout(325);
    }
    const i = quadros.indexOf("¶");
    const digitos = [];
    let ult = null;
    for (const q of quadros.slice(i + 1).concat(quadros)) {
      if (q === "¶") { if (digitos.length) break; continue; }
      if (q && q !== ult) digitos.push(q);
      ult = q;
      if (digitos.length === 4) break;
    }
    await page.fill("#codigo-favicon", digitos.join(""));
  },
  27: async () => {
    const fonte = await (await fetch(URL)).text();
    const senha = fonte.match(/senha do porão é (\w+)/)[1];
    await page.fill("#senha-porao", senha);
  },
  28: async () => {
    await page.goto(URL + "pe");
    await page.waitForTimeout(600);
    await shot("29-404");
    await page.click("#voltar");
    await page.waitForLoadState("load");
    await page.waitForFunction(() => window.__nfea?.fase === 28, null, { timeout: 15000 });
  },
  29: async () => {
    await shot("30-pip");
    await page.evaluate(() => document.querySelector("video").dispatchEvent(new Event("enterpictureinpicture")));
  },
  30: async () => {
    await page.evaluate(() => {
      const def = (o, k, v) => Object.defineProperty(o, k, { configurable: true, get: () => v });
      def(screen, "availWidth", 1920); def(screen, "availHeight", 1080);
      def(window, "outerWidth", 800); def(window, "outerHeight", 500);
      def(window, "screenX", 1120); def(window, "screenY", 580);
    });
    await page.waitForTimeout(300);
    await shot("31-mudanca");
  },
  31: async () => {
    await page.click("#lutar");
    await page.waitForTimeout(300);
    await shot("32-chefao");
    const cdp = await context.newCDPSession(page);
    await page.evaluate(() => {
      const f = document.querySelector(".frase-alvo");
      if (f) { const r = document.createRange(); r.selectNodeContents(f); getSelection().removeAllRanges(); getSelection().addRange(r); }
      document.dispatchEvent(new ClipboardEvent("copy"));
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
      Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
      document.dispatchEvent(new Event("visibilitychange"));
      window.golpe?.();
    });
    if (await page.$(".mini-campo")) await page.fill(".mini-campo", "¶");
    if (await page.evaluate(() => location.hash === "#golpe")) await page.goBack();
    await page.setViewportSize({ width: 1100, height: 760 });
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 760, deviceScaleFactor: 1.5, mobile: false });
    await page.waitForTimeout(200);
    await cdp.send("Emulation.clearDeviceMetricsOverride");
    if (await page.$(".alvo-tab")) {
      await page.click("body", { position: { x: 5, y: 5 } }).catch(() => {});
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press("Tab");
        if (await page.evaluate(() => document.activeElement?.classList.contains("alvo-tab"))) break;
      }
    }
  },
};

const ids = ["nome","estatua","parede","konami","poco","voz","pichacao","fome","medo-de-seta","marmota","pequenininho","porao","lugar-nenhum","janela-flutuante","mudanca","chefao"];
for (let i = 16; i < 32; i++) {
  if (so !== null && i !== so) continue;
  if (i > 16 || so !== null) await ir(i);
  await fases[i]();
  await conferir(ids[i - 16], i === 31 ? 20000 : 12000);
}
await page.waitForTimeout(9000);
await shot("40-final");
await page.emulateMedia({ media: "print" });
await page.evaluate(() => dispatchEvent(new Event("beforeprint")));
await shot("41-poster");
await page.emulateMedia({ media: "screen" });

const cel = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const p2 = await cel.newPage();
await p2.goto(URL);
await p2.evaluate(() => localStorage.setItem("nfea.estado", JSON.stringify({ versao: 1, comecou: 1, fase: 20, feitas: {}, puladas: {}, chapeu: true, ato2: true })));
await p2.evaluate(() => sessionStorage.setItem("nfea.vendo", "19"));
await p2.reload();
await p2.waitForSelector(".rodape:not([hidden])", { timeout: 30000 });
await p2.screenshot({ path: OUT + "50-celular-konami.png", fullPage: true });
resultados.push(`     (celular: rolagem horizontal extra = ${await p2.evaluate(() => document.documentElement.scrollWidth - innerWidth)}px)`);

console.log(resultados.join("\n"));
console.log(erros.length ? "ERROS:\n" + erros.join("\n") : "sem erros de página");
await browser.close();

const falhas = resultados.filter((r) => r.startsWith("FALHOU")).length;
servidor.close();
process.exit(falhas || erros.some((e) => e.startsWith("pageerror")) ? 1 : 0);

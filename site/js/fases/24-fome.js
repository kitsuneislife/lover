// § 24: arrastar um arquivo para dentro da página (File API). O arquivo não sai do computador.

import { escapar, sortear } from "../util.js";

const tamanho = (bytes) => {
  const unidades = [["gigabyte", 1e9], ["megabyte", 1e6], ["kilobyte", 1e3]];
  for (const [u, v] of unidades) {
    if (bytes >= v) return new Intl.NumberFormat("pt-BR", { style: "unit", unit: u, unitDisplay: "short", maximumFractionDigits: 1 }).format(bytes / v);
  }
  return new Intl.NumberFormat("pt-BR", { style: "unit", unit: "byte", unitDisplay: "long" }).format(bytes);
};

function primeiraLinha(file) {
  return file.slice(0, 2000).text().then((t) => t.split(/\r?\n/).find((l) => l.trim()) || "");
}

async function provar(file) {
  const nome = escapar(file.name);
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const tipo = file.type;

  if (/^(exe|msi|dmg|apk|bat|sh|app|deb)$/.test(ext)) {
    return [`um ${ext.toUpperCase()}? não como coisa que se executa sozinha.`, "*regra número um da internet: nunca coma executável de estranhos. mas conta como tentativa."];
  }
  if (tipo.startsWith("image/")) {
    const dims = await new Promise((ok) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { ok(`${img.naturalWidth} por ${img.naturalHeight}`); URL.revokeObjectURL(url); };
      img.onerror = () => { ok(null); URL.revokeObjectURL(url); };
      img.src = url;
    });
    return [dims ? `hmm, pixels. ${dims} deles.` : "hmm, pixels.", "tem gosto de foto de celular."];
  }
  if (tipo.startsWith("text/") || /^(txt|md|csv|json|js|ts|html|css|py|xml|yml|yaml|log)$/.test(ext)) {
    const linha = (await primeiraLinha(file)).slice(0, 90);
    return [linha ? `“${escapar(linha)}”. meio salgado.` : "um texto vazio. comi o nada, de novo.", "texto é o que eu mais gosto. faz lembrar de casa."];
  }
  if (tipo === "application/pdf") return ["PDF. papel que não amassa. meu prato preferido."];
  if (tipo.startsWith("audio/")) return ["tem gosto de música. acho que era um refrão."];
  if (tipo.startsWith("video/")) return ["comi um filme inteiro. sem pipoca."];
  if (/^(zip|rar|7z|gz|tar)$/.test(ext)) return ["comida congelada. descongelo depois."];
  const sabor = sortear(["segunda-feira", "papelão", "Wi-Fi de rodoviária", "planilha"]);
  return [`${ext ? ext.toUpperCase() : "um arquivo sem nome de família"}. nunca tinha comido. gosto de ${sabor}.`, `o nome era ${nome}, se servir de consolo.`];
}

export default {
  id: "fome",
  nome: "Fome",
  celular: true,
  falas: [
    "tô com fome. no avesso não tem comida, só arquivo.",
    "me dá um arquivo qualquer do seu computador? arrasta pra cá. eu como aqui mesmo, ele não vai para lugar nenhum.",
  ],
  dicas: [
    "arraste qualquer arquivo de uma pasta ou da área de trabalho e solte em cima da boca.",
    "ou use o botão de escolher arquivo. no celular é o único jeito.",
    "o navegador lê o arquivo ali mesmo, com a File API, e esquece quando você sai. nada é enviado.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `
      <div class="boca" tabindex="-1">
        <p class="boca-texto">solte aqui</p>
      </div>
      <p class="escolher">
        <label class="texto-botao" for="comida">Escolher um arquivo</label>
        <input id="comida" name="comida" type="file" class="so-leitor">
      </p>`;
    const boca = ctx.palco.querySelector(".boca");
    const input = ctx.palco.querySelector("#comida");

    const comer = async (file) => {
      if (!file || ctx.resolvida) return;
      boca.classList.add("mastigando");
      boca.querySelector(".boca-texto").textContent = file.name;
      ctx.som.pulo();
      const falas = await provar(file);
      falas.push(`foram ${tamanho(file.size)}. ${file.size > 5e7 ? "vou precisar deitar." : file.size < 2000 ? "um petisco." : "tô satisfeito."}`);
      ctx.resolver(falas);
    };

    // sem preventDefault no dragover o navegador abre o arquivo e sai do jogo
    ctx.on(window, "dragover", (e) => { e.preventDefault(); boca.classList.add("aberta"); });
    ctx.on(window, "dragleave", (e) => { if (!e.relatedTarget) boca.classList.remove("aberta"); });
    ctx.on(window, "drop", (e) => {
      e.preventDefault();
      boca.classList.remove("aberta");
      const file = e.dataTransfer?.files?.[0];
      if (file) comer(file);
      else ctx.dizer("isso é texto solto. eu quero um arquivo.");
    });
    ctx.on(input, "change", () => comer(input.files?.[0]));
  },
};

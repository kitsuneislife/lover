// § 26: recarregar a página (F5) várias vezes. O Pé vive o mesmo dia a cada recarga
// e vai percebendo. A contagem fica no sessionStorage, que sobrevive ao F5.

const RECARGAS = 6;
let contagem = null;

function ss(chave, valor) {
  try {
    if (valor === undefined) return sessionStorage.getItem(chave);
    if (valor === null) sessionStorage.removeItem(chave);
    else sessionStorage.setItem(chave, String(valor));
  } catch { return null; }
  return null;
}

// Conta uma vez por carregamento da página.
function contar() {
  if (contagem !== null) return contagem;
  const nav = performance.getEntriesByType?.("navigation")?.[0];
  const recarregou = nav?.type === "reload";
  const armado = ss("nfea.marmota.armado") === "1";
  const antes = Number(ss("nfea.marmota") || 0);
  contagem = recarregou && armado ? antes + 1 : antes;
  ss("nfea.marmota", contagem);
  return contagem;
}

const MANHAS = [
  ["bom dia! que dia lindo pra ficar preso numa aba."],
  ["bom dia! que dia lindo pra ficar preso numa… espera. eu já disse isso?"],
  ["bom dia. você tá com uma cara de quem já me viu hoje."],
  ["BOM DIA. eu lembro! toda vez que você recarrega a página, o dia começa de novo."],
  ["bom dia, de novo. a gente tá num loop, e eu já decorei a sua cara."],
  ["não vou dizer bom dia. se eu fizer uma coisa diferente, o loop quebra. recarrega mais uma vez."],
];

export default {
  id: "marmota",
  nome: "Dia da marmota",
  celular: true,
  falas() {
    const n = contar();
    return n >= RECARGAS ? ["boa noite."] : MANHAS[n];
  },
  dicas: [
    "recarregar é a tecla <kbd>F5</kbd>. no Mac, <kbd>Cmd</kbd> + <kbd>R</kbd>. no celular, puxe a página para baixo.",
    "várias vezes seguidas, sem sair desta página. conte as manhãs.",
    "são seis manhãs.",
  ],
  montar(ctx) {
    const n = contar();
    ss("nfea.marmota.armado", 1);
    ctx.aoSair(() => ss("nfea.marmota.armado", null));
    ctx.palco.innerHTML = `<p class="manhas">manhãs: <output>${Math.min(n, RECARGAS) + 1}</output></p>`;

    if (n >= RECARGAS) {
      ss("nfea.marmota", null);
      contagem = null;
      return ctx.resolver([
        "o dia acabou! amanhã, finalmente.",
        "*F5 joga fora tudo que a página tinha na memória. o Pé só lembrava de você porque o jogo anota a contagem no sessionStorage.",
      ]);
    }
    const comentarios = {
      0: "*toda vez que esta página carrega, o dia dele começa de novo. igualzinho. eu programei assim.",
      3: "*ih. ele percebeu.",
      4: "*isso não estava no roteiro.",
    };
    if (comentarios[n]) ctx.dizer(comentarios[n]);
  },
};

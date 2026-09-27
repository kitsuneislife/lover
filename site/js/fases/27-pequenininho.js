// § 27: o Pé se muda para o favicon e mostra um código de quatro dígitos, um por vez.

function quadro(texto, { fundo, cor }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${fundo}"/>` +
    (texto ? `<text x="32" y="51" font-size="54" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="${cor}">${texto}</text>` : "") +
    "</svg>";
}

export default {
  id: "pequenininho",
  nome: "Pequenininho",
  celular: false,
  falas: [
    "me mudei para o favicon. aquele quadradinho da aba, lá em cima.",
    "*ele fica mostrando um código de quatro números, um de cada vez. fica olhando.",
  ],
  dicas: [
    "o favicon é o ícone pequeno na aba do navegador, do lado do título.",
    "o ciclo começa com o ¶. depois vêm os quatro números, em ordem.",
    "se a aba estiver espremida no meio de muitas outras, abra esta página numa janela só pra ela.",
  ],
  vitoria: [
    "voltei! lá em cima é apertado. dezesseis por dezesseis pixels.",
    "*e ninguém olha pra lá. por isso eu gosto.",
  ],
  montar(ctx) {
    const codigo = String(1000 + Math.floor(Math.random() * 9000));
    const s = getComputedStyle(document.documentElement);
    const cores = { fundo: s.getPropertyValue("--papel").trim(), cor: s.getPropertyValue("--tinta").trim() };
    ctx.pe.sumir(true);
    ctx.palco.innerHTML = `
      <p class="seta-cima" aria-hidden="true">↑</p>
      <div class="campo campo-grande">
        <label for="codigo-favicon">Código</label>
        <input id="codigo-favicon" name="codigo-favicon" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="0000…">
      </div>`;

    // ¶, pausa, quatro dígitos com um piscar vazio entre eles (para ver "7 7" como dois setes)
    const sequencia = ["¶", "", ...codigo.split("").flatMap((d) => [d, ""]), ""];
    let i = 0;
    const passo = () => {
      ctx.favicon(quadro(sequencia[i] === "¶" ? "¶" : sequencia[i], cores));
      i = (i + 1) % sequencia.length;
    };
    passo();
    ctx.cada(650, passo);

    const campo = ctx.palco.querySelector("input");
    ctx.on(campo, "input", () => {
      const v = campo.value.replace(/\D/g, "");
      if (v === codigo) {
        ctx.pe.sumir(false);
        ctx.resolver();
      } else if (v.length === 4) {
        ctx.dizer("*errado. pisca menos.");
      }
    });
  },
};

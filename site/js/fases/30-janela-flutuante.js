// § 30: Picture-in-Picture. Um <video> recebe o stream de um canvas onde o Pé é desenhado,
// e assim ele consegue sair do navegador numa janelinha que flutua por cima de tudo.

import { PE_CAMINHO } from "../pe.js";

export default {
  id: "janela-flutuante",
  nome: "Janela flutuante",
  celular: true,
  falas: [
    "descobri um jeito de sair do navegador sem ninguém fechar a aba.",
    "*o vídeo aí embaixo sabe virar uma janelinha. descubram como.",
  ],
  dicas: [
    "clique com o botão direito no vídeo e procure “Picture in picture” ou “Imagem sobre imagem”.",
    "os controles do vídeo também têm, no menu de três pontinhos.",
    "se nada disso aparecer, dois cliques no vídeo.",
  ],
  vitoria: [
    "tô fora! dá pra ver a sua área de trabalho daqui. que bagunça.",
    "*Picture-in-Picture. a janelinha fica por cima de tudo, até de outros programas. pode deixar ele passeando.",
  ],
  montar(ctx) {
    const pode = document.pictureInPictureEnabled && typeof HTMLCanvasElement.prototype.captureStream === "function";
    ctx.palco.innerHTML = `
      <video class="tela-pe" width="480" height="270" muted playsinline autoplay controls aria-label="Vídeo do Pé acenando"></video>`;
    const video = ctx.palco.querySelector("video");
    if (!pode) {
      ctx.dizer("*este navegador não faz janelinha flutuante. pode pular esta página sem culpa.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 270;
    const g = canvas.getContext("2d");
    const corpo = new Path2D(PE_CAMINHO);
    let fora = false;
    let t0 = performance.now();
    let rodando = true;

    const desenhar = (t) => {
      if (!rodando) return;
      const s = (t - t0) / 1000;
      g.fillStyle = "#0000EE";
      g.fillRect(0, 0, 480, 270);
      g.save();
      g.translate(70, 60 + Math.sin(s * 3) * 8);
      g.scale(1.1, 1.1);
      g.fillStyle = "#fff";
      g.fill(corpo);
      g.fillStyle = "#0000EE";
      const olhar = Math.sin(s * 1.3) * 2.5;
      [26, 44].forEach((x) => { g.beginPath(); g.arc(x + olhar, 37, 3.6, 0, Math.PI * 2); g.fill(); });
      g.restore();
      g.fillStyle = "#fff";
      g.font = "italic 30px 'Bodoni Moda', Georgia, serif";
      const linhas = fora ? ["tô fora!", "olha a sua área de trabalho."] : ["oi! me leva", "pra fora?"];
      linhas.forEach((l, i) => g.fillText(l, 210, 120 + i * 40));
      g.fillStyle = "#FFFF00";
      g.font = "700 22px Georgia, serif";
      g.fillText("*", 450 + Math.sin(s * 5) * 3, 36);
      requestAnimationFrame(desenhar);
    };
    requestAnimationFrame(desenhar);
    const stream = canvas.captureStream(30);
    video.srcObject = stream;
    video.play().catch(() => {});

    ctx.on(video, "enterpictureinpicture", () => {
      fora = true;
      ctx.pe.sumir(true);
      ctx.resolver();
    });
    ctx.on(video, "leavepictureinpicture", () => {
      fora = false;
      ctx.pe.sumir(false);
      ctx.pe.pular();
      ctx.dizer("voltei. lá fora faz frio.");
    });
    ctx.on(video, "dblclick", () => {
      video.requestPictureInPicture?.().catch(() => ctx.dizer("*o navegador disse não. tenta pelo botão direito."));
    });

    ctx.aoSair(() => {
      rodando = false;
      if (document.pictureInPictureElement === video) document.exitPictureInPicture().catch(() => {});
      stream.getTracks().forEach((tr) => tr.stop());
    });
  },
};

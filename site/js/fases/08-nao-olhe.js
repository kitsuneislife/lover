// § 8: Page Visibility API. O Pé só se arruma quando ninguém está olhando.
// Enquanto a aba está escondida, ele conversa pelo título da aba.

export default {
  id: "nao-olhe",
  nome: "Não olhe",
  celular: true,
  falas: [
    "preciso me arrumar e fico com vergonha se alguém olha.",
    "vai para outra aba um pouquinho? eu aviso pelo título desta aba quando puder voltar.",
  ],
  dicas: [
    "Abra ou clique em qualquer outra aba do navegador e espere uns segundos.",
    "Fique de olho no título desta aba, lá na barra de abas.",
    "No celular, trocar de aplicativo também vale.",
  ],
  vitoria: [
    "e aí? comprei um chapéu. ninguém nunca me viu de chapéu, porque ninguém nunca olhou para outro lado quando eu pedi.",
  ],
  montar(ctx) {
    let saiuEm = 0;
    let pronto = 0;

    ctx.on(document, "visibilitychange", () => {
      if (document.hidden) {
        saiuEm = performance.now();
        ctx.titulo.forcar("¶ não olha ainda…");
        pronto = setTimeout(() => {
          ctx.estado.chapeu = true;
          ctx.salvar();
          ctx.pe.chapeu(true);
          ctx.titulo.forcar("¶ pronto! pode voltar");
        }, 3500);
        return;
      }
      clearTimeout(pronto);
      ctx.titulo.forcar(null);
      if (ctx.estado.chapeu && performance.now() - saiuEm >= 3400) {
        ctx.pe.humor("feliz");
        ctx.resolver();
      } else if (saiuEm) {
        ctx.dizer("ei! eu disse um pouquinho, não um piscar. vai de novo.", { humor: "espanto" });
      }
    });
    ctx.aoSair(() => clearTimeout(pronto));
  },
};

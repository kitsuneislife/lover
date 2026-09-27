// § 14: eventos online/offline. O service worker mantém a página viva sem internet.

export default {
  id: "sem-rede",
  nome: "Silêncio",
  celular: true,
  falas: [
    "a internet faz um barulho que só eu escuto. um chiado constante.",
    "desliga um pouquinho? eu guardei a página inteira aqui dentro, nada vai cair.",
  ],
  dicas: [
    "Desligue o Wi-Fi ou tire o cabo de rede. No celular, modo avião.",
    "Sem mexer na rede: <kbd>F12</kbd>, aba Network, troque “No throttling” por “Offline”.",
    "Depois pode religar. A página continua funcionando.",
  ],
  vitoria: [
    "silêncio. que coisa boa.",
    "esta página funciona offline porque um service worker guardou cada arquivo quando você chegou. pode religar a internet quando quiser.",
  ],
  montar(ctx) {
    ctx.palco.innerHTML = `<p class="sinal" aria-live="polite"></p>`;
    const sinal = ctx.palco.firstElementChild;
    const pintar = () => { sinal.textContent = navigator.onLine ? "conectado" : "desconectado"; };
    pintar();

    ctx.on(window, "offline", () => { pintar(); ctx.resolver(); });
    ctx.on(window, "online", () => {
      pintar();
      if (ctx.resolvida) ctx.dizer("o chiado voltou. tudo bem, eu me acostumo.");
    });
    if (!navigator.onLine) {
      ctx.depois(600, () => ctx.resolver(["você já estava sem internet. então o silêncio é seu, não meu.", "pode religar quando quiser."]));
    }
  },
};

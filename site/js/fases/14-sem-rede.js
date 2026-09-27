// § 14: sem internet. navigator.onLine só sabe se existe alguma rede ligada
// (Wi-Fi conectado a um roteador sem internet ainda conta como "online").
// Por isso o jogo também manda uma sonda de verdade para o servidor a cada 2,5 s.
// O service worker deixa a sonda passar direto, sem responder do cache.

async function sondar() {
  if (!navigator.onLine) return false;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2500);
  try {
    const r = await fetch(`./sonda.txt?t=${Date.now()}`, { cache: "no-store", signal: ctrl.signal });
    return r.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

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
    ctx.palco.innerHTML = `<p class="sinal" aria-live="polite">escutando…</p>`;
    const sinal = ctx.palco.firstElementChild;
    let conectado = null;
    let ocupado = false;

    const atualizar = (on) => {
      if (on === conectado) return;
      const antes = conectado;
      conectado = on;
      sinal.textContent = on ? "conectado" : "desconectado";
      if (!on) {
        ctx.resolver(antes === null
          ? ["você já estava sem internet. o silêncio já era seu.", "pode religar quando quiser."]
          : undefined);
      } else if (ctx.resolvida) {
        ctx.dizer("o chiado voltou. tudo bem, eu me acostumo.");
      }
    };

    const conferir = async () => {
      if (ocupado) return;
      ocupado = true;
      const on = await sondar();
      ocupado = false;
      atualizar(on);
    };

    conferir();
    ctx.cada(2500, conferir);
    ctx.on(window, "offline", () => atualizar(false));
    ctx.on(window, "online", conferir);
  },
};

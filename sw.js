// Service worker: guarda o jogo inteiro na primeira visita.
// É ele que deixa o § 14 (sem internet) funcionar.

const VERSAO = "nfea-v3";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./css/print.css",
  "./assets/icon.svg",
  "./assets/fonts/bodoni-moda.woff2",
  "./assets/fonts/bodoni-moda-italic.woff2",
  "./assets/fonts/atkinson-next.woff2",
  "./assets/fonts/atkinson-next-italic.woff2",
  "./js/main.js",
  "./js/pe.js",
  "./js/fx.js",
  "./js/store.js",
  "./js/asterisco.js",
  "./js/util.js",
  "./404.html",
  "./js/fases/01-tinta-branca.js",
  "./js/fases/02-esconderijo.js",
  "./js/fases/03-agulha.js",
  "./js/fases/04-letra-miuda.js",
  "./js/fases/05-sala-quadrada.js",
  "./js/fases/06-endereco.js",
  "./js/fases/07-para-tras.js",
  "./js/fases/08-nao-olhe.js",
  "./js/fases/09-outra-aba.js",
  "./js/fases/10-nada.js",
  "./js/fases/11-luz.js",
  "./js/fases/12-bilhete.js",
  "./js/fases/13-gaveta.js",
  "./js/fases/14-sem-rede.js",
  "./js/fases/15-papel.js",
  "./js/fases/16-saida.js",
  "./js/fases/17-nome.js",
  "./js/fases/18-estatua.js",
  "./js/fases/19-parede.js",
  "./js/fases/20-konami.js",
  "./js/fases/21-poco.js",
  "./js/fases/22-voz.js",
  "./js/fases/23-pichacao.js",
  "./js/fases/24-fome.js",
  "./js/fases/25-medo-de-seta.js",
  "./js/fases/26-marmota.js",
  "./js/fases/27-pequenininho.js",
  "./js/fases/28-porao.js",
  "./js/fases/29-lugar-nenhum.js",
  "./js/fases/30-janela-flutuante.js",
  "./js/fases/31-mudanca.js",
  "./js/fases/32-chefao.js",
  "./js/fases/index.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro, para quem publica ver as mudanças; cache quando a rede falha.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // a sonda do § 14 precisa ir à rede de verdade; sem cache, sem plano B
  if (url.pathname.endsWith("/sonda.txt")) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(VERSAO).then((c) => c.put(req, copia));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});

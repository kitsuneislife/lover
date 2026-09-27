// Servidor estático sem dependências que imita o GitHub Pages:
// caminho que não existe devolve o 404.html com status 404 (o § 29 precisa disso).
//
//   node tools/servidor.mjs [porta] [pasta]
//   npm run dev

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml", ".png": "image/png", ".gif": "image/gif", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

export function servir(raiz, porta = 8000) {
  const servidor = http.createServer(async (req, res) => {
    const caminho = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let arquivo = path.join(raiz, path.normalize(caminho));
    if (!arquivo.startsWith(raiz)) { res.writeHead(403).end(); return; }
    try {
      if ((await fs.stat(arquivo)).isDirectory()) arquivo = path.join(arquivo, "index.html");
      const corpo = await fs.readFile(arquivo);
      res.writeHead(200, { "Content-Type": TIPOS[path.extname(arquivo)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(corpo);
    } catch {
      const corpo = await fs.readFile(path.join(raiz, "404.html")).catch(() => Buffer.from("404"));
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(corpo);
    }
  });
  return new Promise((ok) => servidor.listen(porta, () => ok(servidor)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const porta = Number(process.argv[2] || 8000);
  const raiz = path.resolve(process.argv[3] || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "site"));
  await servir(raiz, porta);
  console.log(`¶ o jogo está em http://localhost:${porta}/`);
}

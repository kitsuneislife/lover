// Texto vindo de fora (nome de arquivo, conteúdo colado) nunca entra cru no HTML.
export function escapar(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// "Paralelepípedo " e "paralelepipedo" contam como a mesma resposta.
export function normalizar(s) {
  return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "");
}

export function sortear(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

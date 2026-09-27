// Peças compartilhadas pelas imagens do README: o Pé e o Asterisco saem do próprio código do jogo.
import { desenharPe } from "/site/js/pe.js";
import { desenharAsterisco } from "/site/js/asterisco.js";

export const tema = new URLSearchParams(location.search).get("tema") || "claro";
document.documentElement.dataset.tema = tema;

const OLHOS = [[26, 37], [44, 37]];

// Pé com humor, chapéu e olhar (dx, dy de -1 a 1)
export function pe({ largura = 120, humor = "", chapeu = false, olhar = [0, 0], piscando = false, cor } = {}) {
  const svg = desenharPe();
  svg.style.width = largura + "px";
  if (cor) svg.style.color = cor;
  if (humor) svg.setAttribute("data-humor", humor);
  if (chapeu) svg.setAttribute("data-chapeu", "");
  if (piscando) svg.setAttribute("data-piscando", "");
  svg.querySelectorAll(".pupila").forEach((p, i) => {
    p.setAttribute("cx", OLHOS[i][0] + olhar[0] * 3.4);
    p.setAttribute("cy", OLHOS[i][1] + olhar[1] * 3.4);
  });
  return svg;
}

export function ast({ largura = 60, girar = 0, olhar = [0, 0], cor } = {}) {
  const svg = desenharAsterisco();
  svg.style.width = largura + "px";
  svg.querySelector(".ast-bracos").setAttribute("transform", `rotate(${girar})`);
  if (cor) svg.querySelector(".ast-bracos").style.fill = cor;
  const p = svg.querySelector(".ast-pupila");
  p.setAttribute("cx", olhar[0] * 5);
  p.setAttribute("cy", olhar[1] * 5);
  return svg;
}

// Monta um elemento: por(seletor, no) põe o nó dentro de cada elemento que casar
export function por(seletor, fabrica) {
  document.querySelectorAll(seletor).forEach((el) => el.append(typeof fabrica === "function" ? fabrica(el) : fabrica));
}

// O script de render espera por isto antes de fotografar
export async function pronto() {
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__pronto = true;
}

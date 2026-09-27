// O Pé: um pé-de-mosca (¶) com olhos.
// Desenhado à mão em SVG para que os olhos caibam dentro da barriga.

const SVG = "http://www.w3.org/2000/svg";

export const PE_CAMINHO =
  // barriga
  "M58 68H42a30 30 0 0 1 0-60h16Z" +
  // fio de cima
  "M40 8h44v5H40Z" +
  // hastes
  "M52 8h9v120h-9ZM70 8h9v120h-9Z" +
  // serifas
  "M47 126h19v3H47ZM65 126h19v3H65Z";

const OLHOS = [
  { x: 26, y: 37 },
  { x: 44, y: 37 },
];

export function desenharPe({ rotulo = "", olhosFechados = false } = {}) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "0 -36 100 172");
  svg.setAttribute("class", "pe");
  if (rotulo) {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", rotulo);
  } else {
    svg.setAttribute("aria-hidden", "true");
  }
  svg.innerHTML = `
    <g class="chapeu">
      <path class="corpo" d="M34 1h58v5H34Z"/>
      <path class="corpo" d="M44 -32h38v34H44Z"/>
      <path d="M44 -8h38v5H44Z" fill="var(--link)"/>
    </g>
    <path class="corpo" d="${PE_CAMINHO}"/>
    ${OLHOS.map(
      (o, i) => `
      <g class="palpebra">
        <circle class="olho-branco" cx="${o.x}" cy="${o.y}" r="7.5"/>
        <circle class="pupila" data-olho="${i}" cx="${o.x}" cy="${o.y}" r="3.6"/>
      </g>`
    ).join("")}
    <path class="boca boca-feliz" d="M27 52q8 8 17 0"/>
    <path class="boca boca-triste" d="M27 57q8 -7 17 0"/>
  `;
  if (olhosFechados) svg.setAttribute("data-piscando", "");
  return svg;
}

export function criarPe(casa) {
  const svg = desenharPe({ rotulo: "Pé, um pé-de-mosca com olhos" });
  casa.replaceChildren(svg);
  const pupilas = [...svg.querySelectorAll(".pupila")];
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)");

  let alvo = null;
  let quadro = 0;
  let timerPiscar = 0;

  function mirar() {
    quadro = 0;
    if (!alvo) return;
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    const escala = r.width / 100;
    pupilas.forEach((p, i) => {
      const o = OLHOS[i];
      const cx = r.left + (o.x + 0) * escala;
      const cy = r.top + (o.y + 36) * escala;
      const dx = alvo.x - cx;
      const dy = alvo.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(3.4, d / 40);
      p.setAttribute("cx", (o.x + (dx / d) * k).toFixed(2));
      p.setAttribute("cy", (o.y + (dy / d) * k).toFixed(2));
    });
  }

  function olharPara(x, y) {
    alvo = { x, y };
    if (!quadro) quadro = requestAnimationFrame(mirar);
  }

  addEventListener("pointermove", (e) => olharPara(e.clientX, e.clientY), { passive: true });
  addEventListener("focusin", (e) => {
    const r = e.target.getBoundingClientRect?.();
    if (r) olharPara(r.left + r.width / 2, r.top + r.height / 2);
  });

  function piscar() {
    if (!reduzido.matches && !document.hidden) {
      svg.setAttribute("data-piscando", "");
      setTimeout(() => svg.removeAttribute("data-piscando"), 140);
    }
    timerPiscar = setTimeout(piscar, 2600 + Math.random() * 4200);
  }
  timerPiscar = setTimeout(piscar, 1800);

  function animar(classe) {
    svg.classList.remove("pula", "encolhe");
    void svg.getBoundingClientRect();
    svg.classList.add(classe);
    svg.addEventListener("animationend", () => svg.classList.remove(classe), { once: true });
  }

  let humorTimer = 0;

  return {
    el: svg,
    olharPara,
    humor(h, ms = 0) {
      clearTimeout(humorTimer);
      if (h) svg.setAttribute("data-humor", h);
      else svg.removeAttribute("data-humor");
      if (ms) humorTimer = setTimeout(() => svg.removeAttribute("data-humor"), ms);
    },
    pular() { animar("pula"); },
    // entrada no avesso: cai de ponta-cabeça e desvira
    cambalhota() { animar("cambalhota"); },
    encolher() { animar("encolhe"); },
    sumir(sim) {
      if (sim) svg.setAttribute("data-sumido", "");
      else svg.removeAttribute("data-sumido");
    },
    chapeu(sim) {
      if (sim) svg.setAttribute("data-chapeu", "");
      else svg.removeAttribute("data-chapeu");
    },
    parar() { clearTimeout(timerPiscar); },
  };
}

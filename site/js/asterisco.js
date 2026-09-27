// O Asterisco (*): mora nas notas de rodapé, tem um olho só e uma sobrancelha desconfiada.
// Os seis braços giram devagar; o olho fica parado no meio e acompanha o cursor.

const SVG = "http://www.w3.org/2000/svg";

export function desenharAsterisco() {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "-50 -50 100 100");
  svg.setAttribute("class", "ast");
  svg.setAttribute("aria-hidden", "true");
  const bracos = [0, 60, 120, 180, 240, 300]
    .map((a) => `<rect x="-7" y="-47" width="14" height="40" rx="7" transform="rotate(${a})"/>`)
    .join("");
  svg.innerHTML = `
    <g class="ast-bracos">${bracos}<circle r="19"/></g>
    <g class="ast-rosto">
      <circle class="ast-olho" r="11"/>
      <circle class="ast-pupila" r="5.2"/>
      <path class="ast-sobrancelha" d="M-12 -17 L12 -12"/>
    </g>`;
  return svg;
}

export function criarAsterisco(casa) {
  const svg = desenharAsterisco();
  casa.replaceChildren(svg);
  const pupila = svg.querySelector(".ast-pupila");
  let quadro = 0;
  let alvo = null;

  const mirar = () => {
    quadro = 0;
    if (!alvo || casa.hidden) return;
    const r = svg.getBoundingClientRect();
    const dx = alvo.x - (r.left + r.width / 2);
    const dy = alvo.y - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(5, d / 30);
    pupila.setAttribute("cx", ((dx / d) * k).toFixed(2));
    pupila.setAttribute("cy", ((dy / d) * k).toFixed(2));
  };
  addEventListener("pointermove", (e) => {
    alvo = { x: e.clientX, y: e.clientY };
    if (!quadro) quadro = requestAnimationFrame(mirar);
  }, { passive: true });

  const animar = (classe, ms) => {
    svg.classList.remove(classe);
    void svg.getBoundingClientRect();
    svg.classList.add(classe);
    setTimeout(() => svg.classList.remove(classe), ms);
  };

  return {
    el: svg,
    mostrar(sim) { casa.hidden = !sim; },
    falar() { animar("ast-fala", 500); },
    rir() { animar("ast-ri", 900); },
    humor(h) {
      if (h) svg.setAttribute("data-humor", h);
      else svg.removeAttribute("data-humor");
    },
  };
}

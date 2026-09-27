// Som sintetizado, favicon vivo, título da aba e vibração.
// Nenhum arquivo de áudio ou imagem: tudo nasce aqui.

import { PE_CAMINHO } from "./pe.js";
import { ler, gravar } from "./store.js";

// ---------- som ----------

let ctx = null;
let ligado = ler("som", true);

function audio() {
  if (!ligado) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function nota(freq, dur, { tipo = "sine", vol = 0.12, ataque = 0.005, quando = 0 } = {}) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + quando;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const som = {
  get ligado() { return ligado; },
  alternar() {
    ligado = !ligado;
    gravar("som", ligado);
    if (!ligado && ctx) ctx.suspend();
    return ligado;
  },
  // tecla de máquina de escrever: um estalo curto de ruído filtrado
  tecla() {
    const a = audio();
    if (!a) return;
    const n = Math.floor(a.sampleRate * 0.018);
    const buf = a.createBuffer(1, n, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2400 + Math.random() * 1400;
    const g = a.createGain();
    g.gain.value = 0.05;
    src.connect(f).connect(g).connect(a.destination);
    src.start();
  },
  // sininho da máquina de escrever ao fim da linha
  acerto() {
    nota(1318.5, 1.2, { vol: 0.1 });
    nota(1975.5, 0.9, { vol: 0.05, quando: 0.02 });
    nota(2637, 0.5, { vol: 0.025, quando: 0.04 });
  },
  erro() {
    nota(220, 0.25, { tipo: "triangle", vol: 0.08 });
    nota(207.6, 0.3, { tipo: "triangle", vol: 0.06, quando: 0.09 });
  },
  pulo() {
    nota(392, 0.12, { tipo: "triangle", vol: 0.07 });
    nota(587.3, 0.18, { tipo: "triangle", vol: 0.07, quando: 0.07 });
  },
};

export function vibrar(padrao = 30) {
  try { navigator.vibrate?.(padrao); } catch { /* sem vibração */ }
}

// ---------- favicon ----------

const favicon = () => document.getElementById("favicon");

export function desenharFavicon({ olhos = "abertos", cor = "#000", fundo = "#fff" } = {}) {
  const el = favicon();
  if (!el) return;
  let olhosSvg = "";
  if (olhos === "abertos") {
    olhosSvg = `<circle cx="26" cy="37" r="8" fill="${fundo}"/><circle cx="44" cy="37" r="8" fill="${fundo}"/><circle cx="27" cy="38" r="4" fill="${cor}"/><circle cx="45" cy="38" r="4" fill="${cor}"/>`;
  } else if (olhos === "fechados") {
    olhosSvg = `<path d="M19 38h14M37 38h14" stroke="${fundo}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  const corpo = olhos === "vazio" ? "" : `<path fill="${cor}" d="${PE_CAMINHO}"/>${olhosSvg}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 136"><rect width="100" height="136" rx="18" fill="${fundo}"/>${corpo}</svg>`;
  el.href = "data:image/svg+xml," + encodeURIComponent(svg);
}

// ---------- título da aba ----------

const TITULO_BASE = "não feche esta aba";
let tituloAtual = TITULO_BASE;
let tituloForcado = null;

export const titulo = {
  definir(t) {
    tituloAtual = t;
    if (!tituloForcado && !document.hidden) document.title = t;
  },
  // uma fase pode tomar o título para falar com quem está em outra aba
  forcar(t) {
    tituloForcado = t;
    if (t) document.title = t;
    else document.title = document.hidden ? "¶ ei, volta" : tituloAtual;
  },
  base: TITULO_BASE,
};

document.addEventListener("visibilitychange", () => {
  if (tituloForcado) return;
  document.title = document.hidden ? "¶ ei, volta" : tituloAtual;
});

// ---------- console ----------

const estiloGrande = "font: 700 48px/1 Georgia, serif; color: #0000ee";
const estiloTexto = "font: 14px/1.5 system-ui, sans-serif";

export function cumprimentarConsole() {
  console.log("%c¶", estiloGrande);
  console.log(
    "%coi. aqui é o Pé. você abriu o console antes da hora.\ntudo bem, eu também sou curioso.",
    estiloTexto
  );
}

export function bilheteConsole() {
  console.log("%c¶", estiloGrande);
  console.log(
    "%cachou meu bilhete.\ndigita isto aqui embaixo e aperta Enter:\n\n    ola()\n",
    estiloTexto + "; background: #ffff00; color: #000; padding: 8px 12px"
  );
}

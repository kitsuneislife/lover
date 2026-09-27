// Tudo que o jogo lembra fica no localStorage, com prefixo "nfea.".
// Janela anônima ou armazenamento bloqueado: o jogo segue sem salvar.

const PREFIXO = "nfea.";

export function ler(chave, padrao) {
  try {
    const v = localStorage.getItem(PREFIXO + chave);
    return v === null ? padrao : JSON.parse(v);
  } catch {
    return padrao;
  }
}

export function gravar(chave, valor) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch { /* sem armazenamento */ }
}

export function apagar(chave) {
  try { localStorage.removeItem(PREFIXO + chave); } catch { /* idem */ }
}

// valor cru, sem JSON: a fase da gaveta precisa que o jogador consiga editar à mão
export function lerCru(chave) {
  try { return localStorage.getItem(PREFIXO + chave); } catch { return null; }
}
export function gravarCru(chave, valor) {
  try { localStorage.setItem(PREFIXO + chave, valor); } catch { /* idem */ }
}

const ESTADO_INICIAL = () => ({
  versao: 1,
  comecou: null,
  fase: 0,
  feitas: {},
  puladas: {},
  chapeu: false,
  fechouEm: null,
  terminouEm: null,
});

export function carregarEstado() {
  const e = ler("estado", null);
  if (!e || e.versao !== 1) return ESTADO_INICIAL();
  return { ...ESTADO_INICIAL(), ...e };
}

export function salvarEstado(e) {
  gravar("estado", e);
}

export function zerarEstado() {
  const e = ESTADO_INICIAL();
  salvarEstado(e);
  apagar("chaves");
  return e;
}

// § 12: o console do DevTools. O Pé deixa um bilhete e uma função global.

import { bilheteConsole } from "../fx.js";

export default {
  id: "bilhete",
  nome: "Bilhete no porão",
  celular: false,
  falas: [
    "deixei um bilhete num lugar onde só quem programa costuma olhar.",
    "o console do navegador. fica atrás de uma tecla que parece proibida, mas não é.",
  ],
  dicas: [
    "Abra as ferramentas de desenvolvedor: <kbd>F12</kbd>, ou <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd>. No Mac, <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>J</kbd>.",
    "Procure a aba Console. O bilhete tem fundo amarelo.",
    "Digite <code>ola()</code> no console e aperte <kbd>Enter</kbd>.",
  ],
  vitoria: [
    "oi! você falou comigo pelo porão.",
    "o console executa qualquer JavaScript nesta página. só cole código lá se entender o que ele faz.",
  ],
  montar(ctx) {
    bilheteConsole();
    const responder = () => {
      ctx.resolver();
      return "¶ oi pra você também. volta pra página.";
    };
    window.ola = responder;
    window.oi = responder;
    ctx.aoSair(() => {
      delete window.ola;
      delete window.oi;
    });
    // quem abrir o console depois ainda precisa ver o bilhete
    ctx.cada(20000, () => { if (!ctx.resolvida) bilheteConsole(); });
  },
};

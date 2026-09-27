// A ordem do array é a ordem do jogo. ATO2 é o índice da primeira página do avesso.
import tintaBranca from "./01-tinta-branca.js";
import esconderijo from "./02-esconderijo.js";
import agulha from "./03-agulha.js";
import letraMiuda from "./04-letra-miuda.js";
import salaQuadrada from "./05-sala-quadrada.js";
import endereco from "./06-endereco.js";
import paraTras from "./07-para-tras.js";
import naoOlhe from "./08-nao-olhe.js";
import outraAba from "./09-outra-aba.js";
import nada from "./10-nada.js";
import luz from "./11-luz.js";
import bilhete from "./12-bilhete.js";
import gaveta from "./13-gaveta.js";
import semRede from "./14-sem-rede.js";
import papel from "./15-papel.js";
import saida from "./16-saida.js";

import nome from "./17-nome.js";
import estatua from "./18-estatua.js";
import parede from "./19-parede.js";
import konami from "./20-konami.js";
import poco from "./21-poco.js";
import voz from "./22-voz.js";
import pichacao from "./23-pichacao.js";
import fome from "./24-fome.js";
import medoDeSeta from "./25-medo-de-seta.js";
import marmota from "./26-marmota.js";
import pequenininho from "./27-pequenininho.js";
import porao from "./28-porao.js";
import lugarNenhum from "./29-lugar-nenhum.js";
import janelaFlutuante from "./30-janela-flutuante.js";
import mudanca from "./31-mudanca.js";
import chefao from "./32-chefao.js";

export const FASES = [
  tintaBranca, esconderijo, agulha, letraMiuda, salaQuadrada, endereco, paraTras, naoOlhe,
  outraAba, nada, luz, bilhete, gaveta, semRede, papel, saida,

  nome, estatua, parede, konami, poco, voz, pichacao, fome,
  medoDeSeta, marmota, pequenininho, porao, lugarNenhum, janelaFlutuante, mudanca, chefao,
];

export const ATO2 = 16;

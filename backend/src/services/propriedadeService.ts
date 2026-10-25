// Aluna: Eduarda Prado Deiró | RA: 25004440

import { WithId, Document } from 'mongodb';
import { ErroApi } from '../utils/erroApi';

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export interface DadosPropriedade {
  nome: string;
  municipio: string;
  uf: string;
  area: number;
  registro: string;
  culturas: string[];
}

function texto(valor: unknown) {
  return typeof valor === 'string' ? valor.trim() : '';
}

export function validarPropriedade(dados: DadosPropriedade) {
  if (!texto(dados.nome)) throw new ErroApi(400, 'Informe o nome da propriedade');
  if (!texto(dados.municipio)) throw new ErroApi(400, 'Informe o município');
  if (!UFS.includes(texto(dados.uf))) throw new ErroApi(400, 'UF inválida');

  if (typeof dados.area !== 'number' || !(dados.area > 0)) {
    throw new ErroApi(400, 'A área precisa ser maior que zero');
  }

  if (!texto(dados.registro)) throw new ErroApi(400, 'Informe o registro rural (CAR, DAP ou CAF)');

  if (!Array.isArray(dados.culturas) || dados.culturas.filter((c) => texto(c)).length === 0) {
    throw new ErroApi(400, 'Escolha pelo menos uma cultura');
  }
}

export function montarPropriedade(dados: DadosPropriedade) {
  return {
    nome: texto(dados.nome),
    municipio: texto(dados.municipio),
    uf: texto(dados.uf),
    area: dados.area,
    registro: texto(dados.registro),
    culturas: dados.culturas.map(texto).filter((c) => c),
    talhoes: [],
  };
}

export function formatarPropriedade(propriedade: WithId<Document>) {
  const { _id, senha, ...resto } = propriedade;
  return { id: _id.toString(), ...resto };
}

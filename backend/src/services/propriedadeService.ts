// Aluna: Eduarda Prado Deiró | RA: 25004440

import { WithId, Document } from 'mongodb';
import { ErroApi } from '../utils/erroApi';

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const FORMATO_CAR = /^([A-Z]{2})-\d{7}-([A-F0-9]{32}|[A-F0-9]{4}(\.[A-F0-9]{4}){7})$/;
const FORMATO_DAP_CAF = /^(?=.*[A-Z])(?=.*\d)[A-Z0-9.-]{8,30}$/;

function registroValido(tipo: string, registro: string) {
  const numero = registro.toUpperCase();

  if (tipo === 'CAR') {
    const partes = FORMATO_CAR.exec(numero);
    return partes !== null && UFS.includes(partes[1]);
  }

  return FORMATO_DAP_CAF.test(numero);
}

export interface DadosPropriedade {
  nome: string;
  municipio: string;
  uf: string;
  area: number;
  tipoRegistro: string;
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

  if (!['CAR', 'DAP', 'CAF'].includes(texto(dados.tipoRegistro))) {
    throw new ErroApi(400, 'Escolha o tipo de registro rural: CAR, DAP ou CAF');
  }

  if (!registroValido(texto(dados.tipoRegistro), texto(dados.registro))) {
    throw new ErroApi(400, `O número do ${texto(dados.tipoRegistro)} está em um formato inválido`);
  }

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
    tipo_registro: texto(dados.tipoRegistro),
    registro: texto(dados.registro).toUpperCase(),
    culturas: dados.culturas.map(texto).filter((c) => c),
    talhoes: [],
  };
}

export function formatarPropriedade(propriedade: WithId<Document>) {
  const { _id, senha, ...resto } = propriedade;
  return { id: _id.toString(), ...resto };
}

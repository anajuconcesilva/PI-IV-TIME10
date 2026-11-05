// Aluna: Eduarda Prado Deiró | RA: 25004440

import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';
import { validarMunicipio } from '../validators/validacoes';
import { todasExistem } from './culturaService';
import { formatarPropriedade, validarPropriedade } from './propriedadeService';

export interface DadosConta {
  email: string;
  celular: string;
  senhaAtual?: string;
  propriedade: string;
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

function somenteNumeros(valor: unknown) {
  return texto(valor).replace(/\D/g, '');
}

async function buscarPropriedade(propriedadeId: string) {
  if (!ObjectId.isValid(propriedadeId)) {
    throw new ErroApi(401, 'Identificação da propriedade inválida');
  }

  const propriedade = await obterBanco()
    .collection('propriedades')
    .findOne({ _id: new ObjectId(propriedadeId) });

  if (!propriedade) {
    throw new ErroApi(404, 'Propriedade não encontrada');
  }

  return propriedade;
}

async function culturasEmUso(talhoes: { nome: string; cultura_id: number }[]) {
  const ids = talhoes.map((talhao) => talhao.cultura_id);
  const culturas = await obterBanco()
    .collection('culturas')
    .find({ cultura_id: { $in: ids } })
    .toArray();

  return talhoes.map((talhao) => ({
    talhao: talhao.nome,
    cultura: culturas.find((item) => item.cultura_id === talhao.cultura_id)?.nome as string,
  }));
}

function somarAreas(talhoes: { area: number }[]) {
  let total = 0;

  for (const talhao of talhoes) {
    total += talhao.area;
  }

  return total;
}

export async function obterConta(propriedadeId: string) {
  const propriedade = await buscarPropriedade(propriedadeId);
  const talhoes = propriedade.talhoes ?? [];
  const emUso = await culturasEmUso(talhoes);

  return {
    ...formatarPropriedade(propriedade),
    areaEmUso: somarAreas(talhoes),
    culturasEmUso: [...new Set(emUso.map((item) => item.cultura).filter((nome) => nome))],
  };
}

export async function atualizarConta(propriedadeId: string, dados: DadosConta) {
  const propriedade = await buscarPropriedade(propriedadeId);
  const banco = obterBanco();

  if (somenteNumeros(dados.celular).length !== 11) {
    throw new ErroApi(400, 'Celular deve ter DDD e 9 números');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(dados.email))) {
    throw new ErroApi(400, 'E-mail inválido');
  }

  validarPropriedade({
    nome: dados.propriedade,
    municipio: dados.municipio,
    uf: dados.uf,
    area: dados.area,
    tipoRegistro: dados.tipoRegistro,
    registro: dados.registro,
    culturas: dados.culturas,
  });

  let municipioValido = false;
  try {
    municipioValido = await validarMunicipio(texto(dados.municipio), texto(dados.uf));
  } catch (erro) {
    throw new ErroApi(503, 'Não foi possível verificar o município. Tente novamente.');
  }
  if (!municipioValido) {
    throw new ErroApi(400, 'Município não encontrado na UF informada');
  }

  const culturas = dados.culturas.map(texto).filter((cultura) => cultura);
  if (!(await todasExistem(culturas))) {
    throw new ErroApi(400, 'Escolha culturas da lista do Agrofit');
  }

  const talhoes = propriedade.talhoes ?? [];

  if (dados.area < somarAreas(talhoes)) {
    throw new ErroApi(400, 'A área total não pode ser menor que a soma dos talhões já cadastrados');
  }

  for (const item of await culturasEmUso(talhoes)) {
    if (item.cultura && !culturas.includes(item.cultura)) {
      throw new ErroApi(409, `A cultura ${item.cultura} é usada pelo talhão ${item.talhao}. Remova ou altere o talhão antes.`);
    }
  }

  const email = texto(dados.email).toLowerCase();

  if (email !== propriedade.email) {
    if (typeof dados.senhaAtual !== 'string' || !(await bcrypt.compare(dados.senhaAtual, propriedade.senha))) {
      throw new ErroApi(401, 'Para trocar o e-mail, informe a senha atual correta');
    }

    if (await banco.collection('propriedades').findOne({ email, _id: { $ne: propriedade._id } })) {
      throw new ErroApi(409, 'Já existe uma conta com este e-mail');
    }
  }

  await banco.collection('propriedades').updateOne(
    { _id: propriedade._id },
    {
      $set: {
        email,
        telefone: somenteNumeros(dados.celular),
        nome: texto(dados.propriedade),
        municipio: texto(dados.municipio),
        uf: texto(dados.uf),
        area: dados.area,
        tipo_registro: texto(dados.tipoRegistro),
        registro: texto(dados.registro).toUpperCase(),
        culturas,
      },
    }
  );

  return obterConta(propriedadeId);
}

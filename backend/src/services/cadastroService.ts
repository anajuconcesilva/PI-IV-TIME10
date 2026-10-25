// Aluna: Eduarda Prado Deiró | RA: 25004440

import bcrypt from 'bcryptjs';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';
import { todasExistem } from './culturaService';
import { DadosPropriedade, formatarPropriedade, montarPropriedade, validarPropriedade } from './propriedadeService';

export interface DadosCadastro {
  cnpj: string;
  celular: string;
  email: string;
  senha: string;
  propriedade: string;
  municipio: string;
  uf: string;
  area: number;
  registro: string;
  culturas: string[];
}

function texto(valor: unknown) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function somenteNumeros(valor: unknown) {
  return texto(valor).replace(/\D/g, '');
}

function dadosDaPropriedade(dados: DadosCadastro): DadosPropriedade {
  return {
    nome: dados.propriedade,
    municipio: dados.municipio,
    uf: dados.uf,
    area: dados.area,
    registro: dados.registro,
    culturas: dados.culturas,
  };
}

function validar(dados: DadosCadastro) {
  if (somenteNumeros(dados.cnpj).length !== 14) {
    throw new ErroApi(400, 'O CNPJ deve ter 14 números');
  }

  if (somenteNumeros(dados.celular).length !== 11) {
    throw new ErroApi(400, 'Celular deve ter DDD e 9 números');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(dados.email))) {
    throw new ErroApi(400, 'E-mail inválido');
  }

  if (typeof dados.senha !== 'string' || dados.senha.length < 6) {
    throw new ErroApi(400, 'A senha precisa ter pelo menos 6 caracteres');
  }

  validarPropriedade(dadosDaPropriedade(dados));
}

export async function cadastrarPropriedade(dados: DadosCadastro) {
  validar(dados);

  const culturas = dados.culturas.map(texto).filter((cultura) => cultura);
  if (!(await todasExistem(culturas))) {
    throw new ErroApi(400, 'Escolha culturas da lista do Agrofit');
  }

  const propriedades = obterBanco().collection('propriedades');
  const email = texto(dados.email).toLowerCase();
  const cnpj = somenteNumeros(dados.cnpj);

  if (await propriedades.findOne({ email })) {
    throw new ErroApi(409, 'Já existe uma conta com este e-mail');
  }
  if (await propriedades.findOne({ cnpj })) {
    throw new ErroApi(409, 'Já existe uma conta com este CNPJ');
  }

  const propriedade = {
    email,
    senha: await bcrypt.hash(dados.senha, 10),
    cnpj,
    telefone: somenteNumeros(dados.celular),
    ...montarPropriedade(dadosDaPropriedade(dados)),
  };
  const { insertedId } = await propriedades.insertOne(propriedade);

  return formatarPropriedade({ _id: insertedId, ...propriedade });
}

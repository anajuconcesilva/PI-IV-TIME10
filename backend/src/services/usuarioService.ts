// Aluna: Eduarda Prado Deiró | RA: 25004440

import bcrypt from 'bcryptjs';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';
import { todasExistem } from './culturaService';
import { DadosPropriedade, montarPropriedade, validarPropriedade } from './propriedadeService';

export interface DadosCadastro {
  cnpj: string;
  celular: string;
  email: string;
  senha: string;
  propriedade: string;
  municipio: string;
  uf: string;
  area: number;
  registro?: string;
  culturas: string[];
}

function texto(valor: unknown) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function somenteNumeros(valor: unknown) {
  return texto(valor).replace(/\D/g, '');
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

export async function cadastrarUsuario(dados: DadosCadastro) {
  validar(dados);

  const culturas = dados.culturas.map(texto).filter((cultura) => cultura);
  if (!(await todasExistem(culturas))) {
    throw new ErroApi(400, 'Escolha culturas da lista do Agrofit');
  }

  const banco = obterBanco();
  const usuarios = banco.collection('usuarios');

  const email = texto(dados.email).toLowerCase();
  const cnpj = somenteNumeros(dados.cnpj);

  if (await usuarios.findOne({ email })) {
    throw new ErroApi(409, 'Já existe uma conta com este e-mail');
  }
  if (await usuarios.findOne({ cnpj })) {
    throw new ErroApi(409, 'Já existe uma conta com este CNPJ');
  }

  const { insertedId } = await usuarios.insertOne({
    email,
    senha: await bcrypt.hash(dados.senha, 10),
    cnpj,
    telefone: somenteNumeros(dados.celular),
  });

  try {
    await banco.collection('propriedades').insertOne(montarPropriedade(insertedId, dadosDaPropriedade(dados)));
  } catch (erro) {
    await usuarios.deleteOne({ _id: insertedId });
    throw erro;
  }

  return { id: insertedId.toString(), email };
}

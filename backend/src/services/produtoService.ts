// Aluna: Marília Santos

import { ObjectId } from 'mongodb';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';

function formatarProduto(produto: any) {
  return {
    id: produto._id.toString(),
    numRegistro: produto.num_registro,
    marca: produto.marca,
    principioAtivo: produto.principio_ativo,
    classe: produto.classe,
    culturaId: produto.cultura_id,
    cultura: typeof produto.cultura === 'string' ? produto.cultura.trim() : produto.cultura,
  };
}

function escaparRegex(texto: string) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function paraTexto(valor: unknown) {
  return typeof valor === 'string' ? valor.trim() : '';
}

export async function listarProdutos(filtros: Record<string, unknown>) {
  const cultura = paraTexto(filtros.cultura);
  const marca = paraTexto(filtros.marca);
  const principioAtivo = paraTexto(filtros.principioAtivo);
  const classe = paraTexto(filtros.classe);
  const culturaId = paraTexto(filtros.culturaId);
  const pagina = Math.max(parseInt(String(filtros.pagina ?? '1'), 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(String(filtros.limite ?? '20'), 10) || 20, 1), 100);

  const consulta: Record<string, unknown> = {};

  if (culturaId) {
    const numero = Number(culturaId);
    if (!Number.isInteger(numero)) throw new ErroApi(400, 'culturaId deve ser um número inteiro');
    consulta.cultura_id = numero;
  }
  // o campo cultura pode ter espaços sobrando, por isso o \s*
  if (cultura) consulta.cultura = { $regex: `^\\s*${escaparRegex(cultura)}\\s*$`, $options: 'i' };
  if (marca) consulta.marca = { $regex: escaparRegex(marca), $options: 'i' };
  if (principioAtivo) consulta.principio_ativo = { $regex: escaparRegex(principioAtivo), $options: 'i' };
  if (classe) consulta.classe = { $regex: escaparRegex(classe), $options: 'i' };

  const colecao = obterBanco().collection('produtos');
  const [total, produtos] = await Promise.all([
    colecao.countDocuments(consulta),
    colecao
      .find(consulta)
      .sort({ marca: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite)
      .toArray(),
  ]);

  return {
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
    produtos: produtos.map(formatarProduto),
  };
}

export async function buscarProduto(id: unknown) {
  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    throw new ErroApi(400, 'ID de produto inválido');
  }

  const produto = await obterBanco()
    .collection('produtos')
    .findOne({ _id: new ObjectId(id) });

  if (!produto) {
    throw new ErroApi(404, 'Produto não encontrado');
  }

  return formatarProduto(produto);
}
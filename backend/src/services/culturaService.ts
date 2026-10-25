// Aluna: Eduarda Prado Deiró | RA: 25004440

import { obterBanco } from '../mongodb';

interface Cultura {
  id: string;
  nome: string;
  quantidadeProdutos: number;
}

let culturasEmMemoria: Cultura[] | null = null;

// A base do Agrofit não muda enquanto a API roda, então a contagem é feita uma vez só
export async function listarCulturas() {
  if (culturasEmMemoria) return culturasEmMemoria;

  const banco = obterBanco();
  const contagem = await banco
    .collection('produtos')
    .aggregate<{ _id: string; total: number }>([
      { $group: { _id: { $trim: { input: '$cultura' } }, total: { $sum: 1 } } },
    ])
    .toArray();

  const totalPorNome = new Map(contagem.map((item) => [item._id, item.total]));

  const culturas = await banco.collection('culturas').find().sort({ nome: 1 }).toArray();

  culturasEmMemoria = culturas.map((cultura) => ({
    id: cultura._id.toString(),
    nome: cultura.nome,
    quantidadeProdutos: totalPorNome.get(cultura.nome) ?? 0,
  }));
  return culturasEmMemoria;
}

export async function todasExistem(nomes: string[]) {
  const culturas = await listarCulturas();
  const existentes = new Set(culturas.map((cultura) => cultura.nome));
  return nomes.every((nome) => existentes.has(nome));
}

// Aluna: Eduarda Prado Deiró | RA: 25004440

import { ObjectId } from 'mongodb';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';

interface Cultura {
  id: string;
  culturaId: number;          // novo
  nome: string;
  periodoCarencia: number | null;  // novo
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
    culturaId: cultura.cultura_id,                    // novo
    nome: cultura.nome,
    periodoCarencia: cultura.periodo_carencia ?? null, // novo
    quantidadeProdutos: totalPorNome.get(cultura.nome) ?? 0,
  }));
  return culturasEmMemoria;
}

/// src/services/culturaService.ts
export async function buscarCultura(id: unknown) {
  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    throw new ErroApi(400, 'ID de cultura inválido');
  }

  const cultura = (await listarCulturas()).find((item) => item.id === id);

  if (!cultura) {
    throw new ErroApi(404, 'Cultura não encontrada');
  }

  return cultura;
}

export async function todasExistem(nomes: string[]) {
  const culturas = await listarCulturas();
  const existentes = new Set(culturas.map((cultura) => cultura.nome));
  return nomes.every((nome) => existentes.has(nome));
}
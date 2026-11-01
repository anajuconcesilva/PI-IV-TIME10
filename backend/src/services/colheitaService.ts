// Aluna: Marília Santos | RA: XXXXXXXX

import { ObjectId } from 'mongodb';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';
import { consultarTalhao } from './talhaoService';

const DIA_MS = 24 * 60 * 60 * 1000;

function inicioDoDia(data: Date) {
  return Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
}

function lerData(valor: unknown, mensagem: string) {
  if (typeof valor !== 'string' || !valor.trim()) throw new ErroApi(400, mensagem);
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) throw new ErroApi(400, 'Data inválida');
  return data;
}

function validarId(id: unknown, mensagem: string) {
  if (typeof id !== 'string' || !ObjectId.isValid(id)) throw new ErroApi(400, mensagem);
  return id;
}

// Regra de carência isolada: bloqueia se alguma aplicação do talhão ainda não liberou a colheita
export async function verificarCarencia(propriedadeId: string, talhaoId: string, dataColheita: Date) {
  const fimDoDia = new Date(inicioDoDia(dataColheita) + DIA_MS);

  const aplicacoes = await obterBanco()
    .collection('aplicacoes')
    .find({
      propriedade_id: new ObjectId(propriedadeId),
      talhao_id: new ObjectId(talhaoId),
      data_aplicacao: { $lt: fimDoDia }, // aplicações depois da colheita não contam
    })
    .toArray();

  let liberacao: Date | null = null;

  for (const aplicacao of aplicacoes) {
    const data =
      aplicacao.data_liberacao_colheita instanceof Date
        ? aplicacao.data_liberacao_colheita
        : new Date(new Date(aplicacao.data_aplicacao).getTime() + Number(aplicacao.periodo_carencia ?? 0) * DIA_MS);

    if (Number.isNaN(data.getTime())) continue;
    if (!liberacao || data > liberacao) liberacao = data;
  }

  if (liberacao && inicioDoDia(liberacao) > inicioDoDia(dataColheita)) {
    const dataTexto = liberacao.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    throw new ErroApi(409, `Talhão em carência: colheita liberada a partir de ${dataTexto}`);
  }
}

export async function registrarColheita(propriedadeId: string, dados: Record<string, unknown>) {
  validarId(propriedadeId, 'Identificação da propriedade inválida');
  const talhaoId = validarId(dados.talhaoId, 'Informe um talhão válido');
  const dataColheita = lerData(dados.dataColheita, 'Informe a data da colheita');

  if (inicioDoDia(dataColheita) > inicioDoDia(new Date())) {
    throw new ErroApi(400, 'A data da colheita não pode ser futura');
  }

  const quantidade = Number(dados.quantidade);
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw new ErroApi(400, 'A quantidade deve ser maior que zero');
  }

  const unidade = typeof dados.unidade === 'string' && dados.unidade.trim() ? dados.unidade.trim() : 'kg';

  if (dados.observacao !== undefined && typeof dados.observacao !== 'string') {
    throw new ErroApi(400, 'A observação deve ser um texto');
  }

  // lança 404 se o talhão não for desta propriedade
  const talhao = (await consultarTalhao(propriedadeId, talhaoId)) as { cultura_id?: number } | undefined;

  await verificarCarencia(propriedadeId, talhaoId, dataColheita);

  const colheita = {
    propriedade_id: new ObjectId(propriedadeId),
    talhao_id: new ObjectId(talhaoId),
    cultura_id: talhao?.cultura_id ?? null,
    data_colheita: dataColheita,
    quantidade,
    unidade,
    observacao: typeof dados.observacao === 'string' ? dados.observacao.trim() : '',
    criado_em: new Date(),
  };

  const { insertedId } = await obterBanco().collection('colheitas').insertOne(colheita);
  return formatarColheita({ _id: insertedId, ...colheita });
}

function formatarColheita(colheita: any) {
  return {
    id: colheita._id.toString(),
    talhaoId: colheita.talhao_id.toString(),
    culturaId: colheita.cultura_id,
    dataColheita: colheita.data_colheita,
    quantidade: colheita.quantidade,
    unidade: colheita.unidade,
    observacao: colheita.observacao,
    criadoEm: colheita.criado_em,
  };
}

export async function listarColheitas(propriedadeId: string, filtros: Record<string, unknown>) {
  validarId(propriedadeId, 'Identificação da propriedade inválida');

  const consulta: Record<string, unknown> = { propriedade_id: new ObjectId(propriedadeId) };

  if (filtros.talhaoId !== undefined) {
    consulta.talhao_id = new ObjectId(validarId(filtros.talhaoId, 'Talhão inválido'));
  }

  const periodo: Record<string, Date> = {};
  if (filtros.dataInicio !== undefined) periodo.$gte = lerData(filtros.dataInicio, 'Data inicial inválida');
  if (filtros.dataFim !== undefined) {
    periodo.$lt = new Date(inicioDoDia(lerData(filtros.dataFim, 'Data final inválida')) + DIA_MS);
  }
  if (Object.keys(periodo).length) consulta.data_colheita = periodo;

  const pagina = Math.max(parseInt(String(filtros.pagina ?? '1'), 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(String(filtros.limite ?? '20'), 10) || 20, 1), 100);

  const colecao = obterBanco().collection('colheitas');
  const [total, colheitas] = await Promise.all([
    colecao.countDocuments(consulta),
    colecao
      .find(consulta)
      .sort({ data_colheita: -1 })
      .skip((pagina - 1) * limite)
      .limit(limite)
      .toArray(),
  ]);

  return {
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
    colheitas: colheitas.map(formatarColheita),
  };
}
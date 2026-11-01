// Aluna: Marília Sara Pereira dos Santos
import { obterBanco } from '../mongodb';

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lerTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Remove vazios/duplicados e ordena em português
function listaUnicaOrdenada(valores: unknown[]): string[] {
  const unicos = new Set<string>();
  for (const v of valores) {
    if (typeof v === 'string' && v.trim() !== '') unicos.add(v.trim());
  }
  return Array.from(unicos).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function filtroTexto(valor: string, exato: boolean) {
  const padrao = escaparRegex(valor);
  return { $regex: exato ? `^${padrao}$` : padrao, $options: 'i' };
}

export async function listarClasses() {
  const banco = obterBanco();
  const classes = await banco.collection('produtos').distinct('classe');
  return listaUnicaOrdenada(classes).map((nome) => ({ nome }));
}

export async function listarCulturas() {
  const banco = obterBanco();
  const culturas = await banco.collection('produtos').distinct('cultura');
  return listaUnicaOrdenada(culturas).map((nome) => ({ nome }));
}

export async function buscarProdutos(filtros: any) {
  const banco = obterBanco();
  const query: any = {};

  const busca = lerTexto(filtros.busca);
  const cultura = lerTexto(filtros.cultura);
  const classe = lerTexto(filtros.classe);

  if (busca) {
    const regexBusca = { $regex: escaparRegex(busca), $options: 'i' };
    query.$or = [
      { marca: regexBusca },
      { principio_ativo: regexBusca },
      { num_registro: regexBusca } // só casa se num_registro estiver salvo como string no banco
    ];
  }

  if (cultura && cultura.toLowerCase() !== 'todas') {
    query.cultura = filtroTexto(cultura, filtros.culturaExata === 'true');
  }

  if (classe && classe.toLowerCase() !== 'todas') {
    query.classe = filtroTexto(classe, filtros.classeExata === 'true');
  }

  // Paginação: página começa em 1; limite padrão 20, máximo 100
  const pagina = Math.max(1, parseInt(lerTexto(filtros.pagina), 10) || 1);
  const limite = Math.min(100, Math.max(1, parseInt(lerTexto(filtros.limite), 10) || 20));

  const colecao = banco.collection('produtos');
  const total = await colecao.countDocuments(query);

  const produtos = await colecao
    .find(query)
    .sort({ marca: 1, _id: 1 })
    .skip((pagina - 1) * limite)
    .limit(limite)
    .toArray();

  const itens = produtos.map((prod) => ({
    id: prod._id.toString(),
    nome: prod.marca ? String(prod.marca).trim() : 'Sem nome',
    ingredienteAtivo: prod.principio_ativo,
    registro: prod.num_registro,
    classe: prod.classe,
    culturas: prod.cultura ? [prod.cultura] : [],
    carenciaDias: 0
  }));

  return { itens, total, pagina, limite };
}
// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import { ObjectId } from 'mongodb';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';


// Lista os avisos da propriedade autenticada.
export async function listarAvisos(propriedadeId: string) {
    if (!ObjectId.isValid(propriedadeId)) {
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    const banco = obterBanco();

    const avisos = await banco.collection('avisos')
        .find({
            propriedade_id: new ObjectId(propriedadeId)
        })
        .sort({ data: -1 })
        .toArray();

    return avisos.map((aviso) => ({
        id: aviso._id.toString(),
        tipo: aviso.tipo,
        mensagem: aviso.mensagem,
        data: aviso.data,
        status: aviso.status,
        talhao_id: aviso.talhao_id?.toString() ?? null
    }));
}

// Marca um aviso específico como lido.
export async function marcarAvisoComoLido(
    propriedadeId: string,
    avisoId: string
) {
    if (!ObjectId.isValid(propriedadeId)) {
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    if (!ObjectId.isValid(avisoId)) {
        throw new ErroApi(400, 'Identificador do aviso inválido');
    }

    const banco = obterBanco();

    const resultado = await banco.collection('avisos').updateOne(
        {
            _id: new ObjectId(avisoId),
            propriedade_id: new ObjectId(propriedadeId)
        },
        {
            $set: { status: 'lido' }
        }
    );

    if (resultado.matchedCount === 0) {
        throw new ErroApi(404, 'Aviso não encontrado');
    }

    return { mensagem: 'Aviso marcado como lido' };
}

// Marca todos os avisos ativos da propriedade como lidos.
export async function marcarTodosAvisosComoLidos(
    propriedadeId: string
) {
    if (!ObjectId.isValid(propriedadeId)) {
        throw new ErroApi(401, 'Identificação da propriedade inválida');
    }

    const banco = obterBanco();

    const resultado = await banco.collection('avisos').updateMany(
        {
            propriedade_id: new ObjectId(propriedadeId),
            status: 'ativo'
        },
        {
            $set: { status: 'lido' }
        }
    );

    return {
        mensagem: 'Avisos marcados como lidos',
        quantidade: resultado.modifiedCount
    };
}

// Cria um aviso de carência após o registro de uma aplicação.
export async function criarAvisoCarencia(
    propriedadeId: string,
    talhaoId: string,
    nomeTalhao: string
) {
    if (!ObjectId.isValid(propriedadeId) || !ObjectId.isValid(talhaoId)) {
        throw new ErroApi(400, 'Identificação inválida para criar o aviso');
    }

    const banco = obterBanco();

    // Verifica se já existe um aviso para esta aplicação/talhão.
    const avisoExistente = await banco.collection('avisos').findOne({
        propriedade_id: new ObjectId(propriedadeId),
        talhao_id: new ObjectId(talhaoId),
        tipo: 'carencia',
        status: 'ativo'
    });

    if (avisoExistente) {
        return;
    }

    const aviso = {
        propriedade_id: new ObjectId(propriedadeId),
        tipo: 'carencia',
        mensagem: `${nomeTalhao} está em período de carência`,
        data: new Date(),
        status: 'ativo',
        talhao_id: new ObjectId(talhaoId)
    };

    await banco.collection('avisos').insertOne(aviso);
}

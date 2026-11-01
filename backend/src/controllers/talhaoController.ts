// Beatriz Naomi Ferreira Sasaki - 25016735

import { Request, Response } from 'express';

import {
    criarTalhao,
    excluirTalhao,
    consultarTalhao,
    listarTalhoes,
    atualizarTalhao
} from '../services/talhaoService';

import { responderErro } from '../utils/responderErro';
import { ErroApi } from '../utils/erroApi';

// Tipo de requisição que contém o ID da propriedade autenticada.
type RequestComPropriedade = Request & {
    propriedadeId?: string;
};

// Cadastra um novo talhão.
export async function cadastrarTalhao(req: RequestComPropriedade, res: Response) {
    try {
        const propriedadeId = req.propriedadeId;

        if (!propriedadeId) {
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhao = await criarTalhao(
            propriedadeId,
            req.body ?? {}
        );

        res.status(201).json({
            mensagem: 'Talhão cadastrado com sucesso',
            talhao
        });

    } catch (erro) {
        responderErro(res, erro);
    }
}

// Exclui um talhão.
export async function removerTalhao(req: RequestComPropriedade, res: Response) {
    try {
        const propriedadeId = req.propriedadeId;

        if (!propriedadeId) {
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhaoId = req.params.id;

        if (typeof talhaoId !== 'string' || !talhaoId.trim()) {
            throw new ErroApi(400, 'Identificador de talhão inválido');
        }

        await excluirTalhao(propriedadeId, talhaoId);

        res.status(200).json({
            mensagem: 'Talhão excluído com sucesso'
        });

    } catch (erro) {
        responderErro(res, erro);
    }
}

// Busca um talhão específico.
export async function buscarUmTalhao(req: RequestComPropriedade, res: Response) {
    try {
        const propriedadeId = req.propriedadeId;

        if (!propriedadeId) {
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhaoId = req.params.id;

        if (typeof talhaoId !== 'string' || !talhaoId.trim()) {
            throw new ErroApi(400, 'Identificador de talhão inválido');
        }

        const talhaoBuscado = await consultarTalhao(
            propriedadeId,
            talhaoId
        );

        res.status(200).json({
            mensagem: 'Talhão encontrado com sucesso',
            talhao: talhaoBuscado
        });

    } catch (erro) {
        responderErro(res, erro);
    }
}

// Lista todos os talhões da propriedade autenticada.
export async function consultarTalhoes(req: RequestComPropriedade, res: Response) {
    try {
        const propriedadeId = req.propriedadeId;

        if (!propriedadeId) {
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhoesBuscados = await listarTalhoes(propriedadeId);

        res.status(200).json({
            mensagem: 'Listagem realizada com sucesso',
            talhoes: talhoesBuscados
        });

    } catch (erro) {
        responderErro(res, erro);
    }
}

// Atualiza os dados de um talhão.
export async function editarTalhao(req: RequestComPropriedade, res: Response) {
    try {
        const propriedadeId = req.propriedadeId;

        if (!propriedadeId) {
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhaoId = req.params.id;

        if (typeof talhaoId !== 'string' || !talhaoId.trim()) {
            throw new ErroApi(400, 'Identificador de talhão inválido');
        }

        const talhaoAlterado = await atualizarTalhao(
            propriedadeId,
            talhaoId,
            req.body ?? {}
        );

        res.status(200).json({
            mensagem: 'Talhão atualizado com sucesso',
            talhao: talhaoAlterado
        });

    } catch (erro) {
        responderErro(res, erro);
    }
}

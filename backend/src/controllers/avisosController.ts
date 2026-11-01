
import { Request, Response } from 'express';
import { responderErro } from '../utils/responderErro';
import { ErroApi } from '../utils/erroApi';

import {
    listarAvisos,
    marcarAvisoComoLido,
    marcarTodosAvisosComoLidos
} from '../services/avisosService';

// Consulta todos os avisos da propriedade.
export async function consultarAvisos(req: Request, res: Response) {
    try {
        const propriedadeId = req.propriedadeId;

        if (!propriedadeId) {
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const avisos = await listarAvisos(propriedadeId);

        res.status(200).json({
            mensagem: avisos.length === 0
                ? 'Nenhum aviso encontrado'
                : 'Avisos encontrados com sucesso',
            avisos
        });

    } catch (erro) {
        responderErro(res, erro);
    }
}

// Marca um aviso específico como lido.
export async function atualizarAvisoComoLido(
    req: Request,
    res: Response
) {
    try {
        const propriedadeId = req.propriedadeId;

        if (!propriedadeId) {
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const avisoId = req.params.id;

        if (typeof avisoId !== 'string' || !avisoId) {
            throw new ErroApi(400, 'Identificador do aviso inválido');
        }

        const resultado = await marcarAvisoComoLido(
            propriedadeId,
            avisoId
        );

        res.status(200).json(resultado);

    } catch (erro) {
        responderErro(res, erro);
    }
}

// Marca todos os avisos da propriedade como lidos.
export async function atualizarTodosAvisosComoLidos(
    req: Request,
    res: Response
) {
    try {
        const propriedadeId = req.propriedadeId;

        if (!propriedadeId) {
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const resultado = await marcarTodosAvisosComoLidos(propriedadeId);

        res.status(200).json(resultado);

    } catch (erro) {
        responderErro(res, erro);
    }
}

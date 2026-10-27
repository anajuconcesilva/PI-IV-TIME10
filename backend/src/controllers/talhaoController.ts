// Beatriz Naomi Ferreira Sasaki - 25016735;
import {Request, Response } from 'express';
import { criarTalhao, excluirTalhao, consultarTalhao, listarTalhoes, atualizarTalhao} from '../services/talhaoService';
import { responderErro } from '../utils/responderErro';
import { ErroApi } from '../utils/erroApi';

export async function cadastrarTalhao (req: Request, res:Response){
    try{
        const propriedadeId= req.propriedadeId;

        if(!propriedadeId){
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhao = await criarTalhao(
            propriedadeId,
            req.body ?? {}
        );

        res.status(201).json({
            mensagem: 'Talhão cadastrado com sucesso',
            talhao:talhao
        });

    }catch(erro){
        responderErro(res,erro);
    }
}

export async function removerTalhao (req: Request, res:Response){
    try{
        const propriedadeId= req.propriedadeId;

        if(!propriedadeId){
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhaoId= req.params.id;
        if(typeof talhaoId !== 'string' || !talhaoId){
            throw new ErroApi(400, 'identificador de talhão invalido');
        }

        await excluirTalhao(propriedadeId, talhaoId);
        
        res.status(200).json({mensagem: 'Talhão excluído com sucesso'});

    }catch(erro){
        responderErro(res, erro);
    }
}

export async function buscarUmTalhao(req: Request, res:Response){
    try{
        const propriedadeId= req.propriedadeId;

        if(!propriedadeId){
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhaoId= req.params.id;
        if(typeof talhaoId !== 'string' || !talhaoId){
            throw new ErroApi(400, 'identificador de talhão invalido');
        }

        const talhaoBuscado = await consultarTalhao(propriedadeId, talhaoId);

        res.status(200).json({
            mensagem: 'Talhão encontrado com sucesso',
            talhao:talhaoBuscado
        });

    }catch(erro){
        responderErro(res, erro);
    }
}

export async function consultarTalhoes(req: Request, res:Response){
    try{
        const propriedadeId= req.propriedadeId;

        if(!propriedadeId){
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhoesBuscados = await listarTalhoes(propriedadeId);

        res.status(200).json({
            mensagem: 'Listagem realizada com sucesso',
            talhoes: talhoesBuscados});
    }catch(erro){
        responderErro(res, erro);
    }
}

export async function editarTalhao(req:Request, res:Response){
    try{
        const propriedadeId= req.propriedadeId;

        if(!propriedadeId){
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhaoId= req.params.id;
        if(typeof talhaoId !== 'string' || !talhaoId){
            throw new ErroApi(400, 'identificador de talhão invalido');
        }

        const talhaoAlterado = await atualizarTalhao(propriedadeId, talhaoId, req.body ?? {});

        res.status(200).json({
            mensagem: 'Talhão atualizado com sucesso',
            talhao:talhaoAlterado
        });
    }catch(erro){
        responderErro(res, erro);
    }
}
// Beatriz Naomi Ferreira Sasaki - 25016735;
import {Request, Response } from 'express';
import { responderErro } from '../utils/responderErro';
import { ErroApi } from '../utils/erroApi';
import { listarHistoricoAplicacoes } from '../services/historicoAplicacoesService';

export async function consultarHistoricoAplicacoes(req: Request, res: Response){
    try{
        const propriedadeId= req.propriedadeId;

        if(!propriedadeId){
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const talhaoId= req.params.id;
        if(typeof talhaoId !== 'string' || !talhaoId){
            throw new ErroApi(400, 'identificador de talhão invalido');
        }

        const aplicacoesRealizadas = await listarHistoricoAplicacoes(propriedadeId, talhaoId);

         res.status(200).json({
                mensagem: aplicacoesRealizadas.length === 0
        ? 'Nenhuma aplicação encontrada para este talhão'
        : 'Histórico de aplicações encontrado com sucesso',
            aplicacoes:aplicacoesRealizadas
        });
        
    }catch(erro){
        responderErro(res,erro);
    }
}
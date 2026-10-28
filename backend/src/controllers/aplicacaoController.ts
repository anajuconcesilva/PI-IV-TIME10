// Beatriz Naomi Ferreira Sasaki - 25016735
import { Request, Response} from 'express';
import { criarAplicacao} from '../services/aplicacaoService';
import { responderErro } from '../utils/responderErro';
import { ErroApi } from '../utils/erroApi';

export async function registrarAplicacao(req: Request, res: Response){
    try{
        const propriedadeId= req.propriedadeId;

        if(!propriedadeId){
            throw new ErroApi(401, 'Faça login para continuar');
        }

        const resultado = await criarAplicacao(
            propriedadeId,
            req.body ?? {}
        );

        res.status(201).json({
            mensagem: 'Aplicação registrada com sucesso',
            resultado
        });
    }catch(erro){
        responderErro(res, erro);
    }
}
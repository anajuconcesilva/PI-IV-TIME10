// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Request, Response } from 'express';
import { atualizarConta, obterConta } from '../services/contaService';
import { responderErro } from '../utils/responderErro';
import { ErroApi } from '../utils/erroApi';

export async function consultar(req: Request, res: Response) {
  try {
    if (!req.propriedadeId) {
      throw new ErroApi(401, 'Faça login para continuar');
    }

    res.json(await obterConta(req.propriedadeId));
  } catch (erro) {
    responderErro(res, erro);
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    if (!req.propriedadeId) {
      throw new ErroApi(401, 'Faça login para continuar');
    }

    res.json(await atualizarConta(req.propriedadeId, req.body ?? {}));
  } catch (erro) {
    responderErro(res, erro);
  }
}

// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Request, Response } from 'express';
import { cadastrarPropriedade } from '../services/cadastroService';
import { responderErro } from '../utils/responderErro';

export async function cadastrar(req: Request, res: Response) {
  try {
    const propriedade = await cadastrarPropriedade(req.body ?? {});
    res.status(201).json(propriedade);
  } catch (erro) {
    responderErro(res, erro);
  }
}

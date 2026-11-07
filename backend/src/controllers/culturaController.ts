// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Request, Response } from 'express';
import { listarCulturas } from '../services/culturaService';
import { responderErro } from '../utils/responderErro';

export async function listar(req: Request, res: Response) {
  try {
    res.json(await listarCulturas());
  } catch (erro) {
    responderErro(res, erro);
  }
}

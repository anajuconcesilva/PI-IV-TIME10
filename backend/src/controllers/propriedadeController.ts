// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Request, Response } from 'express';
import { listarPropriedades } from '../services/propriedadeService';
import { responderErro } from '../utils/responderErro';
import { verificarLogin } from '../utils/verificarLogin';

export async function listar(req: Request, res: Response) {
  try {
    const usuarioId = verificarLogin(req);
    res.json(await listarPropriedades(usuarioId));
  } catch (erro) {
    responderErro(res, erro);
  }
}

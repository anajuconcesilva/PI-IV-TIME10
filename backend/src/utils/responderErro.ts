// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Response } from 'express';
import { ErroApi } from './erroApi';

export function responderErro(res: Response, erro: unknown) {
  if (erro instanceof ErroApi) {
    res.status(erro.status).json({ erro: erro.message });
    return;
  }

  console.error(erro);
  res.status(500).json({ erro: 'Erro interno no servidor' });
}

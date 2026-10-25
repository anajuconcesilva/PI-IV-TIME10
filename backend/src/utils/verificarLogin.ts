// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ErroApi } from './erroApi';

export function verificarLogin(req: Request): string {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw new ErroApi(401, 'Faça login para continuar');
  }

  try {
    const dados = jwt.verify(token, env.jwtSecret);
    if (typeof dados === 'string' || typeof dados.id !== 'string') throw new Error();
    return dados.id;
  } catch {
    throw new ErroApi(401, 'Sessão expirada ou inválida. Faça login de novo');
  }
}

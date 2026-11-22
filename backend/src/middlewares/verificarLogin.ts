//Aluna Marília Santos 

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ErroApi } from '../utils/erroApi';
import { responderErro } from '../utils/responderErro';

// Permite usar req.propriedadeId com tipagem nos controllers
declare global {
  namespace Express {
    interface Request {
      propriedadeId?: string;
    }
  }
}

export function verificarLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const cabecalho = req.headers.authorization;

    if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
      throw new ErroApi(401, 'Token não informado');
    }

    const token = cabecalho.slice(7).trim();
    let payload: string | jwt.JwtPayload;

    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new ErroApi(401, 'Token inválido ou expirado');
    }

    if (typeof payload === 'string' || typeof payload.id !== 'string') {
      throw new ErroApi(401, 'Token inválido');
    }

    req.propriedadeId = payload.id;
    next();
  } catch (erro) {
    responderErro(res, erro);
  }
}
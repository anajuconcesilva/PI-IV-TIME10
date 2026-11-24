// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ErroApi } from './erroApi';

// Middleware responsável por verificar se o usuário está autenticado.
export function verificarLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Obtém o token enviado no cabeçalho da requisição.
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');

    // Verifica se o token foi enviado no formato Bearer.
    if (tipo !== 'Bearer' || !token) {
      next(new ErroApi(401, 'Faça login para continuar'));
      return;
    }

    // Verifica se o token é válido utilizando a chave secreta.
    const dados = jwt.verify(token, env.jwtSecret);

    // Confere se os dados do token possuem um ID válido.
    if (typeof dados === 'string' || typeof dados.id !== 'string') {
      next(new ErroApi(401, 'Sessão expirada ou inválida. Faça login de novo'));
      return;
    }

    // Armazena o ID da propriedade para utilização nos controllers.
    (req as Request & { propriedadeId: string }).propriedadeId = dados.id;

    // Permite que a requisição continue para o controller.
    next();

  } catch (erro) {
    // Encaminha erros de autenticação para o tratamento global da API.
    if (erro instanceof ErroApi) {
      next(erro);
      return;
    }

    next(new ErroApi(401, 'Sessão expirada ou inválida. Faça login de novo'));
  }
}


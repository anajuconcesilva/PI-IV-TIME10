// Aluna: Eduarda Prado Deiró | RA: 25004440

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';
import { formatarPropriedade } from './propriedadeService';

export async function fazerLogin(email: unknown, senha: unknown) {
  if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
    throw new ErroApi(400, 'Informe e-mail e senha');
  }

  const propriedade = await obterBanco()
    .collection('propriedades')
    .findOne({ email: email.trim().toLowerCase() });

  if (!propriedade || typeof propriedade.senha !== 'string' || !(await bcrypt.compare(senha, propriedade.senha))) {
    throw new ErroApi(401, 'E-mail ou senha incorretos');
  }

  const token = jwt.sign({ id: propriedade._id.toString() }, env.jwtSecret, { expiresIn: '8h' });

  return { token, propriedade: formatarPropriedade(propriedade) };
}

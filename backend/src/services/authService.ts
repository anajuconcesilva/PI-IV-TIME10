// Aluna: Eduarda Prado Deiró | RA: 25004440

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';

export async function fazerLogin(email: unknown, senha: unknown) {
  if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
    throw new ErroApi(400, 'Informe e-mail e senha');
  }

  const usuario = await obterBanco()
    .collection('usuarios')
    .findOne({ email: email.trim().toLowerCase() });

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    throw new ErroApi(401, 'E-mail ou senha incorretos');
  }

  const token = jwt.sign({ id: usuario._id.toString() }, env.jwtSecret, { expiresIn: '8h' });

  return {
    token,
    usuario: { id: usuario._id.toString(), email: usuario.email },
  };
}

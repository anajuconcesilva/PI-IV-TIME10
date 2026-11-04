// Aluna: Marília Santos 

import { Request, Response } from 'express';
import { solicitarRecuperacao, redefinirSenha } from '../services/recuperacaoSenhaService';
import { responderErro } from '../utils/responderErro';

export async function solicitar(req: Request, res: Response) {
  try {
    const { email } = req.body ?? {};
    res.json(await solicitarRecuperacao(email));
  } catch (erro) {
    responderErro(res, erro);
  }
}

export async function redefinir(req: Request, res: Response) {
  try {
    const { email, codigo, novaSenha } = req.body ?? {};
    res.json(await redefinirSenha(email, codigo, novaSenha));
  } catch (erro) {
    responderErro(res, erro);
  }
}
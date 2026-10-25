// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Request, Response } from 'express';
import { fazerLogin } from '../services/authService';
import { responderErro } from '../utils/responderErro';

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body ?? {};
    res.json(await fazerLogin(email, senha));
  } catch (erro) {
    responderErro(res, erro);
  }
}

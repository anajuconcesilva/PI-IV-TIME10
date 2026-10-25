// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Request, Response } from 'express';
import { cadastrarUsuario } from '../services/usuarioService';
import { responderErro } from '../utils/responderErro';

export async function cadastrar(req: Request, res: Response) {
  try {
    const usuario = await cadastrarUsuario(req.body ?? {});
    res.status(201).json(usuario);
  } catch (erro) {
    responderErro(res, erro);
  }
}

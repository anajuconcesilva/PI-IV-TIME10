// Aluna: Marília Santos 

import { Request, Response } from 'express';
import { registrarColheita, listarColheitas } from '../services/colheitaService';
import { responderErro } from '../utils/responderErro';

export async function registrar(req: Request, res: Response) {
  try {
    res.status(201).json(await registrarColheita(req.propriedadeId as string, req.body ?? {}));
  } catch (erro) {
    responderErro(res, erro);
  }
}

export async function listar(req: Request, res: Response) {
  try {
    res.json(await listarColheitas(req.propriedadeId as string, req.query));
  } catch (erro) {
    responderErro(res, erro);
  }
}
// Aluna: Eduarda Prado Deiró | RA: 25004440
import { listarCulturas, buscarCultura } from '../services/culturaService';
import { Request, Response } from 'express';
import { responderErro } from '../utils/responderErro';


export async function buscarPorId(req: Request, res: Response) {
  try {
    res.json(await buscarCultura(req.params.id));
  } catch (erro) {
    responderErro(res, erro);
  }
}
export async function listar(req: Request, res: Response) {
  try {
    res.json(await listarCulturas());
  } catch (erro) {
    responderErro(res, erro);
  }
}

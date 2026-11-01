// Aluna: Marília Sara Pereira dos Santos
import { Request, Response } from 'express';
import {
  listarClasses as listarClassesService,
  listarCulturas as listarCulturasService,
  buscarProdutos
} from '../services/produtoService';
import { responderErro } from '../utils/responderErro';

export async function listarClasses(req: Request, res: Response) {
  try {
    res.json(await listarClassesService());
  } catch (erro) {
    responderErro(res, erro);
  }
}

export async function listarCulturas(req: Request, res: Response) {
  try {
    res.json(await listarCulturasService());
  } catch (erro) {
    responderErro(res, erro);
  }
}

export async function listarProdutos(req: Request, res: Response) {
  try {
    res.json(await buscarProdutos(req.query));
  } catch (erro) {
    responderErro(res, erro);
  }
}
//Aluna Marília Santos


import { Request, Response } from 'express';
import { listarProdutos, buscarProduto } from '../services/produtoService';
import { responderErro } from '../utils/responderErro';

export async function listar(req: Request, res: Response) {
  try {
    res.json(await listarProdutos(req.query));
  } catch (erro) {
    responderErro(res, erro);
  }
}

export async function buscarPorId(req: Request, res: Response) {
  try {
    res.json(await buscarProduto(req.params.id));
  } catch (erro) {
    responderErro(res, erro);
  }
}
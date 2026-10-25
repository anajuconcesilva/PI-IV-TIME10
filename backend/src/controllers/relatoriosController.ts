// Aluna: Ana Júlia Conceição da Silva | RA: 25002592 -->
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { obterBanco } from "../mongodb";

export async function listarRelatorios(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const banco = obterBanco();

    const filtro: Record<string, unknown> = {};

    const usuarioId = req.query.usuario_id;
    const propriedadeId = req.query.propriedade_id;

    // Filtra pelo usuário, quando informado.
    if (typeof usuarioId === "string") {
      if (!ObjectId.isValid(usuarioId)) {
        res.status(400).json({
          erro: "ID de usuário inválido."
        });
        return;
      }

      filtro.usuario_id = new ObjectId(usuarioId);
    }

    // Filtra pela propriedade, quando informada.
    if (typeof propriedadeId === "string") {
      if (!ObjectId.isValid(propriedadeId)) {
        res.status(400).json({
          erro: "ID de propriedade inválido."
        });
        return;
      }

      filtro.propriedade_id = new ObjectId(propriedadeId);
    }

    const relatorios = await banco
      .collection("relatorios")
      .find(filtro)
      .sort({ data_geracao: -1 })
      .toArray();

    res.status(200).json({
      total: relatorios.length,
      relatorios
    });
  } catch (erro) {
    console.error("Erro ao listar relatórios:", erro);

    res.status(500).json({
      erro: "Não foi possível listar os relatórios."
    });
  }
}
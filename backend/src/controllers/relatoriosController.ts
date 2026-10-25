// Aluna: Ana Júlia Conceição da Silva | RA: 25002592 -->
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { obterBanco } from "../mongodb";
import PDFDocument from "pdfkit";

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

export async function gerarRelatorioPDF(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      propriedade_id,
      periodo_inicial,
      periodo_final,
      talhao_id
    } = req.body;

    // Valida os campos obrigatórios.
    if (
      typeof propriedade_id !== "string" ||
      !ObjectId.isValid(propriedade_id)
    ) {
      res.status(400).json({
        erro: "Informe um ID de propriedade válido."
      });
      return;
    }

    if (!periodo_inicial || !periodo_final) {
      res.status(400).json({
        erro: "Informe o período inicial e final."
      });
      return;
    }

    const dataInicial = new Date(periodo_inicial);
    const dataFinal = new Date(periodo_final);

    if (
      Number.isNaN(dataInicial.getTime()) ||
      Number.isNaN(dataFinal.getTime()) ||
      dataInicial > dataFinal
    ) {
      res.status(400).json({
        erro: "O período informado é inválido."
      });
      return;
    }

    if (
      talhao_id !== undefined &&
      (typeof talhao_id !== "string" || !ObjectId.isValid(talhao_id))
    ) {
      res.status(400).json({
        erro: "O ID do talhão é inválido."
      });
      return;
    }

    const banco = obterBanco();
    const propriedadeObjectId = new ObjectId(propriedade_id);

    // Busca a propriedade e os talhões que estão dentro dela.
    const propriedade = await banco
      .collection("propriedades")
      .findOne({ _id: propriedadeObjectId });

    if (!propriedade) {
      res.status(404).json({
        erro: "Propriedade não encontrada."
      });
      return;
    }

    // Busca aplicações dentro do período selecionado.
    const filtroAplicacoes: Record<string, unknown> = {
      propriedade_id: propriedadeObjectId,
      data_aplicacao: {
        $gte: dataInicial,
        $lte: dataFinal
      }
    };

    if (talhao_id) {
      filtroAplicacoes.talhao_id = new ObjectId(talhao_id);
    }

    const aplicacoes = await banco
      .collection("aplicacoes")
      .find(filtroAplicacoes)
      .sort({ data_aplicacao: 1 })
      .toArray();

    // Monta o conteúdo do PDF em memória.
    const documento = new PDFDocument({ margin: 50 });
    const partes: Buffer[] = [];

    documento.on("data", (parte: Buffer) => {
      partes.push(parte);
    });

    const pdfPronto = new Promise<Buffer>((resolve, reject) => {
      documento.on("end", () => resolve(Buffer.concat(partes)));
      documento.on("error", reject);
    });

    documento
      .fontSize(20)
      .text("Minha Colheita", { align: "center" });

    documento.moveDown();
    documento
      .fontSize(16)
      .text("Relatório de aplicações", { align: "center" });

    documento.moveDown();
    documento.fontSize(11);

    documento.text(`Propriedade: ${propriedade.nome}`);
    documento.text(
      `Período: ${dataInicial.toLocaleDateString("pt-BR")} a ${dataFinal.toLocaleDateString("pt-BR")}`
    );

    documento.text(`Total de aplicações: ${aplicacoes.length}`);
    documento.moveDown();

    if (aplicacoes.length === 0) {
      documento.text(
        "Nenhuma aplicação foi encontrada para os filtros selecionados."
      );
    }

    for (const aplicacao of aplicacoes) {
      const talhao = (propriedade.talhoes ?? []).find(
        (item: { talhao_id: ObjectId; nome: string }) =>
          item.talhao_id.toString() === aplicacao.talhao_id.toString()
      );

      const produto = await banco
        .collection("produtos")
        .findOne({ _id: aplicacao.produto_id });

      // Abre uma nova página se não houver espaço suficiente.
      if (documento.y > 680) {
        documento.addPage();
      }

      documento
        .fontSize(12)
        .text(`Aplicação ${aplicacoes.indexOf(aplicacao) + 1}`, {
          underline: true
        });

      documento.fontSize(10);
      documento.text(
        `Data: ${new Date(aplicacao.data_aplicacao).toLocaleDateString("pt-BR")}`
      );
      documento.text(`Talhão: ${talhao?.nome ?? "Não identificado"}`);
      documento.text(
        `Produto: ${
          produto?.nome ??
          produto?.nome_comercial ??
          produto?.ingrediente_ativo ??
          "Não identificado"
        }`
      );
      documento.text(`Dosagem: ${aplicacao.dosagem ?? "Não informada"}`);
      documento.text(
        `Responsável: ${aplicacao.responsavel ?? "Não informado"}`
      );
      documento.text(
        `Período de carência: ${aplicacao.periodo_carencia ?? "Não informado"} dias`
      );
      documento.text(
        `Liberação da colheita: ${
          aplicacao.data_liberacao_colheita
            ? new Date(aplicacao.data_liberacao_colheita).toLocaleDateString("pt-BR")
            : "Não informada"
        }`
      );

      if (aplicacao.observacoes) {
        documento.text(`Observações: ${aplicacao.observacoes}`);
      }

      documento.moveDown();
    }

    documento.end();

    const pdfBuffer = await pdfPronto;

    // Salva os metadados do relatório gerado.
    const resultado = await banco.collection("relatorios").insertOne({
      usuario_id: propriedade.usuario_id,
      propriedade_id: propriedadeObjectId,
      data_geracao: new Date(),
      conteudo: `Relatório de aplicações da propriedade ${propriedade.nome}`,
      tipo: "aplicacoes",
      periodo_inicial: dataInicial,
      periodo_final: dataFinal
    });

    // Devolve o PDF para quem fez a requisição.
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="relatorio-aplicacoes.pdf"'
    );
    res.setHeader("X-Relatorio-Id", resultado.insertedId.toString());

    res.status(200).send(pdfBuffer);
  } catch (erro) {
    console.error("Erro ao gerar relatório PDF:", erro);

    if (!res.headersSent) {
      res.status(500).json({
        erro: "Não foi possível gerar o relatório PDF."
      });
    }
  }
}

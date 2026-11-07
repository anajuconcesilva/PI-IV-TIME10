// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { obterBanco } from "../mongodb";
import PDFDocument from "pdfkit";

type DadosRelatorio = {
  propriedade_id: ObjectId;
  periodo_inicial: Date;
  periodo_final: Date;
  talhao_id?: ObjectId;
};

// Converte o identificador autenticado para ObjectId.
function obterPropriedadeAutenticada(req: Request): ObjectId | null {
  const propriedadeId = req.propriedadeId;

  if (
    typeof propriedadeId !== "string" ||
    !ObjectId.isValid(propriedadeId)
  ) {
    return null;
  }

  return new ObjectId(propriedadeId);
}

// Valida as datas e monta os filtros do relatório.
function validarPeriodo(
  periodoInicial: unknown,
  periodoFinal: unknown
): { dataInicial: Date; dataFinal: Date } | null {
  if (
    typeof periodoInicial !== "string" ||
    typeof periodoFinal !== "string"
  ) {
    return null;
  }

  const dataInicial = new Date(periodoInicial);
  const dataFinal = new Date(periodoFinal);

  if (
    Number.isNaN(dataInicial.getTime()) ||
    Number.isNaN(dataFinal.getTime()) ||
    dataInicial > dataFinal
  ) {
    return null;
  }

  return { dataInicial, dataFinal };
}

// Gera o PDF a partir das aplicações encontradas.
async function criarPDF(
  propriedade: any,
  aplicacoes: any[],
  dataInicial: Date,
  dataFinal: Date
): Promise<Buffer> {
  const banco = obterBanco();
  const documento = new PDFDocument({ margin: 50 });
  const partes: Buffer[] = [];

  documento.on("data", (parte: Buffer) => {
    partes.push(parte);
  });

  const pdfPronto = new Promise<Buffer>((resolve, reject) => {
    documento.on("end", () => {
      resolve(Buffer.concat(partes));
    });

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

  documento.text(`Propriedade: ${propriedade.nome ?? "Não identificada"}`);
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

  for (let i = 0; i < aplicacoes.length; i++) {
    const aplicacao = aplicacoes[i];

    const talhao = (propriedade.talhoes ?? []).find(
      (item: { talhao_id: ObjectId; nome: string }) =>
        item.talhao_id.toString() ===
        aplicacao.talhao_id?.toString()
    );

    const produto = aplicacao.produto_id
      ? await banco.collection("produtos").findOne({
          _id: aplicacao.produto_id
        })
      : null;

    if (documento.y > 680) {
      documento.addPage();
    }

    documento
      .fontSize(12)
      .text(`Aplicação ${i + 1}`, { underline: true });

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
    documento.text(`Responsável: ${aplicacao.responsavel ?? "Não informado"}`);

    documento.text(
      `Período de carência: ${aplicacao.periodo_carencia ?? "Não informado"} dias`
    );

    documento.text(
      `Liberação da colheita: ${
        aplicacao.data_liberacao_colheita
          ? new Date(
              aplicacao.data_liberacao_colheita
            ).toLocaleDateString("pt-BR")
          : "Não informada"
      }`
    );

    if (aplicacao.observacoes) {
      documento.text(`Observações: ${aplicacao.observacoes}`);
    }

    documento.moveDown();
  }

  documento.end();

  return pdfPronto;
}

// Lista apenas os relatórios da propriedade autenticada.
export async function listarRelatorios(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const propriedadeObjectId = obterPropriedadeAutenticada(req);

    if (!propriedadeObjectId) {
      res.status(401).json({
        erro: "Propriedade não autenticada."
      });
      return;
    }

    const banco = obterBanco();

    const relatorios = await banco
      .collection("relatorios")
      .find({
        propriedade_id: propriedadeObjectId
      })
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

// Gera um PDF e salva os metadados no MongoDB.
export async function gerarRelatorioPDF(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const propriedadeObjectId = obterPropriedadeAutenticada(req);

    if (!propriedadeObjectId) {
      res.status(401).json({
        erro: "Propriedade não autenticada."
      });
      return;
    }

    const { periodo_inicial, periodo_final, talhao_id } = req.body ?? {};

    const periodo = validarPeriodo(periodo_inicial, periodo_final);

    if (!periodo) {
      res.status(400).json({
        erro: "Informe um período válido, com data inicial anterior ou igual à final."
      });
      return;
    }

    let talhaoObjectId: ObjectId | undefined;

    if (talhao_id !== undefined && talhao_id !== "todos") {
      if (
        typeof talhao_id !== "string" ||
        !ObjectId.isValid(talhao_id)
      ) {
        res.status(400).json({
          erro: "O ID do talhão é inválido."
        });
        return;
      }

      talhaoObjectId = new ObjectId(talhao_id);
    }

    const { dataInicial, dataFinal } = periodo;
    const banco = obterBanco();

    // Busca a propriedade determinada pelo token.
    const propriedade = await banco
      .collection("propriedades")
      .findOne({ _id: propriedadeObjectId });

    if (!propriedade) {
      res.status(404).json({
        erro: "Propriedade não encontrada."
      });
      return;
    }

    // Confere se o talhão selecionado pertence à propriedade.
    if (talhaoObjectId) {
      const talhaoExiste = (propriedade.talhoes ?? []).some(
        (item: { talhao_id: ObjectId }) =>
          item.talhao_id?.toString() === talhaoObjectId!.toString()
      );

      if (!talhaoExiste) {
        res.status(404).json({
          erro: "O talhão não pertence à propriedade autenticada."
        });
        return;
      }
    }

    const filtroAplicacoes: Record<string, unknown> = {
      propriedade_id: propriedadeObjectId,
      data_aplicacao: {
        $gte: dataInicial,
        $lte: dataFinal
      }
    };

    if (talhaoObjectId) {
      filtroAplicacoes.talhao_id = talhaoObjectId;
    }

    const aplicacoes = await banco
      .collection("aplicacoes")
      .find(filtroAplicacoes)
      .sort({ data_aplicacao: 1 })
      .toArray();

    const pdfBuffer = await criarPDF(
      propriedade,
      aplicacoes,
      dataInicial,
      dataFinal
    );

    const dadosRelatorio: DadosRelatorio = {
      propriedade_id: propriedadeObjectId,
      periodo_inicial: dataInicial,
      periodo_final: dataFinal
    };

    if (talhaoObjectId) {
      dadosRelatorio.talhao_id = talhaoObjectId;
    }

    const resultado = await banco.collection("relatorios").insertOne({
      ...dadosRelatorio,
      data_geracao: new Date(),
      conteudo: `Relatório de aplicações da propriedade ${propriedade.nome ?? ""}`,
      tipo: "aplicacoes"
    });

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

// Baixa novamente um relatório salvo no histórico.
export async function baixarRelatorioPDF(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const propriedadeObjectId = obterPropriedadeAutenticada(req);

    if (!propriedadeObjectId) {
      res.status(401).json({
        erro: "Propriedade não autenticada."
      });
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        erro: "ID de relatório inválido."
      });
      return;
    }

    const banco = obterBanco();
    const relatorioId = new ObjectId(id);

    // O filtro impede que outra propriedade acesse esse relatório.
    const relatorio = await banco.collection("relatorios").findOne({
      _id: relatorioId,
      propriedade_id: propriedadeObjectId
    });

    if (!relatorio) {
      res.status(404).json({
        erro: "Relatório não encontrado para esta propriedade."
      });
      return;
    }

    const propriedade = await banco
      .collection("propriedades")
      .findOne({ _id: propriedadeObjectId });

    if (!propriedade) {
      res.status(404).json({
        erro: "A propriedade deste relatório não foi encontrada."
      });
      return;
    }

    const periodo = validarPeriodo(
      new Date(relatorio.periodo_inicial).toISOString(),
      new Date(relatorio.periodo_final).toISOString()
    );

    if (!periodo) {
      res.status(400).json({
        erro: "O período salvo para este relatório é inválido."
      });
      return;
    }

    const { dataInicial, dataFinal } = periodo;

    const filtroAplicacoes: Record<string, unknown> = {
      propriedade_id: propriedadeObjectId,
      data_aplicacao: {
        $gte: dataInicial,
        $lte: dataFinal
      }
    };

    // Preserva o filtro de talhão do relatório original.
    if (relatorio.talhao_id) {
      filtroAplicacoes.talhao_id = relatorio.talhao_id;
    }

    const aplicacoes = await banco
      .collection("aplicacoes")
      .find(filtroAplicacoes)
      .sort({ data_aplicacao: 1 })
      .toArray();

    const pdfBuffer = await criarPDF(
      propriedade,
      aplicacoes,
      dataInicial,
      dataFinal
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="relatorio-aplicacoes.pdf"'
    );

    res.status(200).send(pdfBuffer);
  } catch (erro) {
    console.error("Erro ao baixar relatório PDF:", erro);

    if (!res.headersSent) {
      res.status(500).json({
        erro: "Não foi possível recuperar o relatório PDF."
      });
    }
  }
}
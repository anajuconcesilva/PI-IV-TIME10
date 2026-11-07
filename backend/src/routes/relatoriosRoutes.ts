// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import { Router } from "express";

import {
  listarRelatorios,
  gerarRelatorioPDF,
  baixarRelatorioPDF
} from "../controllers/relatoriosController";

import { verificarLogin } from "../middlewares/verificarLogin";

const router = Router();

// Lista somente os relatórios da propriedade autenticada.
router.get(
  "/relatorios",
  verificarLogin,
  listarRelatorios
);

// Gera um relatório para a propriedade autenticada.
router.post(
  "/relatorios/gerar",
  verificarLogin,
  gerarRelatorioPDF
);

// Baixa um relatório pertencente à propriedade autenticada.
router.get(
  "/relatorios/:id/pdf",
  verificarLogin,
  baixarRelatorioPDF
);

export default router;
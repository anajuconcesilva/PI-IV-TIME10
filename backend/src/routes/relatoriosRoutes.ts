// Aluna: Ana Júlia Conceição da Silva | RA: 25002592 -->
import { Router } from "express";

import {
  listarRelatorios,
  gerarRelatorioPDF,
  baixarRelatorioPDF
} from "../controllers/relatoriosController";

const router = Router();

router.get("/relatorios", listarRelatorios);

router.post("/relatorios/gerar", gerarRelatorioPDF);

router.get("/relatorios/:id/pdf", baixarRelatorioPDF);

export default router;

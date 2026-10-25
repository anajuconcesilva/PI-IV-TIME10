
import { Router } from "express";

import {
  listarRelatorios,
  gerarRelatorioPDF
} from "../controllers/relatoriosController";

const router = Router();

router.get("/relatorios", listarRelatorios);
router.post("/relatorios/gerar", gerarRelatorioPDF);

export default router;
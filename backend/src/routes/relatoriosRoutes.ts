// Aluna: Ana Júlia Conceição da Silva | RA: 25002592 -->

import { Router } from "express";
import { listarRelatorios } from "../controllers/relatoriosController";

const router = Router();

router.get("/relatorios", listarRelatorios);

export default router;

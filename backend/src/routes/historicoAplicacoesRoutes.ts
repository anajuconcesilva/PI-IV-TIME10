// Beatriz Naomi Ferreira Sasaki - 25016735;
import { Router } from "express";
import { verificarLogin } from "../middlewares/verificarLogin";
import { consultarHistoricoAplicacoes } from "../controllers/historicoAplicacoesController";

const router= Router();

router.get('/consultarAplicacoes/:id', verificarLogin, consultarHistoricoAplicacoes);
export default router;
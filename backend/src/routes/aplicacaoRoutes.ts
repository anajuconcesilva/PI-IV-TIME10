import { Router } from "express";
import { verificarLogin } from "../middlewares/verificarLogin";
import { registrarAplicacao } from "../controllers/aplicacaoController";

const router = Router();
router.post('/registrarAplicacao/:id', verificarLogin, registrarAplicacao);

export default router;
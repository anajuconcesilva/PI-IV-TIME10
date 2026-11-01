// Beatriz Naomi Ferreira Sasaki - 25016735
import { Router } from "express";
import { verificarLogin } from "../middlewares/verificarLogin";
import { registrarAplicacao } from "../controllers/aplicacaoController";

const router = Router();

router.post('/registrarAplicacao', verificarLogin, registrarAplicacao);

export default router;
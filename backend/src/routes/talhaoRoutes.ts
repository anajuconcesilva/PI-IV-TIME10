// Beatriz Naomi Ferreira Sasaki - 25016735

import { Router } from "express";
import { buscarUmTalhao, cadastrarTalhao, removerTalhao, consultarTalhoes, editarTalhao} from "../controllers/talhaoController";
import { verificarLogin } from "../middlewares/verificarLogin";

const router = Router();

router.post('/cadastroTalhao', verificarLogin, cadastrarTalhao);
router.delete('/removerTalhao/:id', verificarLogin, removerTalhao );
router.get('/buscarTalhao/:id', verificarLogin, buscarUmTalhao);
router.get('/consultarTalhoes', verificarLogin, consultarTalhoes);
router.put('/editarTalhao/:id', verificarLogin, editarTalhao);

export default router;
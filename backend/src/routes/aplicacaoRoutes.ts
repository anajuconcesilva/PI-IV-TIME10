// Beatriz Naomi Ferreira Sasaki - 25016735
import { Router } from 'express';

import { verificarLogin } from '../middlewares/verificarLogin';

import {
    registrarAplicacao,
    consultarAplicacoesDashboard
} from '../controllers/aplicacaoController';

const router = Router();

// Cadastro de aplicação.
router.post(
    '/registrarAplicacao',
    verificarLogin,
    registrarAplicacao
);

// Consulta das aplicações para o Dashboard.
router.get(
    '/consultarAplicacoesDashboard',
    verificarLogin,
    consultarAplicacoesDashboard
);

export default router;
// Aluna: Ana Júlia Conceição da Silva | RA: 25002592

import { Router } from 'express';
import { verificarLogin } from '../middlewares/verificarLogin';

import {
    consultarAvisos,
    atualizarAvisoComoLido,
    atualizarTodosAvisosComoLidos
} from '../controllers/avisosController';

const router = Router();

router.get('/avisos', verificarLogin, consultarAvisos);

router.patch('/avisos/:id/lido', verificarLogin, atualizarAvisoComoLido);

router.patch(
    '/avisos/marcar-todos-lidos',
    verificarLogin,
    atualizarTodosAvisosComoLidos
);

export default router;

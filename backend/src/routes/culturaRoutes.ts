// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Router } from 'express';
import { listar, buscarPorId } from '../controllers/culturaController';

const router = Router();

router.get('/culturas', listar);
router.get('/culturas/:id', buscarPorId);

export default router;

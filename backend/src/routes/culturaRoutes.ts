// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Router } from 'express';
import { listar } from '../controllers/culturaController';

const router = Router();

router.get('/culturas', listar);

export default router;

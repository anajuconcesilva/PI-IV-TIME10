// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Router } from 'express';
import { listar } from '../controllers/propriedadeController';

const router = Router();

router.get('/propriedades', listar);

export default router;

// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Router } from 'express';
import { cadastrar } from '../controllers/cadastroController';

const router = Router();

router.post('/usuarios', cadastrar);

export default router;

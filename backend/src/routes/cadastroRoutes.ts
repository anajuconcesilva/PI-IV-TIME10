// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Router } from 'express';
import { cadastrar } from '../controllers/cadastroController';

const router = Router();

router.post('/cadastro', cadastrar);

export default router;

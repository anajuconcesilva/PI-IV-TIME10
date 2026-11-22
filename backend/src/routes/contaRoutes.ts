// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Router } from 'express';
import { verificarLogin } from '../middlewares/verificarLogin';
import { atualizar, consultar } from '../controllers/contaController';

const router = Router();

router.get('/minhaConta', verificarLogin, consultar);
router.put('/minhaConta', verificarLogin, atualizar);

export default router;

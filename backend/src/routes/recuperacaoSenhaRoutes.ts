// Aluna: Marília Santos

import { Router } from 'express';
import { solicitar, redefinir } from '../controllers/recuperacaoSenhaController';

const router = Router();

router.post('/auth/recuperar-senha', solicitar);
router.post('/auth/redefinir-senha', redefinir);

export default router;
// Aluna: Marília Santos

import { Router } from 'express';
import { verificarLogin } from '../middlewares/verificarLogin';
import { registrar, listar } from '../controllers/colheitaController';

const router = Router();

router.post('/colheitas', verificarLogin, registrar);
router.get('/colheitas', verificarLogin, listar);

export default router;
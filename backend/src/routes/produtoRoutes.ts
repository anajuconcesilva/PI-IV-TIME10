//Aluna Marília Santos

import { Router } from 'express';
import { listar, buscarPorId } from '../controllers/produtoController';

const router = Router();

router.get('/produtos', listar);
router.get('/produtos/:id', buscarPorId);

export default router;
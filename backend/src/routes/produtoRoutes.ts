// Aluna: Marília Sara Pereira dos Santos
import { Router } from 'express';
import { listarClasses, listarCulturas, listarProdutos } from '../controllers/produtoController';

const router = Router();

router.get('/classes', listarClasses);
router.get('/culturas', listarCulturas);
router.get('/produtos', listarProdutos);

export default router;
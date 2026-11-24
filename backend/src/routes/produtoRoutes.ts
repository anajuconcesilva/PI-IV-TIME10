// Aluna: Marília Sara Pereira dos Santos
import { Router } from 'express';
import { listarClasses, listarProdutos } from '../controllers/produtoController';

const router = Router();

router.get('/classes', listarClasses);
router.get('/produtos', listarProdutos);

export default router;
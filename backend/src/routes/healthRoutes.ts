import { Router } from 'express';
import { verificarSaude } from '../controllers/healthController';

const router = Router();

router.get('/health', verificarSaude);

export default router;

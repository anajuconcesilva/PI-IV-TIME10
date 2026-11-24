// Aluna: Eduarda Prado Deiró | RA: 25004440

import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

router.post('/auth/login', login);

export default router;

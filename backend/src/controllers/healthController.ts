// Aluna: Eduarda Prado Deiró | RA: 25004440
import { Request, Response } from 'express';

export function verificarSaude(req: Request, res: Response) {
  res.json({ status: 'ok' });
}

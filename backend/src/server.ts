import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import healthRoutes from './routes/healthRoutes';

const app = express();

// Libera o front a chamar a API e faz o Express entender JSON
app.use(cors());
app.use(express.json());

app.use(healthRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.listen(env.port, () => {
  console.log(`API rodando em http://localhost:${env.port}`);
});

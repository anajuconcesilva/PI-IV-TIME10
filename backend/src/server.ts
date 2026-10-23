import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import healthRoutes from './routes/healthRoutes';
import { conectarBanco } from './mongodb';

const app = express();

// Libera o front a chamar a API e faz o Express entender JSON
app.use(cors());
app.use(express.json());

app.use(healthRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});


async function iniciarAPI(){
  try{
    await conectarBanco();
    app.listen(env.port, () => {
    console.log(`API rodando em http://localhost:${env.port}`);
    });

  }catch (error){
    console.error('Falha ao iniciar a API: ', error);
    process.exitCode = 1;
  }
}

iniciarAPI();


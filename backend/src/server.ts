
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import healthRoutes from './routes/healthRoutes';
import cadastroRoutes from './routes/cadastroRoutes';
import culturaRoutes from './routes/culturaRoutes';
import authRoutes from './routes/authRoutes';
import relatoriosRoutes from './routes/relatoriosRoutes';
import { conectarBanco } from './mongodb';
import { ErroApi } from './utils/erroApi';
import { responderErro } from './utils/responderErro';
import recuperacaoSenhaRoutes from './routes/recuperacaoSenhaRoutes';   // novo

const app = express();

// Libera o front a chamar a API e faz o Express entender JSON
app.use(cors());
app.use(express.json());

// Rotas da API
app.use(healthRoutes);
app.use(cadastroRoutes);
app.use(culturaRoutes);
app.use(authRoutes);
app.use(relatoriosRoutes);
app.use(authRoutes);
app.use(recuperacaoSenhaRoutes); 

// Resposta para rotas inexistentes
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento centralizado de erros
app.use(
  (
    erro: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    responderErro(
      res,
      erro instanceof SyntaxError
        ? new ErroApi(400, 'JSON inválido')
        : erro
    );
  }
);

async function iniciarAPI() {
  try {
    await conectarBanco();

    app.listen(env.port, () => {
      console.log(`API rodando em http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar a API: ', error);
    process.exitCode = 1;
  }
}

iniciarAPI();

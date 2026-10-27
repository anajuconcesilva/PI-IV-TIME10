// Aluna: Marília Santos 

import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { obterBanco } from '../mongodb';
import { ErroApi } from '../utils/erroApi';
import { enviarEmail } from './emailService';

const VALIDADE_MINUTOS = 20;
const MAX_TENTATIVAS = 5;

function normalizarEmail(email: unknown) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new ErroApi(400, 'Informe um e-mail válido');
  }
  return email.trim().toLowerCase();
}

export async function solicitarRecuperacao(email: unknown) {
  const emailNormalizado = normalizarEmail(email);
  const banco = obterBanco();

  const propriedade = await banco.collection('propriedades').findOne({ email: emailNormalizado });

  if (propriedade) {
    const codigo = String(randomInt(100000, 1000000));

    await banco.collection('recuperacoes_senha').updateOne(
      { email: emailNormalizado },
      {
        $set: {
          codigoHash: await bcrypt.hash(codigo, 10),
          expiraEm: new Date(Date.now() + VALIDADE_MINUTOS * 60 * 1000),
          tentativas: 0,
        },
      },
      { upsert: true }
    );

    try {
      await enviarEmail(
        emailNormalizado,
        'Código para redefinir sua senha',
        `Seu código é ${codigo}. Ele vale por ${VALIDADE_MINUTOS} minutos. Se não foi você, ignore este e-mail.`
      );
    } catch (erro) {
      // não revela ao cliente se o e-mail existe
      console.error('Falha ao enviar e-mail de recuperação:', erro);
    }
  }

  return { mensagem: 'Se o e-mail estiver cadastrado, você receberá um código em instantes' };
}

export async function redefinirSenha(email: unknown, codigo: unknown, novaSenha: unknown) {
  const emailNormalizado = normalizarEmail(email);

  if (typeof codigo !== 'string' || !/^\d{6}$/.test(codigo.trim())) {
    throw new ErroApi(400, 'Informe o código de 6 números');
  }
  // mesma regra do cadastro; troque pelo validador de senha do projeto, se houver
  if (typeof novaSenha !== 'string' || novaSenha.length < 6) {
    throw new ErroApi(400, 'A senha precisa ter pelo menos 6 caracteres');
  }

  const banco = obterBanco();
  const recuperacoes = banco.collection('recuperacoes_senha');
  const registro = await recuperacoes.findOne({ email: emailNormalizado });
  const codigoInvalido = new ErroApi(400, 'Código inválido ou expirado');

  if (!registro) throw codigoInvalido;

  if (registro.expiraEm < new Date()) {
    await recuperacoes.deleteOne({ email: emailNormalizado });
    throw codigoInvalido;
  }

  if (!(await bcrypt.compare(codigo.trim(), registro.codigoHash))) {
    if (registro.tentativas + 1 >= MAX_TENTATIVAS) {
      await recuperacoes.deleteOne({ email: emailNormalizado });
    } else {
      await recuperacoes.updateOne({ email: emailNormalizado }, { $inc: { tentativas: 1 } });
    }
    throw codigoInvalido;
  }

  await banco
    .collection('propriedades')
    .updateOne({ email: emailNormalizado }, { $set: { senha: await bcrypt.hash(novaSenha, 10) } });
  await recuperacoes.deleteOne({ email: emailNormalizado });

  return { mensagem: 'Senha redefinida com sucesso' };
}
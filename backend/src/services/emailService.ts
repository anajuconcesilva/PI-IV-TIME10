// Aluna: Marília Santos 

import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Sem SMTP configurado, mostra o e-mail no terminal (útil para testar localmente)
export async function enviarEmail(para: string, assunto: string, texto: string) {
  if (!env.smtpHost) {
    console.log(`[e-mail simulado] Para: ${para}\nAssunto: ${assunto}\n${texto}`);
    return;
  }

  const transporte = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });

  await transporte.sendMail({
    from: env.emailFrom || env.smtpUser,
    to: para,
    subject: assunto,
    text: texto,
  });
}
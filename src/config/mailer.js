import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

/**
 * Indica se as variáveis de SMTP foram configuradas no .env.
 * Se qualquer uma delas estiver vazia, consideramos o SMTP como "não configurado"
 * e o Magic Link será apenas exibido no console (modo de desenvolvimento/demonstração).
 */
export const isSmtpConfigured = Boolean(
  SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD
);

/**
 * Transporter do nodemailer.
 * Só é criado de fato se o SMTP estiver configurado, evitando erros
 * de inicialização quando o projeto é executado apenas para demonstração.
 */
export const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true para porta 465, false para as demais
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    })
  : null;

/**
 * Envia o email contendo o Magic Link.
 * Caso o SMTP não esteja configurado, o link é apenas exibido no console,
 * permitindo testar o fluxo completo sem depender de um servidor de email real.
 *
 * @param {string} to - email do destinatário
 * @param {string} magicLink - URL completa do magic link
 */
export async function sendMagicLinkEmail(to, magicLink) {
  const messageText = [
    "Olá!",
    "",
    "Clique no link abaixo para entrar na aplicação:",
    "",
    magicLink,
    "",
    "Esse link expira em 10 minutos.",
  ].join("\n");

  // Modo demonstração: sem SMTP configurado, apenas exibe o link no console.
  if (!isSmtpConfigured) {
    console.log("================================================");
    console.log("MAGIC LINK (modo desenvolvimento - SMTP não configurado)");
    console.log(magicLink);
    console.log("================================================");
    return;
  }

  // Modo produção/real: envia o email de fato via SMTP.
  await transporter.sendMail({
    from: SMTP_USER,
    to,
    subject: "Seu link de acesso (Magic Link)",
    text: messageText,
  });

  console.log(`Magic Link enviado por email para: ${to}`);
}

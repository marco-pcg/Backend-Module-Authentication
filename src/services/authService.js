import crypto from "crypto";
import jwt from "jsonwebtoken";
import { findOrCreateUser, users } from "../database/users.js";
import { sendMagicLinkEmail } from "../config/mailer.js";

const { JWT_SECRET, MAGIC_LINK_SECRET, APP_URL } = process.env;

// Validade do Magic Token: 10 minutos (em milissegundos)
const MAGIC_TOKEN_EXPIRATION_MS = 10 * 60 * 1000;

// Validade do JWT da aplicação
const JWT_EXPIRATION = "1h";

/**
 * Gera um token aleatório e seguro para ser usado como Magic Token.
 * Optamos por um token aleatório (não um JWT) para deixar claro,
 * de forma didática, que Magic Token e JWT são conceitos diferentes.
 *
 * O MAGIC_LINK_SECRET é usado para "temperar" o token antes do hash,
 * dificultando que alguém adivinhe tokens válidos.
 *
 * @returns {string} token em formato hexadecimal
 */
function generateMagicToken() {
  const randomPart = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(randomPart + MAGIC_LINK_SECRET)
    .digest("hex");

  return hash;
}

/**
 * Passo 1 do fluxo: solicita o Magic Link.
 * - encontra ou cria o usuário pelo email;
 * - gera um novo Magic Token com expiração de 10 minutos;
 * - salva o token no usuário;
 * - monta a URL do link e envia por email (ou exibe no console).
 *
 * @param {string} email
 */
export async function requestMagicLink(email) {
  const user = findOrCreateUser(email);

  const magicToken = generateMagicToken();
  const expiresAt = Date.now() + MAGIC_TOKEN_EXPIRATION_MS;

  user.magicToken = magicToken;
  user.magicTokenExpiresAt = expiresAt;

  const magicLink = `${APP_URL}/auth/verify?token=${magicToken}`;

  await sendMagicLinkEmail(user.email, magicLink);
}

/**
 * Erros de negócio conhecidos, usados para que o controller
 * saiba qual status HTTP retornar.
 */
export class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

/**
 * Passo 2 do fluxo: verifica o Magic Token recebido via querystring.
 * - localiza o usuário dono do token;
 * - verifica se o token não expirou;
 * - invalida o token (uso único);
 * - gera o JWT da aplicação.
 *
 * @param {string} token
 * @returns {{ user: { id: number, email: string }, jwtToken: string }}
 */
export function verifyMagicLink(token) {
  if (!token) {
    throw new AuthError("Token não informado.", 400);
  }

  const user = findUserWithMagicToken(token);

  if (!user) {
    throw new AuthError("Token inválido.", 400);
  }

  if (!user.magicTokenExpiresAt || Date.now() > user.magicTokenExpiresAt) {
    // Limpa o token expirado para não deixar "lixo" no usuário
    user.magicToken = null;
    user.magicTokenExpiresAt = null;
    throw new AuthError("Token expirado. Solicite um novo link.", 401);
  }

  // Invalida o Magic Link imediatamente, garantindo uso único
  user.magicToken = null;
  user.magicTokenExpiresAt = null;

  const jwtToken = generateJwt(user);

  return {
    user: { id: user.id, email: user.email },
    jwtToken,
  };
}

/**
 * Busca, entre todos os usuários, aquele que possui o Magic Token informado.
 * @param {string} token
 * @returns {object | undefined}
 */
function findUserWithMagicToken(token) {
  return users.find((user) => user.magicToken === token);
}

/**
 * Gera o JWT da aplicação para o usuário autenticado.
 * @param {{ id: number, email: string }} user
 * @returns {string} JWT assinado
 */
function generateJwt(user) {
  const payload = {
    sub: user.id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Valida um JWT da aplicação.
 * @param {string} token
 * @returns {object} payload decodificado
 */
export function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}

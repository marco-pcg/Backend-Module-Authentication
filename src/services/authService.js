import jwt from "jsonwebtoken";
import { findUserByGoogleId, createUser } from "../database/users.js";

/**
 * Busca um usuário existente pelo googleId ou cria um novo caso
 * ainda não exista na base em memória.
 *
 * @param {{ googleId: string, name: string, email: string, picture: string }} profileData
 * @returns {object} usuário (existente ou recém-criado)
 */
function findOrCreateUser(profileData) {
  const { googleId, name, email, picture } = profileData;

  if (!googleId) {
    throw new Error("googleId não informado pelo Google.");
  }

  let user = findUserByGoogleId(googleId);

  if (!user) {
    user = createUser({ googleId, name, email, picture });
  }

  return user;
}

/**
 * Gera um JWT próprio da aplicação para o usuário autenticado.
 *
 * @param {object} user
 * @returns {string} token JWT assinado
 */
function generateToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET não configurado. Verifique o arquivo .env."
    );
  }

  const payload = {
    sub: user.id,
    googleId: user.googleId,
    email: user.email,
    name: user.name,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });

  return token;
}

/**
 * Verifica e decodifica um JWT.
 * Lança erro caso o token seja inválido ou esteja expirado.
 *
 * @param {string} token
 * @returns {object} payload decodificado
 */
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET não configurado. Verifique o arquivo .env."
    );
  }

  return jwt.verify(token, secret);
}

export { findOrCreateUser, generateToken, verifyToken };

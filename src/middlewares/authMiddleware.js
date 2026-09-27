import { verifyJwt } from "../services/authService.js";

/**
 * Middleware de autenticação.
 * - lê o header Authorization no formato "Bearer <token>";
 * - valida o JWT;
 * - injeta os dados do usuário em req.user;
 * - bloqueia a requisição com 401 caso o token esteja ausente ou inválido.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token de autenticação não informado." });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Formato do token inválido. Use: Bearer <token>." });
  }

  const token = parts[1];

  try {
    const payload = verifyJwt(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

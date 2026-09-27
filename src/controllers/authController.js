import {
  requestMagicLink,
  verifyMagicLink,
  AuthError,
} from "../services/authService.js";

// Validação simples de formato de email, suficiente para fins didáticos
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /auth/request-link
 * Recebe um email e dispara o fluxo de geração/envio do Magic Link.
 */
export async function requestLink(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "O campo 'email' é obrigatório." });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Formato de email inválido." });
    }

    await requestMagicLink(email);

    // Por segurança/didática: não revelamos se o email já existia ou não,
    // e nunca retornamos o token na resposta da API.
    return res.status(200).json({
      message: "Se o email estiver correto, um link de acesso foi enviado.",
    });
  } catch (error) {
    console.error("Erro ao processar solicitação de Magic Link:", error);
    return res.status(500).json({ message: "Erro ao enviar o link de acesso." });
  }
}

/**
 * GET /auth/verify?token=...
 * Valida o Magic Token e retorna o JWT da aplicação.
 */
export async function verify(req, res) {
  try {
    const { token } = req.query;

    const { user, jwtToken } = verifyMagicLink(token);

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token: jwtToken,
      user,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error("Erro ao verificar Magic Link:", error);
    return res.status(500).json({ message: "Erro ao verificar o link de acesso." });
  }
}

/**
 * GET /auth/profile
 * Rota protegida: retorna os dados do usuário autenticado.
 * O middleware de autenticação já garantiu que req.user existe e é válido.
 */
export function profile(req, res) {
  return res.status(200).json({
    message: "Usuário autenticado",
    user: req.user,
  });
}

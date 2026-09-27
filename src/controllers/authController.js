import {
  requestMagicLink,
  verifyMagicLink,
  AuthError,
} from "../services/authService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


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

    return res.status(200).json({
      message: "Se o email estiver correto, um link de acesso foi enviado.",
    });
  } catch (error) {
    console.error("Erro ao processar solicitação de Magic Link:", error);
    return res.status(500).json({ message: "Erro ao enviar o link de acesso." });
  }
}

export async function verify(req, res) {
  try {
    const { token } = req.query;

    const user = verifyMagicLink(token);

    return res.status(200).json({
      message: "Login realizado com sucesso",
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

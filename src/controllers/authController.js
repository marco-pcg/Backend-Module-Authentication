import { generateToken } from "../services/authService.js";

/**
 * Controller chamado depois que o Passport já autenticou o usuário
 * com sucesso no callback do Google (req.user foi preenchido pela
 * estratégia configurada em config/passport.js).
 *
 * Aqui apenas geramos o JWT da aplicação e devolvemos a resposta
 * para o cliente.
 */
function googleCallback(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Não foi possível autenticar o usuário com o Google.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("[authController] Erro ao gerar token:", error.message);
    return res.status(500).json({
      message: "Erro interno ao gerar o token de autenticação.",
    });
  }
}

/**
 * Controller da rota protegida /auth/profile.
 * Como o authMiddleware já validou o token e preencheu req.user
 * com o payload do JWT, aqui só devolvemos essas informações.
 */
function getProfile(req, res) {
  return res.status(200).json({
    message: "Perfil autenticado",
    user: req.user,
  });
}

export { googleCallback, getProfile };

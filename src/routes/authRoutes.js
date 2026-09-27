import { Router } from "express";
import passport from "../config/passport.js";
import { googleCallback, getProfile } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * GET /auth/google
 * Inicia o fluxo de autenticação, redirecionando o usuário para a
 * tela de login do Google. session: false porque a aplicação usa
 * JWT, e não sessão do Passport.
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["openid", "profile", "email"],
    session: false,
  })
);

/**
 * GET /auth/google/callback
 * Rota para a qual o Google redireciona após o login do usuário.
 * O Passport processa o resultado, popula req.user, e então o
 * authController.googleCallback gera o JWT e responde.
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/failure",
  }),
  googleCallback
);

/**
 * Rota simples para exibir uma falha de autenticação de forma
 * amigável, caso o usuário cancele o login ou algo dê errado.
 */
router.get("/google/failure", (req, res) => {
  res.status(401).json({
    message: "Falha na autenticação com o Google.",
  });
});

/**
 * GET /auth/profile
 * Rota protegida por JWT. Só responde se o header Authorization
 * contiver um "Bearer <token>" válido.
 */
router.get("/profile", authMiddleware, getProfile);

export default router;

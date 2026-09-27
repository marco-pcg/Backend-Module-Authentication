import { Router } from "express";
import { requestLink, verify, profile } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Passo 1: usuário solicita o Magic Link informando o email
router.post("/request-link", requestLink);

// Passo 2: usuário clica no link recebido e o token é validado
router.get("/verify", verify);

// Rota protegida: exige um JWT válido no header Authorization
router.get("/profile", authMiddleware, profile);

export default router;

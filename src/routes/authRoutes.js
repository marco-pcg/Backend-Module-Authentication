import { Router } from "express";
import { requestLink, verify } from "../controllers/authController.js";

const router = Router();

router.post("/request-link", requestLink); 
// Recebe o email do usuário e dispara o fluxo de geração/envio do Magic Link

router.get("/verify", verify); 
// Loga após o usuário clicar no link enviado por email

export default router;

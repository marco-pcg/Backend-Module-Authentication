import "dotenv/config";
import express from "express";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(express.json());
app.use(passport.initialize());

// Rota raiz apenas para facilitar a demonstração em vídeo
app.get("/", (req, res) => {
  res.json({
    message: "API de autenticação com Google (Express + Passport + JWT)",
    login: "GET /auth/google",
    profile: "GET /auth/profile (requer Authorization: Bearer <token>)",
  });
});

// Rotas de autenticação
app.use("/auth", authRoutes);

// Middleware para rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

// Middleware global de tratamento de erros.
// Evita que erros inesperados quebrem o servidor ou apareçam de
// forma confusa no terminal.
app.use((err, req, res, next) => {
  console.error("[app] Erro não tratado:", err.message);
  res.status(500).json({ message: "Erro interno no servidor." });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Inicie o login em: http://localhost:${PORT}/auth/google`);
});

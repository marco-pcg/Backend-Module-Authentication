import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);

// Rota simples de "saúde" da API, útil para conferir que o servidor está no ar
app.get("/", (req, res) => {
  res.json({ message: "API de Login Mágico (Magic Link) funcionando." });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

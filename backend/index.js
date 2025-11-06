import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";

// Importa os módulos de rotas
import authRoutes from "./src/routes/authRoutes.js";
import faseRoutes from "./src/routes/faseRoutes.js";

const app = express();

// --- Middlewares Globais ---
app.use(bodyParser.json());
app.use(cors()); // integração

// --- Rotas ---
app.use(authRoutes); // Registra rotas de /auth e /user
app.use(faseRoutes); // Registra rotas de /fases (protegidas)

// Rota raiz de verificação
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando com arquitetura refatorada!" });
});

// --- Inicialização do Servidor ---
const PORT = 3000;

// Converte import.meta.url para path do sistema
const __filename = fileURLToPath(import.meta.url);

// Garante que o servidor só inicie quando executado diretamente
if (process.argv[1] && __filename === process.argv[1]) {
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

export default app; // exporta para testes (Vitest ou outros)
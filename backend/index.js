// index.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SECRET = "segredo123"; // em produção, use variáveis de ambiente

// "Banco de dados" em memória
const users = []; // { id, username, password, completed: [] }
const fases = [
  { id: 1, nome: "Fase 1" },
  { id: 2, nome: "Fase 2" },
  { id: 3, nome: "Fase 3" }
];

// Middleware para autenticação
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
}

// Registro
app.post("/auth/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: "Usuário já existe" });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password, // em produção, use bcrypt!
    completed: []
  };
  users.push(newUser);
  res.json({ message: "Usuário registrado com sucesso" });
});

// Login
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
    expiresIn: "1h"
  });

  res.json({ token });
});

// Listar fases
app.get("/fases", authMiddleware, (req, res) => {
  res.json(fases);
});

// Marcar progresso de fase
app.post("/fases/progresso/:faseId", authMiddleware, (req, res) => {
  const { faseId } = req.params;
  const user = users.find((u) => u.id === req.user.id);

  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  if (!fases.find((f) => f.id == faseId))
    return res.status(404).json({ error: "Fase não encontrada" });

  if (!user.completed.includes(Number(faseId))) {
    user.completed.push(Number(faseId));
  }

  res.json({ message: "Fase concluída", completed: user.completed });
});

// Ver progresso
app.get("/fases/progresso", authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  res.json({ completed: user.completed });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

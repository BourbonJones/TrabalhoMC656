// index.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors"); // integração


const app = express();
app.use(bodyParser.json());
app.use(cors()); // integração

const SECRET = "segredo123"; 

// "Banco de dados" em memória
const users = []; // { id, username, password, completed: [] }
const fases = [
  { id: 1, nome: "Fase 1" },
  { id: 2, nome: "Fase 2" },
  { id: 3, nome: "Fase 3" },
  { id: 3, nome: "Fase 4" },
  { id: 3, nome: "Fase 5" }
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

// Integração Front-back
app.get("/user", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.json({ nome: "Visitante" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    // decoded contém { id, username } conforme seu login
    const u = users.find((x) => x.id === decoded.id);
    const nome = u ? u.username : decoded.username || "Usuário";
    return res.json({ nome });
  } catch (err) {
    // se token inválido, devolve visitante (evita 4xx para chamadas de UI que não estejam logadas)
    return res.json({ nome: "Visitante" });
  }
});



// Registro
app.post("/auth/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: "Usuário já existe" });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password, 
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
if (require.main === module) {
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

module.exports = app; // exporta para o jest

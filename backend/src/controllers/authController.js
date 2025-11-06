
// Responsável pela lógica de negócio (validação, regras) de autenticação.
// NÃO sabe como os dados são salvos. Apenas chama o repositório.

import jwt from "jsonwebtoken";
import userRepository from "../repositories/userRepository.js";

const SECRET = "segredo123"; // TODO: Mover para variável de ambiente (.env)

export const register = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
    }

    // Lógica de Negócio: Verificar se usuário já existe
    const userExists = userRepository.findByUsername(username);
    if (userExists) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    // Chama o repositório para criar o usuário
    userRepository.create(username, password);

    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const login = (req, res) => {
  try {
    const { username, password } = req.body;

    // Lógica de Negócio: Validar credenciais
    const user = userRepository.findByUsername(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gerar token
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
      expiresIn: "1h"
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

/**
 * Rota de UI para exibir o nome do usuário.
 * (Antiga GET /user)
 */
export const getUserProfile = (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.json({ nome: "Visitante" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    
    // Chama o repositório para garantir que o usuário ainda existe
    const u = userRepository.findById(decoded.id); 
    const nome = u ? u.username : "Usuário";
    
    return res.json({ nome });
  } catch (err) {
    return res.json({ nome: "Visitante" });
  }
};
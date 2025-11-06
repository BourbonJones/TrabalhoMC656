
import jwt from "jsonwebtoken";
import userRepository from "../repositories/userRepository.js";

const SECRET = "segredo123"; 

export const register = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
    }
    userRepository.create(username, password);
    res.json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const login = (req, res) => {
  try {
    const { username, password } = req.body;
    const user = userRepository.findByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
      expiresIn: "1h"
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const getUserProfile = (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.json({ nome: "Visitante" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    const u = userRepository.findById(decoded.id); 
    const nome = u ? u.username : "Usuário";
    return res.json({ nome });
  } catch (err) {
    return res.json({ nome: "Visitante" });
  }
};
import jwt from "jsonwebtoken";

const SECRET = "segredo123"; // TODO: Mover para variável de ambiente (.env)

/**
 * Middleware para verificar o token JWT.
 * Anexa o payload do usuário (ex: { id, username }) a req.user.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }
    req.user = user; // Anexa o payload do token (ex: { id, username })
    next();
  });
}
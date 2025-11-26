import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; //npm install jsonwebtoken

const app = express();
const PORT = 3000;
const SECRET_KEY = "minha_chave_secreta_super_segura"; 

app.use(bodyParser.json());
app.use(cors());

// Configuração do Banco de Dados SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao abrir banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        initDb();
    }
});

// Cria as tabelas se não existirem
function initDb() {
    db.serialize(() => {
        // Tabela de Usuários
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);

        // Tabela de Progresso
        // user_id, level_id e completed
        db.run(`CREATE TABLE IF NOT EXISTS progress (
            user_id INTEGER,
            level_id INTEGER,
            completed INTEGER, -- 0 ou 1 (SQLite não tem boolean nativo)
            PRIMARY KEY (user_id, level_id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
    });
}

// --- Middlewares ---

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // Guarda o user (com id e username) na requisição
        next();
    });
}

// --- Rotas de Autenticação ---

// REGISTRO
app.post("/auth/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Dados inválidos" });

    try {
        // Criptografa a senha antes de salvar
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
        db.run(sql, [username, hashedPassword], function (err) {
            if (err) {
                
                return res.status(400).json({ message: "Erro ao criar usuário. Talvez o nome já exista." });
            }
            res.status(201).json({ message: "Usuário criado com sucesso!", userId: this.lastID });
        });
    } catch (e) {
        res.status(500).json({ message: "Erro interno" });
    }
});

// LOGIN
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, row) => {
        if (err) return res.status(500).json({ message: "Erro no banco" });
        if (!row) return res.status(400).json({ message: "Usuário não encontrado" });

        // Compara a senha enviada com a senha criptografada no banco
        const match = await bcrypt.compare(password, row.password);
        if (!match) return res.status(403).json({ message: "Senha incorreta" });

        // Gera token
        const token = jwt.sign({ id: row.id, username: row.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "Login realizado", token });
    });
});

// --- Rotas de Usuário e Progresso ---

// Obter dados do usuário logado
app.get("/user", authenticateToken, (req, res) => {
    res.json({ id: req.user.id, nome: req.user.username });
});

// Salvar Progresso
app.post("/fases/progresso/:faseId", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const faseId = parseInt(req.params.faseId);

    // INSERT OR REPLACE: Se já existe, atualiza. Se não, cria.
    const sql = `INSERT OR REPLACE INTO progress (user_id, level_id, completed) VALUES (?, ?, 1)`;
    
    db.run(sql, [userId, faseId], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erro ao salvar progresso" });
        }
        res.json({ message: `Progresso da fase ${faseId} salvo!`, userId, faseId });
    });
});

// Ler Progresso 
app.get("/fases/progresso", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT level_id FROM progress WHERE user_id = ? AND completed = 1`;
    
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: "Erro ao ler progresso" });
        
        const completedLevels = rows.map(r => r.level_id);
        res.json({ completedLevels });
    });
});


// Rota raiz para teste
app.get("/", (req, res) => {
    res.json({ message: "API com SQLite funcionando! 🚀" });
});

// Inicia servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
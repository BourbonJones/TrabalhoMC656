import request from "supertest";
import app from "./index.js"; // Importa a app Express principal
import { db } from "./db.js"; // Importa a "base de dados" em memória para a podermos controlar
import { describe, it, expect, beforeEach } from "vitest";

// Hook que corre ANTES DE CADA teste 'it'
beforeEach(() => {
  // Limpa a base de dados em memória
  db.users = [];
  db.fases = [
    { id: 1, nome: "Fase 1" },
    { id: 2, nome: "Fase 2" },
    { id: 3, nome: "Fase 3" },
    { id: 4, nome: "Fase 4" }, // Corrigido: IDs duplicados
    { id: 5, nome: "Fase 5" }, // Corrigido: IDs duplicados
  ];
});

describe("API de Autenticação", () => {
  it("Deve registrar um novo usuário", async () => {
    // Act
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "teste", password: "123" });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Usuário registrado com sucesso");
    // Verifica se o utilizador foi realmente adicionado à db (agora que a controlamos)
    expect(db.users).toHaveLength(1);
    expect(db.users[0].username).toBe("teste");
  });

  it("Não deve registrar usuário duplicado", async () => {
    // Arrange (Preparação) - Adiciona um utilizador primeiro
    db.users.push({
      id: 1,
      username: "teste",
      password: "123",
      completed: [],
    });

    // Act
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "teste", password: "456" }); // Tenta registar o mesmo username

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Usuário já existe");
    expect(db.users).toHaveLength(1); // Garante que nenhum novo utilizador foi adicionado
  });

  it("Deve logar usuário e retornar token", async () => {
    // Arrange
    db.users.push({
      id: 1,
      username: "teste",
      password: "123", // Nota: A password não está hasheada neste exemplo
      completed: [],
    });

    // Act
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "teste", password: "123" });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("Não deve logar se o usuário não existir", async () => {
    // Act
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "fantasma", password: "123" });

    // Assert
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Credenciais inválidas");
  });

  it("Não deve logar se a password estiver incorreta", async () => {
    // Arrange
    db.users.push({
      id: 1,
      username: "teste",
      password: "123",
      completed: [],
    });

    // Act
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "teste", password: "password-errada" });

    // Assert
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Credenciais inválidas");
  });
});

describe("API de Fases (Rotas Protegidas)", () => {
  let token;
  let userId;

  // Antes de cada teste NESTE bloco, cria um utilizador e faz login
  beforeEach(async () => {
    // Arrange - Cria utilizador
    const newUser = {
      id: 1,
      username: "user_logado",
      password: "123",
      completed: [],
    };
    db.users.push(newUser);
    userId = newUser.id;

    // Arrange - Faz login para obter token
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "user_logado", password: "123" });

    token = res.body.token; // Armazena o token para os testes
  });

  it("Deve listar fases com token válido", async () => {
    // Act
    const res = await request(app)
      .get("/fases")
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(5);
  });

  it("Deve retornar erro se token não for fornecido", async () => {
    // Act
    const res = await request(app).get("/fases"); // Sem token

    // Assert
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Token não fornecido");
  });

  it("Deve marcar progresso em uma fase", async () => {
    // Act
    const res = await request(app)
      .post("/fases/progresso/2") // Tenta completar a fase 2
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toContain(2);

    // Verifica se a base de dados foi realmente atualizada
    const userInDb = db.users.find((u) => u.id === userId);
    expect(userInDb.completed).toContain(2);
  });

  it("Não deve duplicar progresso se a fase já estiver concluída", async () => {
    // Arrange - Marca a fase 2 como concluída primeiro
    db.users[0].completed.push(2);

    // Act - Tenta marcar a fase 2 novamente
    const res = await request(app)
      .post("/fases/progresso/2")
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toHaveLength(1); // Não deve adicionar duplicado
    expect(res.body.completed).toContain(2);
  });

  it("Deve mostrar progresso do usuário", async () => {
    // Arrange - Adiciona progresso
    db.users[0].completed.push(1);
    db.users[0].completed.push(3);

    // Act
    const res = await request(app)
      .get("/fases/progresso")
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toEqual([1, 3]);
  });

  it("Não deve marcar fase inexistente", async () => {
    // Act
    const res = await request(app)
      .post("/fases/progresso/99") // ID da fase que não existe
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Fase não encontrada");
  });

  it("Deve lidar com token inválido/expirado", async () => {
    // Act
    const res = await request(app)
      .get("/fases")
      .set("Authorization", `Bearer token-invalido-123`);

    // Assert
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Token inválido");
  });
});
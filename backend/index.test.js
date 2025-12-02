import request from "supertest";
import app from "./app.js";
import { describe, it, expect, afterAll } from "vitest";

let token


describe.sequential("API de autenticação e fases", () => {

  afterAll(async () => {
    await request(app).delete("/auth/user/Teste");
  });

  describe.sequential("Registro e Login", () => {

    it("[Causa-Efeito]: Deve registrar um novo usuário", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ username: "Teste", password: "1234" });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Usuário criado com sucesso!");
    });

    it("[Causa-Efeito]: Não deve registrar usuário duplicado", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ username: "Teste", password: "1234" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Usuário já existe");
    });

    it("[Causa-Efeito]: Não deve logar com credenciais inválidas", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ username: "Teste", password: "errada" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Senha incorreta");
    });

    it("[Causa-Efeito]: Deve logar usuário e retornar token", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ username: "Teste", password: "1234" });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      token = res.body.token;
    });

    it("[Causa-Efeito]: Deve retornar erro se token não for fornecido", async () => {
      const res = await request(app).get("/fases/progresso");
      expect(res.statusCode).toBe(401);
    });
  });

  
  describe.sequential("Progresso do Usuário", () => {

    it("[Causa-Efeito]: Deve mostrar progresso do usuário", async () => {
      const res = await request(app)
        .get("/fases/progresso")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it("[Valor Limite]: Deve marcar progresso em uma fase (1)", async () => {
      const res = await request(app)
        .post("/fases/progresso/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("Progresso da fase 1 salvo!");
    });

    // R6 novamente
    it("[Valor Limite]: Deve marcar progresso em uma fase (5)", async () => {
      const res = await request(app)
        .post("/fases/progresso/5")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("Progresso da fase 5 salvo!");
    });

    // R7: C5=true ∧ C6=false → E9
    it("[Valor limite]: Deve marcar fase inexistente (6)", async () => {
      const res = await request(app)
        .post("/fases/progresso/6")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Essa fase não existe");
    });

    // R7 novamente
    it("[Valor limite]: Deve marcar fase inexistente (0)", async () => {
      const res = await request(app)
        .post("/fases/progresso/0")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Essa fase não existe");
    });
  });
});
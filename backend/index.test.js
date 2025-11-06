import request from "supertest";
import app from "./index.js";
import { describe, it, expect } from "vitest";



describe("API de autenticação e fases", () => {
  let token

  it("Deve registrar um novo usuário", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "teste", password: "1234" })

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe("Usuário registrado com sucesso")
  })

  it("Não deve registrar usuário duplicado", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "teste", password: "1234" })

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toBe("Usuário já existe")
  })

  it("Deve logar usuário e retornar token", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "teste", password: "1234" })

    expect(res.statusCode).toBe(200)
    expect(res.body.token).toBeDefined()
    token = res.body.token
  })

  it("Não deve logar com credenciais inválidas", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "teste", password: "errada" })

    expect(res.statusCode).toBe(401)
    expect(res.body.error).toBe("Credenciais inválidas")
  })

  it("Deve listar fases com token válido", async () => {
    const res = await request(app)
      .get("/fases")
      .set("Authorization", `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(5)
  })

  it("Deve retornar erro se token não for fornecido", async () => {
    const res = await request(app).get("/fases")
    expect(res.statusCode).toBe(401)
    expect(res.body.error).toBe("Token não fornecido")
  })

  it("Deve marcar progresso em uma fase", async () => {
    const res = await request(app)
      .post("/fases/progresso/1")
      .set("Authorization", `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.completed).toContain(1)
  })

  it("Deve mostrar progresso do usuário", async () => {
    const res = await request(app)
      .get("/fases/progresso")
      .set("Authorization", `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.completed).toContain(1)
  })

  it("Não deve marcar fase inexistente", async () => {
    const res = await request(app)
      .post("/fases/progresso/99")
      .set("Authorization", `Bearer ${token}`)

    expect(res.statusCode).toBe(404)
    expect(res.body.error).toBe("Fase não encontrada")
  })
})
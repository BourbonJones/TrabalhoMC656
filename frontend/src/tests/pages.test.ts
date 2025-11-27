/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadPage } from "../pages";
import exercicio1 from "../pages/exercicios/exercicio1.html?raw";
import exercicio2 from "../pages/exercicios/exercicio2.html?raw";
import exercicio3 from "../pages/exercicios/exercicio3.html?raw";
import exercicio4 from "../pages/exercicios/exercicio4.html?raw";
import exercicio5 from "../pages/exercicios/exercicio5.html?raw";

// ————————————————————————————————
// Setup do ambiente JSDOM
// ————————————————————————————————
beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`;
  vi.restoreAllMocks();
});

// ————————————————————————————————
// Mock fetch helper
// ————————————————————————————————
function mockFetchSuccess(html: string) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(html)
  } as Response);
}

function mockFetchError(status = 500) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: () => Promise.resolve("")
  } as Response);
}

function mockFetchReject() {
  globalThis.fetch = vi.fn().mockRejectedValue(new Error("network error"));
}

// Testes
describe("[Causa-Efeito]: Testes Frontend", () => {

  describe("Carregando elementos da página", () => {
    it("Carregando Exercício 1: PORTA NOT", async () => {
      mockFetchSuccess(exercicio1);

      await loadPage("/exercicios/exercicio1.html");

      const app = document.querySelector("#app")!;

      const h1 = app.querySelector("h1");
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain("Porta NOT");

      // Verifica o game-board
      const gameBoard = app.querySelector("#game-board");
      expect(gameBoard).not.toBeNull();
    });

    it("Carregando Exercício 2: PORTA AND", async () => {
      mockFetchSuccess(exercicio2);

      await loadPage("/exercicios/exercicio2.html");

      const app = document.querySelector("#app")!;

      const h1 = app.querySelector("h1");
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain("Porta AND");

      // Verifica o game-board
      const gameBoard = app.querySelector("#game-board");
      expect(gameBoard).not.toBeNull();
    });

    it("Carregando Exercício 3: PORTA OR", async () => {
      mockFetchSuccess(exercicio3);

      await loadPage("/exercicios/exercicio3.html");

      const app = document.querySelector("#app")!;

      const h1 = app.querySelector("h1");
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain("Porta OR");

      // Verifica o game-board
      const gameBoard = app.querySelector("#game-board");
      expect(gameBoard).not.toBeNull();
    });

    it("Carregando Exercício 4: Circuito Combinado", async () => {
      mockFetchSuccess(exercicio4);

      await loadPage("/exercicios/exercicio4.html");

      const app = document.querySelector("#app")!;

      const h1 = app.querySelector("h1");
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain("Circuito Combinado");

      // Verifica o game-board
      const gameBoard = app.querySelector("#game-board");
      expect(gameBoard).not.toBeNull();
    });

    it("Carregando Exercício 5: Desafio Lógico", async () => {
      mockFetchSuccess(exercicio5);

      await loadPage("/exercicios/exercicio5.html");

      const app = document.querySelector("#app")!;

      const h1 = app.querySelector("h1");
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain("Desafio Lógico");

      // Verifica o game-board
      const gameBoard = app.querySelector("#game-board");
      expect(gameBoard).not.toBeNull();
    });
  });


  describe("[Causa-Efeito]: Falhas no Fatch", () => {
    it("loga erro se fetch retornar status ruim (404 / 500 etc)", async () => {
      mockFetchError(404);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

      await loadPage("/nao-existe.html");

      expect(consoleSpy).toHaveBeenCalled();
    });

    it("loga erro se o fetch rejeitar (erro de rede)", async () => {
      mockFetchReject();

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

      await loadPage("/pagina.html");

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

});
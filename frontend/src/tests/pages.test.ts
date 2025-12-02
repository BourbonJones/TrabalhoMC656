/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CircuitGame } from "../game/CircuitEngine";
import { loadPage } from "../pages";
import exercicio1 from "../pages/exercicios/exercicio1.html?raw";
import exercicio2 from "../pages/exercicios/exercicio2.html?raw";
import exercicio3 from "../pages/exercicios/exercicio3.html?raw";
import exercicio4 from "../pages/exercicios/exercicio4.html?raw";
import exercicio5 from "../pages/exercicios/exercicio5.html?raw";

beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`;
  vi.restoreAllMocks();
});

function mockFetchSuccess(html: string) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(html)
  } as Response);
}

describe("Testes Frontend", () => {
  describe("Carregando elementos da página", () => {
    it("Carregando Exercício 1: PORTA NOT", async () => {
      mockFetchSuccess(exercicio1);

      await loadPage("/exercicios/exercicio1.html");

      const app = document.querySelector("#app")!;

      const h1 = app.querySelector("h1");
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain("Porta NOT");

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

      const gameBoard = app.querySelector("#game-board");
      expect(gameBoard).not.toBeNull();
    });
  });

  function mount(components: any, wires: any) {
    document.body.innerHTML = `<div id="root"></div>`;

    return new CircuitGame("root", {
      components,
      wires,
      inputLabels: ["A", "B"],
      outputLabels: ["X"],
      truthTable: []
    }, () => { });
  }

  describe("Testando Engine - Portas Lógicas", () => {

    it("Porta AND - valores inválidos gera efeito esperado (false)", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: false },
          { id: "B", type: "INPUT", x: 0, y: 1, inputs: [], state: false },
          { id: "G1", type: "AND", x: 1, y: 0, inputs: ["A", "B"], state: false },
          { id: "OUT", type: "OUTPUT", x: 2, y: 0, inputs: ["G1"], state: false }
        ],
        []
      );

      const c = game["components"];

      // CAUSA → valor inválido
      (c.get("A") as any).state = "abc";

      // EFEITO esperado: engine converte para false e calcula corretamente
      game["updateLogic"]();

      expect(c.get("OUT")!.state).toBe(false);
    });

    it("Porta AND: valores válidos funcionam corretamente", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: false },
          { id: "B", type: "INPUT", x: 0, y: 1, inputs: [], state: false },
          { id: "G1", type: "AND", x: 2, y: 0, inputs: ["A", "B"], state: false },
          { id: "OUT", type: "OUTPUT", x: 3, y: 0, inputs: ["G1"], state: false }
        ],
        [
          { from: "A", to: "G1" },
          { from: "B", to: "G1" },
          { from: "G1", to: "OUT" }
        ]
      );

      const c = game["components"];

      // Caso 1 → 0 AND 0 = 0
      c.get("A")!.state = false;
      c.get("B")!.state = false;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(false);

      // Caso 2 → 1 AND 0 = 0
      c.get("A")!.state = true;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(false);

      // Caso 3 → 1 AND 1 = 1
      c.get("B")!.state = true;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(true);
    });


    it("porta NOT: valores válidos funcionam corretamente", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: false },
          { id: "N1", type: "NOT", x: 1, y: 0, inputs: ["A"], state: false },
          { id: "OUT", type: "OUTPUT", x: 2, y: 0, inputs: ["N1"], state: false }
        ],
        [
          { from: "A", to: "N1" },
          { from: "N1", to: "OUT" }
        ]
      );

      const c = game["components"];

      // A = 0 → OUT = 1
      c.get("A")!.state = false;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(true);

      // A = 1 → OUT = 0
      c.get("A")!.state = true;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(false);
    });

    it("Porta NOT: valores não booleanos inválidos quebram a lógica e é retornado false", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: false },
          { id: "N1", type: "NOT", x: 1, y: 0, inputs: ["A"], state: false },
          { id: "OUT", type: "OUTPUT", x: 2, y: 0, inputs: ["N1"], state: false }
        ],
        [
          { from: "A", to: "N1" },
          { from: "N1", to: "OUT" }
        ]
      );

      const c = game["components"];

      const invalidValues = [
        "abc",
        123,
        {},
        [],
        () => { },
      ];

      for (const value of invalidValues) {
        (c.get("A") as any).state = value;

        game["updateLogic"]();
        expect(c.get("OUT")!.state).toBe(false);
      }
    });

    it("Porta NOT: valores inválidos interpretados como false retornam true", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: false },
          { id: "N1", type: "NOT", x: 1, y: 0, inputs: ["A"], state: false },
          { id: "OUT", type: "OUTPUT", x: 2, y: 0, inputs: ["N1"], state: false }
        ],
        [
          { from: "A", to: "N1" },
          { from: "N1", to: "OUT" }
        ]
      );

      const c = game["components"];

      const invalidValues = [
        null,
        undefined,
        NaN
      ];

      for (const value of invalidValues) {
        (c.get("A") as any).state = value;

        game["updateLogic"]();
        expect(c.get("OUT")!.state).toBe(true);
      }
    });

    it("Porta OR - valores inválidos geram efeito esperado (false interpretado corretamente)", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: false },
          { id: "B", type: "INPUT", x: 0, y: 1, inputs: [], state: false },
          { id: "G1", type: "OR", x: 1, y: 0, inputs: ["A", "B"], state: false },
          { id: "OUT", type: "OUTPUT", x: 2, y: 0, inputs: ["G1"], state: false }
        ],
        []
      );

      const c = game["components"];

      // CAUSA: valor inválido
      (c.get("A") as any).state = "abc";
      c.get("B")!.state = true;

      // Executa o cálculo
      game["updateLogic"]();

      // EFEITO ESPERADO: engine trata "abc" como false → false OR true = true
      expect(c.get("OUT")!.state).toBe(true);
    });

    it("Porta OR: valores válidos funcionam corretamente", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: false },
          { id: "B", type: "INPUT", x: 0, y: 1, inputs: [], state: false },
          { id: "G1", type: "OR", x: 2, y: 0, inputs: ["A", "B"], state: false },
          { id: "OUT", type: "OUTPUT", x: 3, y: 0, inputs: ["G1"], state: false }
        ],
        [
          { from: "A", to: "G1" },
          { from: "B", to: "G1" },
          { from: "G1", to: "OUT" }
        ]
      );

      const c = game["components"];

      // Caso 1: 0 OR 0 = 0
      c.get("A")!.state = false;
      c.get("B")!.state = false;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(false);

      // Caso 2: 0 OR 1 = 1
      c.get("B")!.state = true;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(true);

      // Caso 3: 1 OR 0 = 1
      c.get("A")!.state = true;
      c.get("B")!.state = false;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(true);

      // Caso 4: 1 OR 1 = 1
      c.get("B")!.state = true;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(true);
    });


    it("Multi portas: Propagação em cadeia funciona", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: false },
          { id: "N1", type: "NOT", x: 1, y: 0, inputs: ["A"], state: false },
          { id: "G1", type: "AND", x: 2, y: 0, inputs: ["N1"], state: false },
          { id: "OUT", type: "OUTPUT", x: 3, y: 0, inputs: ["G1"], state: false }
        ],
        [
          { from: "A", to: "N1" },
          { from: "N1", to: "G1" },
          { from: "G1", to: "OUT" }
        ]
      );

      const c = game["components"];

      // A = 0 → NOT = 1 → AND(1) = 1 → OUT = 1
      c.get("A")!.state = false;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(true);

      // A = 1 → NOT = 0 → AND(0) = 0 → OUT = 0
      c.get("A")!.state = true;
      game["updateLogic"]();
      expect(c.get("OUT")!.state).toBe(false);
    });

    it("valor limite inferior (todos inputs = 0) → saída correta", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: false },
          { id: "N", type: "NOT", x: 1, y: 0, inputs: ["A"], state: false },
          { id: "OUT", type: "OUTPUT", x: 2, y: 0, inputs: ["N"], state: false }
        ],
        []
      );

      game["updateLogic"]();

      // limite inferior: 0 vira 1
      expect(game["components"].get("OUT")!.state).toBe(true);
    });

    it("valor limite superior (todos inputs = 1) → saída correta", () => {
      const game = mount(
        [
          { id: "A", type: "INPUT", x: 0, y: 0, inputs: [], state: true },
          { id: "N", type: "NOT", x: 1, y: 0, inputs: ["A"], state: false },
          { id: "OUT", type: "OUTPUT", x: 2, y: 0, inputs: ["N"], state: false }
        ],
        []
      );

      game["updateLogic"]();

      // limite superior: 1 vira 0
      expect(game["components"].get("OUT")!.state).toBe(false);
    });

  });

});

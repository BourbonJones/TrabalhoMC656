// "Banco de dados" em memória
// Isolamos os dados em seu próprio módulo para que os repositórios possam importá-los.

export const users = []; // { id, username, password, completed: [] }
export const fases = [
  { id: 1, nome: "Fase 1" },
  { id: 2, nome: "Fase 2" },
  { id: 3, nome: "Fase 3" },
  { id: 4, nome: "Fase 4" }, // Corrigido: ID estava duplicado no original
  { id: 5, nome: "Fase 5" }  // Corrigido: ID estava duplicado no original
];
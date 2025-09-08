# Backend do Jogo de Circuitos Lógicos

Este backend implementa **Express.js** com autenticação e gerenciamento de fases para cada usuário.

---

## Funcionalidades

1. **Cadastro e Login de Usuário**
2. **Cadastro de Fases**
3. **Registrar progresso de fases concluídas por cada usuário**

---

## Rotas do Servidor

1. Usuário faz ```POST /auth/register``` para criar conta.
2. Usuário faz ```POST /auth/login``` e recebe token JWT.
3. Usuário acessa ```GET /fases``` para receber as fases.
4. Usuário envia ```POST /fases/progresso/:faseId``` para marcar a fase como concluída.
5. Usuário pode ver progresso com ```GET /fases/progresso```.

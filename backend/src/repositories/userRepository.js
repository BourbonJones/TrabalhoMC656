
import { users } from "../../bd.js";

class UserRepository {

  findByUsername(username) {
    console.log(`[Repo] Buscando usuário: ${username}`);
    return users.find((u) => u.username === username);
  }

  findById(id) {
    console.log(`[Repo] Buscando usuário por ID: ${id}`);
    return users.find((u) => u.id === id);
  }

  create(username, password) {
    const newUser = {
      id: users.length + 1,
      username,
      password, 
      completed: []
    };
    users.push(newUser);
    console.log(`[Repo] Usuário criado: ${username}`);
    return newUser;
  }
}

export default new UserRepository();
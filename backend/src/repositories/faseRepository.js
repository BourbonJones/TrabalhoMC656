

import { fases } from "../../bd.js";

import userRepository from "./userRepository.js";

class FaseRepository {

  findAll() {
    console.log("[Repo] Buscando todas as fases.");
    return fases;
  }


  findById(id) {
    console.log(`[Repo] Buscando fase por ID: ${id}`);
    return fases.find((f) => f.id == id);
  }

  saveUserProgress(userId, faseIdNum) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (!user.completed.includes(faseIdNum)) {
      user.completed.push(faseIdNum);
      console.log(`[Repo] Progresso salvo para usuário ${userId}, fase ${faseIdNum}.`);
    }
    return user.completed;
  }

  getUserProgress(userId) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    console.log(`[Repo] Buscando progresso para usuário ${userId}.`);
    return user.completed;
  }
}

export default new FaseRepository();
// --- CAMADA DE CONTROLE ---
// Responsável pela lógica de negócio (validação, regras) das fases.

import faseRepository from "../repositories/faseRepository.js";

export const getFases = (req, res) => {
  try {
    // Chama o repositório para buscar os dados
    const todasAsFases = faseRepository.findAll();
    res.json(todasAsFases);
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const saveProgresso = (req, res) => {
  try {
    const { faseId } = req.params;
    const userId = req.user.id; // Vem do authMiddleware

    // Lógica de Negócio: Verificar se a fase existe
    if (!faseRepository.findById(faseId)) {
      return res.status(404).json({ error: "Fase não encontrada" });
    }

    // Chama o repositório para salvar os dados
    const completed = faseRepository.saveUserProgress(userId, Number(faseId));
    res.json({ message: "Fase concluída", completed });

  } catch (error) {
    // Trata o erro que o repositório pode jogar (ex: usuário não encontrado)
    if (error.message === "Usuário não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const getProgresso = (req, res) => {
  try {
    const userId = req.user.id; // Vem do authMiddleware

    // Chama o repositório para buscar os dados
    const completed = faseRepository.getUserProgress(userId);
    res.json({ completed });
    
  } catch (error) {
    if (error.message === "Usuário não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
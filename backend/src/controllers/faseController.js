
import faseRepository from "../repositories/faseRepository.js";

export const getFases = (req, res) => {
  try {
    const todasAsFases = faseRepository.findAll();
    res.json(todasAsFases);
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const saveProgresso = (req, res) => {
  try {
    const { faseId } = req.params;
    const userId = req.user.id;
    if (!faseRepository.findById(faseId)) {
      return res.status(404).json({ error: "Fase não encontrada" });
    }
    const completed = faseRepository.saveUserProgress(userId, Number(faseId));
    res.json({ message: "Fase concluída", completed });

  } catch (error) {
    if (error.message === "Usuário não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const getProgresso = (req, res) => {
  try {
    const userId = req.user.id; 
    const completed = faseRepository.getUserProgress(userId);
    res.json({ completed });
    
  } catch (error) {
    if (error.message === "Usuário não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
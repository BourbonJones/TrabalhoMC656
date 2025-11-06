import { Router } from "express";
import { getFases, saveProgresso, getProgresso } from "../controllers/faseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/fases", getFases);
router.post("/fases/progresso/:faseId", saveProgresso);
router.get("/fases/progresso", getProgresso);

export default router;
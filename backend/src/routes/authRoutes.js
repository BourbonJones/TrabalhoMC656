import { Router } from "express";
import { register, login, getUserProfile } from "../controllers/authController.js";

const router = Router();


router.get("/user", getUserProfile);

router.post("/auth/register", register);
router.post("/auth/login", login);

export default router;
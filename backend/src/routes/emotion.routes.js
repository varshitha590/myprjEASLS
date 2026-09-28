import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { logEmotion } from "../controllers/emotion.controller.js";

const router = Router();

router.post("/log", auth, logEmotion);
console.log("Emotion routes loaded");
export default router;
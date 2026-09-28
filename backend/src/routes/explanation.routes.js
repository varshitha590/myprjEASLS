import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { explain } from "../controllers/explanation.controller.js";

const router = Router();

router.post("/explain", auth, explain);

export default router;
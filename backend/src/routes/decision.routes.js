import express from "express";
import { decide } from "../controllers/decision.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/decide", auth, decide);

export default router;

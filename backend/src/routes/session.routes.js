import { Router } from "express";
import { auth } from "../middleware/auth.js"; // ✅ CORRECT
// session.routes.js
import {
  startSession,
  endSession,
  getUserSessions
} from "../controllers/session.controller.js";

import { ensureUser } from "../middleware/ensureUser.js";
 // ✅ CORRECT

const router = Router();

router.post("/start", auth, ensureUser, startSession);
router.post("/end", endSession);
router.get("/session", getUserSessions);

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

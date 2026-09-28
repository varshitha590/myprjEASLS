import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log("📊 REPORT REQUEST:", sessionId);

    // 1️⃣ Session
    const sessionResult = await pool.query(
  "SELECT * FROM learning_sessions WHERE id = $1",
  [sessionId]
);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = sessionResult.rows[0];

const videoResult = await pool.query(
  "SELECT * FROM videos WHERE id = $1",
  [session.video_id]
);

const video = videoResult.rows[0] || {};

const emotionsResult = await pool.query(
  "SELECT * FROM emotion_logs WHERE session_id = $1",
  [sessionId]
);

const emotions = emotionsResult.rows || [];

    res.json({
      session,
      video,
      emotions,
    });

  } catch (err) {
    console.error("❌ REPORT ERROR FULL:", err.message, err.stack);

res.status(500).json({
  error: "Failed to load report",
  details: err.message,
});
  }
});

export default router;
import { Router } from "express";
import { query } from "../config/db.js";
import { getRecentSessions } from "../controllers/dashboard.controller.js";



const router = Router();
router.get("/recent-sessions", getRecentSessions);
/*router.get("/session", async (req, res) => {
  try {
    const result = await query(`
      SELECT id, video_id, started_at
      FROM learning_sessions
      ORDER BY started_at DESC
      LIMIT 10
    `);

    res.json({ sessions: result.rows });
  } catch (err) {
    console.error("Dashboard session error:", err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});
*/

export default router;

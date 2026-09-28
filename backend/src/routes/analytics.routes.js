/*
import express from "express";
import { getEmotionAnalytics } from "../controllers/analytics.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getEmotionAnalytics);


export default router;
*/

import express from "express";
import { 
  getEmotionAnalytics,
  getEmotionTimeline,
  getAdminOverview
} from "../controllers/analytics.controller.js";
import { getUsersAnalytics } from "../controllers/analytics.controller.js";
import { auth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import { query } from "../config/db.js";
const router = express.Router();
router.get("/users", getUsersAnalytics);
router.get("/", getEmotionAnalytics);
router.get("/timeline/:sessionId", getEmotionTimeline);
router.get("/admin-overview", getAdminOverview);
router.get("/recent-activity", async (req, res) => {
  try {

    const result = await query(`
      SELECT user_id, started_at
      FROM learning_sessions
      ORDER BY started_at DESC
      LIMIT 10
    `);

    const activity = result.rows.map((row) => ({
      message: `User ${row.user_id} completed a session`,
      created_at: row.started_at
    }));

    res.json(activity);

  } catch (err) {
    console.error("RECENT ACTIVITY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

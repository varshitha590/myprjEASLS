import { Router } from "express";
import { query } from "../config/db.js";
import { pool } from "../config/db.js";
import { blockUser, unblockUser } from "../controllers/auth.controllers.js";
import { auth } from "../middleware/auth.js";
const router = Router();

router.post("/check-admin", async (req, res) => {
  const { email } = req.body;

  const result = await query(
    "SELECT role FROM users WHERE email = $1",
    [email]
  );

  if (!result.rows.length) {
    return res.json({ isAdmin: false });
  }

  const role = result.rows[0].role;

  res.json({ isAdmin: role === "admin" });
});

router.get("/overview", async (req, res) => {
  try {
    const totalUsers = await pool.query("SELECT COUNT(*) FROM users");
    const totalVideos = await pool.query("SELECT COUNT(*) FROM videos");
    const totalSessions = await pool.query("SELECT COUNT(*) FROM learning_sessions");

    const avgEngagement = await pool.query(`
      SELECT AVG(average_engagement_score) 
      FROM learning_sessions
    `);

    res.json({
      totalUsers: totalUsers.rows[0].count,
      totalVideos: totalVideos.rows[0].count,
      totalSessions: totalSessions.rows[0].count,
      avgEngagement: avgEngagement.rows[0].avg
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/videos", async (req, res) => {
  const { title, description, video_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO videos(title,description,video_url)
       VALUES($1,$2,$3)
       RETURNING id`,
      [title, description, video_url]
    );

    const videoId = result.rows[0].id;

    res.json({
      message: "Video uploaded successfully",
      video_id: videoId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.post("/check-user", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await query(
      "SELECT is_blocked FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      is_blocked: result.rows[0].is_blocked
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/users/:id/block", auth, blockUser);
router.patch("/users/:id/unblock", auth, unblockUser);

export default router;
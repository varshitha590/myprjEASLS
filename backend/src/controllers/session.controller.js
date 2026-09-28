import { pool } from "../config/db.js";

/* =========================
   START SESSION
========================= */
export async function startSession(req, res) {
  try {
    const { video_id, user_id } = req.body;

    if (!video_id || !user_id) {
      return res.status(400).json({ message: "video_id and user_id required" });
    }

    const { rows } = await pool.query(
      `INSERT INTO learning_sessions (user_id, video_id, started_at)
       VALUES ($1, $2, NOW())
       RETURNING id, started_at`,
      [user_id, video_id]
    );

    res.json({
      session: rows[0],
    });
  } catch (err) {
    console.error("startSession error:", err);
    res.status(500).json({ message: "Failed to start session" });
  }
}



/* =========================
   END SESSION
========================= */
/*
export async function endSession(req, res) {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: "session_id required" });
    }

    await pool.query(
      `UPDATE learning_sessions
      SET ended_at = NOW()
      WHERE id = $1`,
      [session_id]
    );


    res.json({ message: "Session ended" });
  } catch (err) {
    console.error("endSession error:", err);
    res.status(500).json({ message: "Failed to end session" });
  }
}*/
export async function endSession(req, res) {
  try {
    const { sessionId } = req.body;

    // Count emotion frequency
    const result = await pool.query(`
      SELECT emotion, COUNT(*) as count
      FROM emotion_logs
      WHERE session_id = $1
      GROUP BY emotion
    `, [sessionId]);

    const emotions = result.rows;

    let total = 0;
    let weightedScore = 0;
    let dominantEmotion = null;
    let maxCount = 0;

    emotions.forEach(e => {
      const count = parseInt(e.count);
      total += count;

      // Engagement weights
      const weightMap = {
        HAPPY: 1,
        NEUTRAL: 0.7,
        CONFUSED: 0.4,
        SAD: 0.3,
        ANGRY: 0.2,
        FEARFUL: 0.2
      };

      const weight = weightMap[e.emotion] || 0.5;

      weightedScore += count * weight;

      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = e.emotion;
      }
    });

    const averageScore =
      total > 0 ? (weightedScore / total).toFixed(2) : 0;

    await pool.query(`
      UPDATE learning_sessions
      SET ended_at = NOW(),
          average_engagement_score = $1,
          dominant_emotion = $2
      WHERE id = $3
    `, [averageScore, dominantEmotion, sessionId]);

    res.json({
      message: "Session ended",
      averageScore,
      dominantEmotion
    });

  } catch (err) {
    console.error("endSession error:", err);
    res.status(500).json({ message: "Failed to end session" });
  }
}

/* =========================
   DASHBOARD SESSIONS (NO AUTH FOR NOW)
========================= */
export async function getUserSessions(req, res) {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "user_id required" });
    }
    const result = await pool.query(`
      SELECT
        ls.id,
        ls.started_at,
        v.title AS video_title,
        ls.average_engagement_score,
        ls.dominant_emotion
      FROM learning_sessions ls
      JOIN videos v ON v.id = ls.video_id
      WHERE ls.user_id = $1
      ORDER BY ls.started_at DESC
      LIMIT 10;
    `, [user_id]);

    res.json(result.rows);
  } catch (err) {
    console.error("getUserSessions error:", err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
}

import { query } from "../config/db.js";

/**
 * Log detected emotion for a session
 */
export async function logEmotion(req, res) {
  try {
    const userId = req.body.user_id || null;
    // const sessionCheck = await query(
    //   `SELECT id FROM learning_sessions
    //    WHERE id = $1 AND user_id = $2`,
    //   [session_id, userId]
    // );

    const { session_id, emotion, confidence } = req.body;

    if (!session_id || !emotion) {
      return res.status(400).json({
        message: "session_id and emotion are required",
      });
    }

    // Ensure session belongs to logged-in user
    const sessionCheck = await query(
     `SELECT id FROM learning_sessions WHERE id = $1`,
      [session_id]
    );


    if (sessionCheck.rowCount === 0) {
      return res.status(403).json({
        message: "Invalid or unauthorized session",
      });
    }

    await query(
  `INSERT INTO emotion_logs (session_id, emotion, confidence)
   VALUES ($1, $2, $3)`,
  [session_id, emotion, confidence]
);

// ✅ UPDATE dominant emotion
await query(`
  UPDATE learning_sessions
  SET dominant_emotion = (
    SELECT emotion
    FROM emotion_logs
    WHERE session_id = $1
    GROUP BY emotion
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  WHERE id = $1
`, [session_id]);

await query(`
  UPDATE learning_sessions
  SET average_engagement_score = sub.avg_score
  FROM (
    SELECT session_id, AVG(confidence) AS avg_score
    FROM emotion_logs
    WHERE session_id = $1
    GROUP BY session_id
  ) sub
  WHERE learning_sessions.id = sub.session_id
`, [session_id]);

    res.status(201).json({
      message: "Emotion logged successfully",
    });
  } catch (err) {
    console.error("Emotion log error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

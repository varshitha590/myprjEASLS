import { pool } from "../config/db.js";

export const getRecentSessions = async (req, res) => {
  try {
    const { user_id } = req.query;

const { rows } = await pool.query(`
  SELECT 
    ls.id,
    ls.started_at,
    v.title,
    v.video_url,
    ls.average_engagement_score,
    (
      SELECT emotion 
      FROM emotion_logs 
      WHERE session_id = ls.id 
      GROUP BY emotion 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) AS dominant_emotion
  FROM learning_sessions ls
  JOIN videos v ON ls.video_id = v.id
  LEFT JOIN emotion_logs el ON el.session_id = ls.id
  WHERE ls.user_id = $1
  GROUP BY ls.id, ls.started_at, v.title, v.video_url
  ORDER BY ls.started_at DESC
  LIMIT 10
`, [user_id]);



    res.json(rows);
  } catch (err) {
  console.error("DASHBOARD ERROR:", err);
  res.status(500).json({ error: err.message });
}

};

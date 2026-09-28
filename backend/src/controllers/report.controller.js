import { query } from "../config/db.js";

export async function generateReport(req, res) {
  const { sessionId } = req.params;

  try {
    const session = await query(
      `SELECT * FROM learning_sessions WHERE id = $1`,
      [sessionId]
    );

    const emotions = await query(
      `SELECT * FROM emotion_logs WHERE session_id = $1`,
      [sessionId]
    );

    const video = await query(
      `SELECT * FROM videos WHERE id = $1`,
      [session.rows[0].video_id]
    );

    res.json({
      session: session.rows[0],
      emotions: emotions.rows,
      video: video.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Report generation failed" });
  }
}
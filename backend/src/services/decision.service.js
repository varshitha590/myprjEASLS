import {pool} from "../config/db.js";

export async function evaluateSession(sessionId) {
  const { rows } = await pool.query(
    `
    SELECT emotion, confidence
    FROM emotion_logs
    WHERE session_id = $1
    ORDER BY created_at DESC
    LIMIT 5
    `,
    [sessionId]
  );

  if (rows.length < 5) return { action: "NONE" };

  const allNeutral = rows.every(
    r => r.emotion === "Neutral" && r.confidence > 0.6
  );

  if (allNeutral) {
    return {
      action: "ASK_USER",
      message: "Are you able to understand?"
    };
  }

  return { action: "CONTINUE" };
}

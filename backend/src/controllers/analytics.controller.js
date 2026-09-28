
import { pool } from "../config/db.js";

/*
export const getEmotionAnalytics = async (req, res) => {
  try {
    const { user_id } = req.query;
    const { rows } = await pool.query(
      `SELECT el.emotion, el.confidence, el.captured_at, v.title AS topic 
       FROM emotion_logs el 
       JOIN learning_sessions ls ON el.session_id = ls.id 
       JOIN videos v ON ls.video_id = v.id 
       WHERE ls.user_id = $1 
       ORDER BY el.captured_at`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analytics fetch failed" });
  }
};
*/

export const getEmotionAnalytics = async (req, res) => {
  try {
    const { user_id, session_id } = req.query;

    let query = `
      SELECT
        el.session_id,
        el.emotion,
        el.confidence,
        el.captured_at,
        v.title AS topic,
        v.video_url
      FROM emotion_logs el
      JOIN learning_sessions ls ON el.session_id = ls.id
      JOIN videos v ON ls.video_id = v.id
      WHERE ls.user_id = $1
    `;

    const params = [user_id];

    if (session_id) {
      query += ` AND ls.id = $2`;
      params.push(session_id);
    }

    query += ` ORDER BY el.captured_at`;

    const { rows } = await pool.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analytics fetch failed" });
  }
};



export const getEmotionTimeline = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { rows } = await pool.query(
      `
      SELECT emotion, confidence, captured_at
      FROM emotion_logs
      WHERE session_id = $1
      ORDER BY captured_at
      `,
      [sessionId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Timeline fetch failed" });
  }
};

export const getAdminOverview = async (req, res) => {
  try {
    const { range } = req.query;

    let dateFilter = "";

    if (range === "7") {
      dateFilter = "WHERE started_at >= NOW() - INTERVAL '7 days'";
    } else if (range === "30") {
      dateFilter = "WHERE started_at >= NOW() - INTERVAL '30 days'";
    }

    const totalUsers = await pool.query(`SELECT COUNT(*) FROM users`);

    const totalSessions = await pool.query(
      `SELECT COUNT(*) FROM learning_sessions ${dateFilter}`
    );

    const avgEngagement = await pool.query(
      `SELECT AVG(average_engagement_score)
       FROM learning_sessions ${dateFilter}`
    );

    const confusionCount = await pool.query(`
      SELECT COUNT(*) FROM emotion_logs
      WHERE emotion IN ('CONFUSED','STRESSED')
    `);

    const emotionDistribution = await pool.query(`
      SELECT emotion, COUNT(*) as count
      FROM emotion_logs
      GROUP BY emotion
    `);

    const engagementTrend = await pool.query(`
  SELECT 
    DATE(started_at) as date,

    AVG(
      CASE 
        WHEN started_at >= NOW() - INTERVAL '7 days'
        THEN average_engagement_score
      END
    ) as current_avg,

    AVG(
      CASE 
        WHEN started_at >= NOW() - INTERVAL '14 days'
        AND started_at < NOW() - INTERVAL '7 days'
        THEN average_engagement_score
      END
    ) as previous_avg

  FROM learning_sessions
  GROUP BY DATE(started_at)
  ORDER BY date ASC
`);

    res.json({
      totalUsers: totalUsers.rows[0].count,
      totalSessions: totalSessions.rows[0].count,
      avgEngagement: avgEngagement.rows[0].avg,
      confusionEvents: confusionCount.rows[0].count,
      emotionDistribution: emotionDistribution.rows,
      engagementTrend: engagementTrend.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Admin overview failed" });
  }
};
/*
export const getUsersAnalytics = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.id,
        u.email,
        COUNT(DISTINCT ls.id) as total_sessions,
        ROUND(AVG(el.confidence)::numeric, 2) as avg_engagement,
        COUNT(CASE WHEN el.emotion = 'CONFUSED' THEN 1 END) as confusion_events
      FROM users u
      LEFT JOIN learning_sessions ls ON ls.user_id = u.id
      LEFT JOIN emotion_logs el ON el.session_id = ls.id
      GROUP BY u.id, u.email
      ORDER BY total_sessions DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Users analytics fetch failed" });
  }

};
*/
export const getUsersAnalytics = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
  u.id,
  u.email,
  u.is_blocked,
  COUNT(ls.id) AS total_sessions,
  AVG(ls.average_engagement_score) AS avg_engagement,
  COUNT(el.id) FILTER (
    WHERE el.emotion IN ('CONFUSED','STRESSED')
  ) AS confusion_events
FROM users u
LEFT JOIN learning_sessions ls 
  ON u.id = ls.user_id
LEFT JOIN emotion_logs el 
  ON ls.id = el.session_id
GROUP BY u.id
ORDER BY total_sessions DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Users analytics fetch failed" });
  }
};

import { pool } from "../config/db.js";

export async function ensureUser(req, res, next) {
  try {
    const { id, email } = req.user;

    // 🔎 Check if user already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (id, email) VALUES ($1, $2)",
        [id, email]
      );
      console.log("✅ New user inserted");
    } else {
      console.log("ℹ️ User already exists");
    }

    next();
  } catch (err) {
    console.error("ensureUser error:", err);
    next(err);
  }
}
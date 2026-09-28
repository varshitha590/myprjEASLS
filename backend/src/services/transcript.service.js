/*import { query } from "../config/db.js";
import fs from "fs";
import path from "path";

export async function getFullTranscript(videoId) {
  try {
    // 1️⃣ Get transcript path from videos table
    const result = await query(
      `SELECT transcript_path FROM videos WHERE id = $1`,
      [videoId]
    );

    if (!result.rows.length) {
      return [];
    }

    const transcriptPath = result.rows[0].transcript_path;

    if (!transcriptPath) {
      return [];
    }

    // 2️⃣ Build full absolute path
    const fullPath = path.join(process.cwd(), transcriptPath);

    if (!fs.existsSync(fullPath)) {
      console.error("Transcript file not found:", fullPath);
      return [];
    }

    // 3️⃣ Read SRT file
    const fileContent = fs.readFileSync(fullPath, "utf-8");

    return [
      {
        text: fileContent
      }
    ];

  } catch (error) {
    console.error("Transcript service error:", error);
    return [];
  }
}

export async function getTranscriptAtTime() {
  return null;
}
*/

import { query } from "../config/db.js";

export async function getFullTranscript(videoId) {
  try {

    const result = await query(
      `
      SELECT start_time, end_time, text
      FROM transcripts
      WHERE video_id = $1
      ORDER BY start_time
      `,
      [videoId]
    );

    return result.rows;

  } catch (error) {

    console.error("Transcript service error:", error);

    return [];

  }
}

export async function getTranscriptAtTime(videoId, currentTime) {

  try {

    const result = await query(
      `
      SELECT text
      FROM transcripts
      WHERE video_id = $1
      AND start_time <= $2
      AND end_time >= $2
      LIMIT 1
      `,
      [videoId, currentTime]
    );

    return result.rows[0] || null;

  } catch (error) {

    console.error("Transcript time query error:", error);

    return null;

  }

}
import { query } from "../config/db.js";
import fs from "fs";
import SrtParser from "srt-parser-2";
//import { transcribeAudio } from "../services/transcript.service.js";
//import { transcribeAudio } from "../services/transcript.service.js";
import { exec } from "child_process";
import { transcribeLocal } from "../services/localwhisper.service.js";
import ytdlp from "yt-dlp-exec";
import path from "path";
import { pool } from "../config/db.js";


fs.mkdirSync(
  path.join(process.cwd(), "uploads", "transcripts"),
  { recursive: true }
);

export async function getVideos(req, res) {

  try {

    const result = await query(`
      SELECT id, title, description, duration_seconds, video_url
      FROM videos
      ORDER BY created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {

    console.error("Fetch videos error", err);

    res.status(500).json({
      message: "Failed to fetch videos"
    });

  }

}
/*
export async function generateTranscript(req, res) {

  try {

    const transcript = await transcribeAudio();

    res.json({
      success: true,
      transcript: transcript
    });

  } catch (error) {

    console.error("Transcript error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

}
*/

export const addVideo = async (req, res) => {
  try {
    console.log("BODY:", req.body);
console.log("FILE:", req.file);
    const { title, video_url, duration_seconds } = req.body;
    console.log("ADD VIDEO API HIT");

    if (!title || !video_url) {
  return res.status(400).json({ message: "Missing fields" });
}
    // ✅ Check duplicate
    const exists = await pool.query(
      "SELECT id FROM videos WHERE video_url = $1",
      [video_url]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({ message: "Video already exists" });
    }

    // 🔥 FETCH DURATION FROM YOUTUBE
    // ✅ PRIORITY: use frontend duration
let duration = Number(duration_seconds) || 0;

// 🔄 fallback (optional safety)
if (!duration) {
  console.log("Fallback: fetching duration from yt-dlp...");

  try {
    const meta = await ytdlp(video_url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
    });

    duration = meta.duration || 0;
    console.log("Fallback duration:", duration);

  } catch (err) {
    console.error("yt-dlp fallback error:", err.message);
  }
}

    // ✅ INSERT WITH DURATION
    const result = await pool.query(
  `INSERT INTO videos (title, video_url, duration_seconds)
   VALUES ($1, $2, $3)
   RETURNING *`,
  [title, video_url, duration]
);

const videoId = result.rows[0].id;


if (req.file) {
  try {
    const filePath = req.file.path;

    const fileContent = fs.readFileSync(filePath, "utf-8");

    const parser = new SrtParser();
    const srtData = parser.fromSrt(fileContent);

    for (const item of srtData) {
      const start = convertTimeToSeconds(item.startTime);
      const end = convertTimeToSeconds(item.endTime);
      const text = item.text;

      await pool.query(
        `INSERT INTO transcripts (video_id, start_time, end_time, text)
         VALUES ($1, $2, $3, $4)`,
        [videoId, start, end, text]
      );
    }

    console.log("✅ Transcript inserted:", srtData.length);

  } catch (err) {
    console.error("SRT parse error:", err);
  }
}

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Add video error:", err);
    res.status(500).json({ message: "Failed to add video" });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    await query(
  "DELETE FROM videos WHERE id = $1",
  [id]
);

    res.json({ message: "Video deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};


function convertTimeToSeconds(time) {

  const [h, m, s] = time.replace(",", ".").split(":");

  return (
    Number(h) * 3600 +
    Number(m) * 60 +
    Number(s)
  );

}

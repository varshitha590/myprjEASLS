import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const FOLDER = "./uploads/transcripts";

function timeToSeconds(timeStr) {
  const parts = timeStr.split(":");
  const secondsParts = parts[2].split(",");

  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseInt(secondsParts[0]);
  const milliseconds = parseInt(secondsParts[1]);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

async function insertTranscripts() {
  try {
    const files = fs.readdirSync(FOLDER);

    for (const file of files) {
      if (!file.endsWith(".srt")) continue;

      const VIDEO_ID = file.replace(".srt", "");
      const FILE_PATH = path.join(FOLDER, file);

      console.log("Processing:", file);

      const content = fs.readFileSync(FILE_PATH, "utf8");
      const blocks = content
  .replace(/\r/g, "")
  .split(/\n\s*\n/);

      let count = 0;

      for (const block of blocks) {
        const lines = block.split("\n");

        if (lines.length < 3) continue;

        const timeLine = lines[1];
        const text = lines
  .slice(2)
  .join(" ")
  .replace(/\d{2}:\d{2}:\d{2},\d{3}\s-->\s\d{2}:\d{2}:\d{2},\d{3}/, "")
  .trim();

        const times = timeLine.split(" --> ");

        const start = timeToSeconds(times[0]);
        const end = timeToSeconds(times[1]);

        await pool.query(
          `INSERT INTO transcripts (video_id, start_time, end_time, text)
           VALUES ($1, $2, $3, $4)`,
          [VIDEO_ID, start, end, text]
        );

        count++;
      }

      console.log(`Inserted ${count} transcript rows for video ${VIDEO_ID}`);
    }

    process.exit();
  } catch (err) {
    console.error("Error:", err);
  }
}

insertTranscripts();
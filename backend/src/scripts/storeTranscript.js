import fs from "fs";
import readline from "readline";
import { query } from "../config/db.js";


// CHANGE THIS
const VIDEO_ID = "PASTE_VIDEO_ID_HERE";


// CHANGE THIS
const FILE_PATH = "C:/Users/kanne/1. Introduction to Algorithms [0IAPZzGSbME].txt";



function timeToSeconds(timeStr) {

  const parts = timeStr.split(":");

  const hours = parseFloat(parts[0]);
  const minutes = parseFloat(parts[1]);
  const seconds = parseFloat(parts[2]);

  return hours * 3600 + minutes * 60 + seconds;
}



async function storeTranscript() {

  const fileStream = fs.createReadStream(FILE_PATH);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {

    if (!line.includes("-->")) continue;

    const match = line.match(
      /\[(.*?) --> (.*?)\]\s*(.*)/
    );

    if (!match) continue;

    const start = timeToSeconds(match[1]);
    const end = timeToSeconds(match[2]);
    const text = match[3];

    await query(
      `
      INSERT INTO transcripts
      (video_id, start_time, end_time, text)
      VALUES ($1,$2,$3,$4)
      `,
      [VIDEO_ID, start, end, text]
    );

    console.log("Inserted:", text);

  }

  console.log("Transcript stored successfully");

  process.exit();
}


storeTranscript();

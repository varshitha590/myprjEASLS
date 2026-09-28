import fs from "fs";

function timeToSeconds(time) {
  const [h, m, s] = time.replace(",", ".").split(":");
  return (
    parseInt(h) * 3600 +
    parseInt(m) * 60 +
    parseFloat(s)
  );
}

export function parseSRT(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  const regex =
    /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\s+([\s\S]*?)(?=\n\n|\n\d+\n|$)/g;

  const results = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    results.push({
      start: timeToSeconds(match[1]),
      end: timeToSeconds(match[2]),
      text: match[3].replace(/\n/g, " ").trim(),
    });
  }

  return results;
}
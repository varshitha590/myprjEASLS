import { exec } from "child_process";
import path from "path";

export function transcribeLocal(audioPath) {

  return new Promise((resolve, reject) => {

    const outputDir = path.join(process.cwd(), "uploads", "transcripts");

    const command = `whisper "${audioPath}" --model base --output_format srt --output_dir "${outputDir}"`;

    console.log("Running whisper:", command);

    exec(command, (error, stdout, stderr) => {
      console.log("Whisper command:", command);
      if (error) {
        console.error("Whisper error:", error);
        reject(error);
        return;
      }

      console.log("Whisper finished");

      resolve(true);

    });

  });

}
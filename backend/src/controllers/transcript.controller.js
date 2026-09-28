import {
  getTranscriptAtTime,
  getFullTranscript
} from "../services/transcript.service.js";


export async function getTranscriptLine(req, res) {

  try {

    const { videoId, currentTime } = req.params;

    const data = await getTranscriptAtTime(videoId, currentTime);

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({ error: "Failed to fetch transcript line" });

  }
}



export async function getTranscript(req, res) {

  try {

    const { videoId } = req.params;

    const data = await getFullTranscript(videoId);

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({ error: "Failed to fetch transcript" });

  }
}

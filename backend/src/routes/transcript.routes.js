import express from "express";

import {
  getTranscript,
  getTranscriptLine
} from "../controllers/transcript.controller.js";

const router = express.Router();
// transcript at specific time
router.get("/:videoId/:currentTime", getTranscriptLine);

// FULL transcript
router.get("/:videoId", getTranscript);


export default router;

import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { pool } from "../config/db.js";
import { addVideo, deleteVideo } from "../controllers/video.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import ytdlp from "yt-dlp-exec";
const router = Router();

/* =========================
   MULTER SETUP
========================= */

const uploadDir = path.join("uploads", "transcripts");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith(".srt")) {
      cb(null, true);
    } else {
      cb(new Error("Only .srt files allowed"));
    }
  },
});

/* =========================
   GET ALL VIDEOS
========================= */

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      " SELECT id, title, description, duration_seconds, video_url, created_at FROM videos ORDER BY created_at DESC"
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch videos error:", err);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
});

router.get("/meta", async (req,res)=>{
  try{

    const { url } = req.query;

    const meta = await ytdlp(url,{
      dumpSingleJson:true,
      noWarnings:true,
      noCallHome:true
    });

    res.json({
      title: meta.title,
      duration: meta.duration
    });

  }catch(err){
    console.error(err);
    res.status(500).json({message:"Meta fetch failed"});
  }
});


/* =========================
   GET SINGLE VIDEO
========================= */

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, description, video_url FROM videos WHERE id=$1",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Fetch video error:", err);
    res.status(500).json({ message: "Failed to fetch video" });
  }
});

/* =========================
   ADD VIDEO
========================= */

router.post("/", upload.single("transcript"), auth, addVideo);
router.delete("/:id", auth, deleteVideo);




export default router;
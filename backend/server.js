import dotenv from "dotenv";
dotenv.config();   // MUST be first
console.log("SUPABASE URL:", process.env.SUPABASE_URL);
import app from "./src/app.js";
import express from "express";
import sessionRoutes from "./src/routes/session.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import emotionRoutes from "./src/routes/emotion.routes.js"; // ✅
import transcriptRoutes from "./src/routes/transcript.routes.js";
import explanationRoutes from "./src/routes/explanation.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import videoRoutes from "./src/routes/video.routes.js";
import path from "path";
import reportRoutes from "./src/routes/report.routes.js";


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use("/dashboard", dashboardRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/emotions", emotionRoutes);   // ✅ VERY IMPORTANT
app.use("/api/transcripts", transcriptRoutes);
app.use("/explanations", explanationRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api", adminRoutes);
app.use("/api/report", reportRoutes);
//app.use("/upload", express.static("uploads"));
console.log("OPENAI KEY EXISTS:", !!process.env.OPENAI_API_KEY);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
  //console.log(`🚀 Backend running on http://localhost:${PORT}`)
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import emotionRoutes from "./routes/emotion.routes.js";
import decisionRoutes from "./routes/decision.routes.js";
import explanationRoutes from "./routes/explanation.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import videoRoutes from "./routes/video.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import transcriptRoutes from "./routes/transcript.routes.js";
import adminRoutes from "./routes/admin.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/health", healthRoutes);
app.use("/sessions", sessionRoutes);
app.use("/videos", videoRoutes);
app.use("/emotions", emotionRoutes);
app.use("/decision", decisionRoutes);
app.use("/explanations", explanationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/admin", adminRoutes);
export default app;

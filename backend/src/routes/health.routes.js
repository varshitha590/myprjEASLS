import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "OK", backend: "ELS running" });
});

export default router;

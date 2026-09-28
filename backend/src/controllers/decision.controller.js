import { evaluateSession } from "../services/decision.service.js";

export async function decide(req, res) {
  try {
    const { session_id } = req.body;

    const decision = await evaluateSession(session_id);
    res.json(decision);
  } catch (err) {
    console.error("Decision error", err);
    res.status(500).json({ message: "Decision engine failed" });
  }
}

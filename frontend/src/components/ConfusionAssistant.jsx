import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function getSuggestion(emotion) {
  switch (emotion) {
    case "SAD":
    case "FEARFUL":
      return "Here’s a simpler explanation with visuals.";

    case "ANGRY":
      return "Let’s try a real-world example.";

    case "NEUTRAL":
      return "Let’s do a quick recap or quiz.";

    default:
      return "Let’s continue.";
  }
}

export default function ConfusionAssistant({
  open,
  onClose,
  onResume,
  videoId,
  emotion,
  transcriptLine,
  onExplanationGenerated,
}) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);

  useEffect(() => {
    if (!open) {
      setExplanation(null);
      setLoading(false);
    }
  }, [open]);

async function handleYes() {

  if (!transcriptLine) {
    console.error("Transcript is empty");
    setExplanation("Transcript not available yet. Please wait a moment.");
    return;
  }

  setLoading(true);
  console.log("TranscriptLine value:", transcriptLine);

  try {

    console.log("Sending transcript:", transcriptLine);

    const res = await apiRequest("/explanations/explain", {
      method: "POST",
      body: JSON.stringify({
        transcript: transcriptLine,
        emotion: emotion || "CONFUSED"
      }),
    });

    console.log("Explanation result:", res);

    setExplanation(res.explanation);

    onExplanationGenerated?.(res.explanation);

  } catch (err) {

    console.error("Explanation failed:", err);

    const msg = "Failed to generate explanation.";

    setExplanation(msg);

    onExplanationGenerated?.(msg);

  } finally {

    setLoading(false);

  }
}

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={card}>
        {!explanation ? (
          <>
            <div style={badge}>AI Coach</div>

            <h3 style={title}>Looks like this part is tricky</h3>
            <p style={subtitle}>
              Want a simpler explanation in plain language?
            </p>

            <div style={actions}>
              <button style={primaryBtn} onClick={handleYes}>
                ✨ Simplify it
              </button>
              <button
                style={secondaryBtn}
                onClick={() => {
                  onClose();
                  onResume();
                }}
              >
                Continue video
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={badge}>Simplified</div>

            <h3 style={title}>Here’s the idea, broken down</h3>

            <div style={explanationBox}>
              {loading ? (
                <span style={{ opacity: 0.7 }}>Thinking…</span>
              ) : (
                explanation
              )}
            </div>

            <button
              style={{ ...primaryBtn, marginTop: 18, background: "#16a34a" }}
              onClick={() => {
                onClose();
                onResume();
              }}
            >
              ▶ Resume learning
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ========================= */
/* 🎨 Enhanced Popup Styles */
/* ========================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.72)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  animation: "fadeIn 0.25s ease-out",
};

const card = {
  width: 460,
  maxHeight: "80vh",
  overflow: "hidden",
  background:
    "linear-gradient(180deg, rgba(2,6,23,0.96), rgba(2,6,23,0.98))",
  borderRadius: 20,
  padding: "30px 28px",
  color: "#e5e7eb",
  boxShadow:
    "0 40px 90px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(148,163,184,0.08)",
  position: "relative",
  animation: "scaleIn 0.25s ease-out",
};

const badge = {
  position: "absolute",
  top: 18,
  right: 18,
  fontSize: 11,
  padding: "4px 10px",
  borderRadius: 999,
  background: "rgba(30,41,59,0.9)",
  color: "#93c5fd",
  letterSpacing: "0.04em",
};

const title = {
  marginTop: 10,
  fontSize: 22,
  fontWeight: 600,
};

const subtitle = {
  marginTop: 10,
  fontSize: 14,
  opacity: 0.85,
  lineHeight: 1.7,
};

const actions = {
  display: "flex",
  gap: 12,
  marginTop: 24,
};

const primaryBtn = {
  flex: 1,
  padding: "11px 14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#2563eb,#3b82f6)",
  color: "#fff",
  fontWeight: 500,
  cursor: "pointer",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
};

const secondaryBtn = {
  flex: 1,
  padding: "11px 14px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.25)",
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

const explanationBox = {
  marginTop: 18,
  padding: "18px 18px",
  background: "rgba(2,6,23,0.9)",
  border: "1px solid rgba(148,163,184,0.15)",
  borderRadius: 14,
  fontSize: 14,
  lineHeight: 1.8,
  whiteSpace: "pre-wrap",
  maxHeight: "42vh",
  overflowY: "auto",
  boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.05)",
};

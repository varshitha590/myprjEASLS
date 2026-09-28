/*
import { generateExplanation } from "../services/explanation.service.js";

export async function explain(req, res) {
  try {
    const { topic, emotion, confidence } = req.body;

    const explanation = await generateExplanation({
      topic,
      emotion,
      confidence,
    });

    res.json({ explanation });
  } catch (err) {
    console.error("LLM explanation error", err);
    res.status(500).json({ message: "Failed to generate explanation" });
  }
}


import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "Emotion Learning App"
  }
});

export async function explain(req, res) {
  console.log("REQ BODY:", req.body);

  try {
    const { transcript, emotion } = req.body;

    if (!transcript) {
      return res.status(400).json({
        message: "Transcript required"
      });
    }

    const prompt = `
Student is watching a lecture.

Transcript:
"${transcript}"

Student emotion: ${emotion}

Explain this in very simple words with one short example.
Keep explanation clear and under 120 words.
`;

    const completion = await client.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert teacher explaining concepts simply."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150
    });

    const explanation =
      completion.choices?.[0]?.message?.content || "Explanation unavailable.";

    res.json({ explanation });

  } catch (err) {
    console.error("Explanation error FULL:", err.response?.data || err.message);

    res.status(500).json({
      message: "Failed to generate explanation"
    });
  }
}
  */
 

import OpenAI from "openai";
import { pool } from "../config/db.js"; // only needed if you later store explanation

// ✅ OpenRouter client setup
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "Emotion Aware Learning System"
  }
});

export async function explain(req, res) {
  console.log("REQ BODY:", req.body);

  try {
    const { transcript, emotion, confidence } = req.body;

    if (!transcript) {
      return res.status(400).json({
        message: "Transcript required"
      });
    }

    /* =====================================
       🧠 Adaptive Tone Based On Emotion
    ====================================== */

    let instructionTone = "";

    // 🔥 If model confidence is low → simplify more
    if (confidence && confidence < 0.5) {
      instructionTone += `
Keep explanation extremely simple.
Use very basic language.
Break into very small steps.
`;
    }

    switch (emotion) {
      case "CONFUSED":
      case "SAD":
        instructionTone += `
Explain like teaching a 10-year-old.
Use a simple analogy.
Break the concept step-by-step.
`;
        break;

      case "STRESSED":
      case "FEARFUL":
        instructionTone += `
Use a calm and reassuring tone.
Encourage the student.
Keep explanation short and comforting.
`;
        break;

      case "ANGRY":
        instructionTone += `
Be direct and practical.
Use a real-world example.
Keep it clear and short.
`;
        break;

      case "BORED":
        instructionTone += `
Make it interesting.
Use an engaging real-life example.
Keep it short and impactful.
`;
        break;

      case "NEUTRAL":
      default:
        instructionTone += `
Give a quick recap in simple words with one example.
`;
    }

    /* =====================================
       📜 Prompt
    ====================================== */

    const prompt = `
Student is watching a lecture.

Transcript:
"${transcript}"

Student emotion: ${emotion}

${instructionTone}

Keep explanation under 120 words.
`;

    /* =====================================
       🤖 Call OpenRouter
    ====================================== */

    const completion = await client.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // stable model
      messages: [
        {
          role: "system",
          content: "You are an expert teacher who explains concepts very clearly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150
    });

    const explanation =
      completion.choices?.[0]?.message?.content ||
      "Explanation unavailable.";

    console.log("Generated Explanation:", explanation);

    /* =====================================
       🗄 OPTIONAL: Save Explanation To DB
       (Only if you want analytics)
    ====================================== */

    /*
    if (req.body.sessionId) {
      await pool.query(
        `UPDATE learning_sessions
         SET last_explanation = $1
         WHERE id = $2`,
        [explanation, req.body.sessionId]
      );
    }
    */

    res.json({ explanation });

  } catch (err) {
    console.error("Explanation error FULL:", err.response?.data || err.message);

    res.status(500).json({
      message: "Failed to generate explanation"
    });
  }
}
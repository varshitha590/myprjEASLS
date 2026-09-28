import fetch from "node-fetch";

export async function generateExplanation({
  topic,
  transcript,
  emotion = "CONFUSED",
  confidence = 0.5,
}) {
  // 🔑 Decide grounding source
  let explanationTarget;

  if (transcript && transcript.trim().length > 0) {
    explanationTarget = `
The learner got confused while hearing this part of the video:
"${transcript}"
`;
  } else if (topic && topic.trim().length > 0) {
    explanationTarget = `
The learner is watching a video about:
"${topic}"
`;
  } else {
    return "Let’s slow down and revisit this step carefully.";
  }

  const prompt = `
${explanationTarget}

Detected emotion: ${emotion}
Confidence score: ${confidence}

Explain this in very simple, beginner-friendly terms.
Use short steps and a simple example or analogy.
Avoid jargon.
Keep it concise.
`;

  console.log("KEY CHECK:", process.env.OPENROUTER_API_KEY);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "ELS",
      },
      body: JSON.stringify({
        model: "arcee-ai/trinity-large-preview:free",
      //  model: "openrouter/free",
        messages: [
          { role: "system", content: "You are a patient teaching assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    const data = await res.json();

    console.log("OPENROUTER STATUS:", res.status, res.statusText);
    console.log(
      "OPENROUTER RAW RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    const text = data?.choices?.[0]?.message?.content;

    return (
      text ||
      "Let’s slow down and go over the main idea step by step."
    );
  } catch (err) {
    console.error("OpenRouter LLM error:", err.message);
    return "Let’s pause and focus on the core idea carefully.";
  }
}
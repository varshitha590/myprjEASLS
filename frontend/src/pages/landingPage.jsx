import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/landing.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <section className="hero">
        <div className="hero-left">
          <h1>
            Emotion-Adaptive <br /> Smart Learning System
          </h1>
          <p>
            An AI-powered platform that understands your emotions while learning
            and provides real-time explanations to keep you engaged and focused.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/register")}>Get Started</button>
            <button
              className="outline"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="brain-animation"></div>
        </div>
      </section>

      <section className="features">
        <h2>How It Works</h2>
        <div className="feature-grid">
          <div className="card">
            <h3>📺 Watch Any Lesson</h3>
            <p>Search and stream educational videos directly from YouTube.</p>
          </div>

          <div className="card">
            <h3>😊 AI Reads Your Emotions</h3>
            <p>
              Your webcam detects confusion, boredom, stress, and engagement in
              real-time.
            </p>
          </div>

          <div className="card">
            <h3>💡 Instant AI Explanations</h3>
            <p>
              Get simplified explanations exactly when you struggle with a topic.
            </p>
          </div>
        </div>
      </section>

      <section className="highlights">
        <div className="highlight">
          <h4>🔒 Privacy First</h4>
          <p>All emotion data processed locally. No cloud storage.</p>
        </div>
        <div className="highlight">
          <h4>📊 Analytics Dashboard</h4>
          <p>Track learning engagement and emotional patterns.</p>
        </div>
        <div className="highlight">
          <h4>🧠 Emotion–Topic Mapping</h4>
          <p>AI links your emotions with the exact topic in the video.</p>
        </div>
      </section>

      <footer>
        © 2026 Emotion-Adaptive Smart Learning System | Major Project
      </footer>
    </div>
  );
}

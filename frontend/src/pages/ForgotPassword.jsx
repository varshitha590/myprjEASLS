import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    if (error) setError(error.message);
    else setMessage("Check your email for the reset link.");
  }

  return (
    <div className="auth-page">
      <div className="auth-layout login">

        {/* LEFT SIDE (simple text, no animation) */}
        <div className="auth-left">
          <h1>Forgot Your Password?</h1>
          <p>Don’t worry. We’ll help you reset it securely.</p>
        </div>

        {/* RIGHT SIDE (CENTERED CARD) */}
        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-card fade-in">
            <h2>Forgot Password</h2>

            {error && <p className="auth-error">{error}</p>}
            {message && (
              <p style={{ color: "#22d3ee", textAlign: "center" }}>
                {message}
              </p>
            )}

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit">Send Reset Link</button>

            <p>
              <Link to="/login">Back to Login</Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) setError(error.message);
    else setMessage("Password updated successfully! You can login now.");
  }

  return (
    <div className="auth-page">
      <div className="auth-layout login">

        <div className="auth-left">
          <h1>Set New Password</h1>
          <p>Enter your new password to complete reset.</p>
        </div>

        <div className="auth-right">
          <form onSubmit={handleReset} className="auth-card fade-in">
            <h2>Reset Password</h2>

            {error && <p className="auth-error">{error}</p>}
            {message && (
              <p style={{ color: "#22d3ee", textAlign: "center" }}>
                {message}
              </p>
            )}

            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Update Password</button>

            <p>
              <Link to="/login">Back to Login</Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}

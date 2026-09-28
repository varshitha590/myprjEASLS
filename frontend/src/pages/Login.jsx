import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import learningAnim from "../assets/learning.json";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔐 Check session
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const userEmail = data.session.user.email;

        // 🔥 CALL YOUR BACKEND
        const res = await fetch("http://localhost:5000/api/check-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        });

        const result = await res.json();

        if (!result.exists || result.is_blocked) {
          await supabase.auth.signOut();
          setError("Your account has been blocked by admin");
          return;
        }

        window.location.replace("/dashboard");
      }
    }

    checkSession();
  }, []);

  // 🔐 Login
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // 🔥 CALL BACKEND AFTER LOGIN
    const res = await fetch("http://localhost:5000/api/check-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await res.json();

    if (!result.exists || result.is_blocked) {
      await supabase.auth.signOut();
      setError("Your account has been blocked by admin");
      return;
    }

    // ✅ Success
    localStorage.setItem("token", data.session.access_token);
    sessionStorage.setItem("loginTime", Date.now());

    window.location.replace("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-layout login">

        <div className="auth-left">
          <h1>Emotion-Adaptive Learning</h1>
          <p>
            An intelligent learning platform that understands your emotions
            and adapts content in real-time to improve focus, clarity, and success.
          </p>

          <Lottie animationData={learningAnim} loop />
        </div>

        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-card fade-in">
            <h2>Login</h2>

            {error && <p className="auth-error">{error}</p>}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />

            <button type="submit">Login</button>

<p className="auth-links">
  <Link to="/forgot-password">Forgot Password?</Link>
</p>

<p>
  New user? <Link to="/register">Create an account</Link>
</p>
          </form>
        </div>

      </div>
    </div>
  );
}
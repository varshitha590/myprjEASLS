import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "../styles/auth.css";
import Lottie from "lottie-react";
import learningAnim from "../assets/learning.json";


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("/dashboard");
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) setError(error.message);
    else {
      alert("Signup successful. Please login.");
      window.location.replace("/login");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout register">


        {/* LEFT BRANDING PANEL */}
        <div className="auth-left">
          <h1>Join Smart Learning</h1>
          <p>
            Create your account and experience emotion-aware learning that
            adapts to you.
          </p>
          <Lottie
            animationData={learningAnim}
          loop
  style={{
    width: 360,
    maxWidth: "100%",
    marginTop: "2rem"
  }}
/>

        </div>

        {/* RIGHT FORM PANEL */}
        <div className="auth-right">
          <form onSubmit={handleSubmit} className="auth-card glow-card">
            <h2>Sign Up</h2>

            {error && <p className="auth-error">{error}</p>}

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="glow-btn w-full">
              Register
            </button>

            <p>
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}

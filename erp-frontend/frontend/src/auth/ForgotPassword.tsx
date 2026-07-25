import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

import "../styles/Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Backend API will be added later
    setSubmitted(true);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎓</div>

          <h1 className="title">Forgot Password</h1>

          <p className="subtitle">
            Enter your registered email to receive a password reset link.
          </p>
        </div>

        {submitted ? (
          <>
            <div
              style={{
                background: "#e8f5e9",
                color: "#2e7d32",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              If an account with this email exists, a password reset link has
              been sent.
            </div>

            <Link
              to="/"
              className="login-btn"
              style={{
                display: "block",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Back to Login
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>

              <div className="password-container">
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <span className="password-toggle">
                  <FaEnvelope />
                </span>
              </div>
            </div>

            <button type="submit" className="login-btn">
              Send Reset Link
            </button>

            <div
              style={{
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "#5a54ff",
                  fontWeight: 600,
                }}
              >
                <FaArrowLeft style={{ marginRight: 8 }} />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
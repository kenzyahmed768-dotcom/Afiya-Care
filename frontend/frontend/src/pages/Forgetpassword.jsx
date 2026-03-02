import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/forgetpassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Reset link sent! Check your inbox.");
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-wrapper">
        <div className="fp-icon">✉</div>
        <h2>Forgot password?</h2>
        <p className="fp-subtitle">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {message && <p className="fp-message fp-success">{message}</p>}
        {error   && <p className="fp-message fp-error">{error}</p>}

        <form className="fp-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="fp-input"
          />
          <button type="submit" className="fp-btn" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <div className="fp-divider"><span>or</span></div>

        <button className="fp-btn-back" onClick={() => navigate("/login")}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
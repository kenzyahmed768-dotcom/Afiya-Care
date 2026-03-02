import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./style/forgetPassword.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Password reset successfully!");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(data.message || "Invalid or expired link. Please try again.");
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
        <div className="fp-icon">🔒</div>
        <h2>Set new password</h2>
        <p className="fp-subtitle">
          Choose a strong password and you're good to go.
        </p>

        {message && <p className="fp-message fp-success">{message}</p>}
        {error   && <p className="fp-message fp-error">{error}</p>}

        <form className="fp-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="fp-input"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="fp-input"
          />
          <button type="submit" className="fp-btn" disabled={loading}>
            {loading ? "Saving…" : "Reset Password"}
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

export default ResetPassword;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ Save token and role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userEmail", email);

      // ✅ Redirect based on role
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/");
      }
    } else {
      setError(data.message || "Invalid credentials");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Server error. Please try again.");
  }
};
  return (
    <div className="login-wrapper">
      <h2>Login</h2>
      {error && <p className="login-error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <a href="/forgot-password" className="login-forgot">Forgot password?</a>
        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
      <div className="login-divider"><span>or</span></div>
      <button className="login-btn-register" onClick={() => navigate("/register")}>
        Create an account
      </button>
    </div>
  );
}

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
  try {
    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setMessage(data.message);

    if (res.ok) {
      setTimeout(() => navigate("/login"), 1500);
    }

  } catch (err) {
    console.error(err);
    setMessage("Error connecting to backend");
  }
};

  return (
    <div className="register-wrapper">
      <h2>Create an account</h2>
      <p className="register-subtitle">Join us today — it only takes a minute</p>

      {message && <p className="register-message">{message}</p>}

      <div className="register-form">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
        />

        <button onClick={handleRegister} className="register-btn">
          Register
        </button>
      </div>

      <div className="register-divider"><span>or</span></div>

      <button className="register-btn-login" onClick={() => navigate("/login")}>
        Already have an account? Log in
      </button>
    </div>
  );
}

export default Register;
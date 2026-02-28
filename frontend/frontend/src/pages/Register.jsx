import { useState } from "react";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Updated function to send data to backend
  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setMessage(data.message); // show backend response
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to backend");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register Page</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <button onClick={handleRegister}>Register</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
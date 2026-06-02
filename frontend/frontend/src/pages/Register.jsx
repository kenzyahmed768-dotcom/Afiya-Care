
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/register.css";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await fetch("https://afiya-care.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          age,
          phone,
          email,
          password,
          role,
          specialty,
          experience,
        }),
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

        {/* NEW FIELDS */}
        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="register-input"
        />

        <input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="register-input"
        />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="register-input"
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="register-input"
        />

        {/* EXISTING FIELDS */}
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

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="register-input"
        >
          <option value="patient">Register as Patient</option>
          <option value="doctor">Register as Doctor</option>
        </select>

        {role === "doctor" && (
          <>
            <input
              placeholder="Specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="register-input"
            />

            <input
              type="number"
              placeholder="Years of Experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="register-input"
            />
          </>
        )}

        <button onClick={handleRegister} className="register-btn">
          Register
        </button>
      </div>

      <div className="register-divider">
        <span>or</span>
      </div>

      <button
        className="register-btn-login"
        onClick={() => navigate("/login")}
      >
        Already have an account? Log in
      </button>
    </div>
  );
}

export default Register;
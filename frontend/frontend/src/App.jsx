import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage"; // ✅ import homepage
import ForgotPassword from "./pages/Forgetpassword";
import ResetPassword from "./pages/Resetpassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />          {/* default homepage */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
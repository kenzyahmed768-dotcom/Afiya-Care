import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage"; 
import ForgotPassword from "./pages/Forgetpassword";
import ResetPassword from "./pages/Resetpassword";
import AdminDashboard from "./pages/admindashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import JoinUs from "./pages/JoinUs";
import PatientDashboard from "./pages/PatientDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />          
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/join" element={<JoinUs />} />
        <Route path="/patient" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
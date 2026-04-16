// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import ForgotPassword from "./pages/Forgetpassword";
import ResetPassword from "./pages/Resetpassword";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import JoinUs from "./pages/JoinUs";
import PatientDashboard from "./pages/PatientDashboard";
import Booking from "./pages/booking";
import HelpCenter from "./pages/Helpcenter";


function App() {
  return (
    <Router>
      <Routes>
        {/* Pages WITH navigation and footer */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="join" element={<JoinUs />} />
          <Route path="booking" element={<Booking />} />
          <Route path="help" element={<HelpCenter />} />
         
        </Route>

        {/* Pages WITHOUT navigation and footer */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/patient" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
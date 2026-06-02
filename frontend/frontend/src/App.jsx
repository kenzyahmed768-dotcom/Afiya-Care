import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
import Payment from "./pages/Payment";
import About from "./pages/About";
import Services from "./pages/Services";
import Blog from "./pages/blog";
import PatientCommunity from "./pages/PatientCommunity";
import DoctorProfile from "./pages/DoctorProfile";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "doctor") return <Navigate to="/doctor" replace />;
    if (role === "patient") return <Navigate to="/patient" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="join" element={<JoinUs />} />
          <Route path="booking" element={<Booking />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="payment" element={<Payment />} />
          <Route path="about" element={<About />} />
          <Route path="service" element={<Services />} />
          <Route path="blog" element={<Blog />} />
          <Route path="patient-community" element={<PatientCommunity />} />
          <Route path="doctor-profile/:id" element={<DoctorProfile />} />
        </Route>

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
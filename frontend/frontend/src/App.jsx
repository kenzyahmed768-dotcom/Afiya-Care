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
import Payment from "./pages/Payment";
import About from "./pages/About";
import Services from "./pages/Services";
<<<<<<< Updated upstream
=======
import DoctorProfile from "./pages/DoctorProfile";
import Blog from "./pages/Blog";
>>>>>>> Stashed changes

function App() {
  return (
    <Router>
      <Routes>

        {/* Layout Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage />} />
          <Route path="join" element={<JoinUs />} />
          <Route path="booking" element={<Booking />} />
          <Route path="help" element={<HelpCenter />} />
<<<<<<< Updated upstream
          <Route path="payment" element={<Payment />} />
          <Route path="about" element={<About />} />
          <Route path="service" element={<Services />} />
          <Route path="blog" element={<div>Blog Page</div>} />
=======
         <Route path="/about" element={<About />} />
<Route path="/service" element={<Services />} />
<Route path="doctor-profile/:id" element={<DoctorProfile />} />
<Route path="blog" element={<Blog />} />
>>>>>>> Stashed changes
        </Route>

        {/* Auth & Dashboards */}
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
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage"; // ✅ import homepage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />          {/* default homepage */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
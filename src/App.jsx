import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import Navbar from './components/Navbar';
import LandingPage from './Pages/LandingPage';
import ProtectedRoutes from './Services/ProtectedRoutes';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';
import Resume from './Pages/Resume';
import About from './Pages/About';
import Services from './Pages/Services';
import Contact from './Pages/Contact';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />

        {/* Dashboard Protected  */}
        <Route path="/dashboard" element={<ProtectedRoutes> <Dashboard /> </ProtectedRoutes>}
        />
        <Route path="/profile" element={<ProtectedRoutes> <Profile /> </ProtectedRoutes>}
        />
        <Route path="/resume" element={<ProtectedRoutes> <Resume /> </ProtectedRoutes>}
        />
      </Routes>
    </Router>
  );
}

export default App;

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import Example from './components/Navbar';
import LandingPage from './Pages/LandingPage';
import ProtectedRoutes from './Services/ProtectedRoutes';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';
import Resume from './Pages/Resume';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      {/* <Example /> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

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

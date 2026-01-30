import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPageStyles.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function LandingPage() {
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem("authToken");
    if(token){
        navigate('/Dashboard')
    }
  },[]);

  const features = [
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Process applications in seconds with our advanced automation"
    },
    {
      icon: "🎯",
      title: "Smart Matching",
      description: "AI-powered candidate matching for perfect job fits"
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "Real-time insights and comprehensive reporting dashboard"
    },
    {
      icon: "🔒",
      title: "Secure",
      description: "Enterprise-grade security with data encryption"
    },
    {
      icon: "🤝",
      title: "Collaboration",
      description: "Team tools for seamless hiring workflow"
    },
    {
      icon: "🌍",
      title: "Global Reach",
      description: "Connect with talent worldwide in real-time"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Manager",
      company: "Tech Corp",
      text: "ApplySync has transformed our hiring process. We've reduced time-to-hire by 60%!"
    },
    {
      name: "Mike Chen",
      role: "Recruitment Lead",
      company: "StartupXYZ",
      text: "The AI matching is incredible. Our team is amazed by the quality of matches."
    },
    {
      name: "Emma Davis",
      role: "CEO",
      company: "Growth Inc",
      text: "Best investment for our HR department. Highly recommend to any growing company."
    }
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Subscribed:", email);
    setEmail("");
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>The Future of Recruitment</h1>
            <p>
              ApplySync is the all-in-one platform that streamlines your hiring process. 
              From application management to candidate tracking, we've got you covered.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-secondary">
                Sign Up
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-graphic">
              <div className="graphic-card card-1">
                <div className="card-header">Applications</div>
                <div className="card-value">1,234</div>
              </div>
              <div className="graphic-card card-2">
                <div className="card-header">Interviews</div>
                <div className="card-value">89</div>
              </div>
              <div className="graphic-card card-3">
                <div className="card-header">Hired</div>
                <div className="card-value">12</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Post a Job</h3>
            <p>Create and post your job openings in minutes</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get Applications</h3>
            <p>Receive qualified applications automatically</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Smart Screening</h3>
            <p>AI filters and ranks the best candidates</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Hire Top Talent</h3>
            <p>Interview and hire your perfect match</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-header">
          <h2>Powerful Features</h2>
          <p>Everything you need to build a world-class recruiting team</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>ApplySync</h4>
            <p>The future of recruitment starts here</p>
          </div>
          <div className="footer-section">
            <h5>Product</h5>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h5>Company</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h5>Legal</h5>
            <ul>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 ApplySync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
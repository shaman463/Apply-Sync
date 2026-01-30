import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("User");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        // Try to get user data from localStorage if stored during signup
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUserName(userData.FirstName || userData.firstName || "User");
        }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const stats = [
    { label: "Total Applications", value: 24, icon: "📋", color: "#667eea" },
    { label: "Interviews", value: 8, icon: "🎤", color: "#764ba2" },
    { label: "Offers", value: 3, icon: "✨", color: "#f093fb" },
    { label: "Pending", value: 13, icon: "⏳", color: "#ffa400" },
  ];

  const recentApplications = [
    {
      id: 1,
      company: "Google",
      position: "Frontend Developer",
      status: "Interview Scheduled",
      date: "2026-01-28",
      logo: "🔍"
    },
    {
      id: 2,
      company: "Microsoft",
      position: "Full Stack Engineer",
      status: "Shortlisted",
      date: "2026-01-27",
      logo: "🪟"
    },
    {
      id: 3,
      company: "Amazon",
      position: "SDE",
      status: "Applied",
      date: "2026-01-26",
      logo: "📦"
    },
    {
      id: 4,
      company: "Meta",
      position: "React Developer",
      status: "Applied",
      date: "2026-01-25",
      logo: "📘"
    },
    {
      id: 5,
      company: "Apple",
      position: "iOS Developer",
      status: "Rejected",
      date: "2026-01-24",
      logo: "🍎"
    },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      company: "Google",
      position: "Frontend Developer",
      date: "2026-02-01",
      time: "10:00 AM",
      type: "Technical"
    },
    {
      id: 2,
      company: "Microsoft",
      position: "Full Stack Engineer",
      date: "2026-02-03",
      time: "2:30 PM",
      type: "HR"
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Interview Scheduled":
        return "#667eea";
      case "Shortlisted":
        return "#f093fb";
      case "Applied":
        return "#4facfe";
      case "Rejected":
        return "#ef4444";
      case "Offer":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>ApplySync</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <nav className="dashboard-nav">
          <div className="nav-section">
            <h3>Main</h3>
            <button 
              className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📊 Overview
            </button>
            <button 
              className={`nav-link ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              📝 Applications
            </button>
            <button 
              className={`nav-link ${activeTab === "interviews" ? "active" : ""}`}
              onClick={() => setActiveTab("interviews")}
            >
              🎤 Interviews
            </button>
          </div>

          <div className="nav-section">
            <h3>Settings</h3>
            <button className="nav-link">⚙️ Profile</button>
            <button className="nav-link">🔔 Notifications</button>
            <button className="nav-link">📄 Resume</button>
          </div>
        </nav>

        {/* Content Area */}
        <div className="dashboard-content">
          {activeTab === "overview" && (
            <>
              {/* Statistics Grid */}
              <section className="stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                      {stat.icon}
                    </div>
                    <div className="stat-info">
                      <p className="stat-label">{stat.label}</p>
                      <h2 className="stat-value">{stat.value}</h2>
                    </div>
                  </div>
                ))}
              </section>              
            </>
          )}

          {activeTab === "applications" && (
            <section className="dashboard-card">
              <h2>All Applications</h2>
              <div className="applications-table">
                <div className="table-header">
                  <div className="col">Company</div>
                  <div className="col">Position</div>
                  <div className="col">Status</div>
                  <div className="col">Date Applied</div>
                  <div className="col">Action</div>
                </div>
                {recentApplications.map((app) => (
                  <div key={app.id} className="table-row">
                    <div className="col">{app.logo} {app.company}</div>
                    <div className="col">{app.position}</div>
                    <div className="col">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="col">{app.date}</div>
                    <div className="col">
                      <button className="action-btn">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "interviews" && (
            <section className="dashboard-card">
              <h2>Interview Schedule</h2>
              <div className="interviews-detailed">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="interview-detail-card">
                    <div className="interview-header">
                      <h3>{interview.company}</h3>
                      <span className="interview-type-badge">{interview.type}</span>
                    </div>
                    <p className="interview-position">{interview.position}</p>
                    <div className="interview-meta">
                      <span>📅 {interview.date}</span>
                      <span>⏰ {interview.time}</span>
                    </div>
                    <div className="interview-actions">
                      <button className="btn-primary">Join Interview</button>
                      <button className="btn-secondary">Reschedule</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [applications, setApplications] = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [appsError, setAppsError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setAppsError("Please log in to view applications.");
        return;
      }

      setIsLoadingApps(true);
      setAppsError("");

      try {
        const res = await axios.get("http://localhost:5000/api/jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setApplications(res.data?.jobs || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setAppsError("Unable to load applications. Please try again.");
      } finally {
        setIsLoadingApps(false);
      }
    };

    fetchJobs();
  }, []);

  const stats = [
    { label: "Total Applications", value: 24, icon: "📋", color: "#667eea" },
    { label: "Interviews", value: 8, icon: "🎤", color: "#764ba2" },
    { label: "Offers", value: 3, icon: "✨", color: "#f093fb" },
    { label: "Pending", value: 13, icon: "⏳", color: "#ffa400" },
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
    const normalized = (status || "").toLowerCase();

    switch (normalized) {
      case "interview scheduled":
        return "#667eea";
      case "shortlisted":
        return "#f093fb";
      case "applied":
        return "#4facfe";
      case "rejected":
        return "#ef4444";
      case "offer":
      case "offered":
        return "#10b981";
      case "saved":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const formatStatusLabel = (status) => {
    if (!status) return "Unknown";

    return status
      .toString()
      .trim()
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toISOString().slice(0, 10);
  };

  const handleViewJob = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
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
                {isLoadingApps && (
                  <div className="table-row">
                    <div className="col">Loading applications...</div>
                  </div>
                )}
                {!isLoadingApps && appsError && (
                  <div className="table-row">
                    <div className="col">{appsError}</div>
                  </div>
                )}
                {!isLoadingApps && !appsError && applications.length === 0 && (
                  <div className="table-row">
                    <div className="col">No applications saved yet.</div>
                  </div>
                )}
                {!isLoadingApps && !appsError && applications.map((app) => (
                  <div key={app._id || app.id} className="table-row">
                    <div className="col">💼 {app.company || "—"}</div>
                    <div className="col">{app.title || "—"}</div>
                    <div className="col">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {formatStatusLabel(app.status)}
                      </span>
                    </div>
                    <div className="col">{formatDate(app.appliedDate || app.savedAt)}</div>
                    <div className="col">
                      <button
                        className="action-btn"
                        onClick={() => handleViewJob(app.url)}
                        disabled={!app.url}
                      >
                        View
                      </button>
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

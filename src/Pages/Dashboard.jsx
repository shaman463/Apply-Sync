import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  // It controls which tab is visible i.e., overview, applications, interviews
  const [activeTab, setActiveTab] = useState("overview");
  // Controls whether profile panel is visible on the right side
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  // stores job applications that are fetched from the backend
  const [applications, setApplications] = useState([]);
  // Control Ui when fetching jobs
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [appsError, setAppsError] = useState("");

  // This runs once the component is loaded
  useEffect(() => {
    const fetchJobs = async () => {

      // token checking is being done here 
      const token = localStorage.getItem("authToken");
      // and if not
      if (!token) {
        setAppsError("Please log in to view applications.");
        return;
      }

      setIsLoadingApps(true);
      setAppsError("");
      // It fetched the jobs from the backend 
      // it sends to jwt token the backend verifies the user  and return the jobs
      try {
        const res = await axios.get("http://localhost:5000/api/jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Saves the data
        setApplications(res.data?.jobs || []);
      } 
      catch (error) {
        console.error("Error fetching jobs:", error);
        // if any error occur god forbid
        setAppsError("Unable to load applications. Please try again.");
      }
       finally {
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


  // As the name suggests this is used to handle logout

  const handleLogout = () => {
    // remove the jwt token and navigate you to the landing page
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  // assigns colors based on job status
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

  // Date formatting
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
 // this is our begining of our ui of dashboard
  return (
  
    
    <div className="dashboard">
       <Navbar/>
      {/* Main Content */}
      <div className={`dashboard-container ${showProfilePanel ? "show-profile" : ""}`}>
        {/* Sidebar Navigation */}
        <nav className="dashboard-nav">
          <div className="nav-section">
            <h3>Main</h3>
            <button 
              className={`nav-link ${activeTab === "overview" && !showProfilePanel ? "active" : ""}`}
              onClick={() => {
                setActiveTab("overview");
                setShowProfilePanel(false);
              }}
            >
              📊 Overview
            </button>
            <button 
              className={`nav-link ${activeTab === "applications" && !showProfilePanel ? "active" : ""}`}
              onClick={() => {
                setActiveTab("applications");
                setShowProfilePanel(false);
              }}
            >
              📝 Applications
            </button>
          </div>

          <div className="nav-section">
            <h3>Settings</h3>
            <button className="nav-link" onClick={() => navigate("/resume")}>
              📄 Resume
            </button>
          </div>
        </nav>

        {/* Content Area */}
        {!showProfilePanel && (
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
        </div>
        )}

        {/* Profile Panel - Right Side */}
        {showProfilePanel && (
          <ProfilePanelContent />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

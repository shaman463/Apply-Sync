import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "../Services/apiBaseUrl";
import "../styles/Dashboard.css";

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
        const res = await axios.get(`${apiBaseUrl}/api/jobs`, {
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

  const getCompanyInitials = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleViewJob = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };
 // this is our begining of our ui of dashboard
  return (
  
    
    <div className="dashboard">
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
            <h3>Additoinal</h3>
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
              <div className="applications-board">
                {isLoadingApps && (
                  <div className="applications-state">Loading applications...</div>
                )}
                {!isLoadingApps && appsError && (
                  <div className="applications-state">{appsError}</div>
                )}
                {!isLoadingApps && !appsError && applications.length === 0 && (
                  <div className="applications-state">No applications saved yet.</div>
                )}
                {!isLoadingApps && !appsError && applications.map((app) => {
                  const companyName = app.company || "—";
                  const roleTitle = app.title || "—";
                  const location = app.location || "Remote";
                  const salary = app.salaryRange || "Not disclosed";
                  const employmentType = app.employmentType || "Full-time";
                  const source = app.source || "Direct";
                  const notes = app.notes || "Add a short note to remember why this role stands out.";

                  return (
                    <article key={app._id || app.id} className="app-card">
                      <div className="app-card-header">
                        <div className="company-block">
                          <div className="company-logo">
                            {app.companyLogo ? (
                              <img src={app.companyLogo} alt={companyName} />
                            ) : (
                              <span>{getCompanyInitials(companyName)}</span>
                            )}
                          </div>
                          <div>
                            <p className="company-name">{companyName}</p>
                            <h3 className="role-title">{roleTitle}</h3>
                            <p className="role-subtitle">Applied {formatDate(app.appliedDate || app.savedAt)}</p>
                          </div>
                        </div>
                        <div className="status-stack">
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(app.status) }}
                          >
                            {formatStatusLabel(app.status)}
                          </span>
                          <span className="source-pill">Via {source}</span>
                        </div>
                      </div>
                      <div className="app-meta">
                        <div className="meta-item">
                          <span className="meta-label">Location</span>
                          <span className="meta-value">{location}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Comp</span>
                          <span className="meta-value">{salary}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Type</span>
                          <span className="meta-value">{employmentType}</span>
                        </div>
                      </div>
                      <div className="app-notes">
                        <span className="meta-label">Notes</span>
                        <p>{notes}</p>
                      </div>
                      <div className="app-actions">
                        <button
                          className="action-btn"
                          onClick={() => handleViewJob(app.url)}
                          disabled={!app.url}
                        >
                          View job
                        </button>
                      </div>
                    </article>
                  );
                })}
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

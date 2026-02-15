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
  // Track which descriptions are expanded
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

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

  // Calculate stats from real data
  const calculateStats = () => {
    const total = applications.length;
    const interviews = applications.filter(app => 
      (app.status || "").toLowerCase().includes("interview")
    ).length;
    const offers = applications.filter(app => 
      (app.status || "").toLowerCase().includes("offer") ||
      (app.status || "").toLowerCase().includes("offered")
    ).length;
    const pending = applications.filter(app => {
      const status = (app.status || "").toLowerCase();
      return !status.includes("offer") && 
             !status.includes("offered") && 
             !status.includes("interview") &&
             !status.includes("rejected");
    }).length;

    return [
      { label: "Total Applications", value: total, icon: "📋", color: "#667eea" },
      { label: "Interviews", value: interviews, icon: "🎤", color: "#764ba2" },
      { label: "Offers", value: offers, icon: "✨", color: "#f093fb" },
      { label: "Pending", value: pending, icon: "⏳", color: "#ffa400" },
    ];
  };

  const stats = calculateStats();


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

  // Toggle description expansion
  const toggleDescription = (appId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  // Clean and format description for better readability
  const cleanDescription = (description) => {
    if (!description) return "";
    return description
      .replace(/\s+/g, " ") // Remove extra whitespace
      .trim();
  };

  // Truncate description to first 150 characters
  const truncateDescription = (description, limit = 150) => {
    const cleaned = cleanDescription(description);
    if (cleaned.length <= limit) return cleaned;
    return cleaned.substring(0, limit) + "...";
  };

  // Extract location from description
  const extractLocation = (description) => {
    if (!description) return null;
    const text = description.toLowerCase();
    
    // Look for common location patterns
    const locationPatterns = [
      /remote/i,
      /on[\s-]?site/i,
      /hybrid/i,
      /work from home/i,
      /\b(new york|ny|los angeles|la|san francisco|sf|chicago|toronto|london|dubai|bangalore|mumbai|delhi|hyderabad|pune|singapore|sydney)\b/i,
    ];

    for (const pattern of locationPatterns) {
      const match = description.match(pattern);
      if (match) return match[0].trim();
    }
    return null;
  };

  // Extract employment type from description
  const extractEmploymentType = (description) => {
    if (!description) return null;
    const text = description.toLowerCase();
    
    const typePatterns = [
      { regex: /full[\s-]?time/i, label: "Full-time" },
      { regex: /part[\s-]?time/i, label: "Part-time" },
      { regex: /contract/i, label: "Contract" },
      { regex: /internship/i, label: "Internship" },
      { regex: /temporary/i, label: "Temporary" },
      { regex: /freelance/i, label: "Freelance" },
    ];

    for (const pattern of typePatterns) {
      if (pattern.regex.test(description)) return pattern.label;
    }
    return null;
  };

  // Extract salary from description
  const extractSalary = (description) => {
    if (!description) return null;
    
    // Look for salary patterns like $50k-$70k, $100,000, ₹50L-₹75L, etc.
    const salaryPatterns = [
      /\$[\d,]+[\s-]*(?:to|–|-)?[\s-]*\$?[\d,]+[km]?/i,
      /₹[\d,]+[\s-]*(?:to|–|-)?[\s-]*₹?[\d,]+[lkm]?/i,
      /\$[\d,]+(k|m)?/i,
      /₹[\d,]+(l|k|m)?/i,
    ];

    for (const pattern of salaryPatterns) {
      const match = description.match(pattern);
      if (match) return match[0].trim();
    }
    return null;
  };

  // Extract job title from description
  const extractJobTitle = (description) => {
    if (!description) return null;
    
    // Look for "Job Title: XYZ" pattern
    const jobTitleMatch = description.match(/Job\s+Title:\s*([^,\n]+)/i);
    if (jobTitleMatch && jobTitleMatch[1]) {
      return jobTitleMatch[1].trim();
    }
    
    // Fallback: Look for common job title patterns
    const titlePatterns = [
      /(?:hiring for|looking for|seeking|position of)\s+([^,.\n]+)/i,
      /\b(senior|junior|lead|principal|staff|associate)?\s*(developer|engineer|manager|designer|analyst|architect|specialist|consultant|director|coordinator|officer)\b/i,
    ];

    for (const pattern of titlePatterns) {
      const match = description.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    return null;
  };

  // Extract company name from description
  const extractCompanyName = (description) => {
    if (!description) return null;
    
    // Look for "Company: XYZ" pattern
    const companyMatch = description.match(/Company:\s*([^,\n]+)/i);
    if (companyMatch && companyMatch[1]) {
      return companyMatch[1].trim();
    }
    
    // Fallback: Look for patterns like "at Company", "by Company"
    const namePatterns = [
      /(?:at|by|from)\s+([A-Z][A-Za-z\s&]+?)(?:\s+(?:is|are|hiring|seeks|looking)|\.|,|\n)/,
      /^([A-Z][A-Za-z\s&]+?)(?:\s+(?:is|are|hiring|seeks|looking)|\.|,|\n)/,
    ];

    for (const pattern of namePatterns) {
      const match = description.match(pattern);
      if (match && match[1] && match[1].length > 1 && match[1].length < 50) {
        return match[1].trim();
      }
    }
    return null;
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
                  const description = app.description || "No description available.";
                  
                  // Use provided values or extract from description
                  let companyName = app.company || "—";
                  if (companyName === "—" || !app.company) {
                    companyName = extractCompanyName(description) || companyName;
                  }
                  
                  let roleTitle = app.title || "—";
                  if (roleTitle === "—" || !app.title) {
                    roleTitle = extractJobTitle(description) || roleTitle;
                  }
                  
                  let location = app.location || "Remote";
                  if (location === "Remote" || !app.location) {
                    location = extractLocation(description) || location;
                  }
                  
                  let salary = app.salaryRange || "Not disclosed";
                  if (salary === "Not disclosed" || !app.salaryRange) {
                    salary = extractSalary(description) || salary;
                  }
                  
                  let employmentType = app.employmentType || "Full-time";
                  if (employmentType === "Full-time" || !app.employmentType) {
                    employmentType = extractEmploymentType(description) || employmentType;
                  }
                  
                  const source = app.source || "Direct";

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
                        <div className="meta-item">
                          <span className="meta-label">Company</span>
                          <span className="meta-value">{companyName}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Job Title</span>
                          <span className="meta-value">{roleTitle}</span>
                        </div>
                      </div>
                      <div className="app-notes">
                        <span className="meta-label">Description</span>
                        <p>
                          {expandedDescriptions[app._id || app.id] 
                            ? cleanDescription(description)
                            : truncateDescription(description, 150)
                          }
                        </p>
                        {cleanDescription(description).length > 150 && (
                          <button
                            className="toggle-description-btn"
                            onClick={() => toggleDescription(app._id || app.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#17a2b8",
                              cursor: "pointer",
                              padding: "5px 0",
                              fontWeight: "500",
                              fontSize: "14px",
                              marginTop: "8px",
                            }}
                          >
                            {expandedDescriptions[app._id || app.id] ? "Show Less" : "More"}
                          </button>
                        )}
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

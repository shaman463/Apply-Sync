import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    FirstName: "",
    LastName: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({ ...userData });

  useEffect(() => {
    // Load user data from localStorage
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setUserData(parsed);
        setFormData(parsed);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessage("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      // Optional: Update profile via API if you have an endpoint
      // For now, just update localStorage
      localStorage.setItem("userData", JSON.stringify(formData));
      setUserData(formData);
      setIsEditing(false);
      setMessage("Profile updated successfully! ✓");

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
    setMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <h1>My Profile</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div className="profile-container">
        <div className="profile-card">
          {/* Profile Header with Avatar */}
          <div className="profile-header-card">
            <div className="profile-avatar">
              {userData.FirstName?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div className="profile-info-header">
              <h2>
                {userData.FirstName} {userData.LastName}
              </h2>
              <p>{userData.email}</p>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-error"}`}>
              {message}
            </div>
          )}

          {/* Profile Form */}
          {!isEditing ? (
            <div className="profile-info">
              <div className="info-group">
                <label>First Name</label>
                <p>{userData.FirstName || "—"}</p>
              </div>
              <div className="info-group">
                <label>Last Name</label>
                <p>{userData.LastName || "—"}</p>
              </div>
              <div className="info-group">
                <label>Email</label>
                <p>{userData.email || "—"}</p>
              </div>

              <button
                className="btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveChanges} className="profile-form">
              <div className="form-group">
                <label htmlFor="FirstName">First Name</label>
                <input
                  type="text"
                  id="FirstName"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="LastName">Last Name</label>
                <input
                  type="text"
                  id="LastName"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Additional Settings */}
          <div className="profile-settings">
            <h3>Security & Settings</h3>
            <div className="settings-group">
              <button className="settings-btn">
                🔐 Change Password
              </button>
              <button className="settings-btn">
                🔔 Notification Preferences
              </button>
              <button className="settings-btn danger">
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Setting.css";

const Setting = () => {
	const navigate = useNavigate();
	const [feedback, setFeedback] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [savingPassword, setSavingPassword] = useState(false);
	const [deletingAccount, setDeletingAccount] = useState(false);
	const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://apply-sync.onrender.com";
	const [preferences, setPreferences] = useState({
		emailAlerts: true,
		weeklyDigest: true,
		productUpdates: false,
		twoFactor: false,
		showProfile: true,
		shareUsage: false
	});

	const handleToggle = (key) => {
		setPreferences((prev) => ({
			...prev,
			[key]: !prev[key]
		}));
	};

	const handleChangePassword = async (event) => {
		event.preventDefault();
		setFeedback("");

		if (newPassword !== confirmPassword) {
			setFeedback("New passwords do not match");
			return;
		}

		const token = localStorage.getItem("authToken");
		if (!token) {
			setFeedback("You are not logged in. Please sign in again.");
			return;
		}

		try {
			setSavingPassword(true);
			const response = await axios.put(
				`${apiBaseUrl}/api/auth/password`,
				{ currentPassword, newPassword, confirmPassword },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			setFeedback(response.data?.message || "Password updated successfully");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error) {
			setFeedback(error.response?.data?.message || "Failed to update password");
		} finally {
			setSavingPassword(false);
		}
	};

	const handleDeleteAccount = async (event) => {
		event.preventDefault();
		setFeedback("");
		if (deleteConfirm !== "DELETE") {
			setFeedback("Type DELETE to confirm account removal");
			return;
		}

		const token = localStorage.getItem("authToken");
		if (!token) {
			setFeedback("You are not logged in. Please sign in again.");
			return;
		}

		try {
			setDeletingAccount(true);
			const response = await axios.delete(`${apiBaseUrl}/api/auth/me`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			setFeedback(response.data?.message || "Account deleted successfully");
			localStorage.removeItem("authToken");
			localStorage.removeItem("userData");
			if (typeof chrome !== "undefined" && chrome.runtime) {
				chrome.runtime.sendMessage({ action: "logout" });
			}
			setTimeout(() => navigate("/login"), 800);
		} catch (error) {
			setFeedback(error.response?.data?.message || "Failed to delete account");
		} finally {
			setDeletingAccount(false);
		}
	};

	return (
		<div className="dashboard settings-page">
			<header className="dashboard-header settings-header">
				<div className="header-left">
					<h1>Settings</h1>
					<p className="welcome-text">
						Manage security, privacy, notifications, and support preferences.
					</p>
				</div>
				<button className="logout-btn settings-header-btn" onClick={() => navigate("/dashboard")}>
					Back to dashboard
				</button>
			</header>

			{feedback && <div className="settings-banner">{feedback}</div>}

			<div className="dashboard-container settings-container">
				<nav className="dashboard-nav settings-nav">
					<div className="nav-section">
						<h3>Account</h3>
						<a className="nav-link" href="#security">Security</a>
						<a className="nav-link" href="#notifications">Notifications</a>
					</div>
					<div className="nav-section">
						<h3>Controls</h3>
						<a className="nav-link" href="#privacy">Privacy &amp; Support</a>
						<a className="nav-link" href="#data">Data Controls</a>
					</div>
					<div className="nav-section">
						<h3>Danger</h3>
						<a className="nav-link" href="#delete">Delete Account</a>
					</div>
				</nav>

				<div className="dashboard-content settings-content">
					<section id="security" className="settings-section">
						<div className="settings-section-header">
							<h2>Change password</h2>
						</div>
						<form className="settings-form" onSubmit={handleChangePassword}>
							<label>
								Current password
								<input
									type="password"
									placeholder="Enter current password"
									value={currentPassword}
									onChange={(event) => setCurrentPassword(event.target.value)}
									required
								/>
							</label>
							<label>
								New password
								<input
									type="password"
									placeholder="Use a strong password"
									value={newPassword}
									onChange={(event) => setNewPassword(event.target.value)}
									required
								/>
							</label>
							<label>
								Confirm new password
								<input
									type="password"
									placeholder="Re-enter new password"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									required
								/>
							</label>
							<div className="settings-actions">
								<button
									type="submit"
									className="btn btn-primary"
									disabled={savingPassword}
								>
									{savingPassword ? "Updating..." : "Update password"}
								</button>
							</div>
						</form>
						<div className="settings-list">
							<label className="settings-toggle">
								<div>
									<strong>Two-factor authentication</strong>
									<span>Add an extra layer of security to your account.</span>
								</div>
								<input
									type="checkbox"
									checked={preferences.twoFactor}
									onChange={() => handleToggle("twoFactor")}
								/>
							</label>
							<div className="settings-support">
								<div>
									<strong>Active sessions</strong>
									<span>Signed in on 2 devices</span>
								</div>
								<button className="btn btn-secondary">Sign out of all</button>
							</div>
						</div>
					</section>

					<section id="notifications" className="settings-section">
						<div className="settings-section-header">
							<h2>Notifications</h2>
						</div>
						<div className="settings-list">
							<label className="settings-toggle">
								<div>
									<strong>Email alerts</strong>
									<span>Get updates about application status changes.</span>
								</div>
								<input
									type="checkbox"
									checked={preferences.emailAlerts}
									onChange={() => handleToggle("emailAlerts")}
								/>
							</label>
							<label className="settings-toggle">
								<div>
									<strong>Weekly digest</strong>
									<span>Summary of your activity and insights.</span>
								</div>
								<input
									type="checkbox"
									checked={preferences.weeklyDigest}
									onChange={() => handleToggle("weeklyDigest")}
								/>
							</label>
							<label className="settings-toggle">
								<div>
									<strong>Product updates</strong>
									<span>Announcements and feature previews.</span>
								</div>
								<input
									type="checkbox"
									checked={preferences.productUpdates}
									onChange={() => handleToggle("productUpdates")}
								/>
							</label>
						</div>
					</section>

					<section id="privacy" className="settings-section">
						<div className="settings-section-header">
							<h2>Privacy and support</h2>
						</div>
						<div className="settings-list">
							<label className="settings-toggle">
								<div>
									<strong>Public profile</strong>
									<span>Allow recruiters to view your profile.</span>
								</div>
								<input
									type="checkbox"
									checked={preferences.showProfile}
									onChange={() => handleToggle("showProfile")}
								/>
							</label>
							<label className="settings-toggle">
								<div>
									<strong>Share usage data</strong>
									<span>Help us improve the product with anonymized data.</span>
								</div>
								<input
									type="checkbox"
									checked={preferences.shareUsage}
									onChange={() => handleToggle("shareUsage")}
								/>
							</label>
							<div className="settings-support">
								<div>
									<strong>Support center</strong>
									<span>Get help with billing, resumes, and job tracking.</span>
								</div>
								<button className="btn btn-outline">Open support</button>
							</div>
							<div className="settings-support">
								<div>
									<strong>Privacy policy</strong>
									<span>Review how we protect your information.</span>
								</div>
								<button className="btn btn-outline">View policy</button>
							</div>
						</div>
					</section>

					<section id="data" className="settings-section">
						<div className="settings-section-header">
							<h2>Data controls</h2>
						</div>
						<div className="settings-support">
							<div>
								<strong>Download my data</strong>
								<span>Export applications, resumes, and activity history.</span>
							</div>
							<button className="btn btn-secondary">Request export</button>
						</div>
						<div className="settings-support">
							<div>
								<strong>Clear activity history</strong>
								<span>Remove cached search and tracking history.</span>
							</div>
							<button className="btn btn-ghost">Clear history</button>
						</div>
					</section>

					<section id="delete" className="settings-section settings-danger">
						<div className="settings-section-header">
							<h2>Delete my account</h2>
						</div>
						<p className="settings-danger-text">
							This will permanently delete your account, resumes, applications, and saved data.
						</p>
						<form className="settings-form" onSubmit={handleDeleteAccount}>
							<label>
								Type DELETE to confirm
								<input
									type="text"
									placeholder="DELETE"
									value={deleteConfirm}
									onChange={(event) => setDeleteConfirm(event.target.value)}
								/>
							</label>
							<div className="settings-actions">
								<button
									type="submit"
									className="btn btn-danger"
									disabled={deleteConfirm !== "DELETE" || deletingAccount}
								>
									{deletingAccount ? "Deleting..." : "Delete account"}
								</button>
							</div>
						</form>
					</section>
				</div>
			</div>
		</div>
	);
};

export default Setting;

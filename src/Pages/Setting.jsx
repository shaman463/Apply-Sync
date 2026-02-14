import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Setting.css";

const Setting = () => {
	const navigate = useNavigate();
	const [feedback, setFeedback] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState("");
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

	const handleChangePassword = (event) => {
		event.preventDefault();
		setFeedback("Password update request saved. Please check your email for confirmation.");
	};

	const handleDeleteAccount = (event) => {
		event.preventDefault();
		setFeedback("Account deletion request submitted. We will follow up by email.");
	};

	return (
		<div className="settings-page">
			<header className="settings-hero">
				<div>
					<button className="settings-back" onClick={() => navigate("/dashboard")}>
						Back to dashboard
					</button>
					<h1>Settings</h1>
					<p>
						Manage security, privacy, notifications, and support preferences for your ApplySync account.
					</p>
				</div>
				<div className="settings-hero-card">
					<h3>Account status</h3>
					<ul>
						<li>Plan: Pro Trial</li>
						<li>2FA: {preferences.twoFactor ? "Enabled" : "Off"}</li>
						<li>Region: United States</li>
					</ul>
				</div>
			</header>

			{feedback && <div className="settings-banner">{feedback}</div>}

			<div className="settings-grid">
				<section className="settings-card">
					<div className="settings-card-header">
						<h2>Change password</h2>
						<span>Security</span>
					</div>
					<form className="settings-form" onSubmit={handleChangePassword}>
						<label>
							Current password
							<input type="password" placeholder="Enter current password" required />
						</label>
						<label>
							New password
							<input type="password" placeholder="Use a strong password" required />
						</label>
						<label>
							Confirm new password
							<input type="password" placeholder="Re-enter new password" required />
						</label>
						<div className="settings-actions">
							<button type="submit" className="btn btn-primary">Update password</button>
							<button type="button" className="btn btn-secondary">Send reset link</button>
						</div>
					</form>
				</section>

				<section className="settings-card">
					<div className="settings-card-header">
						<h2>Notifications</h2>
						<span>Preferences</span>
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

				<section className="settings-card">
					<div className="settings-card-header">
						<h2>Privacy and support</h2>
						<span>Controls</span>
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

				<section className="settings-card">
					<div className="settings-card-header">
						<h2>Security</h2>
						<span>Protection</span>
					</div>
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

				<section className="settings-card">
					<div className="settings-card-header">
						<h2>Data controls</h2>
						<span>Exports</span>
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

				<section className="settings-card settings-danger">
					<div className="settings-card-header">
						<h2>Delete my account</h2>
						<span>Danger zone</span>
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
								disabled={deleteConfirm !== "DELETE"}
							>
								Delete account
							</button>
							<button type="button" className="btn btn-secondary">Contact support first</button>
						</div>
					</form>
				</section>
			</div>
		</div>
	);
};

export default Setting;

import { useState } from "react";
import axios from "axios";
import { apiBaseUrl } from "../Services/apiBaseUrl";
import "../styles/InfoPages.css";

const Support = () => {
	const [topic, setTopic] = useState("");
	const [message, setMessage] = useState("");
	const [feedback, setFeedback] = useState("");
	const [sending, setSending] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setFeedback("");

		if (!message.trim()) {
			setFeedback("Please add a short message.");
			return;
		}

		let userId = null;
		let email = null;
		try {
			const userData = JSON.parse(localStorage.getItem("userData") || "null");
			userId = userData?.id || null;
			email = userData?.email || null;
		} catch {
			userId = null;
			email = null;
		}

		try {
			setSending(true);
			await axios.post(`${apiBaseUrl}/api/support/messages`, {
				topic,
				message,
				email,
				source: "support",
				userId,
			});
			setFeedback("Thanks! Your message has been sent.");
			setTopic("");
			setMessage("");
		} catch (error) {
			setFeedback(error.response?.data?.message || "Unable to send your message.");
		} finally {
			setSending(false);
		}
	};

	return (
		<main className="info-page">
			<section className="info-hero">
				<div>
					<span className="info-pill">Support Center</span>
					<h1>Get help, fast.</h1>
					<p>
						Find answers to common questions, troubleshoot issues, and learn best
						practices for tracking applications, resumes, and interviews.
					</p>
				</div>
				<div className="info-hero-card">
					<h3>Popular topics</h3>
					<ul>
						<li>Saving jobs with the extension</li>
						<li>Exporting application data</li>
						<li>Resetting your password</li>
					</ul>
				</div>
			</section>

			<section className="info-grid">
				<article>
					<h2>Extension help</h2>
					<p>
						If a job page does not save correctly, refresh the page, ensure the
						extension is enabled, and try again. For new sites, rely on the
						description-based fallback to capture missing fields.
					</p>
				</article>
				<article>
					<h2>Account & security</h2>
					<p>
						Manage passwords, delete your account, or sign out of all sessions in
						the Settings page. Two-factor authentication will be added in a future
						release.
					</p>
				</article>
				<article>
					<h2>Data exports</h2>
					<p>
						Request a JSON export from Settings. If the download does not start,
						check your browser download permissions and try again.
					</p>
				</article>
			</section>

			<section className="info-contact">
				<div>
					<h2>Still stuck?</h2>
					<p>
						Email us at <strong>support@applysync.app</strong> with a short
						description of the issue and a screenshot when possible.
					</p>
					<p>We aim to reply within 1-2 business days.</p>
				</div>
				<form className="info-form" onSubmit={handleSubmit}>
					<label>
						Topic
						<input
							type="text"
							placeholder="Extension, account, billing"
							value={topic}
							onChange={(event) => setTopic(event.target.value)}
						/>
					</label>
					<label>
						Message
						<textarea
							rows="4"
							placeholder="Tell us what happened"
							value={message}
							onChange={(event) => setMessage(event.target.value)}
						/>
					</label>
					{feedback && <div className="info-banner">{feedback}</div>}
					<button className="info-button" type="submit" disabled={sending}>
						{sending ? "Sending..." : "Send message"}
					</button>
				</form>
			</section>
		</main>
	);
};

export default Support;

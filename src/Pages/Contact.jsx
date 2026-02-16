import { useState } from "react";
import axios from "axios";
import { apiBaseUrl } from "../Services/apiBaseUrl";
import "../styles/InfoPages.css";

const Contact = () => {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
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

		try {
			setSending(true);
			await axios.post(`${apiBaseUrl}/api/support/messages`, {
				name: fullName,
				email,
				message,
				source: "contact",
			});
			setFeedback("Thanks! We will reply soon.");
			setFullName("");
			setEmail("");
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
					<span className="info-pill">Contact</span>
					<h1>Let us know how we can help.</h1>
					<p>
						Reach out for product feedback, feature requests, or support. We
						typically respond within 24 hours.
					</p>
				</div>
				<div className="info-hero-card">
					<h3>Support hours</h3>
					<ul>
						<li>Mon-Fri: 9am-6pm</li>
						<li>Sat: 10am-2pm</li>
						<li>Sun: Closed</li>
					</ul>
				</div>
			</section>

			<section className="info-contact">
				<div>
					<h2>Contact details</h2>
					<p>Email: support@applysync.com</p>
					<p>Phone: +1 (555) 014-2024</p>
					<p>Location: Remote-first, worldwide</p>
				</div>
				<form className="info-form" onSubmit={handleSubmit}>
					<label>
						Full name
						<input
							type="text"
							placeholder="Jane Doe"
							value={fullName}
							onChange={(event) => setFullName(event.target.value)}
						/>
					</label>
					<label>
						Email
						<input
							type="email"
							placeholder="jane@email.com"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
					</label>
					<label>
						Message
						<textarea
							rows="4"
							placeholder="Tell us how we can help."
							value={message}
							onChange={(event) => setMessage(event.target.value)}
						/>
					</label>
					{feedback && <div className="info-banner">{feedback}</div>}
					<button type="submit" className="info-button" disabled={sending}>
						{sending ? "Sending..." : "Send message"}
					</button>
				</form>
			</section>
		</main>
	);
};

export default Contact;

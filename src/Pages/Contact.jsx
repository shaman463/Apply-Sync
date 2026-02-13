import "../styles/InfoPages.css";

const Contact = () => {
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
				<form className="info-form">
					<label>
						Full name
						<input type="text" placeholder="Jane Doe" />
					</label>
					<label>
						Email
						<input type="email" placeholder="jane@email.com" />
					</label>
					<label>
						Message
						<textarea rows="4" placeholder="Tell us how we can help." />
					</label>
					<button type="button" className="info-button">
						Send message
					</button>
				</form>
			</section>
		</main>
	);
};

export default Contact;

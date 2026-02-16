import "../styles/InfoPages.css";

const Privacy = () => {
	return (
		<main className="info-page">
			<section className="info-hero">
				<div>
					<span className="info-pill">Privacy Policy</span>
					<h1>Your data, your control.</h1>
					<p>
						We collect only what we need to run ApplySync and help you track your
						applications. We do not sell personal data.
					</p>
				</div>
				<div className="info-hero-card">
					<h3>At a glance</h3>
					<ul>
						<li>No data sales</li>
						<li>Export your data anytime</li>
						<li>Delete your account on demand</li>
					</ul>
				</div>
			</section>

			<section className="info-grid">
				<article>
					<h2>Information we collect</h2>
					<p>
						Account email, authentication details, job application data you save,
						and basic usage telemetry (when enabled).
					</p>
				</article>
				<article>
					<h2>How we use it</h2>
					<p>
						To sync your applications, provide dashboards, and improve product
						performance. Support requests may use logs you share with us.
					</p>
				</article>
				<article>
					<h2>Your choices</h2>
					<p>
						Export your data from Settings, disable usage sharing, or delete your
						account at any time. Account deletion removes all stored data.
					</p>
				</article>
			</section>

			<section className="info-grid">
				<article>
					<h2>Security</h2>
					<p>
						We use encryption in transit and apply least-privilege access controls
						internally. Always use a strong password and keep your device secure.
					</p>
				</article>
				<article>
					<h2>Retention</h2>
					<p>
						Data is retained while your account is active. Deleted accounts remove
						all associated jobs, resumes, and profile data within 30 days.
					</p>
				</article>
				<article>
					<h2>Contact</h2>
					<p>
						Questions about privacy? Email <strong>privacy@applysync.app</strong>.
					</p>
				</article>
			</section>
		</main>
	);
};

export default Privacy;

import "../styles/InfoPages.css";

const About = () => {
	return (
		<main className="info-page">
			<section className="info-hero">
				<div>
					<span className="info-pill">About ApplySync</span>
					<h1>We turn job search chaos into clarity.</h1>
					<p>
						ApplySync helps you track applications, measure progress, and improve
						your resume with explainable insights. Our tools focus on signal,
						not noise.
					</p>
				</div>
				<div className="info-hero-card">
					<h3>Our focus</h3>
					<ul>
						<li>Actionable dashboards</li>
						<li>Explainable resume scoring</li>
						<li>Simple, fast workflows</li>
					</ul>
				</div>
			</section>

			<section className="info-grid">
				<article>
					<h2>Why we built this</h2>
					<p>
						Job seekers juggle dozens of applications, interviews, and updates.
						We built ApplySync to keep everything organized with a clean visual
						system.
					</p>
				</article>
				<article>
					<h2>What makes us different</h2>
					<p>
						We emphasize explainable scoring and consistent UX, so you always
						know why a decision was made and what to improve next.
					</p>
				</article>
				<article>
					<h2>Built for momentum</h2>
					<p>
						Every interaction is designed to help you move forward, from resume
						feedback to interview tracking.
					</p>
				</article>
			</section>
		</main>
	);
};

export default About;

import "../styles/InfoPages.css";

const Services = () => {
	const services = [
		{
			title: "Resume Quality Engine",
			description: "Explainable scoring with structure, clarity, and ATS checks."
		},
		{
			title: "Application Tracker",
			description: "Organize roles, stages, and next steps in one dashboard."
		},
		{
			title: "Interview Prep",
			description: "Capture interview dates, notes, and follow-ups quickly."
		},
		{
			title: "Insights & Metrics",
			description: "Measure momentum with trend views and weekly activity."
		}
	];

	return (
		<main className="info-page">
			<section className="info-hero">
				<div>
					<span className="info-pill">Services</span>
					<h1>Everything you need to stay interview-ready.</h1>
					<p>
						ApplySync bundles resume analytics, tracking, and preparation tools
						so you can focus on the roles that matter.
					</p>
				</div>
				<div className="info-hero-card">
					<h3>Included</h3>
					<ul>
						<li>Resume scoring</li>
						<li>Job tracking</li>
						<li>Interview notes</li>
					</ul>
				</div>
			</section>

			<section className="info-cards">
				{services.map((service) => (
					<article key={service.title}>
						<h2>{service.title}</h2>
						<p>{service.description}</p>
					</article>
				))}
			</section>
		</main>
	);
};

export default Services;

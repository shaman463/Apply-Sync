console.log("Content script loaded on:", window.location.href);

const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim();

const isInvalidValue = (value) => {
	const normalized = normalizeText(value).toLowerCase();
	if (!normalized) return true;
	if (["indeed", "job title", "unknown", "unknown company", "not specified", "n/a"].includes(normalized)) {
		return true;
	}
	return /(company:|industry:|employment type:|location:|experience:|job description:)/i.test(normalized);
};

const extractFromDescription = (description) => {
	if (!description) return { title: "", company: "", location: "", salary: "" };
	const inlineLabels = [
		"Job\\s*Title",
		"Company",
		"Company\\s+Name",
		"Company\\s+Location",
		"Employer",
		"Work\\s+Location",
		"Candidate\\s+Work\\s+Location",
		"Location",
		"Pay",
		"Salary",
		"Compensation",
		"Experience",
		"Job\\s+Description",
	];
	const boundary = inlineLabels.join("|");
	const inline = (label) => {
		const pattern = new RegExp(`${label}\\s*:?\\s*([^\\n]+?)(?=\\s+(?:${boundary})\\s*:?|$)`, "i");
		const match = description.match(pattern);
		return match?.[1] ? normalizeText(match[1]) : "";
	};

	const line = (pattern, groupIndex = 1) => {
		const match = description.match(pattern);
		return match?.[groupIndex] ? normalizeText(match[groupIndex]) : "";
	};

	const title = line(/^\s*Job\s*Title\s*:?\s*(.+)$/im) || inline("Job\\s*Title");
	const company = line(/^(?!\s*Company\s+Location\s*:)(?:\s*Company\s*:?|\s*Company\s+Name\s*:|\s*Employer\s*:)(.+)$/im) || inline("Company|Company\\s+Name|Employer");
	const location = line(/^(?!\s*Company\s+Location\s*:)(?:\s*Work\s+Location|\s*Candidate\s+Work\s+Location|\s*Location)\s*:?\s*(.+)$/im) || inline("Work\\s+Location|Candidate\\s+Work\\s+Location|Location");
	const salary = line(/^\s*(Pay|Salary|Compensation)\s*:\s*(.+)$/im, 2) || inline("Pay|Salary|Compensation");

	return { title, company, location, salary };
};

const extractFromInlineText = (text) => {
	if (!text) return { title: "", company: "", location: "", salary: "" };
	const labels = [
		"Job\\s*Title",
		"Company",
		"Company\\s+Name",
		"Company\\s+Location",
		"Employer",
		"Location",
		"Industry",
		"Employment\\s+Type",
		"Experience",
	];
	const boundary = labels.join("|");
	const pick = (label) => {
		const pattern = new RegExp(`${label}\\s*:?\\s*([^\n]+?)(?=\\s+(?:${boundary})\\s*:?|$)`, "i");
		const match = text.match(pattern);
		return match?.[1] ? normalizeText(match[1]) : "";
	};

	const title = pick("Job\\s*Title") || normalizeText(text.split(/\bCompany\s*:/i)[0]);
	const company = pick("Company|Company\\s+Name|Employer");
	const location = pick("Location");
	return { title: normalizeText(title), company, location, salary: "" };
};

function extractJobDetails() {
	const job = {
		title: "",
		company: "",
		location: "",
		salary: "",
		description: "",
		url: window.location.href,
	};

	const bySelector = (selector) => normalizeText(document.querySelector(selector)?.innerText || "");

	if (location.href.includes("indeed.com")) {
		const detailRoot = document.querySelector("#jobsearch-ViewJob") ||
			document.querySelector("[data-testid='jobDetailSection']") ||
			document;

		const byRoot = (selector) => normalizeText(detailRoot.querySelector(selector)?.innerText || "");

		job.title = byRoot("[data-testid='jobsearch-JobInfoHeader-title']") || byRoot("h1") || byRoot("[data-testid*='title']") || byRoot(".jobTitle");
		job.company = byRoot("[data-testid='company-name']") || byRoot("[data-testid='companyPartialName']") || byRoot(".jobsearch-CompanyInfoWithoutHeaderImage a") || byRoot("a[href*='companies/']");
		job.location = byRoot("[data-testid='job-location']") || byRoot("[data-testid='jobLocation']") || byRoot(".jobLocation");
		job.salary = byRoot("[data-testid='salaryInfoAndJobType']") || byRoot("[data-testid='salary-snippet']") || byRoot(".salary-snippet-container");
		job.description = byRoot("#jobDescriptionText") || byRoot("[data-testid='jobDescriptionText']") || byRoot(".jobsearch-RichTextSnippet") || byRoot("[data-testid='jobDetailSection']");

		const subtitleText = normalizeText(detailRoot.querySelector(".jobsearch-JobInfoHeader-subtitle")?.innerText || "");
		if (subtitleText) {
			const parts = subtitleText.split("\n").map((part) => normalizeText(part)).filter(Boolean);
			if (!job.company && parts[0]) job.company = parts[0];
			if (!job.location && parts[1]) job.location = parts[1];
		}

		const selectedCard = document.querySelector("a[aria-selected='true']") ||
			document.querySelector(".tapItem[aria-current='true']") ||
			document.querySelector(".job_seen_beacon[aria-selected='true']");

		if (selectedCard) {
			const cardTitle = normalizeText(selectedCard.querySelector("[data-testid='jobTitle']")?.innerText || selectedCard.querySelector(".jobTitle")?.innerText || "");
			const cardCompany = normalizeText(selectedCard.querySelector(".companyName")?.innerText || "");
			const cardLocation = normalizeText(selectedCard.querySelector(".companyLocation")?.innerText || "");

			if (cardTitle && isInvalidValue(job.title)) job.title = cardTitle;
			if (cardCompany && (isInvalidValue(job.company) || cardCompany.toLowerCase() !== job.company.toLowerCase())) {
				job.company = cardCompany;
			}
			if (cardLocation && isInvalidValue(job.location)) job.location = cardLocation;
		}

		if (isInvalidValue(job.title) || isInvalidValue(job.company) || isInvalidValue(job.location)) {
			const inlineDerived = extractFromInlineText(job.title);
			if (isInvalidValue(job.title) && inlineDerived.title) job.title = inlineDerived.title;
			if (isInvalidValue(job.company) && inlineDerived.company) job.company = inlineDerived.company;
			if (isInvalidValue(job.location) && inlineDerived.location) job.location = inlineDerived.location;
		}

		if (isInvalidValue(job.title)) job.title = "";
		if (isInvalidValue(job.company)) job.company = "";
		if (isInvalidValue(job.location)) job.location = "";
	} else if (location.href.includes("internshala.com")) {
		job.title = bySelector(".heading_4_5") || bySelector("h1");
		job.company = bySelector(".company_name") || bySelector(".heading_4_5") || "";
		job.location = bySelector(".location_link");
		job.salary = bySelector(".heading_4");
		job.description = bySelector(".job_description") || bySelector("#job_description");
	} else if (location.href.includes("linkedin.com/jobs")) {
		job.title = bySelector(".top-card-layout__title") || bySelector("h1");
		job.company = bySelector(".topcard__org-name-link") || bySelector(".topcard__flavor");
		job.location = bySelector(".topcard__flavor--bullet") || bySelector(".jobs-unified-top-card__bullet");
		job.description = bySelector(".description__text") || bySelector(".jobs-description__content");
	} else if (location.href.includes("glassdoor.com")) {
		job.title = bySelector("h1") || bySelector("[data-test='jobTitle']");
		job.company = bySelector(".css-16nw49e") || bySelector("[data-test='employerName']");
		job.location = bySelector(".css-56kyx5") || bySelector("[data-test='location']");
		job.description = bySelector(".jobDescriptionContent");
	} else if (location.href.includes("naukri.com")) {
		job.title = bySelector("h1.jd-header-title") || bySelector("h1");
		job.company = bySelector(".jd-header-comp-name") || bySelector(".companyInfo");
		job.location = bySelector(".jd-header-location") || bySelector(".loc");
		job.description = bySelector(".dang-inner-html") || bySelector(".job-desc");
	} else {
		job.title = bySelector("h1");
		job.description = bySelector("#jobDescriptionText") || bySelector("[data-testid='jobDescriptionText']") || "";
	}

	if (job.description) {
		const derived = extractFromDescription(job.description);
		if (!job.title) job.title = derived.title;
		if (!job.company || (derived.company && derived.company.toLowerCase() !== job.company.toLowerCase())) {
			job.company = derived.company || job.company;
		}
		if (!job.location) job.location = derived.location;
		if (!job.salary) job.salary = derived.salary;
	}

	return job;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.action === "extract_job") {
		try {
			const jobData = extractJobDetails();
			console.log("Job data extracted:", jobData);
			sendResponse({ success: true, data: jobData });
		} catch (error) {
			console.error("Error extracting job:", error);
			sendResponse({ success: false, error: error.message });
		}
	}
	return true;
});

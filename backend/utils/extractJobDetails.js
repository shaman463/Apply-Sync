const normalizeValue = (value) => {
	if (typeof value !== "string") return null;
	const trimmed = value.replace(/\s+/g, " ").trim();
	return trimmed.length ? trimmed : null;
};

const normalizeTitle = (value) => {
	const normalized = normalizeValue(value);
	if (!normalized) return null;
	let cleaned = normalized
		.replace(/^(an?|the)\s+/i, "")
		.replace(/^experienced\s+/i, "")
		.replace(/\s+(to|for)\s+.+$/i, "")
		.trim();
	return cleaned.length ? cleaned : normalized;
};

const isInvalidValue = (value) => {
	const normalized = normalizeValue(value);
	if (!normalized) return true;
	const lowered = normalized.toLowerCase();
	return [
		"indeed",
		"not specified",
		"not disclosed",
		"n/a",
		"na",
		"unknown",
		"unknown company",
		"job title",
		"company",
		"title",
		"location",
		"salary",
	].includes(lowered);
};

const extractSalaryRegex = (text) => {
	if (!text) return null;
	const patterns = [
		/₹([\d,]+\.?\d*)\s*-\s*₹([\d,]+\.?\d*)\s*(?:a|per)?\s*(month|year)/i,
		/\$([\d,]+\.?\d*)\s*-\s*\$([\d,]+\.?\d*)\s*(?:a|per)?\s*(month|year)/i,
		/([\d,]+\.?\d*)\s*-\s*([\d,]+\.?\d*)\s*(per month|per year|monthly|yearly)/i,
		/\bPay\s*:\s*([₹\$]?[\d,.\s-]+(?:per month|per year|monthly|yearly)?)/i,
		/\bSalary\s*:\s*([₹\$]?[\d,.\s-]+(?:per month|per year|monthly|yearly)?)/i,
	];

	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (match) {
			return match[0].replace(/^Pay\s*:\s*/i, "").replace(/^Salary\s*:\s*/i, "").trim();
		}
	}
	return null;
};

const extractLabeledValue = (description, pattern, groupIndex = 1) => {
	if (!description) return null;
	const match = description.match(pattern);
	if (!match || !match[groupIndex]) return null;
	return match[groupIndex].trim();
};

const extractInlineLabel = (description, label, boundaryLabels) => {
	if (!description) return null;
	const boundary = boundaryLabels.join("|");
	const pattern = new RegExp(`${label}\\s*:?\\s*([^\\n]+?)(?=\\s+(?:${boundary})\\s*:?|$)`, "i");
	return extractLabeledValue(description, pattern, 1);
};

const extractTitleHeuristic = (description) => {
	if (!description) return null;
	const patterns = [
		/\bwe\s+are\s+looking\s+for\s+an?\s+([^\n\.]+?)\b(?:\.|\n| to | for )/i,
		/\blooking\s+for\s+an?\s+([^\n\.]+?)\b(?:\.|\n| to | for )/i,
		/\bseeking\s+an?\s+([^\n\.]+?)\b(?:\.|\n| to | for )/i,
		/\bjoin\s+[^\n\.]+?\s+as\s+an?\s+([^\n\.]+?)\b(?:\.|\n|!| to | for )/i,
		/\bas\s+an?\s+([^\n\.]+?)\b(?:\.|\n|!| to | for )/i,
	];

	for (const pattern of patterns) {
		const match = description.match(pattern);
		if (match?.[1]) {
			const candidate = match[1].trim();
			if (candidate.length > 3 && candidate.length < 120) {
				return normalizeTitle(candidate);
			}
		}
	}
	return null;
};

const extractCompanyHeuristic = (description) => {
	if (!description) return null;
	const patterns = [
		/\bjoin\s+([^\n\.]+?)\s+as\s+an?\s+[^\n\.]+/i,
		/\bjoin\s+([^\n\.]+?)\b(?:\.|\n|!)/i,
		/\bat\s+([A-Z][A-Za-z0-9&.,\- ]{2,})\b/i,
	];

	for (const pattern of patterns) {
		const match = description.match(pattern);
		if (match?.[1]) {
			const candidate = match[1].trim();
			if (candidate.length > 2 && candidate.length < 120) {
				return candidate;
			}
		}
	}
	return null;
};

const extractLocationHeuristic = (description) => {
	if (!description) return null;
	const pattern = /\b(remote|hybrid|on\s*-?site|onsite|work from home|in person)\b/i;
	const match = description.match(pattern);
	if (!match?.[1]) return null;
	const normalized = match[1].toLowerCase();
	if (normalized.includes("remote")) return "Remote";
	if (normalized.includes("hybrid")) return "Hybrid";
	if (normalized.includes("work from home")) return "Work from home";
	if (normalized.includes("in person")) return "In person";
	return "On-site";
};

const splitCompanyLocation = (companyValue, locationValue) => {
	const company = normalizeValue(companyValue);
	if (!company) return { company: companyValue, location: locationValue };
	if (company.includes("\n")) {
		const parts = company.split(/\n+/).map((part) => part.trim()).filter(Boolean);
		if (parts.length >= 2) {
			return {
				company: parts[0],
				location: !isInvalidValue(locationValue) ? locationValue : parts.slice(1).join(", "),
			};
		}
	}
	return { company: companyValue, location: locationValue };
};

const cleanDescriptionText = (description) => {
	if (!description) return "";
	const withoutLabels = description.replace(
		/^\s*(Job\s*Title|Company|Company\s+Name|Company\s+Location|Employer|Work\s+Location|Candidate\s+Work\s+Location|Location|Pay|Salary|Compensation)\s*:?\s*.*$/gim,
		""
	);
	return withoutLabels.replace(/\s+/g, " ").trim();
};

export { cleanDescriptionText };

export const extractJobDetails = async (description, existingData = {}) => {
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

	const labeledTitle = extractLabeledValue(description, /^\s*Job\s*Title\s*:?\s*(.+)$/im);
	const labeledCompany = extractLabeledValue(description, /^(?!\s*Company\s+Location\s*:)(?:\s*Company\s*:?|\s*Company\s+Name\s*:|\s*Employer\s*:)(.+)$/im, 1);
	const labeledLocation = extractLabeledValue(description, /^(?!\s*Company\s+Location\s*:)(?:\s*Work\s+Location|\s*Candidate\s+Work\s+Location|\s*Location)\s*:?\s*(.+)$/im, 1);
	const labeledSalary = extractLabeledValue(description, /^\s*(Pay|Salary|Compensation)\s*:\s*(.+)$/im, 2);

	const inlineTitle = extractInlineLabel(description, "Job\\s*Title", inlineLabels);
	const inlineCompany = extractInlineLabel(description, "Company|Company\\s+Name|Employer", inlineLabels);
	const inlineLocation = extractInlineLabel(description, "Work\\s+Location|Candidate\\s+Work\\s+Location|Location", inlineLabels);
	const inlineSalary = extractInlineLabel(description, "Pay|Salary|Compensation", inlineLabels);

	const descriptionTitle = normalizeTitle(labeledTitle || inlineTitle || extractTitleHeuristic(description));
	const descriptionCompany = normalizeValue(labeledCompany || inlineCompany || extractCompanyHeuristic(description));
	const descriptionLocation = normalizeValue(labeledLocation || inlineLocation || extractLocationHeuristic(description));
	const descriptionSalary = normalizeValue(labeledSalary || inlineSalary || extractSalaryRegex(description));

	const merged = {
		title: !isInvalidValue(descriptionTitle) ? descriptionTitle : normalizeTitle(existingData.title),
		company: !isInvalidValue(descriptionCompany) ? descriptionCompany : normalizeValue(existingData.company),
		location: !isInvalidValue(descriptionLocation) ? descriptionLocation : normalizeValue(existingData.location),
		salary: !isInvalidValue(descriptionSalary) ? descriptionSalary : normalizeValue(existingData.salary),
	};

	const splitValues = splitCompanyLocation(merged.company, merged.location);
	return {
		title: merged.title,
		company: splitValues.company || merged.company,
		location: splitValues.location || merged.location,
		salary: merged.salary,
	};
};

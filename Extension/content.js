// This script extracts job info from job pages.
// I’ll give you selectors for Indeed, LinkedIn, Glassdoor, and Naukri.

function extractJobDetails() {
  let job = {
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    url: window.location.href
  };

  if (location.href.includes("indeed.com")) {
    job.title = document.querySelector("h1")?.innerText || "";
    job.company = document.querySelector(".css-87uc0g")?.innerText || "";
    job.location = document.querySelector(".css-6z8o9s")?.innerText || "";
    job.salary = document.querySelector(".css-1rhg65m")?.innerText || "";
    job.description = document.querySelector("#jobDescriptionText")?.innerText || "";
  }

  if (location.href.includes("linkedin.com/jobs")) {
    job.title = document.querySelector(".top-card-layout__title")?.innerText || "";
    job.company = document.querySelector(".topcard__org-name-link")?.innerText || "";
    job.location = document.querySelector(".topcard__flavor--bullet")?.innerText || "";
    job.description = document.querySelector(".description__text")?.innerText || "";
  }

  if (location.href.includes("glassdoor.com")) {
    job.title = document.querySelector("h1")?.innerText || "";
    job.company = document.querySelector(".css-16nw49e")?.innerText || "";
    job.location = document.querySelector(".css-56kyx5")?.innerText || "";
    job.description = document.querySelector(".jobDescriptionContent")?.innerText || "";
  }

  if (location.href.includes("naukri.com")) {
    job.title = document.querySelector("h1.jd-header-title")?.innerText || "";
    job.company = document.querySelector(".jd-header-comp-name")?.innerText || "";
    job.location = document.querySelector(".jd-header-location")?.innerText || "";
    job.description = document.querySelector(".dang-inner-html")?.innerText || "";
  }

  if (location.href.includes("monster.com")) {
    job.title = document.querySelector("h1[data-testid='svx-job-title']")?.innerText || document.querySelector("h1.title")?.innerText || "";
    job.company = document.querySelector("[data-testid='svx-jobview-company-name']")?.innerText || document.querySelector(".company")?.innerText || "";
    job.location = document.querySelector("[data-testid='svx-jobview-location']")?.innerText || document.querySelector(".location")?.innerText || "";
    job.salary = document.querySelector("[data-testid='svx-jobview-salary']")?.innerText || "";
    job.description = document.querySelector("[data-testid='svx-job-description-text']")?.innerText || document.querySelector(".job-description")?.innerText || "";
  }

  if (location.href.includes("ziprecruiter.com")) {
    job.title = document.querySelector("h1.job_title")?.innerText || document.querySelector("h1")?.innerText || "";
    job.company = document.querySelector("[itemprop='name']")?.innerText || document.querySelector(".hiring_company_text")?.innerText || "";
    job.location = document.querySelector("[itemprop='addressLocality']")?.innerText || document.querySelector(".location")?.innerText || "";
    job.salary = document.querySelector(".salary_range")?.innerText || "";
    job.description = document.querySelector(".job_description")?.innerText || document.querySelector(".jobDescriptionSection")?.innerText || "";
  }

  if (location.href.includes("dice.com")) {
    job.title = document.querySelector("h1[data-cy='jobTitle']")?.innerText || document.querySelector("h1.jobTitle")?.innerText || "";
    job.company = document.querySelector("[data-cy='companyName']")?.innerText || document.querySelector(".employer")?.innerText || "";
    job.location = document.querySelector("[data-cy='locationDetails']")?.innerText || document.querySelector(".location")?.innerText || "";
    job.salary = document.querySelector(".salary")?.innerText || "";
    job.description = document.querySelector("[data-cy='jobDescription']")?.innerText || document.querySelector(".job-description")?.innerText || "";
  }

  if (location.href.includes("simplyhired.com")) {
    job.title = document.querySelector("h1.viewjob-jobTitle")?.innerText || document.querySelector("h1")?.innerText || "";
    job.company = document.querySelector(".viewjob-companyName")?.innerText || document.querySelector(".company")?.innerText || "";
    job.location = document.querySelector(".viewjob-location")?.innerText || document.querySelector(".location")?.innerText || "";
    job.salary = document.querySelector(".viewjob-salary")?.innerText || "";
    job.description = document.querySelector(".viewjob-description")?.innerText || document.querySelector(".job-description")?.innerText || "";
  }

  if (location.href.includes("careerbuilder.com")) {
    job.title = document.querySelector("h1[data-testid='job-title']")?.innerText || document.querySelector(".job-title")?.innerText || "";
    job.company = document.querySelector("[data-testid='company-name']")?.innerText || document.querySelector(".company-name")?.innerText || "";
    job.location = document.querySelector("[data-testid='job-location']")?.innerText || document.querySelector(".job-location")?.innerText || "";
    job.salary = document.querySelector("[data-testid='compensation']")?.innerText || "";
    job.description = document.querySelector("[data-testid='job-description']")?.innerText || document.querySelector(".job-description")?.innerText || "";
  }

  if (location.href.includes("angels.co") || location.href.includes("wellfound.com")) {
    job.title = document.querySelector("h1[data-test='JobDetail-title']")?.innerText || document.querySelector("h1")?.innerText || "";
    job.company = document.querySelector("[data-test='StartupLink-title']")?.innerText || document.querySelector(".company-name")?.innerText || "";
    job.location = document.querySelector("[data-test='JobDetail-location']")?.innerText || document.querySelector(".location")?.innerText || "";
    job.salary = document.querySelector("[data-test='JobDetail-salary']")?.innerText || "";
    job.description = document.querySelector("[data-test='JobDetail-description']")?.innerText || document.querySelector(".job-description")?.innerText || "";
  }

  return job;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "extract_job") {
    try {
      const jobData = extractJobDetails();
      sendResponse({ success: true, data: jobData });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Required for async sendResponse
});

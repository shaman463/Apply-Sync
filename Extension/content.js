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

// this page runs inside the job page itself.
// meaning it has access to -----> document ,window.location.href ,Page DOM elements

// Its only responsibility is to 
// Extract job details from whichever job site you are visiting, and send them
// back to the popup.console.log("Content script loaded on:", window.location.href);

console.log("Content script loaded on:", window.location.href);

// well this our main scraping function 
// we initialize an job objext with empty fields and every site specific
// block will find them
function extractJobDetails() {
  let job = {
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    url: window.location.href
  };

  // well everyone is smart here to understand here what is happeing 
  // if not go to sleep
  if (location.href.includes("internshala.com")) {
    job.title = document.querySelector(".heading_4_5")?.innerText || document.querySelector("h1")?.innerText || "";
    job.company = document.querySelector(".company_name")?.innerText || document.querySelector(".heading_4_5")?.parentElement?.querySelector("a")?.innerText || "";
    job.location = document.querySelector(".location_link")?.innerText || "";
    job.salary = document.querySelector(".heading_4")?.innerText || "";
    job.description = document.querySelector(".job_description")?.innerText || document.querySelector("#job_description")?.innerText || "";
  }

  if (location.href.includes("indeed.com")) {
    // Log all h1 and h2 elements found
    const allH1s = Array.from(document.querySelectorAll("h1, h2, [role='heading']"));
    console.log("🔍 All heading elements found:", allH1s.map(h => ({ tag: h.tagName, text: h.innerText, classes: h.className })));
    
    // Try to find title from various sources
    const titleElement = document.querySelector("h1") ||
                         document.querySelector("h2[class*='title']") ||
                         document.querySelector("[data-testid*='title']") ||
                         document.querySelector(".jobTitle");
    
    job.title = titleElement?.innerText?.trim() || "";
    console.log("📌 Found title element:", titleElement?.innerText, "| Classes:", titleElement?.className);
    
    // Company extraction - look for company name link or text
    const companyElement = document.querySelector("[data-testid='companyPartialName']") ||
                          document.querySelector("a[href*='companies/']") ||
                          document.querySelector(".css-87uc0g") ||
                          document.querySelector("[class*='company']");
    
    job.company = companyElement?.innerText?.trim() || "";
    console.log("🏢 Found company element:", companyElement?.innerText, "| Classes:", companyElement?.className);
    
    // Location
    job.location = document.querySelector("[data-testid='jobLocation']")?.innerText?.trim() ||
                   document.querySelector(".jobLocation")?.innerText?.trim() || "";
    console.log("📍 Found location:", job.location);
    
    // Salary - check multiple sources
    const salaryElement = document.querySelector("[data-testid='salary-snippet']") ||
                         document.querySelector(".salary-snippet-container") ||
                         document.querySelector(".css-1rhg65m");
    
    job.salary = salaryElement?.innerText?.trim() || "";
    console.log("💰 Found salary:", job.salary);
    
    // Description - most important for Groq fallback
    const descElement = document.querySelector("#jobDescriptionText") ||
                       document.querySelector(".jobsearch-RichTextSnippet") ||
                       document.querySelector("[data-testid='jobDetailSection']");
    
    job.description = descElement?.innerText?.trim() || "";
    console.log("📝 Found description length:", job.description?.length || 0);
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


// At last we are sending data back to the popUp.js file
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "extract_job") {
    try {
      const jobData = extractJobDetails();
      console.log("Job data extracted:", jobData);
      sendResponse({ success: true, data: jobData });
    }
    catch (error) {
      console.error("Error extracting job:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Required for async sendResponse
});
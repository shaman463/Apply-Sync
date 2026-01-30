document.getElementById("saveJob").addEventListener("click", async () => {
  const statusDiv = document.getElementById("status");
  const saveBtn = document.getElementById("saveJob");
  
  try {
    // Disable button during processing
    saveBtn.disabled = true;
    statusDiv.textContent = "Extracting job data...";
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "extract_job" }, async (response) => {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = "Error: " + chrome.runtime.lastError.message;
        saveBtn.disabled = false;
        return;
      }

      if (!response || !response.success) {
        statusDiv.textContent = "Failed to extract job data.";
        saveBtn.disabled = false;
        return;
      }

      const jobData = response.data;
      console.log("Job extracted:", jobData);

      // Get auth token from localStorage (you may need to store it in chrome.storage)
      const authToken = localStorage.getItem("authToken");
      
      statusDiv.textContent = "Saving to ApplySync...";

      try {
        const apiResponse = await fetch("http://localhost:5000/api/jobs/save", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify(jobData),
        });

        if (apiResponse.ok) {
          statusDiv.textContent = "✓ Job saved successfully!";
          statusDiv.style.color = "green";
        } else {
          const error = await apiResponse.json();
          statusDiv.textContent = "Failed: " + (error.message || "Unknown error");
          statusDiv.style.color = "red";
        }
      } catch (error) {
        statusDiv.textContent = "Network error: " + error.message;
        statusDiv.style.color = "red";
      }

      saveBtn.disabled = false;
    });
  } catch (error) {
    statusDiv.textContent = "Error: " + error.message;
    statusDiv.style.color = "red";
    saveBtn.disabled = false;
  }
});
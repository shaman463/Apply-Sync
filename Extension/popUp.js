document.getElementById("saveJob").addEventListener("click", () => {
  const statusDiv = document.getElementById("status");
  const saveBtn = document.getElementById("saveJob");
  
  try {
    saveBtn.disabled = true;
    statusDiv.textContent = "Extracting job data...";
    statusDiv.style.color = "#666";
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) {
        statusDiv.textContent = "❌ No active tab found";
        statusDiv.style.color = "red";
        saveBtn.disabled = false;
        return;
      }

      console.log("Sending message to tab:", tab.id, "URL:", tab.url);
      
      // Send message with proper error handling
      chrome.tabs.sendMessage(
        tab.id, 
        { action: "extract_job" }, 
        { frameId: 0 }, // Ensure main frame only
        (response) => {
          // Clear previous errors
          if (chrome.runtime.lastError) {
            // Check if error is benign (content script not available on this page)
            const errorMsg = chrome.runtime.lastError.message;
            if (errorMsg.includes("Could not establish connection")) {
              console.warn("Content script not available on this page");
              statusDiv.textContent = "⚠️ This page doesn't have job data, or extension needs reload";
              statusDiv.style.color = "#ff9800";
              saveBtn.disabled = false;
              // Suggest page refresh
              setTimeout(() => {
                statusDiv.innerHTML += "<br><small>Try refreshing the page</small>";
              }, 500);
              return;
            } else {
              console.error("Tab message error:", chrome.runtime.lastError.message);
              statusDiv.textContent = "⚠️ Error: " + chrome.runtime.lastError.message;
              statusDiv.style.color = "red";
              saveBtn.disabled = false;
              return;
            }
          }

          if (!response || !response.success) {
            console.error("Failed to extract job data:", response);
            statusDiv.textContent = "Failed to extract job data. Check the page format.";
            statusDiv.style.color = "red";
            saveBtn.disabled = false;
            return;
          }

          const jobData = response.data;
          console.log("Job extracted successfully:", jobData);

          // Get token from background script
          chrome.runtime.sendMessage({ action: "getToken" }, (result) => {
            console.log("Token result:", result);
            
            if (chrome.runtime.lastError) {
              console.error("Background script error:", chrome.runtime.lastError);
              statusDiv.textContent = "Extension error. Please reload extension.";
              statusDiv.style.color = "red";
              saveBtn.disabled = false;
              return;
            }

            const authToken = result?.token;
            
            if (!authToken) {
              statusDiv.textContent = "❌ Not logged in! Please login first on ApplySync";
              statusDiv.style.color = "red";
              saveBtn.disabled = false;
              return;
            }

            statusDiv.textContent = "Saving to ApplySync...";
            statusDiv.style.color = "#666";

            console.log("Sending job to backend...");
            fetch("http://localhost:5000/api/jobs/save", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              },
              body: JSON.stringify(jobData),
            }).then(apiResponse => {
              return apiResponse.text().then(responseText => {
                console.log("API Response Status:", apiResponse.status);
                console.log("API Response Text:", responseText);

                if (apiResponse.ok) {
                  statusDiv.textContent = "✓ Job saved successfully!";
                  statusDiv.style.color = "green";
                } else {
                  try {
                    const error = JSON.parse(responseText);
                    statusDiv.textContent = "Failed: " + (error.message || "Unknown error");
                  } catch {
                    statusDiv.textContent = "Failed: " + (apiResponse.statusText || "Server error");
                  }
                  statusDiv.style.color = "red";
                }
                saveBtn.disabled = false;
              });
            }).catch(error => {
              console.error("Network error:", error);
              statusDiv.textContent = "Network error: " + error.message;
              statusDiv.style.color = "red";
              saveBtn.disabled = false;
            });
          });
        }
      );
    });
  } catch (error) {
    console.error("Popup error:", error);
    statusDiv.textContent = "Error: " + error.message;
    statusDiv.style.color = "red";
    saveBtn.disabled = false;
  }
});
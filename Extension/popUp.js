// This here starts the entire extraction of our project
document.getElementById("saveJob").addEventListener("click", () => {
  const statusDiv = document.getElementById("status");
  const saveBtn = document.getElementById("saveJob");
  
  try {
    // Ensuring that the user cannot click twice
    saveBtn.disabled = true;
    statusDiv.textContent = "Extracting job data...";
    statusDiv.style.color = "#666";
    
    // this is used to get current active tab
    // cause the extension need to collect the data from the 
    // current webiste you are on
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      // if no tab is found or open then pop up an error
      if (!tab) {
        statusDiv.textContent = "❌ No active tab found";
        statusDiv.style.color = "red";
        saveBtn.disabled = false;
        return;
      }
      // sends an message to the tab 
      console.log("Sending message to tab:", tab.id, "URL:", tab.url);
      
      // Send message with proper error handling to the content script inside the tab
      // basically what it is doing is telling our content script to extract the 
      // details from the open webiste and return it to us
      chrome.tabs.sendMessage(
        tab.id, 
        { action: "extract_job" }, 
        { frameId: 0 }, // Ensure main frame only
        (response) => {
          // Clear previous errors
          if (chrome.runtime.lastError) {
            // Check if error is occuring meanig content script not available on this page
            const errorMsg = chrome.runtime.lastError.message;
            // This is just a nomral code and if you find this difficult to understand
            // just stop here an go to sleep
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
            }
             else {
              console.error("Tab message error:", chrome.runtime.lastError.message);
              statusDiv.textContent = "⚠️ Error: " + chrome.runtime.lastError.message;
              statusDiv.style.color = "red";
              saveBtn.disabled = false;
              return;
            }
          }
          // it handle our job extraction response
          // and if it get failed pop up will stop
          if (!response || !response.success) {
            console.error("Failed to extract job data:", response);
            statusDiv.textContent = "Failed to extract job data. Check the page format.";
            statusDiv.style.color = "red";
            saveBtn.disabled = false;
            return;
          }

          // and if it sucessfull then 
          const jobData = response.data;
          console.log("Job extracted successfully:", jobData);

          // we are asking here from the background.js that give us the 
          // jwt token
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
            // if there is not token then display this error in the console baby!!!!!
            if (!authToken) {
              statusDiv.textContent = "❌ Not logged in! Please login first on ApplySync";
              statusDiv.style.color = "red";
              saveBtn.disabled = false;
              return;
            }

            statusDiv.textContent = "Saving to ApplySync...";
            statusDiv.style.color = "#666";

            // here is a post request is happening 
            // meaning after receiving the tokene from background 
            // successfully we send it to the backend
            // sending all the details of the job
            console.log("Sending job to backend...");
            fetch("https://apply-sync.onrender.com/api/jobs/save", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              },
              body: JSON.stringify(jobData),
            }).then(apiResponse => {
              // converting it to text
              return apiResponse.text().then(responseText => {
                console.log("API Response Status:", apiResponse.status);
                console.log("API Response Text:", responseText);

                // if everything is ok then great the extension is working
                // ofcourse it will work cause i have made it
                if (apiResponse.ok) {
                  statusDiv.textContent = "Job saved successfully!";
                  statusDiv.style.color = "green";
                }
                // we are herr converting response to .text() to avoid JSON errors
                // basically we are here handling the backend errors
                 else {
                  if (apiResponse.status === 401) {
                    chrome.runtime.sendMessage({ action: "logout" });
                    statusDiv.textContent = "Session expired in extension. Open ApplySync and log in again.";
                    statusDiv.style.color = "red";
                    saveBtn.disabled = false;
                    return;
                  }
                  try {
                    const error = JSON.parse(responseText);
                    statusDiv.textContent = "Failed: " + (error.message || "Unknown error");
                  } catch {
                    statusDiv.textContent = "Failed: " + (apiResponse.statusText || "Server error");
                  }
                  statusDiv.style.color = "red";
                }
                saveBtn.disabled = false;
              }); // catch any network error if occuring
            }).catch(error => {
              console.error("Network error:", error);
              // well it maybe not an network error but rather an CORS ERROR 
              // means cors blocked your request due to some security reason
              statusDiv.textContent = "Network error: " + error.message;
              statusDiv.style.color = "red";
              saveBtn.disabled = false;
            });
          });
        }
      );
    });
  }
   catch (error) {
    console.error("Popup error:", error);
    statusDiv.textContent = "Error: " + error.message;
    statusDiv.style.color = "red";
    saveBtn.disabled = false;
  }
});
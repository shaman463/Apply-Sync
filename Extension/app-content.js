// This is the important part of our extension cause whenever my frontend has a JWT token
// it send it to the chrome extension so the extension can use for saving the data or 
// Make API calls


// it just confirms that chrome injected my content script successfully.
console.log("ApplySync content script loaded");

//This Function i created to send token to extension

// it takes an argument {token} 
function sendTokenToExtension(token) {
  // If there is no token
  if (!token) return;
  
  
  chrome.runtime.sendMessage(
    { action: "saveToken", token: token },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Extension error:", chrome.runtime.lastError.message);
        return;
      }

      // If the response is true then display the message in console 
      if (response?.success) {
        console.log("✓ Token successfully saved to extension");
      }
      // And if not then-->
      else {
        console.log("Token save failed:", response);
      }
    }
  );
}

// Check if token already exists on page load (initial check)
const existingToken = localStorage.getItem('authToken');
if (existingToken) {
  console.log("Existing token found on page load, sending to extension...");
  sendTokenToExtension(existingToken);
}

// Listen for storage changes (when user logs in on another tab)
window.addEventListener('storage', (e) => {
  if (e.key === 'authToken' && e.newValue) {
    console.log("Token detected from web app storage event, sending to extension...");
    sendTokenToExtension(e.newValue);
  }
  
  // Handle logout
  if (e.key === 'authToken' && !e.newValue) {
    console.log("Token removed - user logged out");
    chrome.runtime.sendMessage({ action: "logout" });
  }
});

// Listen for custom events from the web app (more reliable than storage events)
window.addEventListener('applysync-token-saved', (event) => {
  const token = event.detail?.token;
  if (token) {
    console.log("Token from custom event, sending to extension...");
    sendTokenToExtension(token);
  }
});

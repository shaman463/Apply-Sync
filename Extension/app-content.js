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
  
  // it takes the token and send to the background.js and saves it chrome storage
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

// Check if token already exists in page load/ local storage or we need to login or sign Up
const existingToken = localStorage.getItem('authToken');

// If exist then display in console
if (existingToken) {
  console.log("Existing token found on page load, sending to extension...");
  sendTokenToExtension(existingToken);
}

//this function is Listening for storage changes that is when user logs in on another tab
// detects logout so to keep extension in sync
window.addEventListener('storage', (e) => {
  if (e.key === 'authToken' && e.newValue) {
    console.log("Token detected from web app storage event, sending to extension...");
    sendTokenToExtension(e.newValue);
  }
  
  // this handles the logout 
  if (e.key === 'authToken' && !e.newValue) {
    console.log("Token removed - user logged out");
    chrome.runtime.sendMessage({ action: "logout" });
  }
});

// Listen for custom events from the web app 
// because storage events do not fire on the same tab.
window.addEventListener('applysync-token-saved', (event) => {
  const token = event.detail?.token;
  if (token) {
    console.log("Token from custom event, sending to extension...");
    sendTokenToExtension(token);
  }
});

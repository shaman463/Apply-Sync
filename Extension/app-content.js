// Content script for ApplySync app (localhost:5173)
// This listens for login/signup and sends token to extension

console.log("ApplySync content script loaded");

// Listen for storage changes in the web app
window.addEventListener('storage', (e) => {
  if (e.key === 'authToken' && e.newValue) {
    console.log("Token detected from web app, sending to extension...");
    chrome.runtime.sendMessage(
      { action: "saveToken", token: e.newValue },
      (response) => {
        if (response?.success) {
          console.log("✓ Token successfully saved to extension");
        } else {
          console.log("Token save failed:", response);
        }
      }
    );
  }
});

// Also check if token already exists on page load
const existingToken = localStorage.getItem('authToken');
if (existingToken) {
  console.log("Existing token found, sending to extension...");
  chrome.runtime.sendMessage(
    { action: "saveToken", token: existingToken },
    (response) => {
      if (response?.success) {
        console.log("✓ Existing token saved to extension");
      }
    }
  );
}

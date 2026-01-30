// Listen for messages from the web app and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request.action, "from", sender.url);
  
  if (request.action === "saveToken") {
    // Store token when user logs in
    chrome.storage.local.set({ authToken: request.token }, () => {
      console.log("Token saved in background");
      sendResponse({ success: true });
      
      // Update badge
      chrome.action.setBadgeText({ text: "✓" });
      chrome.action.setBadgeBackgroundColor({ color: "#4285f4" });
    });
    return true;
  }
  
  if (request.action === "getToken") {
    // Retrieve token for extension popup
    chrome.storage.local.get(["authToken"], (result) => {
      console.log("Token retrieved from background:", result.authToken ? "exists" : "not found");
      sendResponse({ token: result.authToken || null });
    });
    return true;
  }

  if (request.action === "logout") {
    // Clear token on logout
    chrome.storage.local.remove(["authToken"], () => {
      console.log("Token cleared from background");
      chrome.action.setBadgeText({ text: "" });
      sendResponse({ success: true });
    });
    return true;
  }

  sendResponse({ error: "Unknown action" });
  return false;
});

// Initialize badge on extension load
chrome.storage.local.get(["authToken"], (result) => {
  if (result.authToken) {
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4285f4" });
    console.log("Extension loaded - user is logged in");
  } else {
    console.log("Extension loaded - user not logged in");
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.authToken) {
    if (changes.authToken.newValue) {
      chrome.action.setBadgeText({ text: "✓" });
      chrome.action.setBadgeBackgroundColor({ color: "#4285f4" });
      console.log("Token updated - badge set to ✓");
    } else {
      chrome.action.setBadgeText({ text: "" });
      console.log("Token removed - badge cleared");
    }
  }
});

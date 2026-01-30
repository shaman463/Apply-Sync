// This is our brain of the extension this here all the magic happens 
// it stors jwt token securly and give token to popup and content.js
// when asked. keep the token updated across all the tabs

// Listen for messages from the web app and popup means everytime popup and content
// scripts send a message the background hears properly

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request.action, "from", sender.url);
  
  // This runs when my website logs in & content script sends token.
  if (request.action === "saveToken") {
    // the thing is chrome extensions cannot access localstorage of websites 
    // so we send it to the background where it is stored safely
    // Store token when user logs in
    chrome.storage.local.set({ authToken: request.token }, () => {
      console.log("Token saved in background");
      sendResponse({ success: true });
      
      // This tells the user visually that “You are logged in”.
      chrome.action.setBadgeText({ text: "✓" });
      chrome.action.setBadgeBackgroundColor({ color: "#4285f4" });
    });
    //this allows asynchronous sendResponse to work.
    return true;
  }
  
  if (request.action === "getToken") {
    // it reads the authtoken from chrome storage and send it to the popUp
    // Retrieve token for extension popup
    chrome.storage.local.get(["authToken"], (result) => {
      console.log("Token retrieved from background:", result.authToken ? "exists" : "not found");
      // if empty return null
      sendResponse({ token: result.authToken || null });
    });
    return true;
  }

  if (request.action === "logout") {
    // Clear token on logout
    // it delets the token from storage remove the logo thing and notifies
    // content and popUp that we had logout
    chrome.storage.local.remove(["authToken"], () => {
      console.log("Token cleared from background");
      chrome.action.setBadgeText({ text: "" });
      sendResponse({ success: true });
    });
    return true;
  }

  // Good fallback to avoid silent failures.
  sendResponse({ error: "Unknown action" });
  return false;
});

// when the extension is first loaded meaning when the user 
// refreshes or install the extension
chrome.storage.local.get(["authToken"], (result) => {
  if (result.authToken) {
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4285f4" });
    console.log("Extension loaded - user is logged in");
  } else {
    console.log("Extension loaded - user not logged in");
  }
});

// Listen for storage changes in chrome
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.authToken) {
    // whenever there is a change is chrome storage it will display
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

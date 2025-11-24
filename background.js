// Ensure the side panel opens when the user clicks the extension icon.
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Also re-apply on startup so the behavior persists across browser restarts.
chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

let lastSelectionText = "";

// Relay selected text from content scripts to the side panel, and keep a cached copy.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SELECTION_CHANGED") {
    lastSelectionText = message.text || "";
    chrome.runtime.sendMessage(
      { type: "SELECTION_BROADCAST", text: lastSelectionText },
      () => void chrome.runtime.lastError
    );
    sendResponse({ ok: true });
    return;
  }

  if (message?.type === "GET_LAST_SELECTION") {
    sendResponse({ text: lastSelectionText });
  }
});

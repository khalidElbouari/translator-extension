export const fetchActiveTabSelection = async () => {
  if (
    typeof chrome === "undefined" ||
    !chrome?.tabs?.query ||
    !chrome?.scripting?.executeScript
  ) {
    return "";
  }

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (
      !tab?.id ||
      !tab.url ||
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("edge://")
    ) {
      return "";
    }

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => (window.getSelection?.()?.toString() || "").trim().slice(0, 2000),
    });

    return result?.result || "";
  } catch (err) {
    console.debug("Selection fetch failed", err);
    return "";
  }
};

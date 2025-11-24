// Detect highlighted text on any page and broadcast it to the extension.
(() => {
  let lastSent = "";
  let debounceId;

  const sendSelection = (text) => {
    if (!chrome?.runtime?.sendMessage) return;
    chrome.runtime.sendMessage({ type: "SELECTION_CHANGED", text }, () => {
      // Ignore "receiving end does not exist" errors when the panel is closed.
      void chrome.runtime.lastError;
    });
  };

  const handleSelectionChange = () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      const raw = (window.getSelection()?.toString() || "").trim();
      const text = raw.slice(0, 2000);
      if (text === lastSent) return;
      lastSent = text;
      sendSelection(text);
    }, 180);
  };

  document.addEventListener("selectionchange", handleSelectionChange, { passive: true });
  document.addEventListener("mouseup", handleSelectionChange, { passive: true });
  document.addEventListener("keyup", (evt) => {
    if (evt.key === "Escape") handleSelectionChange();
  });
})();

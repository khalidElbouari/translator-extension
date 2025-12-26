import { renderApp } from "./components.js";

const API_BASE = "http://localhost:3000/api/v1/translate";
// const API_BASE = "https://translator-server-sigma.vercel.app/api/v1/translate";


const TEXT_ENDPOINT = API_BASE;
const IMAGE_ENDPOINT = `${API_BASE}/image`;

let els = {};

const state = {
  lastSelection: "",
  imageBase64: "",
  isTextLoading: false,
  isImageLoading: false,
  autoFillEnabled: true,
  manualLock: false,
};

const cacheElements = () => {
  els = {
    statusChip: document.getElementById("statusChip"),
    tabs: document.querySelectorAll(".tab"),
    textPanel: document.getElementById("textPanel"),
    imagePanel: document.getElementById("imagePanel"),
    textInput: document.getElementById("textInput"),
    translateBtn: document.getElementById("translateBtn"),
    resultText: document.getElementById("resultText"),
    copyBtn: document.getElementById("copyBtn"),
    charCount: document.getElementById("charCount"),
    pasteBtn: document.getElementById("pasteBtn"),
    clearBtn: document.getElementById("clearBtn"),
    autoFillToggle: document.getElementById("autoFillToggle"),
    dropzone: document.getElementById("dropzone"),
    imageInput: document.getElementById("imageInput"),
    imagePreview: document.getElementById("imagePreview"),
    previewImg: document.getElementById("previewImg"),
    translateImageBtn: document.getElementById("translateImageBtn"),
    imageResultText: document.getElementById("imageResultText"),
    copyImageBtn: document.getElementById("copyImageBtn"),
  };
};

const setStatus = (label, healthy = true) => {
  if (!els.statusChip) return;
  const dot = els.statusChip.querySelector(".dot");
  if (dot) dot.style.background = healthy ? "#22c55e" : "#ef4444";
  const labelEl = els.statusChip.querySelector(".status-text");
  if (labelEl) labelEl.textContent = label;
};

const setCharCount = () => {
  if (!els.charCount || !els.textInput) return;
  els.charCount.textContent = `${els.textInput.value.length} chars`;
};

const refreshAutoFillToggleUI = () => {
  if (!els.autoFillToggle) return;
  els.autoFillToggle.textContent = `Auto-fill: ${state.autoFillEnabled ? "On" : "Off"}`;
  els.autoFillToggle.classList.toggle("toggle-on", state.autoFillEnabled);
};

const updateSelectionPreview = (text) => {
  state.lastSelection = (text || "").trim();
  const hasSelection = state.lastSelection.length > 0;
  if (state.autoFillEnabled && els.textInput && !els.textInput.value.trim()) {
    state.manualLock = false;
  }
  if (hasSelection && els.textInput && state.autoFillEnabled && !state.manualLock) {
    els.textInput.value = state.lastSelection;
    setCharCount();
  }
};

const setLoading = (type, loading) => {
  if (type === "text" && els.translateBtn) {
    state.isTextLoading = loading;
    els.translateBtn.disabled = loading;
    els.translateBtn.textContent = loading ? "Translating..." : "Translate to Darija";
  }
  if (type === "image" && els.translateImageBtn) {
    state.isImageLoading = loading;
    els.translateImageBtn.disabled = loading || !state.imageBase64;
    els.translateImageBtn.textContent = loading ? "Working..." : "Translate image";
  }
};

const copyToClipboard = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Copied", true);
    setTimeout(() => setStatus("Live", true), 1500);
  } catch (err) {
    console.error("Copy failed:", err);
    setStatus("Copy blocked", false);
  }
};

const handleTextTranslate = async (overrideText) => {
  const text = (overrideText || els.textInput?.value || "").trim();
  if (!text) {
    if (els.resultText) els.resultText.textContent = "Please enter text to translate.";
    return;
  }

  setLoading("text", true);
  if (els.resultText) els.resultText.textContent = "Translating...";

  try {
    const res = await fetch(TEXT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const message = `API error (${res.status})`;
      if (els.resultText) els.resultText.textContent = message;
      setStatus("API error", false);
      console.error(message, await res.text());
      return;
    }

    const data = await res.json();
    const translated = data?.translated || "No translation returned.";
    if (els.resultText) els.resultText.textContent = translated;
    setStatus("Translated", true);
    if (overrideText && els.textInput) {
      els.textInput.value = overrideText;
      setCharCount();
    }
  } catch (err) {
    if (els.resultText) els.resultText.textContent = "Failed to connect to the API.";
    setStatus("Offline?", false);
    console.error("Request error:", err);
  } finally {
    setLoading("text", false);
  }
};

// const handleTextTranslate = async (overrideText) => {
//   const text = (overrideText || els.textInput?.value || "").trim();
//   if (!text) {
//     if (els.resultText) els.resultText.textContent = "Please enter text to translate.";
//     return;
//   }

//   setLoading("text", true);
//   if (els.resultText) els.resultText.textContent = "Translating...";

//   try {
//     const res = await fetch(TEXT_ENDPOINT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ 
//         text,
//         targetLanguage: "Darija"
//       }),
//     });

//     if (!res.ok) {
//       const message = `API error (${res.status})`;
//       if (els.resultText) els.resultText.textContent = message;
//       setStatus("API error", false);
//       console.error(message, await res.text());
//       return;
//     }

//     const data = await res.json();
//     const translated = data?.translation || data?.error || "No translation returned.";

//     if (els.resultText) els.resultText.textContent = translated;
//     setStatus("Translated", true);

//     if (overrideText && els.textInput) {
//       els.textInput.value = overrideText;
//       setCharCount();
//     }
//   } catch (err) {
//     if (els.resultText) els.resultText.textContent = "Failed to connect to the API.";
//     setStatus("Offline?", false);
//     console.error("Request error:", err);
//   } finally {
//     setLoading("text", false);
//   }
// };

const setImagePreview = (dataUrl) => {
  state.imageBase64 = dataUrl || "";
  const hasImage = Boolean(state.imageBase64);
  if (els.imagePreview) els.imagePreview.style.display = hasImage ? "block" : "none";
  if (hasImage && els.previewImg) {
    els.previewImg.src = state.imageBase64;
  } else if (els.previewImg) {
    els.previewImg.removeAttribute("src");
  }
  if (els.translateImageBtn) els.translateImageBtn.disabled = !hasImage || state.isImageLoading;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const handleImageInput = async (file) => {
  if (!file) return;
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (allowed.length && !allowed.includes(file.type)) {
    setStatus("Unsupported file", false);
    return;
  }
  try {
    const dataUrl = await readFileAsDataUrl(file);
    setImagePreview(dataUrl);
    setStatus("Image ready", true);
  } catch (err) {
    console.error("File read failed:", err);
    setStatus("Failed to load image", false);
  }
};

const handleImageTranslate = async () => {
  if (!state.imageBase64) {
    setStatus("Add an image first", false);
    return;
  }
  setLoading("image", true);
  if (els.imageResultText) els.imageResultText.textContent = "Detecting and translating...";
  try {
    const res = await fetch(IMAGE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: state.imageBase64 }),
    });
    if (!res.ok) {
      const message = `API error (${res.status})`;
      if (els.imageResultText) els.imageResultText.textContent = message;
      setStatus("API error", false);
      console.error(message, await res.text());
      return;
    }
    const data = await res.json();
    const translated = data?.translated || "No translation returned.";
    if (els.imageResultText) els.imageResultText.textContent = translated;
    setStatus("Image translated", true);
  } catch (err) {
    if (els.imageResultText) els.imageResultText.textContent = "Failed to connect to the API.";
    setStatus("Offline?", false);
    console.error("Image translate error:", err);
  } finally {
    setLoading("image", false);
  }
};

const bindTabs = () => {
  if (!els.tabs) return;
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      els.tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const isText = tab.dataset.tab === "text";
      if (els.textPanel) els.textPanel.classList.toggle("hidden", !isText);
      if (els.imagePanel) els.imagePanel.classList.toggle("hidden", isText);
    });
  });
};

const bindTextActions = () => {
  if (els.translateBtn) els.translateBtn.addEventListener("click", () => handleTextTranslate());
  if (els.textInput) {
    els.textInput.addEventListener("input", () => {
      state.manualLock = true;
      setCharCount();
    });
    els.textInput.addEventListener("keydown", (evt) => {
      if ((evt.metaKey || evt.ctrlKey) && evt.key === "Enter") {
        evt.preventDefault();
        handleTextTranslate();
      }
    });
  }
  if (els.copyBtn) els.copyBtn.addEventListener("click", () => copyToClipboard(els.resultText?.textContent));
  if (els.pasteBtn) {
    els.pasteBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (els.textInput) {
          els.textInput.value = text;
          setCharCount();
        }
      } catch (err) {
        setStatus("Paste blocked", false);
        console.error("Paste failed:", err);
      }
    });
  }
  if (els.clearBtn) {
    els.clearBtn.addEventListener("click", () => {
      if (els.textInput) els.textInput.value = "";
      if (els.resultText) els.resultText.textContent = "Translation will appear here...";
      state.manualLock = false;
      setCharCount();
    });
  }
  if (els.autoFillToggle) {
    els.autoFillToggle.addEventListener("click", () => {
      state.autoFillEnabled = !state.autoFillEnabled;
      if (state.autoFillEnabled) {
        state.manualLock = false;
        fetchActiveTabSelection();
        if (state.lastSelection) updateSelectionPreview(state.lastSelection);
      }
      refreshAutoFillToggleUI();
    });
    refreshAutoFillToggleUI();
  }
};

const bindImageActions = () => {
  if (els.dropzone) {
    els.dropzone.addEventListener("click", () => els.imageInput?.click());
    els.dropzone.addEventListener("dragover", (evt) => {
      evt.preventDefault();
      els.dropzone.classList.add("dragover");
    });
    ["dragleave", "dragend", "drop"].forEach((evtName) =>
      els.dropzone.addEventListener(evtName, () => els.dropzone.classList.remove("dragover"))
    );
    els.dropzone.addEventListener("drop", (evt) => {
      evt.preventDefault();
      const file = evt.dataTransfer?.files?.[0];
      if (file) handleImageInput(file);
    });
  }
  if (els.imageInput) {
    els.imageInput.addEventListener("change", (evt) => {
      const file = evt.target.files?.[0];
      handleImageInput(file);
    });
  }
  if (els.translateImageBtn) els.translateImageBtn.addEventListener("click", handleImageTranslate);
  if (els.copyImageBtn) els.copyImageBtn.addEventListener("click", () => copyToClipboard(els.imageResultText?.textContent));
};

const initSelectionSync = () => {
  const handleMessage = (message) => {
    if (message?.type === "SELECTION_CHANGED" || message?.type === "SELECTION_BROADCAST") {
      updateSelectionPreview(message.text);
    }
  };
  if (chrome?.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.runtime.sendMessage({ type: "GET_LAST_SELECTION" }, (response) => {
      if (chrome.runtime.lastError) return;
      updateSelectionPreview(response?.text || "");
    });
  }
};

const fetchActiveTabSelection = async () => {
  if (!chrome?.tabs?.query || !chrome?.scripting?.executeScript) return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return;
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => (window.getSelection?.()?.toString() || "").trim().slice(0, 2000),
    });
    const text = result?.result || "";
    if (text) updateSelectionPreview(text);
  } catch {
    return;
  }
};

const startSelectionPolling = () => {
  setInterval(() => {
    if (document.hidden) return;
    fetchActiveTabSelection();
  }, 1200);
};

const init = () => {
  const appRoot = document.getElementById("app");
  renderApp(appRoot);
  cacheElements();
  bindTabs();
  bindTextActions();
  bindImageActions();
  initSelectionSync();
  fetchActiveTabSelection();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) fetchActiveTabSelection();
  });
  window.addEventListener("focus", fetchActiveTabSelection);
  startSelectionPolling();
  setCharCount();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

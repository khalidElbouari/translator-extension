import { MESSAGE_TYPES } from "../utils/constants.js";
import { getLastSelection, setLastSelection } from "../services/storage.js";

let lastSelection = "";

const setPanelBehavior = () => {
  if (!chrome?.sidePanel?.setPanelBehavior) return;
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
};

const broadcastSelection = (text) => {
  if (!chrome?.runtime?.sendMessage) return;
  chrome.runtime.sendMessage(
    { type: MESSAGE_TYPES.SELECTION_BROADCAST, text },
    () => void chrome.runtime.lastError
  );
};

const cacheSelection = async () => {
  const stored = await getLastSelection();
  if (stored) lastSelection = stored;
};

chrome.runtime.onInstalled.addListener(() => {
  setPanelBehavior();
  cacheSelection();
});

chrome.runtime.onStartup.addListener(() => {
  setPanelBehavior();
  cacheSelection();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === MESSAGE_TYPES.SELECTION_CHANGED) {
    const normalized = (message.text || "").trim().slice(0, 2000);
    lastSelection = normalized;
    setLastSelection(normalized);
    broadcastSelection(normalized);
    sendResponse?.({ ok: true });
    return;
  }

  if (message?.type === MESSAGE_TYPES.GET_LAST_SELECTION) {
    if (lastSelection) {
      sendResponse?.({ text: lastSelection });
      return;
    }
    getLastSelection().then((text) => sendResponse?.({ text: text || "" }));
    return true;
  }
});

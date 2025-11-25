import { MESSAGE_TYPES } from "../utils/constants.js";

const runtime = () =>
  typeof chrome !== "undefined" && chrome.runtime ? chrome.runtime : null;

export const sendMessage = (payload) =>
  new Promise((resolve) => {
    const rt = runtime();
    if (!rt?.sendMessage) {
      resolve(undefined);
      return;
    }
    rt.sendMessage(payload, (response) => {
      const error = rt.lastError;
      if (error) {
        console.debug("Message ignored:", error.message);
        resolve(undefined);
      } else {
        resolve(response);
      }
    });
  });

export const subscribeToMessages = (handler) => {
  const rt = runtime();
  if (!rt?.onMessage?.addListener) return () => undefined;

  const listener = (message, sender, sendResponse) => {
    handler?.(message, sender, sendResponse);
  };
  rt.onMessage.addListener(listener);
  return () => rt.onMessage.removeListener(listener);
};

export const requestLastSelection = async () => {
  const response = await sendMessage({ type: MESSAGE_TYPES.GET_LAST_SELECTION });
  return response?.text || "";
};

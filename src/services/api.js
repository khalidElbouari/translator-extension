import { CONTENT_ENDPOINTS, TRANSLATE_ENDPOINT } from "../utils/constants.js";

const parseError = (res) => `API error (${res?.status || "offline"})`;

const toJson = async (res) => {
  try {
    return await res.json();
  } catch (err) {
    console.error("Failed to parse API response", err);
    return {};
  }
};

const buildHeaders = (userId) => {
  const headers = { "Content-Type": "application/json" };
  if (userId) headers["x-user-id"] = userId;
  return headers;
};

export const translateText = async (payload, userId) => {
  try {
    const res = await fetch(TRANSLATE_ENDPOINT, {
      method: "POST",
      headers: buildHeaders(userId),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { error: parseError(res) };
    }
    const data = await toJson(res);
    const translated = data?.data?.translated ?? data?.data ?? data?.translated;
    return { translated: translated || "No translation returned." };
  } catch (err) {
    console.error("translateText failed", err);
    return { error: "Failed to connect to the API." };
  }
};

export const contentAction = async (type, payload, userId) => {
  const url = CONTENT_ENDPOINTS?.[type];
  if (!url) return { error: "Unsupported action." };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: buildHeaders(userId),
      body: JSON.stringify(payload || {}),
    });

    if (!res.ok) {
      return { error: parseError(res) };
    }
    const data = await toJson(res);
    const content = data?.data ?? data;
    const mapped =
      type === "summarize"
        ? content?.summary ?? content
        : type === "explain"
          ? content?.explanation ?? content
          : type === "rewrite"
            ? content?.rewritten ?? content
            : type === "formAssist"
              ? content?.suggestion ?? content
              : content;
    return { data: mapped };
  } catch (err) {
    console.error(`${type} failed`, err);
    return { error: "Failed to connect to the API." };
  }
};

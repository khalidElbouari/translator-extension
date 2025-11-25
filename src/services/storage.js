import {
  DEFAULT_SETTINGS,
  DEFAULT_USER_PROFILE,
  STORAGE_KEYS,
} from "../utils/constants.js";

const isChromeStorageAvailable = () =>
  typeof chrome !== "undefined" && !!chrome.storage?.local;

const resolveWithDefault = (value, fallback) =>
  value === undefined || value === null ? fallback : value;

export const getFromStorage = (key, fallback) =>
  new Promise((resolve) => {
    if (!isChromeStorageAvailable()) {
      resolve(resolveWithDefault(undefined, fallback));
      return;
    }
    chrome.storage.local.get([key], (result) => {
      resolve(resolveWithDefault(result?.[key], fallback));
    });
  });

export const setInStorage = (key, value) =>
  new Promise((resolve) => {
    if (!isChromeStorageAvailable()) {
      resolve(false);
      return;
    }
    chrome.storage.local.set({ [key]: value }, () => resolve(true));
  });

export const getLastSelection = () =>
  getFromStorage(STORAGE_KEYS.LAST_SELECTION, "");

export const setLastSelection = (text) =>
  setInStorage(STORAGE_KEYS.LAST_SELECTION, text || "");

export const getUserProfile = () =>
  getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER_PROFILE);

export const saveUserProfile = (user) =>
  setInStorage(STORAGE_KEYS.USER, { ...DEFAULT_USER_PROFILE, ...(user || {}) });

export const getSettings = () =>
  getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

export const saveSettings = (settings) =>
  setInStorage(STORAGE_KEYS.SETTINGS, {
    ...DEFAULT_SETTINGS,
    ...(settings || {}),
  });

const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultUsage = () => ({
  date: todayKey(),
  counts: {
    translate: 0,
    summarize: 0,
  },
});

export const getUsage = async () => {
  const stored = await getFromStorage(STORAGE_KEYS.USAGE, defaultUsage());
  if (!stored?.date || stored.date !== todayKey()) {
    return defaultUsage();
  }
  return { ...defaultUsage(), ...stored };
};

export const saveUsage = (usage) =>
  setInStorage(STORAGE_KEYS.USAGE, {
    ...defaultUsage(),
    ...(usage || {}),
    counts: { ...defaultUsage().counts, ...(usage?.counts || {}) },
  });

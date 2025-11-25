export const API_BASE = "http://localhost:3000/api"; // update when deploying
export const TRANSLATE_ENDPOINT = `${API_BASE}/translate`;
export const CONTENT_ENDPOINTS = {
  summarize: `${API_BASE}/content/summarize`,
  explain: `${API_BASE}/content/explain`,
  rewrite: `${API_BASE}/content/rewrite`,
  formAssist: `${API_BASE}/content/form-assist`,
};
export const AUTH_ENDPOINTS = {
  google: `${API_BASE}/auth/google`,
};
export const GOOGLE_CLIENT_ID =
  "622427034276-kqbgku481gr3bd0i2v26adjo7i2m0a4j.apps.googleusercontent.com";

export const MESSAGE_TYPES = {
  SELECTION_CHANGED: "SELECTION_CHANGED",
  SELECTION_BROADCAST: "SELECTION_BROADCAST",
  GET_LAST_SELECTION: "GET_LAST_SELECTION",
};

export const STORAGE_KEYS = {
  LAST_SELECTION: "lastSelection",
  USER: "userProfile",
  SETTINGS: "userSettings",
  USAGE: "usageCounters",
};

export const DEFAULT_USER_PROFILE = {
  userId: "",
  plan: "free",
  displayName: "Guest",
  usage: {
    translations: 0,
    quota: null,
  },
};

export const DEFAULT_SETTINGS = {
  autoFillEnabled: true,
};

export const QUOTAS = {
  free: {
    translate: 30,
    summarize: 5,
  },
  premium: {
    translate: Infinity,
    summarize: Infinity,
  },
};

export const FEATURES = {
  formAssist: {
    free: false,
    premium: true,
  },
  rewrite: {
    free: true,
    premium: true,
  },
  explain: {
    free: true,
    premium: true,
  },
  translate: {
    free: true,
    premium: true,
  },
  summarize: {
    free: true,
    premium: true,
  },
};

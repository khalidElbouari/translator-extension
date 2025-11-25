import { AUTH_ENDPOINTS } from "../utils/constants.js";

const parseError = (res) => `Auth error (${res?.status || "offline"})`;

export const loginWithGoogle = async (token) => {
  if (!token) return { error: "Missing token" };
  try {
    const res = await fetch(AUTH_ENDPOINTS.google, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      return { error: parseError(res) };
    }
    const data = await res.json();
    return { profile: data?.data };
  } catch (err) {
    console.error("loginWithGoogle failed", err);
    return { error: "Failed to connect to the auth API." };
  }
};

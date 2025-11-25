import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { contentAction, translateText } from "../../services/api.js";
import { loginWithGoogle } from "../../services/auth.js";
import {
  getSettings,
  getUsage,
  getUserProfile,
  saveSettings,
  saveUsage,
  saveUserProfile,
} from "../../services/storage.js";
import { requestLastSelection, subscribeToMessages } from "../../services/messaging.js";
import { FEATURES, GOOGLE_CLIENT_ID, MESSAGE_TYPES, QUOTAS } from "../../utils/constants.js";
import { fetchActiveTabSelection } from "../../utils/selection.js";
import SelectionCard from "./SelectionCard.jsx";
import StatusChip from "./StatusChip.jsx";
import Tabs from "./Tabs.jsx";
import TextTranslator from "./TextTranslator.jsx";

const DEFAULT_TEXT_RESULT = "Result will appear here...";

const ACTIONS = [
  {
    id: "translate",
    label: "Translate",
    description: "Translate between languages.",
    placeholder: "Enter text to translate...",
    resultLabel: "Translation",
    cta: "Translate",
    processing: "Translating...",
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Condense the text to the essentials.",
    placeholder: "Paste text to summarize...",
    resultLabel: "Summary",
    cta: "Summarize",
    processing: "Summarizing...",
  },
  {
    id: "explain",
    label: "Explain",
    description: "Explain the text clearly.",
    placeholder: "Paste text to explain...",
    resultLabel: "Explanation",
    cta: "Explain",
    processing: "Explaining...",
  },
  {
    id: "rewrite",
    label: "Rewrite",
    description: "Rewrite to improve clarity or tone.",
    placeholder: "Paste text to rewrite...",
    resultLabel: "Rewrite",
    cta: "Rewrite",
    processing: "Rewriting...",
  },
  {
    id: "formAssist",
    label: "Form Assist",
    description: "Generate helpful answers for forms.",
    placeholder: "Describe the question and context...",
    resultLabel: "Suggested answer",
    cta: "Assist",
    processing: "Preparing answer...",
  },
];

const TranslatorApp = ({ surface = "sidepanel" }) => {
  const [activeAction, setActiveAction] = useState("translate");
  const [status, setStatus] = useState({ label: "Live", healthy: true });
  const [selection, setSelection] = useState("");
  const [textInput, setTextInput] = useState("");
  const [textResult, setTextResult] = useState(DEFAULT_TEXT_RESULT);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [manualLock, setManualLock] = useState(false);
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState("free");
  const [displayName, setDisplayName] = useState("Guest");
  const [usage, setUsage] = useState({ date: "", counts: { translate: 0, summarize: 0 } });
  const [banner, setBanner] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const googleBtnRef = useRef(null);
  const [params, setParams] = useState({
    translate: { sourceLanguage: "auto", targetLanguage: "ar", tone: "" },
    summarize: { mode: "bullet", targetLanguage: "" },
    explain: { level: "simple", targetLanguage: "" },
    rewrite: { tone: "neutral", targetLanguage: "" },
    formAssist: { fieldLabel: "", formType: "", targetLanguage: "" },
  });

  const updateStatus = useCallback((label, healthy = true) => {
    setStatus({ label, healthy });
  }, []);

  const applySelection = useCallback(
    (value) => {
      const normalized = (value || "").trim();
      setSelection(normalized);
      if (autoFillEnabled && !manualLock && !textInput.trim()) {
        setTextInput(normalized);
      }
    },
    [autoFillEnabled, manualLock, textInput]
  );

  const handleCopy = useCallback(
    async (text) => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        updateStatus("Copied", true);
        setTimeout(() => updateStatus("Live", true), 1500);
      } catch (err) {
        console.error("Copy failed:", err);
        updateStatus("Copy blocked", false);
      }
    },
    [updateStatus]
  );

  const currentAction = useMemo(
    () => ACTIONS.find((a) => a.id === activeAction) || ACTIONS[0],
    [activeAction]
  );

  const generateGuestId = () => {
    if (crypto?.randomUUID) return `guest-${crypto.randomUUID()}`;
    return `guest-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  };

  const ensureProfile = useCallback(async () => {
    const storedProfile = await getUserProfile();
    const profile = { ...storedProfile };
    if (!profile.userId) {
      profile.userId = generateGuestId();
      profile.plan = "free";
      profile.displayName = "Guest";
      await saveUserProfile(profile);
    }
    setUserId(profile.userId);
    setPlan(profile.plan || "free");
    setDisplayName(profile.displayName || "Guest");
  }, []);

  const loadUsage = useCallback(async () => {
    const u = await getUsage();
    setUsage(u);
  }, []);

  const bumpUsage = async (key) => {
    const updated = {
      ...usage,
      counts: { ...usage.counts, [key]: (usage.counts?.[key] || 0) + 1 },
    };
    setUsage(updated);
    await saveUsage(updated);
  };

  const handleRunAction = useCallback(async () => {
    const text = textInput.trim();
    if (!text) {
      setTextResult("Please enter text to process.");
      return;
    }

    if (!userId) {
      setTextResult("Setting up your session, please try again.");
      updateStatus("Missing user ID", false);
      await ensureProfile();
      return;
    }

    const quota = QUOTAS[plan] || QUOTAS.free;
    const counts = usage.counts || {};
    const blockedFeature = FEATURES[currentAction.id]?.[plan] === false;
    if (blockedFeature) {
      setBanner("This feature is premium only. Upgrade to unlock it.");
      updateStatus("Upgrade to use", false);
      return;
    }

    const limit = quota?.[currentAction.id];
    if (limit && Number.isFinite(limit) && (counts[currentAction.id] || 0) >= limit) {
      setBanner("You've reached today's free quota. Upgrade for unlimited access.");
      updateStatus("Limit reached", false);
      return;
    }

    setIsTextLoading(true);
    setTextResult(currentAction.processing || "Processing...");

    let translated;
    let error;

    if (currentAction.id === "translate") {
      const { sourceLanguage, targetLanguage, tone } = params.translate;
      ({ translated, error } = await translateText(
        { text, sourceLanguage, targetLanguage, tone },
        userId
      ));
    } else {
      const payload = { text, ...params[currentAction.id] };
      const result = await contentAction(currentAction.id, payload, userId);
      error = result.error;
      translated = result.data;
    }

    if (error) {
      setTextResult(error);
      updateStatus("API error", false);
    } else {
      setTextResult(translated || "No result returned.");
      updateStatus(`${currentAction.label} ready`, true);
      if (currentAction.id === "translate" || currentAction.id === "summarize") {
        bumpUsage(currentAction.id);
      }
    }
    setIsTextLoading(false);
  }, [currentAction, textInput, updateStatus, params, plan, usage, userId, ensureProfile]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTextInput(text);
      setManualLock(true);
    } catch (err) {
      console.error("Paste failed:", err);
      updateStatus("Paste blocked", false);
    }
  }, [updateStatus]);

  const handleClear = useCallback(() => {
    setTextInput("");
    setTextResult(DEFAULT_TEXT_RESULT);
    setManualLock(false);
  }, []);

  useEffect(() => {
    getSettings().then((stored) => {
      setAutoFillEnabled(Boolean(stored?.autoFillEnabled));
    });
    ensureProfile();
    loadUsage();
  }, [ensureProfile, loadUsage]);

  useEffect(() => {
    saveSettings({ autoFillEnabled });
  }, [autoFillEnabled]);

  useEffect(() => {
    if (!userId) return;
    saveUserProfile({ userId });
  }, [userId]);

  useEffect(() => {
    requestLastSelection().then((text) => applySelection(text || ""));
  }, [applySelection]);

  useEffect(
    () =>
      subscribeToMessages((message) => {
        if (
          message?.type === MESSAGE_TYPES.SELECTION_CHANGED ||
          message?.type === MESSAGE_TYPES.SELECTION_BROADCAST
        ) {
          applySelection(message.text);
        }
      }),
    [applySelection]
  );

  useEffect(() => {
    const pollSelection = async () => {
      if (document?.hidden) return;
      const text = await fetchActiveTabSelection();
      if (text) applySelection(text);
    };

    const id = setInterval(pollSelection, 1200);
    pollSelection();
    return () => clearInterval(id);
  }, [applySelection]);

  useEffect(() => {
    if (autoFillEnabled) setManualLock(false);
  }, [autoFillEnabled]);

  const charCount = useMemo(() => textInput.length, [textInput]);
  const availableTabs = ACTIONS.map((action) => ({ id: action.id, label: action.label }));

  const updateParam = (key, field, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const renderParams = () => {
    switch (currentAction.id) {
      case "translate":
        return (
          <div className="param-grid">
            <label>
              <span className="mini">Source</span>
              <input
                type="text"
                value={params.translate.sourceLanguage}
                onChange={(e) => updateParam("translate", "sourceLanguage", e.target.value)}
                placeholder="auto"
              />
            </label>
            <label>
              <span className="mini">Target</span>
              <input
                type="text"
                value={params.translate.targetLanguage}
                onChange={(e) => updateParam("translate", "targetLanguage", e.target.value)}
                placeholder="e.g. ar, en"
              />
            </label>
            <label>
              <span className="mini">Tone</span>
              <input
                type="text"
                value={params.translate.tone}
                onChange={(e) => updateParam("translate", "tone", e.target.value)}
                placeholder="optional"
              />
            </label>
          </div>
        );
      case "summarize":
        return (
          <div className="param-grid">
            <label>
              <span className="mini">Mode</span>
              <select
                value={params.summarize.mode}
                onChange={(e) => updateParam("summarize", "mode", e.target.value)}
              >
                <option value="bullet">bullet</option>
                <option value="academic">academic</option>
                <option value="tldr">tldr</option>
              </select>
            </label>
            <label>
              <span className="mini">Target language</span>
              <input
                type="text"
                value={params.summarize.targetLanguage}
                onChange={(e) => updateParam("summarize", "targetLanguage", e.target.value)}
                placeholder="optional"
              />
            </label>
          </div>
        );
      case "explain":
        return (
          <div className="param-grid">
            <label>
              <span className="mini">Level</span>
              <select
                value={params.explain.level}
                onChange={(e) => updateParam("explain", "level", e.target.value)}
              >
                <option value="simple">simple</option>
                <option value="intermediate">intermediate</option>
                <option value="professional">professional</option>
                <option value="academic">academic</option>
              </select>
            </label>
            <label>
              <span className="mini">Target language</span>
              <input
                type="text"
                value={params.explain.targetLanguage}
                onChange={(e) => updateParam("explain", "targetLanguage", e.target.value)}
                placeholder="optional"
              />
            </label>
          </div>
        );
      case "rewrite":
        return (
          <div className="param-grid">
            <label>
              <span className="mini">Tone</span>
              <input
                type="text"
                value={params.rewrite.tone}
                onChange={(e) => updateParam("rewrite", "tone", e.target.value)}
                placeholder="formal, casual..."
              />
            </label>
            <label>
              <span className="mini">Target language</span>
              <input
                type="text"
                value={params.rewrite.targetLanguage}
                onChange={(e) => updateParam("rewrite", "targetLanguage", e.target.value)}
                placeholder="optional"
              />
            </label>
          </div>
        );
      case "formAssist":
        return (
          <div className="param-grid">
            <label>
              <span className="mini">Field label (required)</span>
              <input
                type="text"
                value={params.formAssist.fieldLabel}
                onChange={(e) => updateParam("formAssist", "fieldLabel", e.target.value)}
                placeholder="e.g. Cover letter"
              />
            </label>
            <label>
              <span className="mini">Form type</span>
              <input
                type="text"
                value={params.formAssist.formType}
                onChange={(e) => updateParam("formAssist", "formType", e.target.value)}
                placeholder="job-application, visa..."
              />
            </label>
            <label>
              <span className="mini">Target language</span>
              <input
                type="text"
                value={params.formAssist.targetLanguage}
                onChange={(e) => updateParam("formAssist", "targetLanguage", e.target.value)}
                placeholder="optional"
              />
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  const handleLogin = async () => {
    if (!chrome?.identity?.launchWebAuthFlow) {
      setBanner("Sign-in is not available in this browser.");
      return;
    }
    setSigningIn(true);
    try {
      const redirectUri = chrome.identity.getRedirectURL();
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      url.searchParams.set("response_type", "id_token");
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("scope", "openid email profile");
      url.searchParams.set("prompt", "consent");

      const resultUrl = await new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
          { url: url.toString(), interactive: true },
          (redirected) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve(redirected);
          }
        );
      });

      const fragment = resultUrl.split("#")[1] || "";
      const params = new URLSearchParams(fragment);
      const idToken = params.get("id_token");
      if (!idToken) {
        throw new Error("Missing id_token from Google response");
      }
      const { profile, error } = await loginWithGoogle(idToken);
      if (error) {
        setBanner(error);
        updateStatus("Auth failed", false);
        return;
      }
      const nextProfile = {
        userId: profile?.userId || userId || generateGuestId(),
        plan: profile?.plan || "free",
        displayName: profile?.displayName || profile?.email || "User",
      };
      setUserId(nextProfile.userId);
      setPlan(nextProfile.plan);
      setDisplayName(nextProfile.displayName);
      await saveUserProfile(nextProfile);
      updateStatus("Signed in", true);
      setBanner("");
    } catch (err) {
      console.error("Google sign-in failed", err);
      setBanner("Sign-in failed. Please try again.");
      updateStatus("Auth failed", false);
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    const guestProfile = {
      userId: generateGuestId(),
      plan: "free",
      displayName: "Guest",
    };
    setUserId(guestProfile.userId);
    setPlan("free");
    setDisplayName("Guest");
    await saveUserProfile(guestProfile);
    updateStatus("Using guest session", true);
  };

  return (
    <div className={`app ${surface === "popup" ? "is-popup" : ""}`}>
      <header className="hero">
        <div className="title">
          <img src="/icon.png" alt="Polyglot Assistant" className="logo" />
          <div>
            <p className="eyebrow">Polyglot</p>
            <h1>AI Assistant</h1>
            <div className="hint">Translate, rewrite, summarize, and assist forms.</div>
          </div>
        </div>
        <div className="header-actions">
          <span className="plan-pill subtle">{plan === "premium" ? "Premium" : "Free Plan"}</span>
          <button className="btn-ghost" type="button" onClick={handleLogout}>
            {plan === "premium" ? "Switch to Free" : "Reset Session"}
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={handleLogin}
            disabled={signingIn}
          >
            {signingIn ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </header>

      <SelectionCard selection={selection} />

      <Tabs active={activeAction} onChange={setActiveAction} items={availableTabs} />

      <TextTranslator
        title={currentAction.label}
        subtitle={currentAction.description}
        placeholder={currentAction.placeholder}
        resultLabel={currentAction.resultLabel}
        ctaLabel={currentAction.cta}
        text={textInput}
        result={textResult}
        charCount={charCount}
        autoFillEnabled={autoFillEnabled}
        onChange={(value) => {
          setTextInput(value);
          setManualLock(true);
        }}
        onTranslate={handleRunAction}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onClear={handleClear}
        onToggleAutoFill={() => setAutoFillEnabled((prev) => !prev)}
        isLoading={isTextLoading}
      />
      <div className="panel">{renderParams()}</div>
      {banner && (
        <div className="upgrade-card">
          <h4>Upgrade to Premium</h4>
          <div className="mini">{banner}</div>
          <div className="upgrade-actions">
            <button className="btn-primary" type="button">
              Upgrade now
            </button>
            <button className="btn-ghost" type="button" onClick={() => setBanner("")}>
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="footer-hint">
        <span>You are using Free Plan. Upgrade to unlock unlimited usage and full-page translation.</span>
      </div>
    </div>
  );
};

export default TranslatorApp;

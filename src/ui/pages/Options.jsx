import React, { useEffect, useState } from "react";
import "../styles/options.css";
import {
  DEFAULT_SETTINGS,
  DEFAULT_USER_PROFILE,
} from "../../utils/constants.js";
import {
  getSettings,
  getUserProfile,
  saveSettings,
  saveUserProfile,
} from "../../services/storage.js";

const Options = () => {
  const [user, setUser] = useState(DEFAULT_USER_PROFILE);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      const [userProfile, storedSettings] = await Promise.all([
        getUserProfile(),
        getSettings(),
      ]);
      setUser(userProfile);
      setSettings(storedSettings);
    })();
  }, []);

  const persist = async () => {
    await Promise.all([saveUserProfile(user), saveSettings(settings)]);
    setStatus("Saved");
    setTimeout(() => setStatus(""), 1500);
  };

  return (
    <div className="options-page">
      <header className="options-header">
        <div>
          <p className="eyebrow">Polyglot AI Assistant</p>
          <h1>Extension Settings</h1>
          <p className="muted">
            Configure account metadata and defaults. Hooks are ready for future Paddle or AI
            integrations.
          </p>
        </div>
        {status ? <span className="badge success">{status}</span> : null}
      </header>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Account</p>
            <h2>User identity</h2>
          </div>
          <span className="badge">Stored locally in chrome.storage</span>
        </div>
        <div className="field">
          <label htmlFor="userId">User ID</label>
          <input
            id="userId"
            value={user.userId}
            onChange={(evt) => setUser((prev) => ({ ...prev, userId: evt.target.value }))}
            placeholder="Optional: sync from backend login"
          />
        </div>
        <div className="field">
          <label htmlFor="plan">Plan type</label>
          <select
            id="plan"
            value={user.plan}
            onChange={(evt) => setUser((prev) => ({ ...prev, plan: evt.target.value }))}
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="trial">Trial</option>
          </select>
        </div>
        <div className="field inline-field">
          <div>
            <label htmlFor="usage">Translations used</label>
            <input
              id="usage"
              type="number"
              min={0}
              value={user.usage.translations}
              onChange={(evt) =>
                setUser((prev) => ({
                  ...prev,
                  usage: { ...prev.usage, translations: Number(evt.target.value) || 0 },
                }))
              }
            />
          </div>
          <div>
            <label htmlFor="quota">Quota</label>
            <input
              id="quota"
              type="number"
              min={0}
              value={user.usage.quota ?? ""}
              placeholder="Unlimited"
              onChange={(evt) =>
                setUser((prev) => ({
                  ...prev,
                  usage: {
                    ...prev.usage,
                    quota: evt.target.value === "" ? null : Number(evt.target.value) || 0,
                  },
                }))
              }
            />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Defaults</p>
            <h2>UI preferences</h2>
          </div>
          <span className="badge">Synced for popup + side panel</span>
        </div>
        <div className="field">
          <label htmlFor="autoFill">Auto-fill selection</label>
          <p className="muted">
            When enabled, selected page text fills the translator automatically.
          </p>
          <label className="toggle">
            <input
              id="autoFill"
              type="checkbox"
              checked={settings.autoFillEnabled}
              onChange={(evt) =>
                setSettings((prev) => ({ ...prev, autoFillEnabled: evt.target.checked }))
              }
            />
            <span className="slider" />
            <span className="toggle-label">{settings.autoFillEnabled ? "On" : "Off"}</span>
          </label>
        </div>
      </section>

      <div className="actions">
        <button className="btn-secondary" type="button" onClick={() => window.close()}>
          Close
        </button>
        <button className="btn-primary" type="button" onClick={persist}>
          Save changes
        </button>
      </div>
    </div>
  );
};

export default Options;

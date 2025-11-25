# Polyglot AI Assistant (Chrome Extension)

A Manifest V3 Chrome extension with a React UI that brings translation, rewriting, summarization, explanation, and form assistance to a popup and side panel. Built with Vite + React, structured for scalability, and wired to a backend API with free/premium-ready UX.

## Features
- Modern AI UX (inspired by DeepL/Grammarly/Notion AI) with clean tabs for Translate, Summarize, Rewrite, Explain, and Form Assist.
- Auto-detects page selection and can auto-fill the input.
- Free/premium-friendly experience with a gentle upgrade prompt (no exposed quotas).
- Google Sign-In via `chrome.identity` (OAuth client configured in manifest); guest mode fallback with stored `x-user-id` header.
- MV3 service worker background + content script for selection sync.
- Build system: Vite + React; output goes to `dist/` for “Load unpacked”.

## Project Structure
```
manifest.json
package.json
vite.config.js
public/            # icons/static
src/
  background/      # service worker
  content/         # content scripts (selection listener)
  services/        # api/auth/storage utilities
  utils/           # constants/helpers
  ui/              # React pages/components/styles
dist/              # build output (after `npm run build`)
```

## Getting Started
1) Install deps:
```bash
npm install
```
2) Build:
```bash
npm run build
```
3) Load extension:
   - Open `chrome://extensions`
   - Enable Developer Mode
   - “Load unpacked” → select the `dist/` folder

## API Endpoints (expected)
- Auth: `POST /api/auth/google` (body: `{ token | idToken }`)
- Translate: `POST /api/translate` (headers: `x-user-id`; body: `{ text, sourceLanguage, targetLanguage, tone }`)
- Content actions: `POST /api/content/{summarize|explain|rewrite|form-assist}` with `x-user-id`.
  - Summarize: `{ text, mode?, targetLanguage? }`
  - Explain: `{ text, level?, targetLanguage? }`
  - Rewrite: `{ text, tone?, targetLanguage? }`
  - Form Assist: `{ text, fieldLabel, formType?, profileHints? }`

## Google OAuth Setup (Chrome Extension)
- Client ID (already in manifest/oauth2): `622427034276-kqbgku481gr3bd0i2v26adjo7i2m0a4j.apps.googleusercontent.com`
- In the Google Cloud console, set an authorized redirect URI to:
  ```
  https://chnlhmhekfiddlnncbjmmldionfkcpgk.chromiumapp.org/
  ```
  If the extension ID changes, update the URI accordingly (`https://<EXTENSION_ID>.chromiumapp.org/`).

## Development Notes
- React entry points are in `src/ui/*.html` with corresponding `.jsx` entry files.
- Background/service worker is in `src/background/index.js`; content script in `src/content/selectionListener.js`.
- CSS lives in `src/ui/styles/panel.css` (shared for popup/side panel).
- Public assets (icons) are in `public/`.

## Scripts
- `npm run build` — Build the extension into `dist/`.
- `npm run dev` — Vite dev server (for UI iteration; extension needs build for MV3).

## Roadmap Ideas
- Paddle integration for premium upgrades.
- Full-page/PDF translation surfaces.
- History/saved items synced to backend.
- Additional language/tone selectors and localization of the UI.


# Darija Translator Extension

## Architecture

The extension follows Chrome Manifest V3 architecture with the following components:

- **Background Script**: Manages extension lifecycle and message routing between content scripts and side panel
- **Content Script**: Injected into web pages to detect text selection events
- **Side Panel**: Main user interface with tabs for text and image translation
- **API Communication**: Connects to a local Node.js server for AI-powered translations

![Architecture](../translator-server/translator-extension-architecture.png)

## Overview

The Darija Translator Extension is a Chrome browser extension that provides seamless translation of English text and images into Moroccan Darija (Arabic dialect). It features a side panel interface that allows users to translate selected text from any webpage or upload images for text extraction and translation.

## Features

- **Text Translation**: Automatically detects and translates selected text from web pages
- **Image Translation**: Supports drag-and-drop image upload for OCR and translation
- **Real-time Selection**: Captures text selection on any webpage and auto-fills the translation input
- **Side Panel UI**: Clean, tabbed interface for text and image translation
- **Copy to Clipboard**: Easy copying of translated results
- **Auto-fill Toggle**: Option to enable/disable automatic text selection filling
- **Debounced Input**: Optimized performance with debounced text selection detection

## Architecture

The extension follows Chrome Manifest V3 architecture with the following components:

- **Background Script**: Manages extension lifecycle and message routing between content scripts and side panel
- **Content Script**: Injected into web pages to detect text selection events
- **Side Panel**: Main user interface with tabs for text and image translation
- **API Communication**: Connects to a local Node.js server for AI-powered translations

![Architecture](../translator-server/translator-extension-architecture.png)

## Installation

1. Clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `translator-extension` folder
5. Ensure the backend server is running (see translator-server README)

## Usage

1. Click the extension icon to open the side panel
2. **For Text Translation**:
   - Select text on any webpage (it will auto-fill)
   - Or manually paste text in the input field
   - Click "Translate to Darija" or press Ctrl+Enter
3. **For Image Translation**:
   - Switch to the "Image" tab
   - Drag and drop an image or click to browse
   - Click "Translate image"
4. Copy the translated result using the copy button

## Permissions

- `sidePanel`: Enables the side panel interface
- `scripting`: Allows content script injection
- `activeTab`: Access to the currently active tab for text selection
- Host permissions for `http://localhost:3000/*`: Communication with the backend server

## Development

The extension is built with vanilla JavaScript and follows modern Chrome extension best practices. Key files:

- `manifest.json`: Extension configuration
- `background.js`: Service worker
- `contentScript.js`: Page content monitoring
- `side_panel.js`: Main application logic
- `components.js`: UI rendering functions
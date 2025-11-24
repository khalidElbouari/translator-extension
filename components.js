export const renderApp = (root) => {
  if (!root) return;
  root.innerHTML = `
    <div class="app">
      <header>
        <div class="title">
          <img src="icon.png" alt="Darija Translator" class="logo" />
          <div>
            <div class="pill">Darija</div>
            <h1>Translator</h1>
            <div class="hint">English to Moroccan Darija (Arabic script)</div>
          </div>
        </div>
        <div class="status" id="statusChip">
          <div class="dot pulse"></div>
          <span class="status-text">Live</span>
        </div>
      </header>

      <div class="tabs">
        <button class="tab active" data-tab="text">Text</button>
        <button class="tab" data-tab="image">Image</button>
      </div>

      <section class="panel" id="textPanel">
        <div class="section-header">
          <span>Text to translate</span>
          <span class="mini">Auto-fills from page selection; paste also works.</span>
        </div>
        <label for="textInput">Text</label>
        <textarea id="textInput" placeholder="Select text on the page or paste here..."></textarea>
        <div class="toolbar">
          <span class="chip" id="charCount">0 chars</span>
          <button class="btn-ghost" id="pasteBtn">Paste</button>
          <button class="btn-ghost" id="clearBtn">Clear</button>
          <button class="btn-ghost" id="autoFillToggle">Auto-fill: On</button>
        </div>
        <button class="btn-primary" id="translateBtn">Translate to Darija</button>
        <div class="result inline" id="result">
          <h3>Translation</h3>
          <pre id="resultText">Translation will appear here...</pre>
          <button class="copy" id="copyBtn">Copy</button>
        </div>
      </section>

      <section class="panel hidden" id="imagePanel">
        <div class="result" id="imageResult">
          <h3>Image translation</h3>
          <pre id="imageResultText">Upload an image to see the translation.</pre>
          <button class="copy" id="copyImageBtn">Copy</button>
        </div>

        <div class="section-header">
          <span>Image translation</span>
          <span class="mini">Upload an image; text is detected and translated.</span>
        </div>
        <div class="dropzone" id="dropzone">
          <div><strong>Drop image</strong> or click to upload</div>
          <div class="mini">Supported: PNG, JPG, JPEG, WebP.</div>
          <input type="file" id="imageInput" accept="image/*" class="hidden-input">
        </div>
        <div class="preview" id="imagePreview">
          <img id="previewImg" alt="Image preview" />
        </div>
        <button class="btn-primary mt-10" id="translateImageBtn" disabled>Translate image</button>
      </section>
    </div>
  `;
};

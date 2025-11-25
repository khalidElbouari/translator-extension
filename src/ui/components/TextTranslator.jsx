import React from "react";

const TextTranslator = ({
  title = "Text",
  subtitle = "",
  placeholder = "Enter text...",
  resultLabel = "Result",
  ctaLabel = "Run",
  text,
  result,
  onChange,
  onTranslate,
  onCopy,
  onPaste,
  onClear,
  autoFillEnabled,
  onToggleAutoFill,
  isLoading,
}) => (
  <section className="panel" id="textPanel">
    <div className="section-header">
      <span>{title}</span>
      <span className="mini">{subtitle || "Auto-fills from page selection; paste also works."}</span>
    </div>
    <label htmlFor="textInput">Text</label>
    <textarea
      id="textInput"
      placeholder={placeholder}
      value={text}
      onChange={(evt) => onChange?.(evt.target.value)}
      onKeyDown={(evt) => {
        if ((evt.metaKey || evt.ctrlKey) && evt.key === "Enter") {
          evt.preventDefault();
          onTranslate?.();
        }
      }}
    />
    <div className="toolbar">
      <button className="btn-ghost" type="button" onClick={onPaste}>
        Paste
      </button>
      <button className="btn-ghost" type="button" onClick={onClear}>
        Clear
      </button>
      <button
        className={`btn-ghost ${autoFillEnabled ? "toggle-on" : ""}`}
        type="button"
        onClick={onToggleAutoFill}
      >
        Auto-fill: {autoFillEnabled ? "On" : "Off"}
      </button>
    </div>
    <button
      className="btn-primary"
      id="translateBtn"
      type="button"
      onClick={onTranslate}
      disabled={isLoading}
    >
      {isLoading ? "Working..." : ctaLabel}
    </button>
    <div className="result inline" id="result">
      <h3>{resultLabel}</h3>
      <pre id="resultText">{result}</pre>
      <button className="copy" id="copyBtn" type="button" onClick={() => onCopy?.(result)}>
        Copy
      </button>
    </div>
  </section>
);

export default TextTranslator;

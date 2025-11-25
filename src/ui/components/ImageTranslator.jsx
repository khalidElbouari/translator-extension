import React, { useState } from "react";

const ImageTranslator = ({
  imageBase64,
  result,
  onFileSelected,
  onTranslate,
  onCopy,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (evt) => {
    evt.preventDefault();
    setIsDragging(false);
    const file = evt.dataTransfer?.files?.[0];
    if (file) onFileSelected?.(file);
  };

  const handleFileInput = (evt) => {
    const file = evt.target.files?.[0];
    if (file) onFileSelected?.(file);
  };

  return (
    <section className="panel" id="imagePanel">
      <div className="result" id="imageResult">
        <h3>Image translation</h3>
        <pre id="imageResultText">{result}</pre>
        <button
          className="copy"
          id="copyImageBtn"
          type="button"
          onClick={() => onCopy?.(result)}
        >
          Copy
        </button>
      </div>

      <div className="section-header">
        <span>Image translation</span>
        <span className="mini">Upload an image; text is detected and translated.</span>
      </div>
      <div
        className={`dropzone ${isDragging ? "dragover" : ""}`}
        id="dropzone"
        onClick={() => document.getElementById("imageInput")?.click()}
        onDragOver={(evt) => {
          evt.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragEnd={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div>
          <strong>Drop image</strong> or click to upload
        </div>
        <div className="mini">Supported: PNG, JPG, JPEG, WebP.</div>
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          className="hidden-input"
          onChange={handleFileInput}
        />
      </div>
      <div
        className="preview"
        id="imagePreview"
        style={{ display: imageBase64 ? "block" : "none" }}
      >
        {imageBase64 ? <img id="previewImg" src={imageBase64} alt="Image preview" /> : null}
      </div>
      <button
        className="btn-primary mt-10"
        id="translateImageBtn"
        type="button"
        onClick={onTranslate}
        disabled={!imageBase64 || isLoading}
      >
        {isLoading ? "Working..." : "Translate image"}
      </button>
    </section>
  );
};

export default ImageTranslator;

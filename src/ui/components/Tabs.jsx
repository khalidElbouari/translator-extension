import React from "react";

const defaultTabs = ["text", "image"];

const labelFor = (tab) => {
  if (typeof tab === "string") {
    return tab === "text" ? "Text" : tab === "image" ? "Image" : tab;
  }
  return tab.label || tab.id;
};

const Tabs = ({ active, onChange, items = defaultTabs }) => (
  <div className="tabs">
    {items.map((tab) => {
      const id = typeof tab === "string" ? tab : tab.id;
      return (
        <button
          key={id}
          className={`tab ${active === id ? "active" : ""}`}
          onClick={() => onChange?.(id)}
          type="button"
          disabled={tab.disabled}
          title={tab.disabled ? "Not available" : undefined}
        >
          {labelFor(tab)}
        </button>
      );
    })}
  </div>
);

export default Tabs;

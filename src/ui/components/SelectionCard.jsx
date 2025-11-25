import React from "react";

const SelectionCard = ({ selection }) => (
  <div className="selection-card">
    <div className="mini">Last selection</div>
    <div className={`selection-text ${selection ? "" : "empty"}`}>
      {selection || "Select text on the page to auto-fill."}
    </div>
  </div>
);

export default SelectionCard;

import React from "react";

const StatusChip = ({ label, healthy = true }) => (
  <div className="status">
    <div
      className={`dot ${healthy ? "pulse" : ""}`}
      style={{ background: healthy ? "#22c55e" : "#ef4444" }}
    />
    <span className="status-text">{label}</span>
  </div>
);

export default StatusChip;

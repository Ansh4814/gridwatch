import React from "react";

export default function Header({ currentTemp, lastUpdated, onCompare, onExport }) {
  const timeStr = lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <div className="header">
      <div className="header-left">
        <span className="logo">⚡ GridWatch</span>
        <span className="subtitle">Energy Poverty Risk Predictor — Boston, MA</span>
      </div>
      <div className="header-right">
        {currentTemp && (
          <span className="temp-badge">🌡 Live Boston Temp: {currentTemp}°F {timeStr && <span style={{opacity:0.6, fontSize:"0.72rem"}}>· {timeStr}</span>}</span>
        )}
        <span className="data-badge">📊 Census ACS 2022 + NOAA</span>
        <button className="compare-btn" onClick={onCompare}>⚖ Compare</button>
        <button className="export-btn" onClick={onExport}>📄 Export PDF</button>
      </div>
    </div>
  );
}

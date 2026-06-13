import React from "react";

export default function Header({ currentTemp, onCompare, onExport }) {
  return (
    <div className="header">
      <div className="header-left">
        <span className="logo">⚡ GridWatch</span>
        <span className="subtitle">Energy Poverty Risk Predictor — Boston, MA</span>
      </div>
      <div className="header-right">
        {currentTemp && (
          <span className="temp-badge">🌡 Live Boston Temp: {currentTemp}°F</span>
        )}
        <span className="data-badge">📊 Census ACS 2022 + NOAA</span>
        <button className="compare-btn" onClick={onCompare}>⚖ Compare</button>
        <button className="export-btn" onClick={onExport}>📄 Export PDF</button>
      </div>
    </div>
  );
}

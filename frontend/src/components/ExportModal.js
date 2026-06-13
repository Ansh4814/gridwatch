import React, { useState } from "react";

const API = "https://gridwatch-production.up.railway.app/api";

export default function ExportModal({ onClose, neighborhoods, subsidy, moratorium, tempOverride }) {
  const [mode, setMode] = useState(null);
  const [customSelected, setCustomSelected] = useState([]);

  const params = new URLSearchParams();
  if (subsidy) params.append("subsidy", subsidy);
  if (moratorium) params.append("moratorium", true);
  if (tempOverride) params.append("temp_override", tempOverride);

  const toggleNeighborhood = (id) => {
    setCustomSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    if (mode === "all") {
      window.open(`${API}/report?${params.toString()}`, "_blank");
      onClose();
    } else if (mode === "custom" && customSelected.length > 0) {
      const p = new URLSearchParams(params);
      p.append("ids", customSelected.join(","));
      window.open(`${API}/report/custom?${p.toString()}`, "_blank");
      onClose();
    } else if (mode === "compare" && customSelected.length >= 2) {
      const p = new URLSearchParams(params);
      p.append("id1", customSelected[0]);
      p.append("id2", customSelected[1]);
      window.open(`${API}/report/compare?${p.toString()}`, "_blank");
      onClose();
    }
  };

  const canExport =
    mode === "all" ||
    (mode === "custom" && customSelected.length > 0) ||
    (mode === "compare" && customSelected.length >= 2);

  const showPicker = mode === "custom" || mode === "compare";
  const maxPick = mode === "compare" ? 2 : 15;

  return (
    <div className="compare-overlay">
      <div className="export-modal">
        <div className="compare-header">
          <span className="compare-title">📄 Export PDF Report</span>
          <button className="compare-close" onClick={onClose}>✕</button>
        </div>

        <div className="export-options">
          <div className={`export-option ${mode==="all"?"selected":""}`} onClick={() => { setMode("all"); setCustomSelected([]); }}>
            <input type="radio" readOnly checked={mode==="all"} style={{accentColor:"#0ea5e9"}}/>
            <div className="export-info">
              <div className="export-title">🗺 Full Boston Report</div>
              <div className="export-desc">All 15 neighborhoods ranked by risk score</div>
            </div>
          </div>

          <div className={`export-option ${mode==="custom"?"selected":""}`} onClick={() => { setMode("custom"); setCustomSelected([]); }}>
            <input type="radio" readOnly checked={mode==="custom"} style={{accentColor:"#0ea5e9"}}/>
            <div className="export-info">
              <div className="export-title">📍 Custom Selection</div>
              <div className="export-desc">Pick any neighborhoods — get a report for just those</div>
            </div>
          </div>

          <div className={`export-option ${mode==="compare"?"selected":""}`} onClick={() => { setMode("compare"); setCustomSelected([]); }}>
            <input type="radio" readOnly checked={mode==="compare"} style={{accentColor:"#0ea5e9"}}/>
            <div className="export-info">
              <div className="export-title">⚖ Comparison Report</div>
              <div className="export-desc">Pick exactly 2 neighborhoods for a side-by-side comparison PDF</div>
            </div>
          </div>
        </div>

        {showPicker && (
          <div className="custom-picker">
            <div className="picker-title">
              {mode === "compare"
                ? `Select exactly 2 neighborhoods (${customSelected.length}/2 selected)`
                : `Select neighborhoods (${customSelected.length} selected)`}
            </div>
            <div className="picker-grid">
              {[...neighborhoods].sort((a,b) => b.risk_score - a.risk_score).map(n => {
                const isPicked = customSelected.includes(n.id);
                const isDisabled = !isPicked && customSelected.length >= maxPick;
                return (
                  <div
                    key={n.id}
                    className={`picker-item ${isPicked ? "picked" : ""} ${isDisabled ? "picker-disabled" : ""}`}
                    onClick={() => !isDisabled && toggleNeighborhood(n.id)}
                  >
                    <span className="n-dot" style={{ background: n.color }}/>
                    <span className="picker-name">{n.name}</span>
                    <span className="picker-score" style={{ color: n.color }}>{n.risk_score}</span>
                    <span className="picker-check">{isPicked ? "✓" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          className={`export-download-btn ${canExport ? "active" : "disabled"}`}
          onClick={canExport ? handleExport : undefined}
        >
          📥 Download PDF
        </button>
      </div>
    </div>
  );
}

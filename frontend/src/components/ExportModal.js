import React, { useState } from "react";

const API = "https://gridwatch-production.up.railway.app/api";

export default function ExportModal({ onClose, neighborhoods, subsidy, moratorium, tempOverride }) {
  const [mode, setMode] = useState(null); // "all" | "custom" | "compare"
  const [customSelected, setCustomSelected] = useState([]);
  const [compareId1, setCompareId1] = useState(neighborhoods[0]?.id || 1);
  const [compareId2, setCompareId2] = useState(neighborhoods[1]?.id || 2);

  const params = new URLSearchParams();
  if (subsidy) params.append("subsidy", subsidy);
  if (moratorium) params.append("moratorium", true);
  if (tempOverride) params.append("temp_override", tempOverride);

  const toggleCustom = (id) => {
    setCustomSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleExport = () => {
    if (mode === "all") {
      window.open(`${API}/report?${params.toString()}`, "_blank");
    } else if (mode === "custom" && customSelected.length > 0) {
      const p = new URLSearchParams(params);
      customSelected.forEach(id => p.append("ids", id));
      window.open(`${API}/report/custom?${p.toString()}`, "_blank");
    } else if (mode === "compare") {
      const p = new URLSearchParams(params);
      p.append("id1", compareId1);
      p.append("id2", compareId2);
      window.open(`${API}/report/compare?${p.toString()}`, "_blank");
    }
    onClose();
  };

  const canExport = mode === "all" || (mode === "custom" && customSelected.length > 0) || mode === "compare";

  return (
    <div className="compare-overlay">
      <div className="export-modal">
        <div className="compare-header">
          <span className="compare-title">📄 Export PDF Report</span>
          <button className="compare-close" onClick={onClose}>✕</button>
        </div>

        <div className="export-options">
          <div className={`export-option ${mode==="all"?"selected":""}`} onClick={() => setMode("all")}>
            <input type="radio" readOnly checked={mode==="all"} style={{accentColor:"#0ea5e9"}}/>
            <div className="export-info">
              <div className="export-title">🗺 Full Boston Report</div>
              <div className="export-desc">All 15 neighborhoods ranked by risk score</div>
            </div>
          </div>

          <div className={`export-option ${mode==="custom"?"selected":""}`} onClick={() => setMode("custom")}>
            <input type="radio" readOnly checked={mode==="custom"} style={{accentColor:"#0ea5e9"}}/>
            <div className="export-info">
              <div className="export-title">📍 Custom Selection</div>
              <div className="export-desc">Pick specific neighborhoods to include</div>
            </div>
          </div>

          {mode === "custom" && (
            <div className="custom-picker">
              <div className="picker-title">Select neighborhoods:</div>
              <div className="picker-grid">
                {neighborhoods.map(n => (
                  <div
                    key={n.id}
                    className={`picker-item ${customSelected.includes(n.id) ? "picked" : ""}`}
                    onClick={() => toggleCustom(n.id)}
                  >
                    <span className="n-dot" style={{ background: n.color }}/>
                    <span>{n.name}</span>
                    <span className="picker-score" style={{ color: n.color }}>{n.risk_score}</span>
                    {customSelected.includes(n.id) && <span className="picker-check">✓</span>}
                  </div>
                ))}
              </div>
              <div className="picker-count">{customSelected.length} selected</div>
            </div>
          )}

          <div className={`export-option ${mode==="compare"?"selected":""}`} onClick={() => setMode("compare")}>
            <input type="radio" readOnly checked={mode==="compare"} style={{accentColor:"#0ea5e9"}}/>
            <div className="export-info">
              <div className="export-title">⚖ Comparison Report</div>
              <div className="export-desc">Side-by-side comparison with radar chart and AI analysis</div>
            </div>
          </div>

          {mode === "compare" && (
            <div className="compare-picker">
              <div className="picker-title">Select two neighborhoods to compare:</div>
              <div className="compare-selectors">
                <select value={compareId1} onChange={e => setCompareId1(Number(e.target.value))} className="compare-select">
                  {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name} ({n.risk_score})</option>)}
                </select>
                <span className="vs-badge">VS</span>
                <select value={compareId2} onChange={e => setCompareId2(Number(e.target.value))} className="compare-select">
                  {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name} ({n.risk_score})</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

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

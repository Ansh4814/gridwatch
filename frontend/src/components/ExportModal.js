import React from "react";

const API = "https://gridwatch-production.up.railway.app/api";

export default function ExportModal({ onClose, selected, compareIds, subsidy, moratorium, tempOverride }) {
  const params = new URLSearchParams();
  if (subsidy) params.append("subsidy", subsidy);
  if (moratorium) params.append("moratorium", true);
  if (tempOverride) params.append("temp_override", tempOverride);

  const exportAll = () => {
    window.open(`${API}/report?${params.toString()}`, "_blank");
    onClose();
  };

  const exportSingle = () => {
    const p = new URLSearchParams(params);
    window.open(`${API}/report/single/${selected.id}?${p.toString()}`, "_blank");
    onClose();
  };

  const exportCompare = () => {
    const p = new URLSearchParams(params);
    p.append("id1", compareIds[0]);
    p.append("id2", compareIds[1]);
    window.open(`${API}/report/compare?${p.toString()}`, "_blank");
    onClose();
  };

  return (
    <div className="compare-overlay">
      <div className="export-modal">
        <div className="compare-header">
          <span className="compare-title">📄 Export PDF Report</span>
          <button className="compare-close" onClick={onClose}>✕</button>
        </div>
        <div className="export-options">
          <div className="export-option" onClick={exportAll}>
            <div className="export-icon">🗺</div>
            <div className="export-info">
              <div className="export-title">Full Boston Report</div>
              <div className="export-desc">All 15 neighborhoods ranked by risk score with current policy settings</div>
            </div>
            <div className="export-arrow">→</div>
          </div>
          {selected && (
            <div className="export-option" onClick={exportSingle}>
              <div className="export-icon">📍</div>
              <div className="export-info">
                <div className="export-title">{selected.name} Only</div>
                <div className="export-desc">Single neighborhood deep-dive with risk breakdown and AI analysis</div>
              </div>
              <div className="export-arrow">→</div>
            </div>
          )}
          {compareIds && (
            <div className="export-option" onClick={exportCompare}>
              <div className="export-icon">⚖</div>
              <div className="export-info">
                <div className="export-title">Comparison Report</div>
                <div className="export-desc">Side-by-side comparison of your two selected neighborhoods</div>
              </div>
              <div className="export-arrow">→</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

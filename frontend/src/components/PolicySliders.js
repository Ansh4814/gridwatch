import React from "react";

export default function PolicySliders({ subsidy, setSubsidy, moratorium, setMoratorium, tempOverride, setTempOverride }) {
  return (
    <div className="policy-panel">
      <div className="policy-title">🎛 Policy Simulator</div>
      <div className="policy-row">
        <label>Subsidy Level <span className="val">{subsidy === 0 ? "None" : subsidy === 1 ? "Low" : subsidy === 2 ? "Medium" : "High"}</span></label>
        <input type="range" min="0" max="3" step="1" value={subsidy} onChange={e => setSubsidy(Number(e.target.value))}/>
      </div>
      <div className="policy-row">
        <label>Utility Moratorium <span className="val">{moratorium ? "Active" : "Off"}</span></label>
        <input type="checkbox" checked={moratorium} onChange={e => setMoratorium(e.target.checked)} style={{ width: 20, height: 20 }}/>
      </div>
      <div className="policy-row">
        <label>Temp Override <span className="val">{tempOverride ? `${tempOverride}°F` : "Live"}</span></label>
        <input type="range" min="0" max="105" step="5" value={tempOverride || 55} onChange={e => setTempOverride(Number(e.target.value))}/>
        <button onClick={() => setTempOverride(null)} className="reset-btn">Reset</button>
      </div>
      <div className="policy-note">Adjust sliders to simulate policy interventions in real time</div>
    </div>
  );
}

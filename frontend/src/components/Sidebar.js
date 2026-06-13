import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend } from "recharts";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export default function Sidebar({ selected, forecast, neighborhoods, onBack, subsidy, moratorium, tempOverride, onCompare }) {
  const [explanation, setExplanation] = useState("");
  const [historical, setHistorical] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingExplain, setLoadingExplain] = useState(false);

  useEffect(() => {
    if (!selected) { setExplanation(""); setHistorical([]); setActiveTab("overview"); return; }
    setLoadingExplain(true);
    axios.get(`${API}/neighborhood/${selected.id}/explain`, {
      params: { subsidy, moratorium, temp_override: tempOverride || undefined }
    }).then(r => { setExplanation(r.data.explanation); setLoadingExplain(false); });
    axios.get(`${API}/neighborhood/${selected.id}/historical`)
      .then(r => setHistorical(r.data.historical));
  }, [selected?.id, subsidy, moratorium, tempOverride]);

  const critical = neighborhoods.filter(n => n.risk_level === "Critical").length;
  const high = neighborhoods.filter(n => n.risk_level === "High").length;
  const moderate = neighborhoods.filter(n => n.risk_level === "Moderate").length;
  const low = neighborhoods.filter(n => n.risk_level === "Low").length;

  if (!selected) return (
    <div className="sidebar">
      <div className="sidebar-title">Boston Energy Risk Summary</div>
      <div className="summary-grid">
        <div className="summary-card critical"><div className="sum-num">{critical}</div><div>Critical</div></div>
        <div className="summary-card high"><div className="sum-num">{high}</div><div>High</div></div>
        <div className="summary-card moderate"><div className="sum-num">{moderate}</div><div>Moderate</div></div>
        <div className="summary-card low"><div className="sum-num">{low}</div><div>Low</div></div>
      </div>
      <div className="hint">👆 Click any neighborhood on the map</div>
      <div className="neighborhood-list">
        {[...neighborhoods].sort((a,b) => b.risk_score - a.risk_score).map(n => (
          <div key={n.id} className="n-row" onClick={() => onCompare && onCompare(n)}>
            <span className="n-dot" style={{ background: n.color }}/>
            <span className="n-name">{n.name}</span>
            <span className="n-score" style={{ color: n.color }}>{n.risk_score}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="sidebar">
      <button className="back-btn" onClick={onBack}>← Back to Overview</button>
      <div className="sidebar-title">{selected.name}</div>
      <div className="risk-badge" style={{ background: selected.color }}>
        {selected.risk_level} Risk — {selected.risk_score}/100
      </div>

      <div className="tabs">
        {["overview","forecast","historical","ai"].map(t => (
          <button key={t} className={`tab-btn ${activeTab===t?"active":""}`} onClick={() => setActiveTab(t)}>
            {t === "ai" ? "🤖 AI Analysis" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div>
          <div className="detail-grid">
            <div className="detail-item"><span>Median Income</span><strong>{selected.median_income ? "$"+selected.median_income.toLocaleString() : "N/A"}</strong></div>
            <div className="detail-item"><span>Poverty Rate</span><strong>{selected.poverty_rate ? (selected.poverty_rate*100).toFixed(1)+"%" : "N/A"}</strong></div>
            <div className="detail-item"><span>ZIP Code</span><strong>{selected.zip || "N/A"}</strong></div>
            <div className="detail-item"><span>Data Source</span><strong>Census ACS 2022</strong></div>
          </div>
          <div className="breakdown-title">Risk Breakdown</div>
          <div className="breakdown">
            {Object.entries(selected.breakdown || {}).map(([k,v]) => (
              <div key={k} className="breakdown-row">
                <span>{k.replace("_factor","").replace("_"," ")}</span>
                <div className="bar-bg"><div className="bar-fill" style={{ width: `${Math.min(100,(v/35)*100)}%` }}/></div>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "forecast" && forecast.length > 0 && (
        <div>
          <div className="breakdown-title">30-Day Risk Forecast</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
              <XAxis dataKey="day" stroke="#aaa" tick={{ fontSize: 10 }}/>
              <YAxis domain={[0,100]} stroke="#aaa" tick={{ fontSize: 10 }}/>
              <Tooltip formatter={(v) => [`${v}`, "Risk Score"]}/>
              <ReferenceLine y={70} stroke="#d32f2f" strokeDasharray="3 3" label={{ value: "Critical", fill: "#d32f2f", fontSize: 10 }}/>
              <ReferenceLine y={50} stroke="#f57c00" strokeDasharray="3 3"/>
              <Line type="monotone" dataKey="risk_score" stroke="#00e5ff" dot={false} strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
          <div className="forecast-note">Forecast accounts for current policy settings and seasonal temperature variation.</div>
        </div>
      )}

      {activeTab === "historical" && historical.length > 0 && (
        <div>
          <div className="breakdown-title">Historical Risk Trend (2018–2024)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historical}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
              <XAxis dataKey="year" stroke="#aaa" tick={{ fontSize: 10 }}/>
              <YAxis domain={[0,100]} stroke="#aaa" tick={{ fontSize: 10 }}/>
              <Tooltip formatter={(v,n) => [n==="risk_score" ? `${v}` : `$${Number(v).toLocaleString()}`, n==="risk_score"?"Risk Score":"Median Income"]}/>
              <ReferenceLine y={70} stroke="#d32f2f" strokeDasharray="3 3"/>
              <ReferenceLine y={50} stroke="#f57c00" strokeDasharray="3 3"/>
              <Line type="monotone" dataKey="risk_score" stroke="#00e5ff" dot={true} strokeWidth={2} name="risk_score"/>
            </LineChart>
          </ResponsiveContainer>
          <div className="breakdown-title" style={{marginTop:12}}>Income Trend</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={historical}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
              <XAxis dataKey="year" stroke="#aaa" tick={{ fontSize: 10 }}/>
              <YAxis stroke="#aaa" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, "Median Income"]}/>
              <Bar dataKey="median_income" fill="#00e5ff" opacity={0.7}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="ai-panel">
          <div className="ai-title">🤖 AI Risk Analysis</div>
          {loadingExplain ? (
            <div className="ai-loading">Analyzing neighborhood data...</div>
          ) : (
            <div className="ai-text">{explanation}</div>
          )}
          <div className="ai-meta">
            <span>Model: GradientBoostingRegressor</span>
            <span>R² = 0.975</span>
            <span>Features: 7</span>
          </div>
        </div>
      )}
    </div>
  );
}

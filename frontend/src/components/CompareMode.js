import React, { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export default function CompareMode({ neighborhoods, onClose, tempOverride }) {
  const [id1, setId1] = useState(neighborhoods[0]?.id || 1);
  const [id2, setId2] = useState(neighborhoods[1]?.id || 2);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!id1 || !id2) return;
    axios.get(`${API}/compare`, {
      params: { id1, id2, temp_override: tempOverride || undefined }
    }).then(r => setResult(r.data));
  }, [id1, id2, tempOverride]);

  const getRadarData = () => {
    if (!result) return [];
    const n1 = result.neighborhood1;
    const n2 = result.neighborhood2;
    return [
      { metric: "Income Risk", n1: n1.breakdown.income_factor, n2: n2.breakdown.income_factor, max: 35 },
      { metric: "Poverty Risk", n1: n1.breakdown.poverty_factor, n2: n2.breakdown.poverty_factor, max: 30 },
      { metric: "Housing Risk", n1: n1.breakdown.housing_factor, n2: n2.breakdown.housing_factor, max: 20 },
      { metric: "Weather Risk", n1: n1.breakdown.weather_factor, n2: n2.breakdown.weather_factor, max: 15 },
    ];
  };

  return (
    <div className="compare-overlay">
      <div className="compare-modal">
        <div className="compare-header">
          <span className="compare-title">⚡ Neighborhood Comparison</span>
          <button className="compare-close" onClick={onClose}>✕</button>
        </div>

        <div className="compare-selectors">
          <select value={id1} onChange={e => setId1(Number(e.target.value))} className="compare-select">
            {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <span className="vs-badge">VS</span>
          <select value={id2} onChange={e => setId2(Number(e.target.value))} className="compare-select">
            {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>

        {result && (
          <div>
            <div className="compare-scores">
              <div className="compare-score-card" style={{ borderColor: result.neighborhood1.color }}>
                <div className="cscore-name">{result.neighborhood1.name}</div>
                <div className="cscore-num" style={{ color: result.neighborhood1.color }}>{result.neighborhood1.risk_score}</div>
                <div className="cscore-level" style={{ color: result.neighborhood1.color }}>{result.neighborhood1.risk_level}</div>
                <div className="cscore-detail">Income: ${result.neighborhood1.median_income?.toLocaleString()}</div>
                <div className="cscore-detail">Poverty: {(result.neighborhood1.poverty_rate*100).toFixed(1)}%</div>
              </div>
              <div className="compare-score-card" style={{ borderColor: result.neighborhood2.color }}>
                <div className="cscore-name">{result.neighborhood2.name}</div>
                <div className="cscore-num" style={{ color: result.neighborhood2.color }}>{result.neighborhood2.risk_score}</div>
                <div className="cscore-level" style={{ color: result.neighborhood2.color }}>{result.neighborhood2.risk_level}</div>
                <div className="cscore-detail">Income: ${result.neighborhood2.median_income?.toLocaleString()}</div>
                <div className="cscore-detail">Poverty: {(result.neighborhood2.poverty_rate*100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="compare-chart-title">Risk Factor Comparison</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={getRadarData()}>
                <PolarGrid stroke="#374151"/>
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 11 }}/>
                <Radar name={result.neighborhood1.name} dataKey="n1" stroke={result.neighborhood1.color} fill={result.neighborhood1.color} fillOpacity={0.3}/>
                <Radar name={result.neighborhood2.name} dataKey="n2" stroke={result.neighborhood2.color} fill={result.neighborhood2.color} fillOpacity={0.3}/>
                <Legend wrapperStyle={{ fontSize: "12px" }}/>
              </RadarChart>
            </ResponsiveContainer>

            <div className="compare-insights">
              <div className="insight-title">Key Differences</div>
              {result.neighborhood1.risk_score > result.neighborhood2.risk_score ? (
                <p className="insight-text">
                  <strong>{result.neighborhood1.name}</strong> is at higher risk by {(result.neighborhood1.risk_score - result.neighborhood2.risk_score).toFixed(1)} points.
                  The gap is driven mainly by {
                    result.neighborhood1.breakdown.income_factor > result.neighborhood2.breakdown.income_factor ? "lower median income" :
                    result.neighborhood1.breakdown.poverty_factor > result.neighborhood2.breakdown.poverty_factor ? "higher poverty rate" : "older housing stock"
                  }.
                </p>
              ) : (
                <p className="insight-text">
                  <strong>{result.neighborhood2.name}</strong> is at higher risk by {(result.neighborhood2.risk_score - result.neighborhood1.risk_score).toFixed(1)} points.
                  The gap is driven mainly by {
                    result.neighborhood2.breakdown.income_factor > result.neighborhood1.breakdown.income_factor ? "lower median income" :
                    result.neighborhood2.breakdown.poverty_factor > result.neighborhood1.breakdown.poverty_factor ? "higher poverty rate" : "older housing stock"
                  }.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

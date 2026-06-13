import React from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Map({ neighborhoods, onSelect, selected, loading }) {
  return (
    <div style={{ height: "100%", position: "relative" }}>
      {loading && (
        <div className="map-loading">Loading real Census data...</div>
      )}
      <MapContainer center={[42.3301, -71.0989]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="CartoDB"
        />
        {neighborhoods.map(n => (
          <CircleMarker
            key={n.id}
            center={[n.lat, n.lng]}
            radius={selected?.id === n.id ? 22 : 16}
            fillColor={n.color}
            color={selected?.id === n.id ? "#fff" : n.color}
            weight={selected?.id === n.id ? 3 : 1}
            fillOpacity={0.85}
            eventHandlers={{ click: () => onSelect(n) }}
          >
            <Tooltip>
              <strong>{n.name}</strong><br/>
              Risk: {n.risk_level} ({n.risk_score})<br/>
              Income: ${n.median_income?.toLocaleString()}<br/>
              Poverty: {(n.poverty_rate * 100).toFixed(1)}%
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="map-legend">
        <div className="legend-title">Risk Level</div>
        {[["#d32f2f","Critical"],["#f57c00","High"],["#fbc02d","Moderate"],["#388e3c","Low"]].map(([c,l]) => (
          <div key={l} className="legend-item">
            <span style={{ background: c }} className="legend-dot"/>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

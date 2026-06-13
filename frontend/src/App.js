import React, { useState, useEffect, useRef } from "react";
import Map from "./components/Map";
import Sidebar from "./components/Sidebar";
import PolicySliders from "./components/PolicySliders";
import Header from "./components/Header";
import CompareMode from "./components/CompareMode";
import "./App.css";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

function App() {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [subsidy, setSubsidy] = useState(0);
  const [moratorium, setMoratorium] = useState(false);
  const [tempOverride, setTempOverride] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compareOpen, setCompareOpen] = useState(false);
  const selectedIdRef = useRef(null);
  const subsidyRef = useRef(0);
  const moratoriumRef = useRef(false);
  const tempOverrideRef = useRef(null);

  useEffect(() => { subsidyRef.current = subsidy; }, [subsidy]);
  useEffect(() => { moratoriumRef.current = moratorium; }, [moratorium]);
  useEffect(() => { tempOverrideRef.current = tempOverride; }, [tempOverride]);

  const fetchNeighborhoods = async (sim) => {
    try {
      let res;
      if (sim) {
        res = await axios.get(`${API}/simulate`, {
          params: { subsidy: subsidyRef.current, moratorium: moratoriumRef.current, temp_override: tempOverrideRef.current || undefined }
        });
      } else {
        res = await axios.get(`${API}/neighborhoods`);
      }
      const data = res.data.neighborhoods;
      setNeighborhoods(data);
      setCurrentTemp(res.data.current_temp_f || res.data.temp_f);
      setLoading(false);
      if (selectedIdRef.current) {
        const fresh = data.find(n => n.id === selectedIdRef.current);
        if (fresh) setSelected(fresh);
      }
    } catch (e) { console.error(e); }
  };

  const fetchForecast = async (id) => {
    try {
      const res = await axios.get(`${API}/neighborhood/${id}/forecast`, {
        params: { subsidy: subsidyRef.current, moratorium: moratoriumRef.current, temp_override: tempOverrideRef.current || undefined }
      });
      setForecast(res.data.forecast);
    } catch (e) { console.error(e); }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (subsidyRef.current) params.append("subsidy", subsidyRef.current);
    if (moratoriumRef.current) params.append("moratorium", true);
    if (tempOverrideRef.current) params.append("temp_override", tempOverrideRef.current);
    window.open(`${API}/report?${params.toString()}`, "_blank");
  };

  // eslint-disable-next-line
  useEffect(() => { fetchNeighborhoods(false); }, []);

  // eslint-disable-next-line
  useEffect(() => {
    fetchNeighborhoods(subsidy > 0 || moratorium || !!tempOverride);
    if (selectedIdRef.current) fetchForecast(selectedIdRef.current);
  }, [subsidy, moratorium, tempOverride]);

  const handleSelect = (n) => {
    selectedIdRef.current = n.id;
    setSelected(n);
    fetchForecast(n.id);
  };

  const handleBack = () => {
    setSelected(null);
    setForecast([]);
    selectedIdRef.current = null;
  };

  return (
    <div className="app">
      <Header currentTemp={currentTemp} onCompare={() => setCompareOpen(true)} onExport={handleExport} />
      <div className="main">
        <div className="map-container">
          <Map neighborhoods={neighborhoods} onSelect={handleSelect} selected={selected} loading={loading} />
        </div>
        <div className="panel">
          <PolicySliders
            subsidy={subsidy} setSubsidy={setSubsidy}
            moratorium={moratorium} setMoratorium={setMoratorium}
            tempOverride={tempOverride} setTempOverride={setTempOverride}
          />
          <Sidebar
            selected={selected}
            forecast={forecast}
            neighborhoods={neighborhoods}
            onBack={handleBack}
            subsidy={subsidy}
            moratorium={moratorium}
            tempOverride={tempOverride}
          />
        </div>
      </div>
      {compareOpen && (
        <CompareMode
          neighborhoods={neighborhoods}
          onClose={() => setCompareOpen(false)}
          tempOverride={tempOverride}
        />
      )}
    </div>
  );
}

export default App;

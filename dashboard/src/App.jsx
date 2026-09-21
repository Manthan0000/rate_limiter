import React, { useState, useEffect } from 'react';
import { Shield, Radio } from 'lucide-react';
import StatsOverview from './components/StatsOverview';
import LiveTrafficStream from './components/LiveTrafficStream';
import CurrentThreatPanel from './components/CurrentThreatPanel';
import AgentActivityTrace from './components/AgentActivityTrace';
import RiskChart from './components/RiskChart';
import DemoControlPanel from './components/DemoControlPanel';

const GATEWAY_BASE = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000/ws';

export default function App() {
  const [stats, setStats] = useState({
    total_requests: 0,
    requests_per_sec: 0,
    active_clients: 0,
    suspicious_clients: 0,
    blocked_requests: 0
  });

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [riskTrajectory, setRiskTrajectory] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch top stats periodically
  const fetchStats = async () => {
    try {
      const res = await fetch(`${GATEWAY_BASE}/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket for Real-time Gateway Events
  useEffect(() => {
    let ws;
    const connectWS = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          
          setEvents((prev) => [payload, ...prev.slice(0, 99)]);
          setSelectedEvent(payload);

          setRiskTrajectory((prev) => [
            ...prev.slice(-20),
            { timestamp: payload.timestamp, risk_score: payload.risk_score }
          ]);

          fetchStats();
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWS, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWS();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleStartSimulation = async (scenario) => {
    try {
      await fetch(`${GATEWAY_BASE}/admin/simulator/start?scenario=${scenario}&client_id=demo-${scenario}-user`, {
        method: 'POST'
      });
    } catch (err) {
      console.error('Error starting simulation:', err);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${GATEWAY_BASE}/admin/reset`, { method: 'POST' });
      setEvents([]);
      setSelectedEvent(null);
      setRiskTrajectory([]);
      fetchStats();
    } catch (err) {
      console.error('Error resetting system:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center glass-panel p-6 rounded-2xl gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 text-white">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-3">
              Agentic AI API Abuse Detection
              <span className="text-xs px-3 py-1 font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PROTOTYPE V1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Autonomous observe-detect-decide-act API gateway security framework</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/80 py-2 px-4 rounded-xl border border-slate-800">
          <Radio className={`w-4 h-4 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
          <span className="text-xs font-mono font-medium text-slate-300">
            {wsConnected ? 'LIVE WS CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </header>

      {/* Top Statistics Overview */}
      <StatsOverview stats={stats} />

      {/* Demo Controls */}
      <DemoControlPanel onStartSimulation={handleStartSimulation} onReset={handleReset} />

      {/* Grid Layout for Live Activity & Threat Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveTrafficStream events={events} onSelectEvent={setSelectedEvent} selectedEvent={selectedEvent} />
        </div>
        <div>
          <CurrentThreatPanel event={selectedEvent} />
        </div>
      </div>

      {/* Agent Activity Trace & Risk Trajectory Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentActivityTrace trace={selectedEvent?.agent_trace} />
        <RiskChart data={riskTrajectory} />
      </div>
    </div>
  );
}

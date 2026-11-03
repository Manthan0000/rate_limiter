import React, { useState, useEffect, useRef, useCallback } from 'react';
import StatsOverview from './components/StatsOverview';
import TargetPreviewBox from './components/TargetPreviewBox';
import LiveTrafficStream from './components/LiveTrafficStream';
import CurrentThreatPanel from './components/CurrentThreatPanel';
import AgentActivityTrace from './components/AgentActivityTrace';
import RiskChart from './components/RiskChart';
import DemoControlPanel from './components/DemoControlPanel';
import RateLimitNotificationPanel from './components/RateLimitNotificationPanel';

const GATEWAY_BASE = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000/ws';
const TOAST_DURATION_MS = 3000;

export default function App() {
  const [selectedSystem, setSelectedSystem] = useState('jiohotstar');
  const [selectedPage, setSelectedPage] = useState('home');
  const [securityMode, setSecurityMode] = useState('DYNAMIC');
  const [stats, setStats] = useState({
    total_requests: 0,
    requests_per_sec: 0,
    active_clients: 0,
    suspicious_clients: 0,
    blocked_requests: 0,
  });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [riskTrajectory, setRiskTrajectory] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeToasts, setActiveToasts] = useState([]);

  const toastTimersRef = useRef({});
  const seenNotifIdsRef = useRef(new Set());

  const fetchStats = async () => {
    try {
      const res = await fetch(`${GATEWAY_BASE}/admin/stats`);
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSecurityMode = async () => {
    try {
      const res = await fetch(`${GATEWAY_BASE}/admin/mode`);
      if (res.ok) {
        const data = await res.json();
        setSecurityMode(data.mode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${GATEWAY_BASE}/admin/notifications`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissToast = useCallback((id) => {
    if (toastTimersRef.current[id]) {
      clearTimeout(toastTimersRef.current[id]);
      delete toastTimersRef.current[id];
    }
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerToast = useCallback((notif) => {
    const rawId = notif.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    if (seenNotifIdsRef.current.has(rawId)) return;
    seenNotifIdsRef.current.add(rawId);

    const toastItem = { ...notif, id: rawId, createdAt: Date.now() };
    setActiveToasts((prev) => [toastItem, ...prev.filter((t) => t.id !== rawId)].slice(0, 3));

    if (toastTimersRef.current[rawId]) clearTimeout(toastTimersRef.current[rawId]);
    toastTimersRef.current[rawId] = setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== rawId));
      delete toastTimersRef.current[rawId];
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    if (activeToasts.length === 0) return;
    const sweep = setInterval(() => {
      const now = Date.now();
      setActiveToasts((prev) => prev.filter((t) => !t.createdAt || now - t.createdAt < TOAST_DURATION_MS));
    }, 300);
    return () => clearInterval(sweep);
  }, [activeToasts.length]);

  useEffect(() => {
    fetchStats();
    fetchSecurityMode();
    fetchNotifications();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let ws;
    let reconnectTimer;
    let isUnmounted = false;

    const connectWS = () => {
      if (isUnmounted) return;
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        if (!isUnmounted) setWsConnected(true);
      };

      ws.onmessage = (evt) => {
        if (isUnmounted) return;
        try {
          const payload = JSON.parse(evt.data);
          setEvents((prev) => [payload, ...prev.slice(0, 99)]);
          setSelectedEvent(payload);

          if (payload.rate_limit_notification) {
            const notif = payload.rate_limit_notification;
            setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)].slice(0, 50));
            triggerToast(notif);
          }

          setRiskTrajectory((prev) => [
            ...prev.slice(-20),
            { timestamp: payload.timestamp, risk_score: payload.risk_score },
          ]);
          fetchStats();
        } catch (err) {
          console.error(err);
        }
      };

      ws.onclose = () => {
        if (isUnmounted) return;
        setWsConnected(false);
        reconnectTimer = setTimeout(connectWS, 2000);
      };

      ws.onerror = () => ws.close();
    };

    connectWS();
    return () => {
      isUnmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.onmessage = null;
        ws.close();
      }
    };
  }, [triggerToast]);

  const handleToggleSecurityMode = async (newMode) => {
    try {
      const res = await fetch(`${GATEWAY_BASE}/admin/mode?mode=${newMode}`, { method: 'POST' });
      if (res.ok) setSecurityMode(newMode);
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrentEndpoint = () => {
    return `/api/${selectedSystem}/${selectedPage === 'home' ? 'home' : selectedPage}`;
  };

  const handleStartSimulation = async (scenario) => {
    const endpoint = getCurrentEndpoint();
    try {
      await fetch(
        `${GATEWAY_BASE}/admin/simulator/start?scenario=${scenario}&client_id=demo-${scenario}-user&endpoint=${encodeURIComponent(
          endpoint
        )}`,
        { method: 'POST' }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopSimulation = async () => {
    try {
      await fetch(`${GATEWAY_BASE}/admin/simulator/stop`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${GATEWAY_BASE}/admin/reset`, { method: 'POST' });
      Object.values(toastTimersRef.current).forEach(clearTimeout);
      toastTimersRef.current = {};
      seenNotifIdsRef.current.clear();
      setEvents([]);
      setSelectedEvent(null);
      setRiskTrajectory([]);
      setNotifications([]);
      setActiveToasts([]);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-white font-sans antialiased selection:bg-white selection:text-black">
      {/* Signature 4px M Tricolor Divider */}
      <div className="m-stripe-h w-full sticky top-0 z-50" />

      {/* Top Navigation */}
      <header className="h-16 bg-canvas border-b border-hairline px-4 sm:px-8 lg:px-12 flex items-center justify-between sticky top-1 z-40">
        <div className="flex items-center gap-4">
          {/* M Identity Wordmark Accent */}
          <div className="flex items-center gap-2">
            <div className="flex items-center h-5 w-6 overflow-hidden">
              <span className="w-2 h-full bg-m-blue-light skew-x-[-20deg]" />
              <span className="w-2 h-full bg-m-blue-dark skew-x-[-20deg]" />
              <span className="w-2 h-full bg-m-red skew-x-[-20deg]" />
            </div>
            <span className="font-sans font-black text-2xl tracking-tighter italic text-white">
              M
            </span>
          </div>

          <div className="h-4 w-[1px] bg-hairline" />

          <div>
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-[1.5px] text-white">
              PERIMETER DEFENSE GATEWAY
            </h1>
          </div>
        </div>

        {/* Right Status Cluster */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-soft border border-hairline">
            <span
              className={`w-2 h-2 rounded-full ${
                wsConnected ? 'bg-white animate-pulse' : 'bg-m-red'
              }`}
            />
            <span className="text-[11px] font-mono uppercase tracking-wider text-body">
              {wsConnected ? 'TELEMETRY LIVE' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Editorial Container */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 lg:py-16 space-y-12 lg:space-y-16">
        {/* Hero Editorial Header */}
        <section className="border-b border-hairline pb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-body block mb-2">
                AUTONOMOUS SECURITY ARCHITECTURE
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-none">
                OBSERVE. DETECT. DECIDE. ACT.
              </h2>
              <p className="text-base sm:text-lg font-light text-body mt-4 leading-relaxed max-w-2xl">
                High-precision multi-agent rate limiting framework. Continuous anomaly resolution, velocity throttling, and autonomous dynamic quota expansion at motorsport scale.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-end">
              <span className="text-xs font-mono font-bold uppercase px-3 py-1.5 border border-white text-white">
                SPEC: AGENTIC ODDA V2
              </span>
            </div>
          </div>
        </section>

        {/* Section 1: Ingress Metrics Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-body">
              SYSTEM OVERVIEW TELEMETRY
            </h3>
            <span className="text-[11px] font-mono text-muted uppercase">POLL RATE: 3.0S</span>
          </div>
          <StatsOverview stats={stats} />
        </section>

        {/* Section 2: Active Quota & Autonomous Adaptation Log */}
        <section>
          <RateLimitNotificationPanel
            notifications={notifications}
            activeToasts={activeToasts}
            onDismissToast={handleDismissToast}
            onClearNotifications={() => setNotifications([])}
            latestEvent={selectedEvent}
            securityMode={securityMode}
          />
        </section>

        {/* Section 3: Target System & Live Emulation Viewport */}
        <section>
          <TargetPreviewBox
            selectedSystem={selectedSystem}
            onSelectSystem={setSelectedSystem}
            selectedPage={selectedPage}
            onSelectPage={setSelectedPage}
            securityMode={securityMode}
            onToggleSecurityMode={handleToggleSecurityMode}
            latestEvent={selectedEvent}
          />
        </section>

        {/* Section 4: Dynamic Scenario Simulator */}
        <section>
          <DemoControlPanel
            onStartSimulation={handleStartSimulation}
            onStopSimulation={handleStopSimulation}
            onReset={handleReset}
          />
        </section>

        {/* Section 5: Live Traffic Stream & Current Threat Inspection */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LiveTrafficStream
              events={events}
              onSelectEvent={setSelectedEvent}
              selectedEvent={selectedEvent}
            />
          </div>
          <div>
            <CurrentThreatPanel event={selectedEvent} />
          </div>
        </section>

        {/* Section 6: Agent Execution Pipeline & Risk Trajectory */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AgentActivityTrace trace={selectedEvent?.agent_trace} />
          <RiskChart data={riskTrajectory} />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-hairline bg-canvas">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-hairline">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center h-4 w-5 overflow-hidden">
                  <span className="w-1.5 h-full bg-m-blue-light skew-x-[-20deg]" />
                  <span className="w-1.5 h-full bg-m-blue-dark skew-x-[-20deg]" />
                  <span className="w-1.5 h-full bg-m-red skew-x-[-20deg]" />
                </div>
                <span className="font-bold text-sm tracking-tight italic text-white">M POWER</span>
              </div>
              <p className="text-xs font-light text-body leading-relaxed">
                Autonomous API defense telemetry. Engineering uncompromising velocity with active perimeter safety.
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-white block mb-4">
                PIPELINE AGENTS
              </span>
              <ul className="space-y-2 text-xs font-light text-body">
                <li>TRAFFIC MONITORING AGENT</li>
                <li>THREAT DETECTION AGENT</li>
                <li>SECURITY DECISION AGENT</li>
                <li>RESPONSE & ACTUATION AGENT</li>
                <li>FEEDBACK & ADAPTATION AGENT</li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-white block mb-4">
                MITIGATION PROTOCOLS
              </span>
              <ul className="space-y-2 text-xs font-light text-body">
                <li>RFC 6585 TOO MANY REQUESTS</li>
                <li>EXPONENTIAL BACKOFF REGULATION</li>
                <li>IP QUOTA CHOKING & BLOCK</li>
                <li>DYNAMIC BURST AUTHORIZATION</li>
                <li>CREDENTIAL STUFFING RESISTANCE</li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-white block mb-4">
                SYSTEM TELEMETRY
              </span>
              <ul className="space-y-2 text-xs font-mono text-muted">
                <li>GATEWAY BASE: 127.0.0.1:8000</li>
                <li>SOCKET TRANSPORT: RFC 6455</li>
                <li>PERIMETER: ACTIVE FILTERING</li>
                <li>CANVAS: TRUE BLACK #000000</li>
                <li>ENFORCEMENT: LOW LATENCY</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-light text-muted">
            <p>© 2026 BMW M PERIMETER DEFENSE GATEWAY · INDUSTRIAL PRECISION ARCHITECTURE</p>
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider">
              <span>ZERO RADIUS</span>
              <span>•</span>
              <span>1PX HAIRLINES</span>
              <span>•</span>
              <span>BMW M TRICOLOR</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

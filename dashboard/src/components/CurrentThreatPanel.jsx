import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function CurrentThreatPanel({ event }) {
  if (!event) {
    return (
      <div className="bg-surface-card border border-hairline p-6 lg:p-8 h-full flex flex-col justify-center items-center text-center">
        <ShieldCheck className="w-10 h-10 text-muted mb-4" />
        <h3 className="text-base font-bold uppercase tracking-[1.5px] text-white">
          INSPECTION ENGINE IDLE
        </h3>
        <p className="text-xs font-light text-body max-w-xs mt-2 leading-relaxed">
          Select any packet from the live ingress telemetry table to view risk decomposition and mitigation reasoning.
        </p>
      </div>
    );
  }

  const { client_id, risk_score, risk_level, action, reason, metrics } = event;

  const getRiskTone = (score) => {
    if (score >= 80) return { text: 'text-m-red', bar: 'bg-m-red', border: 'border-m-red' };
    if (score >= 60) return { text: 'text-m-red', bar: 'bg-m-red', border: 'border-m-red' };
    if (score >= 30) return { text: 'text-warning', bar: 'bg-warning', border: 'border-warning' };
    return { text: 'text-white', bar: 'bg-white', border: 'border-hairline' };
  };

  const tone = getRiskTone(risk_score);

  return (
    <div className="bg-surface-card border border-hairline p-6 lg:p-8 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div>
            <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-muted block">
              TARGET SESSION
            </span>
            <h3 className="text-sm font-bold text-white font-mono mt-0.5 truncate max-w-[200px]">
              {client_id}
            </h3>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border ${tone.border} ${tone.text}`}>
            {risk_level}
          </span>
        </div>

        {/* Risk Score Gauge */}
        <div className="my-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-bold uppercase tracking-[1.5px] text-body">
              RISK VELOCITY
            </span>
            <div className="font-mono">
              <span className={`text-3xl font-bold ${tone.text}`}>{risk_score}</span>
              <span className="text-xs text-muted font-normal ml-1">/ 100</span>
            </div>
          </div>
          <div className="w-full h-2 bg-canvas border border-hairline">
            <div
              className={`h-full transition-all duration-300 ${tone.bar}`}
              style={{ width: `${Math.max(5, risk_score)}%` }}
            />
          </div>
        </div>

        {/* Applied Mitigation Spec */}
        <div className="bg-surface-soft p-4 border border-hairline mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-muted block">
              MITIGATION STRATEGY
            </span>
            <div className="text-sm font-bold uppercase tracking-wider text-white font-mono mt-1">
              {action}
            </div>
          </div>
          {event.quota !== undefined && (
            <div className="text-right">
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-muted block">
                ACTIVE LIMIT
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {event.previous_quota !== undefined && event.previous_quota !== event.quota
                  ? `${event.previous_quota} → ${event.quota} RPM`
                  : `${event.quota} RPM`}
              </span>
            </div>
          )}
        </div>

        {/* Reasoning Breakdown */}
        <div>
          <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-muted block mb-2">
            AGENT DECISION LOGIC
          </span>
          <div className="text-xs text-body bg-surface-soft p-4 border border-hairline leading-relaxed font-mono">
            {reason ? (
              reason.split('; ').map((r, i) => (
                <div key={i} className="flex items-start gap-2 my-1">
                  <span className="text-white font-bold">—</span>
                  <span className="text-body-strong font-light font-sans">{r}</span>
                </div>
              ))
            ) : (
              <span className="text-muted font-light font-sans">Nominal trajectory. No policy deviations flagged.</span>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-hairline text-xs font-mono">
          <div className="bg-surface-soft p-3 border border-hairline">
            <span className="text-[10px] uppercase tracking-wider text-muted block">RPM RATE</span>
            <span className="text-white font-bold text-sm">{metrics.requests_per_minute}</span>
          </div>
          <div className="bg-surface-soft p-3 border border-hairline">
            <span className="text-[10px] uppercase tracking-wider text-muted block">AUTH ANOMALIES</span>
            <span className={`font-bold text-sm ${metrics.login_failures > 0 ? 'text-m-red' : 'text-white'}`}>
              {metrics.login_failures}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

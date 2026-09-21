import React from 'react';
import { AlertOctagon, ShieldAlert, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CurrentThreatPanel({ event }) {
  if (!event) {
    return (
      <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-center items-center text-center">
        <ShieldCheck className="w-12 h-12 text-emerald-400 mb-3 opacity-60" />
        <h3 className="text-base font-semibold text-slate-300">No Active Threat Selected</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">Select any event from the live stream table to inspect deep risk metrics and agent reasoning.</p>
      </div>
    );
  }

  const { client_id, risk_score, risk_level, action, reason, metrics } = event;

  const getRiskColor = (score) => {
    if (score >= 80) return { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/30' };
    if (score >= 60) return { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/30' };
    if (score >= 30) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30' };
  };

  const colors = getRiskColor(risk_score);

  return (
    <div className="glass-panel p-5 rounded-2xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Client</span>
            <h3 className="text-lg font-bold text-white font-mono mt-0.5">{client_id}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg}/20 ${colors.text} border ${colors.border}`}>
            {risk_level}
          </span>
        </div>

        {/* Risk Gauge Bar */}
        <div className="my-5">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-slate-400 font-semibold">Threat Risk Score</span>
            <span className={`text-2xl font-black font-mono ${colors.text}`}>{risk_score} <span className="text-xs text-slate-500 font-normal">/ 100</span></span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
              style={{ width: `${Math.max(5, risk_score)}%` }}
            ></div>
          </div>
        </div>

        {/* Current Security Action */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 mb-4">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Applied Mitigation</span>
          <div className="text-base font-bold text-cyan-300 font-mono mt-1">{action}</div>
        </div>

        {/* Detection Reasons */}
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Agent Reason Breakdown</span>
          <div className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono leading-relaxed">
            {reason ? (
              reason.split('; ').map((r, i) => (
                <div key={i} className="flex items-start space-x-2 my-1">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{r}</span>
                </div>
              ))
            ) : (
              <span className="text-slate-500">Normal request pattern</span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-900/40 p-2 rounded-lg">
            <span className="text-slate-500 block">RPM</span>
            <span className="text-slate-200 font-bold">{metrics.requests_per_minute}</span>
          </div>
          <div className="bg-slate-900/40 p-2 rounded-lg">
            <span className="text-slate-500 block">Auth Failures</span>
            <span className="text-rose-400 font-bold">{metrics.login_failures}</span>
          </div>
        </div>
      )}
    </div>
  );
}

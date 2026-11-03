import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function RiskChart({ data }) {
  return (
    <div className="bg-surface-card border border-hairline p-6 lg:p-8 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-white inline-block"></span>
          <h2 className="text-lg font-bold uppercase tracking-tight text-white">
            THREAT RISK TRAJECTORY
          </h2>
        </div>
        <span className="text-xs font-mono text-muted uppercase">
          INDEX RANGE: 0 — 100
        </span>
      </div>

      <div className="w-full h-[220px] flex-1">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs font-light font-sans border border-dashed border-hairline">
            AWAITING TELEMETRY VECTOR DATA...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mRedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e22718" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#e22718" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0 0" stroke="#262626" />
              <XAxis dataKey="timestamp" stroke="#7e7e7e" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#7e7e7e" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
                  borderColor: '#3c3c3c',
                  borderRadius: '0px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#ffffff',
                }}
                labelStyle={{ color: '#bbbbbb', textTransform: 'uppercase' }}
              />
              <Area
                type="monotone"
                dataKey="risk_score"
                stroke="#e22718"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#mRedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="pt-3 mt-2 border-t border-hairline flex items-center justify-between text-[10px] font-mono text-muted uppercase">
        <span>SAMPLING WINDOW: LAST 20 INGRESS VECTORS</span>
        <span className="text-body">ANOMALY DIVERGENCE METRIC</span>
      </div>
    </div>
  );
}

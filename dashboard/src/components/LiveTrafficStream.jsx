import React from 'react';

export default function LiveTrafficStream({ events, onSelectEvent, selectedEvent }) {
  const getActionBadge = (action) => {
    switch (action) {
      case 'ALLOW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ALLOW</span>;
      case 'RATE_LIMIT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">RATE LIMIT</span>;
      case 'STRICT_RATE_LIMIT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">STRICT LIMIT</span>;
      case 'BLOCK':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">BLOCK</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400">{action}</span>;
    }
  };

  const getStatusBadge = (code) => {
    if (code >= 200 && code < 300) return <span className="text-emerald-400 font-mono font-medium">{code}</span>;
    if (code === 429) return <span className="text-amber-400 font-mono font-medium">{code}</span>;
    if (code === 403) return <span className="text-rose-400 font-mono font-medium">{code}</span>;
    return <span className="text-slate-400 font-mono font-medium">{code}</span>;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <h2 className="text-lg font-bold text-white tracking-wide">Live Gateway Traffic Stream</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">{events.length} events logged</span>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[380px] rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold sticky top-0 backdrop-blur-md">
            <tr>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Client ID</th>
              <th className="py-3 px-4">Endpoint</th>
              <th className="py-3 px-4">Risk</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {events.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                  No live events recorded yet. Click a demo trigger to simulate traffic.
                </td>
              </tr>
            ) : (
              events.map((evt, index) => {
                const isSelected = selectedEvent && selectedEvent.timestamp === evt.timestamp && selectedEvent.client_id === evt.client_id;
                return (
                  <tr
                    key={index}
                    onClick={() => onSelectEvent(evt)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/50 text-cyan-200' : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-4 text-slate-400">{evt.timestamp}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-200">{evt.client_id}</td>
                    <td className="py-2.5 px-4 text-cyan-400">{evt.method} {evt.endpoint}</td>
                    <td className="py-2.5 px-4 font-bold">
                      <span className={evt.risk_score > 60 ? 'text-rose-400' : evt.risk_score > 30 ? 'text-amber-400' : 'text-emerald-400'}>
                        {evt.risk_score}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">{getActionBadge(evt.action)}</td>
                    <td className="py-2.5 px-4">{getStatusBadge(evt.status_code)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

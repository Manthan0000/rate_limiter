import React from 'react';

export default function LiveTrafficStream({ events, onSelectEvent, selectedEvent }) {
  const getActionBadge = (action) => {
    switch (action) {
      case 'BOOST_RATE_LIMIT':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-white bg-white text-black">
            BOOST (250 RPM)
          </span>
        );
      case 'ALLOW':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-hairline text-body-strong">
            ALLOW
          </span>
        );
      case 'RATE_LIMIT':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-warning text-warning">
            RATE LIMIT (30)
          </span>
        );
      case 'STRICT_RATE_LIMIT':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-m-red text-m-red">
            STRICT (10)
          </span>
        );
      case 'BLOCK':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-m-red bg-m-red text-white">
            BLOCK (0)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-hairline text-muted">
            {action}
          </span>
        );
    }
  };

  const getStatusBadge = (code) => {
    if (code >= 200 && code < 300) {
      return <span className="font-mono text-xs font-bold text-white">{code}</span>;
    }
    if (code === 429) {
      return <span className="font-mono text-xs font-bold text-warning">{code}</span>;
    }
    if (code === 403) {
      return <span className="font-mono text-xs font-bold text-m-red">{code}</span>;
    }
    return <span className="font-mono text-xs font-bold text-muted">{code}</span>;
  };

  return (
    <div className="bg-surface-card border border-hairline p-6 lg:p-8 flex flex-col h-full">
      <div className="flex items-center justify-between pb-6 mb-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
            LIVE INGRESS TELEMETRY
          </h2>
        </div>
        <span className="text-xs font-mono uppercase text-muted">
          {events.length} EVENTS RECORDED
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[380px] border border-hairline">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-soft text-body uppercase font-bold tracking-[1.5px] border-b border-hairline sticky top-0">
            <tr>
              <th className="py-3 px-4">TIMESTAMP</th>
              <th className="py-3 px-4">CLIENT IDENTIFIER</th>
              <th className="py-3 px-4">ENDPOINT TARGET</th>
              <th className="py-3 px-4">RISK INDEX</th>
              <th className="py-3 px-4">ENFORCED ACTION</th>
              <th className="py-3 px-4">HTTP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline font-mono bg-canvas">
            {events.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-xs font-light text-muted font-sans">
                  INGRESS BUS SILENT. INITIATE A TRAFFIC SCENARIO TO STREAM REAL-TIME PACKETS.
                </td>
              </tr>
            ) : (
              events.map((evt, index) => {
                const isSelected =
                  selectedEvent &&
                  selectedEvent.timestamp === evt.timestamp &&
                  selectedEvent.client_id === evt.client_id;

                return (
                  <tr
                    key={index}
                    onClick={() => onSelectEvent(evt)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-surface-elevated text-white border-l-2 border-white'
                        : 'hover:bg-surface-soft text-body'
                    }`}
                  >
                    <td className="py-3 px-4 text-muted text-[11px]">{evt.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-white text-[11px]">{evt.client_id}</td>
                    <td className="py-3 px-4 text-body text-[11px]">
                      <span className="text-muted mr-1.5">{evt.method}</span>
                      {evt.endpoint}
                    </td>
                    <td className="py-3 px-4 font-bold text-[11px]">
                      <span
                        className={
                          evt.risk_score > 60
                            ? 'text-m-red'
                            : evt.risk_score > 30
                            ? 'text-warning'
                            : 'text-white'
                        }
                      >
                        {evt.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3 px-4">{getActionBadge(evt.action)}</td>
                    <td className="py-3 px-4">{getStatusBadge(evt.status_code)}</td>
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

import React from 'react';
import { Activity, Zap, Users, AlertTriangle, Ban } from 'lucide-react';

export default function StatsOverview({ stats }) {
  const cards = [
    {
      label: 'TOTAL REQUESTS',
      value: stats?.total_requests || 0,
      icon: Activity,
      sub: 'GATEWAY INGRESS',
    },
    {
      label: 'REQUESTS / SEC',
      value: stats?.requests_per_sec || 0,
      icon: Zap,
      sub: 'LIVE THROUGHPUT',
    },
    {
      label: 'ACTIVE CLIENTS',
      value: stats?.active_clients || 0,
      icon: Users,
      sub: 'SESSION POOL',
    },
    {
      label: 'SUSPICIOUS CLIENTS',
      value: stats?.suspicious_clients || 0,
      icon: AlertTriangle,
      sub: 'FLAGGED SESSIONS',
      isWarning: (stats?.suspicious_clients || 0) > 0,
    },
    {
      label: 'BLOCKED REQUESTS',
      value: stats?.blocked_requests || 0,
      icon: Ban,
      sub: 'RATE ENFORCED',
      isCritical: (stats?.blocked_requests || 0) > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 border border-hairline bg-canvas">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-6 bg-surface-card border-b lg:border-b-0 border-hairline flex flex-col justify-between ${
              idx !== cards.length - 1 ? 'lg:border-r' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-body">
                {card.label}
              </span>
              <Icon className="w-4 h-4 text-muted" />
            </div>

            <div>
              <div className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans">
                {card.value.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-light tracking-wide text-muted uppercase">
                  {card.sub}
                </span>
                {card.isWarning && (
                  <span className="w-1.5 h-1.5 bg-[#f4b400] inline-block" />
                )}
                {card.isCritical && (
                  <span className="w-1.5 h-1.5 bg-m-red inline-block" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

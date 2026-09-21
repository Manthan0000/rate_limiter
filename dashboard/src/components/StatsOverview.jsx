import React from 'react';
import { Activity, Users, ShieldAlert, Ban, Zap } from 'lucide-react';

export default function StatsOverview({ stats }) {
  const cards = [
    {
      title: 'Total Requests',
      value: stats?.total_requests || 0,
      icon: Activity,
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-400'
    },
    {
      title: 'Requests / Sec',
      value: stats?.requests_per_sec || 0,
      icon: Zap,
      color: 'from-cyan-500 to-teal-500',
      textColor: 'text-cyan-400'
    },
    {
      title: 'Active Clients',
      value: stats?.active_clients || 0,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-400'
    },
    {
      title: 'Suspicious Clients',
      value: stats?.suspicious_clients || 0,
      icon: ShieldAlert,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400'
    },
    {
      title: 'Blocked Requests',
      value: stats?.blocked_requests || 0,
      icon: Ban,
      color: 'from-red-500 to-rose-600',
      textColor: 'text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="glass-panel glass-panel-hover p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-20 text-white shadow-lg`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { CheckCircle2, Shield, Cpu, Lock, RefreshCw } from 'lucide-react';

export default function AgentActivityTrace({ trace }) {
  const agentIcons = {
    'Traffic Monitoring Agent': Cpu,
    'Threat Detection Agent': Shield,
    'Security Decision Agent': Lock,
    'Response Agent': CheckCircle2,
    'Feedback Agent': RefreshCw
  };

  if (!trace || trace.length === 0) {
    return (
      <div className="glass-panel p-5 rounded-2xl h-full flex items-center justify-center text-slate-500 text-xs">
        Waiting for agent activity...
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-2xl h-full flex flex-col justify-between">
      <h2 className="text-lg font-bold text-white tracking-wide mb-4">Agent Execution Flow</h2>
      
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
        {trace.map((step, idx) => {
          const Icon = agentIcons[step.agent] || CheckCircle2;
          return (
            <div key={idx} className="relative flex items-start space-x-3.5 pl-1">
              <div className="z-10 p-1.5 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-400 shadow-md">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-bold text-slate-200">{step.agent}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">{step.status}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">{step.details}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

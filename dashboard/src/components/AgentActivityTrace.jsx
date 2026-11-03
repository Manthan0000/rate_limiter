import React from 'react';
import { CheckCircle2, Shield, Cpu, Lock, RefreshCw } from 'lucide-react';

export default function AgentActivityTrace({ trace }) {
  const agentIcons = {
    'Traffic Monitoring Agent': Cpu,
    'Threat Detection Agent': Shield,
    'Security Decision Agent': Lock,
    'Response Agent': CheckCircle2,
    'Feedback Agent': RefreshCw,
  };

  if (!trace || trace.length === 0) {
    return (
      <div className="bg-surface-card border border-hairline p-6 lg:p-8 h-full flex flex-col justify-center items-center text-center">
        <Cpu className="w-10 h-10 text-muted mb-4" />
        <h3 className="text-base font-bold uppercase tracking-[1.5px] text-white">
          ODDA LOOP AWAITING STIMULUS
        </h3>
        <p className="text-xs font-light text-body max-w-xs mt-2 leading-relaxed">
          The autonomous multi-agent pipeline activates synchronously upon packet ingress.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-card border border-hairline p-6 lg:p-8 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-hairline">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-white inline-block"></span>
          <h2 className="text-lg font-bold uppercase tracking-tight text-white">
            AUTONOMOUS AGENT PIPELINE TRACE
          </h2>
        </div>
        <span className="text-xs font-mono text-muted uppercase">
          {trace.length} STAGES COMPLETED
        </span>
      </div>

      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-[1px] before:bg-hairline">
        {trace.map((step, idx) => {
          const Icon = agentIcons[step.agent] || CheckCircle2;
          return (
            <div key={idx} className="relative flex items-start gap-4 pl-1">
              <div className="z-10 p-1.5 bg-canvas border border-white text-white shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 bg-surface-soft p-3.5 border border-hairline">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-[1px] text-white">
                    {step.agent}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-hairline text-body">
                    {step.status}
                  </span>
                </div>
                <p className="text-xs font-light text-body leading-relaxed">
                  {step.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

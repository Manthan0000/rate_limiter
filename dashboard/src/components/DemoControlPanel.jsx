import React, { useState } from 'react';
import { Play, RotateCcw, ShieldAlert, Zap, Lock, Square } from 'lucide-react';

export default function DemoControlPanel({ onStartSimulation, onStopSimulation, onReset }) {
  const [activeScenario, setActiveScenario] = useState(null);

  const handleTrigger = (scenario) => {
    setActiveScenario(scenario);
    onStartSimulation(scenario);
  };

  const handleStopClick = () => {
    setActiveScenario(null);
    onStopSimulation();
  };

  const handleResetClick = () => {
    setActiveScenario(null);
    onReset();
  };

  return (
    <div className="bg-surface-card border border-hairline p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-hairline gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-white inline-block"></span>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
              DYNAMIC SCENARIO INJECTION
            </h2>
          </div>
          <p className="text-xs font-light text-body mt-1 pl-5.5">
            Real-time synthetic traffic driver for autonomous observe-detect-decide-act loop evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-muted">
            STATUS:
          </span>
          <span className="text-xs font-mono font-bold uppercase px-2 py-1 bg-surface-soft border border-hairline text-white">
            {activeScenario ? `ACTIVE · ${activeScenario.toUpperCase()}` : 'STANDBY'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <button
          onClick={() => handleTrigger('normal')}
          className={`h-12 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[1.5px] transition-all cursor-pointer ${
            activeScenario === 'normal'
              ? 'bg-white text-black border border-white'
              : 'bg-canvas text-white border border-hairline hover:border-white hover:bg-surface-elevated'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>NORMAL</span>
        </button>

        <button
          onClick={() => handleTrigger('burst')}
          className={`h-12 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[1.5px] transition-all cursor-pointer ${
            activeScenario === 'burst'
              ? 'bg-white text-black border border-white'
              : 'bg-canvas text-white border border-hairline hover:border-white hover:bg-surface-elevated'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>BURST</span>
        </button>

        <button
          onClick={() => handleTrigger('brute_force')}
          className={`h-12 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[1.5px] transition-all cursor-pointer ${
            activeScenario === 'brute_force'
              ? 'bg-white text-black border border-white'
              : 'bg-canvas text-white border border-hairline hover:border-white hover:bg-surface-elevated'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>BRUTE FORCE</span>
        </button>

        <button
          onClick={() => handleTrigger('high_frequency')}
          className={`h-12 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[1.5px] transition-all cursor-pointer ${
            activeScenario === 'high_frequency'
              ? 'bg-white text-black border border-white'
              : 'bg-canvas text-white border border-hairline hover:border-white hover:bg-surface-elevated'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>HIGH FREQ</span>
        </button>

        <button
          onClick={handleStopClick}
          className="h-12 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[1.5px] transition-all cursor-pointer bg-canvas text-m-red border border-m-red hover:bg-m-red hover:text-white"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>HALT INJECTION</span>
        </button>

        <button
          onClick={handleResetClick}
          className="h-12 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[1.5px] transition-all cursor-pointer bg-canvas text-body border border-hairline hover:border-white hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET GATEWAY</span>
        </button>
      </div>
    </div>
  );
}

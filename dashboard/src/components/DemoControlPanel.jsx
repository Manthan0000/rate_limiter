import React, { useState } from 'react';
import { Play, RotateCcw, ShieldAlert, Zap, Lock, Terminal, Square } from 'lucide-react';

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
    <div className="glass-panel p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">Live Demo Simulation Panel</h2>
        </div>
        <span className="text-xs text-slate-400">Trigger or stop traffic scenarios in real time</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <button
          onClick={() => handleTrigger('normal')}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold transition-all shadow-md ${
            activeScenario === 'normal'
              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-emerald-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Normal Traffic</span>
        </button>

        <button
          onClick={() => handleTrigger('burst')}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold transition-all shadow-md ${
            activeScenario === 'burst'
              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-amber-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Traffic Burst</span>
        </button>

        <button
          onClick={() => handleTrigger('brute_force')}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold transition-all shadow-md ${
            activeScenario === 'brute_force'
              ? 'bg-orange-500 text-slate-950 ring-2 ring-orange-400 shadow-orange-500/20'
              : 'bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Brute Force</span>
        </button>

        <button
          onClick={() => handleTrigger('high_frequency')}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold transition-all shadow-md ${
            activeScenario === 'high_frequency'
              ? 'bg-rose-500 text-slate-950 ring-2 ring-rose-400 shadow-rose-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>High Freq Attack</span>
        </button>

        <button
          onClick={handleStopClick}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-800/80 hover:bg-rose-900 hover:text-white transition-all shadow-md"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop Simulation</span>
        </button>

        <button
          onClick={handleResetClick}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset System</span>
        </button>
      </div>
    </div>
  );
}

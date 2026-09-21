import React from 'react';
import { Tv, GraduationCap, ShieldCheck, Lock, Play, Film, Radio, Key, CreditCard, Award, ExternalLink, Globe, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function TargetPreviewBox({
  selectedSystem,
  onSelectSystem,
  selectedPage,
  onSelectPage,
  securityMode,
  onToggleSecurityMode,
  latestEvent
}) {
  const isJio = selectedSystem === 'jiohotstar';

  const jioPages = [
    { id: 'home', label: 'Homepage', icon: Tv, file: '/screenshots/hotstar_home.jpeg', type: 'image' },
    { id: 'login', label: 'Login Page', icon: Key, file: '/screenshots/hotstar_login.png', type: 'image' },
    { id: 'livestream', label: 'Live Stream Video', icon: Radio, file: '/screenshots/hotstar_stream.mp4', type: 'video' },
    { id: 'movie', label: 'Movie Page', icon: Film, file: '/screenshots/hotstar_movie.png', type: 'image' }
  ];

  const iiitvPages = [
    { id: 'home', label: 'Homepage', icon: GraduationCap, file: '/screenshots/IIITV_home.png', type: 'image' },
    { id: 'login', label: 'ERP Login', icon: Key, file: '/screenshots/IIITV_login.png', type: 'image' },
    { id: 'payment', label: 'Fee Payment', icon: CreditCard, file: '/screenshots/IIITV_payment.png', type: 'image' },
    { id: 'result', label: 'Result Sheet', icon: Award, file: '/screenshots/IIITV_result.png', type: 'image' }
  ];

  const activePages = isJio ? jioPages : iiitvPages;
  const currentMedia = activePages.find((p) => p.id === selectedPage) || activePages[0];

  // Determine if current state is an Error State (HTTP 429 / 403 or enforcement action)
  const isErrorState = latestEvent && (
    latestEvent.status_code === 429 ||
    latestEvent.status_code === 403 ||
    latestEvent.action === 'RATE_LIMIT' ||
    latestEvent.action === 'STRICT_RATE_LIMIT' ||
    latestEvent.action === 'BLOCK' ||
    latestEvent.action === 'STATIC_RATE_LIMIT'
  );

  return (
    <div className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Top Header & System Selector Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-400/30 text-white shadow-lg shadow-cyan-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-wide">Target Web System & Endpoint Tester</h2>
            <p className="text-xs text-slate-400">Interactive live web interface preview & endpoint security evaluator</p>
          </div>
        </div>

        {/* System Selector Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              onSelectSystem('jiohotstar');
              onSelectPage('home');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isJio
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-cyan-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>JioHotstar Streaming</span>
          </button>

          <button
            onClick={() => {
              onSelectSystem('iiitv');
              onSelectPage('home');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isJio
                ? 'bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white shadow-lg shadow-teal-500/30 ring-1 ring-teal-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>IIIT Vadodara Portal</span>
          </button>
        </div>
      </div>

      {/* Secondary Controls: Page Selection Pills & Security Mode Switch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Page Pills */}
        <div className="flex flex-wrap gap-2">
          {activePages.map((p) => {
            const Icon = p.icon;
            const isActive = selectedPage === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPage(p.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Security Mode Switch */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onToggleSecurityMode('STATIC')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              securityMode === 'STATIC'
                ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/30 ring-1 ring-rose-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Static Rate Limit (Fixed 50)</span>
          </button>

          <button
            onClick={() => onToggleSecurityMode('DYNAMIC')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              securityMode === 'DYNAMIC'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Agentic AI Security</span>
          </button>
        </div>
      </div>

      {/* Embedded Media Preview Window */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-2xl font-sans">
        {/* Mock Browser Address Bar */}
        <div className={`px-4 py-3 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
          isErrorState ? 'bg-rose-950/90 border-rose-800/80' : 'bg-slate-900/95 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
          </div>

          <div className={`flex-1 mx-6 bg-slate-950/90 border px-4 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-inner ${
            isErrorState ? 'border-rose-800 text-rose-400' : 'border-slate-800 text-cyan-400'
          }`}>
            <div className="flex items-center space-x-2 truncate">
              {isErrorState ? <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> : <Lock className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="truncate">
                https://{isJio ? 'www.jiohotstar.com' : 'www.iiitvadodara.ac.in'}/api/{selectedSystem}/{selectedPage === 'home' ? 'home' : selectedPage}
              </span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
            isErrorState ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-800 text-cyan-300 border-slate-700'
          }`}>
            {isErrorState ? `HTTP ${latestEvent.status_code} ENFORCED` : `${securityMode} MODE`}
          </span>
        </div>

        {/* Media Preview Container */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[350px] relative">
          
          {/* ================= ERROR STATE VIEW (DISPLAY ERROR.PNG) ================= */}
          {isErrorState ? (
            <div className="w-full flex flex-col items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-rose-900/60 bg-rose-950/20 relative">
              {/* Error Image Display */}
              <img
                src="/screenshots/error.png"
                alt="Rate Limit / Security Block Error Screen"
                className="w-full max-h-[500px] object-contain rounded-xl"
              />
              
              {/* Security Banner Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-rose-800/80 shadow-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/40">
                    <AlertTriangle className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-rose-200">
                      HTTP {latestEvent.status_code} - Security Enforcement Active ({latestEvent.action})
                    </h4>
                    <p className="text-xs text-rose-300/80 font-mono mt-0.5 max-w-xl truncate">
                      {latestEvent.reason || 'Rate limit quota exceeded or suspicious behavior detected'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-rose-500 text-slate-950 shadow-lg">
                  TRAFFIC INTERRUPTED
                </span>
              </div>
            </div>
          ) : (
            /* ================= NORMAL STATE VIEW (PHOTOS & VIDEO) ================= */
            currentMedia.type === 'video' ? (
              <div className="w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 relative bg-black">
                <video
                  key={currentMedia.file}
                  src={currentMedia.file}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full max-h-[500px] object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="w-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900">
                <img
                  key={currentMedia.file}
                  src={currentMedia.file}
                  alt={`${selectedSystem} - ${selectedPage}`}
                  className="w-full max-h-[500px] object-contain rounded-xl"
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

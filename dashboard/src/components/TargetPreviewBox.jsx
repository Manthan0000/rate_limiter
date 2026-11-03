import React from 'react';
import { Tv, GraduationCap, Lock, ShieldCheck, ExternalLink, AlertTriangle, Zap, Film, Radio, Key, CreditCard, Award, ShieldAlert } from 'lucide-react';

export default function TargetPreviewBox({
  selectedSystem,
  onSelectSystem,
  selectedPage,
  onSelectPage,
  securityMode,
  onToggleSecurityMode,
  latestEvent,
}) {
  const isJio = selectedSystem === 'jiohotstar';

  const jioPages = [
    { id: 'home', label: 'HOMEPAGE', icon: Tv, file: '/screenshots/hotstar_home.jpeg', type: 'image' },
    { id: 'login', label: 'LOGIN INTERFACE', icon: Key, file: '/screenshots/hotstar_login.png', type: 'image' },
    { id: 'livestream', label: 'LIVE STREAM FEED', icon: Radio, file: '/screenshots/hotstar_stream.mp4', type: 'video' },
    { id: 'movie', label: 'FEATURE MEDIA', icon: Film, file: '/screenshots/hotstar_movie.png', type: 'image' },
  ];

  const iiitvPages = [
    { id: 'home', label: 'CAMPUS PORTAL', icon: GraduationCap, file: '/screenshots/IIITV_home.png', type: 'image' },
    { id: 'login', label: 'ERP AUTHENTICATION', icon: Key, file: '/screenshots/IIITV_login.png', type: 'image' },
    { id: 'payment', label: 'FEE GATEWAY', icon: CreditCard, file: '/screenshots/IIITV_payment.png', type: 'image' },
    { id: 'result', label: 'ACADEMIC RESULTS', icon: Award, file: '/screenshots/IIITV_result.png', type: 'image' },
  ];

  const activePages = isJio ? jioPages : iiitvPages;
  const currentMedia = activePages.find((p) => p.id === selectedPage) || activePages[0];

  const isErrorState =
    latestEvent &&
    (latestEvent.status_code === 429 ||
      latestEvent.status_code === 403 ||
      latestEvent.action === 'RATE_LIMIT' ||
      latestEvent.action === 'STRICT_RATE_LIMIT' ||
      latestEvent.action === 'BLOCK' ||
      latestEvent.action === 'STATIC_RATE_LIMIT');

  return (
    <div className="bg-surface-card border border-hairline p-6 lg:p-8 space-y-6">
      {/* Top Header & System Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-hairline gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-white inline-block"></span>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
              TARGET ENDPOINT & CLIENT EMULATION
            </h2>
          </div>
          <p className="text-xs font-light text-body mt-1 pl-5.5">
            Full-aperture interface inspection and live perimeter enforcement visualization.
          </p>
        </div>

        {/* System Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSelectSystem('jiohotstar');
              onSelectPage('home');
            }}
            className={`h-11 px-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[1.5px] transition-all cursor-pointer ${
              isJio
                ? 'bg-white text-black border border-white'
                : 'bg-canvas text-body border border-hairline hover:border-white hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>JIOHOTSTAR CLUSTER</span>
          </button>

          <button
            onClick={() => {
              onSelectSystem('iiitv');
              onSelectPage('home');
            }}
            className={`h-11 px-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[1.5px] transition-all cursor-pointer ${
              !isJio
                ? 'bg-white text-black border border-white'
                : 'bg-canvas text-body border border-hairline hover:border-white hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>IIIT VADODARA PORTAL</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Mode Toggle Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-hairline gap-4 pb-2">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-6">
          {activePages.map((p) => {
            const isActive = selectedPage === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPage(p.id)}
                className={`text-xs font-bold uppercase tracking-[1.5px] pb-3 transition-colors relative cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-body hover:text-white'
                }`}
              >
                <span>{p.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Security Policy Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => onToggleSecurityMode('STATIC')}
            className={`h-9 px-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px] transition-all cursor-pointer ${
              securityMode === 'STATIC'
                ? 'bg-white text-black border border-white'
                : 'bg-canvas text-body border border-hairline hover:border-white hover:text-white'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>STATIC (FIXED 50)</span>
          </button>

          <button
            onClick={() => onToggleSecurityMode('DYNAMIC')}
            className={`h-9 px-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px] transition-all cursor-pointer ${
              securityMode === 'DYNAMIC'
                ? 'bg-white text-black border border-white'
                : 'bg-canvas text-body border border-hairline hover:border-white hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>DYNAMIC AI SHIELD</span>
          </button>
        </div>
      </div>

      {/* Frame / Viewport */}
      <div className="bg-canvas border border-hairline overflow-hidden">
        {/* Address & Status Bar */}
        <div className="px-4 py-3 bg-surface-soft border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-white inline-block"></span>
            <div className="flex items-center gap-2 text-xs font-mono text-body truncate">
              <span className="text-muted">URI:</span>
              <span className="text-white">
                https://{isJio ? 'www.jiohotstar.com' : 'www.iiitvadodara.ac.in'}/api/{selectedSystem}/{selectedPage === 'home' ? 'home' : selectedPage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-mono uppercase px-2.5 py-1 border font-bold ${
                isErrorState
                  ? 'border-m-red text-m-red bg-canvas'
                  : 'border-white text-white bg-canvas'
              }`}
            >
              {isErrorState
                ? `HTTP ${latestEvent.status_code} · ${latestEvent.action}`
                : `HTTP 200 · ${securityMode} ENFORCED`}
            </span>
          </div>
        </div>

        {/* Visual Viewport */}
        <div className="p-4 bg-canvas min-h-[420px] flex items-center justify-center relative">
          {isErrorState ? (
            <div className="w-full flex flex-col items-center justify-center border border-hairline bg-surface-soft p-4 relative">
              <img
                src="/screenshots/error.png"
                alt="Enforcement Active"
                className="w-full max-h-[500px] object-contain"
              />
              <div className="w-full mt-4 p-4 bg-canvas border border-m-red flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 border border-m-red text-m-red shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-[1.5px] text-white">
                      PERIMETER RESTRICTION ENGAGED · HTTP {latestEvent.status_code}
                    </h4>
                    <p className="text-xs font-light text-body mt-1 leading-relaxed">
                      {latestEvent.reason || 'Telemetry quota exceeded or anomalous trajectory detected by autonomous model.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold uppercase px-3 py-1.5 border border-m-red text-m-red inline-block">
                    {latestEvent.action}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {currentMedia.type === 'video' ? (
                <div className="w-full border border-hairline bg-canvas">
                  <video
                    key={currentMedia.file}
                    src={currentMedia.file}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full max-h-[520px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-full border border-hairline bg-canvas flex items-center justify-center">
                  <img
                    key={currentMedia.file}
                    src={currentMedia.file}
                    alt={`${selectedSystem} - ${selectedPage}`}
                    className="w-full max-h-[520px] object-contain"
                  />
                </div>
              )}

              {latestEvent && latestEvent.action === 'BOOST_RATE_LIMIT' && (
                <div className="mt-4 p-4 bg-surface-soft border border-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 border border-white text-white shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-[1.5px] text-white">
                        DYNAMIC QUOTA ELEVATION ACTIVE · 100 → {latestEvent.quota || 250} RPM
                      </h4>
                      <p className="text-xs font-light text-body mt-0.5">
                        High velocity legitimate ingress verified. Zero authentication anomalies detected.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold uppercase px-3 py-1.5 border border-white text-black bg-white inline-block shrink-0">
                    BOOST ACTIVE
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

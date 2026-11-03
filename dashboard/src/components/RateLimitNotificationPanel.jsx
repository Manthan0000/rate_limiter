import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, TrendingDown, ShieldAlert, Zap, X, ArrowRight } from 'lucide-react';

function ToastNotificationItem({ toast, onDismissToast }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismissToast(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismissToast]);

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    onDismissToast(toast.id);
  };

  if (!visible) return null;

  const isIncrease = toast.change_type === 'INCREASED';
  const isZero = toast.new_quota === 0;

  return (
    <div className="pointer-events-auto bg-surface-card border border-white p-4 shadow-none flex items-start gap-4 relative">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          isIncrease ? 'bg-white' : isZero ? 'bg-m-red' : 'bg-warning'
        }`}
      />

      <div className="p-2 bg-canvas border border-hairline shrink-0 text-white">
        {isIncrease ? (
          <TrendingUp className="w-5 h-5 text-white" />
        ) : isZero ? (
          <ShieldAlert className="w-5 h-5 text-m-red" />
        ) : (
          <TrendingDown className="w-5 h-5 text-warning" />
        )}
      </div>

      <div className="flex-1 min-w-0 pl-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-[1.5px] uppercase font-mono text-white">
            {isIncrease ? 'QUOTA BOOST ADAPTATION' : isZero ? 'SECURITY QUOTA REVOKED' : 'QUOTA THROTTLE ENFORCED'}
          </span>
          <span className="text-[10px] font-mono text-muted">{toast.timestamp}</span>
        </div>

        <div className="text-sm font-bold uppercase tracking-wide text-white mt-1 flex items-center gap-2">
          <span>{toast.previous_quota} RPM</span>
          <ArrowRight className="w-3.5 h-3.5 text-muted" />
          <span className={isIncrease ? 'text-white' : isZero ? 'text-m-red' : 'text-warning'}>
            {toast.new_quota} RPM
          </span>
        </div>

        <p className="text-xs font-light text-body mt-1 leading-relaxed">
          {toast.message}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted">
          <span className="bg-canvas border border-hairline px-2 py-0.5 text-body-strong">
            CLIENT: {toast.client_id}
          </span>
          {toast.endpoint && (
            <span className="bg-canvas border border-hairline px-2 py-0.5 text-body truncate">
              {toast.endpoint}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        aria-label="Close notification"
        className="text-muted hover:text-white p-1 transition-colors shrink-0 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function RateLimitNotificationPanel({
  notifications,
  activeToasts,
  onDismissToast,
  onClearNotifications,
  latestEvent,
  securityMode,
}) {
  const currentQuota =
    securityMode === 'STATIC'
      ? 50
      : latestEvent?.quota !== undefined
      ? latestEvent.quota
      : 100;

  const currentAction =
    securityMode === 'STATIC'
      ? latestEvent?.action || 'STATIC_MODE'
      : latestEvent?.action || 'ALLOW';

  const getQuotaStatus = () => {
    if (securityMode === 'STATIC') {
      return {
        label: 'FIXED STATIC LIMIT (50 RPM)',
        desc: 'Static policy mode active. Dynamic telemetry scaling disabled.',
        accent: 'border-hairline text-body',
        barColor: 'bg-body',
      };
    }
    if (currentAction === 'BOOST_RATE_LIMIT' || currentQuota > 100) {
      return {
        label: 'DYNAMIC BOOST (+150% SURGE)',
        desc: 'Autonomous throughput elevation triggered by verified benign spike.',
        accent: 'border-white text-white',
        barColor: 'bg-white',
      };
    }
    if (currentAction === 'BLOCK' || currentQuota === 0) {
      return {
        label: 'BLOCK ENFORCED (0 RPM)',
        desc: 'Access strictly revoked due to malicious payload or critical threshold violation.',
        accent: 'border-m-red text-m-red',
        barColor: 'bg-m-red',
      };
    }
    if (currentAction === 'STRICT_RATE_LIMIT' || currentQuota <= 10) {
      return {
        label: 'STRICT THROTTLE (10 RPM)',
        desc: 'Severe bottleneck applied to mitigate high-risk anomaly.',
        accent: 'border-m-red text-m-red',
        barColor: 'bg-m-red',
      };
    }
    if (currentAction === 'RATE_LIMIT' || currentQuota <= 30) {
      return {
        label: 'RATE LIMITED (30 RPM)',
        desc: 'Controlled deceleration enforced based on risk velocity.',
        accent: 'border-warning text-warning',
        barColor: 'bg-warning',
      };
    }
    return {
      label: 'BASELINE CRUISE (100 RPM)',
      desc: 'Nominal operational envelope maintained across healthy sessions.',
      accent: 'border-hairline text-body-strong',
      barColor: 'bg-body-strong',
    };
  };

  const status = getQuotaStatus();

  return (
    <>
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {activeToasts.map((toast, idx) => (
          <ToastNotificationItem
            key={toast.id || `toast-${idx}`}
            toast={toast}
            onDismissToast={onDismissToast}
          />
        ))}
      </div>

      <div className="bg-surface-card border border-hairline p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Active Quota Gauge */}
          <div className="bg-surface-soft border border-hairline p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-body">
                    ACTIVE QUOTA LIMIT
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-hairline text-muted">
                  {securityMode}
                </span>
              </div>

              <div className="mt-6 mb-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-4xl lg:text-5xl font-bold tracking-tight text-white font-sans">
                      {currentQuota}
                    </span>
                    <span className="text-xs font-mono text-muted uppercase ml-2 tracking-wider">
                      RPM
                    </span>
                  </div>

                  {latestEvent?.previous_quota !== undefined &&
                    latestEvent.previous_quota !== currentQuota && (
                      <div className="text-xs font-mono text-body flex items-center gap-1.5 border border-hairline px-2 py-1">
                        <span>PREV: {latestEvent.previous_quota}</span>
                        {currentQuota > latestEvent.previous_quota ? (
                          <TrendingUp className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-m-red" />
                        )}
                      </div>
                    )}
                </div>

                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-[1.5px] text-white">
                    {status.label}
                  </div>
                  <p className="text-xs font-light text-body mt-1 leading-relaxed">
                    {status.desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline">
              <div className="w-full h-2 bg-canvas border border-hairline mb-2">
                <div
                  className={`h-full transition-all duration-300 ${status.barColor}`}
                  style={{
                    width: `${Math.max(4, Math.min(100, (currentQuota / 250) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-muted uppercase">
                <span>0 (BLOCK)</span>
                <span>10</span>
                <span>30</span>
                <span>100 (BASE)</span>
                <span>250 (BOOST)</span>
              </div>
            </div>
          </div>

          {/* AI Rate Limit Adaptation Log */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-white" />
                  <h3 className="text-base font-bold uppercase tracking-[1.5px] text-white">
                    AUTONOMOUS ADAPTATION TELEMETRY
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-hairline text-body">
                    {notifications.length} EVENTS
                  </span>
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-[11px] font-bold tracking-[1.5px] uppercase text-muted hover:text-white transition-colors cursor-pointer"
                  >
                    CLEAR LOG
                  </button>
                )}
              </div>

              <div className="overflow-y-auto max-h-[260px] pr-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-xs font-light text-muted border border-dashed border-hairline">
                    NO ADAPTIVE RATE SHIFTS RECORDED YET. TRIGGER TRAFFIC SCENARIOS ABOVE TO OBSERVE AUTONOMOUS QUOTA SCALING.
                  </div>
                ) : (
                  notifications.map((notif, idx) => {
                    const isIncrease = notif.change_type === 'INCREASED';
                    const isZero = notif.new_quota === 0;

                    return (
                      <div
                        key={notif.id || idx}
                        className="p-3 bg-surface-soft border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-2 h-2 shrink-0 ${
                              isIncrease ? 'bg-white' : isZero ? 'bg-m-red' : 'bg-warning'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap font-mono">
                              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                                {notif.previous_quota} → {notif.new_quota} RPM
                              </span>
                              <span className="text-muted text-[10px]">
                                [{notif.client_id}]
                              </span>
                              {notif.endpoint && (
                                <span className="text-body text-[10px] truncate max-w-xs">
                                  {notif.endpoint}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-light text-body mt-0.5">
                              {notif.message}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-muted shrink-0 self-end sm:self-center">
                          {notif.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-[11px] text-muted">
              <span className="font-light">ODDA FEEDBACK VELOCITY: SUB-50MS AGENTIC RESOLUTION</span>
              <span className="font-mono uppercase text-body-strong">PROTOCOL: RFC 6585</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

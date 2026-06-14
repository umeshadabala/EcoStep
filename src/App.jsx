import { useState, useCallback } from 'react';
import Onboarding from './components/Onboarding';
import CityView from './components/CityView';
import DailyCheckin from './components/DailyCheckin';
import InsightsPanel from './components/InsightsPanel';
import ProgressTab from './components/ProgressTab';
import MissionsTab from './components/MissionsTab';
import ShareCard from './components/ShareCard';
import ConfirmDialog from './components/ConfirmDialog';
import ErrorBoundary from './components/ErrorBoundary';
import {
  getStreak,
  getLoggedDaysCount,
  formatDate,
  calculateDailyScore,
  safeLocalGet,
} from './utils/scoring';

function AppContent() {
  const [profile, setProfile] = useState(() =>
    safeLocalGet('ecostep_profile'),
  );

  const [activeTab, setActiveTab] = useState('city');
  const [showCheckin, setShowCheckin] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const announce = useCallback((msg) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(''), 3000);
  }, []);

  const todayStr = formatDate(new Date());
  const todayLogKey = `ecostep_log_${todayStr}`;
  const todayLogged = !!localStorage.getItem(todayLogKey);
  const todayScore = (() => {
    const log = safeLocalGet(todayLogKey);
    return log ? calculateDailyScore(log) : 0;
  })();

  const streak = getStreak();
  const daysLogged = getLoggedDaysCount();

  const handleCheckinClose = useCallback(() => {
    setShowCheckin(false);
    refresh();
    announce('Daily log saved');
  }, [refresh, announce]);

  const handleConfirmReset = useCallback(() => {
    localStorage.clear();
    setProfile(null);
    setActiveTab('city');
    setShowConfirmReset(false);
    refresh();
  }, [refresh]);

  if (!profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />;
  }

  const tabs = [
    { id: 'city', icon: '🏙️', label: 'City' },
    { id: 'progress', icon: '📈', label: 'Analytics' },
    { id: 'missions', icon: '🎯', label: 'Missions' },
  ];

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between"
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      {/* Accessible live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Top App Bar */}
      <header
        className="bg-slate-900/80 backdrop-blur-lg sticky top-0 z-30 border-b border-white/5 shadow-md w-full"
        role="banner"
      >
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-2xl">🛺</span>
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase flex items-center gap-1.5">
                EcoStep: Carbon City
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                {profile.city}, India
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <span
                aria-label={`${streak} ${streak === 1 ? 'day' : 'days'} streak`}
                className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-500/20 px-3 py-1.5 rounded-full flex items-center gap-1"
              >
                <span aria-hidden="true">🔥</span>
                {streak} {streak === 1 ? 'day streak' : 'days streak'}
              </span>
            )}
            <button
              id="share-postcard-btn"
              onClick={() => setShowShare(true)}
              aria-label="Share your EcoStep postcard"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm flex items-center gap-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <span aria-hidden="true">📤</span>
              <span className="hidden sm:inline">Share Postcard</span>
            </button>
            <button
              id="reset-app-btn"
              onClick={() => setShowConfirmReset(true)}
              aria-label="Reset all EcoStep data"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <span aria-hidden="true">🔄</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main
        id="main-content"
        className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6"
        key={refreshKey}
      >
        {/* Desktop Dashboard Grid (md and above) */}
        <div className="hidden md:grid grid-cols-12 gap-6 items-start">
          {/* Left panel */}
          <div className="col-span-7 lg:col-span-8 space-y-5">
            <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
              <CityView />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4" role="region" aria-label="Today's carbon footprint stats">
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest" id="stat-footprint-label">
                  Today's Footprint
                </span>
                <span
                  className="text-xl font-extrabold text-white mt-1"
                  aria-labelledby="stat-footprint-label"
                >
                  {todayScore.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-white/50">kg CO₂</span>
                </span>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest" id="stat-days-label">
                  Days Logged
                </span>
                <span
                  className="text-xl font-extrabold text-white mt-1"
                  aria-labelledby="stat-days-label"
                >
                  {daysLogged} / 7{' '}
                  <span className="text-xs font-normal text-white/50">this week</span>
                </span>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest" id="stat-streak-label">
                  Active Streak
                </span>
                <span
                  className="text-xl font-extrabold text-amber-400 mt-1 flex items-center gap-1"
                  aria-labelledby="stat-streak-label"
                  aria-label={`${streak} day streak`}
                >
                  <span aria-hidden="true">🔥</span> {streak}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Daily Activity Log
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Keep your daily logs updated to see city changes and unlock rewards.
                </p>
              </div>
              <div className="flex gap-3">
                {!todayLogged ? (
                  <button
                    id="log-footprint-btn"
                    onClick={() => setShowCheckin(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    📝 Log Today's Footprint
                  </button>
                ) : (
                  <>
                    <button
                      id="update-logs-btn"
                      onClick={() => setShowCheckin(true)}
                      className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                      ✏️ Update Logs
                    </button>
                    {daysLogged >= 3 && (
                      <button
                        id="view-insights-btn"
                        onClick={() => setShowInsights(true)}
                        className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/15 transition-all text-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                      >
                        📊 View Insights
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="col-span-5 lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
              <ProgressTab />
            </div>
            <div className="bg-slate-900 border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
              <MissionsTab />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {activeTab === 'city' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden relative shadow-lg">
                <CityView />
              </div>

              <div className="grid grid-cols-2 gap-3" role="region" aria-label="Today's stats">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest" id="m-stat-footprint">
                    Today's Footprint
                  </span>
                  <span className="text-xl font-extrabold text-white mt-1" aria-labelledby="m-stat-footprint">
                    {todayScore.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-white/50">kg</span>
                  </span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest" id="m-stat-days">
                    Days Logged
                  </span>
                  <span className="text-xl font-extrabold text-white mt-1" aria-labelledby="m-stat-days">
                    {daysLogged} / 7{' '}
                    <span className="text-xs font-normal text-white/50">days</span>
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {!todayLogged ? (
                  <button
                    id="m-log-footprint-btn"
                    onClick={() => setShowCheckin(true)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-base hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                  >
                    📝 Log Indian Footprint
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      id="m-update-logs-btn"
                      onClick={() => setShowCheckin(true)}
                      className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950"
                    >
                      ✏️ Update Daily Logs
                    </button>
                    {daysLogged >= 3 && (
                      <button
                        id="m-view-insights-btn"
                        onClick={() => setShowInsights(true)}
                        className="flex-1 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/15 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                      >
                        📊 View Insights
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'progress' && <ProgressTab />}
          {activeTab === 'missions' && <MissionsTab />}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav
        aria-label="Main navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/5 z-30"
      >
        <div className="max-w-md mx-auto flex py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              aria-label={tab.label}
              className={`flex-1 flex flex-col items-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg ${
                activeTab === tab.id
                  ? 'text-emerald-400 font-bold'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <span aria-hidden="true" className="text-lg">{tab.icon}</span>
              <span className="text-[10px] tracking-wide uppercase font-semibold">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modals */}
      {showCheckin && (
        <DailyCheckin onClose={handleCheckinClose} />
      )}
      {showInsights && (
        <InsightsPanel onClose={() => setShowInsights(false)} />
      )}
      {showShare && (
        <ShareCard onClose={() => setShowShare(false)} />
      )}
      {showConfirmReset && (
        <ConfirmDialog
          title="Reset All Data?"
          message="This will permanently clear your profile and all daily logs. This action cannot be undone."
          onConfirm={handleConfirmReset}
          onCancel={() => setShowConfirmReset(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

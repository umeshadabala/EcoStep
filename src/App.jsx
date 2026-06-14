import { useState, useCallback } from 'react';
import Onboarding from './components/Onboarding';
import CityView from './components/CityView';
import DailyCheckin from './components/DailyCheckin';
import InsightsPanel from './components/InsightsPanel';
import ProgressTab from './components/ProgressTab';
import MissionsTab from './components/MissionsTab';
import ShareCard from './components/ShareCard';
import { getStreak, getLoggedDaysCount, formatDate, calculateDailyScore } from './utils/scoring';

function App() {
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ecostep_profile'));
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('city');
  const [showCheckin, setShowCheckin] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const todayStr = formatDate(new Date());
  const todayLogKey = `ecostep_log_${todayStr}`;
  const todayLogged = !!localStorage.getItem(todayLogKey);
  const todayScore = (() => {
    try {
      const log = JSON.parse(localStorage.getItem(todayLogKey));
      return log ? calculateDailyScore(log) : 0;
    } catch {
      return 0;
    }
  })();

  const streak = getStreak();
  const daysLogged = getLoggedDaysCount();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all EcoStep data? This will clear your profile and daily logs.')) {
      localStorage.clear();
      setProfile(null);
      setActiveTab('city');
      refresh();
    }
  };

  if (!profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Top App Bar */}
      <header className="bg-slate-900/80 backdrop-blur-lg sticky top-0 z-30 border-b border-white/5 shadow-md w-full">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛺</span>
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase flex items-center gap-1.5">
                EcoStep: Carbon City
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">{profile.city}, India</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-500/20 px-3 py-1.5 rounded-full flex items-center gap-1">
                🔥 {streak} {streak === 1 ? 'day streak' : 'days streak'}
              </span>
            )}
            <button
              onClick={() => setShowShare(true)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm flex items-center gap-1.5 font-semibold"
              title="Share Postcard"
            >
              <span>📤</span>
              <span className="hidden sm:inline">Share Postcard</span>
            </button>
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all text-sm"
              title="Reset App Data"
            >
              🔄
            </button>
          </div>
        </div>
      </header>

      {/* Main Body - Fully Responsive Layout */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6" key={refreshKey}>
        {/* Desktop Dashboard Grid (md and above) */}
        <div className="hidden md:grid grid-cols-12 gap-6 items-start">
          {/* Left panel: City and Actions (8 cols) */}
          <div className="col-span-7 lg:col-span-8 space-y-5">
            <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
              <CityView />
            </div>

            {/* Stats and Action Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Today's Footprint</span>
                <span className="text-xl font-extrabold text-white mt-1">
                  {todayScore.toFixed(1)} <span className="text-xs font-normal text-white/50">kg CO₂</span>
                </span>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Days Logged</span>
                <span className="text-xl font-extrabold text-white mt-1">
                  {daysLogged} / 7 <span className="text-xs font-normal text-white/50">this week</span>
                </span>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Streak</span>
                <span className="text-xl font-extrabold text-amber-400 mt-1 flex items-center gap-1">
                  🔥 {streak}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Activity Log</h3>
                <p className="text-xs text-white/50 mt-1">Keep your daily logs updated to see city changes and unlock rewards.</p>
              </div>
              <div className="flex gap-3">
                {!todayLogged ? (
                  <button
                    onClick={() => setShowCheckin(true)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] text-sm"
                  >
                    📝 Log Today's Footprint
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowCheckin(true)}
                      className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-sm"
                    >
                      ✏️ Update Logs
                    </button>
                    {daysLogged >= 3 && (
                      <button
                        onClick={() => setShowInsights(true)}
                        className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/15 transition-all text-sm flex items-center gap-1.5"
                      >
                        📊 View Insights
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Analytics and Missions side-by-side or stacked (4 or 5 cols) */}
          <div className="col-span-5 lg:col-span-4 space-y-6">
            {/* Analytics Section */}
            <div className="bg-slate-900 border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
              <ProgressTab />
            </div>

            {/* Missions Section */}
            <div className="bg-slate-900 border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
              <MissionsTab />
            </div>
          </div>
        </div>

        {/* Mobile View Layout (sm and down) */}
        <div className="md:hidden">
          {activeTab === 'city' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden relative shadow-lg">
                <CityView />
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Today's Footprint</span>
                  <span className="text-xl font-extrabold text-white mt-1">
                    {todayScore.toFixed(1)} <span className="text-xs font-normal text-white/50">kg</span>
                  </span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Days Logged</span>
                  <span className="text-xl font-extrabold text-white mt-1">
                    {daysLogged} / 7 <span className="text-xs font-normal text-white/50">days</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!todayLogged ? (
                  <button
                    onClick={() => setShowCheckin(true)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-base hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                  >
                    📝 Log Indian Footprint
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCheckin(true)}
                      className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-sm"
                    >
                      ✏️ Update Daily Logs
                    </button>
                    {daysLogged >= 3 && (
                      <button
                        onClick={() => setShowInsights(true)}
                        className="flex-1 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/15 transition-all text-sm"
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

      {/* Bottom Sticky Navigation (Visible on mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/5 z-30">
        <div className="max-w-md mx-auto flex py-2">
          {[
            { id: 'city', icon: '🏙️', label: 'City' },
            { id: 'progress', icon: '📈', label: 'Analytics' },
            { id: 'missions', icon: '🎯', label: 'Missions' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-emerald-400 font-bold' : 'text-white/40 hover:text-white/60'}`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] tracking-wide uppercase font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* App Modals */}
      {showCheckin && <DailyCheckin onClose={() => { setShowCheckin(false); refresh(); }} />}
      {showInsights && <InsightsPanel onClose={() => setShowInsights(false)} />}
      {showShare && <ShareCard onClose={() => setShowShare(false)} />}
    </div>
  );
}

export default App;

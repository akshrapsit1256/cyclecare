import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import AiWellness from './pages/AiWellness';
import Profile from './pages/Profile';
import { 
  getCycleStatus, 
  getCheckinForDate, 
  getPreferences, 
  getLatestAiWellness, 
  getAiStatus 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cycleStatus, setCycleStatus] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [latestAiWellness, setLatestAiWellness] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAllData = async () => {
    try {
      const [cycleRes, checkinRes, prefRes, aiRes, ollamaRes] = await Promise.allSettled([
        getCycleStatus(),
        getCheckinForDate(),
        getPreferences(),
        getLatestAiWellness(),
        getAiStatus()
      ]);

      if (cycleRes.status === 'fulfilled') setCycleStatus(cycleRes.value);
      if (checkinRes.status === 'fulfilled') setTodayCheckin(checkinRes.value);
      if (prefRes.status === 'fulfilled') setPreferences(prefRes.value);
      if (aiRes.status === 'fulfilled') setLatestAiWellness(aiRes.value);
      if (ollamaRes.status === 'fulfilled') setOllamaStatus(ollamaRes.value);
    } catch (err) {
      console.error("Initialization error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleRefreshOllama = async () => {
    try {
      const status = await getAiStatus();
      setOllamaStatus(status);
    } catch (err) {
      console.error("Failed to check Ollama status:", err);
    }
  };

  return (
    <div className="app-container">
      <DisclaimerBanner />
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        ollamaStatus={ollamaStatus}
        onRefreshOllama={handleRefreshOllama}
      />

      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <p>Loading CycleCare companion...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                cycleStatus={cycleStatus}
                todayCheckin={todayCheckin}
                latestAiWellness={latestAiWellness}
                setActiveTab={setActiveTab}
                onGenerateAi={() => setActiveTab('ai')}
              />
            )}

            {activeTab === 'checkin' && (
              <CheckIn
                onCheckinSaved={(newCheckin) => {
                  setTodayCheckin(newCheckin);
                }}
              />
            )}

            {activeTab === 'ai' && (
              <AiWellness
                cycleStatus={cycleStatus}
                todayCheckin={todayCheckin}
                preferences={preferences}
                latestAiWellness={latestAiWellness}
                onWellnessGenerated={(plan) => setLatestAiWellness(plan)}
                ollamaStatus={ollamaStatus}
              />
            )}

            {activeTab === 'profile' && (
              <Profile
                cycleStatus={cycleStatus}
                preferences={preferences}
                onCycleUpdated={(updated) => setCycleStatus(updated)}
                onPreferencesUpdated={(updated) => setPreferences(updated)}
              />
            )}
          </>
        )}
      </main>

      <footer style={{ 
        borderTop: '1px solid var(--border-light)', 
        background: '#ffffff', 
        padding: '1.25rem 1rem', 
        textAlign: 'center', 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)' 
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>CycleCare</strong> — Built for DEV / Hacktoberfest 2026 "Build for a Friend"
          </div>
          <div>
            Open-source AI (Ollama) &bull; Local SQLite &bull; Privacy-first
          </div>
        </div>
      </footer>
    </div>
  );
}

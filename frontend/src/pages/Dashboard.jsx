import React from 'react';
import { Calendar, Sparkles, HeartPulse, ArrowRight, ShieldCheck, SunMedium } from 'lucide-react';
import CycleWheel from '../components/CycleWheel';

export default function Dashboard({ 
  cycleStatus, 
  todayCheckin, 
  latestAiWellness, 
  setActiveTab, 
  onGenerateAi 
}) {
  const isConfigured = cycleStatus?.is_configured;
  const currentPhase = cycleStatus?.current_phase || 'Menstrual';
  const cycleDay = cycleStatus?.current_cycle_day || 1;
  const cycleLength = cycleStatus?.average_cycle_length || 28;
  const nextPeriod = cycleStatus?.estimated_next_period_date;
  const daysSince = cycleStatus?.days_since_last_period ?? 0;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Welcome to CycleCare</h1>
          <p className="page-description">
            Your private, locally powered companion for understanding your cycle rhythms and nurturing your daily wellness.
          </p>
        </div>
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={() => setActiveTab('ai')}
        >
          <Sparkles size={16} /> Get Today's AI Guidance
        </button>
      </div>

      {!isConfigured && (
        <div className="toast-alert info" style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
          <div>
            <strong>Get Started:</strong> Enter the first day of your last period and cycle length to personalize your dashboard.
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => setActiveTab('profile')}
          >
            Set Up Cycle
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Cycle Overview Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">
              <HeartPulse size={20} color="var(--rose-primary)" />
              Cycle Overview
            </span>
            <span className={`phase-tag ${currentPhase}`}>
              {currentPhase} Phase
            </span>
          </div>
          <p className="card-subtitle">
            {cycleStatus?.phase_description || 'Tracking your natural hormonal rhythm day by day.'}
          </p>

          <CycleWheel 
            currentDay={cycleDay}
            totalDays={cycleLength}
            phase={currentPhase}
            progressPercent={cycleStatus?.cycle_progress_percent}
          />

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.75rem', 
            background: 'var(--bg-card-subtle)', 
            padding: '0.85rem', 
            borderRadius: 'var(--radius-md)',
            marginTop: '0.75rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Next Period</div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {nextPeriod ? new Date(nextPeriod).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Days Since Last Period</div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {daysSince} {daysSince === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Symptoms Check-in & AI Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Today's Check-in Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">
                <Calendar size={18} color="var(--sage-accent)" />
                Today's Check-in
              </span>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                onClick={() => setActiveTab('checkin')}
              >
                {todayCheckin ? 'Update Log' : 'Check In'}
              </button>
            </div>
            
            {todayCheckin ? (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Mood: </span>
                    <strong>{todayCheckin.mood || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Energy: </span>
                    <strong>{todayCheckin.energy_level}/5</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Logged Symptoms:</div>
                <div className="chip-grid">
                  {todayCheckin.symptoms && todayCheckin.symptoms.length > 0 ? (
                    todayCheckin.symptoms.map((symp) => (
                      <span 
                        key={symp} 
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '0.25rem 0.65rem', 
                          background: 'var(--rose-soft)', 
                          color: 'var(--rose-primary)', 
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 500
                        }}
                      >
                        {symp}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No symptoms reported today</span>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <p>You haven't recorded your symptoms or mood for today yet.</p>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ marginTop: '0.85rem', fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                  onClick={() => setActiveTab('checkin')}
                >
                  Record Today's Symptoms
                </button>
              </div>
            )}
          </div>

          {/* AI Guidance Highlight Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf3f6 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">
                <Sparkles size={18} color="var(--rose-primary)" />
                AI Wellness Insight
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {latestAiWellness ? `Via ${latestAiWellness.source === 'ollama' ? 'Local Ollama' : 'Knowledge Base'}` : ''}
              </span>
            </div>

            {latestAiWellness ? (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ 
                  fontStyle: 'italic', 
                  fontSize: '0.92rem', 
                  color: 'var(--mauve-accent)', 
                  borderLeft: '3px solid var(--rose-primary)', 
                  paddingLeft: '0.75rem',
                  marginBottom: '1rem' 
                }}>
                  "{latestAiWellness.gentle_guidance}"
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  <strong>Hydration: </strong> {latestAiWellness.wellness_suggestions?.hydration_reminder}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => setActiveTab('ai')}
                  >
                    View All AI Meals & Suggestions <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <p>Generate personalized self-care and meal ideas tailored to your {currentPhase} phase and symptoms.</p>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ marginTop: '0.85rem', fontSize: '0.85rem' }}
                  onClick={() => setActiveTab('ai')}
                >
                  <Sparkles size={14} /> Get AI Wellness Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Footer Note */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.6rem', 
        color: 'var(--text-muted)', 
        fontSize: '0.82rem', 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-light)', 
        padding: '0.85rem 1.25rem', 
        borderRadius: 'var(--radius-md)' 
      }}>
        <ShieldCheck size={18} color="var(--sage-accent)" />
        <span>
          <strong>100% Private & Local:</strong> Your cycle logs and food preferences reside strictly on this machine in SQLite. No tracking, no external clouds, no third-party APIs.
        </span>
      </div>
    </div>
  );
}

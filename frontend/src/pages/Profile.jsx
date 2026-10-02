import React, { useState, useEffect } from 'react';
import { User, Calendar, Utensils, Shield, CheckCircle2, Save, Heart } from 'lucide-react';
import { updateCycleSettings, updatePreferences } from '../services/api';

const DIETARY_OPTIONS = [
  'No preference',
  'Vegetarian',
  'Non-vegetarian',
  'Vegan',
  'High-protein',
  'Light meals',
  'Indian food'
];

export default function Profile({ 
  cycleStatus, 
  preferences, 
  onCycleUpdated, 
  onPreferencesUpdated 
}) {
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [dietaryPreference, setDietaryPreference] = useState('No preference');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [wellnessGoals, setWellnessGoals] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (cycleStatus) {
      setLastPeriodDate(cycleStatus.last_period_date || '');
      setCycleLength(cycleStatus.average_cycle_length || 28);
    }
  }, [cycleStatus]);

  useEffect(() => {
    if (preferences) {
      setDietaryPreference(preferences.dietary_preference || 'No preference');
      setDietaryRestrictions(preferences.dietary_restrictions || '');
      setWellnessGoals(preferences.wellness_goals || '');
    }
  }, [preferences]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      let updatedCycle = null;
      if (lastPeriodDate) {
        updatedCycle = await updateCycleSettings({
          last_period_date: lastPeriodDate,
          average_cycle_length: Number(cycleLength)
        });
        if (onCycleUpdated) onCycleUpdated(updatedCycle);
      }

      const updatedPrefs = await updatePreferences({
        dietary_preference: dietaryPreference,
        dietary_restrictions: dietaryRestrictions.trim(),
        wellness_goals: wellnessGoals.trim()
      });
      if (onPreferencesUpdated) onPreferencesUpdated(updatedPrefs);

      setFeedback({ type: 'success', message: 'Cycle settings and preferences updated successfully!' });
    } catch (err) {
      setFeedback({ type: 'warning', message: err.message || 'Error updating settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile & Preferences</h1>
        <p className="page-description">
          Customize your cycle configuration and dietary needs. These details guide the AI in suggesting phase-aligned meals.
        </p>
      </div>

      {feedback && (
        <div className={`toast-alert ${feedback.type}`}>
          <CheckCircle2 size={18} />
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          {/* Cycle Parameters Card */}
          <div className="card">
            <div className="card-title">
              <Calendar size={18} color="var(--rose-primary)" />
              Cycle Configuration
            </div>
            <p className="card-subtitle">
              Used to calculate estimated phases and next period projection.
            </p>

            <div className="form-group">
              <label className="form-label">
                First Day of Last Period
                <span className="form-help">Enter the start date of your most recent menstruation</span>
              </label>
              <input
                type="date"
                required
                className="form-input"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Average Cycle Length: {cycleLength} days
                </label>
              </div>
              <span className="form-help">Typical range is between 21 and 40 days</span>
              <input
                type="range"
                min={21}
                max={45}
                step={1}
                value={cycleLength}
                onChange={(e) => setCycleLength(e.target.value)}
                style={{ width: '100%', marginTop: '0.6rem', accentColor: 'var(--rose-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>21 days</span>
                <span>28 days (avg)</span>
                <span>45 days</span>
              </div>
            </div>
          </div>

          {/* Food & Wellness Preferences */}
          <div className="card">
            <div className="card-title">
              <Utensils size={18} color="var(--sage-accent)" />
              Nutrition & Goals
            </div>
            <p className="card-subtitle">
              Your dietary preferences are fed into the AI meal generator.
            </p>

            <div className="form-group">
              <label className="form-label">Food Preference</label>
              <div className="chip-grid">
                {DIETARY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`chip-btn ${dietaryPreference === opt ? 'selected' : ''}`}
                    onClick={() => setDietaryPreference(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Dietary Restrictions / Allergies
                <span className="form-help">e.g. Gluten-free, dairy-free, low FODMAP, nut allergy</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="None or list restrictions..."
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                General Wellness Goal
                <span className="form-help">e.g. Ease cramps, reduce fatigue, steady mood</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Boost afternoon energy and ease cramps"
                value={wellnessGoals}
                onChange={(e) => setWellnessGoals(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings & Preferences'}
          </button>
        </div>
      </form>

      {/* Privacy Manifesto */}
      <div className="card" style={{ background: '#fdfbfa', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', color: 'var(--text-main)', fontWeight: 600 }}>
          <Shield size={20} color="var(--sage-accent)" />
          Privacy Philosophy of CycleCare
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          CycleCare was built specifically for privacy-sensitive personal wellness tracking.
          Everything you log — including your cycle dates, physical symptoms, and food preferences — is stored entirely inside an open SQLite database (<code>cyclecare.db</code>) on your local hard drive. No telemetries, no third-party marketing cookies, and no cloud data brokers.
        </p>
      </div>
    </div>
  );
}

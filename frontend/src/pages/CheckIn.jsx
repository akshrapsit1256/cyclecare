import React, { useState, useEffect } from 'react';
import { CalendarCheck, Save, CheckCircle2, History, Smile, Zap, FileText } from 'lucide-react';
import { saveCheckin, getCheckinForDate, getCheckinHistory } from '../services/api';

const AVAILABLE_SYMPTOMS = [
  'cramps',
  'bloating',
  'headache',
  'fatigue',
  'mood changes',
  'back discomfort',
  'cravings',
  'low energy',
  'breast tenderness',
  'nausea',
  'restlessness'
];

const MOOD_OPTIONS = [
  { label: 'Calm', emoji: '🌿' },
  { label: 'Energetic', emoji: '⚡' },
  { label: 'Content', emoji: '✨' },
  { label: 'Sensitive', emoji: '🌸' },
  { label: 'Irritable', emoji: '🌩️' },
  { label: 'Anxious', emoji: '💭' },
  { label: 'Exhausted', emoji: '🌙' }
];

export default function CheckIn({ onCheckinSaved }) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);

  // Load check-in for the chosen date
  useEffect(() => {
    loadDateData(selectedDate);
    loadHistory();
  }, [selectedDate]);

  const loadDateData = async (dateStr) => {
    try {
      const data = await getCheckinForDate(dateStr);
      if (data) {
        setSelectedSymptoms(data.symptoms || []);
        setSelectedMood(data.mood || 'Calm');
        setEnergyLevel(data.energy_level || 3);
        setNotes(data.notes || '');
      } else {
        setSelectedSymptoms([]);
        setSelectedMood('Calm');
        setEnergyLevel(3);
        setNotes('');
      }
    } catch (err) {
      console.error("Failed to load date checkin:", err);
    }
  };

  const loadHistory = async () => {
    try {
      const list = await getCheckinHistory(10);
      setHistory(list || []);
    } catch (err) {
      console.error("Failed to load checkin history:", err);
    }
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const saved = await saveCheckin({
        date: selectedDate,
        symptoms: selectedSymptoms,
        mood: selectedMood,
        energy_level: energyLevel,
        notes: notes.trim() || null
      });

      setFeedback({ type: 'success', message: 'Daily check-in saved securely in your local database.' });
      loadHistory();
      if (onCheckinSaved) onCheckinSaved(saved);
    } catch (err) {
      setFeedback({ type: 'warning', message: err.message || 'Failed to save check-in.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Daily Symptom Check-in</h1>
        <p className="page-description">
          Record how your body and mind feel today. These signals help personalize your AI meal and self-care recommendations.
        </p>
      </div>

      {feedback && (
        <div className={`toast-alert ${feedback.type}`}>
          <CheckCircle2 size={18} />
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          {/* Date Selector */}
          <div className="form-group" style={{ maxWidth: '240px' }}>
            <label className="form-label">Check-in Date</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
            />
          </div>

          {/* Symptoms Selection */}
          <div className="form-group">
            <label className="form-label">
              Physical Symptoms
              <span className="form-help">Select all that apply to you today</span>
            </label>
            <div className="chip-grid">
              {AVAILABLE_SYMPTOMS.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    className={`chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    <span>{symptom}</span>
                    {isSelected && <CheckCircle2 size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Selection */}
          <div className="form-group">
            <label className="form-label">
              Current Mood
              <span className="form-help">How is your emotional landscape right now?</span>
            </label>
            <div className="chip-grid">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMood === mood.label;
                return (
                  <button
                    key={mood.label}
                    type="button"
                    className={`chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedMood(mood.label)}
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Energy Rating */}
          <div className="form-group">
            <label className="form-label">
              Energy Level: {energyLevel} / 5
              <span className="form-help">1 = Very Low / Drained, 3 = Balanced, 5 = High Vitality</span>
            </label>
            <div className="energy-selector">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`energy-btn ${energyLevel === lvl ? 'selected' : ''}`}
                  onClick={() => setEnergyLevel(lvl)}
                >
                  <Zap size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Reflections / Notes */}
          <div className="form-group">
            <label className="form-label">
              Personal Notes (Optional)
              <span className="form-help">Any notes on sleep, cravings, or what your body needs today</span>
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Slept lightly last night, craving warm soups, taking things slower today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Saving locally...' : 'Save Check-in'}
            </button>
          </div>
        </div>
      </form>

      {/* History Log */}
      {history.length > 0 && (
        <div className="card">
          <div className="card-title">
            <History size={18} color="var(--mauve-accent)" />
            Recent Check-in History
          </div>
          <p className="card-subtitle">Your locally stored symptom trends over recent days.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.85rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.8rem' }}>
                    <span>Mood: <strong>{item.mood}</strong></span>
                    <span>Energy: <strong>{item.energy_level}/5</strong></span>
                  </div>
                </div>

                {item.symptoms && item.symptoms.length > 0 ? (
                  <div className="chip-grid" style={{ marginTop: '0.35rem' }}>
                    {item.symptoms.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.5rem',
                          background: '#ffffff',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-main)'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No symptoms reported</span>
                )}

                {item.notes && (
                  <div style={{ fontSize: '0.82rem', fontStyle: 'italic', marginTop: '0.45rem', color: 'var(--text-muted)' }}>
                    "{item.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

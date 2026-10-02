import React, { useState } from 'react';
import { 
  Sparkles, 
  Utensils, 
  Heart, 
  Droplet, 
  Activity, 
  Moon, 
  Cpu, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { generateAiWellness } from '../services/api';

export default function AiWellness({ 
  cycleStatus, 
  todayCheckin, 
  preferences, 
  latestAiWellness, 
  onWellnessGenerated,
  ollamaStatus 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(latestAiWellness);

  const currentPhase = cycleStatus?.current_phase || 'Menstrual';
  const cycleDay = cycleStatus?.current_cycle_day || 1;
  const symptoms = todayCheckin?.symptoms || [];
  const dietPref = preferences?.dietary_preference || 'No preference';
  const dietRestr = preferences?.dietary_restrictions || '';

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateAiWellness({
        cycle_phase: currentPhase,
        cycle_day: cycleDay,
        symptoms: symptoms,
        dietary_preference: dietPref,
        dietary_restrictions: dietRestr,
        wellness_goals: preferences?.wellness_goals || ''
      });
      setPlan(data);
      if (onWellnessGenerated) onWellnessGenerated(data);
    } catch (err) {
      setError(err.message || 'Failed to generate wellness recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const isOllamaOnline = ollamaStatus?.status === 'online';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Personalized AI Wellness & Meals</h1>
          <p className="page-description">
            Thoughtful daily suggestions crafted for your current cycle phase, logged symptoms, and dietary preferences.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={loading}
          style={{ minWidth: '200px' }}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
              Consulting CycleCare...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {plan ? 'Regenerate Suggestions' : 'Generate Suggestions'}
            </>
          )}
        </button>
      </div>

      {/* Input Parameters Summary Strip */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg-card-subtle)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.86rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Phase: </span>
              <span className={`phase-tag ${currentPhase}`}>{currentPhase} (Day {cycleDay})</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Diet: </span>
              <strong>{dietPref}</strong>
              {dietRestr ? ` (${dietRestr})` : ''}
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Symptoms: </span>
              <strong>{symptoms.length > 0 ? symptoms.join(', ') : 'None logged today'}</strong>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: isOllamaOnline ? 'var(--sage-accent)' : 'var(--text-muted)' }}>
            <Cpu size={14} />
            <span>{isOllamaOnline ? 'Local Ollama Ready' : 'Offline Knowledge-Base Mode'}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="toast-alert warning" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* AI Output View */}
      {plan ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Engine & Source Banner */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: plan.source === 'ollama' ? 'var(--sage-soft)' : 'var(--amber-soft)',
            border: `1px solid ${plan.source === 'ollama' ? 'var(--sage-border)' : 'var(--amber-border)'}`,
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            color: plan.source === 'ollama' ? 'var(--sage-accent)' : 'var(--amber-accent)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={16} />
              <span>
                {plan.source === 'ollama'
                  ? `Generated by local open-source model: ${plan.model_used}`
                  : 'Generated via CycleCare Built-in Wellness Knowledge-Base'}
              </span>
            </div>
            {plan.source !== 'ollama' && (
              <span style={{ fontSize: '0.78rem' }}>Tip: Run <code>ollama run gemma2:2b</code> to enable local LLM</span>
            )}
          </div>

          {/* Gentle Guidance Highlight */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #f6eff4 100%)', border: '1px solid var(--rose-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--rose-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
              <Heart size={18} />
              Gentle Guidance for Today
            </div>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.6' }}>
              "{plan.gentle_guidance}"
            </p>
          </div>

          {/* Today's Self-Care & Lifestyle Suggestions */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--rose-primary)" />
              Today's Self-Care Suggestions
            </h2>
            <div className="grid-3">
              {/* Daily Self Care List */}
              <div className="card">
                <div className="card-title" style={{ color: 'var(--rose-primary)' }}>
                  <Heart size={18} />
                  Nurturing Practices
                </div>
                <ul style={{ paddingLeft: '1.1rem', marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                  {plan.wellness_suggestions?.self_care?.map((tip, idx) => (
                    <li key={idx} style={{ marginBottom: '0.45rem' }}>{tip}</li>
                  )) || <li>Listen to your physical signals and rest when required.</li>}
                </ul>
              </div>

              {/* Hydration & Movement */}
              <div className="card">
                <div className="card-title" style={{ color: 'var(--amber-accent)' }}>
                  <Droplet size={18} />
                  Hydration Reminder
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.75rem', lineHeight: '1.55' }}>
                  {plan.wellness_suggestions?.hydration_reminder}
                </p>

                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  <div className="card-title" style={{ color: 'var(--sage-accent)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                    <Activity size={16} />
                    Gentle Activity
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                    {plan.wellness_suggestions?.activity_suggestion}
                  </p>
                </div>
              </div>

              {/* Sleep & Rest */}
              <div className="card">
                <div className="card-title" style={{ color: 'var(--mauve-accent)' }}>
                  <Moon size={18} />
                  Rest & Wind Down
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.75rem', lineHeight: '1.55' }}>
                  {plan.wellness_suggestions?.sleep_suggestion}
                </p>
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.65rem 0.85rem', 
                  background: 'var(--bg-card-subtle)', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)' 
                }}>
                  Honoring your sleep needs during the {currentPhase} phase maintains healthy metabolic recovery.
                </div>
              </div>
            </div>
          </div>

          {/* Nourishing Meal Suggestions */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Utensils size={18} color="var(--sage-accent)" />
              Phase-Aligned Meal Ideas
            </h2>

            <div className="grid-2">
              {plan.meal_suggestions?.map((meal, idx) => (
                <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                      <span style={{ 
                        background: 'var(--sage-soft)', 
                        color: 'var(--sage-accent)', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: 'var(--radius-full)' 
                      }}>
                        Option {idx + 1}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.65rem' }}>
                      {meal.name}
                    </h3>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                        Key Ingredients:
                      </span>
                      <div className="chip-grid">
                        {meal.ingredients?.map((ing, iIdx) => (
                          <span 
                            key={iIdx}
                            style={{ 
                              fontSize: '0.78rem', 
                              padding: '0.2rem 0.6rem', 
                              background: 'var(--bg-card-subtle)', 
                              border: '1px solid var(--border-light)', 
                              borderRadius: 'var(--radius-full)' 
                            }}
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    background: 'var(--sage-soft)', 
                    padding: '0.75rem 0.9rem', 
                    borderRadius: 'var(--radius-md)', 
                    fontSize: '0.82rem', 
                    color: '#2e5241',
                    lineHeight: '1.45',
                    marginTop: '0.75rem'
                  }}>
                    <strong>Why this helps today: </strong>
                    {meal.why_it_helps}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Medical Disclaimer */}
          <div style={{ 
            background: '#faf5f0', 
            border: '1px solid #fae8d4', 
            padding: '1rem 1.25rem', 
            borderRadius: 'var(--radius-md)', 
            color: '#7a5223', 
            fontSize: '0.82rem', 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '0.75rem' 
          }}>
            <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Safety Note: </strong>
              {plan.disclaimer || (
                "CycleCare is a wellness companion and is not intended to diagnose, treat, or prevent medical conditions. AI-generated suggestions are general wellness information and should not replace professional medical advice."
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--rose-soft)', 
            borderRadius: 'var(--radius-full)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.25rem auto',
            color: 'var(--rose-primary)'
          }}>
            <Sparkles size={30} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ready for Today's Wellness Insights</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            CycleCare will tailor self-care practices, hydration, and meal suggestions aligned with your <strong>{currentPhase}</strong> phase and today's symptoms.
          </p>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={loading}
          >
            <Sparkles size={16} /> Generate Personalized Plan
          </button>
        </div>
      )}
    </div>
  );
}

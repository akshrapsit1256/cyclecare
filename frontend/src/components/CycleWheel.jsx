import React from 'react';

const PHASE_COLORS = {
  Menstrual: '#c85a6a',
  Follicular: '#4f8771',
  Ovulation: '#c77e31',
  Luteal: '#71557d',
};

export default function CycleWheel({ currentDay = 1, totalDays = 28, phase = 'Menstrual', progressPercent = 0 }) {
  const size = 190;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Clamped percentage
  const safePercent = Math.max(0, Math.min(100, progressPercent || ((currentDay / totalDays) * 100)));
  const offset = circumference - (safePercent / 100) * circumference;
  const activeColor = PHASE_COLORS[phase] || '#c85a6a';

  return (
    <div className="cycle-visual">
      <div className="cycle-ring-container">
        <svg className="cycle-ring-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle track */}
          <circle
            className="cycle-ring-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Dynamic progress circle */}
          <circle
            className="cycle-ring-progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="cycle-ring-content">
          <span className="cycle-day-number">{currentDay}</span>
          <span className="cycle-day-label">Day of {totalDays}</span>
          <span 
            className={`phase-tag ${phase}`} 
            style={{ marginTop: '0.4rem', fontSize: '0.74rem', padding: '0.2rem 0.6rem' }}
          >
            {phase}
          </span>
        </div>
      </div>
    </div>
  );
}

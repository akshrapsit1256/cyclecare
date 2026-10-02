import React from 'react';
import { Home, CalendarCheck, Sparkles, User, Heart } from 'lucide-react';
import OllamaStatusBadge from './OllamaStatusBadge';

export default function Navbar({ activeTab, setActiveTab, ollamaStatus, onRefreshOllama }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'checkin', label: 'Daily Check-in', icon: CalendarCheck },
    { id: 'ai', label: 'AI Wellness', icon: Sparkles },
    { id: 'profile', label: 'Profile & Diet', icon: User },
  ];

  return (
    <nav className="navbar">
      <div className="nav-wrapper">
        <a 
          href="#dashboard" 
          className="brand-logo" 
          onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
        >
          <div className="brand-icon">
            <Heart size={18} color="#b75d69" fill="#f8bbd0" />
          </div>
          <span>CycleCare</span>
        </a>

        <ul className="nav-links">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  className={`nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <OllamaStatusBadge statusInfo={ollamaStatus} onRefresh={onRefreshOllama} />
      </div>
    </nav>
  );
}
